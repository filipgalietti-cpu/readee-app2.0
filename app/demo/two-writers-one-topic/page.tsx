"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { twoWritersOneTopic } from "@/app/data/lessons-v2/two-writers-one-topic";

// FACTORY-AUTHORED lesson · /demo/two-writers-one-topic
export default function Page() {
  return <LessonRunner lesson={twoWritersOneTopic} />;
}
