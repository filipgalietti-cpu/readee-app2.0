"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { storyKinds } from "@/app/data/lessons-v2/story-kinds";

// FACTORY-AUTHORED lesson · /demo/story-kinds
export default function Page() {
  return <LessonRunner lesson={storyKinds} />;
}
