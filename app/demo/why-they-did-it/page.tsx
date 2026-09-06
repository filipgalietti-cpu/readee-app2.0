"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { whyTheyDidIt } from "@/app/data/lessons-v2/why-they-did-it";

// FACTORY-AUTHORED lesson · /demo/why-they-did-it
export default function Page() {
  return <LessonRunner lesson={whyTheyDidIt} />;
}
