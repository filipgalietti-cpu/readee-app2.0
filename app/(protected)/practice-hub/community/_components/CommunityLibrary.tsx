"use client";

/**
 * Community Library — hi-fi redesign wired from the Claude Design
 * "Community Hi-Fi" mock. A rotating spotlight, tabs (Trending / New / For the
 * child's grade / Kid-written), search + topic chips, and a responsive card
 * grid. Shows only the real "reads" metric (unique readers); no "listens".
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, PenLine, Search, Sparkles, Eye, ArrowRight } from "lucide-react";
import TileImage from "./TileImage";

type Item = {
  id: string;
  slug: string | null;
  title: string;
  blurb: string;
  image_url: string | null;
  grade_level: string;
  topic: string;
  phonics_pattern: string | null;
  view_count: number;
  display_byline: string | null;
  display_avatar: string | null;
  source_kind: string | null;
  created_at: string;
};

const BALOO = { fontFamily: "'Baloo 2','Nunito',sans-serif" };
// Soft cover backdrops, assigned stably per story so the grid stays calm.
const TINTS = ["#eef2ff", "#ede9fe", "#fef3c7", "#d1fae5", "#ffe4e6", "#e0f2fe"];
function tintFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length];
}
function readerHref(it: Item) {
  return it.slug ? `/community/${it.slug}` : `/practice-hub/community/${it.id}`;
}
function byline(it: Item) {
  const b = it.display_byline?.trim();
  if (!b) return "Shared by a Readee family";
  if (it.source_kind === "kid_story") return `Written by ${b}`;
  // Curated/org labels ("Featured by Readee") already read as a full phrase —
  // don't prepend another "Shared by".
  if (/\bby\b/i.test(b) || /readee/i.test(b)) return b;
  return `Shared by ${b}`;
}

export default function CommunityLibrary({
  items,
  childGrade,
  childName,
  childParam,
}: {
  items: Item[];
  childGrade: string | null;
  childName: string | null;
  childParam: string | null;
}) {
  const [tab, setTab] = useState<"trending" | "new" | "grade">("trending");
  const [topic, setTopic] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [spot, setSpot] = useState(0);
  const [limit, setLimit] = useState(9);

  const cq = childParam ? `?child=${encodeURIComponent(childParam)}` : "";
  const studioHref = `/luna/studio${cq}`;

  // Spotlight = the 5 most-read stories (items arrive sorted by view_count).
  const spotlight = useMemo(() => items.slice(0, 5), [items]);
  useEffect(() => {
    if (spotlight.length <= 1) return;
    const id = setInterval(() => setSpot((s) => (s + 1) % spotlight.length), 8000);
    return () => clearInterval(id);
  }, [spotlight.length]);

  // Topic chips derived from the loaded stories — only short, tag-like topics
  // (kid-story categories like "Superhero"), never the long sentence-topics
  // seed content carries, so the chip strip stays clean.
  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const it of items) {
      const t = (it.topic ?? "").trim();
      if (!t || t.length > 18 || t.split(/\s+/).length > 2) continue;
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([t]) => t);
  }, [items]);

  const list = useMemo(() => {
    let out = items.slice();
    if (tab === "new") out.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    else if (tab === "grade") out = out.filter((i) => i.grade_level === childGrade);
    if (topic) out = out.filter((i) => i.topic.toLowerCase().includes(topic.toLowerCase()));
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      out = out.filter((i) => i.title.toLowerCase().includes(s) || i.topic.toLowerCase().includes(s));
    }
    return out;
  }, [items, tab, topic, q, childGrade]);

  useEffect(() => setLimit(9), [tab, topic, q]);
  const visible = list.slice(0, limit);
  const cur = spotlight[Math.min(spot, Math.max(0, spotlight.length - 1))];

  const tabs = [
    { id: "trending", label: "Trending" },
    { id: "new", label: "New this week" },
    { id: "grade", label: childName ? `Just for ${childName}` : "Just for you" },
  ] as const;

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8">
      <Link
        href={`/practice-hub${cq}`}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" /> Practice Hub
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-[34px]" style={BALOO}>
          Community Library
        </h1>
        <Link
          href={studioHref}
          className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-violet-600"
          style={BALOO}
        >
          <PenLine className="h-4 w-4" /> Share your story
        </Link>
      </div>

      {/* Spotlight */}
      {cur && (
        <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-gradient-to-br from-white to-violet-50 p-4 dark:border-slate-800 dark:from-slate-900 dark:to-violet-950/20 sm:flex-row sm:gap-5">
          <Link
            href={readerHref(cur)}
            className="relative flex h-[184px] w-full flex-none items-center justify-center overflow-hidden rounded-2xl sm:w-[220px]"
            style={{ background: tintFor(cur.id) }}
          >
            {cur.image_url ? (
              <TileImage src={cur.image_url} className="h-full w-full" />
            ) : (
              <Sparkles className="h-12 w-12 text-violet-400" />
            )}
          </Link>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-indigo-700 dark:text-indigo-300">
                Spotlight {spot + 1} of {spotlight.length}
              </span>
            </div>
            <Link href={readerHref(cur)}>
              <h2 className="mt-1.5 text-2xl font-extrabold leading-tight text-zinc-900 hover:text-indigo-700 dark:text-white" style={BALOO}>
                {cur.title}
              </h2>
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-slate-400">
              {cur.display_avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cur.display_avatar} alt="" className="h-6 w-6 flex-none rounded-full object-cover ring-1 ring-white dark:ring-slate-800" />
              ) : null}
              <span>{byline(cur)}</span>
              <span className="text-zinc-400">· {cur.view_count.toLocaleString()} reads</span>
            </div>
            {cur.blurb && (
              <p className="mt-2 line-clamp-2 max-w-2xl text-[15px] leading-snug text-zinc-600 dark:text-slate-300">
                {cur.blurb}
              </p>
            )}
            <div className="mt-auto flex items-center gap-3 pt-3">
              <Link
                href={readerHref(cur)}
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-700 px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-indigo-800"
                style={BALOO}
              >
                Read it <ArrowRight className="h-4 w-4" />
              </Link>
              {spotlight.length > 1 && (
                <div className="ml-auto flex items-center gap-1.5">
                  {spotlight.map((s, n) => (
                    <button
                      key={s.id}
                      type="button"
                      aria-label={`Show ${s.title}`}
                      onClick={() => setSpot(n)}
                      className="h-[9px] rounded-full transition-all"
                      style={{ width: n === spot ? 24 : 9, background: n === spot ? "#4338ca" : "#d4d4d8" }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-8 flex gap-5 overflow-x-auto border-b border-zinc-200 dark:border-slate-800">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap border-b-[3px] pb-3 text-base font-extrabold transition ${
                active
                  ? "border-indigo-700 text-zinc-900 dark:border-indigo-400 dark:text-white"
                  : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-slate-300"
              }`}
              style={BALOO}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Search + topic chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 dark:border-slate-700">
          <Search className="h-4 w-4 flex-none text-zinc-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search stories"
            className="w-[180px] bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
          />
        </div>
        <Chip active={topic === null} onClick={() => setTopic(null)}>All topics</Chip>
        {topics.map((t) => (
          <Chip key={t} active={topic === t} onClick={() => setTopic(topic === t ? null : t)}>
            {t}
          </Chip>
        ))}
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-zinc-200 py-16 text-center dark:border-slate-800">
          <Sparkles className="mx-auto h-9 w-9 text-violet-400" />
          <p className="mt-3 text-base font-bold text-zinc-700 dark:text-slate-200" style={BALOO}>
            No stories here yet
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
            Try another tab or clear your search.
          </p>
        </div>
      ) : (
        <div
          className="mt-5 grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}
        >
          {visible.map((it) => (
            <Link
              key={it.id}
              href={readerHref(it)}
              className="group block overflow-hidden rounded-[20px] border border-zinc-200 bg-white transition hover:-translate-y-[3px] hover:border-indigo-200 hover:shadow-[0_12px_28px_-14px_rgba(49,46,129,0.4)] dark:border-slate-800 dark:bg-slate-900/40"
            >
              <div className="flex h-[132px] items-end justify-center" style={{ background: tintFor(it.id) }}>
                {it.image_url ? (
                  <TileImage src={it.image_url} className="h-full w-full" />
                ) : (
                  <Sparkles className="mb-6 h-10 w-10 text-violet-400" />
                )}
              </div>
              <div className="p-3.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                    {it.grade_level}
                  </span>
                  {it.phonics_pattern && (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                      {it.phonics_pattern}
                    </span>
                  )}
                </div>
                <h3 className="mt-2 line-clamp-2 text-[18px] font-extrabold leading-tight text-zinc-900 group-hover:text-indigo-700 dark:text-white" style={BALOO}>
                  {it.title}
                </h3>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-slate-400">
                  {it.display_avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.display_avatar} alt="" className="h-5 w-5 flex-none rounded-full object-cover ring-1 ring-white dark:ring-slate-800" />
                  ) : null}
                  <span>{byline(it)}</span>
                </div>
                <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-zinc-400">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> {it.view_count.toLocaleString()} reads
                  </span>
                  <span className="ml-auto text-indigo-700 dark:text-indigo-300">Read →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {visible.length < list.length && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setLimit((l) => l + 9)}
            className="rounded-2xl border border-zinc-200 bg-white px-6 py-3 text-sm font-extrabold text-indigo-700 transition hover:bg-zinc-50 dark:border-slate-700 dark:bg-slate-900/50 dark:text-indigo-300"
            style={BALOO}
          >
            Show more stories
          </button>
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-[13px] font-bold transition ${
        active
          ? "border-indigo-700 bg-indigo-700 text-white"
          : "border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
      }`}
    >
      {children}
    </button>
  );
}
