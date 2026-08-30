"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { readWithYourBrain } from "@/app/data/lessons-v2/read-with-your-brain";

// FACTORY-AUTHORED lesson · /demo/read-with-your-brain
export default function Page() {
  return <LessonRunner lesson={readWithYourBrain} />;
}
