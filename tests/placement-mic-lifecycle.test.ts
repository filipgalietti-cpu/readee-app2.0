import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("react", () => ({
  useCallback: (fn: unknown) => fn,
  useEffect: () => {},
  useRef: (value: unknown) => ({ current: value }),
  useState: (value: unknown) => [value, vi.fn()],
}));
vi.mock("@/app/(protected)/luna/_components/azure-stream", () => ({
  startPronAssessment: vi.fn(),
}));
import { usePlacementMic } from "@/app/(protected)/placement/_components/mic";

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      json: async () => ({ ok: true, token: "synthetic", region: "test" }),
    })),
  );
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const stream = () => {
  const stop = vi.fn();
  const track = { stop, addEventListener: vi.fn() };
  return { stop, value: { getTracks: () => [track], getAudioTracks: () => [track] } };
};

describe("microphone acquisition cleanup", () => {
  it("closes a late permission grant after leaving the assessment", async () => {
    let grant!: (s: unknown) => void;
    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: () =>
          new Promise((resolve) => {
            grant = resolve;
          }),
      },
    });
    const mic = usePlacementMic();
    const result = mic.open();
    await vi.advanceTimersByTimeAsync(0);
    mic.close();
    const late = stream();
    grant(late.value);
    expect(await result).toBe("closed");
    expect(late.stop).toHaveBeenCalled();
  });
  it("bounds unanswered permission prompts and stops a later stream", async () => {
    let grant!: (s: unknown) => void;
    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: () =>
          new Promise((resolve) => {
            grant = resolve;
          }),
      },
    });
    const mic = usePlacementMic();
    const result = mic.open();
    await vi.advanceTimersByTimeAsync(15000);
    expect(await result).toBe("unavailable");
    const late = stream();
    grant(late.value);
    await vi.advanceTimersByTimeAsync(0);
    expect(late.stop).toHaveBeenCalled();
  });
  it("stops the acquired stream if audio setup fails", async () => {
    const acquired = stream();
    vi.stubGlobal("navigator", { mediaDevices: { getUserMedia: async () => acquired.value } });
    vi.stubGlobal(
      "AudioContext",
      class {
        constructor() {
          throw new Error("Device lost");
        }
      },
    );
    expect(await usePlacementMic().open()).toBe("unavailable");
    expect(acquired.stop).toHaveBeenCalled();
  });
  it("distinguishes a denied permission from an unavailable device", async () => {
    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: async () => {
          throw new DOMException("Denied", "NotAllowedError");
        },
      },
    });
    expect(await usePlacementMic().open()).toBe("denied");
  });
});
