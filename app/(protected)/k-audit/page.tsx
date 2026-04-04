"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { getStandardsForGrade } from "@/lib/data/all-standards";
import { useAudio } from "@/lib/audio/use-audio";
import { TapToPair } from "@/app/components/practice/TapToPair";
import { SoundMachine } from "@/app/components/practice/SoundMachine";
import { CategorySort } from "@/app/components/practice/CategorySort";
import { MissingWord } from "@/app/components/practice/MissingWord";
import { SentenceBuild } from "@/app/components/practice/SentenceBuild";
import { ThumbsUp } from "lucide-react";
import { SpaceInsertion } from "@/app/components/practice/SpaceInsertion";

/* ── Types ──────────────────────────────────────────── */

interface Question {
  id: string;
  type: string;
  prompt: string;
  correct: string;
  hint?: string;
  audio_url?: string;
  hint_audio_url?: string;
  // MCQ
  choices?: string[];
  choices_audio_urls?: (string | null)[];
  // MissingWord
  sentence_words?: string[];
  blank_index?: number;
  missing_choices?: string[];
  // SentenceBuild
  words?: string[];
  sentence_hint?: string;
  // CategorySort
  categories?: string[];
  category_items?: Record<string, string[]>;
  items?: string[];
  // TapToPair
  left_items?: string[];
  right_items?: string[];
  correct_pairs?: Record<string, string>;
  // SoundMachine
  target_word?: string;
  phonemes?: string[];
  distractors?: string[];
  // SpaceInsertion
  jumbled?: string;
}

interface Standard {
  standard_id: string;
  standard_description: string;
  domain: string;
  questions: Question[];
}

interface ReviewEntry {
  rating: "up" | "down" | null;
  comment: string;
}

type ReviewMap = Record<string, ReviewEntry>;
type FilterTab = "all" | "needs-review" | "thumbs-down";
type TypeFilter = "all" | "multiple_choice" | "missing_word" | "tap_to_pair" | "sound_machine" | "category_sort" | "sentence_build" | "space_insertion";

const LOCAL_KEY = "readee_k_audit_v1";
const CHOICE_LETTERS = ["A", "B", "C", "D"];
const CHOICE_COLORS = ["#60a5fa", "#4ade80", "#fb923c", "#a78bfa"];
const SUPABASE_IMG = "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public/images";
const SUPABASE_AUDIO = "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public/audio";

const TYPE_BADGES: Record<string, { label: string; color: string }> = {
  multiple_choice: { label: "MCQ", color: "bg-blue-100 text-blue-700" },
  missing_word: { label: "Fill Blank", color: "bg-amber-100 text-amber-700" },
  tap_to_pair: { label: "Tap to Pair", color: "bg-purple-100 text-purple-700" },
  sound_machine: { label: "Sound Machine", color: "bg-pink-100 text-pink-700" },
  category_sort: { label: "Category Sort", color: "bg-emerald-100 text-emerald-700" },
  sentence_build: { label: "Sentence Build", color: "bg-cyan-100 text-cyan-700" },
  space_insertion: { label: "Space Insertion", color: "bg-rose-100 text-rose-700" },
};

/* ── Rich prompt ─────────────────────────────────────── */

function RichPrompt({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const bold = part.match(/^\*\*(.+?)\*\*$/);
        return bold ? (
          <span key={i} className="font-bold underline decoration-indigo-400 decoration-2 underline-offset-2">{bold[1]}</span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
}

/* ── Speaker button ────────────────────────────────── */

function SpeakerBtn({ label, onClick, active }: { label: string; onClick: () => void; active?: boolean }) {
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

/* ── Type-specific renderers ─────────────────────────── */

function MCQView({ q, onPlayAudio }: { q: Question; onPlayAudio?: (url: string) => void }) {
  const hasChoiceAudio = q.choices_audio_urls?.some(url => url && url.startsWith("https://"));
  return (
    <div className="grid grid-cols-2 gap-2">
      {(q.choices || []).map((c, i) => {
        const audioUrl = q.choices_audio_urls?.[i];
        return (
          <div key={i} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 ${
            c === q.correct ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-white"
          }`}>
            <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: CHOICE_COLORS[i] }}>{CHOICE_LETTERS[i]}</span>
            <span className={`flex-1 text-sm leading-tight ${c === q.correct ? "font-bold text-emerald-800" : "text-gray-700"}`}>{c}</span>
            {hasChoiceAudio && audioUrl && onPlayAudio && (
              <button onClick={() => onPlayAudio(audioUrl)}
                className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center transition-colors"
                title="Play phoneme audio">
                <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M11 5L6 9H2v6h4l5 4V5z" />
                </svg>
              </button>
            )}
            {c === q.correct && (
              <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* Static views removed — using real interactive components instead */

/* ── Main Page ──────────────────────────────────────── */

export default function KAuditPage() {
  const [selectedStandard, setSelectedStandard] = useState<string | null>(null);
  const [tab, setTab] = useState<FilterTab>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [reviews, setReviews] = useState<ReviewMap>({});
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [useLocal, setUseLocal] = useState(true);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [answeredMap, setAnsweredMap] = useState<Record<string, boolean>>({});
  const audioUnlockedRef = useRef(false);

  const { playUrl: rawPlayUrl, isSpeaking, unlockAudio, stop } = useAudio();

  const playAudio = useCallback((url: string) => {
    if (!audioUnlockedRef.current) { unlockAudio(); audioUnlockedRef.current = true; }
    setPlayingUrl(url);
    rawPlayUrl(url);
  }, [rawPlayUrl, unlockAudio]);

  const playPhoneme = useCallback((url: string) => {
    if (!audioUnlockedRef.current) { unlockAudio(); audioUnlockedRef.current = true; }
    setPlayingUrl(url);
    rawPlayUrl(url, 0);
  }, [rawPlayUrl, unlockAudio]);

  useEffect(() => { if (!isSpeaking) setPlayingUrl(null); }, [isSpeaking]);

  const allStandards = useMemo(() => {
    const raw = getStandardsForGrade("kindergarten");
    return raw.map((s: any) => ({
      standard_id: s.standard_id,
      standard_description: s.standard_description,
      domain: s.domain,
      questions: s.questions || [],
    })) as Standard[];
  }, []);

  // Load reviews
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY);
      if (saved) setReviews(JSON.parse(saved));
    } catch {}
  }, []);

  function saveReview(key: string, review: ReviewEntry) {
    const next = { ...reviews, [key]: review };
    setReviews(next);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
  }

  function toggleRating(key: string, rating: "up" | "down") {
    const current = reviews[key];
    const newRating = current?.rating === rating ? null : rating;
    saveReview(key, { rating: newRating, comment: current?.comment || "" });
  }

  function submitComment(key: string) {
    const text = (commentDraft[key] || "").trim();
    if (!text) return;
    const current = reviews[key];
    saveReview(key, { rating: current?.rating || null, comment: text });
    setCommentDraft((d) => ({ ...d, [key]: "" }));
  }

  // Stats
  const allQuestions = allStandards.flatMap(s => s.questions);
  const totalQuestions = allQuestions.length;
  const reviewed = Object.values(reviews).filter(r => r.rating).length;
  const thumbsDown = Object.values(reviews).filter(r => r.rating === "down").length;

  // Type counts
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allQuestions.forEach(q => { counts[q.type] = (counts[q.type] || 0) + 1; });
    return counts;
  }, [allQuestions]);

  // Filter
  const filtered = useMemo(() => {
    let result = allStandards;
    if (typeFilter !== "all") {
      result = result.map(s => ({
        ...s,
        questions: s.questions.filter(q => q.type === typeFilter),
      })).filter(s => s.questions.length > 0);
    }
    if (tab === "needs-review") {
      result = result.map(s => ({
        ...s,
        questions: s.questions.filter(q => !reviews[q.id]?.rating),
      })).filter(s => s.questions.length > 0);
    } else if (tab === "thumbs-down") {
      result = result.map(s => ({
        ...s,
        questions: s.questions.filter(q => reviews[q.id]?.rating === "down"),
      })).filter(s => s.questions.length > 0);
    }
    return result;
  }, [allStandards, tab, typeFilter, reviews]);

  const filteredCount = filtered.reduce((n, s) => n + s.questions.length, 0);

  const standard = selectedStandard
    ? filtered.find(s => s.standard_id === selectedStandard) || allStandards.find(s => s.standard_id === selectedStandard)
    : null;

  function getImageUrl(standardId: string, questionId: string) {
    if (useLocal) return `/images/kindergarten/${standardId}/${questionId}.png`;
    return `${SUPABASE_IMG}/kindergarten/${standardId}/${questionId}.png`;
  }

  function getAudioUrl(standardId: string, questionId: string, type: "question" | "hint") {
    const suffix = type === "hint" ? "-hint" : "";
    if (useLocal) return `/audio/kindergarten/${standardId}/${questionId}${suffix}.mp3`;
    return `${SUPABASE_AUDIO}/kindergarten/${standardId}/${questionId}${suffix}.mp3`;
  }

  function handleInteractiveAnswer(qId: string, isCorrect: boolean) {
    setAnsweredMap(prev => ({ ...prev, [qId]: true }));
  }

  function resetQuestion(qId: string) {
    setAnsweredMap(prev => ({ ...prev, [qId]: false }));
  }

  function renderQuestionContent(q: Question) {
    const answered = answeredMap[q.id] || false;
    const onAnswer = (isCorrect: boolean) => handleInteractiveAnswer(q.id, isCorrect);

    switch (q.type) {
      case "missing_word":
        return (
          <div>
            <MissingWord
              prompt={q.prompt}
              sentenceWords={q.sentence_words || []}
              blankIndex={q.blank_index ?? 0}
              choices={q.missing_choices || []}
              correct={q.correct}
              sentenceHint={q.sentence_hint}
              answered={answered}
              onAnswer={(isCorrect) => onAnswer(isCorrect)}
            />
            {answered && <button onClick={() => resetQuestion(q.id)} className="mt-2 px-3 py-1 text-xs bg-gray-200 rounded-lg hover:bg-gray-300">Reset</button>}
          </div>
        );
      case "tap_to_pair":
        return (
          <div>
            <TapToPair
              prompt={q.prompt}
              leftItems={q.left_items || []}
              rightItems={q.right_items || []}
              correctPairs={q.correct_pairs || {}}
              answered={answered}
              onAnswer={(isCorrect) => onAnswer(isCorrect)}
            />
            {answered && <button onClick={() => resetQuestion(q.id)} className="mt-2 px-3 py-1 text-xs bg-gray-200 rounded-lg hover:bg-gray-300">Reset</button>}
          </div>
        );
      case "sound_machine":
        return (
          <div>
            <SoundMachine
              prompt={q.prompt}
              targetWord={q.target_word || ""}
              phonemes={q.phonemes || []}
              distractors={q.distractors || []}
              answered={answered}
              onAnswer={(isCorrect) => onAnswer(isCorrect)}
            />
            {answered && <button onClick={() => resetQuestion(q.id)} className="mt-2 px-3 py-1 text-xs bg-gray-200 rounded-lg hover:bg-gray-300">Reset</button>}
          </div>
        );
      case "category_sort":
        return (
          <div>
            <CategorySort
              prompt={q.prompt}
              categories={q.categories || []}
              categoryItems={q.category_items || {}}
              items={q.items || []}
              answered={answered}
              onAnswer={(isCorrect) => onAnswer(isCorrect)}
            />
            {answered && <button onClick={() => resetQuestion(q.id)} className="mt-2 px-3 py-1 text-xs bg-gray-200 rounded-lg hover:bg-gray-300">Reset</button>}
          </div>
        );
      case "sentence_build":
        return (
          <div>
            <SentenceBuild
              prompt={q.prompt}
              passage={null}
              words={q.words || []}
              correctSentence={q.correct}
              sentenceHint={q.sentence_hint}
              answered={answered}
              onAnswer={(isCorrect) => onAnswer(isCorrect)}
            />
            {answered && <button onClick={() => resetQuestion(q.id)} className="mt-2 px-3 py-1 text-xs bg-gray-200 rounded-lg hover:bg-gray-300">Reset</button>}
          </div>
        );
      case "space_insertion":
        return (
          <div>
            <SpaceInsertion
              prompt={q.prompt}
              jumbled={q.jumbled || ""}
              correctSentence={q.correct}
              answered={answered}
              onAnswer={(isCorrect) => onAnswer(isCorrect)}
            />
            {answered && <button onClick={() => resetQuestion(q.id)} className="mt-2 px-3 py-1 text-xs bg-gray-200 rounded-lg hover:bg-gray-300">Reset</button>}
          </div>
        );
      default: return <MCQView q={q} onPlayAudio={playPhoneme} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-1">Kindergarten Question Audit</h1>
      <p className="text-gray-500 mb-4 text-sm">
        {allStandards.length} standards, {totalQuestions} questions |{" "}
        <span className="text-emerald-600 font-medium">{reviewed} reviewed</span>
        {thumbsDown > 0 && <> | <span className="text-red-500 font-medium">{thumbsDown} flagged</span></>}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => {
            const rows = ["Standard,Question ID,Type,Prompt,Correct,Rating,Comment"];
            allStandards.forEach(s => {
              s.questions.forEach(q => {
                const r = reviews[q.id];
                const rating = r?.rating || "";
                const comment = (r?.comment || "").replace(/"/g, '""');
                const prompt = q.prompt.replace(/"/g, '""').replace(/\n/g, " ");
                rows.push(`${s.standard_id},${q.id},${q.type},"${prompt}","${q.correct}",${rating},"${comment}"`);
              });
            });
            const blob = new Blob([rows.join("\n")], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "k-question-audit.csv";
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 font-medium"
        >
          Export CSV
        </button>
        <button
          onClick={() => setUseLocal(v => !v)}
          className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
            useLocal ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"
          }`}
        >
          {useLocal ? "Local" : "Supabase"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-3">
        {([["all", "All"], ["needs-review", "Needs Review"], ["thumbs-down", "Flagged"]] as [FilterTab, string][]).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              tab === t ? "bg-gray-800 text-white" : "bg-white text-gray-600 border hover:bg-gray-100"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setTypeFilter("all")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            typeFilter === "all" ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border hover:bg-gray-100"
          }`}>
          All ({totalQuestions})
        </button>
        {Object.entries(TYPE_BADGES).map(([type, { label, color }]) => {
          const count = typeCounts[type] || 0;
          if (count === 0) return null;
          return (
            <button key={type} onClick={() => setTypeFilter(type as TypeFilter)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                typeFilter === type ? "bg-indigo-600 text-white" : `${color} border hover:opacity-80`
              }`}>
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Standard grid */}
      {!standard && (
        <>
          <p className="text-xs text-gray-400 mb-3">{filtered.length} standards, {filteredCount} questions</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {filtered.map(s => {
              const firstQ = s.questions[0];
              const imgPath = firstQ ? getImageUrl(s.standard_id, firstQ.id) : "";
              const hasError = imgErrors.has(s.standard_id);
              const allReviewed = s.questions.every(q => reviews[q.id]?.rating);
              const hasFlagged = s.questions.some(q => reviews[q.id]?.rating === "down");
              const types = [...new Set(s.questions.map(q => q.type))];
              return (
                <button key={s.standard_id} onClick={() => setSelectedStandard(s.standard_id)}
                  className={`rounded-lg shadow-sm border hover:shadow-md transition-shadow p-2 text-left ${
                    hasFlagged ? "bg-red-50 border-red-200" : allReviewed ? "bg-emerald-50 border-emerald-200" : "bg-white"
                  }`}>
                  <div className="aspect-square relative rounded-md overflow-hidden bg-gray-100 mb-2">
                    {firstQ && !hasError ? (
                      <img src={imgPath} alt={s.standard_id}
                        className="object-cover absolute inset-0 w-full h-full"
                        onError={() => setImgErrors(prev => new Set(prev).add(s.standard_id))}
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
                  <div className="flex flex-wrap gap-1 mt-1">
                    {types.map(t => {
                      const badge = TYPE_BADGES[t] || { label: t, color: "bg-gray-100 text-gray-600" };
                      return <span key={t} className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${badge.color}`}>{badge.label}</span>;
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{s.questions.length} questions</p>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Standard detail */}
      {standard && (
        <div>
          {(() => {
            const idx = filtered.findIndex(s => s.standard_id === standard.standard_id);
            const prev = idx > 0 ? filtered[idx - 1] : null;
            const next = idx < filtered.length - 1 ? filtered[idx + 1] : null;
            return (
              <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setSelectedStandard(null)} className="text-indigo-600 hover:underline text-sm">&larr; All standards</button>
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={() => prev && setSelectedStandard(prev.standard_id)} disabled={!prev}
                    className="px-3 py-1.5 text-sm rounded-lg border font-medium hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">&larr; Prev</button>
                  <span className="text-xs text-gray-400">{idx + 1} / {filtered.length}</span>
                  <button onClick={() => { if (next) { setSelectedStandard(next.standard_id); window.scrollTo({ top: 0 }); } }} disabled={!next}
                    className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed">Next &rarr;</button>
                </div>
              </div>
            );
          })()}

          <h2 className="text-xl font-bold mb-1">{standard.standard_id}</h2>
          <p className="text-gray-500 text-sm mb-1">{standard.domain}</p>
          <p className="text-gray-400 text-xs mb-6">{standard.standard_description}</p>

          <div className="space-y-8">
            {standard.questions.map(q => {
              const review = reviews[q.id];
              const draft = commentDraft[q.id] || "";
              const badge = TYPE_BADGES[q.type] || { label: q.type, color: "bg-gray-100 text-gray-600" };
              const showImage = q.type === "multiple_choice";

              return (
                <div key={q.id} className={`rounded-xl shadow-sm border p-4 md:p-6 ${
                  review?.rating === "down" ? "bg-red-50 border-red-200"
                    : review?.rating === "up" ? "bg-emerald-50 border-emerald-200" : "bg-white"
                }`}>
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700">{q.id}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${badge.color}`}>{badge.label}</span>
                    <div className="ml-auto flex items-center gap-1">
                      <button onClick={() => toggleRating(q.id, "up")}
                        className={`p-1.5 rounded-lg transition-colors text-lg ${
                          review?.rating === "up" ? "bg-emerald-200 text-emerald-700" : "hover:bg-gray-100 text-gray-400"
                        }`}><ThumbsUp className="w-4 h-4" /></button>
                      <button onClick={() => toggleRating(q.id, "down")}
                        className={`p-1.5 rounded-lg transition-colors text-lg ${
                          review?.rating === "down" ? "bg-red-200 text-red-700" : "hover:bg-gray-100 text-gray-400"
                        }`}>👎</button>
                    </div>
                  </div>

                  <div className={`grid gap-6 ${showImage ? "md:grid-cols-[280px_1fr]" : ""}`}>
                    {/* Image (MCQ only) */}
                    {showImage && (
                      <div>
                        <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 border">
                          {!imgErrors.has(q.id) ? (
                            <img src={getImageUrl(standard.standard_id, q.id)} alt={q.id}
                              className="object-cover absolute inset-0 w-full h-full"
                              onError={() => setImgErrors(prev => new Set(prev).add(q.id))}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="space-y-3">
                      {/* Prompt */}
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line"><RichPrompt text={q.prompt} /></p>
                        <div className="flex gap-2 mt-2">
                          <SpeakerBtn label="Question"
                            active={isSpeaking && playingUrl === getAudioUrl(standard.standard_id, q.id, "question")}
                            onClick={() => playAudio(getAudioUrl(standard.standard_id, q.id, "question"))} />
                          {q.hint && (
                            <SpeakerBtn label="Hint"
                              active={isSpeaking && playingUrl === getAudioUrl(standard.standard_id, q.id, "hint")}
                              onClick={() => playAudio(getAudioUrl(standard.standard_id, q.id, "hint"))} />
                          )}
                        </div>
                      </div>

                      {/* Type-specific content */}
                      {renderQuestionContent(q)}

                      {/* Hint */}
                      {q.hint && (
                        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                          <p className="text-xs font-semibold text-amber-700 mb-0.5">Hint</p>
                          <p className="text-sm text-amber-800">{q.hint}</p>
                        </div>
                      )}

                      {/* Comment */}
                      {review?.comment && (
                        <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                          <span className="font-semibold">Note:</span> {review.comment}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input type="text" placeholder="Add a note..." value={draft}
                          onChange={e => setCommentDraft(d => ({ ...d, [q.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === "Enter") submitComment(q.id); }}
                          className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                        <button onClick={() => submitComment(q.id)} disabled={!draft.trim()}
                          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40">Save</button>
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
