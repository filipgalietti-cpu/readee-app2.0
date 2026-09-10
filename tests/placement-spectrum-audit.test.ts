import { describe, expect, it } from "vitest";
import { spectrumSubmission } from "./fixtures/placement-spectrum";
import { SPECTRUM_PASSAGES, spectrumPassage } from "@/app/data/placement-spectrum/reading";
import { LETTER_SOUND_CHOICES } from "@/app/data/placement-spectrum/words";
import { PLACEMENT_BANK } from "@/app/data/placement-bank";
import { countWords, PASSAGE_MAX_SECONDS } from "@/lib/placement/bank";
import {
  readingSearch,
  wordSearch,
  languageSearch,
  WORD_RESPONSE_LIMIT,
  READING_BAND_LIMIT,
  type SpectrumEvidence,
  type ReadingTrial,
} from "@/lib/placement/spectrum";
import { decidePlacement } from "@/lib/placement/decide";
import { passageRate, type ReadGrade } from "@/lib/placement/read-grade";
import { PlacementSubmissionSchema } from "@/lib/schemas/placement";
import { validatePlacementEvidence } from "@/lib/placement/validate-evidence";
import { buildPlan } from "@/lib/placement/plan";
import { assignedJourneyCatalog } from "@/lib/journey/next-lesson";
import { narrate } from "@/lib/placement/narration";
import type { PlacedBand } from "@/lib/placement/ladder";
import type { PlacementSubmission } from "@/lib/placement/types";

const today = new Date("2026-09-10T12:00:00Z");
const readingTrial = (p: ReturnType<typeof spectrumPassage>, misses = 0): ReadingTrial => ({
  passageId: p.id,
  speech: {
    band: p.grade,
    wordsTotal: countWords(p.text),
    wordsCorrect: Math.round(countWords(p.text) * 0.96),
    durationSeconds: 60,
  },
  choices: p.questions.map((q, i) => ({
    itemId: q.id,
    choiceId: i < misses ? q.options.find((o) => o.id !== q.correctId)!.id : q.correctId,
  })),
});
function finishLanguage(enrolled: PlacedBand, ev: SpectrumEvidence) {
  ev.language = [];
  const r = readingSearch(enrolled, ev.words, ev.reading);
  const start = Math.max(enrolled, r.confirmed ?? 0) as PlacedBand;
  let l = languageSearch(start, ev.language);
  while (l.next) {
    ev.language.push({ itemId: l.next.id, choiceId: l.next.correctId });
    l = languageSearch(start, ev.language);
  }
}

describe("placement spectrum audit regressions", () => {
  it.each([
    [1, 23],
    [1, 53],
    [2, 51],
    [3, 71],
  ] as const)(
    "lets a grade %i sample at %i WCPM confirm without a hidden speed floor",
    (grade, wcpm) => {
      const sub = spectrumSubmission(grade, grade * 2 + 1, grade, grade);
      for (const trial of sub.spectrum!.reading) {
        const p = SPECTRUM_PASSAGES.find((p) => p.id === trial.passageId)!;
        const words = countWords(p.text);
        const attemptedPerMinute = wcpm / 0.96;
        const seconds = Math.min(PASSAGE_MAX_SECONDS, (words / attemptedPerMinute) * 60);
        const attempted = Math.min(words, Math.floor((attemptedPerMinute * seconds) / 60 + 1e-8));
        trial.speech = {
          band: grade,
          wordsTotal: attempted,
          wordsCorrect: Math.round(attempted * 0.96),
          durationSeconds: seconds,
          minuteWordsCorrect: Math.round((wcpm * Math.min(60, seconds)) / 60),
          minuteSeconds: Math.min(60, seconds),
        };
      }
      const parsed = PlacementSubmissionSchema.parse(sub) as PlacementSubmission;
      const decision = decidePlacement(validatePlacementEvidence(parsed, grade));
      expect(decision.spectrum?.readingBand).toBe(grade);
      expect(decision.placedBand).toBe(grade);
      expect(decision.relative.delta).toBe(0);
    },
  );
  it("shortens only v4 stories and retains evidence for their existing questions", () => {
    for (const grade of [1, 2, 3] as const) {
      const p = spectrumPassage(grade, "a"),
        legacy = PLACEMENT_BANK.bands[grade].passage!;
      expect(countWords(p.text)).toBeLessThanOrEqual(countWords(spectrumPassage(grade, "b").text));
      expect(countWords(legacy.text)).toBeGreaterThan(170);
      expect(p.questions).toEqual(legacy.questions);
    }
    expect(spectrumPassage(1, "a").text).toMatch(/white spot.*ball in a box.*sniffs/);
    expect(spectrumPassage(2, "a").text).toMatch(/grandpa.*six seeds.*jumped/);
    expect(spectrumPassage(3, "a").text).toMatch(/grandmother knitted.*puppy's basket.*not lose/);
  });
  it.each([true, false])(
    "uses captured rate fields through schema, decision and narration (window present: %s)",
    (windowPresent) => {
      const sub = spectrumSubmission(1, 3, 1, 1);
      const t = sub.spectrum!.reading[0];
      t.speech = {
        band: 1,
        wordsTotal: 44,
        wordsCorrect: 42,
        durationSeconds: 90,
        ...(windowPresent ? { minuteWordsCorrect: 40, minuteSeconds: 50 } : {}),
      };
      const parsed = PlacementSubmissionSchema.parse(sub) as PlacementSubmission;
      const d = decidePlacement(validatePlacementEvidence(parsed, 1));
      expect(d.fluency?.wcpm).toBe(windowPresent ? 48 : 28);
      const plan = buildPlan({ decision: d, moments: [], today });
      expect(
        narrate({ childName: "Maya", decision: d, plan, moments: [], today }).find(
          (n) => n.id === "number",
        )?.text,
      ).toContain(`${windowPresent ? 48 : 28} correct words per minute`);
    },
  );
  it("does not remove within-window hesitation from an unfinished read", () => {
    const g: ReadGrade = {
      wordsAttempted: 28,
      wordsCorrect: 28,
      missed: [],
      annotations: Array.from({ length: 28 }, (_, i) => ({
        word: "word",
        status: "correct",
        accuracy: 95,
        endSeconds: ((i + 1) * 35) / 28,
      })),
    };
    // An unfinished 28-word fragment at 35 seconds, stopped at 72 seconds,
    // is 28 in the first minute. It is NOT a 48 WCPM continuous-reading sample.
    expect(passageRate(g, 72, false)).toEqual({ wordsCorrect: 28, seconds: 60 });
    expect(passageRate(g, 72, true)).toEqual({ wordsCorrect: 28, seconds: 35 });
  });
  it("bounds every word-search branch while retaining all reachable levels", () => {
    let maximum = 0;
    for (const enrolled of [0, 1, 2, 3, 4] as PlacedBand[]) {
      const visit = (responses: SpectrumEvidence["words"]) => {
        const w = wordSearch(enrolled, responses);
        if (!w.next) {
          maximum = Math.max(maximum, responses.length);
          return;
        }
        // Five-response pass and fail patterns maximize each set's length.
        for (const outcomes of [
          [true, false, true, true, true],
          [true, true, true, false, false],
        ]) {
          const next = [...responses];
          for (const correct of outcomes)
            next.push({ itemId: wordSearch(enrolled, next).next!.id, correct });
          visit(next);
        }
      };
      visit([]);
      for (let ceiling = -1; ceiling <= 9; ceiling++)
        expect(
          wordSearch(enrolled, spectrumSubmission(enrolled, ceiling).spectrum!.words).highest,
        ).toBe(ceiling < 0 ? null : ceiling);
    }
    expect(maximum).toBeLessThanOrEqual(WORD_RESPONSE_LIMIT);
  });
  it("stops repeated ambiguous pairs and gives a word caller comprehension work, with no confirmed reading claim", () => {
    const sub = spectrumSubmission(3, 7, 3, 3),
      ev = sub.spectrum!;
    ev.reading = [];
    let r = readingSearch(3, ev.words, ev.reading);
    while (r.next) {
      ev.reading.push(readingTrial(r.next, 1));
      r = readingSearch(3, ev.words, ev.reading);
    }
    expect(ev.reading).toHaveLength(READING_BAND_LIMIT * 2);
    expect(r).toMatchObject({ done: true, confirmed: null, limited: true });
    finishLanguage(3, ev);
    const d = decidePlacement(validatePlacementEvidence(sub, 3));
    const plan = buildPlan({ decision: d, moments: [], today });
    expect(d.spectrum?.readingBand).toBeNull();
    expect(d.placedBand).toBe(3);
    expect(d.relative.label).toContain("provisional");
    expect(d.needs.join(" ")).not.toContain("letters");
    expect(plan.firstUnit).toMatchObject({ grade: "3rd Grade", domain: "Literature" });
    expect(assignedJourneyCatalog(d.readingLevelName, plan)[0]).toMatchObject({
      grade: "3rd Grade",
      domain: plan.firstUnit!.domain,
    });
    expect(
      narrate({ childName: "Maya", decision: d, plan, moments: [], today }).find(
        (n) => n.id === "number",
      )?.text,
    ).toContain("guided reading and discussion");
    expect(d.seeds).toEqual([]);
    expect(d.flags).toContain("placement-needs-followup");
  });
  it("uses varying sound contrasts including other target letters", () => {
    const distractors = Object.entries(LETTER_SOUND_CHOICES).map(([target, options]) => {
      expect(new Set(options).size).toBe(4);
      expect(options.filter((o) => o === target)).toHaveLength(1);
      expect(options.some((o) => o !== target && o in LETTER_SOUND_CHOICES)).toBe(true);
      return options
        .filter((o) => o !== target)
        .sort()
        .join("");
    });
    expect(new Set(distractors).size).toBe(6);
    expect(new Set(Object.entries(LETTER_SOUND_CHOICES).map(([t, o]) => o.indexOf(t))).size).toBe(
      4,
    );
  });
});
