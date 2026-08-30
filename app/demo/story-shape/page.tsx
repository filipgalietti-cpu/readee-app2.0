"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { storyShape } from "@/app/data/lessons-v2/story-shape";

// FACTORY-AUTHORED lesson · /demo/story-shape
export default function Page() {
  return <LessonRunner lesson={storyShape} />;
}
