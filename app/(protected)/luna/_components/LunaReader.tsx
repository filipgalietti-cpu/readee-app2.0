"use client";

/**
 * LunaReader — the "read with Luna" flow as a ONE-PAGER. The kid reads a
 * passage aloud; we grade it with the real fluency engine
 * (/api/fluency/analyze); then Luna speaks grounded coaching (Autonoe via
 * /api/luna/speak) and the passage itself lights up word-by-word in place
 * — no separate results screen to scroll to. Everything lives on one view.
 */

import { useEffect, useRef, useState } from "react";
import { Shuffle } from "lucide-react";
import LunaOrb, { type LunaMode } from "./LunaOrb";

type Passage = { grade: string; title: string; text: string };
type Annotation = { word: string; status: string; heard?: string };
type Analysis = {
  transcript: string;
  wordAnnotations: Annotation[];
  wordsTotal: number;
  wordsCorrect: number;
  durationSeconds: number;
  wcpm: number;
  encouragement: string;
  teacherSummary: string;
};

const SERIF = 'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif';

export default function LunaReader({
  childId,
  passages,
}: {
  childId: string;
  childName: string;
  passages: Passage[];
}) {
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<LunaMode>("idle");
  const [caption, setCaption] = useState("Tap Luna, then read the passage out loud.");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const passage = passages[idx] ?? passages[0];

  const cleanupMic = () => {
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch { /* ignore */ }
    try { void ctxRef.current?.close(); } catch { /* ignore */ }
    streamRef.current = null; ctxRef.current = null; setAnalyser(null);
  };

  useEffect(() => () => {
    cleanupMic();
    try { audioRef.current?.pause(); } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startReading() {
    setErr(null); setAnalysis(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 512; an.smoothingTimeConstant = 0.75;
      src.connect(an);
      setAnalyser(an);
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        cleanupMic();
        void gradeAndCoach(blob);
      };
      recorderRef.current = rec;
      rec.start();
      setMode("listening");
      setCaption("I'm listening — read it out loud!");
    } catch {
      setErr("I couldn't turn on the mic. Check the mic permission and try again.");
      setMode("idle");
    }
  }

  function stopReading() {
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    setMode("thinking");
    setCaption("Let me listen to how you read…");
  }

  async function gradeAndCoach(blob: Blob) {
    try {
      const fd = new FormData();
      fd.append("audio", blob, "reading.webm");
      fd.append("childId", childId);
      fd.append("passageText", passage.text);
      fd.append("gradeLevel", passage.grade);
      const r = await fetch("/api/fluency/analyze", { method: "POST", body: fd });
      const json = await r.json();
      if (!r.ok || !json.ok) throw new Error(json.error ?? `HTTP ${r.status}`);
      const a = json.analysis as Analysis;
      setAnalysis(a);

      const coaching = buildCoaching(a);
      setMode("speaking");
      setCaption(coaching);
      try {
        const sr = await fetch("/api/luna/speak", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: coaching }),
        });
        const sj = await sr.json();
        if (sr.ok && sj.ok && sj.audioUrl) {
          const audio = new Audio(sj.audioUrl);
          audioRef.current = audio;
          audio.onended = () => { setMode("idle"); setCaption("Tap Luna to read it again, or try a new one."); };
          await audio.play().catch(() => { setMode("idle"); setCaption("Tap Luna to read it again, or try a new one."); });
        } else {
          setMode("idle"); setCaption("Tap Luna to read it again, or try a new one.");
        }
      } catch {
        setMode("idle"); setCaption("Tap Luna to read it again, or try a new one.");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setErr(msg);
      setMode("idle"); setCaption("Let's try that again — tap Luna when you're ready.");
    }
  }

  const onTap = () => {
    if (mode === "idle") startReading();
    else if (mode === "listening") stopReading();
  };

  function anotherPassage() {
    try { audioRef.current?.pause(); } catch { /* ignore */ }
    setAnalysis(null); setErr(null); setMode("idle");
    setCaption("Tap Luna, then read the passage out loud.");
    if (passages.length > 1) {
      let n = Math.floor(Math.random() * passages.length);
      if (n === idx) n = (idx + 1) % passages.length;
      setIdx(n);
    }
  }

  const micLabel = mode === "listening" ? "Tap when you're done"
    : mode === "idle" ? (analysis ? "Read it again" : "Tap to read")
      : "Reading…";
  const busy = mode === "thinking" || mode === "speaking";

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Passage — becomes the color-coded result in place after grading */}
      <div style={{ borderRadius: 22, border: "2px solid #ddd6fe", background: "linear-gradient(135deg,#f5f3ff,#ffffff 60%,#fdf2f8)", padding: "16px 20px", boxShadow: "0 10px 40px -18px rgba(49,46,129,.25)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, minHeight: 24 }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "#7c3aed" }}>
            {analysis ? "How you read it" : "Read this to Luna"}
          </span>
          {analysis ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, background: "#ecfdf5", border: "1px solid #bbf7d0", padding: "3px 12px", fontSize: 12, fontWeight: 800, color: "#047857", fontVariantNumeric: "tabular-nums" }}>
              {analysis.wcpm.toFixed(0)} WCPM · {analysis.wordsCorrect}/{analysis.wordsTotal}
            </span>
          ) : passages.length > 1 && mode === "idle" ? (
            <button type="button" onClick={anotherPassage} style={{ display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 999, border: "1px solid #ddd6fe", background: "#f5f3ff", color: "#6d28d9", padding: "4px 11px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              <Shuffle className="h-3 w-3" /> New passage
            </button>
          ) : null}
        </div>
        <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontSize: 21, fontWeight: 500, lineHeight: 1.5, color: "#18181b" }}>
          {analysis
            ? analysis.wordAnnotations.map((a, i) => <Word key={i} a={a} />)
            : passage.text}
        </p>
        {analysis && (
          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 10, fontSize: 10.5, color: "#71717a" }}>
            <Legend color="#10b981" label="read it" />
            <Legend color="#f59e0b" label="fixed it" />
            <Legend color="#f97316" label="different word" />
            <Legend color="#ef4444" label="skipped" />
          </div>
        )}
      </div>

      {/* Orb + caption + mic */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <LunaOrb mode={mode} analyser={mode === "listening" ? analyser : null} onTap={onTap} size={180} />
        <div style={{ minHeight: 58, display: "flex", alignItems: "center", justifyContent: "center", maxWidth: 460, padding: "0 8px" }}>
          <p style={{ margin: 0, textAlign: "center", fontFamily: "'Baloo 2','Nunito',sans-serif", fontSize: 19, lineHeight: 1.35, fontWeight: 700, color: "#18181b" }}>{caption}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" onClick={onTap} disabled={busy}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "none", borderRadius: 999, padding: "12px 26px", fontFamily: "'Nunito',sans-serif", fontSize: 15, fontWeight: 800, color: "#fff", background: mode === "listening" ? "#dc2626" : "#4338ca", boxShadow: "0 10px 40px -12px rgba(49,46,129,.45)", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1 }}>
            {micLabel}
          </button>
          {analysis && mode === "idle" && passages.length > 1 && (
            <button type="button" onClick={anotherPassage}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid #ddd6fe", background: "#fff", color: "#6d28d9", borderRadius: 999, padding: "12px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              <Shuffle className="h-4 w-4" /> New passage
            </button>
          )}
        </div>
      </div>

      {err && <p style={{ textAlign: "center", color: "#dc2626", fontWeight: 700, fontSize: 14 }}>{err}</p>}
    </div>
  );
}

function buildCoaching(a: Analysis): string {
  const tricky = a.wordAnnotations
    .filter((w) => w.status === "missed" || w.status === "substituted")
    .map((w) => w.word.replace(/[^A-Za-z'-]/g, ""))
    .filter(Boolean);
  let line = (a.encouragement || "Nice reading!").trim();
  if (tricky.length) {
    const words = tricky.slice(0, 2).join(" and ");
    line += ` Let's practice ${tricky.length === 1 ? "this word" : "these words"}: ${words}. Want to try the passage again?`;
  } else {
    line += " You read every single word — amazing! Want to try another one?";
  }
  return line.slice(0, 690);
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: color }} />
      {label}
    </span>
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
  return <span style={{ marginRight: 5, ...style }} title={a.heard ? `Heard: "${a.heard}"` : ""}>{a.word}</span>;
}
