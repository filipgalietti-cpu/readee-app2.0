"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { soundSliders } from "@/app/data/lessons-v2/sound-sliders";

// FACTORY-AUTHORED lesson · /demo/sound-sliders
export default function Page() {
  return <LessonRunner lesson={soundSliders} />;
}
