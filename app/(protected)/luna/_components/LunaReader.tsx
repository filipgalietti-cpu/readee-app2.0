"use client";

/**
 * LunaReader — guided reading session with Luna, our AI reading tutor.
 *
 * Structure (per Filip's design):
 *   intro    → just Luna + "Let's Start" (no text box)
 *   overall1 → read the WHOLE passage once (baseline)
 *   drill    → sentence-by-sentence, retry on any error (the practice)
 *   overall2 → read the WHOLE passage again (measure the gain)
 *   done     → summary: first read vs final read + tricky words
 *
 * Grading uses the lean, articulation-tolerant line grader (/api/luna/grade).
 * Coaching is spoken in Luna's Autonoe voice. Any stale audio is stopped when
 * a new recording starts so nothing plays over the child.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Shuffle, RotateCcw, Play, Volume2, Carrot, Star, Check, X as XIcon } from "lucide-react";
import LunaOrb, { type LunaMode } from "./LunaOrb";
import { startPronAssessment, type PAPhrase, type StreamController } from "./azure-stream";
import { soundOut, soundOutSegments, type SoundSegment } from "@/lib/luna/sound-out";
import { Bunny, BunnyReaction, reactionHoldMs, type ReactionState } from "@/app/_components/Bunny/Bunny";
import { supabaseBrowser } from "@/lib/supabase/client";
import { getActiveMultiplier } from "@/lib/carrots/active-multiplier";

type Passage = { grade: string; title: string; text: string; patternId?: string; patternLabel?: string; targetWords?: string[] };
type Annotation = { word: string; status: string; heard?: string };
type Grade = {
  wordAnnotations: Annotation[];
  wordsTotal: number;
  wordsCorrect: number;
  durationSeconds: number;
  disfluent?: boolean;
  heardTranscript?: string;
  coach?: string;
  prosody?: number;
};
type Phase = "intro" | "building" | "overall1" | "drill" | "overall2" | "done";
type WordInfo = { words: string[]; sents: string[]; wSent: number[] };
type OverallScore = { wcpm: number; accuracy: number };

const SERIF = 'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif';
const BALOO = "'Baloo 2','Nunito',sans-serif";
const SILENT = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA=";
const CLIP_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio/luna`;
// The 45 pre-recorded phoneme clips (same ones the lessons use) — power the
// inline sound-it-out mini-lesson with zero generation latency.
const PHONEME_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio/phonemes`;
// Variant pools so no feedback line ever feels one-dimensional.
const PRAISE_COUNT = 16;   // praise-1..16   (clean read)
const SMOOTH_COUNT = 4;    // smooth-1..4    (fluency retry)
const GOODTRY_COUNT = 4;   // goodtry-1..4   (2nd attempt)
const REREAD_COUNT = 4;    // reread-1..4    ("read the whole sentence again")
const NOTQUITE_COUNT = 4;  // notquite-1..4  ("hmm, not quite" — wrong 1st try)
const TRANSITION_COUNT = 2; // transition-{drill,final}-1..2 (pre-recorded, no name = instant)
const PRELOAD_CLIPS = [
  ...Array.from({ length: PRAISE_COUNT }, (_, i) => `praise-${i + 1}`),
  ...Array.from({ length: SMOOTH_COUNT }, (_, i) => `smooth-${i + 1}`),
  ...Array.from({ length: GOODTRY_COUNT }, (_, i) => `goodtry-${i + 1}`),
  ...Array.from({ length: REREAD_COUNT }, (_, i) => `reread-${i + 1}`),
  ...Array.from({ length: NOTQUITE_COUNT }, (_, i) => `notquite-${i + 1}`),
  // Mini-lesson spoken instructions (early readers can't read captions).
  "echome-1", "yourturn-1", "wholeline-1", "listenline-1",
  ...Array.from({ length: TRANSITION_COUNT }, (_, i) => `transition-drill-${i + 1}`),
  ...Array.from({ length: TRANSITION_COUNT }, (_, i) => `transition-final-${i + 1}`),
];
const rand = (n: number) => Math.floor(Math.random() * n);
const ACC_TRICKY = 55; // word accuracy below this → "tricky"
const PHONEME_TRICKY = 45; // any single phoneme below this → "tricky" (catches one wrong sound)

function splitSentences(text: string): string[] {
  return (text.match(/[^.!?]+[.!?]*/g) ?? [text]).map((s) => s.trim()).filter(Boolean);
}

// Merge + downsample captured mic PCM to a target rate (average-decimate to
// avoid harsh aliasing), then encode a 16-bit mono WAV — the format Azure
// Pronunciation Assessment wants (Gemini also accepts WAV).
function downsampleMerge(chunks: Float32Array[], inRate: number, outRate: number): Float32Array {
  let len = 0; for (const c of chunks) len += c.length;
  const merged = new Float32Array(len);
  let o = 0; for (const c of chunks) { merged.set(c, o); o += c.length; }
  if (outRate >= inRate) return merged;
  const ratio = inRate / outRate;
  const outLen = Math.floor(merged.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const start = Math.floor(i * ratio), end = Math.floor((i + 1) * ratio);
    let sum = 0, cnt = 0;
    for (let j = start; j < end && j < merged.length; j++) { sum += merged[j]; cnt++; }
    out[i] = cnt ? sum / cnt : (merged[start] || 0);
  }
  return out;
}
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

// Split a passage into words + the sentence index each word belongs to, so we
// can style/animate words individually (build reveal + grade scan).
function computeWords(text: string): WordInfo {
  const words = text.split(/\s+/).filter(Boolean);
  const sents = splitSentences(text);
  const lens = sents.map((s) => s.split(/\s+/).filter(Boolean).length);
  const wSent: number[] = [];
  let si = 0, count = 0;
  words.forEach((_, i) => { wSent[i] = Math.min(si, sents.length - 1); count++; if (count >= (lens[si] || 1)) { si++; count = 0; } });
  return { words, sents, wSent };
}

export default function LunaReader({
  childId,
  childName,
  passages,
  childOutfitId = null,
}: {
  childId: string;
  childName: string;
  passages: Passage[];
  /** The child's equipped bunny skin — the sidekick wears THEIR bunny. */
  childOutfitId?: string | null;
}) {
  const name = (childName || "").trim() || "friend";
  const [pIdx, setPIdx] = useState(0);
  const [override, setOverride] = useState<Passage | null>(null);
  const passage = override ?? passages[pIdx] ?? passages[0];
  // DERIVED from the passage — was separate state set in beginBuild, which
  // could desync from the displayed story (audio/grading running against a
  // different text than shown, seen on Surprise-me).
  const sentences = useMemo(() => splitSentences(passage.text), [passage.text]);
  // Per-word model for the build reveal + grade scan (words rendered as spans).
  const { words, wSent } = useMemo(() => computeWords(passage.text), [passage.text]);

  const [phase, setPhase] = useState<Phase>("intro");
  const [idx, setIdx] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [mode, setMode] = useState<LunaMode>("idle");
  const [caption, setCaption] = useState("Ready to read with me?");
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [before, setBefore] = useState<OverallScore | null>(null);
  const [after, setAfter] = useState<OverallScore | null>(null);
  const [expression, setExpression] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [lastHeard, setLastHeard] = useState<string | null>(null);
  const [engine, setEngine] = useState<string | null>(null); // which grader ran (debug)
  const [debug, setDebug] = useState(false);
  const [debugWords, setDebugWords] = useState<{ word: string; acc: number; err: string; ph?: number; worst?: string }[]>([]);
  const [dbgLog, setDbgLog] = useState<string[]>([]);
  const debugRef = useRef(false);
  const readModeRef = useRef<"idle" | "starting" | "streaming" | "recording">("idle");
  const pendingStopRef = useRef(false);
  const audioFlowRef = useRef(false);
  const recStartRef = useRef(0);

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  // Raw PCM capture (mic graph shared by both the WAV-record fallback and the
  // real-time streaming path).
  const procRef = useRef<ScriptProcessorNode | null>(null);
  const pcmRef = useRef<Float32Array[]>([]);
  const srcRateRef = useRef(48000);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clipCacheRef = useRef<Map<string, HTMLAudioElement>>(new Map()); // HTMLAudio fallback
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);         // current HTMLAudio (TTS/fallback)
  const clipBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());    // decoded clips → crisp Web Audio playback
  const currentSrcRef = useRef<AudioBufferSourceNode | null>(null);
  // Real-time streaming (Azure Speech SDK) state.
  const tokenRef = useRef<{ token: string; region: string; exp: number } | null>(null);
  const recognizerRef = useRef<StreamController | null>(null);
  const streamActiveRef = useRef(false);
  const streamWordsRef = useRef<{ refIdx: number; acc: number; err: string; phonemeMin: number; worst: string }[]>([]);
  const streamCursorRef = useRef(0);
  const streamRangeRef = useRef<{ from: number; to: number }>({ from: 0, to: 0 });
  const streamFluencyRef = useRef(100);
  const streamProsodyRef = useRef(100);
  const streamTextRef = useRef("");
  const autoStopRef = useRef<number | null>(null); // silence → auto-end the read
  // Mic caught NOTHING for a while → cancel the read gracefully (no grading a
  // silent take as "all wrong") instead of leaving the kid waiting awkwardly.
  const zeroSpeechRef = useRef<number | null>(null);
  const cancelledReadRef = useRef(false);
  const lastPraiseRef = useRef(-1);                 // avoid repeating a praise clip
  const unlockedRef = useRef(false);
  const onBlobRef = useRef<(b: Blob, durSec: number) => void>(() => {});
  const idxRef = useRef(0);
  const attemptRef = useRef(0);
  const phaseRef = useRef<Phase>("intro");
  // Per-word status: "pending" | "correct" | "tricky" — styled imperatively so
  // the reveal/scan animations survive React re-renders.
  const wordStateRef = useRef<string[]>([]);
  const animatingRef = useRef(false); // true during build reveal / grade scan
  const statsRef = useRef({ trickyWords: new Set<string>(), afterGrade: null as Grade | null, wc: 0, wt: 0, dur: 0, anns: [] as Annotation[] });

  // Feedback recap: custom coaching is generated in the BACKGROUND during the
  // read (never played live — avoids overlap) and delivered as one sequential
  // recap at the end. sessionTokenRef invalidates any in-flight coaching or
  // queued recap clip if the kid restarts, gets a new story, or leaves — so
  // stale audio never plays over whatever they're doing now.
  const coachingClipsRef = useRef<{ url: string; words: string[] }[]>([]);
  const recapIntroUrlRef = useRef<string | null>(null);
  const sessionTokenRef = useRef(0);

  // Readee bunny sidekick — celebrates alongside the orb (claps on a correct
  // line, dances at the finish). Purely visual; resets to idle after the
  // reaction's rest pose (reactionHoldMs, same anti-snap timing as the shop).
  const [bunnyRx, setBunnyRx] = useState<"" | ReactionState>("");
  const bunnyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function bunnyReact(state: ReactionState) {
    if (bunnyTimerRef.current) clearTimeout(bunnyTimerRef.current);
    setBunnyRx(state);
    bunnyTimerRef.current = setTimeout(() => setBunnyRx(""), reactionHoldMs(state));
  }

  // Carrots: +10 per sentence read correctly, shown live; banked to the
  // child's balance (with any active powerup multiplier) at session end.
  const [sessionCarrots, setSessionCarrots] = useState(0);
  const sessionCarrotsRef = useRef(0);
  function awardCarrots(n: number) {
    sessionCarrotsRef.current += n;
    setSessionCarrots(sessionCarrotsRef.current);
  }
  // The chip counts UP one by one toward the real total (and pops via the
  // lunaCarrotPop keyframe, retriggered by key={sessionCarrots}).
  const [carrotShown, setCarrotShown] = useState(0);
  useEffect(() => {
    if (carrotShown >= sessionCarrots) { if (carrotShown > sessionCarrots) setCarrotShown(sessionCarrots); return; }
    const t = window.setInterval(() => {
      setCarrotShown((c) => (c >= sessionCarrots ? c : c + 1));
    }, 45);
    return () => window.clearInterval(t);
  }, [carrotShown, sessionCarrots]);
  // Sound + celebration engine (synthesized via Web Audio, ported from the Luna
  // Full Flow design): "thinking bubbles" + praise chime + word ticks, and
  // confetti / sparks around the orb. Processing sound always stops before any
  // speech so it never overlaps the TTS.
  const sfxCtxRef = useRef<AudioContext | null>(null);
  const verbRef = useRef<ConvolverNode | null>(null);
  const bubblingRef = useRef(false);
  const buildingRef = useRef(false);
  const blipNRef = useRef(0);
  const sfxTimersRef = useRef<number[]>([]);
  const sparksHostRef = useRef<HTMLDivElement | null>(null);
  const orbWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { try { const d = new URLSearchParams(window.location.search).has("debug"); setDebug(d); debugRef.current = d; } catch { /* ignore */ } }, []);
  function dbg(m: string) { try { console.log("[luna]", m); } catch { /* ignore */ } if (debugRef.current) setDbgLog((l) => [...l.slice(-14), m]); }
  useEffect(() => { idxRef.current = idx; }, [idx]);
  // Land at the top when the reader mounts (covers /luna/read arriving with a
  // restored scroll position from the previous page).
  useEffect(() => { window.scrollTo(0, 0); }, []);
  // Mode mirror so the auto-arm timer reads FRESH mode (phaseRef already
  // exists above and is synced below).
  const modeRef = useRef<LunaMode>("idle");
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // Hands-free flow: after ONE "Let's Start" tap, the mic re-arms itself after
  // every feedback beat — the kid just keeps reading (Filip: too many clicks).
  // Guarded so it never arms over an active read, a non-drill phase, or a
  // stale session; error/cancel paths deliberately DON'T re-arm (kid taps).
  const armTimerRef = useRef<number | null>(null);
  function armRead(delayMs: number) {
    const tok = sessionTokenRef.current;
    if (armTimerRef.current) window.clearTimeout(armTimerRef.current);
    armTimerRef.current = window.setTimeout(() => {
      armTimerRef.current = null;
      if (sessionTokenRef.current !== tok) return;
      if (phaseRef.current !== "drill" || modeRef.current !== "idle") return;
      if (streamActiveRef.current || readModeRef.current !== "idle") return;
      void beginRead();
    }, delayMs);
  }
  // Mid-mini-lesson word-repeat step ("say 'pig'!") — when set, the next
  // grade routes to the word check instead of the sentence feedback.
  const wordDrillRef = useRef<{ word: string; ids: string[] } | null>(null);
  // Clips already queued for background decode (dedupe — see playCached).
  const decodePendingRef = useRef<Set<string>>(new Set());
  // Big word-lesson takeover: after a line with misses, the story card is
  // REPLACED by one large word at a time, karaoke-underlined as each phoneme
  // plays. segIdx = which grapheme chunk is lit (-1 none, length = whole word).
  const [wordLesson, setWordLesson] = useState<{ word: string; segs: SoundSegment[]; segIdx: number } | null>(null);
  const missQueueRef = useRef<string[]>([]);
  // Per-line results for the quiz-style finish summary (Line 1 ✓ / Line 2 ✗).
  const lineResultsRef = useRef<{ text: string; ok: boolean }[]>([]);
  useEffect(() => { attemptRef.current = attempt; }, [attempt]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  // Re-apply word styling whenever the phase or current drill line changes
  // (skip while an animation owns the word styles imperatively).
  useEffect(() => { if (phase !== "building" && !animatingRef.current) styleWords(); });
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = "auto";
    // Keep a fully-preloaded <audio> element per clip and PLAY THAT ELEMENT —
    // swapping .src on one shared element stutters the first frames ("not crisp").
    const cache = clipCacheRef.current;
    PRELOAD_CLIPS.forEach((k) => { try { const a = new Audio(`${CLIP_BASE}/${k}.mp3`); a.preload = "auto"; a.load(); cache.set(k, a); } catch { /* ignore */ } });
    // Decode clips into Web Audio buffers for crisp, warmup-free playback.
    try {
      const ctx = sfxCtx();
      if (ctx) PRELOAD_CLIPS.forEach((k) => {
        fetch(`${CLIP_BASE}/${k}.mp3`).then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b)).then((buf) => { clipBuffersRef.current.set(k, buf); }).catch(() => { /* HTMLAudio fallback stays */ });
      });
    } catch { /* ignore */ }
    return () => { streamActiveRef.current = false; try { void recognizerRef.current?.stop(); } catch { /* ignore */ } cleanupMic(); stopProcessing(); clearSfxTimers(); stopAudio(); try { void sfxCtxRef.current?.close(); } catch { /* ignore */ } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanupMic() {
    if (autoStopRef.current) { window.clearTimeout(autoStopRef.current); autoStopRef.current = null; }
    // Detach the ScriptProcessor callback FIRST — a late 4096-sample callback
    // firing during the async close is the audible crackle on desktop.
    try { if (procRef.current) procRef.current.onaudioprocess = null; } catch { /* ignore */ }
    try { procRef.current?.disconnect(); } catch { /* ignore */ }
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch { /* ignore */ }
    // Suspend (stops the audio pull cleanly) before closing.
    try {
      const ctx = ctxRef.current;
      if (ctx) void ctx.suspend().then(() => ctx.close()).catch(() => { try { void ctx.close(); } catch { /* ignore */ } });
    } catch { /* ignore */ }
    procRef.current = null; streamRef.current = null; ctxRef.current = null; setAnalyser(null);
  }
  function stopCurrentSrc() {
    const s = currentSrcRef.current;
    if (s) { try { s.onended = null; s.stop(); } catch { /* already stopped */ } currentSrcRef.current = null; }
  }
  function stopAudio() {
    stopCurrentSrc();
    try { currentAudioRef.current?.pause(); } catch { /* ignore */ }
    try { if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; } } catch { /* ignore */ }
    try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
  }
  function unlockAudio() {
    try { sfxCtx(); } catch { /* ignore */ } // create + resume the Web Audio context on the gesture
    if (unlockedRef.current || !audioRef.current) return;
    unlockedRef.current = true;
    try { audioRef.current.src = SILENT; void audioRef.current.play().then(() => audioRef.current?.pause()).catch(() => {}); } catch { /* ignore */ }
  }
  // Play a decoded clip through Web Audio (crisp, no element warmup); returns
  // false if the buffer/context isn't ready so the caller can fall back.
  function playBuffer(buffer: AudioBuffer, onDone: () => void): boolean {
    const ctx = sfxCtx();
    if (!ctx) return false;
    stopCurrentSrc();
    try {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(ctx.destination);
      src.onended = () => { if (currentSrcRef.current === src) currentSrcRef.current = null; onDone(); };
      currentSrcRef.current = src;
      src.start();
      return true;
    } catch { return false; }
  }
  // Pre-recorded clips (praise/reread/transition/etc.) — prefer the decoded
  // Web Audio buffer (crisp); fall back to a preloaded HTMLAudio element.
  function playCached(key: string, onDone: () => void) {
    stopAudio();
    const buffer = clipBuffersRef.current.get(key);
    if (buffer && playBuffer(buffer, onDone)) return;
    let el = clipCacheRef.current.get(key);
    if (!el) { try { el = new Audio(`${CLIP_BASE}/${key}.mp3`); clipCacheRef.current.set(key, el); } catch { window.setTimeout(onDone, 500); return; } }
    const clip = el;
    try { clip.currentTime = 0; } catch { /* ignore */ }
    clip.onended = onDone;
    currentAudioRef.current = clip;
    clip.play().catch(() => window.setTimeout(onDone, 700));
    // Decode for next time so subsequent plays are crisp — but only once per
    // key, and AFTER a beat: kicking off fetch+decodeAudioData at the exact
    // moment the clip starts was main-thread jank under the audio (crunch).
    if (!decodePendingRef.current.has(key)) {
      decodePendingRef.current.add(key);
      window.setTimeout(() => {
        const ctx = sfxCtx();
        if (!ctx || clipBuffersRef.current.has(key)) return;
        fetch(`${CLIP_BASE}/${key}.mp3`).then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b)).then((buf) => clipBuffersRef.current.set(key, buf)).catch(() => {});
      }, 1200);
    }
  }

  // --- Sound + celebration engine (synthesized, no assets) -----------------
  function sfxTimer(ms: number, fn: () => void) { const id = window.setTimeout(fn, ms); sfxTimersRef.current.push(id); return id; }
  function clearSfxTimers() { sfxTimersRef.current.forEach((id) => window.clearTimeout(id)); sfxTimersRef.current = []; }
  function sfxCtx(): AudioContext | null {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!sfxCtxRef.current) sfxCtxRef.current = new AC();
      if (sfxCtxRef.current.state === "suspended") void sfxCtxRef.current.resume();
      return sfxCtxRef.current;
    } catch { return null; }
  }
  // one-time synthesized reverb tail → spacious "thinking bubbles"
  function verb(): ConvolverNode | null {
    const ac = sfxCtx(); if (!ac) return null;
    if (!verbRef.current) {
      const len = Math.floor(ac.sampleRate * 1.6);
      const buf = ac.createBuffer(2, len, ac.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8); }
      const conv = ac.createConvolver(); conv.buffer = buf;
      const wet = ac.createGain(); wet.gain.value = 0.5;
      conv.connect(wet); wet.connect(ac.destination);
      verbRef.current = conv;
    }
    return verbRef.current;
  }
  // ChatGPT-style "thinking bubbles": deep soft blips in a boo-boo-boo … rhythm.
  function startBubbles() {
    if (!sfxCtx()) return;
    bubblingRef.current = true;
    const blip = () => {
      if (!bubblingRef.current) return;
      const c = sfxCtx(); if (!c) return;
      const t0 = c.currentTime;
      const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
      o.type = "sine"; o.frequency.setValueAtTime(330, t0);
      f.type = "lowpass"; f.frequency.value = 700;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.07, t0 + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
      o.connect(f); f.connect(g); g.connect(c.destination);
      const v = verb(); if (v) g.connect(v);
      o.start(t0); o.stop(t0 + 0.26);
      blipNRef.current = (blipNRef.current + 1) % 3;
      sfxTimer(blipNRef.current === 0 ? 900 : 260, blip);
    };
    blip();
  }
  function stopBubbles() { bubblingRef.current = false; }
  // rising praise chime (bigger arpeggio for the final celebration)
  function praiseChime(big: boolean) {
    const ac = sfxCtx(); if (!ac) return;
    const t0 = ac.currentTime;
    const notes = big ? [523, 659, 784, 1047, 1319] : [523, 659, 784, 1047];
    notes.forEach((hz, i) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = "triangle"; o.frequency.value = hz;
      const st = t0 + i * 0.09;
      g.gain.setValueAtTime(0.0001, st);
      g.gain.exponentialRampToValueAtTime(0.09, st + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, st + 0.5);
      o.connect(g); g.connect(ac.destination);
      o.start(st); o.stop(st + 0.55);
    });
  }
  // tiny settle tick as a word resolves
  function wordTick() {
    const ac = sfxCtx(); if (!ac) return;
    const t0 = ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = "sine"; o.frequency.value = 820 + Math.random() * 60;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.012, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.07);
    o.connect(g); g.connect(ac.destination);
    o.start(t0); o.stop(t0 + 0.08);
  }
  // chime + a springy orb bounce (NO confetti, per Filip)
  function celebrate(big: boolean) {
    praiseChime(big);
    const wrap = orbWrapRef.current;
    if (wrap) wrap.animate([{ transform: "scale(1)" }, { transform: "scale(1.14)" }, { transform: "scale(1)" }], { duration: 450, easing: "cubic-bezier(0.34,1.56,0.64,1)" });
  }

  // --- Per-word styling + reveal/scan animations ---------------------------
  function wEl(i: number) { return document.querySelector<HTMLElement>(`[data-w="${i}"]`); }
  // Base styling by phase + current line + per-word status (imperative so it
  // survives re-renders; the "building" reveal owns styling while it runs).
  function styleWords() {
    const p = phaseRef.current;
    if (p === "building") return;
    const cur = idxRef.current;
    words.forEach((_w, i) => {
      const el = wEl(i); if (!el) return;
      const st = wordStateRef.current[i] || "pending";
      el.style.transition = "color .35s ease, background .35s ease, opacity .3s ease";
      el.style.opacity = "1"; el.style.filter = "blur(0)"; el.style.transform = "none"; el.style.background = "transparent";
      if (p === "drill") {
        if (wSent[i] === cur) { el.style.background = "#ede9fe"; el.style.color = st === "tricky" ? "#9a3412" : st === "correct" ? "#047857" : "#18181b"; }
        else if (wSent[i] < cur) { el.style.color = st === "tricky" ? "#9a3412" : "#047857"; }
        else { el.style.color = "#a1a1aa"; }
      } else {
        el.style.color = st === "tricky" ? "#9a3412" : st === "correct" ? "#047857" : "#18181b";
      }
    });
  }
  // Map a line/passage grade → per-word status ("tricky" for missed/substituted).
  function statusMap(anns: Annotation[], offset: number) {
    return (globalIdx: number): string => {
      const a = anns[globalIdx - offset];
      if (!a) return "correct";
      return a.status === "missed" || a.status === "substituted" ? "tricky" : "correct";
    };
  }
  // Story build: words drift in blurry, then each sentence snaps into focus.
  function runBuildReveal(info: WordInfo): Promise<void> {
    return new Promise((resolve) => {
      animatingRef.current = true;
      const n = info.words.length || 1;
      for (let i = 0; i < n; i++) {
        const el = wEl(i); if (!el) continue;
        el.style.transition = "opacity .55s ease, filter .6s ease, transform .55s ease, color .35s ease";
        el.style.opacity = "0"; el.style.filter = "blur(7px)"; el.style.transform = "translateY(6px)"; el.style.color = "#18181b"; el.style.background = "transparent";
      }
      // 1) drift in, dim + blurry
      for (let i = 0; i < n; i++) sfxTimer(120 + (i * 900) / n, () => { const el = wEl(i); if (el) { el.style.opacity = ".6"; el.style.transform = "translateY(0)"; } });
      // 2) sentences snap into focus one at a time
      const sc = info.sents.length || 1;
      info.sents.forEach((_s, si) => sfxTimer(1050 + (si * 1500) / sc, () => {
        for (let i = 0; i < n; i++) if (info.wSent[i] === si) { const el = wEl(i); if (el) { el.style.opacity = "1"; el.style.filter = "blur(0)"; } }
        wordTick();
      }));
      sfxTimer(1050 + 1500 + 350, () => { praiseChime(false); animatingRef.current = false; resolve(); });
    });
  }
  // Grade scan: a violet highlight settles each word to green (or orange for a
  // tricky one), driven by the REAL grade result. Then calls onDone.
  function scanReveal(from: number, to: number, statusOf: (i: number) => string, onDone: () => void) {
    animatingRef.current = true;
    setMode("thinking"); setCaption("Let me listen back…");
    const n = Math.max(1, to - from + 1);
    const per = Math.min(170, 1500 / n);
    sfxTimer(n * per * 0.5, () => setCaption("Checking each word…"));
    for (let k = 0; k < n; k++) {
      const i = from + k;
      sfxTimer(140 + k * per, () => {
        const el = wEl(i); if (!el) return;
        el.style.transition = "color .3s ease, background .3s ease";
        el.style.background = "#ede9fe";
        sfxTimer(per * 1.4, () => {
          const st = statusOf(i);
          wordStateRef.current[i] = st;
          el.style.background = st === "tricky" ? "#ffedd5" : "transparent";
          el.style.color = st === "tricky" ? "#9a3412" : "#047857";
          wordTick();
        });
      });
    }
    sfxTimer(140 + n * per + per * 1.4 + 200, () => { animatingRef.current = false; onDone(); });
  }
  function startProcessing() { startBubbles(); }
  function stopProcessing() { stopBubbles(); }

  // Cached feedback: stop the processing sound, give the audio pipeline a
  // beat to settle (the mic→playback route switch mid-sample is what caused
  // the crunchy artifact right after listening), THEN speak.
  function playCachedQueued(key: string, onStart: () => void, onDone: () => void) {
    stopProcessing(); onStart();
    window.setTimeout(() => playCached(key, onDone), 180);
  }
  // Live TTS feedback: processing keeps going during the fetch, then stops the
  // instant the audio is ready so speech plays alone.
  function speakQueued(text: string, onDone: () => void, onStart?: () => void) {
    fetch("/api/luna/speak", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) })
      .then((r) => r.json())
      .then((j) => {
        stopProcessing(); onStart?.();
        const a = audioRef.current;
        if (a && j?.ok && j.audioUrl) { stopAudio(); a.src = j.audioUrl; a.onended = onDone; currentAudioRef.current = a; a.play().catch(() => window.setTimeout(onDone, 1600)); }
        else window.setTimeout(onDone, 1600);
      })
      .catch(() => { stopProcessing(); onStart?.(); window.setTimeout(onDone, 1200); });
  }

  // Async TTS → URL. Fire-and-forget: generate custom coaching DURING the read
  // so it's ready for the end recap. Never plays here.
  async function speakToUrl(text: string): Promise<string | null> {
    try {
      const r = await fetch("/api/luna/speak", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
      const j = await r.json();
      return r.ok && j?.ok && j.audioUrl ? (j.audioUrl as string) : null;
    } catch { return null; }
  }
  // Play one arbitrary audio URL through the shared element (stops prior audio
  // first, so nothing overlaps). onDone fires when it ends or fails.
  function playUrl(url: string, onDone: () => void) {
    const a = audioRef.current;
    if (!a) { window.setTimeout(onDone, 400); return; }
    stopAudio(); a.src = url; a.onended = onDone; currentAudioRef.current = a;
    a.play().catch(() => window.setTimeout(onDone, 1400));
  }
  // A sentence's misses → custom coaching, TTS'd in the background and stashed
  // for the recap. Token-guarded so a stale result can't sneak in.
  function fireCustomCoaching(missed: string[]) {
    const wds = missed.slice(0, 3);
    if (wds.length === 0) return;
    const line = wds.length >= 2
      ? `Let's practice ${wds.slice(0, -1).map((w) => `"${w}"`).join(", ")} and "${wds[wds.length - 1]}". Say each sound slowly.`
      : `Let's practice the word "${wds[0]}". Say each sound slowly.`;
    const tok = sessionTokenRef.current;
    void speakToUrl(line).then((url) => { if (url && sessionTokenRef.current === tok) coachingClipsRef.current.push({ url, words: wds }); });
  }

  // --- Inline mini-lesson: point at the broken word + sound it out ----------
  const normWord = (t: string) => t.toLowerCase().replace(/[^a-z']/g, "");
  /** Amber "Luna is pointing here" style on every occurrence of `word` within
   *  [from..to] (or the whole passage). Returns the touched indices. */
  function pointAt(wordList: string[], from = 0, to = words.length - 1): number[] {
    const targets = new Set(wordList.map(normWord));
    const touched: number[] = [];
    for (let i = Math.max(0, from); i <= Math.min(to, words.length - 1); i++) {
      if (!targets.has(normWord(words[i]))) continue;
      touched.push(i);
      const el = wEl(i);
      if (el) {
        el.style.transition = "background .25s ease, box-shadow .25s ease, color .25s ease";
        el.style.background = "#fde68a";
        el.style.color = "#92400e";
        el.style.boxShadow = "0 0 0 3px rgba(245,158,11,.35)";
      }
    }
    return touched;
  }
  function clearPoint() { styleWords(); }
  /** Play a phoneme-clip sequence one at a time (session-token guarded).
   *  gapMs is the pause between sounds — long gaps leave room for the kid to
   *  ECHO each sound back (call-and-response, the classic phonics routine). */
  function playPhonemeSeq(ids: string[], gapMs: number, onDone: () => void) {
    const tok = sessionTokenRef.current;
    let k = 0;
    const next = () => {
      if (sessionTokenRef.current !== tok) return; // kid restarted/left
      if (k >= ids.length) { onDone(); return; }
      playUrl(`${PHONEME_BASE}/${ids[k++]}.mp3`, () => { window.setTimeout(next, gapMs); });
    };
    next();
  }
  // Luna saying the whole WORD ("pig!") — TTS'd once per word and cached; we
  // fire it at mini-lesson start so it's ready by the time the blend ends.
  const wordSpeakRef = useRef<Map<string, string>>(new Map());
  function prewarmWordAudio(word: string) {
    const key = normWord(word);
    if (!key || wordSpeakRef.current.has(key)) return;
    const tok = sessionTokenRef.current;
    void speakToUrl(`${word}!`).then((url) => {
      if (url && sessionTokenRef.current === tok) wordSpeakRef.current.set(key, url);
    });
  }
  /** Mini-lesson: point at the broken word → sound it out with ECHO gaps (kid
   *  repeats each sound) → Luna says the whole word → kid says the word back
   *  (Azure-checked) → re-read the line. Blend, model, produce, apply. */
  /** Word lessons: the story card is replaced with ONE LARGE word at a time
   *  (karaoke underline sweeping as each phoneme plays), for EVERY missed
   *  word (capped at 3), each ending with the kid saying the word back.
   *  Then the line re-read. Blend → model → produce, word by word. */
  function startWordLessons(missed: string[]) {
    const q = Array.from(new Set(missed.map((w) => w.toLowerCase())))
      .filter((w) => soundOutSegments(w))
      .slice(0, 3);
    if (q.length === 0) { proceed(true); return; }
    q.forEach(prewarmWordAudio); // Luna's whole-word audio, ready in time
    missQueueRef.current = q;
    nextWordLesson();
  }
  function nextWordLesson() {
    const word = missQueueRef.current.shift();
    if (!word) { setWordLesson(null); proceed(true); return; }
    const segs = soundOutSegments(word)!;
    setWordLesson({ word, segs, segIdx: -1 });
    setMode("speaking");
    setCaption(`"${word}" - say each sound after me!`);
    playCached("echome-1", () => stepSegments(word, segs));
  }
  function stepSegments(word: string, segs: SoundSegment[]) {
    const tok = sessionTokenRef.current;
    let k = 0;
    const step = () => {
      if (sessionTokenRef.current !== tok) return;
      if (k >= segs.length) {
        // Whole-word model: light the full word while Luna says it.
        setWordLesson((s) => (s ? { ...s, segIdx: segs.length } : s));
        const wurl = wordSpeakRef.current.get(normWord(word));
        const go = () => beginWordRead(word, segs.map((sg) => sg.id));
        if (wurl) { setCaption(`Put it together: "${word}"!`); playUrl(wurl, go); }
        else go();
        return;
      }
      setWordLesson((s) => (s ? { ...s, segIdx: k } : s));
      playUrl(`${PHONEME_BASE}/${segs[k].id}.mp3`, () => { k++; window.setTimeout(step, 950); });
    };
    step();
  }
  /** After a word's say-it-back check: next queued word, or the line. */
  function afterWordCheck() {
    if (missQueueRef.current.length > 0) nextWordLesson();
    else { setWordLesson(null); proceed(true); }
  }
  /** The "your turn - say it!" word check. Opens the mic on JUST that word;
   *  the grade routes to handleWordResult via wordDrillRef. */
  function beginWordRead(word: string, ids: string[]) {
    const s = idxRef.current;
    const from = Math.max(0, wSent.indexOf(s));
    const to = wSent.lastIndexOf(s) < 0 ? words.length - 1 : wSent.lastIndexOf(s);
    let wi = -1;
    for (let i = from; i <= to; i++) if (normWord(words[i]) === normWord(word)) { wi = i; break; }
    if (wi < 0) { afterWordCheck(); return; } // can't locate it — next word/line
    // Spoken instruction ("Now you say the word!") BEFORE the mic opens, so
    // the kid knows exactly what to do — captions alone don't cut it.
    playCached("yourturn-1", () => {
      wordDrillRef.current = { word, ids };
      setCaption(`Your turn, ${name} - say "${word}"!`);
      readModeRef.current = "starting"; pendingStopRef.current = false;
      void startStream(word, wi, wi).then((ok) => {
        if (ok) { readModeRef.current = "streaming"; return; }
        // No streaming (fallback env) — skip the word check, move along.
        readModeRef.current = "idle";
        wordDrillRef.current = null;
        afterWordCheck();
      });
    });
  }
  /** Grade of the single-word check: said it right → tiny praise → the line;
   *  not yet → one more blend, then the line either way (no spiral). */
  function handleWordResult(wd: { word: string; ids: string[] }, g: Grade) {
    stopProcessing();
    if (g.wordsCorrect >= 1) {
      bunnyReact("correct");
      playCachedQueued(praiseKey(), () => { setMode("speaking"); setCaption(`That's it - "${wd.word}"!`); }, () => afterWordCheck());
    } else {
      // Not yet — one more karaoke blend of THIS word, then move along.
      setMode("speaking");
      setCaption(`Almost! Listen once more: "${wd.word}".`);
      const segs = soundOutSegments(wd.word);
      const tok = sessionTokenRef.current;
      let k = 0;
      const step = () => {
        if (sessionTokenRef.current !== tok) return;
        if (k >= wd.ids.length) {
          if (segs) setWordLesson((s) => (s ? { ...s, segIdx: segs.length } : s));
          const wurl = wordSpeakRef.current.get(normWord(wd.word));
          if (wurl) playUrl(wurl, () => afterWordCheck());
          else afterWordCheck();
          return;
        }
        setWordLesson((s) => (s ? { ...s, segIdx: k } : s));
        playUrl(`${PHONEME_BASE}/${wd.ids[k]}.mp3`, () => { k++; window.setTimeout(step, 950); });
      };
      step();
    }
  }

  // Pick a praise clip that isn't the one we just played (kills the "same
  // cheer over and over" feel).
  function praiseKey() {
    let n = 1 + rand(PRAISE_COUNT);
    if (PRAISE_COUNT > 1) { let guard = 0; while (n === lastPraiseRef.current && guard++ < 6) n = 1 + rand(PRAISE_COUNT); }
    lastPraiseRef.current = n;
    return `praise-${n}`;
  }

  // Varied captions so the on-screen line matches the audio variety.
  const praiseCap = () => [`Great reading, ${name}!`, `Wonderful, ${name}!`, `You nailed it, ${name}!`, `Awesome work, ${name}!`, `Beautiful reading, ${name}!`][rand(5)];
  const smoothCap = () => [`Take your time, ${name} - nice and smooth.`, `Slow and steady, ${name}.`, `Let's read it smooth this time, ${name}.`][rand(3)];
  const goodtryCap = () => [`Good try, ${name}! Let's keep going.`, `Nice effort, ${name}!`, `You're getting it, ${name}!`][rand(3)];

  // Open the mic graph once; `onPcm` receives each raw Float32 frame + the ctx
  // sample rate. The ScriptProcessor must reach the destination to run, so it's
  // routed through a muted gain. Used by BOTH the streaming and record paths.
  async function openMicGraph(onPcm: (frame: Float32Array, rate: number) => void): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      if (ctx.state === "suspended") { try { await ctx.resume(); } catch { /* ignore */ } }
      srcRateRef.current = ctx.sampleRate;
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser(); an.fftSize = 512; an.smoothingTimeConstant = 0.75;
      src.connect(an); setAnalyser(an);
      const proc = ctx.createScriptProcessor(4096, 1, 1);
      proc.onaudioprocess = (e) => onPcm(new Float32Array(e.inputBuffer.getChannelData(0)), ctx.sampleRate);
      const sink = ctx.createGain(); sink.gain.value = 0;
      src.connect(proc); proc.connect(sink); sink.connect(ctx.destination);
      procRef.current = proc;
      return true;
    } catch { return false; }
  }

  // --- Fallback path: record a WAV, POST to /api/luna/grade -----------------
  async function startRecording(onBlob: (b: Blob, durSec: number) => void) {
    unlockAudio();
    stopProcessing(); stopAudio(); animatingRef.current = false;
    setErr(null);
    onBlobRef.current = onBlob;
    pcmRef.current = [];
    const ok = await openMicGraph((frame) => { pcmRef.current.push(frame); });
    if (!ok) { setErr("I couldn't turn on the mic. Check the mic permission and try again."); setMode("idle"); return; }
    recStartRef.current = Date.now();
    setMode("listening");
  }
  function stopRecording() {
    const durSec = Math.max(0.5, (Date.now() - recStartRef.current) / 1000);
    const rate = srcRateRef.current;
    const chunks = pcmRef.current; pcmRef.current = [];
    cleanupMic();
    setMode("thinking"); setCaption("Let me listen…");
    startProcessing();
    const wav = encodeWav(downsampleMerge(chunks, rate, 16000), 16000);
    onBlobRef.current(wav, durSec);
  }

  // --- Streaming path: Azure Speech SDK, real-time word coloring ------------
  async function getToken(): Promise<{ token: string; region: string } | null> {
    const t = tokenRef.current;
    if (t && t.exp > Date.now() + 30000) return t;
    try {
      const r = await fetch("/api/luna/speech-token", { method: "POST" });
      const j = await r.json();
      if (r.ok && j.ok && j.token) { tokenRef.current = { token: j.token, region: j.region, exp: Date.now() + 9 * 60 * 1000 }; dbg("token ok"); return tokenRef.current; }
      dbg(`token fail: ${j.configured === false ? "not configured" : (j.error || "no token")}`);
    } catch (e) { dbg(`token error: ${e instanceof Error ? e.message : e}`); }
    return null;
  }
  function statusFrom(acc: number, err: string, phonemeMin: number): "correct" | "tricky" {
    if (err === "Omission" || err === "Mispronunciation") return "tricky";
    if (acc < ACC_TRICKY) return "tricky";
    if (phonemeMin < PHONEME_TRICKY) return "tricky"; // one clearly-wrong sound
    return "correct";
  }
  // Auto-end the read after a beat of silence — the child shouldn't have to tap
  // "done". Snappier once they've clearly read the whole thing; more patient
  // (allows mid-sentence pauses) until then.
  function noteSpeech(partial: string) {
    if (!streamActiveRef.current) return;
    const { from, to } = streamRangeRef.current;
    const refLen = Math.max(1, to - from + 1);
    const settled = Math.max(0, streamCursorRef.current - from);
    const partialWords = partial.trim() ? partial.trim().split(/\s+/).length : 0;
    // Real speech arrived — the mic works; stand down the zero-speech watchdog.
    if ((settled > 0 || partialWords > 0) && zeroSpeechRef.current) {
      window.clearTimeout(zeroSpeechRef.current);
      zeroSpeechRef.current = null;
    }
    const covered = settled + partialWords >= Math.floor(refLen * 0.9);
    // Tightened (was 2000/3500) — a partial read left the kid hanging in
    // silence before Luna moved on.
    if (autoStopRef.current) window.clearTimeout(autoStopRef.current);
    autoStopRef.current = window.setTimeout(() => {
      autoStopRef.current = null;
      if (streamActiveRef.current) { dbg("auto-stop: silence"); void stopStream(); }
    }, covered ? 1500 : 2600);
  }
  // Live: highlight the words being spoken in the current phrase (from the
  // running cursor), so it tracks across phrases in a whole-passage read.
  function liveHighlight(partialText: string) {
    const n = partialText.trim().split(/\s+/).filter(Boolean).length;
    const base = streamCursorRef.current, to = streamRangeRef.current.to;
    for (let k = 0; k < n; k++) {
      const idx = base + k; if (idx > to) break;
      if ((wordStateRef.current[idx] || "pending") === "pending") {
        const el = wEl(idx); if (el) { el.style.transition = "background .15s ease, color .15s ease"; el.style.background = "#ede9fe"; el.style.color = "#4338ca"; }
      }
    }
  }
  // Each recognized phrase settles its words to green/orange (karaoke).
  function onStreamPhrase(p: PAPhrase) {
    dbg(`phrase: ${p.words.length}w fluency=${p.fluency} prosody=${p.prosody} "${(p.text || "").slice(0, 30)}"`);
    streamFluencyRef.current = Math.min(streamFluencyRef.current, p.fluency);
    streamProsodyRef.current = Math.min(streamProsodyRef.current, p.prosody);
    streamTextRef.current = (streamTextRef.current + " " + (p.text || "")).trim();
    const { to } = streamRangeRef.current;
    let i = streamCursorRef.current;
    for (const w of p.words) {
      if (w.errorType === "Insertion") continue;
      if (i > to) break;
      const st = statusFrom(w.accuracy, w.errorType, w.phonemeMin);
      wordStateRef.current[i] = st;
      streamWordsRef.current.push({ refIdx: i, acc: w.accuracy, err: w.errorType, phonemeMin: w.phonemeMin, worst: w.worst });
      const el = wEl(i);
      if (el) { el.style.transition = "color .25s ease, background .25s ease"; el.style.background = st === "tricky" ? "#ffedd5" : "transparent"; el.style.color = st === "tricky" ? "#9a3412" : "#047857"; }
      wordTick();
      i++;
    }
    streamCursorRef.current = i;
  }
  function buildStreamGrade(from: number, to: number, durSec: number): Grade {
    // Per-word truth from Azure (colored live). We do NOT trust the transcript to
    // clear errors — Azure's recognizer is reference-biased and transcribes a
    // wrong word (e.g. "Jim") as the expected one ("Kim"), so a matched
    // transcript is not proof of a correct read. The per-word score is.
    const seen = new Set(streamWordsRef.current.map((w) => w.refIdx));
    const wordAnnotations: Annotation[] = [];
    let correct = 0, total = 0;
    for (let i = from; i <= to; i++) {
      total++;
      let status: string;
      if (!seen.has(i)) { status = "missed"; wordStateRef.current[i] = "tricky"; }
      else if (wordStateRef.current[i] === "tricky") status = "substituted";
      else { status = "correct"; correct++; }
      wordAnnotations.push({ word: words[i], status });
    }
    return { wordAnnotations, wordsCorrect: correct, wordsTotal: total, durationSeconds: durSec, disfluent: streamFluencyRef.current < 50, heardTranscript: streamTextRef.current, prosody: streamProsodyRef.current };
  }
  async function startStream(refText: string, from: number, to: number): Promise<boolean> {
    const tok = await getToken();
    if (!tok) return false;
    unlockAudio();
    stopProcessing(); stopAudio(); setErr(null);
    streamWordsRef.current = []; streamCursorRef.current = from; streamRangeRef.current = { from, to }; streamFluencyRef.current = 100; streamProsodyRef.current = 100; streamTextRef.current = ""; audioFlowRef.current = false;
    let ctrl: StreamController;
    try {
      dbg("sdk loading…");
      ctrl = await Promise.race([
        startPronAssessment({
          token: tok.token, region: tok.region, referenceText: refText,
          onRecognizing: (t) => { liveHighlight(t); noteSpeech(t); },
          onPhrase: (p) => { onStreamPhrase(p); noteSpeech(""); },
          onError: (m) => dbg(`stream err: ${m}`),
          log: (m) => dbg(m),
        }),
        new Promise<StreamController>((_, rej) => window.setTimeout(() => rej(new Error("init timeout (10s)")), 10000)),
      ]);
      dbg("recognition started");
    } catch (e) { dbg(`sdk init failed: ${e instanceof Error ? e.message : e}`); return false; }
    recognizerRef.current = ctrl;
    const ok = await openMicGraph((frame, rate) => {
      if (!streamActiveRef.current) return;
      if (!audioFlowRef.current) {
        // First real mic frame → NOW the mic is truly capturing. Only now show
        // "listening" (so the child doesn't start reading before we capture) and
        // start the WCPM clock. Fixes the clipped first word.
        audioFlowRef.current = true;
        dbg(`audio flowing @${Math.round(rate)}Hz`);
        recStartRef.current = Date.now();
        setMode("listening");
      }
      ctrl.pushSamples(frame, rate);
    });
    if (!ok) { dbg("mic failed"); try { await ctrl.stop(); } catch { /* ignore */ } recognizerRef.current = null; return false; }
    animatingRef.current = true; // hold the styling effect off while we color live
    setEngine("azure");
    streamActiveRef.current = true;
    // Zero-speech watchdog: if Azure hears NOTHING in 10s (muted mic, too
    // quiet), cancel the read with a friendly nudge instead of grading a
    // silent take as all-wrong or waiting forever.
    cancelledReadRef.current = false;
    if (zeroSpeechRef.current) window.clearTimeout(zeroSpeechRef.current);
    zeroSpeechRef.current = window.setTimeout(() => {
      zeroSpeechRef.current = null;
      if (streamActiveRef.current && streamWordsRef.current.length === 0 && !streamTextRef.current) {
        dbg("zero-speech: cancelling read");
        cancelledReadRef.current = true;
        void stopStream();
      }
    }, 10000);
    dbg("LIVE - reading");
    return true;
  }
  async function stopStream() {
    streamActiveRef.current = false;
    if (zeroSpeechRef.current) { window.clearTimeout(zeroSpeechRef.current); zeroSpeechRef.current = null; }
    const durSec = Math.max(0.5, (Date.now() - recStartRef.current) / 1000);
    if (cancelledReadRef.current) {
      // Mic caught nothing — reset without grading.
      cancelledReadRef.current = false;
      wordDrillRef.current = null; // a stale word-check must not eat the next grade
      setWordLesson(null); missQueueRef.current = [];
      cleanupMic();
      const ctrl0 = recognizerRef.current; recognizerRef.current = null;
      if (ctrl0) await Promise.race([ctrl0.stop(), new Promise<void>((r) => window.setTimeout(r, 1500))]);
      stopProcessing(); animatingRef.current = false; readModeRef.current = "idle";
      setMode("idle");
      setCaption(`I couldn't hear you that time, ${name}. Tap me and let's try again!`);
      return;
    }
    setMode("thinking"); setCaption("Let me listen…");
    cleanupMic();
    const ctrl = recognizerRef.current; recognizerRef.current = null;
    dbg("stopping…");
    if (ctrl) {
      // Never let a stuck SDK stop callback hang the whole session.
      await Promise.race([ctrl.stop(), new Promise<void>((r) => window.setTimeout(r, 2000))]);
    }
    await new Promise<void>((r) => window.setTimeout(r, 600)); // let the FINAL recognized (last word) land
    const { from, to } = streamRangeRef.current;
    if (debugRef.current) setDebugWords(streamWordsRef.current.map((w) => ({ word: words[w.refIdx] ?? "?", acc: w.acc, err: w.err, ph: w.phonemeMin, worst: w.worst })));
    const g = buildStreamGrade(from, to, durSec);
    dbg(`grade: ${g.wordsCorrect}/${g.wordsTotal} correct, ${streamWordsRef.current.length} scored`);
    animatingRef.current = false;
    readModeRef.current = "idle";
    finishFromGrade(g, durSec);
  }
  // Route a streamed read's assembled grade to the shared feedback (no scan —
  // words were colored live).
  function finishFromGrade(g: Grade, durSec: number) {
    // A word-repeat check (mini-lesson "say 'pig'!") routes to its own
    // handler — it must NOT be graded as a sentence read.
    if (wordDrillRef.current) {
      const wd = wordDrillRef.current;
      wordDrillRef.current = null;
      handleWordResult(wd, g);
      return;
    }
    const ph = phaseRef.current;
    if (ph === "overall1") { addTricky(g.wordAnnotations); setBefore(toScore(g, durSec)); wholeFeedbackBefore(); }
    else if (ph === "overall2") { addTricky(g.wordAnnotations); setAfter(toScore(g, durSec)); if (g.prosody != null) setExpression(g.prosody); statsRef.current.afterGrade = g; wholeFeedbackAfter(); }
    else if (ph === "drill") { sentenceFeedback(g, idxRef.current, attemptRef.current); }
  }

  async function postGrade(text: string, blob: Blob): Promise<Grade> {
    const fd = new FormData();
    fd.append("audio", blob, "read.wav");
    fd.append("childId", childId);
    fd.append("sentenceText", text);
    fd.append("gradeLevel", passage.grade);
    const r = await fetch("/api/luna/grade", { method: "POST", body: fd });
    const json = await r.json();
    if (!r.ok || !json.ok) throw new Error(json.error ?? `HTTP ${r.status}`);
    if (json.engine) setEngine(json.engine as string);
    if (Array.isArray(json.debugWords)) setDebugWords(json.debugWords);
    return json.analysis as Grade;
  }

  function toScore(g: Grade, durSec: number): OverallScore {
    return {
      wcpm: durSec > 0 ? g.wordsCorrect / (durSec / 60) : 0,
      accuracy: g.wordsTotal > 0 ? (g.wordsCorrect / g.wordsTotal) * 100 : 0,
    };
  }

  function addTricky(anns: Annotation[]) {
    anns.forEach((a) => { if (a.status === "missed" || a.status === "substituted") { const w = a.word.replace(/[^A-Za-z'-]/g, ""); if (w) statsRef.current.trickyWords.add(w); } });
  }
  // Shared feedback — used after BOTH the streaming read and the REST scan.
  function wholeFeedbackBefore() {
    // Pre-recorded (no name) = instant; the personalized name via live TTS added
    // real latency here.
    playCachedQueued(`transition-drill-${1 + rand(TRANSITION_COUNT)}`,
      () => { setMode("speaking"); setCaption("Nice first read! Now let's practice it, one line at a time."); },
      () => {
        wordStateRef.current = words.map(() => "pending");
        setPhase("drill"); setIdx(0); setAttempt(0); setMode("idle"); setCaption("Tap me and read the first line.");
      });
  }
  function wholeFeedbackAfter() {
    playCachedQueued(praiseKey(), () => { setMode("speaking"); setCaption(`Amazing, ${name}!`); celebrate(true); }, () => finishSession());
  }
  function sentenceFeedback(g: Grade, curIdx: number, curAttempt: number) {
    // SUBSTITUTED first — the kid actually said those wrong (said "dig" for
    // "pig"), so they're the words to teach. "Missed" can just be Azure not
    // catching a word, so they rank after; targeting one of those made the
    // mini-lesson sound out a word the kid didn't even struggle with.
    const clean = (w: string) => w.replace(/[^A-Za-z'-]/g, "");
    const tricky = [
      ...g.wordAnnotations.filter((w) => w.status === "substituted"),
      ...g.wordAnnotations.filter((w) => w.status === "missed"),
    ].map((w) => clean(w.word)).filter(Boolean);
    // Error = they read the wrong WORDS. Fluency (slow/choppy) is tracked for the
    // report but does NOT trigger a "you got it wrong" retry — that was flagging
    // correct-but-slow reads.
    const hasError = g.wordsCorrect < g.wordsTotal || tricky.length > 0;
    const willRetry = hasError && curAttempt === 0;
    // On the FINAL result for this sentence, roll it into the session grade
    // (there's no whole-story overall read anymore).
    if (!willRetry) {
      statsRef.current.wc += g.wordsCorrect;
      statsRef.current.wt += g.wordsTotal;
      statsRef.current.dur += g.durationSeconds;
      statsRef.current.anns.push(...g.wordAnnotations);
      tricky.slice(0, 5).forEach((w) => statsRef.current.trickyWords.add(w));
      lineResultsRef.current.push({ text: sentences[curIdx] ?? "", ok: !hasError });
    }
    // Only surface "I heard …" when the transcript ACTUALLY diverges from the
    // target line (Azure echoes the reference even on a wrong read).
    const norm = (s: string) =>
      (s || "").toLowerCase().replace(/[^a-z0-9'\s]/g, "").replace(/\s+/g, " ").trim();
    const targetLine = sentences[curIdx] ?? "";
    const heardDiffers =
      !!g.heardTranscript && norm(g.heardTranscript) !== norm(targetLine);
    setLastHeard(hasError && heardDiffers ? g.heardTranscript! : null);
    if (!hasError) {
      // Right → instant generic praise ("Great job!") + bunny claps + carrots.
      setLastHeard(null);
      bunnyReact("clap");
      awardCarrots(10);
      playCachedQueued(praiseKey(), () => { setMode("speaking"); setCaption(praiseCap()); celebrate(false); }, () => proceed(false));
    } else if (willRetry) {
      // Wrong (1st try). How we teach depends on HOW wrong (multi-miss logic):
      //   1-3 misses → full mini-lesson on the WORST word (echo sounds → say
      //                the word → re-read the line). One word, done well.
      //   heavy miss (4+ or over half the line) → drilling one word won't
      //                help; Luna MODELS the whole line (reads it aloud,
      //                pre-warmed during the "not quite" clip) → kid re-reads.
      // The CUSTOM recap coaching still generates in the background either way.
      fireCustomCoaching(tricky);
      // Heavy = MANY real misreads (substituted). Azure liberally flags
      // "missed" words it just didn't catch, and the old tricky-based ratio
      // let one real misread ("win") get lumped into "heavy" — skipping the
      // sound-out lesson the kid actually needed. Count substitutions only.
      const subCount = g.wordAnnotations.filter((w) => w.status === "substituted").length;
      const heavy = subCount >= 4 || (g.wordsTotal >= 6 && subCount / g.wordsTotal > 0.6);
      if (heavy) {
        const tokH = sessionTokenRef.current;
        const linePromise = speakToUrl(sentences[curIdx] ?? ""); // pre-warm during the clips
        playCachedQueued(`notquite-${1 + rand(NOTQUITE_COUNT)}`, () => { setMode("speaking"); setCaption("Hmm, not quite."); }, () => {
          playCached("listenline-1", () => {
            setCaption("Listen to the whole line…");
            void linePromise.then((url) => {
              if (sessionTokenRef.current !== tokH) return;
              if (url) playUrl(url, () => proceed(true));
              else proceed(true);
            });
          });
        });
      } else {
        // Word lessons for EVERY missed word (substituted first, capped at 3)
        // — the big one-word-at-a-time karaoke view. Falls through to a plain
        // line retry when none decompose.
        playCachedQueued(`notquite-${1 + rand(NOTQUITE_COUNT)}`, () => { setMode("speaking"); setCaption("Hmm, not quite. Let's work on those words."); }, () => startWordLessons(tricky));
      }
    } else {
      // Wrong (2nd try) → warm "keep going" and move on.
      playCachedQueued(`goodtry-${1 + rand(GOODTRY_COUNT)}`, () => { setMode("speaking"); setCaption(goodtryCap()); }, () => proceed(false));
    }
  }

  // REST fallback: grade the recorded WAV, scan-reveal, then shared feedback.
  async function gradeWhole(blob: Blob, which: "before" | "after", durSec: number) {
    try {
      const g = await postGrade(passage.text, blob);
      addTricky(g.wordAnnotations);
      const statusOf = statusMap(g.wordAnnotations, 0);
      if (which === "before") { setBefore(toScore(g, durSec)); scanReveal(0, words.length - 1, statusOf, wholeFeedbackBefore); }
      else { setAfter(toScore(g, durSec)); if (g.prosody != null) setExpression(g.prosody); statsRef.current.afterGrade = g; scanReveal(0, words.length - 1, statusOf, wholeFeedbackAfter); }
    } catch (e: unknown) {
      stopProcessing();
      setErr(e instanceof Error ? e.message : "Something went wrong.");
      setMode("idle");
      setCaption("Let's try that again - tap me when you're ready.");
    }
  }

  async function gradeSentence(blob: Blob) {
    const curIdx = idxRef.current;
    const curAttempt = attemptRef.current;
    try {
      const g = await postGrade(sentences[curIdx], blob);
      const from = wSent.indexOf(curIdx), to = wSent.lastIndexOf(curIdx);
      const lo = from < 0 ? 0 : from, hi = to < 0 ? words.length - 1 : to;
      const statusOf = statusMap(g.wordAnnotations, lo);
      scanReveal(lo, hi, statusOf, () => sentenceFeedback(g, curIdx, curAttempt));
    } catch (e: unknown) {
      stopProcessing();
      setErr(e instanceof Error ? e.message : "Something went wrong.");
      setMode("idle"); setCaption("Let's try that line again - tap me when you're ready.");
    }
  }

  function proceed(willRetry: boolean) {
    if (willRetry) {
      // Clear this line's colors so the re-read scans fresh.
      const s = idxRef.current;
      const from = wSent.indexOf(s), to = wSent.lastIndexOf(s);
      for (let i = from; i <= to; i++) if (i >= 0) wordStateRef.current[i] = "pending";
      setAttempt(1); setCaption("Now read the whole line again!");
      styleWords();
      // Spoken direction, then the mic re-arms hands-free.
      setMode("speaking");
      playCached("wholeline-1", () => { setMode("idle"); armRead(500); });
      return;
    }
    setAttempt(0);
    setLastHeard(null);
    const next = idxRef.current + 1;
    if (next >= sentences.length) {
      playRecap();
    } else {
      setIdx(next); setMode("idle"); setCaption("Nice! Read the next line.");
      armRead(900); // hands-free next line
    }
  }

  // End recap: play the personalized intro + each background-generated custom
  // coaching clip, strictly one at a time (each clip's onended triggers the
  // next through the shared audio element). Token-guarded so a stale queue
  // stops if the kid left / restarted. Then the results screen.
  function playRecap() {
    const tok = sessionTokenRef.current;
    // Session grade from the per-sentence drills (no more whole-story read).
    statsRef.current.afterGrade = {
      wordAnnotations: statsRef.current.anns,
      wordsCorrect: statsRef.current.wc,
      wordsTotal: statsRef.current.wt,
      durationSeconds: statsRef.current.dur,
      disfluent: false,
      heardTranscript: "",
      prosody: undefined,
    };
    setAfter(toScore(statsRef.current.afterGrade, statsRef.current.dur || 1));
    const clips = coachingClipsRef.current;
    setMode("speaking");
    celebrate(true);
    bunnyReact("levelup"); // the dance — finish-line celebration
    setCaption(clips.length ? `Great reading, ${name}! Let's practice a few words.` : `Amazing, ${name}!`);
    const seq: { url: string; words?: string[] }[] = [];
    if (recapIntroUrlRef.current) seq.push({ url: recapIntroUrlRef.current });
    clips.forEach((c) => seq.push({ url: c.url, words: c.words }));
    // Make sure Luna can SAY each practice word after its blend.
    clips.forEach((c) => { if (c.words[0]) prewarmWordAudio(c.words[0]); });
    if (seq.length === 0) { finishSession(); return; }
    let i = 0;
    let blendBudget = 2; // cap the recap blends so a rough session's recap doesn't drag
    const playNext = () => {
      if (sessionTokenRef.current !== tok) return; // stale — kid left/restarted
      clearPoint(); // drop the previous clip's highlight
      if (i >= seq.length) { finishSession(); return; }
      const item = seq[i++];
      // Luna "points": highlight the words this clip coaches while it plays.
      if (item.words?.length) pointAt(item.words);
      playUrl(item.url, () => {
        // TEACH, don't just mention: after "let's practice 'kit'", actually
        // sound the word out (echo gaps) + say it whole, then move on.
        const w = item.words?.[0];
        const ids = w && blendBudget > 0 ? soundOut(w) : null;
        if (w && ids) {
          blendBudget--;
          setCaption(`"${w}" - say each sound after me!`);
          playPhonemeSeq(ids, 950, () => {
            const wurl = wordSpeakRef.current.get(normWord(w));
            if (wurl) { setCaption(`"${w}"!`); playUrl(wurl, playNext); }
            else playNext();
          });
        } else {
          playNext();
        }
      });
    };
    playNext();
  }

  function finishSession() {
    setPhase("done");
    setMode("idle");
    setCaption(`You did it, ${name}!`);
    // Bank the session carrots (with any active powerup multiplier) —
    // best-effort; never block the celebration on a save hiccup.
    const base = sessionCarrotsRef.current;
    if (base > 0) {
      const sb = supabaseBrowser();
      void sb
        .from("children")
        .select("carrots, active_multiplier, active_multiplier_expires_at")
        .eq("id", childId)
        .single()
        .then(({ data }) => {
          if (!data) return;
          const award = Math.round(base * getActiveMultiplier(data as any));
          return sb.from("children").update({ carrots: (data.carrots ?? 0) + award }).eq("id", childId);
        })
        .then(undefined, () => { /* best-effort */ });
    }
    const g = statsRef.current.afterGrade;
    void fetch("/api/luna/session-complete", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childId, passageText: passage.text, gradeLevel: passage.grade,
        patternId: passage.patternId ?? null,
        wordAnnotations: g?.wordAnnotations ?? [],
        wordsTotal: g?.wordsTotal ?? 0, wordsCorrect: g?.wordsCorrect ?? 0,
        durationSeconds: g?.durationSeconds ?? 0,
        wcpm: after?.wcpm ?? 0,
        prosody: g?.prosody ?? null,
        targetPatterns: Array.from(statsRef.current.trickyWords),
      }),
    }).catch(() => {});
  }

  // Predetermined content = INSTANT: pick from the pre-built decodable library
  // (passed in as `passages`), avoiding an immediate repeat. No runtime
  // generation — that's what makes Luna feel snappy like Duolingo.
  async function loadFreshPassage(): Promise<Passage> {
    const pool = passages.length ? passages : [passage];
    // `passages` arrives weakest-pattern-first (adaptive order from the server).
    // Prefer another passage in the weakest pattern; avoid an immediate repeat.
    const targetPattern = pool[0]?.patternId;
    const inPattern = pool.filter((p) => p.patternId && p.patternId === targetPattern && p.text !== passage.text);
    const others = pool.filter((p) => p.text !== passage.text);
    const from = inPattern.length ? inPattern : others.length ? others : pool;
    return from[Math.floor(Math.random() * from.length)] ?? passage;
  }

  // Reveal a story: words drift in blurry, then each sentence snaps into focus
  // (with word ticks + bubbles), then we start the first whole-story read.
  async function beginBuild(p: Passage) {
    buildingRef.current = false;
    animatingRef.current = false;
    stopAudio();
    if (sparksHostRef.current) sparksHostRef.current.innerHTML = "";
    statsRef.current = { trickyWords: new Set(), afterGrade: null, wc: 0, wt: 0, dur: 0, anns: [] };
    // New session: invalidate any prior in-flight audio, reset the recap, and
    // start generating the personalized recap intro in the background now so
    // it's ready by the end.
    coachingClipsRef.current = [];
    recapIntroUrlRef.current = null;
    sessionCarrotsRef.current = 0; setSessionCarrots(0); setCarrotShown(0); setBunnyRx("");
    lineResultsRef.current = [];
    setWordLesson(null); missQueueRef.current = [];
    const sessTok = ++sessionTokenRef.current;
    void speakToUrl(`Great reading, ${name}!`).then((url) => { if (url && sessionTokenRef.current === sessTok) recapIntroUrlRef.current = url; });
    setIdx(0); setAttempt(0); setBefore(null); setAfter(null); setExpression(null); setErr(null); setLastHeard(null);
    const info = computeWords(p.text);
    wordStateRef.current = info.words.map(() => "pending");
    setOverride(p);
    setPreparing(false);
    setPhase("building"); setMode("thinking"); setCaption("Here's your story!");
    startProcessing();
    await new Promise<void>((r) => sfxTimer(90, r)); // let the word spans render
    await runBuildReveal(info);
    stopProcessing();
    // Straight into the per-sentence drill — no confusing whole-story baseline
    // read. The "Let's Start" tap was the one gesture we need (audio unlock);
    // from here the mic arms itself after each beat — hands-free reading.
    setPhase("drill"); setIdx(0); setAttempt(0); setMode("idle"); setCaption("Read the first line out loud!");
    armRead(900);
  }

  // Generate a fresh passage while Luna "makes a story" (thinking bubbles + orb
  // sparks + cycling captions), then reveal it with the build animation.
  async function prepareAndBegin() {
    unlockAudio();
    setPreparing(true);
    setCaption("Thinking of a story you'll love…");
    buildingRef.current = true;
    startProcessing();
    sfxTimer(1100, () => { if (buildingRef.current) setCaption("Picking just-right words…"); });
    sfxTimer(2300, () => { if (buildingRef.current) setCaption("Putting the pages together…"); });
    sfxTimer(3500, () => { if (buildingRef.current) setCaption("Adding the fun parts…"); });
    const p = await loadFreshPassage();
    buildingRef.current = false;
    await beginBuild(p);
  }

  async function startFlow() { await prepareAndBegin(); }
  async function newPassage() { await prepareAndBegin(); }

  function onTap() {
    if (mode === "listening") { endRead(); return; }
    if (mode !== "idle") return;
    if (phase === "overall1" || phase === "drill" || phase === "overall2") void beginRead();
  }
  // Start a read: try real-time streaming; fall back to record → REST grade.
  async function beginRead() {
    const isDrill = phaseRef.current === "drill";
    const ci = idxRef.current;
    const refText = isDrill ? sentences[ci] : passage.text;
    const from = isDrill ? Math.max(0, wSent.indexOf(ci)) : 0;
    const to = isDrill ? (wSent.lastIndexOf(ci) < 0 ? words.length - 1 : wSent.lastIndexOf(ci)) : words.length - 1;
    for (let i = from; i <= to; i++) wordStateRef.current[i] = "pending";
    styleWords();
    readModeRef.current = "starting"; pendingStopRef.current = false;
    setMode("thinking"); setCaption("Getting ready…"); // don't say "listening" until the mic truly captures
    const ok = await startStream(refText, from, to);
    if (ok) {
      readModeRef.current = "streaming";
      if (pendingStopRef.current) { dbg("deferred stop → stopping now"); void stopStream(); }
      return;
    }
    // Streaming unavailable → record + REST.
    dbg("falling back to record→REST");
    readModeRef.current = "recording";
    if (isDrill) startRecording((b) => { void gradeSentence(b); });
    else if (phase === "overall1") startRecording((b, d) => { void gradeWhole(b, "before", d); });
    else startRecording((b, d) => { void gradeWhole(b, "after", d); });
    if (pendingStopRef.current) { dbg("deferred stop (record) → stopping now"); stopRecording(); readModeRef.current = "idle"; }
  }
  function endRead() {
    const m = readModeRef.current;
    if (m === "streaming") { void stopStream(); return; }
    if (m === "recording") { readModeRef.current = "idle"; stopRecording(); return; }
    // Tapped "done" before the mic/SDK finished starting — defer the stop.
    dbg("stop tapped while starting - deferring");
    pendingStopRef.current = true;
  }

  // Echo reading: Luna models the correct pronunciation of the line (drill) or
  // the whole passage, so the child can hear it right, then read it themselves.
  function listen() {
    if (mode !== "idle") return;
    const text = phase === "drill" ? sentences[idx] : passage.text;
    if (!text?.trim()) return;
    unlockAudio();
    setMode("speaking");
    setCaption("Listen carefully…");
    speakQueued(text, () => {
      setMode("idle");
      setCaption(phase === "drill" ? "Now you try - tap me and read the line." : "Now you read it - tap me.");
    });
  }

  const busy = mode === "thinking" || mode === "speaking";
  // Hidden on the intro AND on the summary — the finish summary REPLACES the
  // story card (it was stacking below it, pushing the buttons off-screen).
  const showPassage = phase !== "intro" && phase !== "done" && !preparing;
  const micLabel = mode === "listening" ? "Listening… (tap if done)"
    : phase === "drill" ? "Tap to read this line" : "Tap to read the story";

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, ...(phase === "done" && !preparing ? { minHeight: "calc(100dvh - 200px)", justifyContent: "center" } : {}) }}>
      <style>{`@keyframes lunaCarrotPop{0%{transform:scale(1)}45%{transform:scale(1.35)}100%{transform:scale(1)}}`}</style>
      {/* Passage (hidden on the intro screen) */}
      {showPassage && (
        <div style={{ width: "100%", borderRadius: 22, border: "2px solid #ddd6fe", background: "linear-gradient(135deg,#f5f3ff,#ffffff 60%,#fdf2f8)", padding: "16px 20px", boxShadow: "0 10px 40px -18px rgba(49,46,129,.25)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, minHeight: 22 }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "#7c3aed" }}>
              {phase === "building" ? "Making your story…"
                : phase === "overall1" ? "First, the whole story"
                  : phase === "drill" ? `Line ${Math.min(idx + 1, sentences.length)} of ${sentences.length}`
                    : phase === "overall2" ? "One more time - the whole story"
                      : "How you read it"}
            </span>
            {sessionCarrots > 0 && (
              <span key={sessionCarrots} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 800, color: "#c2410c", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 999, padding: "4px 12px", animation: "lunaCarrotPop .55s cubic-bezier(0.34,1.56,0.64,1)", fontVariantNumeric: "tabular-nums" }}>
                <Carrot className="h-4 w-4" strokeWidth={2.4} />
                +{carrotShown}
              </span>
            )}
          </div>
          {wordLesson ? (
            // Word-lesson takeover: ONE big word, karaoke-underlined chunk by
            // chunk as its phoneme plays (segIdx). Replaces the story text so
            // the kid focuses on exactly this word.
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 150, padding: "18px 0 10px" }}>
              <div style={{ fontFamily: BALOO, fontWeight: 800, fontSize: 64, lineHeight: 1.1, letterSpacing: 2, color: "#18181b" }}>
                {wordLesson.segs.map((sg, i) => {
                  const active = wordLesson.segIdx === i;
                  const wholeWord = wordLesson.segIdx >= wordLesson.segs.length;
                  const seen = wordLesson.segIdx > i || wholeWord;
                  return (
                    <span
                      key={i}
                      style={{
                        display: "inline-block",
                        padding: "0 3px",
                        color: active || wholeWord ? "#6d28d9" : seen ? "#7c3aed" : "#18181b",
                        borderBottom: active ? "6px solid #7c3aed" : seen ? "6px solid #ddd6fe" : "6px solid transparent",
                        borderRadius: 2,
                        transform: active ? "scale(1.12)" : "scale(1)",
                        transition: "color .2s ease, border-color .2s ease, transform .2s ease",
                      }}
                    >
                      {sg.graph}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : (
            <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontSize: 21, lineHeight: 1.9, color: "#18181b", overflowWrap: "break-word", wordBreak: "break-word" }}>
              {words.flatMap((w, i) => [
                <span key={i} data-w={i} style={{ display: "inline-block", borderRadius: 6, padding: "0 2px", marginRight: 2, opacity: 0 }}>{w}</span>,
                // Real space text node between word spans so the passage reads
                // correctly AND copies with spaces (the karaoke spans alone had
                // only CSS gaps, so copied text jammed to "Acathadahat").
                " ",
              ])}
            </p>
          )}
          {lastHeard && phase === "drill" && (
            <div style={{ marginTop: 10, fontSize: 12.5, color: "#9a3412", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "6px 10px" }}>
              I heard: <span style={{ fontStyle: "italic" }}>&ldquo;{lastHeard}&rdquo;</span>
            </div>
          )}
        </div>
      )}

      {/* Luna + controls */}
      {(preparing || phase !== "done") ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div ref={orbWrapRef} style={{ position: "relative", width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LunaOrb mode={mode} analyser={mode === "listening" ? analyser : null} onTap={phase === "intro" ? undefined : onTap} size={180} />
            <div ref={sparksHostRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
            {/* Readee sidekick — the CHILD'S bunny (their equipped skin),
                SUPPLEMENTAL to the orb: absolutely positioned so it never
                pushes the orb off-center, tucked to its right. Claps on a
                correct line, dances at the finish. */}
            <div style={{ position: "absolute", right: -92, bottom: -6, width: 100, height: 112, pointerEvents: "none" }}>
              {bunnyRx
                ? <BunnyReaction outfitId={childOutfitId ?? "classic"} state={bunnyRx} />
                : <Bunny outfitId={childOutfitId ?? "classic"} />}
            </div>
          </div>
          {(preparing || phase !== "intro") && (
            <div style={{ minHeight: 58, display: "flex", alignItems: "center", justifyContent: "center", maxWidth: 470, padding: "0 8px" }}>
              <p style={{ margin: 0, textAlign: "center", fontFamily: BALOO, fontSize: 19, lineHeight: 1.35, fontWeight: 700, color: "#18181b" }}>{caption}</p>
            </div>
          )}

          {preparing || phase === "building" ? null : phase === "intro" ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 72 }}>
              <button type="button" onClick={startFlow} disabled={preparing}
                style={{ display: "inline-flex", alignItems: "center", gap: 10, border: "none", borderRadius: 999, padding: "20px 56px", fontFamily: BALOO, fontSize: 25, fontWeight: 800, color: "#fff", background: "#4338ca", boxShadow: "0 14px 36px -8px rgba(67,56,202,.5)", cursor: preparing ? "default" : "pointer", opacity: preparing ? 0.75 : 1 }}>
                <Play className="h-6 w-6" fill="#fff" stroke="none" /> {preparing ? "Getting your story…" : "Let's Start"}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {mode === "idle" && (
                <button type="button" onClick={listen} title="Hear it read correctly"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "2px solid #4338ca", background: "#fff", color: "#4338ca", borderRadius: 999, padding: "10px 18px", fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
                  <Volume2 className="h-4 w-4" /> Listen
                </button>
              )}
              <button type="button" onClick={onTap} disabled={busy}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "none", borderRadius: 999, padding: "12px 26px", fontFamily: "'Nunito',sans-serif", fontSize: 15, fontWeight: 800, color: "#fff", background: mode === "listening" ? "#dc2626" : "#4338ca", boxShadow: "0 10px 40px -12px rgba(49,46,129,.45)", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1 }}>
                {micLabel}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          {/* Quiz-style finish summary (mirrors the Daily Readee results):
              bunny + stars + score + per-line review + carrots. */}
          {(() => {
            const lines = lineResultsRef.current;
            const okCount = lines.filter((l) => l.ok).length;
            const total = Math.max(1, lines.length);
            const pct = statsRef.current.wt > 0 ? Math.round((statsRef.current.wc / statsRef.current.wt) * 100) : 0;
            const title = okCount === total ? "Perfect read!" : okCount >= Math.ceil(total / 2) ? `Nice reading today, ${name}!` : "Good practicing - let's read it again!";
            const bunnyState: ReactionState = okCount >= Math.ceil((total * 2) / 3) ? "correct" : "incorrect";
            return (
              <div style={{ width: "100%", borderRadius: 22, border: "1px solid #ddd6fe", background: "#fff", padding: "22px 20px", boxShadow: "0 10px 40px -12px rgba(49,46,129,.15)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{ width: 140, height: 152 }}>
                  <BunnyReaction outfitId={childOutfitId ?? "classic"} state={bunnyState} />
                </div>
                <div style={{ marginTop: 6, display: "flex", gap: 4 }}>
                  {[1, 2, 3].map((n) => {
                    const filled = okCount / total >= n / 3;
                    return <Star key={n} className="h-[26px] w-[26px]" style={{ color: filled ? "#f59e0b" : "#e4e4e7", fill: filled ? "#f59e0b" : "#e4e4e7" }} strokeWidth={1.5} />;
                  })}
                </div>
                <div style={{ marginTop: 8, fontFamily: BALOO, fontSize: 22, fontWeight: 800, color: "#18181b" }}>{title}</div>
                <div style={{ marginTop: 2, fontSize: 14, color: "#71717a" }}>
                  You read {okCount} of {total} lines perfectly · <b style={{ color: "#6d28d9" }}>{pct}%</b> of words right
                </div>
                <div style={{ marginTop: 14, width: "100%", display: "flex", flexDirection: "column", gap: 6, textAlign: "left" }}>
                  {lines.map((l, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 10, padding: "8px 10px", background: l.ok ? "#ecfdf5" : "#fef2f2" }}>
                      {l.ok ? <Check className="h-3.5 w-3.5" style={{ color: "#059669", flexShrink: 0 }} strokeWidth={3} /> : <XIcon className="h-3.5 w-3.5" style={{ color: "#dc2626", flexShrink: 0 }} strokeWidth={3} />}
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#71717a", flexShrink: 0 }}>Line {i + 1}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "#3f3f46", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.text}</span>
                    </div>
                  ))}
                </div>
                {sessionCarrots > 0 && (
                  <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, background: "#d1fae5", color: "#047857", padding: "8px 20px", fontSize: 15, fontWeight: 800 }}>
                    <Carrot className="h-4 w-4" strokeWidth={2} /> +{sessionCarrots} carrots
                  </div>
                )}
                {statsRef.current.trickyWords.size > 0 && (
                  <p style={{ margin: "10px 0 0", fontSize: 13, color: "#3f3f46" }}>
                    Words to keep practicing: <b style={{ color: "#6d28d9" }}>{Array.from(statsRef.current.trickyWords).slice(0, 3).join(", ")}</b>
                  </p>
                )}
              </div>
            );
          })()}
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={() => beginBuild(passage)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, border: "1px solid #ddd6fe", background: "#fff", color: "#6d28d9", padding: "11px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              <RotateCcw className="h-4 w-4" /> Read it again
            </button>
            <button type="button" onClick={newPassage}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, border: "none", background: "#4338ca", color: "#fff", padding: "11px 20px", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
              <Shuffle className="h-4 w-4" /> New story
            </button>
          </div>
        </div>
      )}

      {err && <p style={{ textAlign: "center", color: "#dc2626", fontWeight: 700, fontSize: 14 }}>{err}</p>}

      {debug && (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          {engine && (
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: engine === "azure" ? "#047857" : "#a16207", background: engine === "azure" ? "#ecfdf5" : "#fefce8", border: `1px solid ${engine === "azure" ? "#a7f3d0" : "#fde68a"}`, borderRadius: 999, padding: "4px 12px" }}>
              engine: {engine}
            </div>
          )}
          {debugWords.length > 0 && (
            <div style={{ width: "100%", maxWidth: 560, display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", fontFamily: "ui-monospace,Menlo,monospace", fontSize: 12 }}>
              {debugWords.map((d, i) => {
                const bad = d.err !== "None" || d.acc < ACC_TRICKY || (d.ph != null && d.ph < PHONEME_TRICKY);
                return (
                  <span key={i} style={{ padding: "2px 7px", borderRadius: 6, background: bad ? "#fef2f2" : "#f0fdf4", color: bad ? "#b91c1c" : "#166534", border: `1px solid ${bad ? "#fecaca" : "#bbf7d0"}` }}>
                    {d.word} <b>{d.acc}</b>{d.ph != null ? ` ph${d.ph}${d.worst ? `/${d.worst}` : ""}` : ""}{d.err !== "None" ? ` ${d.err}` : ""}
                  </span>
                );
              })}
            </div>
          )}
          {dbgLog.length > 0 && (
            <div style={{ width: "100%", maxWidth: 560, fontFamily: "ui-monospace,Menlo,monospace", fontSize: 11, color: "#3f3f46", background: "#f4f4f5", border: "1px solid #e4e4e7", borderRadius: 8, padding: "6px 10px", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
              {dbgLog.map((l, i) => <div key={i}>{l}</div>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#047857" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#18181b", fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}

