"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { readToLearn } from "@/app/data/lessons-v2/read-to-learn";

// FACTORY-AUTHORED lesson · /demo/read-to-learn
export default function Page() {
  return <LessonRunner lesson={readToLearn} />;
}
