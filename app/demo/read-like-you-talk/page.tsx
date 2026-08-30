"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { readLikeYouTalk } from "@/app/data/lessons-v2/read-like-you-talk";

// FACTORY-AUTHORED lesson · /demo/read-like-you-talk
export default function Page() {
  return <LessonRunner lesson={readLikeYouTalk} />;
}
