"use client";

/**
 * Dynamic Warm-Up Arcade demo · /demo/warmup/<warmup-id>
 *
 * One route for every registered warm-up (hand-built + generated) so new
 * defs never need their own demo dir. The 8 existing static demo dirs
 * shadow this route and keep working untouched.
 *
 * Skin: def.skin wins; otherwise per-recipe defaults — builder → workshop,
 * topic/story scout → sky, sound-hunt/word-catch → carrot.
 */
import { useParams } from "next/navigation";
import WarmupArcade, { type WarmupSkin } from "@/app/components/warmup/WarmupArcade";
import WordBuilderArcade, { type WordBuilderSkin } from "@/app/components/warmup/WordBuilderArcade";
import { WARMUPS } from "@/app/data/warmups-v2";
import { useFirstChild } from "../useFirstChild";

export default function Page() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params?.id ?? "");
  const warmup = WARMUPS[id];
  const child = useFirstChild();

  if (!warmup) {
    return (
      <main className="fixed inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-indigo-100 via-violet-50 to-amber-50 p-8 text-center">
        <h1 className="font-display text-3xl font-extrabold text-indigo-900">No warm-up here yet</h1>
        <p className="max-w-md text-base font-semibold text-zinc-600">
          There is no warm-up registered with the id &quot;{id}&quot;. Check app/data/warmups-v2.
        </p>
      </main>
    );
  }
  if (!child.ready) {
    return <main className="fixed inset-0 bg-gradient-to-b from-indigo-100 via-violet-50 to-amber-50" />;
  }

  const common = {
    warmup,
    lessonTitle: warmup.lessonTitle ?? warmup.lessonId,
    childName: child.name,
    greetingAudioUrl: child.greetingAudioUrl,
    outfitId: child.outfitId,
  };

  if (warmup.mode === "builder") {
    const skin: WordBuilderSkin = warmup.skin === "pond" ? "pond" : "workshop";
    return <WordBuilderArcade {...common} skin={skin} />;
  }
  const scout = warmup.recipe === "topic-scout" || warmup.recipe === "story-scout";
  const skin: WarmupSkin = warmup.skin === "sky" || warmup.skin === "carrot" ? warmup.skin : scout ? "sky" : "carrot";
  return <WarmupArcade {...common} skin={skin} />;
}
