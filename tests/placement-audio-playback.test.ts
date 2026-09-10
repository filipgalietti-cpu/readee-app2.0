import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/audio", () => ({ getAudioUrl: (_category: string, id: string) => id }));
import {
  playUrlAsync,
  playUrlRequired,
  playSeqRequired,
  setFastAudio,
  stopClip,
} from "@/app/(protected)/placement/_components/audio";

class FakeAudio {
  static instances: FakeAudio[] = [];
  duration = 2;
  listeners = new Map<string, () => void>();
  pause = vi.fn();
  play = vi.fn(async () => {});
  constructor(public url: string) {
    FakeAudio.instances.push(this);
  }
  addEventListener(name: string, callback: () => void) {
    this.listeners.set(name, callback);
  }
  emit(name: string) {
    this.listeners.get(name)?.();
  }
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("Audio", FakeAudio);
  FakeAudio.instances = [];
  setFastAudio(false);
});
afterEach(() => {
  stopClip();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("required assessment instructions", () => {
  it("does not accept an instruction that never starts", async () => {
    const result = expect(playUrlRequired("sound", 1000)).rejects.toThrow("audio could not play");
    await vi.advanceTimersByTimeAsync(1000);
    await result;
    expect(FakeAudio.instances[0].pause).toHaveBeenCalled();
  });
  it("does not advance a listening sequence past a missing sound", async () => {
    const result = expect(playSeqRequired(["prompt", "phoneme"])).rejects.toThrow();
    FakeAudio.instances[0].emit("error");
    await result;
    expect(FakeAudio.instances).toHaveLength(1);
  });
  it("lets a playing clip finish beyond the initial load deadline", async () => {
    const done = vi.fn();
    const result = playUrlRequired("sound", 500).then(done);
    FakeAudio.instances[0].emit("playing");
    await vi.advanceTimersByTimeAsync(1000);
    expect(done).not.toHaveBeenCalled();
    FakeAudio.instances[0].emit("ended");
    await result;
    expect(done).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("reports a stalled playing clip instead of accepting silence", async () => {
    const result = expect(playUrlRequired("sound")).rejects.toThrow();
    FakeAudio.instances[0].emit("playing");
    await vi.advanceTimersByTimeAsync(5000);
    await result;
  });
  it("settles and cleans up an interrupted required clip", async () => {
    const result = expect(playUrlRequired("sound")).rejects.toThrow();
    stopClip();
    await result;
    expect(vi.getTimerCount()).toBe(0);
  });
  it("distinguishes changing audio from a missing clip", async () => {
    const first = expect(playUrlRequired("choice-a")).rejects.toMatchObject({
      name: "PlacementAudioCancelled",
    });
    const second = playUrlRequired("choice-b");
    FakeAudio.instances[1].emit("ended");
    await first;
    await expect(second).resolves.toBeUndefined();
  });
  it("keeps optional playback failures nonblocking", async () => {
    const result = playUrlAsync("optional");
    FakeAudio.instances[0].emit("error");
    await expect(result).resolves.toBeUndefined();
  });
});
