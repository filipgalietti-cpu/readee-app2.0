import { z } from "zod";

export const ENROLLMENT_GRADES = [
  { label: "K", value: "Kindergarten" },
  { label: "1st", value: "1st" },
  { label: "2nd", value: "2nd" },
  { label: "3rd", value: "3rd" },
  { label: "4th", value: "4th" },
] as const;

/** Enrollment is supplied by the parent; a missing grade is never kindergarten. */
export const ReaderSetupSchema = z.object({
  requestId: z.string().uuid(),
  first_name: z.string().trim().max(50).transform((name) => name || "Reader"),
  grade: z.enum(["Kindergarten", "1st", "2nd", "3rd", "4th"]),
});
export type ReaderSetupInput = z.input<typeof ReaderSetupSchema>;
export const readerDraftKey = (parentId: string) => `readee.reader-setup.${parentId}`;
