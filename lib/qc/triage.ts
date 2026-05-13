/**
 * Stale-content triage. Two backlogs build up over time and nothing
 * grooms them:
 *
 * 1. content_audit_findings — every QC sweep writes "fail" / "warn"
 *    findings against content rows. The row often gets healed or
 *    regenerated later, but the finding row stays 'open'. After
 *    months of sweeps, the table fills with thousands of findings
 *    that no longer reflect reality. We had 5,484 open at audit
 *    time, vast majority almost certainly stale.
 *
 * 2. Hidden rows (published_state='hidden') that have sat there
 *    > 14 days without the heal cron managing to clean them. They're
 *    structurally stuck — quietly archive them so the queue depth
 *    doesn't grow forever and the operator sees a clean dashboard.
 *
 * Both run nightly via /api/cron/triage. Idempotent.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";

export type TriageResult = {
  staleAuditFindingsResolved: number;
  zombieDiscoveryArchived: number;
  zombieLeveledArchived: number;
  zombieDailyArchived: number;
};

/**
 * Audit finding is "stale" when the target row's CURRENT qc_overall
 * is 'pass' but the finding was logged when overall was 'fail' or
 * 'warn'. That means the row was healed/regenerated since the
 * finding was filed; the finding no longer reflects reality. Mark
 * it 'fixed' so the dashboard count stops climbing. (The status enum
 * only allows open/fixed/wont_fix/duplicate — 'fixed' is the right
 * bucket for "content already passes.")
 */
async function resolveStaleAuditFindings(): Promise<number> {
  const admin = supabaseAdmin();
  let total = 0;

  const queries: Array<{ table: string; targetKind: string }> = [
    { table: "discovery_articles", targetKind: "discovery_article" },
    { table: "daily_questions", targetKind: "daily_question" },
    { table: "differentiated_passages", targetKind: "leveled_passage" },
    { table: "lessons_db", targetKind: "lesson" },
  ];

  for (const q of queries) {
    // Pull every row currently passing for this content type. Cap at
    // 2000/run to bound memory and the IN(...) payload; the cron runs
    // nightly so any leftovers get cleared the next night.
    const { data: targets } = await admin
      .from(q.table)
      .select("id")
      .eq("qc_overall", "pass")
      .limit(2000);
    const cleanIds = ((targets ?? []) as Array<{ id: string }>).map((r) => r.id);
    if (cleanIds.length === 0) continue;

    const { data: updated } = await admin
      .from("content_audit_findings")
      .update({
        status: "fixed",
        resolved_at: new Date().toISOString(),
        resolver_note: "Auto-closed by triage: target row qc_overall is now pass.",
      })
      .eq("target_kind", q.targetKind)
      .eq("status", "open")
      .in("target_id", cleanIds)
      .select("id");
    total += (updated ?? []).length;
  }

  return total;
}

/**
 * A row that's been hidden > 14 days has had ~14 heal attempts and
 * not come back. It's structurally stuck. Archive it so the queue
 * depth stops growing — operator can manually un-archive if needed.
 */
async function archiveZombies(
  table: string,
): Promise<number> {
  const admin = supabaseAdmin();
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await admin
    .from(table)
    .update({
      published_state: "archived",
      updated_at: new Date().toISOString(),
    })
    .eq("published_state", "hidden")
    .lt("updated_at", cutoff)
    .select("id");
  return (data ?? []).length;
}

export async function runTriage(): Promise<TriageResult> {
  const [staleResolved, zd, zl, zdq] = await Promise.all([
    resolveStaleAuditFindings(),
    archiveZombies("discovery_articles"),
    archiveZombies("differentiated_passages"),
    archiveZombies("daily_questions"),
  ]);
  return {
    staleAuditFindingsResolved: staleResolved,
    zombieDiscoveryArchived: zd,
    zombieLeveledArchived: zl,
    zombieDailyArchived: zdq,
  };
}
