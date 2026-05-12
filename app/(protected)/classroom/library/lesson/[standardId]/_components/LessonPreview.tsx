"use client";

import { useRef, useState } from "react";
import { Volume2, Square, Check, ImageOff } from "lucide-react";

type Step = {
  sub: string | null;
  displayText: string;
  ttsScript: string;
  audioUrl: string | null;
};

type Slide = {
  slide: number;
  heading: string | null;
  imageUrl: string | null;
  steps: Step[];
};

type MCQ = {
  id: string;
  prompt: string;
  choices: string[];
  correct: string;
  hint: string | null;
  imageUrl: string;
  audioUrl: string | null;
};

export default function LessonPreview({
  slides,
  mcqs,
}: {
  slides: Slide[];
  mcqs: MCQ[];
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  function play(key: string, url: string | null) {
    if (!url || !audioRef.current) return;
    if (playingKey === key) {
      audioRef.current.pause();
      setPlayingKey(null);
      return;
    }
    audioRef.current.pause();
    audioRef.current.src = url;
    audioRef.current.currentTime = 0;
    audioRef.current
      .play()
      .then(() => setPlayingKey(key))
      .catch(() => setPlayingKey(null));
  }

  return (
    <div className="space-y-6">
      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => setPlayingKey(null)}
        onPause={() => {
          if (audioRef.current?.ended) setPlayingKey(null);
        }}
      />

      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 px-4 py-3 text-xs text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-200">
        Teacher preview — no progress is saved. Use the play buttons to
        hear each line as it would sound for the student.
      </div>

      <ol className="space-y-5">
        {slides.map((s) => {
          const imgKey = `img-${s.slide}`;
          const imgFailed = imageErrors.has(imgKey);
          return (
            <li
              key={s.slide}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
            >
              <div className="flex items-center gap-3 border-b border-zinc-100 bg-zinc-50/60 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-400">
                Slide {s.slide}
                {s.heading && (
                  <>
                    <span className="text-zinc-300">·</span>
                    <span className="font-semibold normal-case tracking-normal text-zinc-700 dark:text-slate-300">
                      {s.heading}
                    </span>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-4 p-4 sm:flex-row">
                <div className="flex h-32 w-full flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white sm:h-40 sm:w-40 dark:border-slate-700 dark:bg-slate-900">
                  {s.imageUrl && !imgFailed ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.imageUrl}
                      alt=""
                      loading="lazy"
                      onError={() =>
                        setImageErrors((prev) => new Set(prev).add(imgKey))
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageOff className="h-6 w-6 text-zinc-300" />
                  )}
                </div>

                <ol className="flex min-w-0 flex-1 flex-col gap-2">
                  {s.steps.map((step, idx) => {
                    const key = `s${s.slide}-${step.sub ?? idx}`;
                    const isPlaying = playingKey === key;
                    return (
                      <li
                        key={key}
                        className="flex items-start gap-2 rounded-xl border border-zinc-100 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900"
                      >
                        <button
                          type="button"
                          onClick={() => play(key, step.audioUrl)}
                          disabled={!step.audioUrl}
                          aria-label={isPlaying ? "Stop audio" : "Play audio"}
                          className={`mt-0.5 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition ${
                            !step.audioUrl
                              ? "cursor-not-allowed bg-zinc-100 text-zinc-300 dark:bg-slate-800"
                              : isPlaying
                              ? "bg-indigo-600 text-white"
                              : "border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900 dark:bg-slate-900 dark:text-indigo-300"
                          }`}
                        >
                          {isPlaying ? (
                            <Square className="h-3.5 w-3.5" />
                          ) : (
                            <Volume2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1 text-sm">
                          {step.sub && (
                            <span className="mr-2 font-mono text-[10px] font-bold text-zinc-400">
                              {step.sub.toUpperCase()}
                            </span>
                          )}
                          {step.displayText ? (
                            <span className="font-semibold text-zinc-900 dark:text-white">
                              {step.displayText}
                            </span>
                          ) : null}
                          <div className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-slate-400">
                            {step.ttsScript}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </li>
          );
        })}
      </ol>

      {mcqs.length > 0 && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
            Comprehension check ({mcqs.length})
          </h2>
          <ol className="mt-3 space-y-3">
            {mcqs.map((q) => {
              const imgKey = `mcq-${q.id}`;
              const imgFailed = imageErrors.has(imgKey);
              const isPlaying = playingKey === `mcq-${q.id}`;
              return (
                <li
                  key={q.id}
                  className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                      {imgFailed ? (
                        <ImageOff className="h-5 w-5 text-zinc-300" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={q.imageUrl}
                          alt=""
                          loading="lazy"
                          onError={() =>
                            setImageErrors((prev) => new Set(prev).add(imgKey))
                          }
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-zinc-400">
                          {q.id}
                        </span>
                        {q.audioUrl && (
                          <button
                            type="button"
                            onClick={() => play(`mcq-${q.id}`, q.audioUrl)}
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition ${
                              isPlaying
                                ? "bg-indigo-600 text-white"
                                : "border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900 dark:bg-slate-900 dark:text-indigo-300"
                            }`}
                          >
                            {isPlaying ? (
                              <Square className="h-3 w-3" />
                            ) : (
                              <Volume2 className="h-3 w-3" />
                            )}
                            {isPlaying ? "Stop" : "Play"}
                          </button>
                        )}
                      </div>
                      <p className="mt-1 whitespace-pre-line text-sm text-zinc-900 dark:text-white">
                        {q.prompt}
                      </p>
                      <ul className="mt-2 flex flex-wrap gap-1.5 text-xs">
                        {q.choices.map((c) => {
                          const isCorrect = q.correct === c;
                          return (
                            <li
                              key={c}
                              className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 ${
                                isCorrect
                                  ? "bg-green-100 font-semibold text-green-800 dark:bg-green-950/40 dark:text-green-300"
                                  : "bg-zinc-50 text-zinc-600 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              {isCorrect && <Check className="h-3 w-3" />}
                              {c}
                            </li>
                          );
                        })}
                      </ul>
                      {q.hint && (
                        <p className="mt-1.5 text-[11px] italic text-zinc-500 dark:text-slate-400">
                          Hint: {q.hint}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </div>
  );
}
