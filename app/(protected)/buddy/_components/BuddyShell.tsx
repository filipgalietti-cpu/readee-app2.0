"use client";

import { useState } from "react";
import { Zap, Pause, Info } from "lucide-react";
import BuddyChat from "./BuddyChat";
import LiveBuddy from "./LiveBuddy";

export default function BuddyShell() {
  // Default to Step-by-step. Live mode requires Gemini Live API
  // access on the Google AI Studio project — separate SKU from
  // regular Gemini API and not enabled by default. Once a teacher
  // enables it in their project, they can flip to Live here.
  const [mode, setMode] = useState<"live" | "turns">("turns");
  const [passage, setPassage] = useState(
    "The little fox stepped quietly through the fall leaves. She was looking for her best friend, the rabbit, who liked to hide in the soft yellow grass.",
  );
  const [gradeLevel, setGradeLevel] = useState("2nd");

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <label className="block text-xs font-semibold text-zinc-500">
            Grade
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="ml-2 rounded-lg border border-zinc-300 px-2 py-1 text-sm"
            >
              {["K", "1st", "2nd", "3rd", "4th"].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </label>
          <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode("live")}
              className={`flex items-center gap-1 rounded-full px-3 py-1 transition ${
                mode === "live"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-zinc-600"
              }`}
            >
              <Zap className="h-3 w-3" />
              Live
            </button>
            <button
              type="button"
              onClick={() => setMode("turns")}
              className={`flex items-center gap-1 rounded-full px-3 py-1 transition ${
                mode === "turns"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-zinc-600"
              }`}
            >
              <Pause className="h-3 w-3" />
              Step-by-step
            </button>
          </div>
        </div>
        <label className="mt-3 block text-xs font-semibold text-zinc-500">
          Passage you&apos;re reading
          <textarea
            rows={4}
            value={passage}
            onChange={(e) => setPassage(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm leading-relaxed focus:border-violet-500 focus:outline-none"
          />
        </label>
      </div>

      {mode === "live" && (
        <div className="flex items-start gap-2 rounded-2xl border border-violet-200 bg-violet-50/70 px-3 py-2 text-xs text-violet-800">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>
            Live mode needs Gemini Live API enabled on your Google AI
            Studio project — a separate SKU from regular Gemini API.
            If the mic spins, switch to Step-by-step (works without
            Live access).
          </span>
        </div>
      )}

      {mode === "live" ? (
        <LiveBuddy
          passage={passage}
          gradeLevel={gradeLevel}
          onExhausted={() => setMode("turns")}
        />
      ) : (
        <BuddyChat />
      )}
    </div>
  );
}
