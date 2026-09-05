"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { shadesOfSure } from "@/app/data/lessons-v2/shades-of-sure";

// FACTORY-AUTHORED lesson · /demo/shades-of-sure
export default function Page() {
  return <LessonRunner lesson={shadesOfSure} />;
}
