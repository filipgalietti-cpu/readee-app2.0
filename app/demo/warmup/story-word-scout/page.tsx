"use client";

import WarmupArcade from "@/app/components/warmup/WarmupArcade";
import { storyWordScout } from "@/app/data/warmups-v2/story-word-scout";

// Warm-Up Arcade pilot · /demo/warmup/story-word-scout
export default function Page() {
  return <WarmupArcade warmup={storyWordScout} skin="sky" lessonTitle="Two Ways to See It" />;
}
