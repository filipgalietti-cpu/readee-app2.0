/**
 * Canon example-slide author — the "Let's Try One" worked-problem slide.
 *
 * The catalog inspection (2026-05-30) found ~92 G1-G4 lessons with NO
 * example slide and ~65 more whose "example" isn't a real Q→A. The
 * example is the pedagogical bridge between teaching and independent
 * practice (the "we do" worked problem), so it's the highest-value
 * canon gap to close.
 *
 * Mirrors lib/qc/slide-author.ts (Gemini 2.5 Flash, structured output,
 * inline validation) but is purpose-built for authoring a NEW example
 * slide that matches the nearest CANON example as its calibration anchor.
 * This module is PURE authoring — it returns a validated slide object
 * with placeholder asset paths; the caller generates the image + per-step
 * TTS at canonical paths, aligns the Q→A timing from the new audio,
 * inserts the slide before the tip, and persists.
 *
 * Reference selection is by SKILL TYPE, not just grade: a phonics lesson
 * mirrors RF.2.3b, a vocab lesson mirrors L.3.4b/L.4.4b, a comprehension
 * lesson mirrors RL.1.1/RL.K.1.
 *
 * The canon example shape (verified against RL.1.1 / RF.2.3b / L.3.4b):
 *   a: audio-only framing line — NO anchor (the slide image carries it).
 *   b: displayText anchor. comprehension → a short 1-2 sentence passage;
 *      phonics/vocab → the focal word + displayHighlight on the chunk
 *      ("rain"+"ai", "dislike"+"dis").
 *   c,d: displayParts Q→A (2 items, Q ends with "?") + highlightWord
 *      naming the answer (must appear in that step's ttsScript).
 *   e: closing summary — usually audio-only, sometimes a 3rd Q→A.
 */

import { GoogleGenAI, Type } from "@google/genai";

let cached: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (cached) return cached;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured.");
  cached = new GoogleGenAI({ apiKey });
  return cached;
}

export type SkillType = "comprehension" | "phonics" | "vocab";

/**
 * Map a CCSS standard id to its canon skill family by the ALPHA PREFIX
 * (RL.1.3 → "RL", L.3.4b → "L", RF.2.3b → "RF"). The lesson `domain`
 * field is a human label ("Literature"/"Language") and must NOT be used
 * — "Literature".startsWith("L") would misclassify it as vocab.
 */
export function skillTypeForStandard(standardId: string): SkillType {
  const prefix = (standardId || "").toUpperCase().match(/^[A-Z]+/)?.[0] ?? "";
  if (prefix === "RF") return "phonics";
  if (prefix === "L") return "vocab";
  return "comprehension"; // RL, RI, …
}

export type ExampleAuthorInput = {
  standardId: string;
  standardText: string;
  lessonTitle: string;
  grade: string;
  /** Position the example slide will occupy (1-based slide number). */
  slideNumber: number;
  skillType: SkillType;
  /** The nearest CANON example slide (same skill family) — the bar. */
  referenceExample: any;
  /**
   * Focal words already used on this lesson's teach slides. The example
   * MUST use a DIFFERENT word for the same skill (canon rule 1: no word
   * repetition across slides).
   */
  teachWords: string[];
};

export type ExampleAuthorResult =
  | { ok: true; slide: any }
  | { ok: false; error: string };

const SYSTEM = `You are a senior K-4 reading specialist authoring ONE new "Let's Try One" example slide for a karaoke-style lesson. The lesson currently has NO worked example, so kids jump from being taught straight to a quiz. Your slide is the "we do" bridge: model ONE worked problem the way a teacher would on the board.

You receive STANDARD, LESSON, GRADE, SKILL TYPE, TEACH WORDS (already used — do NOT reuse), and a REFERENCE EXAMPLE (a hand-authored canon slide of the SAME skill type). Match the reference's structure, step count, tone, and animation density exactly. It is the bar.

Output JSON only — no markdown fences, no prose.

THE GOLDEN RULE — the on-screen text ANCHORS the audio, it does not transcribe it. The audio teaches; the screen shows the ONE idea in as few words as possible. The fastest way to fail is to put a spoken sentence on screen.

The canon "Let's Try One" shape — 5 steps a-e:
  a: a short framing line read aloud. NO visual anchor (the slide image carries it). Just sub + ttsScript. e.g. "Let's try one together." / "Listen to this little story."
  b: the focal content as displayText.
     - comprehension: a SHORT 2-sentence passage, ≤16 words total (displayText = the passage). Canon: "Bella picked three red apples from the tree. She put them in her basket."
     - phonics/vocab: the focal WORD only (displayText = one word) PLUS displayHighlight = the focal chunk (word "biography", displayHighlight "bio").
  c: Q1 → A1. displayParts = exactly two items. The QUESTION is 1-4 words ending in "?" ("Who?", "Two letters?", "What does it mean?"). The ANSWER is 1-5 words ("Bella!", "AI!", "Played with a red ball!"). NOT a sentence. Add highlightWord = the key answer word (it MUST appear verbatim in this step's ttsScript).
  d: Q2 → A2. Same terse shape. Q2 must NOT repeat Q1's answer word — use "it" ("What does it mean?"), never re-name the prefix/root/answer.
  e: a closing summary read aloud that states the result + the lesson's encouraging tagline. Usually audio-only (no anchor), like the reference. e.g. "So biography means writing about a life. Prefix power!"

The ttsScript can be a full friendly sentence ("Who is the story about? Bella!") — but the displayParts you pull from it must be the TERSE anchor ("Who?" / "Bella!"), never the whole sentence.

Hard rules:
  1. Output the EXACT CCSS standard's skill — not an adjacent one.
  2. type MUST be "example". heading like the reference ("Let's Try One").
  3. Every step has sub (a-e) and a kid-friendly one-sentence ttsScript. No markdown emphasis (**word**), no emoji.
  4. TERSENESS (most important): every displayParts question ≤4 words; every answer ≤5 words; the step-b passage ≤16 words. If you cannot say it in that few words on screen, you are transcribing — shorten it.
  5. Do NOT reuse any TEACH WORD as the focal text in step b.
  6. highlightWord.word MUST appear verbatim in the same step's ttsScript.
  7. Leave every audioFile and imageFile as "" and every delay as 0 — the caller assigns canonical paths and derives real timing from the generated audio.
  8. imagePrompt MUST end with: "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters."`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING },
    slide: { type: Type.INTEGER },
    heading: { type: Type.STRING },
    imageFile: { type: Type.STRING },
    imagePrompt: { type: Type.STRING },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sub: { type: Type.STRING },
          audioFile: { type: Type.STRING },
          ttsScript: { type: Type.STRING },
          displayText: { type: Type.STRING, nullable: true },
          displayHighlight: { type: Type.STRING, nullable: true },
          displayParts: {
            type: Type.ARRAY,
            nullable: true,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                delay: { type: Type.INTEGER },
              },
              required: ["text", "delay"],
            },
          },
          highlightWord: {
            type: Type.OBJECT,
            nullable: true,
            properties: {
              word: { type: Type.STRING },
              delay: { type: Type.INTEGER },
            },
            required: ["word", "delay"],
          },
        },
        required: ["sub", "audioFile", "ttsScript"],
      },
    },
  },
  required: ["type", "slide", "heading", "imageFile", "imagePrompt", "steps"],
};

function isQAPair(step: any): boolean {
  const dp = step?.displayParts;
  return (
    Array.isArray(dp) &&
    dp.length === 2 &&
    typeof dp[0]?.text === "string" &&
    dp[0].text.trim().endsWith("?")
  );
}

function reEsc(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Word count, ignoring trailing punctuation. */
function words(s: string): number {
  return String(s).replace(/[?!.,]/g, " ").trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Returns an error string if the authored slide violates the canon
 * architecture, else null. The terseness checks (questions ≤3 words,
 * answers ≤4 words, passage ≤16 words) are what keep the slide from
 * "having too much going on" — the screen anchors the audio, it does
 * not transcribe it.
 */
function validateExample(parsed: any, input: ExampleAuthorInput): string | null {
  if (parsed.type !== "example") return `type is "${parsed.type}", expected "example"`;
  if (!Array.isArray(parsed.steps) || parsed.steps.length < 4 || parsed.steps.length > 6)
    return `example needs 4-6 steps, got ${parsed.steps?.length}`;

  for (let i = 0; i < parsed.steps.length; i++) {
    const step = parsed.steps[i];
    if (!step.sub || !step.ttsScript) return `step ${i} missing sub or ttsScript`;
    if (step.highlightWord?.word) {
      const w = String(step.highlightWord.word).toLowerCase();
      if (!new RegExp(`\\b${reEsc(w)}\\b`).test(String(step.ttsScript).toLowerCase()))
        return `step ${step.sub} highlightWord "${step.highlightWord.word}" not in ttsScript`;
    }
  }

  // Focal anchor (displayText word/passage) + ≥1 Q→A pair.
  const anchorStep = parsed.steps.find(
    (s: any) => typeof s.displayText === "string" && s.displayText.trim(),
  );
  if (!anchorStep) return "no focal anchor step (expected a displayText word/passage on step b)";
  if (input.skillType === "comprehension" && words(anchorStep.displayText) > 16)
    return `passage too long (${words(anchorStep.displayText)} words, max 16) — anchor, don't transcribe`;

  const qaSteps = parsed.steps.filter(isQAPair);
  if (qaSteps.length < 1) return "no Q→A pair (displayParts[2], first ends with '?')";

  // TERSENESS — the fix for "too much going on".
  for (const qa of qaSteps) {
    const q = String(qa.displayParts[0].text);
    const a = String(qa.displayParts[1].text);
    if (words(q) > 4) return `question "${q}" too long (${words(q)} words, max 4) — terse anchor like "Who?"`;
    if (words(a) > 5) return `answer "${a}" too long (${words(a)} words, max 5) — terse anchor like "Bella!"`;
  }

  // Q2 must not repeat Q1's answer word.
  if (qaSteps.length >= 2) {
    const a1 = String(qaSteps[0].displayParts[1].text).toLowerCase().replace(/[^a-z0-9' ]/g, "").trim();
    const q2 = String(qaSteps[1].displayParts[0].text).toLowerCase();
    const a1Word = a1.split(/\s+/).filter((t) => t.length >= 3)[0];
    if (a1Word && new RegExp(`\\b${reEsc(a1Word)}\\b`).test(q2)) return `Q2 leaks Q1's answer ("${a1Word}") — use "it"`;
  }

  // Focal anchor must not reuse a teach word.
  const focal = String(anchorStep.displayText).toLowerCase();
  for (const tw of input.teachWords) {
    const t = tw.toLowerCase().trim();
    if (t && new RegExp(`\\b${reEsc(t)}\\b`).test(focal)) return `example reuses teach word "${tw}" as focal text`;
  }

  // Image prompt boilerplate.
  const ip = String(parsed.imagePrompt ?? "");
  if (!ip.includes("Bright 2D cartoon illustration") || !/no text,?\s+no words,?\s+no letters/i.test(ip))
    return "imagePrompt missing required style boilerplate";

  return null;
}

export async function authorExampleSlide(
  input: ExampleAuthorInput,
): Promise<ExampleAuthorResult> {
  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "AI not configured." };
  }

  const baseMsg = [
    `STANDARD: ${input.standardId} — ${input.standardText}`,
    `LESSON: ${input.lessonTitle}`,
    `GRADE: ${input.grade}`,
    `SKILL TYPE: ${input.skillType}`,
    `SLIDE NUMBER: ${input.slideNumber}`,
    `TEACH WORDS (do NOT reuse as focal text): ${input.teachWords.join(", ") || "(none)"}`,
    "",
    "REFERENCE EXAMPLE (canon, same skill type — match its shape AND its terseness):",
    JSON.stringify(input.referenceExample, null, 2).slice(0, 3000),
  ].join("\n");

  // Up to 3 attempts; feed the failed check back so the model self-corrects.
  let lastError = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    const userMsg = lastError
      ? `${baseMsg}\n\nYOUR PREVIOUS ATTEMPT FAILED THIS CHECK — fix ONLY this and keep everything else canon: ${lastError}`
      : baseMsg;
    let parsed: any;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userMsg,
        config: {
          systemInstruction: SYSTEM,
          responseMimeType: "application/json",
          responseSchema: SCHEMA,
          temperature: 0.3,
        },
      });
      parsed = JSON.parse(response.text ?? "{}");
    } catch (e: any) {
      lastError = `invalid JSON: ${e?.message ?? e}`;
      continue;
    }

    const err = validateExample(parsed, input);
    if (err) {
      lastError = err;
      continue;
    }

    // Normalize asset paths + delays — caller owns these.
    parsed.slide = input.slideNumber;
    parsed.imageFile = "";
    for (const step of parsed.steps) {
      step.audioFile = "";
      if (step.displayParts) for (const p of step.displayParts) p.delay = 0;
      if (step.highlightWord) step.highlightWord.delay = 0;
    }
    return { ok: true, slide: parsed };
  }
  return { ok: false, error: `failed after 3 attempts: ${lastError}` };
}
