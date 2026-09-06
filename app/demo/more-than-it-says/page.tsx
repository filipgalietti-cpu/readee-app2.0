"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { moreThanItSays } from "@/app/data/lessons-v2/more-than-it-says";

// FACTORY-AUTHORED lesson · /demo/more-than-it-says
export default function Page() {
  return <LessonRunner lesson={moreThanItSays} />;
}
