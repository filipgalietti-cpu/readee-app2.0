"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bunny } from "@/app/_components/Bunny/Bunny";
import { getShopIcon } from "@/lib/data/shop-icons";
import {
  ANNOUNCEMENTS,
  WHATS_NEW_SEEN_KEY,
  type Announcement,
} from "@/lib/data/announcements";
import { FluentIcon } from "@/app/_components/FluentIcon";
import { Glyph } from "@/app/_components/Glyph";

/** Read the dismissed-announcement ids from localStorage (per device). */
function readSeen(): string[] {
  try {
    const raw = localStorage.getItem(WHATS_NEW_SEEN_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function markSeen(id: string) {
  try {
    const next = Array.from(new Set([...readSeen(), id]));
    localStorage.setItem(WHATS_NEW_SEEN_KEY, JSON.stringify(next));
  } catch {
    /* localStorage unavailable, popup just shows again next time */
  }
}

/**
 * "What's New" popup shown on the kid home. Springs in once per new
 * announcement, remembers what's been seen so it never nags. Skins
 * announcements model the real bunny wearing each new outfit.
 */
export default function WhatsNew() {
  // Gate on mount so nothing renders during SSR (avoids hydration
  // mismatch, since the queue depends on localStorage).
  const [ready, setReady] = useState(false);
  const [queue, setQueue] = useState<Announcement[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // ?whatsnew=1 forces the popup regardless of what's been seen (QA aid).
    const force =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("whatsnew");
    const seen = force ? [] : readSeen();
    const unseen = ANNOUNCEMENTS.filter((a) => !seen.includes(a.id)).sort((a, b) =>
      a.date < b.date ? 1 : -1,
    );
    // Small delay so it lands after the home has settled, not mid-load.
    const t = setTimeout(
      () => {
        setQueue(unseen);
        setReady(true);
      },
      force ? 150 : 700,
    );
    return () => clearTimeout(t);
  }, []);

  const current = queue[index];

  const dismiss = () => {
    if (current) markSeen(current.id);
    if (index < queue.length - 1) {
      setIndex((i) => i + 1);
    } else {
      setQueue([]);
    }
  };

  if (!ready || !current) return null;

  // Portal to <body> so the fixed overlay escapes the dashboard's
  // Framer Motion transformed containers (a transformed ancestor makes
  // position:fixed resolve against it, which left the dash peeking out).
  return createPortal(
    <AnimatePresence>
      <motion.div
        key={current.id}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* backdrop */}
        <motion.button
          type="button"
          aria-label="Close"
          onClick={dismiss}
          className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* card */}
        <motion.div
          role="dialog"
          aria-modal="true"
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5"
          initial={{ scale: 0.8, y: 24, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 16, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
        >
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close"
            className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/80 text-slate-500 shadow-sm transition hover:bg-white hover:text-slate-700"
          >
            <Glyph name="x" size={16} />
          </button>

          <AnnouncementStage a={current} />

          <div className="px-6 pb-6 pt-5 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-violet-600">
              <FluentIcon name="sparkles" size={14} />
              New
            </span>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-slate-900">
              {current.title}
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-[15px] leading-relaxed text-slate-500">
              {current.body}
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <Link
                href={current.cta.href}
                onClick={dismiss}
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-b from-violet-600 to-violet-500 px-5 py-3.5 text-base font-extrabold text-white shadow-lg shadow-violet-500/30 transition hover:from-violet-700 hover:to-violet-600 active:scale-[0.98]"
              >
                {current.cta.label}
                <Glyph name="arrow-right" size={16} />
              </Link>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-2xl px-5 py-2.5 text-sm font-bold text-slate-400 transition hover:text-slate-600"
              >
                {queue.length > 1 && index < queue.length - 1 ? "Next" : "Got it"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

const LEAF_COLORS = ["#D9642B", "#C0392B", "#E0A82E", "#B5651D", "#E8743B", "#8C4A24"];

/** A small autumn leaf, reused for the drifting fall effect. */
function Leaf({ size = 18, color = "#D9642B" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2C7.5 6 4.5 11 12 22C19.5 11 16.5 6 12 2Z"
        fill={color}
        stroke="#7a3d18"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M12 5V20M12 10L8.5 12M12 13L15.5 15"
        stroke="#7a3d18"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Top visual: cycling bunny models for skins, a big icon otherwise. */
function AnnouncementStage({ a }: { a: Announcement }) {
  const outfitIds = a.kind === "skins" && a.outfitIds?.length ? a.outfitIds : null;
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!outfitIds || outfitIds.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % outfitIds.length), 4000);
    return () => clearInterval(t);
  }, [outfitIds]);

  const iconName = useMemo(() => (a.icon ? getShopIcon(a.icon) : "sparkles"), [a.icon]);

  // A little falling-confetti burst, generated once. Math.random is fine
  // here (client-only, gated behind the mount check in the parent).
  const leaves = useMemo(
    () =>
      Array.from({ length: 14 }, (_, n) => ({
        left: Math.round(Math.random() * 100),
        delay: Math.random() * 3,
        dur: 3.4 + Math.random() * 2.2,
        color: LEAF_COLORS[n % LEAF_COLORS.length],
        size: 14 + Math.round(Math.random() * 10),
        sway: 10 + Math.round(Math.random() * 16),
        spin: 180 + Math.round(Math.random() * 220),
      })),
    [],
  );

  return (
    <div className="relative flex h-64 items-center justify-center overflow-hidden bg-gradient-to-b from-violet-50 to-indigo-50">
      {/* drifting fall leaves */}
      <div className="pointer-events-none absolute inset-0">
        {leaves.map((l, n) => (
          <motion.span
            key={n}
            className="absolute top-0"
            style={{ left: `${l.left}%` }}
            initial={{ y: -24, opacity: 0 }}
            animate={{
              y: 288,
              x: [0, l.sway, -l.sway * 0.7, l.sway * 0.4, 0],
              rotate: [0, l.spin * 0.5, l.spin],
              opacity: [0, 1, 1, 1, 0],
            }}
            transition={{
              y: { duration: l.dur, delay: l.delay, repeat: Infinity, ease: "linear" },
              x: { duration: l.dur, delay: l.delay, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: l.dur, delay: l.delay, repeat: Infinity, ease: "easeInOut" },
              opacity: {
                duration: l.dur,
                delay: l.delay,
                repeat: Infinity,
                times: [0, 0.12, 0.5, 0.85, 1],
              },
            }}
          >
            <Leaf size={l.size} color={l.color} />
          </motion.span>
        ))}
      </div>

      {outfitIds ? (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={outfitIds[i]}
              className="h-56 w-52"
              initial={{ scale: 0.6, opacity: 0, rotate: -6 }}
              animate={{ scale: 1, opacity: 1, rotate: 0, y: [0, -8, 0] }}
              exit={{ scale: 0.6, opacity: 0, rotate: 6 }}
              transition={{
                scale: { type: "spring", stiffness: 300, damping: 20 },
                rotate: { type: "spring", stiffness: 300, damping: 20 },
                opacity: { duration: 0.35 },
                y: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <Bunny outfitId={outfitIds[i]} showRareSparkle />
            </motion.div>
          </AnimatePresence>
          {/* which costume you're on */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {outfitIds.map((id, n) => (
              <span
                key={id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  n === i ? "w-4 bg-violet-600" : "w-1.5 bg-violet-300"
                }`}
              />
            ))}
          </div>
        </>
      ) : (
        <motion.div
          className="grid h-24 w-24 place-items-center rounded-3xl bg-white text-violet-600 shadow-sm"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <FluentIcon name={iconName} size={48} />
        </motion.div>
      )}
    </div>
  );
}
