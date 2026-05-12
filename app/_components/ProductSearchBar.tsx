"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Sparkles,
  Loader2,
  BookOpen,
  BookOpenText,
  ClipboardPen,
  Lock,
  X,
} from "lucide-react";
import { semanticSearch } from "@/app/(protected)/_actions/search-actions";
import type { SearchHit } from "@/lib/ai/embeddings";

type HrefArgs = {
  id: string;
  metadata: Record<string, unknown>;
  childId: string;
};

/**
 * Parent-side smart-search destinations.
 *
 * Lessons land the kid in the slideshow runner; practice questions
 * land the kid on the standard's practice session; stories drop the
 * parent into the library scrolled to that title. Each route carries
 * the resolved childId so we never dead-end on "No reader selected."
 */
function buildHref(contentType: string, args: HrefArgs): string {
  const { id, metadata, childId } = args;
  const standardId = (metadata as any)?.standard_id ?? null;
  const childParam = `child=${encodeURIComponent(childId)}`;

  switch (contentType) {
    case "sample_lesson":
      return standardId
        ? `/learn?${childParam}&standard=${encodeURIComponent(standardId)}`
        : `/practice-hub?${childParam}`;
    case "sample_question":
      // Question ids look like RL.K.1-Q1 — first segment is the
      // standard. We send the kid into that standard's practice
      // session and pin the searched-for question to the front via
      // `focus`, so the kid actually sees what the parent searched
      // for instead of waiting for a random shuffle to surface it.
      return standardId
        ? `/practice?${childParam}&standard=${encodeURIComponent(standardId)}&focus=${encodeURIComponent(id)}`
        : `/practice-hub?${childParam}`;
    case "story":
      // Stories don't have per-id deep links yet — land on the library
      // and scroll to the entry via the hash.
      return `/stories?${childParam}#${encodeURIComponent(id)}`;
    default:
      return `/practice-hub?${childParam}`;
  }
}

const TYPE_META: Record<string, { label: string; icon: any; color: string }> = {
  sample_lesson:   { label: "Lesson",     icon: BookOpen,     color: "text-indigo-600 bg-indigo-50" },
  sample_question: { label: "Practice Q", icon: ClipboardPen, color: "text-emerald-600 bg-emerald-50" },
  story:           { label: "Story",      icon: BookOpenText, color: "text-amber-600 bg-amber-50" },
};

export default function ProductSearchBar({
  isPremium,
  childId,
}: {
  isPremium: boolean;
  /** Required so result links carry ?child=… into the runner. */
  childId: string | null;
}) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [planLocked, setPlanLocked] = useState(false);

  // Debounce: search 350ms after typing stops.
  useEffect(() => {
    if (!isPremium) return;
    const q = query.trim();
    if (q.length < 3) {
      setHits(null);
      setErr(null);
      return;
    }
    const t = setTimeout(() => {
      start(async () => {
        const res = await semanticSearch({ query: q });
        if (!res.ok) {
          if (res.reason === "plan") setPlanLocked(true);
          setErr(res.error);
          setHits(null);
          return;
        }
        setErr(null);
        setHits(res.hits);
      });
    }, 350);
    return () => clearTimeout(t);
  }, [query, isPremium]);

  // Without a resolved child we can't construct working hit links, so
  // hide the bar entirely. Caller surfaces always have a child loaded
  // by the time they render us, but this keeps the contract explicit.
  if (!childId) return null;

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-3 shadow-sm dark:border-violet-900/40 dark:from-violet-950/30 dark:to-indigo-950/30">
      <div className="flex items-center gap-2 px-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
        <Sparkles className="h-3 w-3" />
        Smart search
        {!isPremium && (
          <span className="ml-1 rounded-full bg-violet-600 px-2 py-0.5 text-[9px] text-white">
            Readee+
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <Search className="h-4 w-4 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            isPremium
              ? "Describe what your kid needs — \"a 2nd grade story about kindness,\" \"context clues practice,\" …"
              : "Smart search is a Readee+ feature"
          }
          disabled={!isPremium}
          className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none disabled:cursor-not-allowed dark:text-slate-100"
        />
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
        ) : query.trim().length > 0 ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setHits(null);
              setErr(null);
            }}
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-slate-800"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {!isPremium && (
        <div className="mt-2 flex items-center justify-between gap-2 px-2 text-xs text-zinc-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            Upgrade to search by meaning, not just keywords.
          </div>
          <Link
            href="/upgrade?reason=smart_search"
            className="rounded-full bg-violet-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-violet-700"
          >
            Upgrade
          </Link>
        </div>
      )}

      {err && !planLocked && (
        <div className="mt-2 px-2 text-xs font-semibold text-red-600">{err}</div>
      )}

      {hits && hits.length === 0 && (
        <div className="mt-3 flex flex-col items-center rounded-xl border border-zinc-200 bg-white px-4 py-5 text-center dark:border-slate-700 dark:bg-slate-900">
          <Image
            src="/images/ui/bunny-thinking.png"
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
          />
          <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-white">
            Nothing matched that.
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-slate-400">
            Try a skill name like
            {" "}
            <button
              type="button"
              onClick={() => setQuery("context clues")}
              className="rounded-full bg-violet-50 px-2 py-0.5 font-bold text-violet-700 hover:bg-violet-100 dark:bg-violet-950/40 dark:text-violet-300"
            >
              context clues
            </button>
            {", "}
            <button
              type="button"
              onClick={() => setQuery("main idea")}
              className="rounded-full bg-violet-50 px-2 py-0.5 font-bold text-violet-700 hover:bg-violet-100 dark:bg-violet-950/40 dark:text-violet-300"
            >
              main idea
            </button>
            {", or a CCSS code like "}
            <button
              type="button"
              onClick={() => setQuery("RL.2.1")}
              className="rounded-full bg-violet-50 px-2 py-0.5 font-mono font-bold text-violet-700 hover:bg-violet-100 dark:bg-violet-950/40 dark:text-violet-300"
            >
              RL.2.1
            </button>
            .
          </p>
        </div>
      )}

      {hits && hits.length > 0 && (
        <div className="mt-3 space-y-1">
          {hits.map((h) => {
            const meta = TYPE_META[h.contentType] ?? TYPE_META.sample_question;
            const Icon = meta.icon;
            const md = h.metadata as any;
            const title =
              md?.title ?? md?.prompt ?? md?.standard_id ?? h.contentId.slice(0, 8);
            const sub =
              md?.standard_id || md?.grade_level || md?.grade
                ? `${md?.grade_level ?? md?.grade ?? ""}${md?.standard_id ? " · " + md.standard_id : ""}`
                : null;
            const href = buildHref(h.contentType, {
              id: h.contentId,
              metadata: md ?? {},
              childId,
            });
            return (
              <Link
                key={h.contentType + h.contentId}
                href={href}
                className="flex items-start gap-3 rounded-xl border border-transparent bg-white px-3 py-2 transition hover:border-violet-300 hover:shadow-sm dark:bg-slate-900 dark:hover:border-violet-700"
              >
                <div
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${meta.color}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
                    {meta.label}
                    {sub && (
                      <>
                        <span className="text-zinc-300">·</span>
                        <span>{sub}</span>
                      </>
                    )}
                  </div>
                  <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                    {String(title)}
                  </div>
                </div>
                <div className="flex-shrink-0 text-[10px] font-bold text-zinc-400">
                  {Math.round(h.similarity * 100)}%
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
