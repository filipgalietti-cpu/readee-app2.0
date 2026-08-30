"use client";

import WordBuilderArcade from "@/app/components/warmup/WordBuilderArcade";
import { useFirstChild } from "../useFirstChild";
import { wordBuilderCompounds } from "@/app/data/warmups-v2/word-builder-compounds";

// Word Builder pilot (pond skin) · /demo/warmup/word-builder-pond
export default function Page() {
  const child = useFirstChild();
  if (!child.ready) {
    return <main className="fixed inset-0 bg-gradient-to-b from-sky-100 via-cyan-50 to-blue-100" />;
  }
  return (
    <WordBuilderArcade
      warmup={wordBuilderCompounds}
      skin="pond"
      lessonTitle="Compound Word Champ!"
      childName={child.name}
      greetingAudioUrl={child.greetingAudioUrl}
      outfitId={child.outfitId}
    />
  );
}
