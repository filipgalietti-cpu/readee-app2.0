import { selectCheckpointItem, updateReadiness, type IndependentResult, type SkillReadiness } from './adaptive';
import type { CheckpointProbe } from './checkpoint-types';
import type { PracticeQuestion } from './practice';

export function checkpointExposureKeys(probe: CheckpointProbe) {
  return [...new Set([probe.exposureKey, ...(probe.relatedExposureKeys ?? [])])];
}

export type CheckpointPlan = {
  pool: CheckpointProbe[];
  requestedStandards: string[];
  eligibleStandards: string[];
  omitted: { standard: string; reason: 'not-taught' | 'no-fresh-probe' | 'not-in-this-bank' }[];
  maxProbes: number;
};
/** Pure planning only. The production caller must supply server-owned assignment,
 * exposure and reviewed IDs. Browser values are NOT authorization or mastery. */
export function createCheckpointPlan({ pool, assigned, taught, exposedKeys, allowedProbeIds, maxProbes }: {
  pool: CheckpointProbe[];
  assigned: readonly string[];
  taught: readonly string[];
  exposedKeys: readonly string[];
  allowedProbeIds: readonly string[];
  maxProbes: number;
}): CheckpointPlan {
  if (!Number.isSafeInteger(maxProbes) || maxProbes < 1) throw Error('Positive bounded probe budget required');
  if (new Set(pool.map(p => p.id)).size !== pool.length) throw Error('Duplicate probe identity');
  const requestedStandards = [...new Set(assigned)];
  const eligible = pool.filter(p => requestedStandards.includes(p.standard) && taught.includes(p.standard)
    && allowedProbeIds.includes(p.id) && !checkpointExposureKeys(p).some(key => exposedKeys.includes(key)));
  const eligibleStandards = requestedStandards.filter(s => eligible.some(p => p.standard === s));
  if (maxProbes < eligibleStandards.length) throw Error('Probe budget must offer every eligible assigned skill');
  const omitted = requestedStandards.filter(s => !eligibleStandards.includes(s)).map(standard => ({
    standard,
    reason: !pool.some(p => p.standard === standard) ? 'not-in-this-bank' as const
      : !taught.includes(standard) ? 'not-taught' as const : 'no-fresh-probe' as const,
  }));
  return {pool: eligible, requestedStandards, eligibleStandards, omitted, maxProbes};
}

/** Reuse the existing coverage-first selector. All tasks within a selected
 * probe must finish before calling again. Seen story families cannot repeat. */
export function nextCheckpointProbe(plan: CheckpointPlan, asked: readonly string[], results: IndependentResult[], readiness: Record<string, SkillReadiness>) {
  const exposed = new Set(plan.pool.filter(p => asked.includes(p.id)).flatMap(checkpointExposureKeys));
  const pool = plan.pool.filter(p => asked.includes(p.id) || !checkpointExposureKeys(p).some(key => exposed.has(key)));
  const next = selectCheckpointItem({pool, standards: plan.eligibleStandards, asked: [...asked], results, readiness, maxItems: plan.maxProbes});
  return next ? plan.pool.find(p => p.id === next.id)! : null;
}

export function checkpointTaskQuestion(probe: CheckpointProbe, task: CheckpointProbe['tasks'][number]): PracticeQuestion {
  return {id: task.id, standard: probe.standard, band: probe.band, difficulty: probe.difficulty, scene: task.scene};
}

/** Aggregate a testlet conservatively, retaining the original per-task results.
 * An unavailable read plus an answered meaning item is NOT a full reading pass. */
export function checkpointProbeResult(probe: CheckpointProbe, results: IndependentResult[]): IndependentResult {
  const tasks = probe.tasks.map(t => results.find(r => r.itemId === t.id && r.standard === probe.standard && r.band === probe.band));
  const outcomes = tasks.map(r => r?.outcome);
  const outcome = outcomes.some(o => o === 'unavailable') ? 'unavailable'
    : outcomes.some(o => !o || o === 'skipped') ? 'skipped'
    : outcomes.some(o => o === 'incorrect') ? 'incorrect'
    : outcomes.some(o => o === 'assisted') ? 'assisted'
    : outcomes.some(o => o === 'practice') ? 'practice' : 'correct';
  return {itemId: probe.id, standard: probe.standard, band: probe.band, outcome};
}

/** Coverage describes observations, never a one-item "mastered" verdict. */
export function checkpointCoverage(plan: CheckpointPlan, asked: readonly string[], results: IndependentResult[]) {
  const validResults = results.filter(r => asked.includes(r.itemId) && plan.pool.some(p => p.id === r.itemId && p.standard === r.standard && p.band === r.band));
  return plan.requestedStandards.map(standard => {
    const offered = plan.pool.filter(p => p.standard === standard && asked.includes(p.id)).length;
    const independent = validResults.filter(r => r.standard === standard && (r.outcome === 'correct' || r.outcome === 'incorrect'));
    return {standard, offered, independent: independent.length, correct: independent.filter(r => r.outcome === 'correct').length,
      status: independent.length ? 'observed' as const : offered ? 'offered-without-independent-evidence' as const : 'not-sampled' as const,
      omittedReason: plan.omitted.find(o => o.standard === standard)?.reason};
  });
}

/** A closing packet may contain several related oral practice turns. Preserve
 * every authored task; none enters independent checkpoint readiness. */
export type CheckpointParticipation = PracticeQuestion | readonly PracticeQuestion[] | null;
function participationQuestions(value: CheckpointParticipation): readonly PracticeQuestion[] {
  if (!value) return [];
  const questions = Array.isArray(value) ? value : [value as PracticeQuestion];
  if (new Set(questions.map(q=>q.id)).size !== questions.length)
    throw Error('Duplicate checkpoint participation task');
  if (questions.some(q=>q.scene.evidence !== 'practice'))
    throw Error('Checkpoint participation must remain practice');
  return questions;
}

/** Adapter for the existing practice runner. The first checkpoint pass offers one
 * probe per eligible skill. Reading+meaning stays contiguous. Optional spoken
 * participation is last and never enters readiness or mastery coverage. */
export function checkpointPracticeSelection(plan: CheckpointPlan, participation: CheckpointParticipation,
  initialReadiness: Record<string, SkillReadiness> = {}, scoredClosing: readonly PracticeQuestion[] = []) {
  return (_pool: PracticeQuestion[], _standards: string[], attempt: import('./practice').PracticeAttempt, _maxItems: number) => {
    const askedProbes = [...new Set(attempt.asked.flatMap(id => {
      const p=plan.pool.find(p=>p.tasks.some(t=>t.id===id));return p?[p.id]:[];
    }))];
    const current=plan.pool.find(p=>p.id===askedProbes.at(-1));
    if(current){const pending=current.tasks.find(t=>!attempt.asked.includes(t.id));if(pending)return checkpointTaskQuestion(current,pending);}
    const completed=askedProbes.map(id=>plan.pool.find(p=>p.id===id)!).filter(p=>p.tasks.every(t=>attempt.results.some(r=>r.itemId===t.id)));
    const results=completed.map(p=>checkpointProbeResult(p,attempt.results));
    const readiness={...initialReadiness};
    for(const r of results)readiness[r.standard]=updateReadiness(readiness[r.standard]??{band:'core',rightRun:0,wrongRun:0},r);
    const probe=nextCheckpointProbe(plan,askedProbes,results,readiness);
    if(probe)return checkpointTaskQuestion(probe,probe.tasks[0]);
    return [...scoredClosingQuestions(scoredClosing),...participationQuestions(participation)].find(q=>!attempt.asked.includes(q.id))??null;
  };
}

/** This coverage-first adapter offers one packet per skill. Require a uniform
 * task count across that skill's alternatives so progress and completion bonuses
 * cannot overstate the sitting length. Variable-length exams need another budget. */
export function checkpointTaskBudget(plan: CheckpointPlan, participation: CheckpointParticipation, scoredClosing: readonly PracticeQuestion[] = []) {
  return plan.eligibleStandards.reduce((total, standard) => {
    const sizes = new Set(plan.pool.filter(p => p.standard === standard).map(p => p.tasks.length));
    if (sizes.size !== 1 || [...sizes][0] < 1) throw Error('Checkpoint alternatives need a consistent positive task count per skill');
    return total + [...sizes][0];
  }, 0) + participationQuestions(participation).length + scoredClosingQuestions(scoredClosing).length;
}

function scoredClosingQuestions(questions:readonly PracticeQuestion[]) {
 if(new Set(questions.map(q=>q.id)).size!==questions.length||questions.some(q=>q.scene.evidence!=='assessed'))throw Error('Scored closing questions must be unique assessed items');
 return questions;
}
