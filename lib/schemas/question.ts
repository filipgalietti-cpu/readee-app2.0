import { z } from "zod";

export const QuestionSchema = z.object({
  id: z.string(),
  type: z.string(),
  prompt: z.string(),
  choices: z.array(z.string()),
  correct: z.string(),
  hint: z.string(),
  difficulty: z.number(),
  audio_url: z.string().optional(),
});

export const StandardSchema = z.object({
  standard_id: z.string(),
  standard_description: z.string(),
  domain: z.string(),
  parent_tip: z.string(),
  questions: z.array(QuestionSchema),
});

export const StandardsFileSchema = z.object({
  standards: z.array(StandardSchema),
});

export type QuestionZ = z.infer<typeof QuestionSchema>;
export type StandardZ = z.infer<typeof StandardSchema>;
export type StandardsFileZ = z.infer<typeof StandardsFileSchema>;
