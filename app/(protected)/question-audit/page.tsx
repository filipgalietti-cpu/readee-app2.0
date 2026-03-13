"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { getAllStandards } from "@/lib/data/all-standards";
import { useAudio } from "@/lib/audio/use-audio";
import { useAuditReviews } from "@/lib/audit/use-audit-reviews";
import { ReviewList } from "@/app/components/audit/ReviewList";

/* ── Types ──────────────────────────────────────────── */

interface Question {
  id: string;
  prompt: string;
  choices: string[];
  correct: string;
  hint?: string;
  audio_url?: string;
  hint_audio_url?: string;
}

interface Standard {
  standard_id: string;
  standard_description: string;
  domain: string;
  questions: Question[];
}

type FilterTab = "all" | "needs-review" | "thumbs-down";
type GradeFilter = "all" | "K" | "1" | "2" | "3" | "4";

const GRADE_LABELS: Record<GradeFilter, string> = {
  all: "All",
  K: "Kindergarten",
  "1": "1st Grade",
  "2": "2nd Grade",
  "3": "3rd Grade",
  "4": "4th Grade",
};

const GRADE_FOLDER: Record<string, string> = {
  K: "kindergarten",
  "1": "1st-grade",
  "2": "2nd-grade",
  "3": "3rd-grade",
  "4": "4th-grade",
};

const CHOICE_LETTERS = ["A", "B", "C", "D"];
const CHOICE_COLORS = ["#60a5fa", "#4ade80", "#fb923c", "#a78bfa"];

function gradeFromStandard(id: string): string {
  const m = id.match(/\.([^.]+)\./);
  return m ? m[1] : "K";
}

function imageUrl(standardId: string, questionId: string, grade: string) {
  const folder = GRADE_FOLDER[grade] || "kindergarten";
  return `/images/${folder}/${standardId}/${questionId}.png`;
}

/* ── Rich prompt (bold **word**) ─────────────────────── */

function RichPrompt({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const bold = part.match(/^\*\*(.+?)\*\*$/);
        if (bold) {
          return (
            <span key={i} className="font-bold underline decoration-indigo-400 decoration-2 underline-offset-2">
              {bold[1]}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/* ── Speaker button ────────────────────────────────── */

function SpeakerButton({ label, onClick, active }: { label: string; onClick: () => void; active?: boolean }) {
  return (
    <button onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
        active ? "bg-indigo-100 text-indigo-700 animate-pulse" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}>
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M11 5L6 9H2v6h4l5 4V5z" />
      </svg>
      {label}
    </button>
  );
}

/* ── Main Page ──────────────────────────────────────── */

export default function QuestionAuditPage() {
  const [selectedStandard, setSelectedStandard] = useState<string | null>(null);
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>("all");
  const [tab, setTab] = useState<FilterTab>("all");
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [useLocal, setUseLocal] = useState(true);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const audioUnlockedRef = useRef(false);

  const { reviews: allItemReviews, myReviews, loading: reviewsLoading, userId, upsertReview, deleteReview, exportCsv } = useAuditReviews("question");

  const { playUrl: rawPlayUrl, isSpeaking, unlockAudio, stop } = useAudio();

  const playAudio = useCallback((url: string) => {
    if (!audioUnlockedRef.current) { unlockAudio(); audioUnlockedRef.current = true; }
    setPlayingUrl(url);
    rawPlayUrl(url);
  }, [rawPlayUrl, unlockAudio]);

  useEffect(() => { if (!isSpeaking) setPlayingUrl(null); }, [isSpeaking]);

  // Load all standards
  const allStandards = useMemo(() => {
    const raw = getAllStandards();
    return raw.map((s: any) => ({
      standard_id: s.standard_id,
      standard_description: s.standard_description,
      domain: s.domain,
      questions: s.questions || [],
    })) as Standard[];
  }, []);

  function toggleRating(key: string, rating: "up" | "down", standardId?: string) {
    const current = myReviews[key];
    const newRating = current?.status === rating ? null : rating;
    const grade = standardId ? GRADE_FOLDER[gradeFromStandard(standardId)] : undefined;
    if (newRating === null && !current?.comment) {
      deleteReview(key);
    } else {
      upsertReview(key, { status: newRating, comment: current?.comment || "", grade, standardId });
    }
  }

  function submitComment(key: string, standardId?: string) {
    const text = (commentDraft[key] || "").trim();
    if (!text) return;
    const current = myReviews[key];
    const grade = standardId ? GRADE_FOLDER[gradeFromStandard(standardId)] : undefined;
    upsertReview(key, { status: current?.status as any, comment: text, grade, standardId });
    setCommentDraft((d) => ({ ...d, [key]: "" }));
  }

  // Stats
  const totalQuestions = allStandards.reduce((n, s) => n + s.questions.length, 0);
  const reviewed = Object.values(myReviews).filter((r) => r.status).length;
  const thumbsDown = Object.values(myReviews).filter((r) => r.status === "down").length;

  // Filter standards by grade
  const gradeFiltered = useMemo(() => {
    if (gradeFilter === "all") return allStandards;
    return allStandards.filter((s) => gradeFromStandard(s.standard_id) === gradeFilter);
  }, [allStandards, gradeFilter]);

  // Filter by tab
  const filtered = useMemo(() => {
    if (tab === "all") return gradeFiltered;
    if (tab === "needs-review") {
      return gradeFiltered.filter((s) =>
        s.questions.some((q) => !myReviews[q.id]?.status),
      );
    }
    if (tab === "thumbs-down") {
      return gradeFiltered.filter((s) =>
        s.questions.some((q) => myReviews[q.id]?.status === "down"),
      );
    }
    return gradeFiltered;
  }, [gradeFiltered, tab, myReviews]);

  const standard = selectedStandard
    ? allStandards.find((s) => s.standard_id === selectedStandard)
    : null;

  const SUPABASE_IMG = "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public/images";
  const SUPABASE_AUDIO = "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public/audio";

  function getImageUrl(standardId: string, questionId: string) {
    const grade = gradeFromStandard(standardId);
    if (useLocal) {
      return imageUrl(standardId, questionId, grade);
    }
    const folder = GRADE_FOLDER[grade] || "kindergarten";
    return `${SUPABASE_IMG}/${folder}/${standardId}/${questionId}.png`;
  }

  function getAudioUrl(standardId: string, questionId: string, type: "question" | "hint") {
    const grade = gradeFromStandard(standardId);
    const folder = GRADE_FOLDER[grade] || "kindergarten";
    const suffix = type === "hint" ? "-hint" : "";
    if (useLocal) {
      return `/audio/${folder}/${standardId}/${questionId}${suffix}.mp3`;
    }
    return `${SUPABASE_AUDIO}/${folder}/${standardId}/${questionId}${suffix}.mp3`;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-1">Question Audit</h1>
      <p className="text-gray-500 mb-4 text-sm">
        {allStandards.length} standards, {totalQuestions} questions |{" "}
        <span className="text-emerald-600 font-medium">{reviewed} reviewed</span> |{" "}
        {thumbsDown > 0 && (
          <span className="text-red-500 font-medium">{thumbsDown} flagged</span>
        )}
      </p>

      {/* Controls row */}
      <div className="flex items-center gap-3 mb-3">
        {/* Export CSV */}
        <button
          onClick={() => exportCsv("question-audit.csv")}
          className="px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 font-medium"
        >
          Export CSV
        </button>

        {/* Asset source toggle */}
        <button
          onClick={() => setUseLocal((v) => !v)}
          className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
            useLocal
              ? "bg-amber-100 text-amber-700"
              : "bg-indigo-100 text-indigo-700"
          }`}
        >
          {useLocal ? "Local" : "Supabase"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-3">
        {([
          ["all", "All"],
          ["needs-review", "Needs Review"],
          ["thumbs-down", "Flagged"],
        ] as [FilterTab, string][]).map(([t, label]) => (
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

      {/* Grade filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(GRADE_LABELS) as GradeFilter[]).map((g) => (
          <button
            key={g}
            onClick={() => setGradeFilter(g)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              gradeFilter === g
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 border hover:bg-gray-100"
            }`}
          >
            {GRADE_LABELS[g]}
          </button>
        ))}
      </div>

      {/* Flagged flat view */}
      {!standard && tab === "thumbs-down" && (
        <div className="space-y-6">
          {(() => {
            const flaggedQuestions = filtered.flatMap((s) =>
              s.questions
                .filter((q) => myReviews[q.id]?.status === "down")
                .map((q) => ({ standard: s, question: q })),
            );
            if (flaggedQuestions.length === 0)
              return <p className="text-gray-400 text-center py-12">No flagged questions</p>;
            return flaggedQuestions.map(({ standard: s, question: q }) => {
              const key = q.id;
              const review = myReviews[key];
              const draft = commentDraft[key] || "";
              return (
                <div key={key} className="rounded-xl shadow-sm border p-4 md:p-6 bg-red-50 border-red-200">
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={() => setSelectedStandard(s.standard_id)}
                      className="font-bold text-indigo-600 hover:underline text-sm"
                    >
                      {s.standard_id}
                    </button>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700">
                      {q.id}
                    </span>
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        onClick={() => toggleRating(key, "up", s.standard_id)}
                        className={`p-1.5 rounded-lg transition-colors text-lg ${
                          review?.status === "up" ? "bg-emerald-200 text-emerald-700" : "hover:bg-gray-100 text-gray-400"
                        }`}
                      >👍</button>
                      <button
                        onClick={() => toggleRating(key, "down", s.standard_id)}
                        className={`p-1.5 rounded-lg transition-colors text-lg ${
                          review?.status === "down" ? "bg-red-200 text-red-700" : "hover:bg-gray-100 text-gray-400"
                        }`}
                      >👎</button>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-[280px_1fr] gap-6">
                    <div>
                      <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 border">
                        <img
                          src={getImageUrl(s.standard_id, q.id)}
                          alt={q.id}
                          className="object-cover absolute inset-0 w-full h-full"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 whitespace-pre-line mb-2"><RichPrompt text={q.prompt} /></p>
                        <div className="flex gap-2">
                          <SpeakerButton label="Question"
                            active={isSpeaking && playingUrl === getAudioUrl(s.standard_id, q.id, "question")}
                            onClick={() => playAudio(getAudioUrl(s.standard_id, q.id, "question"))} />
                          {q.hint && (
                            <SpeakerButton label="Hint"
                              active={isSpeaking && playingUrl === getAudioUrl(s.standard_id, q.id, "hint")}
                              onClick={() => playAudio(getAudioUrl(s.standard_id, q.id, "hint"))} />
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {q.choices.map((c, i) => (
                          <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${c === q.correct ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-white"}`}>
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: CHOICE_COLORS[i] }}>{CHOICE_LETTERS[i]}</span>
                            <span className={`text-sm ${c === q.correct ? "font-bold text-emerald-800" : "text-gray-700"}`}>{c}</span>
                          </div>
                        ))}
                      </div>
                      {/* All reviewers' comments */}
                      {allItemReviews[key] && allItemReviews[key].length > 0 && (
                        <div className="mb-3">
                          <ReviewList reviews={allItemReviews[key]} currentUserId={userId} />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input type="text" placeholder="Add a note..." value={draft}
                          onChange={(e) => setCommentDraft((d) => ({ ...d, [key]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter") submitComment(key, s.standard_id); }}
                          className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                        <button onClick={() => submitComment(key, s.standard_id)} disabled={!draft.trim()}
                          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40">
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

      {/* Standard grid */}
      {!standard && tab !== "thumbs-down" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {filtered.map((s) => {
            const grade = gradeFromStandard(s.standard_id);
            const firstQ = s.questions[0];
            const imgPath = firstQ ? getImageUrl(s.standard_id, firstQ.id) : "";
            const hasError = imgErrors.has(s.standard_id);
            const qKeys = s.questions.map((q) => q.id);
            const allReviewed = qKeys.every((k) => myReviews[k]?.status);
            const hasFlagged = qKeys.some((k) => myReviews[k]?.status === "down");
            return (
              <button
                key={s.standard_id}
                onClick={() => setSelectedStandard(s.standard_id)}
                className={`rounded-lg shadow-sm border hover:shadow-md transition-shadow p-2 text-left ${
                  hasFlagged ? "bg-red-50 border-red-200" : allReviewed ? "bg-emerald-50 border-emerald-200" : "bg-white"
                }`}
              >
                <div className="aspect-square relative rounded-md overflow-hidden bg-gray-100 mb-2">
                  {firstQ && !hasError ? (
                    <img src={imgPath} alt={s.standard_id}
                      className="object-cover absolute inset-0 w-full h-full"
                      onError={() => setImgErrors((prev) => new Set(prev).add(s.standard_id))}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                  )}
                  {allReviewed && !hasFlagged && (
                    <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</div>
                  )}
                  {hasFlagged && (
                    <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">!</div>
                  )}
                </div>
                <p className="font-semibold text-xs text-gray-800 truncate">{s.standard_id}</p>
                <p className="text-xs text-gray-500 truncate">{s.questions.length} questions</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Standard detail */}
      {standard && (
        <div>
          {(() => {
            const idx = filtered.findIndex((s) => s.standard_id === standard.standard_id);
            const prev = idx > 0 ? filtered[idx - 1] : null;
            const next = idx < filtered.length - 1 ? filtered[idx + 1] : null;
            return (
              <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setSelectedStandard(null)} className="text-indigo-600 hover:underline text-sm">
                  &larr; All standards
                </button>
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={() => prev && setSelectedStandard(prev.standard_id)} disabled={!prev}
                    className="px-3 py-1.5 text-sm rounded-lg border font-medium hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
                    &larr; Prev
                  </button>
                  <span className="text-xs text-gray-400">{idx + 1} / {filtered.length}</span>
                  <button onClick={() => { if (next) { setSelectedStandard(next.standard_id); window.scrollTo({ top: 0 }); } }} disabled={!next}
                    className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed">
                    Next &rarr;
                  </button>
                </div>
              </div>
            );
          })()}

          <h2 className="text-xl font-bold mb-1">{standard.standard_id}</h2>
          <p className="text-gray-500 text-sm mb-1">{standard.domain}</p>
          <p className="text-gray-400 text-xs mb-6">{standard.standard_description}</p>

          <div className="space-y-8">
            {standard.questions.map((q) => {
              const key = q.id;
              const review = myReviews[key];
              const draft = commentDraft[key] || "";

              return (
                <div key={q.id} className={`rounded-xl shadow-sm border p-4 md:p-6 ${
                  review?.status === "down" ? "bg-red-50 border-red-200"
                    : review?.status === "up" ? "bg-emerald-50 border-emerald-200" : "bg-white"
                }`}>
                  {/* Question header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700">
                      {q.id}
                    </span>
                    <div className="ml-auto flex items-center gap-1">
                      <button onClick={() => toggleRating(key, "up", standard.standard_id)}
                        className={`p-1.5 rounded-lg transition-colors text-lg ${
                          review?.status === "up" ? "bg-emerald-200 text-emerald-700" : "hover:bg-gray-100 text-gray-400"
                        }`}>👍</button>
                      <button onClick={() => toggleRating(key, "down", standard.standard_id)}
                        className={`p-1.5 rounded-lg transition-colors text-lg ${
                          review?.status === "down" ? "bg-red-200 text-red-700" : "hover:bg-gray-100 text-gray-400"
                        }`}>👎</button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-[280px_1fr] gap-6">
                    {/* Image */}
                    <div>
                      <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 border">
                        {!imgErrors.has(q.id) ? (
                          <img
                            src={getImageUrl(standard.standard_id, q.id)}
                            alt={q.id}
                            className="object-cover absolute inset-0 w-full h-full"
                            onError={() => setImgErrors((prev) => new Set(prev).add(q.id))}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      {/* Prompt */}
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                          <RichPrompt text={q.prompt} />
                        </p>
                        <div className="flex gap-2 mt-2">
                          <SpeakerButton label="Question"
                            active={isSpeaking && playingUrl === getAudioUrl(standard.standard_id, q.id, "question")}
                            onClick={() => playAudio(getAudioUrl(standard.standard_id, q.id, "question"))} />
                          {q.hint && (
                            <SpeakerButton label="Hint"
                              active={isSpeaking && playingUrl === getAudioUrl(standard.standard_id, q.id, "hint")}
                              onClick={() => playAudio(getAudioUrl(standard.standard_id, q.id, "hint"))} />
                          )}
                        </div>
                      </div>

                      {/* Choices */}
                      <div className="grid grid-cols-2 gap-2">
                        {q.choices.map((choice, i) => {
                          const isCorrect = choice === q.correct;
                          return (
                            <div key={i} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 ${
                              isCorrect ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-white"
                            }`}>
                              <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{ backgroundColor: CHOICE_COLORS[i] }}>
                                {CHOICE_LETTERS[i]}
                              </span>
                              <span className={`flex-1 text-sm leading-tight ${isCorrect ? "font-bold text-emerald-800" : "text-gray-700"}`}>
                                {choice}
                              </span>
                              {isCorrect && (
                                <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Hint */}
                      {q.hint && (
                        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                          <p className="text-xs font-semibold text-amber-700 mb-0.5">Hint</p>
                          <p className="text-sm text-amber-800">{q.hint}</p>
                        </div>
                      )}

                      {/* All reviewers' comments */}
                      {allItemReviews[key] && allItemReviews[key].length > 0 && (
                        <ReviewList reviews={allItemReviews[key]} currentUserId={userId} />
                      )}
                      <div className="flex gap-2">
                        <input type="text" placeholder="Add a note..." value={draft}
                          onChange={(e) => setCommentDraft((d) => ({ ...d, [key]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter") submitComment(key, standard.standard_id); }}
                          className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                        <button onClick={() => submitComment(key, standard.standard_id)} disabled={!draft.trim()}
                          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40">
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
