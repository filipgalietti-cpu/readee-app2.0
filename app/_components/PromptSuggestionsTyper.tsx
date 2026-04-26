"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { TypingAnimation } from "@/app/components/magicui/typing-animation";

/**
 * Cycles through a list of example prompts, typing each one out, holding
 * for a moment, then swapping to the next. Used as inline inspiration
 * under the AI wizard topic textareas — gives teachers/parents a feel
 * for the kind of prompt that produces good output.
 *
 * Tap one to apply it to the field via onPick.
 */
export default function PromptSuggestionsTyper({
  suggestions,
  onPick,
  holdMs = 2200,
}: {
  suggestions: string[];
  onPick?: (suggestion: string) => void;
  /** How long the fully-typed prompt sits before rotating to the next. */
  holdMs?: number;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (suggestions.length === 0) return;
    const current = suggestions[idx % suggestions.length];
    // Roughly: type duration (chars × 50ms) + hold duration → swap.
    const total = current.length * 55 + holdMs;
    const t = setTimeout(() => setIdx((i) => (i + 1) % suggestions.length), total);
    return () => clearTimeout(t);
  }, [idx, suggestions, holdMs]);

  if (suggestions.length === 0) return null;
  const current = suggestions[idx % suggestions.length];

  return (
    <div className="mt-2 flex items-start gap-2 rounded-xl border border-violet-100 bg-violet-50/50 px-3 py-2 text-xs dark:border-violet-900/40 dark:bg-violet-950/20">
      <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-violet-500" />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
          Try a prompt like
        </div>
        <div className="mt-0.5 text-zinc-700 dark:text-slate-300">
          <TypingAnimation
            // Re-mount on idx change so each suggestion starts from blank
            key={idx}
            duration={50}
            className="leading-relaxed"
          >
            {current}
          </TypingAnimation>
          <span className="ml-0.5 inline-block w-[1px] animate-pulse bg-violet-500 align-baseline" style={{ height: "1em" }} />
        </div>
        {onPick && (
          <button
            type="button"
            onClick={() => onPick(current)}
            className="mt-1 inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-violet-700 shadow-sm transition hover:bg-violet-100 dark:bg-slate-900 dark:text-violet-300"
          >
            Use this
          </button>
        )}
      </div>
    </div>
  );
}
