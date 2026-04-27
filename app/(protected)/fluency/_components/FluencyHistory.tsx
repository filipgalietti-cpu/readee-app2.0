"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Mic, Trophy, ChevronDown } from "lucide-react";

type Kid = { id: string; first_name: string; grade: string };
type Reading = {
  id: string;
  child_id: string;
  passage_text: string;
  passage_grade_level: string | null;
  wcpm: number | null;
  words_correct: number | null;
  words_total: number | null;
  duration_seconds: number | null;
  encouragement: string | null;
  teacher_summary: string | null;
  audio_url: string | null;
  created_at: string;
};

export default function FluencyHistory({ kids }: { kids: Kid[] }) {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = supabaseBrowser();
      const childIds = kids.map((k) => k.id);
      if (childIds.length === 0) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("fluency_readings")
        .select(
          "id, child_id, passage_text, passage_grade_level, wcpm, words_correct, words_total, duration_seconds, encouragement, teacher_summary, audio_url, created_at",
        )
        .in("child_id", childIds)
        .order("created_at", { ascending: false })
        .limit(20);
      if (!cancelled) {
        setReadings((data ?? []) as Reading[]);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [kids]);

  const kidById = new Map(kids.map((k) => [k.id, k]));

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="h-12 animate-pulse rounded-lg bg-zinc-100 dark:bg-slate-800/40" />
      </div>
    );
  }

  if (readings.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
        Recent fluency checks
      </h2>
      <ul className="mt-3 space-y-2">
        {readings.map((r) => {
          const kid = kidById.get(r.child_id);
          const isOpen = open === r.id;
          return (
            <li
              key={r.id}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : r.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-zinc-50 dark:hover:bg-slate-900/60"
              >
                <Trophy className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-zinc-900 dark:text-white">
                    {kid?.first_name ?? "Reader"} ·{" "}
                    {(r.wcpm ?? 0).toFixed(0)} WCPM
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    {(r.words_correct ?? 0)}/{r.words_total ?? 0} correct ·{" "}
                    {new Date(r.created_at).toLocaleDateString()}
                    {r.passage_grade_level
                      ? ` · ${r.passage_grade_level}`
                      : ""}
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-zinc-400 transition ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="space-y-3 border-t border-zinc-100 bg-zinc-50/40 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/30">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                    Passage
                  </div>
                  <p
                    className="text-sm text-zinc-700 dark:text-slate-300"
                    style={{
                      fontFamily:
                        'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif',
                    }}
                  >
                    {r.passage_text}
                  </p>
                  {r.encouragement && (
                    <div className="rounded-lg bg-violet-50 p-3 text-xs text-violet-900 dark:bg-violet-950/30 dark:text-violet-200">
                      <span className="font-bold">For the kid: </span>
                      {r.encouragement}
                    </div>
                  )}
                  {r.teacher_summary && (
                    <div className="rounded-lg bg-indigo-50 p-3 text-xs text-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-200">
                      <span className="font-bold">For the teacher: </span>
                      {r.teacher_summary}
                    </div>
                  )}
                  {r.audio_url && (
                    <audio
                      controls
                      src={r.audio_url}
                      preload="none"
                      className="block w-full"
                    />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
