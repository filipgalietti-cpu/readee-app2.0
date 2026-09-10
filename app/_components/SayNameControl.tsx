"use client";

/**
 * "Say your name" — the child (or a grown-up) says the name once; Gemini
 * writes it the way it sounds; Luna says it back. The written name is
 * untouched; the respelling is what every clip with the child's name is made
 * from. `mode="child"` (Kid Welcome) is one big button and Luna answering;
 * `mode="grownup"` (Settings) adds the editable spelling.
 */
import { useEffect, useRef, useState } from "react";
import { FluentIcon } from "@/app/_components/FluentIcon";

const MAX_SECONDS = 8;
const OUT_RATE = 16000;

type Status = "idle" | "opening" | "recording" | "thinking" | "heard" | "unclear" | "error";

function encodeWav(samples: Float32Array, rate: number): Blob {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const v = new DataView(buf);
  const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, "RIFF"); v.setUint32(4, 36 + samples.length * 2, true); w(8, "WAVE"); w(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, samples.length * 2, true);
  let o = 44;
  for (let i = 0; i < samples.length; i++, o += 2) { const x = Math.max(-1, Math.min(1, samples[i])); v.setInt16(o, x < 0 ? x * 0x8000 : x * 0x7fff, true); }
  return new Blob([buf], { type: "audio/wav" });
}

function downsample(chunks: Float32Array[], inRate: number, outRate: number): Float32Array {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const all = new Float32Array(total);
  let p = 0;
  for (const c of chunks) { all.set(c, p); p += c.length; }
  if (inRate === outRate) return all;
  const ratio = inRate / outRate;
  const out = new Float32Array(Math.floor(all.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const start = Math.floor(i * ratio), end = Math.min(all.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j++) sum += all[j];
    out[i] = end > start ? sum / (end - start) : 0;
  }
  return out;
}

export default function SayNameControl({ writtenName, value, onChange, mode = "grownup", autoStart = false }: { writtenName: string; value: string; onChange: (v: string) => void; mode?: "child" | "grownup"; autoStart?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  const [hearing, setHearing] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mounted = useRef(true);
  const requestRef = useRef<AbortController | null>(null);
  const previewRef = useRef<{ key: string; url: string } | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; stopRef.current?.(); audioRef.current?.pause(); requestRef.current?.abort(); };
  }, []);

  const autoStarted = useRef(false);
  const recordLatest = useRef<() => Promise<void>>(async () => {});
  useEffect(() => {
    if (autoStart && !autoStarted.current) { autoStarted.current = true; void recordLatest.current(); }
  }, [autoStart]);

  async function record() {
    if (status === "recording") { stopRef.current?.(); return; }
    if (status === "opening" || status === "thinking") return;
    setPlaybackError(null);
    setStatus("opening");
    let ctx: AudioContext | null = null;
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      if (!mounted.current) return;
      ctx = new AudioContext();
      if (ctx.state === "suspended") await ctx.resume();
      const src = ctx.createMediaStreamSource(stream);
      const proc = ctx.createScriptProcessor(4096, 1, 1);
      const chunks: Float32Array[] = [];
      let voicedAt = 0, lastVoice = 0;
      proc.onaudioprocess = (e) => {
        const frame = new Float32Array(e.inputBuffer.getChannelData(0));
        chunks.push(frame);
        if (mode !== "child") return;
        const rms = Math.sqrt(frame.reduce((sum, value) => sum + value * value, 0) / frame.length);
        const now = Date.now();
        if (rms > 0.015) { voicedAt ||= now; lastVoice = now; }
        if (voicedAt && now - voicedAt > 2000 && now - lastVoice > 1500) stopRef.current?.();
      };
      const sink = ctx.createGain(); sink.gain.value = 0;
      src.connect(proc); proc.connect(sink); sink.connect(ctx.destination);
      setStatus("recording");
      await new Promise<void>((res) => {
        const timer = window.setTimeout(res, (mode === "child" ? 30 : MAX_SECONDS) * 1000);
        stopRef.current = () => { window.clearTimeout(timer); res(); };
      });
      stopRef.current = null;
      proc.disconnect(); src.disconnect();
      const rate = ctx.sampleRate;
      stream.getTracks().forEach((t) => t.stop()); await ctx.close(); ctx = null; stream = null;
      if (!mounted.current) return;
      setStatus("thinking");
      const wav = encodeWav(downsample(chunks, rate, OUT_RATE), OUT_RATE);
      // Chunked: a 100 KB spread into String.fromCharCode overflows the call stack on Safari.
      const bytes = new Uint8Array(await wav.arrayBuffer());
      let bin = "";
      for (let i = 0; i < bytes.length; i += 8192) bin += String.fromCharCode(...bytes.subarray(i, i + 8192));
      const b64 = btoa(bin);
      requestRef.current = new AbortController();
      const r = await fetch("/api/child-name/respell", { signal: requestRef.current.signal, method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ audioBase64: b64, mimeType: "audio/wav", name: writtenName }) });
      const j = (await r.json()) as { ok?: boolean; saidAs?: string };
      if (!mounted.current) return;
      if (r.ok && j.ok && j.saidAs) { onChange(j.saidAs); setStatus("heard"); } else setStatus("unclear");
    } catch {
      if (mounted.current) setStatus("error");
    } finally {
      stream?.getTracks().forEach((t) => t.stop());
      if (ctx) { try { await ctx.close(); } catch { /* ignore */ } }
    }
  }

  recordLatest.current = record;

  async function hear(saidAs: string = value) {
    if (hearing) return;
    setHearing(true);
    setPlaybackError(null);
    try {
      const key = `${writtenName}:${saidAs}`;
      if (previewRef.current?.key !== key) {
        requestRef.current = new AbortController();
        const r = await fetch("/api/child-name/preview", { signal: requestRef.current.signal, method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: writtenName, saidAs }) });
        const j = await r.json() as { ok?: boolean; audioUrl?: string };
        if (!r.ok || !j.ok || !j.audioUrl) throw new Error("preview");
        previewRef.current = { key, url: j.audioUrl };
      }
      if (!mounted.current) return;
      audioRef.current?.pause();
      const a = new Audio(previewRef.current.url);
      audioRef.current = a;
      await new Promise<void>((resolve, reject) => {
        a.onended = () => resolve();
        a.onerror = () => reject(new Error("playback"));
        void a.play().catch(reject);
      });
    } catch {
      if (mounted.current) setPlaybackError(previewRef.current ? "Tap Hear it again to play the pronunciation." : "Luna could not make the preview. Tap Hear it to retry.");
    } finally { if (mounted.current) setHearing(false); }
  }

  const child = mode === "child";
  const note = playbackError ?? (status === "opening" ? "Allow the microphone to say the name." : child
    ? status === "recording" ? "Say your name. Tap Stop when you’re done." :
      status === "thinking" ? "Luna is listening..." :
      status === "heard" ? "Tap Hear Luna say it. You can record it again if you want." :
      status === "unclear" ? "Luna did not catch it. Try once more, a little closer." :
      status === "error" ? "Luna cannot hear right now. That is okay, keep going!" :
      "Tap and say your name so Luna knows how to say it."
    : status === "recording" ? "Listening. Say the name once, then tap stop." :
      status === "thinking" ? "Luna is listening..." :
      status === "heard" ? "Here is how Luna heard it. Tap Hear it, and fix the spelling if it is off." :
      status === "unclear" ? "Luna could not make it out. Try once more, a little closer to the microphone." :
      status === "error" ? "The microphone is not available right now. You can type how it sounds instead." :
      "Optional: say the name so Luna says it right, or type how it sounds.");

  if (child) {
    return (
      <div className="flex w-full flex-col items-center gap-2 text-center" data-say-name>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => { void record(); }}
            disabled={status === "opening" || status === "thinking" || hearing}
            className={`inline-flex min-h-14 items-center gap-3 rounded-2xl px-7 text-lg font-bold shadow-[0_4px_14px_-4px_rgba(49,46,129,0.20)] ring-1 transition active:scale-[0.97] ${status === "recording" ? "bg-rose-50 text-rose-700 ring-rose-200" : "bg-white text-violet-700 ring-violet-200"}`}
            data-say-name-record
          >
            <FluentIcon name="microphone" size={22} />
            {status === "recording" ? "Stop" : status === "thinking" ? "Listening..." : status === "heard" ? "Say it again" : "Say your name"}
          </button>
          {value && (
            // A real tap: browsers block a clip that starts after a network wait with no gesture behind it.
            <button
              type="button"
              onClick={() => { void hear(); }}
              disabled={hearing || status === "recording" || status === "opening"}
              className="inline-flex min-h-14 items-center gap-2 rounded-2xl bg-violet-600 px-6 text-lg font-bold text-white shadow-[0_8px_24px_-8px_rgba(139,92,246,0.45)] transition active:scale-[0.97] disabled:opacity-60"
              data-say-name-hear
            >
              <FluentIcon name="speaker" size={22} />
              {hearing ? "Luna is saying it..." : "Hear Luna say it"}
            </button>
          )}
        </div>
        <p className="text-xl font-semibold text-zinc-600">{note}</p>
        {value && <p className="text-xs text-zinc-400">Luna heard it as &ldquo;{value}&rdquo;. A grown-up can fix the spelling in Settings.</p>}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2" data-say-name>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => { void record(); }}
          disabled={status === "opening" || status === "thinking" || hearing}
          className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-sm ring-1 transition active:scale-[0.97] ${status === "recording" ? "bg-rose-50 text-rose-700 ring-rose-200" : "bg-white text-violet-700 ring-zinc-200"}`}
          data-say-name-record
        >
          <FluentIcon name="microphone" size={18} />
          {status === "recording" ? "Stop" : status === "thinking" ? "Listening..." : "Say the name"}
        </button>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="fee-LOOSH"
          maxLength={40}
          aria-label="How the name sounds"
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-base text-zinc-900 placeholder:text-zinc-400"
          data-say-name-input
        />
        <button
          type="button"
          onClick={() => { void hear(); }}
          disabled={hearing || status === "recording" || status === "opening" || !(value.trim() || writtenName.trim())}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-violet-700 shadow-sm ring-1 ring-zinc-200 transition active:scale-[0.97] disabled:opacity-50"
          data-say-name-hear
        >
          <FluentIcon name="speaker" size={18} />
          {hearing ? "Playing..." : "Hear it"}
        </button>
      </div>
      <p className="text-xs text-zinc-500">{note}</p>
    </div>
  );
}
