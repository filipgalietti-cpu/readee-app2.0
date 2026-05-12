"use client";

import { useRef, useState } from "react";
import { Volume2, Square, HelpCircle } from "lucide-react";

/**
 * Two-clip audio player for the question preview — primary read-aloud
 * + hint clip. We render two buttons rather than a sequential player
 * so teachers can hear them independently while QA'ing.
 */
export default function QuestionAudioButton({
  primary,
  hint,
}: {
  primary: string | null;
  hint: string | null;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<"primary" | "hint" | null>(null);

  function play(kind: "primary" | "hint", url: string | null) {
    if (!url || !audioRef.current) return;
    if (playing === kind) {
      audioRef.current.pause();
      setPlaying(null);
      return;
    }
    audioRef.current.pause();
    audioRef.current.src = url;
    audioRef.current.currentTime = 0;
    audioRef.current
      .play()
      .then(() => setPlaying(kind))
      .catch(() => setPlaying(null));
  }

  if (!primary && !hint) return null;

  return (
    <>
      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => setPlaying(null)}
        onPause={() => {
          if (audioRef.current?.ended) setPlaying(null);
        }}
      />
      {primary && (
        <button
          type="button"
          onClick={() => play("primary", primary)}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition ${
            playing === "primary"
              ? "bg-indigo-600 text-white"
              : "border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900 dark:bg-slate-900 dark:text-indigo-300"
          }`}
        >
          {playing === "primary" ? (
            <Square className="h-3 w-3" />
          ) : (
            <Volume2 className="h-3 w-3" />
          )}
          {playing === "primary" ? "Stop" : "Play prompt"}
        </button>
      )}
      {hint && (
        <button
          type="button"
          onClick={() => play("hint", hint)}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition ${
            playing === "hint"
              ? "bg-amber-600 text-white"
              : "border border-amber-200 bg-white text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:bg-slate-900 dark:text-amber-300"
          }`}
        >
          {playing === "hint" ? (
            <Square className="h-3 w-3" />
          ) : (
            <HelpCircle className="h-3 w-3" />
          )}
          {playing === "hint" ? "Stop" : "Play hint"}
        </button>
      )}
    </>
  );
}
