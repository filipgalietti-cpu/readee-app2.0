"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { becauseThenSo } from "@/app/data/lessons-v2/because-then-so";

// FACTORY-AUTHORED lesson · /demo/because-then-so
export default function Page() {
  return <LessonRunner lesson={becauseThenSo} />;
}
