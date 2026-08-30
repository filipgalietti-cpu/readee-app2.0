"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { teamPlayers } from "@/app/data/lessons-v2/team-players";

// FACTORY-AUTHORED lesson · /demo/team-players
export default function Page() {
  return <LessonRunner lesson={teamPlayers} />;
}
