import { PLACEMENT_BANK } from "@/app/data/placement-bank";
import { activeList, createLadder, recordWord, type PlacedBand } from "@/lib/placement/ladder";
import type { PlacementSubmission } from "@/lib/placement/types";
export function completedSubmission(enrolled: PlacedBand = 2): PlacementSubmission {
  let ladder = createLadder(enrolled);
  while (!ladder.done) {
    const list = activeList(ladder)!;
    ladder = recordWord(ladder, PLACEMENT_BANK.bands[list.band].words[list.attempts.length].word, list.band <= enrolled);
  }
  const f = PLACEMENT_BANK.foundations;
  return {
    childId: "11111111-1111-4111-8111-111111111111", sessionId: "22222222-2222-4222-8222-222222222222",
    enrolled, ladder, passages: enrolled === 0 ? [] : [{ band: enrolled, wordsCorrect: 30, wordsTotal: 30, durationSeconds: 60, minuteWordsCorrect: 30, minuteSeconds: 60 }],
    comprehension: { band: enrolled, correct: enrolled === 0 ? 2 : 3, total: enrolled === 0 ? 2 : 3 },
    foundations: enrolled <= 1 ? { letterSounds: { correct: 0, total: f.letterSounds.length }, blending: { correct: 0, total: f.blending.length }, nonsenseWords: { correct: 0, total: f.nonsenseWords.length } } : null,
    moments: [], durationSeconds: 400,
  };
}
