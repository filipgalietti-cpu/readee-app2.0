"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { chainsAndSteps } from "@/app/data/lessons-v2/chains-and-steps";

// FACTORY-AUTHORED lesson · /demo/chains-and-steps
export default function Page() {
  return <LessonRunner lesson={chainsAndSteps} />;
}
