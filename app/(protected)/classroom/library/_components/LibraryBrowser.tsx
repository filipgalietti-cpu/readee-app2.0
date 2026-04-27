"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Check, Filter, Volume2, ImageOff, Grid, List, ChevronRight, ChevronDown } from "lucide-react";

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

type ViewMode = "standards" | "questions";

export default function LibraryBrowser({ questions }: { questions: LibraryQuestion[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>("standards");
  const [grade, setGrade] = useState<string>("All");
  const [type, setType] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [focusStandardId, setFocusStandardId] = useState<string | null>(null);

  // When a standard card is clicked from the index view, switch to
  // questions mode AND auto-expand+scroll that standard.
  useEffect(() => {
    if (!focusStandardId) return;
    setViewMode("questions");
    setExpanded((prev) => {
      const next = new Set(prev);
      next.add(focusStandardId);
      return next;
    });
    const el = document.getElementById(`std-${focusStandardId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setFocusStandardId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusStandardId]);

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
      {/* View toggle */}
      <div className="mb-3 inline-flex rounded-full border border-zinc-200 bg-white p-0.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950">
        <button
          type="button"
          onClick={() => setViewMode("standards")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 transition ${
            viewMode === "standards"
              ? "bg-indigo-600 text-white"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-slate-300"
          }`}
        >
          <Grid className="h-3 w-3" />
          Standards
        </button>
        <button
          type="button"
          onClick={() => setViewMode("questions")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 transition ${
            viewMode === "questions"
              ? "bg-indigo-600 text-white"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-slate-300"
          }`}
        >
          <List className="h-3 w-3" />
          All questions
        </button>
      </div>

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
      ) : viewMode === "standards" ? (
        <StandardsGrid
          byStandard={byStandard}
          onPick={(sid) => setFocusStandardId(sid)}
          forceGrade={grade === "All" ? null : grade}
        />
      ) : (
        <ul className="mt-6 space-y-3">
          {byStandard.map(([standardId, info]) => {
            const isExpanded = expanded.has(standardId);
            return (
              <li
                key={standardId}
                id={`std-${standardId}`}
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

/* ─── Standards index grid ─────────────────────────────────────── */

type ByStandardEntry = [
  string,
  { standardTitle: string; domain: string; grade: string; items: LibraryQuestion[] },
];

/**
 * StandardsGrid — accordion-style browser. Default state: every grade
 * collapsed except the first one with results. Within an open grade,
 * domains are also collapsible (default first domain open).
 *
 * Pattern: [Grade header (click to toggle)]
 *           ▼ [Domain header (click to toggle)]
 *               • Standard card · Standard card · ...
 *           ▶ [Domain header collapsed]
 *
 * Search + grade filter at the top of the page narrow the data; the
 * accordion just controls how much you see at once.
 */
function StandardsGrid({
  byStandard,
  onPick,
  forceGrade,
}: {
  byStandard: ByStandardEntry[];
  onPick: (sid: string) => void;
  /** When set (filter pinned to a grade), only that grade renders + auto-expand. */
  forceGrade: string | null;
}) {
  const GRADE_ORDER = ["K", "1st", "2nd", "3rd", "4th"];

  const byGrade = useMemo(() => {
    const m = new Map<string, Map<string, ByStandardEntry[]>>();
    for (const entry of byStandard) {
      const [, info] = entry;
      if (!m.has(info.grade)) m.set(info.grade, new Map());
      const dm = m.get(info.grade)!;
      const dom = info.domain;
      if (!dm.has(dom)) dm.set(dom, []);
      dm.get(dom)!.push(entry);
    }
    return m;
  }, [byStandard]);

  const visibleGrades = GRADE_ORDER.filter((g) => byGrade.has(g));

  // Default: only the first eligible grade is open. If a single-grade
  // filter is active, that one is open and the others don't render.
  const [openGrades, setOpenGrades] = useState<Set<string>>(() => {
    if (forceGrade) return new Set([forceGrade]);
    const first = visibleGrades[0];
    return new Set(first ? [first] : []);
  });

  // Re-sync when filter changes
  useEffect(() => {
    if (forceGrade) {
      setOpenGrades(new Set([forceGrade]));
    } else if (visibleGrades.length > 0) {
      setOpenGrades((prev) => (prev.size === 0 ? new Set([visibleGrades[0]]) : prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceGrade]);

  function toggleGrade(g: string) {
    setOpenGrades((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  }

  function totalQuestions(domains: Map<string, ByStandardEntry[]>): number {
    let n = 0;
    for (const arr of domains.values()) {
      for (const [, info] of arr) n += info.items.length;
    }
    return n;
  }

  // When forceGrade is set, render only that grade
  const grades = forceGrade
    ? visibleGrades.filter((g) => g === forceGrade)
    : visibleGrades;

  return (
    <div className="mt-6 space-y-3">
      {grades.map((g) => {
        const domains = byGrade.get(g)!;
        const standardCount = Array.from(domains.values()).reduce(
          (s, arr) => s + arr.length,
          0,
        );
        const qCount = totalQuestions(domains);
        const isOpen = openGrades.has(g);

        return (
          <section
            key={g}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-slate-800 dark:bg-slate-900/40"
          >
            <button
              type="button"
              onClick={() => toggleGrade(g)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-zinc-50 dark:hover:bg-slate-900/60"
            >
              <span
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-zinc-400 transition ${
                  isOpen ? "rotate-0" : "-rotate-90"
                }`}
              >
                <ChevronDown className="h-4 w-4" />
              </span>
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 font-mono text-xs font-bold text-white">
                {g}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-extrabold text-zinc-900 dark:text-white">
                  {g === "K" ? "Kindergarten" : `${g} Grade`}
                </h2>
                <div className="text-xs text-zinc-500 dark:text-slate-400">
                  {standardCount} standard{standardCount === 1 ? "" : "s"} ·{" "}
                  {qCount.toLocaleString()} question{qCount === 1 ? "" : "s"}
                </div>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-zinc-100 bg-zinc-50/40 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/30">
                <DomainAccordion
                  domains={domains}
                  onPick={onPick}
                  gradeKey={g}
                />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function DomainAccordion({
  domains,
  onPick,
  gradeKey,
}: {
  domains: Map<string, ByStandardEntry[]>;
  onPick: (sid: string) => void;
  gradeKey: string;
}) {
  const entries = Array.from(domains.entries());
  // Default: open the first domain only.
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(entries[0] ? [entries[0][0]] : []),
  );

  function toggle(domain: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {entries.map(([domain, standards]) => {
        const isOpen = open.has(domain);
        return (
          <div
            key={domain}
            className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-slate-700 dark:bg-slate-900"
          >
            <button
              type="button"
              onClick={() => toggle(domain)}
              className="flex w-full items-center gap-2 px-4 py-2 text-left transition hover:bg-zinc-50 dark:hover:bg-slate-900/60"
            >
              <span
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center text-zinc-400 transition ${
                  isOpen ? "rotate-0" : "-rotate-90"
                }`}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </span>
              <span className="flex-1 text-[12px] font-bold uppercase tracking-widest text-zinc-600 dark:text-slate-300">
                {domain}
              </span>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-slate-800 dark:text-slate-400">
                {standards.length}
              </span>
            </button>

            {isOpen && (
              <ul className="grid gap-2 border-t border-zinc-100 p-3 dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-3">
                {standards.map(([sid, info]) => (
                  <li key={sid}>
                    <button
                      type="button"
                      onClick={() => onPick(sid)}
                      className="flex w-full items-start gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-mono text-[11px] font-extrabold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                        {sid.split(".").slice(-1)[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white">
                            {sid}
                          </span>
                          <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:bg-slate-800 dark:text-slate-400">
                            {info.items.length}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500 dark:text-slate-400">
                          {info.standardTitle}
                        </p>
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-zinc-400" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
