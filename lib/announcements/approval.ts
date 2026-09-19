import { createHmac, timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Nothing reaches a parent until a person has looked at it.
 *
 * ‼️ Before this, an announcement with an `email` block simply SENT on its date:
 * to every opted-in family, from a cron, with no preview and no way to stop it.
 * The football email went out that way. It was fine, but only because it
 * happened to be fine.
 *
 * Filip, 19 Sep 2026: "I get a notification via email saying this is what the
 * new email blast will look like."
 *
 * So an announcement now has three states, and the cron will only send from one
 * of them:
 *
 *   (none)     drawn and previewed to the team inbox, waiting
 *   approved   sends to families on or after its date
 *   cancelled  never sends
 *
 * State lives in lifecycle_email_sends, against the owner's profile, because
 * that table already IS the record of what was sent to whom and adding a
 * migration for three flags would be a worse trade. A stage of
 * `announce_approved:<id>` reads exactly like the `whats_new:<id>` rows beside
 * it.
 */

export const ANNOUNCE_ACTIONS = ["approve", "redraw", "cancel"] as const;
export type AnnounceAction = (typeof ANNOUNCE_ACTIONS)[number];

export const ANNOUNCE_LABEL: Record<AnnounceAction, string> = {
  approve: "Approve and send",
  redraw: "Draw a different picture",
  cancel: "Cancel this email",
};

export function isAnnounceAction(v: unknown): v is AnnounceAction {
  return typeof v === "string" && (ANNOUNCE_ACTIONS as readonly string[]).includes(v);
}

function secret(): string {
  const s = process.env.DAILY_REVIEW_SECRET || process.env.CRON_SECRET;
  if (!s) throw new Error("DAILY_REVIEW_SECRET or CRON_SECRET is required to sign approval links.");
  return s;
}

/** One link does one thing to one announcement, and cannot be repointed. */
export function announceToken(id: string, action: AnnounceAction): string {
  return createHmac("sha256", secret()).update(`announce:${id}:${action}`).digest("hex").slice(0, 32);
}

export function announceTokenValid(id: string, action: AnnounceAction, token: string): boolean {
  const expected = Buffer.from(announceToken(id, action));
  const given = Buffer.from(String(token ?? ""));
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** The profile that approvals are recorded against (the platform owner). */
export function ownerProfileId(): string | null {
  return process.env.DAILY_QUESTION_TEACHER_ID || null;
}

type Flag = "approved" | "cancelled" | "preview";
const stageOf = (flag: Flag, id: string) => `announce_${flag}:${id}`;

async function has(flag: Flag, id: string): Promise<boolean> {
  const owner = ownerProfileId();
  if (!owner) return false;
  const { data } = await supabaseAdmin()
    .from("lifecycle_email_sends")
    .select("id")
    .eq("profile_id", owner)
    .eq("stage", stageOf(flag, id))
    .limit(1);
  return !!data && data.length > 0;
}

async function set(flag: Flag, id: string): Promise<void> {
  const owner = ownerProfileId();
  if (!owner || (await has(flag, id))) return;
  await supabaseAdmin()
    .from("lifecycle_email_sends")
    .insert({ profile_id: owner, stage: stageOf(flag, id), status: "sent" });
}

async function clear(flag: Flag, id: string): Promise<void> {
  const owner = ownerProfileId();
  if (!owner) return;
  await supabaseAdmin().from("lifecycle_email_sends").delete().eq("profile_id", owner).eq("stage", stageOf(flag, id));
}

export const isApproved = (id: string) => has("approved", id);
export const isCancelled = (id: string) => has("cancelled", id);
export const previewSent = (id: string) => has("preview", id);
export const markPreviewSent = (id: string) => set("preview", id);
/** A redraw asks the question again, so the next run sends a fresh preview. */
export const clearPreview = (id: string) => clear("preview", id);

export async function approve(id: string): Promise<void> {
  await clear("cancelled", id);
  await set("approved", id);
}

export async function cancel(id: string): Promise<void> {
  await clear("approved", id);
  await set("cancelled", id);
}
