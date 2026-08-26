"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { magicTeams } from "@/app/data/lessons-v2/magic-teams";

// FACTORY-AUTHORED lesson · /demo/magic-teams
export default function Page() {
  return <LessonRunner lesson={magicTeams} />;
}
