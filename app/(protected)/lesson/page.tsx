"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import lessonsData from "@/lib/data/lessons.json";
import { levelNameToGradeKey } from "@/lib/assessment/questions";

type Phase = "loading" | "learn" | "practice" | "read" | "complete";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface LessonRaw {
  id: string;
  title: string;
  skill: string;
  description?: string;
  learn: { type: string; content: string; items: any[] };
  practice: { type: string; instructions: string; questions: any[] };
  read: { type: string; title: string; text: string; questions: any[] };
}

interface LevelData {
  level_name: string;
  level_number: number;
  focus: string;
  lessons: LessonRaw[];
}

interface LessonsFile {
  levels: Record<string, LevelData>;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const ENCOURAGEMENTS = ["Nice!", "Great job!", "You got it!", "Amazing!"];

/** Extract a display-friendly line from a learn item regardless of its shape */
function formatLearnItem(item: Record<string, unknown>): { emoji: string; title: string; detail: string } {
  const emoji = (item.emoji as string) || "";

  // letter_recognition, letter_sounds, short_vowels
  if (item.letter) {
    const keyword = item.keyword || item.example || "";
    const hint = item.hint || item.mouth || item.keyword || "";
    return { emoji, title: `${item.letter} — ${keyword}`, detail: String(hint) };
  }
  // beginning_sounds
  if (item.sound && item.words) {
    return { emoji, title: `${item.sound} — ${(item.words as string[]).join(", ")}`, detail: String(item.hint || "") };
  }
  // rhyming
  if (item.word && item.rhymes) {
    return { emoji, title: `${item.word} rhymes with ${(item.rhymes as string[]).slice(0, 3).join(", ")}`, detail: `Family: ${item.family || ""}` };
  }
  // uppercase_lowercase
  if (item.upper && item.lower) {
    return { emoji: "🔤", title: `${item.upper} and ${item.lower}`, detail: String(item.hint || "") };
  }
  // cvc_blending
  if (item.sounds) {
    return { emoji, title: `${(item.sounds as string[]).join(" + ")} = ${item.word}`, detail: String(item.tip || "") };
  }
  // sight_words
  if (item.word && item.sentence) {
    return { emoji: "⭐", title: String(item.word), detail: `${item.sentence} — ${item.tip || item.trick || ""}` };
  }
  // word_families
  if (item.family && item.words) {
    return { emoji, title: `${item.family} family`, detail: (item.words as string[]).join(", ") };
  }
  // blends
  if (item.blend) {
    return { emoji, title: `${item.blend} blend`, detail: (item.words as string[]).join(", ") };
  }
  // digraphs
  if (item.digraph) {
    return { emoji, title: `${item.digraph} = ${item.sound}`, detail: `${(item.words as string[]).join(", ")} — ${item.tip || ""}` };
  }
  // cvce (magic e)
  if (item.short && item.long) {
    return { emoji, title: `${item.short} → ${item.long}`, detail: `Vowel ${item.vowel} says its name!` };
  }
  // fluency
  if (item.sentence && item.tip) {
    return { emoji: "📝", title: String(item.sentence), detail: String(item.tip) };
  }
  // prefixes/suffixes (nested examples)
  if (item.prefix || item.suffix) {
    const label = item.prefix || item.suffix;
    const meaning = item.meaning || "";
    const examples = (item.examples as Array<{ word: string }>)?.map((e) => e.word).join(", ") || "";
    return { emoji: "🔤", title: `${label} = ${meaning}`, detail: examples };
  }
  // vowel_teams
  if (item.team) {
    return { emoji, title: `${item.team} vowel team`, detail: (item.words as string[]).join(", ") };
  }
  // compound_words
  if (item.parts) {
    return { emoji, title: String(item.word), detail: `${(item.parts as string[]).join(" + ")}` };
  }
  // inference
  if (item.clue && item.inference) {
    return { emoji, title: String(item.clue), detail: String(item.inference) };
  }
  // advanced_phonics patterns
  if (item.pattern) {
    return { emoji: "🔍", title: String(item.pattern), detail: `${(item.words as string[] || []).join(", ")} — ${item.rule || ""}` };
  }
  // main_idea
  if (item.main_idea) {
    return { emoji: "🎯", title: String(item.main_idea), detail: String((item.details as string[] || []).join(", ")) };
  }
  // context_clues
  if (item.unknown) {
    return { emoji: "🔎", title: `${item.unknown} = ${item.meaning}`, detail: String(item.sentence || "") };
  }
  // fact_opinion
  if (item.statement && item.type) {
    return { emoji: item.type === "fact" ? "✅" : "💭", title: String(item.statement), detail: `${item.type}: ${item.why || ""}` };
  }
  // author_craft
  if (item.technique) {
    return { emoji: (item.emoji as string) || "✍️", title: String(item.technique), detail: `${item.definition || ""} — "${item.example || ""}"` };
  }

  // Fallback
  return { emoji: emoji || "📚", title: JSON.stringify(item).slice(0, 50), detail: "" };
}

export default function LessonPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
      }
    >
      <LessonContent />
    </Suspense>
  );
}

function LessonContent() {
  const searchParams = useSearchParams();
  const childId = searchParams.get("child");
  const lessonId = searchParams.get("lesson");

  const [child, setChild] = useState<Child | null>(null);
  const [lesson, setLesson] = useState<LessonRaw | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");

  // Practice state
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [practiceCorrect, setPracticeCorrect] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Read state
  const [showReadQuestions, setShowReadQuestions] = useState(false);
  const [readQIdx, setReadQIdx] = useState(0);
  const [readCorrect, setReadCorrect] = useState(0);
  const [readSelected, setReadSelected] = useState<string | null>(null);
  const [readFeedback, setReadFeedback] = useState<string | null>(null);

  // Complete state
  const [totalXP, setTotalXP] = useState(0);
  const [confettiPieces, setConfettiPieces] = useState<
    { id: number; left: number; color: string; delay: number }[]
  >([]);

  // Load child and lesson data
  useEffect(() => {
    async function load() {
      if (!childId || !lessonId) return;

      const supabase = supabaseBrowser();
      const { data } = await supabase
        .from("children")
        .select("*")
        .eq("id", childId)
        .single();

      if (!data) return;

      const c = data as Child;
      setChild(c);

      const gradeKey = levelNameToGradeKey(c.reading_level);
      const file = lessonsData as unknown as LessonsFile;
      const level = file.levels[gradeKey];
      if (!level) return;

      const found = level.lessons.find((l) => l.id === lessonId);
      if (found) {
        setLesson(found);
        setPhase("learn");
      }
    }
    load();
  }, [childId, lessonId]);

  const saveProgress = useCallback(
    async (section: string, score: number) => {
      if (!child || !lessonId) return;
      const supabase = supabaseBrowser();
      await supabase.from("lessons_progress").insert({
        child_id: child.id,
        lesson_id: lessonId,
        section,
        score,
      });
    },
    [child, lessonId]
  );

  const awardXP = useCallback(
    async (amount: number) => {
      if (!child) return;
      const supabase = supabaseBrowser();
      const { data } = await supabase
        .from("children")
        .select("xp")
        .eq("id", child.id)
        .single();

      const currentXP = (data as { xp: number } | null)?.xp ?? 0;
      await supabase
        .from("children")
        .update({ xp: currentXP + amount })
        .eq("id", child.id);

      setTotalXP((prev) => prev + amount);
    },
    [child]
  );

  const handleLearnComplete = async () => {
    await saveProgress("learn", 100);
    await awardXP(5);
    setPhase("practice");
  };

  const handlePracticeAnswer = (choice: string) => {
    if (selectedChoice || !lesson) return;
    setSelectedChoice(choice);

    const q = lesson.practice.questions[practiceIdx];
    const isCorrect = choice === q.correct;
    const newCorrect = practiceCorrect + (isCorrect ? 1 : 0);
    setPracticeCorrect(newCorrect);

    if (isCorrect) {
      setFeedback(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
    } else {
      setFeedback(`Keep going! The answer was: ${q.correct}`);
    }

    setTimeout(() => {
      setSelectedChoice(null);
      setFeedback(null);
      if (practiceIdx + 1 < lesson.practice.questions.length) {
        setPracticeIdx(practiceIdx + 1);
      } else {
        const score = Math.round((newCorrect / lesson.practice.questions.length) * 100);
        saveProgress("practice", score);
        awardXP(5);
        setPhase("read");
      }
    }, 800);
  };

  const handleReadAnswer = (choice: string) => {
    if (readSelected || !lesson) return;
    setReadSelected(choice);

    const q = lesson.read.questions[readQIdx];
    const isCorrect = choice === q.correct;
    const newCorrect = readCorrect + (isCorrect ? 1 : 0);
    setReadCorrect(newCorrect);

    if (isCorrect) {
      setReadFeedback(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
    } else {
      setReadFeedback(`Keep going! The answer was: ${q.correct}`);
    }

    setTimeout(() => {
      setReadSelected(null);
      setReadFeedback(null);
      if (readQIdx + 1 < lesson.read.questions.length) {
        setReadQIdx(readQIdx + 1);
      } else {
        const score = Math.round((newCorrect / lesson.read.questions.length) * 100);
        saveProgress("read", score);
        awardXP(10);

        const pieces = Array.from({ length: 40 }, (_, i) => ({
          id: i,
          left: Math.random() * 100,
          color: ["#4338ca", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#ec4899"][
            Math.floor(Math.random() * 6)
          ],
          delay: Math.random() * 1.5,
        }));
        setConfettiPieces(pieces);
        setPhase("complete");
      }
    }, 800);
  };

  if (phase === "loading" || !child || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  /* ─── Learn Phase ───────────────────────────────────── */
  if (phase === "learn") {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-indigo-600">Learn</span>
            <span className="text-zinc-400">{lesson.skill}</span>
          </div>
          <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full w-[10%]" />
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            {lesson.title}
          </h1>
          <p className="text-zinc-500 mt-2 max-w-md mx-auto">
            {lesson.learn.content}
          </p>
        </div>

        <div className="space-y-4">
          {lesson.learn.items.map((item, i) => {
            const { emoji, title, detail } = formatLearnItem(item);
            return (
              <div
                key={i}
                className="rounded-2xl border border-zinc-200 bg-white p-5 flex items-start gap-4"
              >
                <div className="text-3xl flex-shrink-0">{emoji}</div>
                <div>
                  <div className="font-bold text-zinc-900">{title}</div>
                  {detail && <div className="text-sm text-zinc-500 mt-1">{detail}</div>}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleLearnComplete}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-lg hover:from-indigo-700 hover:to-violet-600 transition-all shadow-lg"
        >
          Got it!
        </button>
      </div>
    );
  }

  /* ─── Practice Phase ────────────────────────────────── */
  if (phase === "practice") {
    const q = lesson.practice.questions[practiceIdx];
    const progress = ((practiceIdx) / lesson.practice.questions.length) * 100;

    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-indigo-600">
              Practice {practiceIdx + 1} of {lesson.practice.questions.length}
            </span>
            <span className="text-zinc-400">{lesson.skill}</span>
          </div>
          <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${33 + (progress * 0.33)}%` }}
            />
          </div>
        </div>

        <h2 className="text-xl font-bold text-zinc-900 text-center leading-relaxed">
          {q.prompt}
        </h2>

        {feedback && (
          <div
            className={`text-center py-2 px-4 rounded-xl text-sm font-semibold ${
              feedback.startsWith("Keep")
                ? "bg-amber-50 text-amber-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            {feedback}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {q.choices.map((choice: string, i: number) => {
            const isSelected = selectedChoice === choice;
            const isCorrect = choice === q.correct;
            const showResult = selectedChoice !== null;
            const letters = ["A", "B", "C", "D"];

            return (
              <button
                key={i}
                onClick={() => handlePracticeAnswer(choice)}
                disabled={!!selectedChoice}
                className={`
                  relative text-left rounded-2xl border-2 p-4 transition-all duration-200
                  ${
                    showResult && isCorrect
                      ? "border-green-500 bg-green-50"
                      : isSelected && !isCorrect
                      ? "border-red-400 bg-red-50"
                      : isSelected
                      ? "border-indigo-500 bg-indigo-50 scale-[1.02]"
                      : "border-zinc-200 bg-white hover:border-indigo-300 hover:shadow-md"
                  }
                  ${showResult && !isSelected && !isCorrect ? "opacity-50" : ""}
                  disabled:cursor-default
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`
                    w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0
                    ${
                      showResult && isCorrect
                        ? "bg-green-600 text-white"
                        : isSelected && !isCorrect
                        ? "bg-red-500 text-white"
                        : isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-100 text-zinc-500"
                    }
                  `}
                  >
                    {letters[i]}
                  </div>
                  <span
                    className={`font-medium ${
                      showResult && isCorrect
                        ? "text-green-700"
                        : isSelected && !isCorrect
                        ? "text-red-700"
                        : isSelected
                        ? "text-indigo-700"
                        : "text-zinc-800"
                    }`}
                  >
                    {choice}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ─── Read Phase ────────────────────────────────────── */
  if (phase === "read") {
    if (!showReadQuestions) {
      return (
        <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-indigo-600">Read</span>
              <span className="text-zinc-400">{lesson.skill}</span>
            </div>
            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full w-[66%]" />
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              {lesson.read.title}
            </h1>
            <p className="text-zinc-500 mt-1">Read the story below</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-lg leading-relaxed text-zinc-800 whitespace-pre-line">
              {lesson.read.text}
            </div>
          </div>

          <button
            onClick={() => setShowReadQuestions(true)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-lg hover:from-indigo-700 hover:to-violet-600 transition-all shadow-lg"
          >
            Ready for questions!
          </button>
        </div>
      );
    }

    const q = lesson.read.questions[readQIdx];
    const progress = ((readQIdx) / lesson.read.questions.length) * 100;

    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-indigo-600">
              Question {readQIdx + 1} of {lesson.read.questions.length}
            </span>
            <span className="text-zinc-400">Comprehension</span>
          </div>
          <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${66 + (progress * 0.34)}%` }}
            />
          </div>
        </div>

        <h2 className="text-xl font-bold text-zinc-900 text-center leading-relaxed">
          {q.prompt}
        </h2>

        {readFeedback && (
          <div
            className={`text-center py-2 px-4 rounded-xl text-sm font-semibold ${
              readFeedback.startsWith("Keep")
                ? "bg-amber-50 text-amber-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            {readFeedback}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {q.choices.map((choice: string, i: number) => {
            const isSelected = readSelected === choice;
            const isCorrect = choice === q.correct;
            const showResult = readSelected !== null;
            const letters = ["A", "B", "C", "D"];

            return (
              <button
                key={i}
                onClick={() => handleReadAnswer(choice)}
                disabled={!!readSelected}
                className={`
                  relative text-left rounded-2xl border-2 p-4 transition-all duration-200
                  ${
                    showResult && isCorrect
                      ? "border-green-500 bg-green-50"
                      : isSelected && !isCorrect
                      ? "border-red-400 bg-red-50"
                      : isSelected
                      ? "border-indigo-500 bg-indigo-50 scale-[1.02]"
                      : "border-zinc-200 bg-white hover:border-indigo-300 hover:shadow-md"
                  }
                  ${showResult && !isSelected && !isCorrect ? "opacity-50" : ""}
                  disabled:cursor-default
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`
                    w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0
                    ${
                      showResult && isCorrect
                        ? "bg-green-600 text-white"
                        : isSelected && !isCorrect
                        ? "bg-red-500 text-white"
                        : isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-100 text-zinc-500"
                    }
                  `}
                  >
                    {letters[i]}
                  </div>
                  <span
                    className={`font-medium ${
                      showResult && isCorrect
                        ? "text-green-700"
                        : isSelected && !isCorrect
                        ? "text-red-700"
                        : isSelected
                        ? "text-indigo-700"
                        : "text-zinc-800"
                    }`}
                  >
                    {choice}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ─── Complete Phase ────────────────────────────────── */
  if (phase === "complete") {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4 space-y-8 relative overflow-hidden">
        {confettiPieces.map((p) => (
          <div
            key={p.id}
            className="confetti-fall absolute top-0 w-2.5 h-2.5 rounded-sm"
            style={{
              left: `${p.left}%`,
              backgroundColor: p.color,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}

        <div className="text-6xl">🎉</div>

        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
          Lesson Complete!
        </h1>

        <div className="inline-block rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 px-8 py-5 text-white">
          <div className="text-sm font-medium text-indigo-200">You earned</div>
          <div className="text-3xl font-bold mt-1">{totalXP} XP</div>
        </div>

        <p className="text-zinc-500 max-w-xs mx-auto">
          Great work, {child.first_name}! Keep reading and learning!
        </p>

        <div className="space-y-3 pt-4">
          <Link
            href="/dashboard"
            className="block w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-lg hover:from-indigo-700 hover:to-violet-600 transition-all shadow-lg"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
