import type { IepGoal, GoalType } from "../actions";

const TYPE_LABEL: Record<GoalType, string> = {
  reading_fluency: "Reading fluency",
  comprehension: "Comprehension",
  phonics: "Phonics / decoding",
  vocabulary: "Vocabulary",
  writing: "Writing",
  speaking: "Speaking / listening",
  behavioral: "Behavioral",
  other: "Goal",
};

/**
 * Compact one-line label for a saved goal — used in the dropdowns on
 * Note + Plan tabs. Pasting the full goal text was useless (truncated
 * to "By June 30, 2026, given a grade-level..." — every goal starts
 * the same way). Type + target date disambiguates faster.
 */
export function goalLabel(g: IepGoal): string {
  const type = g.goalType ? TYPE_LABEL[g.goalType] : "Goal";
  if (g.targetDate) {
    const d = new Date(g.targetDate + "T00:00:00");
    if (!Number.isNaN(d.getTime())) {
      const fmt = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${type} · target ${fmt}`;
    }
  }
  // No target date — fall back to a short text snippet so two goals
  // of the same type are still distinguishable.
  const snippet = g.goalText.replace(/\s+/g, " ").slice(0, 60).trim();
  return `${type} · ${snippet}${g.goalText.length > 60 ? "…" : ""}`;
}
