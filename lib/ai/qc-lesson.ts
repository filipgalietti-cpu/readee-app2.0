/**
 * Lesson-level QC. Two layers:
 *
 *  1. Structural checks (deterministic, free) — catches schema drift:
 *     - displayDiagram.letters with text > 1 character
 *     - afterPhonemes referencing a phoneme not in the database
 *     - audioFile path that doesn't match the convention
 *     - empty ttsScript on a step that has interaction or displayDiagram
 *     - phonemeLetterIndices out of bounds for the word being highlighted
 *
 *  2. Per-slide LLM judge — does the slide's TTS script + interaction
 *     actually teach the claimed standard?
 */

import { GoogleGenAI, Type } from "@google/genai";
import phonemeDb from "@/scripts/phoneme-database.json";

let cached: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (cached) return cached;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured.");
  cached = new GoogleGenAI({ apiKey });
  return cached;
}

const KNOWN_PHONEMES: Set<string> = (() => {
  const set = new Set<string>();
  const db = phonemeDb as unknown as { phonemes?: { id: string }[] } | { id: string }[];
  const arr = Array.isArray(db) ? db : db.phonemes ?? [];
  for (const p of arr) set.add(String(p.id ?? "").toLowerCase());
  return set;
})();

export type LessonStructuralFinding = {
  type: string;
  severity: "warn" | "fail";
  message: string;
  slideRef: string; // e.g. "S2a" or "slide 2"
  suggestion?: string;
};

/**
 * Richness check — uses the hand-audited Kindergarten lessons as
 * the quality bar. Filip audited K himself; the QC bot enforces
 * that bar on every other grade so we don't ship 1000 lessons one
 * eye-check at a time.
 *
 * K profile (computed from the live JSON, May 7 2026):
 *   avg 3.1 steps per teaching slide
 *   ~9% of steps use displayParts (staggered reveals)
 *   ~7% use displayDiagram, ~4% afterPhonemes, ~8% displayTableRow
 *   42% of steps have ANY visible displayText
 *
 * G1-4 profile (same data):
 *   1.7-3.3 steps per slide (G3-4 are below K)
 *   0% displayParts / Pills / Word / SFX / table
 *   ~1-7% diagram, ~0-4% phonemes
 *   ~94-100% just plain displayText
 *
 * The bar this check enforces:
 *   1. ≥ 2 steps per teaching slide  (K min)
 *   2. ≥ 1 rich primitive per teaching slide
 *
 * Rich primitives = anything that drives karaoke / animation:
 *   displayParts | highlightPills | highlightWord | displayDiagram
 *   displayDiagramSwap | displayAlphabetGrid | afterPhonemes
 *   sfxClaps | displayTableRow
 */
const RICH_PRIMITIVE_KEYS = [
  "displayParts",
  "highlightPills",
  "highlightWord",
  "displayDiagram",
  "displayDiagramSwap",
  "displayAlphabetGrid",
  "afterPhonemes",
  "sfxClaps",
  "displayTableRow",
] as const;

function slideHasRichPrimitive(slide: any): boolean {
  const steps = Array.isArray(slide?.steps) ? slide.steps : [];
  for (const step of steps) {
    for (const k of RICH_PRIMITIVE_KEYS) {
      const v = step?.[k];
      if (v === undefined || v === null) continue;
      // Arrays must be non-empty to count.
      if (Array.isArray(v) && v.length === 0) continue;
      return true;
    }
  }
  return false;
}

function isTeachingSlide(slide: any): boolean {
  return slide?.type !== "mcq";
}

export function checkLessonRichness(input: {
  standardId: string;
  lesson: any;
}): LessonStructuralFinding[] {
  const findings: LessonStructuralFinding[] = [];
  const slides = Array.isArray(input.lesson?.slides) ? input.lesson.slides : [];
  const teaching = slides.filter(isTeachingSlide);
  if (teaching.length === 0) return findings;

  // Per-slide checks
  let thinSlides = 0;
  for (const slide of teaching) {
    const slideNum = slide?.slide ?? "?";
    const steps = Array.isArray(slide?.steps) ? slide.steps : [];

    if (steps.length > 0 && steps.length < 2) {
      findings.push({
        type: "slide.few_steps",
        severity: "warn",
        message: `Slide ${slideNum} has only ${steps.length} step. K reference is ≥2 steps per teaching slide so kids see staggered reveals, not a single screen.`,
        slideRef: `slide ${slideNum}`,
        suggestion:
          "Split the ttsScript into 2-3 sub-steps and add a displayPart or highlightWord cue per step.",
      });
    }

    if (steps.length > 0 && !slideHasRichPrimitive(slide)) {
      thinSlides += 1;
    }

    // Per-step audio mismatch — every sub-step must have its own
    // audioFile. The May 8 enricher bug split a single audio-backed
    // step into 2-3 sub-steps but reused the original audioFile path
    // for all of them, so playing sub-step b/c restarted the full
    // pre-split audio while only animating the truncated displayParts.
    // K reference: each sub-step has a unique S{n}{sub}.mp3.
    if (steps.length >= 2) {
      const seen = new Map<string, string[]>();
      for (const st of steps) {
        const audio = typeof st?.audioFile === "string" ? st.audioFile : "";
        if (!audio) continue;
        const subs = seen.get(audio) ?? [];
        subs.push(String(st?.sub ?? "?"));
        seen.set(audio, subs);
      }
      for (const [audio, subs] of seen) {
        if (subs.length < 2) continue;
        findings.push({
          type: "lesson.step_audio_mismatch",
          severity: "fail",
          message: `Slide ${slideNum} sub-steps ${subs.join(", ")} all point to ${audio}. The renderer plays the full original audio on each sub-step; karaoke timing desyncs after step a.`,
          slideRef: `slide ${slideNum}`,
          suggestion:
            "Run scripts/qc-enrich-audio.ts to regenerate per-step TTS so each sub-step has its own unique S{n}{sub}.mp3.",
        });
      }
    }
  }

  // Lesson-level threshold: >50% of teaching slides without ANY
  // rich primitive = thin animation. We don't fail the lesson
  // outright (it still serves) but warn so the regen worker knows
  // to enrich. K-bar is "every slide has at least one cue."
  if (teaching.length > 0 && thinSlides / teaching.length > 0.5) {
    findings.push({
      type: "lesson.thin_animation",
      severity: "warn",
      message: `${thinSlides} of ${teaching.length} teaching slides have no animation primitives (displayParts / highlightPills / displayDiagram / afterPhonemes / sfxClaps / displayTableRow). K reference: every slide has at least one. This lesson plays as a static read-aloud.`,
      slideRef: "lesson",
      suggestion:
        "Run the lesson-enrichment regen to add per-step displayParts and at least one diagram or pill bounce per slide.",
    });
  }

  return findings;
}

/**
 * Run all deterministic structural checks. Cheap and exhaustive.
 * Returns ALL issues in one pass; doesn't short-circuit.
 */
export function checkLessonStructure(input: {
  standardId: string;
  lesson: any;
}): LessonStructuralFinding[] {
  const findings: LessonStructuralFinding[] = [];
  const { standardId, lesson } = input;
  const slides = Array.isArray(lesson?.slides) ? lesson.slides : [];

  if (slides.length === 0) {
    findings.push({
      type: "lesson.empty",
      severity: "fail",
      message: "Lesson has no slides (likely a stub).",
      slideRef: "lesson",
    });
    return findings;
  }

  for (const slide of slides) {
    const slideNum = slide?.slide ?? "?";
    const steps = Array.isArray(slide?.steps) ? slide.steps : [];

    if (steps.length === 0) {
      // K lessons have an intentional empty wrap-up slide 10 in some
      // cases. Don't fail — it's not broken UX, just sparse content.
      // Warn so it's visible without polluting the fail bucket.
      findings.push({
        type: "slide.empty",
        severity: "warn",
        message: `Slide ${slideNum} has no steps. If this is an intentional wrap-up card, add a single closing step.`,
        slideRef: `slide ${slideNum}`,
        suggestion: "Add one ttsScript step like 'Great work! You did it!' or remove the empty slide.",
      });
      continue;
    }

    for (const step of steps) {
      const stepRef = `S${slideNum}${step?.sub ?? ""}`;

      // audioFile path convention check
      if (step?.audioFile && typeof step.audioFile === "string") {
        const expectedPrefix = `audio/lessons/${standardId}/`;
        if (!step.audioFile.startsWith(expectedPrefix)) {
          findings.push({
            type: "step.audio_path_off_convention",
            severity: "warn",
            message: `audioFile "${step.audioFile}" doesn't start with "${expectedPrefix}".`,
            slideRef: stepRef,
            suggestion: `Rename to ${expectedPrefix}${step.audioFile.split("/").pop()}.`,
          });
        }
      }

      // Empty ttsScript on a step that's clearly meant to teach something
      if (
        (!step?.ttsScript || String(step.ttsScript).trim().length === 0) &&
        (step?.displayDiagram || step?.interaction)
      ) {
        findings.push({
          type: "step.silent_with_visual",
          severity: "warn",
          message: `Step ${stepRef} has a visual (displayDiagram or interaction) but no ttsScript — silent slide.`,
          slideRef: stepRef,
        });
      }

      // displayDiagram.letters checks
      const dd = step?.displayDiagram;
      if (dd && Array.isArray(dd.letters)) {
        for (const [li, letter] of dd.letters.entries()) {
          const text = String(letter?.text ?? "");
          if (text.length === 0) {
            findings.push({
              type: "step.empty_letter",
              severity: "fail",
              message: `Step ${stepRef} displayDiagram letter[${li}] has empty text.`,
              slideRef: stepRef,
            });
          } else if (text.length > 3) {
            // Allow up to 3 chars (trigraphs: igh, tch, dge). Longer is genuinely odd.
            findings.push({
              type: "step.long_letter_text",
              severity: "warn",
              message: `Step ${stepRef} displayDiagram letter[${li}] text "${text}" is longer than a digraph or trigraph.`,
              slideRef: stepRef,
            });
          }
        }
      }

      // afterPhonemes — must reference real phonemes
      const ap = step?.afterPhonemes;
      if (Array.isArray(ap)) {
        for (const ph of ap) {
          if (!KNOWN_PHONEMES.has(String(ph).toLowerCase())) {
            findings.push({
              type: "step.unknown_phoneme",
              severity: "fail",
              message: `Step ${stepRef} references phoneme "${ph}" which is not in scripts/phoneme-database.json.`,
              slideRef: stepRef,
              suggestion: `Either add the phoneme to the bank or remove this reference.`,
            });
          }
        }
      }

      // phonemeLetterIndices — should be an array of in-bounds indices
      const pli = step?.phonemeLetterIndices;
      if (Array.isArray(pli)) {
        // Find the word these indices reference. Heuristic: look at
        // the displayDiagram letters in the same step.
        const wordLength = Array.isArray(dd?.letters) ? dd.letters.length : null;
        if (wordLength != null) {
          for (const idx of pli) {
            if (typeof idx !== "number" || idx < 0 || idx >= wordLength) {
              findings.push({
                type: "step.phoneme_index_out_of_bounds",
                severity: "fail",
                message: `Step ${stepRef} phonemeLetterIndices includes ${idx} but the word has ${wordLength} letters (valid range 0-${wordLength - 1}).`,
                slideRef: stepRef,
              });
            }
          }
        }
      }
    }
  }

  return findings;
}

const SLIDE_JUDGE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    severity: {
      type: Type.STRING,
      enum: ["pass", "warn", "fail"],
    },
    reason: { type: Type.STRING },
  },
  required: ["severity", "reason"],
};

const SLIDE_JUDGE_SYSTEM = `You are a senior K-4 reading specialist auditing one slide of a karaoke-style reading lesson.

Decide: does this slide CONTRIBUTE to teaching the claimed standard?

A lesson is a 6-10 slide sequence. Slides serve different roles:
- Intro / hook ("hi friend!") — sets warmth, motivates the topic
- Direct instruction ("rhyming words sound the same at the end")
- Modeling / examples ("listen: cat — hat. Same end sound!")
- Guided practice ("you try — does dog rhyme with log?")
- Transition slides ("great work! now let's practice with you")
- Wrap-up / celebration ("you learned about rhyming!")

Verdicts:
- pass: the slide CONTRIBUTES to the lesson's overall teaching of the standard. Hook, modeling, guided practice, transition, and wrap-up slides ALL pass when on-topic and kid-appropriate. The slide doesn't have to teach the standard ALONE — it just has to belong in the sequence.
- warn: the slide is on-topic but unclear, off-pace, or could be tighter.
- fail: the slide is genuinely off-topic, factually wrong, age-inappropriate, or generic encouragement so empty it could be in any lesson ("you're so smart!" with no content reference).

Reason MUST cite WHAT the slide does and HOW it fits the lesson role.`;

export async function judgeLessonSlide(input: {
  standardId: string;
  standardDescription: string;
  lessonTitle: string;
  slideNumber: number | string;
  slideHeading: string | null;
  combinedText: string;
}): Promise<
  | { ok: true; severity: "pass" | "warn" | "fail"; reason: string }
  | { ok: false; error: string }
> {
  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  const userMsg = [
    `Standard: ${input.standardId} — ${input.standardDescription}`,
    `Lesson title: ${input.lessonTitle}`,
    `Slide ${input.slideNumber}${input.slideHeading ? ` — ${input.slideHeading}` : ""}`,
    "",
    `Slide content (TTS scripts + interaction notes):`,
    input.combinedText.slice(0, 3000),
  ].join("\n");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMsg,
      config: {
        systemInstruction: SLIDE_JUDGE_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SLIDE_JUDGE_SCHEMA,
        temperature: 0.0,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}") as {
      severity?: string;
      reason?: string;
    };
    const severity = (
      ["pass", "warn", "fail"] as const
    ).includes(parsed.severity as "pass" | "warn" | "fail")
      ? (parsed.severity as "pass" | "warn" | "fail")
      : "warn";
    return {
      ok: true,
      severity,
      reason: String(parsed.reason ?? "").trim(),
    };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Slide judge failed." };
  }
}
