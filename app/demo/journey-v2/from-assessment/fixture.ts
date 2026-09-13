import { spectrumSubmission } from '@/lib/placement/spectrum-fixtures';
import { decidePlacement } from '@/lib/placement/decide';
import { buildPlan } from '@/lib/placement/plan';
import { narrate } from '@/lib/placement/narration';
import type { PlacementResult } from '@/lib/placement/types';
import { JOURNEY_FIXTURES, type JourneyFixture } from '../fixtures';

/** Synthetic evidence, passed through existing scoring. This is not a prescription rule. */
export function assessmentJourneyMock(): { result: PlacementResult; journey: JourneyFixture } {
  const today = new Date('2026-09-11T12:00:00Z');
  const submission = spectrumSubmission(1, 3, 1, 1);
  const decision = decidePlacement({ ...submission, date: today });
  const plan = buildPlan({ decision, moments: [], today });
  const result: PlacementResult = {
    id: 'synthetic-assessment-journey-preview',
    childId: submission.childId,
    childName: 'Filus',
    enrolled: submission.enrolled,
    decision, plan, moments: [],
    narration: narrate({ childName: 'Filus', decision, plan, moments: [], today }),
    passageRecordingPath: null,
    durationSeconds: submission.durationSeconds,
    createdAt: today.toISOString(),
  };
  const base = JOURNEY_FIXTURES.find((fixture) => fixture.id === 'foundations')!;
  const entryExplanation = 'The sample assessment confirmed first-grade connected reading. This demo begins with a first-grade words-and-sentences chapter to show the handoff; its exact lesson order still requires curriculum review.';
  const journey: JourneyFixture = {
    ...base,
    name: result.childName,
    enrollment: result.enrolled,
    entry: decision.placedBand,
    strength: 'Reading first-grade texts and answering questions',
    focus: 'Practice with words and sentences',
    goal: 'Read longer stories with understanding',
    evidence: 'Synthetic assessment: two first-grade passages confirmed; six of six comprehension questions answered correctly. The exact lesson route is an illustrative development sequence, not an approved prescription.',
    chapters: base.chapters.map((chapter, index) => index === 0 ? { ...chapter, why: entryExplanation } : chapter),
    definition: {
      ...base.definition,
      sourcePlacementId: result.id,
      lessons: base.definition.lessons.map((lesson, index) => index === 0 ? { ...lesson, parentExplanation: entryExplanation } : lesson),
    },
  };
  return { result, journey };
}
