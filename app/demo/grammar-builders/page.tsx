"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { grammarBuilders } from "@/app/data/lessons-v2/grammar-builders";

// FACTORY-AUTHORED lesson · /demo/grammar-builders
export default function Page() {
  return <LessonRunner lesson={grammarBuilders} />;
}
