import { mp3DurationSeconds } from "./mp3-duration";
import { generateReadeeSpeech } from "./readee-speech";
import { transcribeAudio } from "@/lib/ai/transcribe";

const small = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];
const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
function numberWords(n: number): string {
  if (n < 20) return small[n];
  if (n < 100) return `${tens[Math.floor(n / 10)]} ${n % 10 ? small[n % 10] : ""}`;
  if (n < 1000)
    return `${small[Math.floor(n / 100)]} hundred ${n % 100 ? numberWords(n % 100) : ""}`;
  return String(n);
}
function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(
      /\b(\d)(?:st|nd|rd|th)\b/g,
      (_, n) =>
        [
          "zeroth",
          "first",
          "second",
          "third",
          "fourth",
          "fifth",
          "sixth",
          "seventh",
          "eighth",
          "ninth",
        ][Number(n)],
    )
    .replace(/\b\d{1,3}\b/g, (n) => numberWords(Number(n)))
    .replace(/\b(?:can't)\b/g, "cannot")
    .replace(/\bdon't\b/g, "do not")
    .replace(/\bit's\b/g, "it is")
    .replace(/\byou're\b/g, "you are")
    .replace(/\bthat's\b/g, "that is")
    .replace(/\blet's\b/g, "let us")
    .replace(/\bhundred and\b/g, "hundred")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}
/** Require the authored words in order. Only the supplied proper name may differ in ASR spelling. */
export function speechMatchesScript(
  script: string,
  transcript: string,
  names: string[] = [],
): boolean {
  const expected = tokens(script),
    actual = tokens(transcript);
  const nameTokens = new Set(names.flatMap(tokens));
  if (!expected.length || expected.length !== actual.length) return false;
  return expected.every((word, i) => word === actual[i] || nameTokens.has(word));
}
export async function verifySpeech(
  audio: Buffer,
  script: string,
  names: string[] = [],
): Promise<boolean> {
  const seconds = mp3DurationSeconds(audio);
  // A ten-word sentence cannot justify a half-minute recording, even when ASR drops the extra speech.
  if (seconds === null || seconds > 4 + tokens(script).length * 0.8) return false;
  const result = await transcribeAudio({
    audioBase64: audio.toString("base64"),
    mimeType: "audio/mpeg",
    provider: process.env.OPENAI_API_KEY ? "openai" : "gemini",
    timeoutMs: 30000,
  });
  return result.ok && speechMatchesScript(script, result.transcript, names);
}
export async function generateVerifiedSpeech(
  script: string,
  names: string[] = [],
): Promise<Buffer> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const audio = await generateReadeeSpeech(script, "MP3", "gemini-2.5-pro-tts");
      if (await verifySpeech(audio, script, names)) return audio;
    } catch {
      // Transient synthesis or verification failures are retryable, never publishable.
    }
  }
  throw new Error("Narration did not match its script.");
}
