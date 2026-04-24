"use client";

import { useMemo, useRef, useState } from "react";
import { Search, Check, Filter, Volume2, ImageOff } from "lucide-react";

type LibraryQuestion = {
  id: string;
  grade: string;
  standardId: string;
  standardTitle: string;
  domain: string;
  type: string;
  prompt: string;
  choices: string[] | null;
  correct: string | null;
  difficulty: number | null;
  imageUrl: string;
  audioUrl: string | null;
};

const GRADE_OPTIONS = ["All", "K", "1st", "2nd", "3rd", "4th"];

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: "Multiple choice",
  missing_word: "Missing word",
  category_sort: "Category sort",
  tap_to_pair: "Tap to pair",
  sentence_build: "Sentence build",
  sound_machine: "Sound machine",
  space_insertion: "Space insertion",
};

export default function LibraryBrowser({ questions }: { questions: LibraryQuestion[] }) {
  const [grade, setGrade] = useState<string>("All");
  const [type, setType] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  function playAudio(questionId: string, url: string) {
    if (!audioRef.current) return;
    if (playingId === questionId) {
      audioRef.current.pause();
      setPlayingId(null);
      return;
    }
    audioRef.current.pause();
    audioRef.current.src = url;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      setPlayingId(null);
    });
    setPlayingId(questionId);
  }

  const typeOptions = useMemo(() => {
    const s = new Set<string>();
    questions.forEach((q) => s.add(q.type));
    return ["All", ...Array.from(s)];
  }, [questions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return questions.filter((qn) => {
      if (grade !== "All" && qn.grade !== grade) return false;
      if (type !== "All" && qn.type !== type) return false;
      if (!q) return true;
      return (
        qn.prompt.toLowerCase().includes(q) ||
        qn.standardId.toLowerCase().includes(q) ||
        qn.standardTitle.toLowerCase().includes(q)
      );
    });
  }, [questions, grade, type, query]);

  // Group by standard for readability
  const byStandard = useMemo(() => {
    const m = new Map<
      string,
      { standardTitle: string; domain: string; grade: string; items: LibraryQuestion[] }
    >();
    for (const qn of filtered) {
      const key = qn.standardId;
      if (!m.has(key)) {
        m.set(key, {
          standardTitle: qn.standardTitle,
          domain: qn.domain,
          grade: qn.grade,
          items: [],
        });
      }
      m.get(key)!.items.push(qn);
    }
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  function toggleExpand(sid: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(sid)) next.delete(sid);
      else next.add(sid);
      return next;
    });
  }

  return (
    <div>
      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => setPlayingId(null)}
        onPause={() => {
          // Keep UI in sync if the audio stops for any reason
          if (audioRef.current && audioRef.current.ended) setPlayingId(null);
        }}
      />
      {/* Filter bar */}
      <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by prompt, standard, or domain…"
            className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
              Grade
            </span>
            <div className="flex flex-wrap gap-1">
              {GRADE_OPTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    grade === g
                      ? "bg-indigo-600 text-white"
                      : "border border-zinc-200 bg-white text-zinc-700 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
              Type
            </span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {t === "All" ? "All" : TYPE_LABELS[t] ?? t}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto text-xs font-semibold text-zinc-500 dark:text-slate-400">
            <Filter className="mr-1 inline h-3 w-3" />
            {filtered.length.toLocaleString()} match
            {filtered.length === 1 ? "" : "es"} · {byStandard.length} standard
            {byStandard.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-sm text-zinc-500 dark:text-slate-400">
            No questions match these filters.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {byStandard.map(([standardId, info]) => {
            const isExpanded = expanded.has(standardId);
            return (
              <li
                key={standardId}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-slate-800 dark:bg-slate-900/40"
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(standardId)}
                  className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-zinc-50 dark:hover:bg-slate-900/60"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-mono text-xs font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                    {info.grade}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-extrabold text-zinc-900 dark:text-white">
                      {info.standardTitle}
                    </div>
                    <div className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
                      <span className="font-mono">{standardId}</span> ·{" "}
                      {info.domain} · {info.items.length} question
                      {info.items.length === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-indigo-600">
                    {isExpanded ? "Hide" : "View"}
                  </div>
                </button>

                {isExpanded && (
                  <ul className="divide-y divide-zinc-100 border-t border-zinc-100 bg-zinc-50/40 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950/30">
                    {info.items.map((qn) => {
                      const imgFailed = imageErrors.has(qn.id);
                      const isPlaying = playingId === qn.id;
                      return (
                        <li key={qn.id} className="px-4 py-3">
                          <div className="flex items-start gap-3">
                            {/* Thumbnail */}
                            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                              {imgFailed ? (
                                <ImageOff className="h-5 w-5 text-zinc-300" />
                              ) : (
                                <img
                                  src={qn.imageUrl}
                                  alt=""
                                  loading="lazy"
                                  onError={() =>
                                    setImageErrors((prev) => new Set(prev).add(qn.id))
                                  }
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:bg-slate-900 dark:text-slate-400">
                                  {TYPE_LABELS[qn.type] ?? qn.type}
                                </span>
                                <span className="font-mono text-[10px] text-zinc-400">
                                  {qn.id}
                                </span>
                                {qn.difficulty && (
                                  <span className="text-[10px] text-zinc-400">
                                    diff {qn.difficulty}
                                  </span>
                                )}
                                {qn.audioUrl && (
                                  <button
                                    type="button"
                                    onClick={() => playAudio(qn.id, qn.audioUrl!)}
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition ${
                                      isPlaying
                                        ? "bg-indigo-600 text-white"
                                        : "border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900 dark:bg-slate-900 dark:text-indigo-300"
                                    }`}
                                  >
                                    <Volume2 className="h-3 w-3" />
                                    {isPlaying ? "Stop" : "Play"}
                                  </button>
                                )}
                              </div>
                              <div className="mt-1.5 whitespace-pre-line text-sm text-zinc-800 dark:text-slate-200">
                                {qn.prompt}
                              </div>
                              {qn.choices && qn.choices.length > 0 && (
                                <ul className="mt-2 flex flex-wrap gap-1 text-xs">
                                  {qn.choices.map((c) => {
                                    const isCorrect = qn.correct === c;
                                    return (
                                      <li
                                        key={c}
                                        className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 ${
                                          isCorrect
                                            ? "bg-green-50 font-semibold text-green-800 dark:bg-green-950/30 dark:text-green-300"
                                            : "bg-white text-zinc-600 dark:bg-slate-900 dark:text-slate-400"
                                        }`}
                                      >
                                        {isCorrect && <Check className="h-3 w-3" />}
                                        {c}
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
