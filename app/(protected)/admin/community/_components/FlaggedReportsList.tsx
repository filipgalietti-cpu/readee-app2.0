"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { resolveReport } from "../actions";

export type FlaggedReport = {
  id: string;
  slug: string;
  reason: string | null;
  verdict: string | null;
  removed: boolean;
  anonymous: boolean;
  created_at: string;
  passage: { id: string; title: string; status: string; display_byline: string | null } | null;
};

export default function FlaggedReportsList({ items }: { items: FlaggedReport[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-zinc-200 bg-white p-12 text-center">
        <p className="text-sm text-zinc-500">No open flags.</p>
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <FlagCard key={item.id} item={item} />
      ))}
    </ul>
  );
}

function FlagCard({ item }: { item: FlaggedReport }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const storyStatus = item.passage?.status ?? "unknown";

  function resolve() {
    setErr(null);
    start(async () => {
      const res = await resolveReport({ reportId: item.id });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <li className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            item.removed
              ? "bg-red-100 text-red-700"
              : storyStatus === "approved"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-zinc-100 text-zinc-600"
          }`}
        >
          {item.removed ? "Taken down" : `Story ${storyStatus}`}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            item.reason ? "bg-rose-100 text-rose-700" : "bg-zinc-100 text-zinc-500"
          }`}
        >
          {item.reason ?? "No reason (tap or bot)"}
        </span>
        <span className="text-[11px] text-zinc-400">
          {item.anonymous ? "Anonymous" : "Signed in"} · {new Date(item.created_at).toLocaleString()}
        </span>
      </div>
      <h3 className="mt-1 truncate text-base font-bold text-zinc-900">
        {item.passage?.title ?? item.slug}
      </h3>
      <p className="mt-0.5 text-xs text-zinc-500">
        By {item.passage?.display_byline ?? "unknown"} · AI re-review: {item.verdict ?? "pending"}
      </p>
      {err && <p className="mt-2 text-xs font-semibold text-red-600">{err}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a
          href={`/community/${item.slug}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-indigo-300"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Open story
        </a>
        <button
          type="button"
          onClick={resolve}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          Resolve
        </button>
      </div>
    </li>
  );
}
