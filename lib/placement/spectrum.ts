/** Criterion-based instructional probes, not a normed grade-equivalent test.
 * Pure replay makes retries, React renders and server scoring agree. */
import { WORD_STEPS, wordItemId } from "@/app/data/placement-spectrum/words";
import languageBank from "@/app/data/placement-spectrum/language.json";
import { spectrumPassage, SPECTRUM_PASSAGES } from "@/app/data/placement-spectrum/reading";
import { countWords } from "./bank";
import type { PassageEvidence } from "./decide";
import type { PlacedBand } from "./ladder";

export type WordResponse = { itemId: string; correct: boolean };
export type ChoiceResponse = { itemId: string; choiceId: string };
export type ReadingTrial = {
  passageId: string;
  speech: PassageEvidence;
  choices: ChoiceResponse[];
};
export const PASS_CHOICE = "__pass";
export type ReadingStop = { passageId: string; reason: "child-pass" };
export type SpectrumEvidence = {
  words: WordResponse[];
  reading: ReadingTrial[];
  language: ChoiceResponse[];
  blending: WordResponse[];
  readingStopped?: ReadingStop;
  readingEntry?: "school-first";
};
export type LanguageItem = (typeof languageBank)[number];
export const LANGUAGE_ITEMS: readonly LanguageItem[] = languageBank;
export const LANGUAGE_LIMIT = 10;
// Enrollment chooses the first word probe, never the reachable floor or ceiling.
// Bracketing ten steps takes at most five sets of five measured responses.
export const WORD_RESPONSE_LIMIT = 25;
export const READING_BAND_LIMIT = 3;
export const READING_PAIR_MIN_CORRECT = 5; // Authored policy; specialist review pending.
export const ORAL_BLENDS = [
  { id: "sp-blend-0", sounds: ["m", "short_a", "p"], word: "map" },
  { id: "sp-blend-1", sounds: ["s", "short_i", "t"], word: "sit" },
  { id: "sp-blend-2", sounds: ["f", "short_i", "sh"], word: "fish" },
];
const fail = (): never => {
  throw new Error("Incomplete or inconsistent spectrum evidence.");
};
const clamp = (n: number) => Math.min(499, Math.max(0, n));

/** Four successes establish a step; two misses request an easier step. A
 * boundary needs a passed step AND a harder failed step (except the ceiling).
 * Technical failures have no response and cannot move this staircase. */
export function wordSearch(enrolled: PlacedBand, responses: WordResponse[]) {
  let step = Math.max(1, enrolled * 2);
  let lower = 0,
    upper = 9;
  let correct = 0,
    missed = 0,
    index = 0,
    done = false;
  const passed: number[] = [],
    failed: number[] = [];
  if (responses.length > WORD_RESPONSE_LIMIT) fail();
  for (const r of responses) {
    if (done || r.itemId !== wordItemId(step, index)) fail();
    index++;
    if (r.correct) correct++;
    else missed++;
    if (correct < 4 && missed < 2) continue;
    if (correct >= 4) {
      passed.push(step);
      lower = step + 1;
    } else {
      failed.push(step);
      upper = step - 1;
    }
    done = lower > upper;
    if (!done) step = Math.floor((lower + upper) / 2);
    index = 0;
    correct = 0;
    missed = 0;
  }
  const highest = passed.length ? Math.max(...passed) : null;
  return {
    done,
    passed,
    failed,
    highest,
    grade: WORD_STEPS[highest ?? 0].grade,
    next: done
      ? null
      : {
          id: wordItemId(step, index),
          step,
          index,
          word: WORD_STEPS[step].words[index],
          grade: WORD_STEPS[step].grade,
        },
  };
}

export function readingScore(trial: ReadingTrial) {
  const p = SPECTRUM_PASSAGES.find((p) => p.id === trial.passageId) ?? fail();
  const s = trial.speech;
  if (
    s.band !== p.grade ||
    s.wordsTotal <= 0 ||
    s.wordsTotal > countWords(p.text) ||
    s.wordsCorrect < 0 ||
    s.wordsCorrect > s.wordsTotal ||
    s.durationSeconds <= 0
  )
    fail();
  if (
    s.minuteWordsCorrect !== undefined &&
    (s.minuteWordsCorrect > s.wordsCorrect ||
      !s.minuteSeconds ||
      s.minuteSeconds > 60 ||
      s.minuteSeconds > s.durationSeconds + 1)
  )
    fail();
  if (trial.choices.length !== p.questions.length) fail();
  let correct = 0;
  p.questions.forEach((q, i) => {
    const r = trial.choices[i];
    if (
      r.itemId !== q.id ||
      (r.choiceId !== PASS_CHOICE && !q.options.some((o) => o.id === r.choiceId))
    )
      fail();
    if (r.choiceId === q.correctId) correct++;
  });
  const coverage = s.wordsTotal / countWords(p.text);
  const accuracy = s.wordsCorrect / s.wordsTotal;
  return {
    correct,
    total: p.questions.length,
    coverage,
    accuracy,
    comfortable: coverage >= 0.8 && accuracy >= 0.9 && correct >= 2,
  };
}

/** Story + information at the same level before confirmation. A difficult
 * passage opens a lower fresh pair. No K passage is forced on a child who has
 * not yet shown CVC word reading. */
export function readingSearch(
  enrolled: PlacedBand,
  words: WordResponse[],
  trials: ReadingTrial[],
  stopped?: ReadingStop,
  entry?: "school-first",
) {
  const w = wordSearch(enrolled, words);
  if (!w.done) fail();
  let grade = (entry === "school-first" ? Math.min(enrolled, w.grade) : w.grade) as PlacedBand;
  const firstGrade = grade;
  let triedStretch = false;
  let form: "a" | "b" = "a";
  let firstCorrect = 0;
  let failedBands = 0;
  let done = w.highest === null || w.highest === 0;
  let confirmed: PlacedBand | null = null;
  for (const [trialIndex, trial] of trials.entries()) {
    if (done || trial.passageId !== spectrumPassage(grade, form).id) fail();
    const score = readingScore(trial);
    if (
      score.comfortable &&
      (form === "a" || firstCorrect + score.correct >= READING_PAIR_MIN_CORRECT)
    ) {
      if (form === "b") {
        confirmed = grade;
        if (entry === "school-first" && !triedStretch && grade === firstGrade && w.grade > grade) {
          triedStretch = true;
          grade = w.grade;
          form = "a";
          firstCorrect = 0;
        } else done = true;
      } else {
        firstCorrect = score.correct;
        form = "b";
      }
    } else {
      failedBands++;
      if (grade === 0 || failedBands >= READING_BAND_LIMIT || (confirmed !== null && grade <= confirmed + 1)) done = true;
      else {
        grade = (grade - 1) as PlacedBand;
        form = "a";
      }
    }
    if (entry === "school-first" && trialIndex >= 5) done = true;
  }
  if (stopped) {
    if (
      done ||
      stopped.reason !== "child-pass" ||
      stopped.passageId !== spectrumPassage(grade, form).id
    )
      fail();
    done = true;
  }
  return {
    done,
    confirmed,
    limited: confirmed === null && failedBands >= READING_BAND_LIMIT,
    next: done ? null : spectrumPassage(grade, form),
  };
}

/** Reuses Claude's authored difficulty axis and nearest-item staircase, with
 * bounded strand rotation and replay instead of a mutable render counter.
 * Narrated items measure supported language understanding, not decoding. */
export function languageSearch(start: PlacedBand, responses: ChoiceResponse[]) {
  let level = start * 100 + 20;
  const used = new Set<string>();
  const counts = Array.from({ length: 5 }, () => ({ correct: 0, total: 0 }));
  const pick = () => {
    const strand = used.size % 2 === 0 ? "RL" : "RI";
    return [...LANGUAGE_ITEMS]
      .filter((q) => !used.has(q.id))
      .sort(
        (a, b) =>
          Math.abs(a.difficulty - level) +
            (a.standard.startsWith(strand) ? 0 : 15) -
            (Math.abs(b.difficulty - level) + (b.standard.startsWith(strand) ? 0 : 15)) ||
          a.id.localeCompare(b.id),
      )[0];
  };
  for (const r of responses) {
    if (used.size >= LANGUAGE_LIMIT) fail();
    const q = pick();
    if (
      !q ||
      r.itemId !== q.id ||
      (r.choiceId !== PASS_CHOICE && !q.options.some((o) => o.id === r.choiceId))
    )
      fail();
    used.add(q.id);
    const correct = r.choiceId === q.correctId;
    counts[q.grade].total++;
    if (correct) counts[q.grade].correct++;
    level = clamp(level + (correct ? 65 : -75));
  }
  const supported =
    counts
      .map((c, grade) => ({ ...c, grade: grade as PlacedBand }))
      .filter((c) => c.total >= 4 && c.correct / c.total >= 0.75)
      .at(-1) ?? null;
  return { next: used.size >= LANGUAGE_LIMIT ? null : pick(), counts, supported, level };
}

export function validateSpectrum(enrolled: PlacedBand, ev: SpectrumEvidence) {
  const w = wordSearch(enrolled, ev.words);
  const r = readingSearch(enrolled, ev.words, ev.reading, ev.readingStopped, ev.readingEntry);
  const l = languageSearch(Math.max(enrolled, r.confirmed ?? 0) as PlacedBand, ev.language);
  if (!w.done || !r.done || l.next) fail();
  const blends = w.grade <= 1 ? ORAL_BLENDS : [];
  if (ev.blending.length !== blends.length || ev.blending.some((r, i) => r.itemId !== blends[i].id))
    fail();
  return { words: w, reading: r, language: l };
}
