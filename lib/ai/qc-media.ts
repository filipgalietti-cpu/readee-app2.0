/**
 * Media QC — audio and image quality judges using Gemini multimodal.
 *
 * judgeAudioFile: fetches an audio URL, hands it to Gemini, asks if
 * it sounds normal — no robotic glitches, no silence, no truncation,
 * matches expected text. Gemini 2.5 Flash supports audio input.
 *
 * judgeImageQuality: stronger judge than the existing image.judge
 * (which checks kid-safe + on-prompt). Specifically looks for the
 * Imagen failure modes: extra fingers, mangled faces, broken text,
 * missing/extra body parts, visually nonsensical composition.
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

const MEDIA_SCHEMA = {
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

const AUDIO_JUDGE_SYSTEM = `You are auditing a TTS audio clip used in a K-4 reading app. Listen and evaluate.

Return severity + reason.

PASS if all of:
- Plays cleanly start to finish (no silence, no truncation mid-word)
- Voice is natural-sounding (no robotic glitches, stutters, or chipmunk speed)
- Pronunciation is correct for elementary-grade English
- Pace is appropriate for K-4 (not breakneck, not painfully slow)
- Audio reads the expected content reasonably well (small phrasing differences are fine)

IMPORTANT — Readee TTS conventions (do NOT fail audio for these):
- Many audio files read the prompt FOLLOWED BY the multiple-choice answers in order ("What did Tom find? A red ball? A blue car? A green hat? Or a yellow toy?"). Sometimes finishing with "What do you think?" or similar. This is a kid-listening-comprehension feature so non-readers can answer. PASS when this pattern is heard, even if the prompt-only "expected text" doesn't include the choices.
- Some clips read the passage AND the question; others read only the question. Both are fine.
- Brief musical intro stings (1-2 seconds) at the start of a clip are normal Readee branding. Don't flag as "silent" or "off-content".
- Intentional teaching pauses between sentences (1-2 seconds) are pedagogical, not glitches. Only fail for silence ≥4 seconds mid-clip or audio that's truly cut off mid-word.

WARN if there's a small issue (slightly fast, mildly off pronunciation, brief audio artifact) but the kid would still understand.

FAIL only if a kid would be CONFUSED:
- silent file or corrupted audio
- truncated mid-word
- completely wrong content (audio reads something unrelated to the prompt or its choices)
- painfully unnatural delivery (chipmunk speed, robotic stutter)
- missing core words from the prompt itself

Reason MUST cite the specific issue heard. Don't fail just because the audio "includes more than the prompt" — that's normal.`;

const IMAGE_QUALITY_JUDGE_SYSTEM = `You are auditing an AI-generated children's book illustration. The existing image judge already checks kid-safe + on-prompt. YOUR job is to catch IMAGEN VISUAL FAILURES — the things that make AI art look weird:

CONTEXT — Readee's house style is intentionally stylized 2D cartoon. PASS for these stylization choices:
- Cartoon hands rendered as "mitten" shapes without individual fingers (very common in 2D children's books)
- Simplified facial features (button eyes, tiny noses, simple smile lines)
- Stylized animal anatomy that's intentionally cute (oversized heads, simple body shapes)
- Flat / single-plane backgrounds without 3D perspective
- Bold outlines with limited shading

PASS if:
- Anatomy is INTENTIONALLY stylized cartoon (the Readee 2D house style) OR realistic-correct (hands ~5 fingers if fingers are drawn, faces coherent for the style)
- Composition makes sense within the cartoon convention (no half-floating objects, no people merged into walls)
- Objects are integral (a bird has its wings, a chair has its legs, a dog has 4 limbs)
- No broken text, garbled letters, or mangled signs

WARN for minor issues — eyes that look slightly off, an over-detailed background element, slightly weird perspective — that wouldn't bother a young kid.

FAIL for the genuine Imagen failures the kid WILL notice:
- Extra fingers when fingers ARE drawn individually (a hand showing 6 distinct fingers)
- Multiple grotesquely distorted faces
- Mangled or melting body parts that aren't a stylization choice
- Half-rendered objects (chair with floating legs, dog cut in half by a wall)
- Wrong number of major body parts (3-armed person, 5-legged dog)
- Broken / garbled letters in signage
- Completely incoherent scene that doesn't depict anything specific

NAMED-FIGURE GUARDRAIL — PASS for thematic stand-ins. When the expected scene contains the phrase "Do not depict <name>'s likeness — show only the activity, era, or setting," the image is INTENTIONALLY a generic stand-in (we have a likeness policy for living and recently-living people). A generic runner for a Roger Bannister passage, a generic farmer for a César Chávez passage, a generic kite for a Benjamin Franklin passage — these are CORRECT by design. PASS unless the image is also visually broken. Do NOT mark "generic person instead of the specific figure" as warn or fail — that's the whole point of the guardrail.

WRONG-PERSON FAIL — but a generic stand-in is NOT the same as "a recognizable DIFFERENT real person." If the image shows a person who is RECOGNIZABLE as someone other than the topic of the passage (e.g., a passage about Thomas Edison illustrated with a portrait that anyone literate in US history would recognize as Harriet Tubman, Abraham Lincoln, MLK, etc.) — that's a FAIL. The kid will be confused about who they're reading about. This is much worse than a generic stand-in.

Reason MUST name the specific visual issue. If the image is just stylized cartoon OR a guardrail-compliant stand-in, that's a PASS — say so.`;

export type MediaSeverity = "pass" | "warn" | "fail";

async function fetchAsBase64(
  url: string,
): Promise<{ base64: string; mimeType: string } | { error: string }> {
  try {
    const r = await fetch(url);
    if (!r.ok) return { error: `${r.status} from ${url}` };
    const mimeType = r.headers.get("content-type") ?? "application/octet-stream";
    const buf = Buffer.from(await r.arrayBuffer());
    return { base64: buf.toString("base64"), mimeType };
  } catch (e: any) {
    return { error: e?.message ?? "fetch failed" };
  }
}

export async function judgeAudioFile(input: {
  audioUrl: string;
  /** Text we expected the TTS to read (prompt, hint, or passage). */
  expectedText: string;
}): Promise<
  | { ok: true; severity: MediaSeverity; reason: string }
  | { ok: false; error: string }
> {
  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  const fetched = await fetchAsBase64(input.audioUrl);
  if ("error" in fetched) {
    return { ok: false, error: `audio fetch: ${fetched.error}` };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Expected text the TTS should be reading:\n"""\n${input.expectedText.slice(0, 1500)}\n"""\n\nListen to the clip and evaluate.`,
            },
            { inlineData: { data: fetched.base64, mimeType: fetched.mimeType } },
          ],
        },
      ],
      config: {
        systemInstruction: AUDIO_JUDGE_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: MEDIA_SCHEMA,
        temperature: 0.0,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}") as {
      severity?: string;
      reason?: string;
    };
    const severity = (
      ["pass", "warn", "fail"] as const
    ).includes(parsed.severity as MediaSeverity)
      ? (parsed.severity as MediaSeverity)
      : "warn";
    return {
      ok: true,
      severity,
      reason: String(parsed.reason ?? "").trim(),
    };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Audio judge failed." };
  }
}

/**
 * Side-by-side identity match. Given a Wikipedia reference portrait
 * and our generated image (both raw URLs), ask the vision model
 * directly: "are these the same person?"
 *
 * Visual proof beats prompt reasoning. The cross-modal judge update
 * (f845fd2) catches identity drift through the passage. This catches
 * the same class via the source-of-truth portrait — useful when our
 * image was AI-generated as a thematic stand-in but the model
 * accidentally renders someone recognizable as a DIFFERENT real
 * figure.
 *
 * Returns:
 *   pass — same person, or clearly a generic stand-in (no identity claim)
 *   warn — ambiguous; could be the same person or could not be
 *   fail — clearly a different real person
 */
export async function comparePortraitToImage(input: {
  /** URL of the Wikipedia / source-of-truth portrait. */
  referenceUrl: string;
  /** URL of our generated image. */
  candidateUrl: string;
  /** Figure name for the judge's context. */
  figureName: string;
}): Promise<
  | { ok: true; severity: MediaSeverity; reason: string }
  | { ok: false; error: string }
> {
  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  const [ref, candidate] = await Promise.all([
    fetchAsBase64(input.referenceUrl),
    fetchAsBase64(input.candidateUrl),
  ]);
  if ("error" in ref) return { ok: false, error: `ref fetch: ${ref.error}` };
  if ("error" in candidate)
    return { ok: false, error: `candidate fetch: ${candidate.error}` };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `IMAGE 1 (reference — known portrait of ${input.figureName}):`,
            },
            { inlineData: { data: ref.base64, mimeType: ref.mimeType } },
            {
              text: `IMAGE 2 (the image we're about to ship; it should either be ${input.figureName} OR a clearly generic thematic stand-in with no recognizable identity):`,
            },
            {
              inlineData: {
                data: candidate.base64,
                mimeType: candidate.mimeType,
              },
            },
            {
              text: `Compare. Return { severity, reason }.\n\nSeverity rules:\n- "pass" — Image 2 is clearly the same person as Image 1, OR clearly a generic stand-in (no recognizable face / face is stylized + obscured / it's an object or scene with no person).\n- "warn" — ambiguous; the candidate could be the figure or could be someone else, hard to tell.\n- "fail" — Image 2 is clearly a DIFFERENT recognizable real person from Image 1 (different ethnicity, gender, era, or simply a different famous face). A kid would think they're reading about someone else.\n\nReason names what you see in one sentence.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: `You are doing identity verification between two portraits. Be uncharitable to identity claims — if the candidate doesn't clearly match the reference, lean toward warn or fail. Generic stand-ins are fine; misleading recognizable substitutes are not.`,
        responseMimeType: "application/json",
        responseSchema: MEDIA_SCHEMA,
        temperature: 0.0,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}") as {
      severity?: string;
      reason?: string;
    };
    const severity = (
      ["pass", "warn", "fail"] as const
    ).includes(parsed.severity as MediaSeverity)
      ? (parsed.severity as MediaSeverity)
      : "warn";
    return {
      ok: true,
      severity,
      reason: String(parsed.reason ?? "").trim() || "(no reason returned)",
    };
  } catch (e: any) {
    return {
      ok: false,
      error: e?.message ?? "Portrait compare failed.",
    };
  }
}

export async function judgeImageQuality(input: {
  imageUrl: string;
  /** What the image is supposed to depict — passage scene, lesson topic, etc. */
  expectedScene: string;
  /** The actual passage body the image accompanies. When present the
   *  judge can catch identity/topic mismatches the brief alone can't —
   *  e.g., passage is about Thomas Edison but image is Harriet Tubman.
   *  Optional so older callers that only have a scene description
   *  still work. */
  passageBody?: string;
}): Promise<
  | { ok: true; severity: MediaSeverity; reason: string }
  | { ok: false; error: string }
> {
  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  const fetched = await fetchAsBase64(input.imageUrl);
  if ("error" in fetched) {
    return { ok: false, error: `image fetch: ${fetched.error}` };
  }

  try {
    const passageBlock = input.passageBody
      ? `\n\nThe passage this image accompanies:\n"""\n${input.passageBody.slice(0, 1200)}\n"""\n\nCRITICAL: if the passage names a specific person or topic and the image shows a recognizably DIFFERENT real person or topic, that is a FAIL — kids will be confused about who they're reading about.`
      : "";
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Expected scene: ${input.expectedScene.slice(0, 400)}${passageBlock}\n\nReview the image for visual coherence AND topic match. Look hard at hands, faces, object integrity, composition, AND whether the depicted subject matches the passage.`,
            },
            { inlineData: { data: fetched.base64, mimeType: fetched.mimeType } },
          ],
        },
      ],
      config: {
        systemInstruction: IMAGE_QUALITY_JUDGE_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: MEDIA_SCHEMA,
        temperature: 0.0,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}") as {
      severity?: string;
      reason?: string;
    };
    const severity = (
      ["pass", "warn", "fail"] as const
    ).includes(parsed.severity as MediaSeverity)
      ? (parsed.severity as MediaSeverity)
      : "warn";
    return {
      ok: true,
      severity,
      reason: String(parsed.reason ?? "").trim(),
    };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Image quality judge failed." };
  }
}
