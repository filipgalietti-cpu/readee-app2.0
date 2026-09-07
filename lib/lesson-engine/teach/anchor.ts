import { alignTextToTimings, type WordTiming } from "@/lib/lesson-engine/cues";

/**
 * WHEN a teaching step happens, resolved against the narration.
 *
 * The engine used to derive one timestamp per scene by finding the starred word
 * of `fx.text` inside the script, and `return 0` when it could not. Three
 * failures, all measured across the catalogue:
 *
 *   - Silent no-match fired the reveal at MOUNT. `magic-teams` marks the digraph
 *     `**ai**`, which never appears as a word in "Two vowels sit side by side,
 *     the a and the i", so the underline drew at 0.9s and the screen sat frozen
 *     for the remaining 30 seconds while the voice did all the teaching.
 *   - First-occurrence matching landed on the wrong mention - a throwaway
 *     "because" celebrated 30 seconds before the one being taught.
 *   - `resolveCueTime` matches with startsWith, so an anchor on "run" would fire
 *     on "runs".
 *
 * Three decisions follow from that, and they are the whole design:
 *
 *   1. ANCHORS ARE PHRASES, TARGETS ARE IDS, and they are decoupled. A phonics
 *      step can fire on the spoken clause "the first one does the talking" while
 *      acting on the letter `a` - two things sharing no characters. Marking the
 *      thing and saying the thing are different questions.
 *   2. EXACT WORD EQUALITY, never prefix. "run" does not match "runs", which in
 *      a grammar lesson about exactly that distinction is not a detail.
 *   3. NO MATCH DROPS THE STEP. Firing at zero is the worse failure: it spends
 *      the scene's whole visual budget before the explanation starts, and then
 *      there is nothing left to show. A step that cannot be placed does not run.
 */

export type Anchor =
  | number // absolute seconds into the narration
  | { at: string; nth?: number; align?: "start" | "end"; lead?: number }
  | { after: string; ms: number }; // relative to another step's id

/** Default pre-roll so a visual leads the voice slightly, matching resolveCueTime. */
const LEAD_MS = 120;

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, "");

/** Every contiguous run in `words` equal to `phrase`. Exact equality only. */
export function findPhrase(words: string[], phrase: string[]): number[] {
  if (!phrase.length) return [];
  const hits: number[] = [];
  for (let i = 0; i + phrase.length <= words.length; i++) {
    let ok = true;
    for (let j = 0; j < phrase.length; j++) {
      if (words[i + j] !== phrase[j]) {
        ok = false;
        break;
      }
    }
    if (ok) hits.push(i);
  }
  return hits;
}

export type AnchorProblem = {
  stepId?: string;
  anchor: string;
  reason: "not-found" | "ambiguous";
  matches: number;
};

/**
 * Resolve anchors to milliseconds. Steps whose anchor cannot be placed come back
 * as null and MUST be skipped by the caller rather than defaulted to 0.
 *
 * Results are clamped monotonic: a step can never be scheduled before the one
 * before it, so a mis-ordered anchor degrades to "at the same moment" instead of
 * playing the explanation backwards.
 */
export function resolveAnchors(
  anchors: { id?: string; anchor: Anchor }[],
  script: string | undefined,
  words: WordTiming[] | undefined,
): { atMs: (number | null)[]; problems: AnchorProblem[] } {
  const problems: AnchorProblem[] = [];
  const atMs: (number | null)[] = anchors.map(() => null);
  if (!anchors.length) return { atMs, problems };

  const scriptWords = script ? script.split(/\s+/).map(norm).filter(Boolean) : [];
  const starts = script && words?.length ? alignTextToTimings(script, words) : [];
  const byId = new Map<string, number>();

  anchors.forEach((a, i) => {
    if (a.id) byId.set(a.id, i);
  });

  anchors.forEach((entry, i) => {
    const a = entry.anchor;

    if (typeof a === "number") {
      atMs[i] = Math.max(0, Math.round(a * 1000));
      return;
    }

    if ("after" in a) {
      const base = byId.get(a.after);
      const baseMs = base != null ? atMs[base] : null;
      atMs[i] = baseMs == null ? null : baseMs + a.ms;
      if (atMs[i] == null) problems.push({ stepId: entry.id, anchor: a.after, reason: "not-found", matches: 0 });
      return;
    }

    if (!scriptWords.length || !starts.length) return;

    const phrase = a.at.split(/\s+/).map(norm).filter(Boolean);
    const hits = findPhrase(scriptWords, phrase);

    if (hits.length === 0) {
      // Dropped on purpose. See the header: early is worse than absent.
      problems.push({ stepId: entry.id, anchor: a.at, reason: "not-found", matches: 0 });
      return;
    }
    if (hits.length > 1 && a.nth == null) {
      // Runtime takes the first so the lesson still plays; lint fails the build
      // so an author is told which mention they meant.
      problems.push({ stepId: entry.id, anchor: a.at, reason: "ambiguous", matches: hits.length });
    }

    const pick = a.nth == null ? 0 : a.nth === -1 ? hits.length - 1 : a.nth - 1;
    const start = hits[Math.min(Math.max(pick, 0), hits.length - 1)];
    const wordIdx = a.align === "end" ? start + phrase.length - 1 : start;
    const sec = starts[wordIdx];
    if (sec == null) return;
    atMs[i] = Math.max(0, Math.round(sec * 1000) - (a.lead ?? LEAD_MS));
  });

  // Monotonic: the explanation only moves forward.
  let last = 0;
  for (let i = 0; i < atMs.length; i++) {
    if (atMs[i] == null) continue;
    atMs[i] = Math.max(atMs[i] as number, last);
    last = atMs[i] as number;
  }
  return { atMs, problems };
}
