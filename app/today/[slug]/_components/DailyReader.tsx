"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import TodayQuestionPlayer from "./TodayQuestionPlayer";
import ReadAloudButton from "./ReadAloudButton";
import { FluentIcon } from "@/app/_components/FluentIcon";

type Q = {
  prompt: string;
  choices: string[];
  correct: string;
  hint: string | null;
};

export type DailyRendition = {
  title: string;
  body: string;
  audioUrl: string | null;
  questions: Q[];
};

/**
 * Leveled Daily Readee reader. Renders the passage column + quiz card
 * and, when the day has a K-1 easy rendition, a two-chip level toggle
 * ("Short read" / "Full read") that swaps passage, narration audio, and
 * MCQs together. Days without an easy rendition render exactly as before,
 * no toggle.
 *
 * Completion safety: TodayQuestionPlayer is keyed by level, so switching
 * restarts the quiz UI, but /api/daily/complete upserts one daily_reads
 * row per child per date - the day counts complete once no matter which
 * level (or how many) the child finishes.
 */
export default function DailyReader({
  theme,
  dateLabel,
  date,
  imageUrl,
  full,
  easy,
  defaultLevel,
}: {
  theme: string;
  dateLabel: string;
  date: string;
  imageUrl: string | null;
  full: DailyRendition;
  easy: DailyRendition | null;
  /** Server-computed: children placed at K or 1st start on the short read. */
  defaultLevel: "easy" | "full";
}) {
  const [level, setLevel] = useState<"easy" | "full">(easy ? defaultLevel : "full");
  const r = level === "easy" && easy ? easy : full;
  const wordCount = r.body.split(/\s+/).filter(Boolean).length;

  return (
    <div className="grid grid-cols-1 items-start gap-9 lg:grid-cols-[minmax(0,1fr)_380px]">
      {/* LEFT — the reading */}
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-violet-700">
          <FluentIcon name="sparkles" size={12} />
          {theme} · {dateLabel}
        </div>

        {easy && (
          <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1">
            {(
              [
                { id: "easy", label: "Short read" },
                { id: "full", label: "Full read" },
              ] as const
            ).map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setLevel(chip.id)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-bold transition ${
                  level === chip.id
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-zinc-500 hover:text-violet-700"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.h1
            key={`title-${level}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="mt-2 font-display text-[34px] font-extrabold leading-[1.1] tracking-tight text-zinc-900 sm:text-[38px]"
          >
            {r.title}
          </motion.h1>
        </AnimatePresence>

        {imageUrl && (
          <div className="mt-5 flex justify-center">
            {/* Square (1024²) illustrations — contain, not cover, so the
                picture is never cropped. Border hugs the image itself. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              className="max-h-[460px] w-auto max-w-full rounded-3xl border border-zinc-200 object-contain shadow-sm"
            />
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
          <FluentIcon name="open-book" size={14} />
          {wordCount} words · {Math.max(1, Math.round(wordCount / 150))} min read
          {/* Keyed by level so switching tears down the old Audio element
              (its unmount cleanup pauses playback) and points at the right
              rendition's narration. */}
          <ReadAloudButton key={level} audioUrl={r.audioUrl} />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`body-${level}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="mt-[18px] flex flex-col gap-[18px] whitespace-pre-line text-[19px] leading-[1.75] text-zinc-900"
            style={{
              fontFamily:
                'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif',
            }}
          >
            {r.body}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* RIGHT — the quiz (sticky on desktop, aligned with the illustration) */}
      <div className="lg:sticky lg:top-[76px] lg:mt-[88px]">
        <TodayQuestionPlayer key={level} date={date} questions={r.questions} />
      </div>
    </div>
  );
}
