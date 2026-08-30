"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { prefixSuffixDecoders } from "@/app/data/lessons-v2/prefix-suffix-decoders";

// FACTORY-AUTHORED lesson · /demo/prefix-suffix-decoders
export default function Page() {
  return <LessonRunner lesson={prefixSuffixDecoders} />;
}
