"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
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
  BookOpen,
  Check,
  ExternalLink,
  Maximize2,
  X,
} from "lucide-react";
import Link from "next/link";
import InlineAddStudents from "@/components/classroom/InlineAddStudents";
import { createAssignment } from "@/app/(protected)/classroom/actions";
import { aiGeneratePassage } from "@/app/(protected)/classroom/authoring-actions";
import { Wand2 } from "lucide-react";

type Roster = {
  classroomId: string;
  classroomName: string;
  classroomGrade: string | null;
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
  // Memoize so the array reference is stable across renders. Without
  // this the auto-pick effect below sees a fresh array every render
  // and re-fires constantly, which Turbopack HMR also misreads as a
  // hook-count change after edits.
  const allChildren = useMemo(
    () =>
      roster.flatMap((r) =>
        r.children.map((c) => ({
          ...c,
          classroomId: r.classroomId,
          classroomName: r.classroomName,
        })),
      ),
    [roster],
  );
  const allChildrenKey = allChildren.map((c) => c.id).join(",");

  const [childId, setChildId] = useState<string>(allChildren[0]?.id ?? "");

  // Auto-pick the first child once the roster populates. Without this,
  // teachers who add students inline see "Pick a student first" because
  // useState initialized while allChildren was empty. Depend on the
  // primitive key (joined ids) so the effect only re-fires when the
  // roster actually changes.
  useEffect(() => {
    if (!childId && allChildren.length > 0) {
      setChildId(allChildren[0].id);
      return;
    }
    if (childId && !allChildren.some((c) => c.id === childId)) {
      setChildId(allChildren[0]?.id ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allChildrenKey]);

  const [passage, setPassage] = useState("");
  // Default to 2nd until a child is picked; below we sync to the
  // student's actual grade so generated passages match their level.
  const [gradeLevel, setGradeLevel] = useState("2nd");
  // Has the teacher manually overridden the grade selector? If yes,
  // we stop auto-syncing so flipping students doesn't clobber the
  // teacher's choice.
  const [gradeTouched, setGradeTouched] = useState(false);

  // Sync the grade dropdown to the picked student's actual grade so
  // generated passages target the right level. Only runs while the
  // teacher hasn't manually overridden the dropdown.
  useEffect(() => {
    if (gradeTouched) return;
    const picked = allChildren.find((c) => c.id === childId);
    if (picked?.grade && picked.grade !== gradeLevel) {
      setGradeLevel(picked.grade);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, allChildrenKey, gradeTouched]);

  const [recording, setRecording] = useState(false);
  const [pending, setPending] = useState(false);
  const [record, setRecord] = useState<RunningRecord | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState(false);
  const [livePreview, setLivePreview] = useState<string>("");
  const [elapsed, setElapsed] = useState<number>(0);
  const [showAddRoster, setShowAddRoster] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  // Passage source: paste your own, or have AI write a target-skill passage.
  const [passageMode, setPassageMode] = useState<"paste" | "generate">("paste");
  const [skillFocus, setSkillFocus] = useState<string>("");
  const [genPending, setGenPending] = useState(false);
  const [genErr, setGenErr] = useState<string | null>(null);

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

  async function generate() {
    setGenErr(null);
    if (!skillFocus.trim()) {
      setGenErr("Pick or type a skill focus first.");
      return;
    }
    setGenPending(true);
    try {
      const res = await aiGeneratePassage({
        // Topic doubles as the kid-readable theme; phonicsPattern is the
        // skill anchor. The model knows to weave the pattern into a
        // grade-appropriate ~40-80 word passage.
        topic: `Practice passage targeting ${skillFocus.trim()}`,
        gradeLevel,
        phonicsPattern: skillFocus.trim(),
      });
      if (!res.ok) {
        setGenErr(res.error);
        return;
      }
      setPassage(res.passage.passage);
    } catch (e: any) {
      setGenErr(e?.message ?? "Could not generate.");
    } finally {
      setGenPending(false);
    }
  }

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
      // Always close the student-facing fullscreen once we have a
      // result or an error so the teacher sees the analysis panel.
      setFullscreen(false);
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
      <div className="space-y-3">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No students in your classroom yet. Add a few here to start recording.
        </div>
        <InlineAddStudents
          classrooms={roster.map((r) => ({
            id: r.classroomId,
            name: r.classroomName,
            gradeLevel: r.classroomGrade,
          }))}
        />
      </div>
    );
  }

  const selectedChild = allChildren.find((c) => c.id === childId);
  const selectedClassroomId = selectedChild?.classroomId ?? roster[0]?.classroomId ?? "";

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-end justify-between gap-2">
          <label className="block flex-1 text-xs font-semibold text-zinc-500">
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
          <RosterControls
            classrooms={roster.map((r) => ({
              id: r.classroomId,
              name: r.classroomName,
              gradeLevel: r.classroomGrade,
            }))}
            classroomId={selectedClassroomId}
            open={showAddRoster}
            setOpen={setShowAddRoster}
          />
        </div>

        {showAddRoster && (
          <div className="mt-3">
            <InlineAddStudents
              classrooms={roster.map((r) => ({
                id: r.classroomId,
                name: r.classroomName,
                gradeLevel: r.classroomGrade,
              }))}
              defaultClassroomId={selectedClassroomId}
            />
          </div>
        )}

        <label className="mt-3 block text-xs font-semibold text-zinc-500">
          Grade
          <select
            value={gradeLevel}
            onChange={(e) => {
              setGradeLevel(e.target.value);
              setGradeTouched(true);
            }}
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

        <div className="mt-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-zinc-500">
              Passage the student is reading
            </span>
            <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-[11px] font-bold dark:border-slate-700 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setPassageMode("paste")}
                disabled={recording || pending}
                className={`rounded-full px-2.5 py-0.5 transition disabled:opacity-60 ${
                  passageMode === "paste"
                    ? "bg-white text-blue-700 shadow-sm dark:bg-slate-800 dark:text-blue-300"
                    : "text-zinc-500"
                }`}
              >
                Paste
              </button>
              <button
                type="button"
                onClick={() => setPassageMode("generate")}
                disabled={recording || pending}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 transition disabled:opacity-60 ${
                  passageMode === "generate"
                    ? "bg-white text-blue-700 shadow-sm dark:bg-slate-800 dark:text-blue-300"
                    : "text-zinc-500"
                }`}
              >
                <Wand2 className="h-3 w-3" />
                Generate
              </button>
            </div>
          </div>

          {passageMode === "generate" && (
            <div className="mt-2 rounded-2xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/40 dark:bg-blue-950/30">
              <div className="text-[10px] font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">
                Skill focus for {gradeLevel}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {presetSkills(gradeLevel).map((s) => {
                  const isActive = skillFocus === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSkillFocus(s)}
                      disabled={recording || pending || genPending}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition disabled:opacity-60 ${
                        isActive
                          ? "border-blue-500 bg-blue-600 text-white"
                          : "border-blue-200 bg-white text-blue-700 hover:bg-blue-100 dark:border-blue-900/40 dark:bg-slate-900 dark:text-blue-300"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={skillFocus}
                onChange={(e) => setSkillFocus(e.target.value)}
                placeholder="Or type a skill (e.g. -tion suffix)"
                disabled={recording || pending || genPending}
                className="mt-2 w-full rounded-lg border border-blue-200 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-60 dark:border-blue-900/40 dark:bg-slate-900"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={generate}
                  disabled={recording || pending || genPending || !skillFocus.trim()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {genPending ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Generating…
                    </>
                  ) : passage ? (
                    <>
                      <Wand2 className="h-3 w-3" />
                      Try another
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-3 w-3" />
                      Generate passage
                    </>
                  )}
                </button>
                {genErr && (
                  <span className="text-xs font-semibold text-red-700">{genErr}</span>
                )}
              </div>
            </div>
          )}

          <textarea
            rows={6}
            value={passage}
            onChange={(e) => setPassage(e.target.value)}
            disabled={recording || pending}
            placeholder={
              passageMode === "generate"
                ? "Generated passage will appear here, edit if you like…"
                : "Paste the text the student will read aloud…"
            }
            className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 shadow-inner focus:border-blue-500 focus:outline-none disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            style={{
              fontFamily: FRIENDLY_FONT,
              fontSize: passageFontPx(gradeLevel),
              lineHeight: 1.7,
              letterSpacing: "0.01em",
            }}
          />
        </div>
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
        {passage.trim() && !pending && (
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-50 dark:border-blue-800 dark:bg-slate-900 dark:text-blue-300"
          >
            <Maximize2 className="h-3 w-3" />
            Hand to student
          </button>
        )}
      </div>

      {fullscreen && (
        <StudentReadView
          studentName={selectedChild?.first_name ?? "Student"}
          passage={passage}
          gradeLevel={gradeLevel}
          recording={recording}
          pending={pending}
          elapsed={elapsed}
          livePreview={livePreview}
          onStart={start}
          onStop={stop}
          onClose={() => setFullscreen(false)}
        />
      )}

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
        <ResultsPanel
          record={record}
          studentName={selectedChild.first_name}
          studentId={selectedChild.id}
          classroomId={selectedChild.classroomId}
        />
      )}
    </div>
  );
}

function presetSkills(grade: string): string[] {
  // Common phonics / fluency targets per grade. Teachers can also type
  // their own. Source: K-4 scope-and-sequence used by major basal
  // programs (Wilson, Fundations, F&P).
  switch (grade) {
    case "K":
      return [
        "short a (CVC)",
        "short i (CVC)",
        "short o (CVC)",
        "consonant blends",
        "sight words",
        "final-e",
      ];
    case "1st":
      return [
        "long vowels (silent e)",
        "digraphs sh/ch/th",
        "vowel teams ee/ea",
        "r-controlled ar/or",
        "sight words",
        "blends",
      ];
    case "2nd":
      return [
        "r-controlled vowels",
        "vowel teams",
        "diphthongs ou/ow",
        "soft c and g",
        "contractions",
        "common suffixes",
      ];
    case "3rd":
      return [
        "multisyllabic words",
        "prefixes re-/un-/dis-",
        "suffixes -tion/-sion",
        "soft c and g",
        "compound words",
        "vowel teams",
      ];
    case "4th":
      return [
        "schwa",
        "Greek roots",
        "Latin roots",
        "prefixes/suffixes",
        "multimorphemic words",
        "homophones",
      ];
    default:
      return ["short vowels", "long vowels", "digraphs", "sight words"];
  }
}

function StudentReadView({
  studentName,
  passage,
  gradeLevel,
  recording,
  pending,
  elapsed,
  livePreview,
  onStart,
  onStop,
  onClose,
}: {
  studentName: string;
  passage: string;
  gradeLevel: string;
  recording: boolean;
  pending: boolean;
  elapsed: number;
  livePreview: string;
  onStart: () => void;
  onStop: () => void;
  onClose: () => void;
}) {
  // Lock body scroll while the kid view is up.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Fit-to-viewport sizing. Start at the ideal size for the grade,
  // then shrink iteratively if the passage overflows the available
  // box. Floor at 18px so we never make it unreadably small.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);
  const idealSize = Math.round(passageFontPx(gradeLevel) * 1.6);
  const [fsSize, setFsSize] = useState(idealSize);

  useEffect(() => {
    setFsSize(idealSize);
  }, [idealSize, passage]);

  useEffect(() => {
    const container = containerRef.current;
    const article = articleRef.current;
    if (!container || !article) return;
    let raf: number | null = null;
    const fit = () => {
      // Reset to ideal first so we measure with the largest size.
      let size = idealSize;
      article.style.fontSize = `${size}px`;
      const min = 18;
      // 12 iterations is more than enough for any realistic passage.
      for (let i = 0; i < 12; i++) {
        if (article.scrollHeight <= container.clientHeight) break;
        if (size <= min) break;
        size -= 2;
        article.style.fontSize = `${size}px`;
      }
      setFsSize(size);
    };
    raf = requestAnimationFrame(fit);
    const ro = new ResizeObserver(() => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    });
    ro.observe(container);
    window.addEventListener("orientationchange", fit);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("orientationchange", fit);
    };
  }, [passage, idealSize, recording]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-gradient-to-b from-blue-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white/70 px-5 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
          <BookOpen className="h-4 w-4" />
          {studentName}&apos;s passage
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={recording}
          className="inline-flex items-center gap-1 rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Passage area — auto-fits to available height so the kid
          doesn't scroll while reading. */}
      <div
        ref={containerRef}
        className="flex flex-1 items-center justify-center overflow-hidden px-6 py-6 sm:px-12"
      >
        <article
          ref={articleRef as any}
          className="mx-auto w-full max-w-3xl whitespace-pre-line text-zinc-900 dark:text-slate-100"
          style={{
            fontFamily: FRIENDLY_FONT,
            fontSize: fsSize,
            lineHeight: 1.65,
            letterSpacing: "0.01em",
          }}
        >
          {passage}
        </article>
      </div>

      {/* Live preview — only shows while recording */}
      {recording && (
        <div className="border-t border-blue-200 bg-blue-50 px-6 py-3 text-center dark:border-blue-900/40 dark:bg-blue-950/30">
          <div className="text-[10px] font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">
            <Activity className="mr-1 inline h-3 w-3" />
            Listening
          </div>
          <div
            className="mx-auto mt-1 max-w-3xl text-base text-zinc-800 dark:text-slate-100"
            style={{ fontFamily: FRIENDLY_FONT }}
          >
            {livePreview || "…"}
          </div>
        </div>
      )}

      {/* Bottom record bar */}
      <div className="flex items-center justify-center gap-4 border-t border-zinc-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={recording ? onStop : onStart}
          disabled={pending}
          className={`flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition disabled:opacity-60 ${
            recording
              ? "animate-pulse bg-red-600 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          aria-label={recording ? "Stop reading" : "Start reading"}
        >
          {recording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
        </button>
        <div className="text-left">
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            {recording ? "Reading" : pending ? "Done, scoring…" : "Ready"}
          </div>
          <div
            className="text-2xl font-extrabold text-zinc-900 dark:text-white"
            style={{ fontFamily: FRIENDLY_FONT }}
          >
            {recording
              ? formatTime(elapsed)
              : pending
              ? "—"
              : "Tap to start"}
          </div>
        </div>
      </div>
    </div>
  );
}

function passageFontPx(grade: string): number {
  // Bigger type for emerging readers, smaller for fluent readers.
  // Tested ranges from K iPad reading research, 22-26pt for K-1.
  switch (grade) {
    case "K":
      return 26;
    case "1st":
      return 22;
    case "2nd":
      return 19;
    case "3rd":
      return 17;
    case "4th":
      return 16;
    default:
      return 18;
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function ResultsPanel({
  record,
  studentName,
  studentId,
  classroomId,
}: {
  record: RunningRecord;
  studentName: string;
  studentId: string;
  classroomId: string;
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

      {record.focusArea && (
        <SuggestedPractice
          focusArea={record.focusArea}
          studentId={studentId}
          studentName={studentName}
          classroomId={classroomId}
        />
      )}

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

type Suggestion = {
  standardId: string;
  title: string;
  grade: string;
  domain: string;
  why: string;
};

function SuggestedPractice({
  focusArea,
  studentId,
  studentName,
  classroomId,
}: {
  focusArea: string;
  studentId: string;
  studentName: string;
  classroomId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  // Map standardId -> "idle" | "assigning" | "assigned" | "error".
  const [statusByStandard, setStatusByStandard] = useState<
    Record<string, "idle" | "assigning" | "assigned" | "error">
  >({});
  const [assignErr, setAssignErr] = useState<string | null>(null);
  const [, startAssign] = useTransition();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    setSuggestions([]);
    fetch("/api/running-record-suggest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ focusArea, studentId }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (cancelled) return;
        if (!json.ok) {
          setErr(json.error ?? "Could not pick lessons.");
        } else {
          setSuggestions(json.suggestions as Suggestion[]);
        }
      })
      .catch((e) => {
        if (!cancelled) setErr(e?.message ?? "Could not pick lessons.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [focusArea, studentId]);

  function assign(s: Suggestion) {
    setAssignErr(null);
    setStatusByStandard((m) => ({ ...m, [s.standardId]: "assigning" }));
    startAssign(async () => {
      const res = await createAssignment({
        classroomId,
        kind: "readee_lesson",
        sourceId: s.standardId,
        title: s.title,
        assignedChildIds: [studentId],
      });
      if (!res.ok) {
        setStatusByStandard((m) => ({ ...m, [s.standardId]: "error" }));
        setAssignErr(res.error);
        return;
      }
      setStatusByStandard((m) => ({ ...m, [s.standardId]: "assigned" }));
    });
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Finding practice for {studentName}…
      </div>
    );
  }
  if (err || suggestions.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-xs text-zinc-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        {err ?? "No matching lessons in the catalog yet — try a different passage."}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
        <BookOpen className="h-3 w-3" />
        Suggested practice
      </div>
      <p className="mt-1 text-xs text-zinc-500 dark:text-slate-400">
        Targeted lessons matching &quot;{focusArea}&quot;.
      </p>
      <ul className="mt-3 grid gap-2">
        {suggestions.map((s) => {
          const status = statusByStandard[s.standardId] ?? "idle";
          return (
            <li
              key={s.standardId}
              className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                    {s.standardId}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    {s.grade}
                  </span>
                </div>
                <div className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
                  {s.title}
                </div>
                {s.why && (
                  <div className="mt-1 text-xs text-zinc-500 dark:text-slate-400">
                    {s.why}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => assign(s)}
                disabled={status === "assigning" || status === "assigned"}
                className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition disabled:opacity-60 ${
                  status === "assigned"
                    ? "bg-emerald-600 text-white"
                    : status === "error"
                    ? "bg-red-600 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {status === "assigning" ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Assigning…
                  </>
                ) : status === "assigned" ? (
                  <>
                    <Check className="h-3 w-3" />
                    Assigned
                  </>
                ) : (
                  <>Assign to {studentName}</>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {assignErr && (
        <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-red-50 px-2 py-1.5 text-xs font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
          {assignErr}
        </div>
      )}
    </div>
  );
}

function RosterControls({
  classrooms,
  classroomId,
  open,
  setOpen,
}: {
  classrooms: { id: string; name: string; gradeLevel?: string | null }[];
  classroomId: string;
  open: boolean;
  setOpen: (next: boolean) => void;
}) {
  if (classrooms.length === 0) return null;
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 rounded-full border border-blue-300 bg-white px-2.5 py-1 text-[11px] font-bold text-blue-700 transition hover:bg-blue-50 dark:border-blue-800 dark:bg-slate-900 dark:text-blue-300"
      >
        + Add students
      </button>
      {classroomId && (
        <Link
          href={`/classroom/${classroomId}`}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-500 transition hover:text-blue-700 dark:text-slate-400"
          title="Open the classroom for full roster management"
        >
          Manage roster
          <ExternalLink className="h-3 w-3" />
        </Link>
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
