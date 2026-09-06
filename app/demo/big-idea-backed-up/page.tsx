"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { bigIdeaBackedUp } from "@/app/data/lessons-v2/big-idea-backed-up";

// FACTORY-AUTHORED lesson · /demo/big-idea-backed-up
export default function Page() {
  return <LessonRunner lesson={bigIdeaBackedUp} />;
}
