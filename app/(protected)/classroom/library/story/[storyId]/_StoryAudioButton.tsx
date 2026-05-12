"use client";

import { useRef, useState } from "react";
import { Volume2, Square } from "lucide-react";

export default function StoryAudioButton({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }
    audioRef.current.src = url;
    audioRef.current.currentTime = 0;
    audioRef.current
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }

  return (
    <>
      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => setPlaying(false)}
        onPause={() => {
          if (audioRef.current?.ended) setPlaying(false);
        }}
      />
      <button
        type="button"
        onClick={toggle}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
          playing
            ? "bg-indigo-600 text-white"
            : "border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900 dark:bg-slate-900 dark:text-indigo-300"
        }`}
      >
        {playing ? <Square className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
        {playing ? "Stop story" : "Play story"}
      </button>
    </>
  );
}
