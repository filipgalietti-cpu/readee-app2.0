/**
 * PLACEMENT DECISION - evidence in, placement out. Pure.
 *
 * Inputs are what the runner collected: the word-list ladder, the passage
 * read(s) as Luna graded them, the comprehension tally, and the foundations
 * tally for K-1. Output is everything the save route and the parent report
 * need: the placed band and its Readee band name, the placement relative to
 * the enrolled grade in i-Ready's wording, the fluency numbers against the
 * published norms, strengths first, needs, and the skill seeds for the learner
 * spine.
 *
 * Orion supplies the judgment calls it already owns: the accuracy bands
 * (independent 95%, instructional 90%, frustration below) and the WCPM math.
 */
import { classifyAccuracy, type ReadingLevel } from "@/lib/orion/reading/text-level";
import { wcpm as computeWcpm } from "@/lib/luna/grading-decision";
import { grades, type GradeKey } from "@/lib/assessment/questions";
import { BAND_LABEL, CEILING_BAND, decodingLevel, type Band, type LadderState, type PlacedBand } from "./ladder";
import {
  estimatePercentile, gradeEquivalent, seasonFor, typicalWcpm,
  type GradeEquivalent, type NormGrade, type PercentileEstimate, type Season,
} from "./norms";

export const BAND_GRADE_KEY: Record<PlacedBand, GradeKey> = { 0: "kindergarten", 1: "1st", 2: "2nd", 3: "3rd", 4: "4th" };

/** children.grade is free text in places ("2nd", "2", "Grade 2", "second"). Same
 *  tolerance as Luna's gradeToken. */
export function bandFromGrade(g: string | null | undefined): PlacedBand {
  const s = (g ?? "").toLowerCase().trim();
  if (s.startsWith("1") || s.includes("first") || s.startsWith("grade 1")) return 1;
  if (s.startsWith("2") || s.includes("second") || s.startsWith("grade 2")) return 2;
  if (s.startsWith("3") || s.includes("third") || s.startsWith("grade 3")) return 3;
  if (s.startsWith("4") || s.includes("fourth") || s.startsWith("grade 4")) return 4;
  return 0;
}

export type CountEvidence = { correct: number; total: number };
export type PassageEvidence = {
  band: Band;
  wordsCorrect: number;
  wordsTotal: number;
  durationSeconds: number;
  prosody?: number | null;
  /** Words read correctly by the one-minute mark (DIBELS rate window); the child then reads to the end. */
  minuteWordsCorrect?: number;
  /** Seconds the rate window actually lasted (60, or less when the child finished sooner). */
  minuteSeconds?: number;
};
export type FoundationsEvidence = {
  letterSounds: CountEvidence;
  blending: CountEvidence;
  nonsenseWords: CountEvidence;
};
export type PlacementEvidence = {
  enrolled: PlacedBand;
  ladder: LadderState;
  passages: PassageEvidence[];
  comprehension: (CountEvidence & { band: Band }) | null;
  foundations: FoundationsEvidence | null;
  /** Injected for tests; defaults to now. */
  date?: Date;
};

export type RelativePlacement = { delta: number; label: string };

export type FluencyResult = {
  band: Band;
  wcpm: number;
  accuracy: number;
  textLevel: ReadingLevel;
  prosody: number | null;
  /** Against the norms for the grade of the passage actually read. */
  percentile: PercentileEstimate | null;
  /** The 50th-percentile WCPM for the enrolled grade this season (the parent card's "typical"). */
  typicalForEnrolled: number | null;
  gradeEquivalent: GradeEquivalent | null;
  onEnrolledPassage: boolean;
};

export type SkillSeed = { standard_id: string; pass: boolean; note: string };

export type PlacementDecision = {
  placedBand: PlacedBand;
  gradeKey: GradeKey;
  readingLevelName: string;
  season: Season;
  relative: RelativePlacement;
  decoding: { level: Band | null; emergent: boolean; ceilingPassed: boolean; listsPassed: Band[]; nextTarget: Band | null };
  fluency: FluencyResult | null;
  comprehension: (CountEvidence & { pct: number }) | null;
  foundations: (FoundationsEvidence & { pct: number }) | null;
  strengths: string[];
  needs: string[];
  seeds: SkillSeed[];
  flags: string[];
};

/** i-Ready's relative placement wording, which parents already know from school reports. */
export function relativeLabel(delta: number): string {
  if (delta <= -2) return "two or more grade levels above";
  if (delta === -1) return "one grade level above";
  if (delta === 0) return "on grade level";
  if (delta === 1) return "one grade level below";
  if (delta === 2) return "two grade levels below";
  return "three or more grade levels below";
}

const pct = (c: CountEvidence): number => (c.total > 0 ? c.correct / c.total : 0);
const ccssGrade = (band: PlacedBand): string => (band === 0 ? "K" : String(band));

function fluencyFor(p: PassageEvidence, enrolled: PlacedBand, season: Season): FluencyResult {
  // Rate from the one-minute window when the runner marked it; accuracy always from the whole read.
  const rate = p.minuteSeconds && p.minuteWordsCorrect !== undefined
    ? computeWcpm(p.minuteWordsCorrect, p.minuteSeconds)
    : computeWcpm(p.wordsCorrect, p.durationSeconds);
  const accuracy = p.wordsTotal > 0 ? p.wordsCorrect / p.wordsTotal : 0;
  const normGrade = p.band >= 1 ? (Math.min(6, p.band) as NormGrade) : null;
  return {
    band: p.band,
    wcpm: Math.round(rate),
    accuracy: Math.round(accuracy * 1000) / 1000,
    textLevel: classifyAccuracy(accuracy),
    prosody: p.prosody ?? null,
    percentile: normGrade ? estimatePercentile(normGrade, season, rate) : null,
    typicalForEnrolled: enrolled >= 1 ? typicalWcpm(enrolled as NormGrade, season) : null,
    gradeEquivalent: normGrade ? gradeEquivalent(rate, season) : null,
    onEnrolledPassage: p.band === enrolled,
  };
}

export function decidePlacement(ev: PlacementEvidence): PlacementDecision {
  const flags: string[] = [];
  const season = seasonFor(ev.date ?? new Date());
  const dec = decodingLevel(ev.ladder);

  // 1. Decoding level from the word lists.
  let candidate: PlacedBand;
  if (dec.band === null) {
    candidate = 0;
    flags.push("emergent");
  } else if (dec.band >= CEILING_BAND) {
    candidate = 4;
    flags.push("above-4th-words");
  } else {
    candidate = dec.band as PlacedBand;
  }

  // 2. Text-level guard: the passage at (or nearest below) the candidate band.
  //    Frustration-level accuracy on it steps the placement down one band.
  const instructional = ev.passages
    .filter((p) => p.band <= candidate)
    .sort((a, b) => b.band - a.band)[0] ?? null;
  if (instructional && instructional.band === candidate && candidate > 0) {
    const acc = instructional.wordsTotal > 0 ? instructional.wordsCorrect / instructional.wordsTotal : 0;
    if (classifyAccuracy(acc) === "frustration") {
      candidate = (candidate - 1) as PlacedBand;
      flags.push("passage-frustration-stepdown");
    }
  }

  // 3. Comprehension guard (Betts: instructional level needs about 70% on the
  //    questions). Half or fewer right on the placed band's passage steps down
  //    one band, unless accuracy already did.
  if (
    ev.comprehension && ev.comprehension.total >= 3 && pct(ev.comprehension) <= 0.5 &&
    candidate > 0 && ev.comprehension.band >= candidate && !flags.includes("passage-frustration-stepdown")
  ) {
    candidate = (candidate - 1) as PlacedBand;
    flags.push("comprehension-stepdown");
  }

  // 4. Fluency numbers: the enrolled-grade passage when it was read, else the highest read.
  const enrolledPassage = ev.passages.find((p) => p.band === ev.enrolled) ?? null;
  const normPassage = enrolledPassage ?? ev.passages.slice().sort((a, b) => b.band - a.band)[0] ?? null;
  const fluency = normPassage ? fluencyFor(normPassage, ev.enrolled, season) : null;
  if (fluency && !fluency.onEnrolledPassage && ev.enrolled >= 1) flags.push("norm-passage-not-at-enrolled-grade");

  const comprehension = ev.comprehension ? { ...ev.comprehension, pct: Math.round(pct(ev.comprehension) * 100) / 100 } : null;
  const foundations = ev.foundations
    ? {
        ...ev.foundations,
        pct: Math.round(
          ((ev.foundations.letterSounds.correct + ev.foundations.blending.correct + ev.foundations.nonsenseWords.correct) /
            Math.max(1, ev.foundations.letterSounds.total + ev.foundations.blending.total + ev.foundations.nonsenseWords.total)) * 100,
        ) / 100,
      }
    : null;

  const delta = ev.enrolled - candidate;
  const gradeKey = BAND_GRADE_KEY[candidate];

  // 5. Strengths first, then needs. Parent-facing phrases; no numbers here.
  const strengths: string[] = [];
  const needs: string[] = [];
  if (foundations) {
    if (pct(foundations.letterSounds) >= 0.8) strengths.push("knows letter sounds"); else needs.push("letter sounds");
    if (pct(foundations.blending) >= 0.8) strengths.push("blends sounds into words"); else needs.push("blending sounds into words");
    if (pct(foundations.nonsenseWords) >= 0.7) strengths.push("sounds out new words"); else needs.push("sounding out new words");
  }
  if (dec.band !== null) {
    if (dec.band >= ev.enrolled) strengths.push("reads grade-level words");
    else if (dec.band >= 1) strengths.push(`reads ${BAND_LABEL[dec.band]}-grade words`);
    if (dec.lowestFailedAboveLevel !== null && dec.lowestFailedAboveLevel <= ev.enrolled) {
      needs.push(`${BAND_LABEL[dec.lowestFailedAboveLevel]}-grade words`);
    }
  }
  if (fluency) {
    if (fluency.accuracy >= 0.95) strengths.push("reads accurately");
    if (fluency.percentile && fluency.percentile.percentile >= 50) strengths.push("reads at a good pace");
    if (fluency.percentile && fluency.percentile.percentile < 25) needs.push("reading speed and smoothness");
    if (fluency.prosody !== null && fluency.prosody >= 80) strengths.push("reads with expression");
    if (fluency.accuracy < 0.9) needs.push("accurate reading");
  }
  if (comprehension) {
    if (comprehension.pct >= 0.99) strengths.push("understands what they read");
    else if (comprehension.pct <= 0.5) needs.push("understanding what they read");
  }

  // 6. Seeds for child_skill_memory, scoped to the placed grade.
  const g = ccssGrade(candidate);
  const seeds: SkillSeed[] = [];
  seeds.push({ standard_id: `RF.${g}.3`, pass: dec.band !== null && dec.band >= candidate, note: "word lists" });
  if (fluency) {
    seeds.push({
      standard_id: `RF.${g}.4`,
      pass: fluency.textLevel !== "frustration" && (fluency.percentile?.percentile ?? 50) >= 25,
      note: "passage read",
    });
  }
  if (comprehension) seeds.push({ standard_id: `RL.${g}.1`, pass: comprehension.pct >= 0.66, note: "comprehension questions" });
  if (foundations) {
    seeds.push({ standard_id: "RF.K.3a", pass: pct(foundations.letterSounds) >= 0.8, note: "letter sounds" });
    seeds.push({ standard_id: "RF.K.2c", pass: pct(foundations.blending) >= 0.8, note: "blending" });
    seeds.push({ standard_id: "RF.1.3b", pass: pct(foundations.nonsenseWords) >= 0.7, note: "nonsense words" });
  }
  if (dec.lowestFailedAboveLevel !== null && dec.lowestFailedAboveLevel <= 4) {
    seeds.push({ standard_id: `RF.${ccssGrade(dec.lowestFailedAboveLevel as PlacedBand)}.3`, pass: false, note: "next word-list target" });
  }

  return {
    placedBand: candidate,
    gradeKey,
    readingLevelName: grades[gradeKey].reading_level_name,
    season,
    relative: { delta, label: relativeLabel(delta) },
    decoding: {
      level: dec.band,
      emergent: dec.emergent,
      ceilingPassed: dec.ceilingPassed,
      listsPassed: dec.listsPassed,
      nextTarget: dec.lowestFailedAboveLevel,
    },
    fluency,
    comprehension,
    foundations,
    strengths,
    needs,
    seeds,
    flags,
  };
}
