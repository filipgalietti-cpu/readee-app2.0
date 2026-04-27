"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  X,
  Plus,
  BookOpenText,
} from "lucide-react";
import {
  buildPersonalizedStoryAction,
  updateChildInterests,
} from "@/lib/ai/path-actions";

type Child = {
  id: string;
  first_name: string;
  grade: string | null;
  reading_level: string | null;
  interests: string[] | null;
};

const SUGGESTED_INTERESTS = [
  "soccer",
  "dinosaurs",
  "space",
  "horses",
  "drawing",
  "baking",
  "skateboards",
  "trucks",
  "ballet",
  "Pokémon",
  "Minecraft",
  "ocean animals",
];

export default function StoryGenerator({ children }: { children: Child[] }) {
  const router = useRouter();
  const [childId, setChildId] = useState<string>(children[0]?.id ?? "");
  const [interests, setInterests] = useState<string[]>(
    Array.isArray(children[0]?.interests) ? children[0].interests : [],
  );
  const [interestInput, setInterestInput] = useState("");
  const [pageCount, setPageCount] = useState(8);
  const [pending, start] = useTransition();
  const [savingInterests, startSaveInterests] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  // When the picked kid changes, sync interests from their record.
  useEffect(() => {
    const kid = children.find((c) => c.id === childId);
    setInterests(Array.isArray(kid?.interests) ? kid!.interests! : []);
  }, [childId, children]);

  const child = children.find((c) => c.id === childId);

  function addInterest(s: string) {
    const v = s.trim().toLowerCase();
    if (!v) return;
    if (interests.includes(v)) return;
    if (interests.length >= 8) return;
    const next = [...interests, v];
    setInterests(next);
    setInterestInput("");
    // Auto-save in background
    startSaveInterests(() =>
      updateChildInterests({ childId, interests: next }).then(() => {}),
    );
  }

  function removeInterest(s: string) {
    const next = interests.filter((x) => x !== s);
    setInterests(next);
    startSaveInterests(() =>
      updateChildInterests({ childId, interests: next }).then(() => {}),
    );
  }

  function build() {
    setErr(null);
    start(async () => {
      const res = await buildPersonalizedStoryAction({ childId, pageCount });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.push(`/stories-for-me/${res.storyId}`);
    });
  }

  return (
    <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-pink-50 p-6 shadow-sm dark:border-violet-900/40 dark:from-violet-950/20 dark:via-slate-900 dark:to-pink-950/20">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
        <Sparkles className="h-4 w-4" />
        Build a new story
      </div>

      {/* Kid picker */}
      {children.length > 1 && (
        <div className="mt-4">
          <span className="block text-xs font-semibold text-zinc-500 dark:text-slate-400">
            For which kid?
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {children.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setChildId(c.id)}
                className={`rounded-full border px-3 py-1 text-sm transition ${
                  childId === c.id
                    ? "border-violet-500 bg-violet-100 font-bold text-violet-800"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-violet-300"
                }`}
              >
                {c.first_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Interests */}
      <div className="mt-5">
        <span className="block text-xs font-semibold text-zinc-500 dark:text-slate-400">
          {child?.first_name ?? "Their"}'s interests{" "}
          <span className="font-normal text-zinc-400">
            (Readee will weave these into the story)
          </span>
        </span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {interests.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800 dark:bg-violet-950/40 dark:text-violet-200"
            >
              {s}
              <button
                type="button"
                onClick={() => removeInterest(s)}
                className="hover:text-violet-950"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {interests.length < 8 && (
            <div className="inline-flex items-center gap-1">
              <input
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addInterest(interestInput);
                  }
                }}
                placeholder="add interest…"
                className="w-32 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              {interestInput && (
                <button
                  type="button"
                  onClick={() => addInterest(interestInput)}
                  className="rounded-full bg-violet-600 p-1 text-white"
                >
                  <Plus className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>
        {interests.length === 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {SUGGESTED_INTERESTS.slice(0, 8).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addInterest(s)}
                className="rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-[11px] text-zinc-600 transition hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
              >
                + {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Length */}
      <div className="mt-5">
        <span className="block text-xs font-semibold text-zinc-500 dark:text-slate-400">
          Story length{" "}
          <span className="font-normal text-zinc-400">({pageCount} pages)</span>
        </span>
        <input
          type="range"
          min={4}
          max={12}
          value={pageCount}
          onChange={(e) => setPageCount(parseInt(e.target.value, 10))}
          className="mt-2 w-full accent-violet-600"
        />
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-400">
          <span>4 (mini)</span>
          <span>12 (full)</span>
        </div>
      </div>

      {err && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {err}
        </div>
      )}

      <div className="mt-5 flex items-center justify-end">
        <button
          type="button"
          onClick={build}
          disabled={pending || !childId}
          className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Writing the story…
            </>
          ) : (
            <>
              <BookOpenText className="h-4 w-4" />
              Build story for {child?.first_name ?? "kid"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
