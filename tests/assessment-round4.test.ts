import { describe, expect, it } from "vitest";
import { isSpokenPass } from "@/lib/placement/spoken-pass";
import { speechMatchesScript } from "@/lib/audio/verified-speech";
import { readingSearch, type ReadingTrial } from "@/lib/placement/spectrum";
import { spectrumSubmission } from "./fixtures/placement-spectrum";
import { countWords } from "@/lib/placement/bank";

describe("spoken passes", () => {
  it.each([
    "I don't know",
    "I don’t know this word",
    "I'm not sure",
    "I am not sure",
    "Not sure.",
    "Skip this one",
  ])("passes %s", (text) => expect(isSpokenPass(text)).toBe(true));
  it.each(["sure", "garden", "I know this", "unsurely"])("does not pass %s", (text) =>
    expect(isSpokenPass(text)).toBe(false),
  );
});
it("rejects extra invented report speech and changed numbers", () => {
  expect(
    speechMatchesScript(
      "Filus read 134 words per minute.",
      "Phyllis read one hundred thirty four words per minute.",
      ["Filus"],
    ),
  ).toBe(true);
  expect(
    speechMatchesScript("Filus read 134 words per minute.", "Filus read 143 words per minute.", [
      "Filus",
    ]),
  ).toBe(false);
  expect(
    speechMatchesScript(
      "Filus read 134 words per minute.",
      "Filus read 134 words per minute. He is sitting in his office.",
      ["Filus"],
    ),
  ).toBe(false);
  expect(speechMatchesScript("Your journey is ready.", "You are in your office.")).toBe(false);
});
function trial(
  p: NonNullable<ReturnType<typeof readingSearch>["next"]>,
  pass: boolean,
): ReadingTrial {
  const words = countWords(p.text);
  return {
    passageId: p.id,
    speech: {
      band: p.grade,
      wordsCorrect: words,
      wordsTotal: words,
      durationSeconds: 60,
      minuteSeconds: 60,
      minuteWordsCorrect: words,
      prosody: null,
    },
    choices: p.questions.map((q) => ({
      itemId: q.id,
      choiceId: pass ? q.correctId : q.options.find((o) => o.id !== q.correctId)!.id,
    })),
  };
}
it("starts a strong Kindergarten word reader on Kindergarten connected text, then permits the ceiling", () => {
  const words = spectrumSubmission(0, 9, 4, 4).spectrum!.words;
  const trials: ReadingTrial[] = [];
  let state = readingSearch(0, words, trials, undefined, "school-first");
  expect(state.next?.grade).toBe(0);
  while (state.next) {
    trials.push(trial(state.next, true));
    state = readingSearch(0, words, trials, undefined, "school-first");
  }
  expect(trials.map((t) => t.speech.band)).toEqual([0, 0, 4, 4]);
  expect(state.confirmed).toBe(4);
});
it("keeps the demonstrated floor when the stretch is too difficult", () => {
  const words = spectrumSubmission(0, 9, 4, 4).spectrum!.words;
  const trials: ReadingTrial[] = [];
  let state = readingSearch(0, words, trials, undefined, "school-first");
  while (state.next) {
    trials.push(trial(state.next, state.next.grade === 0));
    state = readingSearch(0, words, trials, undefined, "school-first");
  }
  expect(state.confirmed).toBe(0);
  expect(trials.length).toBeLessThanOrEqual(6);
});
it("replays legacy assessments using their original entry rule", () => {
  const s = spectrumSubmission(0, 9, 4, 4);
  expect(readingSearch(0, s.spectrum!.words, s.spectrum!.reading).confirmed).toBe(4);
});

import { PlacementSubmissionSchema } from "@/lib/schemas/placement";
import { validatePlacementEvidence } from "@/lib/placement/validate-evidence";
import { decidePlacement } from "@/lib/placement/decide";
it("preserves the entry strategy through parsing and server replay above enrollment", () => {
  const parsed = PlacementSubmissionSchema.parse(spectrumSubmission(0, 9, 4, 4, "school-first"));
  expect(parsed.spectrum!.readingEntry).toBe("school-first");
  const validated = validatePlacementEvidence(
    parsed as import("@/lib/placement/types").PlacementSubmission,
    0,
  );
  expect(decidePlacement(validated).spectrum?.readingBand).toBe(4);
  expect(parsed.enrolled).toBe(0);
});
