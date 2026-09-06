"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { sameRootNewBranch } from "@/app/data/lessons-v2/same-root-new-branch";

// FACTORY-AUTHORED lesson · /demo/same-root-new-branch
export default function Page() {
  return <LessonRunner lesson={sameRootNewBranch} />;
}
