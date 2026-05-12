/**
 * Scene-spec extraction — turns a passage into a structured manifest
 * the image generator + image judge can both reason against, instead
 * of a free-form sentence brief that lets the model decide which
 * concrete nouns to drop.
 *
 * The May 12 2026 "wtf animal" failure: passage explicitly named
 * squirrel + bunny + duck + frogs, brief collapsed them into "cute
 * woodland creatures," generator painted a chimera, prompt-vs-image
 * judge passed because "yeah cute animals at a pond." A structured
 * spec forces both the generator and the judge into atomic per-item
 * commitments — "is there a fluffy white rabbit visible? yes/no" is
 * far harder to pass-bias than "does this image match the brief?"
 *
 * The spec doubles as:
 *   - Image brief input (concrete roster, low ambiguity).
 *   - Image-judge spec (atomic per-item verdicts in qc-scene.ts).
 *   - Regen instruction when one specific item is missing — we know
 *     exactly which character/object the next generation must include.
 */

import { Type } from "@google/genai";
import { getClient, MODEL_ID, logUsage } from "@/lib/ai/readee-ai";
import { CREDIT_COST } from "@/lib/ai/credits";
import { trackError } from "@/lib/observability/track";

export type SceneCharacter = {
  /** Concrete species, breed, or role. Examples: "squirrel", "Labrador
   *  retriever", "school teacher", "astronaut", "lion".
   *  NEVER vague nouns like "animal", "creature", "person". */
  species: string;
  /** Optional colour descriptor for visual anchoring. */
  color?: string | null;
  /** Optional one-word size or shape modifier — "little", "fluffy",
   *  "tall". Helps the generator differentiate species when multiple
   *  similar ones appear. */
  attribute?: string | null;
  /** Number of this character visible in the scene. Default 1.
   *  Captures "two green frogs on a log." */
  count?: number | null;
};

export type SceneSpec = {
  /** The named characters/animals/objects that MUST appear in the
   *  image. Empty array is allowed for concept passages (e.g. "what
   *  is gravity") — the judge will skip the per-item check. */
  characters: SceneCharacter[];
  /** Setting — physical place ("pond", "classroom", "kitchen"). */
  setting: string | null;
  /** Time of day if the passage specifies one. */
  time_of_day: string | null;
  /** One-word mood — "happy", "calm", "exciting", "curious". */
  mood: string | null;
  /** The single most important action happening in the scene. */
  key_action: string | null;
};

const SCENE_SPEC_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    characters: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          species: { type: Type.STRING },
          color: { type: Type.STRING, nullable: true },
          attribute: { type: Type.STRING, nullable: true },
          count: { type: Type.INTEGER, nullable: true },
        },
        required: ["species"],
      },
    },
    setting: { type: Type.STRING, nullable: true },
    time_of_day: { type: Type.STRING, nullable: true },
    mood: { type: Type.STRING, nullable: true },
    key_action: { type: Type.STRING, nullable: true },
  },
  required: ["characters"],
};

const SCENE_SPEC_SYSTEM = `You extract a structured visual scene specification from short K-4 reading passages so an illustrator + a vision QC judge have a concrete checklist.

Output is JSON matching the supplied schema. No prose, no markdown.

Rules:
- "characters" lists every named entity that should visibly appear in a single illustration of the passage's most evocative moment. Real species/breeds/roles only — NEVER vague words like "animal", "creature", "person", "thing".
- If the passage names two of something ("two green frogs"), set count=2.
- Color/attribute fields are for the most distinctive visual cue. Skip them if the passage doesn't say.
- "setting" is the immediate physical place (pond, classroom, jungle, kitchen). One short phrase.
- "key_action" is the single most important thing happening — what the illustration should depict if it can only show one moment. One short phrase.
- Concept passages (gravity, photosynthesis) can have empty characters[]; fill setting + key_action.
- Cap characters at 6. If the passage has more, keep the named/featured ones; drop background extras.`;

/**
 * Extract a SceneSpec from a passage. Returns null on failure rather
 * than throwing so the caller (build-daily) can fall back to the
 * legacy free-form brief instead of breaking the whole build.
 */
export async function extractSceneSpec(input: {
  teacherId: string;
  passageTitle: string;
  passageBody: string;
}): Promise<{ ok: true; spec: SceneSpec } | { ok: false; error: string }> {
  const text = `${input.passageTitle}\n\n${input.passageBody}`.trim();
  if (!text) return { ok: false, error: "Passage is empty." };

  let client;
  try {
    client = getClient();
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "AI client unavailable." };
  }

  const userPrompt = `Title: ${input.passageTitle}\n\nPassage:\n${input.passageBody.slice(
    0,
    2000,
  )}\n\nReturn the JSON scene spec.`;

  try {
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: userPrompt,
      config: {
        systemInstruction: SCENE_SPEC_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SCENE_SPEC_SCHEMA as any,
        temperature: 0.15,
      },
    });
    const raw = response.text ?? "{}";
    const parsed = JSON.parse(raw) as Partial<SceneSpec>;
    const spec: SceneSpec = {
      characters: Array.isArray(parsed.characters) ? parsed.characters : [],
      setting: parsed.setting ?? null,
      time_of_day: parsed.time_of_day ?? null,
      mood: parsed.mood ?? null,
      key_action: parsed.key_action ?? null,
    };
    await logUsage({
      teacherId: input.teacherId,
      kind: "quiz_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.quiz_generation,
      success: true,
      requestSummary: `scene_spec: ${input.passageTitle.slice(0, 80)}`,
    });
    return { ok: true, spec };
  } catch (e: any) {
    trackError(e, {
      route: "scene-spec.extract",
      userId: input.teacherId,
      extra: { passageTitle: input.passageTitle.slice(0, 80) },
    });
    return { ok: false, error: e?.message ?? "Spec extraction failed." };
  }
}

/**
 * Render a SceneSpec as a human-readable brief the image generator
 * can consume directly. Roster sentence is always second so the
 * generator hits the named-species checklist after orienting on the
 * scene. Mirrors the format the (now tightened) IMAGE_BRIEF_SYSTEM
 * asks for, but built mechanically from structured data so it can't
 * drift back into "cute woodland critters."
 */
export function renderSpecAsBrief(spec: SceneSpec): string {
  const sceneParts: string[] = [];
  if (spec.key_action) sceneParts.push(spec.key_action);
  if (spec.setting) sceneParts.push(`at ${spec.setting}`);
  if (spec.time_of_day) sceneParts.push(`(${spec.time_of_day})`);
  const moodTail = spec.mood ? ` Mood: ${spec.mood}.` : "";
  const sceneSentence = sceneParts.length
    ? `Scene: ${sceneParts.join(" ")}.${moodTail}`
    : `A kid-friendly illustration of a simple scene.${moodTail}`;

  if (spec.characters.length === 0) return sceneSentence;

  const roster = spec.characters
    .map((c) => {
      const bits = [
        c.count && c.count > 1 ? `${c.count}` : "a",
        c.attribute ?? null,
        c.color ?? null,
        c.species,
      ].filter(Boolean) as string[];
      return bits.join(" ").trim();
    })
    .join("; ");

  return `${sceneSentence}\n\nShow exactly: ${roster}. Each item must be drawn as a clearly recognizable real-world species/object — no chimeras, no invented hybrids.`;
}

/**
 * Human-readable summary for logs / dashboards.
 */
export function describeSpec(spec: SceneSpec): string {
  const chars = spec.characters
    .map((c) => `${c.count && c.count > 1 ? c.count : 1}× ${c.attribute ?? ""} ${c.color ?? ""} ${c.species}`.replace(/\s+/g, " ").trim())
    .join(", ");
  return [
    chars ? `chars=[${chars}]` : "chars=[]",
    spec.setting ? `setting=${spec.setting}` : null,
    spec.key_action ? `action=${spec.key_action}` : null,
  ]
    .filter(Boolean)
    .join(" ");
}
