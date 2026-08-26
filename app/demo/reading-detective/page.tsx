"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { readingDetective } from "@/app/data/lessons-v2/reading-detective";

// Exemplar C — Meaning & Inference on the lesson engine. ZERO new engine code:
// this page + the data file + assets is the entire lesson.
export default function ReadingDetectiveDemoPage() {
  return <LessonRunner lesson={readingDetective} />;
}
