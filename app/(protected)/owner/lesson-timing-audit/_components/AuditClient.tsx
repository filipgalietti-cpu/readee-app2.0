"use client";

import { useState, useEffect, useMemo } from "react";
import { ThumbsUp, ThumbsDown, Play, X, Save, CheckCircle2 } from "lucide-react";
import { LessonSlideshow } from "@/app/components/lesson/LessonSlideshow";
import type { SampleLesson } from "@/app/components/lesson/LessonSlideshow";

const SUPABASE_BASE =
  "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public";

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

export default function AuditClient({ lessons }: { lessons: SampleLesson[] }) {
  const [reviews, setReviews] = useState<ReviewMap>({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  // The currently-visible slide number inside the active slideshow.
  // Surfaced via LessonSlideshow.onSlideChange so the inline rating
  // panel can target the slide the reviewer is watching RIGHT NOW —
  // no waiting for the lesson to finish or hunting through cards.
  const [activeSlideNum, setActiveSlideNum] = useState<number | null>(null);

  // Load existing reviews on mount.
  useEffect(() => {
    fetch("/api/owner/lesson-timing-review")
      .then((r) => (r.ok ? r.json() : { reviews: [] }))
      .then((d) => {
        const map: ReviewMap = {};
        for (const r of d.reviews ?? []) {
          map[key(r.lessonId, r.slideNum)] = r;
        }
        setReviews(map);
      })
      .catch(() => {});
  }, []);

  // Escape closes the active slideshow — natural keyboard exit for
  // anyone scrubbing through 5 lessons in a row.
  useEffect(() => {
    if (!activeId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActiveId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId]);

  function getReview(lessonId: string, slideNum: number): Review {
    return (
      reviews[key(lessonId, slideNum)] ?? {
        lessonId,
        slideNum,
        rating: null,
        notes: "",
      }
    );
  }

  function updateReview(r: Review) {
    setReviews((prev) => ({ ...prev, [key(r.lessonId, r.slideNum)]: r }));
    setSavedAt(null);
  }

  async function save() {
    setSaving(true);
    const payload = Object.values(reviews).filter(
      (r) => r.rating !== null || r.notes.trim().length > 0,
    );
    try {
      const res = await fetch("/api/owner/lesson-timing-review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reviews: payload }),
      });
      if (res.ok) {
        setSavedAt(new Date().toLocaleTimeString());
      }
    } finally {
      setSaving(false);
    }
  }

  // Tallies for the sticky save bar.
  const totals = useMemo(() => {
    const arr = Object.values(reviews);
    return {
      up: arr.filter((r) => r.rating === "up").length,
      down: arr.filter((r) => r.rating === "down").length,
      notes: arr.filter((r) => r.notes.trim().length > 0).length,
    };
  }, [reviews]);

  return (
    <>
      {/* Sticky save bar */}
      <div className="sticky top-0 z-30 -mx-4 mt-6 mb-8 flex items-center justify-between gap-3 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-4 text-xs font-semibold text-zinc-600">
          <span className="inline-flex items-center gap-1.5">
            <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />
            {totals.up}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
            {totals.down}
          </span>
          <span className="text-zinc-500">{totals.notes} note{totals.notes === 1 ? "" : "s"}</span>
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

      {lessons.map((lesson) => {
        const preRoll = PRE_ROLL[lesson.grade as any] ?? 0;
        const teachSlides = lesson.slides.filter(
          (s): s is any => s.type !== "mcq",
        );
        const isActive = activeId === lesson.standardId;
        return (
          <section key={lesson.standardId} className="mb-12">
            <header className="flex items-baseline justify-between gap-3 border-b border-zinc-100 pb-3">
              <div>
                <h2 className="text-xl font-extrabold text-zinc-900">
                  {lesson.standardId} · {lesson.title}
                </h2>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {lesson.grade} · pre-roll −{preRoll}ms ·{" "}
                  {teachSlides.length} teach slides
                </p>
              </div>
              <button
                onClick={() =>
                  setActiveId(isActive ? null : lesson.standardId)
                }
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition ${
                  isActive
                    ? "bg-zinc-200 text-zinc-700"
                    : "bg-zinc-900 text-white hover:bg-zinc-800"
                }`}
              >
                {isActive ? (
                  <>
                    <X className="h-4 w-4" />
                    Close
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Play slideshow
                  </>
                )}
              </button>
            </header>

            {isActive && (
              <div className="mt-4 space-y-3">
                {/* Slideshow container — 75vh so the slide fills most
                    of the viewport (was 55vh — too cramped to actually
                    judge on a laptop). Rating panel sits below; the
                    reviewer scrolls a tiny bit to thumb, which is the
                    right tradeoff vs squinting at a tiny slideshow. */}
                <div
                  className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                  style={{ height: "75vh" }}
                >
                  <button
                    onClick={() => {
                      setActiveId(null);
                      setActiveSlideNum(null);
                    }}
                    aria-label="Exit slideshow"
                    className="absolute right-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/80 text-white shadow-lg backdrop-blur transition hover:bg-black"
                  >
                    <X className="h-5 w-5" strokeWidth={2.5} />
                  </button>
                  <LessonSlideshow
                    lesson={lesson}
                    onComplete={() => {
                      setActiveId(null);
                      setActiveSlideNum(null);
                    }}
                    devMode={true}
                    onSlideChange={(n) => setActiveSlideNum(n)}
                    chrome="desktop-shell"
                  />
                </div>

                {/* Live rating panel — pinned right under the slideshow.
                    Auto-targets whichever slide is on screen so the
                    reviewer can thumb + note without losing their place. */}
                {activeSlideNum !== null && (() => {
                  const currentSlide = teachSlides.find(
                    (s: any) => s.slide === activeSlideNum,
                  );
                  if (!currentSlide) return null;
                  const review = getReview(lesson.standardId, activeSlideNum);
                  return (
                    <LiveRatingPanel
                      slide={currentSlide}
                      slideNum={activeSlideNum}
                      totalSlides={teachSlides.length}
                      currentIdx={teachSlides.findIndex((s: any) => s.slide === activeSlideNum)}
                      review={review}
                      onChange={updateReview}
                    />
                  );
                })()}
              </div>
            )}

            <div className="mt-4 space-y-2">
              {teachSlides.map((slide: any) => {
                const review = getReview(lesson.standardId, slide.slide);
                const isCurrent =
                  isActive && activeSlideNum === slide.slide;
                return (
                  <SlideRatingCard
                    key={slide.slide}
                    slide={slide}
                    review={review}
                    onChange={updateReview}
                    isCurrent={isCurrent}
                  />
                );
              })}
            </div>
          </section>
        );
      })}

    </>
  );
}

/**
 * Compact rating bar that lives directly below the playing slideshow.
 * Mirrors the SlideRatingCard's thumbs + notes but is auto-targeted
 * to the slide currently on screen — the reviewer rates as they
 * watch, instead of after.
 */
function LiveRatingPanel({
  slide,
  slideNum,
  totalSlides,
  currentIdx,
  review,
  onChange,
}: {
  slide: any;
  slideNum: number;
  totalSlides: number;
  currentIdx: number;
  review: Review;
  onChange: (r: Review) => void;
}) {
  return (
    <div className="rounded-2xl border-2 border-violet-300 bg-violet-50/60 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs font-bold text-violet-700">
            <span className="rounded bg-violet-600 px-2 py-0.5 text-[10px] font-mono uppercase text-white">
              On screen · {currentIdx + 1} / {totalSlides}
            </span>
            <span className="rounded bg-white px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-violet-700">
              {slide.type}
            </span>
            <span className="truncate text-zinc-900">
              Slide {slideNum} · "{slide.heading ?? ""}"
            </span>
          </div>
          <textarea
            placeholder="Rate while you watch — e.g. 'pre-roll feels late,' 'table reveal too fast,' 'audio drift on row 3'"
            value={review.notes}
            onChange={(e) =>
              onChange({ ...review, notes: e.target.value })
            }
            rows={2}
            className="mt-3 w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() =>
              onChange({
                ...review,
                rating: review.rating === "up" ? null : "up",
              })
            }
            aria-label="Thumbs up"
            className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 transition ${
              review.rating === "up"
                ? "border-emerald-600 bg-emerald-500 text-white"
                : "border-zinc-200 bg-white text-zinc-400 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
            }`}
          >
            <ThumbsUp className="h-6 w-6" />
          </button>
          <button
            onClick={() =>
              onChange({
                ...review,
                rating: review.rating === "down" ? null : "down",
              })
            }
            aria-label="Thumbs down"
            className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 transition ${
              review.rating === "down"
                ? "border-red-600 bg-red-500 text-white"
                : "border-zinc-200 bg-white text-zinc-400 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            }`}
          >
            <ThumbsDown className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SlideRatingCard({
  slide,
  review,
  onChange,
  isCurrent = false,
}: {
  slide: any;
  review: Review;
  onChange: (r: Review) => void;
  isCurrent?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={`rounded-xl border bg-white p-4 transition ${
        isCurrent
          ? "border-violet-400 ring-2 ring-violet-200"
          : "border-zinc-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-900">
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-mono uppercase text-zinc-600">
              Slide {slide.slide}
            </span>
            <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-violet-700">
              {slide.type}
            </span>
            <span className="truncate">"{slide.heading ?? ""}"</span>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-900"
          >
            {expanded ? "Hide" : "Show"} {slide.steps?.length ?? 0} step{slide.steps?.length === 1 ? "" : "s"}
          </button>
          {expanded && (
            <div className="mt-2 space-y-3">
              {(slide.steps ?? []).map((step: any) => (
                <StepInspector key={step.sub} step={step} />
              ))}
            </div>
          )}
          <textarea
            placeholder="Notes — e.g. 'EE reveal hits late', 'first slide feels rushed', 'pre-roll too aggressive for K'"
            value={review.notes}
            onChange={(e) =>
              onChange({ ...review, notes: e.target.value })
            }
            rows={2}
            className="mt-3 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() =>
              onChange({
                ...review,
                rating: review.rating === "up" ? null : "up",
              })
            }
            aria-label="Thumbs up"
            className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 transition ${
              review.rating === "up"
                ? "border-emerald-600 bg-emerald-500 text-white"
                : "border-zinc-200 bg-white text-zinc-400 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
            }`}
          >
            <ThumbsUp className="h-5 w-5" />
          </button>
          <button
            onClick={() =>
              onChange({
                ...review,
                rating: review.rating === "down" ? null : "down",
              })
            }
            aria-label="Thumbs down"
            className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 transition ${
              review.rating === "down"
                ? "border-red-600 bg-red-500 text-white"
                : "border-zinc-200 bg-white text-zinc-400 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            }`}
          >
            <ThumbsDown className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StepInspector({ step }: { step: any }) {
  const audioUrl = step.audioFile
    ? `${SUPABASE_BASE}/${step.audioFile}`
    : null;
  return (
    <div className="rounded-lg bg-zinc-50 p-3 text-xs">
      <div className="font-mono text-[10px] text-zinc-500">
        [{step.sub}] {step.audioFile}
      </div>
      {step.ttsScript && (
        <div className="mt-1 italic text-zinc-700">"{step.ttsScript}"</div>
      )}
      {audioUrl && (
        <audio
          controls
          preload="none"
          src={audioUrl}
          className="mt-2 h-8 w-full"
        />
      )}
      {step.displayParts && (
        <div className="mt-2">
          <div className="font-bold uppercase tracking-wider text-[9px] text-zinc-500">
            displayParts
          </div>
          <table className="mt-1 w-full">
            <tbody>
              {step.displayParts.map((p: any, i: number) => (
                <tr key={i} className="border-t border-zinc-200">
                  <td className="py-1 pr-2 text-right font-mono text-zinc-600">
                    {p.delay}ms
                  </td>
                  <td className="py-1 text-zinc-700">"{p.text}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {step.highlightWord && (
        <div className="mt-1 text-zinc-600">
          <span className="font-bold uppercase tracking-wider text-[9px] text-zinc-500 mr-1">
            highlight
          </span>
          {step.highlightWord.delay}ms · "{step.highlightWord.word}"
        </div>
      )}
      {step.displayTableRow && (
        <div className="mt-1 text-zinc-600">
          <span className="font-bold uppercase tracking-wider text-[9px] text-zinc-500 mr-1">
            tableRow
          </span>
          {step.displayTableRow.label} = {step.displayTableRow.value} · ex. "
          {step.displayTableRow.example}" @ {step.displayTableRow.exampleDelay}
          ms
        </div>
      )}
    </div>
  );
}
