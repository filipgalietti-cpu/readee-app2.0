"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";

async function requireAdmin(): Promise<{ ok: true; profileId: string } | { ok: false; error: string }> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("admin_memberships")
    .select("id")
    .eq("profile_id", profile.id);
  if (!memberships || memberships.length === 0) {
    return { ok: false, error: "Admin scope required." };
  }
  return { ok: true, profileId: profile.id };
}

/**
 * Approve a queue item. Moves it from needs_review → ready so teachers
 * can see it. Records reviewer + verdict for accountability.
 */
export async function approveQueueItem(input: {
  queueId: string;
  note?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };
  const supabase = await createClient();

  const { error } = await supabase
    .from("content_review_queue")
    .update({
      status: "ready",
      reviewer_id: gate.profileId,
      reviewed_at: new Date().toISOString(),
      reviewer_verdict: "approve",
      reviewer_note: input.note ?? null,
    })
    .eq("id", input.queueId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/batch-qc");
  return { ok: true };
}

/**
 * Reject a queue item. Moves it to rejected so it's invisible to
 * teachers but persisted as a prompt-tuning signal.
 */
export async function rejectQueueItem(input: {
  queueId: string;
  note?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };
  const supabase = await createClient();

  const { error } = await supabase
    .from("content_review_queue")
    .update({
      status: "rejected",
      reviewer_id: gate.profileId,
      reviewed_at: new Date().toISOString(),
      reviewer_verdict: "reject",
      reviewer_note: input.note ?? null,
    })
    .eq("id", input.queueId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/batch-qc");
  return { ok: true };
}

/**
 * Flag for needs-edit — keeps the item in the queue but tags it so
 * a content editor can come back, fix it manually in the live table,
 * then approve.
 */
export async function flagNeedsEdit(input: {
  queueId: string;
  note?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };
  const supabase = await createClient();

  const { error } = await supabase
    .from("content_review_queue")
    .update({
      reviewer_id: gate.profileId,
      reviewed_at: new Date().toISOString(),
      reviewer_verdict: "needs_edit",
      reviewer_note: input.note ?? null,
      // status stays "needs_review" until a follow-up approval flips it.
    })
    .eq("id", input.queueId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/batch-qc");
  return { ok: true };
}
