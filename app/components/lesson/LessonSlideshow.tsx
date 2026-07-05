"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X as XIcon } from "lucide-react";
import { audioManager } from "@/lib/audio/audio-manager";
import { LoadingImage } from "@/app/components/ui/LoadingImage";
import { InteractiveExample } from "./InteractiveExample";
import { InteractiveMatch } from "./InteractiveMatch";
import { Bunny, BunnyReaction } from "@/app/_components/Bunny/Bunny";
import { useAudioStore } from "@/lib/stores/audio-store";
import { Volume2, ChevronRight, Rocket, SkipForward, RotateCcw } from "lucide-react";
import { Fredoka } from "next/font/google";
import {
  LessonShellDesktop,
  CelebrationContent,
  CelebrationLeftPanel,
} from "./LessonShellDesktop";
import { LessonShellMobile } from "./LessonShellMobile";

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
  /** Substring to color violet inside displayText — e.g. set "ai"
   *  on a "rain" pill to highlight the vowel team the kid should
   *  focus on. Case-insensitive. Only affects the mobile hero card. */
  displayHighlight?: string;
  /** ms to wait AFTER the previous step's audio ends and BEFORE this
   *  step's audio fires. Use to give the kid breathing room between
   *  beats — e.g. when step b shows 3 example pills, set preStepDelay
   *  on step c so the kid has time to read them before the transition
   *  audio kicks in. Ignored on the first step of a slide. */
  preStepDelay?: number;
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
  type: "intro" | "teach" | "example" | "tip" | "interactive" | "practice-intro";
  steps: Step[];
  heading: string;
  imagePrompt: string;
  imageFile: string;
  /** The "fork in the road" — a scaffolded interactive beat that sits
   *  between the tip and the practice MCQs. The kid taps the answer
   *  (coach mode: right→affirmation, wrong→encouragement + hint + retry,
   *  never scored). The question audio is the slide's single `step`; the
   *  two feedback clips play on tap from the fields below. `anchor` is an
   *  optional reinforcing pill (e.g. "tele = far"). */
  interactive?: {
    /** Interaction style — skill-matched. "tap" = pick one (comprehension);
     *  "match" = pair items (roots/prefixes/vowel-teams). fill-blank/order/
     *  sort reuse the existing practice renderers for other skills. */
    kind?: "tap" | "match" | "fill-blank" | "order" | "sort";
    anchor?: string;
    prompt: string;
    hint: string;
    // tap
    choices?: string[];
    correct?: string;
    // match (tap_to_pair)
    leftItems?: string[];
    rightItems?: string[];
    correctPairs?: Record<string, string>;
    // shared coaching audio
    correctAudio?: string;
    wrongAudio?: string;
    correctScript?: string;
    wrongScript?: string;
  };
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
  /**
   * Fires whenever the visible teaching slide changes. Used by the
   * audit page to keep its inline rating panel pinned to the slide
   * currently on screen, so the reviewer doesn't have to wait for
   * the lesson to finish before recording feedback.
   */
  onSlideChange?: (slideNum: number) => void;
  /**
   * Layout chrome.
   *   - "centered" (default) — legacy narrow-column layout.
   *   - "desktop-shell" — Claude-Design split-screen. Auto-swaps to
   *      mobile shell when viewport <1024px (the live runner picks
   *      this).
   *   - "mobile-shell" — forces the mobile shell regardless of
   *      viewport. Used by the audit page so reviewers can preview
   *      the mobile layout from a laptop.
   */
  chrome?: "centered" | "desktop-shell" | "mobile-shell";
  /** The kid's equipped bunny outfit (from the shop) — worn by the coach
   *  bunny on the interactive fork. Defaults to Classic when absent (e.g.
   *  the owner audit page, which has no child context). */
  outfitId?: string | null;
  /** Audit/screenshot mode — reveal ALL of each slide's content
   *  immediately (skip the karaoke timing) so a static screenshot shows
   *  the finished slide, not a half-drawn frame. Demo-render only. */
  auditMode?: boolean;
}

/* ─── Constants ──────────────────────────────────────── */

const SUPABASE_STORAGE = "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public";

// Soft pastel pill backgrounds — clean, educational feel
const PILL_COLORS = [
  "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
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
    text: "text-violet-600 dark:text-violet-400",
    cardText: "text-violet-700 dark:text-violet-300",
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
    // Dropped the blue-50/60 backdrop — it stacked under blue-tinted
    // pills + table headers and created the "cheesy color-on-color"
    // look Filip flagged. Pills now carry the color; container is
    // neutral and lets the content breathe.
    contentBg: "",
  },
  example: {
    bg: "bg-gray-50 dark:bg-[#0f172a]",
    text: "text-emerald-600 dark:text-emerald-400",
    cardText: "text-emerald-700 dark:text-emerald-300",
    qaBg: "",
    // Example slides keep the white card — it's a real "passage
    // anchor" container (defines the story-text region), not a
    // tinted backdrop. Mobile-first padding via responsive class.
    storyBg: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700",
    contentBg: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm p-2 sm:p-4",
  },
  tip: {
    bg: "bg-gray-50 dark:bg-[#0f172a]",
    text: "text-amber-600 dark:text-amber-400",
    cardText: "text-amber-700 dark:text-amber-300",
    qaBg: "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800",
    storyBg: "",
    // Dropped amber-on-amber double-tint (anchor pill bg-amber-100
    // sitting on a bg-amber-50/60 container looked templated).
    contentBg: "",
  },
  "practice-intro": {
    bg: "bg-gray-50 dark:bg-[#0f172a]",
    text: "text-violet-600 dark:text-violet-400",
    cardText: "text-violet-700 dark:text-violet-300",
    qaBg: "",
    storyBg: "",
    contentBg: "",
  },
  // The fork — emerald accent (the "you try it" moment, kin to the
  // example's emerald but its own beat).
  interactive: {
    bg: "bg-gray-50 dark:bg-[#0f172a]",
    text: "text-emerald-600 dark:text-emerald-400",
    cardText: "text-emerald-700 dark:text-emerald-300",
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

export function LessonSlideshow({ lesson, onComplete, devMode, onSlideChange, chrome = "centered", outfitId = null, auditMode = false }: LessonSlideshowProps) {
  const isMuted = useAudioStore((s) => s.isMuted);

  // Shell-mode viewport detection — 75% of usage is phone. When the
  // caller opts into "desktop-shell" but the viewport is phone-sized
  // (<1024px), swap to LessonShellMobile. "mobile-shell" forces the
  // mobile layout regardless of viewport (audit-page preview button).
  // Avoid SSR/hydration mismatch by starting null and updating on
  // mount; the shell branch renders nothing until we know.
  const [isPhoneShell, setIsPhoneShell] = useState<boolean | null>(null);
  useEffect(() => {
    if (chrome === "centered" || typeof window === "undefined") return;
    if (chrome === "mobile-shell") {
      setIsPhoneShell(true);
      return;
    }
    const mql = window.matchMedia("(max-width: 1023px)");
    setIsPhoneShell(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsPhoneShell(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [chrome]);

  const teachingSlides = useMemo(
    () => {
      const real = lesson.slides.filter((s): s is TeachingSlide => s.type !== "mcq");
      // System-wide rule: any lesson with MCQs ahead deserves a
      // celebratory "Time to try it!" bridge before the kid gets
      // tested. Most authored lessons skip this. If the lesson has
      // MCQs and no `practice-intro` teach slide already, inject a
      // synthetic one at the end — no audio (kid taps Next when
      // ready), uses the Claude Design celebration variant in the
      // shell renderer. May 23 2026 — Filip wants this catalog-wide.
      const hasMcqs = lesson.slides.some((s) => s.type === "mcq");
      const hasPracticeIntro = real.some((s) => s.type === "practice-intro");
      if (hasMcqs && !hasPracticeIntro) {
        return [
          ...real,
          {
            slide: (real[real.length - 1]?.slide ?? 0) + 1,
            type: "practice-intro" as const,
            heading: "Time to try it yourself!",
            steps: [],
            // Marker so the renderer knows this is a virtual bridge,
            // not authored content. Currently unused but lets future
            // logic (audio fallback, MCQ pre-roll) detect it.
            __synthetic: true,
          } as unknown as TeachingSlide,
        ];
      }
      return real;
    },
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
  // Interactive example ("we do") — gates Next until the kid solves it.
  const [exampleSolved, setExampleSolved] = useState(false);
  // Bunny coach emotion on the interactive fork: neutral while the kid
  // decides, celebrate on a right answer, encourage on a wrong one.
  const [forkReaction, setForkReaction] = useState<"idle" | "correct" | "incorrect">("idle");
  // Bumped on every miss so the bunny re-shakes even on a repeat wrong
  // (otherwise a 2nd miss looks like nothing happened — Filip 2026-06-03).
  const [forkNudge, setForkNudge] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const runIdRef = useRef(0);
  const scheduledFeedbackRef = useRef<Set<string>>(new Set());

  const slide = teachingSlides[currentSlide];
  const steps = slide?.steps ?? [];
  const totalSlides = teachingSlides.length;
  const isLastSlide = currentSlide === totalSlides - 1;

  // Surface the visible slide number to host pages (e.g., the timing
  // audit) so they can pin a feedback panel to the current slide
  // without a duplicate slideshow walker.
  useEffect(() => {
    if (onSlideChange && slide) onSlideChange(slide.slide);
  }, [currentSlide, onSlideChange, slide]);
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

      // Schedule table row reveal — must mark step textsVisible so
      // the row renders. Previously this relied on a sibling
      // displayText field also being present (RL.K.3 pattern), which
      // silently failed for displayTableRow-only steps (table
      // conversions in L.3.4b, RF.2.3b, etc.) — the row sat invisible.
      //
      // Pairs with the per-slide pre-populate above: rows are already
      // visible from slide load; this scheduler additionally fires the
      // "${idx}-check" key so each row gets the emerald glow +
      // checkmark when its audio plays — teacher pointing at the
      // chart, building accumulated progress as the slide advances.
      if (step.displayTableRow) {
        const rowDelay = step.displayDelay ?? 0;
        const reveal = () => {
          setTextsVisible((prev) => new Set(prev).add(stepIdx));
          setPartsVisible((prev) => new Set(prev).add(`${stepIdx}-check`));
        };
        if (rowDelay > 0) {
          const t = setTimeout(() => {
            if (runIdRef.current !== runId) return;
            reveal();
          }, rowDelay);
          textTimersRef.current.push(t);
        } else {
          reveal();
        }
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
        const nextStep = slideSteps[stepIdx + 1];
        const gap = nextStep?.preStepDelay ?? 0;
        if (gap > 0) {
          timerRef.current = setTimeout(() => {
            if (runIdRef.current !== runId) return;
            scheduleStep(stepIdx + 1, runId, slideSteps);
          }, gap);
        } else {
          scheduleStep(stepIdx + 1, runId, slideSteps);
        }
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
        // Cache-bust audio URL with `?v=<audioRegenAt>` so a fresh
        // TTS regen isn't masked by the browser playing the cached
        // mp3. regen-lesson-step-audio.ts stamps audioRegenAt after
        // upload. Without this, "you-en" spelling persists in cache
        // even after the new mp3 says "uhn".
        const stamp = (step as any).audioRegenAt;
        const audioUrl = `${SUPABASE_STORAGE}/${step.audioFile}${stamp ? `?v=${encodeURIComponent(stamp)}` : ""}`;
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
    // For tableRow slides, pre-populate all row steps as visible on
    // slide load — teacher pattern: lay out the whole chart up front,
    // then point at each row as the audio teaches it (via the existing
    // `${idx}-check` highlight). Without this, steps b/c/d/e remain
    // invisible until their audio fires sequentially, leaving the
    // chart half-empty for the first 3-10 seconds of the slide.
    const initialVisible = new Set<number>();
    steps.forEach((s, idx) => {
      if (s.displayTableRow) initialVisible.add(idx);
    });
    setTextsVisible(initialVisible);
    setExamplesVisible(new Set());
    setPlayingStep(-1);
    setHighlightedPill(-1);
    setHighlightedWord(null);
    setActivePhoneme(null);
    setSwapTriggered(new Set());
    setPartsVisible(new Set());
    setShowNext(false);
    setExampleSolved(false);
    setForkReaction("idle");
    setForkNudge(0);
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

  // Re-run the current slide from the top — same flow as the mount
  // effect, just triggered on demand. Lets kids replay the audio +
  // reveals as many times as they want, which is a core literacy
  // affordance (read it again, read it again).
  const handleReplay = useCallback(() => {
    runIdRef.current++;
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
    setExampleSolved(false);
    setForkReaction("idle");
    setForkNudge(0);
    setIsPlaying(false);
    scheduledFeedbackRef.current = new Set();
    timerRef.current = setTimeout(() => {
      if (runIdRef.current !== runId) return;
      scheduleStep(0, runId, steps);
    }, 250);
  }, [steps, clearTimer]);

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

  // Audit mode — reveal the whole slide shortly after it mounts so a
  // screenshot captures the FINISHED slide (all pills/answers/tables
  // shown), not a half-drawn karaoke frame.
  useEffect(() => {
    if (!auditMode) return;
    // Fire AFTER the mount effect's own 700ms scheduleStep so the two
    // don't race (the race crashed fork/tip/table slides on mobile).
    const t = setTimeout(() => handleSkip(), 1600);
    return () => clearTimeout(t);
  }, [currentSlide, auditMode, handleSkip]);

  // Per-step image override: when the currently-playing step has its own imageFile,
  // swap to it so the visual advances with the audio.
  const activeStepImage = playingStep >= 0 ? steps[playingStep]?.imageFile : undefined;
  const effectiveImageFile = activeStepImage ?? slide?.imageFile;
  // Cache-bust the image URL with `?v=<imageRegenAt>` so a fresh regen
  // doesn't get masked by the browser holding the previous PNG (the
  // Supabase URL is identical across regens — only the bytes change).
  // The regen script stamps `slide.imageRegenAt` after upload.
  const imageRegenStamp = (slide as any)?.imageRegenAt;
  const imageUrl = effectiveImageFile
    ? `${SUPABASE_STORAGE}/${effectiveImageFile}${imageRegenStamp ? `?v=${encodeURIComponent(imageRegenStamp)}` : ""}`
    : "";

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

  // Parses two emphasis conventions in display text:
  //   1. **word**  — markdown bold (the convention in CLAUDE.md /
  //                  READEE_VOICE; what AI generators emit). Strips
  //                  the asterisks and underlines + bolds the word.
  //   2. CAPS      — legacy convention used in the hand-authored
  //                  K-4 lessons. Two-or-more-uppercase tokens get
  //                  rendered in bold rose.
  // Both apply per-token; the function still returns a flat array
  // of <span>s so it drops into existing render call sites.
  const highlightCaps = (
    text: string,
    cls = "text-rose-600 dark:text-rose-400 font-extrabold",
  ) => {
    // First, slice on **…** so emphasis spans are atomic tokens.
    // Pattern keeps the delimiters in the split groups so we know
    // which segments to render emphasized vs. plain.
    const segments = text.split(/(\*\*[^*]+\*\*)/g);
    const nodes: React.ReactNode[] = [];
    let key = 0;
    for (const seg of segments) {
      const emphasisMatch = seg.match(/^\*\*([^*]+)\*\*$/);
      if (emphasisMatch) {
        // Markdown emphasis — drop asterisks, render bold + underlined
        // for visual distinction from CAPS-style emphasis. Underline
        // gives kids the "this word matters" signal even when the
        // bold doesn't read clearly on small text.
        nodes.push(
          <span
            key={key++}
            className={`${cls} underline decoration-2 underline-offset-4`}
          >
            {emphasisMatch[1]}
          </span>,
        );
        continue;
      }
      // Whitespace-aware split for CAPS detection.
      const words = seg.split(/(\s+)/);
      for (const word of words) {
        if (/^[A-Z]{2,}[!?.,]?$/.test(word)) {
          nodes.push(
            <span key={key++} className={cls}>
              {word}
            </span>,
          );
        } else if (word.length > 0) {
          nodes.push(<span key={key++}>{word}</span>);
        }
      }
    }
    return nodes;
  };

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
          // Vertical stack: question pill on top, answer below it
          // (the kid hears the Q, has a beat to think, then the
          // answer appears below). Replaces the side-by-side grid
          // which felt cramped on mobile and left dead space on
          // laptop. Centered as a unit, generous gap between Q and
          // A so the "reveal" lands as a visual beat.
          className="flex flex-col items-center justify-center gap-3 lg:gap-5 py-3 lg:py-5"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={`inline-flex items-center justify-center rounded-full py-2 lg:py-3 px-5 lg:px-8 text-xl lg:text-3xl font-bold shadow-sm text-center ${qaPillColor}`}
          >
            {parts[0].text}
          </motion.span>
          <span className="min-h-[2.75rem] lg:min-h-[4rem] flex items-center justify-center">
            {aVisible && (
              <motion.span
                initial={{ opacity: 0, y: 12, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="text-2xl lg:text-4xl font-extrabold text-zinc-800 dark:text-zinc-100"
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
                className="text-green-500"
              >
                <Check className="h-6 w-6" strokeWidth={3} />
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
            className="w-9 h-9 rounded-full bg-violet-500 text-white flex items-center justify-center text-lg font-bold shadow-sm"
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
              className={feedback === "positive" ? "text-green-500" : "text-red-500"}
            >
              {feedback === "positive" ? (
                <Check className="h-7 w-7" strokeWidth={3} />
              ) : (
                <XIcon className="h-7 w-7" strokeWidth={3} />
              )}
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
                className="text-green-500"
              >
                <Check className="h-6 w-6" strokeWidth={3} />
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
                // Intro / teach pairs ("Great readers are" /
                // "detectives.") were rendering at text-xl which felt
                // small with Lexend's wider spacing. Bumped to
                // text-2xl mobile / text-4xl laptop + font-extrabold
                // so the anchor lands like a slide title. Example
                // story text stays softer (semibold, smaller) — it's
                // the passage, not the focal teaching word.
                className={`leading-relaxed ${
                  isExample
                    ? "text-xl lg:text-2xl font-semibold text-zinc-700 dark:text-zinc-200"
                    : `text-2xl lg:text-4xl font-extrabold ${theme.cardText}`
                }`}
              >
                {highlightCaps(part.text)}
              </motion.p>
            );
          })}
        </motion.div>
      );
    }

    // Tip-slide parts — TWO patterns depending on the parts shape:
    //   FLOWING (e.g. ["unhappy", " → un + happy", " = not happy"]):
    //     parts include their own whitespace separators → render
    //     inline as one equation inside a single violet card.
    //   DISCRETE (e.g. ["Who?", "What?", "Where?"]):
    //     no inter-part whitespace → would smash to "Who?What?Where?"
    //     if rendered inline. Stack them as separate violet rows.
    if (isTip) {
      const isFlowing = parts.some(
        (p) => typeof p.text === "string" && /^\s/.test(p.text),
      );
      if (isFlowing) {
        // Mobile: shrink text + allow wrap (the inline `whitespace-pre`
        // span used on desktop overflows narrow phone screens for
        // strings like "un + happy = not happy" or "aqua → aquarium ·
        // aquatic · aqueduct"). Filip 2026-05-24 PM.
        return (
          <motion.div
            key={`${currentSlide}-${step.sub}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="w-full rounded-2xl bg-violet-50 dark:bg-indigo-950/30 border border-violet-100 dark:border-violet-800 px-4 py-3 sm:px-5 sm:py-4 lg:px-8 lg:py-6 text-center"
          >
            <p className="text-base sm:text-2xl lg:text-3xl font-semibold text-violet-800 dark:text-violet-200 leading-relaxed [text-wrap:balance]">
              {parts.map((part, p) => {
                if (!partsVisible.has(`${i}-${p}`)) return null;
                return (
                  <motion.span
                    key={`${currentSlide}-${step.sub}-${p}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    {highlightCaps(part.text)}
                  </motion.span>
                );
              })}
            </p>
          </motion.div>
        );
      }
      // Discrete anchors → stacked violet card per part. Same look
      // as the renderText hero card, one per anchor (accumulates as
      // each reveals).
      return (
        <div
          key={`${currentSlide}-${step.sub}`}
          className="flex w-full flex-col items-center justify-center gap-2"
        >
          {parts.map((part, p) => {
            if (!partsVisible.has(`${i}-${p}`)) return null;
            return (
              <motion.div
                key={`${currentSlide}-${step.sub}-${p}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-full rounded-2xl bg-violet-50 dark:bg-indigo-950/30 border border-violet-100 dark:border-violet-800 px-5 py-4 text-center"
              >
                <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-[1.15] tracking-tight text-violet-800 dark:text-violet-200">
                  {part.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      );
    }

    // Mobile parts = hero in the violet card with violet-800 text
    // (NOT zinc — at extrabold weight zinc reads as black, which
    // Filip has flagged repeatedly). Everything stays in the violet
    // family.
    if (isPhoneShell) {
      // Short one-word anchors (e.g. intro roots Bio/Photo/Geo/Aqua)
      // wrap in a compact row instead of stacking as full-width cards —
      // four stacked cards overflow the phone. Filip 2026-05-30.
      const allShortAnchors =
        parts.length >= 3 &&
        parts.every(
          (pt) =>
            pt.text.trim().split(/\s+/).length === 1 &&
            pt.text.trim().length <= 9,
        );
      if (allShortAnchors) {
        return (
          <div
            key={`${currentSlide}-${step.sub}`}
            className="flex w-full flex-wrap items-center justify-center gap-2"
          >
            {parts.map((part, p) => {
              if (!partsVisible.has(`${i}-${p}`)) return null;
              return (
                <motion.span
                  key={`${currentSlide}-${step.sub}-${p}`}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  className="rounded-full bg-violet-100 dark:bg-violet-900/40 px-4 py-2 text-[22px] font-extrabold text-violet-800 dark:text-violet-200 shadow-sm"
                >
                  {part.text}
                </motion.span>
              );
            })}
          </div>
        );
      }
      return (
        <div
          key={`${currentSlide}-${step.sub}`}
          className="flex w-full flex-col items-center justify-center gap-2"
        >
          {parts.map((part, p) => {
            if (!partsVisible.has(`${i}-${p}`)) return null;
            return (
              <motion.div
                key={`${currentSlide}-${step.sub}-${p}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-full rounded-2xl bg-violet-50 dark:bg-indigo-950/30 border border-violet-100 dark:border-violet-800 px-4 py-3.5 text-center"
              >
                <p className="text-[24px] font-extrabold leading-[1.15] tracking-tight text-violet-800 dark:text-violet-200 [text-wrap:balance]">
                  {part.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      );
    }

    // ── 3+ items: colorful horizontal pills (desktop only) ──
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
              // Single-pill / 3+ pill fallback. font-extrabold + a
              // notch larger so anchors like "Peel the Prefix" steps
              // read with weight, not as polite captions.
              className={`rounded-full px-4 sm:px-8 lg:px-12 py-1.5 sm:py-3 lg:py-5 text-sm sm:text-3xl lg:text-5xl font-extrabold text-center shadow-sm ${PILL_COLORS[p % PILL_COLORS.length]}`}
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
          // Active = explicit phoneme highlight, OR (no phoneme this step) the newest revealed tile
          // so each new reveal pulses violet during the TTS that introduces it.
          const stepHasPhoneme = !!step.afterPhonemes && step.afterPhonemes.length > 0;
          const isActive = activePhoneme?.stepIdx === i && activePhoneme?.letterIdx === li
            ? true
            : !stepHasPhoneme && li === revealCount - 1 && playingStep === i;
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
                className={`min-w-14 sm:min-w-16 h-14 sm:h-16 px-3 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-extrabold shadow-sm transition-colors ${tileColor}`}
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
            className="aspect-square rounded-xl flex items-center justify-center text-xl sm:text-2xl font-extrabold shadow-sm bg-violet-50 text-violet-700 hover:bg-violet-100 active:bg-violet-200 transition-colors dark:bg-violet-900/40 dark:text-violet-200 dark:hover:bg-violet-900/60"
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

    // Passage style — compact quote card for full sentences.
    // Auto-detect: displayText with ≥7 words is a passage (story
    // text), not an anchor. Otherwise it renders as a pill which is
    // wrong for long text (Filip flagged Bella passage rendering at
    // the same size as Q&A pills on slide 3 — visual hierarchy off).
    const isLongText =
      typeof step.displayText === "string" &&
      step.displayText.trim().split(/\s+/).length >= 7;
    if (step.displayStyle === "passage" || isLongText) {
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
                <span key={si} className="underline decoration-2 decoration-violet-500 underline-offset-4">{seg}</span>
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
          // Bumped to text-2xl/3xl on laptop — narrow phone column
          // keeps text-lg, but shell-mode laptop kids see the passage
          // at proper reading size. py also scales.
          className="w-full rounded-2xl bg-violet-50 dark:bg-indigo-950/30 border border-violet-100 dark:border-violet-800 px-5 py-4 lg:px-8 lg:py-6 text-center"
        >
          <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line">
            {renderPassageText()}
          </p>
        </motion.div>
      );
    }

    // Tip-slide single text — render in the same soft violet card
    // style as the story passage (Bella/Max). Pills on tip slides
    // ("A helpful trick" / "Prefix power!") read as cheap chips next
    // to the worked example; the passage card style reads as warm
    // teacher voice and visually ties the tip back to the lesson.
    if (isTip) {
      return (
        <motion.div
          key={`${currentSlide}-${step.sub}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="w-full rounded-2xl bg-violet-50 dark:bg-indigo-950/30 border border-violet-100 dark:border-violet-800 px-5 py-4 lg:px-8 lg:py-6 text-center"
        >
          <p className="text-xl sm:text-2xl lg:text-3xl font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed">
            {step.displayText.split(/(\s+)/).map((seg, si) =>
              /^[A-Z]{2,}[!?.,]?$/.test(seg) ? (
                <span key={si} className="text-violet-700 dark:text-violet-300 font-extrabold">{seg}</span>
              ) : (
                <span key={si}>{seg}</span>
              )
            )}
          </p>
        </motion.div>
      );
    }

    // Mobile single-text = hero in the violet passage card. Text
    // color is text-violet-800 (NOT zinc-800 — at font-extrabold it
    // reads as black even inside the card; Filip flagged this 5+
    // times). Everything stays in the violet family.
    //
    // Adaptive size: short single-word anchors (≤8 chars) get
    // text-[34px] so they don't feel lost on a sparse slide ("rain"
    // hero pill on the example slide). Longer text drops to [26px].
    //
    // `displayHighlight` (case-insensitive substring) renders that
    // chunk in a brighter violet so the kid's eye lands on the
    // vowel team / prefix / root being taught (e.g. "ai" in "rain").
    if (isPhoneShell) {
      const text = step.displayText;
      const isShort = text.trim().length <= 8 && !text.includes(" ");
      const sizeClass = isShort ? "text-[34px]" : "text-[26px]";
      const highlight = step.displayHighlight;
      let content: any = text;
      if (highlight && typeof highlight === "string" && highlight.length > 0) {
        const re = new RegExp(`(${highlight})`, "i");
        // Underline-on-trigger: the substring stays plain text until
        // a sibling step's `highlightWord` matches it (case-insensitive)
        // — same pattern as the Bella passage. Filip's call: don't pop
        // on initial render, fire when the question step asks.
        const trigger = !!(
          highlightedWord &&
          highlight.toLowerCase() === highlightedWord.toLowerCase()
        );
        content = text.split(re).map((seg, i) => {
          if (!re.test(seg)) return <span key={i}>{seg}</span>;
          return trigger ? (
            <motion.span
              key={i}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-block underline decoration-violet-500 decoration-4 underline-offset-4"
            >
              {seg}
            </motion.span>
          ) : (
            <span key={i}>{seg}</span>
          );
        });
      }
      return (
        <motion.div
          key={`${currentSlide}-${step.sub}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="w-full rounded-2xl bg-violet-50 dark:bg-indigo-950/30 border border-violet-100 dark:border-violet-800 px-5 py-5 text-center"
        >
          <p className={`${sizeClass} font-extrabold leading-[1.15] tracking-tight text-violet-800 dark:text-violet-200 [text-wrap:balance]`}>
            {content}
          </p>
        </motion.div>
      );
    }

    // Desktop pill body — displayHighlight uses the SAME underline-
    // on-trigger pattern as the mobile branch + the Bella passage:
    // substring stays plain until a sibling step's highlightWord
    // fires, then it gets underlined with a quick scale pulse.
    const dHighlight = step.displayHighlight;
    const dTrigger = !!(
      dHighlight &&
      highlightedWord &&
      dHighlight.toLowerCase() === highlightedWord.toLowerCase()
    );
    const pillBody = dHighlight && typeof dHighlight === "string" && dHighlight.length > 0
      ? (() => {
          const re = new RegExp(`(${dHighlight})`, "i");
          return step.displayText.split(re).map((seg, i) => {
            if (!re.test(seg)) return <span key={i}>{seg}</span>;
            return dTrigger ? (
              <motion.span
                key={i}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="inline-block underline decoration-violet-500 decoration-4 underline-offset-4"
              >
                {seg}
              </motion.span>
            ) : (
              <span key={i}>{seg}</span>
            );
          });
        })()
      : step.displayText.split(/(\s+)/).map((seg, si) =>
          /^[A-Z]{2,}[!?.,]?$/.test(seg) ? (
            <span key={si} className="text-blue-700 dark:text-blue-300 font-extrabold">{seg}</span>
          ) : (
            <span key={si}>{seg}</span>
          ),
        );

    const pill = (
      <motion.span
        key={`${currentSlide}-${step.sub}`}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className={`rounded-full px-4 sm:px-8 lg:px-12 py-1.5 sm:py-3 lg:py-5 text-sm sm:text-3xl lg:text-5xl font-extrabold text-center shadow-sm ${pillColor} ${
          showCheck ? "ring-2 ring-green-400 ring-offset-2" : ""
        }`}
      >
        {pillBody}
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
            className="text-green-500"
          >
            <Check className="h-7 w-7" strokeWidth={3} />
          </motion.span>
        </div>
      );
    }

    return pill;
  };

  /* ─── JSX ─── */

  // ── Shell-mode render (Claude Design split-screen for laptop) ──
  // Wraps the same audio engine + content renderers in
  // LessonShellDesktop. Image, progress, and Next button move to the
  // shell's chrome; the slide heading + content body become the
  // contentSlot. Audio scheduling, Whisper-aligned reveals, table
  // stagger, replace-not-accumulate — all the same as centered mode.
  if (chrome === "desktop-shell" || chrome === "mobile-shell") {
    const isSynthetic = (slide as any)?.__synthetic === true;
    const hasTableContent = steps.some(
      (s) => s.displayTableRow?.label && s.displayTableRow?.value,
    );
    // ── Example-slide Q→A worksheet (rendered on the RIGHT panel,
    //    below the passage). Image stays on the left as normal. ──
    // Filip 2026-05-24: the Q | A | check grid sits inside the
    // right-panel content body alongside the heading + passage —
    // NOT swapped in for the image. Image left, worksheet right.
    const qaPairSteps = steps
      .map((s, idx) =>
        Array.isArray(s.displayParts) &&
        s.displayParts.length === 2 &&
        typeof s.displayParts[0]?.text === "string" &&
        s.displayParts[0].text.trim().endsWith("?")
          ? { step: s, idx }
          : null,
      )
      .filter(Boolean) as { step: Step; idx: number }[];
    // Worksheet — Q→A diagram below the passage. Filip 2026-05-23:
    // example slides have wasted mobile dead space; the answer-key
    // diagram fills it well and accumulates so the kid sees all 3
    // answers by the end. Mobile uses ExampleWorksheetGridMobile
    // (compact rows, violet palette, no black text); desktop uses
    // the wide ExampleWorksheetGrid.
    // Interactive lives on its OWN slide (NOT the example — Filip 2026-06-02:
    // "don't rearrange that slide, interactive questions elsewhere").
    const hasInteractive = !!slide?.interactive;
    const useExampleWorksheet = isExample && qaPairSteps.length >= 2;
    // One focal point per slide — image suppressed when a chart owns
    // the visual. Example slides keep the image (worksheet goes on
    // the right beside the passage, not in place of the image).
    const shellImageUrl =
      isSynthetic || hasTableContent ? undefined : imageUrl || undefined;

    // Wait for the viewport check to resolve before painting — avoids
    // a desktop-shell flash on phones (the rebuild swap would push
    // the content above the fold for a beat).
    if (isPhoneShell === null) {
      return <div className="fixed inset-0 z-[100] bg-[#fcfcfe]" />;
    }

    // Per-variant image height on mobile (design spec):
    //   intro / tip / practice-intro → 35vh (visual anchor)
    //   teach   → 28vh (shrunk so chart breathes)
    //   example → 25vh (tightest crop — passage card needs room)
    const imageHeightVh: 35 | 28 | 25 = isExample
      ? 25
      : slide?.type === "teach"
        ? 28
        : 35;

    const nextLabel = isLastSlide
      ? "Let's Go!"
      : isPracticeIntro
        ? "Start practice →"
        : "Next →";
    // Interactive example gates Next until the kid solves it (devMode skips).
    const sharedNextDisabled = hasInteractive
      ? !exampleSolved && !devMode
      : !showNext && !devMode;
    const sharedOnNext = (showNext || devMode) ? handleNext : () => {};

    // Shared coach handlers for the fork (tap + match both use them). The
    // bunny mirrors the kid's answer; affirmation plays then unlocks Next;
    // first miss gets the spoken encouragement, repeats just a soft buzz.
    const handleForkCorrect = () => {
      setForkReaction("correct");
      const f = slide?.interactive?.correctAudio;
      if (f && audioManager && !isMuted) {
        audioManager.stop();
        audioManager.play(`${SUPABASE_STORAGE}/${f}`).then(() => setExampleSolved(true)).catch(() => setExampleSolved(true));
      } else {
        setExampleSolved(true);
      }
    };
    const handleForkWrong = (isFirst: boolean) => {
      setForkReaction("incorrect");
      setForkNudge((n) => n + 1); // re-trigger the shake animation every miss
      // Drift back to neutral so the bunny isn't stuck frowning mid-retry.
      window.setTimeout(() => setForkReaction((r) => (r === "incorrect" ? "idle" : r)), 3500);
      if (!audioManager || isMuted) return;
      audioManager.stop();
      const f = slide?.interactive?.wrongAudio;
      if (isFirst && f) audioManager.play(`${SUPABASE_STORAGE}/${f}`).catch(() => {});
      else audioManager.playIncorrectBuzz?.();
    };

    // The fork bunny coach renders INSIDE the content as one centered
    // column (bunny on top, then question + choices) — NOT in a side
    // panel. The split-panel layout left the bunny floating mid-left with
    // a big empty band (Filip flagged the dead space). .bn-stage is
    // width/height:100% so the bunny needs an explicit-size parent.
    const bunnyCoach = (
      <div className="flex w-full items-center justify-center">
        <div className="h-24 w-24 sm:h-28 sm:w-28 lg:h-36 lg:w-36">
          {forkReaction === "idle"
            ? <Bunny outfitId={outfitId} />
            : <BunnyReaction key={`${forkReaction}-${forkNudge}`} outfitId={outfitId} state={forkReaction} />}
        </div>
      </div>
    );
    // Fork has no side panel now → single centered column on both shells.
    const sharedLeftSlot = isSynthetic ? <CelebrationLeftPanel /> : undefined;
    const nonSyntheticContent = (
      <div className="flex flex-1 flex-col items-center justify-center text-center w-full gap-5 lg:gap-8">
        {slide?.heading && (
          <motion.h1
            key={`shell-heading-${currentSlide}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
            // Mobile heading = small uppercase eyebrow (per Claude
            // Design mobile spec — the pill below IS the slide
            // title; the heading is just informational chrome).
            // Desktop keeps the big colored heading. Filip 2026-05-23:
            // earlier text-2xl on mobile was a "screen-dominating
            // banner" — kid couldn't see Who?/What?/Where? below.
            className={
              isPhoneShell
                ? "text-[11px] font-semibold uppercase tracking-widest text-center text-zinc-400 leading-tight"
                : `font-extrabold text-2xl sm:text-3xl lg:text-5xl leading-[1.1] tracking-tight text-center ${theme.text}`
            }
          >
            {slide.heading}
          </motion.h1>
        )}
        {/* Slide content body — same renderers as centered mode.
            flex-1 + my-auto inside parent flex-col centers the
            body vertically in the leftover space below the
            heading. items-center + text-center keeps each
            renderer's output centered horizontally too. */}
        <div className="flex w-full flex-col items-center justify-center gap-3 lg:gap-6 text-center">
          {(() => {
            const hasTable = steps.some((s) => s.displayTableRow);
            let tableRendered = false;
            // Build the table JSX once, hoisted from inside the step
            // iteration so we can render it from EITHER the first
            // table-row step (normal) OR a filler intro step like
            // RL.1.1 S2.a ("Good detectives ask five big questions")
            // that has audio but no visual. Without the early render
            // the kid sees a blank body for ~4s before the chart
            // appears. Filip 2026-05-24.
            const renderShellTable = () => {
              const tableSteps = steps
                .map((s, idx) =>
                  s.displayTableRow ? { step: s, idx } : null,
                )
                .filter(Boolean) as { step: Step; idx: number }[];
              const hasExamples = tableSteps.some(
                (ts) => ts.step.displayTableRow?.example,
              );
              const headers = tableSteps.find(
                (ts) => ts.step.displayTableRow?.tableHeaders,
              )?.step.displayTableRow?.tableHeaders;
              const widestLabel = tableSteps.reduce(
                (max, ts) =>
                  Math.max(
                    max,
                    (ts.step.displayTableRow?.label ?? "").length,
                  ),
                0,
              );
              const labelCol = `${Math.max(5.5, widestLabel * 0.7 + 1.5).toFixed(2)}rem`;
              const cols3 = `${labelCol} 1fr 1fr`;
              const cols2 = `${labelCol} 1fr`;
              const gridCols = hasExamples ? cols3 : cols2;
              // Mobile: a horizontal grid crushes the value column when
              // the label is long (one word per line, clipped off-screen)
              // and the value renders as black body text. STACK each row
              // instead — label pill on top, value (themed violet, never
              // black) below — so nothing clips on the phone. (audit fix
              // 2026-06-11)
              if (isPhoneShell) {
                return (
                  <div
                    key={`${currentSlide}-shell-table`}
                    className="w-full max-w-md mx-auto space-y-2.5"
                  >
                    {tableSteps.map((ts) => {
                      const row = ts.step.displayTableRow!;
                      const colorIdx = tableSteps.indexOf(ts);
                      const checkKey = `${ts.idx}-check`;
                      const rowHighlighted = partsVisible.has(checkKey);
                      const staggerDelay = colorIdx * 0.12;
                      return (
                        <motion.div
                          key={`${currentSlide}-shell-rowM-${ts.idx}`}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: rowHighlighted ? [1, 1.03, 1] : 1,
                          }}
                          transition={{
                            default: {
                              type: "spring",
                              stiffness: 400,
                              damping: 20,
                              delay: staggerDelay,
                            },
                            scale: {
                              duration: 0.4,
                              ease: "easeInOut",
                              delay: staggerDelay,
                            },
                          }}
                          className={`rounded-2xl border-2 px-3 py-3 transition-colors duration-500 ${
                            rowHighlighted
                              ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20"
                              : "border-violet-100 bg-white dark:bg-slate-900"
                          }`}
                        >
                          <span
                            className={`block rounded-xl py-2 text-lg font-bold shadow-sm text-center ${PILL_COLORS[colorIdx % PILL_COLORS.length]}`}
                          >
                            {row.label}
                          </span>
                          <span className="mt-2 block text-base font-semibold text-violet-800 dark:text-violet-200 text-center break-words">
                            {row.value}
                          </span>
                          {hasExamples && row.example && (
                            <span className="mt-1 block text-sm italic text-violet-500 dark:text-violet-400 text-center break-words">
                              {row.example}
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                );
              }
              return (
                <div
                  key={`${currentSlide}-shell-table`}
                  className="w-full max-w-3xl mx-auto space-y-3 lg:space-y-6"
                >
                  {headers && (
                    <div
                      className="grid items-center gap-x-3 lg:gap-x-4 pb-2 lg:pb-3 border-b-2 border-violet-200 dark:border-violet-700"
                      style={{ gridTemplateColumns: gridCols }}
                    >
                      {headers.map((h, hi) => (
                        <span
                          key={hi}
                          className="text-xs sm:text-sm lg:text-2xl font-extrabold uppercase tracking-wider text-violet-600 dark:text-violet-300 text-center"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                  {tableSteps.map((ts) => {
                    const row = ts.step.displayTableRow!;
                    const colorIdx = tableSteps.indexOf(ts);
                    const checkKey = `${ts.idx}-check`;
                    const rowHighlighted = partsVisible.has(checkKey);
                    const staggerDelay = colorIdx * 0.12;
                    return (
                      <motion.div
                        key={`${currentSlide}-shell-row-${ts.idx}`}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: rowHighlighted ? [1, 1.03, 1] : 1,
                        }}
                        transition={{
                          default: {
                            type: "spring",
                            stiffness: 400,
                            damping: 20,
                            delay: staggerDelay,
                          },
                          scale: {
                            duration: 0.4,
                            ease: "easeInOut",
                            delay: staggerDelay,
                          },
                        }}
                        className={`grid items-center gap-x-3 lg:gap-x-4 rounded-xl px-2 py-2 lg:py-4 transition-colors duration-500 ${
                          rowHighlighted
                            ? "bg-emerald-50 dark:bg-emerald-950/20 ring-2 ring-emerald-300 dark:ring-emerald-700"
                            : ""
                        }`}
                        style={{ gridTemplateColumns: gridCols }}
                      >
                        <span
                          className={`rounded-xl py-2 lg:py-4 text-lg sm:text-xl lg:text-3xl font-bold shadow-sm text-center ${PILL_COLORS[colorIdx % PILL_COLORS.length]}`}
                        >
                          {row.label}
                        </span>
                        <span className="text-base sm:text-lg lg:text-3xl font-semibold text-zinc-700 dark:text-zinc-200 text-center">
                          {row.value}
                        </span>
                        {hasExamples && (
                          <span className="text-sm sm:text-base lg:text-2xl text-zinc-500 dark:text-zinc-400 italic text-center">
                            {row.example ?? ""}
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              );
            };
            // Filler intro step: audio narrates a framing line but
            // the step has no visual. On table slides we render the
            // chart NOW so the kid sees the structure while audio
            // plays, instead of blank space → table-pop later.
            const isFillerStep = (s: Step) =>
              !s.displayText &&
              (!s.displayParts || s.displayParts.length === 0) &&
              !s.displayTableRow &&
              !s.displayDiagram &&
              !s.displayDiagramSwap &&
              !s.displayAlphabetGrid;
            const earlyTable =
              hasTable && steps.length > 0 && isFillerStep(steps[0])
                ? (tableRendered = true, renderShellTable())
                : null;
            // Detect short anchor steps (Who? / What? / Where? /
            // UN / RE / etc.) — single short displayText, no parts,
            // no table. On mobile we accumulate consecutive runs of
            // these because the focal idea IS the trio (e.g. RL.K.1
            // slide 2: kid should see Who? + What? + Where? together
            // after all three reveal). Long beats still replace.
            const isShortAnchor = (s?: Step) =>
              !!s?.displayText &&
              !s.displayParts &&
              !s.displayTableRow &&
              s.displayText.trim().split(/\s+/).length <= 2;
            // A terse pill-row step (practice-intro "Your turn!" + a
            // couple pills, tip trick pills) — displayParts only, each
            // part short, ≤4 parts. On mobile these are anchors that
            // should PERSIST once revealed (same as short displayText
            // anchors) instead of being replaced when the audio advances
            // to a later, often audio-only, step — otherwise the pills
            // vanish and the slide looks empty. (audit fix 2026-06-11)
            const isAnchorParts = (s?: Step) =>
              !!s?.displayParts &&
              s.displayParts.length > 0 &&
              s.displayParts.length <= 4 &&
              !s.displayText &&
              !s.displayTableRow &&
              s.displayParts.every(
                (p) => (p.text ?? "").trim().split(/\s+/).length <= 4,
              );
            const rawDisplayStep =
              playingStep >= 0
                ? playingStep
                : Math.max(0, stepsRevealed - 1);
            // Mobile INV-5 guard: if the current step is audio-only
            // (filler), fall back to the most recent VISUAL step so a
            // slide that ends on an audio-only beat (many tip/teach
            // slides: [audio, pill, audio]) never renders blank on the
            // phone. Desktop accumulates, so it is unaffected.
            // (canonical-conformance fix 2026-07-05)
            let mobileDisplayStep = rawDisplayStep;
            if (
              isPhoneShell &&
              steps[rawDisplayStep] &&
              isFillerStep(steps[rawDisplayStep])
            ) {
              for (let j = rawDisplayStep - 1; j >= 0; j--) {
                if (!isFillerStep(steps[j])) {
                  mobileDisplayStep = j;
                  break;
                }
              }
            }
            const stepNodes = steps.map((step, i) => {
              const currentDisplayStep = isPhoneShell
                ? mobileDisplayStep
                : rawDisplayStep;
              // Replace-not-accumulate on mobile (rule §12) — UNLESS:
              //   (a) Example slides → always accumulate so the
              //       passage card stays visible while the Q→A
              //       worksheet diagram fills in beside/below it.
              //       Filip 2026-05-23: "if you don't remove the
              //       story I think this is a pass."
              //   (b) Anchor runs (consecutive ≤2-word steps) →
              //       accumulate so the kid sees the full trio
               //      (e.g. Who? + What? + Where?).
              //   (c) Table-row steps on a table slide → always
              //       render once their step has been reached so a
              //       conclusion displayText on a later step (e.g.
              //       RF.2.3b S2c "Same sound, two ways!") sits
              //       UNDER the chart instead of replacing it.
              //       Filip 2026-05-24.
              // Q→A pair steps on example slides are still suppressed
              // inline (the worksheet handles them) via the
              // `useExampleWorksheet && isQAPair` guard below.
              const isIntro = slide?.type === "intro";
              let shouldRenderForCurrentStep: boolean;
              if (!isPhoneShell || isExample || isIntro) {
                // Mobile accumulate exceptions:
                //   - example slides (passage + worksheet stays put)
                //   - intro slides (2-3 short anchors fit fine and
                //     mobile felt empty when only 1 was visible)
                // Tip slides REVERTED to replace — worked-example pills
                // overflow if accumulated. Filip 2026-05-24 PM.
                shouldRenderForCurrentStep = i <= currentDisplayStep;
              } else if (i === currentDisplayStep) {
                shouldRenderForCurrentStep = true;
              } else if (
                step.displayTableRow &&
                i <= currentDisplayStep
              ) {
                shouldRenderForCurrentStep = true;
              } else if (
                i <= currentDisplayStep &&
                (isShortAnchor(step) || isAnchorParts(step))
              ) {
                // Mobile: short anchors / terse pill-rows PERSIST once
                // revealed instead of being replaced, so practice-intro
                // and tip pills don't vanish (leaving an empty slide)
                // when the audio advances to a later step. Long teach
                // beats are not short anchors, so they still replace.
                shouldRenderForCurrentStep = true;
              } else {
                shouldRenderForCurrentStep = false;
              }
              if (!shouldRenderForCurrentStep) return null;
              if (step.displayTableRow) {
                if (tableRendered) return null;
                tableRendered = true;
                return renderShellTable();
              }
              if (step.displayDiagramSwap) {
                return renderDiagramSwap(step, i);
              }
              if (step.displayDiagram) {
                return renderDiagram(step, i);
              }
              if (step.displayAlphabetGrid) {
                return renderAlphabetGrid(step, i);
              }
              if (!hasTable && step.displayParts && step.displayParts.length > 0) {
                const isQAPair =
                  step.displayParts.length === 2 &&
                  typeof step.displayParts[0]?.text === "string" &&
                  step.displayParts[0].text.trim().endsWith("?");
                if (useExampleWorksheet && isQAPair) return null;
                return renderParts(step, i);
              }
              if (!step.displayTableRow) {
                return renderText(step, i);
              }
              return null;
            });
            return earlyTable ? [earlyTable, ...stepNodes] : stepNodes;
          })()}
          {useExampleWorksheet && (
            isPhoneShell ? (
              <ExampleWorksheetGridMobile
                pairs={qaPairSteps}
                partsVisible={partsVisible}
                playingStep={playingStep}
              />
            ) : (
              <ExampleWorksheetGrid
                pairs={qaPairSteps}
                partsVisible={partsVisible}
                playingStep={playingStep}
              />
            )
          )}
          {hasInteractive && bunnyCoach}
          {hasInteractive && slide?.interactive && (
            slide.interactive.kind === "match" ? (
              <InteractiveMatch
                key={`interactive-${currentSlide}`}
                anchor={slide.interactive.anchor}
                prompt={slide.interactive.prompt}
                leftItems={slide.interactive.leftItems ?? []}
                rightItems={slide.interactive.rightItems ?? []}
                correctPairs={slide.interactive.correctPairs ?? {}}
                hint={slide.interactive.hint}
                onCorrect={handleForkCorrect}
                onWrong={handleForkWrong}
              />
            ) : (
              <InteractiveExample
                key={`interactive-${currentSlide}`}
                anchor={slide.interactive.anchor}
                prompt={slide.interactive.prompt}
                choices={slide.interactive.choices ?? []}
                correct={slide.interactive.correct ?? ""}
                hint={slide.interactive.hint}
                onCorrect={handleForkCorrect}
                onWrong={handleForkWrong}
              />
            )
          )}
        </div>
      </div>
    );
    const sharedContentSlot = isSynthetic ? (
      <CelebrationContent
        title={slide?.heading || "Time to try it yourself!"}
        body="Quick questions ahead — you've got this."
      />
    ) : (
      nonSyntheticContent
    );

    if (isPhoneShell) {
      return (
        <div className={fredoka.className}>
          <LessonShellMobile
            slideNum={currentSlide + 1}
            totalSlides={teachingSlides.length}
            onClose={onComplete}
            onNext={sharedOnNext}
            nextDisabled={sharedNextDisabled}
            nextLabel={nextLabel}
            imageUrl={shellImageUrl}
            imageAlt={lesson.title}
            imageHeightVh={imageHeightVh}
            audioPlaying={isPlaying}
            leftSlot={sharedLeftSlot}
            contentSlot={sharedContentSlot}
          />
        </div>
      );
    }

    return (
      <div className={fredoka.className}>
        <LessonShellDesktop
          slideNum={currentSlide + 1}
          totalSlides={teachingSlides.length}
          lessonTitle={lesson.title}
          onClose={onComplete}
          onNext={sharedOnNext}
          nextDisabled={sharedNextDisabled}
          nextLabel={nextLabel}
          imageUrl={shellImageUrl}
          imageAlt={lesson.title}
          audioPlaying={isPlaying}
          leftSlot={sharedLeftSlot}
          contentSlot={sharedContentSlot}
        />
      </div>
    );
  }

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
      <div className="flex-shrink-0 px-4 sm:px-6 pt-2 pb-1">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-violet-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 tabular-nums min-w-6 text-right">
            {currentSlide + 1}/{totalSlides}
          </span>
          {isPlaying ? (
            <button
              onClick={handleSkip}
              className="ml-1 inline-flex h-11 items-center gap-1 px-2 text-xs font-semibold text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
              aria-label="Skip audio"
            >
              Skip <SkipForward className="w-3 h-3" />
            </button>
          ) : (
            stepsRevealed > 0 && (
              <button
                onClick={handleReplay}
                className="ml-1 inline-flex h-11 items-center gap-1 px-2 text-xs font-semibold text-violet-500 hover:text-violet-700 dark:text-violet-300 transition-colors"
                aria-label="Listen again"
              >
                <RotateCcw className="w-3 h-3" /> Again
              </button>
            )
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
            // Rule: max ONE visual focal point per slide. If the slide
            // has a table with real row content, the table IS the
            // visual — suppress the image so it doesn't compete with
            // the chart for the kid's attention (Filip's "image is
            // useless here, the chart takes over" feedback on Story
            // Questions). Image still shows on intro/teach text slides
            // and on the celebratory practice-intro.
            const hasTableContent = steps.some(
              (s) =>
                s.displayTableRow &&
                s.displayTableRow.label &&
                s.displayTableRow.value,
            );
            if (hasTableContent) return null;

            // Fixed height — the old `visibleContent >= 3 ? 25vh : 38vh`
            // ternary made the image jitter as text revealed during the
            // slide. Stable 34vh reads as a calm anchor.
            // Image scales with viewport height; bumped on `lg:` so
            // laptop kids get a richer visual without the image
            // dominating phone where vertical space is tight.
            const imgH = isPracticeIntro
              ? "max-h-[45vh] lg:max-h-[55vh]"
              : "max-h-[34vh] lg:max-h-[42vh]";
            return (
              <div className="flex-shrink-0 flex justify-center px-4 sm:px-6 pt-1">
                <LoadingImage
                  src={imageUrl}
                  className={`w-full h-full object-cover ${imgH}`}
                  containerClassName={`rounded-2xl overflow-hidden shadow-lg ${imgH}`}
                />
              </div>
            );
          })()}

          {/* ── Heading + speaker ── */}
          <div className="flex-shrink-0 px-4 sm:px-6 pt-1 pb-0 flex items-center justify-center gap-2">
            {slide.heading && (
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                // Fixed size — the old dynamic resize (3xl → xl when
                // content appeared) snapped jarringly on slides where
                // the heading was the only visible content for an
                // audio beat (filler intros). Stable text-xl reads
                // cleaner across the whole lesson and matches the
                // "replace not accumulate" content rhythm.
                className={`font-bold text-center tracking-wide leading-snug text-xl lg:text-3xl ${theme.text}`}
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
          {/* Mobile-first padding: tight at 375-390px (kid on phone),
              comfortable at sm+ (tablet/desktop). px-4 instead of
              px-6 buys ~16px of horizontal real estate on phone. */}
          <div className="flex-1 min-h-0 overflow-hidden flex items-center justify-center px-4 sm:px-6">
            {(() => {
              const hasContent = steps.some(
                (s) => s.displayText || (s.displayParts && s.displayParts.length > 0) || s.displayTableRow || s.displayDiagram || s.displayDiagramSwap || s.displayAlphabetGrid
              );
              const bgClass = hasContent ? theme.contentBg : "";
              // Content max-width scales by viewport. Mobile-first
              // kept tight (max-w-sm = 384px fits iPhone exactly),
              // then grows substantially on `lg:` (≥1024px) so
              // laptop/desktop kids and the audit page reviewer
              // don't stare at a narrow column floating in empty
              // pixels. Text now reads at text-2xl/4xl, needs the
              // horizontal room to breathe.
              return (
            <div className={`w-full ${steps.some((s) => s.displayTableRow) || steps.some((s) => s.displayDiagram?.letters?.some((l) => l.text.length > 1)) ? "max-w-lg lg:max-w-4xl" : "max-w-sm lg:max-w-3xl"} flex flex-col items-center gap-3 lg:gap-6 ${bgClass}`}>
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
                    // Compute the widest label across all rows so every
                    // label column lands the same width without leaving
                    // dead space around the longest entry (Filip's "lot
                    // of dead space on Where + When?" complaint).
                    // Approx 0.7rem per character + 1.5rem pill padding.
                    const widestLabel = tableSteps.reduce(
                      (max, ts) => Math.max(max, (ts.step.displayTableRow?.label ?? "").length),
                      0,
                    );
                    const labelCol = `${Math.max(5.5, widestLabel * 0.7 + 1.5).toFixed(2)}rem`;
                    const cols3 = `${labelCol} 1fr 1fr`;
                    const cols2 = `${labelCol} 1fr`;
                    const gridCols = hasExamples ? cols3 : cols2;
                    return (
                      <div key={`${currentSlide}-table`} className="w-full max-w-md lg:max-w-3xl mx-auto space-y-3 lg:space-y-5">
                        {/* Header row */}
                        {headers && (
                          <div
                            className="grid items-center gap-x-4 pb-2 border-b-2 border-violet-200 dark:border-violet-700"
                            style={{ gridTemplateColumns: gridCols }}
                          >
                            {headers.map((h, hi) => (
                              <span key={hi} className="text-base lg:text-xl font-extrabold uppercase tracking-wider text-violet-600 dark:text-violet-300 text-center">
                                {h}
                              </span>
                            ))}
                          </div>
                        )}
                        {tableSteps.map((ts) => {
                          // Tables render in full from slide load — the
                          // "teacher draws the whole chart, then points
                          // at each row" pattern. Previous visibility-
                          // gated approach silently failed when state
                          // updates raced (rows stayed invisible even
                          // when textsVisible was pre-populated).
                          // `rowHighlighted` (set per-step when its
                          // audio plays) is the affordance for "which
                          // row are we teaching right now."
                          const row = ts.step.displayTableRow!;
                          const colorIdx = tableSteps.indexOf(ts);
                          const exampleShown = examplesVisible.has(ts.idx);
                          const checkKey = `${ts.idx}-check`;
                          const rowHighlighted = partsVisible.has(checkKey);
                          // Stagger rows in by their position so the
                          // chart appears with rhythm — feels like a
                          // teacher writing each row in turn instead of
                          // the whole chart slapping onto the board.
                          // 120ms per row sums to ~500ms for a 4-row
                          // chart, fast enough not to delay teaching.
                          const staggerDelay = colorIdx * 0.12;
                          return (
                            <motion.div
                              key={`${currentSlide}-table-${ts.idx}`}
                              initial={{ opacity: 0, y: 14 }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                scale: rowHighlighted ? [1, 1.03, 1] : 1,
                              }}
                              // Per-property transitions: spring for
                              // opacity/y (the entrance), ease tween for
                              // the scale pulse — Motion forbids spring
                              // with multi-keyframe arrays.
                              transition={{
                                default: {
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 20,
                                  delay: staggerDelay,
                                },
                                scale: {
                                  duration: 0.4,
                                  ease: "easeInOut",
                                  delay: staggerDelay,
                                },
                              }}
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
                                    className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white"
                                  >
                                    <Check className="h-3 w-3" strokeWidth={3} />
                                  </motion.span>
                                )}
                              </span>
                              <span className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 text-center">
                                {row.value.split(/(\s+)/).map((seg, si) =>
                                  /^[A-Z]{2,}$/.test(seg) ? (
                                    <span key={si} className="text-violet-600 dark:text-violet-400 font-extrabold">{seg}</span>
                                  ) : (
                                    <span key={si}>{seg}</span>
                                  )
                                )}
                              </span>
                              {hasExamples && (
                                <span className="text-base text-zinc-500 dark:text-zinc-400 italic text-center">
                                  {row.example ?? ""}
                                </span>
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
                  // "Replace not accumulate" gate — for non-table content,
                  // only render the step that's currently being narrated.
                  // Previous step's content fades out as the new step's
                  // audio begins. Tables are exempt (full chart pattern).
                  // Without this, displayText/displayParts piled up into a
                  // wall of text by the end of a slide (Filip's "throw up
                  // of pills" complaint on 5 of 5 audited 1st-grade lessons).
                  //
                  // currentDisplayStep: the step "owning" the screen right
                  // now. While audio is playing, that's playingStep. When
                  // a slide first loads (700ms gap before audio), or after
                  // the last step finishes, fall back to the last revealed
                  // step so we don't blank the screen.
                  //
                  // Passage exemption: a displayText with ≥7 words is
                  // treated as a passage that persists across Q&A steps
                  // (example slides — kid needs the passage on screen
                  // while answering questions about it).
                  const currentDisplayStep =
                    playingStep >= 0
                      ? playingStep
                      : Math.max(0, stepsRevealed - 1);
                  const isPassage =
                    typeof step.displayText === "string" &&
                    step.displayText.trim().split(/\s+/).length >= 7;
                  const shouldRenderForCurrentStep =
                    i === currentDisplayStep ||
                    !!step.displayTableRow ||
                    (isPassage && i <= currentDisplayStep);
                  if (!shouldRenderForCurrentStep) return null;
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
          <div className="flex-shrink-0 px-4 sm:px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="max-w-xs mx-auto"
            >
              <button
                onClick={(showNext || devMode) ? handleNext : undefined}
                disabled={!showNext && !devMode}
                className={`relative w-full py-3.5 rounded-2xl font-extrabold text-xl text-white flex items-center justify-center gap-2 transition-all duration-300 ${
                  (showNext || devMode)
                    ? "active:scale-95"
                    : "opacity-50 pointer-events-none"
                }`}
                style={{
                  background: (showNext || devMode)
                    ? isLastSlide
                      ? "linear-gradient(135deg, #10b981, #059669)"
                      : "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : undefined,
                  boxShadow: (showNext || devMode)
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
                  {!showNext && !devMode ? (
                    // While audio is playing, the button is intentionally
                    // locked so the kid hears each sub-step before moving
                    // on. The "Listening…" label tells them *why* they
                    // can't tap — not "this is broken."
                    <>
                      <Volume2 className="w-5 h-5 animate-pulse" />
                      Listening…
                    </>
                  ) : isLastSlide ? (
                    <>
                      <Rocket className="w-5 h-5" />
                      Let&apos;s Go!
                    </>
                  ) : (
                    <>
                      {devMode && !showNext ? "Skip" : "Next"}
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

/* ───────────────────────────────────────────────────────────────── */
/*  ExampleWorksheetGrid — detective board on the LEFT panel        */
/* ───────────────────────────────────────────────────────────────── */
/**
 * Filip 2026-05-24: example-slide Q→A pairs render on the LEFT panel
 * as a vertical "worksheet" — three columns per row:
 *   Question pill | Answer text | check
 *
 * - Question is always visible (the kid sees what's being asked)
 * - Answer reveals when partsVisible has `${idx}-1` (Whisper-aligned + 700ms post-roll)
 * - Check fades in once the answer is visible (the row's been "taught")
 * - Currently-playing row gets a violet ring so the kid knows where we are
 */
/**
 * Mobile-tuned worksheet — same Q→A diagram below the passage, but
 * compact enough for a 393×852 phone. Two-row per item (Q above, A
 * below) so the answer text isn't fighting a fixed Q column for
 * width. Everything in the violet palette (NO black text — Filip
 * flagged this 5+ times). Active row gets a violet ring; answered
 * rows tint emerald + show a small check.
 */
function ExampleWorksheetGridMobile({
  pairs,
  partsVisible,
  playingStep,
}: {
  pairs: Array<{ step: Step; idx: number }>;
  partsVisible: Set<string>;
  playingStep: number;
}) {
  return (
    <div className="w-full flex flex-col gap-2">
      {pairs.map((p) => {
        const q = p.step.displayParts?.[0]?.text ?? "";
        const a = p.step.displayParts?.[1]?.text ?? "";
        // Gate: only reveal the question text once the step has
        // started (its part-0 is visible OR it's the currently
        // playing step). Stops Q2's text from spoiling Q1's answer
        // before the kid is asked. Filip 2026-05-24.
        const qVisible = partsVisible.has(`${p.idx}-0`) || playingStep === p.idx;
        const aVisible = partsVisible.has(`${p.idx}-1`);
        const isCurrent = playingStep === p.idx;
        return (
          <motion.div
            key={`mw-${p.idx}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={`flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-2.5 transition-all duration-300 ${
              isCurrent
                ? "border-violet-400 bg-violet-50 dark:bg-violet-950/30 shadow-sm"
                : aVisible
                  ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20"
                  : "border-violet-100 bg-white dark:bg-slate-900"
            }`}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-violet-500 dark:text-violet-400 break-words">
                {qVisible ? q : "?"}
              </span>
              <span className="min-w-0 whitespace-normal break-words text-base font-extrabold text-violet-800 dark:text-violet-200">
                {!qVisible ? (
                  <span className="text-violet-200 dark:text-violet-800">…</span>
                ) : aVisible ? (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  >
                    {a}
                  </motion.span>
                ) : (
                  <span className="text-violet-200 dark:text-violet-800">…</span>
                )}
              </span>
            </div>
            {aVisible && (
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 15,
                  delay: 0.15,
                }}
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </motion.span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function ExampleWorksheetGrid({
  pairs,
  partsVisible,
  playingStep,
}: {
  pairs: Array<{ step: Step; idx: number }>;
  partsVisible: Set<string>;
  playingStep: number;
}) {
  return (
    <div className="w-full max-w-xl flex flex-col gap-4 lg:gap-5">
      {pairs.map((p, rowIdx) => {
        const q = p.step.displayParts?.[0]?.text ?? "";
        const a = p.step.displayParts?.[1]?.text ?? "";
        const aVisible = partsVisible.has(`${p.idx}-1`);
        const isCurrent = playingStep === p.idx;
        const wasTaught = aVisible;
        const pillColor = PILL_COLORS[rowIdx % PILL_COLORS.length];
        return (
          <motion.div
            key={`worksheet-${p.idx}`}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 22,
              delay: rowIdx * 0.1,
            }}
            className={`grid items-center gap-4 lg:gap-6 rounded-2xl border-2 bg-white dark:bg-slate-900 px-5 py-4 lg:px-7 lg:py-6 transition-all duration-300 ${
              isCurrent
                ? "border-violet-400 shadow-md ring-4 ring-violet-100 dark:ring-violet-900/40"
                : wasTaught
                  ? "border-emerald-200 dark:border-emerald-800"
                  : "border-zinc-200 dark:border-slate-700"
            }`}
            style={{ gridTemplateColumns: "7.5rem 1fr 2.5rem" }}
          >
            <span
              className={`inline-flex items-center justify-center rounded-full py-2 lg:py-3 px-4 lg:px-5 text-lg lg:text-2xl font-bold shadow-sm text-center ${pillColor}`}
            >
              {q}
            </span>
            <span className="text-xl lg:text-3xl font-extrabold text-zinc-800 dark:text-zinc-100 leading-tight">
              {aVisible ? (
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  className="inline-block"
                >
                  {a}
                </motion.span>
              ) : (
                <span className="text-zinc-300 dark:text-slate-600">…</span>
              )}
            </span>
            <span className="flex items-center justify-center">
              {wasTaught && (
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.15 }}
                  className="flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-full bg-emerald-500 text-white"
                >
                  <Check className="h-5 w-5 lg:h-6 lg:w-6" strokeWidth={3} />
                </motion.span>
              )}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
