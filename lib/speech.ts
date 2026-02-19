/* ─── Low-level Speech Utilities ──────────────────────── */

let currentAudio: HTMLAudioElement | null = null;

/** Pre-load voices (some browsers load them async) */
export function initVoices(): Promise<SpeechSynthesisVoice[]> {
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
    // Fallback if event never fires
    setTimeout(() => resolve(speechSynthesis.getVoices()), 1000);
  });
}

/** Pick a warm female voice when available */
function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  // Prefer English female voices
  const female = voices.find(
    (v) => v.lang.startsWith("en") && /female|samantha|karen|fiona|victoria|zira/i.test(v.name)
  );
  if (female) return female;
  // Fallback: any English voice
  return voices.find((v) => v.lang.startsWith("en"));
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
}

/** Speak text via SpeechSynthesis. Returns a promise that resolves when done. */
export function speakText(
  text: string,
  opts: SpeakOptions = {}
): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  return new Promise((resolve) => {
    try {
      speechSynthesis.cancel(); // cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = opts.rate ?? 0.85;
      utterance.pitch = opts.pitch ?? 1.1;

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

/** Play audio from a URL. Returns a promise that resolves when playback ends. */
export function speakUrl(url: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  return new Promise((resolve) => {
    try {
      cancelSpeech();
      const audio = new Audio(url);
      currentAudio = audio;
      audio.onended = () => {
        currentAudio = null;
        resolve();
      };
      audio.onerror = () => {
        currentAudio = null;
        resolve();
      };
      audio.play().catch(() => {
        currentAudio = null;
        resolve();
      });
    } catch {
      resolve();
    }
  });
}

/** Cancel any ongoing speech or audio playback */
export function cancelSpeech(): void {
  if (typeof window === "undefined") return;
  try {
    speechSynthesis.cancel();
  } catch {}
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {}
    currentAudio = null;
  }
}
