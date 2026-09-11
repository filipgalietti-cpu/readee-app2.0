"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import LunaOrb from "@/app/(protected)/luna/_components/LunaOrb";
import SayNameControl from "@/app/_components/SayNameControl";
import { startNamePronunciation, type NameRecording } from "@/lib/audio/background-name";
import { spectrumClip } from "@/app/data/placement-spectrum/audio";
import { getPlaybackAnalyser, playUrlRequired, stopClip, subscribePlayback } from "./audio";

export default function AssessmentNameTurn({ childId, name, ready, onDone }: { childId: string; name: string; ready: boolean; onDone: () => void }) {
  const [received, setReceived] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);
  const [replay, setReplay] = useState(0);
  const done = useRef(onDone);
  done.current = onDone;
  const analyser = useSyncExternalStore(subscribePlayback, getPlaybackAnalyser, () => null);

  function recorded(recording: NameRecording) {
    startNamePronunciation(childId, recording);
    setReceived(true);
  }

  useEffect(() => {
    if (!received) return;
    let cancelled = false;
    // The recorder's cleanup runs first, releasing the microphone and its player.
    void Promise.resolve().then(async () => {
      if (cancelled) return;
      setSpeaking(true);
      setAudioFailed(false);
      try {
        await playUrlRequired(spectrumClip("nice-to-meet-you"));
        if (!cancelled) done.current();
      } catch {
        if (!cancelled) setAudioFailed(true);
      } finally {
        if (!cancelled) setSpeaking(false);
      }
    });
    return () => { cancelled = true; stopClip(); };
  }, [received, replay]);

  return <div className="pa-intro pa-name-turn">
    <h1>{received ? "It’s so nice to meet you!" : "What is your name?"}</h1>
    {(!ready || received) && <LunaOrb mode={speaking || !ready ? "speaking" : "idle"} analyser={analyser} voiceDriven size={144} responsive label="Luna" />}
    {ready && !received && <SayNameControl mode="child" autoStart showLuna writtenName={name} value="" onChange={() => {}} onRecording={recorded} />}
    <button className="pa-primary" disabled={!ready} onClick={onDone}>{received ? "Let’s read" : "Skip for now"}</button>
    {audioFailed && <button className="pa-text-link" onClick={() => setReplay((n) => n + 1)}>Hear Luna</button>}
  </div>;
}
