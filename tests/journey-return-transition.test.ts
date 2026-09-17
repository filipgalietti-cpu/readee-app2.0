import { describe, expect, it } from 'vitest';
import { buildAdventureView } from '@/lib/journey/adventure-view';
import { journeyReturnTransition } from '@/lib/journey/return-transition';
import { assessmentJourneyMock } from '@/app/demo/journey-v2/from-assessment/fixture';
import type { JourneySnapshot } from '@/lib/journey/types';
const result = assessmentJourneyMock().result;
const snapshot = { child: { id: result.childId, first_name: result.childName, reading_level: result.decision.readingLevelName }, result, practice: [], lessonProgress: [], billing: {fullAccess:false,signupAt:'2026-09-13T00:00:00Z'} } as unknown as JourneySnapshot;
const base = buildAdventureView(snapshot);
function after(count: number) {
  return buildAdventureView({...snapshot, completedStandards:base.lessons.slice(0,count).map(x=>x.lessonId)});
}
describe('saved lesson return destination', () => {
  it('walks to the actual adjacent assigned lesson without granting access', () => {
    const model=after(1), plan=journeyReturnTransition(model,base.lessons[0].lessonId);
    expect(plan.travel?.to).toBe(model.current?.lessonId);
    expect(plan.finishChapter).toBe(model.currentChapter);
    expect(model.current?.available).toBe(false);
  });
  it('crosses a paginated section boundary after its final saved lesson', () => {
    const count=base.chapters[0].lessonIds.length,model=after(count);
    const plan=journeyReturnTransition(model,base.lessons[count-1].lessonId);
    expect(plan.startChapter).toBe(0);
    expect(plan.travel?.to).toBe('checkpoint');
    expect(plan.finishChapter).toBe(1);
    expect(model.chapters[plan.finishChapter].lessonIds).toContain(model.current?.lessonId);
  });
  it('does not celebrate a forged or unsaved completed URL', () => {
    for(const id of [base.lessons[0].lessonId,'unknown',null]) {
      expect(journeyReturnTransition(base,id).travel).toBeNull();
    }
  });
  it('returns replays to the current lesson instead of walking through completed lessons', () => {
    const model=after(5),plan=journeyReturnTransition(model,base.lessons[0].lessonId);
    expect(plan.travel).toBeNull();expect(plan.startChapter).toBe(model.currentChapter);
  });
  it('does not skip an earlier gap just because a later lesson was completed', () => {
    const id=base.chapters[0].lessonIds.at(-1)!;
    const model=buildAdventureView({...snapshot,completedStandards:[id]});
    expect(journeyReturnTransition(model,id).travel).toBeNull();
    expect(model.current?.lessonId).toBe(base.lessons[0].lessonId);
  });
  it('ends the final lesson at the last checkpoint with no fabricated next lesson', () => {
    const model=after(base.lessons.length),plan=journeyReturnTransition(model,base.lessons.at(-1)!.lessonId);
    expect(plan.travel?.to).toBe('checkpoint');expect(plan.finishChapter).toBe(model.chapters.length-1);
  });
});
