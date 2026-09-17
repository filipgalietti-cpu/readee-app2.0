import { describe, expect, it, vi } from "vitest";
import { scheduleJourneyMagic, scheduleJourneyRevealSteps } from "@/lib/audio/journey-magic";
import { JOURNEY_REVEAL_STEP_SECONDS, journeyRevealDurationMs } from "@/lib/journey/reveal-timing";

function audioContext(state = "running") {
  const voices: Array<{ start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> }> = [];
  const gains: Array<{ disconnect: ReturnType<typeof vi.fn> }> = [];
  const context = {
    state,
    currentTime: 10,
    destination: {},
    createGain: vi.fn(() => {
      const gain = {
        gain: {
          value: 0,
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
      gains.push(gain);
      return gain;
    }),
    createOscillator: vi.fn(() => {
      const voice = {
        frequency: { value: 0 },
        type: "",
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        onended: null,
      };
      voices.push(voice);
      return voice;
    }),
  };
  return { context: context as unknown as AudioContext, voices, gains };
}

describe("Journey magician sound", () => {
  it("anchors the wand and ta-da to the actual CSS routine start", () => {
    const { context, voices } = audioContext();
    scheduleJourneyMagic(context);
    expect(voices).toHaveLength(11);
    expect(voices[0].start).toHaveBeenCalledWith(11.92);
    expect(voices[5].start).toHaveBeenCalledWith(14.5);
    expect(voices[10].stop).toHaveBeenCalledWith(15.72);
  });
  it("cancels every scheduled voice on skip, mute, or unmount", () => {
    const { context, voices, gains } = audioContext();
    const cancel = scheduleJourneyMagic(context);
    cancel();
    expect(gains[0].disconnect).toHaveBeenCalledOnce();
    voices.forEach((voice) => expect(voice.stop).toHaveBeenLastCalledWith());
  });
  it("does not queue surprise sounds in a browser that blocked autoplay", () => {
    const { context, voices } = audioContext("suspended");
    scheduleJourneyMagic(context)();
    expect(voices).toHaveLength(0);
  });
});

describe("Journey destination reveal sound", () => {
  it("shares one cadence across compact chapters and a complete nine-stop unit", () => {
    expect(JOURNEY_REVEAL_STEP_SECONDS).toBe(0.32);
    expect(journeyRevealDurationMs(6)).toBe(3200);
    expect(journeyRevealDurationMs(12)).toBe(4220);
  });

  it("marks every revealed destination and ends with a small chord", () => {
    const { context, voices } = audioContext();
    scheduleJourneyRevealSteps(context, 4);
    expect(voices).toHaveLength(6);
    expect(voices[0].start).toHaveBeenCalledWith(10.08);
    expect(voices[1].start).toHaveBeenCalledWith(10.4);
    expect(voices[3].start).toHaveBeenCalledWith(11.04);
    expect(voices[5].start).toHaveBeenCalledWith(11.12);
  });

  it("cancels all map-reveal voices and stays silent when autoplay is blocked", () => {
    const running = audioContext();
    const cancel = scheduleJourneyRevealSteps(running.context, 3);
    cancel();
    running.voices.forEach((voice) => expect(voice.stop).toHaveBeenLastCalledWith());
    const suspended = audioContext("suspended");
    scheduleJourneyRevealSteps(suspended.context, 9)();
    expect(suspended.voices).toHaveLength(0);
  });
});
