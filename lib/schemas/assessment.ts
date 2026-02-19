import { z } from "zod";

export const AssessmentAnswerSchema = z.object({
  question_id: z.string(),
  selected: z.string(),
  correct: z.string(),
  is_correct: z.boolean(),
});

export const AssessmentResultSchema = z.object({
  child_id: z.string(),
  grade_tested: z.string(),
  score_percent: z.number().int().min(0).max(100),
  reading_level_placed: z.string(),
  answers: z.array(AssessmentAnswerSchema),
});

export type AssessmentAnswerZ = z.infer<typeof AssessmentAnswerSchema>;
export type AssessmentResultZ = z.infer<typeof AssessmentResultSchema>;
