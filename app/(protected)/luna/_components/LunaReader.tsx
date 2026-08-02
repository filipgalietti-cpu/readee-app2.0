"use client";

/**
 * LunaReader — Model B: a GUIDED, sentence-by-sentence reading session
 * with Luna, our AI reading tutor.
 *
 * Loop: Luna highlights one sentence → kid taps + reads just that line →
 * we grade that line (POST /api/luna/grade, no DB spam) → Luna reacts out
 * loud (Autonoe): all-correct → praise + advance; a stumble → name the
 * word + one retry → advance. Reading speed tracked per line. End of
 * passage → a short session summary.
 *
 * Audio is unlocked on the first tap (a silent play) so Luna's voice —
 * which fires after an async grade — isn't blocked by autoplay policy.
 */

import { useEffect, useRef, useState } from "react";
import { Shuffle, Trophy, RotateCcw } from "lucide-react";
import LunaOrb, { type LunaMode } from "./LunaOrb";

type Passage = { grade: string; title: string; text: string };
type Annotation = { word: string; status: string; heard?: string };
type Analysis = {
  wordAnnotations: Annotation[];
  wordsTotal: number;
  wordsCorrect: number;
  durationSeconds: number;
  wcpm: number;
  encouragement: string;
  targetPatterns?: string[];
};

const SERIF = 'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif';
const SILENT = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA=";

function splitSentences(text: string): string[] {
  return (text.match(/[^.!?]+[.!?]*/g) ?? [text])
    .map((s) => s.trim())
    .filter(Boolean);
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
  const passage = passages[pIdx] ?? passages[0];
  const [sentences, setSentences] = useState<string[]>(() => splitSentences(passage.text));

  const [idx, setIdx] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [mode, setMode] = useState<LunaMode>("idle");
  const [caption, setCaption] = useState("Tap Luna, then read the first line out loud.");
  const [results, setResults] = useState<Record<number, Annotation[]>>({});
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [done, setDone] = useState<null | { wcpm: number; accuracy: number; pattern: string | null }>(null);
  const [err, setErr] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef(false);
  const idxRef = useRef(0);
  const attemptRef = useRef(0);
  const statsRef = useRef({ correct: 0, total: 0, seconds: 0, patterns: new Set<string>(), annotations: [] as Annotation[] });

  useEffect(() => { idxRef.current = idx; }, [idx]);
  useEffect(() => { attemptRef.current = attempt; }, [attempt]);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = "auto";
    return () => {
      cleanupMic();
      try { audioRef.current?.pause(); } catch { /* ignore */ }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    };
  }, []);

  function cleanupMic() {
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch { /* ignore */ }
    try { void ctxRef.current?.close(); } catch { /* ignore */ }
    streamRef.current = null; ctxRef.current = null; setAnalyser(null);
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
        if (a && j?.ok && j.audioUrl) {
          a.src = j.audioUrl;
          a.onended = onDone;
          a.play().catch(() => window.setTimeout(onDone, 1800));
        } else {
          window.setTimeout(onDone, 1800);
        }
      })
      .catch(() => window.setTimeout(onDone, 1800));
  }

  async function startReading() {
    unlockAudio();
    setErr(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 512; an.smoothingTimeConstant = 0.75;
      src.connect(an);
      setAnalyser(an);
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        cleanupMic();
        void gradeSentence(blob);
      };
      recorderRef.current = rec;
      rec.start();
      setMode("listening");
      setCaption("I'm listening — read this line!");
    } catch {
      setErr("I couldn't turn on the mic. Check the mic permission and try again.");
      setMode("idle");
    }
  }

  function stopReading() {
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    setMode("thinking");
    setCaption("Let me listen to how you read it…");
  }

  async function gradeSentence(blob: Blob) {
    const curIdx = idxRef.current;
    const curAttempt = attemptRef.current;
    try {
      const fd = new FormData();
      fd.append("audio", blob, "line.webm");
      fd.append("childId", childId);
      fd.append("sentenceText", sentences[curIdx]);
      fd.append("gradeLevel", passage.grade);
      const r = await fetch("/api/luna/grade", { method: "POST", body: fd });
      const json = await r.json();
      if (!r.ok || !json.ok) throw new Error(json.error ?? `HTTP ${r.status}`);
      const a = json.analysis as Analysis;

      setResults((prev) => ({ ...prev, [curIdx]: a.wordAnnotations }));
      const tricky = a.wordAnnotations
        .filter((w) => w.status === "missed" || w.status === "substituted")
        .map((w) => w.word.replace(/[^A-Za-z'-]/g, ""))
        .filter(Boolean);
      const willRetry = tricky.length > 0 && curAttempt === 0;

      // Only bank stats on the attempt we move on from (avoid double-count on retry).
      if (!willRetry) {
        statsRef.current.correct += a.wordsCorrect;
        statsRef.current.total += a.wordsTotal;
        statsRef.current.seconds += a.durationSeconds;
        statsRef.current.annotations.push(...a.wordAnnotations);
        (a.targetPatterns ?? []).forEach((p) => statsRef.current.patterns.add(p));
      }

      const coaching = buildCoaching(a, willRetry, tricky[0]);
      setMode("speaking");
      setCaption(coaching);
      speak(coaching, () => proceed(willRetry));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setErr(msg);
      setMode("idle");
      setCaption("Let's try that line again — tap Luna when you're ready.");
    }
  }

  function proceed(willRetry: boolean) {
    if (willRetry) {
      setAttempt(1);
      setMode("idle");
      setCaption("Let's read that line one more time — tap Luna.");
      return;
    }
    setAttempt(0);
    const next = idxRef.current + 1;
    if (next >= sentences.length) {
      finishSession();
    } else {
      setIdx(next);
      setMode("idle");
      setCaption("Nice! Tap Luna to read the next line.");
    }
  }

  function finishSession() {
    const s = statsRef.current;
    const wcpm = s.seconds > 0 ? (s.correct / (s.seconds / 60)) : 0;
    const accuracy = s.total > 0 ? (s.correct / s.total) * 100 : 0;
    const pattern = s.patterns.size ? Array.from(s.patterns)[0] : null;
    setDone({ wcpm, accuracy, pattern });
    setMode("idle");
    setCaption("You read the whole thing! Amazing.");
    // Collect the session's real performance so weaknesses accumulate and
    // future sessions can be aimed at them.
    void fetch("/api/luna/session-complete", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childId, passageText: passage.text, gradeLevel: passage.grade,
        wordAnnotations: s.annotations, wordsTotal: s.total, wordsCorrect: s.correct,
        durationSeconds: s.seconds, wcpm, targetPatterns: Array.from(s.patterns),
      }),
    }).catch(() => {});
  }

  function resetSession(nextPassageIdx = pIdx) {
    try { audioRef.current?.pause(); } catch { /* ignore */ }
    statsRef.current = { correct: 0, total: 0, seconds: 0, patterns: new Set(), annotations: [] };
    setResults({}); setIdx(0); setAttempt(0); setDone(null); setErr(null); setMode("idle");
    setCaption("Tap Luna, then read the first line out loud.");
    const p = passages[nextPassageIdx] ?? passages[0];
    setPIdx(nextPassageIdx);
    setSentences(splitSentences(p.text));
  }

  function newPassage() {
    let n = pIdx;
    if (passages.length > 1) { n = Math.floor(Math.random() * passages.length); if (n === pIdx) n = (pIdx + 1) % passages.length; }
    resetSession(n);
  }

  const onTap = () => {
    if (done) return;
    if (mode === "idle") startReading();
    else if (mode === "listening") stopReading();
  };

  const micLabel = mode === "listening" ? "Tap when you're done"
    : mode === "idle" ? "Tap to read this line" : "Reading…";
  const busy = mode === "thinking" || mode === "speaking";

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Passage — current line highlighted, done lines color-coded, upcoming dimmed */}
      <div style={{ borderRadius: 22, border: "2px solid #ddd6fe", background: "linear-gradient(135deg,#f5f3ff,#ffffff 60%,#fdf2f8)", padding: "16px 20px", boxShadow: "0 10px 40px -18px rgba(49,46,129,.25)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, minHeight: 22 }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "#7c3aed" }}>
            {done ? "You read it all!" : `Line ${Math.min(idx + 1, sentences.length)} of ${sentences.length}`}
          </span>
          {!done && passages.length > 1 && mode === "idle" && idx === 0 && Object.keys(results).length === 0 && (
            <button type="button" onClick={newPassage} style={{ display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 999, border: "1px solid #ddd6fe", background: "#f5f3ff", color: "#6d28d9", padding: "4px 11px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              <Shuffle className="h-3 w-3" /> New passage
            </button>
          )}
        </div>
        <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: "#18181b" }}>
          {sentences.map((sent, i) => {
            const isCur = i === idx && !done;
            const finished = results[i] && (i < idx || done);
            return (
              <span key={i} style={{ background: isCur ? "#ede9fe" : "transparent", borderRadius: 6, padding: isCur ? "1px 4px" : 0, boxShadow: isCur ? "inset 0 0 0 2px #c7d2fe" : "none", color: !finished && !isCur ? "#a1a1aa" : "#18181b", marginRight: 4 }}>
                {finished
                  ? results[i].map((a, j) => <Word key={j} a={a} />)
                  : sent + " "}
              </span>
            );
          })}
        </p>
      </div>

      {/* Orb + caption + controls */}
      {!done ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <LunaOrb mode={mode} analyser={mode === "listening" ? analyser : null} onTap={onTap} size={180} />
          <div style={{ minHeight: 58, display: "flex", alignItems: "center", justifyContent: "center", maxWidth: 470, padding: "0 8px" }}>
            <p style={{ margin: 0, textAlign: "center", fontFamily: "'Baloo 2','Nunito',sans-serif", fontSize: 19, lineHeight: 1.35, fontWeight: 700, color: "#18181b" }}>{caption}</p>
          </div>
          <button type="button" onClick={onTap} disabled={busy}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "none", borderRadius: 999, padding: "12px 26px", fontFamily: "'Nunito',sans-serif", fontSize: 15, fontWeight: 800, color: "#fff", background: mode === "listening" ? "#dc2626" : "#4338ca", boxShadow: "0 10px 40px -12px rgba(49,46,129,.45)", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1 }}>
            {micLabel}
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ width: "100%", borderRadius: 22, border: "1px solid #bbf7d0", background: "linear-gradient(135deg,#ecfdf5,#f5f3ff)", padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Trophy className="h-8 w-8" style={{ color: "#059669" }} />
              <div style={{ display: "flex", gap: 22 }}>
                <Stat label="Reading speed" value={`${done.wcpm.toFixed(0)} WCPM`} />
                <Stat label="Accuracy" value={`${done.accuracy.toFixed(0)}%`} />
              </div>
            </div>
            {done.pattern && (
              <p style={{ margin: "12px 0 0", fontSize: 14, color: "#3f3f46" }}>
                Next let&apos;s practice: <b style={{ color: "#6d28d9" }}>{done.pattern}</b>.
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={() => resetSession(pIdx)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, border: "1px solid #ddd6fe", background: "#fff", color: "#6d28d9", padding: "11px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              <RotateCcw className="h-4 w-4" /> Read it again
            </button>
            <button type="button" onClick={newPassage}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, border: "none", background: "#4338ca", color: "#fff", padding: "11px 20px", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
              <Shuffle className="h-4 w-4" /> New passage
            </button>
          </div>
        </div>
      )}

      {err && <p style={{ textAlign: "center", color: "#dc2626", fontWeight: 700, fontSize: 14 }}>{err}</p>}
    </div>
  );
}

function buildCoaching(a: Analysis, willRetry: boolean, word?: string): string {
  if (willRetry && word) {
    return `Let's look at "${word}". Say it slowly, then read the whole line again.`;
  }
  const base = (a.encouragement || "Nice reading!").trim().split(/(?<=[.!?])\s/)[0];
  return `${base} Let's keep going!`.slice(0, 300);
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#047857" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: "#18181b", fontVariantNumeric: "tabular-nums" }}>{value}</div>
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
  return <span style={{ marginRight: 4, ...style }} title={a.heard ? `Heard: "${a.heard}"` : ""}>{a.word}</span>;
}
