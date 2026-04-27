"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

type Page = {
  position: number;
  body: string;
  image_url: string | null;
};

export default function StoryReader({
  pages,
  title,
}: {
  pages: Page[];
  title: string;
}) {
  const [page, setPage] = useState(0);
  const total = pages.length;
  if (total === 0) {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center text-sm text-zinc-500">
        This story has no pages yet.
      </div>
    );
  }
  const p = pages[page];
  return (
    <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50/40 via-white to-pink-50/40 shadow-sm dark:border-slate-800">
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-2.5 text-xs">
        <span className="font-semibold text-zinc-500">
          Page {page + 1} of {total}
        </span>
        <div className="flex items-center gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === page
                  ? "w-5 bg-violet-600"
                  : i < page
                    ? "w-1.5 bg-violet-300"
                    : "w-1.5 bg-zinc-200"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="px-6 py-8 sm:px-12 sm:py-10">
        {p.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image_url}
            alt=""
            className="mx-auto h-72 w-full rounded-2xl object-cover shadow-sm sm:h-80"
          />
        ) : (
          <div className="flex h-72 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100 text-violet-400">
            <ImageIcon className="h-14 w-14" />
          </div>
        )}
        <p
          className="mx-auto mt-8 max-w-2xl text-center text-[28px] font-medium leading-snug text-zinc-900 dark:text-slate-100"
          style={{
            fontFamily:
              'Andika, "Comic Sans MS", "Trebuchet MS", system-ui, sans-serif',
          }}
        >
          {p.body || "(blank page)"}
        </p>
      </div>
      <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-500 transition hover:bg-zinc-100 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
          {title}
        </span>
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(total - 1, p + 1))}
          disabled={page >= total - 1}
          className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-violet-700 disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
