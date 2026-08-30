"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { topicSpotter } from "@/app/data/lessons-v2/topic-spotter";

// FACTORY-AUTHORED lesson · /demo/topic-spotter
export default function Page() {
  return <LessonRunner lesson={topicSpotter} />;
}
