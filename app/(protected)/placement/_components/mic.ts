"use client";

/**
 * usePlacementMic — one microphone for the whole placement.
 *
 * The lesson engine's Speak interaction opens the mic per question; the
 * placement opens it once at the mic check and keeps the audio graph alive,
 * starting a fresh Azure pronunciation-assessment recognizer per item with
 * that item's reference text (Luna's engine, via /api/luna/speech-token). The
 * graph is Luna's: ScriptProcessor pushes frames to the live recognizer, a
 * muted gain keeps the processor scheduled without feedback.
 *
 * Also taps the frames for the passage recording (Float32 chunks, encoded to
 * 16 kHz WAV by lib/placement/wav.ts when the read ends).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  startPronAssessment,
  type PAPhrase,
  type PAWord,
  type StreamController,
} from "@/app/(protected)/luna/_components/azure-stream";
import { downsampleMerge, encodeWav } from "@/lib/placement/wav";

type Token = { token: string; region: string; exp: number };
let tokCache: Token | null = null;

async function speechToken(): Promise<Token | null> {
  if (tokCache && tokCache.exp > Date.now() + 30000) return tokCache;
  try {
    const r = await fetch("/api/luna/speech-token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: AbortSignal.timeout(12000),
      body: JSON.stringify({ purpose: "placement" }),
    });
    const j = await r.json();
    if (r.ok && j.ok && j.token) {
      tokCache = { token: j.token, region: j.region, exp: Date.now() + 9 * 60 * 1000 };
      return tokCache;
    }
  } catch {
    /* offline */
  }
  return null;
}

export type MicState = "closed" | "opening" | "open" | "denied" | "unavailable";

export type Listener = {
  /** Phrases so far, in order (each phrase = Azure's per-word results for a chunk of speech). */
  phrases: PAWord[][];
  stop: () => Promise<void>;
};

export function usePlacementMic() {
  const [state, setState] = useState<MicState>("closed");
  const [level, setLevel] = useState(0); // 0..1 input level for the "I can hear you" check
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null); // the orb breathes with the child's voice
  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ctrlRef = useRef<StreamController | null>(null);
  const recRef = useRef<{ chunks: Float32Array[]; rate: number } | null>(null);
  const levelRef = useRef(0);
  const preRollRef = useRef<{ frames: { samples: Float32Array; rate: number }[]; count: number } | null>(null);
  const generation = useRef(0);
  const errorRef = useRef<((message: string) => void) | undefined>(undefined);

  const open = useCallback(async (): Promise<MicState> => {
    if (ctxRef.current && streamRef.current) return "open";
    const session = generation.current;
    setState("opening");
    const tok = await speechToken();
    if (generation.current !== session) return "closed";
    if (!tok) {
      setState("unavailable");
      return "unavailable";
    }
    let acquired: MediaStream | undefined;
    let openedContext: AudioContext | undefined;
    try {
      let timedOut = false;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const permission = navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      void permission.then(
        (late) => {
          if (timedOut || generation.current !== session) late.getTracks().forEach((t) => t.stop());
        },
        () => {},
      );
      try {
        acquired = await Promise.race([
          permission,
          new Promise<never>((_, reject) => {
            timer = setTimeout(() => {
              timedOut = true;
              reject(new Error("Microphone permission timed out"));
            }, 15000);
          }),
        ]);
      } finally {
        clearTimeout(timer);
      }
      const stream = acquired;
      if (generation.current !== session) {
        stream.getTracks().forEach((t) => t.stop());
        return "closed";
      }
      for (const track of stream.getAudioTracks())
        track.addEventListener(
          "ended",
          () => {
            if (generation.current !== session) return;
            errorRef.current?.("Microphone disconnected.");
            setState("unavailable");
          },
          { once: true },
        );
      const ctx = new AudioContext();
      openedContext = ctx;
      if (ctx.state === "suspended") {
        try {
          await ctx.resume();
        } catch {
          /* ignore */
        }
      }
      if (generation.current !== session) {
        stream.getTracks().forEach((t) => t.stop());
        void ctx.close().catch(() => {});
        return "closed";
      }
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 1024;
      src.connect(an);
      setAnalyser(an);
      const proc = ctx.createScriptProcessor(4096, 1, 1);
      proc.onaudioprocess = (e) => {
        const frame = e.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < frame.length; i += 16) sum += frame[i] * frame[i];
        const rms = Math.sqrt(sum / (frame.length / 16));
        levelRef.current = Math.min(1, rms * 8);
        if (ctrlRef.current) ctrlRef.current.pushSamples(new Float32Array(frame), ctx.sampleRate);
        else if (preRollRef.current) {
          const pending = preRollRef.current;
          pending.frames.push({ samples: new Float32Array(frame), rate: ctx.sampleRate });
          pending.count += frame.length;
          while (pending.count > ctx.sampleRate * 5 && pending.frames.length > 1)
            pending.count -= pending.frames.shift()!.samples.length;
        }
        if (recRef.current) recRef.current.chunks.push(new Float32Array(frame));
      };
      const sink = ctx.createGain();
      sink.gain.value = 0;
      src.connect(proc);
      proc.connect(sink);
      sink.connect(ctx.destination);
      ctxRef.current = ctx;
      streamRef.current = stream;
      setState("open");
      return "open";
    } catch (error) {
      acquired?.getTracks().forEach((t) => t.stop());
      if (openedContext) void openedContext.close().catch(() => {});
      if (generation.current !== session) return "closed";
      const state: MicState =
        error instanceof DOMException && ["NotAllowedError", "SecurityError"].includes(error.name)
          ? "denied"
          : "unavailable";
      setState(state);
      return state;
    }
  }, []);

  // Publish the input level at a UI-friendly rate.
  useEffect(() => {
    const id = window.setInterval(() => setLevel(levelRef.current), 120);
    return () => window.clearInterval(id);
  }, []);

  /** Start recognizing against a reference text. Resolves once the recognizer is live. */
  const listen = useCallback(
    async (
      referenceText: string,
      onPhrase?: (p: PAPhrase) => void,
      onError?: (message: string) => void,
      onRecognizing?: (text: string) => void,
    ): Promise<Listener> => {
      const tok = await speechToken();
      if (!tok || !ctxRef.current) throw new Error("Speech recognition is unavailable.");
      const captureContext = ctxRef.current;
      if (ctrlRef.current) {
        const old = ctrlRef.current;
        ctrlRef.current = null;
        await old.stop();
      }
      const phrases: PAWord[][] = [];
      // Children may start as soon as a word appears. Preserve that speech
      // while its recognizer connects, rather than silently dropping it.
      const preRoll = referenceText.trim().split(/\s+/).length === 1 ? { frames: [] as { samples: Float32Array; rate: number }[], count: 0 } : null;
      preRollRef.current = preRoll;
      errorRef.current = onError;
      const pending = startPronAssessment({
        token: tok.token,
        region: tok.region,
        referenceText,
        // Short finalized turns; continuous recognition keeps listening through
        // decoding pauses. Alignment is done by Readee, not unsupported miscue mode.
        segmentationSilenceMs: referenceText.trim().split(/\s+/).length === 1 ? 500 : 900,
        enableMiscue: false,
        initialSilenceMs: 60000,
        onRecognizing,
        onCommandText: referenceText.trim().split(/\s+/).length === 1 ? onRecognizing : undefined,
        onPhrase: (p) => {
          phrases.push(p.words);
          onPhrase?.(p);
        },
        onError,
      });
      let timer: ReturnType<typeof setTimeout> | undefined;
      let ctrl: StreamController;
      try {
        ctrl = await Promise.race([
          pending,
          new Promise<never>((_, reject) => {
            timer = setTimeout(() => reject(new Error("Speech recognition did not start.")), 12000);
          }),
        ]);
      } catch (e) {
        if (preRollRef.current === preRoll) preRollRef.current = null;
        void pending.then(
          (late) => late.stop(),
          () => {},
        );
        throw e;
      } finally {
        clearTimeout(timer);
      }
      if (ctxRef.current !== captureContext) {
        await ctrl.stop();
        throw new Error("Microphone session changed.");
      }
      ctrlRef.current = ctrl;
      if (preRollRef.current === preRoll) {
        preRollRef.current = null;
        for (const frame of preRoll?.frames ?? []) ctrl.pushSamples(frame.samples, frame.rate);
      }
      return {
        phrases,
        stop: async () => {
          if (ctrlRef.current === ctrl) ctrlRef.current = null;
          await ctrl.stop();
        },
      };
    },
    [],
  );

  const startRecording = useCallback(() => {
    recRef.current = { chunks: [], rate: ctxRef.current?.sampleRate ?? 48000 };
  }, []);

  const stopRecording = useCallback((): Blob | null => {
    const r = recRef.current;
    recRef.current = null;
    if (!r || r.chunks.length === 0) return null;
    return encodeWav(downsampleMerge(r.chunks, r.rate, 16000), 16000);
  }, []);

  const close = useCallback(() => {
    generation.current++;
    levelRef.current = 0;
    setLevel(0);
    setAnalyser(null);
    errorRef.current = undefined;
    preRollRef.current = null;
    const c = ctrlRef.current;
    ctrlRef.current = null;
    if (c) void c.stop().catch(() => {});
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } catch {
      /* ignore */
    }
    try {
      void ctxRef.current?.close().catch(() => {});
    } catch {
      /* ignore */
    }
    streamRef.current = null;
    ctxRef.current = null;
    recRef.current = null;
    setState("closed");
  }, []);

  useEffect(() => () => close(), [close]);

  return { state, level, analyser, open, listen, startRecording, stopRecording, close };
}
