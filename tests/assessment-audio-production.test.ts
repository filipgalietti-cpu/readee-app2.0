import { afterEach, expect, it, vi } from "vitest";
import review from "@/app/data/placement-spectrum/pcm-review-state.json";
import { spectrumClip } from "@/app/data/placement-spectrum/audio";

afterEach(() => { review.ready = true; vi.unstubAllEnvs(); });
it("ships the complete PCM release and exact selected takes in production", () => {
  vi.stubEnv("NODE_ENV", "production");
  expect(spectrumClip("hi-generic")).toBe("/audio/assessment-voice/autonoe-pcm-reading-v2/hi-generic.wav");
  expect(spectrumClip("narr-mic-check")).toBe("/audio/assessment-voice/autonoe-pcm-reading-v2/narr-mic-check.wav");
  for (const id of ["q-g1-q1", "q-g1-q2"])
    expect(spectrumClip(id)).toBe(`/audio/assessment-voice/autonoe-pcm-reviewed-v1/${id}.wav`);
  expect(spectrumClip("q-g1-q3")).toBe("/audio/assessment-voice/autonoe-pcm-reading-v2/q-g1-q3.wav");
});
it("retains the prior assets when the complete release is disabled", () => {
  review.ready = false;
  expect(spectrumClip("q-g1-q1")).toBe("/audio/placement-spectrum/q-g1-q1.mp3");
  expect(spectrumClip("hi-generic")).toContain("placement/narr-hi-generic.mp3");
});
