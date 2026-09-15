import type {CheckpointProbe} from './checkpoint-types';
import type { PracticeAttempt } from './practice';
import type { CheckpointPlan } from './checkpoint';
import { checkpointProbeResult } from './checkpoint';
/** Product readiness rule, not a validated mastery/diagnostic cut score.
 * Equal weight per skill packet; a multi-card sort is not several questions. */
export function examReadiness(plan: CheckpointPlan, attempt: PracticeAttempt, scoredClosing: readonly CheckpointProbe[] = []) {
  const rows = plan.eligibleStandards.map(standard => {
    const probe = plan.pool.find(p => p.standard === standard && p.tasks.some(t => attempt.asked.includes(t.id)));
    const result = probe ? checkpointProbeResult(probe, attempt.results) : undefined;
    return { standard, probeId:probe?.id, band: probe?.band, outcome: result?.outcome ?? 'skipped' as const };
  });
  for(const probe of scoredClosing){
    const result=checkpointProbeResult(probe,attempt.results);
    rows.push({standard:probe.standard,probeId:probe.id,band:probe.band,outcome:result.outcome});
  }
  const independent = rows.filter(r => r.outcome === 'correct' || r.outcome === 'incorrect');
  const correct = independent.filter(r => r.outcome === 'correct').length;
  const complete = attempt.finished && rows.length > 0 && independent.length === rows.length && plan.omitted.length === 0;
  const regularEvidence = independent.every(r => r.band !== 'easier');
  const requiredCorrect = Math.ceil(rows.length * 0.8);
  return { rows, correct, independent: independent.length, total: rows.length, requiredCorrect,
    percent: complete ? Math.round(correct / rows.length * 100) : null,
    status: !complete || !regularEvidence ? 'more-evidence' as const : correct >= requiredCorrect ? 'ready' as const : 'practice' as const,
    omitted: plan.omitted,
  };
}

/** Show the score at celebration as well as on the detailed parent results. */
export function examScoreSummary(plan: CheckpointPlan, attempt: PracticeAttempt, scoredClosing: readonly CheckpointProbe[] = []) {
  const result = examReadiness(plan, attempt, scoredClosing);
  return result.percent === null
    ? `${result.correct} correct · ${result.total - result.independent} still need an independent check.`
    : `${result.correct} of ${result.total} correct (${result.percent}%).`;
}
