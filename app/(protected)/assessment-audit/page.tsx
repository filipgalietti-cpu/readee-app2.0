"use client";

import { useState, useEffect, useCallback, useRef } from "react";

import manifestRaw from "@/scripts/assessment_mixed_manifest.json";
import bankRaw from "@/lib/assessment/mixed-bank-k4.json";
import { useAuditReviews } from "@/lib/audit/use-audit-reviews";
import { ReviewList } from "@/app/components/audit/ReviewList";
import { MigrateLocalStorage } from "@/app/components/audit/MigrateLocalStorage";

/* ── Types ────────────────────────────────────────────── */

type QuestionType = "mcq" | "category_sort" | "missing_word" | "sentence_build";
type GradeFilter = "all" | "kindergarten" | "1st" | "2nd" | "3rd" | "4th";
type TypeFilter = "all" | QuestionType;
type Rating = "good" | "flagged";

interface AuditQuestion {
  id: string;
  level: string;
  grade_key: string;
  standard: string;
  type: QuestionType;
  difficulty: string;
  prompt: string;
  stimulus: string;
  choices: string[];
  categories: string[];
  categoryItems?: Record<string, string[]>;
  items: string[];
  sentence_words: string[];
  words: string[];
  correct: string;
  tts_ssml: string;
  hint_tts_ssml: string;
  audio_url: string;
  hint_audio_url: string;
  image_url: string;
  image_prompt: string;
}

/* ── Build merged question list ───────────────────────── */

function buildQuestions(): AuditQuestion[] {
  const bankLookup: Record<string, any> = {};
  for (const qs of Object.values(
    (bankRaw as { grades: Record<string, any[]> }).grades
  )) {
    for (const q of qs) bankLookup[q.id] = q;
  }

  return (manifestRaw as any[]).map((m: any) => {
    const bankQ = bankLookup[m.id];
    return { ...m, categoryItems: bankQ?.categoryItems ?? undefined };
  });
}

const ALL_QUESTIONS = buildQuestions();

/* ── Constants ────────────────────────────────────────── */

const GRADE_LABELS: { key: GradeFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "kindergarten", label: "K" },
  { key: "1st", label: "1st" },
  { key: "2nd", label: "2nd" },
  { key: "3rd", label: "3rd" },
  { key: "4th", label: "4th" },
];

const TYPE_LABELS: { key: TypeFilter; label: string }[] = [
  { key: "all", label: "All Types" },
  { key: "mcq", label: "MCQ" },
  { key: "category_sort", label: "Category Sort" },
  { key: "missing_word", label: "Missing Word" },
  { key: "sentence_build", label: "Sentence Build" },
];

const TYPE_BADGE: Record<QuestionType, { bg: string; text: string }> = {
  mcq: { bg: "bg-blue-100 dark:bg-blue-900/50", text: "text-blue-700 dark:text-blue-300" },
  category_sort: { bg: "bg-purple-100 dark:bg-purple-900/50", text: "text-purple-700 dark:text-purple-300" },
  missing_word: { bg: "bg-amber-100 dark:bg-amber-900/50", text: "text-amber-700 dark:text-amber-300" },
  sentence_build: { bg: "bg-emerald-100 dark:bg-emerald-900/50", text: "text-emerald-700 dark:text-emerald-300" },
};

const DIFFICULTY_BADGE: Record<string, string> = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const CHOICE_COLORS = [
  "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700",
  "bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:border-purple-700",
  "bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700",
  "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-700",
];

const BUCKET_COLORS = [
  { header: "bg-blue-500 text-white", body: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700" },
  { header: "bg-emerald-500 text-white", body: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700" },
  { header: "bg-purple-500 text-white", body: "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700" },
];

/* ── Component ────────────────────────────────────────── */

export default function AssessmentAuditPage() {
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [showFlagged, setShowFlagged] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [showSSML, setShowSSML] = useState(false);
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { reviews: allItemReviews, myReviews, loading: reviewsLoading, userId, upsertReview, deleteReview, exportCsv } = useAuditReviews("assessment");

  // Filter questions
  const filtered = ALL_QUESTIONS.filter((q) => {
    if (gradeFilter !== "all" && q.grade_key !== gradeFilter) return false;
    if (typeFilter !== "all" && q.type !== typeFilter) return false;
    if (showFlagged && myReviews[q.id]?.status !== "flag") return false;
    return true;
  });

  const total = filtered.length;
  const q = filtered[currentIndex] ?? null;

  // Stats
  const reviewedCount = ALL_QUESTIONS.filter((q) => myReviews[q.id]).length;
  const flaggedCount = ALL_QUESTIONS.filter((q) => myReviews[q.id]?.status === "flag").length;

  // Reset index when filters change
  useEffect(() => {
    setCurrentIndex(0);
    setImgError(false);
    setShowSSML(false);
    setShowImagePrompt(false);
  }, [gradeFilter, typeFilter, showFlagged]);

  // Sync comment field when question changes
  useEffect(() => {
    setImgError(false);
    setShowSSML(false);
    setShowImagePrompt(false);
    if (q) {
      setComment(myReviews[q.id]?.comment ?? "");
    }
  }, [currentIndex, q?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard navigation
  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(total - 1, i + 1));
  }, [total]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); goPrev(); }
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); goNext(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goPrev, goNext]);

  // Audio playback
  const playingUrlRef = useRef<string | null>(null);
  const playAudio = useCallback((url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (playingUrlRef.current === url) {
      playingUrlRef.current = null;
      setPlayingUrl(null);
      return;
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    playingUrlRef.current = url;
    setPlayingUrl(url);
    audio.onended = () => { playingUrlRef.current = null; setPlayingUrl(null); audioRef.current = null; };
    audio.onerror = () => { playingUrlRef.current = null; setPlayingUrl(null); audioRef.current = null; };
    audio.play().catch(() => { playingUrlRef.current = null; setPlayingUrl(null); audioRef.current = null; });
  }, []);

  // Stop audio on question change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlayingUrl(null);
    }
  }, [currentIndex]);

  // Rating handlers — map "good" → "pass", "flagged" → "flag" for DB storage
  const rate = useCallback((rating: Rating) => {
    if (!q) return;
    const dbStatus = rating === "good" ? "pass" : "flag";
    const existing = myReviews[q.id];
    // Toggle off if same rating
    if ((existing?.status === "pass" && rating === "good") || (existing?.status === "flag" && rating === "flagged")) {
      deleteReview(q.id);
    } else {
      upsertReview(q.id, { status: dbStatus, comment: existing?.comment ?? comment, grade: q.grade_key, standardId: q.standard });
    }
  }, [q, myReviews, comment, upsertReview, deleteReview]);

  const saveComment = useCallback(() => {
    if (!q) return;
    const existing = myReviews[q.id];
    upsertReview(q.id, { status: existing?.status as any || "pass", comment, grade: q.grade_key, standardId: q.standard });
  }, [q, myReviews, comment, upsertReview]);

  // Export
  const exportData = useCallback(() => {
    exportCsv("assessment-audit.csv");
  }, [exportCsv]);

  // Grade counts for filter badges
  const gradeCounts = GRADE_LABELS.map(({ key }) => ({
    key,
    count: key === "all"
      ? ALL_QUESTIONS.filter((q) => typeFilter === "all" || q.type === typeFilter).length
      : ALL_QUESTIONS.filter((q) => q.grade_key === key && (typeFilter === "all" || q.type === typeFilter)).length,
  }));

  const typeCounts = TYPE_LABELS.map(({ key }) => ({
    key,
    count: key === "all"
      ? ALL_QUESTIONS.filter((q) => gradeFilter === "all" || q.grade_key === gradeFilter).length
      : ALL_QUESTIONS.filter((q) => q.type === key && (gradeFilter === "all" || q.grade_key === gradeFilter)).length,
  }));

  // Map DB status back to UI rating
  const currentRating: Rating | undefined = q
    ? myReviews[q.id]?.status === "pass" ? "good"
      : myReviews[q.id]?.status === "flag" ? "flagged"
      : undefined
    : undefined;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <a
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </a>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Assessment Audit</h1>
          <button
            onClick={exportData}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:text-slate-400 dark:hover:text-slate-200 bg-zinc-100 dark:bg-slate-700 rounded-lg px-2.5 py-1.5 hover:bg-zinc-200 dark:hover:bg-slate-600"
          >
            Export
          </button>
        </div>

        <MigrateLocalStorage
          localStorageKey="readee_assessment_audit"
          itemType="assessment"
          parseEntry={(key, value) => {
            if (!value || (!value.rating && !value.comment)) return null;
            return {
              item_id: key,
              status: value.rating === "good" ? "pass" : value.rating === "flagged" ? "flag" : null,
              comment: value.comment || "",
            };
          }}
        />

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-4 text-xs text-zinc-500 dark:text-slate-400">
          <span className="font-medium">{reviewedCount}/{ALL_QUESTIONS.length} reviewed</span>
          <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${(reviewedCount / ALL_QUESTIONS.length) * 100}%` }}
            />
          </div>
          {flaggedCount > 0 && (
            <span className="font-medium text-red-500">{flaggedCount} flagged</span>
          )}
        </div>

        {/* Grade filter */}
        <div className="grid grid-cols-6 gap-1.5 mb-3">
          {GRADE_LABELS.map(({ key, label }, i) => {
            const count = gradeCounts[i].count;
            const active = gradeFilter === key;
            return (
              <button
                key={key}
                onClick={() => setGradeFilter(key)}
                className={`rounded-lg px-2 py-1.5 text-center text-xs font-semibold transition-colors ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
                }`}
              >
                {label}
                <span className={`block text-[10px] font-normal mt-0.5 ${active ? "text-indigo-200" : "text-zinc-400 dark:text-slate-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Type filter + Flagged toggle */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto">
          {TYPE_LABELS.map(({ key, label }, i) => {
            const count = typeCounts[i].count;
            const active = typeFilter === key && !showFlagged;
            return (
              <button
                key={key}
                onClick={() => { setTypeFilter(key); setShowFlagged(false); }}
                className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
          <button
            onClick={() => setShowFlagged(!showFlagged)}
            className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
              showFlagged
                ? "bg-red-500 text-white shadow-sm"
                : "bg-white text-red-500 border border-red-200 hover:bg-red-50 dark:bg-slate-800 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
            }`}
          >
            Flagged ({flaggedCount})
          </button>
        </div>

        {/* Question Card */}
        {q ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-zinc-200 dark:border-slate-700 overflow-hidden">
            {/* Nav header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-slate-700">
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="rounded-lg px-3 py-1.5 text-sm font-medium bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200"
              >
                Prev
              </button>
              <span className="text-sm font-semibold text-zinc-700 dark:text-slate-300">
                {currentIndex + 1} / {total}
              </span>
              <button
                onClick={goNext}
                disabled={currentIndex >= total - 1}
                className="rounded-lg px-3 py-1.5 text-sm font-medium bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200"
              >
                Next
              </button>
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5 px-4 pt-3">
              <span className="rounded-md px-2 py-0.5 text-xs font-bold bg-zinc-200 text-zinc-700 dark:bg-slate-600 dark:text-slate-200">
                {q.id}
              </span>
              <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${TYPE_BADGE[q.type].bg} ${TYPE_BADGE[q.type].text}`}>
                {q.type.replace(/_/g, " ")}
              </span>
              <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${DIFFICULTY_BADGE[q.difficulty] || "bg-zinc-100 text-zinc-500"}`}>
                {q.difficulty}
              </span>
              <span className="rounded-md px-2 py-0.5 text-xs font-medium bg-zinc-100 text-zinc-500 dark:bg-slate-700 dark:text-slate-400">
                {q.level}
              </span>
              <span className="rounded-md px-2 py-0.5 text-xs font-medium bg-zinc-100 text-zinc-500 dark:bg-slate-700 dark:text-slate-400">
                {q.standard}
              </span>
              {/* Rating indicator */}
              {currentRating && (
                <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                  currentRating === "good"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                }`}>
                  {currentRating === "good" ? "\uD83D\uDC4D" : "\uD83D\uDC4E"}
                </span>
              )}
            </div>

            {/* Image */}
            <div className="px-4 pt-3">
              {!imgError ? (
                <div className="flex justify-center">
                  <img
                    src={q.image_url}
                    alt={`Image for ${q.id}`}
                    className="max-h-[240px] w-auto object-contain rounded-2xl shadow-md border-2 border-white dark:border-slate-700"
                    onError={() => setImgError(true)}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-24 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <span className="text-sm text-red-500 dark:text-red-400">Image missing</span>
                </div>
              )}
            </div>

            {/* Audio buttons */}
            <div className="flex items-center justify-center gap-3 px-4 pt-3">
              <AudioButton
                label="Question"
                url={q.audio_url}
                playing={playingUrl === q.audio_url}
                onPlay={() => playAudio(q.audio_url)}
              />
              <AudioButton
                label="Hint"
                url={q.hint_audio_url}
                playing={playingUrl === q.hint_audio_url}
                onPlay={() => playAudio(q.hint_audio_url)}
              />
            </div>

            {/* Prompt */}
            <div className="px-4 pt-4">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white text-center leading-relaxed">
                {q.prompt}
              </h2>
            </div>

            {/* Stimulus (if present) */}
            {q.stimulus && (
              <div className="px-4 pt-3">
                <div className="rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 p-4 text-center">
                  <p className="text-lg text-indigo-800 dark:text-indigo-200 leading-relaxed italic whitespace-pre-line">
                    {q.stimulus}
                  </p>
                </div>
              </div>
            )}

            {/* Type-specific content */}
            <div className="px-4 pt-4 pb-2">
              {q.type === "mcq" && <MCQView q={q} />}
              {q.type === "category_sort" && <CategorySortView q={q} />}
              {q.type === "missing_word" && <MissingWordView q={q} />}
              {q.type === "sentence_build" && <SentenceBuildView q={q} />}
            </div>

            {/* Rating buttons */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => rate("good")}
                  className={`flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                    currentRating === "good"
                      ? "bg-emerald-500 text-white shadow-md scale-105"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700 dark:hover:bg-emerald-900/40"
                  }`}
                >
                  <span className="text-lg">{"\uD83D\uDC4D"}</span>
                  Good
                </button>
                <button
                  onClick={() => rate("flagged")}
                  className={`flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                    currentRating === "flagged"
                      ? "bg-red-500 text-white shadow-md scale-105"
                      : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/40"
                  }`}
                >
                  <span className="text-lg">{"\uD83D\uDC4E"}</span>
                  Flag
                </button>
              </div>
            </div>

            {/* Comment */}
            <div className="px-4 pb-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onBlur={saveComment}
                placeholder="Add a comment (auto-saves on blur)..."
                rows={2}
                className="w-full rounded-xl border border-zinc-200 dark:border-slate-600 bg-zinc-50 dark:bg-slate-900 px-3 py-2 text-sm text-zinc-700 dark:text-slate-300 placeholder:text-zinc-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
              {myReviews[q.id]?.comment && (
                <p className="text-[10px] text-zinc-400 dark:text-slate-500 mt-1 text-right">
                  Comment saved
                </p>
              )}
              {/* All reviewers' comments */}
              {allItemReviews[q.id] && allItemReviews[q.id].length > 0 && (
                <div className="mt-2">
                  <ReviewList reviews={allItemReviews[q.id]} currentUserId={userId} />
                </div>
              )}
            </div>

            {/* Expandable details */}
            <div className="border-t border-zinc-100 dark:border-slate-700 px-4 py-3 space-y-2">
              <button
                onClick={() => setShowSSML(!showSSML)}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {showSSML ? "Hide" : "Show"} SSML
              </button>
              {showSSML && (
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Question SSML</p>
                    <pre className="text-xs bg-zinc-50 dark:bg-slate-900 rounded-lg p-3 overflow-x-auto text-zinc-600 dark:text-slate-400 whitespace-pre-wrap break-words">
                      {q.tts_ssml}
                    </pre>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Hint SSML</p>
                    <pre className="text-xs bg-zinc-50 dark:bg-slate-900 rounded-lg p-3 overflow-x-auto text-zinc-600 dark:text-slate-400 whitespace-pre-wrap break-words">
                      {q.hint_tts_ssml}
                    </pre>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowImagePrompt(!showImagePrompt)}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline block"
              >
                {showImagePrompt ? "Hide" : "Show"} Image Prompt
              </button>
              {showImagePrompt && (
                <pre className="text-xs bg-zinc-50 dark:bg-slate-900 rounded-lg p-3 overflow-x-auto text-zinc-600 dark:text-slate-400 whitespace-pre-wrap break-words">
                  {q.image_prompt}
                </pre>
              )}
            </div>

            {/* Bottom nav */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 dark:border-slate-700">
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="rounded-lg px-4 py-2 text-sm font-medium bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200"
              >
                Prev
              </button>
              <button
                onClick={goNext}
                disabled={currentIndex >= total - 1}
                className="rounded-lg px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-zinc-400 dark:text-slate-500">
            No questions match this filter.
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Audio Button ─────────────────────────────────────── */

function AudioButton({
  label,
  url,
  playing,
  onPlay,
}: {
  label: string;
  url: string;
  playing: boolean;
  onPlay: () => void;
}) {
  return (
    <button
      onClick={onPlay}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        playing
          ? "bg-indigo-600 text-white shadow-sm animate-pulse"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
      }`}
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
      </svg>
      {label}
    </button>
  );
}

/* ── MCQ View ─────────────────────────────────────────── */

function MCQView({ q }: { q: AuditQuestion }) {
  const letters = ["A", "B", "C", "D"];

  return (
    <div className="grid grid-cols-2 gap-2">
      {q.choices.map((choice, i) => {
        const isCorrect = choice === q.correct;
        return (
          <div
            key={i}
            className={`rounded-xl border-2 px-3 py-2.5 flex items-center gap-2 ${
              isCorrect
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-600"
                : `border-zinc-200 dark:border-slate-600 ${CHOICE_COLORS[i]}`
            }`}
          >
            <span
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                isCorrect
                  ? "bg-emerald-500 text-white"
                  : "bg-zinc-200 text-zinc-600 dark:bg-slate-600 dark:text-slate-300"
              }`}
            >
              {letters[i]}
            </span>
            <span className={`text-sm font-medium ${isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-zinc-700 dark:text-slate-300"}`}>
              {choice}
            </span>
            {isCorrect && (
              <svg className="w-4 h-4 text-emerald-500 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Category Sort View ───────────────────────────────── */

function CategorySortView({ q }: { q: AuditQuestion }) {
  return (
    <div className="space-y-3">
      {/* Categories with items */}
      <div className={`grid gap-3 ${q.categories.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
        {q.categories.map((cat, i) => {
          const color = BUCKET_COLORS[i % BUCKET_COLORS.length];
          const items = q.categoryItems?.[cat] ?? [];
          return (
            <div key={cat} className={`rounded-xl border overflow-hidden ${color.body}`}>
              <div className={`px-3 py-1.5 text-center text-sm font-bold ${color.header}`}>
                {cat}
              </div>
              <div className="p-2 space-y-1">
                {items.length > 0 ? (
                  items.map((item) => (
                    <div key={item} className="rounded-lg bg-white dark:bg-slate-700 px-2.5 py-1.5 text-sm font-medium text-zinc-700 dark:text-slate-200 text-center shadow-sm">
                      {item}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-400 dark:text-slate-500 text-center py-2 italic">
                    (no mapping found)
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* All items to sort */}
      <div>
        <p className="text-xs font-semibold text-zinc-400 dark:text-slate-500 uppercase mb-1.5">Items to sort</p>
        <div className="flex flex-wrap gap-1.5">
          {q.items.map((item, i) => (
            <span
              key={i}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium border ${CHOICE_COLORS[i % CHOICE_COLORS.length]} text-zinc-700 dark:text-slate-300`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Missing Word View ────────────────────────────────── */

function MissingWordView({ q }: { q: AuditQuestion }) {
  const blankIdx = q.sentence_words.findIndex(
    (w) => w === "_" || w === "___" || w === "____"
  );

  const correctWord = blankIdx >= 0 && q.correct
    ? q.correct.split(" ")[blankIdx] ?? q.correct
    : q.correct;

  return (
    <div className="space-y-4">
      {/* Sentence with blank */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {q.sentence_words.map((word, i) => {
          const isBlank = word === "_" || word === "___" || word === "____";
          return isBlank ? (
            <span
              key={i}
              className="inline-flex items-center justify-center min-w-[80px] h-10 rounded-lg border-2 border-dashed border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 text-base font-bold text-emerald-700 dark:text-emerald-300"
            >
              {correctWord}
            </span>
          ) : (
            <span key={i} className="text-lg font-medium text-zinc-800 dark:text-slate-200">
              {word}
            </span>
          );
        })}
      </div>

      {/* Choices */}
      <div>
        <p className="text-xs font-semibold text-zinc-400 dark:text-slate-500 uppercase mb-1.5">Choices</p>
        <div className="grid grid-cols-2 gap-2">
          {q.choices.map((choice, i) => {
            const isCorrect = choice.toLowerCase() === correctWord?.toLowerCase();
            return (
              <div
                key={i}
                className={`rounded-xl border-2 px-3 py-2 text-center text-sm font-medium ${
                  isCorrect
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-600"
                    : `border-zinc-200 dark:border-slate-600 text-zinc-600 dark:text-slate-400 ${CHOICE_COLORS[i]}`
                }`}
              >
                {choice}
                {isCorrect && " \u2713"}
              </div>
            );
          })}
        </div>
      </div>

      {/* Full correct sentence */}
      <div className="text-center">
        <p className="text-xs font-semibold text-zinc-400 dark:text-slate-500 uppercase mb-1">Correct sentence</p>
        <p className="text-base font-medium text-zinc-700 dark:text-slate-300">{q.correct}</p>
      </div>
    </div>
  );
}

/* ── Sentence Build View ──────────────────────────────── */

function SentenceBuildView({ q }: { q: AuditQuestion }) {
  return (
    <div className="space-y-4">
      {/* Jumbled words */}
      <div>
        <p className="text-xs font-semibold text-zinc-400 dark:text-slate-500 uppercase mb-1.5">Words (shuffled)</p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {q.words.map((word, i) => (
            <span
              key={i}
              className={`rounded-lg px-3 py-2 text-base font-semibold border ${CHOICE_COLORS[i % CHOICE_COLORS.length]} text-zinc-700 dark:text-slate-200 shadow-sm`}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* Correct sentence */}
      <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-600 p-4 text-center">
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase mb-1">Correct order</p>
        <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{q.correct}</p>
      </div>
    </div>
  );
}
