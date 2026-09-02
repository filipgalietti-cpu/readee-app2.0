"use client";

import { useEffect, useRef, useState } from "react";
import { VOICES, voiceSampleUrl, type VoiceId } from "@/lib/ai/voices";
import { Glyph } from "@/app/_components/Glyph";

/**
 * Voice picker for the wizard "Audio & visuals" step. Renders one card
 * per voice with name, blurb, "best for" hint, and a play button that
 * previews a short sample clip from Supabase.
 *
 * Selected voice id is the friendly key (sage/rio/etc); upstream
 * orchestrators map it to the Gemini voiceName via getVoice().
 */
export default function VoiceSelector({
  value,
  onChange,
}: {
  value: VoiceId;
  onChange: (id: VoiceId) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<VoiceId | null>(null);
  const [loadingId, setLoadingId] = useState<VoiceId | null>(null);
  const [errorId, setErrorId] = useState<VoiceId | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  function play(id: VoiceId) {
    const url = voiceSampleUrl(id);
    if (!url) {
      // env var missing client-side — voiceSampleUrl returned ""
      console.warn(
        "[VoiceSelector] No NEXT_PUBLIC_SUPABASE_URL - voice sample URL is empty.",
      );
      setErrorId(id);
      return;
    }
    if (!audioRef.current) audioRef.current = new Audio();
    const a = audioRef.current;
    if (playingId === id) {
      a.pause();
      setPlayingId(null);
      return;
    }
    setErrorId(null);
    setLoadingId(id);
    a.src = url;
    a.onended = () => {
      setPlayingId(null);
      setLoadingId(null);
    };
    a.onerror = () => {
      console.warn(`[VoiceSelector] Audio error loading ${url}`, a.error);
      setPlayingId(null);
      setLoadingId(null);
      setErrorId(id);
    };
    a.play()
      .then(() => {
        setPlayingId(id);
        setLoadingId(null);
      })
      .catch((err) => {
        console.warn(`[VoiceSelector] play() rejected for ${url}`, err);
        setPlayingId(null);
        setLoadingId(null);
        setErrorId(id);
      });
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <Glyph name="volume2" size={16} className="text-violet-600" />
        <div className="font-bold text-zinc-900">Voice</div>
        <div className="ml-auto text-[11px] text-zinc-500">
          Tap play to preview
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {VOICES.map((v) => {
          const selected = value === v.id;
          const isPlaying = playingId === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onChange(v.id)}
              className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                selected
                  ? "border-violet-400 bg-violet-50 ring-2 ring-violet-200"
                  : "border-zinc-200 bg-white hover:border-violet-300"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-zinc-900">{v.name}</span>
                  {selected && (
                    <Glyph name="check" size={14} className="text-violet-600" />
                  )}
                </div>
                <div className="mt-0.5 text-[11px] leading-snug text-zinc-600">
                  {v.blurb}
                </div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-violet-600">
                  Best for: {v.bestFor}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    play(v.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      play(v.id);
                    }
                  }}
                  className={`mt-0.5 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border transition ${
                    errorId === v.id
                      ? "border-red-300 bg-red-50 text-red-600"
                      : isPlaying
                      ? "border-violet-400 bg-violet-600 text-white"
                      : "border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
                  }`}
                  aria-label={`Preview ${v.name}'s voice`}
                >
                  {loadingId === v.id ? (
                    <Glyph name="loader2" size={14} className="animate-spin" />
                  ) : errorId === v.id ? (
                    <Glyph name="alert-circle" size={14} />
                  ) : isPlaying ? (
                    <Glyph name="pause" size={14} />
                  ) : (
                    <Glyph name="volume2" size={14} />
                  )}
                </span>
                {errorId === v.id && (
                  <span className="text-[10px] font-semibold text-red-600">
                    Couldn&apos;t play
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
