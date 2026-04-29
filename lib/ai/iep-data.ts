/**
 * Shared data-prep for IEP progress notes + intervention plans.
 * Pulls a kid's recent practice, baseline-vs-current trend, lesson
 * mastery, and running-record history into the LLM-ready strings
 * both flows expect.
 */

import { createClient } from "@/lib/supabase/server";

export type IepDataBundle = {
  child: {
    id: string;
    firstName: string;
    readingLevel: string | null;
  };
  metricsBlock: string;
  baselineVsCurrent: string | null;
  recentMastery: string;
  runningRecords: string | null;
  hasAnyData: boolean;
};

export async function loadIepDataBundle(
  childId: string,
): Promise<{ ok: true; bundle: IepDataBundle } | { ok: false; error: string }> {
  const supabase = await createClient();

  const { data: child } = await supabase
    .from("children")
    .select("id, first_name, reading_level")
    .eq("id", childId)
    .maybeSingle();
  if (!child) return { ok: false, error: "Student not found." };
  const c = child as any;

  const thirtyDaysAgoIso = new Date(Date.now() - 30 * 86400_000).toISOString();
  const [
    { data: practiceRecent },
    { data: practiceBaseline },
    { data: lessons },
    { data: rrs },
  ] = await Promise.all([
    supabase
      .from("practice_results")
      .select("standard_id, questions_correct, questions_attempted, updated_at")
      .eq("child_id", childId)
      .gte("updated_at", thirtyDaysAgoIso)
      .order("updated_at", { ascending: false })
      .limit(30),
    supabase
      .from("practice_results")
      .select("standard_id, questions_correct, questions_attempted, updated_at")
      .eq("child_id", childId)
      .lt("updated_at", thirtyDaysAgoIso)
      .order("updated_at", { ascending: false })
      .limit(30),
    supabase
      .from("lessons_progress")
      .select("lesson_id, section, score, updated_at")
      .eq("child_id", childId)
      .order("updated_at", { ascending: false })
      .limit(20),
    supabase
      .from("running_records")
      .select(
        "id, passage_word_count, wcpm, accuracy_pct, focus_area, miscues, teacher_note, created_at",
      )
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const metricsLines: string[] = [];
  if (c.reading_level) metricsLines.push(`Reading level: ${c.reading_level}`);
  for (const r of (practiceRecent ?? []) as any[]) {
    const pct = r.questions_attempted
      ? Math.round((r.questions_correct / r.questions_attempted) * 100)
      : 0;
    metricsLines.push(
      `${r.standard_id}: ${r.questions_correct}/${r.questions_attempted} (${pct}%)`,
    );
  }
  const metricsBlock =
    metricsLines.length > 0 ? metricsLines.join("\n") : "No recent practice data.";

  const baselineMap = new Map<string, { c: number; a: number }>();
  for (const r of (practiceBaseline ?? []) as any[]) {
    const cur = baselineMap.get(r.standard_id) ?? { c: 0, a: 0 };
    cur.c += r.questions_correct;
    cur.a += r.questions_attempted;
    baselineMap.set(r.standard_id, cur);
  }
  const recentMap = new Map<string, { c: number; a: number }>();
  for (const r of (practiceRecent ?? []) as any[]) {
    const cur = recentMap.get(r.standard_id) ?? { c: 0, a: 0 };
    cur.c += r.questions_correct;
    cur.a += r.questions_attempted;
    recentMap.set(r.standard_id, cur);
  }
  const trendLines: string[] = [];
  for (const [std, recent] of recentMap.entries()) {
    const base = baselineMap.get(std);
    if (!base || base.a === 0 || recent.a === 0) continue;
    const basePct = Math.round((base.c / base.a) * 100);
    const curPct = Math.round((recent.c / recent.a) * 100);
    const delta = curPct - basePct;
    const arrow = delta > 0 ? "↑" : delta < 0 ? "↓" : "→";
    trendLines.push(
      `${std}: ${basePct}% → ${curPct}% ${arrow} (Δ ${delta > 0 ? "+" : ""}${delta} pts)`,
    );
  }
  const baselineVsCurrent = trendLines.length > 0 ? trendLines.join("\n") : null;

  const masteryLines = ((lessons ?? []) as any[]).map(
    (l) => `${l.lesson_id} (${l.section}): ${l.score ?? "—"}`,
  );
  const recentMastery =
    masteryLines.length > 0 ? masteryLines.join("\n") : "No recent lesson activity.";

  const rrLines = ((rrs ?? []) as any[]).map((r) => {
    const date = String(r.created_at ?? "").slice(0, 10);
    const wcpm = r.wcpm ?? "—";
    const acc = r.accuracy_pct != null ? `${r.accuracy_pct}%` : "—";
    const focus = r.focus_area ?? "general";
    const miscues = Array.isArray(r.miscues)
      ? r.miscues
          .slice(0, 4)
          .map((m: any) => m?.pattern ?? m?.kind ?? null)
          .filter(Boolean)
          .join(", ")
      : "";
    const note = r.teacher_note ? ` — ${String(r.teacher_note).slice(0, 80)}` : "";
    return `${date} · ${wcpm} WCPM · ${acc} acc · focus: ${focus}${
      miscues ? ` · miscues: ${miscues}` : ""
    }${note}`;
  });
  const runningRecords = rrLines.length > 0 ? rrLines.join("\n") : null;

  const hasAnyData =
    metricsLines.length > 0 ||
    masteryLines.length > 0 ||
    rrLines.length > 0 ||
    !!baselineVsCurrent;

  return {
    ok: true,
    bundle: {
      child: {
        id: c.id,
        firstName: c.first_name ?? "Student",
        readingLevel: c.reading_level ?? null,
      },
      metricsBlock,
      baselineVsCurrent,
      recentMastery,
      runningRecords,
      hasAnyData,
    },
  };
}
