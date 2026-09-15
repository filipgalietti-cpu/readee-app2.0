import { describe, expect, it } from "vitest";
import {
  pcmGain,
  pcmQualityProblems,
  ASSESSMENT_PCM,
  type PcmMeasurements,
} from "@/lib/audio/assessment-pcm-quality";
import { pcmReleaseProblems } from "@/lib/audio/assessment-pcm-release";
const measurements: PcmMeasurements = {
  seconds: 5,
  lufs: -19,
  truePeakDb: -3,
  sampleRate: 24000,
  channels: 1,
  codec: "pcm_s16le",
};
describe("assessment audio consistency checks", () => {
  it("uses a constant gain constrained by peak headroom", () => {
    expect(pcmGain(-23, -8)).toBe(4);
    expect(pcmGain(-23, -2)).toBe(-1);
    expect(() => pcmGain(-Infinity, -Infinity)).toThrow();
    expect(ASSESSMENT_PCM.encoding).toBe("pcm_s16le");
  });
  it("rejects wrong delivery formats and uneven levels", () => {
    expect(pcmQualityProblems("Hello there.", measurements)).toEqual([]);
    expect(pcmQualityProblems("Hello there.", { ...measurements, codec: "mp3" })).toContain(
      "inconsistent delivery format",
    );
    expect(pcmQualityProblems("Hello there.", { ...measurements, lufs: -26 })).toContain(
      "uneven loudness",
    );
    expect(pcmQualityProblems("Hello there.", { ...measurements, truePeakDb: 0 })).toContain(
      "insufficient peak headroom",
    );
  });
  it("checks long narration pace without misclassifying an isolated word", () => {
    const script = "Here is a story about a child who planted seeds and watched them grow.";
    expect(pcmQualityProblems(script, { ...measurements, seconds: 3 })).toContain(
      "pace outside assessment delivery range",
    );
    expect(pcmQualityProblems(script, { ...measurements, seconds: 20 })).toContain(
      "pace outside assessment delivery range",
    );
    expect(pcmQualityProblems("Cat.", { ...measurements, seconds: 1 })).toEqual([]);
  });
  it("requires every exact authored script and immutable audio hash; never claims listening approval", () => {
    const input = {
      scripts: { hello: "Hello there." },
      entries: {
        hello: {
          script: "Hello there.",
          sourceHash: "source",
          audioSha256: "audio",
          transcript: "Hello there.",
          measurements,
          gainDb: 0,
          status: "technical-pass",
          listeningReview: "pending",
        },
      },
      sourceHashes: { hello: "source" },
      audioHashes: { hello: "audio" },
    };
    expect(pcmReleaseProblems(input)).toEqual([]);
    expect(input.entries.hello.listeningReview).toBe("pending");
    expect(pcmReleaseProblems({ ...input, entries: {} })).toContain("hello: missing recording");
    expect(pcmReleaseProblems({ ...input, audioHashes: { hello: "changed" } })).toContain(
      "hello: missing or altered audio",
    );
    expect(pcmReleaseProblems({ ...input, sourceHashes: { hello: "changed" } })).toContain(
      "hello: stale script or voice recipe",
    );
    input.entries.hello.transcript = "You are in an office.";
    expect(pcmReleaseProblems(input)).toContain("hello: transcript verification required");
  });
});
