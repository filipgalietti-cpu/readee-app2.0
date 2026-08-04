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
import { Shuffle, Trophy, RotateCcw, Play, Volume2 } from "lucide-react";
import LunaOrb, { type LunaMode } from "./LunaOrb";

type Passage = { grade: string; title: string; text: string };
type Annotation = { word: string; status: string; heard?: string };
type Grade = {
  wordAnnotations: Annotation[];
  wordsTotal: number;
  wordsCorrect: number;
  durationSeconds: number;
  disfluent?: boolean;
  heardTranscript?: string;
  coach?: string;
};
type Phase = "intro" | "building" | "overall1" | "drill" | "overall2" | "done";
type WordInfo = { words: string[]; sents: string[]; wSent: number[] };
type OverallScore = { wcpm: number; accuracy: number };

const SERIF = 'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif';
const BALOO = "'Baloo 2','Nunito',sans-serif";
const SILENT = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA=";
const CLIP_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio/luna`;
// Variant pools so no feedback line ever feels one-dimensional.
const PRAISE_COUNT = 12;   // praise-1..12   (clean read)
const SMOOTH_COUNT = 4;    // smooth-1..4    (fluency retry)
const GOODTRY_COUNT = 4;   // goodtry-1..4   (2nd attempt)
// Spoken feedback clips (praise/smooth/goodtry) are pre-recorded; the wait
// sound + reveal animations are synthesized. Warm the cache for the clips.
const PRELOAD_CLIPS = [
  ...Array.from({ length: PRAISE_COUNT }, (_, i) => `praise-${i + 1}`),
  ...Array.from({ length: SMOOTH_COUNT }, (_, i) => `smooth-${i + 1}`),
  ...Array.from({ length: GOODTRY_COUNT }, (_, i) => `goodtry-${i + 1}`),
];
const rand = (n: number) => Math.floor(Math.random() * n);

function splitSentences(text: string): string[] {
  return (text.match(/[^.!?]+[.!?]*/g) ?? [text]).map((s) => s.trim()).filter(Boolean);
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
}: {
  childId: string;
  childName: string;
  passages: Passage[];
}) {
  const name = (childName || "").trim() || "friend";
  const [pIdx, setPIdx] = useState(0);
  const [override, setOverride] = useState<Passage | null>(null);
  const passage = override ?? passages[pIdx] ?? passages[0];
  const [sentences, setSentences] = useState<string[]>(() => splitSentences((passages[0] ?? { text: "" }).text));
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
  const [err, setErr] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [lastHeard, setLastHeard] = useState<string | null>(null);
  const recStartRef = useRef(0);

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef(false);
  const onBlobRef = useRef<(b: Blob, durSec: number) => void>(() => {});
  const idxRef = useRef(0);
  const attemptRef = useRef(0);
  const phaseRef = useRef<Phase>("intro");
  // Per-word status: "pending" | "correct" | "tricky" — styled imperatively so
  // the reveal/scan animations survive React re-renders.
  const wordStateRef = useRef<string[]>([]);
  const animatingRef = useRef(false); // true during build reveal / grade scan
  const statsRef = useRef({ trickyWords: new Set<string>(), afterGrade: null as Grade | null });
  // Sound + celebration engine (synthesized via Web Audio, ported from the Luna
  // Full Flow design): "thinking bubbles" + praise chime + word ticks, and
  // confetti / sparks around the orb. Processing sound always stops before any
  // speech so it never overlaps the TTS.
  const sfxCtxRef = useRef<AudioContext | null>(null);
  const verbRef = useRef<ConvolverNode | null>(null);
  const bubblingRef = useRef(false);
  const sparkingRef = useRef(false);
  const buildingRef = useRef(false);
  const blipNRef = useRef(0);
  const sfxTimersRef = useRef<number[]>([]);
  const sparksHostRef = useRef<HTMLDivElement | null>(null);
  const orbWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { idxRef.current = idx; }, [idx]);
  useEffect(() => { attemptRef.current = attempt; }, [attempt]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  // Re-apply word styling whenever the phase or current drill line changes
  // (skip while an animation owns the word styles imperatively).
  useEffect(() => { if (phase !== "building" && !animatingRef.current) styleWords(); });
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = "auto";
    // Warm the browser cache for the pre-recorded clips so they play instantly.
    PRELOAD_CLIPS.forEach((k) => { try { const a = new Audio(); a.preload = "auto"; a.src = `${CLIP_BASE}/${k}.mp3`; } catch { /* ignore */ } });
    return () => { cleanupMic(); stopProcessing(); clearSfxTimers(); stopAudio(); try { void sfxCtxRef.current?.close(); } catch { /* ignore */ } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanupMic() {
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch { /* ignore */ }
    try { void ctxRef.current?.close(); } catch { /* ignore */ }
    streamRef.current = null; ctxRef.current = null; setAnalyser(null);
  }
  function stopAudio() {
    try { if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; } } catch { /* ignore */ }
    try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
  }
  function unlockAudio() {
    if (unlockedRef.current || !audioRef.current) return;
    unlockedRef.current = true;
    try { audioRef.current.src = SILENT; void audioRef.current.play().then(() => audioRef.current?.pause()).catch(() => {}); } catch { /* ignore */ }
  }
  // Pre-recorded clips (praise, smooth, good-try) — instant, deterministic,
  // no TTS round-trip. This is the speed win + it fixes spoken/written mismatch.
  function playCached(key: string, onDone: () => void) {
    const a = audioRef.current;
    if (!a) { window.setTimeout(onDone, 500); return; }
    stopAudio();
    a.src = `${CLIP_BASE}/${key}.mp3`;
    a.onended = onDone;
    a.play().catch(() => window.setTimeout(onDone, 700));
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
  // little sparks drifting off the orb during a wait
  function sparkLoop() {
    const host = sparksHostRef.current;
    if (sparkingRef.current && host) {
      const s = document.createElement("div");
      const ang = Math.random() * Math.PI * 2, d = 65 + Math.random() * 55;
      const dx = Math.cos(ang) * d, dy = Math.sin(ang) * d;
      s.style.cssText = `position:absolute;left:50%;top:50%;width:8px;height:8px;border-radius:2px;background:${Math.random() < 0.5 ? "#a78bfa" : "#fbbf24"};transform:rotate(45deg)`;
      host.appendChild(s);
      s.animate([
        { transform: "translate(0,0) scale(0)", opacity: 0 },
        { transform: "translate(0,0) scale(1)", opacity: 1, offset: 0.2 },
        { transform: `translate(${dx}px,${dy}px) scale(1)`, opacity: 0 },
      ], { duration: 1000, easing: "ease-out" });
      sfxTimer(1100, () => s.remove());
    }
    if (sparkingRef.current) sfxTimer(140, sparkLoop);
  }
  function startProcessing() { startBubbles(); sparkingRef.current = true; sparkLoop(); }
  function stopProcessing() { stopBubbles(); sparkingRef.current = false; }

  // Cached feedback: stop the processing sound, THEN speak — never overlapping.
  function playCachedQueued(key: string, onStart: () => void, onDone: () => void) {
    stopProcessing(); onStart(); playCached(key, onDone);
  }
  // Live TTS feedback: processing keeps going during the fetch, then stops the
  // instant the audio is ready so speech plays alone.
  function speakQueued(text: string, onDone: () => void, onStart?: () => void) {
    fetch("/api/luna/speak", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) })
      .then((r) => r.json())
      .then((j) => {
        stopProcessing(); onStart?.();
        const a = audioRef.current;
        if (a && j?.ok && j.audioUrl) { stopAudio(); a.src = j.audioUrl; a.onended = onDone; a.play().catch(() => window.setTimeout(onDone, 1600)); }
        else window.setTimeout(onDone, 1600);
      })
      .catch(() => { stopProcessing(); onStart?.(); window.setTimeout(onDone, 1200); });
  }

  // Varied captions so the on-screen line matches the audio variety.
  const praiseCap = () => [`Great reading, ${name}!`, `Wonderful, ${name}!`, `You nailed it, ${name}!`, `Awesome work, ${name}!`, `Beautiful reading, ${name}!`][rand(5)];
  const smoothCap = () => [`Take your time, ${name} — nice and smooth.`, `Slow and steady, ${name}.`, `Let's read it smooth this time, ${name}.`][rand(3)];
  const goodtryCap = () => [`Good try, ${name}! Let's keep going.`, `Nice effort, ${name}!`, `You're getting it, ${name}!`][rand(3)];

  async function startRecording(onBlob: (b: Blob, durSec: number) => void) {
    unlockAudio();
    stopProcessing(); stopAudio(); animatingRef.current = false; // never let old coaching/processing play over a fresh read
    setErr(null);
    onBlobRef.current = onBlob;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser(); an.fftSize = 512; an.smoothingTimeConstant = 0.75;
      src.connect(an); setAnalyser(an);
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        // Measure the ACTUAL recording length client-side — the model's
        // duration estimate is unreliable and was giving 0 WCPM.
        const durSec = Math.max(0.5, (Date.now() - recStartRef.current) / 1000);
        cleanupMic();
        onBlobRef.current(blob, durSec);
      };
      recorderRef.current = rec;
      rec.start();
      recStartRef.current = Date.now();
      setMode("listening");
    } catch {
      setErr("I couldn't turn on the mic. Check the mic permission and try again.");
      setMode("idle");
    }
  }
  function stopRecording() {
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    setMode("thinking");
    setCaption("Let me listen…");
    // "Thinking bubbles" + orb sparks fill the grade round-trip; they stop the
    // instant feedback is ready so speech never overlaps them.
    startProcessing();
  }

  async function postGrade(text: string, blob: Blob): Promise<Grade> {
    const fd = new FormData();
    fd.append("audio", blob, "read.webm");
    fd.append("childId", childId);
    fd.append("sentenceText", text);
    fd.append("gradeLevel", passage.grade);
    const r = await fetch("/api/luna/grade", { method: "POST", body: fd });
    const json = await r.json();
    if (!r.ok || !json.ok) throw new Error(json.error ?? `HTTP ${r.status}`);
    return json.analysis as Grade;
  }

  function toScore(g: Grade, durSec: number): OverallScore {
    return {
      wcpm: durSec > 0 ? g.wordsCorrect / (durSec / 60) : 0,
      accuracy: g.wordsTotal > 0 ? (g.wordsCorrect / g.wordsTotal) * 100 : 0,
    };
  }

  async function gradeWhole(blob: Blob, which: "before" | "after", durSec: number) {
    try {
      const g = await postGrade(passage.text, blob);
      const statusOf = statusMap(g.wordAnnotations, 0);
      g.wordAnnotations.forEach((a) => { if (a.status === "missed" || a.status === "substituted") { const w = a.word.replace(/[^A-Za-z'-]/g, ""); if (w) statsRef.current.trickyWords.add(w); } });
      if (which === "before") {
        setBefore(toScore(g, durSec));
        // Luna "reads back" the whole story word-by-word, THEN moves to drilling.
        scanReveal(0, words.length - 1, statusOf, () => {
          const line = `Nice first read, ${name}! Now let's practice it, one line at a time.`;
          speakQueued(line, () => {
            wordStateRef.current = words.map(() => "pending");
            setPhase("drill"); setIdx(0); setAttempt(0); setMode("idle"); setCaption("Tap me and read the first line.");
          }, () => { setMode("speaking"); setCaption(line); });
        });
      } else {
        setAfter(toScore(g, durSec));
        statsRef.current.afterGrade = g;
        // Scan the final read, then a BIG celebration + spoken cheer + results.
        scanReveal(0, words.length - 1, statusOf, () => {
          playCachedQueued(`praise-${1 + rand(PRAISE_COUNT)}`, () => { setMode("speaking"); setCaption(`Amazing, ${name}!`); celebrate(true); }, () => finishSession());
        });
      }
    } catch (e: unknown) {
      stopProcessing();
      setErr(e instanceof Error ? e.message : "Something went wrong.");
      setMode("idle");
      setCaption("Let's try that again — tap me when you're ready.");
    }
  }

  async function gradeSentence(blob: Blob) {
    const curIdx = idxRef.current;
    const curAttempt = attemptRef.current;
    try {
      const a = await postGrade(sentences[curIdx], blob);
      const from = wSent.indexOf(curIdx), to = wSent.lastIndexOf(curIdx);
      const lo = from < 0 ? 0 : from, hi = to < 0 ? words.length - 1 : to;
      const statusOf = statusMap(a.wordAnnotations, lo);
      const tricky = a.wordAnnotations
        .filter((w) => w.status === "missed" || w.status === "substituted")
        .map((w) => w.word.replace(/[^A-Za-z'-]/g, "")).filter(Boolean);
      const hasError = a.wordsCorrect < a.wordsTotal || tricky.length > 0 || !!a.disfluent;
      const willRetry = hasError && curAttempt === 0;
      if (!willRetry) tricky.slice(0, 5).forEach((w) => statsRef.current.trickyWords.add(w));
      // Surface what Luna actually heard, so the mismatch is visible.
      setLastHeard(hasError && a.heardTranscript ? a.heardTranscript : null);

      // Scan the line word-by-word (real result), THEN coach.
      scanReveal(lo, hi, statusOf, () => {
        if (!hasError) {
          setLastHeard(null);
          playCachedQueued(`praise-${1 + rand(PRAISE_COUNT)}`, () => { setMode("speaking"); setCaption(praiseCap()); celebrate(false); }, () => proceed(false));
        } else if (willRetry) {
          const wds = tricky.slice(0, 3);
          if (wds.length >= 1) {
            // DECODING → live TTS to sound out the SPECIFIC word(s).
            const coaching = wds.length >= 2
              ? `Let's sound out ${wds.slice(0, -1).map((w) => `"${w}"`).join(", ")} and "${wds[wds.length - 1]}" — say each sound slowly. Then read the whole line again.`
              : `Let's sound out "${wds[0]}" — say each sound slowly, then read the whole line again.`;
            speakQueued(coaching, () => proceed(true), () => { setMode("speaking"); setCaption(coaching); });
          } else {
            // FLUENCY (a stutter, words fine) → pre-recorded "smooth" (1 of 4).
            playCachedQueued(`smooth-${1 + rand(SMOOTH_COUNT)}`, () => { setMode("speaking"); setCaption(smoothCap()); }, () => proceed(true));
          }
        } else {
          // Second attempt still imperfect → "good try" (1 of 4) + advance.
          playCachedQueued(`goodtry-${1 + rand(GOODTRY_COUNT)}`, () => { setMode("speaking"); setCaption(goodtryCap()); }, () => proceed(false));
        }
      });
    } catch (e: unknown) {
      stopProcessing();
      setErr(e instanceof Error ? e.message : "Something went wrong.");
      setMode("idle"); setCaption("Let's try that line again — tap me when you're ready.");
    }
  }

  function proceed(willRetry: boolean) {
    if (willRetry) {
      // Clear this line's colors so the re-read scans fresh.
      const s = idxRef.current;
      const from = wSent.indexOf(s), to = wSent.lastIndexOf(s);
      for (let i = from; i <= to; i++) if (i >= 0) wordStateRef.current[i] = "pending";
      setAttempt(1); setMode("idle"); setCaption("Let's read that line one more time — tap me.");
      styleWords();
      return;
    }
    setAttempt(0);
    setLastHeard(null);
    const next = idxRef.current + 1;
    if (next >= sentences.length) {
      const line = `Great practicing, ${name}! Now read me the whole story one more time.`;
      setMode("speaking"); setCaption(line);
      speakQueued(line, () => { wordStateRef.current = words.map(() => "pending"); setPhase("overall2"); setMode("idle"); setCaption("Tap me and read the whole story."); });
    } else {
      setIdx(next); setMode("idle"); setCaption("Nice! Tap me to read the next line.");
    }
  }

  function finishSession() {
    setPhase("done");
    setMode("idle");
    setCaption(`You did it, ${name}! Look how much you improved.`);
    const g = statsRef.current.afterGrade;
    void fetch("/api/luna/session-complete", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childId, passageText: passage.text, gradeLevel: passage.grade,
        wordAnnotations: g?.wordAnnotations ?? [],
        wordsTotal: g?.wordsTotal ?? 0, wordsCorrect: g?.wordsCorrect ?? 0,
        durationSeconds: g?.durationSeconds ?? 0,
        wcpm: after?.wcpm ?? 0,
        targetPatterns: Array.from(statsRef.current.trickyWords),
      }),
    }).catch(() => {});
  }

  // Fresh content each session: try to generate a brand-new grade-appropriate
  // story; fall back to a random curated one (so we're never "stuck" on the
  // same passage — and it's not always "I have a cat").
  async function loadFreshPassage(): Promise<Passage> {
    const grade = passage.grade;
    try {
      const r = await fetch("/api/luna/passage", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, gradeLevel: grade }),
      });
      const j = await r.json();
      if (r.ok && j.ok && j.passage?.text) return j.passage as Passage;
    } catch { /* fall through to curated */ }
    const n = passages.length > 1 ? Math.floor(Math.random() * passages.length) : 0;
    return passages[n] ?? passages[0];
  }

  // Reveal a story: words drift in blurry, then each sentence snaps into focus
  // (with word ticks + bubbles), then we start the first whole-story read.
  async function beginBuild(p: Passage) {
    buildingRef.current = false;
    animatingRef.current = false;
    stopAudio();
    if (sparksHostRef.current) sparksHostRef.current.innerHTML = "";
    statsRef.current = { trickyWords: new Set(), afterGrade: null };
    setIdx(0); setAttempt(0); setBefore(null); setAfter(null); setErr(null); setLastHeard(null);
    const info = computeWords(p.text);
    wordStateRef.current = info.words.map(() => "pending");
    setOverride(p);
    setSentences(info.sents);
    setPreparing(false);
    setPhase("building"); setMode("thinking"); setCaption("Here's your story!");
    startProcessing();
    await new Promise<void>((r) => sfxTimer(90, r)); // let the word spans render
    await runBuildReveal(info);
    stopProcessing();
    setPhase("overall1"); setMode("idle"); setCaption("Read me the whole story out loud!");
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
    if (mode === "listening") { stopRecording(); return; }
    if (mode !== "idle") return;
    if (phase === "overall1") startRecording((b, d) => { void gradeWhole(b, "before", d); });
    else if (phase === "drill") startRecording((b) => { void gradeSentence(b); });
    else if (phase === "overall2") startRecording((b, d) => { void gradeWhole(b, "after", d); });
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
      setCaption(phase === "drill" ? "Now you try — tap me and read the line." : "Now you read it — tap me.");
    });
  }

  const busy = mode === "thinking" || mode === "speaking";
  const showPassage = phase !== "intro" && !preparing;
  const micLabel = mode === "listening" ? "Tap when you're done"
    : phase === "drill" ? "Tap to read this line" : "Tap to read the story";

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      {/* Passage (hidden on the intro screen) */}
      {showPassage && (
        <div style={{ width: "100%", borderRadius: 22, border: "2px solid #ddd6fe", background: "linear-gradient(135deg,#f5f3ff,#ffffff 60%,#fdf2f8)", padding: "16px 20px", boxShadow: "0 10px 40px -18px rgba(49,46,129,.25)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, minHeight: 22 }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "#7c3aed" }}>
              {phase === "building" ? "Making your story…"
                : phase === "overall1" ? "First, the whole story"
                  : phase === "drill" ? `Line ${Math.min(idx + 1, sentences.length)} of ${sentences.length}`
                    : phase === "overall2" ? "One more time — the whole story"
                      : "How you read it"}
            </span>
          </div>
          <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontSize: 21, lineHeight: 1.9, color: "#18181b", overflowWrap: "break-word", wordBreak: "break-word" }}>
            {words.map((w, i) => (
              <span key={i} data-w={i} style={{ display: "inline-block", borderRadius: 6, padding: "0 2px", marginRight: 3, opacity: 0 }}>{w}</span>
            ))}
          </p>
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
          </div>
          {(preparing || phase !== "intro") && (
            <div style={{ minHeight: 58, display: "flex", alignItems: "center", justifyContent: "center", maxWidth: 470, padding: "0 8px" }}>
              <p style={{ margin: 0, textAlign: "center", fontFamily: BALOO, fontSize: 19, lineHeight: 1.35, fontWeight: 700, color: "#18181b" }}>{caption}</p>
            </div>
          )}

          {preparing || phase === "building" ? null : phase === "intro" ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 10 }}>
              <button type="button" onClick={startFlow} disabled={preparing}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "none", borderRadius: 999, padding: "16px 40px", fontFamily: BALOO, fontSize: 22, fontWeight: 800, color: "#fff", background: "#4338ca", boxShadow: "0 12px 30px -8px rgba(67,56,202,.5)", cursor: preparing ? "default" : "pointer", opacity: preparing ? 0.75 : 1 }}>
                <Play className="h-5 w-5" fill="#fff" stroke="none" /> {preparing ? "Getting your story…" : "Let's Start"}
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
          <div style={{ width: "100%", borderRadius: 22, border: "1px solid #bbf7d0", background: "linear-gradient(135deg,#ecfdf5,#f5f3ff)", padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <Trophy className="h-8 w-8" style={{ color: "#059669" }} />
              <div style={{ display: "flex", gap: 22 }}>
                <Stat label="First read" value={`${(before?.wcpm ?? 0).toFixed(0)} WCPM`} />
                <Stat label="Final read" value={`${(after?.wcpm ?? 0).toFixed(0)} WCPM`} />
                <Stat label="Accuracy" value={`${(after?.accuracy ?? 0).toFixed(0)}%`} />
              </div>
            </div>
            {before && after && after.wcpm > before.wcpm && (
              <p style={{ margin: "12px 0 0", fontSize: 14, color: "#047857", fontWeight: 700 }}>
                You read {(after.wcpm - before.wcpm).toFixed(0)} words per minute faster — awesome!
              </p>
            )}
            {statsRef.current.trickyWords.size > 0 && (
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "#3f3f46" }}>
                Words to keep practicing: <b style={{ color: "#6d28d9" }}>{Array.from(statsRef.current.trickyWords).slice(0, 3).join(", ")}</b>.
              </p>
            )}
          </div>
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

