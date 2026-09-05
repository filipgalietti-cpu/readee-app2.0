import { z } from "zod";

/**
 * What the placement runner hands to POST /api/placement/complete.
 *
 * ‼️ Zod objects STRIP unknown keys. Every field the runner sends must be
 * declared here or it is silently dropped before `decidePlacement` ever sees
 * it - which is exactly how the one-minute rate window died in production:
 * the runner sent it, `decide.ts` read it, and this schema ate it in between.
 * Adding a field to the runner means adding it here in the same change.
 */
const Count = z.object({ correct: z.number().int().min(0), total: z.number().int().min(0) });
const Band = z.number().int().min(0).max(5);

export const PlacementSubmissionSchema = z.object({
  childId: z.string().uuid(),
  enrolled: z.number().int().min(0).max(4),
  ladder: z.object({
    enrolled: z.number().int().min(0).max(4),
    current: Band,
    phase: z.enum(["seeking", "climbing", "descending", "done"]),
    done: z.boolean(),
    lists: z.array(z.object({
      band: Band,
      attempts: z.array(z.object({ word: z.string().max(40), correct: z.boolean() })).max(20),
      correct: z.number().int().min(0),
      missed: z.number().int().min(0),
      complete: z.boolean(),
      passed: z.boolean(),
    })).max(8),
  }),
  passages: z.array(z.object({
    band: Band,
    wordsCorrect: z.number().int().min(0),
    wordsTotal: z.number().int().min(0),
    durationSeconds: z.number().min(0).max(600),
    prosody: z.number().nullable().optional(),
    // The DIBELS rate window: words read correctly by the one-minute mark, and
    // how long that window actually lasted (60, or less when the child finished
    // sooner). Bounds mirror durationSeconds on purpose - a tighter cap would
    // turn a stray timing value into a 400 for a child mid-assessment, which is
    // a worse failure than a slightly odd rate.
    minuteWordsCorrect: z.number().int().min(0).optional(),
    minuteSeconds: z.number().min(0).max(600).optional(),
  })).max(3),
  comprehension: Count.extend({ band: Band }).nullable(),
  foundations: z.object({ letterSounds: Count, blending: Count, nonsenseWords: Count }).nullable(),
  moments: z.array(z.record(z.string(), z.unknown())).max(40),
  durationSeconds: z.number().min(0).max(3600),
  passageRecordingPath: z.string().max(200).nullable().optional(),
});

export type PlacementSubmissionZ = z.infer<typeof PlacementSubmissionSchema>;
