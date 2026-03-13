"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import lessonsData from "@/app/data/sample-lessons.json";
import { useAudio } from "@/lib/audio/use-audio";
import { useAuditReviews } from "@/lib/audit/use-audit-reviews";
import { ReviewList } from "@/app/components/audit/ReviewList";

const SUPABASE_STORAGE =
  process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`
    : "";

interface Step {
  sub: string;
  audioFile?: string;
  ttsScript: string;
  displayText?: string;
  displayDelay?: number;
  displayParts?: { text: string; delay: number }[];
  interaction?: string;
}

interface Slide {
  slide: number;
  type: string;
  heading?: string;
  imageFile?: string;
  imagePrompt?: string;
  steps?: Step[];
  mcqId?: string;
}

interface Lesson {
  standardId: string;
  grade: string;
  domain: string;
  title: string;
  slides: Slide[];
}

const lessons = lessonsData as Lesson[];

function SpeakerButton({ url }: { url: string }) {
  const { playUrl, stop, isSpeaking } = useAudio();
  const [playing, setPlaying] = useState(false);
  const urlRef = useRef(url);
  urlRef.current = url;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (playing) {
          stop();
          setPlaying(false);
        } else {
          setPlaying(true);
          playUrl(url);
          // Auto-reset after reasonable time
          setTimeout(() => setPlaying(false), 15000);
        }
      }}
      className={`p-1 rounded-md transition-colors text-sm ${
        playing
          ? "bg-indigo-200 text-indigo-700 animate-pulse"
          : "hover:bg-gray-200 text-gray-500"
      }`}
      title={playing ? "Stop" : "Play audio"}
    >
      {playing ? "⏹" : "🔊"}
    </button>
  );
}

const SLIDE_TYPE_COLORS: Record<string, string> = {
  intro: "bg-indigo-100 text-indigo-700",
  teach: "bg-violet-100 text-violet-700",
  example: "bg-emerald-100 text-emerald-700",
  tip: "bg-amber-100 text-amber-700",
  "practice-intro": "bg-pink-100 text-pink-700",
  mcq: "bg-gray-100 text-gray-500",
};

const TEST_CHILD_ID = "a1be6044-d9b2-4655-9397-f44501392b69";

function reviewKey(standardId: string, slide: number) {
  return `${standardId}-S${slide}`;
}

export default function LessonAuditPage() {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [source, setSource] = useState<"local" | "supabase">("supabase");

  const { reviews: allItemReviews, myReviews, loading: reviewsLoading, userId, upsertReview, deleteReview, exportCsv } = useAuditReviews("lesson_slide");

  const getImageUrl = useCallback(
    (imageFile: string) => {
      if (source === "supabase") return `${SUPABASE_STORAGE}/images/${imageFile.replace("images/lessons/", "lessons/")}`;
      return `/${imageFile}`;
    },
    [source],
  );

  const getAudioUrl = useCallback(
    (audioFile: string) => {
      if (source === "supabase") return `${SUPABASE_STORAGE}/audio/${audioFile.replace("audio/lessons/", "lessons/")}`;
      return `/${audioFile}`;
    },
    [source],
  );

  function toggleRating(key: string, rating: "up" | "down", standardId?: string) {
    const current = myReviews[key];
    const newRating = current?.status === rating ? null : rating;
    if (newRating === null && !current?.comment) {
      deleteReview(key);
    } else {
      upsertReview(key, { status: newRating, comment: current?.comment || "", standardId });
    }
  }

  function submitComment(key: string, standardId?: string) {
    const text = (commentDraft[key] || "").trim();
    if (!text) return;
    const current = myReviews[key];
    upsertReview(key, { status: current?.status as any, comment: text, standardId });
    setCommentDraft((d) => ({ ...d, [key]: "" }));
  }

  const domains = useMemo(() => {
    const d = new Set(lessons.map((l) => l.domain));
    return ["all", ...Array.from(d)];
  }, []);

  // Stats
  const totalSlides = lessons.reduce(
    (n, l) => n + l.slides.filter((s) => s.type !== "mcq").length,
    0,
  );
  const reviewed = Object.values(myReviews).filter((r) => r.status).length;
  const thumbsDown = Object.values(myReviews).filter(
    (r) => r.status === "down",
  ).length;

  type FilterTab = "all" | "needs-review" | "thumbs-down" | string;
  const [tab, setTab] = useState<FilterTab>("all");

  const filtered = useMemo(() => {
    let list = lessons;
    if (filter !== "all") {
      list = list.filter((l) => l.domain === filter);
    }
    if (tab === "needs-review") {
      list = list.filter((l) =>
        l.slides
          .filter((s) => s.type !== "mcq")
          .some((s) => !myReviews[reviewKey(l.standardId, s.slide)]?.status),
      );
    } else if (tab === "thumbs-down") {
      list = list.filter((l) =>
        l.slides
          .filter((s) => s.type !== "mcq")
          .some(
            (s) =>
              myReviews[reviewKey(l.standardId, s.slide)]?.status === "down",
          ),
      );
    }
    return list;
  }, [filter, tab, myReviews]);

  const lesson = selectedLesson
    ? lessons.find((l) => l.standardId === selectedLesson)
    : null;

  const teachingSlides = lesson
    ? lesson.slides.filter((s) => s.type !== "mcq")
    : [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-1">Lesson Audit</h1>
      <p className="text-gray-500 mb-4 text-sm">
        {lessons.length} lessons, {totalSlides} slides |{" "}
        <span className="text-emerald-600 font-medium">
          {reviewed} reviewed
        </span>{" "}
        |{" "}
        {thumbsDown > 0 && (
          <span className="text-red-500 font-medium">
            {thumbsDown} flagged
          </span>
        )}
      </p>

      {/* Source toggle + Export */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setSource(source === "local" ? "supabase" : "local")}
          className={`px-4 py-2 text-sm rounded-lg font-medium border transition-colors ${
            source === "supabase"
              ? "bg-emerald-100 text-emerald-700 border-emerald-300"
              : "bg-amber-100 text-amber-700 border-amber-300"
          }`}
        >
          {source === "supabase" ? "Supabase" : "Local"}
        </button>
      </div>
      <button
        onClick={() => exportCsv("lesson-audit.csv")}
        className="mb-3 px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 font-medium"
      >
        Export CSV
      </button>

      {/* Tabs */}
      <div className="flex gap-2 mb-3">
        {(
          [
            ["all", "All"],
            ["needs-review", "Needs Review"],
            ["thumbs-down", "Flagged"],
          ] as [FilterTab, string][]
        ).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              tab === t
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-600 border hover:bg-gray-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Domain filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {domains.map((d) => (
          <button
            key={d}
            onClick={() => setFilter(d)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === d
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 border hover:bg-gray-100"
            }`}
          >
            {d === "all" ? "All" : d}
          </button>
        ))}
      </div>

      {/* Flagged slides flat view */}
      {!lesson && tab === "thumbs-down" && (
        <div className="space-y-6">
          {(() => {
            const flaggedSlides = filtered.flatMap((l) =>
              l.slides
                .filter((s) => s.type !== "mcq")
                .filter(
                  (s) =>
                    myReviews[reviewKey(l.standardId, s.slide)]?.status === "down",
                )
                .map((s) => ({ lesson: l, slide: s })),
            );
            if (flaggedSlides.length === 0)
              return (
                <p className="text-gray-400 text-center py-12">
                  No flagged slides
                </p>
              );
            return flaggedSlides.map(({ lesson: l, slide }) => {
              const key = reviewKey(l.standardId, slide.slide);
              const review = myReviews[key];
              const draft = commentDraft[key] || "";
              return (
                <div
                  key={key}
                  className="rounded-xl shadow-sm border p-4 md:p-6 bg-red-50 border-red-200"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={() => setSelectedLesson(l.standardId)}
                      className="font-bold text-indigo-600 hover:underline text-sm"
                    >
                      {l.standardId} — {l.title}
                    </button>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${SLIDE_TYPE_COLORS[slide.type] || "bg-gray-100"}`}
                    >
                      S{slide.slide} — {slide.type}
                    </span>
                    <span className="font-semibold text-gray-800 text-sm">
                      {slide.heading}
                    </span>
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        onClick={() => toggleRating(key, "up", l.standardId)}
                        className={`p-1.5 rounded-lg transition-colors text-lg ${
                          review?.status === "up"
                            ? "bg-emerald-200 text-emerald-700"
                            : "hover:bg-gray-100 text-gray-400"
                        }`}
                      >
                        👍
                      </button>
                      <button
                        onClick={() => toggleRating(key, "down", l.standardId)}
                        className={`p-1.5 rounded-lg transition-colors text-lg ${
                          review?.status === "down"
                            ? "bg-red-200 text-red-700"
                            : "hover:bg-gray-100 text-gray-400"
                        }`}
                      >
                        👎
                      </button>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-[280px_1fr] gap-6">
                    <div>
                      <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 border">
                        {slide.imageFile ? (
                          <img
                            src={getImageUrl(slide.imageFile!)}
                            alt={slide.heading || ""}
                            className="object-cover absolute inset-0 w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                            No image
                          </div>
                        )}
                      </div>
                      {slide.imagePrompt && (
                        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                          <span className="font-semibold">Prompt:</span>{" "}
                          {slide.imagePrompt}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      {/* Steps with audio */}
                      {(slide.steps || []).map((step) => (
                        <div key={step.sub} className="border-l-2 border-indigo-200 pl-3 py-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">
                              {step.sub}
                            </span>
                            {step.audioFile && (
                              <SpeakerButton url={getAudioUrl(step.audioFile)} />
                            )}
                            {step.displayText && (
                              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                &ldquo;{step.displayText}&rdquo;
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600">
                            <span className="text-gray-400">TTS:</span> {step.ttsScript}
                          </p>
                        </div>
                      ))}

                      {/* All reviewers' comments */}
                      {allItemReviews[key] && allItemReviews[key].length > 0 && (
                        <div className="mt-2">
                          <ReviewList reviews={allItemReviews[key]} currentUserId={userId} />
                        </div>
                      )}
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a note..."
                          value={draft}
                          onChange={(e) =>
                            setCommentDraft((d) => ({
                              ...d,
                              [key]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") submitComment(key, l.standardId);
                          }}
                          className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                        <button
                          onClick={() => submitComment(key, l.standardId)}
                          disabled={!draft.trim()}
                          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* Lesson grid */}
      {!lesson && tab !== "thumbs-down" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {filtered.map((l) => {
            const imgPath = getImageUrl(`images/lessons/${l.standardId}/S1.png`);
            const hasError = imgErrors.has(l.standardId);
            const slideKeys = l.slides
              .filter((s) => s.type !== "mcq")
              .map((s) => reviewKey(l.standardId, s.slide));
            const allReviewed = slideKeys.every(
              (k) => myReviews[k]?.status,
            );
            const hasFlagged = slideKeys.some(
              (k) => myReviews[k]?.status === "down",
            );
            return (
              <button
                key={l.standardId}
                onClick={() => setSelectedLesson(l.standardId)}
                className={`rounded-lg shadow-sm border hover:shadow-md transition-shadow p-2 text-left ${
                  hasFlagged
                    ? "bg-red-50 border-red-200"
                    : allReviewed
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-white"
                }`}
              >
                <div className="aspect-square relative rounded-md overflow-hidden bg-gray-100 mb-2">
                  {!hasError ? (
                    <img
                      src={imgPath}
                      alt={l.title}
                      className="object-cover absolute inset-0 w-full h-full"
                      onError={() =>
                        setImgErrors((s) => new Set(s).add(l.standardId))
                      }
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No image
                    </div>
                  )}
                  {/* Status badge */}
                  {allReviewed && !hasFlagged && (
                    <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      ✓
                    </div>
                  )}
                  {hasFlagged && (
                    <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      !
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1">
                  <p className="font-semibold text-xs text-gray-800 truncate">
                    {l.standardId}
                  </p>
                  <a
                    href={`/learn?standard=${l.standardId}&child=${TEST_CHILD_ID}&dev=1`}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 px-2 py-0.5 text-[10px] font-bold bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    ▶ Play
                  </a>
                </div>
                <p className="text-xs text-gray-500 truncate">{l.title}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Lesson detail */}
      {lesson && (
        <div>
          {(() => {
            const idx = filtered.findIndex(
              (l) => l.standardId === lesson.standardId,
            );
            const prev = idx > 0 ? filtered[idx - 1] : null;
            const next =
              idx < filtered.length - 1 ? filtered[idx + 1] : null;
            return (
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="text-indigo-600 hover:underline text-sm"
                >
                  &larr; All lessons
                </button>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() =>
                      prev && setSelectedLesson(prev.standardId)
                    }
                    disabled={!prev}
                    className="px-3 py-1.5 text-sm rounded-lg border font-medium hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    &larr; Prev
                  </button>
                  <span className="text-xs text-gray-400">
                    {idx + 1} / {filtered.length}
                  </span>
                  <button
                    onClick={() => {
                      if (next) {
                        setSelectedLesson(next.standardId);
                        window.scrollTo({ top: 0 });
                      }
                    }}
                    disabled={!next}
                    className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>
            );
          })()}

          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold">
              {lesson.standardId} — {lesson.title}
            </h2>
            <a
              href={`/learn?standard=${lesson.standardId}&child=${TEST_CHILD_ID}&dev=1`}
              target="_blank"
              className="px-3 py-1.5 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              ▶ Play Live
            </a>
          </div>
          <p className="text-gray-500 text-sm mb-6">{lesson.domain}</p>

          <div className="space-y-8">
            {teachingSlides.map((slide) => {
              const key = reviewKey(lesson.standardId, slide.slide);
              const review = myReviews[key];
              const draft = commentDraft[key] || "";

              return (
                <div
                  key={slide.slide}
                  className={`rounded-xl shadow-sm border p-4 md:p-6 ${
                    review?.status === "down"
                      ? "bg-red-50 border-red-200"
                      : review?.status === "up"
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-white"
                  }`}
                >
                  {/* Slide header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${SLIDE_TYPE_COLORS[slide.type] || "bg-gray-100"}`}
                    >
                      S{slide.slide} — {slide.type}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {slide.heading}
                    </span>

                    {/* Thumbs up/down */}
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        onClick={() => toggleRating(key, "up", lesson.standardId)}
                        className={`p-1.5 rounded-lg transition-colors text-lg ${
                          review?.status === "up"
                            ? "bg-emerald-200 text-emerald-700"
                            : "hover:bg-gray-100 text-gray-400"
                        }`}
                        title="Looks good"
                      >
                        👍
                      </button>
                      <button
                        onClick={() => toggleRating(key, "down", lesson.standardId)}
                        className={`p-1.5 rounded-lg transition-colors text-lg ${
                          review?.status === "down"
                            ? "bg-red-200 text-red-700"
                            : "hover:bg-gray-100 text-gray-400"
                        }`}
                        title="Needs fixing"
                      >
                        👎
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-[280px_1fr] gap-6">
                    {/* Image */}
                    <div>
                      <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 border">
                        {slide.imageFile &&
                        !imgErrors.has(
                          `${lesson.standardId}-S${slide.slide}`,
                        ) ? (
                          <img
                            src={getImageUrl(slide.imageFile!)}
                            alt={slide.heading || ""}
                            className="object-cover absolute inset-0 w-full h-full"
                            onError={() =>
                              setImgErrors(
                                (s) =>
                                  new Set(s).add(
                                    `${lesson.standardId}-S${slide.slide}`,
                                  ),
                              )
                            }
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                            No image
                          </div>
                        )}
                      </div>
                      {slide.imagePrompt && (
                        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                          <span className="font-semibold">Prompt:</span>{" "}
                          {slide.imagePrompt}
                        </p>
                      )}
                    </div>

                    {/* Steps */}
                    <div className="space-y-3">
                      {(slide.steps || []).map((step) => (
                        <div
                          key={step.sub}
                          className="border-l-2 border-indigo-200 pl-3"
                        >
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">
                              {step.sub}
                            </span>
                            {step.audioFile && (
                              <SpeakerButton url={getAudioUrl(step.audioFile)} />
                            )}
                            {step.displayText && (
                              <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                &ldquo;{step.displayText}&rdquo;
                                {step.displayDelay && (
                                  <span className="text-xs text-gray-400 ml-1">
                                    @{step.displayDelay}ms
                                  </span>
                                )}
                              </span>
                            )}
                            {step.displayParts && (
                              <div className="flex flex-wrap gap-1">
                                {step.displayParts.map((p, i) => (
                                  <span
                                    key={i}
                                    className="text-sm font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded"
                                  >
                                    &ldquo;{p.text}&rdquo;
                                    <span className="text-xs text-gray-400 ml-1">
                                      @{p.delay}ms
                                    </span>
                                  </span>
                                ))}
                              </div>
                            )}
                            {!step.displayText && !step.displayParts && (
                              <span className="text-xs text-gray-400 italic">
                                (audio only)
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            <span className="text-gray-400">TTS:</span>{" "}
                            {step.ttsScript}
                          </p>
                          {step.interaction && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {step.interaction}
                            </p>
                          )}
                        </div>
                      ))}

                      {/* All reviewers' comments */}
                      {allItemReviews[key] && allItemReviews[key].length > 0 && (
                        <div className="mt-3">
                          <ReviewList reviews={allItemReviews[key]} currentUserId={userId} />
                        </div>
                      )}
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a note..."
                          value={draft}
                          onChange={(e) =>
                            setCommentDraft((d) => ({
                              ...d,
                              [key]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") submitComment(key, lesson.standardId);
                          }}
                          className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                        <button
                          onClick={() => submitComment(key, lesson.standardId)}
                          disabled={!draft.trim()}
                          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* MCQ references */}
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-semibold text-sm text-gray-600 mb-2">
                MCQ Questions
              </h3>
              <div className="flex flex-wrap gap-2">
                {lesson.slides
                  .filter((s) => s.type === "mcq")
                  .map((s) => (
                    <span
                      key={s.slide}
                      className="bg-white px-3 py-1 rounded text-sm text-gray-600 border"
                    >
                      {s.mcqId}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
