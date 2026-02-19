import { Howl, Howler } from "howler";
import { useAudioStore } from "@/lib/stores/audio-store";

/** Pre-load voices (some browsers load them async) */
function initVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined") return Promise.resolve([]);
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    speechSynthesis.onvoiceschanged = () => {
      resolve(speechSynthesis.getVoices());
    };
    setTimeout(() => resolve(speechSynthesis.getVoices()), 1000);
  });
}

/** Pick a warm female voice when available */
function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const female = voices.find(
    (v) => v.lang.startsWith("en") && /female|samantha|karen|fiona|victoria|zira/i.test(v.name)
  );
  if (female) return female;
  return voices.find((v) => v.lang.startsWith("en"));
}

class AudioManager {
  private cache = new Map<string, Howl>();
  private currentHowl: Howl | null = null;
  private audioCtx: AudioContext | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      initVoices();
    }
  }

  private getAudioCtx(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
    return this.audioCtx;
  }

  /** Play audio from a URL via Howler with fade-in */
  play(url: string): Promise<void> {
    const { isMuted } = useAudioStore.getState();
    if (isMuted) return Promise.resolve();

    this.stop();

    return new Promise((resolve) => {
      let howl = this.cache.get(url);
      if (!howl) {
        howl = new Howl({ src: [url], html5: true });
        this.cache.set(url, howl);
      }

      this.currentHowl = howl;
      howl.volume(0);

      howl.once("end", () => {
        this.currentHowl = null;
        resolve();
      });
      howl.once("loaderror", () => {
        this.currentHowl = null;
        resolve();
      });
      howl.once("playerror", () => {
        this.currentHowl = null;
        resolve();
      });

      howl.play();
      howl.fade(0, 1, 300);
    });
  }

  /** Stop current Howl + cancel SpeechSynthesis */
  stop(): void {
    if (this.currentHowl) {
      try {
        this.currentHowl.fade(this.currentHowl.volume() as number, 0, 200);
        const h = this.currentHowl;
        setTimeout(() => h.stop(), 200);
      } catch {}
      this.currentHowl = null;
    }
    if (typeof window !== "undefined") {
      try { speechSynthesis.cancel(); } catch {}
    }
  }

  /** Preload audio from URL */
  preload(url: string): void {
    if (this.cache.has(url)) return;
    const howl = new Howl({ src: [url], html5: true, preload: true });
    this.cache.set(url, howl);
  }

  /** Set global mute via Howler */
  setMuted(muted: boolean): void {
    Howler.mute(muted);
  }

  /** Speak text via SpeechSynthesis (respects mute) */
  speakText(text: string): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve();
    const { isMuted } = useAudioStore.getState();
    if (isMuted) return Promise.resolve();

    return this._speak(text);
  }

  /** Speak text regardless of mute state */
  speakManual(text: string): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve();
    return this._speak(text);
  }

  private _speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      try {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85;
        utterance.pitch = 1.1;
        const voices = speechSynthesis.getVoices();
        const voice = pickVoice(voices);
        if (voice) utterance.voice = voice;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        speechSynthesis.speak(utterance);
      } catch {
        resolve();
      }
    });
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

  /** Play pop sound: short high-frequency burst */
  playPopSound(): void {
    const { isMuted } = useAudioStore.getState();
    if (isMuted) return;
    this.playTones([{ freq: 880, duration: 0.08 }], "sine");
  }

  /** Play unlock chime: ascending triad F5 → A5 → C6 */
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
