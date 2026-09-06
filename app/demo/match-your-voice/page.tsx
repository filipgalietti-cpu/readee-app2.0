"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { matchYourVoice } from "@/app/data/lessons-v2/match-your-voice";

// FACTORY-AUTHORED lesson · /demo/match-your-voice
export default function Page() {
  return <LessonRunner lesson={matchYourVoice} />;
}
