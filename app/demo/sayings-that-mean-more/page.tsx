"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { sayingsThatMeanMore } from "@/app/data/lessons-v2/sayings-that-mean-more";

// FACTORY-AUTHORED lesson · /demo/sayings-that-mean-more
export default function Page() {
  return <LessonRunner lesson={sayingsThatMeanMore} />;
}
