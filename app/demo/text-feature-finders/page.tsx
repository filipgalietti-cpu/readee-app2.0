"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { textFeatureFinders } from "@/app/data/lessons-v2/text-feature-finders";

// FACTORY-AUTHORED lesson · /demo/text-feature-finders
export default function Page() {
  return <LessonRunner lesson={textFeatureFinders} />;
}
