import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ generate: vi.fn(), transcribe: vi.fn() }));
vi.mock("@/lib/audio/readee-speech", () => ({ generateReadeeSpeech: mocks.generate }));
vi.mock("@/lib/ai/transcribe", () => ({ transcribeAudio: mocks.transcribe }));
import { generateVerifiedSpeech, verifySpeech } from "@/lib/audio/verified-speech";
import { mp3DurationSeconds } from "@/lib/audio/mp3-duration";
function mp3(frames: number) {
  const frame = Buffer.alloc(96);
  frame.set([255, 243, 68, 0]);
  return Buffer.concat(Array.from({ length: frames }, () => frame));
}
beforeEach(() => {
  vi.clearAllMocks();
});
it("measures all MPEG frames, rejecting an excessive tail before transcription", async () => {
  const long = mp3(1400);
  expect(mp3DurationSeconds(long)).toBeCloseTo(33.6);
  expect(await verifySpeech(long, "Your reading journey is ready.")).toBe(false);
  expect(mocks.transcribe).not.toHaveBeenCalled();
});
it("never returns audio with an invented sentence even if synthesis succeeded", async () => {
  mocks.generate.mockResolvedValue(mp3(200));
  mocks.transcribe.mockResolvedValue({
    ok: true,
    transcript: "Your reading journey is ready. You are in your office.",
  });
  await expect(generateVerifiedSpeech("Your reading journey is ready.")).rejects.toThrow(
    "did not match",
  );
  expect(mocks.generate).toHaveBeenCalledTimes(2);
});
it("retries mismatched speech and only returns the verified replacement", async () => {
  mocks.generate.mockResolvedValue(mp3(200));
  mocks.transcribe
    .mockResolvedValueOnce({ ok: true, transcript: "In your office." })
    .mockResolvedValueOnce({ ok: true, transcript: "Your reading journey is ready." });
  await expect(generateVerifiedSpeech("Your reading journey is ready.")).resolves.toBeInstanceOf(
    Buffer,
  );
  expect(mocks.generate).toHaveBeenCalledTimes(2);
});
it("fails closed for invalid audio", async () => {
  expect(await verifySpeech(Buffer.from("not mp3"), "Hello")).toBe(false);
});
