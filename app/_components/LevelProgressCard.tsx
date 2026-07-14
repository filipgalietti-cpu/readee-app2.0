"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { computeLevel, didLevelUp, levelUpBonus } from "@/lib/levels/levels";
import { Carrot, ChevronRight } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import LevelUpBurst from "@/app/_components/LevelUpBurst";

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
  /** Child id — required to grant the level-up bonus carrots to the
   *  spendable balance. Omit on read-only surfaces. */
  childId = null,
  /** Equipped bunny outfit id, for the level-up burst mascot. */
  outfitId = null,
  /** Whether the kid is on the max level + already past max threshold.
   *  Shown as "You've maxed every level — keep reading!" */
  href = null,
}: {
  priorLifetimeCarrots: number;
  sessionCarrots: number;
  childId?: string | null;
  outfitId?: string | null;
  href?: string | null;
}) {
  const prior = Math.max(0, Math.floor(priorLifetimeCarrots || 0));
  const session = Math.max(0, Math.floor(sessionCarrots || 0));
  const after = prior + session;
  const leveledUp = didLevelUp(prior, after);
  const post = computeLevel(after);
  const Icon = post.current.icon;
  const bonus = leveledUp ? levelUpBonus(post.current.number) : 0;

  // Grant the level-up bonus to the child's SPENDABLE carrots exactly once.
  // Bonus goes to the balance only (never lifetime carrots) so it can't
  // cascade into another level-up. Guarded by a ref so re-renders don't
  // double-award.
  const grantedRef = useRef(false);
  useEffect(() => {
    if (!leveledUp || !childId || bonus <= 0 || grantedRef.current) return;
    grantedRef.current = true;
    (async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.from("children").select("carrots").eq("id", childId).single();
      const current = Number(data?.carrots) || 0;
      await supabase.from("children").update({ carrots: current + bonus }).eq("id", childId);
    })();
  }, [leveledUp, childId, bonus]);

  // ─── Level-up celebration ────────────────────────────────────
  if (leveledUp) {
    const oldName = computeLevel(prior).current.name;
    return (
      <div className="relative w-full overflow-hidden rounded-3xl shadow-xl">
        <div className="w-full aspect-video">
          <LevelUpBurst
            oldName={oldName}
            newName={post.current.name}
            newLevel={post.current.number}
            bunnyOutfit={outfitId}
            carrotBonus={bonus}
          />
        </div>
        {href && (
          <Link
            href={href}
            className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-zinc-900 shadow transition hover:bg-white"
          >
            All levels
            <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>
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
