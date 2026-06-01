"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { LessonSlideshow } from "@/app/components/lesson/LessonSlideshow";
import type { SampleLesson } from "@/app/components/lesson/LessonSlideshow";

/**
 * Full-window desktop wireframe preview for one lesson. Mirrors the
 * mobile PopoutPlayClient but renders chrome="desktop-shell" inside a
 * relative + overflow-hidden frame (matching the 75vh container the
 * canon audit uses) so the slideshow's `position: fixed` is trapped
 * inside the frame instead of escaping to the viewport.
 */
export default function DesktopPlayClient({
  lesson,
}: {
  lesson: SampleLesson;
}) {
  const [nonce, setNonce] = useState(0);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-zinc-100 dark:bg-zinc-900">
      <button
        onClick={() => setNonce((n) => n + 1)}
        className="absolute right-4 top-4 z-[200] inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-zinc-900 shadow-md hover:bg-white"
        title="Restart slideshow from slide 1"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Replay
      </button>

      <div className="flex h-full w-full items-center justify-center p-6">
        <div
          className="relative w-full max-w-[1100px] overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700"
          style={{ height: "88vh", transform: "translateZ(0)" }}
        >
          <LessonSlideshow
            key={nonce}
            lesson={lesson}
            onComplete={() => {}}
            devMode={true}
            chrome="desktop-shell"
          />
        </div>
      </div>
    </div>
  );
}
