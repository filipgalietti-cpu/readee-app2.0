"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { soundStretchers } from "@/app/data/lessons-v2/sound-stretchers";

// FACTORY-AUTHORED lesson · /demo/sound-stretchers
export default function Page() {
  return <LessonRunner lesson={soundStretchers} />;
}
