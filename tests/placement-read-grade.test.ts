import { describe, it, expect } from "vitest";
import { gradeRead, gradeWord, WORD_ACCURACY_MIN } from "@/lib/placement/read-grade";
import type { PAWord } from "@/app/(protected)/luna/_components/azure-stream";

const w = (word: string, accuracy = 90, errorType = "None"): PAWord => ({ word, accuracy, errorType, phonemeMin: accuracy, worst: "" });

describe("gradeRead", () => {
  it("counts a clean read in order", () => {
    const g = gradeRead("Sam has a pup.", [[w("Sam"), w("has"), w("a"), w("pup")]]);
    expect(g.wordsAttempted).toBe(4);
    expect(g.wordsCorrect).toBe(4);
    expect(g.missed).toEqual([]);
  });
  it("scores omissions and substitutions as errors, ignores insertions, stops at the last word reached", () => {
    const g = gradeRead("Max sat on his rug. He was sad.", [
      [w("Max"), w("sat"), w("on", 0, "Omission"), w("um", 40, "Insertion"), w("his", 30), w("rug")],
    ]);
    expect(g.wordsAttempted).toBe(5);
    expect(g.wordsCorrect).toBe(3);
    expect(g.missed).toEqual(["on", "his"]);
    expect(g.annotations[5].status).toBe("unread");
  });
  it("marks skipped reference words as omitted when the stream jumps ahead", () => {
    const g = gradeRead("one two three four", [[w("one"), w("three"), w("four")]]);
    expect(g.wordsAttempted).toBe(4);
    expect(g.annotations[1].status).toBe("omitted");
    expect(g.wordsCorrect).toBe(3);
  });
  it("does not advance on a word it cannot place", () => {
    const g = gradeRead("cat dog", [[w("elephant")]]);
    expect(g.wordsAttempted).toBe(0);
  });
});

describe("gradeWord", () => {
  it("accepts a clean word at the accuracy floor and rejects below it", () => {
    expect(gradeWord("ship", [[w("ship", WORD_ACCURACY_MIN)]]).correct).toBe(true);
    expect(gradeWord("ship", [[w("ship", WORD_ACCURACY_MIN - 1)]]).correct).toBe(false);
  });
  it("reports unheard when the word never appears or was omitted", () => {
    expect(gradeWord("ship", [[w("chip")]]).heard).toBe(false);
    expect(gradeWord("ship", [[w("ship", 0, "Omission")]]).heard).toBe(false);
  });
});
