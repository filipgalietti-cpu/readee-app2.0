"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { bookTeamUp } from "@/app/data/lessons-v2/book-team-up";

// FACTORY-AUTHORED lesson · /demo/book-team-up
export default function Page() {
  return <LessonRunner lesson={bookTeamUp} />;
}
