"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { whatsItAbout } from "@/app/data/lessons-v2/whats-it-about";

// FACTORY-AUTHORED lesson · /demo/whats-it-about
export default function Page() {
  return <LessonRunner lesson={whatsItAbout} />;
}
