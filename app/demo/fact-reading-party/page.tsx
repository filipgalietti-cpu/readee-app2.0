"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { factReadingParty } from "@/app/data/lessons-v2/fact-reading-party";

// FACTORY-AUTHORED lesson · /demo/fact-reading-party
export default function Page() {
  return <LessonRunner lesson={factReadingParty} />;
}
