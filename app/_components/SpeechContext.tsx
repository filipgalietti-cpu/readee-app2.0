"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { speakText, speakUrl, cancelSpeech, initVoices } from "@/lib/speech";

interface SpeechCtx {
  muted: boolean;
  isSpeaking: boolean;
  speak: (text: string) => void;
  playUrl: (url: string) => void;
  speakManual: (text: string) => void;
  stop: () => void;
  toggleMute: () => void;
}

const SpeechContext = createContext<SpeechCtx>({
  muted: false,
  isSpeaking: false,
  speak: () => {},
  playUrl: () => {},
  speakManual: () => {},
  stop: () => {},
  toggleMute: () => {},
});

export function SpeechProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mountedRef = useRef(true);

  // Load initial muted state from localStorage + pre-load voices
  useEffect(() => {
    try {
      const stored = localStorage.getItem("readee_prefs");
      if (stored) {
        const prefs = JSON.parse(stored);
        if (prefs.soundEffects === false) setMuted(true);
      }
    } catch {}
    initVoices();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (muted) return;
      setIsSpeaking(true);
      speakText(text).finally(() => {
        if (mountedRef.current) setIsSpeaking(false);
      });
    },
    [muted]
  );

  const playUrl = useCallback(
    (url: string) => {
      if (muted) return;
      setIsSpeaking(true);
      speakUrl(url).finally(() => {
        if (mountedRef.current) setIsSpeaking(false);
      });
    },
    [muted]
  );

  const speakManual = useCallback((text: string) => {
    setIsSpeaking(true);
    speakText(text).finally(() => {
      if (mountedRef.current) setIsSpeaking(false);
    });
  }, []);

  const stop = useCallback(() => {
    cancelSpeech();
    setIsSpeaking(false);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      if (next) {
        cancelSpeech();
        setIsSpeaking(false);
      }
      // Persist to localStorage (merge-write)
      try {
        const stored = localStorage.getItem("readee_prefs");
        const prefs = stored ? JSON.parse(stored) : {};
        prefs.soundEffects = !next; // soundEffects=true means unmuted
        localStorage.setItem("readee_prefs", JSON.stringify(prefs));
      } catch {}
      return next;
    });
  }, []);

  return (
    <SpeechContext.Provider value={{ muted, isSpeaking, speak, playUrl, speakManual, stop, toggleMute }}>
      {children}
    </SpeechContext.Provider>
  );
}

export function useSpeech() {
  return useContext(SpeechContext);
}
