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
import { buildLeveledPassage } from "@/lib/ai/build-leveled";
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
    .select("id, category, qc_report")
    .eq("published_state", "hidden")
    .order("created_at", { ascending: true })
    .limit(budget);

  const list = (rows ?? []) as Array<{
    id: string;
    category: string;
    qc_report: any;
  }>;
  let promoted = 0;
  let stillFailing = 0;
  let errors = 0;
  for (const r of list) {
    try {
      // Pull the AI judge's specific complaints from the failed row's
      // qc_report so we can feed them into the retry as constraints.
      // The retry is informed: "previous attempt failed because of
      // reading_level / fact_check / banned_vocab / etc. — rewrite to
      // avoid these." Not a blind re-roll.
      const failingChecks: Array<{ name: string; message: string }> = Array.isArray(
        r.qc_report?.checks,
      )
        ? r.qc_report.checks
            .filter((c: any) => c.severity === "fail")
            .map((c: any) => ({
              name: String(c.name ?? ""),
              message: String(c.message ?? ""),
            }))
        : [];

      // Archive the failed row (don't delete — preserves audit trail
      // + qc_report for the dashboard "recent quarantines" list).
      await admin
        .from("discovery_articles")
        .update({
          published_state: "archived",
          updated_at: new Date().toISOString(),
        })
        .eq("id", r.id);
      // Generate a fresh article for the same category, with the
      // prior failure context baked into the prompt. New row gets
      // its own QC pass + published_state on insert.
      const result = await buildDiscoveryArticle({
        category: r.category as DiscoveryCategory,
        priorFailures: failingChecks.length > 0 ? failingChecks : undefined,
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
 * Heal hidden leveled passages by archiving the broken row and
 * generating a fresh one with the same brief (topic, base_grade,
 * title, teacher_id). The brief IS persisted on the row — earlier
 * comments saying otherwise were stale. The new passage runs through
 * the full QC + auto-promote path on insert.
 */
async function healLeveledPassages(): Promise<HealExistingResult> {
  const admin = supabaseAdmin();
  const cap = await getCap("leveled_passage_heal");
  const budget = cap.target || 1;

  const { data: rows } = await admin
    .from("differentiated_passages")
    .select("id, teacher_id, topic, base_grade, title")
    .eq("published_state", "hidden")
    .order("created_at", { ascending: true })
    .limit(budget);

  const list = (rows ?? []) as Array<{
    id: string;
    teacher_id: string;
    topic: string | null;
    base_grade: string | null;
    title: string | null;
  }>;

  let promoted = 0;
  let stillFailing = 0;
  let errors = 0;

  for (const r of list) {
    try {
      // Archive the failed row (preserve audit trail).
      await admin
        .from("differentiated_passages")
        .update({
          published_state: "archived",
          updated_at: new Date().toISOString(),
        })
        .eq("id", r.id);

      // Skip rows missing essential brief fields — those need manual
      // attention, can't auto-regen without inventing the prompt.
      if (!r.topic || !r.teacher_id) {
        stillFailing++;
        continue;
      }

      const result = await buildLeveledPassage({
        teacherId: r.teacher_id,
        brief: {
          topic: r.topic,
          baseGrade: (r.base_grade as any) ?? null,
          title: r.title ?? "",
        } as any,
      });
      if (result.ok) promoted++;
      else stillFailing++;
    } catch {
      errors++;
    }
  }

  // Surface residual hidden count for dashboard.
  const { count: residualHidden } = await admin
    .from("differentiated_passages")
    .select("id", { count: "exact", head: true })
    .eq("published_state", "hidden");

  return {
    contentType: "leveled_passage",
    attempted: list.length,
    promoted,
    stillFailing: (residualHidden ?? 0) + stillFailing,
    errors,
  };
}

export async function runHealExisting(): Promise<HealExistingResult[]> {
  const results: HealExistingResult[] = [];
  results.push(await healDailyQuestions());
  results.push(await healDiscoveryArticles());
  results.push(await healLeveledPassages());
  return results;
}
