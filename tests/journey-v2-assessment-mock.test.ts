import { describe, expect, it } from 'vitest';
import { assessmentJourneyMock } from '../app/demo/journey-v2/from-assessment/fixture';

describe('assessment-to-Journey presentation fixture', () => {
  it('keeps learner identity, enrollment, and confirmed starting point consistent across the handoff', () => {
    const { result, journey } = assessmentJourneyMock();
    expect(result.decision.spectrum?.readingStatus).toBe('confirmed');
    expect(journey.name).toBe(result.childName);
    expect(journey.enrollment).toBe(result.enrolled);
    expect(journey.entry).toBe(result.decision.placedBand);
    expect(journey.definition.sourcePlacementId).toBe(result.id);
  });
  it('keeps the route illustrative and completion empty', () => {
    const { journey } = assessmentJourneyMock();
    expect(journey.definition.plannerVersion).toBe('presentation-fixture-only');
    expect(journey.definition.curriculumReleaseId).toBe('unreleased-visual-fixture');
    expect(journey.definition.lessons[0].parentExplanation).toBe(journey.chapters[0].why);
    expect(journey.completed).toEqual([]);
  });
});
