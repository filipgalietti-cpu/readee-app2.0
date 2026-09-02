"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { meaningMachines } from "@/app/data/lessons-v2/meaning-machines";

// FACTORY-AUTHORED lesson · /demo/meaning-machines
export default function Page() {
  return <LessonRunner lesson={meaningMachines} />;
}
