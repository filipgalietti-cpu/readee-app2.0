"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { QuizResultItem } from "@/lib/lesson-engine/quiz";
import { BunnyReaction } from "@/app/_components/Bunny/Bunny";
import { computeLevel } from "@/lib/levels/levels";
import { playUrl } from "@/lib/lesson-engine/cues";
import { FluentIcon } from "@/app/_components/FluentIcon";
import { Glyph } from "@/app/_components/Glyph";

/**
 * QuizSummary — implements Filip's "Practice Summary" Claude Design
 * (claude.ai/design/p/11773f53… Practice Summary.dc.html) faithfully:
 * two-column layout — LEFT: the kid's bunny reacting to the score inside a
 * radial glow + a buddy line pill; RIGHT: stars+title, a single score card
 * (correct | carrots | question DOTS), the level-progress card, and the
 * gradient action buttons. Same star math, titles, glow colors, reactions,
 * and completion audio as the design + legacy runner.
 */
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" as const, delay },
});

export default function QuizSummary({
  quizTitle,
  standard,
  results,
  carrotsEarned,
  childId = null,
  priorLifetimeCarrots = 0,
  nextHref,
  againHref,
  backHref = "/dashboard",
  note,
}: {
  quizTitle: string;
  standard?: string;
  results: QuizResultItem[];
  carrotsEarned: number;
  bestStreak?: number;
  childId?: string | null;
  priorLifetimeCarrots?: number;
  nextHref?: string;
  note?: string;
  againHref?: string;
  backHref?: string;
}) {
  void childId;
  const totalQ = results.length;
  const correctCount = results.filter((r) => r.correct).length;
  // design getStars
  const stars =
    totalQ === 0 ? 0 : correctCount === totalQ ? 3 : correctCount >= totalQ - 1 ? 2 : correctCount >= Math.ceil(totalQ * 0.6) ? 1 : 0;
  const bunnyState = stars === 3 ? "levelup" : stars >= 1 ? "correct" : "incorrect";

  // Buddy lines rotate per visit — playful, not canned (Filip: "Booooyah")
  const BUDDY_LINES: Record<number, string[]> = {
    3: ["Booooyah!", "Do ya dance, ayee!", "Your bunny is doing a happy dance!", "Unstoppable!", "Chef's kiss!"],
    2: ["So close to perfect!", "Your bunny is so proud of you!", "Big brain hops!", "That was awesome!"],
    1: ["Nice hopping!", "You're getting stronger!", "Your bunny loved watching that!"],
    0: ["Your bunny believes in you!", "Shake it off. Hop again!", "Next time, we've got this!"],
  };
  const buddyLine = useMemo(() => {
    const lines = BUDDY_LINES[stars] ?? BUDDY_LINES[0];
    return lines[Math.floor(Math.random() * lines.length)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stars]);

  let title: string, subtitle: string, glowColor: string;
  if (stars === 3) {
    title = "Perfect Score!";
    subtitle = `You mastered ${standard ?? quizTitle}!`;
    glowColor = "rgba(196,181,253,.55)";
  } else if (stars === 2) {
    title = "Great Work!";
    subtitle = "Almost perfect. Keep it up!";
    glowColor = "rgba(165,180,252,.5)";
  } else if (stars === 1) {
    title = "Good Effort!";
    subtitle = "Practice makes perfect!";
    glowColor = "rgba(165,180,252,.45)";
  } else {
    title = "Keep Trying!";
    subtitle = "Let's give it another go!";
    glowColor = "rgba(186,230,253,.5)";
  }

  // level math from the real levels lib
  const after = priorLifetimeCarrots + carrotsEarned;
  const post = computeLevel(after);
  const progressPct = Math.min(100, Math.max(0, post.progress01 * 100));
  const carrotsToNext = post.next ? Math.max(0, post.next.threshold - after) : 0;

  // confetti (design: fires at correct >= total-1)
  const confetti = useMemo(() => {
    if (totalQ === 0 || correctCount < totalQ - 1) return [];
    const colors = ["#4ade80", "#6366f1", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#f43f5e"];
    const n = correctCount === totalQ ? 80 : 50;
    return Array.from({ length: n }, (_, i) => ({
      id: i,
      left: (i * 37.7) % 100,
      delay: ((i * 13) % 40) / 20,
      size: 6 + ((i * 7) % 8),
      color: colors[i % 7],
    }));
  }, [correctCount, totalQ]);

  // Post-quiz spoken recap — freshly recorded set (scripts/gen-quiz-summary-audio.ts),
  // replaces the legacy storage clips.
  useEffect(() => {
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    let file: string;
    if (totalQ > 0 && correctCount === totalQ) file = pick(["sum-perfect-1", "sum-perfect-2", "sum-perfect-3"]);
    else if (correctCount >= totalQ - 1) file = pick(["sum-great-1", "sum-great-2", "sum-great-3"]);
    else if (stars >= 1) file = pick(["sum-good-1", "sum-good-2"]);
    else file = pick(["sum-try-1", "sum-try-2"]);
    const t = window.setTimeout(() => playUrl(`/audio/quizzes-v2/_shared/${file}.mp3`), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-b from-white to-indigo-50">
      {/* confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {confetti.map((c) => (
          <motion.div
            key={c.id}
            className="absolute rounded-full"
            style={{ left: `${c.left}%`, top: -20, width: c.size, height: c.size, backgroundColor: c.color }}
            initial={{ y: -16, opacity: 1 }}
            animate={{ y: "105vh", rotate: 720, opacity: 0 }}
            transition={{ duration: 2.5, delay: c.delay, ease: "easeIn" }}
          />
        ))}
      </div>

      <div className="relative z-10 flex w-full max-w-[1040px] flex-wrap items-center justify-center gap-10 px-8 py-6">
        {/* ══ LEFT — bunny in glow + buddy line ══ */}
        <div className="flex min-w-0 max-w-[440px] flex-1 basis-[300px] flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative flex items-center justify-center"
          >
            <div
              className="absolute rounded-full"
              style={{
                width: "clamp(230px, 40vh, 340px)",
                height: "clamp(230px, 40vh, 340px)",
                background: `radial-gradient(circle, ${glowColor} 0%, rgba(238,242,255,0) 70%)`,
              }}
            />
            <div className="relative" style={{ height: "clamp(190px, 38vh, 330px)", aspectRatio: "240 / 260" }}>
              <BunnyReaction outfitId={null} state={bunnyState as "correct" | "incorrect" | "levelup"} />
            </div>
          </motion.div>
          <motion.div
            {...fadeUp(0.25)}
            className="mt-0.5 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-center text-[13px] font-extrabold text-zinc-600 shadow-sm"
          >
            {buddyLine}
          </motion.div>
        </div>

        {/* ══ RIGHT — stats column ══ */}
        <div className="flex min-w-0 max-w-[480px] flex-1 basis-[340px] flex-col gap-3.5">
          {/* stars + title */}
          <motion.div {...fadeUp(0.1)} className="text-center">
            <div className="mb-1.5 flex items-end justify-center gap-1">
              {[1, 2, 3].map((s) => (
                <motion.span
                  key={s}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + s * 0.1, type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Glyph name="star" size={20} />
                </motion.span>
              ))}
            </div>
            <h1 className="m-0 font-['Baloo_2'] text-[34px] font-extrabold leading-[1.1] tracking-[-0.01em] text-zinc-900">
              {title}
            </h1>
            <p className="mt-1 text-[15px] font-semibold text-zinc-500">{subtitle}</p>
            {note && <p className="mt-1 text-[15px] font-semibold text-indigo-600">{note}</p>}
          </motion.div>

          {/* score card: correct | carrots | question dots */}
          <motion.div
            {...fadeUp(0.2)}
            className="flex items-center gap-5 rounded-2xl border border-zinc-200 bg-white px-[18px] py-3 shadow-sm"
          >
            <div className="flex-1">
              <div className="font-['Baloo_2'] text-[28px] font-extrabold leading-none text-zinc-900">
                {correctCount}/{totalQ}
              </div>
              <div className="mt-[3px] text-[11px] font-bold text-zinc-500">Correct</div>
            </div>
            <div className="w-px self-stretch bg-zinc-200" />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-['Baloo_2'] text-[28px] font-extrabold leading-none text-orange-600">
                  +{carrotsEarned}
                </span>
                <FluentIcon name="carrot" size={20} />
              </div>
              <div className="mt-[3px] text-[11px] font-bold text-zinc-500">Carrots earned</div>
            </div>
            <div className="w-px self-stretch bg-zinc-200" />
            <div className="min-w-0 flex-[1.4]">
              <div className="flex flex-wrap gap-[5px]">
                {results.map((r) => (
                  <span
                    key={r.questionId}
                    className="inline-flex items-center justify-center rounded-full"
                    style={{
                      // band showcase: harder = bigger gold-ringed dot, easier = smaller
                      width: r.band === "harder" ? 24 : r.band === "easier" ? 16 : 20,
                      height: r.band === "harder" ? 24 : r.band === "easier" ? 16 : 20,
                      background: r.correct ? "#10b981" : "#f43f5e",
                      boxShadow: r.band === "harder" ? "0 0 0 2px #fbbf24" : undefined,
                    }}
                    title={`${r.prompt}${r.band === "harder" ? " (next-grade challenge!)" : r.band === "easier" ? " (support)" : ""}`}
                  >
                    <svg viewBox="0 0 24 24" width={r.band === "harder" ? 13 : 11} height={r.band === "harder" ? 13 : 11} fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d={r.correct ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                    </svg>
                  </span>
                ))}
              </div>
              <div className="mt-[5px] text-[11px] font-bold text-zinc-500">Questions</div>
            </div>
          </motion.div>

          {/* band showcase: stretched into next-grade material */}
          {results.some((r) => r.band === "harder" && r.correct) && (
            <motion.div
              {...fadeUp(0.25)}
              className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 ring-1 ring-amber-200"
            >
              <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-amber-400 text-white">
                <FluentIcon name="star" size={18} />
              </span>
              <div className="min-w-0">
                <div className="text-[13px] font-extrabold text-amber-800">
                  Leveled up to Grade 1 questions!
                </div>
                <div className="text-[11px] font-semibold text-amber-700">
                  {results.filter((r) => r.band === "harder" && r.correct).length} next-grade{" "}
                  {results.filter((r) => r.band === "harder" && r.correct).length === 1 ? "challenge" : "challenges"} conquered
                </div>
              </div>
            </motion.div>
          )}

          {/* level progress card (design's steady card, real level math) */}
          <motion.div {...fadeUp(0.3)} className="rounded-2xl border border-zinc-200 bg-white px-4 py-[13px] shadow-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500">
                <Glyph name="star" size={20} className="text-white" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-extrabold text-zinc-900">
                    Level {post.current.number}: {post.current.name}
                  </div>
                  <div className="flex items-center gap-[3px] font-mono text-[10px] text-zinc-400">
                    <span>{after}</span>
                    <FluentIcon name="carrot" size={11} />
                  </div>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-100">
                  <motion.div
                    className="h-full rounded-full bg-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
                  />
                </div>
                <div className="mt-1 text-[11px] font-semibold text-zinc-500">
                  {post.next ? `${carrotsToNext} more carrots to ${post.next.name}.` : "Max level. Keep reading!"}
                </div>
              </div>
            </div>
          </motion.div>

          {/* actions (design's gradient buttons) */}
          <motion.div {...fadeUp(0.4)} className="flex flex-col gap-[9px]">
            {nextHref && (
              <Link
                href={nextHref}
                className="block w-full rounded-2xl bg-gradient-to-r from-green-400 to-green-500 py-[13px] text-center text-[15px] font-extrabold text-emerald-950 shadow-[0_4px_0_0_#16a34a] active:scale-[.97]"
              >
                Next Standard →
              </Link>
            )}
            <div className="flex items-center gap-[9px]">
              {againHref && (
                <Link
                  href={againHref}
                  className="flex-1 rounded-2xl border-2 border-zinc-300 py-[11px] text-center text-sm font-bold text-zinc-900 hover:bg-zinc-100 active:scale-[.97]"
                >
                  Practice Again
                </Link>
              )}
              <Link
                href={backHref}
                className="flex-1 py-[11px] text-center text-[13px] font-bold text-zinc-500 hover:text-zinc-900"
              >
                Back to Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
