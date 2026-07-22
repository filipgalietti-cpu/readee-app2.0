"use client";

/**
 * Shared MCQ question stage — the Claude Design "Practice Runner" look.
 *
 * The character question layout, extracted so the post-lesson questions on
 * /learn match the /practice runner exactly. /learn renders this today; the
 * /practice page still has the original inline copy this was lifted from and
 * should migrate onto this component next so the two can never drift.
 * Purely presentational: the parent owns the runner state (selected, greyed,
 * previewed, feedback phase) and passes handlers. Interactive question types
 * (SentenceBuild, CategorySort, …) are rendered by the parent — this covers
 * only the multiple-choice path, its 3 layouts (passage / big-image / plain),
 * the fixed bunny speech bubble, the read-aloud + hint dock, and the Next CTA.
 */

import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Lightbulb, Check as CheckIcon, X as XIcon, ArrowRight } from "lucide-react";
import { LoadingImage } from "@/app/components/ui/LoadingImage";
import { Bunny, BunnyReaction } from "@/app/_components/Bunny/Bunny";

/* Claude Design "Practice Runner" choice-card palette (letter chip + card). */
export const DESIGN_CHOICE_COLORS = [
  { bg: "#dbeafe", fg: "#1e3a8a", border: "#93c5fd", chipBg: "#bfdbfe", chipFg: "#1e40af" },
  { bg: "#f3e8ff", fg: "#581c87", border: "#d8b4fe", chipBg: "#e9d5ff", chipFg: "#6b21a8" },
  { bg: "#fef3c7", fg: "#78350f", border: "#fcd34d", chipBg: "#fde68a", chipFg: "#92400e" },
  { bg: "#d1fae5", fg: "#064e3b", border: "#6ee7b7", chipBg: "#a7f3d0", chipFg: "#065f46" },
];

const QUESTION_WORDS = new Set(["What", "Who", "Where", "When", "Why", "How", "Which"]);

/** Highlight key words / emphasis in a question prompt, never leaking markers. */
export function highlightQuestion(text: string): React.ReactNode[] {
  const tokenizer = /(\*\*[^*]+\*\*|"[^"]+"|"[^"]+")/g;
  return text.split(tokenizer).map((segment, si) => {
    if (/^\*\*[^*]+\*\*$/.test(segment)) {
      const inner = segment.slice(2, -2);
      return <span key={si} className="text-violet-600 dark:text-violet-400 font-extrabold">{inner}</span>;
    }
    if (/^[""][^""]+[""]$/.test(segment)) {
      return <span key={si} className="text-violet-600 dark:text-violet-400 font-extrabold">{segment}</span>;
    }
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

export interface McqStageProps {
  choices: string[];
  correct: string;
  question: string;
  passage?: string | null;
  imgSrc?: string | null;
  chart?: React.ReactNode;
  selected: string | null;
  greyed: string[];
  previewedChoice: string | null;
  nudge?: string | null;
  /** Parent decides preview-vs-pick / phoneme audio; gets the tapped choice. */
  onChoiceClick: (choice: string, index: number, rect: DOMRect) => void;
  onReplay: () => void;
}

/** The MCQ question body: prompt + letter-chip choice cards, in 3 layouts. */
export function McqStage(props: McqStageProps) {
  const { choices, correct, question, passage, imgSrc, chart, selected, greyed, previewedChoice, nudge, onChoiceClick, onReplay } = props;
  const answered = selected !== null;

  const speaker = (size: number) => (
    <button onClick={onReplay} aria-label="Read to me" className="rounded-full bg-indigo-700 flex items-center justify-center flex-none transition hover:scale-105 active:scale-90" style={{ width: size, height: size, boxShadow: "0 3px 0 0 #312e81" }}>
      <Volume2 className="text-white" style={{ width: Math.round(size * 0.46), height: Math.round(size * 0.46) }} strokeWidth={2} />
    </button>
  );

  const choicesGrid = (
    <div className="grid gap-3.5 w-full mx-auto" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(260px,100%),1fr))", maxWidth: passage ? undefined : 780 }}>
      {choices.map((choice, i) => {
        const isSelected = selected === choice;
        const isCorrectChoice = choice === correct;
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
            variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
            animate={shake ? { x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.5 } } : pop ? { scale: [1, 1.08, 1], transition: { duration: 0.3 } } : {}}
            onClick={(e) => {
              if (answered || isGreyed) return;
              onChoiceClick(choice, i, e.currentTarget.getBoundingClientRect());
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
          {imgSrc && <LoadingImage src={imgSrc} fallback={null} className="w-full h-[clamp(180px,34vh,340px)] object-contain p-2" />}
          <div className="px-5 pt-4 pb-5 flex flex-col gap-2.5 flex-1 justify-center">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold tracking-[0.14em] text-indigo-700">THE STORY</span>
              <button onClick={onReplay} className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1 hover:bg-indigo-100 active:scale-95 transition">
                <Volume2 className="w-3.5 h-3.5 text-indigo-700" strokeWidth={2.2} />
                <span className="text-[12.5px] font-extrabold text-indigo-700">Read to me</span>
              </button>
            </div>
            <p className="text-[19px] font-semibold leading-[1.7] text-zinc-700 whitespace-pre-line">{passage}</p>
          </div>
        </div>
        <div className="flex-[1_1_320px] max-w-[520px] flex flex-col gap-3.5 justify-center">
          <div className="flex items-center gap-3">
            {speaker(46)}
            <h2 className="font-[family-name:var(--font-baloo)] font-bold text-[clamp(21px,2vw,26px)] leading-tight text-indigo-950">{highlightQuestion(question)}</h2>
          </div>
          {choicesGrid}
          {nudgeEl}
        </div>
      </div>
    );
  }

  if (imgSrc && !chart) {
    return (
      <div className="flex flex-wrap gap-6 lg:gap-9 items-center justify-center w-full">
        <div className="flex-[1_1_360px] max-w-[600px] flex justify-center">
          <LoadingImage src={imgSrc} fallback={null} className="w-full max-h-[64vh] object-contain rounded-[24px] border-[3px] border-white shadow-[0_10px_40px_-12px_rgba(49,46,129,.25)]" />
        </div>
        <div className="flex-[1_1_320px] max-w-[520px] flex flex-col gap-3.5 justify-center">
          <div className="flex items-center gap-3">
            {speaker(48)}
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
      {chart}
      <div className="flex items-center gap-3.5 max-w-[720px]">
        {speaker(52)}
        <h1 className="font-[family-name:var(--font-baloo)] font-bold text-[clamp(23px,2.6vw,31px)] leading-tight text-indigo-950 text-center">{highlightQuestion(question)}</h1>
      </div>
      {choicesGrid}
      {nudgeEl}
    </div>
  );
}

/* ── Fixed bunny + speech bubble (bottom-left) ── */
export function BunnyBubble({ outfitId, state, bubble }: {
  outfitId: string | null;
  state: "idle" | "correct" | "incorrect" | "levelup";
  bubble?: { text: string; kind: "correct" | "incorrect" | "hint" } | null;
}) {
  const tone = !bubble ? null
    : bubble.kind === "correct" ? { bg: "#d1fae5", border: "#34d399", fg: "#065f46" }
    : bubble.kind === "incorrect" ? { bg: "#e0e7ff", border: "#a5b4fc", fg: "#3730a3" }
    : { bg: "#fffbeb", border: "#fcd34d", fg: "#92400e" };
  return (
    <div className="fixed left-3 sm:left-5 bottom-2 z-[6] flex items-end gap-2.5 pointer-events-none">
      <div className="w-[clamp(132px,15vw,210px)] h-[clamp(143px,16vw,227px)] flex-none relative">
        {state === "idle"
          ? <Bunny outfitId={outfitId} />
          : <BunnyReaction outfitId={outfitId} state={state} />}
      </div>
      {bubble && tone && (
        <motion.div
          key={bubble.text}
          initial={{ opacity: 0, scale: 0.8, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative max-w-[min(320px,44vw)] px-4 py-3 mb-12 border-2 shadow-[0_10px_30px_-10px_rgba(49,46,129,.25)]"
          style={{ background: tone.bg, borderColor: tone.border, borderRadius: "18px 18px 18px 4px" }}
        >
          <p className="text-[15.5px] font-bold leading-snug" style={{ color: tone.fg }}>{bubble.text}</p>
        </motion.div>
      )}
    </div>
  );
}

/* ── Fixed read-aloud + hint dock (bottom-right) ── */
export function QuestionDock({ onReplay, hint, showHint, hintDisabled, onHint }: {
  onReplay: () => void;
  hint?: string | null;
  showHint: boolean;
  hintDisabled: boolean;
  onHint: () => void;
}) {
  return (
    <div className="fixed right-3 sm:right-5 bottom-3 z-[6] flex items-center gap-2.5">
      <button onClick={onReplay} className="flex items-center gap-2 bg-white/95 border-[1.5px] border-indigo-200 rounded-full px-4 py-2.5 shadow-[0_4px_14px_-4px_rgba(49,46,129,.2)] hover:-translate-y-0.5 active:scale-95 transition">
        <Volume2 className="w-[19px] h-[19px] text-indigo-700" strokeWidth={2.2} />
        <span className="text-[15px] font-extrabold text-indigo-950">Read to me</span>
      </button>
      {hint && (
        <button onClick={onHint} disabled={hintDisabled} className="flex items-center gap-2 bg-white/95 border-[1.5px] border-amber-300 rounded-full px-4 py-2.5 shadow-[0_4px_14px_-4px_rgba(49,46,129,.2)] disabled:opacity-50 enabled:hover:-translate-y-0.5 enabled:active:scale-95 transition">
          <Lightbulb className="w-[19px] h-[19px] text-amber-600" strokeWidth={2.2} />
          <span className="text-[15px] font-extrabold text-amber-800">{showHint ? "Hint used" : "Hint"}</span>
        </button>
      )}
    </div>
  );
}

/* ── Fixed Next / Finish CTA (bottom-center, on feedback) ── */
export function NextCta({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 0, y: 14, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClick}
        className="fixed left-1/2 -translate-x-1/2 bottom-[80px] sm:bottom-[86px] z-[7] flex items-center gap-2.5 px-8 sm:px-10 py-3.5 rounded-full text-white font-[family-name:var(--font-baloo)] font-bold text-xl active:scale-95 transition"
        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 0 0 #4f46e5,0 10px 30px -8px rgba(79,70,229,.5)" }}
      >
        <span>{label}</span>
        <ArrowRight className="w-[22px] h-[22px]" strokeWidth={2.5} />
      </motion.button>
    </AnimatePresence>
  );
}
