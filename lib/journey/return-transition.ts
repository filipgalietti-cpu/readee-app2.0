import type { buildAdventureView } from './adventure-view';

type ReturnModel = Pick<ReturnType<typeof buildAdventureView>, 'chapters' | 'completed' | 'current' | 'currentChapter'>;
/** Presentation only: never infer completion from the URL or choose new instruction. */
export function journeyReturnTransition(model: ReturnModel, completedId: string | null) {
  const settled = { startChapter: model.currentChapter, finishChapter: model.currentChapter, travel: null };
  if (!completedId || !model.completed.has(completedId)) return settled;
  const source = model.chapters.findIndex(chapter => chapter.lessonIds.includes(completedId));
  if (source < 0) return settled;
  const chapter = model.chapters[source];
  const index = chapter.lessonIds.indexOf(completedId);
  const adjacent = chapter.lessonIds[index + 1];
  // Replaying an earlier lesson must not animate toward an already-completed stop.
  const to = adjacent && model.current?.lessonId === adjacent ? adjacent
    : index === chapter.lessonIds.length - 1
      && chapter.lessonIds.every(id => model.completed.has(id))
      && (model.currentChapter > source || (!model.current && model.currentChapter === source))
        ? 'checkpoint' : null;
  if (!to) return settled;
  return {
    startChapter: source, finishChapter: model.currentChapter,
    travel: { from: completedId, to, serial: 1 },
  };
}
