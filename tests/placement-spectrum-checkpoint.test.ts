import { describe, expect, it } from "vitest";
import {
  CHECKPOINT_REVISION,
  restoreSpectrumCheckpoint,
  type SpectrumCheckpoint,
} from "@/lib/placement/spectrum-checkpoint";
import { spectrumSubmission } from "./fixtures/placement-spectrum";
import { wordSearch, readingSearch } from "@/lib/placement/spectrum";
import type { PlacedBand } from "@/lib/placement/ladder";
import { decidePlacement } from "@/lib/placement/decide";
const now = Date.parse("2026-09-10T12:00:00Z");
function blank(enrolled: PlacedBand = 4): SpectrumCheckpoint {
  const sub = spectrumSubmission(enrolled);
  return {
    revision: CHECKPOINT_REVISION,
    childId: sub.childId,
    sessionId: sub.sessionId!,
    enrolled,
    savedAt: now,
    elapsedSeconds: 123,
    spectrum: { words: [], blending: [], reading: [], language: [] },
    activeReading: null,
  };
}
const restore = (d: SpectrumCheckpoint, at = now) =>
  restoreSpectrumCheckpoint(JSON.stringify(d), d.childId, d.enrolled, at);

describe("response-by-response placement resume", () => {
  it.each([0, 1, 2, 3, 4] as PlacedBand[])(
    "restores every measured response and partial comprehension for enrollment %i",
    (enrolled) => {
      const sub = spectrumSubmission(enrolled, enrolled * 2 + 1, enrolled, enrolled);
      const d = blank(enrolled),
        target = sub.spectrum!;
      let checkpoints = 0;
      const check = () => {
        const r = restore(d, now + 3600_000)!;
        expect(r).toEqual(d);
        expect(r.sessionId).toBe(sub.sessionId);
        expect(r.elapsedSeconds).toBe(123); // time away is not assessment duration
        checkpoints++;
        return r;
      };
      for (const word of target.words) {
        d.spectrum.words.push(word);
        expect(wordSearch(enrolled, check().spectrum.words)).toEqual(
          wordSearch(enrolled, d.spectrum.words),
        );
      }
      for (const blend of target.blending) {
        d.spectrum.blending.push(blend);
        check();
      }
      for (const trial of target.reading) {
        d.activeReading = { ...trial, choices: [] };
        check();
        for (const choice of trial.choices) {
          d.activeReading.choices.push(choice);
          check();
        }
        d.spectrum.reading.push(d.activeReading);
        d.activeReading = null;
        const resumed = check();
        expect(readingSearch(enrolled, resumed.spectrum.words, resumed.spectrum.reading)).toEqual(
          readingSearch(enrolled, d.spectrum.words, d.spectrum.reading),
        );
      }
      for (const response of target.language) {
        d.spectrum.language.push(response);
        check();
      }
      expect(decidePlacement({ ...sub, spectrum: check().spectrum })).toEqual(decidePlacement(sub));
      expect(checkpoints).toBeGreaterThan(15);
    },
  );
  it("rejects mismatched identity, enrollment, revision, expiry and corrupt JSON", () => {
    const d = blank();
    expect(restoreSpectrumCheckpoint("broken", d.childId, 4, now)).toBeNull();
    expect(restoreSpectrumCheckpoint(JSON.stringify(d), "someone-else", 4, now)).toBeNull();
    expect(restoreSpectrumCheckpoint(JSON.stringify(d), d.childId, 3, now)).toBeNull();
    expect(restore({ ...d, revision: 1 } as unknown as SpectrumCheckpoint)).toBeNull();
    expect(restore(d, now + 25 * 3600_000)).toBeNull();
    expect(restore({ ...d, savedAt: now + 120_000 })).toBeNull();
  });
  it("rejects forged prefixes, skipped stages and invalid partial questions", () => {
    const d = blank();
    d.spectrum.words.push({ itemId: "sp-word-0-0", correct: true });
    expect(restore(d)).toBeNull();
    const sub = spectrumSubmission();
    const good = { ...blank(), spectrum: structuredClone(sub.spectrum!) };
    expect(restore(good)).not.toBeNull();
    const earlyLanguage = blank();
    earlyLanguage.spectrum.language = sub.spectrum!.language.slice(0, 1);
    expect(restore(earlyLanguage)).toBeNull();
    const partial = {
      ...blank(),
      spectrum: { ...sub.spectrum!, reading: [], language: [] },
      activeReading: structuredClone(sub.spectrum!.reading[0]),
    };
    partial.activeReading.choices = [
      { itemId: partial.activeReading.choices[0].itemId, choiceId: "fake" },
    ];
    expect(restore(partial)).toBeNull();
    partial.activeReading.choices = [];
    partial.activeReading.speech.minuteWordsCorrect = partial.activeReading.speech.wordsCorrect + 1;
    expect(restore(partial)).toBeNull();
  });
});
