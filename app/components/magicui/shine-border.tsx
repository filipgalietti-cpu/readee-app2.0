"use client";

/**
 * Magic UI — ShineBorder.
 *
 * Sourced from the Magic UI registry (https://magicui.design/docs/components/shine-border).
 * Vendored as a regular file in app/components/magicui/ so we don't
 * need a registry CLI to use it.
 *
 * Place inside any element with `position: relative` and `overflow:
 * hidden`. The component absolutely-positions itself to fill the
 * parent and renders an animated gradient border around the parent
 * via the CSS-mask-composite technique. Doesn't intercept pointer
 * events — content underneath stays interactive.
 *
 * Requires the `animate-shine` keyframe defined in globals.css.
 */

import { cn } from "@/lib/utils";

interface ShineBorderProps {
  /** Border thickness in pixels. */
  borderWidth?: number;
  /** Animation cycle in seconds. */
  duration?: number;
  /** A single hex string OR an array (gradient). */
  shineColor?: string | string[];
  className?: string;
  style?: React.CSSProperties;
}

export function ShineBorder({
  borderWidth = 1,
  duration = 14,
  shineColor = "#000000",
  className,
  style,
}: ShineBorderProps) {
  return (
    <div
      style={
        {
          "--border-width": `${borderWidth}px`,
          "--duration": `${duration}s`,
          backgroundImage: `radial-gradient(transparent,transparent, ${
            Array.isArray(shineColor) ? shineColor.join(",") : shineColor
          },transparent,transparent)`,
          backgroundSize: "300% 300%",
          mask: `linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)`,
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "var(--border-width)",
          ...style,
        } as React.CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position] motion-safe:animate-shine",
        className,
      )}
    />
  );
}
