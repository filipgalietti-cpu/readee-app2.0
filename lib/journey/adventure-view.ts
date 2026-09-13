import type { JourneySnapshot } from './types';
import { assignedJourneyCatalog } from './next-lesson';
import { freeJourneyLesson, lessonCompleted } from './lesson-access';
import { lessonPurpose } from './lesson-purpose';

export type JourneyTheme = 'garden' | 'woods' | 'valley';
export type AdventureLesson = {
  nodeId: string;
  lessonId: string;
  title: string;
  objective?: string;
  icon: 'memo' | 'musical-note' | 'magnifying-glass' | 'open-book' | 'newspaper' | 'seedling';
  shape: 'page' | 'garden' | 'sign';
  available: boolean;
};
export type AdventureChapter = {
  id: string;
  name: string;
  subtitle: string;
  theme: JourneyTheme;
  lessonIds: string[];
  checkpointLabel?: string;
  milestoneLabel?: string;
  originLabel?: string;
};
export type AdventureReader = {
  name: string;
  provisional: boolean;
  assessmentComplete?: boolean;
  outfitId?: string | null;
  chapters: AdventureChapter[];
  definition: { lessons: AdventureLesson[] };
};
export type LiveAdventureChapter = AdventureChapter & {
  unitKey: string;
  grade: string;
  domain: string;
  unitLessonIds: string[];
  reason: string;
  rewardId: string | null;
  part: number;
  parts: number;
};
const TITLES: Record<string, string> = { RF: 'Sound Workshop', RL: 'Story Treasures', RI: 'Fact Finders', L: 'Word Magic' };

/** View adapter only. Retains the existing catalog order, completion rules and access rules.
 * Three stops per scene is pagination, not a curriculum unit or a new prescription.
 */
export function buildAdventureView(snapshot: JourneySnapshot, fullAccess = snapshot.billing.fullAccess) {
  const catalog = assignedJourneyCatalog(snapshot.child.reading_level ?? null, snapshot.result?.plan);
  const completed = new Set(catalog.filter((lesson) => lessonCompleted(lesson.standardId, snapshot.practice, snapshot.lessonProgress)).map((lesson) => lesson.standardId));
  const lessons: AdventureLesson[] = catalog.map((lesson) => {
    const [domain, , skill] = lesson.standardId.split('.');
    const print = domain === 'RF' && skill?.startsWith('1');
    const individualSounds = domain === 'RF' && /^2[cd]/.test(skill ?? '');
    return {
      nodeId: lesson.standardId, lessonId: lesson.standardId, title: lesson.title,
      objective: lessonPurpose(lesson.standardId),
      icon: print ? 'memo' : individualSounds ? 'magnifying-glass' : domain === 'RL' ? 'open-book' : domain === 'RI' ? 'newspaper' : domain === 'L' ? 'memo' : 'musical-note',
      shape: print || domain === 'RL' || domain === 'L' ? 'page' : individualSounds || domain === 'RI' ? 'sign' : 'garden',
      available: fullAccess || freeJourneyLesson({ lesson, signupAt: snapshot.billing.signupAt, readingLevel: snapshot.child.reading_level ?? null, placement: snapshot.result?.plan }),
    };
  });
  const groups: { key: string; lessons: typeof catalog }[] = [];
  for (const lesson of catalog) {
    const key = `${lesson.grade}:${lesson.domain}`;
    const group = groups.find((entry) => entry.key === key);
    if (group) group.lessons.push(lesson);
    else groups.push({ key, lessons: [lesson] });
  }
  const legacyGradeOrder = [...new Set(groups.map((group) => group.lessons[0].grade))];
  const legacyUnitKeys = legacyGradeOrder.flatMap((grade) => groups.filter((group) => group.lessons[0].grade === grade).map((group) => group.key));
  const chapters: LiveAdventureChapter[] = groups.flatMap((group, unitIndex) => {
    const first = group.lessons[0];
    const domain = first.standardId.split('.')[0];
    const parts = Math.ceil(group.lessons.length / 3);
    const reason = snapshot.result?.plan.steps.find((step) => step.kind !== 'skipped' && step.unit?.grade === first.grade && step.unit.domain === first.domain)?.reason;
    return Array.from({ length: parts }, (_, index) => ({
      id: `${group.key}:part-${index + 1}`, unitKey: group.key, grade: first.grade, domain: first.domain,
      name: TITLES[domain] ?? first.domain,
      subtitle: `${first.grade} · ${parts > 1 ? `Part ${index + 1} of ${parts}` : first.domain}`,
      theme: domain === 'RF' ? 'garden' as const : domain === 'RL' || domain === 'RI' ? 'valley' as const : 'woods' as const,
      lessonIds: group.lessons.slice(index * 3, index * 3 + 3).map((lesson) => lesson.standardId),
      unitLessonIds: group.lessons.map((lesson) => lesson.standardId),
      checkpointLabel: index === parts - 1 ? 'Unit review' : 'Reading stop',
      milestoneLabel: index === parts - 1 ? 'Unit keepsake' : 'Next discoveries',
      originLabel: unitIndex === 0 && index === 0 ? (snapshot.result ? 'Your assessment' : 'Your starting point') : 'Your reading plan',
      reason: reason ?? `Continue through ${first.grade.toLowerCase()} ${first.domain.toLowerCase()} in the existing lesson sequence.`,
      rewardId: index === parts - 1 ? `chest${legacyUnitKeys.indexOf(group.key) + 1}` : null,
      part: index + 1, parts,
    }));
  });
  const current = lessons.find((lesson) => !completed.has(lesson.nodeId));
  const currentChapter = current ? chapters.findIndex((chapter) => chapter.lessonIds.includes(current.lessonId)) : Math.max(0, chapters.length - 1);
  const reader: AdventureReader = {
    name: snapshot.child.first_name || 'Reader',
    provisional: snapshot.result?.decision.spectrum?.readingBand === null,
    assessmentComplete: !!snapshot.result,
    outfitId: snapshot.child.equipped_items?.outfit,
    chapters, definition: { lessons },
  };
  return { reader, chapters, lessons, completed, current, currentChapter };
}
