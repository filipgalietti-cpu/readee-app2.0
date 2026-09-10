import { z } from "zod";
import { PlacementSubmissionSchema } from "@/lib/schemas/placement";
import {
  wordSearch,
  readingSearch,
  readingScore,
  languageSearch,
  ORAL_BLENDS,
  type ReadingTrial,
  type SpectrumEvidence,
} from "./spectrum";
import type { PlacedBand } from "./ladder";

// A draft is local, short-lived evidence, never a saved placement or a recording.
// Bump when authored content or the replay policy changes, so old answers cannot
// silently be applied to a different item or route.
export const CHECKPOINT_REVISION = 3;
const Evidence = PlacementSubmissionSchema.shape.spectrum.unwrap();
const ActiveReading = Evidence.shape.reading.element.extend({
  choices: z.array(Evidence.shape.reading.element.shape.choices.element).max(3),
});
const Checkpoint = z.object({
  revision: z.literal(CHECKPOINT_REVISION),
  childId: z.string().uuid(),
  enrolled: z.number().int().min(0).max(4),
  sessionId: z.string().uuid(),
  savedAt: z.number().finite(),
  elapsedSeconds: z.number().min(0).max(3600),
  spectrum: Evidence,
  activeReading: ActiveReading.nullable(),
});
export type SpectrumCheckpoint = Omit<
  z.infer<typeof Checkpoint>,
  "spectrum" | "activeReading" | "enrolled"
> & {
  spectrum: SpectrumEvidence;
  activeReading: ReadingTrial | null;
  enrolled: PlacedBand;
};
export const checkpointKey = (childId: string) => `readee.placement.progress.${childId}`;

/** Validate a prefix with the same replay functions used by completion. A
 * refresh during comprehension keeps the cold read and each committed choice;
 * unfinished microphone capture is retried, never synthesized into evidence. */
export function restoreSpectrumCheckpoint(
  raw: string | null,
  childId: string,
  enrolled: PlacedBand,
  now = Date.now(),
): SpectrumCheckpoint | null {
  try {
    const draft = Checkpoint.parse(JSON.parse(raw ?? "null")) as SpectrumCheckpoint;
    if (
      draft.childId !== childId ||
      draft.enrolled !== enrolled ||
      now - draft.savedAt > 24 * 3600_000 ||
      draft.savedAt > now + 60_000
    )
      return null;
    const ev = draft.spectrum;
    const w = wordSearch(enrolled, ev.words);
    const blends = w.done && w.grade <= 1 ? ORAL_BLENDS : [];
    if (ev.blending.length > blends.length || ev.blending.some((r, i) => r.itemId !== blends[i].id))
      return null;
    if (!w.done || ev.blending.length < blends.length) {
      if (ev.reading.length || ev.language.length || draft.activeReading || ev.readingStopped)
        return null;
      return draft;
    }
    const r = readingSearch(enrolled, ev.words, ev.reading, ev.readingStopped);
    if (draft.activeReading) {
      const active = draft.activeReading;
      if (!r.next || active.passageId !== r.next.id || ev.language.length) return null;
      // Fill only for validation of the partial item, never persist or score
      // these placeholders. Completed choices must match their actual key/order.
      const complete: ReadingTrial = {
        ...active,
        choices: r.next.questions.map(
          (q, i) => active.choices[i] ?? { itemId: q.id, choiceId: q.correctId },
        ),
      };
      readingScore(complete);
    }
    if (!r.done && ev.language.length) return null;
    if (r.done) languageSearch(Math.max(enrolled, r.confirmed ?? 0) as PlacedBand, ev.language);
    return draft;
  } catch {
    return null;
  }
}
