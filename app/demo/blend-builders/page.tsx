"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { blendBuilders } from "@/app/data/lessons-v2/blend-builders";

// FACTORY-AUTHORED lesson · /demo/blend-builders
export default function Page() {
  return <LessonRunner lesson={blendBuilders} />;
}
