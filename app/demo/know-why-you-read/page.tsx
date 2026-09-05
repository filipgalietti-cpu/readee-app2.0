"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { knowWhyYouRead } from "@/app/data/lessons-v2/know-why-you-read";

// FACTORY-AUTHORED lesson · /demo/know-why-you-read
export default function Page() {
  return <LessonRunner lesson={knowWhyYouRead} />;
}
