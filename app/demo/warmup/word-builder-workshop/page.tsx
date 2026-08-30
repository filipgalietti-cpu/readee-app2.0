"use client";

import WordBuilderArcade from "@/app/components/warmup/WordBuilderArcade";
import { useFirstChild } from "../useFirstChild";
import { wordBuilderCompounds } from "@/app/data/warmups-v2/word-builder-compounds";

// Word Builder pilot (workshop skin) · /demo/warmup/word-builder-workshop
export default function Page() {
  const child = useFirstChild();
  if (!child.ready) {
    return <main className="fixed inset-0 bg-gradient-to-b from-indigo-100 via-violet-50 to-amber-50" />;
  }
  return (
    <WordBuilderArcade
      warmup={wordBuilderCompounds}
      skin="workshop"
      lessonTitle="Compound Word Champ!"
      childName={child.name}
      greetingAudioUrl={child.greetingAudioUrl}
      outfitId={child.outfitId}
    />
  );
}
