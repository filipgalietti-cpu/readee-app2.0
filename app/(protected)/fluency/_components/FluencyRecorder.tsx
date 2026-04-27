"use client";

import { useEffect, useRef, useState } from "react";
import {
  Mic,
  Square,
  Loader2,
  Check,
  X as XIcon,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  ArrowRight,
  Shuffle,
} from "lucide-react";
import AssignFluencyButton from "./AssignFluencyButton";

type Kid = { id: string; first_name: string; grade: string };
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

/**
 * FluencyRecorder — captures kid audio with MediaRecorder, ships it
 * to /api/fluency/analyze, renders the per-word colored transcript +
 * WCPM + encouragement.
 */
export default function FluencyRecorder({
  kids,
  samplePassages,
  assignedPassage,
  assignmentId,
}: {
  kids: Kid[];
  samplePassages: Passage[];
  assignedPassage?: { text: string; title: string; grade: string; childId: string } | null;
  assignmentId?: string | null;
}) {
  const isAssigned = !!assignedPassage;
  const [childId, setChildId] = useState(
    assignedPassage?.childId ?? kids[0]?.id ?? "",
  );
  // Default the grade filter to whatever the first kid is at, falling
  // back to 2nd. The kid (or teacher demoing) can hop around.
  const [gradeFilter, setGradeFilter] = useState<string>(
    kids[0]?.grade ?? "2nd",
  );
  const [passageIdx, setPassageIdx] = useState(0);
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState("");

  const passagesForGrade = samplePassages.filter(
    (p) => p.grade === gradeFilter,
  );
  // Clamp passageIdx whenever the filter changes.
  const safeIdx = Math.min(passageIdx, Math.max(0, passagesForGrade.length - 1));
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [audioPlaybackUrl, setAudioPlaybackUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const passage = isAssigned
    ? { grade: assignedPassage!.grade, title: assignedPassage!.title, text: assignedPassage!.text }
    : customMode
      ? { grade: kids.find((k) => k.id === childId)?.grade ?? "2nd", title: "Custom passage", text: customText }
      : passagesForGrade[safeIdx] ?? samplePassages[0];

  function shufflePassage() {
    if (passagesForGrade.length <= 1) return;
    let next = Math.floor(Math.random() * passagesForGrade.length);
    if (next === safeIdx) next = (safeIdx + 1) % passagesForGrade.length;
    setPassageIdx(next);
  }

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
      if (tickRef.current) clearInterval(tickRef.current);
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startRecording() {
    setErr(null);
    setAnalysis(null);
    setRecordedBlob(null);
    setRecordedUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      const mime =
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : "";
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setElapsed(0);
      const t0 = Date.now();
      tickRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - t0) / 1000));
      }, 250);
    } catch (e: any) {
      setErr(e.message ?? "Mic permission denied.");
    }
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    setRecording(false);
  }

  async function analyze() {
    if (!recordedBlob) {
      setErr("Record something first.");
      return;
    }
    if (!passage.text.trim()) {
      setErr("Pick or type a passage first.");
      return;
    }
    setAnalyzing(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("audio", recordedBlob, "reading.webm");
      fd.append("childId", childId);
      fd.append("passageText", passage.text);
      fd.append("gradeLevel", passage.grade);
      if (assignmentId) fd.append("assignmentId", assignmentId);
      const r = await fetch("/api/fluency/analyze", {
        method: "POST",
        body: fd,
      });
      const json = await r.json();
      if (!r.ok || !json.ok) {
        throw new Error(json.error ?? `HTTP ${r.status}`);
      }
      setAnalysis(json.analysis as Analysis);
      setAudioPlaybackUrl(json.audioUrl);
    } catch (e: any) {
      setErr(e.message ?? "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  }

  function reset() {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setAnalysis(null);
    setAudioPlaybackUrl(null);
    setErr(null);
    setElapsed(0);
  }

  const mins = Math.floor(elapsed / 60);
  const secs = (elapsed % 60).toString().padStart(2, "0");

  return (
    <div className="space-y-4">
      {/* Kid + passage picker — hidden when fulfilling an assignment */}
      {!isAssigned && (
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {kids.length > 1 && (
          <div className="mb-4">
            <span className="block text-xs font-semibold text-zinc-500">
              Reader
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {kids.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setChildId(k.id)}
                  className={`rounded-full border px-3 py-1 text-sm transition ${
                    childId === k.id
                      ? "border-violet-500 bg-violet-100 font-bold text-violet-800"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-violet-300"
                  }`}
                >
                  {k.first_name} ({k.grade})
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <span className="block text-xs font-semibold text-zinc-500">
            Passage
          </span>
          <div className="mt-2 inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950">
            <button
              type="button"
              onClick={() => setCustomMode(false)}
              className={`rounded-full px-3 py-1 transition ${!customMode ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-800 dark:text-indigo-300" : "text-zinc-500"}`}
            >
              Sample
            </button>
            <button
              type="button"
              onClick={() => setCustomMode(true)}
              className={`rounded-full px-3 py-1 transition ${customMode ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-800 dark:text-indigo-300" : "text-zinc-500"}`}
            >
              Custom
            </button>
          </div>

          {!customMode ? (
            <>
              {/* Grade filter */}
              <div className="mt-3 inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-[11px] font-semibold dark:border-slate-700 dark:bg-slate-950">
                {(["K", "1st", "2nd", "3rd", "4th"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setGradeFilter(g);
                      setPassageIdx(0);
                    }}
                    className={`rounded-full px-2.5 py-1 transition ${
                      gradeFilter === g
                        ? "bg-white text-violet-700 shadow-sm dark:bg-slate-800 dark:text-violet-300"
                        : "text-zinc-500"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              {/* Passages within that grade */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {passagesForGrade.map((p, i) => (
                  <button
                    key={p.title + i}
                    type="button"
                    onClick={() => setPassageIdx(i)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      safeIdx === i
                        ? "border-violet-400 bg-violet-100 font-bold text-violet-800"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-violet-300"
                    }`}
                  >
                    {p.title}
                  </button>
                ))}
                {passagesForGrade.length > 1 && (
                  <button
                    type="button"
                    onClick={shufflePassage}
                    className="ml-1 inline-flex items-center gap-1 rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-100"
                    title="Try a different passage"
                  >
                    <Shuffle className="h-3 w-3" />
                    Try a different one
                  </button>
                )}
              </div>
              <div className="mt-1 text-[10px] text-zinc-400">
                {passagesForGrade.length > 0
                  ? `Passage ${safeIdx + 1} of ${passagesForGrade.length} for grade ${gradeFilter}`
                  : "No passages for this grade yet."}
              </div>
            </>
          ) : (
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value.slice(0, 2000))}
              rows={5}
              placeholder="Paste any passage here for the kid to read aloud."
              className="mt-3 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          )}
        </div>
      </div>
      )}

      {/* The passage to read */}
      {passage.text && (
        <div className="rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50/40 via-white to-pink-50/40 p-6 shadow-sm dark:border-violet-900/40">
          <div className="flex items-start justify-between gap-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
              Read this aloud
            </div>
            {!isAssigned && (
              <AssignFluencyButton
                passageTitle={passage.title}
                passageText={passage.text}
                gradeLevel={passage.grade}
              />
            )}
          </div>
          <p
            className="mt-3 text-[22px] font-medium leading-snug text-zinc-900 dark:text-white"
            style={{
              fontFamily:
                'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif',
            }}
          >
            {passage.text}
          </p>
        </div>
      )}

      {/* Recorder controls */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {!recordedBlob && !recording && (
          <div className="text-center">
            <button
              type="button"
              onClick={startRecording}
              disabled={!passage.text.trim()}
              className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-violet-600 text-white shadow-lg transition hover:scale-105 disabled:opacity-50"
            >
              <Mic className="h-10 w-10" />
            </button>
            <p className="mt-3 text-sm font-bold text-zinc-700 dark:text-slate-300">
              Tap to start recording
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Read the passage above out loud at your own pace.
            </p>
          </div>
        )}

        {recording && (
          <div className="text-center">
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition hover:bg-red-700"
            >
              <Square className="h-9 w-9" fill="currentColor" />
            </button>
            <p className="mt-3 text-sm font-bold text-red-600">
              ● Recording — {mins}:{secs}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Tap to stop when you're done.
            </p>
          </div>
        )}

        {recordedBlob && !analyzing && !analysis && (
          <div className="space-y-3">
            <p className="text-sm font-bold text-zinc-900 dark:text-white text-center">
              Recording captured ({mins}:{secs})
            </p>
            {recordedUrl && (
              <audio
                controls
                src={recordedUrl}
                className="mx-auto block w-full max-w-md"
              />
            )}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Re-record
              </button>
              <button
                type="button"
                onClick={analyze}
                className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-violet-700"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Analyze with Readee.ai
              </button>
            </div>
          </div>
        )}

        {analyzing && (
          <div className="flex flex-col items-center gap-2 py-4 text-sm text-zinc-500">
            <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
            Listening and analyzing…
          </div>
        )}
      </div>

      {err && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {err}
        </div>
      )}

      {/* Analysis */}
      {analysis && (
        <div className="space-y-4">
          {/* Score header */}
          <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-violet-50/50 p-6 shadow-sm dark:border-emerald-900/40">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-emerald-600" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                    Fluency score
                  </div>
                  <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                    {analysis.wcpm.toFixed(0)}
                    <span className="ml-1 text-base font-bold text-zinc-500">
                      WCPM
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-zinc-500">
                {analysis.wordsCorrect} / {analysis.wordsTotal} correct ·{" "}
                {analysis.durationSeconds.toFixed(0)}s
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white p-4 dark:bg-slate-900">
              <div className="text-[10px] font-bold uppercase tracking-widest text-violet-600">
                For the kid
              </div>
              <p className="mt-1 text-sm text-zinc-800 dark:text-slate-200">
                {analysis.encouragement}
              </p>
            </div>
            <div className="mt-2 rounded-2xl bg-white p-4 dark:bg-slate-900">
              <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                For the teacher
              </div>
              <p className="mt-1 text-sm text-zinc-800 dark:text-slate-200">
                {analysis.teacherSummary}
              </p>
            </div>
          </div>

          {/* Word-by-word */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              Word-by-word
            </div>
            <p
              className="mt-3 text-[20px] leading-relaxed"
              style={{
                fontFamily:
                  'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif',
              }}
            >
              {analysis.wordAnnotations.map((a, i) => (
                <Word key={i} a={a} />
              ))}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                read correctly
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                self-corrected
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
                substituted
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                missed
              </span>
            </div>
          </div>

          {audioPlaybackUrl && (
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                Listen back
              </div>
              <audio
                controls
                src={audioPlaybackUrl}
                className="mt-2 block w-full"
              />
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-violet-700"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              Read another passage
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Word({ a }: { a: Annotation }) {
  const status = a.status;
  const cls =
    status === "correct"
      ? "text-emerald-700"
      : status === "self_corrected"
        ? "bg-amber-100 text-amber-800 rounded px-1"
        : status === "substituted"
          ? "bg-orange-100 text-orange-800 rounded px-1 line-through"
          : status === "missed"
            ? "bg-red-100 text-red-800 rounded px-1 line-through"
            : "text-zinc-700";
  return (
    <span
      className={`mr-1 inline ${cls}`}
      title={
        a.heard
          ? `Heard: "${a.heard}"`
          : status === "missed"
            ? "Missed"
            : status === "self_corrected"
              ? "Self-corrected"
              : ""
      }
    >
      {a.word}
    </span>
  );
}
