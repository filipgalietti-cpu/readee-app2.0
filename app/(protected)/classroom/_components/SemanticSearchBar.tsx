"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  Loader2,
  BookOpen,
  BookOpenText,
  Layers,
  ClipboardPen,
  ImageIcon,
  Lock,
  X,
} from "lucide-react";
import { semanticSearch } from "../search-actions";
import type { SearchHit } from "@/lib/ai/embeddings";

type HrefArgs = { id: string; metadata: Record<string, unknown> };

function buildHref(contentType: string, args: HrefArgs): string {
  const { id, metadata } = args;
  const standardId = (metadata as any)?.standard_id ?? null;

  switch (contentType) {
    case "sample_lesson":
      // Teacher preview of a Readee sample lesson (slides + MCQs).
      // Falls back to the library filtered by standard if we somehow
      // don't have a standard id on the hit.
      return standardId
        ? `/classroom/library/lesson/${encodeURIComponent(standardId)}`
        : `/classroom/library`;
    case "sample_question":
      // Teacher preview of a single practice question.
      return `/classroom/library/question/${encodeURIComponent(id)}`;
    case "story":
      // Teacher preview of a decodable story (passage + 3 MCQs).
      return `/classroom/library/story/${encodeURIComponent(id)}`;
    case "custom_lesson":
      return `/classroom/lessons/${id}`;
    case "custom_book":
      return `/classroom/books/${id}`;
    case "custom_quiz":
      return `/classroom/authoring/quiz/${id}`;
    case "leveled_passage":
      return `/classroom/leveled/${id}`;
    default:
      return `/classroom/library`;
  }
}

const TYPE_META: Record<string, { label: string; icon: any; color: string }> = {
  sample_lesson:    { label: "Readee lesson",   icon: BookOpen,     color: "text-indigo-600 bg-indigo-50" },
  sample_question:  { label: "Practice Q",      icon: ClipboardPen, color: "text-emerald-600 bg-emerald-50" },
  story:            { label: "Story",           icon: BookOpenText, color: "text-amber-600 bg-amber-50" },
  custom_lesson:    { label: "Your lesson",     icon: BookOpen,     color: "text-violet-600 bg-violet-50" },
  custom_book:      { label: "Your book",       icon: BookOpenText, color: "text-violet-600 bg-violet-50" },
  custom_quiz:      { label: "Your quiz",       icon: ClipboardPen, color: "text-violet-600 bg-violet-50" },
  leveled_passage:  { label: "Leveled passage", icon: Layers,       color: "text-rose-600 bg-rose-50" },
};

export default function SemanticSearchBar({
  isPremium,
}: {
  isPremium: boolean;
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

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-3 shadow-sm">
      <div className="flex items-center gap-2 px-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-violet-700">
        <Sparkles className="h-3 w-3" />
        Smart search
        {!isPremium && (
          <span className="ml-1 rounded-full bg-violet-600 px-2 py-0.5 text-[9px] text-white">
            Readee+
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm">
        <Search className="h-4 w-4 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            isPremium
              ? "Describe what you're looking for — \"a 2nd grade story about kindness,\" \"context clues practice,\" …"
              : "Smart search is a Readee+ feature"
          }
          disabled={!isPremium}
          className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none disabled:cursor-not-allowed"
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
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {!isPremium && (
        <div className="mt-2 flex items-center justify-between gap-2 px-2 text-xs text-zinc-600">
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

      {planLocked && isPremium === false && null}

      {err && !planLocked && (
        <div className="mt-2 px-2 text-xs font-semibold text-red-600">{err}</div>
      )}

      {hits && hits.length === 0 && (
        <div className="mt-2 px-2 text-xs text-zinc-500">
          Nothing matched. Try fewer or more general words.
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
            });
            return (
              <Link
                key={h.contentType + h.contentId}
                href={href}
                className="flex items-start gap-3 rounded-xl border border-transparent bg-white px-3 py-2 transition hover:border-violet-300 hover:shadow-sm"
              >
                <div
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${meta.color}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    {meta.label}
                    {sub && (
                      <>
                        <span className="text-zinc-300">·</span>
                        <span>{sub}</span>
                      </>
                    )}
                  </div>
                  <div className="truncate text-sm font-semibold text-zinc-900">
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
