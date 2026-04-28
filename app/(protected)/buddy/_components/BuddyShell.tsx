"use client";

import { useState } from "react";
import {
  BookOpen,
  Search,
  Sparkles,
  ClipboardCheck,
  Zap,
  Pause,
  ArrowLeft,
} from "lucide-react";
import BuddyChat from "./BuddyChat";
import LiveBuddy from "./LiveBuddy";

export type BuddyMode = "freeform" | "read_with_me" | "word_meaning" | "story_time" | "quick_quiz";

const MODES: {
  id: BuddyMode;
  title: string;
  desc: string;
  icon: any;
  gradient: string;
  needsPassage: boolean;
}[] = [
  {
    id: "read_with_me",
    title: "Read with me",
    desc: "Read a passage out loud. Readee listens and helps when you get stuck.",
    icon: BookOpen,
    gradient: "from-violet-500 to-indigo-600",
    needsPassage: true,
  },
  {
    id: "word_meaning",
    title: "What does this word mean?",
    desc: "Ask Readee about any word. Get a kid-friendly definition + example.",
    icon: Search,
    gradient: "from-emerald-500 to-teal-600",
    needsPassage: false,
  },
  {
    id: "story_time",
    title: "Tell me a story",
    desc: "Readee tells you a short original story and asks what happens next.",
    icon: Sparkles,
    gradient: "from-pink-500 to-rose-600",
    needsPassage: false,
  },
  {
    id: "quick_quiz",
    title: "Quick quiz",
    desc: "Read a passage, then Readee asks 3 short questions to check understanding.",
    icon: ClipboardCheck,
    gradient: "from-amber-500 to-orange-600",
    needsPassage: true,
  },
];

export default function BuddyShell({
  childId,
  childName,
  initialGradeLevel,
}: {
  childId: string | null;
  childName: string | null;
  initialGradeLevel: string | null;
}) {
  const [selectedMode, setSelectedMode] = useState<BuddyMode | null>(null);
  const [liveMode, setLiveMode] = useState<"live" | "turns">("live");
  const [passage, setPassage] = useState(
    "The little fox stepped quietly through the fall leaves. She was looking for her best friend, the rabbit, who liked to hide in the soft yellow grass.",
  );
  const [gradeLevel, setGradeLevel] = useState(initialGradeLevel ?? "2nd");

  // ── Mode picker (entry surface) ────────────────────────────
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
            ? `Readee remembers what ${childName} has been working on and uses it to help.`
            : "Readee's voice is real-time — talk naturally and Readee answers in under a second."}
        </div>
      </div>
    );
  }

  const mode = MODES.find((m) => m.id === selectedMode)!;

  // ── Active session for the picked mode ─────────────────────
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
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-90">Activity</div>
          <div className="text-base font-extrabold">{mode.title}</div>
        </div>
      </div>

      {mode.needsPassage && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-semibold text-zinc-500">Grade</label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="rounded-lg border border-zinc-300 px-2 py-1 text-sm"
            >
              {["K", "1st", "2nd", "3rd", "4th"].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <label className="mt-3 block text-xs font-semibold text-zinc-500">
            Passage to read
            <textarea
              rows={4}
              value={passage}
              onChange={(e) => setPassage(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm leading-relaxed focus:border-violet-500 focus:outline-none"
            />
          </label>
        </div>
      )}

      {liveMode === "live" ? (
        <LiveBuddy
          passage={mode.needsPassage ? passage : ""}
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
