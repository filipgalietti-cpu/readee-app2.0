"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { ideaIllustrators } from "@/app/data/lessons-v2/idea-illustrators";

// FACTORY-AUTHORED lesson · /demo/idea-illustrators
export default function Page() {
  return <LessonRunner lesson={ideaIllustrators} />;
}
