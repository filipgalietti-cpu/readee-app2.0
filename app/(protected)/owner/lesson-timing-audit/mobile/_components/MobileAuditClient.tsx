"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Play,
  X,
  Save,
  CheckCircle2,
  ExternalLink,
  Smartphone,
} from "lucide-react";
import { LessonSlideshow } from "@/app/components/lesson/LessonSlideshow";
import type { SampleLesson } from "@/app/components/lesson/LessonSlideshow";

const PRE_ROLL: Record<string, number> = {
  Kindergarten: 150,
  "1st Grade": 120,
  "2nd Grade": 100,
  "3rd Grade": 60,
  "4th Grade": 40,
};

type Rating = "up" | "down" | null;
type Review = {
  lessonId: string;
  slideNum: number;
  rating: Rating;
  notes: string;
};
type ReviewMap = Record<string, Review>;

function key(lessonId: string, slideNum: number) {
  return `${lessonId}__${slideNum}`;
}

export default function MobileAuditClient({
  lessons,
}: {
  lessons: SampleLesson[];
}) {
  const [reviews, setReviews] = useState<ReviewMap>({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  // Which lesson is open in the full-screen modal. null = landing
  // grid showing all 5 lesson cards.
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/owner/lesson-timing-review")
      .then((r) => (r.ok ? r.json() : { reviews: [] }))
      .then((data) => {
        const map: ReviewMap = {};
        for (const r of data.reviews ?? []) {
          map[key(r.lessonId, r.slideNum)] = r;
        }
        setReviews(map);
      })
      .catch(() => {});
  }, []);

  const totals = useMemo(() => {
    const arr = Object.values(reviews);
    return {
      up: arr.filter((r) => r.rating === "up").length,
      down: arr.filter((r) => r.rating === "down").length,
      notes: arr.filter((r) => r.notes.trim().length > 0).length,
    };
  }, [reviews]);

  const perLessonTotals = useMemo(() => {
    const map: Record<string, { up: number; down: number; notes: number }> = {};
    for (const r of Object.values(reviews)) {
      const t = map[r.lessonId] ?? { up: 0, down: 0, notes: 0 };
      if (r.rating === "up") t.up++;
      if (r.rating === "down") t.down++;
      if (r.notes.trim().length > 0) t.notes++;
      map[r.lessonId] = t;
    }
    return map;
  }, [reviews]);

  const updateReview = useCallback((next: Review) => {
    setReviews((prev) => ({ ...prev, [key(next.lessonId, next.slideNum)]: next }));
  }, []);

  const getReview = useCallback(
    (lessonId: string, slideNum: number): Review => {
      return (
        reviews[key(lessonId, slideNum)] ?? {
          lessonId,
          slideNum,
          rating: null,
          notes: "",
        }
      );
    },
    [reviews],
  );

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/owner/lesson-timing-review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reviews: Object.values(reviews) }),
      });
      if (res.ok) {
        const now = new Date();
        setSavedAt(now.toLocaleTimeString());
      }
    } finally {
      setSaving(false);
    }
  };

  // Close modal on Escape — same convention as the existing audit page.
  useEffect(() => {
    if (!openLessonId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenLessonId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openLessonId]);

  const openLesson = lessons.find((l) => l.standardId === openLessonId);

  return (
    <>
      {/* ── Top totals + save ────────────────────────────────── */}
      <div className="mt-8 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-4 text-sm text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />
            {totals.up}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
            {totals.down}
          </span>
          <span>
            {totals.notes} note{totals.notes === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {savedAt && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Saved {savedAt}
            </span>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save reviews"}
          </button>
        </div>
      </div>

      {/* ── Landing grid: 5 lesson cards ─────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => {
          const teachCount = lesson.slides.filter(
            (s: any) => s.type !== "mcq",
          ).length;
          const t = perLessonTotals[lesson.standardId] ?? {
            up: 0,
            down: 0,
            notes: 0,
          };
          return (
            <button
              key={lesson.standardId}
              onClick={() => setOpenLessonId(lesson.standardId)}
              className="group flex flex-col items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-5 text-left transition hover:border-violet-300 hover:shadow-md"
            >
              <div className="flex w-full items-start justify-between gap-2">
                <div>
                  <div className="font-mono text-xs font-semibold text-violet-600">
                    {lesson.standardId}
                  </div>
                  <h3 className="mt-0.5 text-lg font-extrabold text-zinc-900">
                    {lesson.title}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    {lesson.grade} · {teachCount} teach slides
                  </p>
                </div>
                <Smartphone className="h-5 w-5 flex-shrink-0 text-zinc-300 group-hover:text-violet-400" />
              </div>
              <div className="flex w-full items-center justify-between border-t border-zinc-100 pt-3 text-xs">
                <div className="flex items-center gap-3 text-zinc-500">
                  <span className="inline-flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3 text-emerald-500" />
                    {t.up}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ThumbsDown className="h-3 w-3 text-red-500" />
                    {t.down}
                  </span>
                  <span>
                    {t.notes} note{t.notes === 1 ? "" : "s"}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1 font-bold text-white">
                  <Play className="h-3 w-3" />
                  Play
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Full-screen modal ────────────────────────────────── */}
      {openLesson && (
        <FullScreenAuditModal
          lesson={openLesson}
          getReview={getReview}
          updateReview={updateReview}
          onClose={() => setOpenLessonId(null)}
        />
      )}
    </>
  );
}

function FullScreenAuditModal({
  lesson,
  getReview,
  updateReview,
  onClose,
}: {
  lesson: SampleLesson;
  getReview: (lessonId: string, slideNum: number) => Review;
  updateReview: (r: Review) => void;
  onClose: () => void;
}) {
  const teachSlides = lesson.slides.filter(
    (s: any): s is any => s.type !== "mcq",
  );
  const preRoll = PRE_ROLL[lesson.grade as any] ?? 0;
  const [activeSlideNum, setActiveSlideNum] = useState<number | null>(null);
  // Replay nonce — remounts the slideshow so it restarts from slide 1.
  const [nonce, setNonce] = useState(0);

  // Viewport-aware phone scaling — the iPhone is natively 393×852
  // (iPhone 15/16/17 baseline), but on a 13" laptop the modal body
  // only has ~750px tall so the phone overflows. Scale down to fit;
  // wrapper holds the SCALED dimensions so layout math (comments
  // sidebar position) stays correct. Filip 2026-05-24: "i cant even
  // see the fucking whole iphone in my screen."
  const PHONE_W = 393;
  const PHONE_H = 852;
  const MODAL_CHROME = 56 + 48; // top bar + py-6 padding in body
  const [phoneScale, setPhoneScale] = useState(1);
  useEffect(() => {
    const compute = () => {
      const avail = window.innerHeight - MODAL_CHROME;
      setPhoneScale(Math.min(1, Math.max(0.55, avail / PHONE_H)));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const openPopout = () => {
    // Real OS-level popup window the reviewer can drag to a second
    // monitor. The /play route renders ONLY the iPhone shell —
    // nothing else — so the popup is a clean phone preview.
    const w = 460;
    const h = 920;
    const left = (window.screen.availWidth - w) / 2;
    const top = (window.screen.availHeight - h) / 2;
    window.open(
      `/owner/lesson-timing-audit/mobile/play/${lesson.standardId}`,
      `mobile-preview-${lesson.standardId}`,
      `width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`,
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-zinc-900/95 backdrop-blur"
      role="dialog"
      aria-modal="true"
    >
      {/* ── Modal top bar ──────────────────────────────────── */}
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-white/10 px-5 text-white">
        <div className="flex items-center gap-3">
          <Smartphone className="h-4 w-4 text-violet-300" />
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-violet-300">
              {lesson.standardId}
            </div>
            <div className="text-sm font-bold">{lesson.title}</div>
          </div>
          <span className="ml-3 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
            {lesson.grade} · pre-roll −{preRoll}ms
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNonce((n) => n + 1)}
            className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20"
          >
            Replay
          </button>
          <button
            onClick={openPopout}
            className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-700"
            title="Open the phone preview in its own browser window — drag it to a second monitor"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Pop out
          </button>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ── Modal body: phone left, comments right ────────── */}
      <div className="flex min-h-0 flex-1">
        {/* Phone — centered in its column, scaled to fit shorter
            viewports. The outer wrapper holds the SCALED dimensions
            so the flex layout reserves the right space for the
            comments sidebar. Inner div is natural 393×852 with
            transform: scale() — which also traps the slideshow's
            `position: fixed` to this element (transformed ancestors
            become the containing block for fixed descendants). */}
        <div className="flex flex-1 items-center justify-center p-6">
          <div
            style={{
              width: PHONE_W * phoneScale,
              height: PHONE_H * phoneScale,
            }}
          >
            <div
              className="relative overflow-hidden rounded-[44px] border-[4px] border-zinc-900 bg-black shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]"
              style={{
                width: PHONE_W,
                height: PHONE_H,
                // translateZ(0) guarantees a containing block for
                // the slideshow's `fixed inset-0` even when
                // phoneScale === 1 (browsers may optimize away a
                // scale(1) transform, letting the fixed positioning
                // escape to the actual viewport).
                transform: `scale(${phoneScale}) translateZ(0)`,
                transformOrigin: "top left",
              }}
            >
              <LessonSlideshow
                key={`${lesson.standardId}-${nonce}`}
                lesson={lesson}
                onComplete={() => {}}
                devMode={true}
                onSlideChange={(n) => setActiveSlideNum(n)}
                chrome="mobile-shell"
              />
            </div>
          </div>
        </div>

        {/* Comments column — scrollable, slide-by-slide cards. */}
        <aside className="flex w-[420px] flex-shrink-0 flex-col border-l border-white/10 bg-white">
          <div className="flex-shrink-0 border-b border-zinc-100 px-5 py-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Slide-by-slide comments
            </div>
            <div className="mt-0.5 text-xs text-zinc-400">
              {teachSlides.length} teach slides · scroll to reach them all
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {teachSlides.map((slide: any) => {
              const review = getReview(lesson.standardId, slide.slide);
              const isPlaying = activeSlideNum === slide.slide;
              return (
                <SlideCommentCard
                  key={`${lesson.standardId}-${slide.slide}`}
                  slide={slide}
                  review={review}
                  isPlaying={isPlaying}
                  onChange={updateReview}
                />
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

function SlideCommentCard({
  slide,
  review,
  isPlaying,
  onChange,
}: {
  slide: any;
  review: Review;
  isPlaying: boolean;
  onChange: (r: Review) => void;
}) {
  const stepCount = (slide.steps ?? []).length;
  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-sm transition ${
        isPlaying
          ? "border-violet-400 ring-2 ring-violet-200"
          : "border-zinc-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-xs font-semibold text-zinc-600">
              Slide {slide.slide}
            </span>
            <span className="rounded-md bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700">
              {slide.type}
            </span>
            {isPlaying && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                <Play className="h-2.5 w-2.5" />
                On screen
              </span>
            )}
          </div>
          <h3 className="mt-1.5 break-words text-sm font-extrabold text-zinc-900">
            {slide.heading || (
              <span className="italic text-zinc-400">(no heading)</span>
            )}
          </h3>
          <p className="mt-0.5 text-xs text-zinc-400">
            {stepCount} step{stepCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <button
            onClick={() =>
              onChange({
                ...review,
                rating: review.rating === "up" ? null : "up",
              })
            }
            className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
              review.rating === "up"
                ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                : "border-zinc-200 text-zinc-400 hover:border-emerald-300 hover:text-emerald-500"
            }`}
            aria-label="Thumbs up"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() =>
              onChange({
                ...review,
                rating: review.rating === "down" ? null : "down",
              })
            }
            className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
              review.rating === "down"
                ? "border-red-500 bg-red-50 text-red-600"
                : "border-zinc-200 text-zinc-400 hover:border-red-300 hover:text-red-500"
            }`}
            aria-label="Thumbs down"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <textarea
        value={review.notes}
        onChange={(e) => onChange({ ...review, notes: e.target.value })}
        placeholder="What's off on mobile? Spacing, font size, overflow, tap targets…"
        rows={2}
        className="mt-3 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-200"
      />
    </div>
  );
}
