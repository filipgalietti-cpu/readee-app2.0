/**
 * Heal-existing-content engine. Walks recent qc_overall='fail' (and
 * eventually 'warn') rows in each content table and runs the
 * appropriate auto-heal entrypoint. Budgeted via
 * content_production_caps so a runaway heal can't blow the API
 * spend.
 *
 * Why this is needed: every builder already runs auto-heal at INSERT
 * time. But:
 *   - Pre-existing fails (created before the auto-heal loop shipped)
 *     never got their healing attempt.
 *   - New QC checks added later (e.g., the SceneSpec structured
 *     image judge) re-classify old content as failing without a
 *     re-attempt.
 *   - Auto-heal sometimes runs out of attempts; this cron gives
 *     stuck pieces another chance.
 *
 * Triggered nightly by /api/cron/heal-existing-content. Budgeted at
 * cap.target items per type per night so cost stays predictable.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import { autoHealDaily } from "@/lib/daily/build-daily";
import { getCap } from "@/lib/content/caps";

export type HealExistingResult = {
  contentType: string;
  attempted: number;
  promoted: number; // hidden → live after heal
  stillFailing: number;
  errors: number;
};

/**
 * For daily_questions: pull every row whose published_state='hidden'
 * (i.e., it was demoted because qc='fail') and run autoHealDaily on
 * each. Budgeted to the type's daily_target so we don't burn
 * generations on stale content while fresh content needs them.
 */
async function healDailyQuestions(): Promise<HealExistingResult> {
  const admin = supabaseAdmin();
  const cap = await getCap("daily_question_heal");
  const budget = cap.target || 1;

  const { data: rows } = await admin
    .from("daily_questions")
    .select("date, published_state")
    .eq("published_state", "hidden")
    .order("date", { ascending: false })
    .limit(budget);

  const list = (rows ?? []) as Array<{ date: string }>;
  let promoted = 0;
  let stillFailing = 0;
  let errors = 0;
  for (const r of list) {
    try {
      const result = await autoHealDaily({ date: new Date(r.date) });
      if (result.ok && result.newOverall !== "fail") promoted++;
      else stillFailing++;
    } catch {
      errors++;
    }
  }
  return {
    contentType: "daily_question",
    attempted: list.length,
    promoted,
    stillFailing,
    errors,
  };
}

/**
 * For now the discovery + leveled healers are placeholders. Once
 * those builders are refactored to use runAutoHealLoop (project
 * todo P0), wire them in here the same way. Until then we surface
 * the count of failing rows so the operator knows the queue depth.
 */
async function reportHidden(table: string, contentType: string): Promise<HealExistingResult> {
  const admin = supabaseAdmin();
  const { count } = await admin
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("published_state", "hidden");
  return {
    contentType,
    attempted: 0,
    promoted: 0,
    stillFailing: count ?? 0,
    errors: 0,
  };
}

export async function runHealExisting(): Promise<HealExistingResult[]> {
  const results: HealExistingResult[] = [];
  results.push(await healDailyQuestions());
  results.push(await reportHidden("discovery_articles", "discovery_article"));
  results.push(await reportHidden("differentiated_passages", "leveled_passage"));
  return results;
}
