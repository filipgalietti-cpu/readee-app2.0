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
import { buildDiscoveryArticle } from "@/lib/discover/build-discovery";
import { getCap } from "@/lib/content/caps";
import type { DiscoveryCategory } from "@/lib/discover/categories";

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
 * Heal hidden discovery articles by archiving the broken row and
 * generating a fresh article for the same category. Discovery is
 * an evergreen library — each piece is independent, so "replace"
 * is a sensible heal semantic. The new article goes through the
 * full QC + auto-promote path on insert (buildDiscoveryArticle
 * already sets published_state correctly).
 */
async function healDiscoveryArticles(): Promise<HealExistingResult> {
  const admin = supabaseAdmin();
  const cap = await getCap("discovery_article_heal");
  const budget = cap.target || 1;

  const { data: rows } = await admin
    .from("discovery_articles")
    .select("id, category")
    .eq("published_state", "hidden")
    .order("created_at", { ascending: true })
    .limit(budget);

  const list = (rows ?? []) as Array<{ id: string; category: string }>;
  let promoted = 0;
  let stillFailing = 0;
  let errors = 0;
  for (const r of list) {
    try {
      // Archive the failed row (don't delete — preserves audit trail
      // + qc_report for the dashboard "recent quarantines" list).
      await admin
        .from("discovery_articles")
        .update({
          published_state: "archived",
          updated_at: new Date().toISOString(),
        })
        .eq("id", r.id);
      // Generate a fresh article for the same category. New row
      // gets its own QC pass + published_state on insert.
      const result = await buildDiscoveryArticle({
        category: r.category as DiscoveryCategory,
      });
      if (result.ok && result.qcOverall !== "fail") promoted++;
      else stillFailing++;
    } catch {
      errors++;
    }
  }
  // Count any still-hidden rows so the operator sees full queue depth.
  const { count: residualHidden } = await admin
    .from("discovery_articles")
    .select("id", { count: "exact", head: true })
    .eq("published_state", "hidden");
  return {
    contentType: "discovery_article",
    attempted: list.length,
    promoted,
    stillFailing: (residualHidden ?? 0) + stillFailing,
    errors,
  };
}

/**
 * Leveled passages don't have a clean "regenerate from prompt" path
 * yet (the original brief isn't persisted on the row). Report the
 * queue depth so the operator can see backlog. Heal handler lands
 * when the builder persists its brief alongside the row.
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
  results.push(await healDiscoveryArticles());
  results.push(await reportHidden("differentiated_passages", "leveled_passage"));
  return results;
}
