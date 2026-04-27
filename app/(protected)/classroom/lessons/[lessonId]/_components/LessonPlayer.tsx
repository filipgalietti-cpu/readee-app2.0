"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  Pause,
  Check,
  X as XIcon,
  ImageIcon,
  HelpCircle,
} from "lucide-react";

type Slide = {
  position: number;
  body: string;
  display_text: string | null;
  image_url: string | null;
  audio_url: string | null;
};

type Question = {
  id: string;
  prompt: string;
  choices: string[];
  correct: string;
  hint: string | null;
};

/**
 * LessonPlayer — in-app slideshow viewer for AI-built lessons.
 *
 * One slide visible at a time. Big image, big text (kid-readable),
 * play/pause read-aloud, prev/next navigation. After the last slide,
 * comprehension questions render inline.
 */
export default function LessonPlayer({
  slides,
  questions,
}: {
  slides: Slide[];
  questions: Question[];
}) {
  const totalPages = slides.length + (questions.length > 0 ? 1 : 0);
  const [page, setPage] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  // Stop audio when navigating slides
  useEffect(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, [page]);

  function togglePlay(url: string) {
    if (!audioRef.current) audioRef.current = new Audio();
    const a = audioRef.current;
    if (playing && a.src === url) {
      a.pause();
      setPlaying(false);
      return;
    }
    a.src = url;
    a.onended = () => setPlaying(false);
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }

  const onSlide = page < slides.length;
  const slide = onSlide ? slides[page] : null;

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
      {/* Page indicator */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-2.5 text-xs dark:border-slate-800">
        <span className="font-semibold text-zinc-500">
          {onSlide
            ? `Slide ${page + 1} of ${slides.length}`
            : "Comprehension check"}
        </span>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === page
                  ? "w-6 bg-indigo-600"
                  : i < page
                    ? "w-1.5 bg-indigo-300"
                    : "w-1.5 bg-zinc-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-8 sm:px-10 sm:py-10">
        {onSlide && slide ? (
          <SlideView
            slide={slide}
            playing={playing && audioRef.current?.src === slide.audio_url}
            onTogglePlay={() => slide.audio_url && togglePlay(slide.audio_url)}
          />
        ) : (
          <ComprehensionView questions={questions} />
        )}
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-500 transition hover:bg-zinc-100 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
          className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function SlideView({
  slide,
  playing,
  onTogglePlay,
}: {
  slide: Slide;
  playing: boolean;
  onTogglePlay: () => void;
}) {
  return (
    <div>
      {slide.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slide.image_url}
          alt=""
          className="mx-auto h-72 w-full rounded-2xl object-cover shadow-sm sm:h-80"
        />
      ) : (
        <div className="flex h-72 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-400">
          <ImageIcon className="h-14 w-14" />
        </div>
      )}

      <div className="mt-6">
        {slide.display_text && (
          <h2 className="mb-3 text-2xl font-extrabold text-zinc-900 dark:text-white">
            {slide.display_text}
          </h2>
        )}
        <p
          className="whitespace-pre-line text-[18px] leading-[1.7] text-zinc-900 dark:text-slate-100"
          style={{
            fontFamily:
              'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif',
          }}
        >
          {slide.body || "(empty slide)"}
        </p>
      </div>

      {slide.audio_url && (
        <button
          type="button"
          onClick={onTogglePlay}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {playing ? "Pause" : "Read aloud"}
        </button>
      )}
    </div>
  );
}

function ComprehensionView({ questions }: { questions: Question[] }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-indigo-700">
          <HelpCircle className="h-3 w-3" />
          Comprehension check
        </div>
        <h2 className="mt-3 text-2xl font-extrabold text-zinc-900 dark:text-white">
          Let&apos;s see what we remember!
        </h2>
      </div>
      {questions.map((q, i) => (
        <ComprehensionItem key={q.id} index={i} q={q} />
      ))}
    </div>
  );
}

function ComprehensionItem({ index, q }: { index: number; q: Question }) {
  const [picked, setPicked] = useState<string | null>(null);
  const isCorrect = picked === q.correct;
  const isWrong = picked != null && !isCorrect;
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
          {index + 1}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Question {index + 1}
        </span>
      </div>
      <p className="mt-2 text-base font-semibold text-zinc-900 dark:text-white">
        {q.prompt}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {q.choices.map((c) => {
          const isThis = picked === c;
          const showCorrect = picked != null && c === q.correct;
          return (
            <button
              key={c}
              type="button"
              disabled={picked != null}
              onClick={() => setPicked(c)}
              className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                isThis && isCorrect
                  ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                  : isThis && isWrong
                    ? "border-red-400 bg-red-50 text-red-900"
                    : showCorrect
                      ? "border-emerald-200 bg-emerald-50/40 text-emerald-800"
                      : "border-zinc-200 bg-white text-zinc-800 hover:border-violet-300"
              }`}
            >
              <span>{c}</span>
              {isThis && isCorrect && (
                <Check className="h-4 w-4 text-emerald-600" />
              )}
              {isThis && isWrong && <XIcon className="h-4 w-4 text-red-600" />}
              {showCorrect && !isThis && (
                <Check className="h-4 w-4 text-emerald-500 opacity-60" />
              )}
            </button>
          );
        })}
      </div>
      {picked && q.hint && (
        <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <span className="font-bold">Hint: </span>
          {q.hint}
        </div>
      )}
    </div>
  );
}
