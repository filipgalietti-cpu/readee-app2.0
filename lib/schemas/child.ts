import { z } from "zod";

export const ChildSchema = z.object({
  id: z.string(),
  parent_id: z.string(),
  first_name: z.string(),
  grade: z.string().nullable(),
  reading_level: z.string().nullable(),
  carrots: z.preprocess((v) => Number(v) || 0, z.number()),
  stories_read: z.preprocess((v) => Number(v) || 0, z.number()),
  streak_days: z.preprocess((v) => Number(v) || 0, z.number()),
  last_lesson_at: z.string().nullable(),
  equipped_items: z.record(z.string(), z.string().nullable()).default({}),
  created_at: z.string(),
});

export type ChildZ = z.infer<typeof ChildSchema>;
