"use client";

/**
 * Magic UI — RainbowButton, with extra `variant` options.
 *
 * Vendored from https://magicui.design/docs/components/rainbow-button.
 * The canonical Magic UI version only ships the "default" variant
 * (dark face in light mode, white face in dark mode). Real apps want
 * a few faces — added two more:
 *
 *   default → dark face (#121213), white text. The Magic UI canonical
 *             look. Best when you WANT a strong "premium dark button"
 *             vibe.
 *   white   → white face, violet text. Reads as "AI surface" rather
 *             than "generic dark button". Best when the surrounding
 *             UI is light and you don't want a dark slab.
 *   ghost   → transparent face — the rainbow shows through. Most
 *             "shimmer-y". Pairs with dark text on light bg, or
 *             white text on dark bg.
 *
 * The class strings are exported as constants AND a helper
 * (rainbowClasses) so they can be applied to non-button elements
 * (Next.js Link, anchor) — the sidebar uses them on a Link so
 * prefetch + navigation still work.
 *
 * Requires `@keyframes rainbow` + `.animate-rainbow` and the
 * `--color-1` … `--color-5` HSL custom properties in globals.css.
 */

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const SHARED_LAYOUT =
  "group relative inline-flex cursor-pointer items-center justify-center rounded-xl border-0 px-4 py-2 font-medium transition-colors disabled:pointer-events-none disabled:opacity-50";

const SHARED_RAINBOW =
  "animate-rainbow [background-size:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent]";

const SHARED_GLOW =
  "before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-[length:200%] before:[filter:blur(calc(0.8*1rem))]";

/** Canonical dark-face button (Magic UI's shipped look). */
export const RAINBOW_BUTTON_CLASSES = [
  SHARED_LAYOUT,
  SHARED_RAINBOW,
  "bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
  "text-white",
  SHARED_GLOW,
  "dark:bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(255,255,255,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] dark:text-zinc-900",
].join(" ");

/** White face, violet text. Inverse of canonical: light face in light mode. */
export const RAINBOW_BUTTON_WHITE_CLASSES = [
  SHARED_LAYOUT,
  SHARED_RAINBOW,
  "bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(255,255,255,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
  "text-violet-700 font-semibold",
  SHARED_GLOW,
  "dark:bg-[linear-gradient(#0f172a,#0f172a),linear-gradient(#0f172a_50%,rgba(15,23,42,0.6)_80%,rgba(15,23,42,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] dark:text-violet-200",
].join(" ");

/** Transparent / ghost — no inner face, the rainbow shows through. */
export const RAINBOW_BUTTON_GHOST_CLASSES = [
  SHARED_LAYOUT,
  SHARED_RAINBOW,
  // Two transparent gradients on top of the rainbow border layer — the
  // rainbow is only visible at the border edge.
  "bg-[linear-gradient(transparent,transparent),linear-gradient(transparent,transparent),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
  "text-zinc-900 font-semibold",
  SHARED_GLOW,
  "dark:text-white",
].join(" ");

export type RainbowVariant = "default" | "white" | "ghost";

export function rainbowClasses(variant: RainbowVariant = "default"): string {
  if (variant === "white") return RAINBOW_BUTTON_WHITE_CLASSES;
  if (variant === "ghost") return RAINBOW_BUTTON_GHOST_CLASSES;
  return RAINBOW_BUTTON_CLASSES;
}

interface RainbowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: RainbowVariant;
}

export const RainbowButton = forwardRef<HTMLButtonElement, RainbowButtonProps>(
  function RainbowButton({ className, children, variant = "default", ...props }, ref) {
    return (
      <button
        ref={ref}
        className={cn(rainbowClasses(variant), "h-11 px-8", className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);
