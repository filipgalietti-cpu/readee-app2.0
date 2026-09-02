"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { longWordTrains } from "@/app/data/lessons-v2/long-word-trains";

// FACTORY-AUTHORED lesson · /demo/long-word-trains
export default function Page() {
  return <LessonRunner lesson={longWordTrains} />;
}
