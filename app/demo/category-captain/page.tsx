"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { categoryCaptain } from "@/app/data/lessons-v2/category-captain";

// FACTORY-AUTHORED lesson · /demo/category-captain
export default function Page() {
  return <LessonRunner lesson={categoryCaptain} />;
}
