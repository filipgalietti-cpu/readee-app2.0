"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { soundDetectives } from "@/app/data/lessons-v2/sound-detectives";

// FACTORY-AUTHORED lesson · /demo/sound-detectives
export default function Page() {
  return <LessonRunner lesson={soundDetectives} />;
}
