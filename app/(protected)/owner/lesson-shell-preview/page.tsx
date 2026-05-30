"use client";

/**
 * Static preview of the LessonShellDesktop variants — translation of
 * the Claude Design wireframe (May 23 2026). Lets Filip ear-check the
 * desktop "large and in-charge" layout before we wire it into the
 * actual slideshow orchestrator.
 *
 * Use the variant picker at the top to cycle through:
 *   1. Intro anchor       (image left, anchor phrase right)
 *   2. Teach chart        (image left, table right)
 *   3. Example passage+QA (image left, passage card + Q&A right)
 *   4. No-image           (table full-width, no left panel)
 *   5. Practice intro     (celebration gradient left, anchor right)
 */
import { useState } from "react";
import {
  LessonShellDesktop,
  AnchorContent,
  ChartContent,
  ExampleContent,
  CelebrationContent,
  CelebrationLeftPanel,
} from "@/app/components/lesson/LessonShellDesktop";

type Variant = "intro" | "teach" | "example" | "no-image" | "practice-intro";

const VARIANTS: { id: Variant; label: string }[] = [
  { id: "intro", label: "Intro anchor" },
  { id: "teach", label: "Teach chart" },
  { id: "example", label: "Example (passage + Q&A)" },
  { id: "no-image", label: "No-image (full-width chart)" },
  { id: "practice-intro", label: "Practice intro" },
];

const SAMPLE_IMAGE =
  "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public/images/lessons/L.3.4b/S1.png";

export default function LessonShellPreviewPage() {
  const [variant, setVariant] = useState<Variant>("intro");

  return (
    <>
      {/* Floating variant picker — sits above the shell so you can swap
          variants live without leaving the page. */}
      <div className="fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 flex items-center gap-2 rounded-full border border-zinc-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
        <span className="px-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
          Preview
        </span>
        {VARIANTS.map((v) => (
          <button
            key={v.id}
            onClick={() => setVariant(v.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              variant === v.id
                ? "bg-violet-600 text-white"
                : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {variant === "intro" && (
        <LessonShellDesktop
          slideNum={1}
          totalSlides={7}
          lessonTitle="Prefix Power"
          imageUrl={SAMPLE_IMAGE}
          imageAlt="A word detective"
          audioPlaying
          onClose={() => history.back()}
          onNext={() => setVariant("teach")}
          contentSlot={
            <AnchorContent
              eyebrow="the big idea ↓"
              title="Great readers are detectives."
              highlight="detectives"
              body="They look for clues inside words to figure out what they mean."
            />
          }
        />
      )}

      {variant === "teach" && (
        <LessonShellDesktop
          slideNum={3}
          totalSlides={7}
          lessonTitle="Prefix Power"
          imageUrl={SAMPLE_IMAGE}
          imageAlt="A word detective with a magnifying glass"
          audioPlaying
          onClose={() => history.back()}
          onNext={() => setVariant("example")}
          contentSlot={
            <ChartContent
              title="Prefix clues"
              headers={["Prefix", "Means", "Like"]}
              rows={[
                { label: "re-", means: "again", example: "redo", tone: "violet" },
                { label: "un-", means: "not", example: "unhappy", tone: "blue" },
                { label: "pre-", means: "before", example: "preview", tone: "amber" },
                { label: "mis-", means: "wrong", example: "misread", tone: "emerald" },
              ]}
            />
          }
        />
      )}

      {variant === "example" && (
        <LessonShellDesktop
          slideNum={4}
          totalSlides={7}
          lessonTitle="Prefix Power"
          imageUrl={SAMPLE_IMAGE}
          imageAlt="Bella reading at her desk"
          audioPlaying={false}
          onClose={() => history.back()}
          onNext={() => setVariant("no-image")}
          contentSlot={
            <ExampleContent
              passage="Bella was unhappy because her favourite mug was missing. So she went back to her room to look — again."
              highlight="unhappy"
              qa={[
                { q: "Who?", a: "Bella", aTone: "violet" },
                { q: "How does she feel?", a: "not happy", aTone: "rose" },
              ]}
            />
          }
        />
      )}

      {variant === "no-image" && (
        <LessonShellDesktop
          slideNum={5}
          totalSlides={7}
          lessonTitle="Prefix Power"
          audioPlaying={false}
          onClose={() => history.back()}
          onNext={() => setVariant("practice-intro")}
          contentSlot={
            <div className="mx-auto w-full max-w-[820px]">
              <div className="mb-9 text-center text-[36px] font-extrabold tracking-tight">
                All five prefixes
              </div>
              <ChartContent
                headers={["Prefix", "Means", "Like"]}
                rows={[
                  { label: "re-", means: "again", example: "redo", tone: "violet" },
                  { label: "un-", means: "not", example: "unhappy", tone: "blue" },
                  { label: "pre-", means: "before", example: "preview", tone: "amber" },
                  { label: "mis-", means: "wrong", example: "misread", tone: "emerald" },
                  { label: "dis-", means: "opposite of", example: "dislike", tone: "rose" },
                ]}
              />
            </div>
          }
        />
      )}

      {variant === "practice-intro" && (
        <LessonShellDesktop
          slideNum={6}
          totalSlides={7}
          lessonTitle="Prefix Power"
          nextLabel="Start practice →"
          audioPlaying
          onClose={() => history.back()}
          onNext={() => setVariant("intro")}
          leftSlot={<CelebrationLeftPanel />}
          contentSlot={
            <CelebrationContent
              title="Time to try it yourself!"
              body="5 quick questions — see how many prefixes you can spot."
            />
          }
        />
      )}
    </>
  );
}
