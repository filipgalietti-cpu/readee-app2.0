"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import { useSpeech } from "@/app/_components/SpeechContext";
import lessonsData from "@/lib/data/lessons.json";
import { getDailyMultiplier, getSessionStreakTier } from "@/lib/carrots/multipliers";
import { StreakFire } from "@/app/_components/StreakFire";
import { Star, Sparkles, Rocket, Zap, Trophy, Target, Medal, Gem, Crown, Type, FileText, Search, Eye, CheckCircle, PenTool, BookOpen, MessageSquare, Flame, Carrot } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const LEARN_ICON_MAP: Record<string, LucideIcon> = {
  "📝": FileText,
  "🔤": Type,
  "🔍": Search,
  "🎯": Target,
  "🔎": Eye,
  "✅": CheckCircle,
  "💭": MessageSquare,
  "✍️": PenTool,
  "📚": BookOpen,
};

function emojiToIcon(emoji: string): React.ReactNode {
  const Icon = LEARN_ICON_MAP[emoji];
  if (Icon) return <Icon className="w-12 h-12 text-indigo-500" strokeWidth={1.5} />;
  if (!emoji) return null;
  // For any unmapped emoji from JSON data, use BookOpen as fallback
  return <BookOpen className="w-12 h-12 text-indigo-500" strokeWidth={1.5} />;
}

type Phase = "loading" | "learn" | "practice" | "read" | "read-transition" | "complete";

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

const CORRECT_MSGS = [
  "Great job!",
  "You got it!",
  "Amazing!",
  "Awesome!",
  "Nice one!",
];

const CELEBRATION_MESSAGES = [
  "You're a reading superstar!",
  "Your brain just leveled up!",
  "Another story conquered!",
  "You make reading look easy!",
  "Incredible work, keep going!",
  "Reading champion in action!",
  "That was awesome!",
  "You crushed it!",
];

const CARROT_MILESTONES = [
  { name: "Bronze", carrots: 50, icon: Medal },
  { name: "Silver", carrots: 100, icon: Medal },
  { name: "Gold", carrots: 200, icon: Medal },
  { name: "Platinum", carrots: 500, icon: Gem },
  { name: "Diamond", carrots: 1000, icon: Crown },
];

const CARD_COLORS = [
  { bg: "bg-blue-50", border: "border-blue-200" },
  { bg: "bg-green-50", border: "border-green-200" },
  { bg: "bg-pink-50", border: "border-pink-200" },
  { bg: "bg-yellow-50", border: "border-yellow-200" },
  { bg: "bg-purple-50", border: "border-purple-200" },
  { bg: "bg-orange-50", border: "border-orange-200" },
];

function formatSkillName(skill: string): string {
  return skill
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Extract a display-friendly line from a learn item regardless of its shape */
function formatLearnItem(item: Record<string, unknown>): { icon: React.ReactNode; title: string; detail: string } {
  const rawEmoji = (item.emoji as string) || "";
  const icon = emojiToIcon(rawEmoji);

  if (item.letter) {
    const keyword = item.keyword || item.example || "";
    const hint = item.hint || item.mouth || item.keyword || "";
    return { icon, title: `${item.letter} — ${keyword}`, detail: String(hint) };
  }
  if (item.sound && item.words) {
    return { icon, title: `${item.sound} — ${(item.words as string[]).join(", ")}`, detail: String(item.hint || "") };
  }
  if (item.word && item.rhymes) {
    return { icon, title: `${item.word} rhymes with ${(item.rhymes as string[]).slice(0, 3).join(", ")}`, detail: `Family: ${item.family || ""}` };
  }
  if (item.upper && item.lower) {
    return { icon: null, title: `${item.upper} and ${item.lower}`, detail: String(item.hint || "") };
  }
  if (item.sounds) {
    return { icon, title: `${(item.sounds as string[]).join(" + ")} = ${item.word}`, detail: String(item.tip || "") };
  }
  if (item.word && item.sentence) {
    return { icon: null, title: String(item.word), detail: `${item.sentence} — ${item.tip || item.trick || ""}` };
  }
  if (item.family && item.words) {
    return { icon, title: `${item.family} family`, detail: (item.words as string[]).join(", ") };
  }
  if (item.blend) {
    return { icon, title: `${item.blend} blend`, detail: (item.words as string[]).join(", ") };
  }
  if (item.digraph) {
    return { icon, title: `${item.digraph} = ${item.sound}`, detail: `${(item.words as string[]).join(", ")} — ${item.tip || ""}` };
  }
  if (item.short && item.long) {
    return { icon, title: `${item.short} → ${item.long}`, detail: `Vowel ${item.vowel} says its name!` };
  }
  if (item.sentence && item.tip) {
    return { icon: emojiToIcon("📝"), title: String(item.sentence), detail: String(item.tip) };
  }
  if (item.prefix || item.suffix) {
    const label = item.prefix || item.suffix;
    const meaning = item.meaning || "";
    const examples = (item.examples as Array<{ word: string }>)?.map((e) => e.word).join(", ") || "";
    return { icon: emojiToIcon("🔤"), title: `${label} = ${meaning}`, detail: examples };
  }
  if (item.team) {
    return { icon, title: `${item.team} vowel team`, detail: (item.words as string[]).join(", ") };
  }
  if (item.parts) {
    return { icon, title: String(item.word), detail: `${(item.parts as string[]).join(" + ")}` };
  }
  if (item.clue && item.inference) {
    return { icon, title: String(item.clue), detail: String(item.inference) };
  }
  if (item.pattern) {
    return { icon: emojiToIcon("🔍"), title: String(item.pattern), detail: `${(item.words as string[] || []).join(", ")} — ${item.rule || ""}` };
  }
  if (item.main_idea) {
    return { icon: emojiToIcon("🎯"), title: String(item.main_idea), detail: String((item.details as string[] || []).join(", ")) };
  }
  if (item.unknown) {
    return { icon: emojiToIcon("🔎"), title: `${item.unknown} = ${item.meaning}`, detail: String(item.sentence || "") };
  }
  if (item.statement && item.type) {
    return { icon: emojiToIcon(item.type === "fact" ? "✅" : "💭"), title: String(item.statement), detail: `${item.type}: ${item.why || ""}` };
  }
  if (item.technique) {
    return { icon: emojiToIcon((item.emoji as string) || "✍️"), title: String(item.technique), detail: `${item.definition || ""} — "${item.example || ""}"` };
  }
  return { icon: emojiToIcon(rawEmoji || "📚"), title: JSON.stringify(item).slice(0, 50), detail: "" };
}

/* ─── Audio Helpers ──────────────────────────────────── */

function LessonSpeakerButton({ lessonId, audioFile, light = false }: { lessonId: string; audioFile: string; light?: boolean }) {
  const { playAudio } = useSpeech();
  return (
    <button
      onClick={(e) => { e.stopPropagation(); playAudio(lessonId, audioFile); }}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors flex-shrink-0 ${
        light ? "hover:bg-black/5 text-indigo-400" : "hover:bg-white/10 text-indigo-300"
      }`}
      aria-label="Listen"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M11 5L6 9H2v6h4l5 4V5z" />
      </svg>
    </button>
  );
}

function LessonMuteToggle() {
  const { muted, toggleMute } = useSpeech();
  return (
    <button
      onClick={toggleMute}
      className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex-shrink-0"
      aria-label={muted ? "Unmute" : "Mute"}
    >
      {muted ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M11 5L6 9H2v6h4l5 4V5z" />
        </svg>
      )}
    </button>
  );
}

/* ─── Mini confetti burst ────────────────────────────── */
function MiniConfetti() {
  const pieces = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: 30 + Math.random() * 40,
    color: ["#4338ca", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#ec4899"][i % 6],
    delay: Math.random() * 0.3,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-fall absolute top-0 w-2 h-2 rounded-sm"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: "1.2s",
          }}
        />
      ))}
    </div>
  );
}

/* ─── 3-Section Progress Bar ─────────────────────────── */
function SectionProgressBar({
  phase,
  practiceIdx,
  practiceTotal,
  readQIdx,
  readTotal,
  showReadQuestions,
}: {
  phase: Phase;
  practiceIdx: number;
  practiceTotal: number;
  readQIdx: number;
  readTotal: number;
  showReadQuestions: boolean;
}) {
  const sections = [
    { label: "Learn", key: "learn" },
    { label: "Practice", key: "practice" },
    { label: "Read", key: "read" },
  ];

  const phaseOrder = ["learn", "practice", "read"];
  const currentIdx = phaseOrder.indexOf(phase === "read-transition" ? "read" : phase === "complete" ? "read" : phase);

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {sections.map((s, i) => {
          const isComplete = i < currentIdx || phase === "complete";
          const isCurrent = i === currentIdx && phase !== "complete";
          return (
            <div key={s.key} className="flex-1">
              <div className={`h-2 rounded-full transition-all duration-500 ${
                isComplete
                  ? "bg-green-400"
                  : isCurrent
                  ? "bg-gradient-to-r from-indigo-500 to-violet-500"
                  : "bg-zinc-100"
              }`} />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between items-center text-xs">
        <div className="flex gap-3">
          {sections.map((s, i) => {
            const isComplete = i < currentIdx || phase === "complete";
            const isCurrent = i === currentIdx && phase !== "complete";
            return (
              <span key={s.key} className={`font-medium ${
                isComplete ? "text-green-600" : isCurrent ? "text-indigo-600" : "text-zinc-300"
              }`}>
                {isComplete ? "✓ " : ""}{s.label}
              </span>
            );
          })}
        </div>
        {phase === "practice" && (
          <span className="text-zinc-400">
            Question {practiceIdx + 1} of {practiceTotal}
          </span>
        )}
        {(phase === "read" || phase === "read-transition") && showReadQuestions && (
          <span className="text-zinc-400">
            Question {readQIdx + 1} of {readTotal}
          </span>
        )}
        {phase === "learn" && (
          <span className="text-zinc-400 text-[10px]">
            Skill: {/* filled by parent */}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Drag & Match Question ──────────────────────────── */
function DragMatchQuestion({
  question,
  onComplete,
}: {
  question: { prompt: string; pairs: { item: string; target: string }[]; question_id: string };
  onComplete: (correct: boolean, selected: string) => void;
}) {
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [wrongPair, setWrongPair] = useState<string | null>(null);

  const pairs = question.pairs || [];
  const targets = pairs.map((p) => p.target);
  const items = pairs.map((p) => p.item);
  const allMatched = Object.keys(matched).length === pairs.length;

  useEffect(() => {
    if (allMatched && pairs.length > 0) {
      const allCorrect = pairs.every((p) => matched[p.item] === p.target);
      setTimeout(() => onComplete(allCorrect, JSON.stringify(matched)), 800);
    }
  }, [allMatched, matched, pairs, onComplete]);

  const handleDrop = (target: string) => {
    if (!dragging) return;
    const pair = pairs.find((p) => p.item === dragging);
    if (pair && pair.target === target) {
      setMatched((prev) => ({ ...prev, [dragging]: target }));
    } else {
      setWrongPair(dragging);
      setTimeout(() => setWrongPair(null), 600);
    }
    setDragging(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-zinc-900 text-center leading-relaxed">
        {question.prompt}
      </h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          {items.map((item) => {
            const isMatched = item in matched;
            return (
              <div
                key={item}
                draggable={!isMatched}
                onDragStart={() => setDragging(item)}
                onTouchStart={() => setDragging(item)}
                className={`min-h-[48px] rounded-xl border-2 p-3 text-center font-bold text-lg cursor-grab active:cursor-grabbing transition-all ${
                  isMatched
                    ? "border-green-300 bg-green-50 text-green-700 opacity-50"
                    : wrongPair === item
                    ? "border-red-400 bg-red-50 animate-wrongShake"
                    : dragging === item
                    ? "border-indigo-500 bg-indigo-50 scale-105 shadow-md"
                    : "border-zinc-200 bg-white hover:border-indigo-300"
                }`}
              >
                {item}
              </div>
            );
          })}
        </div>
        <div className="space-y-3">
          {targets.map((target) => {
            const isMatched = Object.values(matched).includes(target);
            return (
              <div
                key={target}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(target)}
                onTouchEnd={() => handleDrop(target)}
                className={`min-h-[48px] rounded-xl border-2 border-dashed p-3 text-center font-bold text-lg transition-all ${
                  isMatched
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-zinc-300 bg-zinc-50 text-zinc-500"
                }`}
              >
                {target}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Fill Blank Question ────────────────────────────── */
function FillBlankQuestion({
  question,
  onComplete,
}: {
  question: { prompt: string; sentence: string; blank_word: string; chips: string[]; question_id: string };
  onComplete: (correct: boolean, selected: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleChip = (chip: string) => {
    if (selected) return;
    setSelected(chip);
    setShowResult(true);
    const isCorrect = chip === question.blank_word;
    setTimeout(() => onComplete(isCorrect, chip), 1200);
  };

  const sentenceParts = question.sentence.split("___");

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-zinc-900 text-center leading-relaxed">
        {question.prompt}
      </h2>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center">
        <p className="text-2xl leading-relaxed text-zinc-800">
          {sentenceParts[0]}
          <span className={`inline-block min-w-[60px] mx-1 px-3 py-1 rounded-lg border-2 border-dashed font-bold ${
            selected
              ? selected === question.blank_word
                ? "border-green-400 bg-green-50 text-green-700"
                : "border-red-400 bg-red-50 text-red-700"
              : "border-indigo-300 bg-indigo-50 text-indigo-400"
          }`}>
            {selected || "?"}
          </span>
          {sentenceParts[1] || ""}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {question.chips.map((chip) => (
          <button
            key={chip}
            onClick={() => handleChip(chip)}
            disabled={!!selected}
            className={`min-h-[48px] px-6 py-3 rounded-xl border-2 font-bold text-lg transition-all ${
              showResult && chip === question.blank_word
                ? "border-green-500 bg-green-50 text-green-700"
                : selected === chip && chip !== question.blank_word
                ? "border-red-400 bg-red-50 text-red-700 animate-wrongShake"
                : selected
                ? "border-zinc-100 bg-zinc-50 text-zinc-300"
                : "border-zinc-200 bg-white text-zinc-800 hover:border-indigo-300 hover:shadow-md active:scale-95"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────── */

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

/** Check if a lesson ID is free (L1 or L2) */
function isLessonFree(lessonId: string): boolean {
  const match = lessonId.match(/L(\d+)$/);
  if (!match) return true;
  return parseInt(match[1]) <= 2;
}

function LessonContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { playAudio, stop } = useSpeech();
  const childId = searchParams.get("child");
  const lessonId = searchParams.get("lesson");

  const [child, setChild] = useState<Child | null>(null);
  const [lesson, setLesson] = useState<LessonRaw | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");

  // Learn state (flashcard)
  const [learnIdx, setLearnIdx] = useState(0);
  const [cardAnimating, setCardAnimating] = useState(false);
  const [cardDirection, setCardDirection] = useState<"in" | "out">("in");

  // Practice state
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [practiceCorrect, setPracticeCorrect] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [wrongChoices, setWrongChoices] = useState<Set<string>>(new Set());
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; type: "correct" | "wrong" | "reveal" } | null>(null);
  const [showMiniConfetti, setShowMiniConfetti] = useState(false);
  const [practiceAnswers, setPracticeAnswers] = useState<Array<{ question_id: string; correct: boolean; selected: string; time_ms: number }>>([]);
  const questionStartRef = useRef(Date.now());

  // Read state
  const [showReadQuestions, setShowReadQuestions] = useState(false);
  const [readQIdx, setReadQIdx] = useState(0);
  const [readCorrect, setReadCorrect] = useState(0);
  const [readSelected, setReadSelected] = useState<string | null>(null);
  const [readWrongChoices, setReadWrongChoices] = useState<Set<string>>(new Set());
  const [readWrongAttempts, setReadWrongAttempts] = useState(0);
  const [readFeedback, setReadFeedback] = useState<{ text: string; type: "correct" | "wrong" | "reveal" } | null>(null);
  const [showReadMiniConfetti, setShowReadMiniConfetti] = useState(false);
  const [readAnswers, setReadAnswers] = useState<Array<{ question_id: string; correct: boolean; selected: string; time_ms: number }>>([]);
  const readQuestionStartRef = useRef(Date.now());

  // Streak multiplier state
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);

  // Complete state
  const [totalCarrots, setTotalCarrots] = useState(0);
  const [confettiPieces, setConfettiPieces] = useState<
    { id: number; left: number; color: string; delay: number }[]
  >([]);
  const [streakDays, setStreakDays] = useState(0);
  const [newBadge, setNewBadge] = useState<string | null>(null);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [celebrationMsg, setCelebrationMsg] = useState("");

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

      // Gating: check if lesson requires premium
      if (lessonId && !isLessonFree(lessonId)) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("plan")
            .eq("id", user.id)
            .single();
          const plan = (profile as { plan?: string } | null)?.plan || "free";
          if (plan !== "premium") {
            router.replace(`/upgrade?child=${childId}`);
            return;
          }
        }
      }

      const file = lessonsData as unknown as LessonsFile;
      let found: LessonRaw | undefined;
      for (const level of Object.values(file.levels)) {
        found = level.lessons.find((l) => l.id === lessonId);
        if (found) break;
      }
      if (found) {
        setLesson(found);
        if (found.learn.items.length === 0 && found.practice.questions.length === 0) {
          setPhase("read");
        } else if (found.learn.items.length === 0) {
          setPhase("practice");
        } else {
          setPhase("learn");
        }
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

  const awardCarrots = useCallback(
    async (amount: number) => {
      if (!child) return;
      const supabase = supabaseBrowser();
      const { data } = await supabase
        .from("children")
        .select("carrots")
        .eq("id", child.id)
        .single();

      const currentCarrots = (data as { carrots: number } | null)?.carrots ?? 0;
      await supabase
        .from("children")
        .update({ carrots: currentCarrots + amount })
        .eq("id", child.id);

      setTotalCarrots((prev) => prev + amount);
    },
    [child]
  );

  /* ─── Auto-play: Learn phase (flashcards) ── */
  useEffect(() => {
    if (phase !== "learn" || !lesson || !lessonId) return;
    playAudio(lessonId, `learn-${learnIdx + 1}`);
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, learnIdx]);

  /* ─── Auto-play: Read phase (story title) ── */
  useEffect(() => {
    if (phase !== "read" || !lesson || !lessonId || showReadQuestions) return;
    playAudio(lessonId, "story");
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, showReadQuestions]);

  /* ─── Auto-play: Read questions ── */
  useEffect(() => {
    if (phase !== "read" || !lesson || !lessonId || !showReadQuestions) return;
    playAudio(lessonId, `read-q${readQIdx + 1}`);
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readQIdx, showReadQuestions]);

  /* ─── Auto-play: Practice questions ── */
  useEffect(() => {
    if (phase !== "practice" || !lesson || !lessonId) return;
    playAudio(lessonId, `practice-q${practiceIdx + 1}`);
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, practiceIdx]);

  /* ─── Auto-play: Completion ── */
  useEffect(() => {
    if (phase !== "complete" || !lessonId) return;
    playAudio(lessonId, "complete");
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ─── Learn Handlers ─────────────────────────────────── */
  const handleLearnNext = () => {
    if (!lesson || cardAnimating) return;
    if (learnIdx + 1 < lesson.learn.items.length) {
      setCardAnimating(true);
      setCardDirection("out");
      setTimeout(() => {
        setLearnIdx((prev) => prev + 1);
        setCardDirection("in");
        setTimeout(() => setCardAnimating(false), 350);
      }, 250);
    } else {
      // All cards seen — complete learn phase
      saveProgress("learn", 100);
      const mysteryMult = parseFloat(typeof window !== "undefined" ? localStorage.getItem("readee_mystery_multiplier") || "1" : "1") || 1;
      const daily = getDailyMultiplier(child?.streak_days ?? 0);
      awardCarrots(Math.floor(5 * daily.multiplier * mysteryMult));
      setPhase("practice");
      questionStartRef.current = Date.now();
    }
  };

  /* ─── Practice Handlers ──────────────────────────────── */
  const advancePractice = useCallback(() => {
    if (!lesson) return;
    setSelectedChoice(null);
    setFeedback(null);
    setWrongChoices(new Set());
    setWrongAttempts(0);
    setShowMiniConfetti(false);
    if (practiceIdx + 1 < lesson.practice.questions.length) {
      setPracticeIdx((prev) => prev + 1);
      questionStartRef.current = Date.now();
    } else {
      const score = Math.round((practiceCorrect / lesson.practice.questions.length) * 100);
      saveProgress("practice", score);
      const mysteryMult = parseFloat(typeof window !== "undefined" ? localStorage.getItem("readee_mystery_multiplier") || "1" : "1") || 1;
      const daily = getDailyMultiplier(child?.streak_days ?? 0);
      awardCarrots(Math.floor(5 * daily.multiplier * mysteryMult));
      setPhase("read");
    }
  }, [lesson, practiceIdx, practiceCorrect, saveProgress, awardCarrots]);

  const handlePracticeAnswer = (choice: string) => {
    if (selectedChoice || !lesson || wrongChoices.has(choice)) return;

    const q = lesson.practice.questions[practiceIdx];
    const isCorrect = choice === q.correct;
    const timeMs = Date.now() - questionStartRef.current;

    if (isCorrect) {
      const newConsecutive = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutive);
      setSelectedChoice(choice);
      setPracticeCorrect((prev) => prev + 1);
      // Per-question bonus carrot with multipliers
      const daily = getDailyMultiplier(child?.streak_days ?? 0);
      const session = getSessionStreakTier(newConsecutive);
      const mysteryMult = parseFloat(typeof window !== "undefined" ? localStorage.getItem("readee_mystery_multiplier") || "1" : "1") || 1;
      const bonus = Math.floor(1 * daily.multiplier * session.multiplier * mysteryMult);
      if (bonus > 0) awardCarrots(bonus);
      setFeedback({ text: CORRECT_MSGS[Math.floor(Math.random() * CORRECT_MSGS.length)], type: "correct" });
      setShowMiniConfetti(true);
      setPracticeAnswers((prev) => [...prev, { question_id: q.question_id || "", correct: true, selected: choice, time_ms: timeMs }]);
      setTimeout(() => advancePractice(), 1500);
    } else {
      setConsecutiveCorrect(0);
      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);
      setWrongChoices((prev) => new Set(prev).add(choice));

      if (newAttempts >= 2) {
        // After 2 wrong: reveal answer and auto-advance
        setSelectedChoice(q.correct);
        setFeedback({ text: `The answer is "${q.correct}"`, type: "reveal" });
        setPracticeAnswers((prev) => [...prev, { question_id: q.question_id || "", correct: false, selected: choice, time_ms: timeMs }]);
        setTimeout(() => advancePractice(), 2000);
      } else {
        setFeedback({ text: "Almost! Try again", type: "wrong" });
        setTimeout(() => setFeedback(null), 1200);
      }
    }
  };

  /* ─── Read Handlers ──────────────────────────────────── */
  const advanceRead = useCallback(() => {
    if (!lesson) return;
    setReadSelected(null);
    setReadFeedback(null);
    setReadWrongChoices(new Set());
    setReadWrongAttempts(0);
    setShowReadMiniConfetti(false);
    if (readQIdx + 1 < lesson.read.questions.length) {
      setReadQIdx((prev) => prev + 1);
      readQuestionStartRef.current = Date.now();
    } else {
      // Lesson complete!
      const score = Math.round((readCorrect / lesson.read.questions.length) * 100);
      saveProgress("read", score);
      const mysteryMult = parseFloat(typeof window !== "undefined" ? localStorage.getItem("readee_mystery_multiplier") || "1" : "1") || 1;
      const daily = getDailyMultiplier(child?.streak_days ?? 0);
      awardCarrots(Math.floor(10 * daily.multiplier * mysteryMult));
      finishLesson();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson, readQIdx, readCorrect, saveProgress, awardCarrots]);

  const handleReadAnswer = (choice: string) => {
    if (readSelected || !lesson || readWrongChoices.has(choice)) return;

    const q = lesson.read.questions[readQIdx];
    const isCorrect = choice === q.correct;
    const timeMs = Date.now() - readQuestionStartRef.current;

    if (isCorrect) {
      const newConsecutive = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutive);
      setReadSelected(choice);
      setReadCorrect((prev) => prev + 1);
      // Per-question bonus carrot with multipliers
      const daily = getDailyMultiplier(child?.streak_days ?? 0);
      const session = getSessionStreakTier(newConsecutive);
      const mysteryMult = parseFloat(typeof window !== "undefined" ? localStorage.getItem("readee_mystery_multiplier") || "1" : "1") || 1;
      const bonus = Math.floor(1 * daily.multiplier * session.multiplier * mysteryMult);
      if (bonus > 0) awardCarrots(bonus);
      setReadFeedback({ text: CORRECT_MSGS[Math.floor(Math.random() * CORRECT_MSGS.length)], type: "correct" });
      setShowReadMiniConfetti(true);
      setReadAnswers((prev) => [...prev, { question_id: q.question_id || "", correct: true, selected: choice, time_ms: timeMs }]);
      setTimeout(() => advanceRead(), 1500);
    } else {
      setConsecutiveCorrect(0);
      const newAttempts = readWrongAttempts + 1;
      setReadWrongAttempts(newAttempts);
      setReadWrongChoices((prev) => new Set(prev).add(choice));

      if (newAttempts >= 2) {
        setReadSelected(q.correct);
        setReadFeedback({ text: `The answer is "${q.correct}"`, type: "reveal" });
        setReadAnswers((prev) => [...prev, { question_id: q.question_id || "", correct: false, selected: choice, time_ms: timeMs }]);
        setTimeout(() => advanceRead(), 2000);
      } else {
        setReadFeedback({ text: "Almost! Try again", type: "wrong" });
        setTimeout(() => setReadFeedback(null), 1200);
      }
    }
  };

  const finishLesson = async () => {
    // Clear mystery box multiplier after lesson
    if (typeof window !== "undefined") {
      localStorage.removeItem("readee_mystery_multiplier");
    }

    if (!child || !lessonId) {
      setPhase("complete");
      return;
    }

    const supabase = supabaseBrowser();

    const { data: freshChild } = await supabase
      .from("children")
      .select("stories_read, streak_days, last_lesson_at, carrots")
      .eq("id", child.id)
      .single();

    const current = freshChild as { stories_read: number; streak_days: number; last_lesson_at: string | null; carrots: number } | null;
    const newStoriesRead = (current?.stories_read ?? 0) + 1;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let newStreak = 1;
    if (current?.last_lesson_at) {
      const lastDate = new Date(current.last_lesson_at);
      const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
      const diffDays = Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) {
        newStreak = current.streak_days;
      } else if (diffDays === 1) {
        newStreak = current.streak_days + 1;
      }
    }

    await supabase
      .from("children")
      .update({
        stories_read: newStoriesRead,
        streak_days: newStreak,
        last_lesson_at: now.toISOString(),
      })
      .eq("id", child.id);

    setStreakDays(newStreak);

    const totalCarrotsAfter = (current?.carrots ?? 0) + 10;
    for (const milestone of CARROT_MILESTONES) {
      if ((current?.carrots ?? 0) < milestone.carrots && totalCarrotsAfter >= milestone.carrots) {
        setNewBadge(milestone.name);
        break;
      }
    }

    const file = lessonsData as unknown as LessonsFile;
    for (const level of Object.values(file.levels)) {
      const idx = level.lessons.findIndex((l) => l.id === lessonId);
      if (idx !== -1 && idx + 1 < level.lessons.length) {
        setNextLessonId(level.lessons[idx + 1].id);
        break;
      }
    }

    setCelebrationMsg(CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)]);

    const pieces = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: ["#4338ca", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#ec4899"][
        Math.floor(Math.random() * 6)
      ],
      delay: Math.random() * 1.5,
    }));
    setConfettiPieces(pieces);
    setPhase("complete");
  };

  if (phase === "loading" || !child || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  const pageWrapper = "min-h-screen bg-gradient-to-b from-indigo-50/40 via-white to-violet-50/30";

  /* ═══════════════════════════════════════════════════════
     LEARN PHASE — Flashcard Mode
     ═══════════════════════════════════════════════════════ */
  if (phase === "learn") {
    const item = lesson.learn.items[learnIdx];
    const { icon, title, detail } = formatLearnItem(item);
    const colorScheme = CARD_COLORS[learnIdx % CARD_COLORS.length];
    const totalCards = lesson.learn.items.length;

    return (
      <div className={pageWrapper}>
        <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SectionProgressBar
                phase={phase}
                practiceIdx={0}
                practiceTotal={lesson.practice.questions.length}
                readQIdx={0}
                readTotal={lesson.read.questions.length}
                showReadQuestions={false}
              />
            </div>
            <LessonMuteToggle />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              {lesson.title}
            </h1>
            <p className="text-zinc-500 mt-1 text-sm max-w-md mx-auto">
              {lesson.learn.content}
            </p>
            <span className="inline-block mt-2 text-[11px] font-medium text-indigo-500 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Skill: {formatSkillName(lesson.skill)}
            </span>
          </div>

          {/* Flashcard */}
          <div
            key={learnIdx}
            className={`rounded-3xl border-2 ${colorScheme.border} ${colorScheme.bg} p-8 text-center space-y-4 ${
              cardDirection === "in" ? "animate-cardSlideIn" : "animate-cardSlideOut"
            }`}
          >
            {/* Icon */}
            {icon && <div className="flex justify-center">{icon}</div>}

            {/* Big title / letter */}
            <div className="text-5xl sm:text-6xl font-black text-indigo-700 tracking-tight leading-tight">
              {title}
            </div>

            {/* Hint in speech bubble */}
            {detail && (
              <div className="relative inline-block max-w-sm mx-auto">
                <div className="rounded-2xl bg-white/80 border border-zinc-200/60 px-5 py-3 shadow-sm">
                  <p className="text-lg text-zinc-700 font-medium">{detail}</p>
                </div>
                <div className="w-4 h-4 bg-white/80 border-b border-r border-zinc-200/60 absolute -bottom-2 left-1/2 -translate-x-1/2 rotate-45" />
              </div>
            )}

            {/* Speaker + Say it out loud prompt */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <LessonSpeakerButton lessonId={lessonId!} audioFile={`learn-${learnIdx + 1}`} light />
              <p className="text-sm text-indigo-500 font-semibold">
                Say it out loud!
              </p>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center items-center gap-2">
            {Array.from({ length: totalCards }).map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === learnIdx
                    ? "w-3 h-3 bg-indigo-500"
                    : i < learnIdx
                    ? "w-2 h-2 bg-indigo-300"
                    : "w-2 h-2 bg-zinc-200"
                }`}
              />
            ))}
            <span className="ml-2 text-xs text-zinc-400 font-medium">
              {learnIdx + 1}/{totalCards}
            </span>
          </div>

          {/* Next button */}
          <button
            onClick={handleLearnNext}
            disabled={cardAnimating}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-lg hover:from-indigo-700 hover:to-violet-600 transition-all shadow-lg animate-gentleBounce disabled:opacity-70"
          >
            {learnIdx + 1 < totalCards ? "Next →" : "Got it! Let's practice!"}
          </button>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════
     PRACTICE PHASE
     ═══════════════════════════════════════════════════════ */
  if (phase === "practice") {
    const q = lesson.practice.questions[practiceIdx];
    const qType = q.type || "multiple_choice";

    return (
      <div className={pageWrapper}>
        <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SectionProgressBar
                phase={phase}
                practiceIdx={practiceIdx}
                practiceTotal={lesson.practice.questions.length}
                readQIdx={0}
                readTotal={lesson.read.questions.length}
                showReadQuestions={false}
              />
            </div>
            <LessonMuteToggle />
          </div>

          {/* Drag & Match */}
          {qType === "drag_match" && (
            <DragMatchQuestion
              question={q}
              onComplete={(correct, selected) => {
                const timeMs = Date.now() - questionStartRef.current;
                setPracticeAnswers((prev) => [...prev, { question_id: q.question_id || "", correct, selected, time_ms: timeMs }]);
                if (correct) setPracticeCorrect((prev) => prev + 1);
                advancePractice();
              }}
            />
          )}

          {/* Fill Blank */}
          {qType === "fill_blank" && (
            <FillBlankQuestion
              question={q}
              onComplete={(correct, selected) => {
                const timeMs = Date.now() - questionStartRef.current;
                setPracticeAnswers((prev) => [...prev, { question_id: q.question_id || "", correct, selected, time_ms: timeMs }]);
                if (correct) setPracticeCorrect((prev) => prev + 1);
                setTimeout(() => advancePractice(), 300);
              }}
            />
          )}

          {/* Multiple Choice */}
          {qType === "multiple_choice" && (
            <>
              {/* Question image — compact on mobile */}
              <div className="flex justify-center">
                <img
                  src={`https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public/images/${lessonId}/q${practiceIdx + 1}.png`}
                  alt=""
                  className="max-h-[150px] md:max-h-[200px] w-auto rounded-2xl shadow-md object-cover"
                  onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
                />
              </div>

              <div className="flex items-center justify-center gap-2">
                <h2 className="text-lg md:text-xl font-bold text-zinc-900 text-center leading-snug">
                  {q.prompt}
                </h2>
                <LessonSpeakerButton lessonId={lessonId!} audioFile={`practice-q${practiceIdx + 1}`} light />
              </div>

              {/* Streak fire indicator */}
              {consecutiveCorrect >= 3 && (
                <div className="flex justify-center">
                  <StreakFire consecutiveCorrect={consecutiveCorrect} />
                </div>
              )}

              {/* Feedback */}
              {feedback && (
                <div className={`text-center py-2 px-4 rounded-xl text-sm font-bold relative overflow-hidden ${
                  feedback.type === "correct"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : feedback.type === "reveal"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  {feedback.text}
                  {showMiniConfetti && <MiniConfetti />}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                {q.choices.map((choice: string, i: number) => {
                  const isSelected = selectedChoice === choice;
                  const isCorrect = choice === q.correct;
                  const isWrong = wrongChoices.has(choice);
                  const showCorrect = selectedChoice !== null;
                  const letters = ["A", "B", "C", "D"];

                  return (
                    <button
                      key={i}
                      onClick={() => handlePracticeAnswer(choice)}
                      disabled={!!selectedChoice || isWrong}
                      className={`
                        relative text-left rounded-2xl border-2 min-h-[52px] p-3 transition-all duration-200
                        ${
                          showCorrect && isCorrect
                            ? "border-green-500 bg-green-50 scale-[1.02]"
                            : isWrong
                            ? "border-red-200 bg-red-50/50 opacity-50"
                            : "border-zinc-200 bg-white hover:border-indigo-300 hover:shadow-md active:scale-[0.98]"
                        }
                        ${isWrong && !showCorrect ? "animate-wrongShake" : ""}
                        disabled:cursor-default
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`
                          w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0
                          ${
                            showCorrect && isCorrect
                              ? "bg-green-600 text-white"
                              : isWrong
                              ? "bg-red-200 text-red-500"
                              : "bg-zinc-100 text-zinc-500"
                          }
                        `}
                        >
                          {showCorrect && isCorrect ? "✓" : letters[i]}
                        </div>
                        <span
                          className={`font-medium text-sm flex-1 leading-tight ${
                            showCorrect && isCorrect
                              ? "text-green-700"
                              : isWrong
                              ? "text-red-400 line-through"
                              : "text-zinc-800"
                          }`}
                        >
                          {choice}
                        </span>
                        <LessonSpeakerButton lessonId={lessonId!} audioFile={`practice-q${practiceIdx + 1}-c${i + 1}`} light />
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════
     READ PHASE — Story + Comprehension
     ═══════════════════════════════════════════════════════ */
  if (phase === "read" || phase === "read-transition") {
    if (!showReadQuestions) {
      const storyLines = lesson.read.text.split("\n").filter((l) => l.trim());

      return (
        <div className={pageWrapper}>
          <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <SectionProgressBar
                  phase="read"
                  practiceIdx={0}
                  practiceTotal={lesson.practice.questions.length}
                  readQIdx={0}
                  readTotal={lesson.read.questions.length}
                  showReadQuestions={false}
                />
              </div>
              <LessonMuteToggle />
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
                  {lesson.read.title}
                </h1>
                <LessonSpeakerButton lessonId={lessonId!} audioFile="story" light />
              </div>
              <p className="text-zinc-500 mt-1 text-sm">Read the story below</p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-3">
              {storyLines.map((line, i) => (
                <div key={i} className="flex items-start gap-1 animate-storyLineIn" style={{ animationDelay: `${i * 0.15}s` }}>
                  <p className="text-lg leading-relaxed text-zinc-800 flex-1">
                    {line}
                  </p>
                  <LessonSpeakerButton lessonId={lessonId!} audioFile={`story-line-${i + 1}`} light />
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setShowReadQuestions(true);
                readQuestionStartRef.current = Date.now();
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-lg hover:from-indigo-700 hover:to-violet-600 transition-all shadow-lg animate-gentleBounce"
            >
              Let&apos;s check what you remember!
            </button>
          </div>
        </div>
      );
    }

    const q = lesson.read.questions[readQIdx];

    return (
      <div className={pageWrapper}>
        <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SectionProgressBar
                phase="read"
                practiceIdx={0}
                practiceTotal={lesson.practice.questions.length}
                readQIdx={readQIdx}
                readTotal={lesson.read.questions.length}
                showReadQuestions={true}
              />
            </div>
            <LessonMuteToggle />
          </div>

          {/* Question image — compact on mobile */}
          <div className="flex justify-center">
            <img
              src={`https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public/images/${lessonId}/rq${readQIdx + 1}.png`}
              alt=""
              className="max-h-[150px] md:max-h-[200px] w-auto rounded-2xl shadow-md object-cover"
              onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
            />
          </div>

          <div className="flex items-center justify-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-zinc-900 text-center leading-snug">
              {q.prompt}
            </h2>
            <LessonSpeakerButton lessonId={lessonId!} audioFile={`read-q${readQIdx + 1}`} light />
          </div>

          {/* Streak fire indicator */}
          {consecutiveCorrect >= 3 && (
            <div className="flex justify-center">
              <StreakFire consecutiveCorrect={consecutiveCorrect} />
            </div>
          )}

          {/* Feedback */}
          {readFeedback && (
            <div className={`text-center py-2 px-4 rounded-xl text-sm font-bold relative overflow-hidden ${
              readFeedback.type === "correct"
                ? "bg-green-50 text-green-700 border border-green-200"
                : readFeedback.type === "reveal"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}>
              {readFeedback.text}
              {showReadMiniConfetti && <MiniConfetti />}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            {q.choices.map((choice: string, i: number) => {
              const isSelected = readSelected === choice;
              const isCorrect = choice === q.correct;
              const isWrong = readWrongChoices.has(choice);
              const showCorrect = readSelected !== null;
              const letters = ["A", "B", "C", "D"];

              return (
                <button
                  key={i}
                  onClick={() => handleReadAnswer(choice)}
                  disabled={!!readSelected || isWrong}
                  className={`
                    relative text-left rounded-2xl border-2 min-h-[52px] p-3 transition-all duration-200
                    ${
                      showCorrect && isCorrect
                        ? "border-green-500 bg-green-50 scale-[1.02]"
                        : isWrong
                        ? "border-red-200 bg-red-50/50 opacity-50"
                        : "border-zinc-200 bg-white hover:border-indigo-300 hover:shadow-md active:scale-[0.98]"
                    }
                    ${isWrong && !showCorrect ? "animate-wrongShake" : ""}
                    disabled:cursor-default
                  `}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`
                      w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0
                      ${
                        showCorrect && isCorrect
                          ? "bg-green-600 text-white"
                          : isWrong
                          ? "bg-red-200 text-red-500"
                          : "bg-zinc-100 text-zinc-500"
                      }
                    `}
                    >
                      {showCorrect && isCorrect ? "✓" : letters[i]}
                    </div>
                    <span
                      className={`font-medium text-sm flex-1 leading-tight ${
                        showCorrect && isCorrect
                          ? "text-green-700"
                          : isWrong
                          ? "text-red-400 line-through"
                          : "text-zinc-800"
                      }`}
                    >
                      {choice}
                    </span>
                    <LessonSpeakerButton lessonId={lessonId!} audioFile={`read-q${readQIdx + 1}-c${i + 1}`} light />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════
     COMPLETE PHASE
     ═══════════════════════════════════════════════════════ */
  if (phase === "complete") {
    return (
      <div className={`${pageWrapper} relative overflow-hidden`}>
        <div className="max-w-lg mx-auto text-center py-16 px-4 space-y-6 relative">
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

          <div className="flex justify-center"><Sparkles className="w-16 h-16 text-indigo-500" strokeWidth={1.5} /></div>

          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
            Lesson Complete!
          </h1>

          <p className="text-zinc-500 max-w-xs mx-auto">{celebrationMsg}</p>

          {/* Animated carrots display */}
          <div className="inline-block rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-5 text-white animate-carrotCountUp">
            <div className="text-sm font-medium text-orange-200">You earned</div>
            <div className="text-4xl font-bold mt-1 flex items-center justify-center gap-2">+{totalCarrots} <Carrot className="w-8 h-8" strokeWidth={1.5} /></div>
          </div>

          {/* Daily streak multiplier badge */}
          {(() => {
            const dm = getDailyMultiplier(streakDays);
            return dm.multiplier > 1 ? (
              <div className="animate-streakPulse">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-50 border border-amber-200">
                  <Zap className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
                  <span className="text-lg font-bold text-amber-700">
                    {dm.label}
                  </span>
                </div>
              </div>
            ) : null;
          })()}

          {/* Streak display */}
          {streakDays > 0 && (
            <div className="animate-streakPulse">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-50 border border-orange-200">
                <Flame className="w-5 h-5 text-orange-500" strokeWidth={1.5} />
                <span className="text-lg font-bold text-orange-700">
                  {streakDays} day streak!
                </span>
              </div>
            </div>
          )}

          {/* New badge unlock */}
          {newBadge && (
            <div className="animate-badgeUnlock">
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200">
                <Trophy className="w-6 h-6 text-yellow-500" strokeWidth={1.5} />
                <div className="text-left">
                  <div className="text-xs font-medium text-yellow-600">New Badge Unlocked!</div>
                  <div className="text-sm font-bold text-yellow-800">{newBadge}</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-4">
            {nextLessonId && (
              <Link
                href={`/lesson?child=${child.id}&lesson=${nextLessonId}`}
                className="block w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-lg hover:from-indigo-700 hover:to-violet-600 transition-all shadow-lg"
              >
                Next Lesson →
              </Link>
            )}
            <Link
              href="/dashboard"
              className={`block w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                nextLessonId
                  ? "bg-white border-2 border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  : "bg-gradient-to-r from-indigo-600 to-violet-500 text-white hover:from-indigo-700 hover:to-violet-600 shadow-lg"
              }`}
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
