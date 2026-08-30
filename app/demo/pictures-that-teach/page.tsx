"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { picturesThatTeach } from "@/app/data/lessons-v2/pictures-that-teach";

// FACTORY-AUTHORED lesson · /demo/pictures-that-teach
export default function Page() {
  return <LessonRunner lesson={picturesThatTeach} />;
}
