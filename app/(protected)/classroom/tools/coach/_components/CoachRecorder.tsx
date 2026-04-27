"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Loader2, AlertCircle, Sparkles } from "lucide-react";

type Speaker = {
  speakerLabel: string;
  approxWordsRead: number;
  errorCount: number;
  selfCorrectionCount: number;
  prosodyScore: number;
  phrasingScore: number;
  targetPattern: string;
  oneLineObservation: string;
};
type Observation = {
  speakers: Speaker[];
  teacherSummary: string;
  transcript: string;
};

export default function CoachRecorder() {
  const [passage, setPassage] = useState("");
  const [gradeLevel, setGradeLevel] = useState("2nd");
  const [recording, setRecording] = useState(false);
  const [pending, setPending] = useState(false);
  const [obs, setObs] = useState<Observation | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ok =
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function" &&
      typeof MediaRecorder !== "undefined";
    if (!ok) setUnsupported(true);
  }, []);

  async function start() {
    setErr(null);
    setObs(null);
    if (!passage.trim()) {
      setErr("Paste the passage you're reading first.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { noiseSuppression: true, echoCancellation: true },
      });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        if (blob.size < 5_000) {
          setErr("Recording too short. Aim for at least 30 seconds.");
          return;
        }
        await analyze(blob);
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch (e: any) {
      setErr(e?.message ?? "Microphone permission denied.");
    }
  }

  function stop() {
    setRecording(false);
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
    }
  }

  async function analyze(blob: Blob) {
    setPending(true);
    try {
      const form = new FormData();
      form.append("audio", blob, "group.webm");
      form.append("passage", passage);
      form.append("gradeLevel", gradeLevel);
      const res = await fetch("/api/coach-analyze", { method: "POST", body: form });
      const json = await res.json();
      if (!json.ok) setErr(json.error ?? "Analysis failed.");
      else setObs(json.observation as Observation);
    } catch (e: any) {
      setErr(e?.message ?? "Analysis failed.");
    } finally {
      setPending(false);
    }
  }

  if (unsupported) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Coach mode needs a browser with microphone access (Chrome,
        Safari, Edge).
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <label className="block text-xs font-semibold text-zinc-500">
          Grade
          <select
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            className="ml-2 rounded-lg border border-zinc-300 px-2 py-1 text-sm"
          >
            {["K","1st","2nd","3rd","4th"].map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>
        <label className="mt-3 block text-xs font-semibold text-zinc-500">
          Passage the group is reading
          <textarea
            rows={4}
            value={passage}
            onChange={(e) => setPassage(e.target.value)}
            placeholder="Paste the text the group is reading aloud…"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </label>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={recording ? stop : start}
          disabled={pending}
          className={`flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition disabled:opacity-60 ${
            recording
              ? "bg-red-600 text-white animate-pulse"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {recording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
        </button>
      </div>
      <div className="text-center text-xs text-zinc-500">
        {recording ? "Recording the group… tap to analyze" : pending ? "Analyzing…" : "Tap to record"}
      </div>

      {pending && (
        <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          Listening to your group…
        </div>
      )}

      {err && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {err}
        </div>
      )}

      {obs && (
        <div className="space-y-3">
          <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-700">
              <Sparkles className="h-3 w-3" />
              Group summary
            </div>
            <p className="mt-2 text-sm text-zinc-800">{obs.teacherSummary}</p>
          </div>
          {obs.speakers.map((s) => (
            <div key={s.speakerLabel} className="rounded-3xl border border-zinc-200 bg-white p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {s.speakerLabel}
              </div>
              <div className="mt-1 grid grid-cols-4 gap-2 text-center">
                <Stat label="Words" v={s.approxWordsRead} />
                <Stat label="Errors" v={s.errorCount} />
                <Stat label="Self-corr" v={s.selfCorrectionCount} />
                <Stat label="Prosody" v={`${s.prosodyScore}/4`} />
              </div>
              <p className="mt-2 text-sm text-zinc-800">{s.oneLineObservation}</p>
              {s.targetPattern && (
                <div className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold text-blue-700">
                  Focus: {s.targetPattern}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, v }: { label: string; v: number | string }) {
  return (
    <div>
      <div className="text-lg font-extrabold text-zinc-900">{v}</div>
      <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">{label}</div>
    </div>
  );
}
