"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Volume2,
  Pause,
  ThumbsUp,
  ThumbsDown,
  Check,
  X as XIcon,
  ArrowRight,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

type DailyQuestion = {
  date: string;
  theme: string;
  slug: string;
  passage_title: string;
  passage_body: string;
  image_url: string | null;
  audio_url: string | null;
  question_prompt: string;
  choices: string[];
  correct: string;
  hint: string | null;
};

/**
 * Today's question widget — used on the parent dashboard and the
 * teacher classroom page. Loads the row for today, lets the user
 * play the read-aloud, attempt the comprehension question, and
 * thumbs up / down for product feedback (we use this to spot bad
 * theme picks even before students engage).
 */
export default function DailyQuestionCard({
  variant = "parent",
}: {
  variant?: "parent" | "teacher";
}) {
  const [data, setData] = useState<DailyQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const supabase = supabaseBrowser();
        const today = new Date().toISOString().slice(0, 10);
        // Skip rows the QC engine flagged as fail — fall back to the
        // last known-good day. Warns are fine to surface (small issues),
        // fails are blocking (factual errors, missing answer support).
        const { data: row } = await supabase
          .from("daily_questions")
          .select(
            "date, theme, slug, passage_title, passage_body, image_url, audio_url, question_prompt, choices, correct, hint",
          )
          .lte("date", today)
          .eq("published_state", "live")
          .order("date", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!cancelled && row) {
          setData(row as DailyQuestion);
          // Fire-and-forget view bump.
          supabase.rpc("bump_daily_question_engagement", {
            p_date: (row as any).date,
            p_field: "view",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function togglePlay() {
    if (!data?.audio_url) return;
    let a = audio;
    if (!a) {
      a = new Audio(data.audio_url);
      a.onended = () => setPlaying(false);
      setAudio(a);
    }
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }

  function vote(dir: "up" | "down") {
    if (!data || voted) return;
    setVoted(dir);
    const supabase = supabaseBrowser();
    supabase.rpc("bump_daily_question_engagement", {
      p_date: data.date,
      p_field: dir,
    });
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-5 dark:border-violet-900/40 dark:from-violet-950/30 dark:to-indigo-950/30">
        <div className="h-32 animate-pulse rounded-2xl bg-white/60" />
      </div>
    );
  }

  if (!data) {
    return null; // No daily question yet — silently hide.
  }

  const isCorrect = picked != null && picked === data.correct;
  const isWrong = picked != null && picked !== data.correct;

  return (
    <div className="rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-5 shadow-sm dark:border-violet-900/40 dark:from-violet-950/30 dark:via-slate-900 dark:to-indigo-950/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
            <Sparkles className="h-3 w-3" />
            Today's Readee
          </div>
          <h3 className="mt-0.5 text-base font-bold text-zinc-900 dark:text-white">
            {data.theme}
          </h3>
        </div>
        <Link
          href={`/today/${data.slug}`}
          className="text-[11px] font-semibold text-violet-700 transition hover:text-violet-900 dark:text-violet-300"
        >
          See more
        </Link>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[120px_1fr]">
        {data.image_url && (
          <img
            src={data.image_url}
            alt=""
            className="h-32 w-full rounded-2xl border border-zinc-200 object-cover sm:h-32"
          />
        )}
        <div>
          <div className="text-sm font-bold text-zinc-900 dark:text-white">
            {data.passage_title}
          </div>
          <p
            className="mt-1 text-[13px] leading-snug text-zinc-700 dark:text-slate-300"
            style={{
              fontFamily:
                'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif',
            }}
          >
            {data.passage_body.length > 220
              ? data.passage_body.slice(0, 220) + "…"
              : data.passage_body}
          </p>
          {data.audio_url && (
            <button
              type="button"
              onClick={togglePlay}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-violet-700 transition hover:bg-violet-50"
            >
              {playing ? <Pause className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              {playing ? "Pause" : "Read aloud"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-3 shadow-sm dark:bg-slate-900">
        <div className="text-[13px] font-semibold text-zinc-900 dark:text-white">
          {data.question_prompt}
        </div>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {data.choices.map((choice) => {
            const isThis = picked === choice;
            const isThisCorrect = isThis && isCorrect;
            const isThisWrong = isThis && isWrong;
            const showCorrect = picked != null && choice === data.correct;
            return (
              <button
                key={choice}
                type="button"
                disabled={picked != null}
                onClick={() => setPicked(choice)}
                className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-[13px] transition ${
                  isThisCorrect
                    ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                    : isThisWrong
                      ? "border-red-400 bg-red-50 text-red-900"
                      : showCorrect
                        ? "border-emerald-200 bg-emerald-50/40 text-emerald-800"
                        : "border-zinc-200 bg-white text-zinc-800 hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                }`}
              >
                <span>{choice}</span>
                {isThisCorrect && <Check className="h-4 w-4 text-emerald-600" />}
                {isThisWrong && <XIcon className="h-4 w-4 text-red-600" />}
                {showCorrect && !isThis && (
                  <Check className="h-4 w-4 text-emerald-500 opacity-60" />
                )}
              </button>
            );
          })}
        </div>
        {picked && data.hint && (
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            className="mt-2 text-[11px] font-semibold text-amber-700 hover:underline"
          >
            {showHint ? "Hide hint" : "Show hint"}
          </button>
        )}
        {showHint && data.hint && (
          <div className="mt-1 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
            {data.hint}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-[11px] text-zinc-500 dark:text-slate-400">
          {variant === "teacher"
            ? "Push this to your class as a 5-minute warm-up."
            : "60-second reading boost — try it with your kid."}
        </div>
        <div className="flex items-center gap-2">
          {variant === "teacher" && (
            <Link
              href={`/today/${data.slug}`}
              className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1 text-[11px] font-bold text-white transition hover:bg-violet-700"
            >
              Open
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
          <button
            type="button"
            onClick={() => vote("up")}
            disabled={voted != null}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition ${
              voted === "up"
                ? "bg-emerald-100 text-emerald-700"
                : "text-zinc-400 hover:bg-zinc-100 hover:text-emerald-600"
            }`}
            aria-label="Thumbs up"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => vote("down")}
            disabled={voted != null}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition ${
              voted === "down"
                ? "bg-red-100 text-red-700"
                : "text-zinc-400 hover:bg-zinc-100 hover:text-red-600"
            }`}
            aria-label="Thumbs down"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
