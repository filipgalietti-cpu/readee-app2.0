/**
 * CCSS standard descriptions + K-grade reference questions.
 *
 * Two reasons regen prompts get higher quality when these are
 * loaded:
 *
 *   1. CCSS description anchors the AI on what the question is
 *      actually meant to test. Without it, the regen drifts —
 *      it knows the rejection reason but not the underlying skill.
 *
 *   2. A same-domain K reference question shows the AI the bar
 *      Filip already audited. K-grade items are the only fully
 *      hand-reviewed corpus — every other regen should look like
 *      a grade-up version of those.
 *
 * Both reads are O(1) after the first call thanks to module-level
 * caching of the merged catalog.
 */
// Marker import removed: `server-only` isn't installed and breaks
// CLI scripts that import this transitively. The module is read-only
// catalog data so client exposure isn't a security concern; Next's
// bundler still tree-shakes it from client builds.

import kJson from "@/app/data/kindergarten-standards-questions.json";
import g1Json from "@/app/data/1st-grade-standards-questions.json";
import g2Json from "@/app/data/2nd-grade-standards-questions.json";
import g3Json from "@/app/data/3rd-grade-standards-questions.json";
import g4Json from "@/app/data/4th-grade-standards-questions.json";

type Standard = {
  standard_id: string;
  standard_description?: string;
  domain?: string;
  parent_tip?: string;
  questions?: Array<{
    id: string;
    type?: string;
    prompt?: string;
    choices?: string[];
    correct?: string;
    hint?: string;
    difficulty?: number;
  }>;
};

type Bank = { standards?: Standard[] };

const BANKS: Array<{ grade: "K" | "1" | "2" | "3" | "4"; bank: Bank }> = [
  { grade: "K", bank: kJson as unknown as Bank },
  { grade: "1", bank: g1Json as unknown as Bank },
  { grade: "2", bank: g2Json as unknown as Bank },
  { grade: "3", bank: g3Json as unknown as Bank },
  { grade: "4", bank: g4Json as unknown as Bank },
];

let descByStdId: Map<string, { description: string; domain: string }> | null = null;
let kStdsByDomain: Map<string, Standard[]> | null = null;

function buildIndex() {
  descByStdId = new Map();
  kStdsByDomain = new Map();
  for (const { grade, bank } of BANKS) {
    for (const s of bank.standards ?? []) {
      if (s.standard_id) {
        descByStdId.set(s.standard_id, {
          description: s.standard_description ?? "",
          domain: s.domain ?? "",
        });
      }
      if (grade === "K" && s.standard_id) {
        const dom = standardPrefix(s.standard_id);
        if (!kStdsByDomain.has(dom)) kStdsByDomain.set(dom, []);
        kStdsByDomain.get(dom)!.push(s);
      }
    }
  }
}

/** Returns "RL", "RI", "RF", "L", etc. — the first dotted segment. */
function standardPrefix(standardId: string): string {
  return standardId.split(".")[0] ?? "";
}

/**
 * "Reading: Literature, Standard 1: Ask and answer questions about
 * key details in a text." — pulled from the same JSON the curriculum
 * builder uses. Returns empty string if the standard isn't in the
 * catalog (unknown or future standard).
 */
export function getStandardDescription(standardId: string): string {
  if (!descByStdId) buildIndex();
  return descByStdId!.get(standardId)?.description ?? "";
}

export function getStandardDomain(standardId: string): string {
  if (!descByStdId) buildIndex();
  return descByStdId!.get(standardId)?.domain ?? "";
}

/**
 * Pick a K-grade question from the same domain (RL/RI/RF/L) as the
 * standard being regenerated. Used as a few-shot reference so the
 * AI matches the audited K bar.
 *
 * Strategy: prefer a question of the same `type` (multiple_choice,
 * missing_word, etc) so the example transfers cleanly. Fall back
 * to any K question in the same domain if no type match exists.
 *
 * Returns null if no K question fits — caller should skip the
 * few-shot rather than send a confusing example.
 */
export function getKReferenceQuestion(input: {
  standardId: string;
  preferType?: string;
}): {
  standardId: string;
  type: string;
  prompt: string;
  choices: string[];
  correct: string;
  hint: string;
} | null {
  if (!kStdsByDomain) buildIndex();
  const dom = standardPrefix(input.standardId);
  const stds = kStdsByDomain!.get(dom) ?? [];
  if (stds.length === 0) return null;

  // Walk standards in order; for each, prefer a question of the
  // requested type. First match wins.
  for (const s of stds) {
    const qs = s.questions ?? [];
    const candidates = input.preferType
      ? qs.filter((q) => q.type === input.preferType)
      : qs;
    const pick = candidates[0];
    if (pick && pick.prompt && Array.isArray(pick.choices) && pick.choices.length > 0) {
      return {
        standardId: s.standard_id ?? "",
        type: pick.type ?? "multiple_choice",
        prompt: pick.prompt,
        choices: pick.choices,
        correct: pick.correct ?? pick.choices[0],
        hint: pick.hint ?? "",
      };
    }
  }

  // Fallback: any K question with any type that has choices.
  for (const s of stds) {
    for (const q of s.questions ?? []) {
      if (q.prompt && Array.isArray(q.choices) && q.choices.length > 0) {
        return {
          standardId: s.standard_id ?? "",
          type: q.type ?? "multiple_choice",
          prompt: q.prompt,
          choices: q.choices,
          correct: q.correct ?? q.choices[0],
          hint: q.hint ?? "",
        };
      }
    }
  }
  return null;
}

/**
 * Format CCSS context + K reference into a prompt fragment ready
 * to drop into any regen prompt. Returns empty string if neither
 * piece is available, so callers can unconditionally append it.
 */
export function ccssAndKReferenceFragment(input: {
  standardId: string;
  preferType?: string;
}): string {
  const desc = getStandardDescription(input.standardId);
  const ref = getKReferenceQuestion(input);
  const parts: string[] = [];
  if (desc) {
    parts.push(
      `CCSS standard ${input.standardId}:\n  ${desc}`,
    );
  }
  if (ref) {
    parts.push(
      `Reference K-grade question for the same domain (this is the audited quality bar):
  Standard: ${ref.standardId}
  Type: ${ref.type}
  Prompt: ${ref.prompt}
  Choices: ${ref.choices.join(" | ")}
  Correct: ${ref.correct}${ref.hint ? `\n  Hint: ${ref.hint}` : ""}`,
    );
  }
  return parts.join("\n\n");
}
