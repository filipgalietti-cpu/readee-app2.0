"use client";

import { useState } from "react";
import { FluentIcon } from "@/app/_components/FluentIcon";
import { Glyph } from "@/app/_components/Glyph";

type Q = {
  prompt: string;
  choices: string[];
  correct: string;
  hint: string | null;
};

/**
 * Inline reader for /discover/[slug]. Read-aloud button + main MCQ +
 * extras. No engagement votes yet — v1 ships the read experience and
 * we add 👍/👎 once the kid feedback RPC is generalized off
 * daily-question's date scope.
 */
export default function DiscoveryQuestions({
  audioUrl,
  mainQuestion,
  extras,
}: {
  audioUrl: string | null;
  mainQuestion: Q;
  extras: Q[];
}) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

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
      void a.play();
      setPlaying(true);
    }
  }

  const all = [mainQuestion, ...extras];

  return (
    <div className="mt-8 space-y-4">
      {audioUrl && (
        <button
          type="button"
          onClick={togglePlay}
          className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50"
        >
          {playing ? <Glyph name="pause" size={16} /> : <FluentIcon name="speaker" size={16} />}
          {playing ? "Pause read-aloud" : "Read aloud"}
        </button>
      )}
      <div className="space-y-4 pt-4">
        {all.map((q, i) => (
          <MCQCard key={i} index={i} q={q} />
        ))}
      </div>
    </div>
  );
}

function MCQCard({ index, q }: { index: number; q: Q }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const correct = picked === q.correct;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        Question {index + 1}
      </div>
      <p className="mt-1 text-base font-semibold text-zinc-900">{q.prompt}</p>
      <div className="mt-3 space-y-2">
        {q.choices.map((c, i) => {
          const isPicked = picked === c;
          const isCorrect = picked && c === q.correct;
          const isWrongPick = isPicked && c !== q.correct;
          return (
            <button
              key={i}
              type="button"
              onClick={() => !picked && setPicked(c)}
              disabled={!!picked}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition ${
                isCorrect
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                  : isWrongPick
                    ? "border-rose-300 bg-rose-50 text-rose-900"
                    : picked
                      ? "border-zinc-200 bg-zinc-50 text-zinc-500"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-violet-300"
              }`}
            >
              <span>{c}</span>
              {isCorrect && <FluentIcon name="check" size={16} />}
              {isWrongPick && <Glyph name="x" size={16} />}
            </button>
          );
        })}
      </div>
      {q.hint && !picked && (
        <button
          type="button"
          onClick={() => setShowHint((s) => !s)}
          className="mt-3 text-xs font-semibold text-violet-600 hover:text-violet-800"
        >
          {showHint ? "Hide hint" : "Need a hint?"}
        </button>
      )}
      {showHint && q.hint && !picked && (
        <p className="mt-2 text-sm text-zinc-600">{q.hint}</p>
      )}
      {picked && !correct && (
        <p className="mt-3 text-xs text-rose-700">
          The correct answer is{" "}
          <span className="font-semibold">{q.correct}</span>.
        </p>
      )}
    </div>
  );
}
