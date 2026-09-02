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

export function stopClip(): void {
  if (current) { try { current.pause(); } catch { /* ignore */ } current = null; }
}

export function playUrlAsync(url: string, fallbackMs = 6000): Promise<void> {
  if (fast) return new Promise((resolve) => setTimeout(resolve, 60));
  return new Promise((resolve) => {
    stopClip();
    let done = false;
    const finish = () => { if (done) return; done = true; if (current === a) current = null; resolve(); };
    const a = new Audio(url);
    current = a;
    a.addEventListener("ended", finish, { once: true });
    a.addEventListener("error", finish, { once: true });
    // Progression never gates on `ended` alone (engine law): a blocked device still moves on.
    const t = window.setTimeout(finish, fallbackMs);
    a.addEventListener("ended", () => window.clearTimeout(t), { once: true });
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
