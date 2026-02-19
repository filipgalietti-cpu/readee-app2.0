import { z } from "zod";

export const ChildSchema = z.object({
  id: z.string(),
  parent_id: z.string(),
  first_name: z.string(),
  grade: z.string().nullable(),
  reading_level: z.string().nullable(),
  xp: z.number(),
  stories_read: z.number(),
  streak_days: z.number(),
  last_lesson_at: z.string().nullable(),
  created_at: z.string(),
});

export type ChildZ = z.infer<typeof ChildSchema>;
