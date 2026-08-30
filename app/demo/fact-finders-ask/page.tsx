"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { factFindersAsk } from "@/app/data/lessons-v2/fact-finders-ask";

// FACTORY-AUTHORED lesson · /demo/fact-finders-ask
export default function Page() {
  return <LessonRunner lesson={factFindersAsk} />;
}
