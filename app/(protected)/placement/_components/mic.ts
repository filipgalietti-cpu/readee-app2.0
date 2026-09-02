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
import { startPronAssessment, type PAPhrase, type PAWord, type StreamController } from "@/app/(protected)/luna/_components/azure-stream";
import { downsampleMerge, encodeWav } from "@/lib/placement/wav";

type Token = { token: string; region: string; exp: number };
let tokCache: Token | null = null;

async function speechToken(): Promise<Token | null> {
  if (tokCache && tokCache.exp > Date.now() + 30000) return tokCache;
  try {
    const r = await fetch("/api/luna/speech-token", { method: "POST" });
    const j = await r.json();
    if (r.ok && j.ok && j.token) {
      tokCache = { token: j.token, region: j.region, exp: Date.now() + 9 * 60 * 1000 };
      return tokCache;
    }
  } catch { /* offline */ }
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

  const open = useCallback(async (): Promise<MicState> => {
    if (ctxRef.current && streamRef.current) return "open";
    setState("opening");
    const tok = await speechToken();
    if (!tok) { setState("unavailable"); return "unavailable"; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      const ctx = new AudioContext();
      if (ctx.state === "suspended") { try { await ctx.resume(); } catch { /* ignore */ } }
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
        ctrlRef.current?.pushSamples(new Float32Array(frame), ctx.sampleRate);
        if (recRef.current) recRef.current.chunks.push(new Float32Array(frame));
      };
      const sink = ctx.createGain(); sink.gain.value = 0;
      src.connect(proc); proc.connect(sink); sink.connect(ctx.destination);
      ctxRef.current = ctx;
      streamRef.current = stream;
      setState("open");
      return "open";
    } catch {
      setState("denied");
      return "denied";
    }
  }, []);

  // Publish the input level at a UI-friendly rate.
  useEffect(() => {
    const id = window.setInterval(() => setLevel(levelRef.current), 120);
    return () => window.clearInterval(id);
  }, []);

  /** Start recognizing against a reference text. Resolves once the recognizer is live. */
  const listen = useCallback(async (referenceText: string, onPhrase?: (p: PAPhrase) => void): Promise<Listener | null> => {
    const tok = await speechToken();
    if (!tok || !ctxRef.current) return null;
    if (ctrlRef.current) { const old = ctrlRef.current; ctrlRef.current = null; void old.stop(); }
    const phrases: PAWord[][] = [];
    let ctrl: StreamController;
    try {
      ctrl = await startPronAssessment({
        token: tok.token,
        region: tok.region,
        referenceText,
        onPhrase: (p) => { phrases.push(p.words); onPhrase?.(p); },
      });
    } catch { return null; }
    ctrlRef.current = ctrl;
    return {
      phrases,
      stop: async () => { if (ctrlRef.current === ctrl) ctrlRef.current = null; await ctrl.stop(); },
    };
  }, []);

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
    const c = ctrlRef.current; ctrlRef.current = null; if (c) void c.stop();
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch { /* ignore */ }
    try { void ctxRef.current?.close(); } catch { /* ignore */ }
    streamRef.current = null; ctxRef.current = null; recRef.current = null;
    setState("closed");
  }, []);

  useEffect(() => () => close(), [close]);

  return { state, level, analyser, open, listen, startRecording, stopRecording, close };
}
