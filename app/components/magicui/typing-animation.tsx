"use client";

/**
 * Magic UI — TypingAnimation.
 *
 * Vendored from https://magicui.design/docs/components/typing-animation.
 * Adapted to use framer-motion (the project's existing import path)
 * instead of the new "motion/react" package the canonical source uses.
 *
 * Types out a string one character at a time. Re-mount via key prop
 * to restart with a new string.
 */

import { motion, type MotionProps } from "framer-motion";
import { useEffect, useState, type ElementType } from "react";

import { cn } from "@/lib/utils";

interface TypingAnimationProps extends MotionProps {
  children: string;
  className?: string;
  /** Milliseconds per character. */
  duration?: number;
  /** Delay before typing starts (ms). */
  delay?: number;
  as?: ElementType;
}

export function TypingAnimation({
  children,
  className,
  duration = 60,
  delay = 0,
  as: Component = "span",
  ...props
}: TypingAnimationProps) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const MotionComponent = motion(Component as any);

  useEffect(() => {
    const start = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(start);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const id = setInterval(() => {
      if (i < children.length) {
        setDisplayed(children.substring(0, i + 1));
        i++;
      } else {
        clearInterval(id);
      }
    }, duration);
    return () => clearInterval(id);
  }, [children, duration, started]);

  return (
    <MotionComponent
      className={cn("inline-block", className)}
      {...props}
    >
      {displayed}
    </MotionComponent>
  );
}
