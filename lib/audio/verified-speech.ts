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
    // Past-tense "read" is respelled "red" for the voice (lib/audio/spoken-tense.ts),
    // but a transcriber writes back whichever spelling makes the sentence
    // grammatical, which is usually "read". Without folding the two together the
    // verifier rejects correct audio and burns both attempts on every line that
    // mentions reading, which is most of them.
    .replace(/\bred\b/g, "read")
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
  const words = tokens(script).length;
  // A ten-word sentence cannot justify a half-minute recording, even when ASR drops the extra speech.
  if (seconds === null || seconds > 4 + words * 0.8) return false;
  // ...and it cannot be rattled off either. The guard above was one-sided, so
  // audio that ran TOO FAST always passed: Filip heard the report "read the
  // passage fast asf" and nothing objected. A warm reading-teacher pace is
  // around three words a second, so this floor only catches a genuine gabble.
  // Short lines are exempt because leading and trailing silence dominates them.
  if (words >= 6 && seconds < words * 0.22) return false;
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
  opts: { speakingRate?: number } = {},
): Promise<Buffer> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const audio = await generateReadeeSpeech(script, "MP3", "gemini-2.5-pro-tts", opts);
      if (await verifySpeech(audio, script, names)) return audio;
    } catch {
      // Transient synthesis or verification failures are retryable, never publishable.
    }
  }
  throw new Error("Narration did not match its script.");
}
