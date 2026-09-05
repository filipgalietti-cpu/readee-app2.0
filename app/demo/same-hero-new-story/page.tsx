"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { sameHeroNewStory } from "@/app/data/lessons-v2/same-hero-new-story";

// FACTORY-AUTHORED lesson · /demo/same-hero-new-story
export default function Page() {
  return <LessonRunner lesson={sameHeroNewStory} />;
}
