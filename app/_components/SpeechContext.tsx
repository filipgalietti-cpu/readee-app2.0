"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useAudioStore } from "@/lib/stores/audio-store";
import { playAudio as playStaticAudio, stopAudio } from "@/lib/audio";

interface SpeechCtx {
  muted: boolean;
  isSpeaking: boolean;
  /** Play a static audio file: playAudio(lessonId, filename) */
  playAudio: (lessonId: string, filename: string) => void;
  stop: () => void;
  toggleMute: () => void;
}

const SpeechContext = createContext<SpeechCtx>({
  muted: false,
  isSpeaking: false,
  playAudio: () => {},
  stop: () => {},
  toggleMute: () => {},
});

export function SpeechProvider({ children }: { children: React.ReactNode }) {
  const isMuted = useAudioStore((s) => s.isMuted);
  const toggleMuteStore = useAudioStore((s) => s.toggleMute);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const playAudio = useCallback(
    (lessonId: string, filename: string) => {
      if (isMuted) return;
      setIsSpeaking(true);
      playStaticAudio(lessonId, filename).finally(() => {
        setIsSpeaking(false);
      });
    },
    [isMuted]
  );

  const stop = useCallback(() => {
    stopAudio();
    setIsSpeaking(false);
  }, []);

  const toggleMute = useCallback(() => {
    toggleMuteStore();
    if (!isMuted) {
      stopAudio();
      setIsSpeaking(false);
    }
  }, [isMuted, toggleMuteStore]);

  return (
    <SpeechContext.Provider value={{ muted: isMuted, isSpeaking, playAudio, stop, toggleMute }}>
      {children}
    </SpeechContext.Provider>
  );
}

export function useSpeech() {
  return useContext(SpeechContext);
}
