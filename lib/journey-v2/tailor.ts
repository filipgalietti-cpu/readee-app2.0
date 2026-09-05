/**
 * TAILORING — what the placement decides about the shape of the journey,
 * beyond where it starts. Pure: decision in, tailoring out. Saved on the
 * placement plan (plan.tailoring) so the map, the runners, and the emails all
 * read the same cut.
 *
 * Three knobs, each tied to a field the decision already carries:
 *   credits    seeds the child PASSED → the lessons teaching those standards
 *              are set aside (hidden from the map, counted for the parent)
 *   difficulty where the questions start: easier / core / harder
 *   priority   which domains come first inside a unit (the child's top need)
 * and the parent-facing "why this plan" lines that describe the cut.
 */
import type { PlacementDecision } from "@/lib/placement/decide";
import { BAND_LABEL } from "@/lib/placement/ladder";

export type Difficulty = "easier" | "core" | "harder";
export type DomKey = "RL" | "RI" | "RF" | "L";

export interface JourneyTailoring {
  version: 1;
  /** Standards the placement proved (seed pass = true). Lessons covered by them are credited. */
  creditedStandards: string[];
  difficulty: Difficulty;
  /** Domains to play first inside each unit; empty = roadmap order. */
  priorityDomains: DomKey[];
  /** Parent-facing, one clause each, no numbers the plan does not own. */
  why: string[];
}

const ordinalGrade = (b: number) => (b === 0 ? "kindergarten" : `${BAND_LABEL[b as 0 | 1 | 2 | 3 | 4]} grade`);

export function difficultyFor(d: PlacementDecision): Difficulty {
  const frustration = d.fluency?.textLevel === "frustration";
  const foundationsNeed = d.needs.some((n) => /letter sounds|blending|sounding out/.test(n));
  if (d.decoding.ceilingPassed || d.relative.delta <= -1) return "harder";
  if (frustration || d.decoding.emergent || foundationsNeed || d.relative.delta >= 2) return "easier";
  return "core";
}

export function priorityDomainsFor(d: PlacementDecision): DomKey[] {
  // The first need is the loudest one (decide.ts lists foundations, then words, then fluency, then comprehension).
  for (const n of d.needs) {
    if (/understanding what they read/.test(n)) return ["RL", "RI"];
    if (/reading speed|accurate reading|letter sounds|blending|sounding out|-grade words/.test(n)) return ["RF"];
  }
  return [];
}

export function tailor(d: PlacementDecision, opts: { childName?: string; creditedLessons?: number } = {}): JourneyTailoring {
  const name = opts.childName ?? "Your child";
  const creditedStandards = d.seeds.filter((s) => s.pass).map((s) => s.standard_id);
  const difficulty = difficultyFor(d);
  const priorityDomains = priorityDomainsFor(d);

  const why: string[] = [];
  why.push(d.relative.delta === 0 ? `${name} placed at ${ordinalGrade(d.placedBand)}, right on grade level.` : `${name} placed at ${ordinalGrade(d.placedBand)}, ${d.relative.label}.`);
  if (opts.creditedLessons && opts.creditedLessons > 0) why.push(`We set aside ${opts.creditedLessons} ${opts.creditedLessons === 1 ? "lesson" : "lessons"} ${name} already proved in the placement.`);
  if (priorityDomains.length) {
    const need = d.needs[0].replace(/^(\w)/, (m) => m.toLowerCase());
    // Per unit, not per lesson: a unit whose word work was all credited simply starts with the rest.
    why.push(priorityDomains[0] === "RF" ? `Word and sound lessons come first in every unit that has them. The biggest need: ${need}.` : `Story and fact lessons come first in every unit that has them. The biggest need: ${need}.`);
  }
  if (difficulty === "harder") why.push("Questions start on the harder band.");
  else if (difficulty === "easier") why.push("Questions start on the easier band and climb as the answers come.");
  return { version: 1, creditedStandards, difficulty, priorityDomains, why };
}
