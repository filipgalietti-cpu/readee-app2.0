"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { theirViewYourView } from "@/app/data/lessons-v2/their-view-your-view";

// FACTORY-AUTHORED lesson · /demo/their-view-your-view
export default function Page() {
  return <LessonRunner lesson={theirViewYourView} />;
}
