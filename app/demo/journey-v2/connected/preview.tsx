'use client';

import { useMemo, useState } from 'react';
import JourneyAdventure from '@/app/(protected)/journey/_components/JourneyAdventure';
import JourneyPlanDialog from '@/app/(protected)/journey/_components/JourneyPlanDialog';
import { buildAdventureView } from '@/lib/journey/adventure-view';
import type { JourneySnapshot } from '@/lib/journey/types';
import { fixtureSpectrumMaya, fixtureUnconfirmedReader } from '@/lib/placement/spectrum-fixtures';
import { assessmentJourneyMock } from '../from-assessment/fixture';

/** Actual catalog adapter + actual map view, with all action callbacks isolated from IO. */
export default function ConnectedJourneyReview() {
  const [scenario, setScenario] = useState('first-grade');
  const [subscriber, setSubscriber] = useState(false);
  const [count, setCount] = useState(0);
  const [notice, setNotice] = useState('');
  const [panel, setPanel] = useState(false);
  const [opened, setOpened] = useState<string[]>([]);
  const [rewardCalls, setRewardCalls] = useState(0);
  const snapshot = useMemo(() => {
    const result = scenario === 'fourth-to-second' ? fixtureSpectrumMaya() : scenario === 'provisional' ? fixtureUnconfirmedReader() : assessmentJourneyMock().result;
    return {
      child: { id: result.childId, parent_id: 'synthetic-parent', first_name: result.childName, reading_level: result.decision.readingLevelName, opened_chests: opened, equipped_items: {} },
      result, practice: [], lessonProgress: [],
      billing: { fullAccess: subscriber, eligibleForTrial: true, signupAt: '2026-09-13T12:00:00Z' },
    } as unknown as JourneySnapshot;
  }, [scenario, subscriber, opened]);
  const base = useMemo(() => buildAdventureView(snapshot), [snapshot]);
  const progressed = useMemo(() => ({ ...snapshot, practice: base.lessons.slice(0, count).map((lesson) => ({ standard_id: lesson.lessonId, questions_correct: 3 })) }), [snapshot, base.lessons, count]);
  const model = useMemo(() => buildAdventureView(progressed), [progressed]);
  return <>
    <details style={{ position: 'fixed', bottom: 8, left: 12, zIndex: 60, background: '#fffdf8', border: '1px solid #cdbed6', borderRadius: 12, padding: 8, fontSize: 12 }}>
      <summary>Integration review · synthetic reader</summary>
      <div style={{ display: 'grid', gap: 12, padding: 14 }}>
        <label>Scenario <select aria-label="Integration scenario" value={scenario} onChange={(event) => { setScenario(event.target.value); setCount(0); setOpened([]); }}><option value="first-grade">First grade</option><option value="fourth-to-second">Grade 4 → Grade 2</option><option value="provisional">Provisional</option></select></label>
        <label><input type="checkbox" aria-label="Subscriber" checked={subscriber} onChange={(event) => setSubscriber(event.target.checked)} /> Readee+ access</label>
        <label>Saved completions <select aria-label="Saved completions" value={count} onChange={(event) => setCount(Number(event.target.value))}>{Array.from({ length: base.lessons.length + 1 }, (_, index) => <option key={index} value={index}>{index}</option>)}</select></label>
        <p role="status" data-review-action>{notice}</p><span data-reward-calls>{rewardCalls} reward callbacks</span>
      </div>
    </details>
    <JourneyAdventure key={`${scenario}:${count}`} model={model} childId={snapshot.child.id} placementId={snapshot.result!.id}
      introduce={false} justCompleted={count ? base.lessons[count - 1].lessonId : null} openedChests={opened}
      onStart={(id) => setNotice(model.lessons.find((lesson) => lesson.lessonId === id)?.available ? `/learn?child=${snapshot.child.id}&standard=${encodeURIComponent(id)}` : 'Existing Readee+ paywall would open')}
      onPlan={() => setPanel(true)} onReward={async (id, amount) => { setOpened((old) => [...old, id]); setRewardCalls((calls) => calls + 1); setNotice(`Existing reward: ${id}, ${amount} carrots`); }} />
    {panel && <JourneyPlanDialog onClose={() => setPanel(false)}><h2>Saved assessment → existing catalog</h2><p>{snapshot.result!.childName}: enrolled grade {snapshot.result!.enrolled}, lesson entry {snapshot.result!.plan.entryBand}.</p><p>{model.chapters[model.currentChapter]?.reason}</p><p>This review uses the production view adapter. All launch and reward callbacks are local previews; no account or progress is written.</p></JourneyPlanDialog>}
  </>;
}
