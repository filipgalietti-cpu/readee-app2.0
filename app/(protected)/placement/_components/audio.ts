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
let fast = false;
/** Robot mode: clips resolve almost immediately so a QA run takes seconds, not minutes. */
export function setFastAudio(on: boolean): void { fast = on; }

let tickCtx: AudioContext | null = null;
/** Soft two-note tick (C6 -> E6, C-major like the shop chimes) after each word; silent in fast mode. */
export function softTick(): void {
  if (fast) return;
  try {
    tickCtx ??= new AudioContext();
    const ctx = tickCtx;
    const t0 = ctx.currentTime;
    [[1046.5, 0], [1318.5, 0.07]].forEach(([freq, at]) => {
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
  } catch { /* no audio context: silent */ }
}

export function stopClip(): void {
  if (current) { try { current.pause(); } catch { /* ignore */ } current = null; }
}

export function playUrlAsync(url: string, fallbackMs = 6000): Promise<void> {
  if (fast) return new Promise((resolve) => setTimeout(resolve, 60));
  return new Promise((resolve) => {
    stopClip();
    let done = false;
    // Whatever ends the wait (ended, error, or the fallback timer), the clip stops: the fallback used to leave a
    // slow-loading clip playing under the next one (the overlap heard at the passage in the first real run).
    const finish = () => { if (done) return; done = true; try { a.pause(); } catch { /* ignore */ } if (current === a) current = null; resolve(); };
    const a = new Audio(url);
    current = a;
    a.addEventListener("ended", finish, { once: true });
    a.addEventListener("error", finish, { once: true });
    // Progression never gates on `ended` alone (engine law): a blocked device still moves on.
    // But a clip that IS playing gets its whole length: `fallbackMs` only covers "never started";
    // once audio is flowing the guard becomes the clip's own duration plus a margin (a stalled
    // stream still moves on). Luna used to be cut off mid-sentence on every line longer than the fallback.
    let guard = window.setTimeout(finish, fallbackMs);
    a.addEventListener("playing", () => {
      window.clearTimeout(guard);
      const secs = Number.isFinite(a.duration) && a.duration > 0 ? a.duration : 45;
      guard = window.setTimeout(finish, secs * 1000 + 3000);
    }, { once: true });
    a.addEventListener("ended", () => window.clearTimeout(guard), { once: true });
    a.play().catch(finish);
  });
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
  } catch { return null; }
}
