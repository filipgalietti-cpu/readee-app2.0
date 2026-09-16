import "server-only";
import { z } from "zod";
import { packages } from "./packages";
import { unitExam } from "./exam";
import { practicePerformance } from "@/lib/lesson-engine/production/practice-performance";
const resultsSchema = z.array(
  z.object({
    itemId: z.string(),
    standard: z.string(),
    band: z.enum(["easier", "core", "harder", "challenging"]),
    outcome: z.enum(["correct", "incorrect", "assisted", "practice", "skipped", "unavailable"]),
  }),
);
/** Only persisted canonical result rows are accepted, never the browser's state. */
export function parentQuestionReport(lessonId: string, raw: unknown) {
  const parsed = resultsSchema.safeParse(raw);
  const pool = lessonId === "k-unit-1-checkpoint" ? unitExam().pool : packages[lessonId]?.pool;
  if (
    !parsed.success ||
    !pool ||
    !parsed.data.length ||
    parsed.data.some((r) => !pool.some((q) => q.id === r.itemId))
  )
    return null;
  return practicePerformance(pool, {
    asked: parsed.data.map((r) => r.itemId),
    results: parsed.data,
    finished: true,
  });
}
