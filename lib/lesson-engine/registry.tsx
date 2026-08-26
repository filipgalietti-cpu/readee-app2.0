"use client";

// Interaction Registry — THE single map from interaction type → renderer.
// This replaces hand-written dispatch ternaries. Growth rule: an entry is added
// only when an exemplar lesson demands it (Exemplar B budget: +highlight,
// +sequence. Exemplar C budget: +0). Renderers own mechanics/animation/feedback;
// lesson data owns all meaning.

import type { ComponentType } from "react";
import type { InteractionDef, WordTiming } from "./types";
import Transform from "@/app/components/lesson-v2/interactions/Transform";
import Sort from "@/app/components/lesson-v2/interactions/Sort";
import Listen from "@/app/components/lesson-v2/interactions/Listen";
import Speak from "@/app/components/lesson-v2/interactions/Speak";
import Choose from "@/app/components/lesson-v2/interactions/Choose";
import Highlight from "@/app/components/lesson-v2/interactions/Highlight";
import Sequence from "@/app/components/lesson-v2/interactions/Sequence";
import ReadAlong from "@/app/components/lesson-v2/interactions/ReadAlong";

export interface InteractionProps<D extends InteractionDef = InteractionDef> {
  data: D;
  auto?: boolean;
  cue?: boolean;
  fallbackMs?: number;
  /** Whisper timings for read-along sentence clips (runner supplies). */
  words?: WordTiming[];
  onSolved: (meta?: { attempts?: number; correct?: boolean }) => void;
  /** Fired on each wrong attempt (bunny reacts, telemetry later). */
  onWrong?: () => void;
  /** Fired on each correct ITEM in multi-item interactions (sort/sequence/highlight). */
  onItemCorrect?: () => void;
  /** Question-specific feedback clips: hint after wrong #1, explain on give-up. */
  feedbackAudio?: { hint?: string; explain?: string };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REGISTRY: Record<InteractionDef["type"], ComponentType<InteractionProps<any>>> = {
  transform: Transform,
  sort: Sort,
  listen: Listen,
  speak: Speak,
  choose: Choose,       // base-5 completion
  highlight: Highlight, // Exemplar B budget entry 1/2
  sequence: Sequence,   // Exemplar B budget entry 2/2
  "read-along": ReadAlong, // karaoke sentence (core Readee mechanic; added Aug 17)
};

export function getInteraction(type: InteractionDef["type"]) {
  return REGISTRY[type] ?? null;
}
