"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import type { LessonDef } from "@/lib/lesson-engine/types";
import { trackFunnelClient } from "@/lib/analytics/funnel";

/** The normal lesson engine, without a child or any progress-writing callback. */
export default function PreviewLesson({ lesson }: { lesson: LessonDef }) {
  const router = useRouter();
  useEffect(() => { trackFunnelClient("funnel.lesson_preview_started", { standard_id: lesson.standard }); }, [lesson.standard]);
  return <LessonRunner lesson={lesson} onFinish={() => router.push("/dashboard")} onExit={() => router.push("/explore")}
    finishLabel="Set up my reader" finishPrompt="Find a personal starting point and save future reading progress."
    headerNote={<nav aria-label="Lesson preview" className="flex flex-wrap items-center justify-between gap-2 border-b border-violet-100 bg-violet-50 px-4 py-3 text-sm"><Link href="/explore" className="font-semibold text-violet-700 underline underline-offset-4">Back to samples</Link><span className="text-zinc-600">Sample lesson · progress isn’t saved</span></nav>} />;
}
