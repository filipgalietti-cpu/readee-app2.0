"use client";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/** Mounted only on the opening screen. Decorative sound never blocks the lesson. */
export default function OpeningAmbience({
  src,
  label,
  duck = false,
  volume = 0.16,
  duckVolume = 0.04,
}: {
  src: string;
  label: string;
  duck?: boolean;
  volume?: number;
  duckVolume?: number;
}) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    const player = new Audio(src);
    audio.current = player;
    player.loop = true;
    player.volume = Math.max(0, Math.min(1, volume));
    player.preload = "none";
    player.onplay = () => setPlaying(true);
    player.onpause = () => setPlaying(false);
    player.onerror = () => {
      setPlaying(false);
      setFailed(true);
    };
    // Autoplay is optional; the button supplies a user gesture when the browser requires one.
    void player.play().catch(() => {});
    const hide = () => {
      if (document.hidden) player.pause();
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      document.removeEventListener("visibilitychange", hide);
      player.onplay = null;
      player.onpause = null;
      player.onerror = null;
      player.pause();
      player.removeAttribute("src");
      player.load();
      audio.current = null;
    };
  }, [src]);
  useEffect(() => {
    if (audio.current) audio.current.volume = Math.max(0, Math.min(1, duck ? duckVolume : volume));
  }, [duck, volume, duckVolume]);
  return (
    <button
      className="le-ambience"
      type="button"
      aria-label={label}
      aria-pressed={playing}
      disabled={failed}
      onClick={() => {
        const player = audio.current;
        if (!player) return;
        if (player.paused) void player.play().catch(() => {});
        else player.pause();
      }}
    >
      {playing ? <Volume2 size={18} /> : <VolumeX size={18} />}
      {failed ? "Sound unavailable" : label}
    </button>
  );
}
