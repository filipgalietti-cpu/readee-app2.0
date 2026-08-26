"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { readingParty } from "@/app/data/lessons-v2/reading-party";

// FACTORY-AUTHORED lesson · /demo/reading-party
export default function Page() {
  return <LessonRunner lesson={readingParty} />;
}
