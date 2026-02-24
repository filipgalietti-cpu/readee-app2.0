"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { missingSentences } from "@/lib/word-bank/missing-word";
import { generateMissingWord, resetMissingWordIds } from "@/lib/word-bank/missing-word";
import { sentenceTemplates, buildSentence } from "@/lib/word-bank/sentences";
import {
  generateCategorySort,
  generateRhymeSort,
  generateBeginningSound,
  categoryPresets,
  rhymePairs,
  letterPairs,
} from "@/lib/word-bank/generators";
import type { MatchingQuestion } from "@/lib/assessment/questions";
import { MissingWord } from "@/app/components/practice/MissingWord";
import { SentenceBuild } from "@/app/components/practice/SentenceBuild";
import { CategorySort } from "@/app/components/practice/CategorySort";
import { useAudio } from "@/lib/audio/use-audio";
import kStandards from "@/app/data/kindergarten-standards-questions.json";

/* ── Prompt audio URLs ─────────────────────────────── */

const PROMPT_AUDIO: Record<string, string> = {
  missing_word: "/audio/prompts/pick-the-missing-word.mp3",
  sentence_build: "/audio/prompts/put-words-in-order.mp3",
  category_sort: "/audio/prompts/sort-words-into-group.mp3",
};

/* ── Types ──────────────────────────────────────────── */

interface McqData {
  choices: string[];
  correct: string;
  hint: string;
  audioUrl?: string;
  hintAudioUrl?: string;
}

interface QuestionEntry {
  id: string;
  preview: string;
  question: MatchingQuestion;
  mcq?: McqData;
}

type Tab = "missing-word" | "sentence-build" | "category-sort" | "mcq";

/* ── Helpers ─────────────────────────────────────────── */

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function splitPrompt(prompt: string): { passage: string | null; question: string } {
  const parts = prompt.split("\n\n");
  if (parts.length >= 2) {
    return { passage: parts.slice(0, -1).join("\n\n"), question: parts[parts.length - 1] };
  }
  return { passage: null, question: prompt };
}

const ACCENT_COLORS = ["#60a5fa", "#4ade80", "#fb923c", "#a78bfa"];
const CHOICE_LETTERS = ["A", "B", "C", "D"];

/* ── Generate all questions ──────────────────────────── */

function generateAllMissingWord(): QuestionEntry[] {
  const entries: QuestionEntry[] = [];
  resetMissingWordIds();

  for (let i = 0; i < missingSentences.length; i++) {
    const s = missingSentences[i];
    const correctWord = s.words[s.blank];
    const displayWords = s.words.map((w, idx) =>
      idx === 0 ? capitalize(w) : w
    );

    // Build preview with blank
    const previewWords = [...displayWords];
    previewWords[s.blank] = "___";
    const preview = previewWords.join(" ");

    // Generate the question using the specific index
    const usedSentences = new Set<number>();
    // Add all indices except this one so generateMissingWord picks this one
    for (let j = 0; j < missingSentences.length; j++) {
      if (j !== i) usedSentences.add(j);
    }
    const q = generateMissingWord(usedSentences);
    if (!q) continue;

    entries.push({
      id: `MW-${i + 1}`,
      preview,
      question: q,
    });
  }

  return entries;
}

function generateAllSentenceBuild(): QuestionEntry[] {
  const entries: QuestionEntry[] = [];
  let idx = 0;

  for (const tpl of sentenceTemplates) {
    idx++;
    const result = buildSentence(tpl);
    if (!result) continue;

    const preview = result.words.join(" ");

    entries.push({
      id: `SB-${idx}`,
      preview,
      question: {
        id: `sb-${idx}`,
        type: "sentence_build",
        prompt: "Put the words in order to make a sentence.",
        words: shuffle(result.words),
        correctSentence: result.correctSentence,
        sentenceHint: result.hint,
        sentenceAudioUrl: result.audioUrl,
      },
    });
  }

  return entries;
}

function generateAllCategorySort(): QuestionEntry[] {
  const entries: QuestionEntry[] = [];
  let idx = 0;

  // Category presets
  for (const preset of categoryPresets) {
    idx++;
    const q = generateCategorySort(
      preset.tag1,
      preset.tag2,
      preset.label1,
      preset.label2,
      3,
      new Set()
    );
    if (!q) continue;
    q.prompt = preset.prompt;

    entries.push({
      id: `CS-${idx}`,
      preview: `${preset.label1} vs ${preset.label2}`,
      question: q,
    });
  }

  // Rhyme pairs
  for (const [f1, f2] of rhymePairs) {
    idx++;
    const q = generateRhymeSort(f1, f2, 3, new Set());
    if (!q) continue;

    entries.push({
      id: `CS-${idx}`,
      preview: `${f1} words vs ${f2} words`,
      question: q,
    });
  }

  // Letter pairs
  for (const [l1, l2] of letterPairs) {
    idx++;
    const q = generateBeginningSound(l1, l2, 3, new Set());
    if (!q) continue;

    entries.push({
      id: `CS-${idx}`,
      preview: `Starts with ${l1.toUpperCase()} vs ${l2.toUpperCase()}`,
      question: q,
    });
  }

  return entries;
}

function generateAllMcq(): QuestionEntry[] {
  const entries: QuestionEntry[] = [];
  let idx = 0;

  for (const standard of (kStandards as { standards: Array<{ questions: Array<{ id: string; type: string; prompt: string; choices: string[]; correct: string; hint: string; difficulty: number; audio_url?: string; hint_audio_url?: string }> }> }).standards) {
    for (const q of standard.questions) {
      idx++;
      const { question } = splitPrompt(q.prompt);
      const preview = question.length > 60 ? question.slice(0, 57) + "..." : question;

      entries.push({
        id: `MCQ-${idx}`,
        preview,
        question: {
          id: q.id,
          type: "multiple_choice",
          prompt: q.prompt,
        },
        mcq: {
          choices: q.choices,
          correct: q.correct,
          hint: q.hint,
          audioUrl: q.audio_url,
          hintAudioUrl: q.hint_audio_url,
        },
      });
    }
  }

  return entries;
}

/* ── Tab Button ──────────────────────────────────────── */

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

/* ── Question Card ───────────────────────────────────── */

function QuestionCard({
  entry,
  expanded,
  onToggle,
  playCorrectChime,
  playIncorrectBuzz,
  playUrl,
}: {
  entry: QuestionEntry;
  expanded: boolean;
  onToggle: () => void;
  playCorrectChime: () => void;
  playIncorrectBuzz: () => void;
  playUrl: (url: string) => void;
}) {
  const [answered, setAnswered] = useState(false);
  const [mcqSelected, setMcqSelected] = useState<string | null>(null);
  const q = entry.question;

  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      setAnswered(true);
      if (isCorrect) {
        playCorrectChime();
      } else {
        playIncorrectBuzz();
      }
    },
    [playCorrectChime, playIncorrectBuzz]
  );

  const handleMcqAnswer = useCallback(
    (choice: string) => {
      if (mcqSelected) return;
      const mcq = entry.mcq!;
      const isCorrect = choice === mcq.correct;
      setMcqSelected(choice);
      setAnswered(true);
      if (isCorrect) {
        playCorrectChime();
      } else {
        playIncorrectBuzz();
        if (mcq.hintAudioUrl) {
          setTimeout(() => playUrl(mcq.hintAudioUrl!), 600);
        }
      }
    },
    [mcqSelected, entry.mcq, playCorrectChime, playIncorrectBuzz, playUrl]
  );

  const handleReset = useCallback(() => {
    setAnswered(false);
    setMcqSelected(null);
  }, []);

  return (
    <div
      className={`rounded-2xl border-2 transition-all overflow-hidden ${
        expanded
          ? "border-indigo-400 dark:border-indigo-500 bg-white dark:bg-slate-800/80"
          : "border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800/50"
      }`}
    >
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        {/* ID badge */}
        <span className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-mono font-bold text-xs">
          {entry.id}
        </span>

        {/* Preview */}
        <span className="flex-1 text-sm text-zinc-700 dark:text-slate-300 truncate font-medium">
          {entry.preview}
        </span>

        {/* Toggle arrow */}
        <span
          className={`flex-shrink-0 text-zinc-400 dark:text-slate-500 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-zinc-100 dark:border-slate-700">
          <div className="pt-4 max-w-lg mx-auto">
            {/* Reset button */}
            {answered && (
              <div className="flex justify-end mb-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-600 dark:bg-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Reset
                </button>
              </div>
            )}

            {/* Render the appropriate component */}
            {q.type === "missing_word" && q.sentenceWords && q.missingChoices != null && q.blankIndex != null && (
              <MissingWord
                key={answered ? "reset" : "active"}
                prompt={q.prompt}
                sentenceWords={q.sentenceWords}
                blankIndex={q.blankIndex}
                choices={q.missingChoices}
                sentenceHint={q.sentenceHint}
                sentenceAudioUrl={q.sentenceAudioUrl}
                answered={false}
                onAnswer={(isCorrect) => handleAnswer(isCorrect)}
              />
            )}

            {q.type === "sentence_build" && q.words && q.correctSentence && (
              <SentenceBuild
                key={answered ? "reset" : "active"}
                prompt={q.prompt}
                passage={null}
                words={q.words}
                correctSentence={q.correctSentence}
                sentenceHint={q.sentenceHint}
                sentenceAudioUrl={q.sentenceAudioUrl}
                answered={false}
                onAnswer={(isCorrect) => handleAnswer(isCorrect)}
              />
            )}

            {q.type === "category_sort" && q.categories && q.categoryItems && q.items && (
              <CategorySort
                key={answered ? "reset" : "active"}
                prompt={q.prompt}
                categories={q.categories}
                categoryItems={q.categoryItems}
                items={q.items}
                answered={false}
                onAnswer={(isCorrect) => handleAnswer(isCorrect)}
                onCorrectPlace={playCorrectChime}
                onIncorrectPlace={playIncorrectBuzz}
              />
            )}

            {entry.mcq && (() => {
              const { passage, question } = splitPrompt(q.prompt);
              const mcq = entry.mcq;
              const hasAnswered = mcqSelected !== null;
              const isCorrect = mcqSelected === mcq.correct;

              return (
                <div key={answered ? "reset" : "active"}>
                  {/* Passage */}
                  {passage && (
                    <div className="mb-5 rounded-2xl bg-white border border-zinc-200 dark:bg-slate-800/80 dark:border-slate-700 p-5">
                      <p className="text-lg leading-relaxed text-zinc-900 dark:text-white/90 whitespace-pre-line">{passage}</p>
                    </div>
                  )}

                  {/* Question */}
                  <h2 className="text-[22px] font-bold text-zinc-900 dark:text-white leading-snug mb-5">
                    {question}
                  </h2>

                  {/* Choices */}
                  <div className="flex flex-col gap-3">
                    {mcq.choices.map((choice, i) => {
                      const isSelected = mcqSelected === choice;
                      const isCorrectChoice = choice === mcq.correct;

                      let bg = "bg-white border-zinc-200 dark:bg-slate-800 dark:border-slate-600 hover:bg-zinc-50 dark:hover:bg-slate-700/50";
                      let textColor = "text-zinc-900 dark:text-white";

                      if (hasAnswered) {
                        if (isSelected && isCorrect) {
                          bg = "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30 dark:bg-emerald-900/60";
                          textColor = "text-emerald-800 dark:text-emerald-100";
                        } else if (isSelected && !isCorrect) {
                          bg = "bg-red-50 border-red-500 ring-2 ring-red-500/30 dark:bg-red-900/40";
                          textColor = "text-red-800 dark:text-red-200";
                        } else if (isCorrectChoice && !isCorrect) {
                          bg = "bg-emerald-50/80 border-emerald-500 dark:bg-emerald-900/40";
                          textColor = "text-emerald-800 dark:text-emerald-200";
                        } else {
                          bg = "bg-zinc-100 border-zinc-200 opacity-40 dark:bg-slate-800/40 dark:border-slate-700";
                          textColor = "text-zinc-400 dark:text-slate-400";
                        }
                      }

                      return (
                        <button
                          key={choice}
                          onClick={() => handleMcqAnswer(choice)}
                          disabled={hasAnswered}
                          className={`group w-full text-left px-5 py-4 rounded-xl border-2 relative overflow-hidden transition-all duration-200 outline-none ${bg} ${hasAnswered ? "cursor-default" : "cursor-pointer"}`}
                          style={{ minHeight: 56 }}
                        >
                          {/* Color accent bar */}
                          <div
                            className="absolute left-0 top-0 bottom-0 w-[3px] group-hover:w-[5px] rounded-l-xl transition-all duration-200"
                            style={{ backgroundColor: ACCENT_COLORS[i % 4] }}
                          />
                          <div className="flex items-center gap-3">
                            {/* Letter badge */}
                            <span
                              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: ACCENT_COLORS[i % 4] }}
                            >
                              {CHOICE_LETTERS[i]}
                            </span>
                            {/* Check / X icons */}
                            {hasAnswered && isSelected && isCorrect && (
                              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                            {hasAnswered && isSelected && !isCorrect && (
                              <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </div>
                            )}
                            {hasAnswered && !isSelected && isCorrectChoice && !isCorrect && (
                              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                            <span className={`text-lg font-medium leading-snug flex-1 ${textColor}`}>
                              {choice}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Hint on wrong answer */}
                  {hasAnswered && !isCorrect && (
                    <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-700">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Hint</p>
                        {mcq.hintAudioUrl && (
                          <button
                            onClick={() => playUrl(mcq.hintAudioUrl!)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-amber-200/60 dark:hover:bg-amber-800/40 transition-colors"
                            aria-label="Play hint audio"
                          >
                            <svg className="w-4 h-4 text-amber-700 dark:text-amber-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M11 5L6 9H2v6h4l5 4V5z" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-amber-700 dark:text-amber-300">{mcq.hint}</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────── */

export default function QuestionBankPage() {
  const [tab, setTab] = useState<Tab>("missing-word");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const audioUnlockedRef = useRef(false);
  const { playUrl, playCorrectChime, playIncorrectBuzz, unlockAudio } = useAudio();

  // Generate all questions once on mount
  const mwEntries = useMemo(() => generateAllMissingWord(), []);
  const sbEntries = useMemo(() => generateAllSentenceBuild(), []);
  const csEntries = useMemo(() => generateAllCategorySort(), []);
  const mcqEntries = useMemo(() => generateAllMcq(), []);

  const entries =
    tab === "missing-word"
      ? mwEntries
      : tab === "sentence-build"
      ? sbEntries
      : tab === "category-sort"
      ? csEntries
      : mcqEntries;

  const total = mwEntries.length + sbEntries.length + csEntries.length + mcqEntries.length;

  // Build a lookup from entry id → question type for prompt audio
  const entryTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of mwEntries) map.set(e.id, e.question.type);
    for (const e of sbEntries) map.set(e.id, e.question.type);
    for (const e of csEntries) map.set(e.id, e.question.type);
    for (const e of mcqEntries) map.set(e.id, e.question.type);
    return map;
  }, [mwEntries, sbEntries, csEntries, mcqEntries]);

  // Build a lookup from entry id → MCQ audio URL
  const mcqAudioMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of mcqEntries) {
      if (e.mcq?.audioUrl) map.set(e.id, e.mcq.audioUrl);
    }
    return map;
  }, [mcqEntries]);

  // Play prompt audio when a card expands
  useEffect(() => {
    if (!expandedId) return;
    // MCQ questions have their own audio
    const mcqAudio = mcqAudioMap.get(expandedId);
    if (mcqAudio) {
      playUrl(mcqAudio);
      return;
    }
    const type = entryTypeMap.get(expandedId);
    if (type && PROMPT_AUDIO[type]) {
      playUrl(PROMPT_AUDIO[type]);
    }
  }, [expandedId, entryTypeMap, mcqAudioMap, playUrl]);

  // Unlock audio on first card tap (needed for mobile browsers)
  const handleToggle = useCallback(
    (entryId: string) => {
      if (!audioUnlockedRef.current) {
        unlockAudio();
        audioUnlockedRef.current = true;
      }
      setExpandedId((prev) => (prev === entryId ? null : entryId));
    },
    [unlockAudio]
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
            Question Bank
          </h1>
          <p className="text-sm text-zinc-500 dark:text-slate-400 mt-1">
            {total} questions &middot; Tap any question to test it
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          <TabButton
            label="Missing Word"
            count={mwEntries.length}
            active={tab === "missing-word"}
            onClick={() => { setTab("missing-word"); setExpandedId(null); }}
          />
          <TabButton
            label="Sentence Build"
            count={sbEntries.length}
            active={tab === "sentence-build"}
            onClick={() => { setTab("sentence-build"); setExpandedId(null); }}
          />
          <TabButton
            label="Category Sort"
            count={csEntries.length}
            active={tab === "category-sort"}
            onClick={() => { setTab("category-sort"); setExpandedId(null); }}
          />
          <TabButton
            label="MCQ"
            count={mcqEntries.length}
            active={tab === "mcq"}
            onClick={() => { setTab("mcq"); setExpandedId(null); }}
          />
        </div>

        {/* Question list */}
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <QuestionCard
              key={entry.id}
              entry={entry}
              expanded={expandedId === entry.id}
              onToggle={() => handleToggle(entry.id)}
              playCorrectChime={playCorrectChime}
              playIncorrectBuzz={playIncorrectBuzz}
              playUrl={playUrl}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
