"use client";

/**
 * Clip playback for the placement: bank clips from the public audio bucket
 * (getAudioUrl("placement", id)), phoneme clips, and the child's name-pack
 * clips from the private bucket via /api/child-audio. One player, so a new
 * clip always stops the previous one; a chained `playSeq` for intros.
 */
import { getAudioUrl } from "@/lib/audio";
import type { NarrationKey } from "@/app/data/placement-bank/narration";

let current: HTMLAudioElement | null = null;
let interrupt: (() => void) | null = null;

export class PlacementAudioError extends Error {
  constructor() {
    super("Luna’s audio could not play.");
    this.name = "PlacementAudioError";
  }
}
export class PlacementAudioCancelled extends Error {
  constructor() {
    super("Audio playback was interrupted.");
    this.name = "PlacementAudioCancelled";
  }
}

let playbackContext: AudioContext | null = null;
let playbackAnalyser: AnalyserNode | null = null;
const playbackListeners = new Set<() => void>();
export const getPlaybackAnalyser = () => playbackAnalyser;
export function subscribePlayback(listener: () => void) {
  playbackListeners.add(listener);
  return () => {
    playbackListeners.delete(listener);
  };
}
function publishPlayback(analyser: AnalyserNode | null) {
  playbackAnalyser = analyser;
  playbackListeners.forEach((listener) => listener());
}
function connectPlayback(audio: HTMLAudioElement): () => void {
  let source: MediaElementAudioSourceNode | null = null;
  let analyser: AnalyserNode | null = null;
  let cancelled = false;
  try {
    if (!playbackContext || playbackContext.state === "closed") playbackContext = new AudioContext();
    const context = playbackContext;
    const connect = () => {
      if (cancelled || context.state !== "running") return;
      try {
        source = context.createMediaElementSource(audio);
        analyser = context.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser);
        analyser.connect(context.destination);
        publishPlayback(analyser);
      } catch {
        // If attaching the analyser fails, preserve the audible output.
        source?.connect(context.destination);
      }
    };
    // Resume on the caller's gesture, but do not route an element into a
    // suspended context: that can make a successfully playing clip silent.
    if (context.state === "running") connect();
    else void context.resume().then(connect, () => {});
  } catch {
    // Plain element playback works even when Web Audio is unavailable.
  }
  return () => {
    cancelled = true;
    source?.disconnect();
    analyser?.disconnect();
    if (playbackAnalyser === analyser) publishPlayback(null);
  };
}

let fast = false;
/** Robot mode: clips resolve almost immediately so a QA run takes seconds, not minutes. */
export function setFastAudio(on: boolean): void {
  fast = on;
}

let tickCtx: AudioContext | null = null;
/** Soft two-note tick (C6 -> E6, C-major like the shop chimes) after each word; silent in fast mode. */
export function softTick(): void {
  if (fast) return;
  try {
    tickCtx ??= new AudioContext();
    const ctx = tickCtx;
    const t0 = ctx.currentTime;
    [
      [1046.5, 0],
      [1318.5, 0.07],
    ].forEach(([freq, at]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t0 + at);
      g.gain.exponentialRampToValueAtTime(0.06, t0 + at + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + at + 0.12);
      o.connect(g).connect(ctx.destination);
      o.start(t0 + at);
      o.stop(t0 + at + 0.14);
    });
  } catch {
    /* no audio context: silent */
  }
}

export function stopClip(): void {
  interrupt?.();
  interrupt = null;
  if (current) {
    try {
      current.pause();
    } catch {
      /* ignore */
    }
    current = null;
  }
}

export function playUrlAsync(url: string, fallbackMs = 6000, required = false): Promise<void> {
  if (fast) return new Promise((resolve) => setTimeout(resolve, 60));
  return new Promise((resolve, reject) => {
    stopClip();
    let done = false;
    let guard: ReturnType<typeof setTimeout> | undefined;
    const a = new Audio();
    a.crossOrigin = "anonymous";
    a.src = url;
    const disconnectPlayback = connectPlayback(a);
    const finish = (failed = false, cancelled = false) => {
      if (done) return;
      done = true;
      clearTimeout(guard);
      disconnectPlayback();
      try {
        a.pause();
      } catch {
        /* ignore */
      }
      if (current === a) {
        current = null;
        interrupt = null;
      }
      if (failed && required)
        reject(cancelled ? new PlacementAudioCancelled() : new PlacementAudioError());
      else resolve();
    };
    current = a;
    interrupt = () => finish(true, true);
    a.addEventListener("ended", () => finish(), { once: true });
    a.addEventListener("error", () => finish(true), { once: true });
    guard = setTimeout(() => finish(true), fallbackMs);
    a.addEventListener(
      "playing",
      () => {
        if (done) return;
        clearTimeout(guard);
        const secs = Number.isFinite(a.duration) && a.duration > 0 ? a.duration : 45;
        guard = setTimeout(() => finish(true), secs * 1000 + 3000);
      },
      { once: true },
    );
    a.play().catch(() => finish(true));
  });
}

/** A scored listening task must never proceed after a missing instruction clip. */
export const playUrlRequired = (url: string, fallbackMs = 6000) =>
  playUrlAsync(url, fallbackMs, true);
export const playNarrRequired = (key: NarrationKey, fallbackMs = 8000) =>
  playUrlRequired(narrUrl(key), fallbackMs);
export async function playSeqRequired(urls: string[], gapMs = 250): Promise<void> {
  for (const url of urls) {
    await playUrlRequired(url);
    await new Promise((resolve) => setTimeout(resolve, gapMs));
  }
}

export const narrUrl = (key: NarrationKey): string => getAudioUrl("placement", `narr-${key}`);
export const clipUrl = (id: string): string => getAudioUrl("placement", id);
export const phonemeUrl = (id: string): string => getAudioUrl("phonemes", id);

export async function playNarr(key: NarrationKey, fallbackMs = 8000): Promise<void> {
  return playUrlAsync(narrUrl(key), fallbackMs);
}

export async function playSeq(urls: string[], gapMs = 250): Promise<void> {
  for (const u of urls) {
    await playUrlAsync(u);
    await new Promise((r) => setTimeout(r, gapMs));
  }
}

/** URL that plays a private child-audio object (the API answers with a redirect
 *  to a short-lived signed URL, which <audio> follows), or null when the object
 *  does not exist. */
export async function childAudioUrl(path: string): Promise<string | null> {
  const url = `/api/child-audio?path=${encodeURIComponent(path)}`;
  try {
    const r = await fetch(url, { method: "GET", redirect: "manual" });
    // 302 -> exists (opaque redirect shows as status 0 / type "opaqueredirect")
    if (r.type === "opaqueredirect" || (r.status >= 300 && r.status < 400)) return url;
    return null;
  } catch {
    return null;
  }
}
