/**
 * Skeleton primitives — shape-matched loading placeholders.
 *
 * Why: CLAUDE.md says "Skeleton loaders, not spinners." Spinners
 * communicate "we're busy"; skeletons communicate "here is the
 * shape of what is about to appear." Skeletons reduce perceived
 * latency on page loads because the user's eye latches onto the
 * outline instead of waiting for the wheel.
 *
 * Use these on any await/data fetch that gates rendering of a
 * full page or card. Keep raw spinners only for inline mid-action
 * states ("Saving…", "Sending…") where the user just clicked
 * something and needs immediate "we got it" feedback.
 */

import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-zinc-200/70 dark:bg-slate-800/60",
        className,
      )}
      {...props}
    />
  );
}

/** Stacked text-line shimmer. Mimics a paragraph. */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-3 rounded-md",
            i === lines - 1 ? "w-4/6" : "w-full",
          )}
        />
      ))}
    </div>
  );
}

/**
 * Generic card skeleton — title row + body lines + footer row.
 * Tuned to read as "a content card is about to appear" on the
 * parent-facing surfaces (practice-hub, journey, assessment-results,
 * dashboard tiles).
 */
export function SkeletonCard({
  className,
  bodyLines = 3,
}: {
  className?: string;
  bodyLines?: number;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-2 w-1/5" />
        </div>
      </div>
      <SkeletonText lines={bodyLines} className="mt-4" />
    </div>
  );
}

/**
 * Centered, full-viewport page skeleton — title block, then a
 * column of cards. Replaces the bare spinner on first paint of
 * parent surfaces so the user sees layout, not a wheel.
 */
export function SkeletonPage({ cards = 3 }: { cards?: number }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="space-y-3">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-8 w-2/3 rounded-md" />
        <Skeleton className="h-3 w-1/2 rounded-md" />
      </div>
      <div className="mt-8 space-y-4">
        {Array.from({ length: cards }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
