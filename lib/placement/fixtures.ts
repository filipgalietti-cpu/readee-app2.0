/**
 * Fixtures for the reveal and report UI: real decisions built through the
 * real decidePlacement() from simulated evidence, with the plan and the
 * narration built through the real buildPlan() and narrate(), so the UI
 * renders exactly what the complete route saves.
 */
import { createLadder, recordWord, activeList, WORDS_PER_LIST, type LadderState, type PlacedBand } from "./ladder";
import { decidePlacement } from "./decide";
import { buildPlan } from "./plan";
import { narrate } from "./narration";
import type { PlacementResult, Moment } from "./types";

function playList(s: LadderState, pass: boolean, hardWords: string[] = []): LadderState {
  if (pass) {
    for (let i = 0; i < WORDS_PER_LIST; i++) s = recordWord(s, `w${i}`, true);
    return s;
  }
  const words = hardWords.length >= 3 ? hardWords : ["x0", "x1", "x2"];
  for (let i = 0; i < 3; i++) s = recordWord(s, words[i], false);
  return s;
}

function ladderFor(enrolled: PlacedBand, trueBand: number, hardWords: string[] = []): LadderState {
  let s = createLadder(enrolled);
  let guard = 0;
  while (!s.done && guard++ < 20) {
    const list = activeList(s);
    if (!list) break;
    s = playList(s, list.band <= trueBand, list.band === trueBand + 1 ? hardWords : []);
  }
  return s;
}

/** State A: Maya, 4th grade, September, placed at 2nd. */
export function fixtureMaya(): PlacementResult {
  const date = new Date(2026, 8, 2);
  const decision = decidePlacement({
    enrolled: 4,
    ladder: ladderFor(4, 2, ["umbrella", "remember", "vacation"]),
    passages: [
      { band: 2, wordsCorrect: 70, wordsTotal: 72, durationSeconds: 60, prosody: 74 },
      { band: 4, wordsCorrect: 61, wordsTotal: 70, durationSeconds: 60, prosody: 55 },
    ],
    comprehension: { correct: 3, total: 3, band: 2 },
    foundations: null,
    date,
  });
  const moments: Moment[] = [
    { kind: "list-passed", band: 2, misses: 0 },
    { kind: "list-hard", band: 3, words: ["umbrella", "remember"] },
    { kind: "passage-kept-going", band: 4 },
    { kind: "comprehension", band: 2, correct: 3, total: 3 },
  ];
  const plan = buildPlan({ decision, moments, today: date });
  const narration = narrate({ childName: "Maya", pronoun: "she", decision, moments, plan, today: date });
  return {
    id: "fixture-maya",
    childId: "00000000-0000-0000-0000-000000000000",
    childName: "Maya",
    enrolled: 4,
    decision,
    moments,
    plan,
    narration,
    passageRecordingPath: null,
    durationSeconds: 540,
    createdAt: date.toISOString(),
  };
}
