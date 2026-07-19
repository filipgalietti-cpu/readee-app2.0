"use client";

import { Suspense, useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LoadingImage } from "@/app/components/ui/LoadingImage";
import QuestionChart from "@/app/_components/QuestionChart";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { logLearningEvent, newSessionId } from "@/lib/adaptive/events";
import { useAdaptiveController } from "@/lib/adaptive/use-adaptive-controller";
import { selectIntervention, type Intervention } from "@/lib/adaptive/interventions";
import { selectNextItem } from "@/lib/adaptive/select-item";
import { AdaptiveDebugBadge } from "@/app/_components/AdaptiveDebugBadge";
import { Child } from "@/lib/db/types";
import { useAudio } from "@/lib/audio/use-audio";
import { audioManager } from "@/lib/audio/audio-manager";
import { getAudioUrl } from "@/lib/audio";
import { usePracticeStore } from "@/lib/stores/practice-store";
import { useThemeStore } from "@/lib/stores/theme-store";
import { safeValidate } from "@/lib/validate";
import { PracticeResultSchema } from "@/lib/schemas";
import { savedOk } from "@/lib/db/checked-write";
import { levelNameToGradeKey } from "@/lib/assessment/questions";
import { buildSharpenDeck, parseStandardFromQuestionId, type SharpenDeck } from "@/lib/adaptive/build-deck";
import { getStandardsForGrade, findStandardById } from "@/lib/data/all-standards";
import { fadeUp, fadeIn, staggerContainer, feedbackSlideUp, popIn, scaleIn } from "@/lib/motion/variants";
import { SentenceBuild } from "@/app/components/practice/SentenceBuild";
import { CategorySort } from "@/app/components/practice/CategorySort";
import { MissingWord } from "@/app/components/practice/MissingWord";
import { TapToPair } from "@/app/components/practice/TapToPair";
import { SoundMachine } from "@/app/components/practice/SoundMachine";
import { SpaceInsertion } from "@/app/components/practice/SpaceInsertion";
import { getDailyMultiplier, getSessionStreakTier } from "@/lib/carrots/multipliers";
import { StreakFire } from "@/app/_components/StreakFire";
import SealOfApproval from "./_components/SealOfApproval";
import { BookOpen, Newspaper, Type, MessageCircle, Carrot, Search, Flame, Volume2, Lightbulb, ArrowRight, X as XIcon, Check as CheckIcon, Sparkles } from "lucide-react";
import { usePlanStore } from "@/lib/stores/plan-store";
import { getLimits } from "@/lib/plan/limits";
import { useLifetimeCarrots } from "@/lib/levels/use-lifetime-carrots";
import LevelProgressCard from "@/app/_components/LevelProgressCard";
import type { LucideIcon } from "lucide-react";
import { Bunny, BunnyReaction } from "@/app/_components/Bunny/Bunny";
import { UnlockToast, mixUnlocks, type UnlockableItem } from "@/app/_components/UnlockToast";
import QuizHypeIntro from "./_components/QuizHypeIntro";
import type { Outfit } from "@/app/_components/Bunny/outfits";
import { checkMilestones, checkBadgeMilestones } from "@/lib/unlock";

/* ─── Types ──────────────────────────────────────────── */

interface Question {
  id: string;
  type: string;
  prompt: string;
  choices?: string[];
  correct: string;
  hint: string;
  difficulty: number;
  audio_url?: string;
  hint_audio_url?: string;
  image_url?: string;
  choices_audio_urls?: (string | null)[];
  words?: string[];
  sentence_hint?: string;
  sentence_audio_url?: string;
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
  chart_data?: {
    kind: "bar" | "line" | "pie";
    title: string;
    xLabel?: string;
    yLabel?: string;
    series: { label: string; value: number }[];
  };
}

interface Standard {
  standard_id: string;
  standard_description: string;
  domain: string;
  parent_tip: string;
  questions: Question[];
}

interface AnswerRecord {
  questionId: string;
  correct: boolean;
  selected: string;
}

/* ─── Constants ──────────────────────────────────────── */

const QUESTIONS_PER_SESSION = 5;
const CARROTS_PER_CORRECT = 5;

const CHOICE_COLORS = [
  "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/60 dark:text-blue-200 dark:border-blue-700",
  "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/60 dark:text-purple-200 dark:border-purple-700",
  "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-700",
  "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700",
];

// Claude Design "Practice Runner" choice-card palette (letter chip + card).
const DESIGN_CHOICE_COLORS = [
  { bg: "#dbeafe", fg: "#1e3a8a", border: "#93c5fd", chipBg: "#bfdbfe", chipFg: "#1e40af" },
  { bg: "#f3e8ff", fg: "#581c87", border: "#d8b4fe", chipBg: "#e9d5ff", chipFg: "#6b21a8" },
  { bg: "#fef3c7", fg: "#78350f", border: "#fcd34d", chipBg: "#fde68a", chipFg: "#92400e" },
  { bg: "#d1fae5", fg: "#064e3b", border: "#6ee7b7", chipBg: "#a7f3d0", chipFg: "#065f46" },
];

/* ─── Highlight key words in question text ───────── */

const QUESTION_WORDS = new Set([
  "What","Who","Where","When","Why","How","Which",
]);

function highlightQuestion(text: string): React.ReactNode[] {
  // Tokenize on three highlight-eligible groups so we can style each
  // and never leak the raw markers (** or quotes) into the rendered DOM.
  const tokenizer = /(\*\*[^*]+\*\*|"[^"]+"|"[^"]+")/g;
  return text.split(tokenizer).map((segment, si) => {
    // **emphasis** — render the inner text styled, drop the asterisks.
    if (/^\*\*[^*]+\*\*$/.test(segment)) {
      const inner = segment.slice(2, -2);
      return (
        <span key={si} className="text-violet-600 dark:text-violet-400 font-extrabold">
          {inner}
        </span>
      );
    }
    // "quoted" — render as is, just styled.
    if (/^[""][^""]+[""]$/.test(segment)) {
      return <span key={si} className="text-violet-600 dark:text-violet-400 font-extrabold">{segment}</span>;
    }
    // Plain segment — handle ALL CAPS / question-word highlighting,
    // and defensively strip any stray asterisks that survived.
    const cleanSegment = segment.replace(/\*\*/g, "");
    const hasEmphasis = /\b[A-Z]{3,}\b/.test(cleanSegment);
    return cleanSegment.split(/(\s+|(?=[.,!?;:])|(?<=[.,!?;:]))/).map((part, pi) => {
      const clean = part.replace(/[^a-zA-Z']/g, "");
      if (hasEmphasis) {
        if (/^[A-Z]{3,}$/.test(clean)) {
          return <span key={`${si}-${pi}`} className="text-violet-600 dark:text-violet-400 font-extrabold">{part}</span>;
        }
      } else if (clean.length > 1 && QUESTION_WORDS.has(clean)) {
        return <span key={`${si}-${pi}`} className="text-violet-600 dark:text-violet-400 font-extrabold">{part}</span>;
      }
      return part;
    });
  });
}

/* ─── Kid-friendly lesson titles & prompts ────────────── */

const KID_TITLES: Record<string, string> = {
  "RL.K.1": "Key Details in a Story",
  "RL.K.2": "Retell a Story",
  "RL.K.3": "Story People & Places",
  "RL.K.4": "Discover New Words",
  "RL.K.5": "Book Types",
  "RL.K.6": "Authors & Illustrators",
  "RL.K.7": "Story Art",
  "RL.K.9": "Compare Two Stories",
  "RI.K.1": "Find the Facts",
  "RI.K.2": "What's the Main Topic?",
  "RI.K.3": "Linking Ideas Together",
  "RI.K.4": "Info Words",
  "RI.K.5": "Book Parts",
  "RI.K.6": "Who Wrote This?",
  "RI.K.7": "Art & Text Clues",
  "RI.K.8": "Author's Reasons",
  "RI.K.9": "Compare Two Texts",
  "RF.K.1a": "Word Tracking",
  "RF.K.1b": "Print Concepts",
  "RF.K.1c": "Word Spaces",
  "RF.K.1d": "ABCs",
  "RF.K.2a": "Rhyme Time",
  "RF.K.2b": "Syllable Clap",
  "RF.K.2c": "Blend It Together",
  "RF.K.2d": "Sound It Out",
  "RF.K.2e": "New Sounds",
  "RF.K.3a": "Letter Sounds",
  "RF.K.3b": "Vowel Sounds",
  "RF.K.3c": "Sight Words",
  "RF.K.3d": "Spelling Clues",
  "RF.K.4": "Reading Time",
  "K.L.1": "Grammar Fun",
  "K.L.2": "Punctuation Power",
  "K.L.4": "Word Meaning",
  "K.L.5": "Word Play",
  "K.L.6": "Vocabulary Builder",
};

const KID_PROMPTS: Record<string, string> = {
  "RL.K.1": "Can you find the important parts of a story? Let's find out!",
  "RL.K.2": "Can you retell what happened in a story? Let's try!",
  "RL.K.3": "Who's in the story and where does it happen? Let's explore!",
  "RL.K.4": "Time to discover cool new words hiding in stories!",
  "RL.K.5": "Do you know your book types? Let's see!",
  "RL.K.6": "Let's learn about the people who make books!",
  "RL.K.7": "How do pictures and words work together? Let's look!",
  "RL.K.9": "Two stories, one challenge — spot the differences!",
  "RI.K.1": "Can you hunt for facts and details? Let's go!",
  "RI.K.2": "What's the big idea? Let's figure it out together!",
  "RI.K.3": "How do ideas connect? Let's link them up!",
  "RI.K.4": "Time to unlock tricky words in real texts!",
  "RI.K.5": "Do you know the parts of a book? Let's check!",
  "RI.K.6": "Who wrote this and why? Let's investigate!",
  "RI.K.7": "Pictures + words = clues! Let's put them together!",
  "RI.K.8": "Why did the author write this? Let's figure it out!",
  "RI.K.9": "Two texts, same topic — what's different? Let's compare!",
  "RF.K.1a": "Follow the words with your finger — let's track them!",
  "RF.K.1b": "Let's learn how books and words work!",
  "RF.K.1c": "Can you spot the spaces between words? Let's look!",
  "RF.K.1d": "A-B-C, let's go! Time to practice your letters!",
  "RF.K.2a": "Cat, hat, bat — can you find the rhymes?",
  "RF.K.2b": "Clap it out! How many syllables can you hear?",
  "RF.K.2c": "Put the sounds together to make a word!",
  "RF.K.2d": "Break it apart! What sounds do you hear?",
  "RF.K.2e": "New sounds to discover — let's listen carefully!",
  "RF.K.3a": "What sound does each letter make? Let's practice!",
  "RF.K.3b": "A, E, I, O, U — time to learn vowel sounds!",
  "RF.K.3c": "Can you read these important words super fast?",
  "RF.K.3d": "Use letter clues to figure out new words!",
  "RF.K.4": "Time to read like a superstar! Let's go!",
  "K.L.1": "Nouns, verbs, and more — let's build sentences!",
  "K.L.2": "Capitals and periods — let's get them right!",
  "K.L.4": "What does that word mean? Let's find out!",
  "K.L.5": "Opposites, categories, and more — let's play with words!",
  "K.L.6": "Big words, small words — let's grow your vocabulary!",
};

const DOMAIN_ICON: Record<string, LucideIcon> = {
  "Reading Literature": BookOpen,
  "Reading Informational Text": Newspaper,
  "Foundational Skills": Type,
  "Language": MessageCircle,
};

const CORRECT_MESSAGES = [
  "Great job!", "You got it!", "Amazing!", "That's right!",
  "Way to go!", "Awesome!", "You're so smart!", "Nailed it!",
  "Super!", "Excellent!", "You're on fire!", "Fantastic!",
];
const CORRECT_EMOJIS = ["star", "sparkles", "sparkle", "star2", "zap", "target"];

const INCORRECT_MESSAGES = [
  "Not quite!", "Almost!", "Good try!", "Keep learning!", "So close!",
  "Try again!", "You'll get it!", "Oops, not that one!", "Nice effort!", "Don't give up!",
];

// Shown when the kid gets it right on the SECOND try — kind, but it doesn't
// count as a first-try win (0 carrots, not scored correct).
const SECOND_TRY_MESSAGES = [
  "You found it!", "Got it on the next try!", "Yes — that's the one!",
  "Nice — you kept going!", "There it is!", "You figured it out!",
];

// Feedback audio files (static .mp3 in /audio/feedback/)
const CORRECT_AUDIO = ["correct-1", "correct-2", "correct-3", "correct-4", "correct-5", "correct-6", "correct-7", "correct-8", "correct-9", "correct-10", "correct-11", "correct-12"];
const INCORRECT_AUDIO = ["incorrect-1", "incorrect-2", "incorrect-3", "incorrect-4", "incorrect-5", "incorrect-6", "incorrect-7", "incorrect-8", "incorrect-9", "incorrect-10"];
const ENCOURAGE_AUDIO = ["encourage-1", "encourage-2", "encourage-3", "encourage-4", "encourage-5", "encourage-6"];

const ACCENT_COLORS = ["#60a5fa", "#4ade80", "#fb923c", "#a78bfa"]; // blue, green, orange, purple


/* ─── Helpers ────────────────────────────────────────── */

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function splitPrompt(prompt: string): { passage: string | null; question: string } {
  // Authored passages use an explicit blank-line break.
  const parts = prompt.split("\n\n");
  if (parts.length >= 2) {
    return { passage: parts.slice(0, -1).join("\n\n"), question: parts[parts.length - 1] };
  }
  // Peel a passage off a one-run prompt ONLY when it opens with an explicit
  // read-aloud lead-in ("Listen to the story: … <question>?"). Without that
  // cue we can't reliably tell story from question — quoted titles and inner
  // punctuation (e.g. "The True Story of the 3 Little Pigs!") break naive
  // sentence-splitting into a garbled fragment — so we leave the prompt whole.
  const leadIn = /^\s*(listen to (the )?(story|passage|text)|read (the )?(story|passage|text)|here('|’)?s (a |the )?(story|passage))\s*[:\-–—]?\s*/i;
  const m = prompt.match(leadIn);
  if (m) {
    const stripped = prompt.slice(m[0].length);
    const sentences = stripped.match(/[^.!?]+[.!?]+(?=\s|$)/g);
    if (sentences && sentences.length >= 2) {
      const question = sentences[sentences.length - 1].trim();
      const passage = sentences.slice(0, -1).join(" ").trim();
      if (passage.length > 0 && question.length > 0) return { passage, question };
    }
  }
  return { passage: null, question: prompt };
}



function getNextStandard(currentId: string, standards: Standard[]): Standard | null {
  const idx = standards.findIndex((s) => s.standard_id === currentId);
  if (idx >= 0 && idx < standards.length - 1) return standards[idx + 1];
  return null;
}

function getStars(correct: number, total: number): number {
  if (correct === total) return 3;
  if (correct >= total - 1) return 2;
  if (correct >= 1) return 1;
  return 0;
}

const SUPABASE_STORAGE = "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public";

const GRADE_FOLDER: Record<string, string> = {
  "pre-k": "kindergarten",
  kindergarten: "kindergarten",
  "1st": "1st-grade",
  "2nd": "2nd-grade",
  "3rd": "3rd-grade",
  "4th": "4th-grade",
};

function questionImageUrl(questionId: string, gradeKey?: string): string {
  const match = questionId.match(/^(.+)-Q\d+$/i);
  if (!match) return "";
  const standardId = match[1]; // e.g. "RL.K.1"
  const folder = gradeKey ? GRADE_FOLDER[gradeKey] || gradeKey : "";
  if (!folder) return "";
  return `${SUPABASE_STORAGE}/images/${folder}/${standardId}/${questionId}.png`;
}

/* ─── Audio Helpers ──────────────────────────────────── */

function MuteToggle() {
  const { muted, toggleMute } = useAudio();
  return (
    <button
      onClick={toggleMute}
      className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors flex-shrink-0"
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

/* ═══════════════════════════════════════════════════════ */
/*  Page wrapper                                          */
/* ═══════════════════════════════════════════════════════ */

export default function PracticePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PracticeLoader />
    </Suspense>
  );
}

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-white dark:bg-[#0f172a] gap-4">
      <div className="h-12 w-12 rounded-full border-4 border-violet-200 border-t-violet-500 dark:border-violet-900 dark:border-t-violet-400 animate-spin" />
      <p className="text-violet-600 dark:text-violet-300 text-sm font-medium">Loading questions...</p>
    </div>
  );
}

/* ─── Loader ─────────────────────────────────────────── */

function PracticeLoader() {
  const params = useSearchParams();
  const router = useRouter();
  const childId = params.get("child");
  const standardId = params.get("standard");
  const typesParam = params.get("types"); // e.g. "sentence_build,category_sort"
  // ?mode=sharpen — premium adaptive review. Loads the kid's top weak
  // standards and composes a multi-standard deck (round-robin interleave,
  // 6-9 questions). See lib/adaptive/build-deck.ts.
  const modeParam = params.get("mode");
  const sharpenMode = modeParam === "sharpen";
  // Optional smart-search deep-link: pin a specific question to the
  // front of the session so the kid sees the one the parent searched
  // for first instead of waiting for the shuffle to surface it.
  const focusQuestionId = params.get("focus");
  // ?from=lesson — this practice session is the post-lesson quiz launched
  // straight after a /learn lesson. On finish we send the kid back to the
  // journey (with the unlock cinematic) instead of the standards hub.
  const fromLesson = params.get("from") === "lesson";
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  // Sharpen Up deck — populated by buildSharpenDeck() when ?mode=sharpen.
  // null = not yet loaded; { questions: [], ... } = empty (no weak spots).
  const [sharpenDeck, setSharpenDeck] = useState<SharpenDeck<Question> | null>(null);
  // Deliverability gate — fetch quarantined question ids on mount and
  // strip them from the served set. Cached server-side; ~1 lightweight
  // request per session.
  const [blockedQuestionIds, setBlockedQuestionIds] = useState<Set<string> | null>(null);
  useEffect(() => {
    fetch("/api/qc/blocked-questions")
      .then((r) => (r.ok ? r.json() : { ids: [] }))
      .then((d) => setBlockedQuestionIds(new Set<string>(d.ids ?? [])))
      .catch(() => setBlockedQuestionIds(new Set()));
  }, []);

  const plan = usePlanStore((s) => s.plan);
  const fetchPlan = usePlanStore((s) => s.fetch);
  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  // No child in the URL? Don't dead-end on "No reader selected" —
  // bounce to /practice-hub which auto-resolves the child from the
  // parent's account and lets them pick a standard.
  useEffect(() => {
    if (childId) return;
    const standardQs = standardId
      ? `?standard=${encodeURIComponent(standardId)}`
      : "";
    router.replace(`/practice-hub${standardQs}`);
  }, [childId, standardId, router]);

  useEffect(() => {
    async function load() {
      if (!childId) { setLoading(false); return; }
      const supabase = supabaseBrowser();
      const { data } = await supabase.from("children").select("*").eq("id", childId).single();
      if (data) setChild(data as Child);

      // Check practice limit for free users. A post-lesson quiz (from=lesson)
      // is part of the lesson flow, not standalone practice — never gate it,
      // or a free kid replaying a lesson would get bounced to /upgrade mid-quiz.
      if (plan !== null && plan !== "premium" && standardId && !fromLesson) {
        const { data: results } = await supabase
          .from("practice_results")
          .select("questions_attempted")
          .eq("child_id", childId)
          .eq("standard_id", standardId)
          .single();

        const attempted = results?.questions_attempted ?? 0;
        if (attempted >= getLimits(plan).practicePerStandard) {
          setBlocked(true);
        }
      }

      // Sharpen Up: fetch the kid's weak standards + compose a multi-
      // standard deck. Premium-gated at the UI layer — free users will
      // never see the Sharpen Up CTA that points here, but if they
      // somehow land on ?mode=sharpen we just bounce to /upgrade.
      if (sharpenMode && data) {
        if (plan !== null && plan !== "premium") {
          router.replace("/upgrade?reason=sharpen");
          return;
        }
        const childRow = data as Child;
        const gradeKey = levelNameToGradeKey(childRow.reading_level ?? null);
        const allGradeStandards = getStandardsForGrade(gradeKey);
        const deck = await buildSharpenDeck<typeof allGradeStandards[number], Question>(
          supabase,
          childId,
          allGradeStandards,
          { topN: 3, perStandard: 3, maxTotal: 9 },
        );
        if (!deck || deck.questions.length === 0) {
          // No weak spots yet — send the kid back to the review hub.
          router.replace(`/review?child=${childId}`);
          return;
        }
        setSharpenDeck(deck);
      }

      setLoading(false);
    }
    load();
  }, [childId, plan, standardId, sharpenMode, router, fromLesson]);

  useEffect(() => {
    if (blocked) router.replace("/upgrade?reason=practice");
  }, [blocked, router]);

  // No childId in the URL? We've already queued a redirect to /practice-hub.
  // Keep the spinner up until the route swap completes — don't flash the
  // "No reader selected" dead-end card.
  if (!childId) return <LoadingScreen />;
  if (loading || blocked || blockedQuestionIds === null) return <LoadingScreen />;

  // Determine grade from child's reading level, then load the right standards
  const gradeKey = levelNameToGradeKey(child?.reading_level ?? null);
  const allGradeStandards = getStandardsForGrade(gradeKey);

  // Deliverability gate — strip quarantined questions from every
  // standard before any question selection happens downstream.
  const blockedSet = blockedQuestionIds;
  const gradeStandards = allGradeStandards.map((s) => ({
    ...s,
    questions: s.questions.filter((q) => !blockedSet.has(q.id)),
  }));

  // Build a virtual standard when filtering by question types across all standards
  let standard: Standard | undefined;
  if (sharpenMode && sharpenDeck) {
    // Sharpen Up — questions drawn from the kid's top weak standards.
    // We use a synthetic standard_id ("sharpen-review") for the SESSION
    // wrapper, but per-question save logic recovers each question's
    // REAL source standard via parseStandardFromQuestionId(q.id) so
    // practice_answers + practice_results split cleanly by standard.
    standard = {
      standard_id: "sharpen-review",
      standard_description: "Sharpen Up review",
      domain: "Mixed",
      parent_tip: "",
      questions: sharpenDeck.questions.filter((q) => !blockedSet.has(q.id)),
    };
  } else if (typesParam) {
    const types = new Set(typesParam.split(","));
    const filtered = gradeStandards.flatMap((s) =>
      s.questions.filter((q) => types.has(q.type))
    );
    if (filtered.length > 0) {
      standard = {
        standard_id: "mixed",
        standard_description: "Interactive Questions",
        domain: "Mixed",
        parent_tip: "",
        questions: filtered,
      };
    }
  } else {
    // Look up by ID — search all grades since the URL specifies the exact standard
    const found = findStandardById(standardId ?? "");
    if (found) {
      standard = {
        ...found,
        questions: found.questions.filter((q) => !blockedSet.has(q.id)),
      };
    }
  }

  if (!child || !standard) {
    // Kid-app voice instead of dev strings. The "no child" path
    // shouldn't normally reach here — the useEffect above queues a
    // redirect to /practice-hub — but if a stale URL slips through,
    // the kid still sees a friendly explanation, not a sterile
    // "No reader selected."
    return (
      <div className="min-h-[100dvh] bg-white dark:bg-[#0f172a] flex items-center justify-center px-6">
        <div className="max-w-sm text-center space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/ui/bunny-thinking.png"
            alt=""
            className="mx-auto h-24 w-24 object-contain"
          />
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
            {!child
              ? "Pick a reader to start"
              : "This skill isn't ready right now"}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-slate-400">
            {!child
              ? "Head back to the dashboard and tap the reader profile you want to practice with."
              : "Try a different topic from the dashboard."}
          </p>
          <Link
            href="/dashboard"
            className="mt-2 inline-block rounded-full bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PracticeSession
      child={child}
      standard={standard}
      gradeStandards={gradeStandards}
      focusQuestionId={focusQuestionId}
      debugAdaptive={params.get("adaptive") === "1"}
      fromLesson={fromLesson}
    />
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  Practice Session                                       */
/* ═══════════════════════════════════════════════════════ */

function PracticeSession({
  child,
  standard,
  gradeStandards,
  focusQuestionId,
  debugAdaptive,
  fromLesson = false,
}: {
  child: Child;
  standard: Standard;
  gradeStandards: Standard[];
  focusQuestionId?: string | null;
  debugAdaptive?: boolean;
  fromLesson?: boolean;
}) {
  const router = useRouter();
  const { unlockAudio, stop, playUrl, playSequence, playCorrectChime, playIncorrectBuzz, muted } = useAudio();
  const gradeKey = levelNameToGradeKey(child?.reading_level ?? null);

  // Zustand store
  const phase = usePracticeStore((s) => s.phase);
  const currentIdx = usePracticeStore((s) => s.currentIdx);
  const answers = usePracticeStore((s) => s.answers);
  const sessionCarrots = usePracticeStore((s) => s.sessionCarrots);
  const selected = usePracticeStore((s) => s.selected);
  const isCorrect = usePracticeStore((s) => s.isCorrect);
  const feedbackMsg = usePracticeStore((s) => s.feedbackMsg);
  const selectAnswer = usePracticeStore((s) => s.selectAnswer);
  const nextQuestion = usePracticeStore((s) => s.nextQuestion);
  const resetStore = usePracticeStore((s) => s.reset);

  const [saving, setSaving] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [carrotFlash, setCarrotFlash] = useState(false);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [previewedChoice, setPreviewedChoice] = useState<string | null>(null);
  // 2-try MCQ (component-level so the store + scoring semantics stay intact):
  // 1st wrong greys the choice + shows a no-spoiler nudge and stays in
  // "playing"; the question only resolves through the store on a first-try
  // win, a second pick, or a reveal. Only a FIRST-TRY correct answer scores
  // (carrots + answers.correct=true) — matches the /learn lesson forks.
  const [mcqTries, setMcqTries] = useState(0);
  const [greyed, setGreyed] = useState<string[]>([]);
  const [nudge, setNudge] = useState<string | null>(null);
  // Flying-carrot burst on a first-try win (design "launchCarrots").
  const [flyers, setFlyers] = useState<Array<{ key: string; style: React.CSSProperties }>>([]);
  const carrotRef = useRef<HTMLDivElement>(null);
  // Adaptive SENSE layer: one session id per practice sitting + a per-question
  // shown-at timestamp so we can capture response latency. See lib/adaptive.
  const sessionIdRef = useRef<string>(newSessionId());
  const shownAtRef = useRef<number>(Date.now());
  // Adaptive DECIDE layer (Phase 1): read-only brakes/gas classifier. It only
  // observes and decides — nothing acts on it yet, so it changes nothing a
  // child sees. Surfaced in a dev badge when ?adaptive=1.
  const adaptive = useAdaptiveController({
    childId: child?.id ?? null,
    standardId: standard?.standard_id ?? null,
  });
  // Adaptive ACT layer (test integration, gated behind ?adaptive=1). When the
  // engine's reading changes, fire the next intervention and surface it as a
  // coach moment. Only active when debugAdaptive is on, so it never affects a
  // real child until we ship it deliberately.
  const ivHistoryRef = useRef<Intervention[]>([]);
  const [coach, setCoach] = useState<Intervention | null>(null);
  useEffect(() => {
    if (!debugAdaptive) return;
    const r = adaptive.reading;
    if (r.directive === "hold" || r.confidence < 0.4) return;
    const iv = selectIntervention(r, ivHistoryRef.current);
    if (iv.type === "none") return;
    ivHistoryRef.current = [...ivHistoryRef.current, iv];
    setCoach(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adaptive.reading, debugAdaptive]);
  const mysteryBoxMultiplier = usePracticeStore((s) => s.mysteryBoxMultiplier);
  const clearMysteryBoxMultiplier = usePracticeStore((s) => s.clearMysteryBoxMultiplier);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCarrotsRef = useRef(sessionCarrots);

  const staticQuestions = useMemo(() => {
    // Smart-search deep-link: pin the requested question to the front
    // of the session so the kid sees it first. The rest of the slots
    // are filled from a shuffled pool of the remaining questions, so
    // the session still feels varied.
    if (focusQuestionId) {
      const pinned = standard.questions.find((q) => q.id === focusQuestionId);
      const rest = standard.questions.filter((q) => q.id !== focusQuestionId);
      const shuffledRest = shuffleArray(rest);
      const ordered = pinned ? [pinned, ...shuffledRest] : shuffledRest;
      return ordered.slice(0, QUESTIONS_PER_SESSION);
    }
    if (standard.questions.length <= QUESTIONS_PER_SESSION) return standard.questions;
    return shuffleArray(standard.questions).slice(0, QUESTIONS_PER_SESSION);
  }, [standard, focusQuestionId]);

  // ── Adaptive session (flag-gated `?adaptive=1`) ─────────────────────────
  // A real kid (no flag) is completely unaffected — they get staticQuestions.
  // Under the flag we build a DYNAMIC queue: seed with an on-level question,
  // then grow it one item at a time in handleContinue by asking the engine
  // for the next difficulty based on how the kid is doing right now.
  const ADAPTIVE_SESSION_LEN = 8;
  // Lightweight selection view over the bank: id + numeric adaptiveDifficulty.
  // Keeps the real question objects pristine (their `difficulty` is a messy
  // string); selection reads only {id, difficulty:number}.
  const adaptiveSelectPool = useMemo(
    () =>
      standard.questions.map((qq) => {
        const ad = (qq as { adaptiveDifficulty?: number }).adaptiveDifficulty;
        return { id: qq.id, difficulty: typeof ad === "number" ? ad : 50 };
      }),
    [standard],
  );
  const workingDiffRef = useRef(50);
  const seenRef = useRef<Set<string>>(new Set());
  const [adaptiveQueue, setAdaptiveQueue] = useState<typeof standard.questions>([]);

  // Seed the adaptive queue with an on-level question (difficulty ~50).
  useEffect(() => {
    if (!debugAdaptive) {
      setAdaptiveQueue([]);
      return;
    }
    const onLevel = [...adaptiveSelectPool].sort(
      (a, b) => Math.abs(a.difficulty - 50) - Math.abs(b.difficulty - 50),
    )[0];
    const first = onLevel && standard.questions.find((qq) => qq.id === onLevel.id);
    if (first) {
      workingDiffRef.current = onLevel.difficulty;
      seenRef.current = new Set([first.id]);
      setAdaptiveQueue([first]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standard.standard_id, debugAdaptive]);

  const questions = debugAdaptive && adaptiveQueue.length ? adaptiveQueue : staticQuestions;

  // Reset store on mount/standard change
  useEffect(() => {
    resetStore();
    setAudioReady(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standard.standard_id]);

  // Carrot sparkle flash
  useEffect(() => {
    if (sessionCarrots > prevCarrotsRef.current) {
      setCarrotFlash(true);
      const timer = setTimeout(() => setCarrotFlash(false), 600);
      prevCarrotsRef.current = sessionCarrots;
      return () => clearTimeout(timer);
    }
  }, [sessionCarrots]);

  const q = questions[currentIdx];
  const totalQ = debugAdaptive ? ADAPTIVE_SESSION_LEN : questions.length;

  const hasChoiceAudio = useMemo(() => {
    return q.choices_audio_urls?.some(url => url && url.startsWith("https://")) ?? false;
  }, [q.choices_audio_urls]);

  // Also enable two-tap preview when the choices are phoneme strings like "/g/"
  // — we can play them directly from the shared phoneme library.
  const choicesArePhonemes = useMemo(() => {
    return !!q.choices && q.choices.length > 0 && q.choices.every(c => /^\/[a-zA-Z]{1,3}\/$/.test(c));
  }, [q.choices]);

  /** Fired on the hype screen's "Let's go!" press — unlock audio inside the
   *  click gesture so the countdown's blips + the quiz audio can play. */
  const handleUnlock = useCallback(() => {
    void unlockAudio();
  }, [unlockAudio]);

  /** Fired when the GO! flash finishes — reveal the real runner. */
  const handleReveal = useCallback(() => {
    setAudioReady(true);
  }, []);

  // Per-question audio is on for emerging readers (K + 1st), off for
  // 2nd–4th — that age can read the prompt for themselves and the
  // auto-play just adds noise. Per Filip's 2026-05-03 direction.
  const audioGradesEnabled = gradeKey === "kindergarten" || gradeKey === "1st";

  /* ── Play static audio when question loads ── */
  useEffect(() => {
    if (phase !== "playing" || !audioReady) return;
    setPreviewedChoice(null);
    if (!audioGradesEnabled) return;
    // Play question audio from audio_url in JSON (via Howler — AudioContext already unlocked)
    const url = q.audio_url;
    if (url && q.type === "category_sort") {
      // Chain hint audio after question audio for category sort
      const hintUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio/ui/category-sort-hint.mp3`;
      playSequence([{ url }, { delayMs: 400 }, { url: hintUrl }]);
    } else if (url) {
      playUrl(url);
    }
    return () => { stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, phase, audioReady, audioGradesEnabled]);

  /* ── Adaptive SENSE: stamp when each question is shown (for latency) ── */
  useEffect(() => {
    shownAtRef.current = Date.now();
  }, [currentIdx]);

  /* ── Play feedback audio ── */
  useEffect(() => {
    if (phase !== "feedback") return;
    if (isCorrect) {
      // Prefer the per-question praise voice (Autonoe); fall back to a generic clip.
      const praiseUrl = (q as { correct_feedback_audio_url?: string }).correct_feedback_audio_url;
      if (praiseUrl) {
        const t = setTimeout(() => playUrl(praiseUrl), 650);
        return () => clearTimeout(t);
      }
      // Delay so the correct chime finishes before the spoken "That's right!" starts
      const file = CORRECT_AUDIO[Math.floor(Math.random() * CORRECT_AUDIO.length)];
      const correctUrl = getAudioUrl("feedback", file);
      const t = setTimeout(() => playUrl(correctUrl), 700);
      return () => clearTimeout(t);
    } else {
      // Prefer the per-question reveal voice (explains + gives the answer).
      const revealUrl = (q as { reveal_feedback_audio_url?: string }).reveal_feedback_audio_url;
      if (revealUrl) {
        const t = setTimeout(() => playUrl(revealUrl), 250);
        return () => clearTimeout(t);
      }
      const prefixFile = INCORRECT_AUDIO[Math.floor(Math.random() * INCORRECT_AUDIO.length)];
      const prefixUrl = getAudioUrl("feedback", prefixFile);
      // After "Try again!" prefix, chain the correct-answer readback for any
      // question type that has one available.
      let answerUrl: string | null = null;
      if (q.type === "multiple_choice" && q.audio_url) {
        answerUrl = q.audio_url.replace(/\.mp3$/, "-incorrect.mp3");
      } else if (q.type === "missing_word" && q.id) {
        const folder = GRADE_FOLDER[gradeKey] || gradeKey || "kindergarten";
        const standard = q.id.replace(/-Q\d+$/, "");
        answerUrl = `${SUPABASE_STORAGE}/audio/${folder}/${standard}/${q.id}-incorrect.mp3`;
      }
      const encourageFile = ENCOURAGE_AUDIO[Math.floor(Math.random() * ENCOURAGE_AUDIO.length)];
      const encourageUrl = getAudioUrl("feedback", encourageFile);
      if (answerUrl) {
        playSequence([{ url: prefixUrl }, { delayMs: 200 }, { url: answerUrl }, { delayMs: 300 }, { url: encourageUrl }]);
      } else {
        playSequence([{ url: prefixUrl }, { delayMs: 300 }, { url: encourageUrl }]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ── Play word-level audio (for CategorySort / TapToPair / SentenceBuild / SoundMachine tiles) ── */
  const playWordAudio = useCallback((word: string) => {
    const clean = word.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase().replace(/\s+/g, "_");
    if (!clean) return;
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!base) return;
    const folder = clean.length === 1 ? "letters" : "words";
    const url = `${base}/storage/v1/object/public/audio/${folder}/${clean}.mp3`;
    console.log("[playWordAudio]", word, url);
    if (audioManager) audioManager.resumeContextSync();
    playUrl(url, 0);
  }, [playUrl]);

  /* ── Play phoneme audio (for SoundMachine tiles) ── */
  const playPhonemeAudio = useCallback((phoneme: string) => {
    const PHONEME_ID_MAP: Record<string, string> = {
      "/b/": "b", "/k/": "c_hard", "/s/": "s", "/d/": "d", "/f/": "f",
      "/g/": "g", "/h/": "h", "/j/": "j", "/l/": "l", "/m/": "m",
      "/n/": "n", "/p/": "p", "/q/": "q", "/r/": "r", "/t/": "t", "/v/": "v",
      "/w/": "w", "/x/": "x", "/y/": "y", "/z/": "z",
      "/a/": "short_a", "/e/": "short_e", "/i/": "short_i", "/o/": "short_o", "/u/": "short_u",
      "/\u0101/": "long_a", "/\u0113/": "long_e", "/\u012B/": "long_i", "/\u014D/": "long_o", "/\u016B/": "long_u",
      "/ch/": "ch", "/sh/": "sh", "/th/": "th_unvoiced",
      "/ar/": "ar", "/er/": "er", "/or/": "or", "/ear/": "ear",
      "/ow/": "ow", "/oi/": "oi", "/oo/": "oo_long", "/aw/": "aw",
      "/kw/": "q",
    };
    const id = PHONEME_ID_MAP[phoneme];
    if (!id) { console.warn("[playPhonemeAudio] no mapping for", phoneme); return; }
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!base) return;
    const url = `${base}/storage/v1/object/public/audio/phonemes/${id}.mp3`;
    console.log("[playPhonemeAudio] CLICKED", phoneme, "url:", url);
    if (audioManager) audioManager.resumeContextSync();
    playUrl(url, 0);
  }, [playUrl]);

  /* ── Smart item audio: detects /phoneme/ format and routes accordingly ── */
  const playItemSmart = useCallback((item: string) => {
    if (/^\/[a-z]{1,3}\/$/.test(item)) {
      playPhonemeAudio(item);
    } else {
      playWordAudio(item);
    }
  }, [playPhonemeAudio, playWordAudio]);

  /* ── Replay audio ── */
  const handleReplay = useCallback(() => {
    stop();
    const url = q.audio_url;
    if (url) playUrl(url);
  }, [q.audio_url, stop, playUrl]);

  /* ── Adaptive SENSE: record one graded practice interaction ── */
  const recordEvent = useCallback((correct: boolean, chosen: string) => {
    if (!child?.id || !standard?.standard_id) return;
    const latencyMs = Date.now() - shownAtRef.current;
    logLearningEvent({
      childId: child.id,
      standardId: standard.standard_id,
      surface: "practice",
      correct,
      itemId: q?.id ?? null,
      itemType: (q as { type?: string })?.type ?? null,
      hintUsed: showHint,
      latencyMs,
      chosen,
      difficulty: (q as { difficulty?: number })?.difficulty ?? null,
      sessionId: sessionIdRef.current,
    });
    // Feed the brakes/gas brain (read-only — observes, never acts).
    adaptive.observe({ correct, attempts: 1, hintUsed: showHint, latencyMs, surface: "practice" });
  }, [child, standard, q, showHint, adaptive]);

  /* ── Handle answer selection ── */
  const handleAnswer = useCallback((choice: string) => {
    if (selected !== null) return;
    stop();
    const correct = choice === q.correct;
    recordEvent(correct, choice);

    if (correct) {
      const newConsecutive = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutive);
      const daily = getDailyMultiplier(child.streak_days);
      const session = getSessionStreakTier(newConsecutive);
      const carrots = Math.floor(CARROTS_PER_CORRECT * daily.multiplier * session.multiplier * mysteryBoxMultiplier);
      selectAnswer(choice, true, q.id, carrots, CORRECT_MESSAGES, CORRECT_EMOJIS, INCORRECT_MESSAGES);
      playCorrectChime();
    } else {
      setConsecutiveCorrect(0);
      selectAnswer(choice, false, q.id, CARROTS_PER_CORRECT, CORRECT_MESSAGES, CORRECT_EMOJIS, INCORRECT_MESSAGES);
      playIncorrectBuzz();
    }
  }, [selected, q, selectAnswer, stop, playCorrectChime, playIncorrectBuzz, consecutiveCorrect, child.streak_days, mysteryBoxMultiplier, recordEvent]);

  // Reset the 2-try state whenever we move to a new question.
  useEffect(() => {
    setMcqTries(0);
    setGreyed([]);
    setNudge(null);
    setFlyers([]);
  }, [currentIdx]);

  /* ── Flying-carrot burst from the picked choice toward the HUD counter ── */
  const launchCarrots = useCallback((fromRect: DOMRect) => {
    const target = carrotRef.current?.getBoundingClientRect();
    const tx = target ? target.left + target.width / 2 : window.innerWidth - 70;
    const ty = target ? target.top + target.height / 2 : 40;
    const next = Array.from({ length: 6 }, (_, i) => {
      const x = fromRect.left + fromRect.width * (0.25 + 0.5 * Math.random());
      const y = fromRect.top + fromRect.height * (0.2 + 0.6 * Math.random());
      return {
        key: `${Date.now()}-${i}`,
        style: {
          position: "fixed", left: x, top: y, zIndex: 60, pointerEvents: "none",
          ["--tx"]: `${tx - x}px`, ["--ty"]: `${ty - y}px`,
          animation: `flyCarrot .85s cubic-bezier(.5,.05,.55,1) ${i * 75}ms both`,
        } as React.CSSProperties,
      };
    });
    setFlyers(next);
    setTimeout(() => setFlyers([]), 1650);
  }, []);

  /* ── 2-try MCQ pick ──
     1st wrong → grey the choice + no-spoiler nudge, stay in "playing".
     2nd pick (or a correct pick) resolves through the store. Only a
     first-try correct answer earns carrots / records correct=true. */
  const handleMcqPick = useCallback((choice: string, fromRect?: DOMRect) => {
    if (selected !== null || greyed.includes(choice)) return;
    const correct = choice === q.correct;

    if (correct) {
      stop();
      recordEvent(true, choice);
      if (mcqTries === 0) {
        const newConsecutive = consecutiveCorrect + 1;
        setConsecutiveCorrect(newConsecutive);
        const daily = getDailyMultiplier(child.streak_days);
        const session = getSessionStreakTier(newConsecutive);
        const hintFactor = showHint ? 0.5 : 1;
        const carrots = Math.max(1, Math.floor(CARROTS_PER_CORRECT * daily.multiplier * session.multiplier * mysteryBoxMultiplier * hintFactor));
        selectAnswer(choice, true, q.id, carrots, CORRECT_MESSAGES, CORRECT_EMOJIS, INCORRECT_MESSAGES);
        if (fromRect) launchCarrots(fromRect); // carrot burst on a first-try win
      } else {
        // Right on the 2nd try — no first-try credit, but a kind resolve.
        setConsecutiveCorrect(0);
        selectAnswer(choice, false, q.id, 0, SECOND_TRY_MESSAGES, CORRECT_EMOJIS, INCORRECT_MESSAGES);
      }
      playCorrectChime();
      return;
    }

    // Wrong pick.
    if (mcqTries === 0) {
      setMcqTries(1);
      setGreyed([choice]);
      setConsecutiveCorrect(0);
      recordEvent(false, choice);
      const nudgeMsg = (q as { incorrect_feedback?: string }).incorrect_feedback
        || "Not quite — take another look and try again!";
      setNudge(nudgeMsg.replace(/\*\*/g, ""));
      const nudgeUrl = (q as { incorrect_feedback_audio_url?: string }).incorrect_feedback_audio_url;
      if (nudgeUrl) { stop(); playUrl(nudgeUrl); } else { playIncorrectBuzz(); }
    } else {
      // 2nd wrong → reveal via the store (feedback bar shows the answer).
      stop();
      recordEvent(false, choice);
      setGreyed((g) => [...g, choice]);
      selectAnswer(choice, false, q.id, CARROTS_PER_CORRECT, CORRECT_MESSAGES, CORRECT_EMOJIS, INCORRECT_MESSAGES);
      playIncorrectBuzz();
    }
  }, [selected, greyed, q, mcqTries, consecutiveCorrect, showHint, child.streak_days, mysteryBoxMultiplier, selectAnswer, stop, recordEvent, playCorrectChime, playIncorrectBuzz, playUrl, launchCarrots]);

  /* ── Handle sentence build answer ── */
  const handleSentenceBuildAnswer = useCallback((isCorrect: boolean, placedSentence: string, firstTry: boolean = true) => {
    if (selected !== null) return;
    stop();

    if (isCorrect && firstTry) {
      const newConsecutive = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutive);
      const daily = getDailyMultiplier(child.streak_days);
      const session = getSessionStreakTier(newConsecutive);
      const carrots = Math.floor(CARROTS_PER_CORRECT * daily.multiplier * session.multiplier * mysteryBoxMultiplier);
      selectAnswer(placedSentence, true, q.id, carrots, CORRECT_MESSAGES, CORRECT_EMOJIS, INCORRECT_MESSAGES);
      playCorrectChime();
    } else if (isCorrect) {
      // Right on the 2nd try — kind resolve, no first-try credit (mirrors MCQ).
      setConsecutiveCorrect(0);
      selectAnswer(placedSentence, false, q.id, 0, SECOND_TRY_MESSAGES, CORRECT_EMOJIS, INCORRECT_MESSAGES);
      playCorrectChime();
    } else {
      setConsecutiveCorrect(0);
      selectAnswer(placedSentence, false, q.id, CARROTS_PER_CORRECT, CORRECT_MESSAGES, CORRECT_EMOJIS, INCORRECT_MESSAGES);
      playIncorrectBuzz();
    }
  }, [selected, q, selectAnswer, stop, playCorrectChime, playIncorrectBuzz, consecutiveCorrect, child.streak_days, mysteryBoxMultiplier]);

  /* ── Handle category sort answer ── */
  const handleCategorySortAnswer = useCallback((isCorrect: boolean, answer: string, firstTry: boolean = true) => {
    if (selected !== null) return;
    stop();

    if (isCorrect && firstTry) {
      const newConsecutive = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutive);
      const daily = getDailyMultiplier(child.streak_days);
      const session = getSessionStreakTier(newConsecutive);
      const carrots = Math.floor(CARROTS_PER_CORRECT * daily.multiplier * session.multiplier * mysteryBoxMultiplier);
      selectAnswer(answer, true, q.id, carrots, CORRECT_MESSAGES, CORRECT_EMOJIS, INCORRECT_MESSAGES);
      playCorrectChime();
    } else if (isCorrect) {
      // Right on the 2nd try — kind resolve, no first-try credit (mirrors MCQ).
      setConsecutiveCorrect(0);
      selectAnswer(answer, false, q.id, 0, SECOND_TRY_MESSAGES, CORRECT_EMOJIS, INCORRECT_MESSAGES);
      playCorrectChime();
    } else {
      setConsecutiveCorrect(0);
      selectAnswer(answer, false, q.id, CARROTS_PER_CORRECT, CORRECT_MESSAGES, CORRECT_EMOJIS, INCORRECT_MESSAGES);
      playIncorrectBuzz();
    }
  }, [selected, q, selectAnswer, stop, playCorrectChime, playIncorrectBuzz, consecutiveCorrect, child.streak_days, mysteryBoxMultiplier]);

  /* ── Continue to next question ── */
  const handleContinue = useCallback(() => {
    stop(); // kill any feedback voice before moving on
    setShowHint(false);
    // Adaptive mode: grow the queue by asking the engine for the next item at
    // the difficulty the kid's live performance warrants, then advance into it.
    if (debugAdaptive && currentIdx + 1 < totalQ && adaptiveQueue.length <= currentIdx + 1) {
      const { item, workingDifficulty } = selectNextItem(adaptive.reading, adaptiveSelectPool, {
        current: workingDiffRef.current,
        seen: seenRef.current,
      });
      const full = item && standard.questions.find((qq) => qq.id === item.id);
      if (full) {
        workingDiffRef.current = workingDifficulty;
        seenRef.current = new Set([...seenRef.current, full.id]);
        setAdaptiveQueue((qz) => [...qz, full]);
      }
    }
    nextQuestion(totalQ);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [nextQuestion, totalQ, debugAdaptive, currentIdx, adaptiveQueue.length, adaptive.reading, adaptiveSelectPool, standard.questions, stop]);

  // Belt-and-suspenders: always kill audio when the runner unmounts
  // (grades 2-4 skip the read-aloud effect that otherwise stops it).
  useEffect(() => {
    return () => { stop(); };
  }, [stop]);

  /* ── Exit ── */
  const handleExit = useCallback(() => {
    stop();
    resetStore();
    router.push(`/dashboard`);
  }, [router, stop, resetStore]);

  // Clear mystery box multiplier when session completes
  useEffect(() => {
    if (phase === "complete" && mysteryBoxMultiplier > 1) {
      clearMysteryBoxMultiplier();
    }
  }, [phase, mysteryBoxMultiplier, clearMysteryBoxMultiplier]);

  if (phase === "complete") {
    const correctCount = answers.filter((a) => a.correct).length;
    return (
      <CompletionScreen
        child={child}
        standard={standard}
        gradeStandards={gradeStandards}
        answers={answers}
        questions={questions}
        correctCount={correctCount}
        carrotsEarned={sessionCarrots}
        saving={saving}
        setSaving={setSaving}
        onRestart={resetStore}
        fromLesson={fromLesson}
      />
    );
  }

  const { passage, question } = splitPrompt(q.prompt);
  const progressPct = ((currentIdx + (phase === "feedback" ? 1 : 0)) / totalQ) * 100;

  /* ── Pre-quiz hype intro (hype → 3·2·1 → GO!) ── */
  if (!audioReady) {
    const quizTitle = KID_TITLES[standard.standard_id] ?? standard.standard_id;
    return (
      <QuizHypeIntro
        kidName={child.first_name}
        quizName={quizTitle}
        questionCount={totalQ}
        streakDays={child.streak_days}
        carrots={child.carrots}
        soundOn={!muted}
        onLetsGo={handleUnlock}
        onComplete={handleReveal}
        onBack={handleExit}
      />
    );
  }

  return (
    <div ref={scrollRef} className="fixed inset-0 z-50 flex flex-col overflow-y-auto overflow-x-hidden" style={{ background: "linear-gradient(160deg,#e8e0ff 0%,#ffffff 45%,#e0ecff 100%)" }}>
      {/* soft ambient orbs */}
      <div className="pointer-events-none absolute -top-36 -left-32 w-[480px] h-[480px] rounded-full" style={{ background: "radial-gradient(circle,#c7d2fe,transparent 70%)", opacity: 0.55, filter: "blur(60px)" }} />
      <div className="pointer-events-none absolute -bottom-40 -right-36 w-[520px] h-[520px] rounded-full" style={{ background: "radial-gradient(circle,#bae6fd,transparent 70%)", opacity: 0.5, filter: "blur(60px)" }} />
      <style>{`
        @keyframes flyCarrot{0%{transform:translate(0,0) scale(1) rotate(0deg);opacity:1}70%{opacity:1}100%{transform:translate(var(--tx),var(--ty)) scale(.45) rotate(-40deg);opacity:.85}}
        @keyframes rdFlicker{0%,100%{transform:scale(1) rotate(-2deg)}25%{transform:scale(1.12) rotate(2deg)}50%{transform:scale(0.95) rotate(-1deg)}75%{transform:scale(1.08) rotate(1.5deg)}}
        @keyframes rdGlowPulse{0%,100%{box-shadow:0 0 6px 1px rgba(249,115,22,0.35),0 0 0 0 rgba(251,191,36,0)}50%{box-shadow:0 0 14px 4px rgba(249,115,22,0.55),0 0 24px 8px rgba(251,191,36,0.25)}}
        @keyframes rdEmber{0%{transform:translateY(2px) scale(1);opacity:0}20%{opacity:0.9}100%{transform:translateY(-14px) scale(0.3);opacity:0}}
        @keyframes rdIgnite{0%{transform:scale(1)}40%{transform:scale(1.25)}70%{transform:scale(0.95)}100%{transform:scale(1)}}
      `}</style>
      {/* flying carrots (first-try win) */}
      {flyers.map((fl) => (
        <div key={fl.key} style={fl.style}>
          <Carrot className="w-6 h-6 text-orange-500" strokeWidth={2} fill="#fdba74" />
        </div>
      ))}
      {debugAdaptive && <AdaptiveDebugBadge reading={adaptive.reading} />}
      {debugAdaptive && coach && coach.type !== "none" && (
        <motion.div
          key={coach.type + ivHistoryRef.current.length}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed top-3 left-1/2 z-[60] w-[90%] max-w-md -translate-x-1/2 rounded-2xl border p-4 shadow-lg ${
            coach.kind === "gas"
              ? "border-emerald-200 bg-emerald-50"
              : coach.kind === "brakes"
                ? "border-amber-200 bg-amber-50"
                : "border-violet-200 bg-violet-50"
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
            <span>Readee adapts</span>
            <span className="rounded-full bg-white/70 px-2 py-0.5">{coach.kind}</span>
            <button onClick={() => setCoach(null)} className="ml-auto text-zinc-400">✕</button>
          </div>
          <div className="mt-1 font-extrabold text-zinc-800">{coach.title}</div>
          <div className="text-sm text-zinc-600">“{coach.message}”</div>
          <div className="mt-0.5 text-xs text-zinc-400">{coach.rationale}</div>
        </motion.div>
      )}
      {/* ── HUD: exit · progress · count · streak · carrots ── */}
      <div className="relative z-[1] flex items-center gap-2.5 sm:gap-3.5 w-full max-w-[1120px] mx-auto px-4 sm:px-6 pt-4 pb-1.5 flex-shrink-0">
        <button
          onClick={handleExit}
          className="w-11 h-11 rounded-full bg-white/85 border border-zinc-200 flex items-center justify-center flex-shrink-0 hover:bg-white hover:scale-105 active:scale-95 transition"
          aria-label="Exit practice"
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="#71717a" strokeWidth={2.5} strokeLinecap="round" viewBox="0 0 24 24">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="flex-1 min-w-[90px] h-3.5 rounded-full bg-white/70 overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }}
          />
        </div>

        <span className="font-[family-name:var(--font-baloo)] font-bold text-[15px] text-indigo-950 whitespace-nowrap">
          {Math.min(currentIdx + 1, totalQ)} of {totalQ}
        </span>

        {consecutiveCorrect >= 2 && (() => {
          const streakMult = getSessionStreakTier(consecutiveCorrect).multiplier;
          const lit = streakMult > 1; // 2x at 3-in-a-row, 3x at 5-in-a-row
          return lit ? (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              title={`${streakMult}x carrot streak — keep it going!`}
              className="relative hidden sm:flex items-center gap-1.5 rounded-full flex-shrink-0"
              style={{
                padding: "6px 12px 6px 10px",
                background: "linear-gradient(135deg, #f97316, #f59e0b)",
                border: "1px solid #fb923c",
                animation: "rdGlowPulse 1.6s ease-in-out infinite, rdIgnite 0.45s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            >
              {/* rising embers */}
              <span aria-hidden style={{ position: "absolute", top: -2, left: 14, width: 4, height: 4, borderRadius: 9999, background: "#fbbf24", animation: "rdEmber 1.4s ease-out infinite" }} />
              <span aria-hidden style={{ position: "absolute", top: -2, left: 24, width: 3, height: 3, borderRadius: 9999, background: "#fde68a", animation: "rdEmber 1.8s ease-out 0.5s infinite" }} />
              <span aria-hidden style={{ position: "absolute", top: -2, left: 8, width: 3, height: 3, borderRadius: 9999, background: "#fdba74", animation: "rdEmber 1.6s ease-out 0.9s infinite" }} />
              {/* flickering flame */}
              <span style={{ display: "inline-flex", animation: "rdFlicker 0.7s ease-in-out infinite", transformOrigin: "50% 90%" }}>
                <Flame className="w-[18px] h-[18px]" fill="#fef3c7" stroke="#ffffff" strokeWidth={2} />
              </span>
              <span className="text-sm font-extrabold text-white whitespace-nowrap">{consecutiveCorrect} in a row</span>
              <span className="text-[11px] font-extrabold rounded-full px-1.5 py-px" style={{ color: "#9a3412", background: "#fef3c7" }}>{streakMult}x</span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              title="Answer questions in a row to light the streak!"
              className="hidden sm:flex items-center gap-1.5 rounded-full flex-shrink-0"
              style={{ padding: "6px 12px 6px 10px", background: "#e4e4e7", border: "1px solid transparent" }}
            >
              <Flame className="w-[18px] h-[18px]" fill="none" stroke="#a1a1aa" strokeWidth={2} />
              <span className="text-sm font-bold text-zinc-500 tabular-nums">{consecutiveCorrect} in a row</span>
            </motion.div>
          );
        })()}

        <motion.div
          ref={carrotRef}
          className="flex items-center gap-1.5 bg-white/90 border border-zinc-200 px-3.5 py-2 rounded-full flex-shrink-0 shadow-sm"
          animate={carrotFlash ? { scale: [1, 1.35, 1] } : {}}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <Carrot className="w-[18px] h-[18px] text-orange-500" strokeWidth={1.8} />
          <span className="text-base font-extrabold text-orange-600 tabular-nums">{sessionCarrots}</span>
        </motion.div>

        <MuteToggle />
      </div>

      {/* ── Question area ──
          Width: stays narrow (max-w-lg = 512px) up through tablet so
          the kid focuses on one column of content. At lg+ widens to
          max-w-5xl so the 2-col layout below has room to breathe
          without stretching text across the whole viewport. */}
      <motion.div
        className="relative z-[1] flex-1 w-full max-w-[1140px] mx-auto px-4 sm:px-6 pt-3 sm:pt-6 pb-[clamp(116px,15vh,172px)] flex flex-col items-center justify-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        key={currentIdx}
      >
        {/* Sentence build — renders its own prompt/passage */}
        {q.type === "sentence_build" && q.words ? (
          <SentenceBuild
            prompt={question}
            passage={passage}
            words={q.words}
            correctSentence={q.correct}
            sentenceHint={q.sentence_hint}
            sentenceAudioUrl={q.sentence_audio_url}
            questionId={q.id}
            answered={selected !== null}
            twoTries
            onAnswer={handleSentenceBuildAnswer}
            onPlayItem={playWordAudio}
            ordered={(q as any).ordered}
          />
        ) : q.type === "missing_word" && (q as any).sentence_words && (q as any).missing_choices && (q as any).blank_index !== undefined ? (
          <MissingWord
            prompt={question}
            sentenceWords={(q as any).sentence_words}
            blankIndex={(q as any).blank_index}
            choices={(q as any).missing_choices}
            correct={q.correct}
            sentenceHint={(q as any).sentence_hint}
            sentenceAudioUrl={(q as any).sentence_audio_url}
            questionId={q.id}
            answered={selected !== null}
            onAnswer={(isCorrect, choice) => handleSentenceBuildAnswer(isCorrect, choice)}
          />
        ) : q.type === "category_sort" && q.categories && q.category_items && q.items ? (
          <CategorySort
            prompt={question}
            categories={q.categories}
            categoryItems={q.category_items}
            items={q.items}
            answered={selected !== null}
            twoTries
            onAnswer={handleCategorySortAnswer}
            onCorrectPlace={playCorrectChime}
            onIncorrectPlace={playIncorrectBuzz}
            onPlayItem={playWordAudio}
          />
        ) : q.type === "tap_to_pair" && q.left_items && q.right_items && q.correct_pairs ? (
          <TapToPair
            prompt={question}
            leftItems={q.left_items}
            rightItems={q.right_items}
            correctPairs={q.correct_pairs}
            answered={selected !== null}
            onAnswer={(isCorrect, answer) => handleSentenceBuildAnswer(isCorrect, answer)}
            onPlayItem={playItemSmart}
            onCorrectMatch={playCorrectChime}
            onIncorrectMatch={playIncorrectBuzz}
          />
        ) : q.type === "sound_machine" && q.target_word && q.phonemes ? (
          <SoundMachine
            prompt={question}
            targetWord={q.target_word}
            phonemes={q.phonemes}
            distractors={q.distractors}
            imageUrl={(() => {
              const m = q.id.match(/^(.+)-Q\d+$/);
              if (!m) return q.image_url;
              const standardId = m[1];
              // Grade folder must come from the standard ID (e.g. RF.K.2c → kindergarten),
              // NOT from the child's reading level.
              const gradeMatch = standardId.match(/^[A-Z]+\.(K|1|2|3|4)\./);
              const gradeChar = gradeMatch?.[1];
              const folderByStandard: Record<string, string> = {
                K: "kindergarten", "1": "1st-grade", "2": "2nd-grade", "3": "3rd-grade", "4": "4th-grade",
              };
              const folder = (gradeChar && folderByStandard[gradeChar]) || "kindergarten";
              return `${SUPABASE_STORAGE}/images/${folder}/${standardId}/${q.id}.png`;
            })()}
            answered={selected !== null}
            twoTries
            onAnswer={(isCorrect, answer, firstTry) => handleSentenceBuildAnswer(isCorrect, answer, firstTry)}
            onPlayPhoneme={playPhonemeAudio}
            onPlayWord={playWordAudio}
          />
        ) : q.type === "space_insertion" && q.jumbled ? (
          <SpaceInsertion
            prompt={question}
            jumbled={q.jumbled}
            correctSentence={q.correct}
            hint={q.hint}
            questionId={q.id}
            answered={selected !== null}
            twoTries
            onAnswer={(isCorrect, answer, firstTry) => handleSentenceBuildAnswer(isCorrect, answer, firstTry)}
          />
        ) : (
        (() => {
          const imgSrc = q.image_url || questionImageUrl(q.id, gradeKey);
          const Speaker = ({ size }: { size: number }) => (
            <button onClick={handleReplay} aria-label="Read to me" className="rounded-full bg-indigo-700 flex items-center justify-center flex-none transition hover:scale-105 active:scale-90" style={{ width: size, height: size, boxShadow: "0 3px 0 0 #312e81" }}>
              <Volume2 className="text-white" style={{ width: Math.round(size * 0.46), height: Math.round(size * 0.46) }} strokeWidth={2} />
            </button>
          );
          const choicesGrid = (
            <div className="grid gap-3.5 w-full mx-auto" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(260px,100%),1fr))", maxWidth: passage ? undefined : 780 }}>
              {(q.choices ?? []).map((choice, i) => {
                const isSelected = selected === choice;
                const isCorrectChoice = choice === q.correct;
                const answered = selected !== null;
                const isGreyed = greyed.includes(choice);
                const col = DESIGN_CHOICE_COLORS[i % DESIGN_CHOICE_COLORS.length];
                let bg = col.bg, fg = col.fg, border = col.border, chipBg = col.chipBg, chipFg = col.chipFg;
                let opacity = 1, dashed = false, showCheck = false, showX = false, shadow = `0 2px 0 0 ${col.border}`, shake = false, pop = false;
                if (!answered && isGreyed) { bg = "#f4f4f5"; fg = "#a1a1aa"; border = "#d4d4d8"; chipBg = "#e4e4e7"; chipFg = "#a1a1aa"; opacity = 0.55; dashed = true; showX = true; shadow = "none"; }
                else if (!answered && previewedChoice === choice) { shadow = "0 0 0 3px rgba(124,58,237,.4)"; }
                else if (answered) {
                  if (isCorrectChoice) { bg = "#a7f3d0"; fg = "#064e3b"; border = "#10b981"; chipBg = "#6ee7b7"; chipFg = "#065f46"; showCheck = true; shadow = "0 0 0 4px rgba(16,185,129,.25)"; pop = true; }
                  else if (isSelected) { bg = "#fecaca"; fg = "#7f1d1d"; border = "#ef4444"; chipBg = "#fca5a5"; chipFg = "#7f1d1d"; showX = true; shadow = "0 0 0 3px rgba(248,113,113,.35)"; shake = true; }
                  else { opacity = 0.45; shadow = "none"; if (isGreyed) { dashed = true; showX = true; } }
                }
                return (
                  <motion.button
                    key={choice}
                    variants={fadeUp}
                    animate={shake ? { x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.5 } } : pop ? { scale: [1, 1.08, 1], transition: { duration: 0.3 } } : {}}
                    onClick={(e) => {
                      if (answered || isGreyed) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      if (hasChoiceAudio) {
                        if (previewedChoice === choice) { handleMcqPick(choice, rect); }
                        else { setPreviewedChoice(choice); const audioUrl = q.choices_audio_urls?.[i]; if (audioUrl) { stop(); playUrl(audioUrl, 0); } }
                      } else if (choicesArePhonemes) {
                        if (previewedChoice === choice) { handleMcqPick(choice, rect); }
                        else { setPreviewedChoice(choice); playPhonemeAudio(choice); }
                      } else { handleMcqPick(choice, rect); }
                    }}
                    disabled={answered || isGreyed}
                    style={{ border: `2.5px ${dashed ? "dashed" : "solid"} ${border}`, background: bg, boxShadow: shadow, opacity }}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl min-h-[72px] text-left outline-none transition ${answered || isGreyed ? "cursor-default" : "cursor-pointer hover:-translate-y-0.5 active:scale-[0.97]"}`}
                  >
                    <span className="w-9 h-9 rounded-xl flex items-center justify-center font-[family-name:var(--font-baloo)] font-bold text-[17px] flex-none" style={{ background: chipBg, color: chipFg }}>{"ABCD"[i]}</span>
                    <span className="flex-1 font-bold text-[17px] leading-snug" style={{ color: fg }}>{String(choice).replace(/\*\*/g, "")}</span>
                    {showCheck && <CheckIcon className="w-6 h-6 flex-none" stroke="#059669" strokeWidth={3} />}
                    {showX && <XIcon className="w-5 h-5 flex-none" stroke="#a1a1aa" strokeWidth={3} />}
                  </motion.button>
                );
              })}
            </div>
          );
          const nudgeEl = (selected === null && nudge) ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-1 mx-auto max-w-md rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-center">
              <p className="text-sm font-bold text-amber-800">{nudge}</p>
              <p className="mt-0.5 text-xs font-semibold text-amber-600">Try again — you&apos;ve got this!</p>
            </motion.div>
          ) : null;

          if (passage) {
            return (
              <div className="flex flex-wrap gap-6 items-stretch justify-center w-full">
                <div className="flex-[1.05_1_340px] max-w-[560px] bg-white rounded-3xl overflow-hidden border border-zinc-200 shadow-[0_10px_40px_-12px_rgba(49,46,129,.18)] flex flex-col">
                  {imgSrc && <LoadingImage src={imgSrc} fallback={null} className="w-full h-[clamp(180px,34vh,340px)] object-cover" />}
                  <div className="px-5 pt-4 pb-5 flex flex-col gap-2.5 flex-1 justify-center">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold tracking-[0.14em] text-indigo-700">THE STORY</span>
                      <button onClick={handleReplay} className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1 hover:bg-indigo-100 active:scale-95 transition">
                        <Volume2 className="w-3.5 h-3.5 text-indigo-700" strokeWidth={2.2} />
                        <span className="text-[12.5px] font-extrabold text-indigo-700">Read to me</span>
                      </button>
                    </div>
                    <p className="text-[19px] font-semibold leading-[1.7] text-zinc-700 whitespace-pre-line">{passage}</p>
                  </div>
                </div>
                <div className="flex-[1_1_320px] max-w-[520px] flex flex-col gap-3.5 justify-center">
                  <div className="flex items-center gap-3">
                    <Speaker size={46} />
                    <h2 className="font-[family-name:var(--font-baloo)] font-bold text-[clamp(21px,2vw,26px)] leading-tight text-indigo-950">{highlightQuestion(question)}</h2>
                  </div>
                  {choicesGrid}
                  {nudgeEl}
                </div>
              </div>
            );
          }
          // Image-only questions use a big side-by-side split (image left,
          // prompt + choices right) so the picture fills the space instead of
          // floating small in a centered column. Charts / no-image fall back
          // to a centered column.
          if (imgSrc && !q.chart_data) {
            return (
              <div className="flex flex-wrap gap-6 lg:gap-9 items-center justify-center w-full">
                <div className="flex-[1_1_360px] max-w-[600px] flex justify-center">
                  <LoadingImage src={imgSrc} fallback={null} className="w-full max-h-[64vh] object-contain rounded-[24px] border-[3px] border-white shadow-[0_10px_40px_-12px_rgba(49,46,129,.25)]" />
                </div>
                <div className="flex-[1_1_320px] max-w-[520px] flex flex-col gap-3.5 justify-center">
                  <div className="flex items-center gap-3">
                    <Speaker size={48} />
                    <h2 className="font-[family-name:var(--font-baloo)] font-bold text-[clamp(21px,2.2vw,28px)] leading-tight text-indigo-950">{highlightQuestion(question)}</h2>
                  </div>
                  {choicesGrid}
                  {nudgeEl}
                </div>
              </div>
            );
          }
          return (
            <div className="flex flex-col items-center gap-4 sm:gap-5 w-full max-w-[780px]">
              {q.chart_data && <QuestionChart chart={q.chart_data} />}
              <div className="flex items-center gap-3.5 max-w-[720px]">
                <Speaker size={52} />
                <h1 className="font-[family-name:var(--font-baloo)] font-bold text-[clamp(23px,2.6vw,31px)] leading-tight text-indigo-950 text-center">{highlightQuestion(question)}</h1>
              </div>
              {choicesGrid}
              {nudgeEl}
            </div>
          );
        })()
        )}
      </motion.div>

      {/* ── Bunny + speech bubble (fixed, bottom-left) ── */}
      {(() => {
        const fb = phase === "feedback";
        const hintOpen = showHint && !!q.hint && !fb;
        const bunnyState: "idle" | "correct" | "incorrect" | "levelup" = fb
          ? (isCorrect ? (consecutiveCorrect >= 3 ? "levelup" : "correct") : "incorrect")
          : "idle";
        let bubbleText = "";
        let tone = { bg: "#ffffff", border: "#e4e4e7", fg: "#3f3f46" };
        if (fb) {
          const fbf = q as { correct_feedback?: string; reveal_feedback?: string };
          bubbleText = isCorrect
            ? (fbf.correct_feedback ?? feedbackMsg)
            : (fbf.reveal_feedback ?? `${feedbackMsg} The answer is ${String(q.correct).replace(/\*\*/g, "")}.`);
          bubbleText = String(bubbleText).replace(/\*\*/g, "");
          tone = isCorrect
            ? { bg: "#d1fae5", border: "#34d399", fg: "#065f46" }
            : { bg: "#e0e7ff", border: "#a5b4fc", fg: "#3730a3" };
        } else if (hintOpen) {
          bubbleText = String(q.hint ?? "").replace(/\*\*/g, "");
          tone = { bg: "#fffbeb", border: "#fcd34d", fg: "#92400e" };
        }
        return (
          <div className="fixed left-3 sm:left-5 bottom-2 z-[6] flex items-end gap-2.5 pointer-events-none">
            <div className="w-[clamp(132px,15vw,210px)] h-[clamp(143px,16vw,227px)] flex-none relative">
              {bunnyState === "idle"
                ? <Bunny outfitId={child.equipped_items?.outfit ?? null} />
                : <BunnyReaction outfitId={child.equipped_items?.outfit ?? null} state={bunnyState} />}
            </div>
            {bubbleText && (
              <motion.div
                key={bubbleText}
                initial={{ opacity: 0, scale: 0.8, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative max-w-[min(320px,44vw)] px-4 py-3 mb-12 border-2 shadow-[0_10px_30px_-10px_rgba(49,46,129,.25)]"
                style={{ background: tone.bg, borderColor: tone.border, borderRadius: "18px 18px 18px 4px" }}
              >
                <p className="text-[15.5px] font-bold leading-snug" style={{ color: tone.fg }}>{bubbleText}</p>
              </motion.div>
            )}
          </div>
        );
      })()}

      {/* ── Read-aloud + hint dock (fixed, bottom-right) ── */}
      <div className="fixed right-3 sm:right-5 bottom-3 z-[6] flex items-center gap-2.5">
        <button
          onClick={handleReplay}
          className="flex items-center gap-2 bg-white/95 border-[1.5px] border-indigo-200 rounded-full px-4 py-2.5 shadow-[0_4px_14px_-4px_rgba(49,46,129,.2)] hover:-translate-y-0.5 active:scale-95 transition"
        >
          <Volume2 className="w-[19px] h-[19px] text-indigo-700" strokeWidth={2.2} />
          <span className="text-[15px] font-extrabold text-indigo-950">Read to me</span>
        </button>
        {q.hint && (
          <button
            onClick={() => setShowHint(true)}
            disabled={showHint || phase === "feedback"}
            className="flex items-center gap-2 bg-white/95 border-[1.5px] border-amber-300 rounded-full px-4 py-2.5 shadow-[0_4px_14px_-4px_rgba(49,46,129,.2)] disabled:opacity-50 enabled:hover:-translate-y-0.5 enabled:active:scale-95 transition"
          >
            <Lightbulb className="w-[19px] h-[19px] text-amber-600" strokeWidth={2.2} />
            <span className="text-[15px] font-extrabold text-amber-800">{showHint ? "Hint used" : "Hint"}</span>
          </button>
        )}
      </div>

      {/* ── Next button (on feedback) ── */}
      <AnimatePresence>
        {phase === "feedback" && (
          <motion.button
            initial={{ opacity: 0, y: 14, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleContinue}
            className="fixed left-1/2 -translate-x-1/2 bottom-[80px] sm:bottom-[86px] z-[7] flex items-center gap-2.5 px-8 sm:px-10 py-3.5 rounded-full text-white font-[family-name:var(--font-baloo)] font-bold text-xl active:scale-95 transition"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 0 0 #4f46e5,0 10px 30px -8px rgba(79,70,229,.5)" }}
          >
            <span>{currentIdx + 1 >= totalQ ? "Finish" : "Next"}</span>
            <ArrowRight className="w-[22px] h-[22px]" strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  Completion Screen                                      */
/* ═══════════════════════════════════════════════════════ */

function CompletionScreen({
  child,
  standard,
  gradeStandards,
  answers,
  questions,
  correctCount,
  carrotsEarned,
  saving,
  setSaving,
  onRestart,
  fromLesson = false,
}: {
  child: Child;
  standard: Standard;
  gradeStandards: Standard[];
  answers: AnswerRecord[];
  questions: Question[];
  correctCount: number;
  carrotsEarned: number;
  saving: boolean;
  setSaving: (v: boolean) => void;
  onRestart: () => void;
  fromLesson?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const [unlocks, setUnlocks] = useState<UnlockableItem[]>([]);
  const darkMode = useThemeStore((s) => s.darkMode);
  const { playUrl: playCompletionUrl, muted } = useAudio();
  const totalQ = questions.length;
  const stars = getStars(correctCount, totalQ);
  const nextStandard = getNextStandard(standard.standard_id, gradeStandards);
  // Snapshot lifetime carrots before this session lands so the
  // LevelProgressCard has a stable pre-session anchor to diff
  // against carrotsEarned. Won't reflow even after the save effect
  // inserts the practice_results row below.
  const [priorLifetime, setPriorLifetime] = useState<number | null>(null);
  const { lifetimeCarrots, loading: loadingLifetime } = useLifetimeCarrots(
    child.id,
  );
  useEffect(() => {
    if (!loadingLifetime && priorLifetime === null) {
      setPriorLifetime(lifetimeCarrots);
    }
  }, [loadingLifetime, lifetimeCarrots, priorLifetime]);

  // Perfect score → the Seal of Approval owns the FULL screen alone first,
  // then we reveal the lesson summary. Auto-advances once the stamp settles.
  const isPerfect = correctCount === totalQ;
  const [sealPhase, setSealPhase] = useState(isPerfect);
  useEffect(() => {
    if (!sealPhase) return;
    const id = setTimeout(() => setSealPhase(false), 4200);
    return () => clearTimeout(id);
  }, [sealPhase]);

  // Confetti pieces
  const confettiPieces = useMemo(() => {
    if (correctCount < totalQ - 1) return [];
    const count = correctCount === totalQ ? 80 : 50;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      size: 6 + Math.random() * 8,
      color: ["#4ade80", "#6366f1", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#f43f5e"][i % 7],
      xDrift: (Math.random() - 0.5) * 100,
    }));
  }, [correctCount, totalQ]);

  let title: string;
  let subtitle: string;
  let buddyLine: string;
  let glowColor: string;

  if (stars === 3) {
    title = "Perfect Score!";
    subtitle = `You mastered ${standard.standard_id}!`;
    buddyLine = "Your bunny is doing a happy dance!";
    glowColor = "rgba(196,181,253,.55)";
  } else if (stars === 2) {
    title = "Great Work!";
    subtitle = "Almost perfect — keep it up!";
    buddyLine = "Your bunny is so proud of you!";
    glowColor = "rgba(165,180,252,.5)";
  } else if (stars === 1) {
    title = "Good Effort!";
    subtitle = "Practice makes perfect!";
    buddyLine = "Your bunny says: nice hopping!";
    glowColor = "rgba(165,180,252,.45)";
  } else {
    title = "Keep Trying!";
    subtitle = "Let's give it another go!";
    buddyLine = "Your bunny believes in you!";
    glowColor = "rgba(186,230,253,.5)";
  }

  /* ── Play completion audio ──
     Held until the full-screen Seal (+ its jingle) finishes so the praise voice
     doesn't overlap the stamp. Non-perfect scores skip the seal, so `sealPhase`
     is already false and this fires right away on the summary. */
  useEffect(() => {
    if (sealPhase) return;
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    let file: string;
    if (correctCount === totalQ) {
      file = pick(["complete-perfect-1", "complete-perfect-2", "complete-perfect-3"]);
    } else if (correctCount === totalQ - 1) {
      file = pick(["complete-good-1", "complete-good-2", "complete-good-3"]);
    } else if (correctCount === totalQ - 2) {
      file = pick(["complete-ok-1", "complete-ok-2", "complete-ok-3"]);
    } else {
      file = pick(["complete-try-1", "complete-try-2", "complete-try-3"]);
    }
    playCompletionUrl(getAudioUrl("feedback", file));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sealPhase]);

  /* ── Save results ── */
  useEffect(() => {
    if (saved || saving) return;
    setSaving(true);

    async function save() {
      const supabase = supabaseBrowser();

      const payload = safeValidate(PracticeResultSchema, {
        child_id: child.id,
        standard_id: standard.standard_id,
        questions_attempted: totalQ,
        questions_correct: correctCount,
        carrots_earned: carrotsEarned,
      });

      // Sharpen Up sessions span multiple source standards — we recover
      // each question's REAL standard from its id ("RL.K.1-Q3" → "RL.K.1")
      // so practice_results splits cleanly into per-standard rows and
      // weak-spot analytics stay accurate. Single-standard sessions
      // keep the existing one-row-per-session shape.
      const isSharpenSession = standard.standard_id === "sharpen-review";

      if (isSharpenSession) {
        // Group answers by source standard, insert one aggregate row each.
        const byStandard = new Map<string, { attempted: number; correct: number }>();
        questions.forEach((qItem, i) => {
          const a = answers[i];
          if (!a) return;
          const sourceStd = parseStandardFromQuestionId(qItem.id) ?? standard.standard_id;
          const cur = byStandard.get(sourceStd) ?? { attempted: 0, correct: 0 };
          cur.attempted += 1;
          if (a.correct) cur.correct += 1;
          byStandard.set(sourceStd, cur);
        });
        const rows = Array.from(byStandard.entries()).map(([sid, agg]) =>
          safeValidate(PracticeResultSchema, {
            child_id: child.id,
            standard_id: sid,
            questions_attempted: agg.attempted,
            questions_correct: agg.correct,
            // Carrots earned are computed across the whole session, so we
            // attribute them to the standard with the most attempts (the
            // kid worked hardest there). Simpler than proportional split.
            carrots_earned: 0,
          }),
        );
        if (rows.length > 0) {
          const { error } = await supabase.from("practice_results").insert(rows);
          if (error) console.error("[practice] failed to save practice_results:", error);
        }
      } else {
        // Check the error — a silent insert failure here (a rolled-back trigger,
        // RLS, etc.) once broke every practice save app-wide for days unnoticed.
        const { error } = await supabase.from("practice_results").insert(payload);
        if (error) console.error("[practice] failed to save practice_results:", error);
      }

      // Per-question fidelity — every answered question becomes a row in
      // `practice_answers` (one batch insert). Powers the adaptive review
      // / "Sharpen Up" feature without needing a separate write surface.
      // Captured for ALL kids (free + premium) — the signal also feeds
      // content QC + cap tuning.
      try {
        const answerRows = questions
          .map((qItem, i) => {
            const a = answers[i];
            if (!a) return null;
            // For sharpen sessions, tag each answer with its source
            // standard (not the synthetic "sharpen-review" wrapper id)
            // so weak-spot analytics see real per-standard data.
            const taggedStandard = isSharpenSession
              ? parseStandardFromQuestionId(qItem.id) ?? standard.standard_id
              : standard.standard_id;
            return {
              child_id: child.id,
              question_id: qItem.id,
              standard_id: taggedStandard,
              type: qItem.type ?? "mcq",
              was_correct: a.correct,
            };
          })
          .filter((r): r is NonNullable<typeof r> => r !== null);
        if (answerRows.length > 0) {
          await supabase.from("practice_answers").insert(answerRows);
        }
      } catch (err) {
        // Soft-fail: don't block the kid's celebration on analytics.
        console.error("[adaptive] failed to save practice_answers:", err);
      }

      if (carrotsEarned > 0) {
        const { data: current } = await supabase
          .from("children")
          .select("carrots")
          .eq("id", child.id)
          .single();
        if (current) {
          await savedOk("practice:carrots", supabase
            .from("children")
            .update({ carrots: (current.carrots || 0) + carrotsEarned })
            .eq("id", child.id));
        }
      }

      // Check milestone + badge unlocks AFTER the result row is saved so
      // the lifetime-correct + perfect-session counts include this session.
      try {
        const [{ data: rows }, { data: owned }] = await Promise.all([
          supabase
            .from("practice_results")
            .select("questions_correct, questions_attempted")
            .eq("child_id", child.id),
          supabase
            .from("shop_purchases")
            .select("item_id")
            .eq("child_id", child.id),
        ]);
        const totalCorrect =
          rows?.reduce((sum, r) => sum + (r.questions_correct ?? 0), 0) ?? 0;
        const perfectSessions =
          rows?.filter(
            (r) =>
              (r.questions_attempted ?? 0) > 0 &&
              (r.questions_correct ?? 0) === (r.questions_attempted ?? 0),
          ).length ?? 0;
        const ownedIds = new Set((owned ?? []).map((p) => p.item_id));
        const sessionPerfect = correctCount === totalQ && totalQ >= 10;

        const signals = {
          total_correct: totalCorrect,
          streak_days: child.streak_days,
          consecutive_correct: sessionPerfect ? 10 : undefined,
          perfect_sessions: perfectSessions,
        };

        const [outfitRes, badgeRes] = await Promise.all([
          checkMilestones(supabase, child.id, ownedIds, signals),
          checkBadgeMilestones(supabase, child.id, ownedIds, signals),
        ]);
        const queue = mixUnlocks(outfitRes.newlyGranted, badgeRes.newlyGranted);
        if (queue.length > 0) setUnlocks(queue);
      } catch (err) {
        console.error("[unlock] milestone check failed:", err);
      }

      setSaved(true);
      setSaving(false);
    }

    save();
  }, [saved, saving, child.id, standard.standard_id, totalQ, correctCount, carrotsEarned, setSaving]);

  // Perfect-score moment: the stamp, alone, full-screen — then the summary.
  if (sealPhase) {
    return (
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center px-6"
        style={{ background: "linear-gradient(180deg, #eef2ff 0%, #fdf6ff 40%, #e7f4ff 100%)" }}
      >
        <div className="w-full max-w-xl" style={{ height: "min(80vh, 620px)" }}>
          <SealOfApproval ribbonText="PERFECT!" background="transparent" sound={!muted} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(180deg,#ffffff 0%,#eef2ff 130%)" }}>
      <UnlockToast unlocked={unlocks} onDone={() => setUnlocks([])} />

      {/* Confetti (fires at 2-3 stars) */}
      {confettiPieces.map((c) => (
        <motion.div
          key={c.id}
          className="absolute rounded-full pointer-events-none"
          style={{ left: `${c.left}%`, top: -20, width: c.size, height: c.size, backgroundColor: c.color }}
          initial={{ y: -20, x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: "100vh", x: c.xDrift, rotate: 720, opacity: [1, 1, 0] }}
          transition={{ duration: 2.5, delay: c.delay, ease: "easeIn" }}
        />
      ))}

      <motion.div
        className="relative z-10 flex flex-wrap items-center justify-center gap-8 sm:gap-10 w-full max-w-[1040px] px-6 py-6"
        style={{ maxHeight: "100dvh" }}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* ── Character column: the kid's own bunny reacting to the score ── */}
        <motion.div variants={scaleIn} className="flex flex-col items-center min-w-0 basis-[300px] flex-1 max-w-[440px]">
          <div className="relative flex items-center justify-center">
            <div
              className="absolute rounded-full pointer-events-none"
              style={{ width: "clamp(220px,38vh,330px)", height: "clamp(220px,38vh,330px)", background: `radial-gradient(circle, ${glowColor} 0%, rgba(238,242,255,0) 70%)` }}
            />
            <div className="relative" style={{ height: "clamp(180px,36vh,320px)", aspectRatio: "240 / 260" }}>
              <BunnyReaction
                outfitId={child.equipped_items?.outfit ?? null}
                state={stars === 3 ? "levelup" : stars >= 1 ? "correct" : "incorrect"}
              />
            </div>
          </div>
          <motion.div variants={fadeUp} className="mt-1 rounded-full bg-white border border-zinc-200 px-4 py-1.5 text-[13px] font-extrabold text-zinc-600 shadow-sm text-center">
            {buddyLine}
          </motion.div>
        </motion.div>

        {/* ── Stats column ── */}
        <div className="flex flex-col gap-3 min-w-0 basis-[340px] flex-1 max-w-[480px]">
          {/* Stars + title */}
          <motion.div variants={fadeUp} className="text-center">
            <div className="flex items-end justify-center gap-1 mb-1.5">
              {[1, 2, 3].map((s) => (
                <motion.svg
                  key={s}
                  variants={popIn}
                  viewBox="0 0 24 24"
                  width={s === 2 ? 40 : 32}
                  height={s === 2 ? 40 : 32}
                  fill={s <= stars ? "#facc15" : "#d4d4d8"}
                  stroke={s <= stars ? "#eab308" : "#a1a1aa"}
                  strokeWidth="0.5"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </motion.svg>
              ))}
            </div>
            <h1 className="m-0 font-[family-name:var(--font-baloo)] font-extrabold text-[clamp(26px,3.5vw,34px)] leading-tight tracking-tight text-zinc-900">{title}</h1>
            <p className="mt-1 text-[15px] font-semibold text-zinc-500">{subtitle}</p>
          </motion.div>

          {/* Score + carrots + per-question dots */}
          <motion.div variants={fadeUp} className="flex items-center gap-4 sm:gap-5 rounded-2xl bg-white border border-zinc-200 px-4 py-3 shadow-sm">
            <div className="flex-1">
              <div className="font-[family-name:var(--font-baloo)] font-extrabold text-[28px] leading-none text-zinc-900">{correctCount}/{totalQ}</div>
              <div className="mt-0.5 text-[11px] font-bold text-zinc-500">Correct</div>
            </div>
            <div className="w-px self-stretch bg-zinc-200" />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-[family-name:var(--font-baloo)] font-extrabold text-[28px] leading-none text-orange-600">+{carrotsEarned}</span>
                <Carrot className="w-5 h-5 text-orange-500" strokeWidth={2} />
              </div>
              <div className="mt-0.5 text-[11px] font-bold text-zinc-500">Carrots earned</div>
            </div>
            <div className="w-px self-stretch bg-zinc-200" />
            <div className="flex-[1.4] min-w-0">
              <div className="flex flex-wrap gap-1.5">
                {questions.map((qItem, i) => {
                  const ok = answers[i]?.correct;
                  return (
                    <span key={qItem.id} className="inline-flex h-5 w-5 items-center justify-center rounded-full" style={{ background: ok ? "#10b981" : "#f43f5e" }}>
                      <svg viewBox="0 0 24 24" className="h-[11px] w-[11px]" fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d={ok ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                      </svg>
                    </span>
                  );
                })}
              </div>
              <div className="mt-1 text-[11px] font-bold text-zinc-500">Questions</div>
            </div>
          </motion.div>

          {/* Reader-level progress (or level-up celebration + bonus). */}
          {priorLifetime !== null && (
            <motion.div variants={fadeUp}>
              <LevelProgressCard
                priorLifetimeCarrots={priorLifetime}
                sessionCarrots={carrotsEarned}
                childId={child.id}
                outfitId={child.equipped_items?.outfit ?? null}
                href={`/levels?child=${child.id}`}
              />
            </motion.div>
          )}

          {/* Actions */}
          <motion.div variants={fadeUp} className="flex flex-col gap-2">
            {fromLesson && (
              <Link
                href={`/journey?child=${child.id}&completed=${standard.standard_id}`}
                className="block w-full text-center py-3.5 rounded-2xl font-extrabold text-[15px] text-white transition-all active:scale-[0.97]"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 0 0 #4f46e5" }}
              >
                Back to your journey →
              </Link>
            )}
            {(() => {
              const sessionMissRate = totalQ > 0 ? 1 - correctCount / totalQ : 0;
              const showNudge = sessionMissRate >= 0.4 && usePlanStore.getState().plan === "premium";
              if (!showNudge) return null;
              return (
                <Link
                  href={`/practice?child=${child.id}&mode=sharpen`}
                  className="flex w-full items-center justify-center gap-2 py-3 rounded-2xl font-extrabold text-[15px] text-white transition-all active:scale-[0.97]"
                  style={{ background: "linear-gradient(90deg, #8b5cf6, #6d28d9)", boxShadow: "0 4px 0 0 #5b21b6" }}
                >
                  <Sparkles className="w-[17px] h-[17px]" strokeWidth={2} />
                  Sharpen up on what tripped you
                </Link>
              );
            })()}

            {!fromLesson && nextStandard && (
              <Link
                href={`/practice?child=${child.id}&standard=${nextStandard.standard_id}`}
                className="block w-full text-center py-3 rounded-2xl font-extrabold text-[15px] text-emerald-900 transition-all active:scale-[0.97]"
                style={{ background: "linear-gradient(90deg, #4ade80, #22c55e)", boxShadow: "0 4px 0 0 #16a34a" }}
              >
                Next Standard →
              </Link>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={onRestart}
                className="flex-1 py-2.5 rounded-2xl border-2 border-zinc-300 text-zinc-900 font-bold text-sm transition-all hover:bg-zinc-100 active:scale-[0.97]"
              >
                Practice Again
              </button>
              <Link
                href="/dashboard"
                className="flex-1 text-center py-2.5 rounded-2xl text-zinc-500 font-bold text-[13px] transition-colors hover:text-zinc-900"
              >
                Back to Dashboard
              </Link>
            </div>
          </motion.div>

          {saving && (
            <p className="text-center text-xs text-zinc-500 animate-pulse">Saving results...</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
