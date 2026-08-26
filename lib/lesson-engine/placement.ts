import type { QuizDef, QuizQuestion, QuizResultItem } from "@/lib/lesson-engine/quiz";
import kBank from "@/app/data/kindergarten-standards-questions.json";
import g1Bank from "@/app/data/1st-grade-standards-questions.json";
import g2Bank from "@/app/data/2nd-grade-standards-questions.json";
import g3Bank from "@/app/data/3rd-grade-standards-questions.json";
import g4Bank from "@/app/data/4th-grade-standards-questions.json";

/**
 * PLACEMENT EXAM — grade-keyed adaptive staircase over the legacy question
 * banks (911+ vetted MCQs with audio/images/hints already in production).
 *
 * One GLOBAL difficulty axis 0-500: gradeIndex*100 + the bank's per-grade
 * adaptiveDifficulty (0-100). A kindergartner starts at ~15 (spoon-fed);
 * every correct climbs, every miss drops — so a 4th grader reading above
 * grade level rides the stairs into the hardest G4 items we own (~498).
 * Ceiling note: above-G4 "challenge band" content doesn't exist yet; until
 * minted, the ceiling is G4-hard.
 *
 * Output = a grade-level estimate (e.g. "Grade 2.4") + per-strand tallies,
 * ready to seed child_skill_memory when placement joins the real signup flow.
 */

type LegacyQ = {
  id: string; type: string; prompt: string; choices: string[]; correct: string;
  hint?: string; adaptiveDifficulty?: number; difficulty?: number;
  audio_url?: string; hint_audio_url?: string; image_url?: string;
  reveal_feedback?: string; reveal_feedback_audio_url?: string;
};
type LegacyBank = { standards: { standard_id: string; questions: LegacyQ[] }[] };

export type Strand = "RF" | "RL" | "RI" | "L";
export function strandOf(standardId: string): Strand {
  if (standardId.startsWith("RF")) return "RF";
  if (standardId.startsWith("RI")) return "RI";
  if (standardId.startsWith("RL")) return "RL";
  return "L";
}

const BANKS: [number, LegacyBank][] = [
  [0, kBank as unknown as LegacyBank],
  [1, g1Bank as unknown as LegacyBank],
  [2, g2Bank as unknown as LegacyBank],
  [3, g3Bank as unknown as LegacyBank],
  [4, g4Bank as unknown as LegacyBank],
];

export type PlacementQuestion = QuizQuestion & { globalDifficulty: number; standardId: string; strand: Strand };

let poolCache: PlacementQuestion[] | null = null;
export function placementPool(): PlacementQuestion[] {
  if (poolCache) return poolCache;
  const pool: PlacementQuestion[] = [];
  for (const [gradeIdx, bank] of BANKS) {
    for (const std of bank.standards) {
      for (const q of std.questions) {
        if (q.type !== "multiple_choice" || !Array.isArray(q.choices) || q.choices.length < 2) continue;
        const correctIdx = q.choices.indexOf(q.correct);
        if (correctIdx < 0) continue;
        const within = typeof q.adaptiveDifficulty === "number" ? q.adaptiveDifficulty : 50;
        pool.push({
          id: q.id,
          band: "core",
          difficulty: Math.round(within / 25) + 1, // engine's local 1-5; ladder uses globalDifficulty
          globalDifficulty: gradeIdx * 100 + Math.min(100, Math.max(0, within)),
          standardId: std.standard_id,
          strand: strandOf(std.standard_id),
          prompt: q.prompt,
          narration: q.audio_url ? { audio: q.audio_url, script: q.prompt } : undefined,
          image: q.image_url || undefined,
          hint: q.hint_audio_url ? { audio: q.hint_audio_url, script: q.hint ?? "" } : undefined,
          explain: q.reveal_feedback_audio_url ? { audio: q.reveal_feedback_audio_url, script: q.reveal_feedback ?? "" } : undefined,
          interaction: {
            type: "choose",
            options: q.choices.map((c, i) => ({ id: `o${i}`, label: c })),
            correctId: `o${correctIdx}`,
          },
        });
      }
    }
  }
  poolCache = pool;
  return pool;
}

export const PLACEMENT_ASK = 15;
const STEP_UP = 35;   // correct → climb (crushing it climbs a grade in ~3 Qs)
const STEP_DOWN = 28; // miss → ease off
const STRAND_CYCLE: Strand[] = ["RF", "RL", "RI", "L"];

export type PlacementEngine = {
  quiz: QuizDef;
  picker: (answered: QuizResultItem[], asked: QuizQuestion[], pool: QuizQuestion[]) => QuizQuestion | null;
  /** Grade-level estimate from the final ladder position, e.g. "Kindergarten" | "Grade 2.4". */
  resultNote: (results: QuizResultItem[]) => string;
  levelNow: () => number;
};

export function buildPlacement(gradeIdx: number): PlacementEngine {
  const all = placementPool();
  let level = Math.min(4, Math.max(0, gradeIdx)) * 100 + 15; // spoon-fed start for YOUR grade
  const trace: number[] = [level];

  const picker = (answered: QuizResultItem[], asked: QuizQuestion[], pool: QuizQuestion[]): QuizQuestion | null => {
    if (answered.length >= PLACEMENT_ASK) return null;
    // walk the ladder using the latest result
    const last = answered[answered.length - 1];
    if (last) {
      level = Math.min(495, Math.max(5, level + (last.correct ? STEP_UP : -STEP_DOWN)));
      trace.push(level);
    }
    const usable = pool as PlacementQuestion[];
    if (usable.length === 0) return null;
    // rotate strands for variety; fall back to any strand at the right height
    const wantStrand = STRAND_CYCLE[asked.length % STRAND_CYCLE.length];
    const ranked = [...usable].sort(
      (a, b) => Math.abs(a.globalDifficulty - level) - Math.abs(b.globalDifficulty - level),
    );
    return ranked.find((q) => q.strand === wantStrand) ?? ranked[0];
  };

  const resultNote = (results: QuizResultItem[]) => {
    // estimate from the back half of the ladder (where it converged), not the ramp-up
    const settled = trace.slice(Math.floor(trace.length / 2));
    const est = settled.reduce((s, v) => s + v, 0) / Math.max(1, settled.length) / 100;
    const label = est < 0.5 ? "Kindergarten" : `Grade ${Math.min(4.9, est).toFixed(1)}`;
    const right = results.filter((r) => r.correct).length;
    return `Reading level: ${label} · ${right} of ${results.length} correct`;
  };

  const quiz: QuizDef = {
    id: `placement-g${gradeIdx}`,
    lessonId: "placement",
    title: "Find My Level",
    standard: "PLACEMENT",
    askCount: PLACEMENT_ASK,
    adaptive: true, // ladder handled by the picker override
    questions: all,
  };

  return { quiz, picker, resultNote, levelNow: () => level };
}
