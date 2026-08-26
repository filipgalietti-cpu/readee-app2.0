"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { storyParts } from "@/app/data/lessons-v2/story-parts";

// FACTORY-AUTHORED lesson · /demo/story-parts
export default function Page() {
  return <LessonRunner lesson={storyParts} />;
}
