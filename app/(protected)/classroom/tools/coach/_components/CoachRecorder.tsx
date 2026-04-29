"use client";

import { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Loader2,
  AlertCircle,
  Sparkles,
  Target,
  Gauge,
  Activity,
  ListChecks,
  User,
} from "lucide-react";

type Roster = {
  classroomId: string;
  classroomName: string;
  children: { id: string; first_name: string; grade: string | null }[];
}[];

type Miscue = {
  expected: string;
  heard: string;
  kind: "substitution" | "omission" | "insertion" | "self_correction";
  position: number;
};

type RunningRecord = {
  transcript: string;
  wcpm: number;
  accuracyPct: number;
  miscues: Miscue[];
  focusArea: string;
  teacherSummary: string;
};

const FRIENDLY_FONT =
  '"Comic Neue", "Comic Sans MS", Quicksand, Nunito, ui-rounded, system-ui, -apple-system, sans-serif';

export default function RunningRecordRecorder({ roster }: { roster: Roster }) {
  const allChildren = roster.flatMap((r) =>
    r.children.map((c) => ({ ...c, classroomName: r.classroomName })),
  );

  const [childId, setChildId] = useState<string>(allChildren[0]?.id ?? "");
  const [passage, setPassage] = useState("");
  const [gradeLevel, setGradeLevel] = useState("2nd");
  const [recording, setRecording] = useState(false);
  const [pending, setPending] = useState(false);
  const [record, setRecord] = useState<RunningRecord | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState(false);
  const [livePreview, setLivePreview] = useState<string>("");
  const [elapsed, setElapsed] = useState<number>(0);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const startedAtRef = useRef<number>(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ok =
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function" &&
      typeof MediaRecorder !== "undefined";
    if (!ok) setUnsupported(true);
  }, []);

  function startLivePreview() {
    setLivePreview("");
    const SR =
      (typeof window !== "undefined" &&
        ((window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition)) ||
      null;
    if (!SR) return; // Safari iOS / unsupported, just skip preview.
    try {
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.onresult = (event: any) => {
        let combined = "";
        for (let i = 0; i < event.results.length; i++) {
          combined += event.results[i][0]?.transcript ?? "";
        }
        setLivePreview(combined.trim());
      };
      rec.onerror = () => {
        // Best-effort, drop silently.
      };
      rec.start();
      recognitionRef.current = rec;
    } catch {
      // Web Speech occasionally throws on rapid restart; we don't block.
    }
  }

  function stopLivePreview() {
    try {
      recognitionRef.current?.stop?.();
    } catch {
      // ignore
    }
    recognitionRef.current = null;
  }

  async function start() {
    setErr(null);
    setRecord(null);
    if (!childId) {
      setErr("Pick a student first.");
      return;
    }
    if (!passage.trim()) {
      setErr("Paste the passage the student is reading.");
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
        const dur = (Date.now() - startedAtRef.current) / 1000;
        if (dur < 5) {
          setErr("Recording too short. Aim for at least a sentence.");
          return;
        }
        await analyze(blob, dur);
      };
      mr.start();
      mediaRef.current = mr;
      startedAtRef.current = Date.now();
      setElapsed(0);
      tickRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }, 250);
      startLivePreview();
      setRecording(true);
    } catch (e: any) {
      setErr(e?.message ?? "Microphone permission denied.");
    }
  }

  function stop() {
    setRecording(false);
    stopLivePreview();
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
    }
  }

  async function analyze(blob: Blob, durationSeconds: number) {
    setPending(true);
    try {
      const form = new FormData();
      form.append("audio", blob, "running-record.webm");
      form.append("childId", childId);
      form.append("passage", passage);
      form.append("gradeLevel", gradeLevel);
      form.append("durationSeconds", String(durationSeconds));
      const res = await fetch("/api/coach-analyze", {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!json.ok) {
        setErr(json.error ?? "Analysis failed.");
      } else {
        setRecord(json.record as RunningRecord);
      }
    } catch (e: any) {
      setErr(e?.message ?? "Analysis failed.");
    } finally {
      setPending(false);
    }
  }

  if (unsupported) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Running records need a browser with microphone access (Chrome,
        Safari, Edge).
      </div>
    );
  }

  if (allChildren.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Add students to a classroom first, then come back to record one.
      </div>
    );
  }

  const selectedChild = allChildren.find((c) => c.id === childId);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <label className="block text-xs font-semibold text-zinc-500">
          Student
          <select
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
            disabled={recording || pending}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-60"
          >
            {allChildren.map((c) => (
              <option key={c.id} value={c.id}>
                {c.first_name}
                {c.classroomName ? ` · ${c.classroomName}` : ""}
                {c.grade ? ` · ${c.grade}` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-3 block text-xs font-semibold text-zinc-500">
          Grade
          <select
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            disabled={recording || pending}
            className="ml-2 rounded-lg border border-zinc-300 px-2 py-1 text-sm disabled:opacity-60"
          >
            {["K", "1st", "2nd", "3rd", "4th"].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-3 block text-xs font-semibold text-zinc-500">
          Passage the student is reading
          <textarea
            rows={5}
            value={passage}
            onChange={(e) => setPassage(e.target.value)}
            disabled={recording || pending}
            placeholder="Paste the text the student will read aloud…"
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-60"
          />
        </label>
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={recording ? stop : start}
          disabled={pending}
          className={`flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition disabled:opacity-60 ${
            recording
              ? "animate-pulse bg-red-600 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          aria-label={recording ? "Stop recording" : "Start recording"}
        >
          {recording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
        </button>
        <div className="text-center text-xs text-zinc-500">
          {recording
            ? `Recording ${selectedChild?.first_name ?? "student"}… ${formatTime(elapsed)}`
            : pending
            ? "Analyzing…"
            : "Tap to record"}
        </div>
      </div>

      {recording && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-950/30">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">
            <Activity className="h-3 w-3" />
            Live preview · what the mic is hearing
          </div>
          <div
            className="mt-2 min-h-[3em] text-sm text-zinc-800 dark:text-slate-100"
            style={{ fontFamily: FRIENDLY_FONT }}
          >
            {livePreview || (
              <span className="text-zinc-400">Listening…</span>
            )}
          </div>
        </div>
      )}

      {pending && (
        <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          Scoring the running record…
        </div>
      )}

      {err && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {err}
        </div>
      )}

      {record && selectedChild && (
        <ResultsPanel record={record} studentName={selectedChild.first_name} />
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function ResultsPanel({
  record,
  studentName,
}: {
  record: RunningRecord;
  studentName: string;
}) {
  const errorCount = record.miscues.filter(
    (m) => m.kind !== "self_correction",
  ).length;
  const selfCorrect = record.miscues.filter(
    (m) => m.kind === "self_correction",
  ).length;
  return (
    <div className="space-y-3">
      <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900/40 dark:bg-blue-950/30">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">
          <User className="h-3 w-3" />
          {studentName}&apos;s running record
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="WCPM" v={record.wcpm} icon={Gauge} />
          <Stat label="Accuracy" v={`${record.accuracyPct}%`} icon={Sparkles} />
          <Stat label="Errors" v={errorCount} icon={AlertCircle} />
          <Stat label="Self-corr" v={selfCorrect} icon={ListChecks} />
        </div>
        {record.focusArea && (
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-800 ring-1 ring-blue-200 dark:bg-slate-900 dark:text-blue-200 dark:ring-blue-900/40">
            <Target className="h-3 w-3" />
            Focus tomorrow: {record.focusArea}
          </div>
        )}
        {record.teacherSummary && (
          <p className="mt-3 text-sm text-zinc-800 dark:text-slate-100">
            {record.teacherSummary}
          </p>
        )}
      </div>

      {record.miscues.length > 0 && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
            Miscues
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {record.miscues.map((m, i) => (
              <li
                key={i}
                className={`rounded-2xl border px-3 py-2 text-sm ${
                  m.kind === "self_correction"
                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/30"
                    : "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30"
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  {m.kind.replace("_", " ")}
                </div>
                <div className="mt-1 font-semibold text-zinc-900 dark:text-white">
                  {m.kind === "omission"
                    ? `Skipped: "${m.expected}"`
                    : m.kind === "insertion"
                    ? `Added: "${m.heard}"`
                    : `${m.expected} → ${m.heard || "—"}`}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {record.transcript && (
        <details className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
            Full transcript
          </summary>
          <p
            className="mt-3 whitespace-pre-line text-sm leading-[1.7] text-zinc-800 dark:text-slate-100"
            style={{ fontFamily: FRIENDLY_FONT }}
          >
            {record.transcript}
          </p>
        </details>
      )}
    </div>
  );
}

function Stat({
  label,
  v,
  icon: Icon,
}: {
  label: string;
  v: number | string;
  icon: any;
}) {
  return (
    <div className="rounded-2xl bg-white px-3 py-2 text-center shadow-sm dark:bg-slate-900">
      <Icon className="mx-auto h-3 w-3 text-blue-500" />
      <div className="mt-1 text-xl font-extrabold text-zinc-900 dark:text-white">
        {v}
      </div>
      <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
        {label}
      </div>
    </div>
  );
}
