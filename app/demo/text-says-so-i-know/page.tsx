"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { textSaysSoIKnow } from "@/app/data/lessons-v2/text-says-so-i-know";

// FACTORY-AUTHORED lesson · /demo/text-says-so-i-know
export default function Page() {
  return <LessonRunner lesson={textSaysSoIKnow} />;
}
