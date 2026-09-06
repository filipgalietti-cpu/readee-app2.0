"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { whatHappenedAndWhy } from "@/app/data/lessons-v2/what-happened-and-why";

// FACTORY-AUTHORED lesson · /demo/what-happened-and-why
export default function Page() {
  return <LessonRunner lesson={whatHappenedAndWhy} />;
}
