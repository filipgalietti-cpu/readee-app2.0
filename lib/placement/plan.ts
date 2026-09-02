/**
 * PLACEMENT PLAN - the curated path from the placed band to the enrolled
 * grade's bar. Pure: catalogue in, decision in, plan out. No I/O, no clock,
 * no randomness.
 *
 * Bounded personalization, not a bespoke curriculum. The units are the
 * journey's units (a (grade, domain) group of app/data/sample-lessons.json in
 * the journey's first-appearance order, see app/(protected)/journey/page.tsx),
 * the child walks them in that order, and placement only decides three
 * things: where the walk starts, which units the evidence already covers, and
 * which units answer the needs. The dated milestones come from the published
 * growth slopes in norms.ts (projectPlan), never from a guess.
 */
import sampleLessons from "@/app/data/sample-lessons.json";
import type { PlacementDecision } from "./decide";
import { BAND_LABEL, type Band, type PlacedBand } from "./ladder";
import { ordinal, projectPlan, typicalWcpm, type NormGrade } from "./norms";
import type { Moment, PlacementPlan, PlanMilestone, PlanStep } from "./types";

/* ------------------------------------------------------------ the unit model */

type CatalogLesson = { standardId: string; grade: string; domain: string; title: string };

export type DomKey = "RL" | "RI" | "RF" | "L";

/** One journey unit: a (grade, domain) group of catalogue lessons. */
export type PlanUnit = { band: PlacedBand; grade: string; domain: string; domKey: DomKey; lessons: number };

export const CATALOG_GRADE: Record<PlacedBand, string> = {
  0: "Kindergarten", 1: "1st Grade", 2: "2nd Grade", 3: "3rd Grade", 4: "4th Grade",
};

/** The journey's unit banner names (JourneyMap FUN_NAME, not exported there). */
export const UNIT_FUN_NAME: Record<DomKey, string> = {
  RL: "Story Treasures", RI: "Fact Finders", RF: "Sound Workshop", L: "Word Magic",
};

/** Same rule as journey/page.tsx domKeyOf (file-private there, copied verbatim). */
export function domKeyOf(standardId: string, domainName: string): DomKey {
  const d = (domainName || "").toLowerCase();
  if (d.includes("literature")) return "RL";
  if (d.includes("inform")) return "RI";
  if (d.includes("foundational")) return "RF";
  if (d.includes("language")) return "L";
  const m = standardId.match(/(RL|RI|RF|L)/);
  return m ? (m[1] as DomKey) : "RL";
}

function bandOfGrade(grade: string): PlacedBand | null {
  for (const b of [0, 1, 2, 3, 4] as PlacedBand[]) if (CATALOG_GRADE[b] === grade) return b;
  return null;
}

let unitCache: PlanUnit[] | null = null;

/**
 * The catalogue as the journey shows it: grades in first-appearance order,
 * and within a grade the domains in first-appearance order. Unit 1 of a grade
 * is therefore the free unit (lib/plan/free-lessons.ts agrees by construction).
 */
export function catalogUnits(): PlanUnit[] {
  if (unitCache) return unitCache;
  const lessons = sampleLessons as CatalogLesson[];
  const byGrade = new Map<string, CatalogLesson[]>();
  const gradeOrder: string[] = [];
  for (const l of lessons) {
    if (!byGrade.has(l.grade)) { byGrade.set(l.grade, []); gradeOrder.push(l.grade); }
    byGrade.get(l.grade)!.push(l);
  }
  const out: PlanUnit[] = [];
  for (const grade of gradeOrder) {
    const band = bandOfGrade(grade);
    if (band === null) continue;
    const byDomain = new Map<string, CatalogLesson[]>();
    const domainOrder: string[] = [];
    for (const l of byGrade.get(grade)!) {
      if (!byDomain.has(l.domain)) { byDomain.set(l.domain, []); domainOrder.push(l.domain); }
      byDomain.get(l.domain)!.push(l);
    }
    for (const domain of domainOrder) {
      const group = byDomain.get(domain)!;
      out.push({ band, grade, domain, domKey: domKeyOf(group[0].standardId, domain), lessons: group.length });
    }
  }
  unitCache = out;
  return out;
}

/** "kindergarten" / "2nd-grade": the adjective form the plan and narration share. */
export function gradeAdjective(band: Band): string {
  return band === 0 ? "kindergarten" : `${BAND_LABEL[band]}-grade`;
}

/** Short parent-facing phrase for a unit: "2nd-grade words and sounds". */
export function unitPhrase(band: PlacedBand, domKey: DomKey): string {
  const g = gradeAdjective(band);
  switch (domKey) {
    case "RF": return band === 0 ? "kindergarten letters and sounds" : `${g} words and sounds`;
    case "RL": return `${g} stories`;
    case "RI": return `${g} nonfiction`;
    case "L": return `${g} vocabulary and language`;
  }
}

/** The same phrase from the strings a saved plan carries (grade + catalogue domain). */
export function unitPhraseFor(grade: string, domain: string): string {
  const band = bandOfGrade(grade) ?? 0;
  return unitPhrase(band, domKeyOf("", domain));
}

/** "2nd Grade Sound Workshop": the grade plus the banner name the child sees on the map. */
export function unitTitle(u: PlanUnit): string {
  return `${u.grade} ${UNIT_FUN_NAME[u.domKey]}`;
}

/* -------------------------------------------------------------- the dates */

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Calendar arithmetic at local noon, so a daylight-saving change never moves a date by a day. */
export function addWeeks(d: Date, weeks: number): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
  out.setDate(out.getDate() + weeks * 7);
  return out;
}

export function isoDate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** "late April", "early March", "mid-January"; "next fall" when more than 10 months out. */
export function monthWording(date: Date, today: Date): string {
  const monthsOut = (date.getFullYear() - today.getFullYear()) * 12 + (date.getMonth() - today.getMonth());
  if (monthsOut > 10) return "next fall";
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  if (day <= 10) return `early ${month}`;
  if (day <= 20) return `mid-${month}`;
  return `late ${month}`;
}

/* ------------------------------------------------------------- the plan */

export type BuildPlanInput = {
  decision: PlacementDecision;
  moments: Moment[];
  today: Date;
  /** Default 10. */
  minutesPerDay?: number;
  /** Default 5. */
  daysPerWeek?: number;
};

/** A catalogue lesson is about 12 minutes of child time. */
export const LESSON_MINUTES = 12;
/** A plan longer than a semester is a syllabus, not a plan. Lessons are capped to fit. */
export const MAX_PLAN_WEEKS = 20;
export const DEFAULT_MINUTES_PER_DAY = 10;
export const DEFAULT_DAYS_PER_WEEK = 5;
export const REVIEWED_BY = "Jennifer Klingerman, Certified Reading Specialist";

export const LUNA_STEP: PlanStep = { kind: "luna", title: "Reading speed with Luna", reason: "Luna listens every day and adjusts" };
export const WORDS_TARGET_REASON = "that is where the word list got hard";
export const START_REASON = "where reading is comfortable today";

const FOUNDATION_NEEDS = ["letter sounds", "blending sounds into words", "sounding out new words"];
const FOUNDATION_LABEL: Record<string, string> = {
  "letter sounds": "Letter sounds",
  "blending sounds into words": "Blending sounds into words",
  "sounding out new words": "Sounding out new words",
};

const clampBand = (n: number): PlacedBand => Math.max(0, Math.min(4, n)) as PlacedBand;
const sameUnit = (a: PlanUnit, b: PlanUnit): boolean => a.grade === b.grade && a.domain === b.domain;

function bandFromLabel(label: string): PlacedBand | null {
  for (const b of [0, 1, 2, 3, 4] as PlacedBand[]) if (BAND_LABEL[b] === label) return b;
  return null;
}

/** Passage accuracy the evidence holds for a band: the norm passage, else a cited moment. */
function accuracyAt(decision: PlacementDecision, moments: Moment[], band: Band): number | null {
  if (decision.fluency && decision.fluency.band === band) return decision.fluency.accuracy;
  for (const m of moments) if (m.kind === "passage-accurate" && m.band === band) return m.accuracy;
  return null;
}

/** Bands where every comprehension question was answered right. */
function perfectComprehensionBands(decision: PlacementDecision, moments: Moment[], entry: PlacedBand): Set<Band> {
  const bands = new Set<Band>();
  let cited = false;
  for (const m of moments) {
    if (m.kind !== "comprehension") continue;
    cited = true;
    if (m.total > 0 && m.correct === m.total) bands.add(m.band);
  }
  if (!cited && decision.comprehension && decision.comprehension.total > 0 && decision.comprehension.pct >= 0.99) bands.add(entry);
  return bands;
}

function skipReason(u: PlanUnit, entry: PlacedBand, decision: PlacementDecision, moments: Moment[], perfect: Set<Band>): string | null {
  const g = gradeAdjective(u.band);
  if (u.domKey === "RF" && u.band === entry) {
    const acc = accuracyAt(decision, moments, u.band);
    if (decision.decoding.listsPassed.includes(u.band) && acc !== null && acc >= 0.95) {
      return `the ${g} word list and story were read cleanly`;
    }
    return null;
  }
  if ((u.domKey === "RL" || u.domKey === "RI") && perfect.has(u.band)) {
    return `every ${g} story question was right`;
  }
  // Language: no evidence is collected for it, so it is never skipped.
  return null;
}

type Target = { unit: PlanUnit; title: string; reason: string };

function targetsFor(decision: PlacementDecision, entry: PlacedBand, path: PlanUnit[]): Target[] {
  const out: Target[] = [];
  const push = (t: Target | null) => { if (t && !out.some((o) => sameUnit(o.unit, t.unit))) out.push(t); };
  const unitAt = (band: PlacedBand, domKey: DomKey) => path.find((u) => u.band === band && u.domKey === domKey) ?? null;

  for (const need of decision.needs) {
    const words = need.match(/^(\S+)-grade words$/);
    if (words) {
      const named = bandFromLabel(words[1]);
      const unit = (named !== null ? unitAt(named, "RF") : null) ?? unitAt(clampBand(entry + 1), "RF");
      if (unit) push({ unit, title: `${gradeAdjective(unit.band)} words`, reason: WORDS_TARGET_REASON });
    } else if (need === "understanding what they read") {
      const unit = unitAt(entry, "RL");
      if (unit) push({ unit, title: unitPhrase(unit.band, unit.domKey), reason: "the story questions were the hard part" });
    } else if (FOUNDATION_NEEDS.includes(need)) {
      const unit = unitAt(entry, "RF");
      if (unit) push({ unit, title: unitPhrase(unit.band, unit.domKey), reason: "letter sounds and blending come first" });
    }
    // "reading speed and smoothness" and "accurate reading" are Luna's job: the luna node.
  }
  return out;
}

function normMilestones(decision: PlacementDecision, entry: PlacedBand, enrolled: PlacedBand, today: Date, minutesPerDay: number): PlanMilestone[] {
  const fluency = decision.fluency!;
  const instructionGrade = Math.max(1, entry) as NormGrade;
  // Dates are re-derived from the projection's week counts with calendar
  // arithmetic (projectPlan adds milliseconds, which drifts a day across DST).
  const at = (label: string, weeks: number, wcpm: number): PlanMilestone => {
    const date = addWeeks(today, weeks);
    return { label, month: monthWording(date, today), date: isoDate(date), wcpm };
  };
  const proj = projectPlan({ currentWcpm: fluency.wcpm, enrolledGrade: enrolled as NormGrade, instructionGrade, today, minutesPerDay });
  const out: PlanMilestone[] = [];
  if (proj.milestone) out.push(at(`Reads like a ${ordinal(proj.milestone.grade)} grader`, proj.milestone.weeks, proj.milestone.wcpm));
  if (!proj.alreadyOnLevel) {
    out.push(at(`Reaches the ${ordinal(enrolled)}-grade bar`, proj.weeks, proj.targetWcpm));
  } else {
    // Already past this year's bar: the first higher grade's bar not yet reached is the thing to climb toward.
    for (let g = enrolled + 1; g <= 6; g++) {
      const next = projectPlan({ currentWcpm: fluency.wcpm, enrolledGrade: g as NormGrade, instructionGrade, today, minutesPerDay });
      if (next.alreadyOnLevel) continue;
      out.push(at(`Reaches the ${ordinal(g)}-grade bar`, next.weeks, next.targetWcpm));
      break;
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

/** No timed passage (K, or an emergent older reader): two qualitative milestones from the needs. */
function qualitativeMilestones(decision: PlacementDecision, entry: PlacedBand, top: PlacedBand, today: Date): PlanMilestone[] {
  const at = (label: string, weeks: number): PlanMilestone => {
    const date = addWeeks(today, weeks);
    const sameMonth = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
    return { label, month: sameMonth ? "this month" : monthWording(date, today), date: isoDate(date) };
  };
  if (entry >= 1) {
    return [
      at(`Reads ${gradeAdjective(entry)} stories smoothly`, 8),
      at(`Reaches the ${ordinal(top)}-grade bar`, 20),
    ];
  }
  const needLabels = decision.needs.filter((n) => n in FOUNDATION_LABEL).map((n) => FOUNDATION_LABEL[n]);
  const first = needLabels[0] ?? "First words";
  const second = first === "First words" ? "Short sentences" : "First words";
  return [at(first, 3), at(second, 12)];
}

export function buildPlan(input: BuildPlanInput): PlacementPlan {
  const { decision, moments, today } = input;
  const minutesPerDay = input.minutesPerDay ?? DEFAULT_MINUTES_PER_DAY;
  const daysPerWeek = input.daysPerWeek ?? DEFAULT_DAYS_PER_WEEK;

  const entry = decision.placedBand;
  const enrolled = clampBand(entry + decision.relative.delta);
  const top = Math.max(entry, enrolled) as PlacedBand;
  const path = catalogUnits().filter((u) => u.band >= entry && u.band <= top);

  // 1. What the evidence already covers.
  const perfect = perfectComprehensionBands(decision, moments, entry);
  const skips = new Map<PlanUnit, string>();
  for (const u of path) {
    const reason = skipReason(u, entry, decision, moments, perfect);
    if (reason) skips.set(u, reason);
  }

  // 2. Where the walk starts: the first unit the child actually does.
  const startUnit = path.find((u) => !skips.has(u)) ?? null;

  // 3. What answers the needs.
  const targets = targetsFor(decision, entry, path).filter((t) => !skips.has(t.unit));

  const steps: PlanStep[] = [];
  const unitOf = (u: PlanUnit) => ({ grade: u.grade, domain: u.domain, lessons: u.lessons });
  if (startUnit) {
    const onStart = targets.find((t) => sameUnit(t.unit, startUnit));
    steps.push({ kind: "start", title: unitPhrase(startUnit.band, startUnit.domKey), reason: onStart ? onStart.reason : START_REASON, unit: unitOf(startUnit) });
  }
  const seenSkipTitles = new Set<string>();
  for (const [u, reason] of skips) {
    const title = unitPhrase(u.band, u.domKey);
    if (seenSkipTitles.has(title)) continue; // K carries two one-lesson RL/RI tails; one node is enough
    seenSkipTitles.add(title);
    steps.push({ kind: "skipped", title, reason, unit: unitOf(u) });
  }
  const targetSteps: PlanStep[] = targets
    .filter((t) => !startUnit || !sameUnit(t.unit, startUnit))
    .map((t) => ({ kind: "target" as const, title: t.title, reason: t.reason, unit: unitOf(t.unit) }));
  if (targetSteps.length) {
    steps.push(targetSteps[0], LUNA_STEP, ...targetSteps.slice(1));
  } else {
    steps.push(LUNA_STEP);
  }
  const bar = top >= 1 ? typicalWcpm(top as NormGrade, "spring") : null;
  steps.push({
    kind: "end",
    title: top === 0 ? "The kindergarten bar" : `The ${BAND_LABEL[top]}-grade bar`,
    reason: bar !== null ? `${bar} words per minute by spring` : "letter sounds, blending, and first words by spring",
  });

  // 4. The dose. Lessons are the non-skipped units on the path, capped so the
  //    plan stays inside MAX_PLAN_WEEKS at this dose.
  const minutesPerWeek = Math.max(1, minutesPerDay * daysPerWeek);
  const rawLessons = path.filter((u) => !skips.has(u)).reduce((n, u) => n + u.lessons, 0);
  const maxLessons = Math.max(1, Math.floor((MAX_PLAN_WEEKS * minutesPerWeek) / LESSON_MINUTES));
  const lessons = Math.min(rawLessons, maxLessons);
  const weeksAt10Min = Math.ceil((lessons * LESSON_MINUTES) / minutesPerWeek);

  // 5. The dates.
  const milestones = decision.fluency && enrolled >= 1
    ? normMilestones(decision, entry, enrolled, today, minutesPerDay)
    : qualitativeMilestones(decision, entry, top, today);

  return {
    entryBand: entry,
    steps,
    lessons,
    weeksAt10Min,
    minutesPerDay,
    daysPerWeek,
    milestones,
    firstUnit: startUnit
      ? { grade: startUnit.grade, domain: startUnit.domain, title: unitTitle(startUnit), lessons: startUnit.lessons }
      : null,
    reviewedBy: REVIEWED_BY,
  };
}
