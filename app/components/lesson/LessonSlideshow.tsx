"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { audioManager } from "@/lib/audio/audio-manager";
import { LoadingImage } from "@/app/components/ui/LoadingImage";
import { useAudioStore } from "@/lib/stores/audio-store";
import { Volume2, ChevronRight, Rocket, SkipForward } from "lucide-react";
import { Fredoka } from "next/font/google";

const fredoka = Fredoka({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

/* ─── Types ──────────────────────────────────────────── */

interface DisplayPart {
  text: string;
  delay: number; // ms from step start
}

interface HighlightPill {
  pill: number;  // index of pill to bounce
  delay: number; // ms from step start
}

interface Step {
  sub: string;
  audioFile: string;
  ttsScript: string;
  displayText: string;
  displayStyle?: "pill" | "passage"; // "passage" renders as a quote card instead of a pill
  displayDelay?: number;       // ms delay before showing displayText
  displayParts?: DisplayPart[]; // staggered text reveals within one step
  feedbackDelay?: number;      // ms delay before showing ✓/✗ after both parts visible
  checkmarkDelay?: number;     // ms delay before showing ✓ on displayText pill (after text visible)
  checkmarkTriggerDelay?: number;   // when this step's text appears, trigger ALL checkmarks after this base delay
  checkmarkTriggerStagger?: number; // ms between each checkmark (default 400)
  highlightPills?: HighlightPill[]; // schedule per-pill bounce during this step's audio
  highlightWord?: { word: string; delay: number }; // underline a word in a visible passage after delay
  sfxClaps?: Array<{ delay: number }>; // schedule clap sound effects at ms offsets from step start
  afterPhonemes?: string[]; // phoneme IDs (e.g. "s", "short_u") to play in sequence AFTER the step TTS finishes
  phonemeLetterIndices?: number[]; // which displayDiagram letter each afterPhoneme corresponds to; defaults to [0,1,2,...]
  displayDiagram?: {
    // Letter row with optional "start"/"end" labels above tagged letters
    letters: Array<{ text: string; role?: "start" | "end" }>;
    delay: number;
    // If set, only the first N letters render filled — the rest render as faint placeholders.
    // Lets multiple steps share one identical diagram row that fills in over time.
    revealCount?: number;
  };
  displayDiagramSwap?: {
    // Letter row that morphs one tile in place (e.g. CAT → BAT)
    letters: string[];     // initial letters, e.g. ["C","A","T"]
    swapAt: number;        // index of the tile that will change
    toLetter: string;      // what it morphs into
    delay: number;         // ms before the diagram first appears (original word)
    swapDelay: number;     // ms before the swap animation triggers
  };
  displayAlphabetGrid?: {
    // 26 tappable letter tiles. Tap plays letter name + phoneme.
    delay: number;
  };
  imageFile?: string; // per-step image override — swaps the slide image while this step is playing
  displayTableRow?: {
    label: string;
    value: string;
    example?: string;
    exampleDelay?: number; // ms after row appears before example column shows
    tableHeaders?: string[]; // column titles (only on first row, 2 or 3 items)
  };
  interaction: string;
}

interface TeachingSlide {
  slide: number;
  type: "intro" | "teach" | "example" | "tip" | "practice-intro";
  steps: Step[];
  heading: string;
  imagePrompt: string;
  imageFile: string;
}

export interface SampleLesson {
  standardId: string;
  grade: string;
  domain: string;
  title: string;
  slides: Array<TeachingSlide | { slide: number; type: "mcq"; mcqId: string }>;
}

interface LessonSlideshowProps {
  lesson: SampleLesson;
  onComplete: () => void;
  devMode?: boolean;
}

/* ─── Constants ──────────────────────────────────────── */

const SUPABASE_STORAGE = "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public";

// Soft pastel pill backgrounds — clean, educational feel
const PILL_COLORS = [
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
];

const SLIDE_THEMES: Record<string, {
  bg: string;
  text: string;
  cardText: string;
  qaBg: string;
  storyBg: string;
  contentBg: string;
}> = {
  intro: {
    bg: "bg-gray-50 dark:bg-[#0f172a]",
    text: "text-indigo-600 dark:text-indigo-400",
    cardText: "text-indigo-700 dark:text-indigo-300",
    qaBg: "",
    storyBg: "",
    contentBg: "",
  },
  teach: {
    bg: "bg-gray-50 dark:bg-[#0f172a]",
    text: "text-violet-600 dark:text-violet-400",
    cardText: "text-violet-700 dark:text-violet-300",
    qaBg: "",
    storyBg: "",
    contentBg: "bg-blue-50/60 dark:bg-blue-950/20 rounded-xl p-3",
  },
  example: {
    bg: "bg-gray-50 dark:bg-[#0f172a]",
    text: "text-emerald-600 dark:text-emerald-400",
    cardText: "text-emerald-700 dark:text-emerald-300",
    qaBg: "",
    storyBg: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700",
    contentBg: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm p-4",
  },
  tip: {
    bg: "bg-gray-50 dark:bg-[#0f172a]",
    text: "text-amber-600 dark:text-amber-400",
    cardText: "text-amber-700 dark:text-amber-300",
    qaBg: "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800",
    storyBg: "",
    contentBg: "bg-amber-50/60 dark:bg-amber-950/20 rounded-xl p-3",
  },
  "practice-intro": {
    bg: "bg-gray-50 dark:bg-[#0f172a]",
    text: "text-indigo-600 dark:text-indigo-400",
    cardText: "text-indigo-700 dark:text-indigo-300",
    qaBg: "",
    storyBg: "",
    contentBg: "",
  },
};

// Shared reveal animation
const revealVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

/* ─── Component ──────────────────────────────────────── */

export function LessonSlideshow({ lesson, onComplete, devMode }: LessonSlideshowProps) {
  const isMuted = useAudioStore((s) => s.isMuted);

  const teachingSlides = useMemo(
    () => lesson.slides.filter((s): s is TeachingSlide => s.type !== "mcq"),
    [lesson.slides]
  );

  const [currentSlide, setCurrentSlide] = useState(0);
  const [stepsRevealed, setStepsRevealed] = useState(0);
  const [textsVisible, setTextsVisible] = useState<Set<number>>(new Set());
  const [partsVisible, setPartsVisible] = useState<Set<string>>(new Set());
  const [examplesVisible, setExamplesVisible] = useState<Set<number>>(new Set());
  const [showNext, setShowNext] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingStep, setPlayingStep] = useState(-1);
  const [highlightedPill, setHighlightedPill] = useState(-1);
  const [highlightedWord, setHighlightedWord] = useState<string | null>(null);
  const [activePhoneme, setActivePhoneme] = useState<{ stepIdx: number; letterIdx: number } | null>(null);
  const [swapTriggered, setSwapTriggered] = useState<Set<number>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const runIdRef = useRef(0);
  const scheduledFeedbackRef = useRef<Set<string>>(new Set());

  const slide = teachingSlides[currentSlide];
  const steps = slide?.steps ?? [];
  const totalSlides = teachingSlides.length;
  const isLastSlide = currentSlide === totalSlides - 1;
  const theme = SLIDE_THEMES[slide?.type] ?? SLIDE_THEMES.intro;
  const isPracticeIntro = slide?.type === "practice-intro";
  const isExample = slide?.type === "example";
  const isTip = slide?.type === "tip";

  const confetti = useMemo(() => {
    if (!isPracticeIntro) return [];
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      size: 6 + Math.random() * 8,
      color: ["#4ade80", "#6366f1", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#f43f5e"][i % 7],
      xDrift: (Math.random() - 0.5) * 120,
    }));
  }, [isPracticeIntro]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    textTimersRef.current.forEach(clearTimeout);
    textTimersRef.current = [];
  }, []);

  const scheduleStep = useCallback(
    (stepIdx: number, runId: number, slideSteps: Step[]) => {
      if (stepIdx >= slideSteps.length) {
        setIsPlaying(false);
        setPlayingStep(-1);
        setHighlightedPill(-1);
        setShowNext(true);
        return;
      }

      const step = slideSteps[stepIdx];
      setStepsRevealed(stepIdx + 1);
      setIsPlaying(true);
      setPlayingStep(stepIdx);

      // Clear previous highlight unless this step has its own schedule
      if (!step.highlightPills) {
        setHighlightedPill(-1);
      }

      // Schedule per-pill highlights
      if (step.highlightPills) {
        for (const hp of step.highlightPills) {
          if (hp.delay === 0) {
            setHighlightedPill(hp.pill);
          } else {
            const t = setTimeout(() => {
              if (runIdRef.current !== runId) return;
              setHighlightedPill(hp.pill);
            }, hp.delay);
            textTimersRef.current.push(t);
          }
        }
      }

      // Schedule clap SFX bursts
      if (step.sfxClaps) {
        for (const c of step.sfxClaps) {
          const t = setTimeout(() => {
            if (runIdRef.current !== runId) return;
            audioManager?.playClap();
          }, c.delay);
          textTimersRef.current.push(t);
        }
      }

      // Schedule word highlight (underline) in a visible passage
      if (step.highlightWord) {
        const hw = step.highlightWord;
        const t = setTimeout(() => {
          if (runIdRef.current !== runId) return;
          setHighlightedWord(hw.word);
        }, hw.delay);
        textTimersRef.current.push(t);
      }

      if (step.displayText) {
        const delay = step.displayDelay ?? 0;
        if (delay > 0) {
          const t = setTimeout(() => {
            if (runIdRef.current !== runId) return;
            setTextsVisible((prev) => new Set(prev).add(stepIdx));
          }, delay);
          textTimersRef.current.push(t);
        } else {
          setTextsVisible((prev) => new Set(prev).add(stepIdx));
        }
      }

      // Schedule diagram reveal — reuses textsVisible as the visibility gate
      if (step.displayDiagram) {
        const delay = step.displayDiagram.delay ?? 0;
        if (delay > 0) {
          const t = setTimeout(() => {
            if (runIdRef.current !== runId) return;
            setTextsVisible((prev) => new Set(prev).add(stepIdx));
          }, delay);
          textTimersRef.current.push(t);
        } else {
          setTextsVisible((prev) => new Set(prev).add(stepIdx));
        }
      }

      // Schedule alphabet-grid reveal
      if (step.displayAlphabetGrid) {
        const delay = step.displayAlphabetGrid.delay ?? 0;
        if (delay > 0) {
          const t = setTimeout(() => {
            if (runIdRef.current !== runId) return;
            setTextsVisible((prev) => new Set(prev).add(stepIdx));
          }, delay);
          textTimersRef.current.push(t);
        } else {
          setTextsVisible((prev) => new Set(prev).add(stepIdx));
        }
      }

      // Schedule swap-diagram appearance + delayed in-place letter morph
      if (step.displayDiagramSwap) {
        const showAt = step.displayDiagramSwap.delay ?? 0;
        const swapAt = step.displayDiagramSwap.swapDelay ?? showAt + 1500;
        if (showAt > 0) {
          const t1 = setTimeout(() => {
            if (runIdRef.current !== runId) return;
            setTextsVisible((prev) => new Set(prev).add(stepIdx));
          }, showAt);
          textTimersRef.current.push(t1);
        } else {
          setTextsVisible((prev) => new Set(prev).add(stepIdx));
        }
        const t2 = setTimeout(() => {
          if (runIdRef.current !== runId) return;
          setSwapTriggered((prev) => new Set(prev).add(stepIdx));
        }, swapAt);
        textTimersRef.current.push(t2);
      }

      // Schedule table example column reveal
      if (step.displayTableRow?.example) {
        const rowDelay = step.displayDelay ?? 0;
        const exDelay = rowDelay + (step.displayTableRow.exampleDelay ?? 0);
        if (exDelay > 0) {
          const t = setTimeout(() => {
            if (runIdRef.current !== runId) return;
            setExamplesVisible((prev) => new Set(prev).add(stepIdx));
          }, exDelay);
          textTimersRef.current.push(t);
        } else {
          setExamplesVisible((prev) => new Set(prev).add(stepIdx));
        }
      }

      if (step.displayParts) {
        for (let p = 0; p < step.displayParts.length; p++) {
          const part = step.displayParts[p];
          const t = setTimeout(() => {
            if (runIdRef.current !== runId) return;
            setPartsVisible((prev) => new Set(prev).add(`${stepIdx}-${p}`));
          }, part.delay);
          textTimersRef.current.push(t);
        }
      }

      const advance = () => {
        if (runIdRef.current !== runId) return;
        scheduleStep(stepIdx + 1, runId, slideSteps);
      };

      const playPhonemesThenAdvance = async () => {
        if (step.afterPhonemes && audioManager) {
          const letterMap = step.phonemeLetterIndices ?? step.afterPhonemes.map((_, i) => i);
          for (let p = 0; p < step.afterPhonemes.length; p++) {
            if (runIdRef.current !== runId) return;
            const letterIdx = letterMap[p] ?? p;
            setActivePhoneme({ stepIdx, letterIdx });
            await audioManager.playOneshot(`${SUPABASE_STORAGE}/audio/phonemes/${step.afterPhonemes[p]}.mp3`);
          }
          if (runIdRef.current === runId) setActivePhoneme(null);
        }
        advance();
      };

      if (!isMuted && audioManager) {
        const audioUrl = `${SUPABASE_STORAGE}/${step.audioFile}`;
        audioManager.play(audioUrl)
          .then(() => { playPhonemesThenAdvance(); })
          .catch(() => {
            const wordCount = step.ttsScript.split(/\s+/).length;
            timerRef.current = setTimeout(advance, Math.max(wordCount * 460, 2500));
          });
      } else {
        const wordCount = step.ttsScript.split(/\s+/).length;
        timerRef.current = setTimeout(advance, Math.max(wordCount * 460, 2500));
      }
    },
    [isMuted]
  );

  useEffect(() => {
    clearTimer();
    if (audioManager) audioManager.stop();
    const runId = ++runIdRef.current;
    setStepsRevealed(0);
    setTextsVisible(new Set());
    setExamplesVisible(new Set());
    setPlayingStep(-1);
    setHighlightedPill(-1);
    setHighlightedWord(null);
    setActivePhoneme(null);
    setSwapTriggered(new Set());
    setPartsVisible(new Set());
    setShowNext(false);
    setIsPlaying(false);
    scheduledFeedbackRef.current = new Set();
    timerRef.current = setTimeout(() => {
      if (runIdRef.current !== runId) return;
      scheduleStep(0, runId, steps);
    }, 700);
    return () => { clearTimer(); if (audioManager) audioManager.stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide]);

  const handleNext = useCallback(() => {
    runIdRef.current++;
    clearTimer();
    if (audioManager) audioManager.stop();
    if (isLastSlide) { onComplete(); } else { setCurrentSlide((s) => s + 1); }
  }, [isLastSlide, onComplete, clearTimer]);

  const handleSkip = useCallback(() => {
    runIdRef.current++;
    clearTimer();
    if (audioManager) audioManager.stop();
    setStepsRevealed(steps.length);
    const allTexts = new Set<number>();
    const allParts = new Set<string>();
    const allExamples = new Set<number>();
    steps.forEach((step, i) => {
      if (step.displayText) allTexts.add(i);
      if (step.displayDiagram) allTexts.add(i);
      if (step.displayDiagramSwap) allTexts.add(i);
      if (step.displayAlphabetGrid) allTexts.add(i);
      step.displayParts?.forEach((_, p) => allParts.add(`${i}-${p}`));
      if (step.displayTableRow?.example) allExamples.add(i);
    });
    const allSwaps = new Set<number>();
    steps.forEach((step, i) => { if (step.displayDiagramSwap) allSwaps.add(i); });
    setSwapTriggered(allSwaps);
    setTextsVisible(allTexts);
    setPartsVisible(allParts);
    setExamplesVisible(allExamples);
    setIsPlaying(false);
    setPlayingStep(-1);
    setHighlightedPill(-1);
    setShowNext(true);
  }, [steps, clearTimer]);

  // Per-step image override: when the currently-playing step has its own imageFile,
  // swap to it so the visual advances with the audio.
  const activeStepImage = playingStep >= 0 ? steps[playingStep]?.imageFile : undefined;
  const effectiveImageFile = activeStepImage ?? slide?.imageFile;
  const imageUrl = effectiveImageFile ? `${SUPABASE_STORAGE}/${effectiveImageFile}` : "";

  // Preload every per-step image as soon as the slide mounts so transitions
  // between beats don't flash the LoadingImage skeleton.
  useEffect(() => {
    const urls = new Set<string>();
    steps.forEach((s) => {
      if (s.imageFile) urls.add(`${SUPABASE_STORAGE}/${s.imageFile}`);
    });
    urls.forEach((u) => {
      const img = new Image();
      img.src = u;
    });
  }, [steps]);

  /* ─── Render helpers ─── */

  const highlightCaps = (text: string, cls = "text-rose-600 dark:text-rose-400 font-extrabold") =>
    text.split(/(\s+)/).map((seg, si) =>
      /^[A-Z]{2,}[!?.,]?$/.test(seg)
        ? <span key={si} className={cls}>{seg}</span>
        : <span key={si}>{seg}</span>
    );

  const getFeedback = (step: Step) => {
    const int = step.interaction?.toLowerCase() ?? "";
    const isPositive = int.includes("checkmark") || int.includes("highlights") || (int.includes("celebration") && !int.includes("stars"));
    const isNegative = int.includes("red x") || int.includes("don't match");
    if (isPositive) return "positive" as const;
    if (isNegative) return "negative" as const;
    return null;
  };

  const renderParts = (step: Step, i: number) => {
    const hasVisible = step.displayParts!.some((_, p) => partsVisible.has(`${i}-${p}`));
    if (!hasVisible) return null;

    const parts = step.displayParts!;
    const isPair = parts.length === 2;
    const isQA = isPair && parts[0].text.endsWith("?");

    // ── Q&A pair: [Who?]  Max the dog! ──
    if (isPair && isQA) {
      const qVisible = partsVisible.has(`${i}-0`);
      const aVisible = partsVisible.has(`${i}-1`);
      if (!qVisible) return null;

      // Pick pill color based on position among Q&A steps
      const qaPillColor = PILL_COLORS[i % PILL_COLORS.length];
      const feedback = getFeedback(step);
      const showCheck = aVisible && feedback === "positive";

      return (
        <motion.div
          key={`${currentSlide}-${step.sub}`}
          variants={revealVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="grid w-full items-center gap-x-3"
          style={{ gridTemplateColumns: "6.5rem 1fr 1.5rem" }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={`rounded-full py-2 text-lg font-bold shadow-sm text-center ${qaPillColor}`}
          >
            {parts[0].text}
          </motion.span>
          <span className="text-xl font-semibold text-zinc-700 dark:text-zinc-200 min-h-[2.5rem] flex items-center">
            {aVisible && (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                {parts[1].text}
              </motion.span>
            )}
          </span>
          <span className="flex items-center justify-center">
            {showCheck && (
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.15 }}
                className="text-xl text-green-500"
              >
                ✓
              </motion.span>
            )}
          </span>
        </motion.div>
      );
    }

    // ── Numbered pair: [①] Beginning ──
    if (isPair && /^\d+\.$/.test(parts[0].text.trim())) {
      const aVisible = partsVisible.has(`${i}-1`);
      const num = parts[0].text.replace(".", "");
      const pillColor = PILL_COLORS[i % PILL_COLORS.length];

      return (
        <motion.div
          key={`${currentSlide}-${step.sub}`}
          variants={revealVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="grid w-full items-center gap-x-3"
          style={{ gridTemplateColumns: "2.5rem 1fr" }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center text-lg font-bold shadow-sm"
          >
            {num}
          </motion.span>
          <span className="min-h-[2.5rem] flex items-center">
            {aVisible && (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={`rounded-full px-6 py-2 text-xl font-bold shadow-sm ${pillColor}`}
              >
                {parts[1].text}
              </motion.span>
            )}
          </span>
        </motion.div>
      );
    }

    // ── Word pair: side-by-side colorful pills (Cat + Hat) ──
    if (isPair && !isQA && !parts[0].text.includes(" ") && !parts[1].text.includes(" ")) {
      const bothVisible = partsVisible.has(`${i}-0`) && partsVisible.has(`${i}-1`);
      const feedback = getFeedback(step);
      // Delay feedback reveal until audio confirms (use feedbackDelay from data, default 3s after second word)
      const feedbackDelayMs = step.feedbackDelay ?? 3000;
      const feedbackKey = `${i}-feedback`;
      const showFeedback = bothVisible && feedback !== null && partsVisible.has(feedbackKey);

      // Schedule feedback reveal once when both words are visible
      if (bothVisible && feedback !== null && !partsVisible.has(feedbackKey) && !scheduledFeedbackRef.current.has(feedbackKey)) {
        scheduledFeedbackRef.current.add(feedbackKey);
        const runId = runIdRef.current;
        const t = setTimeout(() => {
          if (runIdRef.current !== runId) return;
          setPartsVisible((prev) => new Set(prev).add(feedbackKey));
        }, feedbackDelayMs);
        textTimersRef.current.push(t);
      }

      const ringClass = showFeedback
        ? feedback === "positive"
          ? "ring-2 ring-green-400 ring-offset-2"
          : "ring-2 ring-red-400 ring-offset-2"
        : "";

      return (
        <div key={`${currentSlide}-${step.sub}`} className="flex flex-wrap items-center justify-center gap-4">
          {parts.map((part, p) => {
            if (!partsVisible.has(`${i}-${p}`)) return null;
            return (
              <motion.span
                key={`${currentSlide}-${step.sub}-${p}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={`rounded-full px-5 sm:px-8 py-2 sm:py-3 text-lg sm:text-2xl font-bold text-center shadow-sm ${PILL_COLORS[p % PILL_COLORS.length]} ${showFeedback ? ringClass : ""}`}
              >
                {highlightCaps(part.text)}
              </motion.span>
            );
          })}
          {showFeedback && (
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className={`text-2xl ${feedback === "positive" ? "text-green-500" : "text-red-500"}`}
            >
              {feedback === "positive" ? "✓" : "✗"}
            </motion.span>
          )}
        </div>
      );
    }

    // ── Labeled pair: [First] Built a nest ✓ ──
    if (isPair && !isQA && parts[0].text.length <= 8 && !parts[0].text.includes(" ") && parts[1].text.includes(" ")) {
      const qVisible = partsVisible.has(`${i}-0`);
      const aVisible = partsVisible.has(`${i}-1`);
      if (!qVisible) return null;

      const pillColor = PILL_COLORS[i % PILL_COLORS.length];
      const feedback = getFeedback(step);
      const showCheck = aVisible && feedback === "positive";

      return (
        <motion.div
          key={`${currentSlide}-${step.sub}`}
          variants={revealVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="grid w-full items-center gap-x-3"
          style={{ gridTemplateColumns: "5.5rem 1fr 1.5rem" }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={`rounded-full py-2 text-lg font-bold shadow-sm text-center ${pillColor}`}
          >
            {parts[0].text}
          </motion.span>
          <span className="text-xl font-semibold text-zinc-700 dark:text-zinc-200 min-h-[2.5rem] flex items-center">
            {aVisible && (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                {parts[1].text}
              </motion.span>
            )}
          </span>
          <span className="flex items-center justify-center">
            {showCheck && (
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.15 }}
                className="text-xl text-green-500"
              >
                ✓
              </motion.span>
            )}
          </span>
        </motion.div>
      );
    }

    // ── Story text pair: stacked lines in a light card (example slides) ──
    if (isPair && !isQA) {
      const wrapClass = isExample
        ? "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-5 py-3"
        : "";
      return (
        <motion.div
          key={`${currentSlide}-${step.sub}`}
          variants={revealVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`text-center ${wrapClass}`}
        >
          {parts.map((part, p) => {
            if (!partsVisible.has(`${i}-${p}`)) return null;
            return (
              <motion.p
                key={`${currentSlide}-${step.sub}-${p}`}
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`text-xl font-semibold leading-relaxed ${
                  isExample ? "text-zinc-700 dark:text-zinc-200" : theme.cardText
                }`}
              >
                {highlightCaps(part.text)}
              </motion.p>
            );
          })}
        </motion.div>
      );
    }

    // ── 3+ items: colorful horizontal pills ──
    return (
      <div key={`${currentSlide}-${step.sub}`} className="flex flex-wrap items-center justify-center gap-3">
        {parts.map((part, p) => {
          if (!partsVisible.has(`${i}-${p}`)) return null;
          const isBouncing = highlightedPill === p;
          return (
            <motion.span
              key={`${currentSlide}-${step.sub}-${p}-${isBouncing}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isBouncing
                ? { opacity: 1, scale: [1, 1.06, 1], y: 0 }
                : { opacity: 1, scale: 1, y: 0 }
              }
              transition={isBouncing
                ? { scale: { duration: 1.4, repeat: Infinity, ease: "easeInOut" } }
                : { type: "spring", stiffness: 400, damping: 15 }
              }
              className={`rounded-full px-5 py-2 text-xl font-bold text-center shadow-sm ${PILL_COLORS[p % PILL_COLORS.length]}`}
            >
              {highlightCaps(part.text)}
            </motion.span>
          );
        })}
      </div>
    );
  };

  // Track which pill color to assign to each single-text step
  const stepPillIndex = useMemo(() => {
    let idx = 0;
    const map: Record<number, number> = {};
    steps.forEach((step, i) => {
      if (step.displayText && !step.displayParts) {
        map[i] = idx++;
      }
    });
    return map;
  }, [steps]);

  // When a step with checkmarkTriggerDelay becomes visible OR starts playing, schedule ALL checkmarks in order
  useEffect(() => {
    steps.forEach((step, i) => {
      if (step.checkmarkTriggerDelay === undefined || (!textsVisible.has(i) && playingStep !== i)) return;
      const triggerKey = `trigger-${i}`;
      if (scheduledFeedbackRef.current.has(triggerKey)) return;
      scheduledFeedbackRef.current.add(triggerKey);

      const baseDelay = step.checkmarkTriggerDelay;
      const stagger = step.checkmarkTriggerStagger ?? 400;
      const runId = runIdRef.current;

      // Collect all displayText steps with positive feedback, in order
      const targets = steps
        .map((s, idx) => ({ s, idx }))
        .filter(({ s }) => s.displayText && getFeedback(s) === "positive");

      targets.forEach(({ idx }, order) => {
        const checkKey = `${idx}-check`;
        const t = setTimeout(() => {
          if (runIdRef.current !== runId) return;
          setPartsVisible((prev) => new Set(prev).add(checkKey));
        }, baseDelay + order * stagger);
        textTimersRef.current.push(t);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textsVisible, steps, playingStep]);

  const renderDiagram = (step: Step, i: number) => {
    if (!textsVisible.has(i) || !step.displayDiagram) return null;

    // Only the LATEST visible step with a displayDiagram renders. Earlier
    // diagrams (regardless of letter sequence) are replaced by the latest one.
    for (let j = i + 1; j < steps.length; j++) {
      if (steps[j]?.displayDiagram && textsVisible.has(j)) return null;
    }

    const currentTexts = step.displayDiagram.letters.map((l) => l.text).join("|");
    const letters = step.displayDiagram.letters.map((l) => ({ ...l }));
    let revealCount = step.displayDiagram.revealCount ?? letters.length;

    // Merge roles + max revealCount from EARLIER visible steps that share the same letter sequence
    // (so a progressive reveal across siblings keeps the highest count without restarting).
    for (let j = 0; j < i; j++) {
      const prev = steps[j];
      if (prev?.displayDiagram && textsVisible.has(j)) {
        const prevTexts = prev.displayDiagram.letters.map((l) => l.text).join("|");
        if (prevTexts === currentTexts) {
          prev.displayDiagram.letters.forEach((l, li) => {
            if (l.role && !letters[li].role) letters[li].role = l.role;
          });
          const prevCount = prev.displayDiagram.revealCount ?? letters.length;
          if (prevCount > revealCount) revealCount = prevCount;
        }
      }
    }
    return (
      <motion.div
        key={`${currentSlide}-${step.sub}-diagram`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="w-full flex items-end justify-center gap-3 sm:gap-4"
      >
        {letters.map((l, li) => {
          const isStart = l.role === "start";
          const isEnd = l.role === "end";
          const isActive = activePhoneme?.stepIdx === i && activePhoneme?.letterIdx === li;
          const isRevealed = li < revealCount;
          const tileColor = !isRevealed
            ? "bg-zinc-50 text-zinc-300 border-2 border-dashed border-zinc-200 dark:bg-slate-900/40 dark:text-slate-600 dark:border-slate-700"
            : isActive
            ? "bg-violet-100 text-violet-700 ring-4 ring-violet-500 dark:bg-violet-900/40 dark:text-violet-200"
            : isStart
            ? "bg-blue-100 text-blue-700 ring-4 ring-blue-400 dark:bg-blue-900/40 dark:text-blue-200"
            : isEnd
            ? "bg-amber-100 text-amber-700 ring-4 ring-amber-400 dark:bg-amber-900/40 dark:text-amber-200"
            : "bg-zinc-100 text-zinc-500 dark:bg-slate-800 dark:text-slate-400";
          const labelColor = isStart
            ? "text-blue-600 dark:text-blue-300"
            : "text-amber-600 dark:text-amber-300";
          return (
            <div key={li} className="flex flex-col items-center gap-1">
              {(isStart || isEnd) ? (
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 20 }}
                  className={`text-xs sm:text-sm font-bold uppercase tracking-wide ${labelColor}`}
                >
                  {isStart ? "Start" : "End"}
                </motion.span>
              ) : (
                <span className="text-xs sm:text-sm font-bold opacity-0">·</span>
              )}
              <motion.span
                initial={{ opacity: 0, scale: 0.6 }}
                animate={isActive ? { opacity: 1, scale: [1, 1.15, 1] } : { opacity: 1, scale: 1 }}
                transition={isActive
                  ? { scale: { duration: 0.5, ease: "easeOut" } }
                  : { type: "spring", stiffness: 500, damping: 18, delay: li * 0.05 }
                }
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-extrabold shadow-sm transition-colors ${tileColor}`}
              >
                {l.text}
              </motion.span>
            </div>
          );
        })}
      </motion.div>
    );
  };

  const ALPHABET_PHONEME_MAP: Record<string, string> = {
    A: "short_a", B: "b", C: "c_hard", D: "d", E: "short_e", F: "f",
    G: "g", H: "h", I: "short_i", J: "j", K: "k", L: "l", M: "m",
    N: "n", O: "short_o", P: "p", Q: "q", R: "r", S: "s", T: "t",
    U: "short_u", V: "v", W: "w", X: "x", Y: "y", Z: "z",
  };
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const playLetterThenPhoneme = useCallback(async (letter: string) => {
    if (!audioManager) return;
    const lower = letter.toLowerCase();
    const phonemeId = ALPHABET_PHONEME_MAP[letter.toUpperCase()];
    audioManager.stop();
    await audioManager.playOneshot(`${SUPABASE_STORAGE}/audio/letters/${lower}.mp3`);
    if (phonemeId) {
      await audioManager.playOneshot(`${SUPABASE_STORAGE}/audio/phonemes/${phonemeId}.mp3`);
    }
  }, []);

  const renderAlphabetGrid = (step: Step, i: number) => {
    if (!textsVisible.has(i) || !step.displayAlphabetGrid) return null;
    return (
      <motion.div
        key={`${currentSlide}-${step.sub}-grid`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="grid grid-cols-6 sm:grid-cols-7 gap-2 sm:gap-3 w-full max-w-md mx-auto"
      >
        {ALPHABET.map((letter, idx) => (
          <motion.button
            key={letter}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 18, delay: idx * 0.02 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => playLetterThenPhoneme(letter)}
            className="aspect-square rounded-xl flex items-center justify-center text-xl sm:text-2xl font-extrabold shadow-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:bg-indigo-200 transition-colors dark:bg-indigo-900/40 dark:text-indigo-200 dark:hover:bg-indigo-900/60"
            aria-label={`Letter ${letter}`}
          >
            {letter}
          </motion.button>
        ))}
      </motion.div>
    );
  };

  const renderDiagramSwap = (step: Step, i: number) => {
    if (!textsVisible.has(i) || !step.displayDiagramSwap) return null;
    const { letters, swapAt, toLetter } = step.displayDiagramSwap;
    const swapped = swapTriggered.has(i);
    return (
      <motion.div
        key={`${currentSlide}-${step.sub}-swap`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="w-full flex items-center justify-center gap-3 sm:gap-4"
      >
        {letters.map((baseLetter, li) => {
          const isSwapTile = li === swapAt;
          const currentLetter = isSwapTile && swapped ? toLetter : baseLetter;
          const tileColor = isSwapTile && swapped
            ? "bg-violet-100 text-violet-700 ring-4 ring-violet-500 dark:bg-violet-900/40 dark:text-violet-200"
            : "bg-zinc-100 text-zinc-600 dark:bg-slate-800 dark:text-slate-400";
          return (
            <motion.div
              key={li}
              animate={isSwapTile && swapped ? { scale: [1, 1.18, 1] } : { scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-sm overflow-hidden ${tileColor}`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={currentLetter}
                  initial={{ opacity: 0, rotateX: -90 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  exit={{ opacity: 0, rotateX: 90 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl font-extrabold"
                  style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
                >
                  {currentLetter}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  const renderText = (step: Step, i: number) => {
    if (!textsVisible.has(i) || !step.displayText) return null;

    const pillIdx = stepPillIndex[i] ?? 0;
    const pillColor = PILL_COLORS[pillIdx % PILL_COLORS.length];
    const feedback = getFeedback(step);

    // Checkmark visible if scheduled via checkmarkTrigger or checkmarkDelay, or immediate
    const checkKey = `${i}-check`;
    const hasDelayedCheck = step.checkmarkDelay !== undefined || steps.some(s => s.checkmarkTriggerDelay !== undefined);
    const showCheck = hasDelayedCheck
      ? feedback === "positive" && partsVisible.has(checkKey)
      : feedback === "positive";

    // Individual checkmarkDelay (fallback if no trigger on another step)
    if (step.checkmarkDelay && step.checkmarkDelay > 0 && feedback === "positive" && !partsVisible.has(checkKey) && !scheduledFeedbackRef.current.has(checkKey)) {
      scheduledFeedbackRef.current.add(checkKey);
      const runId = runIdRef.current;
      const t = setTimeout(() => {
        if (runIdRef.current !== runId) return;
        setPartsVisible((prev) => new Set(prev).add(checkKey));
      }, step.checkmarkDelay!);
      textTimersRef.current.push(t);
    }

    // Passage style — compact quote card for full sentences
    if (step.displayStyle === "passage") {
      const text = step.displayText!;
      const renderPassageText = () => {
        if (!highlightedWord) return <>&ldquo;{text}&rdquo;</>;
        const regex = new RegExp(`(${highlightedWord})`, "i");
        const segments = text.split(regex);
        return (
          <>
            &ldquo;
            {segments.map((seg, si) =>
              regex.test(seg) ? (
                <span key={si} className="underline decoration-2 decoration-indigo-500 underline-offset-4">{seg}</span>
              ) : (
                <span key={si}>{seg}</span>
              )
            )}
            &rdquo;
          </>
        );
      };
      return (
        <motion.div
          key={`${currentSlide}-${step.sub}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="w-full rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800 px-5 py-4 text-center"
        >
          <p className="text-lg sm:text-xl font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line">
            {renderPassageText()}
          </p>
        </motion.div>
      );
    }

    const pill = (
      <motion.span
        key={`${currentSlide}-${step.sub}`}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className={`rounded-full ${isPracticeIntro ? "px-5 sm:px-7 py-2 sm:py-3 text-lg sm:text-2xl" : "px-5 sm:px-7 py-2 sm:py-3 text-lg sm:text-2xl"} font-bold text-center shadow-sm ${pillColor} ${
          showCheck ? "ring-2 ring-green-400 ring-offset-2" : ""
        }`}
      >
        {step.displayText.split(/(\s+)/).map((seg, si) =>
          /^[A-Z]{2,}[!?.,]?$/.test(seg) ? (
            <span key={si} className="text-blue-700 dark:text-blue-300 font-extrabold">{seg}</span>
          ) : (
            <span key={si}>{seg}</span>
          )
        )}
      </motion.span>
    );

    if (showCheck) {
      return (
        <div key={`${currentSlide}-${step.sub}-wrap`} className="flex items-center justify-center gap-2">
          {pill}
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.15 }}
            className="text-2xl text-green-500"
          >
            ✓
          </motion.span>
        </div>
      );
    }

    return pill;
  };

  /* ─── JSX ─── */

  return (
    <div
      className={`fixed inset-x-0 top-16 md:top-20 bottom-0 ${theme.bg} flex flex-col ${fredoka.className} overflow-hidden z-40`}
    >
      {/* ── Confetti ── */}
      {isPracticeIntro && confetti.map((c) => (
        <motion.div
          key={c.id}
          className="absolute rounded-full pointer-events-none z-50"
          style={{ left: `${c.left}%`, top: -20, width: c.size, height: c.size, backgroundColor: c.color }}
          initial={{ y: -20, x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: "100vh", x: c.xDrift, rotate: 720, opacity: [1, 1, 0] }}
          transition={{ duration: 2.5, delay: c.delay, ease: "easeIn" }}
        />
      ))}

      {/* ── Progress bar ── */}
      <div className="flex-shrink-0 px-6 pt-2 pb-1">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 tabular-nums min-w-[24px] text-right">
            {currentSlide + 1}/{totalSlides}
          </span>
          {isPlaying && (
            <button
              onClick={handleSkip}
              className="ml-1 text-[11px] font-semibold text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
              aria-label="Skip audio"
            >
              Skip <SkipForward className="w-3 h-3 inline -mt-px" />
            </button>
          )}
          {devMode && !isPlaying && (
            <button
              onClick={handleSkip}
              className="ml-1 w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              aria-label="Skip slide"
            >
              <SkipForward className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* ── Slide ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="flex-1 flex flex-col min-h-0"
        >
          {/* ── Image ── */}
          {(() => {
            const visibleContent = steps.filter((s, i) =>
              (textsVisible.has(i) && s.displayText) ||
              (s.displayParts && s.displayParts.some((_, p) => partsVisible.has(`${i}-${p}`))) ||
              (textsVisible.has(i) && s.displayTableRow)
            ).length;
            const imgH = isPracticeIntro ? "max-h-[45vh]" : visibleContent >= 3 ? "max-h-[25vh]" : "max-h-[38vh]";
            return (
              <div className="flex-shrink-0 flex justify-center px-6 pt-1">
                <LoadingImage
                  src={imageUrl}
                  className={`w-full h-full object-cover ${imgH}`}
                  containerClassName={`rounded-2xl overflow-hidden shadow-lg ${imgH}`}
                />
              </div>
            );
          })()}

          {/* ── Heading + speaker ── */}
          <div className="flex-shrink-0 px-6 pt-1 pb-0 flex items-center justify-center gap-2">
            {slide.heading && (
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                className={`font-bold text-center tracking-wide leading-snug ${theme.text} ${
                  textsVisible.size > 0 || partsVisible.size > 0 ? "text-xl" : "text-3xl"
                }`}
              >
                {slide.heading}
              </motion.h1>
            )}
            {isPlaying && !isMuted && (
              <motion.div
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                className="flex-shrink-0"
              >
                <Volume2 className={`w-5 h-5 ${theme.text} opacity-60`} strokeWidth={2.5} />
              </motion.div>
            )}
          </div>

          {/* ── Content ── */}
          <div className="flex-1 min-h-0 overflow-hidden flex items-center justify-center px-6">
            {(() => {
              const hasContent = steps.some(
                (s) => s.displayText || (s.displayParts && s.displayParts.length > 0) || s.displayTableRow || s.displayDiagram || s.displayDiagramSwap || s.displayAlphabetGrid
              );
              const bgClass = hasContent ? theme.contentBg : "";
              return (
            <div className={`w-full ${steps.some((s) => s.displayTableRow) ? "max-w-lg" : "max-w-sm"} flex flex-col items-center gap-3 ${bgClass}`}>
              {(() => {
                const hasTable = steps.some((s) => s.displayTableRow);
                let tableRendered = false;
                return steps.map((step, i) => {
                  if (step.displayTableRow) {
                    if (tableRendered) return null;
                    tableRendered = true;
                    // Collect all table rows
                    const tableSteps = steps
                      .map((s, idx) => (s.displayTableRow ? { step: s, idx } : null))
                      .filter(Boolean) as { step: Step; idx: number }[];
                    const anyVisible = tableSteps.some((ts) => textsVisible.has(ts.idx));
                    const hasExamples = tableSteps.some((ts) => ts.step.displayTableRow?.example);
                    const headers = tableSteps.find((ts) => ts.step.displayTableRow?.tableHeaders)?.step.displayTableRow?.tableHeaders;
                    // Show headers immediately when slide loads if headers exist, even before rows
                    if (!anyVisible && !headers) return null;
                    const cols3 = "8.5rem 1fr 1fr";
                    const cols2 = "8.5rem 1fr";
                    const gridCols = hasExamples ? cols3 : cols2;
                    return (
                      <div key={`${currentSlide}-table`} className="w-full space-y-4">
                        {/* Header row */}
                        {headers && (
                          <div
                            className="grid items-center gap-x-4 pb-2 border-b-2 border-indigo-200 dark:border-indigo-700"
                            style={{ gridTemplateColumns: gridCols }}
                          >
                            {headers.map((h, hi) => (
                              <span key={hi} className="text-sm font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 text-center">
                                {h}
                              </span>
                            ))}
                          </div>
                        )}
                        {tableSteps.map((ts) => {
                          const visible = textsVisible.has(ts.idx);
                          if (!visible) return null;
                          const row = ts.step.displayTableRow!;
                          const colorIdx = tableSteps.indexOf(ts);
                          const exampleShown = examplesVisible.has(ts.idx);
                          const checkKey = `${ts.idx}-check`;
                          const rowHighlighted = partsVisible.has(checkKey);
                          return (
                            <motion.div
                              key={`${currentSlide}-table-${ts.idx}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                scale: rowHighlighted ? [1, 1.03, 1] : 1,
                              }}
                              transition={{ type: "spring", stiffness: 400, damping: 20 }}
                              className={`grid items-center gap-x-4 rounded-xl px-2 py-1 transition-colors duration-500 ${
                                rowHighlighted ? "bg-emerald-50 dark:bg-emerald-950/20 ring-2 ring-emerald-300 dark:ring-emerald-700" : ""
                              }`}
                              style={{ gridTemplateColumns: gridCols }}
                            >
                              <span
                                className={`rounded-xl py-3 text-lg font-bold shadow-sm text-center ${PILL_COLORS[colorIdx % PILL_COLORS.length]}`}
                              >
                                {row.label}
                                {rowHighlighted && (
                                  <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                    className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-xs"
                                  >
                                    ✓
                                  </motion.span>
                                )}
                              </span>
                              <span className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 text-center">
                                {row.value.split(/(\s+)/).map((seg, si) =>
                                  /^[A-Z]{2,}$/.test(seg) ? (
                                    <span key={si} className="text-indigo-600 dark:text-indigo-400 font-extrabold">{seg}</span>
                                  ) : (
                                    <span key={si}>{seg}</span>
                                  )
                                )}
                              </span>
                              {hasExamples && (
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: exampleShown ? 1 : 0 }}
                                  transition={{ duration: 0.4 }}
                                  className="text-base text-zinc-500 dark:text-zinc-400 italic text-center"
                                >
                                  {row.example ?? ""}
                                </motion.span>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    );
                  }
                  if (step.displayAlphabetGrid) {
                    return renderAlphabetGrid(step, i);
                  }
                  if (step.displayDiagramSwap) {
                    return renderDiagramSwap(step, i);
                  }
                  if (step.displayDiagram) {
                    return renderDiagram(step, i);
                  }
                  if (!hasTable && step.displayParts && step.displayParts.length > 0) {
                    return renderParts(step, i);
                  }
                  if (!step.displayTableRow) {
                    return renderText(step, i);
                  }
                  return null;
                });
              })()}
            </div>
              );
            })()}
          </div>

          {/* ── Next button (always visible, disabled during audio) ── */}
          <div className="flex-shrink-0 px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="max-w-xs mx-auto"
            >
              <button
                onClick={showNext ? handleNext : undefined}
                disabled={!showNext}
                className={`relative w-full py-3.5 rounded-2xl font-extrabold text-xl text-white flex items-center justify-center gap-2 transition-all duration-300 ${
                  showNext
                    ? "active:scale-95"
                    : "opacity-50 pointer-events-none"
                }`}
                style={{
                  background: showNext
                    ? isLastSlide
                      ? "linear-gradient(135deg, #10b981, #059669)"
                      : "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : undefined,
                  boxShadow: showNext
                    ? isLastSlide
                      ? "0 4px 0 0 #047857"
                      : "0 4px 0 0 #4f46e5"
                    : "0 4px 0 0 rgba(0,0,0,0.1)",
                }}
              >
                {!showNext && (
                  <span className="absolute inset-0 rounded-2xl bg-gray-300 dark:bg-slate-600" />
                )}
                {showNext && (
                  <motion.span
                    className="absolute inset-0 rounded-2xl"
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(99,102,241,0)",
                        "0 0 0 10px rgba(99,102,241,0.12)",
                        "0 0 0 0 rgba(99,102,241,0)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {isLastSlide ? (
                    <>
                      <Rocket className="w-5 h-5" />
                      Let&apos;s Go!
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </span>
              </button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
