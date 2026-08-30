"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { pictureDetectives } from "@/app/data/lessons-v2/picture-detectives";

// FACTORY-AUTHORED lesson · /demo/picture-detectives
export default function Page() {
  return <LessonRunner lesson={pictureDetectives} />;
}
