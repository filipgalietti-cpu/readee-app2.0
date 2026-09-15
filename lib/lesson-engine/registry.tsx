"use client";

// Interaction Registry — THE single map from interaction type → renderer.
// This replaces hand-written dispatch ternaries. Growth rule: an entry is added
// only when an exemplar lesson demands it (Exemplar B budget: +highlight,
// +sequence. Exemplar C budget: +0). Renderers own mechanics/animation/feedback;
// lesson data owns all meaning.

import type { ComponentType, ComponentProps } from "react";
import type { InteractionDef, WordTiming } from "./types";
import Match from "@/app/components/lesson-v2/delivery/CoachedMatch";
import Transform from "@/app/components/lesson-v2/interactions/Transform";
import Sort from "@/app/components/lesson-v2/interactions/Sort";
import Listen from "@/app/components/lesson-v2/interactions/Listen";
import Speak from "@/app/components/lesson-v2/interactions/Speak";
import Choose from "@/app/components/lesson-v2/interactions/Choose";
import Highlight from "@/app/components/lesson-v2/interactions/Highlight";
import Sequence from "@/app/components/lesson-v2/interactions/Sequence";
import ReadAlong from "@/app/components/lesson-v2/interactions/ReadAlong";

import CoachedChoose from "@/app/components/lesson-v2/delivery/CoachedChoose";
import CoachedSort from "@/app/components/lesson-v2/delivery/CoachedSort";
import CoachedSpeak from "@/app/components/lesson-v2/delivery/CoachedSpeak";
import CoachedResponse from "@/app/components/lesson-v2/delivery/CoachedResponse";
import CoachedSequence from "@/app/components/lesson-v2/delivery/CoachedSequence";
import CoachedHighlight from "@/app/components/lesson-v2/delivery/CoachedHighlight";
import CoachedReadAlong from "@/app/components/lesson-v2/delivery/CoachedReadAlong";
import ControlledTransform from "@/app/components/lesson-v2/delivery/ControlledTransform";

export interface InteractionProps<D extends InteractionDef = InteractionDef> {
  data: D;
  support?: import("./delivery/types").ActivitySupport;
  auto?: boolean;
  cue?: boolean;
  fallbackMs?: number;
  /** Whisper timings for read-along sentence clips (runner supplies). */
  words?: WordTiming[];
  onSolved: (meta?: {
    attempts?: number;
    correct?: boolean;
    hintUsed?: boolean;
    unavailable?: boolean;
  }) => void;
  /** Fired on each wrong attempt (bunny reacts, telemetry later). */
  onWrong?: () => void;
  /** Fired on each correct ITEM in multi-item interactions (sort/sequence/highlight). */
  onItemCorrect?: () => void;
  /** Question-specific feedback clips: hint after wrong #1, explain on give-up. */
  feedbackAudio?: { hint?: string; explain?: string };
  /** True when the scene's prompt already displays the text to read, so the
   *  interaction must not print it a second time. 222 of 422 speak prompts
   *  contain their own passage ("Read it out loud: She reads and they play."),
   *  and showing it again overflowed a pill sized for one word. */
  textShownInPrompt?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REGISTRY: Record<InteractionDef["type"], ComponentType<InteractionProps<any>>> = {
  match: Match,
  transform: Transform,
  sort: Sort,
  listen: Listen,
  speak: Speak,
  choose: Choose, // base-5 completion
  highlight: Highlight, // Exemplar B budget entry 1/2
  sequence: Sequence, // Exemplar B budget entry 2/2
  "read-along": ReadAlong, // karaoke sentence (core Readee mechanic; added Aug 17)
};

const COACHED: Partial<typeof REGISTRY> = {
  choose: CoachedChoose,
  sort: CoachedSort,
  speak: (props) =>
    props.data.mode === "respond" ? <CoachedResponse {...props} /> : <CoachedSpeak {...props} />,
  sequence: CoachedSequence,
  highlight: CoachedHighlight,
  "read-along": CoachedReadAlong,
  transform: ControlledTransform,
  match: Match,
};
const DISPATCH = Object.fromEntries(
  Object.entries(REGISTRY).map(([type, Legacy]) => [
    type,
    function Interaction(props: ComponentProps<(typeof REGISTRY)[InteractionDef["type"]]>) {
      const Coached = COACHED[type as InteractionDef["type"]];
      return props.support && Coached ? <Coached {...props} /> : <Legacy {...props} />;
    },
  ]),
) as typeof REGISTRY;
export function getInteraction(type: InteractionDef["type"]) {
  return DISPATCH[type] ?? null;
}
