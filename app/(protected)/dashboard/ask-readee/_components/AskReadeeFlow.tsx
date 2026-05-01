"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  Moon,
  Zap,
  Lightbulb,
  ChevronLeft,
} from "lucide-react";
import { askReadee } from "../actions";
import { TypingAnimation } from "@/app/components/magicui/typing-animation";

type Child = { id: string; first_name: string; reading_level: string | null };

type Mode = {
  id: "spark" | "story" | "drill" | "fact";
  label: string;
  sublabel: string;
  icon: any;
  questionCount: number;
  perQuestionTts: boolean;
  toneTopic: (base: string) => string;
};

const MODES: Mode[] = [
  {
    id: "spark",
    label: "Quick Read",
    sublabel: "1 passage + 3 questions",
    icon: Sparkles,
    questionCount: 3,
    perQuestionTts: false,
    toneTopic: (base) => base,
  },
  {
    id: "story",
    label: "Bedtime Story",
    sublabel: "Calm story · audio · no quiz",
    icon: Moon,
    questionCount: 0,
    perQuestionTts: false,
    toneTopic: (base) =>
      `A short bedtime story about ${base}. Warm, calm, gentle ending.`,
  },
  {
    id: "drill",
    label: "Phonics Drill",
    sublabel: "5 quick targeted questions",
    icon: Zap,
    questionCount: 5,
    perQuestionTts: true,
    toneTopic: (base) => `A short decodable passage about ${base}.`,
  },
  {
    id: "fact",
    label: "Fun Facts",
    sublabel: "Real-world info + 2 questions",
    icon: Lightbulb,
    questionCount: 2,
    perQuestionTts: false,
    toneTopic: (base) =>
      `A kid-friendly informational passage about ${base}.`,
  },
];

/** Mode-aware prompt suggestions for the rotating placeholder.
 *  Each mode gets its own evergreen pool so a Phonics Drill never
 *  suggests "How honeybees make honey." Personalized prompts (built
 *  from kid's library) lead the list when available, then evergreens
 *  fill in the rest. */
function buildPrompts(
  modeId: Mode["id"],
  suggestedTopic: string,
  recentTopics: string[],
): string[] {
  const personalized: string[] = [];
  if (suggestedTopic) personalized.push(suggestedTopic);
  const t1 = recentTopics[0];
  const t2 = recentTopics[1];

  let modeFlavored: string[] = [];
  let evergreens: string[] = [];

  if (modeId === "spark") {
    if (t1) modeFlavored.push(`A new adventure with ${t1}`);
    if (t2) modeFlavored.push(`A ${t2} mystery they have to solve`);
    evergreens = [
      "A friendly dragon who learns to share",
      "A short adventure about a brave puppy named Biscuit",
      "A team of kid astronauts exploring a new planet",
      "A talking robot that wants to learn how to dance",
    ];
  } else if (modeId === "story") {
    if (t1) modeFlavored.push(`A cozy bedtime story about ${t1}`);
    if (t2) modeFlavored.push(`A gentle ${t2} story before sleep`);
    evergreens = [
      "A sleepy bear getting ready for winter",
      "A little owl who can't fall asleep",
      "Two best friends watching the stars come out",
      "A bunny tucking in the whole forest one by one",
    ];
  } else if (modeId === "drill") {
    evergreens = [
      "Short-vowel words with the /a/ sound (cat, map, bag)",
      "Words ending in -at and -an",
      "Long-e spellings: ee, ea, y",
      "Digraphs sh and ch in simple sentences",
      "Silent-e words (cake, bike, home)",
      "R-controlled vowels: ar, or, er",
    ];
  } else if (modeId === "fact") {
    if (t1) modeFlavored.push(`Fun facts about ${t1}, kid-friendly`);
    if (t2) modeFlavored.push(`How ${t2} works, explained for kids`);
    evergreens = [
      "How honeybees make honey",
      "Why the moon changes shape every night",
      "What makes a rainbow appear after the rain",
      "How baby sea turtles find the ocean",
      "Why volcanoes erupt, kid-friendly",
    ];
  }

  return Array.from(new Set([...personalized, ...modeFlavored, ...evergreens])).slice(0, 6);
}

type Props = {
  children: Child[];
  recentTopics: string[];
  suggestedTopic: string;
  suggestedReason: string;
  isPremium: boolean;
};

type Step = "mode" | "topic" | "building";

export default function AskReadeeFlow({
  children,
  recentTopics,
  suggestedTopic,
  suggestedReason,
  isPremium,
}: Props) {
  const router = useRouter();
  const child = children[0];

  const [step, setStep] = useState<Step>("mode");
  const [mode, setMode] = useState<Mode | null>(null);
  const [topic, setTopic] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);

  // Cycling prompt suggestions are mode-aware — what's a great prompt
  // for "Bedtime Story" is wrong for "Phonics Drill". Computed inside
  // SlideTopic via buildPrompts(mode, suggestedTopic, recentTopics).

  function pickMode(m: Mode) {
    setMode(m);
    setStep("topic");
  }

  function back() {
    setErr(null);
    if (step === "topic") setStep("mode");
  }

  async function build() {
    if (!child || !mode) return;
    if (!isPremium) {
      router.push("/upgrade?reason=ask_readee");
      return;
    }
    setErr(null);
    setStep("building");
    try {
      const res = await askReadee({
        brief: {
          childId: child.id,
          topic: mode.toneTopic(topic),
          phonicsPattern: null,
          passage: { enabled: true },
          questionCount: mode.questionCount,
          media: {
            image: true,
            passageTts: true,
            perQuestionTts: mode.perQuestionTts,
          },
          shareWithCommunity: false,
        },
      });
      if (!res.ok) {
        if ((res as any).paywall) {
          router.push("/upgrade?reason=ask_readee");
          return;
        }
        setErr(res.error);
        setStep("topic");
        return;
      }
      router.push(`/parent-lesson/${res.contentId}?from=ask-readee`);
    } catch (e: any) {
      setErr(e?.message ?? "Couldn't build that one.");
      setStep("topic");
    }
  }

  if (!child) return null;

  const totalDots = 2;
  const dotIndex =
    step === "mode" ? 0 : step === "topic" ? 1 : 2;

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-indigo-50 to-violet-100 shadow-sm dark:border-violet-900/40 dark:from-violet-950/30 dark:via-indigo-950/30 dark:to-violet-950/40">
      {/* Top nav: back arrow + progress dots */}
      <div className="flex items-center justify-between px-5 pt-4">
        <button
          type="button"
          onClick={back}
          disabled={step === "mode" || step === "building"}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-violet-700 transition hover:bg-white/60 disabled:invisible dark:text-violet-300"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalDots + 1 }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === dotIndex
                  ? "w-6 bg-violet-600 dark:bg-violet-400"
                  : i < dotIndex
                  ? "w-1.5 bg-violet-400 dark:bg-violet-500"
                  : "w-1.5 bg-violet-200 dark:bg-violet-900"
              }`}
            />
          ))}
        </div>
        <div className="w-10" />
      </div>

      <div className="px-5 pb-6 pt-3">
        {step === "mode" && (
          <SlideMode
            childName={child.first_name}
            readingLevel={child.reading_level}
            suggestedReason={suggestedReason}
            onPick={pickMode}
          />
        )}
        {step === "topic" && mode && (
          <SlideTopic
            childName={child.first_name}
            readingLevel={child.reading_level}
            mode={mode}
            topic={topic}
            setTopic={setTopic}
            suggestedTopic={suggestedTopic}
            recentTopics={recentTopics}
            onBuild={build}
          />
        )}
        {step === "building" && mode && (
          <SlideBuilding childName={child.first_name} mode={mode} />
        )}

        {err && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5" />
            {err}
          </div>
        )}
      </div>
    </section>
  );
}

function SlideMode({
  childName,
  readingLevel,
  suggestedReason,
  onPick,
}: {
  childName: string;
  readingLevel: string | null;
  suggestedReason: string;
  onPick: (m: Mode) => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          For {childName}
        </span>
        <ReadingLevelBadge level={readingLevel} />
      </div>
      <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        What kind of reading?
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-slate-400">
        {suggestedReason}
      </p>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {MODES.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onPick(m)}
              className="flex items-center gap-3 rounded-2xl border-2 border-violet-200 bg-white px-4 py-3 text-left transition hover:border-violet-400 hover:shadow-sm dark:border-violet-900/40 dark:bg-slate-900"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-zinc-900 dark:text-white">
                  {m.label}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-slate-400">
                  {m.sublabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SlideTopic({
  childName,
  readingLevel,
  mode,
  topic,
  setTopic,
  suggestedTopic,
  recentTopics,
  onBuild,
}: {
  childName: string;
  readingLevel: string | null;
  mode: Mode;
  topic: string;
  setTopic: (t: string) => void;
  suggestedTopic: string;
  recentTopics: string[];
  onBuild: () => void;
}) {
  const ModeIcon = mode.icon;
  const trimmed = topic.trim();
  const canBuild = trimmed.length >= 3;
  const empty = trimmed.length === 0;

  const promptSuggestions = useMemo(
    () => buildPrompts(mode.id, suggestedTopic, recentTopics),
    [mode.id, suggestedTopic, recentTopics],
  );

  // Rotate through the prompt list while the input is empty.
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!empty || promptSuggestions.length === 0) return;
    const cur = promptSuggestions[idx % promptSuggestions.length];
    const total = cur.length * 55 + 2200;
    const t = setTimeout(
      () => setIdx((i) => (i + 1) % promptSuggestions.length),
      total,
    );
    return () => clearTimeout(t);
  }, [idx, empty, promptSuggestions]);

  const currentPrompt =
    promptSuggestions[idx % promptSuggestions.length] ?? "";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
        <span className="inline-flex items-center gap-1.5">
          <ModeIcon className="h-3.5 w-3.5" />
          {mode.label} for {childName}
        </span>
        <ReadingLevelBadge level={readingLevel} />
      </div>
      <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        What about?
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-slate-400">
        Type anything you want them to read about — or tap a suggestion.
      </p>

      <div className="relative mt-4 rounded-2xl border-2 border-violet-300 bg-white p-4 dark:border-violet-700 dark:bg-slate-900">
        <div className="relative">
          <textarea
            autoFocus
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={2}
            className="relative w-full resize-none rounded-lg border border-violet-200 bg-violet-50/40 px-3 py-2 text-base text-zinc-900 outline-none focus:border-violet-500 dark:border-violet-900/40 dark:bg-slate-950 dark:text-white"
          />
          {empty && currentPrompt && (
            <div className="pointer-events-none absolute inset-x-3 top-2 select-none text-base leading-[1.5] text-zinc-400 dark:text-slate-500">
              <TypingAnimation
                key={idx}
                duration={55}
                className="leading-[1.5]"
              >
                {currentPrompt}
              </TypingAnimation>
            </div>
          )}
        </div>

        {empty && currentPrompt && (
          <button
            type="button"
            onClick={() => setTopic(currentPrompt)}
            className="mt-2 inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 transition hover:bg-violet-100 dark:bg-violet-950/40 dark:text-violet-300"
          >
            <Sparkles className="h-3 w-3" />
            Use this suggestion
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onBuild}
        disabled={!canBuild}
        className="mt-5 w-full rounded-2xl bg-violet-600 px-5 py-3 text-base font-bold text-white shadow transition hover:bg-violet-700 active:scale-[.99] disabled:cursor-not-allowed disabled:bg-violet-300 disabled:shadow-none"
      >
        Build it →
      </button>
      <p className="mt-2 text-center text-[11px] text-zinc-500">
        Takes about 20–40 seconds.
      </p>
    </div>
  );
}

function ReadingLevelBadge({ level }: { level: string | null }) {
  if (!level) {
    return (
      <a
        href="/dashboard"
        className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200"
      >
        Set reading level →
      </a>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-violet-300 bg-violet-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-200">
      Reading at {level}
    </span>
  );
}

function SlideBuilding({
  childName,
  mode,
}: {
  childName: string;
  mode: Mode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
      <div className="text-base font-bold text-zinc-900 dark:text-white">
        Building {childName}&apos;s {mode.label.toLowerCase()}…
      </div>
      <div className="text-xs text-zinc-500 dark:text-slate-400">
        Writing the passage, drawing the picture, and recording the audio.
      </div>
    </div>
  );
}
