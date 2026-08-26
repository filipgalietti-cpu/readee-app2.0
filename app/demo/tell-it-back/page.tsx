"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { tellItBack } from "@/app/data/lessons-v2/tell-it-back";

// FACTORY-AUTHORED lesson · /demo/tell-it-back
export default function Page() {
  return <LessonRunner lesson={tellItBack} />;
}
