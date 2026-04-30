"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import { hasAnyAdminAccess } from "@/lib/auth/admin-gate";

/**
 * Mark a QC report reviewed. Removes it from the default queue.
 * Captures the reviewer + an optional note for accountability.
 */
export async function markQcReportReviewed(input: {
  reportId: string;
  note?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const isAdmin = await hasAnyAdminAccess(profile.id);
  if (!isAdmin) return { ok: false, error: "Admin scope required." };

  const { error } = await supabase
    .from("quiz_qc_reports")
    .update({
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
      reviewer_note: input.note ?? null,
    })
    .eq("id", input.reportId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/qc");
  revalidatePath(`/admin/qc/${input.reportId}`);
  return { ok: true };
}

/**
 * Reopen a previously-reviewed report. Useful if Jennifer realizes
 * after the fact that something was wrongly approved.
 */
export async function reopenQcReport(input: {
  reportId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const isAdmin = await hasAnyAdminAccess(profile.id);
  if (!isAdmin) return { ok: false, error: "Admin scope required." };

  const { error } = await supabase
    .from("quiz_qc_reports")
    .update({
      reviewed_by: null,
      reviewed_at: null,
      reviewer_note: null,
    })
    .eq("id", input.reportId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/qc");
  revalidatePath(`/admin/qc/${input.reportId}`);
  return { ok: true };
}
