"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { describeItBetter } from "@/app/data/lessons-v2/describe-it-better";

// FACTORY-AUTHORED lesson · /demo/describe-it-better
export default function Page() {
  return <LessonRunner lesson={describeItBetter} />;
}
