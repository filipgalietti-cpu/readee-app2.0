"use client";

import { useState } from "react";
import {
  Volume2,
  Pause,
  Check,
  X as XIcon,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

type Q = {
  prompt: string;
  choices: string[];
  correct: string;
  hint: string | null;
};

/**
 * Interactive player for the public /today/[slug] page. Read-aloud
 * button + the main question + any bonus questions. Engagement votes
 * fire the same RPC the parent dashboard widget uses so we get a
 * combined signal across surfaces.
 */
export default function TodayQuestionPlayer({
  date,
  audioUrl,
  mainQuestion,
  extras,
}: {
  date: string;
  audioUrl: string | null;
  mainQuestion: Q;
  extras: Q[];
}) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);

  function togglePlay() {
    if (!audioUrl) return;
    let a = audio;
    if (!a) {
      a = new Audio(audioUrl);
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
    if (voted) return;
    setVoted(dir);
    const supabase = supabaseBrowser();
    supabase.rpc("bump_daily_question_engagement", {
      p_date: date,
      p_field: dir,
    });
  }

  return (
    <div className="mt-8 space-y-4">
      {audioUrl && (
        <button
          type="button"
          onClick={togglePlay}
          className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {playing ? "Pause read-aloud" : "Read aloud"}
        </button>
      )}

      <QuestionBlock q={mainQuestion} label="Question" />
      {extras.map((q, i) => (
        <QuestionBlock key={i} q={q} label={`Bonus ${i + 1}`} />
      ))}

      <div className="mt-6 flex items-center justify-end gap-2 text-xs">
        <span className="text-zinc-500">Was this question good?</span>
        <button
          type="button"
          onClick={() => vote("up")}
          disabled={voted != null}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition ${
            voted === "up"
              ? "bg-emerald-100 text-emerald-700"
              : "text-zinc-400 hover:bg-zinc-100 hover:text-emerald-600"
          }`}
        >
          <ThumbsUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => vote("down")}
          disabled={voted != null}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition ${
            voted === "down"
              ? "bg-red-100 text-red-700"
              : "text-zinc-400 hover:bg-zinc-100 hover:text-red-600"
          }`}
        >
          <ThumbsDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function QuestionBlock({ q, label }: { q: Q; label: string }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const isCorrect = picked != null && picked === q.correct;
  const isWrong = picked != null && picked !== q.correct;
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
        {label}
      </div>
      <div className="mt-1 text-base font-semibold text-zinc-900">{q.prompt}</div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {q.choices.map((choice) => {
          const isThis = picked === choice;
          const isThisCorrect = isThis && isCorrect;
          const isThisWrong = isThis && isWrong;
          const showCorrect = picked != null && choice === q.correct;
          return (
            <button
              key={choice}
              type="button"
              disabled={picked != null}
              onClick={() => setPicked(choice)}
              className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                isThisCorrect
                  ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                  : isThisWrong
                    ? "border-red-400 bg-red-50 text-red-900"
                    : showCorrect
                      ? "border-emerald-200 bg-emerald-50/40 text-emerald-800"
                      : "border-zinc-200 bg-white text-zinc-800 hover:border-violet-300"
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
      {picked && q.hint && (
        <button
          type="button"
          onClick={() => setShowHint((v) => !v)}
          className="mt-2 text-xs font-semibold text-amber-700 hover:underline"
        >
          {showHint ? "Hide hint" : "Show hint"}
        </button>
      )}
      {showHint && q.hint && (
        <div className="mt-1 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
          {q.hint}
        </div>
      )}
    </div>
  );
}
