"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { wordConnections } from "@/app/data/lessons-v2/word-connections";

// FACTORY-AUTHORED lesson · /demo/word-connections
export default function Page() {
  return <LessonRunner lesson={wordConnections} />;
}
