"use client";

import { useState } from "react";
import {
  Volume2,
  Pause,
  Check,
  X as XIcon,
  ImageIcon,
} from "lucide-react";

type Level = "easy" | "on_level" | "advanced";
type Version = {
  level: Level;
  grade: string;
  title: string;
  body: string;
  audio_url: string | null;
  question_ids: string[];
};
type Question = {
  id: string;
  prompt: string;
  choices: string[];
  correct: string;
  hint: string | null;
};

const LEVEL_LABEL: Record<Level, string> = {
  easy: "Easy",
  on_level: "On level",
  advanced: "Advanced",
};

const LEVEL_DESCRIPTION: Record<Level, string> = {
  easy: "Simpler vocab, shorter sentences. One grade below center.",
  on_level: "Center grade. The default version.",
  advanced: "Richer vocab, longer sentences. One grade above center.",
};

/**
 * LeveledViewer — toggle between the three reading levels of the same
 * passage. Image stays the same (shared scene); only the text and
 * comprehension questions swap. Demonstrates the differentiation
 * superpower in one clean UI.
 */
export default function LeveledViewer({
  versions,
  sharedImageUrl,
  questionsByVersion,
}: {
  versions: Version[];
  sharedImageUrl: string | null;
  questionsByVersion: Record<string, Question[]>;
}) {
  const [level, setLevel] = useState<Level>("on_level");
  const [playing, setPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const v = versions.find((x) => x.level === level) ?? versions[0];
  const questions = questionsByVersion[level] ?? [];
  const wordCount = v?.body.split(/\s+/).filter(Boolean).length ?? 0;

  function togglePlay() {
    if (!v?.audio_url) return;
    let a = audio;
    if (!a || a.src !== v.audio_url) {
      a?.pause();
      a = new Audio(v.audio_url);
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

  return (
    <div className="space-y-4">
      {/* Level toggle */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-3 gap-1">
          {(["easy", "on_level", "advanced"] as Level[]).map((l) => {
            const ver = versions.find((x) => x.level === l);
            const active = level === l;
            return (
              <button
                key={l}
                type="button"
                onClick={() => {
                  audio?.pause();
                  setPlaying(false);
                  setLevel(l);
                }}
                className={`flex flex-col items-start gap-0.5 rounded-xl px-4 py-2 text-left transition ${
                  active
                    ? "bg-violet-600 text-white"
                    : "text-zinc-600 hover:bg-zinc-50 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                  {LEVEL_LABEL[l]}
                </span>
                <span className={`text-xs font-semibold ${active ? "text-white" : "text-zinc-900 dark:text-slate-200"}`}>
                  Grade {ver?.grade ?? "?"}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-1 px-2 text-[11px] text-zinc-500 dark:text-slate-400">
          {LEVEL_DESCRIPTION[level]}
        </p>
      </div>

      {/* Passage card */}
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {sharedImageUrl ? (
          <div className="flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-50 p-4 dark:from-violet-950/20 dark:to-indigo-950/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sharedImageUrl}
              alt=""
              className="block max-h-56 w-auto max-w-full rounded-2xl object-contain"
            />
          </div>
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-400">
            <ImageIcon className="h-14 w-14" />
          </div>
        )}
        <div className="px-6 py-6 sm:px-10 sm:py-8">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
            {LEVEL_LABEL[level]} · Grade {v?.grade}
            <span className="text-zinc-300">·</span>
            <span>{wordCount} words</span>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">
            {v?.title}
          </h2>
          {v?.audio_url && (
            <button
              type="button"
              onClick={togglePlay}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-1.5 text-xs font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50"
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              {playing ? "Pause" : "Read aloud"}
            </button>
          )}
          <p
            className="mt-5 whitespace-pre-line text-[18px] leading-[1.7] text-zinc-900 dark:text-slate-100"
            style={{
              fontFamily:
                'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif',
            }}
          >
            {v?.body}
          </p>
        </div>
      </div>

      {/* Comprehension questions for this level */}
      {questions.length > 0 && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
            Comprehension check ({LEVEL_LABEL[level]})
          </h3>
          <div className="mt-4 space-y-3">
            {questions.map((q, i) => (
              <ComprehensionItem key={q.id + level} q={q} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ComprehensionItem({ q, index }: { q: Question; index: number }) {
  // Teacher-review layout — correct answer is always shown so the
  // teacher can verify Readee.ai's work at a glance.
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
          {index + 1}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Question {index + 1}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-white">
        {q.prompt}
      </p>
      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {q.choices.map((c) => {
          const isCorrect = c === q.correct;
          return (
            <div
              key={c}
              className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-xs ${
                isCorrect
                  ? "border-emerald-300 bg-emerald-50 font-semibold text-emerald-900 dark:border-emerald-700/60 dark:bg-emerald-950/30 dark:text-emerald-200"
                  : "border-zinc-200 bg-white text-zinc-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              <span>{c}</span>
              {isCorrect && <Check className="h-3.5 w-3.5 text-emerald-600" />}
            </div>
          );
        })}
      </div>
      {q.hint && (
        <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <span className="font-bold">Hint: </span>
          {q.hint}
        </div>
      )}
    </div>
  );
}
