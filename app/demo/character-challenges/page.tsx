"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { characterChallenges } from "@/app/data/lessons-v2/character-challenges";

// FACTORY-AUTHORED lesson · /demo/character-challenges
export default function Page() {
  return <LessonRunner lesson={characterChallenges} />;
}
