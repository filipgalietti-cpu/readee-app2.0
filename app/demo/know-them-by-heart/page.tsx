"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { knowThemByHeart } from "@/app/data/lessons-v2/know-them-by-heart";

// FACTORY-AUTHORED lesson · /demo/know-them-by-heart
export default function Page() {
  return <LessonRunner lesson={knowThemByHeart} />;
}
