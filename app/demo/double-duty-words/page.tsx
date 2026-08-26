"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { doubleDutyWords } from "@/app/data/lessons-v2/double-duty-words";

// FACTORY-AUTHORED lesson · /demo/double-duty-words
export default function Page() {
  return <LessonRunner lesson={doubleDutyWords} />;
}
