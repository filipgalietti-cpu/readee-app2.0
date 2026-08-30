// Learning-event emission — ONE telemetry contract for every interaction.
// Today: console + optional subscriber. The production route adds: persist to
// the learner model (child_skill_memory path) + PostHog capture. Do not create
// per-archetype telemetry variants — everything feeds the same learner model.

import type { LearningEvent } from "./types";

type Listener = (e: LearningEvent) => void;
const listeners: Listener[] = [];

export function onLearningEvent(fn: Listener): () => void {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i >= 0) listeners.splice(i, 1);
  };
}

export function emitLearningEvent(e: LearningEvent): void {
  // eslint-disable-next-line no-console
  console.log("[LearningEvent]", e);
  for (const fn of listeners) fn(e);
}
