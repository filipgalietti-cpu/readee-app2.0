/**
 * PLACEMENT NORMS - the published reference data the parent report cites.
 *
 * Hasbrouck, J. & Tindal, G. (2017). An Update to Compiled ORF Norms
 * (Technical Report No. 1702). Behavioral Research and Teaching, University
 * of Oregon. Words correct per minute (WCPM) by grade, season and percentile,
 * plus average weekly improvement. Grade 1 has NO fall norms (too early to
 * measure passage reading) - that cell is null on purpose, never 0.
 *
 * DIBELS 8th Edition benchmark goals (University of Oregon, 2020): the minimum
 * score for "core support" (the green cut) by measure, grade and season.
 *
 * Fuchs, Fuchs, Hamlett, Walz & Germann (1993): realistic (mean) and ambitious
 * weekly WCPM growth by grade. Used ONLY for the dated plan projection; the
 * slopes are a published starting point to be validated against live data.
 *
 * Pure data and pure functions. No I/O, no dates read from the clock.
 */

export type Season = "fall" | "winter" | "spring";
export type NormGrade = 1 | 2 | 3 | 4 | 5 | 6;
export type Percentile = 90 | 75 | 50 | 25 | 10;
export const PERCENTILES: readonly Percentile[] = [90, 75, 50, 25, 10] as const;

export type NormRow = { fall: number | null; winter: number; spring: number; weeklyGrowth: number };

const r = (fall: number | null, winter: number, spring: number, weeklyGrowth: number): NormRow => ({
  fall, winter, spring, weeklyGrowth,
});

export const HT2017: Record<NormGrade, Record<Percentile, NormRow>> = {
  1: { 90: r(null, 97, 116, 1.2), 75: r(null, 59, 91, 2.0), 50: r(null, 29, 60, 1.9), 25: r(null, 16, 34, 1.1), 10: r(null, 9, 18, 0.5) },
  2: { 90: r(111, 131, 148, 1.2), 75: r(84, 109, 124, 1.3), 50: r(50, 84, 100, 1.6), 25: r(36, 59, 72, 1.1), 10: r(23, 35, 43, 0.6) },
  3: { 90: r(134, 161, 166, 1.0), 75: r(104, 137, 139, 1.1), 50: r(83, 97, 112, 0.9), 25: r(59, 79, 91, 1.0), 10: r(40, 62, 63, 0.7) },
  4: { 90: r(153, 168, 184, 1.0), 75: r(125, 143, 160, 1.1), 50: r(94, 120, 133, 1.2), 25: r(75, 95, 105, 0.9), 10: r(60, 71, 83, 0.7) },
  5: { 90: r(179, 183, 195, 0.5), 75: r(153, 160, 169, 0.5), 50: r(121, 133, 146, 0.8), 25: r(87, 109, 119, 1.0), 10: r(64, 84, 102, 1.9) },
  6: { 90: r(185, 195, 204, 0.6), 75: r(159, 166, 173, 0.4), 50: r(132, 145, 146, 0.3), 25: r(112, 116, 122, 0.3), 10: r(89, 91, 91, 0.1) },
};

/** H&T seasons: fall = Sep-Nov, winter = Dec-Feb, spring = Mar-Jun. August is
 *  fall (school is starting); July is spring (the year just ended). */
export function seasonFor(date: Date): Season {
  const m = date.getMonth(); // 0 = January
  if (m >= 7 && m <= 10) return "fall";
  if (m === 11 || m <= 1) return "winter";
  return "spring";
}

export function normWcpm(grade: NormGrade, season: Season, pct: Percentile): number | null {
  return HT2017[grade][pct][season];
}

/** The 50th-percentile number: "typical 2nd graders read about 100 words per minute in spring." */
export function typicalWcpm(grade: NormGrade, season: Season): number | null {
  return normWcpm(grade, season, 50);
}

/** Published average weekly WCPM growth for a reader at this grade and percentile. */
export function weeklyGrowth(grade: NormGrade, pct: Percentile): number {
  return HT2017[grade][pct].weeklyGrowth;
}

export type PercentileBand = "90+" | "75-89" | "50-74" | "25-49" | "10-24" | "below 10";
export type PercentileEstimate = { percentile: number; band: PercentileBand };

/**
 * Where a WCPM falls against the grade+season distribution. Linear between the
 * five published anchors, clamped to 1..99. This is an ESTIMATE (the table has
 * five points, not a hundred), so the report says "about the 25th percentile".
 * Returns null where no norms exist (grade 1 fall).
 */
export function estimatePercentile(grade: NormGrade, season: Season, wcpm: number): PercentileEstimate | null {
  const anchors = PERCENTILES.map((p) => ({ p, v: normWcpm(grade, season, p) }))
    .filter((a): a is { p: Percentile; v: number } => a.v !== null)
    .sort((a, b) => a.v - b.v);
  if (anchors.length < 5) return null;
  const lo = anchors[0];
  const hi = anchors[anchors.length - 1];
  let percentile: number;
  if (wcpm <= lo.v) {
    percentile = lo.v > 0 ? (Math.max(0, wcpm) / lo.v) * lo.p : lo.p;
  } else if (wcpm >= hi.v) {
    const prev = anchors[anchors.length - 2];
    const slope = (hi.p - prev.p) / Math.max(1, hi.v - prev.v); // percentile points per wcpm
    percentile = hi.p + (wcpm - hi.v) * slope;
  } else {
    let i = 0;
    while (i < anchors.length - 2 && wcpm > anchors[i + 1].v) i++;
    const a = anchors[i];
    const b = anchors[i + 1];
    percentile = a.p + ((wcpm - a.v) / Math.max(1, b.v - a.v)) * (b.p - a.p);
  }
  percentile = Math.max(1, Math.min(99, Math.round(percentile)));
  const band: PercentileBand =
    percentile >= 90 ? "90+" : percentile >= 75 ? "75-89" : percentile >= 50 ? "50-74" : percentile >= 25 ? "25-49" : percentile >= 10 ? "10-24" : "below 10";
  return { percentile, band };
}

export type GradePhase = "early" | "mid" | "late";
export type GradeEquivalent = { value: number; grade: number; phase: GradePhase; label: string };

/** A grade's median measured in fall is an EARLY reader of that grade, winter
 *  is MID, spring is LATE. The decimal offset encodes that. */
const SEASON_OFFSET: Record<Season, number> = { fall: 0.1, winter: 0.5, spring: 0.8 };

export function ordinal(n: number): string {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}

/**
 * "Similar to a mid-2nd-grade reader": which grade's typical reader, measured in
 * this same season, reads at this rate. Modeled on Amira's grade.month framing
 * and it carries the same caveat: a peer comparison, not "reads at grade X".
 * Floors at 1.0, caps at 6.9.
 */
export function gradeEquivalent(wcpm: number, season: Season): GradeEquivalent {
  const off = SEASON_OFFSET[season];
  const points: { g: number; v: number }[] = [];
  for (const g of [1, 2, 3, 4, 5, 6] as NormGrade[]) {
    const v = typicalWcpm(g, season);
    if (v !== null) points.push({ g, v });
  }
  const first = points[0];
  const last = points[points.length - 1];
  let value: number;
  if (wcpm <= first.v) {
    const low = first.g + off;
    value = 1.0 + (low - 1.0) * (first.v > 0 ? Math.max(0, wcpm) / first.v : 0);
  } else if (wcpm >= last.v) {
    const prev = points[points.length - 2];
    value = last.g + off + (wcpm - last.v) / Math.max(1, last.v - prev.v);
  } else {
    let i = 0;
    while (i < points.length - 2 && wcpm > points[i + 1].v) i++;
    const a = points[i];
    const b = points[i + 1];
    const t = (wcpm - a.v) / Math.max(1, b.v - a.v);
    value = a.g + off + t;
  }
  value = Math.max(1.0, Math.min(6.9, Math.round(value * 10) / 10));
  const grade = Math.floor(value);
  const frac = value - grade;
  const phase: GradePhase = frac < 0.34 ? "early" : frac < 0.67 ? "mid" : "late";
  return { value, grade, phase, label: `${phase}-${ordinal(grade)}-grade` };
}

/* ---------------------------------------------------------------- DIBELS 8 */

export type DibelsMeasure = "LNF" | "PSF" | "NWF_CLS" | "NWF_WRC" | "WRF" | "ORF_WC" | "ORF_ACC";
export type DibelsGrade = "K" | "1" | "2" | "3" | "4";
type Triple = [fall: number, winter: number, spring: number];

/** Minimum score for core support (the green cut), beginning / middle / end of year. */
export const DIBELS8_CORE_MIN: Record<DibelsMeasure, Partial<Record<DibelsGrade, Triple>>> = {
  LNF: { K: [25, 37, 42], "1": [42, 57, 59] },
  PSF: { K: [5, 29, 44], "1": [31, 43, 45] },
  NWF_CLS: { K: [9, 25, 31], "1": [30, 52, 55], "2": [50, 68, 76], "3": [76, 94, 105] },
  NWF_WRC: { K: [1, 3, 7], "1": [5, 14, 15], "2": [15, 20, 22], "3": [24, 30, 31] },
  WRF: { K: [1, 4, 10], "1": [12, 17, 25], "2": [26, 36, 43], "3": [40, 50, 55] },
  ORF_WC: { "1": [10, 21, 39], "2": [49, 78, 94], "3": [73, 105, 114], "4": [87, 121, 125] },
  ORF_ACC: { "1": [67, 87, 91], "2": [92, 96, 96], "3": [96, 96, 96], "4": [96, 96, 96] },
};

const SEASON_IDX: Record<Season, 0 | 1 | 2> = { fall: 0, winter: 1, spring: 2 };

export function dibelsCoreMin(measure: DibelsMeasure, grade: DibelsGrade, season: Season): number | null {
  const t = DIBELS8_CORE_MIN[measure][grade];
  return t ? t[SEASON_IDX[season]] : null;
}

export function meetsDibelsCore(measure: DibelsMeasure, grade: DibelsGrade, season: Season, score: number): boolean | null {
  const min = dibelsCoreMin(measure, grade, season);
  return min === null ? null : score >= min;
}

/* ------------------------------------------------------------ the plan math */

/** Fuchs et al. (1993) weekly WCPM growth by grade of instruction. */
export const FUCHS_1993: Record<NormGrade, { realistic: number; ambitious: number }> = {
  1: { realistic: 2.0, ambitious: 3.0 },
  2: { realistic: 1.5, ambitious: 2.0 },
  3: { realistic: 1.0, ambitious: 1.5 },
  4: { realistic: 0.85, ambitious: 1.1 },
  5: { realistic: 0.5, ambitious: 0.8 },
  6: { realistic: 0.3, ambitious: 0.65 },
};

export const PLAN_DAYS_PER_WEEK = 5;
/** At or above this daily dose the plan projects the ambitious slope; below it, the realistic one. */
export const AMBITIOUS_MINUTES_PER_DAY = 15;

export type PlanMilestone = { grade: NormGrade; wcpm: number; weeks: number; date: Date };
export type PlanProjection = {
  targetWcpm: number;
  currentWcpm: number;
  gapWcpm: number;
  slopePerWeek: number;
  weeks: number;
  onTrackDate: Date;
  minutesPerDay: number;
  daysPerWeek: number;
  alreadyOnLevel: boolean;
  /** The next grade's end-of-year median, when the gap spans more than one grade. */
  milestone: PlanMilestone | null;
};

const addWeeks = (d: Date, weeks: number): Date => new Date(d.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);

/**
 * "15 minutes a day, 5 days a week, on track by June." Target = the enrolled
 * grade's end-of-year (spring) median. Slope = the published growth rate for
 * the grade the child is being TAUGHT at (the placed level), ambitious when the
 * daily dose is at least AMBITIOUS_MINUTES_PER_DAY, realistic otherwise.
 */
export function projectPlan(opts: {
  currentWcpm: number;
  enrolledGrade: NormGrade;
  instructionGrade: NormGrade;
  today: Date;
  minutesPerDay: number;
}): PlanProjection {
  const target = typicalWcpm(opts.enrolledGrade, "spring") ?? 0;
  const slopes = FUCHS_1993[opts.instructionGrade];
  const slope = opts.minutesPerDay >= AMBITIOUS_MINUTES_PER_DAY ? slopes.ambitious : slopes.realistic;
  const gap = Math.max(0, target - opts.currentWcpm);
  const weeks = gap === 0 ? 0 : Math.ceil(gap / slope);
  let milestone: PlanMilestone | null = null;
  if (opts.instructionGrade < opts.enrolledGrade && opts.instructionGrade < 6) {
    const g = (opts.instructionGrade + 1) as NormGrade;
    const v = typicalWcpm(g, "spring");
    if (v !== null && v < target && v > opts.currentWcpm) {
      const w = Math.ceil((v - opts.currentWcpm) / slope);
      milestone = { grade: g, wcpm: v, weeks: w, date: addWeeks(opts.today, w) };
    }
  }
  return {
    targetWcpm: target,
    currentWcpm: opts.currentWcpm,
    gapWcpm: gap,
    slopePerWeek: slope,
    weeks,
    onTrackDate: addWeeks(opts.today, weeks),
    minutesPerDay: opts.minutesPerDay,
    daysPerWeek: PLAN_DAYS_PER_WEEK,
    alreadyOnLevel: gap === 0,
    milestone,
  };
}
