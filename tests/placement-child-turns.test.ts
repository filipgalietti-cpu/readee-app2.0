import { describe, expect, it } from "vitest";
import { waitForHello } from "@/lib/placement/turn-taking";
import { readingPages } from "@/lib/placement/reading-pages";
import { SPECTRUM_PASSAGES } from "@/app/data/placement-spectrum/reading";
import { spectrumSubmission } from "./fixtures/placement-spectrum";
import { readingSearch, languageSearch, PASS_CHOICE, readingScore } from "@/lib/placement/spectrum";
import { validatePlacementEvidence } from "@/lib/placement/validate-evidence";
import { decidePlacement } from "@/lib/placement/decide";
import { PlacementSubmissionSchema } from "@/lib/schemas/placement";
import type { PlacementSubmission } from "@/lib/placement/types";
import type { PlacedBand } from "@/lib/placement/ladder";

async function hello(voice: (ms: number) => number) {
  let now = 0;
  const heard = await waitForHello(
    () => voice(now),
    () => false,
    {
      now: () => now,
      wait: async (ms) => {
        now += ms;
      },
    },
  );
  return { heard, elapsed: now };
}
describe("child-paced placement turns", () => {
  it("waits for a delayed hello, then lets the child finish before replying", async () => {
    const r = await hello((ms) => (ms >= 10000 && ms < 16000 ? 0.3 : 0));
    expect(r.heard).toBe(true);
    expect(r.elapsed).toBeGreaterThanOrEqual(17700);
    expect(r.elapsed).toBeLessThan(19000);
  });
  it("does not mistake a click or continuous noise for a completed hello", async () => {
    expect((await hello((ms) => (ms === 0 ? 0.4 : 0))).heard).toBe(false);
    expect((await hello(() => 0.3)).heard).toBe(false);
    expect(await hello(() => 0)).toEqual({ heard: false, elapsed: 30000 });
  });
  it("paginates every story without adding, losing or repeating a reference word", () => {
    for (const p of SPECTRUM_PASSAGES) {
      const pages = readingPages(p.text);
      expect(pages.map((p) => p.text).join(" ")).toBe(p.text.trim().replace(/\s+/g, " "));
      expect(pages.every((p) => p.text.split(/\s+/).length <= 24)).toBe(true);
      expect(pages.at(-1)!.endWord).toBe(p.text.trim().split(/\s+/).length);
    }
  });
  it("keeps a skipped story unmeasured through schema and server replay, then finishes listening", () => {
    const s = spectrumSubmission();
    s.spectrum!.reading = [];
    const next = readingSearch(4, s.spectrum!.words, []).next!;
    s.spectrum!.readingStopped = { passageId: next.id, reason: "child-pass" };
    expect(readingSearch(4, s.spectrum!.words, [], s.spectrum!.readingStopped)).toMatchObject({
      done: true,
      confirmed: null,
    });
    s.spectrum!.language = [];
    let l = languageSearch(4, s.spectrum!.language);
    while (l.next) {
      s.spectrum!.language.push({ itemId: l.next.id, choiceId: l.next.correctId });
      l = languageSearch(4, s.spectrum!.language);
    }
    const parsed = PlacementSubmissionSchema.parse(s) as PlacementSubmission;
    const d = decidePlacement(validatePlacementEvidence(parsed, 4));
    expect(d.spectrum?.readingBand).toBeNull();
    expect(d.spectrum?.wordBand).toBe(2);
    expect(d.spectrum?.languageBand).toBe(4);
    expect(d.fluency).toBeNull();
    expect(d.flags).toContain("reading-sample-declined");
    expect(parsed.spectrum?.reading).toEqual([]);
    parsed.spectrum!.readingStopped!.passageId = "sp-read-4-a";
    expect(() => validatePlacementEvidence(parsed, 4)).toThrow();
  });
  it("scores explicit question passes as misses without accepting arbitrary answer IDs", () => {
    const s = spectrumSubmission();
    const t = s.spectrum!.reading[0];
    t.choices[0].choiceId = PASS_CHOICE;
    expect(readingScore(t).correct).toBe(2);
    t.choices[0].choiceId = "fake";
    expect(() => readingScore(t)).toThrow();
    for (const grade of [0, 1, 2, 3, 4] as PlacedBand[]) {
      const q = languageSearch(grade, []).next!;
      expect(
        languageSearch(grade, [{ itemId: q.id, choiceId: PASS_CHOICE }]).counts[q.grade],
      ).toMatchObject({ correct: 0, total: 1 });
    }
  });
});
