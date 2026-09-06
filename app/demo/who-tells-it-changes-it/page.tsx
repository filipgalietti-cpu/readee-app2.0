"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { whoTellsItChangesIt } from "@/app/data/lessons-v2/who-tells-it-changes-it";

// FACTORY-AUTHORED lesson · /demo/who-tells-it-changes-it
export default function Page() {
  return <LessonRunner lesson={whoTellsItChangesIt} />;
}
