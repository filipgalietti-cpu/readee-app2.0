"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { twoBooksOneTopic } from "@/app/data/lessons-v2/two-books-one-topic";

// FACTORY-AUTHORED lesson · /demo/two-books-one-topic
export default function Page() {
  return <LessonRunner lesson={twoBooksOneTopic} />;
}
