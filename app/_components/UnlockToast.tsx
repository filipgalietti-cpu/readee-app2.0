"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Outfit } from "@/app/_components/Bunny/outfits";
import { BunnyReaction } from "@/app/_components/Bunny/Bunny";
import type { Badge } from "@/app/_components/Badge/badges";
import { TIER } from "@/app/_components/Badge/badges";
import { BadgeBase } from "@/app/_components/Badge/Badge";

/**
 * Fullscreen celebration that fires when the unlock engine grants a
 * new outfit OR badge. Queues multiple grants — kid can earn an outfit
 * AND a badge from a single lesson completion, and we show them one
 * after the other.
 *
 * Caller passes the array of newly-granted items (mix outfits + badges
 * freely; the component routes each kind to the right renderer).
 * Pass an empty array to render nothing.
 */
export type UnlockableItem =
  | { kind: "outfit"; outfit: Outfit }
  | { kind: "badge"; badge: Badge };

/**
 * Convenience helper — turn a list of outfits and a list of badges into
 * a single mixed queue. Outfits show first (they're tied to the bunny
 * the kid is wearing right now), badges after.
 */
export function mixUnlocks(outfits: Outfit[] = [], badges: Badge[] = []): UnlockableItem[] {
  return [
    ...outfits.map((outfit): UnlockableItem => ({ kind: "outfit", outfit })),
    ...badges.map((badge): UnlockableItem => ({ kind: "badge", badge })),
  ];
}

export function UnlockToast({
  unlocked,
  onDone,
}: {
  // Accept either the new mixed queue OR (for backwards compat) the
  // legacy outfit-only array. Adapter normalizes to UnlockableItem[].
  unlocked: UnlockableItem[] | Outfit[];
  onDone?: () => void;
}) {
  const queue: UnlockableItem[] = unlocked.map((it) =>
    "kind" in it ? it : { kind: "outfit" as const, outfit: it },
  );
  const [idx, setIdx] = useState(0);
  const current = queue[idx];

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => {
      if (idx + 1 < queue.length) {
        setIdx(idx + 1);
      } else {
        setIdx(0);
        onDone?.();
      }
    }, 3800);
    return () => clearTimeout(t);
  }, [current, idx, queue.length, onDone]);

  if (!current) return <AnimatePresence />;

  const key = current.kind === "outfit" ? current.outfit.id : current.badge.id;
  const isOutfit = current.kind === "outfit";
  const tierStyle = current.kind === "badge" ? TIER[current.badge.tier] : null;

  // Card border tracks the item's own palette so each celebration feels
  // tied to the thing the kid earned.
  const borderColor = isOutfit
    ? current.outfit.border
    : tierStyle?.cardBorder ?? "#C9BEFF";

  const headerLabel = isOutfit ? "New outfit unlocked" : "Achievement unlocked";
  const name = isOutfit ? current.outfit.name : current.badge.name;
  const reason = isOutfit ? outfitReason(current.outfit) : current.badge.desc;
  const dismissCopy = idx + 1 < queue.length
    ? "Next reward"
    : isOutfit
    ? "Wear it later"
    : "Keep going";

  return (
    <AnimatePresence>
      <motion.div
        key={key}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm"
        onClick={() => {
          if (idx + 1 < queue.length) setIdx(idx + 1);
          else {
            setIdx(0);
            onDone?.();
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.6, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 24 }}
          className="mx-6 flex w-full max-w-sm flex-col items-center rounded-3xl border-2 bg-white px-6 pb-6 pt-8 text-center shadow-2xl"
          style={{ borderColor }}
        >
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-600">
            {headerLabel}
          </div>
          <div className="relative mt-2 h-44 w-40 sm:h-52 sm:w-48">
            {isOutfit ? (
              <BunnyReaction outfitId={current.outfit.id} state="levelup" />
            ) : (
              <BadgeBase badge={current.badge} showSparkle />
            )}
          </div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-zinc-900">
            {name}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">{reason}</p>
          <button
            type="button"
            className="mt-5 w-full rounded-2xl bg-violet-600 py-3 text-sm font-extrabold text-white transition hover:bg-violet-700 active:scale-[0.97]"
          >
            {dismissCopy}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function outfitReason(o: Outfit): string {
  switch (o.unlock.type) {
    case "milestone":
      return o.unlock.label;
    case "seasonal":
      return o.unlock.label;
    case "free":
      return "A starter gift for joining Readee";
    case "shop":
      return "Yours to wear";
  }
}
