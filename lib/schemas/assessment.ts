import { z } from "zod";

export const AssessmentAnswerSchema = z.object({
  question_id: z.string(),
  selected: z.string(),
  correct: z.string(),
  is_correct: z.boolean(),
});

// Per-dimension placement profile written alongside the legacy
// score_percent / reading_level_placed fields. Optional so existing
// callers and historical rows stay valid.
const DimensionKeyEnum = z.enum([
  "phonics",
  "vocabulary",
  "literal_comprehension",
  "inferential_comprehension",
  "fluency",
]);
export const DimensionScoreSchema = z.object({
  dimension: DimensionKeyEnum,
  gradeKey: z.string(),
  levelName: z.string(),
  scorePercent: z.number().int().min(0).max(100),
  itemsAttempted: z.number().int().nonnegative(),
  itemsCorrect: z.number().int().nonnegative(),
  hitCeiling: z.boolean(),
});
export const DimensionProfileSchema = z
  .record(DimensionKeyEnum, DimensionScoreSchema.nullable())
  .optional();

export const AssessmentResultSchema = z.object({
  child_id: z.string(),
  grade_tested: z.string(),
  score_percent: z.number().int().min(0).max(100),
  reading_level_placed: z.string(),
  answers: z.array(AssessmentAnswerSchema),
  dimension_profile: DimensionProfileSchema,
});

export type AssessmentAnswerZ = z.infer<typeof AssessmentAnswerSchema>;
export type AssessmentResultZ = z.infer<typeof AssessmentResultSchema>;
export type DimensionScoreZ = z.infer<typeof DimensionScoreSchema>;
