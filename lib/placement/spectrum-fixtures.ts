import {
  wordSearch,
  readingSearch,
  languageSearch,
  ORAL_BLENDS,
  type SpectrumEvidence,
} from "@/lib/placement/spectrum";
import type { PlacedBand } from "@/lib/placement/ladder";
import type { PlacementSubmission } from "@/lib/placement/types";
import { countWords } from "@/lib/placement/bank";

export function spectrumSubmission(
  enrolled: PlacedBand = 4,
  wordCeiling = 5,
  readingCeiling: PlacedBand = 2,
  languageCeiling: PlacedBand = 4,
  readingEntry?: "school-first",
): PlacementSubmission {
  const ev: SpectrumEvidence = { ...(readingEntry ? { readingEntry } : {}), words: [], reading: [], language: [], blending: [] };
  let w = wordSearch(enrolled, ev.words);
  while (w.next) {
    ev.words.push({ itemId: w.next.id, correct: w.next.step <= wordCeiling });
    w = wordSearch(enrolled, ev.words);
  }
  if (w.grade <= 1)
    ev.blending = ORAL_BLENDS.map((b) => ({ itemId: b.id, correct: wordCeiling >= 1 }));
  let r = readingSearch(enrolled, ev.words, ev.reading, undefined, ev.readingEntry);
  while (r.next) {
    const p = r.next,
      total = countWords(p.text),
      correct = p.grade <= readingCeiling;
    ev.reading.push({
      passageId: p.id,
      speech: {
        band: p.grade,
        wordsCorrect: correct ? total : Math.floor(total * 0.7),
        wordsTotal: total,
        durationSeconds: 60,
        minuteWordsCorrect: correct ? total : Math.floor(total * 0.7),
        minuteSeconds: 60,
      },
      choices: p.questions.map((q) => ({
        itemId: q.id,
        choiceId: correct ? q.correctId : q.options.find((o) => o.id !== q.correctId)!.id,
      })),
    });
    r = readingSearch(enrolled, ev.words, ev.reading, undefined, ev.readingEntry);
  }
  const start = Math.max(enrolled, r.confirmed ?? 0) as PlacedBand;
  let l = languageSearch(start, ev.language);
  while (l.next) {
    const q = l.next;
    ev.language.push({
      itemId: q.id,
      choiceId:
        q.grade <= languageCeiling ? q.correctId : q.options.find((o) => o.id !== q.correctId)!.id,
    });
    l = languageSearch(start, ev.language);
  }
  return {
    evidenceVersion: 4,
    spectrum: ev,
    childId: "11111111-1111-4111-8111-111111111111",
    sessionId: "22222222-2222-4222-8222-222222222222",
    enrolled,
    ladder: { enrolled, current: 0, lists: [], phase: "done", done: true },
    passages: [],
    comprehension: null,
    foundations: null,
    moments: [],
    durationSeconds: 360,
  };
}

/** Synthetic parent-report preview; never reads or writes a family's records. */
import { decidePlacement } from "./decide";
import { buildPlan } from "./plan";
import { narrate } from "./narration";
import type { PlacementResult } from "./types";
export function fixtureSpectrumMaya(): PlacementResult {
  const sub = spectrumSubmission();
  for (const trial of sub.spectrum!.reading) {
    trial.speech.durationSeconds = 120;
    trial.speech.minuteWordsCorrect = Math.floor(trial.speech.wordsCorrect / 2);
  }
  const today = new Date("2026-09-09T16:00:00Z");
  const decision = decidePlacement({ ...sub, date: today });
  const plan = buildPlan({ decision, moments: [], today });
  return {
    id: "spectrum-demo",
    childId: sub.childId,
    childName: "Maya",
    enrolled: 4,
    decision,
    plan,
    moments: [],
    narration: narrate({ childName: "Maya", decision, plan, moments: [], today }),
    passageRecordingPath: null,
    durationSeconds: 360,
    createdAt: today.toISOString(),
  };
}

/** Regression profile: strong isolated words, two timed reads, no confirmed
 * connected-reading band. Contains no family's identifiers or recordings. */
export function fixtureUnconfirmedReader(): PlacementResult {
  const sub = spectrumSubmission(1, 9, 3, 1);
  const ev = sub.spectrum!;
  ev.reading = ev.reading.slice(0, 2);
  ev.reading[0].speech = {
    band: 4,
    wordsTotal: 86,
    wordsCorrect: 81,
    durationSeconds: 122,
    minuteWordsCorrect: 81,
    minuteSeconds: 60,
  };
  ev.reading[1].speech = {
    band: 3,
    wordsTotal: 110,
    wordsCorrect: 106,
    durationSeconds: 107,
    minuteWordsCorrect: 61,
    minuteSeconds: 60,
  };
  ev.readingStopped = {
    passageId: readingSearch(1, ev.words, ev.reading).next!.id,
    reason: "child-pass",
  };
  ev.language = [];
  let l = languageSearch(1, ev.language);
  while (l.next) {
    ev.language.push({
      itemId: l.next.id,
      choiceId: l.next.options.find((o) => o.id !== l.next!.correctId)!.id,
    });
    l = languageSearch(1, ev.language);
  }
  const today = new Date("2026-09-10T16:00:00Z");
  const decision = decidePlacement({ ...sub, date: today });
  const plan = buildPlan({ decision, moments: [], today });
  return {
    id: "unconfirmed-demo",
    childId: sub.childId,
    childName: "Maya",
    enrolled: 1,
    decision,
    plan,
    moments: [],
    narration: narrate({ childName: "Maya", decision, plan, moments: [], today }),
    passageRecordingPath: null,
    durationSeconds: 793,
    createdAt: today.toISOString(),
  };
}
