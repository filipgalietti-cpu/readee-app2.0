import { Howl, Howler } from "howler";
import { useAudioStore } from "@/lib/stores/audio-store";

class AudioManager {
  private cache = new Map<string, Howl>();
  private currentHowl: Howl | null = null;
  private audioCtx: AudioContext | null = null;
  private sequenceAbort: AbortController | null = null;

  private getAudioCtx(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
    return this.audioCtx;
  }

  /** Unlock audio playback — call on first user gesture */
  async unlockAudio(): Promise<void> {
    try {
      const ctx = this.getAudioCtx();
      if (ctx.state === "suspended") await ctx.resume();
      if (Howler.ctx && Howler.ctx.state === "suspended") await Howler.ctx.resume();
    } catch {}
  }

  /** Play audio from a URL via Howler with fade-in */
  play(url: string): Promise<void> {
    const { isMuted } = useAudioStore.getState();
    if (isMuted) return Promise.resolve();

    if (this.currentHowl) {
      try { this.currentHowl.stop(); } catch {}
      this.currentHowl = null;
    }

    return new Promise((resolve) => {
      let howl = this.cache.get(url);
      if (!howl) {
        howl = new Howl({ src: [url], preload: true });
        this.cache.set(url, howl);
      }

      howl.off("end").off("loaderror").off("playerror");

      this.currentHowl = howl;
      howl.volume(0);

      howl.once("end", () => {
        if (this.currentHowl === howl) this.currentHowl = null;
        resolve();
      });
      howl.once("loaderror", () => {
        if (this.currentHowl === howl) this.currentHowl = null;
        resolve();
      });
      howl.once("playerror", () => {
        if (this.currentHowl === howl) this.currentHowl = null;
        resolve();
      });

      howl.play();
      howl.fade(0, 1, 300);
    });
  }

  /** Play a sequence of audio URLs with delays */
  async playSequence(items: Array<{ url?: string; delayMs?: number }>): Promise<void> {
    this.abortSequence();
    const { isMuted } = useAudioStore.getState();
    if (isMuted) return;

    this.sequenceAbort = new AbortController();
    const signal = this.sequenceAbort.signal;

    for (const item of items) {
      if (signal.aborted) return;
      if (item.url) {
        await this.play(item.url);
      }
      if (signal.aborted) return;
      if (item.delayMs) {
        await new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, item.delayMs);
          signal.addEventListener("abort", () => { clearTimeout(timer); resolve(); }, { once: true });
        });
      }
    }
  }

  /** Abort any running audio sequence */
  abortSequence(): void {
    if (this.sequenceAbort) {
      this.sequenceAbort.abort();
      this.sequenceAbort = null;
    }
    this.stopCurrent();
  }

  private stopCurrent(): void {
    if (this.currentHowl) {
      try { this.currentHowl.stop(); } catch {}
      this.currentHowl = null;
    }
  }

  /** Stop everything */
  stop(): void {
    this.abortSequence();
  }

  /** Preload audio from URL */
  preload(url: string): void {
    if (this.cache.has(url)) return;
    const howl = new Howl({ src: [url], preload: true });
    this.cache.set(url, howl);
  }

  /** Set global mute via Howler */
  setMuted(muted: boolean): void {
    Howler.mute(muted);
  }

  /** Play correct answer chime: C5 → E5 */
  playCorrectChime(): void {
    const { isMuted } = useAudioStore.getState();
    if (isMuted) return;
    this.playTones([
      { freq: 523, duration: 0.15 },
      { freq: 659, duration: 0.15 },
    ], "sine");
  }

  /** Play incorrect answer buzz: 200Hz square */
  playIncorrectBuzz(): void {
    const { isMuted } = useAudioStore.getState();
    if (isMuted) return;
    this.playTones([
      { freq: 200, duration: 0.2 },
    ], "square");
  }

  /** Play completion chime: C5 → E5 → G5 */
  playCompleteChime(): void {
    const { isMuted } = useAudioStore.getState();
    if (isMuted) return;
    this.playTones([
      { freq: 523, duration: 0.15 },
      { freq: 659, duration: 0.15 },
      { freq: 784, duration: 0.15 },
    ], "sine");
  }

  /** Play pop sound */
  playPopSound(): void {
    const { isMuted } = useAudioStore.getState();
    if (isMuted) return;
    this.playTones([{ freq: 880, duration: 0.08 }], "sine");
  }

  /** Play unlock chime: F5 → A5 → C6 */
  playUnlockChime(): void {
    const { isMuted } = useAudioStore.getState();
    if (isMuted) return;
    this.playTones([
      { freq: 698, duration: 0.12 },
      { freq: 880, duration: 0.12 },
      { freq: 1047, duration: 0.18 },
    ], "sine");
  }

  /** Play whoosh: quick descending sweep */
  playWhoosh(): void {
    const { isMuted } = useAudioStore.getState();
    if (isMuted) return;
    try {
      const ctx = this.getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  }

  private playTones(tones: { freq: number; duration: number }[], type: OscillatorType): void {
    try {
      const ctx = this.getAudioCtx();
      let startTime = ctx.currentTime;

      for (const tone of tones) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = tone.freq;
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + tone.duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + tone.duration);
        startTime += tone.duration;
      }
    } catch {}
  }
}

/** Singleton instance */
export const audioManager = typeof window !== "undefined" ? new AudioManager() : (null as unknown as AudioManager);
