import { z } from "zod";

export const QuestionSchema = z.object({
  id: z.string(),
  type: z.string(),                           // "multiple_choice" | "sentence_build"
  prompt: z.string(),
  choices: z.array(z.string()).optional(),     // not used by sentence_build
  correct: z.string(),
  hint: z.string(),
  difficulty: z.number(),
  audio_url: z.string().optional(),
  hint_audio_url: z.string().optional(),
  words: z.array(z.string()).optional(),       // scrambled word chips for sentence_build
  sentence_hint: z.string().optional(),        // contextual hint for sentence_build
  sentence_audio_url: z.string().optional(),  // audio of completed sentence
  categories: z.array(z.string()).optional(),  // bucket names for category_sort
  category_items: z.record(z.string(), z.array(z.string())).optional(), // correct mapping
  items: z.array(z.string()).optional(),       // flat shuffled list for category_sort
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
