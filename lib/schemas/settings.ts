import { z } from "zod";

export const ChildCreateSchema = z.object({
  parent_id: z.string(),
  first_name: z.string().min(1).max(50),
  grade: z.string(),
});

export const ChildUpdateSchema = z.object({
  first_name: z.string().min(1).max(50).optional(),
  grade: z.string().optional(),
  reading_level: z.string().nullable().optional(),
});

export const PreferencesSchema = z.object({
  soundEffects: z.boolean(),
  autoAdvance: z.boolean(),
  darkMode: z.boolean().optional(),
});

export type ChildCreateZ = z.infer<typeof ChildCreateSchema>;
export type ChildUpdateZ = z.infer<typeof ChildUpdateSchema>;
export type PreferencesZ = z.infer<typeof PreferencesSchema>;
