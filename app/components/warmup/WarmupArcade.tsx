"use client";

/**
 * Warm-Up Arcade runner — LISTEN → PLAY → CELEBRATE in under a minute.
 *
 * No-fail contract (Jennifer's spec, non-negotiable):
 *  - nothing is ever marked wrong; off-target taps wobble and cost nothing
 *  - score only counts up; the end screen never mentions misses
 *  - completion always pays carrots and ends in celebration
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Carrot, Play, Volume2 } from "lucide-react";
import type { WarmupDef, WarmupWave } from "@/lib/warmup-engine/types";

type Phase = "intro" | "play" | "celebrate";

const POP_MS = 420;

function usePlayer() {
  const ref = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    return () => {
      if (ref.current) {
        ref.current.pause();
        ref.current.src = "";
      }
    };
  }, []);
  return useCallback((src: string, onEnd?: () => void) => {
    if (ref.current) ref.current.pause();
    const a = new Audio(src);
    ref.current = a;
    if (onEnd) a.onended = onEnd;
    a.play().catch(() => onEnd?.());
  }, []);
}

/** Soft two-note pop chime via WebAudio (C major family, like the shop). */
function popChime(good = true) {
  try {
    const ctx = new AudioContext();
    const notes = good ? [523.25, 783.99] : [];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.09);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.25);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.09);
      o.stop(ctx.currentTime + i * 0.09 + 0.3);
    });
    setTimeout(() => ctx.close(), 800);
  } catch {
    /* audio is a garnish, never a blocker */
  }
}

export default function WarmupArcade({
  warmup,
  onComplete,
}: {
  warmup: WarmupDef;
  /** Called from the celebrate screen's continue button (journey → lesson). */
  onComplete?: () => void;
}) {
  const reduce = useReducedMotion();
  const play = usePlayer();
  const playSeconds = warmup.playSeconds ?? 45;

  const [phase, setPhase] = useState<Phase>("intro");
  const [introStarted, setIntroStarted] = useState(false);
  const [waveIdx, setWaveIdx] = useState(0);
  const [popped, setPopped] = useState<Set<string>>(new Set());
  const [wobble, setWobble] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(playSeconds);
  const [best, setBest] = useState<number | null>(null);

  const bestKey = `warmup-best:${warmup.id}`;
  useEffect(() => {
    const raw = localStorage.getItem(bestKey);
    if (raw) setBest(Number(raw));
  }, [bestKey]);

  const wave: WarmupWave | undefined = warmup.waves[waveIdx];
  const waveDone = useMemo(
    () => !!wave && wave.tiles.filter((t) => t.isMatch).every((t) => popped.has(t.word)),
    [wave, popped],
  );

  const finish = useCallback(() => {
    setPhase("celebrate");
    setBest((prev) => {
      const b = Math.max(prev ?? 0, score);
      localStorage.setItem(bestKey, String(b));
      return b;
    });
    play(warmup.celebrate.audio);
  }, [bestKey, play, score, warmup.celebrate.audio]);

  // Harvest window: soft timer, only runs during play. Ending is a finish,
  // never a failure.
  useEffect(() => {
    if (phase !== "play") return;
    if (secondsLeft <= 0) {
      finish();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, secondsLeft, finish]);

  // Wave advance: when all matches in a wave are popped, roll the next wave
  // (call mode announces the next call). Out of waves = early finish.
  useEffect(() => {
    if (phase !== "play" || !waveDone) return;
    const next = waveIdx + 1;
    const t = setTimeout(() => {
      if (next >= warmup.waves.length) {
        finish();
        return;
      }
      setPopped(new Set());
      setWaveIdx(next);
      const call = warmup.waves[next].call;
      if (call) play(call.audio);
    }, POP_MS + 260);
    return () => clearTimeout(t);
  }, [phase, waveDone, waveIdx, warmup.waves, finish, play]);

  function startIntro() {
    setIntroStarted(true);
    play(warmup.intro.audio, () => startPlay());
  }

  function startPlay() {
    setPhase("play");
    setSecondsLeft(playSeconds);
    const call = warmup.waves[0]?.call;
    if (call) play(call.audio);
  }

  function tapTile(word: string, isMatch: boolean) {
    if (phase !== "play" || popped.has(word)) return;
    if (isMatch) {
      popChime(true);
      setPopped((p) => new Set(p).add(word));
      setScore((s) => s + 1);
    } else {
      // No-fail: a wobble and nothing else. No sound, no penalty, no record.
      setWobble(word);
      setTimeout(() => setWobble(null), 500);
    }
  }

  const timerPct = (secondsLeft / playSeconds) * 100;

  return (
    <main className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-indigo-100 via-violet-50 to-amber-50">
      {/* ---------- INTRO ---------- */}
      {phase === "intro" && (
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-violet-500">
            Warm-Up
          </p>
          <h1 className="font-display text-4xl text-indigo-800">{warmup.title}</h1>
          <motion.div
            initial={reduce ? false : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex h-36 w-36 items-center justify-center rounded-3xl bg-white shadow-lg"
          >
            <span className="font-display text-5xl text-violet-600">
              {warmup.intro.cardText}
            </span>
          </motion.div>
          {!introStarted ? (
            <button
              type="button"
              onClick={startIntro}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-indigo-700 active:scale-[0.98]"
            >
              <Play className="h-5 w-5" />
              Start
            </button>
          ) : (
            <button
              type="button"
              onClick={startPlay}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-indigo-700 shadow transition hover:bg-indigo-50 active:scale-[0.98]"
            >
              <Volume2 className="h-4 w-4" />
              Skip to the game
            </button>
          )}
        </div>
      )}

      {/* ---------- PLAY ---------- */}
      {phase === "play" && wave && (
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-6">
          {/* Score + soft harvest timer (count-up score, shrinking sun bar) */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow">
              <Carrot className="h-5 w-5 text-orange-500" />
              <span className="font-display text-2xl text-indigo-800" aria-live="polite">
                {score}
              </span>
            </div>
            <div className="h-3 w-32 overflow-hidden rounded-full bg-white/70 shadow-inner">
              <div
                className="h-full rounded-full bg-amber-400 transition-[width] duration-1000 ease-linear"
                style={{ width: `${timerPct}%` }}
              />
            </div>
          </div>

          <p className="mt-6 text-center font-display text-2xl text-indigo-800">
            {wave.call ? warmup.playPrompt : warmup.playPrompt}
          </p>
          {wave.call && (
            <button
              type="button"
              onClick={() => play(wave.call!.audio)}
              className="mx-auto mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-violet-600 shadow"
            >
              <Volume2 className="h-4 w-4" />
              Hear it again
            </button>
          )}

          {/* Tile field */}
          <div className="mt-8 grid flex-1 auto-rows-min grid-cols-2 content-center gap-4">
            <AnimatePresence>
              {wave.tiles.map((t, i) =>
                popped.has(t.word) ? null : (
                  <motion.button
                    key={`${waveIdx}-${t.word}`}
                    type="button"
                    onClick={() => tapTile(t.word, t.isMatch)}
                    initial={reduce ? false : { y: 40, opacity: 0 }}
                    animate={
                      wobble === t.word
                        ? { x: [0, -8, 8, -5, 5, 0], y: 0, opacity: 1 }
                        : { y: 0, opacity: 1 }
                    }
                    exit={
                      reduce
                        ? { opacity: 0 }
                        : { scale: 1.35, opacity: 0, transition: { duration: POP_MS / 1000 } }
                    }
                    transition={{ delay: reduce ? 0 : i * 0.07 }}
                    className="rounded-3xl bg-white px-4 py-6 text-center font-display text-3xl text-indigo-800 shadow-lg transition hover:shadow-xl active:scale-[0.97]"
                  >
                    {t.word}
                  </motion.button>
                ),
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ---------- CELEBRATE ---------- */}
      {phase === "celebrate" && (
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
          <motion.div
            initial={reduce ? false : { scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-lg"
          >
            <Carrot className="h-16 w-16 text-orange-500" />
          </motion.div>
          <h2 className="font-display text-4xl text-indigo-800">You caught {score}!</h2>
          {best !== null && best > 0 && (
            <p className="text-base font-semibold text-slate-500">
              {score >= best ? "That's your best yet!" : `Your best is ${best}. You'll get it!`}
            </p>
          )}
          <p className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-600">
            <Carrot className="h-4 w-4" />+{warmup.carrots} carrots
          </p>
          <button
            type="button"
            onClick={onComplete}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-indigo-700 active:scale-[0.98]"
          >
            On to the lesson!
          </button>
        </div>
      )}
    </main>
  );
}
