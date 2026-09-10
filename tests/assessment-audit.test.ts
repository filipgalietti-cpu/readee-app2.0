import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PLACEMENT_BANK } from "@/app/data/placement-bank";
import * as bank from "@/lib/placement/bank";
import * as grader from "@/lib/placement/read-grade";
import {
  activeList,
  createLadder,
  needsFoundations,
  recordWord,
  type PlacedBand,
} from "@/lib/placement/ladder";
import { validatePlacementEvidence } from "@/lib/placement/validate-evidence";
import { decidePlacement } from "@/lib/placement/decide";
import { buildPlan } from "@/lib/placement/plan";
import { computeJourneyProgress } from "@/lib/journey/next-lesson";
import { completedSubmission } from "./fixtures/placement-submission";

describe("assessment audit: enrollment to reading level to journey", () => {
  it("requires follow-ups instead of assuming one grade lower is comfortable", () => {
    const sub = completedSubmission(4);
    sub.evidenceVersion = 3;
    sub.passages[0] = {
      band: 4,
      wordsCorrect: 20,
      wordsTotal: 100,
      durationSeconds: 60,
      minuteWordsCorrect: 20,
      minuteSeconds: 60,
    };
    sub.comprehension!.correct = 0;
    sub.comprehensionChecks = [sub.comprehension!];
    expect(() => validatePlacementEvidence(sub, 4)).toThrow();
  });
  for (const enrolled of [0, 1, 2, 3, 4] as const) {
    for (const reading of [0, 1, 2, 3, 4] as const) {
      it(`enrolled ${enrolled}, reads at ${reading}: bank-valid evidence reaches the matching journey`, () => {
        const sub = completedSubmission(enrolled);
        sub.evidenceVersion = 3;
        let ladder = createLadder(enrolled);
        while (!ladder.done) {
          const list = activeList(ladder)!;
          ladder = recordWord(
            ladder,
            PLACEMENT_BANK.bands[list.band].words[list.attempts.length].word,
            list.band <= reading,
          );
        }
        sub.ladder = ladder;
        sub.passages =
          reading === 0
            ? []
            : [reading].map((band) => ({
                band: band as PlacedBand,
                wordsCorrect: 70,
                wordsTotal: 72,
                durationSeconds: 60,
                minuteWordsCorrect: 70,
                minuteSeconds: 60,
              }));
        sub.comprehension = { band: reading, correct: 2, total: reading === 0 ? 2 : 3 };
        sub.comprehensionChecks = reading === 0 ? [] : [sub.comprehension];
        const f = PLACEMENT_BANK.foundations;
        sub.foundations = needsFoundations(ladder)
          ? {
              letterSounds: { correct: f.letterSounds.length, total: f.letterSounds.length },
              blending: { correct: f.blending.length, total: f.blending.length },
              nonsenseWords: { correct: f.nonsenseWords.length, total: f.nonsenseWords.length },
            }
          : null;
        const validated = validatePlacementEvidence(sub, enrolled);
        const date = new Date("2026-09-08T12:00:00Z");
        const decision = decidePlacement({ ...validated, date });
        const plan = buildPlan({ decision, moments: validated.moments, today: date });
        const journey = computeJourneyProgress({
          readingLevel: decision.readingLevelName,
          placement: plan,
          practice: [],
          lessonProgress: [],
        });
        expect(decision.placedBand).toBe(reading);
        expect(decision.relative.delta).toBe(enrolled - reading);
        expect(journey.current?.grade).toBe(plan.firstUnit?.grade);
        expect(journey.current?.domain).toBe(plan.firstUnit?.domain);
        expect(plan.entryBand).toBe(reading);
      });
    }
  }
});

describe("assessment audit: recognition timing", () => {
  afterEach(() => vi.useRealTimers());
  it.each(["delayed speech", "silence", "stalled stop"])(
    "handles passage capture: %s",
    async (mode) => {
      vi.useFakeTimers();
      const text = PLACEMENT_BANK.bands[2].passage!.text;
      const words = text
        .split(/\s+/)
        .slice(0, 70)
        .map((word, i) => ({
          word,
          accuracy: 100,
          errorType: "None",
          phonemeMin: 100,
          worst: "",
          offsetSeconds: i * 0.8,
          durationSeconds: 0.5,
        }));
      // Model 70 correctly spoken words whose finalized recognition arrives at 61s.
      const mic = {
        level: mode === "delayed speech" ? 0.3 : 0,
        listen: async (_text: string, onPhrase: (p: unknown) => void) => {
          if (mode === "delayed speech") setTimeout(() => onPhrase({ words }), 61000);
          return {
            stop: async () => (mode === "stalled stop" ? new Promise<void>(() => {}) : undefined),
          };
        },
        startRecording: () => {},
        stopRecording: () => null,
      };
      const hooks = {
        useEffect: () => {},
        useCallback: (fn: unknown) => fn,
        useRef: (v: unknown) => ({ current: v }),
        useState: (v: unknown) => [v, () => {}],
      };
      const box: Record<string, any> = {
        module: { exports: {} },
        console,
        Date,
        Promise,
        setTimeout,
        clearTimeout,
        window: { setTimeout, clearTimeout, setInterval, clearInterval },
        require: (s: string) =>
          s === "react"
            ? hooks
            : s === "next/navigation"
              ? { useRouter: () => ({}) }
              : s === "./mic"
                ? { usePlacementMic: () => mic }
                : s === "./audio"
                  ? {
                      playUrlRequired: async () => {},
                      playNarrRequired: async () => {},
                      clipUrl: () => "",
                    }
                  : s === "@/app/data/placement-bank"
                    ? { PLACEMENT_BANK }
                    : s === "@/lib/placement/bank"
                      ? bank
                      : s === "@/lib/placement/read-grade"
                        ? grader
                        : {},
      };
      box.exports = box.module.exports;
      box.globalThis = box;
      const source = readFileSync(
        "app/(protected)/placement/_components/PlacementRunner.tsx",
        "utf8",
      ).replace(
        "  // ───────────────────────────────────────────────── render",
        "  globalThis.readPassageOnce = readPassageOnce; globalThis.finishReading = () => finishRef.current?.(); return null;\n  // ───────────────────────────────────────────────── render",
      );
      vm.runInNewContext(
        ts.transpileModule(source, {
          compilerOptions: {
            jsx: ts.JsxEmit.ReactJSX,
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2020,
          },
        }).outputText,
        box,
      );
      box.module.exports.default({
        childId: "audit",
        childName: "Reader",
        enrolled: 4,
        outfitId: null,
      });
      const result = box.readPassageOnce(2);
      if (mode !== "delayed speech") {
        const failure = expect(result).rejects.toThrow(
          mode === "silence" ? "No reading was captured" : "did not finish",
        );
        await vi.advanceTimersByTimeAsync(mode === "silence" ? 30000 : 34000);
        await failure;
        return;
      }
      await vi.advanceTimersByTimeAsync(80000);
      box.finishReading();
      const { ev } = await result;
      expect(ev.wordsCorrect).toBe(70);
      expect(ev.minuteWordsCorrect).toBe(70);
      expect(ev.minuteSeconds).toBe(60);
    },
  );
});
