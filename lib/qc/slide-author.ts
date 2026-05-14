/**
 * Type-aware lesson-slide author (Bulletproof #4 of the no-human-review
 * gameplan).
 *
 * Closes the lesson-side analog of the question regen pipeline. Today
 * we can rewrite a failing question; we can't rewrite a failing slide.
 * The 16 slide.judge fails from audit run 0194afe8 sit open until this
 * exists.
 *
 * Approach mirrors lib/qc/question-authors.ts:
 *   - Gemini 2.5 Flash (cheap, what the rest of the pipeline uses)
 *   - CCSS standard text + a K-canon reference slide as the calibration
 *     anchor
 *   - Validate structural shape (steps array, each step has sub +
 *     ttsScript + audioFile + ≥1 animation primitive)
 *   - Return the new slide object ready to drop into lessons_db.slides[N]
 *
 * The caller (scripts/qc-bot-regen-slides.ts) handles the DB UPDATE
 * with jsonb_set, logs to content_qc_log, and marks the finding fixed.
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

export type SlideAuthorInput = {
  standardId: string;
  standardText: string;
  lessonTitle: string;
  slideNumber: number;
  /** The current (failing) slide JSON */
  oldSlide: any;
  /** Committee critique describing why the old slide failed */
  critique: string;
  /** A K-canon slide for the same domain — calibration anchor */
  referenceSlide: any;
  grade: string;
};

export type AuthorSlideResult =
  | { ok: true; slide: any }
  | { ok: false; error: string };

const SLIDE_AUTHOR_SYSTEM = `You are a senior K-4 reading specialist rewriting ONE slide of a karaoke-style lesson.

You receive:
  STANDARD: the CCSS standard text the slide must teach.
  LESSON: the lesson's title.
  OLD SLIDE: the previous version (failed an audit — DON'T copy its flaws).
  CRITIQUE: what was wrong. Address it directly.
  REFERENCE SLIDE (K-canon): a hand-authored slide for the same domain. Use it as the structural + animation-density bar.

Rules:
  1. Output JSON only. No markdown fences. No explanatory prose.
  2. The new slide must teach the EXACT CCSS standard above — not an adjacent skill. The most common audit failure is "slide teaches X but standard is Y." Re-read STANDARD carefully.
  3. Preserve the slide's role in the lesson: intro slides set up, teach slides instruct, example slides model, tip slides give a memorable trick. Keep "type" and "slide" from the OLD SLIDE.
  4. Match the reference slide's animation density. Every step must have at least one of: displayParts, highlightWord, highlightPills, displayDiagram, afterPhonemes, sfxClaps, displayTableRow.
  5. Each step's ttsScript should be a single sentence kids understand. No markdown emphasis (no **word**). No emoji. No banned vocabulary.
  6. Preserve audioFile paths verbatim from OLD SLIDE if the same sub-step exists in your output — they reference the existing TTS audio. Setting audioRegenAt to null on a step tells the audio worker to re-render. Set audioRegenAt to null when you CHANGED the ttsScript.
  7. Keep the imageFile path from OLD SLIDE. Rewrite the imagePrompt if the slide content shifted; keep it if not. Image prompt MUST end with the boilerplate: "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters."
  8. highlightWord.word MUST literally appear in the same step's ttsScript.
  9. displayParts text must come from the ttsScript (≥80% of tokens overlap).`;

const SLIDE_SCHEMA = {
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
          audioRegenAt: { type: Type.STRING, nullable: true },
          displayParts: {
            type: Type.ARRAY,
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

export async function authorSlide(
  input: SlideAuthorInput,
): Promise<AuthorSlideResult> {
  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "AI not configured." };
  }

  const userMsg = [
    `STANDARD: ${input.standardId} — ${input.standardText}`,
    `LESSON: ${input.lessonTitle}`,
    `GRADE: ${input.grade}`,
    "",
    "OLD SLIDE (failed audit):",
    JSON.stringify(input.oldSlide, null, 2).slice(0, 3000),
    "",
    `CRITIQUE: ${input.critique}`,
    "",
    "REFERENCE SLIDE (K-canon, same domain):",
    JSON.stringify(input.referenceSlide, null, 2).slice(0, 2500),
  ].join("\n");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMsg,
      config: {
        systemInstruction: SLIDE_AUTHOR_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SLIDE_SCHEMA,
        temperature: 0.2,
      },
    });
    const raw = response.text ?? "{}";
    const parsed = JSON.parse(raw) as any;

    // Validation
    if (!parsed.type || typeof parsed.slide !== "number") {
      return { ok: false, error: "Missing type or slide number" };
    }
    if (!Array.isArray(parsed.steps) || parsed.steps.length === 0) {
      return { ok: false, error: "No steps in regenerated slide" };
    }
    // Each step needs at least one animation primitive (per CONTENT_SPEC §1.2)
    const ANIMATION_KEYS = [
      "displayParts",
      "highlightWord",
      "highlightPills",
      "displayDiagram",
      "afterPhonemes",
      "sfxClaps",
      "displayTableRow",
    ];
    for (let i = 0; i < parsed.steps.length; i++) {
      const step = parsed.steps[i];
      if (!step.sub || !step.ttsScript) {
        return {
          ok: false,
          error: `Step ${i} missing sub or ttsScript`,
        };
      }
      const hasAnim = ANIMATION_KEYS.some((k) => step[k] != null);
      if (!hasAnim) {
        return {
          ok: false,
          error: `Step ${step.sub} has no animation primitive (need at least one of ${ANIMATION_KEYS.join(",")})`,
        };
      }
      // Ghost-word check inline
      if (step.highlightWord?.word) {
        const w = String(step.highlightWord.word).toLowerCase();
        const tts = String(step.ttsScript).toLowerCase();
        if (!new RegExp(`\\b${w.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\b`).test(tts)) {
          return {
            ok: false,
            error: `Step ${step.sub} highlightWord "${step.highlightWord.word}" not in ttsScript`,
          };
        }
      }
    }
    // Image prompt boilerplate
    const ip = String(parsed.imagePrompt ?? "");
    if (
      !ip.includes("Bright 2D cartoon illustration") ||
      !/no text,?\s+no words,?\s+no letters/i.test(ip)
    ) {
      return {
        ok: false,
        error: "imagePrompt missing required style boilerplate",
      };
    }

    return { ok: true, slide: parsed };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Slide author call failed" };
  }
}
