"use client";

/**
 * Record → preview → upload one WAV take per phoneme. Uses the raw
 * AudioContext PCM capture (same pattern as Luna's mic) so we get clean
 * uncompressed WAVs — MediaRecorder's webm/opus would need transcoding we
 * can't do in the browser. Takes stage to audio/phoneme-takes/{id}.wav.
 */

import { useRef, useState } from "react";
import { Mic, Square, Play, Upload, Check, Volume2 } from "lucide-react";

type P = { id: string; phoneme: string; type: string; sound: string; example: string };

const CLIP_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio/phonemes`;
const MAX_TAKE_MS = 4000;

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const v = new DataView(buf);
  const w = (off: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)); };
  w(0, "RIFF"); v.setUint32(4, 36 + samples.length * 2, true); w(8, "WAVE"); w(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, "data"); v.setUint32(40, samples.length * 2, true);
  let off = 44; for (let i = 0; i < samples.length; i++) { const s = Math.max(-1, Math.min(1, samples[i])); v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true); off += 2; }
  return new Blob([buf], { type: "audio/wav" });
}

export default function PhonemeRecorderClient({ phonemes }: { phonemes: P[] }) {
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [takes, setTakes] = useState<Record<string, Blob>>({});
  const [staged, setStaged] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const procRef = useRef<ScriptProcessorNode | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const rateRef = useRef(48000);
  const stopTimerRef = useRef<number | null>(null);

  function teardown() {
    if (stopTimerRef.current) { window.clearTimeout(stopTimerRef.current); stopTimerRef.current = null; }
    try { if (procRef.current) procRef.current.onaudioprocess = null; } catch { /* ignore */ }
    try { procRef.current?.disconnect(); } catch { /* ignore */ }
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch { /* ignore */ }
    const ctx = ctxRef.current;
    if (ctx) { try { void ctx.suspend().then(() => ctx.close()).catch(() => {}); } catch { /* ignore */ } }
    procRef.current = null; streamRef.current = null; ctxRef.current = null;
  }

  async function startRecording(id: string) {
    setErr(null);
    if (recordingId) stopRecording();
    try {
      // No processing — we want the RAW clean signal for phoneme clips.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      if (ctx.state === "suspended") { try { await ctx.resume(); } catch { /* ignore */ } }
      rateRef.current = ctx.sampleRate;
      chunksRef.current = [];
      const src = ctx.createMediaStreamSource(stream);
      const proc = ctx.createScriptProcessor(4096, 1, 1);
      proc.onaudioprocess = (e) => { chunksRef.current.push(new Float32Array(e.inputBuffer.getChannelData(0))); };
      const sink = ctx.createGain(); sink.gain.value = 0;
      src.connect(proc); proc.connect(sink); sink.connect(ctx.destination);
      procRef.current = proc;
      setRecordingId(id);
      stopTimerRef.current = window.setTimeout(() => stopRecording(), MAX_TAKE_MS);
    } catch {
      setErr("Couldn't open the mic - check permission and try again.");
    }
  }

  function stopRecording() {
    const id = recordingId;
    const chunks = chunksRef.current;
    const rate = rateRef.current;
    teardown();
    setRecordingId(null);
    if (!id || chunks.length === 0) return;
    let len = 0; for (const c of chunks) len += c.length;
    const merged = new Float32Array(len);
    let o = 0; for (const c of chunks) { merged.set(c, o); o += c.length; }
    setTakes((t) => ({ ...t, [id]: encodeWav(merged, rate) }));
    setStaged((s) => ({ ...s, [id]: false }));
  }

  function playTake(id: string) {
    const b = takes[id];
    if (!b) return;
    const a = new Audio(URL.createObjectURL(b));
    void a.play();
  }
  function playCurrent(id: string) {
    const a = new Audio(`${CLIP_BASE}/${id}.mp3?t=${Date.now()}`);
    void a.play();
  }

  async function upload(id: string) {
    const b = takes[id];
    if (!b) return;
    setBusy(id); setErr(null);
    try {
      const fd = new FormData();
      fd.append("id", id);
      fd.append("audio", b, `${id}.wav`);
      const r = await fetch("/api/owner/phoneme-take", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error || `HTTP ${r.status}`);
      setStaged((s) => ({ ...s, [id]: true }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(null);
    }
  }

  const stagedCount = Object.values(staged).filter(Boolean).length;
  const groups = Array.from(new Set(phonemes.map((p) => p.type)));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-bold text-violet-800 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-200">
        <span>{stagedCount} / {phonemes.length} staged</span>
        <span className="font-mono text-xs">then: npx tsx scripts/finalize-phoneme-takes.ts</span>
      </div>
      {err && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">{err}</div>}

      {groups.map((g) => (
        <div key={g} className="mb-6">
          <h2 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-slate-500">{g}</h2>
          <div className="flex flex-col gap-2">
            {phonemes.filter((p) => p.type === g).map((p) => {
              const isRec = recordingId === p.id;
              const hasTake = !!takes[p.id];
              return (
                <div key={p.id} className={`flex items-center gap-3 rounded-2xl border px-4 py-2.5 ${staged[p.id] ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20" : "border-zinc-200 bg-white dark:border-slate-800 dark:bg-slate-900/50"}`}>
                  <div className="w-14 flex-shrink-0 font-mono text-lg font-bold text-zinc-900 dark:text-white">{p.phoneme}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-zinc-700 dark:text-slate-200">as in <b>{p.example}</b></div>
                    <div className="text-[11px] text-zinc-400 dark:text-slate-500">{p.id}</div>
                  </div>
                  <button type="button" title="Play current live clip" onClick={() => playCurrent(p.id)}
                    className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border border-zinc-200 text-zinc-500 transition hover:border-violet-300 hover:text-violet-600 dark:border-slate-700 dark:text-slate-400">
                    <Volume2 className="h-4 w-4" />
                  </button>
                  {isRec ? (
                    <button type="button" onClick={stopRecording}
                      className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white">
                      <Square className="h-3.5 w-3.5" /> Stop
                    </button>
                  ) : (
                    <button type="button" onClick={() => void startRecording(p.id)}
                      className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border-2 border-violet-500 px-4 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-50 dark:text-violet-300">
                      <Mic className="h-3.5 w-3.5" /> {hasTake ? "Re-take" : "Record"}
                    </button>
                  )}
                  <button type="button" disabled={!hasTake} onClick={() => playTake(p.id)} title="Play your take"
                    className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border border-zinc-200 text-zinc-500 transition enabled:hover:border-violet-300 enabled:hover:text-violet-600 disabled:opacity-30 dark:border-slate-700 dark:text-slate-400">
                    <Play className="h-4 w-4" />
                  </button>
                  <button type="button" disabled={!hasTake || busy === p.id} onClick={() => void upload(p.id)}
                    className={`inline-flex w-24 flex-shrink-0 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition ${staged[p.id] ? "bg-emerald-100 text-emerald-700" : "bg-violet-600 text-white enabled:hover:bg-violet-700 disabled:opacity-30"}`}>
                    {staged[p.id] ? <><Check className="h-3.5 w-3.5" /> Staged</> : busy === p.id ? "…" : <><Upload className="h-3.5 w-3.5" /> Upload</>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
