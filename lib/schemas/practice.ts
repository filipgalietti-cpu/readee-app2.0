import { z } from "zod";

export const AnswerRecordSchema = z.object({
  questionId: z.string(),
  correct: z.boolean(),
  selected: z.string(),
});

export const PracticeResultSchema = z.object({
  child_id: z.string(),
  standard_id: z.string(),
  questions_attempted: z.number().int().min(0),
  questions_correct: z.number().int().min(0),
  xp_earned: z.number().int().min(0),
});

export type AnswerRecordZ = z.infer<typeof AnswerRecordSchema>;
export type PracticeResultZ = z.infer<typeof PracticeResultSchema>;
