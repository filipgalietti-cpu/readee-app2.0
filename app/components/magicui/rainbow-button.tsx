"use client";

/**
 * Magic UI — RainbowButton.
 *
 * Vendored from https://magicui.design/docs/components/rainbow-button
 * with one addition: the styling is also exported as a class string
 * (RAINBOW_BUTTON_CLASSES) so it can be applied to non-button elements
 * like Next.js Link, which the sidebar uses for navigation.
 *
 * Requires `@keyframes rainbow` + `.animate-rainbow` and the
 * `--color-1` … `--color-5` HSL custom properties in globals.css.
 */

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const RAINBOW_BUTTON_CLASSES = [
  // Layout
  "group relative inline-flex cursor-pointer items-center justify-center rounded-xl border-0 px-4 py-2 font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  // Animated gradient + sizing
  "animate-rainbow [background-size:200%]",
  // Background composition (button face on top, gradient underneath)
  "bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
  "[background-clip:padding-box,border-box,border-box] [background-origin:border-box]",
  "[border:calc(0.08*1rem)_solid_transparent]",
  // Light text on the dark face
  "text-white",
  // Rainbow glow under the button
  "before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-[length:200%] before:[filter:blur(calc(0.8*1rem))]",
  // Dark mode flips the face to white-on-light
  "dark:bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(255,255,255,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] dark:text-zinc-900",
].join(" ");

interface RainbowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const RainbowButton = forwardRef<HTMLButtonElement, RainbowButtonProps>(
  function RainbowButton({ className, children, ...props }, ref) {
    return (
      <button
        ref={ref}
        className={cn(RAINBOW_BUTTON_CLASSES, "h-11 px-8", className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);
