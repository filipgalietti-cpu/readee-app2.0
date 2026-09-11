import { describe, expect, it, vi } from "vitest";
import { captureNameTurn } from "@/lib/placement/name-turn";

async function capture(voice: (ms: number) => number, action: (ms: number) => string | null = () => null, cancelAt = Infinity, blob: Blob | null = new Blob(["voice"])) {
  let now = 0;
  const startRecording = vi.fn();
  const stopRecording = vi.fn(() => blob);
  const result = await captureNameTurn({ level: () => voice(now), startRecording, stopRecording },
    () => action(now), () => now >= cancelAt,
    { now: () => now, wait: async (ms) => { now += ms; } });
  expect(startRecording).toHaveBeenCalledTimes(1);
  expect(stopRecording).toHaveBeenCalledTimes(1);
  return { result, elapsed: now };
}

describe("optional name turn on the shared assessment microphone", () => {
  it("waits through thinking time and finishes after the whole name, not its first sound", async () => {
    const { result, elapsed } = await capture(ms => ms >= 9000 && ms < 13000 ? 0.3 : 0);
    expect(result.kind).toBe("recorded");
    expect(elapsed).toBeGreaterThanOrEqual(14700);
    expect(elapsed).toBeLessThan(15500);
  });
  it("offers an unscored retry after silence, a click, or continuous noise", async () => {
    for (const voice of [() => 0, (ms: number) => ms === 0 ? 0.3 : 0, () => 0.3]) {
      expect(await capture(voice)).toEqual({ result: { kind: "quiet" }, elapsed: 30000 });
    }
  });
  it("lets Done speaking finish a name but never uploads silence", async () => {
    const done = (ms: number) => ms >= 1000 ? "done" : null;
    expect((await capture(() => 0.3, done)).result.kind).toBe("recorded");
    expect((await capture(() => 0, done)).result.kind).toBe("quiet");
    expect((await capture(() => 0.3, done, Infinity, null)).result.kind).toBe("quiet");
  });
  it("discards partial recordings on skip or navigation", async () => {
    expect((await capture(() => 0.3, ms => ms >= 500 ? "skip" : null)).result.kind).toBe("skip");
    expect((await capture(() => 0.3, () => null, 500)).result.kind).toBe("cancelled");
  });
});
