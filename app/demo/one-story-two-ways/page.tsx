"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { oneStoryTwoWays } from "@/app/data/lessons-v2/one-story-two-ways";

// FACTORY-AUTHORED lesson · /demo/one-story-two-ways
export default function Page() {
  return <LessonRunner lesson={oneStoryTwoWays} />;
}
