import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as checkpoints from "@/lib/placement/spectrum-checkpoint";
import { checkpointKey, CHECKPOINT_REVISION } from "@/lib/placement/spectrum-checkpoint";
import * as spectrumEngine from "@/lib/placement/spectrum";
import { PLACEMENT_NARRATION } from "@/app/data/placement-bank/narration";
import { spectrumSubmission } from "./fixtures/placement-spectrum";
import { randomUUID } from "node:crypto";
import { spectrumClip } from "@/app/data/placement-spectrum/audio";
import { gradeWord } from "@/lib/placement/read-grade";

/** Exercise the actual callbacks without opening a microphone or starting the
 * exam's effect. The tiny hook host keeps refs and captures state setters. */
function runner(
  listen: (...args: any[]) => Promise<any> = async () => {
    throw new Error("offline");
  },
  options: {
    robot?: boolean;
    childId?: string;
    enrolled?: number;
    saved?: Record<string, string>;
  } = {},
) {
  const states: unknown[] = [];
  const fetch = vi.fn();
  const push = vi.fn();
  const values = new Map(Object.entries(options.saved ?? {}));
  const storage = {
    removeItem: vi.fn((key: string) => values.delete(key)),
    getItem: (key: string) => values.get(key) ?? null,
    setItem: vi.fn((key: string, value: string) => values.set(key, value)),
  };
  const effects: (() => (() => void) | undefined)[] = [];
  const hooks = {
    useEffect: (effect: () => (() => void) | undefined) => effects.push(effect),
    useCallback: (fn: unknown) => fn,
    useRef: (v: unknown) => ({ current: v }),
    useState: (v: unknown) => [v, (next: unknown) => states.push(next)],
  };
  const box: Record<string, any> = {
    module: { exports: {} },
    console,
    crypto: { randomUUID },
    setTimeout,
    clearTimeout,
    Date,
    Promise,
    window: { setTimeout, clearTimeout },
    fetch,
    AbortSignal,
    sessionStorage: storage,
    require: (s: string) =>
      s === "react"
        ? hooks
        : s === "next/navigation"
          ? { useRouter: () => ({ push }) }
          : s === "./audio"
            ? {
                stopClip: vi.fn(),
                playUrlRequired: async () => {},
                playNarrRequired: async () => {},
                setFastAudio: () => {},
                childAudioUrl: async () => null,
                clipUrl: (s: string) => s,
                softTick: () => {},
              }
            : s === "./mic"
              ? { usePlacementMic: () => ({ listen, close: vi.fn(), open: async () => "open" }) }
              : s === "@/lib/observability/critical"
                ? { reportFailure: vi.fn() }
                : s === "@/lib/placement/read-grade"
                  ? { gradeWord }
                  : s === "@/lib/placement/spectrum-checkpoint"
                    ? checkpoints
                    : s === "@/app/data/placement-spectrum/audio"
                      ? { spectrumClip }
                      : s === "@/lib/placement/spectrum"
                        ? spectrumEngine
                        : s === "@/app/data/placement-bank/narration"
                          ? { PLACEMENT_NARRATION }
                          : s === "@/lib/analytics/funnel"
                            ? { trackFunnelClient: vi.fn() }
                            : {},
  };
  box.exports = box.module.exports;
  box.globalThis = box;
  const source = readFileSync(
    "app/(protected)/placement/_components/PlacementRunner.tsx",
    "utf8",
  ).replace(
    "  // ───────────────────────────────────────────────── render",
    "  globalThis.callbacks = { listenWordOnce, listenWord, askTiles, tap, skip: () => skipRef.current?.(), saveSubmission, setSubmission: (s) => { submissionRef.current = s; } }; return null;\n  // ───────────────────────────────────────────────── render",
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
    childId: "child",
    childName: "Reader",
    enrolled: 2,
    outfitId: null,
    ...options,
  });
  return { ...box.callbacks, fetch, push, states, storage, start: () => effects[0]() };
}

describe("placement runner recovery", () => {
  afterEach(() => vi.useRealTimers());
  it("keeps six seconds of silence unmeasured, and clears the skip callback", async () => {
    vi.useFakeTimers();
    const stop = vi.fn(async () => {});
    const r = runner(async () => ({ stop }));
    const outcome = expect(r.listenWordOnce("cat")).rejects.toThrow("No speech captured");
    await vi.advanceTimersByTimeAsync(6000);
    await outcome;
    expect(stop).toHaveBeenCalledOnce();
    expect(() => r.skip()).not.toThrow();
  });
  it("offers a child-facing retry on first silence without scoring it", async () => {
    vi.useFakeTimers();
    let attempt = 0;
    const r = runner(async (_word, phrase) => {
      if (++attempt === 2)
        phrase({ text: "cat", words: [{ word: "cat", accuracy: 95, errorType: "None" }] });
      return { stop: async () => {} };
    });
    const result = r.listenWord("cat");
    await vi.advanceTimersByTimeAsync(6000);
    expect(r.states).toContainEqual({ kind: "hesitation" });
    expect(r.states).not.toContainEqual({ kind: "recovery" });
    r.tap("retry");
    expect(await result).toBe(true);
    expect(attempt).toBe(2);
  });
  it("allows an explicit I-don't-know from the hesitation screen", async () => {
    vi.useFakeTimers();
    const r = runner(async () => ({ stop: async () => {} }));
    const result = r.listenWord("cat");
    await vi.advanceTimersByTimeAsync(6000);
    r.tap("pass");
    expect(await result).toBe(false);
  });
  it("escalates repeated silence, then retries the same word after microphone recovery", async () => {
    vi.useFakeTimers();
    let attempt = 0;
    const r = runner(async (_word, phrase) => {
      if (++attempt === 3)
        phrase({ text: "cat", words: [{ word: "cat", accuracy: 95, errorType: "None" }] });
      return { stop: async () => {} };
    });
    const result = r.listenWord("cat");
    await vi.advanceTimersByTimeAsync(6000);
    r.tap("retry");
    await vi.advanceTimersByTimeAsync(6000);
    expect(r.states).toContainEqual({ kind: "recovery" });
    r.tap("retry");
    expect(await result).toBe(true);
  });
  it("does not turn an omission-only response into a wrong answer", async () => {
    vi.useFakeTimers();
    const r = runner(async (_word, phrase) => {
      phrase({ text: "", words: [{ word: "cat", accuracy: 0, errorType: "Omission" }] });
      return { stop: async () => {} };
    });
    const outcome = expect(r.listenWordOnce("cat")).rejects.toThrow();
    await vi.advanceTimersByTimeAsync(6000);
    await outcome;
  });
  it("accepts a final phrase delivered while stopping at the timeout", async () => {
    vi.useFakeTimers();
    const stop = vi.fn();
    const r = runner(async (_word, phrase) => {
      stop.mockImplementation(async () =>
        phrase({ text: "cat", words: [{ word: "cat", accuracy: 95, errorType: "None" }] }),
      );
      return { stop };
    });
    const outcome = r.listenWordOnce("cat");
    await vi.advanceTimersByTimeAsync(6000);
    expect(await outcome).toBe(true);
    expect(stop).toHaveBeenCalledOnce();
  });
  it("recovers when the recognizer never finishes draining", async () => {
    vi.useFakeTimers();
    const r = runner(async () => ({ stop: () => new Promise(() => {}) }));
    const outcome = expect(r.listenWordOnce("cat")).rejects.toThrow();
    await vi.advanceTimersByTimeAsync(10000);
    await outcome;
  });
  it.each([
    { text: "cat", words: [{ word: "cat", accuracy: 20, errorType: "Mispronunciation" }] },
    { text: "I don't know", words: [] },
  ])("scores an actual response as incorrect: $text", async (response) => {
    const r = runner(async (_word, phrase) => {
      phrase(response);
      return { stop: async () => {} };
    });
    expect(await r.listenWordOnce("cat")).toBe(false);
  });
  it("still allows an intentional tap to skip", async () => {
    const r = runner(async () => ({ stop: async () => {} }));
    const outcome = r.listenWordOnce("cat");
    r.skip();
    expect(await outcome).toBe(false);
  });
  it("rejects recognition failure instead of returning an incorrect verdict", async () => {
    await expect(runner().listenWordOnce("ship")).rejects.toThrow();
  });
  it("measures oral blending without displaying its reference word", async () => {
    const listen = vi.fn(async (_word, phrase) => {
      phrase({ text: "map", words: [{ word: "map", accuracy: 95, errorType: "None" }] });
      return { stop: async () => {} };
    });
    const r = runner(listen);
    expect(await r.listenWordOnce("map", false, undefined, "Say the word")).toBe(true);
    expect(listen.mock.calls[0][0]).toBe("map");
    const screens = r.states.filter((s: any) => s?.kind === "word");
    expect(screens.length).toBeGreaterThan(0);
    expect(screens.every((s: any) => s.oral && s.word !== "map")).toBe(true);
  });
  it("retains a foundation answer tapped during narration", async () => {
    const r = runner();
    let finishAudio!: () => void;
    const audio = new Promise<void>((resolve) => {
      finishAudio = resolve;
    });
    const answer = r.askTiles("Which letter?", ["a", "b"], () => audio);
    r.tap("a");
    finishAudio();
    expect(await answer).toBe("a");
  });
  it("retains the completed submission after a network failure and retries identical evidence", async () => {
    const r = runner();
    const submission = { childId: "child", sessionId: "stable-session" };
    r.setSubmission(submission);
    r.fetch.mockRejectedValueOnce(new Error("offline"));
    await r.saveSubmission();
    expect(r.push).not.toHaveBeenCalled();
    expect(r.storage.removeItem).not.toHaveBeenCalled();
    r.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
    await r.saveSubmission();
    expect(r.fetch.mock.calls[0][1].body).toBe(r.fetch.mock.calls[1][1].body);
    expect(r.push).toHaveBeenCalledWith("/placement/reveal?child=child");
    expect(r.storage.removeItem).toHaveBeenCalledWith(checkpointKey("child"));
  });
  it("resumes the actual runner between comprehension questions and saves the same session once", async () => {
    vi.useFakeTimers();
    const sub = spectrumSubmission();
    const ev = structuredClone(sub.spectrum!);
    const activeReading = ev.reading.pop()!;
    activeReading.choices = activeReading.choices.slice(0, 1);
    ev.language = [];
    const checkpoint = {
      revision: CHECKPOINT_REVISION,
      childId: sub.childId,
      enrolled: sub.enrolled,
      sessionId: sub.sessionId,
      savedAt: Date.now(),
      elapsedSeconds: 123,
      spectrum: ev,
      activeReading,
    };
    const r = runner(undefined, {
      robot: true,
      childId: sub.childId,
      enrolled: sub.enrolled,
      saved: { [checkpointKey(sub.childId)]: JSON.stringify(checkpoint) },
    });
    r.fetch.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    const cleanup = r.start();
    const questions: string[] = [];
    const words: string[] = [];
    const seen = new Set<unknown>();
    for (let turn = 0; turn < 80 && !r.push.mock.calls.length; turn++) {
      await vi.advanceTimersByTimeAsync(1000);
      const screen = r.states
        .filter((s: any) => s && typeof s === "object" && "kind" in s)
        .at(-1) as any;
      if (!screen || seen.has(screen)) continue;
      seen.add(screen);
      if (screen.kind === "word") {
        words.push(screen.word);
        r.tap("correct");
      }
      if (screen.kind === "question" && screen.picked === null) {
        questions.push(screen.qid);
        r.tap(screen.correctId);
      }
    }
    cleanup?.();
    expect(words).toEqual(["sun"]); // unscored microphone recognition check only
    expect(questions[0]).toBe(sub.spectrum!.reading.at(-1)!.choices[1].itemId);
    expect(questions).not.toContain(sub.spectrum!.reading.at(-1)!.choices[0].itemId);
    expect(r.fetch).toHaveBeenCalledOnce();
    const sent = JSON.parse(r.fetch.mock.calls[0][1].body);
    expect(sent.sessionId).toBe(sub.sessionId);
    expect(sent.spectrum).toEqual(sub.spectrum);
    expect(sent.durationSeconds).toBeGreaterThanOrEqual(123);
    expect(r.storage.setItem.mock.calls.length).toBeGreaterThanOrEqual(12);
    expect(r.storage.getItem(checkpointKey(sub.childId))).toBeNull();
    expect(r.push).toHaveBeenCalledWith(`/placement/reveal?child=${sub.childId}`);
  });
  it("does not submit twice while a save is in flight", async () => {
    const r = runner();
    r.setSubmission({ childId: "child" });
    let resolve!: (value: unknown) => void;
    r.fetch.mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const first = r.saveSubmission();
    await r.saveSubmission();
    expect(r.fetch).toHaveBeenCalledOnce();
    resolve({ ok: true, json: async () => ({ ok: true }) });
    await first;
  });
});
