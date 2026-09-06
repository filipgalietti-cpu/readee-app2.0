"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { commasQuotesCapitals } from "@/app/data/lessons-v2/commas-quotes-capitals";

// FACTORY-AUTHORED lesson · /demo/commas-quotes-capitals
export default function Page() {
  return <LessonRunner lesson={commasQuotesCapitals} />;
}
