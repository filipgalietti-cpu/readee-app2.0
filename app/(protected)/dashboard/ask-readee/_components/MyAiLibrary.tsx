"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  ImageOff,
  Volume2,
  Play,
  Pause,
  Users,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { deleteChildAiContent, toggleShareContent } from "../actions";

type LibraryItem = {
  id: string;
  child_id: string;
  kind: "passage" | "practice_set";
  topic: string;
  grade_level: string | null;
  title: string | null;
  passage_text: string | null;
  image_url: string | null;
  audio_url: string | null;
  play_count: number;
  created_at: string;
  shared: boolean;
};

export default function MyAiLibrary({
  items,
  children,
}: {
  items: LibraryItem[];
  children: { id: string; first_name: string }[];
}) {
  const childName = (id: string) =>
    children.find((c) => c.id === id)?.first_name ?? "Unknown";

  // Group by child so parents with multiple kids get a clean view.
  const byChild = new Map<string, LibraryItem[]>();
  for (const it of items) {
    const arr = byChild.get(it.child_id) ?? [];
    arr.push(it);
    byChild.set(it.child_id, arr);
  }

  return (
    <div className="space-y-5">
      {Array.from(byChild.entries()).map(([childId, list]) => (
        <div key={childId}>
          <div className="mb-2 text-xs font-bold text-zinc-500 dark:text-slate-400">
            For <span className="text-zinc-900 dark:text-white">{childName(childId)}</span>
          </div>
          <ul className="space-y-2">
            {list.map((item) => (
              <LibraryCard key={item.id} item={item} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function LibraryCard({ item }: { item: LibraryItem }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audio] = useState<HTMLAudioElement | null>(() => {
    if (typeof window === "undefined" || !item.audio_url) return null;
    const a = new Audio(item.audio_url);
    a.onended = () => setPlaying(false);
    return a;
  });
  const [shared, setShared] = useState(item.shared);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function toggleAudio() {
    if (!audio) return;
    if (audio.paused) {
      audio.currentTime = 0;
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  function handleDelete() {
    if (!confirm("Delete this? This can't be undone.")) return;
    setErr(null);
    start(async () => {
      const res = await deleteChildAiContent({ contentId: item.id });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.refresh();
    });
  }

  function handleShareToggle(next: boolean) {
    setErr(null);
    setShared(next);
    start(async () => {
      const res = await toggleShareContent({ contentId: item.id, shared: next });
      if (!res.ok) {
        setShared(!next);
        setErr(res.error);
      }
    });
  }

  return (
    <li className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-start gap-3">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt=""
            className="h-20 w-20 flex-shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 dark:bg-slate-800 dark:text-slate-500">
            <ImageOff className="h-6 w-6" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
              {item.kind === "passage" ? "Passage" : "Practice"}
            </span>
            {item.grade_level && (
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-slate-400">
                {item.grade_level}
              </span>
            )}
            {shared && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Users className="h-3 w-3" /> Shared
              </span>
            )}
          </div>
          <h3 className="mt-1 truncate text-base font-bold text-zinc-900 dark:text-white">
            {item.title ?? item.topic}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500 dark:text-slate-400">
            {item.topic}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {item.audio_url && (
              <button
                type="button"
                onClick={toggleAudio}
                className="inline-flex items-center gap-1 rounded-full border border-violet-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:bg-slate-900 dark:text-violet-300 dark:hover:bg-violet-950/30"
              >
                {playing ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
                <Volume2 className="h-3 w-3" />
                Listen
              </button>
            )}
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {expanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              {expanded ? "Hide" : "View"} passage
            </button>
            <label className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-zinc-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              <input
                type="checkbox"
                className="h-3 w-3 accent-violet-600"
                checked={shared}
                onChange={(e) => handleShareToggle(e.target.checked)}
              />
              Share with community
            </label>
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-zinc-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-red-950/40"
            >
              {pending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
              Delete
            </button>
          </div>
        </div>
      </div>

      {expanded && item.passage_text && (
        <div className="mt-3 whitespace-pre-line rounded-xl bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-800 dark:bg-slate-950/50 dark:text-slate-200">
          {item.passage_text}
        </div>
      )}

      {err && (
        <p className="mt-2 text-xs font-semibold text-red-600">{err}</p>
      )}
    </li>
  );
}
