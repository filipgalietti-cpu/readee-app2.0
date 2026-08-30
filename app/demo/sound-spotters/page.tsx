"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { soundSpotters } from "@/app/data/lessons-v2/sound-spotters";

// FACTORY-AUTHORED lesson · /demo/sound-spotters
export default function Page() {
  return <LessonRunner lesson={soundSpotters} />;
}
