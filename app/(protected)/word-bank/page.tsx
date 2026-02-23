"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { wordBank, type WordEntry } from "@/lib/word-bank/words";

const CATEGORY_FILTERS = [
  { label: "All", tag: null },
  { label: "Animals", tag: "animal" },
  { label: "Food", tag: "food" },
  { label: "Things", tag: "thing" },
  { label: "Nature", tag: "nature" },
  { label: "Verbs", tag: "verb" },
  { label: "Sight Words", tag: "sight" },
  { label: "CVC", tag: "cvc" },
];

const FREE_WORD_LIMIT = 20;

export default function WordBankPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
      }
    >
      <WordBankContent />
    </Suspense>
  );
}

function WordBankContent() {
  const [userPlan, setUserPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlan() {
      const supabase = supabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .single();
        setUserPlan(
          (profile as { plan?: string } | null)?.plan || "free"
        );
      }
      setLoading(false);
    }
    fetchPlan();
  }, []);

  const filteredWords = useMemo(() => {
    if (!activeFilter) return wordBank;
    return wordBank.filter((w) => w.tags.includes(activeFilter));
  }, [activeFilter]);

  const isPremium = userPlan === "premium";

  function playWord(entry: WordEntry) {
    setPlayingWord(entry.word);
    const audio = new Audio(entry.audio);
    audio.addEventListener("ended", () => setPlayingWord(null));
    audio.addEventListener("error", () => setPlayingWord(null));
    audio.play().catch(() => setPlayingWord(null));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20 px-4 pt-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-2xl">
            📚
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-slate-100 tracking-tight">
              Word Bank
            </h1>
            <p className="text-sm text-zinc-500 dark:text-slate-400">
              {filteredWords.length} words &middot; Tap to hear
            </p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6 -mx-1 px-1 scrollbar-hide">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setActiveFilter(f.tag)}
            className={`flex-shrink-0 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
              activeFilter === f.tag
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-zinc-100 dark:bg-slate-800 text-zinc-600 dark:text-slate-400 hover:bg-zinc-200 dark:hover:bg-slate-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Word grid */}
      <div className="relative">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
          {filteredWords.map((entry, idx) => {
            const isLocked = !isPremium && idx >= FREE_WORD_LIMIT;
            const isPlaying = playingWord === entry.word;

            return (
              <button
                key={entry.word}
                onClick={() => !isLocked && playWord(entry)}
                disabled={isLocked}
                className={`relative rounded-xl border-2 p-3 text-center transition-all duration-200 ${
                  isLocked
                    ? "blur-[3px] opacity-50 cursor-default border-zinc-200 dark:border-slate-700 bg-zinc-50 dark:bg-slate-800"
                    : isPlaying
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400 scale-[1.05] shadow-md"
                    : "border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm active:scale-95"
                }`}
              >
                <div
                  className={`text-base font-bold capitalize ${
                    isPlaying
                      ? "text-indigo-700 dark:text-indigo-300"
                      : "text-zinc-800 dark:text-slate-200"
                  }`}
                >
                  {entry.word}
                </div>
                {isPlaying && (
                  <div className="flex items-center justify-center gap-0.5 mt-1">
                    <div className="w-1 h-3 bg-indigo-500 rounded-full animate-pulse" />
                    <div
                      className="w-1 h-4 bg-indigo-500 rounded-full animate-pulse"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <div
                      className="w-1 h-2 bg-indigo-500 rounded-full animate-pulse"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </div>
                )}
                {!isPlaying && !isLocked && (
                  <div className="mt-1">
                    <svg
                      className="w-4 h-4 mx-auto text-zinc-400 dark:text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.5l5-4v15l-5-4H4a1 1 0 01-1-1v-5a1 1 0 011-1h2.5z"
                      />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Upgrade overlay for free users */}
        {!isPremium && filteredWords.length > FREE_WORD_LIMIT && (
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-white dark:from-slate-900 via-white/90 dark:via-slate-900/90 to-transparent flex items-end justify-center pb-6">
            <div className="text-center px-6 py-6 max-w-sm">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/40 dark:to-indigo-900/40 mx-auto mb-3 flex items-center justify-center text-2xl shadow-sm">
                📚
              </div>
              <h2 className="text-lg font-extrabold text-zinc-900 dark:text-slate-100 mb-1.5">
                Unlock All {wordBank.length} Words
              </h2>
              <p className="text-sm text-zinc-500 dark:text-slate-400 mb-4 leading-relaxed">
                Get access to the full word library, audio playback, and
                unlimited practice exercises with Readee+.
              </p>
              <Link
                href="/upgrade"
                className="relative inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                <span className="relative">⭐</span>
                <span className="relative">Upgrade to Readee+</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
