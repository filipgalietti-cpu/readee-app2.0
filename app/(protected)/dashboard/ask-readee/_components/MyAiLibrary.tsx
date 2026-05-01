"use client";

import { useEffect, useState, useTransition } from "react";
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
  X,
  ZoomIn,
} from "lucide-react";
import {
  deleteChildAiContent,
  toggleShareContent,
  setCommunityByline,
} from "../actions";

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
  bylineConsent,
  bylineDisplayName,
}: {
  items: LibraryItem[];
  children: { id: string; first_name: string }[];
  bylineConsent: boolean | null;
  bylineDisplayName: string | null;
}) {
  // Multi-child support is deprecated; we still render the
  // first-row-only group label for visual consistency.
  const childName = children[0]?.first_name ?? "your child";
  // Hoist consent into shared state so the first share toggled by ANY
  // card surfaces the dialog only once across the page.
  const [consent, setConsent] = useState<boolean | null>(bylineConsent);
  const [displayName, setDisplayName] = useState<string | null>(bylineDisplayName);
  const [pendingShareId, setPendingShareId] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 text-xs font-bold text-zinc-500 dark:text-slate-400">
          For <span className="text-zinc-900 dark:text-white">{childName}</span>
        </div>
        <ul className="space-y-2">
          {items.map((item) => (
            <LibraryCard
              key={item.id}
              item={item}
              consentRequired={consent === null}
              onShareGated={() => setPendingShareId(item.id)}
            />
          ))}
        </ul>
      </div>

      {pendingShareId && (
        <BylineConsentDialog
          onClose={() => setPendingShareId(null)}
          onDone={(c, name) => {
            setConsent(c);
            setDisplayName(name);
            setPendingShareId(null);
          }}
        />
      )}
    </div>
  );
}

function BylineConsentDialog({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: (consent: boolean, displayName: string | null) => void;
}) {
  const [name, setName] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function decide(consent: boolean) {
    setErr(null);
    start(async () => {
      const cleanName = consent ? name.trim().slice(0, 40) || null : null;
      const res = await setCommunityByline({ consent, displayName: cleanName });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      onDone(consent, cleanName);
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl border border-violet-200 bg-white p-6 shadow-2xl dark:border-violet-900/40 dark:bg-slate-900">
        <div className="text-[10px] font-bold uppercase tracking-widest text-violet-600">
          Quick question — one time only
        </div>
        <h3 className="mt-1 text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Want your name on the passages you share?
        </h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-slate-400">
          Other Readee families will see your contribution. You can stay
          anonymous, or add a first name and last initial — whatever you
          prefer.
        </p>

        <label className="mt-4 block text-xs font-semibold text-zinc-700 dark:text-slate-300">
          Display name (optional)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Erin S."
          maxLength={40}
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />

        {err && <p className="mt-2 text-xs font-semibold text-red-600">{err}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => decide(true)}
            disabled={pending || !name.trim()}
            className="rounded-full bg-violet-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
          >
            {pending ? "Saving…" : "Show my name"}
          </button>
          <button
            type="button"
            onClick={() => decide(false)}
            disabled={pending}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Stay anonymous
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="ml-auto text-[11px] font-semibold text-zinc-400 hover:text-zinc-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function LibraryCard({
  item,
  consentRequired,
  onShareGated,
}: {
  item: LibraryItem;
  consentRequired: boolean;
  onShareGated: () => void;
}) {
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
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    if (!zoomOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setZoomOpen(false);
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [zoomOpen]);

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
    if (next && consentRequired) {
      // Park the toggle — the dialog will fire, then user comes back
      // and toggles again. We don't auto-flip-after-consent because
      // the parent might pick "anonymous" and the share intent is
      // unchanged either way.
      onShareGated();
      return;
    }
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
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            aria-label="Open illustration"
            className="group relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url}
              alt=""
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
              <ZoomIn className="h-5 w-5 text-white opacity-0 transition group-hover:opacity-100" />
            </div>
          </button>
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
            <label
              className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-zinc-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              title="We anonymize names in the passage and only share text + image. Audio stays private."
            >
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

      {shared && (
        <p className="mt-2 text-[11px] text-zinc-500 dark:text-slate-400">
          Names are anonymized and only the text + image go to the community.
          Audio stays private to you (it has your child&apos;s name).
        </p>
      )}

      {err && (
        <p className="mt-2 text-xs font-semibold text-red-600">{err}</p>
      )}

      {zoomOpen && item.image_url && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-8">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setZoomOpen(false)}
          />
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative max-h-full max-w-5xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url}
              alt={item.title ?? item.topic}
              className="max-h-[85vh] w-auto rounded-xl shadow-2xl"
            />
            {(item.title || item.topic) && (
              <div className="mt-3 text-center text-sm text-white/90">
                {item.title ?? item.topic}
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
