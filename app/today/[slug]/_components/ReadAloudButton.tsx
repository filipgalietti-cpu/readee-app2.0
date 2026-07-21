"use client";

import { useState } from "react";
import { Volume2, Pause } from "lucide-react";

/**
 * Plays the passage's TTS audio (the Autonoe-voice mp3) for the daily
 * reading page's left column. Lazy-constructs the Audio element on
 * first play so the page doesn't preload audio it may never use.
 */
export default function ReadAloudButton({ audioUrl }: { audioUrl: string | null }) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  if (!audioUrl) return null;

  function toggle() {
    let a = audio;
    if (!a) {
      a = new Audio(audioUrl!);
      a.onended = () => setPlaying(false);
      setAudio(a);
    }
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="ml-3 inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white px-3.5 py-1.5 text-[13px] font-bold text-violet-700 shadow-sm transition hover:bg-violet-50"
    >
      {playing ? <Pause className="h-[15px] w-[15px]" /> : <Volume2 className="h-[15px] w-[15px]" />}
      {playing ? "Stop" : "Read aloud"}
    </button>
  );
}
