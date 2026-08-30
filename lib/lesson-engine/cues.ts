"use client";

// Narration + cue engine. Replaces the old parallel "greybox-audio" layer:
//  • SFX go through the app's existing audioManager (Howler) — no re-invention.
//  • Narration runs on an HTMLAudio element with a requestAnimationFrame clock
//    against audio.currentTime — frame-accurate cue firing (the old ~4Hz
//    `timeupdate` trigger was the source of the "timing feels off" bug class).
//  • Cues choreograph animation during narration. They never advance the lesson.

import { audioManager } from "@/lib/audio/audio-manager";
import type { Cue, WordTiming } from "./types";

// ── SFX (existing app infrastructure) ──────────────────────────────
export function sfxCorrect(): void {
  audioManager?.playCorrectChime();
}
export function sfxWrong(): void {
  audioManager?.playIncorrectBuzz();
}
export function sfxComplete(): void {
  audioManager?.playCompleteChime();
}

// ── one-shot clips (word tiles, confirmations) ─────────────────────
// RULE: audio NEVER overlaps. One voice at a time — a word tap silences the
// narration, narration silences any clip. (K kids tap while the teacher talks;
// the tap wins.)
let oneshot: HTMLAudioElement | null = null;
function stopOneshot(): void {
  if (oneshot) {
    oneshot.pause();
    oneshot = null;
  }
}
export function playUrl(url: string, onEnded?: () => void): void {
  if (typeof window === "undefined") return;
  stopNarration();
  stopOneshot();
  oneshot = new Audio(url);
  if (onEnded) oneshot.addEventListener("ended", onEnded, { once: true });
  oneshot.play().catch(() => {});
}

// ── instant spoken feedback (shared Autonoe clips) ─────────────────
// Praise fires the MOMENT the learner is right (rotating so it doesn't repeat);
// nice-try fires on the 2-strikes give-up before moving on.
const PRAISE = [1, 2, 3].map((n) => `/audio/lessons-v2/_shared/praise-${n}.mp3`);
let praiseIdx = 0;
export function playPraise(onEnded?: () => void): void {
  playUrl(PRAISE[praiseIdx++ % PRAISE.length], onEnded);
}
export function playNiceTry(onEnded?: () => void): void {
  playUrl("/audio/lessons-v2/_shared/nice-try.mp3", onEnded);
}
// Per-ITEM feedback voices (K students need spoken feedback, not synth tones —
// and WebAudio SFX respect the app mute pref, which silently ate feedback).
const YES = [1, 2].map((n) => `/audio/lessons-v2/_shared/yes-${n}.mp3`);
let yesIdx = 0;
export function playYes(onEnded?: () => void): void {
  playUrl(YES[yesIdx++ % YES.length], onEnded);
}
export function playTryAgain(onEnded?: () => void): void {
  playUrl("/audio/lessons-v2/_shared/try-again.mp3", onEnded);
}

// ── browser-voice fallback (only when no recorded clip exists) ─────
export function speak(text: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.8;
  u.pitch = 1.1;
  window.speechSynthesis.speak(u);
}

// ── narration with cue choreography ────────────────────────────────
/** Resolve a cue's `at` (word or seconds) to a time using Whisper timings.
 *  Word match: last occurrence wins (the reveal usually lands on the final
 *  mention), with a 120ms pre-roll so the visual leads the audio slightly. */
export function resolveCueTime(at: string | number, words: WordTiming[] | undefined): number | null {
  if (typeof at === "number") return at;
  if (!words) return null;
  const target = at.toLowerCase();
  let t: number | null = null;
  for (const w of words) {
    const n = w.word.toLowerCase().replace(/[^a-z']/g, "");
    if (n === target || n.startsWith(target)) t = w.start;
  }
  return t != null ? Math.max(0, t - 0.12) : null;
}

/** Align display-text words to Whisper timings, robust to Whisper splitting or
 *  merging words (e.g. "Milo" transcribed as "My low" — an off-by-one that made
 *  karaoke highlight a word early). Instead of matching strings 1:1, we build a
 *  character timeline from the whisper tokens and interpolate each display
 *  word's start from its character position — proven approach from the Stories
 *  karaoke pipeline. Returns a start time (s) per display word. */
export function alignTextToTimings(text: string, words: WordTiming[] | undefined): number[] {
  const display = text.split(/\s+/).filter(Boolean);
  const clean = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, "");
  if (!words || words.length === 0) return display.map(() => 0);

  // character timeline from whisper tokens
  const tokens = words
    .map((w) => ({ n: clean(w.word).length, start: w.start, end: w.end }))
    .filter((t) => t.n > 0);
  const totalChars = tokens.reduce((s, t) => s + t.n, 0);
  const displayChars = display.map((w) => clean(w).length);
  const displayTotal = displayChars.reduce((s, n) => s + n, 0) || 1;

  const starts: number[] = [];
  let cum = 0; // chars of display consumed so far
  for (let i = 0; i < display.length; i++) {
    // this word's char position, scaled onto the whisper char timeline
    const pos = (cum / displayTotal) * totalChars;
    let acc = 0;
    let t = tokens[tokens.length - 1]?.start ?? 0;
    for (const tok of tokens) {
      if (pos < acc + tok.n) {
        const frac = (pos - acc) / tok.n;
        t = tok.start + (tok.end - tok.start) * Math.max(0, Math.min(1, frac));
        break;
      }
      acc += tok.n;
    }
    starts.push(t);
    cum += displayChars[i];
  }
  return starts;
}

let narration: HTMLAudioElement | null = null;
let raf = 0;

export function stopNarration(): void {
  if (narration) {
    narration.pause();
    narration = null;
  }
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
}

export function playNarration(
  url: string,
  opts?: {
    cues?: Cue[];
    words?: WordTiming[];
    onCue?: (cue: Cue) => void;
    onEnded?: () => void;
    onPlayingChange?: (playing: boolean) => void;
  },
): void {
  stopNarration();
  stopOneshot(); // one voice at a time, always
  if (typeof window === "undefined") return;

  const el = new Audio(url);
  narration = el;

  const pending = (opts?.cues ?? [])
    .map((c) => ({ cue: c, t: resolveCueTime(c.at, opts?.words) }))
    .filter((x): x is { cue: Cue; t: number } => x.t != null)
    .sort((a, b) => a.t - b.t);
  let next = 0;

  const tick = () => {
    if (!narration || narration !== el) return;
    const cur = el.currentTime;
    while (next < pending.length && cur >= pending[next].t) {
      opts?.onCue?.(pending[next].cue);
      next++;
    }
    raf = requestAnimationFrame(tick);
  };

  el.addEventListener("ended", () => {
    opts?.onPlayingChange?.(false);
    // Fire any cues the clock didn't reach (safety — never strand a reveal).
    while (next < pending.length) {
      opts?.onCue?.(pending[next].cue);
      next++;
    }
    opts?.onEnded?.();
  }, { once: true });

  el.play()
    .then(() => {
      opts?.onPlayingChange?.(true);
      raf = requestAnimationFrame(tick);
    })
    .catch(() => {
      // Autoplay blocked pre-gesture: report not-playing; the ► button retries.
      opts?.onPlayingChange?.(false);
    });
}

export function replayNarration(url: string): void {
  playNarration(url);
}
