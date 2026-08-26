"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { diagramDetectives } from "@/app/data/lessons-v2/diagram-detectives";

// FACTORY-AUTHORED lesson · /demo/diagram-detectives
export default function Page() {
  return <LessonRunner lesson={diagramDetectives} />;
}
