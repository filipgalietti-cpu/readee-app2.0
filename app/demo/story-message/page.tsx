"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { storyMessage } from "@/app/data/lessons-v2/story-message";

// FACTORY-AUTHORED lesson · /demo/story-message
export default function Page() {
  return <LessonRunner lesson={storyMessage} />;
}
