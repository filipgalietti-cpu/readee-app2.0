import { getSessionStreakTier } from "@/lib/carrots/multipliers";
import type { SceneDef } from "../types";
import type { Evidence, ItemEvidence, ReadingEvidence } from "./types";
export type EvidenceUpdate =
  | { type: "answer"; correct: boolean; practice?: boolean; submission?: unknown }
  | { type: "reflection" }
  | { type: "response-practice"; rubricId: string }
  | { type: "read-practice"; reading: ReadingEvidence }
  | { type: "help" }
  | { type: "skip" }
  | { type: "exhausted" }
  | { type: "unavailable" }
  | { type: "participated" };
export type EvidenceAction = { key: string; skill: string } & EvidenceUpdate;
/** Pure shared ledger. Successful items are immutable; retries retain all mistakes/help. */
export function reduceEvidence(state: Evidence, action: EvidenceAction, startingStreak = 0): Evidence {
  const old = state[action.key];
  if (old?.completed || old?.outcome === "exhausted") return state;
  const entry: ItemEvidence = old ?? {
    attempts: 0,
    helped: false,
    outcome: "practice",
    completed: false,
    skill: action.skill,
  };
  let next = { ...entry };
  const last = latestReward(state);
  next.rewardOrder = (last?.rewardOrder ?? 0) + 1;
  next.streakAfter = last?.streakAfter ?? startingStreak;
  if (["help", "skip", "exhausted"].includes(action.type)) next.streakAfter = 0;
  if (action.type === "help") next.helped = true;
  if (action.type === "unavailable") next.outcome = "unavailable";
  if (action.type === "exhausted") next.outcome = "exhausted";
  if (action.type === "skip") next.outcome = "skipped";
  if (action.type === "participated") next = { ...next, completed: true, outcome: "practice" };
  if (action.type === "reflection") next = { ...next, attempts: 1, completed: true, outcome: "practice", carrots: 1 };
  if (action.type === "response-practice") next = { ...next, response: { rubricId: action.rubricId, verdict: "accepted" }, attempts: next.attempts + 1, completed: true, outcome: "practice", carrots: 1 };
  if (action.type === "read-practice") {
    const r = action.reading;
    if (
      r.totalWords < 1 ||
      r.wordsAttempted !== r.totalWords ||
      r.wordsCorrect < 0 ||
      r.wordsCorrect > r.totalWords ||
      r.uncertainWords !== r.totalWords - r.wordsCorrect
    )
      return state;
    next = {
      ...next,
      attempts: next.attempts + 1,
      completed: true,
      outcome: "practice",
      reading: r,
      carrots: 1,
    };
  }
  if (action.type === "answer") {
    if(action.submission !== undefined) next.submissions=[...(next.submissions??[]),action.submission];
    const independent =
      action.correct && next.attempts === 0 && !next.helped && next.outcome !== "unavailable";
    next.streakAfter = independent ? (last?.streakAfter ?? startingStreak) + 1 : 0;
    if (action.correct) next.carrots = getSessionStreakTier(next.streakAfter).multiplier;
    if (next.attempts === 0)
      next.firstResponse = next.helped ? "assisted" : action.correct ? "correct" : "incorrect";
    next.attempts++;
    next.completed = action.correct;
    next.outcome = !action.correct
      ? "after-error"
      : next.helped
        ? "after-help"
        : next.attempts > 1
          ? "after-error"
          : action.practice
            ? "practice"
            : "first-try";
  }
  return { ...state, [action.key]: next };
}
function latestReward(state: Evidence) {
  return Object.values(state).reduce<ItemEvidence | undefined>(
    (last, item) => ((item.rewardOrder ?? 0) > (last?.rewardOrder ?? 0) ? item : last),
    undefined,
  );
}
export function practiceStreak(state: Evidence, startingStreak = 0) {
  return latestReward(state)?.streakAfter ?? startingStreak;
}
export function practiceCarrots(state: Evidence) {
  return Object.values(state).reduce(
    (total, e) => total + (e.completed && e.attempts > 0 ? (e.carrots ?? 1) : 0),
    0,
  );
}
/** Fixed slots preserve spatial intent even when a child drops into an empty middle slot. */
export function placeToken(slots: string[], token: string, at: number) {
  if (at < 0 || at >= slots.length) return slots;
  const next = [...slots],
    from = next.indexOf(token);
  if (from === at) return slots;
  if (from >= 0) {
    next[from] = next[at];
    next[at] = token;
    return next;
  }
  if (!next[at]) {
    next[at] = token;
    return next;
  }
  const empty = next.indexOf("");
  if (empty < 0) return slots;
  next.splice(empty, 1);
  next.splice(at, 0, token);
  return next;
}

export function sceneItemIds(scene: SceneDef): string[] {
  const i = scene.interaction;
  if (!i || i.type === "transform" || i.type === "read-along") return ["scene"];
  if (i.type === "choose") return ["answer"];
  if (i.type === "match") return ["match"];
  if (i.type === "highlight") return ["highlight"];
  if (i.type === "sequence") return ["sequence"];
  if (i.type === "speak") return ["read"];
  if (i.type === "sort") return i.items.map((_, index) => String(index));
  return [];
}
/** Completion is derived from recorded items, never a renderer's success callback. */
export function sceneIsComplete(evidence: Evidence, key: string, scene: SceneDef) {
  const ids = sceneItemIds(scene);
  return (
    ids.length > 0 &&
    ids.every((id) => {
      const item = evidence[`${key}/${id}`];
      return item?.completed && (scene.evidence === "demonstration" || item.attempts > 0);
    })
  );
}
