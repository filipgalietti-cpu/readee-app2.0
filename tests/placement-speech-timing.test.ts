import { expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ recognizer: null as any }));
vi.mock("microsoft-cognitiveservices-speech-sdk", () => ({
  SpeechConfig: { fromAuthorizationToken: () => ({ setProperty: () => {} }) },
  PropertyId: {},
  AudioStreamFormat: { getWaveFormatPCM: () => ({}) },
  AudioInputStream: { createPushStream: () => ({ write: () => {}, close: () => {} }) },
  AudioConfig: { fromStreamInput: () => ({}) },
  SpeechRecognizer: class {
    constructor() { mock.recognizer = this; }
    startContinuousRecognitionAsync(cb: () => void) { cb(); }
    stopContinuousRecognitionAsync(cb: () => void) { cb(); }
    close() {}
  },
  PronunciationAssessmentConfig: class { applyTo() {} },
  PronunciationAssessmentGradingSystem: {}, PronunciationAssessmentGranularity: {},
  PronunciationAssessmentResult: { fromResult: (r: unknown) => r },
  ResultReason: { RecognizedSpeech: 3 },
}));
import { startPronAssessment, type PAPhrase } from "@/app/(protected)/luna/_components/azure-stream";
import { gradeRead, passageRate } from "@/lib/placement/read-grade";

it("preserves Azure word offsets through the adapter into the one-minute scorer", async () => {
  const phrases: PAPhrase[] = [];
  const ctrl = await startPronAssessment({ token: "synthetic", region: "synthetic", referenceText: "one two", onPhrase: p => phrases.push(p) });
  mock.recognizer.recognized(null, { result: { reason: 3, text: "one two", detailResult: { Words: [
    { Word: "one", Offset: 590_000_000, Duration: 5_000_000, PronunciationAssessment: { AccuracyScore: 95, ErrorType: "None" } },
    { Word: "two", Offset: 610_000_000, Duration: 5_000_000, PronunciationAssessment: { AccuracyScore: 95, ErrorType: "None" } },
  ] } } });
  await ctrl.stop();
  expect(phrases[0].words[0].offsetSeconds).toBe(59);
  expect(phrases[0].words[0].durationSeconds).toBe(0.5);
  expect(passageRate(gradeRead("one two", phrases.map(p => p.words)), 70, false)).toEqual({ wordsCorrect: 1, seconds: 60 });
});
