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
  displayDelay?: number;       // ms delay before showing displayText
  displayParts?: DisplayPart[]; // staggered text reveals within one step
  feedbackDelay?: number;      // ms delay before showing ✓/✗ after both parts visible
  checkmarkDelay?: number;     // ms delay before showing ✓ on displayText pill (after text visible)
  checkmarkTriggerDelay?: number;   // when this step's text appears, trigger ALL checkmarks after this base delay
  checkmarkTriggerStagger?: number; // ms between each checkmark (default 400)
  highlightPills?: HighlightPill[]; // schedule per-pill bounce during this step's audio
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

// Colorful pill backgrounds — bold, high-contrast for kids
const PILL_COLORS = [
  "bg-blue-500 text-white",
  "bg-green-500 text-white",
  "bg-orange-500 text-white",
  "bg-pink-500 text-white",
  "bg-purple-500 text-white",
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
  const [showNext, setShowNext] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingStep, setPlayingStep] = useState(-1);
  const [highlightedPill, setHighlightedPill] = useState(-1);
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

      if (!isMuted && audioManager) {
        const audioUrl = `${SUPABASE_STORAGE}/${step.audioFile}`;
        audioManager.play(audioUrl)
          .then(() => { advance(); })
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
    setPlayingStep(-1);
    setHighlightedPill(-1);
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
    steps.forEach((step, i) => {
      if (step.displayText) allTexts.add(i);
      step.displayParts?.forEach((_, p) => allParts.add(`${i}-${p}`));
    });
    setTextsVisible(allTexts);
    setPartsVisible(allParts);
    setIsPlaying(false);
    setPlayingStep(-1);
    setHighlightedPill(-1);
    setShowNext(true);
  }, [steps, clearTimer]);

  const imageUrl = slide?.imageFile ? `${SUPABASE_STORAGE}/${slide.imageFile}` : "";

  /* ─── Render helpers ─── */

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
                {part.text}
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
                {part.text}
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
                ? { opacity: 1, scale: 1.1, y: [0, -5, 0] }
                : { opacity: 1, scale: 1, y: 0 }
              }
              transition={isBouncing
                ? { scale: { duration: 0.3 }, y: { duration: 1.2, repeat: Infinity, ease: "easeInOut" } }
                : { type: "spring", stiffness: 400, damping: 15 }
              }
              className={`rounded-full px-5 py-2 text-xl font-bold text-center shadow-sm ${PILL_COLORS[p % PILL_COLORS.length]}`}
            >
              {part.text}
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

  // When a step with checkmarkTriggerDelay becomes visible, schedule ALL checkmarks in order
  useEffect(() => {
    steps.forEach((step, i) => {
      if (step.checkmarkTriggerDelay === undefined || !textsVisible.has(i)) return;
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
  }, [textsVisible, steps]);

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
        {step.displayText}
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
          <div className="flex-shrink-0 flex justify-center px-6 pt-1">
            <LoadingImage
              src={imageUrl}
              className={`w-full h-full object-cover ${isPracticeIntro ? "max-h-[45vh]" : "max-h-[38vh]"}`}
              containerClassName={`rounded-2xl overflow-hidden shadow-lg ${isPracticeIntro ? "max-h-[45vh]" : "max-h-[38vh]"}`}
            />
          </div>

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
            <div className={`w-full max-w-sm flex flex-col items-center gap-3 ${theme.contentBg}`}>
              {steps.map((step, i) => {
                if (step.displayParts && step.displayParts.length > 0) {
                  return renderParts(step, i);
                }
                return renderText(step, i);
              })}
            </div>
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
