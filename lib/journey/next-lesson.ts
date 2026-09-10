import type { PlacementPlan } from "@/lib/placement/types";
/**
 * The SINGLE source of truth for "what lesson is next" — the exact logic the
 * Journey (/journey) uses, so the dashboard mirrors the path instead of
 * computing its own (divergent) answer off a legacy catalog.
 *
 * Reads the curriculum manifest (navigation metadata generated from
 * app/data/sample-lessons.json), orders lessons the
 * way the Journey displays them (grade -> domain, first-appearance), applies
 * the placement floor, and marks a lesson done from the SAME completion sources
 * the Journey uses: practice_results.standard_id (>=3 correct) OR
 * lessons_progress by standardId (section practice, score >=60).
 */
import { LESSON_META } from "@/lib/data/curriculum-manifest";
import { levelNameToGradeKey } from "@/lib/assessment/questions";

export type CatalogLesson = { standardId: string; grade: string; domain: string; title: string };
export type PracticeRow = { standard_id: string; questions_correct: number };
export type LessonProgRow = { lesson_id: string; section: string; score: number };

/** Journey unit names by domain key (matches JourneyMap's FUN_NAME). */
const UNIT_NAME: Record<string, string> = {
  RL: "Story Treasures",
  RI: "Fact Finders",
  RF: "Sound Workshop",
  L: "Word Magic",
};
const GRADE_ORDER = ["kindergarten", "1st", "2nd", "3rd", "4th"];
const CATALOG_GRADE_KEY: Record<string, string> = {
  Kindergarten: "kindergarten",
  "1st Grade": "1st",
  "2nd Grade": "2nd",
  "3rd Grade": "3rd",
  "4th Grade": "4th",
};

function domKeyOf(standardId: string, domainName: string): string {
  const d = (domainName || "").toLowerCase();
  if (d.includes("literature")) return "RL";
  if (d.includes("inform")) return "RI";
  if (d.includes("foundational")) return "RF";
  if (d.includes("language")) return "L";
  const m = standardId.match(/(RL|RI|RF|L)/);
  return m ? m[1] : "RL";
}

export interface JourneyProgress {
  /** The next lesson to do (null once the whole journey is complete). */
  current: CatalogLesson | null;
  /** Current unit (domain group) progress. */
  unitName: string;
  unitDone: number;
  unitTotal: number;
  /** Current grade progress (for grade-badge milestones). */
  gradeName: string;
  gradeDone: number;
  gradeTotal: number;
  /** A few most-advanced lessons the child actually completed (newest-ish). */
  recentCompleted: CatalogLesson[];
}

/** grade -> domain-ordered lessons, matching the Journey's display order. */
function orderedCatalog(): CatalogLesson[] {
  const all = LESSON_META as CatalogLesson[];
  const byGrade = new Map<string, CatalogLesson[]>();
  const gOrder: string[] = [];
  for (const l of all) {
    if (!byGrade.has(l.grade)) {
      byGrade.set(l.grade, []);
      gOrder.push(l.grade);
    }
    byGrade.get(l.grade)!.push(l);
  }
  const out: CatalogLesson[] = [];
  for (const g of gOrder) {
    const byDom = new Map<string, CatalogLesson[]>();
    const dOrder: string[] = [];
    for (const l of byGrade.get(g)!) {
      if (!byDom.has(l.domain)) {
        byDom.set(l.domain, []);
        dOrder.push(l.domain);
      }
      byDom.get(l.domain)!.push(l);
    }
    for (const d of dOrder) out.push(...byDom.get(d)!);
  }
  return out;
}

/** Content outside the assigned path is omitted, not counted as mastered. */
export function assignedJourneyCatalog(readingLevel: string | null, placement?: PlacementPlan | null): CatalogLesson[] {
  const floor = placement?.entryBand ?? GRADE_ORDER.indexOf(levelNameToGradeKey(readingLevel));
  const match = (l: CatalogLesson, u?: { grade: string; domain: string }) => !!u && l.grade === u.grade && l.domain === u.domain;
  return orderedCatalog().filter((l) => {
    const targeted = placement?.steps.some((s) => (s.kind === "start" || s.kind === "target") && match(l, s.unit));
    if (targeted) return true;
    if (placement?.steps.some((s) => s.kind === "skipped" && match(l, s.unit))) return false;
    return GRADE_ORDER.indexOf(CATALOG_GRADE_KEY[l.grade]) >= floor;
  }).sort((a, b) => Number(match(b, placement?.firstUnit ?? undefined)) - Number(match(a, placement?.firstUnit ?? undefined)));
}

export function computeJourneyProgress(opts: {
  practice: PracticeRow[];
  lessonProgress: LessonProgRow[];
  readingLevel: string | null;
  placement?: PlacementPlan | null;
}): JourneyProgress {
  const ordered = assignedJourneyCatalog(opts.readingLevel, opts.placement);

  const isCompleted = (sid: string) =>
    opts.practice.some((p) => p.standard_id === sid && p.questions_correct >= 3) ||
    opts.lessonProgress.some((p) => p.lesson_id === sid && p.section === "practice" && p.score >= 60);

  const done = (l: CatalogLesson) => isCompleted(l.standardId);

  const current = ordered.find((l) => !done(l)) ?? null;

  // Recent = lessons they actually completed (not placement floor), most-advanced last.
  const recentCompleted = ordered.filter((l) => isCompleted(l.standardId)).slice(-3).reverse();

  if (!current) {
    return {
      current: null,
      unitName: "",
      unitDone: 0,
      unitTotal: 0,
      gradeName: ordered[ordered.length - 1]?.grade ?? "",
      gradeDone: 0,
      gradeTotal: 0,
      recentCompleted,
    };
  }

  const unitLessons = ordered.filter((l) => l.grade === current.grade && l.domain === current.domain);
  const gradeLessons = ordered.filter((l) => l.grade === current.grade);

  return {
    current,
    unitName: UNIT_NAME[domKeyOf(current.standardId, current.domain)] ?? current.domain,
    unitDone: unitLessons.filter(done).length,
    unitTotal: unitLessons.length,
    gradeName: current.grade,
    gradeDone: gradeLessons.filter(done).length,
    gradeTotal: gradeLessons.length,
    recentCompleted,
  };
}
