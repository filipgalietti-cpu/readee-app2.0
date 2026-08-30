"use client";

import WarmupArcade from "@/app/components/warmup/WarmupArcade";
import { useFirstChild } from "../useFirstChild";
import { snapWordDash } from "@/app/data/warmups-v2/snap-word-dash";

// Warm-Up Arcade pilot · /demo/warmup/snap-word-dash
export default function Page() {
  const child = useFirstChild();
  if (!child.ready) {
    return <main className="fixed inset-0 bg-gradient-to-b from-indigo-100 via-violet-50 to-amber-50" />;
  }
  return (
    <WarmupArcade
      warmup={snapWordDash}
      lessonTitle="Heart Words"
      childName={child.name}
      greetingAudioUrl={child.greetingAudioUrl}
      outfitId={child.outfitId}
    />
  );
}
