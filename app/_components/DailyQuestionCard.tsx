"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Glyph } from "@/app/_components/Glyph";

type DailyQuestion = {
  date: string;
  theme: string;
  slug: string;
  passage_title: string;
  passage_body: string;
  image_url: string | null;
  image_attribution: string | null;
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
            "date, theme, slug, passage_title, passage_body, image_url, image_attribution, audio_url, question_prompt, choices, correct, hint",
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
      <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-5">
        <div className="h-32 animate-pulse rounded-2xl bg-white/60" />
      </div>
    );
  }

  if (!data) {
    return null; // No daily question yet — silently hide.
  }

  return (
    <div className="rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-600">
            <Glyph name="newspaper" size={12} />
            Today's Readee
          </div>
          <h3 className="mt-0.5 text-base font-bold text-zinc-900">
            {data.theme}
          </h3>
        </div>
        <Link
          href={`/today/${data.slug}`}
          className="text-[11px] font-semibold text-violet-700 transition hover:text-violet-900"
        >
          See more
        </Link>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[150px_1fr] sm:items-stretch">
        {data.image_url && (
          <figure className="m-0">
            <img
              src={data.image_url}
              alt=""
              className="h-40 w-full rounded-2xl border border-zinc-200 object-cover sm:h-full sm:min-h-[128px]"
            />
            {/* Wikimedia photos arrive CC BY / CC BY-SA, which require credit.
                Null for AI art, so nothing renders there. */}
            {data.image_attribution && (
              <figcaption className="mt-1 text-[10px] leading-tight text-zinc-400">
                {data.image_attribution}
              </figcaption>
            )}
          </figure>
        )}
        <div>
          <div className="text-sm font-bold text-zinc-900">
            {data.passage_title}
          </div>
          {/* The whole passage, scrollable rather than cut.
              This card asks a comprehension question directly below, and every
              one of the 132 dailies is longer than the old 300-character clip
              (they average 606), so on average half the text was hidden from a
              child being asked about it. The answer was frequently in the half
              they could not see. Same reason the placement and Luna keep their
              passages on screen: an answer has to be findable in the text. */}
          <p
            className="mt-1 max-h-[168px] overflow-y-auto pr-1 text-[13px] leading-snug text-zinc-700"
            style={{
              fontFamily:
                'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif',
            }}
          >
            {data.passage_body}
          </p>
          {data.audio_url && (
            <button
              type="button"
              onClick={togglePlay}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-violet-700 transition hover:bg-violet-50"
            >
              {playing ? <Glyph name="pause" size={12} /> : <Glyph name="volume2" size={12} />}
              {playing ? "Pause" : "Read aloud"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-[11px] text-zinc-500">
          {variant === "teacher"
            ? "Push this to your class as a 5-minute warm-up."
            : "60-second reading boost - try it with your child."}
        </div>
        <div className="flex items-center gap-2">
          {variant === "teacher" && (
            <Link
              href={`/today/${data.slug}`}
              className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1 text-[11px] font-bold text-white transition hover:bg-violet-700"
            >
              Open
              <Glyph name="arrow-right" size={12} />
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
            <Glyph name="thumbs-up" size={14} />
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
            <Glyph name="thumbs-down" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
