"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { theWholeStory } from "@/app/data/lessons-v2/the-whole-story";

// FACTORY-AUTHORED lesson · /demo/the-whole-story
export default function Page() {
  return <LessonRunner lesson={theWholeStory} />;
}
