"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { silentE } from "@/app/data/lessons-v2/silent-e";

// Silent-E on the lesson ENGINE: pure-data lesson (app/data/lessons-v2/silent-e.ts)
// rendered by the registry-driven runner on the real LessonShellDesktop.
// A second lesson = another data file + one manifest entry — no new code here.
export default function SilentEDemoPage() {
  return <LessonRunner lesson={silentE} />;
}
