/**
 * Spec-decomposed image QC + self-consistency check.
 *
 * The legacy qcImage runs a single prompt-vs-image judge that returns
 * one severity. Two failure modes leak through it:
 *   1. Pass-bias on "close-enough" — model says "yes, animals at a
 *      pond" when 3 of the 4 named species aren't actually present.
 *   2. Hybrid creatures — the judge gets confused by a chimera and
 *      grades on vibes instead of identification.
 *
 * This module adds two layers on top:
 *
 *   A. Self-consistency. We send the image to the vision model with
 *      no reference text and ask it to enumerate every distinct
 *      character/object/animal it sees. Then we LLM-compare that
 *      list against the SceneSpec. The model can't pass-bias against
 *      its own description — if it calls its own output "a creature
 *      with rabbit ears and a bushy tail," that's a damning signal
 *      the prompt-judge missed.
 *
 *   B. Per-item atomic verdicts. One vision call, structured output
 *      schema that emits a yes/no/partial verdict per SceneSpec
 *      character + the setting. Five atomic answers in a single
 *      response beat one prose grade for both accuracy and cost.
 *      A "no" on any required character is a fail.
 *
 * Shadow-warn rollout: this layer currently emits checks at `warn`
 * severity instead of `fail` (controlled by SHADOW_MODE below) so we
 * don't regress publish-rate while we calibrate. Flip SHADOW_MODE to
 * false once we've seen ~20 daily builds and confirmed the new checks
 * align with operator judgment.
 */

import { Type } from "@google/genai";
import { getClient, MODEL_ID, logUsage } from "@/lib/ai/readee-ai";
import { CREDIT_COST } from "@/lib/ai/credits";
import { trackError } from "@/lib/observability/track";
import type { QcCheck, QcSeverity } from "@/lib/ai/qc";
import type { SceneSpec, SceneCharacter } from "@/lib/ai/scene-spec";

/**
 * When true, missing characters surface as `warn` instead of `fail`.
 * Lets us run the new judges in production for visibility before
 * gating publishing on them. Flip after ~20 daily builds of
 * agreement-tracking shows the new checks are precision-tuned.
 */
const SHADOW_MODE = true;

const ITEM_VERDICT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    setting_present: {
      type: Type.STRING,
      enum: ["yes", "no", "partial"],
    },
    setting_evidence: { type: Type.STRING },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          target: { type: Type.STRING },
          verdict: { type: Type.STRING, enum: ["yes", "no", "partial"] },
          evidence: { type: Type.STRING },
        },
        required: ["target", "verdict", "evidence"],
      },
    },
  },
  required: ["items"],
};

const ITEM_VERDICT_SYSTEM = `You audit a children's reading-app illustration against a checklist.

You will receive:
1. An image.
2. A "setting" string and a list of "targets" (each a concrete species/object/character that should appear).

For EACH target, return one verdict object:
  verdict = "yes"     — the target is clearly, unambiguously visible as the described species/object.
  verdict = "partial" — something resembling the target appears but is ambiguous, low-detail, or a hybrid with another species.
  verdict = "no"      — the target is missing or replaced by something else.
  evidence = one short sentence pointing at the image region or visual cue you used.

For the setting: same yes/partial/no.

Be strict. Children look at these images for 30+ seconds; ambiguous depictions confuse them. A blob with rabbit ears AND a squirrel tail is "partial" (or "no" if it doesn't even read as the intended species). An off-camera item not visible is "no."

Output JSON only.`;

const DESCRIBE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    setting: { type: Type.STRING, nullable: true },
    has_hybrid_creature: { type: Type.BOOLEAN },
    hybrid_note: { type: Type.STRING, nullable: true },
  },
  required: ["items", "has_hybrid_creature"],
};

const DESCRIBE_SYSTEM = `You describe a children's illustration cold — no reference text supplied.

List every distinct identifiable character, animal, person, or focal object you can see. Use concrete species/breeds/roles only: "rabbit", "tabby cat", "school teacher", "astronaut". If you cannot identify what something is — for example a creature with mixed-species features (rabbit ears AND a long bushy tail, dog body AND a beak) — set has_hybrid_creature=true and describe what you saw in hybrid_note instead of inventing a name.

setting = short phrase for the immediate physical scene if visible ("pond", "classroom kitchen"). Null if unclear.

Output JSON only. items is the FLAT list of distinct things, deduped; do not include background filler like "sky" or "grass."`;

/**
 * Common kid-book species synonyms. The cold description model may
 * use a different term than the passage ("bunny" vs "rabbit",
 * "pup" vs "dog"). Without a synonym layer the substring match
 * false-flags as "character missing" when it's actually there.
 * Kept tight — only obvious interchangeable pairs, no judgment calls.
 */
const SPECIES_SYNONYMS: Record<string, string[]> = {
  bunny: ["rabbit"],
  rabbit: ["bunny"],
  puppy: ["dog", "pup"],
  pup: ["dog", "puppy"],
  kitten: ["cat", "kitty"],
  kitty: ["cat", "kitten"],
  pony: ["horse"],
  horse: ["pony", "foal"],
  foal: ["horse"],
  chick: ["chicken", "baby bird"],
  duckling: ["duck"],
  cub: ["bear"],
  fawn: ["deer"],
  joey: ["kangaroo"],
  calf: ["cow"],
};

function speciesMatchesAny(species: string, candidates: string[]): boolean {
  const s = species.toLowerCase();
  if (candidates.some((c) => c.includes(s))) return true;
  const syns = SPECIES_SYNONYMS[s] ?? [];
  for (const syn of syns) {
    if (candidates.some((c) => c.includes(syn))) return true;
  }
  return false;
}

function describeCharacterTarget(c: SceneCharacter): string {
  const bits = [
    c.count && c.count > 1 ? `${c.count}` : "a",
    c.attribute ?? null,
    c.color ?? null,
    c.species,
  ].filter(Boolean) as string[];
  return bits.join(" ").trim();
}

/**
 * Fetch image bytes once + reuse the base64 for both judges. Saves
 * one round-trip + keeps the two judgments looking at the exact same
 * pixel data (Vertex/Imagen public URLs are sometimes briefly cached
 * weirdly).
 */
async function fetchImageBase64(
  imageUrl: string,
): Promise<{ ok: true; base64: string; mimeType: string } | { ok: false; error: string }> {
  try {
    const r = await fetch(imageUrl);
    if (!r.ok) return { ok: false, error: `Image URL returned ${r.status}` };
    const mimeType = r.headers.get("content-type") ?? "image/png";
    const buf = Buffer.from(await r.arrayBuffer());
    return { ok: true, base64: buf.toString("base64"), mimeType };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "image fetch failed" };
  }
}

/**
 * Layer A — self-consistency.
 *
 * Vision model describes the image cold. We then walk through the
 * spec's named characters and check whether each appears somewhere in
 * the model's own description (string match + simple synonyms). Any
 * `has_hybrid_creature=true` is a strong negative signal regardless
 * of the per-item check.
 */
async function selfConsistencyCheck(input: {
  teacherId: string;
  base64: string;
  mimeType: string;
  spec: SceneSpec;
}): Promise<{ checks: QcCheck[]; creditsUsed: number; description?: string[] }> {
  const checks: QcCheck[] = [];
  let creditsUsed = 0;

  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: [
        {
          role: "user",
          parts: [
            { text: "Describe this image — list every distinct identifiable character, animal, or focal object." },
            { inlineData: { data: input.base64, mimeType: input.mimeType } },
          ],
        },
      ],
      config: {
        systemInstruction: DESCRIBE_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: DESCRIBE_SCHEMA as any,
        temperature: 0.15,
      },
    });
    creditsUsed += CREDIT_COST.quiz_generation;
    await logUsage({
      teacherId: input.teacherId,
      kind: "image_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.quiz_generation,
      success: true,
      requestSummary: "qc.scene.describe",
    });

    const parsed = JSON.parse(response.text ?? "{}") as {
      items?: string[];
      setting?: string | null;
      has_hybrid_creature?: boolean;
      hybrid_note?: string | null;
    };
    const items = Array.isArray(parsed.items) ? parsed.items.map((s) => s.toLowerCase()) : [];

    // Hybrid creature is a clear fail regardless of per-item matches —
    // it means the model itself can't identify what species it drew.
    if (parsed.has_hybrid_creature) {
      checks.push({
        name: "image.self_consistency.hybrid_creature",
        severity: severity("fail"),
        message: `Vision model flagged a hybrid/unidentifiable creature in the image${
          parsed.hybrid_note ? `: ${parsed.hybrid_note}` : ""
        }`,
      });
    } else {
      checks.push({
        name: "image.self_consistency.hybrid_creature",
        severity: "pass",
        message: "No hybrid creatures detected in cold description",
      });
    }

    // Cross-check spec characters against the cold description, with
    // synonym fallback so "bunny" matches "rabbit", "pup" matches
    // "dog", etc.
    for (const c of input.spec.characters) {
      const found = speciesMatchesAny(c.species, items);
      const target = describeCharacterTarget(c);
      checks.push({
        name: `image.self_consistency.has_${slug(c.species)}`,
        severity: found ? "pass" : severity("fail"),
        message: found
          ? `Cold description includes ${target}`
          : `Cold description omits ${target}. Saw: ${items.join(", ") || "(none)"}`,
      });
    }

    return { checks, creditsUsed, description: items };
  } catch (e: any) {
    trackError(e, { route: "qc.scene.selfConsistency", userId: input.teacherId });
    checks.push({
      name: "image.self_consistency.error",
      severity: "warn",
      message: `Self-consistency check threw: ${e?.message ?? e}`,
    });
    return { checks, creditsUsed };
  }
}

/**
 * Layer B — per-item atomic verdicts.
 *
 * One vision call with a structured response schema returning a
 * yes/no/partial verdict + evidence sentence for each spec character
 * plus the setting. Atomic decisions are much harder for the model
 * to pass-bias than prose grading.
 */
async function perItemCheck(input: {
  teacherId: string;
  base64: string;
  mimeType: string;
  spec: SceneSpec;
}): Promise<{ checks: QcCheck[]; creditsUsed: number }> {
  const checks: QcCheck[] = [];
  let creditsUsed = 0;
  if (input.spec.characters.length === 0 && !input.spec.setting) {
    // Nothing concrete to verify; let the legacy qcImage handle the
    // free-form judgement.
    return { checks, creditsUsed };
  }

  const targets = input.spec.characters.map(describeCharacterTarget);
  const userPrompt = `Setting to verify: ${input.spec.setting ?? "(unspecified)"}\n\nTargets to verify:\n${targets
    .map((t, i) => `${i + 1}. ${t}`)
    .join("\n")}\n\nReturn the structured JSON.`;

  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: [
        {
          role: "user",
          parts: [
            { text: userPrompt },
            { inlineData: { data: input.base64, mimeType: input.mimeType } },
          ],
        },
      ],
      config: {
        systemInstruction: ITEM_VERDICT_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: ITEM_VERDICT_SCHEMA as any,
        temperature: 0.15,
      },
    });
    creditsUsed += CREDIT_COST.quiz_generation;
    await logUsage({
      teacherId: input.teacherId,
      kind: "image_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.quiz_generation,
      success: true,
      requestSummary: `qc.scene.items (${targets.length})`,
    });

    const parsed = JSON.parse(response.text ?? "{}") as {
      setting_present?: "yes" | "no" | "partial";
      setting_evidence?: string;
      items?: { target: string; verdict: "yes" | "no" | "partial"; evidence: string }[];
    };

    if (input.spec.setting) {
      const v = parsed.setting_present ?? "partial";
      checks.push({
        name: "image.spec.setting",
        severity: verdictToSeverity(v),
        message: `setting=${v} (${parsed.setting_evidence ?? "no evidence"})`,
      });
    }

    const verdicts = Array.isArray(parsed.items) ? parsed.items : [];
    for (let i = 0; i < input.spec.characters.length; i++) {
      const c = input.spec.characters[i];
      const v = verdicts[i] ?? { target: describeCharacterTarget(c), verdict: "no", evidence: "(missing from response)" };
      checks.push({
        name: `image.spec.character_${slug(c.species)}`,
        severity: verdictToSeverity(v.verdict),
        message: `${v.target}: ${v.verdict} — ${v.evidence}`,
      });
    }

    return { checks, creditsUsed };
  } catch (e: any) {
    trackError(e, { route: "qc.scene.perItem", userId: input.teacherId });
    checks.push({
      name: "image.spec.error",
      severity: "warn",
      message: `Per-item check threw: ${e?.message ?? e}`,
    });
    return { checks, creditsUsed };
  }
}

/**
 * Public entry — runs both layers and returns flat checks. The caller
 * (runFullQuizQc) splices these into the qc_report alongside the
 * legacy image.judge. Each layer is independent: a failure of one
 * doesn't short-circuit the other (visibility wins).
 */
export async function qcImageStructured(input: {
  teacherId: string;
  imageUrl: string;
  spec: SceneSpec;
}): Promise<{ checks: QcCheck[]; creditsUsed: number }> {
  const fetched = await fetchImageBase64(input.imageUrl);
  if (!fetched.ok) {
    return {
      checks: [
        {
          name: "image.spec.fetch",
          severity: "fail",
          message: fetched.error,
        },
      ],
      creditsUsed: 0,
    };
  }

  // Run both checks in parallel — independent, ~2× faster wall-clock.
  const [self, perItem] = await Promise.all([
    selfConsistencyCheck({
      teacherId: input.teacherId,
      base64: fetched.base64,
      mimeType: fetched.mimeType,
      spec: input.spec,
    }),
    perItemCheck({
      teacherId: input.teacherId,
      base64: fetched.base64,
      mimeType: fetched.mimeType,
      spec: input.spec,
    }),
  ]);

  return {
    checks: [...self.checks, ...perItem.checks],
    creditsUsed: self.creditsUsed + perItem.creditsUsed,
  };
}

// ─── helpers ────────────────────────────────────────────────────────

function severity(intended: "fail" | "warn"): QcSeverity {
  // Shadow-warn rollout: anything we'd normally fail becomes a warn
  // until the new judges have proven their precision.
  if (SHADOW_MODE && intended === "fail") return "warn";
  return intended;
}

function verdictToSeverity(v: "yes" | "no" | "partial"): QcSeverity {
  if (v === "yes") return "pass";
  if (v === "partial") return severity("warn");
  return severity("fail");
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
}
