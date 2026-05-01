"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Sparkles, ArrowRight } from "lucide-react";

type Pick = {
  id: string;
  slug: string | null;
  title: string;
  image_url: string | null;
  grade_level: string;
  topic: string;
  phonics_pattern: string | null;
  view_count: number;
  display_byline: string | null;
};

export default function TopCommunityPicks() {
  const [items, setItems] = useState<Pick[] | null>(null);

  useEffect(() => {
    fetch("/api/community/top-picks")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <div className="mt-2 rounded-2xl bg-gradient-to-br from-violet-50 via-indigo-50 to-violet-100 p-4 shadow-sm dark:from-violet-950/20 dark:via-indigo-950/30 dark:to-violet-950/30">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
          <Users className="h-3.5 w-3.5" />
          From the community
        </div>
        <Link
          href="/practice-hub/community"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 hover:underline dark:text-violet-300"
        >
          See all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {items.map((p) => {
          const href = p.slug
            ? `/practice-hub/community/${p.id}`
            : `/practice-hub/community/${p.id}`;
          return (
            <Link
              key={p.id}
              href={href}
              className="flex items-center gap-3 rounded-xl bg-white p-2 transition hover:shadow-sm dark:bg-slate-900"
            >
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image_url}
                  alt=""
                  className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-500">
                  <Sparkles className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="rounded-full bg-violet-100 px-1.5 py-0.5 font-bold text-violet-700">
                    {p.grade_level}
                  </span>
                  <span className="text-zinc-400">
                    {p.view_count.toLocaleString()} reads
                  </span>
                </div>
                <div className="mt-0.5 truncate text-xs font-bold text-zinc-900 dark:text-white">
                  {p.title}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
