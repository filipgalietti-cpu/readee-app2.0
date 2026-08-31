import { create } from "zustand";

interface AudioState {
  /** Legacy global mute. Kept for the engine's internal gating but always
   *  false now — lessons and game sounds always play. Question narration is
   *  gated separately by `readQuestionsAloud`. */
  isMuted: boolean;
  /** Whether question/exam text is read aloud. Default ON (assist); off =
   *  "challenge mode" where the child reads the questions themselves. Lessons
   *  and game feedback (chimes/celebration/shop) are unaffected. */
  readQuestionsAloud: boolean;
  volume: number;
  currentlyPlaying: string | null;
  toggleMute: () => void;
  setMuted: (v: boolean) => void;
  setReadQuestionsAloud: (v: boolean) => void;
  setVolume: (v: number) => void;
  setCurrentlyPlaying: (id: string | null) => void;
}

function mergePrefs(patch: Record<string, unknown>) {
  try {
    const stored = localStorage.getItem("readee_prefs");
    const prefs = stored ? JSON.parse(stored) : {};
    Object.assign(prefs, patch);
    localStorage.setItem("readee_prefs", JSON.stringify(prefs));
  } catch {}
}

function readInitialReadAloud(): boolean {
  try {
    const stored = localStorage.getItem("readee_prefs");
    if (stored) {
      const prefs = JSON.parse(stored);
      if (prefs.readQuestionsAloud === false) return false;
    }
  } catch {}
  return true; // default ON (assist)
}

export const useAudioStore = create<AudioState>((set) => ({
  // Always false: lessons + game sounds always play. (Narration is gated by
  // readQuestionsAloud instead.) Kept so the engine's isMuted checks are inert.
  isMuted: false,
  readQuestionsAloud: typeof window !== "undefined" ? readInitialReadAloud() : true,
  volume: 1,
  currentlyPlaying: null,

  toggleMute: () => {}, // no-op: global mute retired
  setMuted: () => {}, // no-op: global mute retired

  setReadQuestionsAloud: (v) => {
    mergePrefs({ readQuestionsAloud: v });
    set({ readQuestionsAloud: v });
  },

  setVolume: (v) => set({ volume: v }),
  setCurrentlyPlaying: (id) => set({ currentlyPlaying: id }),
}));
