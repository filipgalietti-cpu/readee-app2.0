import { createClient } from "@/lib/supabase/server";
import phonicsJson from "@/app/data/luna-phonics.json";
import { grades, gradeOrder } from "@/lib/assessment/questions";

type Pattern = {
  id: string;
  grade: string;
  order: number;
  label: string;
  ccss: string;
  focus: string;
  exampleWords: string[];
};

const PHONICS = (phonicsJson as { patterns: Pattern[] }).patterns;

export type TargetPattern = { id: string; label: string; focus: string };

/** Map a child's stored grade ("Kindergarten"/"1st"/"pre-k"...) → token. */
export function gradeToken(g: string | null): string {
  const s = (g ?? "").toLowerCase();
  if (s.startsWith("1") || s.includes("first")) return "1st";
  if (s.startsWith("2") || s.includes("second")) return "2nd";
  if (s.startsWith("3") || s.includes("third")) return "3rd";
  if (s.startsWith("4") || s.includes("fourth")) return "4th";
  return "K";
}

/**
 * The grade token Luna should TEACH at. Reading level is placement-owned and
 * authoritative app-wide (lessons/practice/journey all anchor on it) - a 3rd
 * grader placed at a 1st-grade reading level must get 1st-grade decodables,
 * not their enrollment grade's. Falls back to the school grade when the child
 * has no placement yet. Orion's performance guard then adjusts from THIS
 * anchor (frustration-level accuracy steps down one more).
 */
export function readingGradeToken(readingLevel: string | null, grade: string | null): string {
  const lvl = (readingLevel ?? "").trim();
  if (lvl) {
    // Only trust an exact match against the placement level names — the mapper
    // defaults unknowns to kindergarten, which would sandbag typo'd data.
    const key = gradeOrder.find((k) => grades[k]?.reading_level_name === lvl);
    if (key) return key === "kindergarten" || key === "pre-k" ? "K" : key;
  }
  return gradeToken(grade);
}

/**
 * The phonics pattern a child most needs to practice next for their grade:
 * unattempted (in teaching order) → due for review → weakest mastery. This is
 * the same adaptive ranking the Luna reader uses to order passages, distilled
 * to the single top pattern so a generated story can drill exactly the right
 * sound (its `focus` string is fed to generatePassage's phonicsPattern).
 *
 * Returns null if the grade has no patterns yet (generator then stays
 * grade-decodable without a specific target).
 */
export async function getTargetPattern(
  childId: string,
  gradeTok: string,
): Promise<TargetPattern | null> {
  const gradePatterns = PHONICS.filter((p) => p.grade === gradeTok);
  if (gradePatterns.length === 0) return null;

  const supabase = await createClient();
  const { data: skills } = await supabase
    .from("child_skill_memory")
    .select("standard_id, total_correct, total_attempted, next_due")
    .eq("child_id", childId)
    .in(
      "standard_id",
      gradePatterns.map((p) => p.id),
    );

  const sm = new Map(
    (skills ?? []).map(
      (s: {
        standard_id: string;
        total_correct: number;
        total_attempted: number;
        next_due: string | null;
      }) => [s.standard_id, s],
    ),
  );
  const now = Date.now();
  const attempted = (id: string) => {
    const s = sm.get(id);
    return !!s && (s.total_attempted ?? 0) > 0;
  };
  const mastery = (id: string) => {
    const s = sm.get(id);
    return s && s.total_attempted > 0 ? s.total_correct / s.total_attempted : 0;
  };
  const due = (id: string) => {
    const s = sm.get(id);
    return s && s.next_due ? new Date(s.next_due).getTime() <= now : true;
  };

  const ranked = [...gradePatterns].sort((a, b) => {
    const au = !attempted(a.id),
      bu = !attempted(b.id);
    if (au !== bu) return au ? -1 : 1; // unattempted first
    if (au && bu) return a.order - b.order; // both new → teaching order
    const ad = due(a.id),
      bd = due(b.id);
    if (ad !== bd) return ad ? -1 : 1; // due first
    return mastery(a.id) - mastery(b.id); // weakest first
  });

  const top = ranked[0];
  return top ? { id: top.id, label: top.label, focus: top.focus } : null;
}
