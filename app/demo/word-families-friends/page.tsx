"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { wordFamiliesFriends } from "@/app/data/lessons-v2/word-families-friends";

// FACTORY-AUTHORED lesson · /demo/word-families-friends
export default function Page() {
  return <LessonRunner lesson={wordFamiliesFriends} />;
}
