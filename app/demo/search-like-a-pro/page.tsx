"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { searchLikeAPro } from "@/app/data/lessons-v2/search-like-a-pro";

// FACTORY-AUTHORED lesson · /demo/search-like-a-pro
export default function Page() {
  return <LessonRunner lesson={searchLikeAPro} />;
}
