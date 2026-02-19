import { create } from "zustand";

interface AudioState {
  isMuted: boolean;
  volume: number;
  currentlyPlaying: string | null;
  toggleMute: () => void;
  setMuted: (v: boolean) => void;
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

function readInitialMuted(): boolean {
  try {
    const stored = localStorage.getItem("readee_prefs");
    if (stored) {
      const prefs = JSON.parse(stored);
      if (prefs.soundEffects === false) return true;
    }
  } catch {}
  return false;
}

export const useAudioStore = create<AudioState>((set) => ({
  isMuted: typeof window !== "undefined" ? readInitialMuted() : false,
  volume: 1,
  currentlyPlaying: null,

  toggleMute: () => {
    set((state) => {
      const next = !state.isMuted;
      mergePrefs({ soundEffects: !next });
      return { isMuted: next };
    });
  },

  setMuted: (v) => {
    mergePrefs({ soundEffects: !v });
    set({ isMuted: v });
  },

  setVolume: (v) => set({ volume: v }),
  setCurrentlyPlaying: (id) => set({ currentlyPlaying: id }),
}));
