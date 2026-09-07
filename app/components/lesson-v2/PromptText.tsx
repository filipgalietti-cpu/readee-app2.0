"use client";

import SpokenText from "./SpokenText";

/**
 * Authored emphasis, rendered rather than leaked.
 *
 * Lessons mark the important word with `**stars**`, the same convention TextFX
 * parses on the animated stage. But `scene.prompt` was rendered as a raw string,
 * so 76 prompts across 20 lessons - 55 of them Kindergarten - printed the
 * asterisks on screen to children who cannot read yet. Authoring markup was
 * reaching the child as punctuation noise around the one word that mattered.
 *
 * This is deliberately NOT TextFX. TextFX is the animated hero treatment for a
 * scene's key sentence; a prompt is a quiet instruction that happens to have one
 * emphasised word. Same markup, calmer rendering.
 *
 * Also strips the `word|alt` form TextFX supports, so a prompt never shows the
 * pipe.
 */
export default function PromptText({ text, className }: { text: string; className?: string }) {
  if (!text) return null;

  // Split on the marked runs, keeping them, so surrounding punctuation survives.
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        const marked = /^\*\*[^*]+\*\*$/.test(part);
        const clean = part.replace(/\*\*/g, "").split("|")[0];
        return marked ? (
          <strong key={i} className="font-extrabold text-violet-600">
            {clean}
          </strong>
        ) : (
          <span key={i}>{clean}</span>
        );
      })}
    </span>
  );
}

/**
 * Authored teaching text that could not have the visual stage.
 *
 * A scene's `fx` is meant to be the animated hero on the left. But the stage has
 * one occupant and the precedence is interaction, then image, then fx - so 226
 * of 627 authored fx never reached the child at all: 66 in the `full` layout,
 * which renders no fx whatsoever, 109 displaced by an interaction, 51 by a
 * picture. That is teaching content the author wrote, the factory paid for, and
 * nobody ever saw.
 *
 * Rather than fight over the stage, the text appears near the prompt where it
 * reads as what it is: the sentence being taught. Calm, not animated - the
 * animation belongs to the scenes that still own the stage.
 */
export function TeachingLine({ text }: { text: string }) {
  if (!text?.trim()) return null;
  return (
    <div className="rounded-xl bg-violet-50/70 px-4 py-2.5 text-[19px] font-semibold leading-snug text-[#1e1b3a]">
      <PromptText text={text} />
    </div>
  );
}


/** Does this prompt carry the passage the child must read? */
export function splitReadAloud(prompt: string): { lead: string; passage: string } | null {
  const m = /^([^:]{2,40}:)\s*(.+)$/.exec(prompt.trim());
  if (!m) return null;
  const passage = m[2].trim();
  // A two-word tail is a label, not a passage worth its own block.
  if (passage.split(/\s+/).length < 3) return null;
  return { lead: m[1].trim(), passage };
}

/**
 * "Read it out loud: She reads and they play."
 *
 * One string doing two jobs - an instruction to the child and the sentence they
 * must actually read - set in one weight, at one size, on one line. A first
 * grader has to work out where the instruction stops before they can start.
 *
 * So the instruction stays quiet and the passage becomes the thing on the page:
 * indented, larger, and in the brand violet, which is also the colour the
 * karaoke highlight uses, so "purple means read this" is consistent.
 */
export function ReadAloudPrompt({
  lead,
  passage,
  wordStartsMs,
}: {
  lead: string;
  passage: string;
  /** Lights the passage word by word as the teacher reads it. */
  wordStartsMs?: number[];
}) {
  return (
    <>
      <div className="text-[26px] font-semibold leading-snug text-zinc-500">{lead}</div>
      <div className="mt-3 border-l-4 border-violet-400 pl-5 text-[38px] font-bold leading-[1.2] tracking-tight [text-wrap:balance]">
        <SpokenText
          text={passage}
          wordStartsMs={wordStartsMs}
          activeClassName="text-violet-700"
          spokenClassName="text-violet-700"
          pendingClassName="text-violet-300"
        />
      </div>
    </>
  );
}
