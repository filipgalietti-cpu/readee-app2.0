"use client";

/**
 * Luna Story Studio — a kid writes their own story with Luna, then shares it
 * with the community. A short 3-step wizard collects the story type, the kid's
 * idea, and the cover style. Generation is /api/luna/story; publishing routes
 * through the community review queue with the kid's first-name byline
 * (publishKidStory action).
 */

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Send,
  RotateCcw,
  ShieldCheck,
  Carrot,
  Check,
  BookOpen,
} from "lucide-react";
import LunaOrb from "../../_components/LunaOrb";
import TodayQuestionPlayer from "@/app/today/[slug]/_components/TodayQuestionPlayer";
import ReadAloudButton from "@/app/today/[slug]/_components/ReadAloudButton";
import { publishKidStory } from "../actions";
import { STORY_CARROTS } from "@/lib/luna/story-rewards";

type Phase = "make" | "generating" | "preview" | "published" | "error";

type QuizQ = {
  prompt: string;
  choices: string[];
  correct: string;
  hint: string | null;
};

type Story = {
  contentId: string | null;
  title: string;
  text: string;
  imageUrl: string | null;
  audioUrl: string | null;
  questions: QuizQ[];
};

const STORY_TYPES = [
  "Animals",
  "Space",
  "Magic",
  "Funny",
  "Mystery",
  "Superhero",
  "Ocean",
  "Dinosaurs",
];

const IMAGE_STYLES: { key: string; label: string; from: string; to: string }[] = [
  { key: "cartoon", label: "Cartoon", from: "#fbbf24", to: "#f43f5e" },
  { key: "realistic", label: "Realistic", from: "#64748b", to: "#334155" },
  { key: "watercolor", label: "Watercolor", from: "#a7f3d0", to: "#38bdf8" },
  { key: "comic", label: "Comic", from: "#f0abfc", to: "#6366f1" },
];

const GEN_CAPTIONS = [
  "Thinking of a story you'll love...",
  "Picking just-right words...",
  "Putting the pages together...",
  "Adding the fun parts...",
];

const BALOO = { fontFamily: "'Baloo 2','Nunito',sans-serif" };

export default function StoryStudio({
  childId,
  childName,
  avatarSrc,
}: {
  childId: string;
  childName: string;
  avatarSrc: string;
}) {
  const [phase, setPhase] = useState<Phase>("make");
  // Bumping this remounts the wizard so "Start over" returns to question 1.
  const [attempt, setAttempt] = useState(0);

  // The three inputs the wizard collects.
  const [storyType, setStoryType] = useState<string>("");
  const [idea, setIdea] = useState<string>("");
  const [imageStyle, setImageStyle] = useState<string>("cartoon");

  const [story, setStory] = useState<Story | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [published, setPublished] = useState<{ carrots: number } | null>(null);
  const [isPublishing, startPublish] = useTransition();

  function reset() {
    setStoryType("");
    setIdea("");
    setImageStyle("cartoon");
    setStory(null);
    setErrorMsg("");
    setPublished(null);
    setAttempt((n) => n + 1);
    setPhase("make");
  }

  async function generate() {
    setPhase("generating");
    try {
      const res = await fetch("/api/luna/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, storyType, idea, imageStyle }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setErrorMsg(
          data?.reason === "plan"
            ? "Story Studio is a Readee+ feature."
            : data?.error || "Luna hit a snag. Let's try again.",
        );
        setPhase("error");
        return;
      }
      setStory({
        contentId: data.contentId ?? null,
        title: data.story.title,
        text: data.story.text,
        imageUrl: data.story.imageUrl ?? null,
        audioUrl: data.story.audioUrl ?? null,
        questions: Array.isArray(data.story.questions) ? data.story.questions : [],
      });
      setPhase("preview");
    } catch {
      setErrorMsg("Something went wrong. Let's try again.");
      setPhase("error");
    }
  }

  function publish() {
    if (!story?.contentId) {
      setErrorMsg("This story can't be shared. Try making a new one.");
      setPhase("error");
      return;
    }
    startPublish(async () => {
      try {
        const res = await publishKidStory({ contentId: story.contentId! });
        if (!res.ok) {
          setErrorMsg(res.error);
          setPhase("error");
          return;
        }
        setPublished({ carrots: res.carrotsAwarded });
        setPhase("published");
      } catch {
        // A thrown/timed-out action must not leave the button stuck on
        // "Sending..." forever.
        setErrorMsg("That took too long. Please try publishing again.");
        setPhase("error");
      }
    });
  }

  const styleGradient = (() => {
    const s = IMAGE_STYLES.find((x) => x.key === imageStyle) ?? IMAGE_STYLES[0];
    return `linear-gradient(120deg, ${s.from}, ${s.to})`;
  })();

  return (
    <div
      className={`mx-auto px-4 pb-6 pt-2 sm:px-6 ${
        phase === "preview" ? "max-w-[1120px]" : "max-w-3xl"
      }`}
    >
      {phase !== "make" && (
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-violet-700 dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" /> Start over
        </button>
      )}

      {phase === "make" && (
        <div>
          <div className="mb-4 flex items-center justify-center gap-2.5">
            {/* Luna, our AI. The orb's halo box (size+90) is cropped to the
                blob so it adds no dead space. */}
            <div className="relative h-12 w-12 flex-none overflow-hidden rounded-full">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <LunaOrb mode="idle" size={44} />
              </div>
            </div>
            <h1
              className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white"
              style={BALOO}
            >
              Write a story with Luna
            </h1>
          </div>

          <Wizard
            key={attempt}
            storyType={storyType}
            setStoryType={setStoryType}
            idea={idea}
            setIdea={setIdea}
            imageStyle={imageStyle}
            setImageStyle={setImageStyle}
            onDone={generate}
          />

          <p className="mt-5 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center text-sm text-zinc-500 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 flex-none text-emerald-500" /> Every story is checked to keep readers safe. Check out our{" "}
            <Link
              href="/safety"
              className="font-bold text-violet-600 underline transition hover:text-violet-700 dark:text-violet-300"
            >
              safety policy
            </Link>
            .
          </p>
        </div>
      )}

      {phase === "generating" && <Generating />}

      {phase === "preview" && story && (
        <Preview
          story={story}
          childName={childName}
          avatarSrc={avatarSrc}
          styleGradient={styleGradient}
          publishing={isPublishing}
          onPublish={publish}
          onRetry={generate}
        />
      )}

      {phase === "published" && (
        <Published
          carrots={published?.carrots ?? 0}
          onAgain={reset}
        />
      )}

      {phase === "error" && (
        <div className="mt-10 rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-900/40 dark:bg-rose-950/20">
          <p className="text-base font-bold text-rose-800 dark:text-rose-200">{errorMsg}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
          >
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
        </div>
      )}
    </div>
  );
}

/* Thumbnail with a shimmer skeleton until the image loads, then a soft fade —
   so the type/style tiles never pop or flash a blank box. */
function ThumbImage({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <span className="relative block h-20 w-full overflow-hidden bg-zinc-100 dark:bg-slate-800 sm:h-24">
      {!loaded && (
        <span className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-slate-800 dark:to-slate-700" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 h-full w-full object-cover transition duration-300 ease-out group-hover:scale-[1.08] ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </span>
  );
}

/* ─────────────────── Shared input building blocks ─────────────────── */

function TypeChips({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STORY_TYPES.map((t) => {
        const slug = t.toLowerCase();
        const selected = value === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={`group overflow-hidden rounded-2xl border text-center text-sm font-bold transition hover:-translate-y-0.5 hover:shadow-md ${
              selected
                ? "border-violet-500 shadow-[0_0_0_3px_rgba(139,92,246,0.15)]"
                : "border-zinc-200 hover:border-violet-300 dark:border-slate-700"
            }`}
            style={BALOO}
          >
            {/* Example illustration of each story type. */}
            <ThumbImage src={`/images/story-types/${slug}.png`} />
            <span
              className={`block py-2 ${
                selected
                  ? "bg-violet-50 text-violet-800 dark:bg-violet-950/30 dark:text-violet-200"
                  : "bg-white text-zinc-700 dark:bg-slate-900/50 dark:text-slate-200"
              }`}
            >
              {t}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function StyleChips({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {IMAGE_STYLES.map((s) => (
        <button
          key={s.key}
          type="button"
          onClick={() => onChange(s.key)}
          className={`group overflow-hidden rounded-2xl border text-center text-sm font-bold transition hover:-translate-y-0.5 hover:shadow-md ${
            value === s.key
              ? "border-violet-500 shadow-[0_0_0_3px_rgba(139,92,246,0.15)]"
              : "border-zinc-200 hover:border-violet-300 dark:border-slate-700"
          }`}
          style={BALOO}
        >
          {/* Real example of each style (a friendly fox) so kids see the look. */}
          <ThumbImage src={`/images/story-styles/${s.key}.png`} />
          <span
            className={`block py-2 ${
              value === s.key
                ? "bg-violet-50 text-violet-800 dark:bg-violet-950/30 dark:text-violet-200"
                : "bg-white text-zinc-700 dark:bg-slate-900/50 dark:text-slate-200"
            }`}
          >
            {s.label}
          </span>
        </button>
      ))}
    </div>
  );
}

function IdeaBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      maxLength={200}
      placeholder="A brave space puppy who is scared of the dark..."
      className="w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-base text-zinc-900 outline-none transition focus:border-violet-400 focus:bg-white dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
    />
  );
}

function MakeButton({ onClick, disabled, label = "Make my story!" }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3.5 text-base font-extrabold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
      style={BALOO}
    >
      <Sparkles className="h-5 w-5" /> {label}
    </button>
  );
}

/* ─────────────────────────── Wizard (A) ─────────────────────────── */

function Wizard(props: MakerProps) {
  const { storyType, setStoryType, idea, setIdea, imageStyle, setImageStyle, onDone } = props;
  const [step, setStep] = useState(0);

  return (
    <div>
      <div className="mb-4 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-gradient-to-r from-indigo-500 to-violet-500" : "bg-zinc-200 dark:bg-slate-700"}`} />
        ))}
      </div>

      {step === 0 && (
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white" style={BALOO}>Pick a kind of story</h2>
          <div className="mt-4"><TypeChips value={storyType} onChange={setStoryType} /></div>
          <NextButton disabled={!storyType} onClick={() => setStep(1)} />
        </div>
      )}
      {step === 1 && (
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white" style={BALOO}>What happens in your story?</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">Tell Luna your idea. A few words is plenty.</p>
          <div className="mt-4"><IdeaBox value={idea} onChange={setIdea} /></div>
          <NextButton disabled={!idea.trim()} onClick={() => setStep(2)} />
        </div>
      )}
      {step === 2 && (
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white" style={BALOO}>How should it look?</h2>
          <div className="mt-4"><StyleChips value={imageStyle} onChange={setImageStyle} /></div>
          <MakeButton onClick={onDone} />
        </div>
      )}
    </div>
  );
}

function NextButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-base font-extrabold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
      style={BALOO}
    >
      Next <ArrowRight className="h-5 w-5" />
    </button>
  );
}

/* ─────────────────────────── Generating ─────────────────────────── */

function Generating() {
  const [cap, setCap] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCap((c) => (c + 1) % GEN_CAPTIONS.length), 1400);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="mt-10 flex flex-col items-center text-center">
      <LunaOrb mode="thinking" size={140} />
      <h2 className="mt-4 text-2xl font-extrabold text-zinc-900 dark:text-white" style={BALOO}>
        Luna is writing your story...
      </h2>
      <p className="mt-1 text-base text-zinc-600 dark:text-slate-300">{GEN_CAPTIONS[cap]}</p>
    </div>
  );
}

/* Cover with a shimmer skeleton until the (remote) image actually loads, so
   it fades in instead of popping/lagging. */
function CoverImage({
  src,
  styleGradient,
}: {
  src: string | null;
  styleGradient: string;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className="relative aspect-square overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 shadow-md ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-800"
      style={{ background: src ? undefined : styleGradient }}
    >
      {src && (
        <>
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-slate-800 dark:to-slate-700" />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            onLoad={() => setLoaded(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </>
      )}
    </div>
  );
}

/* ─────────────────────────── Preview ─────────────────────────── */

function Preview({
  story,
  childName,
  avatarSrc,
  styleGradient,
  publishing,
  onPublish,
  onRetry,
}: {
  story: Story;
  childName: string;
  avatarSrc: string;
  styleGradient: string;
  publishing: boolean;
  onPublish: () => void;
  onRetry: () => void;
}) {
  const wordCount = story.text.trim().split(/\s+/).filter(Boolean).length;
  // Each block eases up + fades in on its own delay, so the story reveals one
  // piece at a time instead of popping in all at once.
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
  });
  return (
    <div className="mt-4">
      {/* Daily Readee reader layout: image + passage LEFT, quiz sticky RIGHT. */}
      <div className="grid grid-cols-1 items-start gap-9 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* LEFT — the reading */}
        <div className="min-w-0">
          <motion.div
            {...rise(0)}
            className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-violet-700 dark:text-violet-300"
          >
            <Sparkles className="h-3 w-3" />
            Story Studio
          </motion.div>

          <motion.h1
            {...rise(0.08)}
            className="mt-2 text-[34px] font-extrabold leading-[1.1] tracking-tight text-zinc-900 dark:text-white sm:text-[38px]"
            style={BALOO}
          >
            {story.title}
          </motion.h1>

          <motion.div {...rise(0.18)} className="mt-3 flex items-center gap-2">
            <span
              className="h-7 w-7 flex-none rounded-full bg-cover bg-center shadow-sm ring-2 ring-white dark:ring-slate-800"
              style={{ backgroundImage: `url(${avatarSrc})` }}
            />
            <span className="text-sm font-bold text-zinc-600 dark:text-slate-300" style={BALOO}>
              Written by {childName}
            </span>
          </motion.div>

          <motion.div {...rise(0.28)} className="mt-5">
            <div className="mx-auto w-full max-w-[440px]">
              <CoverImage src={story.imageUrl} styleGradient={styleGradient} />
            </div>
          </motion.div>

          <motion.div
            {...rise(0.4)}
            className="mt-4 flex items-center gap-2 text-xs text-zinc-500 dark:text-slate-400"
          >
            <BookOpen className="h-3.5 w-3.5" />
            {wordCount} words · {Math.max(1, Math.round(wordCount / 150))} min read
            {story.audioUrl && <ReadAloudButton audioUrl={story.audioUrl} />}
          </motion.div>

          <motion.div
            {...rise(0.5)}
            className="mt-[18px] flex flex-col gap-[18px] whitespace-pre-line text-[19px] leading-[1.75] text-zinc-900 dark:text-slate-100"
            style={{
              fontFamily:
                'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif',
            }}
          >
            {story.text}
          </motion.div>
        </div>

        {/* RIGHT — the quiz, sticky, exactly like Daily Readee */}
        {story.questions.length > 0 && (
          <motion.div {...rise(0.55)} className="lg:sticky lg:top-[76px] lg:mt-[64px]">
            <TodayQuestionPlayer questions={story.questions} />
          </motion.div>
        )}
      </div>

      <motion.div
        {...rise(0.68)}
        className="mt-10 flex flex-col gap-2 sm:flex-row sm:justify-center"
      >
        <button
          type="button"
          onClick={onPublish}
          disabled={publishing}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-base font-extrabold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          style={BALOO}
        >
          <Send className="h-5 w-5" /> {publishing ? "Sending..." : "Publish to Readee"}
        </button>
        <button
          type="button"
          onClick={onRetry}
          disabled={publishing}
          className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-6 py-3.5 text-base font-bold text-indigo-600 transition hover:bg-zinc-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/50 dark:text-indigo-300"
          style={BALOO}
        >
          <RotateCcw className="h-5 w-5" /> Try again
        </button>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────── Published ─────────────────────────── */

function Published({ carrots, onAgain }: { carrots: number; onAgain: () => void }) {
  return (
    <div className="mt-8">
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-violet-50 p-8 text-center dark:border-emerald-900/40 dark:from-emerald-950/20 dark:to-violet-950/20">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
          <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-300" strokeWidth={3} />
        </span>
        <h2 className="mt-4 text-2xl font-extrabold text-zinc-900 dark:text-white" style={BALOO}>
          Sent to the library!
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-slate-300">
          Our team checks every story to keep Readee kind and safe. Yours will show
          up for other kids once it&apos;s approved.
        </p>
        {carrots > 0 && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-extrabold text-orange-700 dark:bg-orange-950/30 dark:text-orange-300">
            <Carrot className="h-4 w-4" /> +{carrots} carrots for posting!
          </div>
        )}
        <p className="mt-3 text-xs text-zinc-500 dark:text-slate-400">
          You&apos;ll earn {STORY_CARROTS.perRead} more carrots every time a kid reads it.
        </p>
      </div>
      <button
        type="button"
        onClick={onAgain}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3.5 text-base font-extrabold text-white transition hover:bg-violet-700"
        style={BALOO}
      >
        <Sparkles className="h-5 w-5" /> Make another story
      </button>
    </div>
  );
}

/* ─────────────────────────── shared types ─────────────────────────── */

type MakerProps = {
  storyType: string;
  setStoryType: (v: string) => void;
  idea: string;
  setIdea: (v: string) => void;
  imageStyle: string;
  setImageStyle: (v: string) => void;
  onDone: () => void;
};
