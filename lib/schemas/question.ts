import { z } from "zod";

export const QuestionSchema = z.object({
  id: z.string(),
  type: z.string(),
  prompt: z.string(),
  choices: z.array(z.string()).optional(),
  correct: z.string(),
  hint: z.string(),
  difficulty: z.number(),
  audio_url: z.string().optional(),
  hint_audio_url: z.string().optional(),
  passage_audio_url: z.string().optional(),
  choices_audio_urls: z.array(z.union([z.string(), z.null()])).optional(),
  words: z.array(z.string()).optional(),
  sentence_hint: z.string().optional(),
  sentence_audio_url: z.string().optional(),
  categories: z.array(z.string()).optional(),
  category_items: z.record(z.string(), z.array(z.string())).optional(),
  items: z.array(z.string()).optional(),
  left_items: z.array(z.string()).optional(),
  right_items: z.array(z.string()).optional(),
  correct_pairs: z.record(z.string(), z.string()).optional(),
  target_word: z.string().optional(),
  phonemes: z.array(z.string()).optional(),
  distractors: z.array(z.string()).optional(),
  sentence_words: z.array(z.string()).optional(),
  missing_choices: z.array(z.string()).optional(),
  blank_index: z.number().optional(),
  jumbled: z.string().optional(),              // space_insertion: no-space string
}).passthrough();                               // preserve any future fields

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
