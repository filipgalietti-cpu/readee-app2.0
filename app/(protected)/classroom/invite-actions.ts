"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import { sendInviteEmail } from "@/lib/email/invite";

type InviteInput = {
  firstName: string;
  lastInitial?: string | null;
  parentEmail?: string | null;
  source?: "manual" | "csv" | "google_classroom";
};

const MAX_BULK_INVITES = 100;

function baseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    "https://learn.readee.app"
  ).replace(/\/$/, "");
}

function randomToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

function normalizeEmail(e: string | null | undefined): string | null {
  if (!e) return null;
  const trimmed = e.trim().toLowerCase();
  if (!trimmed) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return null;
  return trimmed;
}

/**
 * Bulk-create roster invites for a classroom. Does NOT send emails —
 * call sendInvites() with the returned ids after review.
 */
export async function createInvites(input: {
  classroomId: string;
  invites: InviteInput[];
  sendEmails?: boolean;
}): Promise<
  | { ok: true; created: number; invalid: number; inviteIds: string[] }
  | { ok: false; error: string }
> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can invite students." };
  }
  if (input.invites.length === 0) {
    return { ok: false, error: "No invites provided." };
  }
  if (input.invites.length > MAX_BULK_INVITES) {
    return { ok: false, error: `Max ${MAX_BULK_INVITES} invites per batch.` };
  }

  const supabase = await createClient();

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id, name, join_code, teacher_id")
    .eq("id", input.classroomId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!classroom) return { ok: false, error: "Classroom not found." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const teacherEmail = user?.email ?? "your teacher";

  const rows: {
    classroom_id: string;
    invited_by: string;
    student_first_name: string;
    student_last_initial: string | null;
    parent_email: string | null;
    invite_token: string;
    source: "manual" | "csv" | "google_classroom";
  }[] = [];
  let invalid = 0;

  for (const raw of input.invites) {
    const firstName = raw.firstName?.trim();
    if (!firstName) {
      invalid++;
      continue;
    }
    const lastInitial = raw.lastInitial?.trim().slice(0, 1) || null;
    const email = normalizeEmail(raw.parentEmail);
    rows.push({
      classroom_id: input.classroomId,
      invited_by: profile.id,
      student_first_name: firstName.slice(0, 60),
      student_last_initial: lastInitial,
      parent_email: email,
      invite_token: randomToken(),
      source: raw.source ?? "manual",
    });
  }

  if (rows.length === 0) {
    return { ok: false, error: "No valid invites to create." };
  }

  const { data: inserted, error } = await supabase
    .from("roster_invites")
    .insert(rows)
    .select("id, parent_email, invite_token, student_first_name");

  if (error) return { ok: false, error: error.message };

  const ids = (inserted ?? []).map((r: any) => r.id as string);

  if (input.sendEmails && inserted) {
    await dispatchInviteEmails(
      inserted.map((r: any) => ({
        id: r.id,
        parent_email: r.parent_email,
        invite_token: r.invite_token,
        student_first_name: r.student_first_name,
      })),
      {
        classroomName: (classroom as any).name,
        joinCode: (classroom as any).join_code,
        teacherEmail,
      },
    );
  }

  revalidatePath(`/classroom/${input.classroomId}`);
  return { ok: true, created: rows.length, invalid, inviteIds: ids };
}

export async function revokeInvite(input: { inviteId: string }): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can revoke invites." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("roster_invites")
    .select("classroom_id, status")
    .eq("id", input.inviteId)
    .maybeSingle();
  if (!existing) return { ok: false, error: "Invite not found." };
  if ((existing as any).status === "joined") {
    return { ok: false, error: "Already joined — remove the student instead." };
  }

  const { error } = await supabase
    .from("roster_invites")
    .update({ status: "revoked" })
    .eq("id", input.inviteId);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/classroom/${(existing as any).classroom_id}`);
  return { ok: true };
}

export async function resendInvite(input: { inviteId: string }): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can resend invites." };
  }
  const supabase = await createClient();

  const { data: inv } = await supabase
    .from("roster_invites")
    .select(
      "id, classroom_id, parent_email, invite_token, student_first_name, status, classrooms!inner(name, join_code, teacher_id)",
    )
    .eq("id", input.inviteId)
    .maybeSingle();

  if (!inv) return { ok: false, error: "Invite not found." };
  const row = inv as any;
  if (row.status !== "pending") return { ok: false, error: "Invite is not pending." };
  if (!row.parent_email) return { ok: false, error: "No parent email on this invite." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const teacherEmail = user?.email ?? "your teacher";

  await dispatchInviteEmails(
    [
      {
        id: row.id,
        parent_email: row.parent_email,
        invite_token: row.invite_token,
        student_first_name: row.student_first_name,
      },
    ],
    {
      classroomName: row.classrooms.name,
      joinCode: row.classrooms.join_code,
      teacherEmail,
    },
  );

  revalidatePath(`/classroom/${row.classroom_id}`);
  return { ok: true };
}

async function dispatchInviteEmails(
  invites: {
    id: string;
    parent_email: string | null;
    invite_token: string;
    student_first_name: string;
  }[],
  ctx: { classroomName: string; joinCode: string; teacherEmail: string },
): Promise<void> {
  const supabase = await createClient();
  const base = baseUrl();
  const teacherDisplay = teacherDisplayFromEmail(ctx.teacherEmail);

  for (const inv of invites) {
    if (!inv.parent_email) continue;
    try {
      await sendInviteEmail({
        to: inv.parent_email,
        classroomName: ctx.classroomName,
        teacherDisplay,
        studentFirstName: inv.student_first_name,
        inviteUrl: `${base}/invite/${inv.invite_token}`,
        joinCode: ctx.joinCode,
      });
      await supabase
        .from("roster_invites")
        .update({
          email_sent_at: new Date().toISOString(),
          email_send_count: (await incrementSendCount(supabase, inv.id)) ?? 1,
        })
        .eq("id", inv.id);
    } catch (e) {
      console.error("sendInviteEmail failed:", e);
    }
  }
}

async function incrementSendCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  inviteId: string,
): Promise<number | null> {
  const { data } = await supabase
    .from("roster_invites")
    .select("email_send_count")
    .eq("id", inviteId)
    .maybeSingle();
  return ((data as any)?.email_send_count ?? 0) + 1;
}

function teacherDisplayFromEmail(email: string): string {
  // "jklingerman@district.edu" -> "Mrs. K" is too presumptuous; fall back to
  // the local part with title-casing.
  const local = email.split("@")[0] ?? email;
  const pretty = local
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
  return pretty || "Your teacher";
}
