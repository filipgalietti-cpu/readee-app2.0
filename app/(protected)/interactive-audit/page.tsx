"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { getStandardsForGrade } from "@/lib/data/all-standards";
import type { GradeKey } from "@/lib/assessment/questions";
import { useAudio } from "@/lib/audio/use-audio";
import { useAuditReviews } from "@/lib/audit/use-audit-reviews";
import { ReviewList } from "@/app/components/audit/ReviewList";
import { MissingWord } from "@/app/components/practice/MissingWord";
import { SentenceBuild } from "@/app/components/practice/SentenceBuild";
import { CategorySort } from "@/app/components/practice/CategorySort";
import { TapToPair } from "@/app/components/practice/TapToPair";
import { SoundMachine } from "@/app/components/practice/SoundMachine";
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
  choices?: string[];
  choices_audio_urls?: (string | null)[];
  sentence_words?: string[];
  blank_index?: number;
  missing_choices?: string[];
  words?: string[];
  sentence_hint?: string;
  categories?: string[];
  category_items?: Record<string, string[]>;
  items?: string[];
  left_items?: string[];
  right_items?: string[];
  correct_pairs?: Record<string, string>;
  target_word?: string;
  phonemes?: string[];
  distractors?: string[];
  jumbled?: string;
}

interface Standard {
  standard_id: string;
  standard_description: string;
  domain: string;
  questions: Question[];
}

const NEW_TYPES = ["missing_word", "sentence_build", "category_sort", "tap_to_pair", "sound_machine", "space_insertion"];

const TYPE_BADGES: Record<string, { label: string; color: string }> = {
  missing_word: { label: "Fill Blank", color: "bg-amber-100 text-amber-700 border-amber-300" },
  sentence_build: { label: "Sentence Build", color: "bg-cyan-100 text-cyan-700 border-cyan-300" },
  category_sort: { label: "Category Sort", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  tap_to_pair: { label: "Tap to Pair", color: "bg-purple-100 text-purple-700 border-purple-300" },
  sound_machine: { label: "Sound Machine", color: "bg-pink-100 text-pink-700 border-pink-300" },
  space_insertion: { label: "Space Insertion", color: "bg-rose-100 text-rose-700 border-rose-300" },
};

const RESULT_LABELS: Record<string, { label: string; color: string }> = {
  pass: { label: "PASS", color: "bg-emerald-500 text-white" },
  fail: { label: "FAIL", color: "bg-red-500 text-white" },
  untested: { label: "UNTESTED", color: "bg-gray-200 text-gray-600" },
};

type TestResult = "pass" | "fail" | "untested";

const GRADE_OPTIONS: { key: GradeKey; label: string; folder: string }[] = [
  { key: "1st", label: "1st Grade", folder: "1st-grade" },
  { key: "2nd", label: "2nd Grade", folder: "2nd-grade" },
  { key: "3rd", label: "3rd Grade", folder: "3rd-grade" },
  { key: "4th", label: "4th Grade", folder: "4th-grade" },
];

/* ── Main Page ──────────────────────────────────────── */

export default function InteractiveAuditPage() {
  const [gradeIdx, setGradeIdx] = useState(0);
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [answeredMap, setAnsweredMap] = useState<Record<string, boolean>>({});
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const audioUnlockedRef = useRef(false);

  const grade = GRADE_OPTIONS[gradeIdx];

  const { reviews: allItemReviews, myReviews, loading: reviewsLoading, userId, upsertReview, deleteReview, exportCsv } = useAuditReviews("question");

  const { playUrl, isSpeaking, unlockAudio, stop } = useAudio();

  const playAudio = useCallback((url: string) => {
    if (!audioUnlockedRef.current) { unlockAudio(); audioUnlockedRef.current = true; }
    playUrl(url);
  }, [playUrl, unlockAudio]);

  const allStandards = useMemo(() => {
    const raw = getStandardsForGrade(grade.key);
    return (raw as any[]).map((s) => ({
      standard_id: s.standard_id,
      standard_description: s.standard_description,
      domain: s.domain,
      questions: (s.questions || []).filter((q: Question) => NEW_TYPES.includes(q.type)),
    })).filter((s) => s.questions.length > 0) as Standard[];
  }, [grade.key]);

  const allQuestions = useMemo(() => allStandards.flatMap(s => s.questions), [allStandards]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allQuestions.forEach(q => { counts[q.type] = (counts[q.type] || 0) + 1; });
    return counts;
  }, [allQuestions]);

  const filtered = useMemo(() => {
    if (typeFilter === "all") return allStandards;
    return allStandards.map(s => ({
      ...s,
      questions: s.questions.filter(q => q.type === typeFilter),
    })).filter(s => s.questions.length > 0);
  }, [allStandards, typeFilter]);

  const filteredQuestions = filtered.flatMap(s => s.questions);

  // Reset state when grade changes
  useEffect(() => {
    setAnsweredMap({});
    setCommentDraft({});
    setTypeFilter("all");
  }, [gradeIdx]);

  function getResult(qId: string): TestResult {
    const status = myReviews[qId]?.status;
    if (status === "pass") return "pass";
    if (status === "fail") return "fail";
    return "untested";
  }

  const passCount = filteredQuestions.filter(q => getResult(q.id) === "pass").length;
  const failCount = filteredQuestions.filter(q => getResult(q.id) === "fail").length;
  const untestedCount = filteredQuestions.filter(q => getResult(q.id) === "untested").length;

  function handleAnswer(qId: string, isCorrect: boolean) {
    setAnsweredMap(prev => ({ ...prev, [qId]: true }));
  }

  function markResult(qId: string, result: TestResult) {
    if (result === "untested") {
      deleteReview(qId);
    } else {
      const current = myReviews[qId];
      upsertReview(qId, { status: result, comment: current?.comment || "", grade: grade.folder });
    }
  }

  function saveComment(qId: string) {
    const text = (commentDraft[qId] || "").trim();
    if (!text) return;
    const current = myReviews[qId];
    upsertReview(qId, { status: current?.status as any || null, comment: text, grade: grade.folder });
    setCommentDraft(d => ({ ...d, [qId]: "" }));
  }

  const AUDIO_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio`
    : "";

  const playWordAudio = useCallback((word: string) => {
    const clean = word.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase().replace(/\s+/g, "_");
    if (!clean) return;
    const src = AUDIO_BASE ? `${AUDIO_BASE}/words/${clean}.mp3` : `/audio/words/${clean}.mp3`;
    playAudio(src);
  }, [playAudio, AUDIO_BASE]);

  const PHONEME_MAP: Record<string, string> = {
    "/b/": "b", "/k/": "c_hard", "/s/": "s", "/d/": "d", "/f/": "f", "/g/": "g",
    "/h/": "h", "/j/": "j", "/l/": "l", "/m/": "m", "/n/": "n", "/p/": "p",
    "/r/": "r", "/t/": "t", "/v/": "v", "/w/": "w", "/z/": "z",
    "/a/": "short_a", "/e/": "short_e", "/i/": "short_i", "/o/": "short_o", "/u/": "short_u",
    "/ch/": "ch", "/sh/": "sh", "/th/": "th_unvoiced",
  };

  const playPhonemeAudio = useCallback((phoneme: string) => {
    const id = PHONEME_MAP[phoneme];
    if (!id || !AUDIO_BASE) return;
    playAudio(`${AUDIO_BASE}/phonemes/${id}.mp3`);
  }, [playAudio, AUDIO_BASE]);

  const playItemSmart = useCallback((item: string) => {
    if (/^\/[a-z]+\/$/.test(item)) {
      playPhonemeAudio(item);
    } else {
      playWordAudio(item);
    }
  }, [playPhonemeAudio, playWordAudio]);

  function resetQuestion(qId: string) {
    setAnsweredMap(prev => ({ ...prev, [qId]: false }));
  }

  function renderQuestion(q: Question) {
    const answered = answeredMap[q.id] || false;
    const onAnswer = (isCorrect: boolean) => handleAnswer(q.id, isCorrect);

    switch (q.type) {
      case "missing_word":
        return (
          <MissingWord
            prompt={q.prompt}
            sentenceWords={q.sentence_words || []}
            blankIndex={q.blank_index ?? 0}
            choices={q.missing_choices || []}
            correct={q.correct}
            sentenceHint={q.sentence_hint}
            questionId={q.id}
            answered={answered}
            onAnswer={(isCorrect) => onAnswer(isCorrect)}
          />
        );
      case "sentence_build":
        return (
          <SentenceBuild
            prompt={q.prompt}
            passage={null}
            words={q.words || []}
            correctSentence={q.correct}
            sentenceHint={q.sentence_hint}
            questionId={q.id}
            answered={answered}
            onAnswer={(isCorrect) => onAnswer(isCorrect)}
            onPlayItem={playWordAudio}
            ordered={(q as any).ordered}
          />
        );
      case "category_sort":
        return (
          <CategorySort
            prompt={q.prompt}
            categories={q.categories || []}
            categoryItems={q.category_items || {}}
            items={q.items || []}
            answered={answered}
            onAnswer={(isCorrect) => onAnswer(isCorrect)}
            onPlayItem={playWordAudio}
          />
        );
      case "tap_to_pair":
        return (
          <TapToPair
            prompt={q.prompt}
            leftItems={q.left_items || []}
            rightItems={q.right_items || []}
            correctPairs={q.correct_pairs || {}}
            answered={answered}
            onAnswer={(isCorrect) => onAnswer(isCorrect)}
            onPlayItem={playItemSmart}
          />
        );
      case "sound_machine":
        return (
          <SoundMachine
            prompt={q.prompt}
            targetWord={q.target_word || ""}
            phonemes={q.phonemes || []}
            distractors={q.distractors || []}
            imageUrl={(q as any).image_url}
            answered={answered}
            onAnswer={(isCorrect) => onAnswer(isCorrect)}
            onPlayPhoneme={playPhonemeAudio}
            onPlayWord={playWordAudio}
          />
        );
      case "space_insertion":
        return (
          <SpaceInsertion
            prompt={q.prompt}
            jumbled={q.jumbled || ""}
            correctSentence={q.correct}
            questionId={q.id}
            answered={answered}
            onAnswer={(isCorrect) => onAnswer(isCorrect)}
          />
        );
      default:
        return <p className="text-gray-500 text-sm">Unknown type: {q.type}</p>;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Interactive Audit</h1>
        <button onClick={() => exportCsv(`${grade.folder}-interactive-audit.csv`)}
          className="px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 font-medium">
          Export CSV
        </button>
      </div>

      {/* Grade selector */}
      <div className="flex gap-2 mb-4">
        {GRADE_OPTIONS.map((g, i) => (
          <button
            key={g.key}
            onClick={() => setGradeIdx(i)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${
              gradeIdx === i
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <p className="text-gray-500 mb-4 text-sm">
        {allQuestions.length} interactive questions |{" "}
        <span className="text-emerald-600 font-medium">{passCount} pass</span>
        {failCount > 0 && <> | <span className="text-red-500 font-medium">{failCount} fail</span></>}
        {" "}| <span className="text-gray-400">{untestedCount} untested</span>
        {Object.values(myReviews).filter(r => r.comment).length > 0 && <> | <span className="text-amber-600 font-medium">{Object.values(myReviews).filter(r => r.comment).length} comments</span></>}
      </p>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setTypeFilter("all")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            typeFilter === "all" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
          }`}>
          All ({allQuestions.length})
        </button>
        {Object.entries(TYPE_BADGES).map(([type, { label, color }]) => {
          const count = typeCounts[type] || 0;
          if (count === 0) return null;
          return (
            <button key={type} onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                typeFilter === type ? "bg-indigo-600 text-white border-indigo-600" : `${color} hover:opacity-80`
              }`}>
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {filtered.map(standard => (
          <div key={standard.standard_id}>
            <div className="mb-3">
              <h2 className="text-lg font-bold text-gray-800">{standard.standard_id}</h2>
              <p className="text-xs text-gray-400">{standard.standard_description}</p>
            </div>

            <div className="space-y-6">
              {standard.questions.map(q => {
                const result = getResult(q.id);
                const answered = answeredMap[q.id] || false;
                const badge = TYPE_BADGES[q.type] || { label: q.type, color: "bg-gray-100 text-gray-600 border-gray-300" };
                const resultInfo = RESULT_LABELS[result];

                return (
                  <div key={q.id} className={`rounded-xl shadow-sm border p-5 transition-colors ${
                    result === "pass" ? "bg-emerald-50 border-emerald-200"
                    : result === "fail" ? "bg-red-50 border-red-200"
                    : "bg-white border-gray-200"
                  }`}>
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700">{q.id}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold border ${badge.color}`}>{badge.label}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${resultInfo.color}`}>{resultInfo.label}</span>
                      <div className="ml-auto flex items-center gap-1.5">
                        {q.audio_url && (
                          <button onClick={() => playAudio(q.audio_url!)}
                            className="px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                            Play TTS
                          </button>
                        )}
                        {answered && (
                          <button onClick={() => resetQuestion(q.id)}
                            className="px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                            Reset
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Correct answer reference */}
                    <div className="mb-4 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold">Correct:</span> {q.correct}
                        {q.hint && <> | <span className="font-semibold">Hint:</span> {q.hint}</>}
                      </p>
                    </div>

                    {/* Interactive component */}
                    <div className="mb-4">
                      {renderQuestion(q)}
                    </div>

                    {/* Pass/Fail buttons */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                      <button onClick={() => markResult(q.id, "pass")}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                          result === "pass" ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300"
                        }`}>
                        Pass
                      </button>
                      <button onClick={() => markResult(q.id, "fail")}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                          result === "fail" ? "bg-red-500 text-white" : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-300"
                        }`}>
                        Fail
                      </button>
                      <button onClick={() => markResult(q.id, "untested")}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        Clear
                      </button>
                    </div>

                    {/* Comment section */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      {allItemReviews[q.id] && allItemReviews[q.id].length > 0 && (
                        <div className="mb-2">
                          <ReviewList reviews={allItemReviews[q.id]} currentUserId={userId} />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={commentDraft[q.id] || ""}
                          onChange={e => setCommentDraft(d => ({ ...d, [q.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === "Enter") saveComment(q.id); }}
                          className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                        <button
                          onClick={() => saveComment(q.id)}
                          disabled={!(commentDraft[q.id] || "").trim()}
                          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40">
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
