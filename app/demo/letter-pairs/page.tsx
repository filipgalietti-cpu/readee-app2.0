"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { letterPairs } from "@/app/data/lessons-v2/letter-pairs";

export default function Page() {
  return <LessonRunner lesson={letterPairs} />;
}
