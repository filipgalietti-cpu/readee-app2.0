"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { storyPoemParty } from "@/app/data/lessons-v2/story-poem-party";

// FACTORY-AUTHORED lesson · /demo/story-poem-party
export default function Page() {
  return <LessonRunner lesson={storyPoemParty} />;
}
