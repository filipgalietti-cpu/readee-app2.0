"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useAudioStore } from "@/lib/stores/audio-store";
import { audioManager } from "./audio-manager";

export function useAudio() {
  const isMuted = useAudioStore((s) => s.isMuted);
  const toggleMuteStore = useAudioStore((s) => s.toggleMute);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const playUrl = useCallback(
    (url: string) => {
      if (!audioManager) return;
      setIsSpeaking(true);
      audioManager.play(url).finally(() => {
        if (mountedRef.current) setIsSpeaking(false);
      });
    },
    []
  );

  const playSequence = useCallback(
    (items: Array<{ url?: string; delayMs?: number }>) => {
      if (!audioManager) return;
      setIsSpeaking(true);
      audioManager.playSequence(items).finally(() => {
        if (mountedRef.current) setIsSpeaking(false);
      });
    },
    []
  );

  const abortSequence = useCallback(() => {
    if (!audioManager) return;
    audioManager.abortSequence();
    setIsSpeaking(false);
  }, []);

  const unlockAudio = useCallback(async () => {
    if (!audioManager) return;
    await audioManager.unlockAudio();
  }, []);

  const stop = useCallback(() => {
    if (!audioManager) return;
    audioManager.stop();
    setIsSpeaking(false);
  }, []);

  const toggleMute = useCallback(() => {
    toggleMuteStore();
    const newMuted = !isMuted;
    if (audioManager) {
      audioManager.setMuted(newMuted);
      if (newMuted) {
        audioManager.stop();
        setIsSpeaking(false);
      }
    }
  }, [isMuted, toggleMuteStore]);

  const preload = useCallback((url: string) => {
    if (audioManager) audioManager.preload(url);
  }, []);

  const playCorrectChime = useCallback(() => {
    if (audioManager) audioManager.playCorrectChime();
  }, []);

  const playIncorrectBuzz = useCallback(() => {
    if (audioManager) audioManager.playIncorrectBuzz();
  }, []);

  const playCompleteChime = useCallback(() => {
    if (audioManager) audioManager.playCompleteChime();
  }, []);

  const playPopSound = useCallback(() => {
    if (audioManager) audioManager.playPopSound();
  }, []);

  const playUnlockChime = useCallback(() => {
    if (audioManager) audioManager.playUnlockChime();
  }, []);

  const playWhoosh = useCallback(() => {
    if (audioManager) audioManager.playWhoosh();
  }, []);

  return {
    muted: isMuted,
    isSpeaking,
    playUrl,
    playSequence,
    abortSequence,
    unlockAudio,
    stop,
    toggleMute,
    preload,
    playCorrectChime,
    playIncorrectBuzz,
    playCompleteChime,
    playPopSound,
    playUnlockChime,
    playWhoosh,
  };
}
