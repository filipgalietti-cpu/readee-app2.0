"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { trickySoundSwitchers } from "@/app/data/lessons-v2/tricky-sound-switchers";

// FACTORY-AUTHORED lesson · /demo/tricky-sound-switchers
export default function Page() {
  return <LessonRunner lesson={trickySoundSwitchers} />;
}
