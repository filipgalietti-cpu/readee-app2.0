"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { getAllStandards, GRADE_LABELS } from "@/lib/data/all-standards";
import lessonsData from "@/lib/data/lessons.json";
import { useAudio } from "@/lib/audio/use-audio";
import { supabaseBrowser } from "@/lib/supabase/client";

/* ── Types ──────────────────────────────────────────── */

interface AuditQuestion {
  id: string;
  source: "standards" | "lesson-practice" | "lesson-read";
  level: string;
  lessonTitle: string;
  prompt: string;
  choices: string[];
  correct: string;
  hint?: string;
  imageUrl: string;
  audioUrl?: string;
  hintAudioUrl?: string;
  lessonId?: string;
  standardId?: string;
}

interface AuditEntry {
  rating: "up" | "down" | null;
  comment: string;
  reviewer: string;
  reviewedAt: string;
}

type AuditMap = Record<string, AuditEntry>;

type FilterTab =
  | "all"
  | "standards"
  | "lesson-practice"
  | "lesson-read"
  | "needs-review"
  | "thumbs-down";

type GradeFilter = "all" | "Pre-K" | "Kindergarten" | "1st Grade" | "2nd Grade" | "3rd Grade" | "4th Grade";

const GRADE_ORDER: GradeFilter[] = ["all", "Pre-K", "Kindergarten", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade"];
const GRADE_SHORT: Record<GradeFilter, string> = {
  all: "All",
  "Pre-K": "Pre-K",
  Kindergarten: "K",
  "1st Grade": "1st",
  "2nd Grade": "2nd",
  "3rd Grade": "3rd",
  "4th Grade": "4th",
};

const LOCAL_KEY = "readee_question_audit";
const SUPABASE_IMG =
  "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public/images";
const CHOICE_LETTERS = ["A", "B", "C", "D"];
const ACCENT_COLORS = ["#60a5fa", "#4ade80", "#fb923c", "#a78bfa"];

const LEVEL_LABELS: Record<string, string> = {
  "pre-k": "Pre-K",
  kindergarten: "Kindergarten",
  "1st": "1st Grade",
  "2nd": "2nd Grade",
  "3rd": "3rd Grade",
  "4th": "4th Grade",
};

/* ── Build flat question list ───────────────────────── */

function buildQuestions(): AuditQuestion[] {
  const questions: AuditQuestion[] = [];

  // 1. Standards MCQ — all grades
  const allStandards = getAllStandards();
  for (const standard of allStandards) {
    // Determine grade label from standard_id prefix (e.g. RL.K.1 → Kindergarten, RL.1.1 → 1st Grade)
    const stdId = standard.standard_id;
    const gradeMatch = stdId.match(/\.([^.]+)\./);
    const gradeChar = gradeMatch ? gradeMatch[1] : "K";
    const gradeLabel = gradeChar === "K" ? "Kindergarten"
      : gradeChar === "1" ? "1st Grade"
      : gradeChar === "2" ? "2nd Grade"
      : gradeChar === "3" ? "3rd Grade"
      : gradeChar === "4" ? "4th Grade"
      : gradeChar;

    for (const q of standard.questions) {
      const qStdId = q.id.split("-Q")[0];
      const qNum = q.id.split("-Q")[1];
      questions.push({
        id: q.id,
        source: "standards",
        level: gradeLabel,
        lessonTitle: `Standard ${qStdId}`,
        prompt: q.prompt,
        choices: q.choices ?? [],
        correct: q.correct,
        hint: q.hint,
        imageUrl: `${SUPABASE_IMG}/${qStdId}/q${qNum}.png`,
        audioUrl: q.audio_url,
        hintAudioUrl: q.hint_audio_url,
        standardId: qStdId,
      });
    }
  }

  // 2. Lesson Practice & Read — with audio URLs
  const levels = (lessonsData as any).levels;
  for (const levelKey of Object.keys(levels)) {
    const level = levels[levelKey];
    if (!level.lessons) continue;
    for (const lesson of level.lessons) {
      const levelLabel = LEVEL_LABELS[levelKey] || levelKey;

      if (lesson.practice?.questions) {
        lesson.practice.questions.forEach((q: any, idx: number) => {
          questions.push({
            id: q.question_id,
            source: "lesson-practice",
            level: levelLabel,
            lessonTitle: lesson.title || lesson.id,
            prompt: q.prompt,
            choices: q.choices,
            correct: q.correct,
            hint: q.hint,
            imageUrl: `${SUPABASE_IMG}/${lesson.id}/q${idx + 1}.png`,
            audioUrl: q.audio_url,
            hintAudioUrl: q.hint_audio_url,
            lessonId: lesson.id,
          });
        });
      }
      if (lesson.read?.questions) {
        lesson.read.questions.forEach((q: any, idx: number) => {
          questions.push({
            id: q.question_id,
            source: "lesson-read",
            level: levelLabel,
            lessonTitle: lesson.title || lesson.id,
            prompt: q.prompt,
            choices: q.choices,
            correct: q.correct,
            hint: q.hint,
            imageUrl: `${SUPABASE_IMG}/${lesson.id}/rq${idx + 1}.png`,
            audioUrl: q.audio_url,
            hintAudioUrl: q.hint_audio_url,
            lessonId: lesson.id,
          });
        });
      }
    }
  }

  return questions;
}

/* ── Supabase helpers ──────────────────────────────── */

async function loadFromSupabase(): Promise<AuditMap | null> {
  try {
    const sb = supabaseBrowser();
    const { data, error } = await sb
      .from("question_audit_feedback")
      .select("question_id, rating, comment, updated_at");
    if (error) return null;
    const map: AuditMap = {};
    for (const row of data || []) {
      map[row.question_id] = {
        rating: row.rating,
        comment: row.comment || "",
        reviewer: "",
        reviewedAt: row.updated_at,
      };
    }
    return map;
  } catch {
    return null;
  }
}

async function upsertToSupabase(
  questionId: string,
  rating: "up" | "down" | null,
  comment: string
): Promise<boolean> {
  try {
    const sb = supabaseBrowser();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return false;

    const { error } = await sb.from("question_audit_feedback").upsert(
      {
        question_id: questionId,
        user_id: user.id,
        rating,
        comment,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "question_id,user_id" }
    );
    return !error;
  } catch {
    return false;
  }
}

/* ── localStorage fallback ────────────────────────── */

function loadLocal(): AuditMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocal(map: AuditMap) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
}

/* ── Speaker button ────────────────────────────────── */

function SpeakerButton({
  label,
  onClick,
  active,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
        active
          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 animate-pulse"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
      }`}
      aria-label={label}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M11 5L6 9H2v6h4l5 4V5z"
        />
      </svg>
      {label}
    </button>
  );
}

/* ── Tab button ────────────────────────────────────── */

function TabButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
        active
          ? "bg-indigo-600 text-white shadow-md"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      }`}
    >
      {label} ({count})
    </button>
  );
}

/* ── Main Page ──────────────────────────────────────── */

export default function QuestionAuditPage() {
  const allQuestions = useMemo(() => buildQuestions(), []);
  const [auditMap, setAuditMap] = useState<AuditMap>({});
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>("all");
  const [tab, setTab] = useState<FilterTab>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [comment, setComment] = useState("");
  const [imgError, setImgError] = useState(false);
  const [useLive, setUseLive] = useState(false);
  const [saving, setSaving] = useState(false);
  const audioUnlockedRef = useRef(false);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);

  const { playUrl: rawPlayUrl, isSpeaking, unlockAudio, stop } = useAudio();

  const playUrl = useCallback(
    (url: string) => {
      setPlayingUrl(url);
      rawPlayUrl(url);
    },
    [rawPlayUrl]
  );

  // When audio stops, clear playingUrl
  useEffect(() => {
    if (!isSpeaking) setPlayingUrl(null);
  }, [isSpeaking]);

  // Load data on mount — try Supabase first, fall back to localStorage
  useEffect(() => {
    let mounted = true;
    loadFromSupabase().then((sbData) => {
      if (!mounted) return;
      if (sbData) {
        setUseLive(true);
        // Merge with localStorage (localStorage has any existing reviews)
        const local = loadLocal();
        setAuditMap({ ...local, ...sbData });
      } else {
        setAuditMap(loadLocal());
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Counts
  const reviewedCount = Object.values(auditMap).filter(
    (e) => e.rating !== null
  ).length;

  // Questions filtered by grade
  const gradeQuestions = useMemo(() => {
    if (gradeFilter === "all") return allQuestions;
    return allQuestions.filter((q) => q.level === gradeFilter);
  }, [allQuestions, gradeFilter]);

  // Per-grade counts for the chapter bar
  const gradeCounts = useMemo(() => {
    const counts: Record<GradeFilter, { total: number; reviewed: number; flagged: number }> = {} as any;
    for (const g of GRADE_ORDER) {
      counts[g] = { total: 0, reviewed: 0, flagged: 0 };
    }
    for (const q of allQuestions) {
      const g = q.level as GradeFilter;
      if (counts[g]) {
        counts[g].total++;
        const entry = auditMap[q.id];
        if (entry?.rating) counts[g].reviewed++;
        if (entry?.rating === "down") counts[g].flagged++;
      }
      counts.all.total++;
      const entry = auditMap[q.id];
      if (entry?.rating) counts.all.reviewed++;
      if (entry?.rating === "down") counts.all.flagged++;
    }
    return counts;
  }, [allQuestions, auditMap]);

  const counts = useMemo(() => {
    let standards = 0;
    let practice = 0;
    let read = 0;
    let needsReview = 0;
    let thumbsDown = 0;
    for (const q of gradeQuestions) {
      if (q.source === "standards") standards++;
      if (q.source === "lesson-practice") practice++;
      if (q.source === "lesson-read") read++;
      const entry = auditMap[q.id];
      if (!entry || entry.rating === null) needsReview++;
      if (entry?.rating === "down") thumbsDown++;
    }
    return { standards, practice, read, needsReview, thumbsDown };
  }, [gradeQuestions, auditMap]);

  // Filter
  const filtered = useMemo(() => {
    return gradeQuestions.filter((q) => {
      if (tab === "all") return true;
      if (tab === "standards") return q.source === "standards";
      if (tab === "lesson-practice") return q.source === "lesson-practice";
      if (tab === "lesson-read") return q.source === "lesson-read";
      const entry = auditMap[q.id];
      if (tab === "needs-review") return !entry || entry.rating === null;
      if (tab === "thumbs-down") return entry?.rating === "down";
      return true;
    });
  }, [gradeQuestions, auditMap, tab]);

  // Current question
  const safeIndex = Math.min(currentIndex, Math.max(0, filtered.length - 1));
  const q = filtered[safeIndex] as AuditQuestion | undefined;
  const audit = q ? auditMap[q.id] : undefined;

  // Sync comment field when navigating
  useEffect(() => {
    setComment(audit?.comment ?? "");
    setImgError(false);
  }, [safeIndex, audit?.comment]);

  // Reset index when filter or grade changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [tab, gradeFilter]);

  // Ensure audio is unlocked
  const ensureAudio = useCallback(() => {
    if (!audioUnlockedRef.current) {
      unlockAudio();
      audioUnlockedRef.current = true;
    }
  }, [unlockAudio]);

  // Navigation
  const goPrev = useCallback(() => {
    stop();
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, [stop]);

  const goNext = useCallback(() => {
    stop();
    setCurrentIndex((i) => Math.min(filtered.length - 1, i + 1));
  }, [filtered.length, stop]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goPrev, goNext]);

  // Persist rating
  const handleRate = useCallback(
    (id: string, rating: "up" | "down" | null) => {
      setAuditMap((prev) => {
        const existing = prev[id] || {
          rating: null,
          comment: "",
          reviewer: "",
          reviewedAt: "",
        };
        const next: AuditMap = {
          ...prev,
          [id]: { ...existing, rating, reviewedAt: new Date().toISOString() },
        };
        saveLocal(next);
        return next;
      });
      // Fire-and-forget Supabase save
      if (useLive) {
        const existing = auditMap[id];
        upsertToSupabase(id, rating, existing?.comment || "");
      }
    },
    [useLive, auditMap]
  );

  // Persist comment
  const handleSaveComment = useCallback(
    async (id: string, text: string) => {
      setSaving(true);
      setAuditMap((prev) => {
        const existing = prev[id] || {
          rating: null,
          comment: "",
          reviewer: "",
          reviewedAt: "",
        };
        const next: AuditMap = {
          ...prev,
          [id]: {
            ...existing,
            comment: text,
            reviewedAt: new Date().toISOString(),
          },
        };
        saveLocal(next);
        return next;
      });
      if (useLive) {
        const existing = auditMap[id];
        await upsertToSupabase(id, existing?.rating || null, text);
      }
      setSaving(false);
    },
    [useLive, auditMap]
  );

  // Export
  const handleExport = useCallback(() => {
    // Build a rich export with question text, not just IDs
    const exportData = allQuestions.map((q) => {
      const entry = auditMap[q.id];
      return {
        id: q.id,
        source: q.source,
        level: q.level,
        lesson: q.lessonTitle,
        prompt: q.prompt,
        correct: q.correct,
        rating: entry?.rating || null,
        comment: entry?.comment || "",
        hasImage: true,
        hasAudio: !!q.audioUrl,
        hasHintAudio: !!q.hintAudioUrl,
      };
    });
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `question-audit-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [allQuestions, auditMap]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/dashboard"
            className="flex-shrink-0 w-9 h-9 rounded-xl bg-zinc-100 dark:bg-slate-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-slate-700 transition-colors"
          >
            <svg
              className="w-5 h-5 text-zinc-600 dark:text-slate-300"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              Question Audit
            </h1>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold text-sm">
            {gradeCounts[gradeFilter].reviewed} / {gradeCounts[gradeFilter].total}
          </span>
          <button
            onClick={handleExport}
            className="px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 font-semibold text-sm transition-colors"
          >
            Export
          </button>
        </div>

        {/* Live status */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className={`w-2 h-2 rounded-full ${useLive ? "bg-emerald-500" : "bg-amber-500"}`}
          />
          <span className="text-xs text-zinc-500 dark:text-slate-400">
            {useLive
              ? "Live - feedback syncs to cloud"
              : "Offline - saving to this browser only"}
          </span>
        </div>

        {/* Grade chapters */}
        <div className="grid grid-cols-7 gap-1.5 mb-4">
          {GRADE_ORDER.map((g) => {
            const gc = gradeCounts[g];
            const isActive = gradeFilter === g;
            const pct = gc.total > 0 ? Math.round((gc.reviewed / gc.total) * 100) : 0;
            return (
              <button
                key={g}
                onClick={() => setGradeFilter(g)}
                className={`relative flex flex-col items-center px-1 py-2.5 rounded-xl font-semibold text-xs transition-all overflow-hidden ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 border border-zinc-200 dark:border-slate-700"
                }`}
              >
                {/* Progress bar background */}
                {!isActive && pct > 0 && (
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-emerald-100 dark:bg-emerald-900/30 transition-all"
                    style={{ height: `${pct}%` }}
                  />
                )}
                <span className="relative z-10 font-bold text-sm">{GRADE_SHORT[g]}</span>
                <span className={`relative z-10 text-[10px] mt-0.5 ${isActive ? "text-indigo-200" : "text-zinc-400 dark:text-slate-500"}`}>
                  {gc.reviewed}/{gc.total}
                </span>
                {gc.flagged > 0 && (
                  <span className={`relative z-10 text-[10px] ${isActive ? "text-red-200" : "text-red-400"}`}>
                    {gc.flagged} flagged
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          <TabButton
            label="All"
            count={gradeQuestions.length}
            active={tab === "all"}
            onClick={() => setTab("all")}
          />
          <TabButton
            label="Standards"
            count={counts.standards}
            active={tab === "standards"}
            onClick={() => setTab("standards")}
          />
          <TabButton
            label="Practice"
            count={counts.practice}
            active={tab === "lesson-practice"}
            onClick={() => setTab("lesson-practice")}
          />
          <TabButton
            label="Read"
            count={counts.read}
            active={tab === "lesson-read"}
            onClick={() => setTab("lesson-read")}
          />
          <TabButton
            label="Unreviewed"
            count={counts.needsReview}
            active={tab === "needs-review"}
            onClick={() => setTab("needs-review")}
          />
          <TabButton
            label="Flagged"
            count={counts.thumbsDown}
            active={tab === "thumbs-down"}
            onClick={() => setTab("thumbs-down")}
          />
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-zinc-400 dark:text-slate-500">
            <p className="text-lg font-semibold">
              No questions match this filter
            </p>
          </div>
        )}

        {/* Single question view */}
        {q && (
          <div className="rounded-2xl border-2 border-indigo-400 dark:border-indigo-500 bg-white dark:bg-slate-800/80 overflow-hidden">
            {/* Navigation header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-slate-800/50 border-b border-zinc-100 dark:border-slate-700">
              <button
                onClick={goPrev}
                disabled={safeIndex === 0}
                className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 border border-zinc-200 dark:border-slate-600 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-slate-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5 text-zinc-600 dark:text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="flex-1 text-center">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-mono font-bold text-xs">
                  {q.id}
                </span>
                <span className="ml-2 text-sm text-zinc-500 dark:text-slate-400">
                  {safeIndex + 1} of {filtered.length}
                </span>
              </div>

              <button
                onClick={goNext}
                disabled={safeIndex >= filtered.length - 1}
                className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 border border-zinc-200 dark:border-slate-600 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-slate-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5 text-zinc-600 dark:text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Question content */}
            <div className="px-4 pb-4">
              <div className="pt-3 max-w-lg mx-auto space-y-3">
                {/* Source & lesson info */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                      q.source === "standards"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                        : q.source === "lesson-practice"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                          : "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300"
                    }`}
                  >
                    {q.source === "standards"
                      ? `Standard: ${q.standardId}`
                      : q.source === "lesson-practice"
                        ? "Practice"
                        : "Read"}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-slate-400">
                    {q.level} &middot; {q.lessonTitle}
                  </span>

                  {/* Rating indicator */}
                  {audit?.rating && (
                    <span
                      className={`text-lg ${
                        audit.rating === "up"
                          ? "text-emerald-500"
                          : "text-red-500"
                      }`}
                    >
                      {audit.rating === "up" ? "\u{1F44D}" : "\u{1F44E}"}
                    </span>
                  )}
                </div>

                {/* Image */}
                {!imgError ? (
                  <div className="rounded-xl overflow-hidden flex justify-center bg-zinc-100 dark:bg-slate-700/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={q.imageUrl}
                      alt={`Question ${q.id}`}
                      className="max-h-44 w-auto rounded-xl"
                      onError={() => setImgError(true)}
                    />
                  </div>
                ) : (
                  <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-center">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                      Image missing
                    </p>
                    <p className="text-xs text-red-500 dark:text-red-400/70 mt-1 break-all">
                      {q.imageUrl.split("/images/")[1]}
                    </p>
                  </div>
                )}

                {/* Prompt + Audio buttons */}
                <div className="rounded-xl bg-zinc-50 dark:bg-slate-700/50 p-4">
                  <p className="text-base leading-relaxed text-zinc-900 dark:text-white/90 whitespace-pre-line">
                    {q.prompt}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {q.audioUrl ? (
                      <SpeakerButton
                        label="Question"
                        active={isSpeaking && playingUrl === q.audioUrl}
                        onClick={() => {
                          ensureAudio();
                          playUrl(q.audioUrl!);
                        }}
                      />
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636"
                          />
                        </svg>
                        No audio
                      </span>
                    )}
                    {q.hintAudioUrl && (
                      <SpeakerButton
                        label="Hint"
                        active={isSpeaking && playingUrl === q.hintAudioUrl}
                        onClick={() => {
                          ensureAudio();
                          playUrl(q.hintAudioUrl!);
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Choices — 2x2 grid */}
                <div className="grid grid-cols-2 gap-2">
                  {q.choices.map((choice, i) => {
                    const isCorrect = choice === q.correct;
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 ${
                          isCorrect
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-600"
                            : "border-zinc-200 bg-white dark:bg-slate-800 dark:border-slate-600"
                        }`}
                      >
                        <span
                          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{
                            backgroundColor: ACCENT_COLORS[i % 4],
                          }}
                        >
                          {CHOICE_LETTERS[i]}
                        </span>
                        <span
                          className={`flex-1 text-sm font-medium leading-tight ${
                            isCorrect
                              ? "text-emerald-800 dark:text-emerald-200"
                              : "text-zinc-700 dark:text-slate-300"
                          }`}
                        >
                          {choice}
                        </span>
                        {isCorrect && (
                          <svg
                            className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={3}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Hint */}
                {q.hint && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-700">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                        Hint
                      </p>
                      {q.hintAudioUrl && (
                        <SpeakerButton
                          label="Play Hint"
                          active={
                            isSpeaking && playingUrl === q.hintAudioUrl
                          }
                          onClick={() => {
                            ensureAudio();
                            playUrl(q.hintAudioUrl!);
                          }}
                        />
                      )}
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      {q.hint}
                    </p>
                  </div>
                )}

                {/* Rating + Comment */}
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        handleRate(
                          q.id,
                          audit?.rating === "up" ? null : "up"
                        )
                      }
                      className={`flex-1 py-3 rounded-xl font-semibold text-base transition-all ${
                        audit?.rating === "up"
                          ? "bg-emerald-500 text-white shadow-md"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      }`}
                    >
                      Good
                    </button>
                    <button
                      onClick={() =>
                        handleRate(
                          q.id,
                          audit?.rating === "down" ? null : "down"
                        )
                      }
                      className={`flex-1 py-3 rounded-xl font-semibold text-base transition-all ${
                        audit?.rating === "down"
                          ? "bg-red-500 text-white shadow-md"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      }`}
                    >
                      Flag
                    </button>
                  </div>

                  {/* Comment */}
                  <div className="flex gap-2">
                    <textarea
                      placeholder="Leave feedback..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSaveComment(q.id, comment);
                        }
                      }}
                      rows={2}
                      className="flex-1 px-3 py-2 rounded-xl border-2 border-zinc-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-slate-500 outline-none focus:border-indigo-400 resize-none"
                    />
                    <button
                      onClick={() => handleSaveComment(q.id, comment)}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 self-end"
                    >
                      {saving ? "..." : "Save"}
                    </button>
                  </div>
                </div>

                {/* Next / Prev */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={goPrev}
                    disabled={safeIndex === 0}
                    className="flex-1 py-3 rounded-xl bg-zinc-100 dark:bg-slate-700 text-zinc-700 dark:text-slate-300 font-semibold text-sm hover:bg-zinc-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={goNext}
                    disabled={safeIndex >= filtered.length - 1}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
