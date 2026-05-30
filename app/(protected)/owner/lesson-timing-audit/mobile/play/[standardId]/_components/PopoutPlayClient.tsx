"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { LessonSlideshow } from "@/app/components/lesson/LessonSlideshow";
import type { SampleLesson } from "@/app/components/lesson/LessonSlideshow";

/**
 * Pop-out window content. The phone fills the browser window — no
 * page chrome, no sidebar — so the reviewer can drag this window
 * onto a second monitor and have a full-size mobile preview while
 * the comment cards stay on the main page.
 */
export default function PopoutPlayClient({
  lesson,
}: {
  lesson: SampleLesson;
}) {
  const [nonce, setNonce] = useState(0);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-zinc-900">
      {/* Replay button — small, top-right. */}
      <button
        onClick={() => setNonce((n) => n + 1)}
        className="absolute right-3 top-3 z-[200] inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-zinc-900 shadow-md hover:bg-white"
        title="Restart slideshow from slide 1"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Replay
      </button>

      {/* iPhone frame, centered. `transform: translateZ(0)` traps the
          slideshow's `position: fixed` inside the frame. */}
      <div className="flex h-full w-full items-center justify-center p-4">
        <div
          className="relative overflow-hidden rounded-[44px] border-[4px] border-zinc-900 bg-black shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]"
          style={{
            width: 393,
            height: 852,
            transform: "translateZ(0)",
          }}
        >
          <LessonSlideshow
            key={nonce}
            lesson={lesson}
            onComplete={() => {}}
            devMode={true}
            chrome="mobile-shell"
          />
        </div>
      </div>
    </div>
  );
}
