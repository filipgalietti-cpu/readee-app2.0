import { describe, expect, it } from "vitest";
import { fixtureUnconfirmedReader, spectrumSubmission } from "@/lib/placement/spectrum-fixtures";
import { buildRevealCopy } from "@/app/(protected)/placement/_components/reveal/copy";
import { withCurrentPlan } from "@/lib/placement/current-plan";
import { readingSearch, languageSearch } from "@/lib/placement/spectrum";
import { decideSpectrum } from "@/lib/placement/spectrum-decision";
import { readingPages } from "@/lib/placement/reading-pages";
import { SPECTRUM_PASSAGES } from "@/app/data/placement-spectrum/reading";

describe("unconfirmed reading reports", () => {
  it("keeps advanced words separate from an enrollment-appropriate provisional journey", () => {
    const result = fixtureUnconfirmedReader();
    expect(result.decision.spectrum).toMatchObject({
      wordBand: 4,
      readingBand: null,
      languageBand: null,
    });
    expect(result.decision.placedBand).toBe(1);
    expect(result.plan.firstUnit).toMatchObject({ grade: "1st Grade", domain: "Literature" });
    const copy = buildRevealCopy(result);
    expect(copy.placement.band).toBe("Provisional starting point");
    expect(copy.skills).toHaveLength(3);
    expect(copy.skills.map((s) => s.value)).toEqual([
      "Fourth-grade stretch",
      "Not yet confirmed",
      "Needs follow-up",
    ]);
    expect(copy.number).toMatchObject({ wcpm: 61, subtitle: "3rd-grade passage" });
  });
  it("reprojects an old report from its actual evidence without modifying the saved input", () => {
    const sub = spectrumSubmission(1, 9, 3, 1);
    const ev = sub.spectrum!;
    ev.reading = ev.reading.slice(0, 2);
    ev.readingStopped = {
      passageId: readingSearch(1, ev.words, ev.reading).next!.id,
      reason: "child-pass",
    };
    ev.language = [];
    let l = languageSearch(1, ev.language);
    while (l.next) {
      ev.language.push({ itemId: l.next.id, choiceId: l.next.correctId });
      l = languageSearch(1, ev.language);
    }
    const old = fixtureUnconfirmedReader();
    old.decision.spectrum!.version = 1;
    old.decision.placedBand = 4;
    old.decision.gradeKey = "4th";
    old.decision.fluency = null;
    const before = structuredClone(old);
    const current = withCurrentPlan(old, { spectrum: ev });
    expect(old).toEqual(before);
    expect(current.decision).toEqual(decideSpectrum(1, ev, new Date(old.createdAt)));
    expect(current.plan.entryBand).toBe(1);
    expect(current.decision.fluency).not.toBeNull();
    expect(current.narration.every((line) => !line.audioPath)).toBe(true);
  });
  it("balances page endings instead of leaving an orphan word", () => {
    for (const size of [6, 12, 20, 24, 32, 48])
      for (const p of SPECTRUM_PASSAGES) {
        const pages = readingPages(p.text, size);
        expect(pages.map((x) => x.text).join(" ")).toBe(p.text.trim().replace(/\s+/g, " "));
        if (pages.length > 1) expect(pages.at(-1)!.text.split(/\s+/).length).toBeGreaterThan(1);
        expect(pages.every((x) => x.text.split(/\s+/).length <= size)).toBe(true);
      }
  });
});
