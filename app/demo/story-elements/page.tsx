"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { storyElements } from "@/app/data/lessons-v2/story-elements";

// Exemplar B — Story Elements (RL.K.3) on the lesson engine. This page + the
// data file + assets is the ENTIRE lesson; the engine needed only its two
// budgeted registry entries (highlight, sequence).
export default function StoryElementsDemoPage() {
  return <LessonRunner lesson={storyElements} />;
}
