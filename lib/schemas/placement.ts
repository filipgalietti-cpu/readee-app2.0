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
  evidenceVersion: z.union([z.literal(3), z.literal(4)]).optional(),
  spectrum: z
    .object({
      readingStopped: z
        .object({ passageId: z.string().max(80), reason: z.literal("child-pass") })
        .optional(),
      words: z.array(z.object({ itemId: z.string().max(80), correct: z.boolean() })).max(60),
      blending: z.array(z.object({ itemId: z.string().max(80), correct: z.boolean() })).max(3),
      language: z
        .array(z.object({ itemId: z.string().max(100), choiceId: z.string().max(10) }))
        .max(10),
      reading: z
        .array(
          z.object({
            passageId: z.string().max(80),
            speech: z.object({
              band: z.number().int().min(0).max(4),
              wordsCorrect: z.number().int().min(0),
              wordsTotal: z.number().int().min(1),
              durationSeconds: z.number().positive().max(600),
              prosody: z.number().nullable().optional(),
              minuteWordsCorrect: z.number().int().min(0).optional(),
              minuteSeconds: z.number().positive().max(60).optional(),
            }),
            choices: z
              .array(z.object({ itemId: z.string().max(100), choiceId: z.string().max(10) }))
              .length(3),
          }),
        )
        .max(10),
    })
    .optional(),
  comprehensionChecks: z
    .array(Count.extend({ band: Band }))
    .max(5)
    .optional(),
  childId: z.string().uuid(),
  sessionId: z.string().uuid().optional(),
  enrolled: z.number().int().min(0).max(4),
  ladder: z.object({
    enrolled: z.number().int().min(0).max(4),
    current: Band,
    phase: z.enum(["seeking", "climbing", "descending", "done"]),
    done: z.boolean(),
    lists: z
      .array(
        z.object({
          band: Band,
          attempts: z.array(z.object({ word: z.string().max(40), correct: z.boolean() })).max(20),
          correct: z.number().int().min(0),
          missed: z.number().int().min(0),
          complete: z.boolean(),
          passed: z.boolean(),
        }),
      )
      .max(8),
  }),
  passages: z
    .array(
      z.object({
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
      }),
    )
    .max(5),
  comprehension: Count.extend({ band: Band }).nullable(),
  foundations: z.object({ letterSounds: Count, blending: Count, nonsenseWords: Count }).nullable(),
  moments: z.array(z.record(z.string(), z.unknown())).max(40),
  durationSeconds: z.number().min(0).max(3600),
  passageRecordingPath: z.string().max(200).nullable().optional(),
});

export type PlacementSubmissionZ = z.infer<typeof PlacementSubmissionSchema>;
