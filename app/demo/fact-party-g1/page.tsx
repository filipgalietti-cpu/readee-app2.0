"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { factPartyG1 } from "@/app/data/lessons-v2/fact-party-g1";

// FACTORY-AUTHORED lesson · /demo/fact-party-g1
export default function Page() {
  return <LessonRunner lesson={factPartyG1} />;
}
