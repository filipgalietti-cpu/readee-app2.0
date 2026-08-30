"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { letterSounds } from "@/app/data/lessons-v2/letter-sounds";

// FACTORY-AUTHORED lesson · /demo/letter-sounds
export default function Page() {
  return <LessonRunner lesson={letterSounds} />;
}
