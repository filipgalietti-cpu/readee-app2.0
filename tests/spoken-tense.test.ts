import { describe, it, expect } from "vitest";
import { spokenTense } from "@/lib/audio/spoken-tense";
import { listeningLine } from "@/lib/placement/narration";
import { speechMatchesScript } from "@/lib/audio/verified-speech";

/**
 * Filip, on the report Luna read back to him: "she said read instead of read
 * (same spelling but grammatical error)".
 */
describe("spokenTense", () => {
  it("fixes the line Filip actually heard", () => {
    const stored =
      "Fil read words in the vowel patterns set, read a Kindergarten text accurately and understood its meaning.";
    const spoken = spokenTense(stored);
    expect(spoken).toContain("Fil red words in the vowel patterns set");
    expect(spoken).toContain("red a Kindergarten text accurately");
    expect(spoken).not.toMatch(/\bread\b/);
  });

  it("fixes the words per minute line", () => {
    expect(spokenTense("Fil read this passage at 92 correct words per minute.")).toBe(
      "Fil red this passage at 92 correct words per minute.",
    );
  });

  it("fixes the word list and story clauses", () => {
    expect(spokenTense("they read every word on the kindergarten list")).toContain("red every word");
    expect(spokenTense("she read the kindergarten story with expression")).toContain(
      "red the kindergarten story",
    );
  });

  it("leaves the present tense alone", () => {
    // The same word, the other sound. Getting this wrong is the same defect
    // pointing the other way.
    const present = "Understanding what they read is the skill to build.";
    expect(spokenTense(present)).toBe(present);
    const infinitive = "to read like a second grader by spring";
    expect(spokenTense(infinitive)).toBe(infinitive);
    const noun = "We build reading accuracy before speed.";
    expect(spokenTense(noun)).toBe(noun);
  });

  it("leaves read-aloud and reads alone", () => {
    const s = "With read-aloud support, she reads the next set.";
    expect(spokenTense(s)).toBe(s);
  });
});

/**
 * Fil answered 3 of 10 and the report told his parent that showed
 * understanding. The number was right; the sentence after it was not.
 */
describe("listeningLine", () => {
  it("does not claim understanding at three out of ten", () => {
    const line = listeningLine("Fil", 3, 10);
    expect(line).toContain("Fil answered 3 of 10 listening questions correctly.");
    expect(line).not.toMatch(/shows understanding/i);
    expect(line).toContain("the place to start");
  });

  it("says so when the score is strong", () => {
    expect(listeningLine("Fil", 9, 10)).toMatch(/strength/);
  });

  it("has a middle band that overclaims neither way", () => {
    const mid = listeningLine("Fil", 6, 10);
    expect(mid).toContain("working base");
    expect(mid).not.toMatch(/strength/);
  });

  it("always leads with the number", () => {
    for (const [c, t] of [[0, 10], [3, 10], [6, 10], [10, 10]] as const) {
      expect(listeningLine("Fil", c, t)).toContain(`Fil answered ${c} of ${t}`);
    }
  });

  it("handles a child who answered none of them", () => {
    expect(listeningLine("Fil", 0, 0)).toMatch(/has not answered listening questions yet/);
  });
});

/**
 * The respelling and the verifier have to agree, or the fix above rejects its
 * own audio: the voice is told "red", the transcriber writes back whichever
 * spelling makes the sentence grammatical, and that is usually "read".
 */
describe("verifier tolerates the respelling", () => {
  it("accepts a transcript that spells it the written way", () => {
    const script = "Fil red this passage at 92 correct words per minute.";
    const heard = "Fil read this passage at 92 correct words per minute.";
    expect(speechMatchesScript(script, heard, ["Fil"])).toBe(true);
  });

  it("still rejects genuinely different speech", () => {
    const script = "Fil red this passage at 92 correct words per minute.";
    const heard = "Fil read this passage at 61 correct words per minute.";
    expect(speechMatchesScript(script, heard, ["Fil"])).toBe(false);
  });
});
