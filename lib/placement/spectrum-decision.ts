import { WORD_STEPS } from "@/app/data/placement-spectrum/words";
import { readingScore, validateSpectrum, type SpectrumEvidence } from "./spectrum";
import { BAND_GRADE_KEY, type PlacementDecision } from "./decide";
import { BAND_LABEL, type PlacedBand } from "./ladder";
import { wcpm as computeWcpm } from "@/lib/luna/grading-decision";
import { seasonFor } from "./norms";
import { grades } from "@/lib/assessment/questions";

export type SpectrumProfile = {
  version: 1;
  wordStep: number | null;
  wordLabel: string;
  wordBand: PlacedBand;
  readingBand: PlacedBand | null;
  readingStatus: "confirmed" | "starting-point";
  languageBand: PlacedBand | null;
  languageByBand: { correct: number; total: number }[];
  oralBlending: { correct: number; total: number } | null;
  ceilingReached: boolean;
};
const label = (b: PlacedBand) => (b === 0 ? "Kindergarten" : `${BAND_LABEL[b]} Grade`);

export function decideSpectrum(
  enrolled: PlacedBand,
  ev: SpectrumEvidence,
  date = new Date(),
): PlacementDecision {
  const { words: w, reading: r, language: l } = validateSpectrum(enrolled, ev);
  // Unconfirmed comprehension is not evidence of absent decoding. A word-based
  // lesson recommendation stays explicitly provisional until connected reading confirms.
  const entry = r.confirmed ?? w.grade;
  const wordLabel = WORD_STEPS[w.highest ?? 0].label;
  const nextStep = w.failed.length ? Math.min(...w.failed) : null;
  const oralBlending = ev.blending.length
    ? { correct: ev.blending.filter((b) => b.correct).length, total: ev.blending.length }
    : null;
  const profile: SpectrumProfile = {
    version: 1,
    wordStep: w.highest,
    wordLabel,
    wordBand: w.grade,
    readingBand: r.confirmed,
    readingStatus: r.confirmed === null ? "starting-point" : "confirmed",
    languageBand: l.supported?.grade ?? null,
    languageByBand: l.counts,
    oralBlending,
    ceilingReached: w.highest === 9 && r.confirmed === 4,
  };
  const strengths: string[] = [];
  if (w.highest !== null)
    strengths.push(
      w.highest === 0
        ? "matches some letters to their sounds"
        : `reads words in the ${wordLabel.toLowerCase()} set`,
    );
  if (r.confirmed !== null)
    strengths.push(`read and answered questions about two ${label(r.confirmed)} texts`);
  if (l.supported)
    strengths.push(
      `understands ${label(l.supported.grade)} language questions with read-aloud support`,
    );
  if (oralBlending?.correct === 3) strengths.push("blends spoken sounds into words");
  const needs =
    nextStep === null
      ? ["applying word knowledge in longer texts"]
      : [WORD_STEPS[nextStep].label.toLowerCase()];
  if (r.confirmed === null)
    needs.push(
      w.highest !== null && w.highest >= 2
        ? "guided reading and discussion to check understanding of connected text"
        : "guided practice with letters, words and short sentences",
    );
  else if (r.confirmed < w.grade) needs.push("understanding and accurately reading connected text");
  if (oralBlending && oralBlending.correct < 2) needs.push("blending spoken sounds into words");
  const pair =
    r.confirmed === null ? [] : ev.reading.filter((t) => t.speech.band === r.confirmed).slice(-2);
  const total = pair.reduce((n, t) => n + readingScore(t).total, 0);
  const correct = pair.reduce((n, t) => n + readingScore(t).correct, 0);
  const p = pair[0]?.speech;
  const accuracy = p ? p.wordsCorrect / p.wordsTotal : 0;
  const delta = enrolled - entry;
  const comparison =
    r.confirmed === null
      ? "provisional lesson starting point; independent reading needs follow-up"
      : delta === 0
        ? "starting in the enrolled grade's reading lessons"
        : delta > 0
          ? `starting ${delta} ${delta === 1 ? "grade" : "grades"} below enrollment in reading lessons`
          : `starting ${-delta} ${delta === -1 ? "grade" : "grades"} above enrollment in reading lessons`;
  return {
    spectrum: profile,
    placedBand: entry,
    gradeKey: BAND_GRADE_KEY[entry],
    readingLevelName: grades[BAND_GRADE_KEY[entry]].reading_level_name,
    season: seasonFor(date),
    relative: { delta, label: comparison },
    decoding: {
      level: w.highest === null || w.highest === 0 ? null : w.grade,
      emergent: false,
      ceilingPassed: profile.ceilingReached,
      listsPassed: [],
      nextTarget: nextStep === null ? null : WORD_STEPS[nextStep].grade,
    },
    // Descriptive rate only. Custom passages do not inherit DIBELS/H&T norms.
    fluency: p
      ? {
          band: p.band,
          wcpm:
            p.minuteSeconds && p.minuteWordsCorrect !== undefined
              ? computeWcpm(p.minuteWordsCorrect, p.minuteSeconds)
              : computeWcpm(p.wordsCorrect, p.durationSeconds),
          accuracy,
          textLevel: accuracy >= 0.95 ? "independent" : "instructional",
          prosody: null,
          percentile: null,
          typicalForEnrolled: null,
          gradeEquivalent: null,
          onEnrolledPassage: p.band === enrolled,
        }
      : null,
    comprehension: total ? { correct, total, pct: correct / total } : null,
    foundations: null,
    strengths,
    needs,
    // A brief probe does not establish mastery of an entire standard or unit.
    seeds: [],
    flags: [
      "criterion-based-placement",
      "not-a-normed-grade-equivalent",
      ...(r.confirmed === null ? ["placement-needs-followup"] : []),
      ...(r.limited ? ["reading-sample-limit-reached"] : []),
      ...(ev.readingStopped ? ["reading-sample-declined"] : []),
      ...(profile.ceilingReached ? ["k4-ceiling-reached"] : []),
    ],
  };
}
