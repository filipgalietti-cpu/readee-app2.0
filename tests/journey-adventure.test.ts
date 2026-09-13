import { describe, expect, it } from 'vitest';
import { buildAdventureView } from '@/lib/journey/adventure-view';
import { assignedJourneyCatalog } from '@/lib/journey/next-lesson';
import { freeJourneyLesson, lessonCompleted } from '@/lib/journey/lesson-access';
import type { JourneySnapshot } from '@/lib/journey/types';
import { fixtureSpectrumMaya, fixtureUnconfirmedReader } from '@/lib/placement/spectrum-fixtures';
import { assessmentJourneyMock } from '@/app/demo/journey-v2/from-assessment/fixture';
import fs from 'node:fs';
import path from 'node:path';

function snapshot(result = assessmentJourneyMock().result): JourneySnapshot {
  return { child: { id: result.childId, first_name: result.childName, reading_level: result.decision.readingLevelName, opened_chests: [], equipped_items: {} }, result, practice: [], lessonProgress: [], billing: { fullAccess: false, eligibleForTrial: true, signupAt: '2026-09-13T00:00:00Z' } } as unknown as JourneySnapshot;
}
describe('connected adventure presentation', () => {
  it.each([assessmentJourneyMock().result, fixtureSpectrumMaya(), fixtureUnconfirmedReader()])('retains exact existing catalog order for $id, using pagination only', (result) => {
    const input = snapshot(result);
    const model = buildAdventureView(input);
    const ids = assignedJourneyCatalog(input.child.reading_level, result.plan).map((lesson) => lesson.standardId);
    expect(model.lessons.map((lesson) => lesson.lessonId)).toEqual(ids);
    expect(model.chapters.flatMap((chapter) => chapter.lessonIds)).toEqual(ids);
    expect(new Set(ids).size).toBe(ids.length);
    expect(model.chapters.every((chapter) => chapter.lessonIds.length <= 3)).toBe(true);
    expect(model.completed.size).toBe(0);
    expect(model.current?.lessonId).toBe(ids[0]);
  });
  it('changes access, never recommendations, for subscribers and grandfathered families', () => {
    for (const signupAt of ['2026-09-13T00:00:00Z', '2026-09-01T00:00:00Z', null]) {
      const input = snapshot(); input.billing.signupAt = signupAt;
      const free = buildAdventureView(input);
      const paid = buildAdventureView(input, true);
      expect(paid.chapters).toEqual(free.chapters);
      expect(paid.lessons.map((lesson) => lesson.lessonId)).toEqual(free.lessons.map((lesson) => lesson.lessonId));
      expect(paid.lessons.every((lesson) => lesson.available)).toBe(true);
      const catalog = assignedJourneyCatalog(input.child.reading_level, input.result!.plan);
      free.lessons.forEach((lesson, i) => expect(lesson.available).toBe(freeJourneyLesson({ lesson: catalog[i], signupAt, readingLevel: input.child.reading_level, placement: input.result!.plan })));
    }
  });
  it('preserves both completion sources without granting premium access from completion', () => {
    const input = snapshot(); const base = buildAdventureView(input);
    input.practice = [{ standard_id: base.lessons[0].lessonId, questions_correct: 3 }];
    input.lessonProgress = [{ lesson_id: base.lessons[1].lessonId, section: 'practice', score: 60 }];
    const model = buildAdventureView(input);
    expect([...model.completed]).toEqual(base.lessons.slice(0, 2).map((lesson) => lesson.lessonId));
    expect(model.lessons[1].available).toBe(false);
    expect(model.current?.lessonId).toBe(base.lessons[2].lessonId);
    expect(lessonCompleted('forged-query-value', input.practice, input.lessonProgress)).toBe(false);
  });
  it('preserves legacy unit chest identities, one keepsake per whole unit', () => {
    const model = buildAdventureView(snapshot(fixtureSpectrumMaya()));
    const grades = [...new Set(model.chapters.map((chapter) => chapter.grade))];
    const legacyUnitKeys = grades.flatMap((grade) => [...new Set(model.chapters.filter((chapter) => chapter.grade === grade).map((chapter) => chapter.unitKey))]);
    for (const chapter of model.chapters) {
      expect(chapter.rewardId).toBe(chapter.part === chapter.parts ? `chest${legacyUnitKeys.indexOf(chapter.unitKey) + 1}` : null);
    }
  });
  it('keeps provisional placement honest and handles no assessment without a false checkmark', () => {
    const input = snapshot(fixtureUnconfirmedReader());
    expect(buildAdventureView(input).reader.provisional).toBe(true);
    input.result = null;
    const view = buildAdventureView(input);
    expect(view.reader.assessmentComplete).toBe(false);
    expect(view.chapters[0].originLabel).toBe('Your starting point');
  });
  it('shows all actual completion without manufacturing mastery or an exam', () => {
    const input = snapshot(); const base = buildAdventureView(input);
    input.practice = base.lessons.map((lesson) => ({ standard_id: lesson.lessonId, questions_correct: 3 }));
    const model = buildAdventureView(input);
    expect(model.completed.size).toBe(model.lessons.length);
    expect(model.current).toBeUndefined();
    expect(model.currentChapter).toBe(model.chapters.length - 1);
    expect(model.chapters.some((chapter) => chapter.checkpointLabel?.includes('exam'))).toBe(false);
  });
  it('keeps demo registries and simulated access out of the shared renderer dependency tree', () => {
    const files = fs.readdirSync('app/_components/journey').filter((name) => /\.tsx?$/.test(name));
    for (const file of files) {
      const source = fs.readFileSync(path.join('app/_components/journey', file), 'utf8');
      expect(source).not.toMatch(/from ["'][^"']*(?:demo|fixtures|lesson-metadata)/);
      expect(source).not.toContain('canOpenDemoLesson');
    }
  });
});
