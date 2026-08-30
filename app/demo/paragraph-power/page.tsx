"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { paragraphPower } from "@/app/data/lessons-v2/paragraph-power";

// FACTORY-AUTHORED lesson · /demo/paragraph-power
export default function Page() {
  return <LessonRunner lesson={paragraphPower} />;
}
