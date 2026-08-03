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

import { useEffect, useRef, useState } from "react";
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
type Phase = "intro" | "overall1" | "drill" | "overall2" | "done";
type OverallScore = { wcpm: number; accuracy: number };

const SERIF = 'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif';
const BALOO = "'Baloo 2','Nunito',sans-serif";
const SILENT = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA=";
const CLIP_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio/luna`;
// Variant pools so no feedback line ever feels one-dimensional.
const PRAISE_COUNT = 12;   // praise-1..12   (clean read)
const SMOOTH_COUNT = 4;    // smooth-1..4    (fluency retry)
const GOODTRY_COUNT = 4;   // goodtry-1..4   (2nd attempt)
// While we wait, a synthesized "bubble" loop (like ChatGPT's search sound)
// plays ALONE — it always stops before any speech, never under it. When the
// wait ends we speak the result (feedback, or the "here's your story" beat).
const PREP_LAND_COUNT = 3; // prep-land-1..3 (spoken "here's your story" beat)
const PRELOAD_CLIPS = [
  ...Array.from({ length: PRAISE_COUNT }, (_, i) => `praise-${i + 1}`),
  ...Array.from({ length: SMOOTH_COUNT }, (_, i) => `smooth-${i + 1}`),
  ...Array.from({ length: GOODTRY_COUNT }, (_, i) => `goodtry-${i + 1}`),
  ...Array.from({ length: PREP_LAND_COUNT }, (_, i) => `prep-land-${i + 1}`),
];
const rand = (n: number) => Math.floor(Math.random() * n);

function splitSentences(text: string): string[] {
  return (text.match(/[^.!?]+[.!?]*/g) ?? [text]).map((s) => s.trim()).filter(Boolean);
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

  const [phase, setPhase] = useState<Phase>("intro");
  const [idx, setIdx] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [mode, setMode] = useState<LunaMode>("idle");
  const [caption, setCaption] = useState("Ready to read with me?");
  const [results, setResults] = useState<Record<number, Annotation[]>>({});
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
  const statsRef = useRef({ trickyWords: new Set<string>(), afterGrade: null as Grade | null });
  // Synthesized "bubble" processing loop (Web Audio) — plays alone during a
  // wait, always stopped before any speech so it never overlaps the TTS.
  const bubbleCtxRef = useRef<AudioContext | null>(null);
  const bubbleTimerRef = useRef<number | null>(null);

  useEffect(() => { idxRef.current = idx; }, [idx]);
  useEffect(() => { attemptRef.current = attempt; }, [attempt]);
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = "auto";
    // Warm the browser cache for the pre-recorded clips so they play instantly.
    PRELOAD_CLIPS.forEach((k) => { try { const a = new Audio(); a.preload = "auto"; a.src = `${CLIP_BASE}/${k}.mp3`; } catch { /* ignore */ } });
    return () => { cleanupMic(); stopBubbles(); stopAudio(); try { void bubbleCtxRef.current?.close(); } catch { /* ignore */ } };
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

  // --- "Bubble" processing loop --------------------------------------------
  // The ChatGPT-style "looking something up" sound: quick watery bloops
  // synthesized live. Plays ALONE while we wait, then stopBubbles() is called
  // BEFORE any speech so the bubbles and the TTS never overlap.
  function startBubbles() {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = bubbleCtxRef.current ?? new AC();
      bubbleCtxRef.current = ctx;
      if (ctx.state === "suspended") void ctx.resume();
      if (bubbleTimerRef.current != null) return; // already bubbling
      const pitches = [430, 510, 600, 690, 560, 470, 640];
      let i = 0;
      const fire = () => {
        const c = bubbleCtxRef.current;
        if (!c) return;
        const now = c.currentTime;
        const base = pitches[i % pitches.length];
        i++;
        const o = c.createOscillator(); o.type = "sine";
        const g = c.createGain();
        o.connect(g); g.connect(c.destination);
        // quick upward "bloop" pitch pop + fast pluck envelope = a water droplet
        o.frequency.setValueAtTime(base, now);
        o.frequency.exponentialRampToValueAtTime(base * 1.7, now + 0.07);
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.1, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        o.start(now); o.stop(now + 0.18);
      };
      fire();
      bubbleTimerRef.current = window.setInterval(fire, 150);
    } catch { /* bubbles are an optional flourish; ignore failures */ }
  }
  function stopBubbles() {
    if (bubbleTimerRef.current != null) { window.clearInterval(bubbleTimerRef.current); bubbleTimerRef.current = null; }
  }

  // Cached feedback: stop the bubbles, THEN speak — never overlapping.
  function playCachedQueued(key: string, onStart: () => void, onDone: () => void) {
    stopBubbles(); onStart(); playCached(key, onDone);
  }
  // Live TTS feedback: bubbles keep going during the fetch (still "processing"),
  // then stop the instant the audio is ready so speech plays alone.
  function speakQueued(text: string, onDone: () => void, onStart?: () => void) {
    fetch("/api/luna/speak", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) })
      .then((r) => r.json())
      .then((j) => {
        stopBubbles(); onStart?.();
        const a = audioRef.current;
        if (a && j?.ok && j.audioUrl) { stopAudio(); a.src = j.audioUrl; a.onended = onDone; a.play().catch(() => window.setTimeout(onDone, 1600)); }
        else window.setTimeout(onDone, 1600);
      })
      .catch(() => { stopBubbles(); onStart?.(); window.setTimeout(onDone, 1200); });
  }

  // Varied captions so the on-screen line matches the audio variety.
  const praiseCap = () => [`Great reading, ${name}!`, `Wonderful, ${name}!`, `You nailed it, ${name}!`, `Awesome work, ${name}!`, `Beautiful reading, ${name}!`][rand(5)];
  const smoothCap = () => [`Take your time, ${name} — nice and smooth.`, `Slow and steady, ${name}.`, `Let's read it smooth this time, ${name}.`][rand(3)];
  const goodtryCap = () => [`Good try, ${name}! Let's keep going.`, `Nice effort, ${name}!`, `You're getting it, ${name}!`][rand(3)];

  async function startRecording(onBlob: (b: Blob, durSec: number) => void) {
    unlockAudio();
    stopBubbles(); stopAudio(); // never let old coaching/bubbles play over a fresh read
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
    // ChatGPT-style "processing" bubbles fill the grade round-trip; they stop
    // the instant feedback is ready so speech never overlaps them.
    startBubbles();
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
      if (which === "before") {
        setBefore(toScore(g, durSec));
        const line = `Nice first read, ${name}! Now let's practice it, one line at a time.`;
        speakQueued(line, () => { setPhase("drill"); setIdx(0); setAttempt(0); setResults({}); setMode("idle"); setCaption("Tap me and read the first line."); }, () => { setMode("speaking"); setCaption(line); });
      } else {
        setAfter(toScore(g, durSec));
        statsRef.current.afterGrade = g;
        // Land the final read on a spoken cheer (bridged by the filler), then
        // reveal the results.
        playCachedQueued(`praise-${1 + rand(PRAISE_COUNT)}`, () => { setMode("speaking"); setCaption(`Amazing, ${name}!`); }, () => finishSession());
      }
    } catch (e: unknown) {
      stopBubbles();
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
      setResults((prev) => ({ ...prev, [curIdx]: a.wordAnnotations }));
      const tricky = a.wordAnnotations
        .filter((w) => w.status === "missed" || w.status === "substituted")
        .map((w) => w.word.replace(/[^A-Za-z'-]/g, "")).filter(Boolean);
      const hasError = a.wordsCorrect < a.wordsTotal || tricky.length > 0 || !!a.disfluent;
      const willRetry = hasError && curAttempt === 0;
      if (!willRetry) tricky.slice(0, 5).forEach((w) => statsRef.current.trickyWords.add(w));
      // Surface what Luna actually heard, so the mismatch is visible.
      setLastHeard(hasError && a.heardTranscript ? a.heardTranscript : null);

      if (!hasError) {
        // Clean read → pre-recorded praise (1 of 12), timed to the filler.
        setLastHeard(null);
        playCachedQueued(`praise-${1 + rand(PRAISE_COUNT)}`, () => { setMode("speaking"); setCaption(praiseCap()); }, () => proceed(false));
      } else if (willRetry) {
        const words = tricky.slice(0, 3);
        if (words.length >= 1) {
          // DECODING → live TTS to sound out the SPECIFIC word(s). The filler
          // keeps looping until the TTS is fetched, then hands off at a boundary.
          const coaching = words.length >= 2
            ? `Let's sound out ${words.slice(0, -1).map((w) => `"${w}"`).join(", ")} and "${words[words.length - 1]}" — say each sound slowly. Then read the whole line again.`
            : `Let's sound out "${words[0]}" — say each sound slowly, then read the whole line again.`;
          speakQueued(coaching, () => proceed(true), () => { setMode("speaking"); setCaption(coaching); });
        } else {
          // FLUENCY (a stutter, words fine) → pre-recorded "smooth" (1 of 4).
          playCachedQueued(`smooth-${1 + rand(SMOOTH_COUNT)}`, () => { setMode("speaking"); setCaption(smoothCap()); }, () => proceed(true));
        }
      } else {
        // Second attempt still imperfect → "good try" (1 of 4) + advance.
        playCachedQueued(`goodtry-${1 + rand(GOODTRY_COUNT)}`, () => { setMode("speaking"); setCaption(goodtryCap()); }, () => proceed(false));
      }
    } catch (e: unknown) {
      stopBubbles();
      setErr(e instanceof Error ? e.message : "Something went wrong.");
      setMode("idle"); setCaption("Let's try that line again — tap me when you're ready.");
    }
  }

  function proceed(willRetry: boolean) {
    if (willRetry) { setAttempt(1); setMode("idle"); setCaption("Let's read that line one more time — tap me."); return; }
    setAttempt(0);
    setLastHeard(null);
    const next = idxRef.current + 1;
    if (next >= sentences.length) {
      const line = `Great practicing, ${name}! Now read me the whole story one more time.`;
      setMode("speaking"); setCaption(line);
      speakQueued(line, () => { setPhase("overall2"); setMode("idle"); setCaption("Tap me and read the whole story."); });
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

  async function beginWith(p: Passage) {
    stopAudio();
    statsRef.current = { trickyWords: new Set(), afterGrade: null };
    setResults({}); setIdx(0); setAttempt(0); setBefore(null); setAfter(null); setErr(null);
    setOverride(p);
    setSentences(splitSentences(p.text));
    setPhase("overall1"); setMode("idle"); setCaption("Read me the whole story out loud!");
  }

  // Generate a fresh passage while the bubbles play (Luna "looking one up"),
  // then stop them and speak the "here's your story" beat — no overlap.
  async function prepareAndBegin() {
    unlockAudio();
    setPreparing(true);
    startBubbles();
    const p = await loadFreshPassage();
    setPreparing(false);
    stopBubbles();
    await new Promise<void>((resolve) => playCached(`prep-land-${1 + rand(PREP_LAND_COUNT)}`, resolve));
    await beginWith(p);
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
  const showPassage = phase !== "intro";
  const micLabel = mode === "listening" ? "Tap when you're done"
    : phase === "drill" ? "Tap to read this line" : "Tap to read the story";

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Passage (hidden on the intro screen) */}
      {showPassage && (
        <div style={{ borderRadius: 22, border: "2px solid #ddd6fe", background: "linear-gradient(135deg,#f5f3ff,#ffffff 60%,#fdf2f8)", padding: "16px 20px", boxShadow: "0 10px 40px -18px rgba(49,46,129,.25)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, minHeight: 22 }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "#7c3aed" }}>
              {phase === "overall1" ? "First, the whole story"
                : phase === "drill" ? `Line ${Math.min(idx + 1, sentences.length)} of ${sentences.length}`
                  : phase === "overall2" ? "One more time — the whole story"
                    : "How you read it"}
            </span>
          </div>
          <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontSize: 21, lineHeight: 1.7, color: "#18181b", overflowWrap: "break-word", wordBreak: "break-word" }}>
            {phase === "drill"
              ? sentences.map((sent, i) => {
                  const isCur = i === idx;
                  const finished = results[i] && i < idx;
                  return (
                    <span key={i} style={{ background: isCur ? "#ede9fe" : "transparent", borderRadius: 6, padding: isCur ? "2px 4px" : 0, color: !finished && !isCur ? "#a1a1aa" : "#18181b", marginRight: 4, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" } as React.CSSProperties}>
                      {finished ? results[i].map((a, j) => <Word key={j} a={a} />) : sent + " "}
                    </span>
                  );
                })
              : phase === "done" && statsRef.current.afterGrade
                ? statsRef.current.afterGrade.wordAnnotations.map((a, i) => <Word key={i} a={a} />)
                : passage.text}
          </p>
          {lastHeard && phase === "drill" && (
            <div style={{ marginTop: 10, fontSize: 12.5, color: "#9a3412", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "6px 10px" }}>
              I heard: <span style={{ fontStyle: "italic" }}>&ldquo;{lastHeard}&rdquo;</span>
            </div>
          )}
        </div>
      )}

      {/* Luna + controls */}
      {phase !== "done" ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <LunaOrb mode={mode} analyser={mode === "listening" ? analyser : null} onTap={phase === "intro" ? undefined : onTap} size={180} />
          {phase !== "intro" && (
            <div style={{ minHeight: 58, display: "flex", alignItems: "center", justifyContent: "center", maxWidth: 470, padding: "0 8px" }}>
              <p style={{ margin: 0, textAlign: "center", fontFamily: BALOO, fontSize: 19, lineHeight: 1.35, fontWeight: 700, color: "#18181b" }}>{caption}</p>
            </div>
          )}

          {phase === "intro" ? (
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
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
            <button type="button" onClick={() => beginWith(passage)}
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

function Word({ a }: { a: Annotation }) {
  const s = a.status;
  const style: React.CSSProperties =
    s === "correct" ? { color: "#047857" }
      : s === "self_corrected" ? { background: "#fef3c7", color: "#92400e", borderRadius: 4, padding: "0 3px" }
        : s === "substituted" ? { background: "#ffedd5", color: "#9a3412", borderRadius: 4, padding: "0 3px", textDecoration: "line-through" }
          : s === "missed" ? { background: "#fee2e2", color: "#991b1b", borderRadius: 4, padding: "0 3px", textDecoration: "line-through" }
            : { color: "#3f3f46" };
  return (
    <>
      <span style={{ ...style }} title={a.heard ? `Heard: "${a.heard}"` : ""}>{a.word}</span>{" "}
    </>
  );
}
