import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * EmptyState — shared empty-list / empty-tab card.
 *
 * Why: CLAUDE.md says "Every empty list/tab needs a designed state —
 * use the bunny mascot." This component is that designed state.
 *
 * Each `mascot` pose is a different bunny variant (same character,
 * different action) so different surfaces don't end up with the same
 * frozen celebrate-bunny everywhere. Generated via
 * scripts/seed-bunny-mascots.ts and shipped as static /public assets.
 */
export type MascotPose =
  | "celebrate"
  | "welcome"
  | "reading"
  | "thinking"
  | "sleepy"
  | "search"
  | "cheer"
  | "wave-clipboard"
  | "stars";

const MASCOT_SRC: Record<MascotPose, string> = {
  celebrate: "/images/ui/bunny-celebrate.png",
  welcome: "/images/ui/bunny-welcome.png",
  reading: "/images/ui/bunny-reading.png",
  thinking: "/images/ui/bunny-thinking.png",
  sleepy: "/images/ui/bunny-sleepy.png",
  search: "/images/ui/bunny-search.png",
  cheer: "/images/ui/bunny-cheer.png",
  "wave-clipboard": "/images/ui/bunny-wave-clipboard.png",
  stars: "/images/ui/bunny-stars.png",
};

export function EmptyState({
  title,
  description,
  action,
  variant = "bunny",
  mascot = "welcome",
  icon,
  size = "md",
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  /** "bunny" uses the mascot; "icon" lets the caller render a Lucide
   *  icon for surfaces where the mascot would feel out of place
   *  (e.g. a fail/error state). */
  variant?: "bunny" | "icon";
  /** Which bunny pose to show. Default is "welcome" — neutral and
   *  friendly. Pick a pose that matches the empty state's mood:
   *  cheer for streak surfaces, sleepy for "come back later",
   *  search for no-results, wave-clipboard for "you've got this"
   *  pre-action moments, etc. */
  mascot?: MascotPose;
  /** Slot for a Lucide icon (variant="icon"). */
  icon?: ReactNode;
  /** sm = tight (sidebar cards), md = default, lg = full-page heros. */
  size?: "sm" | "md" | "lg";
}) {
  const padding =
    size === "sm" ? "p-5" : size === "lg" ? "p-12" : "p-8";
  const imgSize =
    size === "sm" ? 64 : size === "lg" ? 160 : 112;

  return (
    <div
      className={`rounded-3xl border border-zinc-200 bg-white text-center dark:border-slate-800 dark:bg-slate-900/40 ${padding}`}
    >
      {variant === "bunny" ? (
        <div className="mx-auto mb-3" style={{ width: imgSize, height: imgSize }}>
          <Image
            src={MASCOT_SRC[mascot]}
            alt=""
            width={imgSize}
            height={imgSize}
            className="h-full w-full object-contain"
            priority={false}
          />
        </div>
      ) : icon ? (
        <div className="mx-auto mb-3 flex items-center justify-center text-zinc-400">
          {icon}
        </div>
      ) : null}
      <h3 className={`font-bold text-zinc-900 dark:text-white ${size === "lg" ? "text-xl" : "text-base"}`}>
        {title}
      </h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-slate-400">
          {description}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
