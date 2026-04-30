/**
 * Brand-voice exemplars to seed every factory prompt.
 *
 * Without exemplars, AI output drifts toward generic ChatGPT prose.
 * Seeding 2-3 best-of passages from our existing 25 stories trains
 * the model on Readee's specific tone: warm, concrete, K-4 vocab,
 * one-idea-per-sentence, kid-perspective rather than narrator-lecture.
 *
 * Exemplars are picked manually (not AI-derived) so we control the
 * brand voice. Update this list when we publish new passages we love.
 */

import storiesBank from "@/scripts/stories-bank.json";

type Story = {
  id?: string;
  grade?: string;
  title?: string;
  body?: string;
  text?: string;
};

/**
 * Hand-picked story IDs that exemplify Readee voice. Update as we
 * publish new ones we love. If an ID isn't in the bank, fallback
 * picks the first available story for that grade.
 */
const EXEMPLAR_IDS: { K: string[]; "1st": string[]; "2nd": string[]; "3rd": string[]; "4th": string[] } = {
  K: ["k-pet-mat", "k-bug-cup"],
  "1st": ["g1-rain-day", "g1-sock-search"],
  "2nd": ["g2-tide-pool", "g2-class-vote"],
  "3rd": ["g3-park-ranger", "g3-cookie-jar"],
  "4th": ["g4-time-capsule", "g4-bike-trip"],
};

function safeStoryBody(s: Story | undefined): string | null {
  if (!s) return null;
  const body = s.body ?? s.text ?? null;
  if (!body || typeof body !== "string") return null;
  // Trim to a reasonable preview for the prompt — 600 chars is enough
  // to convey voice without bloating tokens.
  return body.slice(0, 600).trim();
}

/**
 * Returns 1-3 exemplar passage bodies for the given grade band, ready
 * to drop into a prompt's "Here's our brand voice — match this tone:"
 * section.
 */
export function getBrandVoiceExemplars(grade: string): string[] {
  const bank = storiesBank as unknown as { stories?: Story[] } | Story[];
  const stories: Story[] = Array.isArray(bank) ? bank : (bank.stories ?? []);
  const byId = new Map<string, Story>(
    stories.map((s) => [String(s.id ?? ""), s as Story]),
  );
  const ids = (EXEMPLAR_IDS as any)[grade] as string[] | undefined;
  const out: string[] = [];
  if (ids) {
    for (const id of ids) {
      const body = safeStoryBody(byId.get(id));
      if (body) out.push(body);
    }
  }
  // Fallback: first 2 stories for that grade.
  if (out.length === 0) {
    const matching = stories.filter(
      (s) => s.grade === grade && !!safeStoryBody(s),
    );
    for (const s of matching.slice(0, 2)) {
      const body = safeStoryBody(s);
      if (body) out.push(body);
    }
  }
  return out;
}

/**
 * Pre-formatted exemplar block for system prompts. Reads:
 *
 *   Brand voice — match this tone (warm, concrete, K-4 vocabulary,
 *   one idea per sentence, kid-perspective):
 *
 *   ── Example 1 ──
 *   {body}
 *
 *   ── Example 2 ──
 *   {body}
 */
export function brandVoicePromptBlock(grade: string): string {
  const exemplars = getBrandVoiceExemplars(grade);
  if (exemplars.length === 0) return "";
  const blocks = exemplars.map((b, i) => `── Example ${i + 1} ──\n${b}`).join("\n\n");
  return `Brand voice — match this tone (warm, concrete, K-4 vocabulary, one idea per sentence, kid-perspective):\n\n${blocks}`;
}
