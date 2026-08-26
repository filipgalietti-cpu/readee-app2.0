"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { prefixPower } from "@/app/data/lessons-v2/prefix-power";

// FACTORY-AUTHORED lesson · /demo/prefix-power
export default function Page() {
  return <LessonRunner lesson={prefixPower} />;
}
