/** A caption is not playback ownership: question text may contain the answer.
 * Only explicit candidate playback (replay or the authored choice queue) may
 * highlight a candidate. Keep case and punctuation checks on the owned clip.
 */
export function spokenChoiceId(
  options: { id: string; label: string; spoken?: string }[],
  narration: { caption: string; activeWord: number; speaking: boolean; choiceId?: string | null } | undefined,
): string | null {
  if (!narration?.speaking || narration.choiceId == null) return null;
  return options.find((option) => option.id === narration.choiceId &&
    (option.spoken ?? option.label) === narration.caption)?.id ?? null;
}

/** Matching tiles and sorting bins share the same explicit playback owner. */
export function itemNarrationCaption(
  id: string,
  narration: { caption: string; speaking: boolean; choiceId?: string | null } | undefined,
): string {
  return narration?.speaking && narration.choiceId === id ? narration.caption : "";
}
