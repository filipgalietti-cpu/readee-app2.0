import { z } from "zod";

export const FeedbackCategorySchema = z.enum([
  "bug",
  "feature",
  "content",
  "general",
  "praise",
]);

export const FeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  category: FeedbackCategorySchema,
  message: z.string().nullable().optional(),
});

export type FeedbackZ = z.infer<typeof FeedbackSchema>;
