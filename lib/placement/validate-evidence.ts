import { PLACEMENT_BANK } from "@/app/data/placement-bank";
import { activeList, createLadder, decodingLevel, needsFoundations, recordWord, type Band, type PlacedBand } from "./ladder";
import type { Moment, PlacementSubmission } from "./types";
import { nextPassageBand } from "./passage-search";

/** Validate the browser's evidence against the fixed bank. Scores still originate
 * in the browser; this establishes consistency, not proof of recorded speech. */
export function validatePlacementEvidence(sub: PlacementSubmission, enrolled: PlacedBand): PlacementSubmission {
  const fail = (): never => { throw new Error("The assessment evidence is incomplete or inconsistent. Please retry the assessment."); };
  if (sub.enrolled !== enrolled || sub.ladder.enrolled !== enrolled || sub.durationSeconds <= 0) fail();
  let ladder = createLadder(enrolled);
  for (const list of sub.ladder.lists) {
    if (activeList(ladder)?.band !== list.band || !list.attempts.length) fail();
    for (const [i, attempt] of list.attempts.entries()) {
      if (activeList(ladder)?.band !== list.band || PLACEMENT_BANK.bands[list.band].words[i]?.word !== attempt.word) fail();
      ladder = recordWord(ladder, attempt.word, attempt.correct);
    }
    const computed = ladder.lists.find((l) => l.band === list.band)!;
    if (["correct", "missed", "complete", "passed"].some((key) => computed[key as keyof typeof computed] !== list[key as keyof typeof list])) fail();
  }
  if (!ladder.done || !sub.ladder.done || sub.ladder.phase !== ladder.phase || sub.ladder.current !== ladder.current) fail();
  const band = (decodingLevel(ladder).band ?? 0) as Band;
  const countOK = (c: { correct: number; total: number } | null | undefined, total: number) => c && c.total === total && c.correct >= 0 && c.correct <= total;
  let finalBand = band;
  if (sub.evidenceVersion === 3) {
    if (!sub.comprehensionChecks || sub.comprehensionChecks.length !== sub.passages.length) fail();
    let next: Band | null = band;
    for (const [i, p] of sub.passages.entries()) {
      const c = sub.comprehensionChecks![i];
      if (next === null || next === 0 || p.band !== next || c.band !== p.band || !countOK(c, PLACEMENT_BANK.bands[p.band].passage!.questions.length)) fail();
      next = nextPassageBand(p, c);
      finalBand = next ?? p.band;
    }
    // A failed passage requires its lower-band follow-up; K uses listening.
    if (next !== null && next !== 0) fail();
    if (finalBand > 0) {
      const last = sub.comprehensionChecks!.at(-1)!;
      if (!sub.comprehension || sub.comprehension.band !== last.band || sub.comprehension.correct !== last.correct || sub.comprehension.total !== last.total) fail();
    }
  } else {
    if (sub.comprehensionChecks !== undefined) fail();
    const expected = band === 0 ? [] : [band, ...(enrolled - band === 1 ? [enrolled] : [])];
    if (sub.passages.length !== expected.length || sub.passages.some((p, i) => p.band !== expected[i])) fail();
  }
  for (const p of sub.passages) {
    if (!PLACEMENT_BANK.bands[p.band]?.passage) fail();
    const max = PLACEMENT_BANK.bands[p.band].passage!.text.split(/\s+/).filter(Boolean).length;
    if (p.wordsTotal <= 0 || p.wordsTotal > max || p.wordsCorrect > p.wordsTotal || p.durationSeconds <= 0) fail();
    if (sub.evidenceVersion === 3 && (p.minuteWordsCorrect === undefined || p.minuteSeconds === undefined)) fail();
    if ((p.minuteWordsCorrect === undefined) !== (p.minuteSeconds === undefined)) fail();
    if (p.minuteWordsCorrect !== undefined && (p.minuteWordsCorrect > p.wordsCorrect || !p.minuteSeconds || p.minuteSeconds > 60 || p.minuteSeconds > p.durationSeconds + 1)) fail();
  }
  const questions = finalBand === 0 ? PLACEMENT_BANK.foundations.listening.questions : PLACEMENT_BANK.bands[finalBand].passage!.questions;
  if (!countOK(sub.comprehension, questions.length) || sub.comprehension?.band !== finalBand) fail();
  if (needsFoundations(ladder) || finalBand === 0) {
    const f = sub.foundations;
    if (!f || !countOK(f.letterSounds, PLACEMENT_BANK.foundations.letterSounds.length) || !countOK(f.blending, PLACEMENT_BANK.foundations.blending.length) || !countOK(f.nonsenseWords, PLACEMENT_BANK.foundations.nonsenseWords.length)) fail();
  } else if (sub.foundations !== null) fail();
  // Parent narration and skip decisions may cite only evidence we validated.
  const moments: Moment[] = ladder.lists.map((l) => l.passed
    ? { kind: "list-passed", band: l.band, misses: l.missed }
    : { kind: "list-hard", band: l.band, words: l.attempts.filter((a) => !a.correct).map((a) => a.word) });
  for (const p of sub.passages) if (p.wordsCorrect / p.wordsTotal >= 0.95) moments.push({ kind: "passage-accurate", band: p.band, accuracy: p.wordsCorrect / p.wordsTotal });
  if (sub.comprehension) moments.push({ kind: "comprehension", ...sub.comprehension });
  if (sub.foundations) for (const skill of ["letterSounds", "blending", "nonsenseWords"] as const) moments.push({ kind: "foundation", skill, ...sub.foundations[skill] });
  return { ...sub, enrolled, ladder, moments };
}
