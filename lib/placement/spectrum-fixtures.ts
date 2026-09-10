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
): PlacementSubmission {
  const ev: SpectrumEvidence = { words: [], reading: [], language: [], blending: [] };
  let w = wordSearch(enrolled, ev.words);
  while (w.next) {
    ev.words.push({ itemId: w.next.id, correct: w.next.step <= wordCeiling });
    w = wordSearch(enrolled, ev.words);
  }
  if (w.grade <= 1)
    ev.blending = ORAL_BLENDS.map((b) => ({ itemId: b.id, correct: wordCeiling >= 1 }));
  let r = readingSearch(enrolled, ev.words, ev.reading);
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
    r = readingSearch(enrolled, ev.words, ev.reading);
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
