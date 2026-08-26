"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { howTheyConnect } from "@/app/data/lessons-v2/how-they-connect";

// FACTORY-AUTHORED lesson · /demo/how-they-connect
export default function Page() {
  return <LessonRunner lesson={howTheyConnect} />;
}
