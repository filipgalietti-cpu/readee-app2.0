"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { capitalStart } from "@/app/data/lessons-v2/capital-start";

// FACTORY-AUTHORED lesson · /demo/capital-start
export default function Page() {
  return <LessonRunner lesson={capitalStart} />;
}
