"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { computeLevel, didLevelUp } from "@/lib/levels/levels";
import { Carrot, ChevronRight } from "lucide-react";

/**
 * Big celebratory progress card for completion screens.
 *
 * Two states:
 *   1. Just leveled up — full-bleed gradient, level icon, "You're now
 *      a {name}!" with a Rocket-style headline.
 *   2. Steady progress — soft card with a progress bar, "X carrots
 *      to {next name}".
 *
 * Callers pass priorLifetime (before this session) and the carrots
 * earned in this session. We diff them to decide which state to
 * render — no caller-side level math required.
 */
export default function LevelProgressCard({
  priorLifetimeCarrots,
  sessionCarrots,
  /** Whether the kid is on the max level + already past max threshold.
   *  Shown as "You've maxed every level — keep reading!" */
  href = null,
}: {
  priorLifetimeCarrots: number;
  sessionCarrots: number;
  href?: string | null;
}) {
  const prior = Math.max(0, Math.floor(priorLifetimeCarrots || 0));
  const session = Math.max(0, Math.floor(sessionCarrots || 0));
  const after = prior + session;
  const leveledUp = didLevelUp(prior, after);
  const post = computeLevel(after);
  const Icon = post.current.icon;

  // ─── Level-up celebration ────────────────────────────────────
  if (leveledUp) {
    const next = post.next;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 18, stiffness: 200, delay: 0.1 }}
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${post.current.accent.gradFrom} ${post.current.accent.gradTo} p-5 text-white shadow-xl`}
      >
        {/* Sparkle backdrop */}
        <div className="pointer-events-none absolute inset-0 opacity-30">
          {[...Array(12)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full bg-white"
              style={{
                top: `${(i * 73) % 100}%`,
                left: `${(i * 41) % 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1.4, 0.5],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                delay: (i * 0.13) % 1.6,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="relative flex items-start gap-4">
          <motion.span
            initial={{ rotate: -12, scale: 0.7 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.25, type: "spring", damping: 14 }}
            className="inline-flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white/25 shadow-inner"
          >
            <Icon className="h-9 w-9" strokeWidth={2.2} />
          </motion.span>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-widest text-white/80">
              Level up!
            </div>
            <h2 className="mt-0.5 text-2xl font-extrabold leading-tight">
              You&apos;re a {post.current.name}!
            </h2>
            <p className="mt-1 text-sm text-white/85">
              Level {post.current.number}
              {next
                ? ` — ${next.threshold - after} more carrots to ${next.name}.`
                : " — you've reached the top of the ladder. Keep reading!"}
            </p>
            {href && (
              <Link
                href={href}
                className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-zinc-900 transition hover:bg-white"
              >
                See all levels
                <ChevronRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── Steady progress card ────────────────────────────────────
  const carrotsToNext = post.next
    ? Math.max(0, post.next.threshold - after)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${post.current.accent.bg} ${post.current.accent.fg}`}
        >
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-sm font-bold text-zinc-900 dark:text-white">
              Level {post.current.number} — {post.current.name}
            </div>
            <div className="text-[10px] font-mono text-zinc-400">
              {after} <Carrot className="inline h-3 w-3 -mt-0.5 text-orange-400" strokeWidth={2.4} />
            </div>
          </div>
          {post.next ? (
            <>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800">
                <motion.div
                  initial={{ width: `${Math.min(100, Math.max(0, (computeLevel(prior).progress01) * 100))}%` }}
                  animate={{ width: `${Math.min(100, Math.max(0, post.progress01 * 100))}%` }}
                  transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
                  className={`h-full rounded-full ${post.current.accent.bg}`}
                />
              </div>
              <div className="mt-1 text-[11px] text-zinc-500 dark:text-slate-400">
                {carrotsToNext > 0
                  ? `${carrotsToNext} more carrots to ${post.next.name}.`
                  : "Ready to level up next round!"}
              </div>
            </>
          ) : (
            <div className="mt-1 text-[11px] text-zinc-500 dark:text-slate-400">
              Max level — you&apos;ve climbed every rung. Keep reading every day to stay sharp!
            </div>
          )}
        </div>
      </div>
      {href && (
        <Link
          href={href}
          className="mt-3 block text-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          See all levels →
        </Link>
      )}
    </motion.div>
  );
}
