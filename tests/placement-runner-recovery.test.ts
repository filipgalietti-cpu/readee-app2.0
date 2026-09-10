import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { afterEach, describe, expect, it, vi } from "vitest";

import { gradeWord } from "@/lib/placement/read-grade";

/** Exercise the actual callbacks without opening a microphone or starting the
 * exam's effect. The tiny hook host keeps refs and captures state setters. */
function runner(listen: (...args: any[]) => Promise<any> = async () => { throw new Error("offline"); }) {
  const states: unknown[] = [];
  const fetch = vi.fn();
  const push = vi.fn();
  const storage = { removeItem: vi.fn() };
  const hooks = { useEffect: () => {}, useCallback: (fn: unknown) => fn, useRef: (v: unknown) => ({ current: v }), useState: (v: unknown) => [v, (next: unknown) => states.push(next)] };
  const box: Record<string, any> = {
    module: { exports: {} }, console, setTimeout, clearTimeout, Date, Promise,
    window: { setTimeout, clearTimeout }, fetch, AbortSignal, sessionStorage: storage,
    require: (s: string) => s === "react" ? hooks : s === "next/navigation" ? { useRouter: () => ({ push }) } : s === "./audio" ? { stopClip: vi.fn() } : s === "./mic" ? { usePlacementMic: () => ({ listen }) } : s === "@/lib/observability/critical" ? { reportFailure: vi.fn() } : s === "@/lib/placement/read-grade" ? { gradeWord } : {},
  };
  box.exports = box.module.exports;
  box.globalThis = box;
  const source = readFileSync("app/(protected)/placement/_components/PlacementRunner.tsx", "utf8").replace(
    "  // ───────────────────────────────────────────────── render",
    "  globalThis.callbacks = { listenWordOnce, askTiles, tap, skip: () => skipRef.current?.(), saveSubmission, setSubmission: (s) => { submissionRef.current = s; } }; return null;\n  // ───────────────────────────────────────────────── render",
  );
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, box);
  box.module.exports.default({ childId: "child", childName: "Reader", enrolled: 2, outfitId: null });
  return { ...box.callbacks, fetch, push, states, storage };
}

describe("placement runner recovery", () => {
  afterEach(() => vi.useRealTimers());
  it("keeps six seconds of silence unmeasured, and clears the skip callback", async () => {
    vi.useFakeTimers();
    const stop = vi.fn(async () => {});
    const r = runner(async () => ({ stop }));
    const outcome = expect(r.listenWordOnce("cat")).rejects.toThrow("Recognition failed");
    await vi.advanceTimersByTimeAsync(6000);
    await outcome;
    expect(stop).toHaveBeenCalledOnce();
    expect(() => r.skip()).not.toThrow();
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
      stop.mockImplementation(async () => phrase({ text: "cat", words: [{ word: "cat", accuracy: 95, errorType: "None" }] }));
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
    const r = runner(async (_word, phrase) => { phrase(response); return { stop: async () => {} }; });
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
  it("retains a foundation answer tapped during narration", async () => {
    const r = runner();
    let finishAudio!: () => void;
    const audio = new Promise<void>((resolve) => { finishAudio = resolve; });
    const answer = r.askTiles("Which letter?", ["a", "b"], () => audio);
    r.tap("a"); finishAudio();
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
    expect(r.storage.removeItem).toHaveBeenCalledOnce();
  });
  it("does not submit twice while a save is in flight", async () => {
    const r = runner(); r.setSubmission({ childId: "child" });
    let resolve!: (value: unknown) => void;
    r.fetch.mockImplementation(() => new Promise((done) => { resolve = done; }));
    const first = r.saveSubmission(); await r.saveSubmission();
    expect(r.fetch).toHaveBeenCalledOnce();
    resolve({ ok: true, json: async () => ({ ok: true }) });
    await first;
  });
});
