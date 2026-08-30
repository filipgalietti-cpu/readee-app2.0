"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { factFinderBasics } from "@/app/data/lessons-v2/fact-finder-basics";

// FACTORY-AUTHORED lesson · /demo/fact-finder-basics
export default function Page() {
  return <LessonRunner lesson={factFinderBasics} />;
}
