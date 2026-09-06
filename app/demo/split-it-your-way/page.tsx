"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { splitItYourWay } from "@/app/data/lessons-v2/split-it-your-way";

// FACTORY-AUTHORED lesson · /demo/split-it-your-way
export default function Page() {
  return <LessonRunner lesson={splitItYourWay} />;
}
