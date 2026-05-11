"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireProfile } from "@/lib/auth/helpers";
import { isPlatformAdmin } from "@/lib/auth/admin-gate";
import { revalidatePath } from "next/cache";

export async function recordSpotAuditVerdict(input: {
  targetKind: "daily_question" | "discovery_article" | "leveled_passage";
  targetId: string;
  verdict: "pass" | "fail";
  reason?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireProfile();
  if (!profile) return { ok: false, error: "Not signed in." };
  const allowed = await isPlatformAdmin(profile.id);
  if (!allowed) return { ok: false, error: "Not allowed." };

  const admin = supabaseAdmin();
  const { error } = await admin.from("spot_audit_findings").insert({
    target_kind: input.targetKind,
    target_id: input.targetId,
    reviewer_id: profile.id,
    verdict: input.verdict,
    reason: input.reason ?? null,
  });
  if (error) return { ok: false, error: error.message };

  // Side-effect: a fail verdict flips the row's qc_overall to 'fail'
  // so the public surface filter immediately hides it. The lessons-
  // learned pipeline will later turn the reason into a permanent gate.
  if (input.verdict === "fail") {
    if (input.targetKind === "discovery_article") {
      await admin
        .from("discovery_articles")
        .update({ qc_overall: "fail" })
        .eq("id", input.targetId);
    } else if (input.targetKind === "daily_question") {
      await admin
        .from("daily_questions")
        .update({ qc_overall: "fail" })
        .eq("date", input.targetId);
    }
    // leveled_passage already has a quarantine path via batch-qc;
    // we leave its qc_overall alone and just record the finding.
  }

  revalidatePath("/owner/spot-audit");
  return { ok: true };
}
