"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { syllableBeats } from "@/app/data/lessons-v2/syllable-beats";

// FACTORY-AUTHORED lesson · /demo/syllable-beats
export default function Page() {
  return <LessonRunner lesson={syllableBeats} />;
}
