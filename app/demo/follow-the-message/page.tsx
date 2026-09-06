"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { followTheMessage } from "@/app/data/lessons-v2/follow-the-message";

// FACTORY-AUTHORED lesson · /demo/follow-the-message
export default function Page() {
  return <LessonRunner lesson={followTheMessage} />;
}
