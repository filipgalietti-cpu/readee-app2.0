"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { thereOrToldAboutIt } from "@/app/data/lessons-v2/there-or-told-about-it";

// FACTORY-AUTHORED lesson · /demo/there-or-told-about-it
export default function Page() {
  return <LessonRunner lesson={thereOrToldAboutIt} />;
}
