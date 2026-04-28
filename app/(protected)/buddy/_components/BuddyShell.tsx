"use client";

import { useState } from "react";
import { Zap, Pause } from "lucide-react";
import BuddyChat from "./BuddyChat";
import LiveBuddy from "./LiveBuddy";

export default function BuddyShell() {
  // Default to Live mode now that Vertex AI Live API is wired
  // (gemini-live-2.5-flash-native-audio, GA). Step-by-step remains
  // available as a fall-back if anything goes wrong.
  const [mode, setMode] = useState<"live" | "turns">("live");
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
