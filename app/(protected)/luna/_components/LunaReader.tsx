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
import { Shuffle, Trophy, RotateCcw, Play } from "lucide-react";
import LunaOrb, { type LunaMode } from "./LunaOrb";

type Passage = { grade: string; title: string; text: string };
type Annotation = { word: string; status: string; heard?: string };
type Grade = {
  wordAnnotations: Annotation[];
  wordsTotal: number;
  wordsCorrect: number;
  durationSeconds: number;
  disfluent?: boolean;
  coach?: string;
};
type Phase = "intro" | "overall1" | "drill" | "overall2" | "done";
type OverallScore = { wcpm: number; accuracy: number };

const SERIF = 'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif';
const BALOO = "'Baloo 2','Nunito',sans-serif";
const SILENT = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA=";

function splitSentences(text: string): string[] {
  return (text.match(/[^.!?]+[.!?]*/g) ?? [text]).map((s) => s.trim()).filter(Boolean);
}

export default function LunaReader({
  childId,
  passages,
}: {
  childId: string;
  childName: string;
  passages: Passage[];
}) {
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

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef(false);
  const onBlobRef = useRef<(b: Blob) => void>(() => {});
  const idxRef = useRef(0);
  const attemptRef = useRef(0);
  const statsRef = useRef({ trickyWords: new Set<string>(), afterGrade: null as Grade | null });

  useEffect(() => { idxRef.current = idx; }, [idx]);
  useEffect(() => { attemptRef.current = attempt; }, [attempt]);
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = "auto";
    return () => { cleanupMic(); stopAudio(); };
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
  function speak(text: string, onDone: () => void) {
    const a = audioRef.current;
    fetch("/api/luna/speak", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) })
      .then((r) => r.json())
      .then((j) => {
        if (a && j?.ok && j.audioUrl) { a.src = j.audioUrl; a.onended = onDone; a.play().catch(() => window.setTimeout(onDone, 1600)); }
        else window.setTimeout(onDone, 1600);
      })
      .catch(() => window.setTimeout(onDone, 1600));
  }

  async function startRecording(onBlob: (b: Blob) => void) {
    unlockAudio();
    stopAudio(); // never let old coaching play over a fresh read
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
      rec.onstop = () => { const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" }); cleanupMic(); onBlobRef.current(blob); };
      recorderRef.current = rec;
      rec.start();
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

  function toScore(g: Grade): OverallScore {
    return {
      wcpm: g.durationSeconds > 0 ? g.wordsCorrect / (g.durationSeconds / 60) : 0,
      accuracy: g.wordsTotal > 0 ? (g.wordsCorrect / g.wordsTotal) * 100 : 0,
    };
  }

  async function gradeWhole(blob: Blob, which: "before" | "after") {
    try {
      const g = await postGrade(passage.text, blob);
      if (which === "before") {
        setBefore(toScore(g));
        const line = "Nice first read! Now let's practice it, one line at a time.";
        setMode("speaking"); setCaption(line);
        speak(line, () => { setPhase("drill"); setIdx(0); setAttempt(0); setResults({}); setMode("idle"); setCaption("Tap me and read the first line."); });
      } else {
        setAfter(toScore(g));
        statsRef.current.afterGrade = g;
        finishSession();
      }
    } catch (e: unknown) {
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
      if (!willRetry) tricky.slice(0, 3).forEach((w) => statsRef.current.trickyWords.add(w));

      if (!hasError) {
        // Clean read → skip the voice round-trip entirely for speed. Quick
        // visual cheer, then straight to the next line. Only mistakes wait
        // for spoken coaching.
        setMode("idle");
        setCaption("Nice reading!");
        window.setTimeout(() => proceed(false), 450);
      } else {
        const coaching = a.coach?.trim()
          ? a.coach.trim()
          : willRetry ? `Let's look at "${tricky[0] ?? "that word"}" and read the line again.` : "Good try — let's keep going.";
        setMode("speaking"); setCaption(coaching);
        speak(coaching, () => proceed(willRetry));
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
      setMode("idle"); setCaption("Let's try that line again — tap me when you're ready.");
    }
  }

  function proceed(willRetry: boolean) {
    if (willRetry) { setAttempt(1); setMode("idle"); setCaption("Let's read that line one more time — tap me."); return; }
    setAttempt(0);
    const next = idxRef.current + 1;
    if (next >= sentences.length) {
      const line = "Great practicing! Now read me the whole story one more time.";
      setMode("speaking"); setCaption(line);
      speak(line, () => { setPhase("overall2"); setMode("idle"); setCaption("Tap me and read the whole story."); });
    } else {
      setIdx(next); setMode("idle"); setCaption("Nice! Tap me to read the next line.");
    }
  }

  function finishSession() {
    setPhase("done");
    setMode("idle");
    setCaption("You did it! Look how much you improved.");
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

  function resetAll(p: Passage) {
    stopAudio();
    statsRef.current = { trickyWords: new Set(), afterGrade: null };
    setResults({}); setIdx(0); setAttempt(0); setBefore(null); setAfter(null); setErr(null);
    setSentences(splitSentences(p.text)); setPhase("intro"); setMode("idle"); setCaption("Ready to read with me?");
  }

  function startFlow() {
    setPhase("overall1"); setMode("idle"); setCaption("Read me the whole story out loud!");
  }

  function newPassage() {
    setOverride(null);
    let n = pIdx;
    if (passages.length > 1) { n = Math.floor(Math.random() * passages.length); if (n === pIdx) n = (pIdx + 1) % passages.length; }
    setPIdx(n); resetAll(passages[n] ?? passages[0]);
  }

  function onTap() {
    if (mode === "listening") { stopRecording(); return; }
    if (mode !== "idle") return;
    if (phase === "overall1") startRecording((b) => gradeWhole(b, "before"));
    else if (phase === "drill") startRecording(gradeSentence);
    else if (phase === "overall2") startRecording((b) => gradeWhole(b, "after"));
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
              <button type="button" onClick={startFlow}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "none", borderRadius: 999, padding: "16px 40px", fontFamily: BALOO, fontSize: 22, fontWeight: 800, color: "#fff", background: "#4338ca", boxShadow: "0 12px 30px -8px rgba(67,56,202,.5)", cursor: "pointer" }}>
                <Play className="h-5 w-5" fill="#fff" stroke="none" /> Let&apos;s Start
              </button>
            </div>
          ) : (
            <button type="button" onClick={onTap} disabled={busy}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "none", borderRadius: 999, padding: "12px 26px", fontFamily: "'Nunito',sans-serif", fontSize: 15, fontWeight: 800, color: "#fff", background: mode === "listening" ? "#dc2626" : "#4338ca", boxShadow: "0 10px 40px -12px rgba(49,46,129,.45)", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1 }}>
              {micLabel}
            </button>
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
            <button type="button" onClick={() => resetAll(passage)}
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
