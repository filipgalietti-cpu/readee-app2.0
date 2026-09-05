/**
 * V2 JOURNEY BUILDER — pure. Catalog in, progress in, the child's map out.
 *
 * Rules (Filip, Sep 3-4 2026):
 *   - The walk starts at the placed band's first unit and runs to the enrolled
 *     grade's bar; Readee+ keeps walking into the rest of the catalog.
 *   - Inside a unit: warm-up → lesson → questions per lesson, then the exam.
 *   - The unit exam is the gate. Passing it unveils the next unit; passing it
 *     early is a test-out (a placement skip is just an exam passed by evidence).
 *   - Fog of war: the child sees finished units, the current one, and the next
 *     one. The rest is "coming up".
 *   - Free = the prescribed unit (the first unit on the path) end to end,
 *     including its exam. Everything after is Readee+. Graduation exams are
 *     Readee+ only.
 *   - A roadmap unit with no shipped lessons is not on the map. The factory is
 *     still building 3rd and 4th grade; their units appear as they land.
 *   - The tailored cut: lessons the placement CREDITED leave the map entirely
 *     (a curated route, not a crossed-out one); inside a unit, lessons in the
 *     child's priority domains play first; questions start on the child's band.
 */
import type { Band } from "./roadmap.gen";
import type { CatalogFinal, CatalogLesson, CatalogUnit } from "./catalog";
import type { DomKey } from "./tailor";
import type { ItemKind, JourneyItem, JourneyLesson, JourneyUnit, JourneyView, ProgressRow, RoadMilestone, UnitStatus } from "./types";

/** Percent that passes a unit exam or a graduation exam. */
export const EXAM_PASS_PCT = 70;

/** The V2 spine is K-2 content today; a child whose walk starts above this band stays on the legacy journey. */
export const V2_MAX_START_BAND: Band = 2;

export interface BuildJourneyInput {
  childId: string;
  catalog: CatalogUnit[];
  /** Graduation exams by band, when the manifest has them. */
  finals?: Partial<Record<Band, CatalogFinal | null>>;
  startBand: Band;
  enrolledBand: Band;
  progress: ProgressRow[];
  fullAccess: boolean;
  /** The placement's cut. Defaults: roadmap order, core questions, nothing credited. */
  difficulty?: "easier" | "core" | "harder";
  priorityDomains?: DomKey[];
  why?: string[];
  milestones?: RoadMilestone[];
}

export function playHref(kind: ItemKind, id: string, childId: string): string {
  return `/journey/play/${kind}/${encodeURIComponent(id)}?child=${encodeURIComponent(childId)}`;
}

/** "RL" | "RI" | "RF" | "L" from a CCSS id like "RF.2.3a" or "L.3.4b". */
export function domainOf(standard: string): DomKey {
  const m = standard.match(/^(RL|RI|RF|L)\./);
  return (m?.[1] as DomKey) ?? "RL";
}

type Best = { done: boolean; passed: boolean; score: number | null; credited: boolean };

function bestOf(rows: ProgressRow[]): Map<string, Best> {
  const m = new Map<string, Best>();
  for (const r of rows) {
    const key = `${r.item_type}:${r.item_id}`;
    const prev = m.get(key);
    const score = r.score ?? null;
    const credited = r.source === "placement";
    if (!prev) { m.set(key, { done: true, passed: r.passed, score, credited }); continue; }
    m.set(key, {
      done: true,
      passed: prev.passed || r.passed,
      score: score === null ? prev.score : prev.score === null ? score : Math.max(prev.score, score),
      // A lesson actually played outranks a credit.
      credited: prev.credited && credited,
    });
  }
  return m;
}

/** Stable: priority-domain lessons first, roadmap order within each group. */
export function orderLessons<T extends { standard: string }>(lessons: T[], priority: DomKey[]): T[] {
  if (!priority.length) return lessons;
  const rank = (l: T) => { const i = priority.indexOf(domainOf(l.standard)); return i === -1 ? priority.length : i; };
  return lessons.map((l, i) => ({ l, i })).sort((a, b) => rank(a.l) - rank(b.l) || a.i - b.i).map((x) => x.l);
}

export function buildJourney(input: BuildJourneyInput): JourneyView {
  const { childId, catalog, startBand, enrolledBand, fullAccess } = input;
  const priority = input.priorityDomains ?? [];
  const best = bestOf(input.progress);
  const item = (kind: ItemKind, id: string, title: string, unitId: string, free: boolean): JourneyItem => {
    const b = best.get(`${kind}:${id}`);
    return { kind, id, title, unitId, done: !!b, passed: b?.passed ?? false, score: b?.score ?? null, free, href: playHref(kind, id, childId) };
  };
  const isCredited = (l: CatalogLesson) => best.get(`lesson:${l.id}`)?.credited === true;

  const onPath = catalog.filter((u) => u.band >= startBand);
  // A unit is on the map when it has at least one lesson the child still has to play
  // (a unit credited in full by the placement is not a unit the child walks).
  const withContent = onPath.filter((u) => u.lessons.some((l) => !isCredited(l)));
  const unbuiltAhead = onPath.filter((u) => u.lessons.length === 0).length;
  const prescribedUnitId = withContent[0]?.id ?? null;
  let creditedTotal = 0;

  // First pass: resolve every unit's items and whether it is complete.
  type Resolved = { unit: CatalogUnit; free: boolean; lessons: JourneyLesson[]; credited: number; exam: JourneyItem | null; final: JourneyItem | null; complete: boolean };
  const resolved: Resolved[] = withContent.map((u) => {
    const free = fullAccess || u.id === prescribedUnitId;
    const playable = orderLessons(u.lessons.filter((l) => !isCredited(l)), priority);
    const credited = u.lessons.length - playable.length;
    creditedTotal += credited;
    const lessons: JourneyLesson[] = playable.map((l) => {
      const items: JourneyItem[] = [];
      if (l.warmupId) items.push(item("warmup", l.warmupId, l.warmupTitle ?? "Warm-up", u.id, free));
      const lessonItem = item("lesson", l.id, l.title, u.id, free);
      items.push(lessonItem);
      if (l.quizId) items.push(item("quiz", l.quizId, l.quizTitle ?? "Questions", u.id, free));
      return { id: l.id, title: l.title, standard: l.standard, items, done: lessonItem.done };
    });
    const exam = u.examId ? item("exam", u.examId, u.examTitle ?? "Unit exam", u.id, free) : null;
    const lastOfBand = withContent.filter((x) => x.band === u.band).at(-1)?.id === u.id;
    const fin = lastOfBand ? input.finals?.[u.band] ?? null : null;
    const final = fin ? item("final", fin.id, fin.title, u.id, fullAccess) : null;
    const allLessonsDone = lessons.every((l) => l.done);
    // The exam is the gate when there is one; otherwise finishing the lessons finishes the unit.
    const complete = exam ? exam.passed : allLessonsDone;
    return { unit: u, free, lessons, credited, exam, final, complete };
  });

  const currentIdx = resolved.findIndex((r) => !r.complete);
  const units: JourneyUnit[] = [];
  let current: JourneyView["current"] = null;
  resolved.forEach((r, i) => {
    let status: UnitStatus;
    if (currentIdx === -1 || i < currentIdx) status = "done";
    else if (i === currentIdx) status = "current";
    else if (i === currentIdx + 1) status = "next";
    else status = "upcoming";
    const lessonsDone = r.lessons.filter((l) => l.done).length;
    const ju: JourneyUnit = {
      id: r.unit.id, grade: r.unit.grade, band: r.unit.band, unitNo: r.unit.unitNo, name: r.unit.name,
      status, free: r.free, lessons: r.lessons, exam: r.exam, final: r.final,
      lessonsDone, lessonsTotal: r.lessons.length, credited: r.credited,
      pct: r.lessons.length ? Math.round((lessonsDone / r.lessons.length) * 100) : 0,
    };
    units.push(ju);
    if (status === "current") current = { unit: ju, item: nextItem(ju) };
  });

  const visible = units.filter((u) => u.status !== "upcoming");
  const hiddenAhead = units.length - visible.length;
  const beyondBar = withContent.filter((u) => u.band > enrolledBand).length;

  return {
    childId, startBand, enrolledBand, prescribedUnitId, units: visible, hiddenAhead, unbuiltAhead, beyondBar, current, fullAccess,
    difficulty: input.difficulty ?? "core",
    credited: creditedTotal,
    why: input.why ?? [],
    milestones: input.milestones ?? [],
  };
}

/**
 * The next thing to do inside the current unit: the first unfinished item in
 * play order, then the exam. When every lesson is done and the exam exists but
 * was failed, the exam comes back around (retake).
 */
export function nextItem(unit: JourneyUnit): JourneyItem {
  for (const l of unit.lessons) for (const it of l.items) if (!it.done) return it;
  if (unit.exam && !unit.exam.passed) return unit.exam;
  if (unit.final && !unit.final.passed) return unit.final;
  // Everything done (the exam passed): fall back to the exam so the map still has a target.
  return unit.exam ?? unit.lessons.at(-1)?.items.at(-1) ?? unit.lessons[0].items[0];
}

/** Band from the strings children.grade carries ("Kindergarten", "1st Grade", "Pre-K"). */
export function bandFromGrade(grade: string | null | undefined): Band {
  const g = (grade ?? "").toLowerCase();
  if (g.startsWith("4")) return 4;
  if (g.startsWith("3")) return 3;
  if (g.startsWith("2")) return 2;
  if (g.startsWith("1")) return 1;
  return 0;
}
