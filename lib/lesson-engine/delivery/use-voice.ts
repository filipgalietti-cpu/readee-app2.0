"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { lessonAssetUrl } from "../asset-url";
import { alignTextToTimings } from "../cues";
import type { NarrationTimings } from "./word-timings";
/** One narration owner. Late events cannot finish a newer clip; failures never call success. */
export function useLessonVoice(manifest: Record<string, string>, timings: NarrationTimings = {}) {
  const current = useRef<HTMLAudioElement | null>(null),
    generation = useRef(0),
    watchdog = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const context = useRef<AudioContext | null>(null),
    source = useRef<MediaElementAudioSourceNode | null>(null),
    meterRef = useRef<AnalyserNode | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const frame = useRef(0);
  const [activeWord, setActiveWord] = useState(-1);
  const [choiceId, setChoiceId] = useState<string | null>(null);
  const [failure, setFailure] = useState(0);
  const [finished, setFinished] = useState(false);
  const [speaking, setSpeaking] = useState(false),
    [caption, setCaption] = useState(""),
    [error, setError] = useState(false);
  const stop = useCallback(() => {
    generation.current++;
    setFinished(false);
    cancelAnimationFrame(frame.current);
    setActiveWord(-1);
    setChoiceId(null);
    clearTimeout(watchdog.current);
    current.current?.pause();
    source.current?.disconnect();
    source.current = null;
    current.current = null;
    setSpeaking(false);
  }, []);
  const say = useCallback(
    (text: string, after?: () => void, readingChoiceId?: string) => {
      stop();
      setChoiceId(readingChoiceId ?? null);
      setCaption(text);
      setError(false);
      const id = generation.current;
      const src = manifest[text];
      if (!src) {
        setError(true);
        setFailure((n) => n + 1);
        return;
      }
      const a = new Audio(lessonAssetUrl(src));
      current.current = a;
      const timing = timings[text];
      const starts = timing?.src === src ? alignTextToTimings(text, timing.words) : [];
      const tick = () => {
        if (generation.current !== id) return;
        let index = -1;
        for (let n = 0; n < starts.length && starts[n] <= a.currentTime; n++) index = n;
        setActiveWord((previous) => (previous === index ? previous : index));
        frame.current = requestAnimationFrame(tick);
      };
      // One reusable graph makes Luna react to the narration that is actually playing.
      try {
        const ctx =
          context.current && context.current.state !== "closed"
            ? context.current
            : new AudioContext();
        context.current = ctx;
        const meter = meterRef.current ?? ctx.createAnalyser();
        if (!meterRef.current) {
          meter.fftSize = 256;
          meter.connect(ctx.destination);
          meterRef.current = meter;
        }
        const media = ctx.createMediaElementSource(a);
        source.current = media;
        media.connect(meter);

        setAnalyser(meter);
        void ctx.resume().catch(() => {});
      } catch {
        /* Playback remains usable when metering is unavailable. */
      }
      const fail = () => {
        if (generation.current === id) {
          clearTimeout(watchdog.current);
          a.pause();
          cancelAnimationFrame(frame.current);
          setActiveWord(-1);
          setSpeaking(false);
          setError(true);
          setFailure((n) => n + 1);
        }
      };
      a.onerror = fail;
      a.onended = () => {
        if (generation.current === id) {
          clearTimeout(watchdog.current);
          setSpeaking(false);
          setFinished(true);
          cancelAnimationFrame(frame.current);
          setActiveWord(-1);
          after?.();
        }
      };
      watchdog.current = setTimeout(fail, 12000);
      a.play()
        .then(() => {
          if (generation.current === id) {
            setSpeaking(true);
            if (starts.length) frame.current = requestAnimationFrame(tick);
            clearTimeout(watchdog.current);
            watchdog.current = setTimeout(
              fail,
              Math.min(180000, (Number.isFinite(a.duration) ? a.duration : 90) * 1000 + 10000),
            );
          } else a.pause();
        })
        .catch(fail);
    },
    [manifest, timings, stop],
  );
  useEffect(
    () => () => {
      generation.current++;
      cancelAnimationFrame(frame.current);
      clearTimeout(watchdog.current);
      current.current?.pause();
      source.current?.disconnect();
      meterRef.current?.disconnect();
      void context.current?.close().catch(() => {});
      // React's development remount reuses these refs. A closed graph can accept
      // an HTMLAudioElement that appears to play while producing no audible output.
      current.current = null;
      source.current = null;
      meterRef.current = null;
      context.current = null;
    },
    [],
  );
  // Reading the actual media clock adds no per-frame React work to ordinary lessons.
  const currentTime = useCallback(() => current.current?.currentTime ?? 0, []);
  return { say, stop, speaking, finished, caption, error, failure, analyser, activeWord, currentTime, choiceId };
}
