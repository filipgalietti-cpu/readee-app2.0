"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Search,
  Sparkles,
  ClipboardCheck,
  Zap,
  Pause,
  ArrowLeft,
  Shuffle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import BuddyChat from "./BuddyChat";
import LiveBuddy from "./LiveBuddy";

export type BuddyMode = "freeform" | "read_with_me" | "word_meaning" | "story_time" | "quick_quiz";

const MODES: {
  id: Exclude<BuddyMode, "freeform">;
  title: string;
  desc: string;
  icon: any;
  gradient: string;
}[] = [
  {
    id: "read_with_me",
    title: "Read with me",
    desc: "Readee writes you a fresh passage and listens while you read it out loud.",
    icon: BookOpen,
    gradient: "from-violet-500 to-indigo-600",
  },
  {
    id: "word_meaning",
    title: "What does this word mean?",
    desc: "Readee picks 6 cool new words for you. Tap one and ask out loud.",
    icon: Search,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "story_time",
    title: "Tell me a story",
    desc: "Pick a topic. Readee writes the opening + asks what happens next.",
    icon: Sparkles,
    gradient: "from-pink-500 to-rose-600",
  },
  {
    id: "quick_quiz",
    title: "Quick quiz",
    desc: "Read a fresh short passage, then Readee asks 3 questions.",
    icon: ClipboardCheck,
    gradient: "from-amber-500 to-orange-600",
  },
];

const STORY_TOPICS = [
  "Dragons", "Space", "Friendship", "Mystery", "Animals", "Sports",
  "Underwater", "Time travel", "Inventions", "Magic", "Surprise me",
];

type GeneratedContent =
  | { mode: "read_with_me"; title: string; passage: string; gradeLevel: string; targetPattern?: string | null }
  | { mode: "quick_quiz"; title: string; passage: string; gradeLevel: string; questions: { prompt: string; choices: string[]; correct: string }[] }
  | { mode: "story_time"; topic: string; opening: string; predictionPrompt: string }
  | { mode: "word_meaning"; suggestions: { word: string; reason: string }[] };

export default function BuddyShell({
  childId,
  childName,
  initialGradeLevel,
}: {
  childId: string | null;
  childName: string | null;
  initialGradeLevel: string | null;
}) {
  const [selectedMode, setSelectedMode] = useState<Exclude<BuddyMode, "freeform"> | null>(null);
  const [liveMode, setLiveMode] = useState<"live" | "turns">("live");
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genErr, setGenErr] = useState<string | null>(null);
  const [storyTopic, setStoryTopic] = useState<string>("Surprise me");
  const [gradeLevel, setGradeLevel] = useState(initialGradeLevel ?? "2nd");

  // ─── Generate fresh content each time the kid picks a mode ──────────
  async function regenerate(opts?: { theme?: string; remix?: string }) {
    if (!selectedMode) return;
    setGenerating(true);
    setGenErr(null);
    try {
      const res = await fetch("/api/buddy/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: selectedMode,
          childId,
          theme: opts?.theme ?? (selectedMode === "story_time"
            ? (storyTopic === "Surprise me" ? null : storyTopic)
            : null),
          remix: opts?.remix ?? null,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setGenErr(json.error ?? "Couldn't generate content.");
      } else {
        setContent(json.content as GeneratedContent);
      }
    } catch (e: any) {
      setGenErr(e?.message ?? "Couldn't generate content.");
    } finally {
      setGenerating(false);
    }
  }

  // Auto-generate on mode entry
  useEffect(() => {
    if (selectedMode) {
      setContent(null);
      regenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMode]);

  // ─── Mode picker (entry surface) ────────────────────────────
  if (!selectedMode) {
    return (
      <div className="space-y-3">
        <ul className="grid gap-3 sm:grid-cols-2">
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setSelectedMode(m.id)}
                  className="group block w-full rounded-3xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${m.gradient} text-white shadow-sm`}
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <div className="mt-3 text-base font-bold text-zinc-900 dark:text-white">
                    {m.title}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">{m.desc}</div>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="rounded-2xl bg-violet-50 p-3 text-xs text-violet-800">
          <span className="font-bold">Tip: </span>
          {childName
            ? `Readee makes everything fresh for ${childName} every time — different passage, different story, different words.`
            : "Each activity gets fresh AI-written content tailored to your reader. Reroll any time."}
        </div>
      </div>
    );
  }

  const mode = MODES.find((m) => m.id === selectedMode)!;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setSelectedMode(null)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-violet-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All activities
        </button>
        <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setLiveMode("live")}
            className={`flex items-center gap-1 rounded-full px-3 py-1 transition ${
              liveMode === "live" ? "bg-violet-600 text-white shadow-sm" : "text-zinc-600"
            }`}
          >
            <Zap className="h-3 w-3" />
            Live
          </button>
          <button
            type="button"
            onClick={() => setLiveMode("turns")}
            className={`flex items-center gap-1 rounded-full px-3 py-1 transition ${
              liveMode === "turns" ? "bg-violet-600 text-white shadow-sm" : "text-zinc-600"
            }`}
          >
            <Pause className="h-3 w-3" />
            Step-by-step
          </button>
        </div>
      </div>

      <div className={`flex items-center gap-3 rounded-2xl bg-gradient-to-r ${mode.gradient} p-4 text-white`}>
        <mode.icon className="h-7 w-7 flex-shrink-0" strokeWidth={1.5} />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-90">Activity</div>
          <div className="text-base font-extrabold">{mode.title}</div>
        </div>
        <button
          type="button"
          onClick={() => regenerate()}
          disabled={generating}
          className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white hover:bg-white/30 disabled:opacity-60"
          title="Get a different one"
        >
          {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Shuffle className="h-3 w-3" />}
          {generating ? "Writing…" : "Different one"}
        </button>
      </div>

      {/* ─── Generated content panels per mode ─── */}
      {selectedMode === "story_time" && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Topic</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {STORY_TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setStoryTopic(t);
                  regenerate({ theme: t === "Surprise me" ? undefined : t });
                }}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  storyTopic === t
                    ? "border-pink-400 bg-pink-100 font-bold text-pink-800"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-pink-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {generating && !content && (
        <div className="flex items-center gap-2 rounded-2xl bg-violet-50 px-4 py-6 text-sm font-semibold text-violet-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          Readee is writing something just for you…
        </div>
      )}

      {genErr && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {genErr}
        </div>
      )}

      {content?.mode === "read_with_me" && (
        <div className="rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50/60 via-white to-pink-50/40 p-6">
          <div className="text-[10px] font-bold uppercase tracking-widest text-violet-700">
            Read this out loud · Grade {(content as any).gradeLevel}
            {(content as any).targetPattern && ` · Focus: ${(content as any).targetPattern}`}
          </div>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900">
            {(content as any).title}
          </h2>
          <p
            className="mt-3 whitespace-pre-line text-[20px] leading-[1.7] text-zinc-900"
            style={{
              fontFamily:
                'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif',
            }}
          >
            {(content as any).passage}
          </p>
        </div>
      )}

      {content?.mode === "quick_quiz" && (
        <div className="rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/60 via-white to-orange-50/40 p-6">
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
            Read this · Grade {(content as any).gradeLevel} · {(content as any).questions.length} questions to follow
          </div>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900">
            {(content as any).title}
          </h2>
          <p
            className="mt-3 whitespace-pre-line text-[18px] leading-[1.7] text-zinc-900"
            style={{
              fontFamily:
                'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif',
            }}
          >
            {(content as any).passage}
          </p>
          <div className="mt-3 text-xs text-amber-800">
            When you're done reading, tap the mic and tell Readee "I&apos;m ready" — Readee will ask
            you the {(content as any).questions.length} questions.
          </div>
        </div>
      )}

      {content?.mode === "story_time" && (
        <div className="rounded-3xl border-2 border-pink-200 bg-gradient-to-br from-pink-50/60 via-white to-rose-50/40 p-6">
          <div className="text-[10px] font-bold uppercase tracking-widest text-pink-700">
            Story · {(content as any).topic}
          </div>
          <p
            className="mt-2 whitespace-pre-line text-[20px] leading-[1.7] text-zinc-900"
            style={{
              fontFamily:
                'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif',
            }}
          >
            {(content as any).opening}
          </p>
          <div className="mt-4 rounded-2xl bg-pink-100 px-4 py-3 text-sm font-bold text-pink-900">
            {(content as any).predictionPrompt}
          </div>
          <div className="mt-3 text-xs text-pink-800">
            Tap the mic and tell Readee what you think happens next!
          </div>
        </div>
      )}

      {content?.mode === "word_meaning" && (
        <div className="rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 p-6">
          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
            Cool words to ask about
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {(content as any).suggestions.map((s: { word: string; reason: string }) => (
              <li key={s.word} className="rounded-2xl bg-white px-3 py-2 ring-1 ring-emerald-200">
                <div className="text-base font-extrabold text-emerald-800">{s.word}</div>
                <div className="text-[11px] text-emerald-700">{s.reason}</div>
              </li>
            ))}
          </ul>
          <div className="mt-3 text-xs text-emerald-800">
            Tap the mic and ask Readee &ldquo;What does <em>{(content as any).suggestions[0]?.word ?? "that"}</em> mean?&rdquo;
          </div>
        </div>
      )}

      {/* The actual buddy session */}
      {liveMode === "live" ? (
        <LiveBuddy
          passage={
            content?.mode === "read_with_me" || content?.mode === "quick_quiz"
              ? `${(content as any).title}\n\n${(content as any).passage}`
              : content?.mode === "story_time"
                ? `Story so far:\n${(content as any).opening}\n\n${(content as any).predictionPrompt}`
                : content?.mode === "word_meaning"
                  ? `Words the kid might ask about: ${(content as any).suggestions.map((s: any) => s.word).join(", ")}`
                  : ""
          }
          gradeLevel={gradeLevel}
          mode={selectedMode}
          childId={childId}
          onExhausted={() => setLiveMode("turns")}
        />
      ) : (
        <BuddyChat />
      )}
    </div>
  );
}
