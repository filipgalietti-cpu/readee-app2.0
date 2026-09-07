"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { LessonDef } from "@/lib/lesson-engine/types";
import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { setVerdict, setNote } from "../actions";
import { markAssetsFresh } from "@/lib/lesson-engine/asset-url";

/**
 * The founder's edition of /learn.
 *
 * This mounts the REAL LessonRunner with the real assets, so the lesson plays
 * exactly as a child gets it - same audio, same pacing, same animations. That is
 * the whole point: the browsable data view can tell you a clip is 10 seconds
 * long, but only playing the thing tells you it drags.
 *
 * The review panel floats over it and follows the runner via onScene, so a thumb
 * always attaches to whatever is actually on screen. Nothing here changes how
 * the lesson behaves - no skip buttons, no scrubbing - because a review of a
 * lesson you fast-forwarded is not a review.
 */

type Existing = Record<string, { verdicts: Record<string, string>; note: string | null }>;

const CATS = [
  { key: "voice", label: "Voice" },
  { key: "words", label: "Words" },
  { key: "art", label: "Art" },
  { key: "activity", label: "Activity" },
  { key: "pace", label: "Pace" },
] as const;

export default function ReviewHud({
  lesson,
  slug,
  existing,
  prev,
  next,
}: {
  lesson: LessonDef;
  slug: string;
  existing: Existing;
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}) {
  const [state, setState] = useState<Existing>(existing);
  const [scene, setScene] = useState<{ id: string; i: number; n: number }>({
    id: lesson.scenes[0]?.id ?? "",
    i: 0,
    n: lesson.scenes.length,
  });
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState<"idle" | "saving" | "error">("idle");
  const [open, setOpen] = useState(true);

  // Never review a cached asset. Storage caches lesson audio for an hour, so a
  // re-recorded clip keeps playing its old take to the one person whose job is
  // to notice it changed.
  markAssetsFresh();

  const onScene = useCallback((id: string, i: number, n: number) => {
    setScene({ id, i, n });
  }, []);
  const onComplete = useCallback(() => setDone(true), []);

  // The key the panel is currently writing to: a scene while playing, the
  // lesson itself ("") once the child would have finished.
  const target = done ? "" : scene.id;
  const row = state[target] ?? { verdicts: {}, note: null };

  async function thumb(cat: string, val: "up" | "down") {
    const cur = row.verdicts[cat];
    const nextVal = cur === val ? "" : val;
    // Optimistic: a review tool that lags behind the click is a review tool that
    // gets clicked twice.
    setState((s) => {
      const v = { ...(s[target]?.verdicts ?? {}) };
      if (nextVal) v[cat] = nextVal;
      else delete v[cat];
      return { ...s, [target]: { verdicts: v, note: s[target]?.note ?? null } };
    });
    setSaving("saving");
    const r = await setVerdict(slug, target, cat, nextVal);
    setSaving(r.ok ? "idle" : "error");
  }

  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function note(value: string) {
    setState((s) => ({
      ...s,
      [target]: { verdicts: s[target]?.verdicts ?? {}, note: value },
    }));
    setSaving("saving");
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(async () => {
      const r = await setNote(slug, target, value);
      setSaving(r.ok ? "idle" : "error");
    }, 500);
  }

  // Cmd/Ctrl-hold is deliberately NOT a shortcut: the runner owns the keyboard
  // for the child's interactions, and stealing keys here would change how the
  // lesson plays.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "\\" && !/^(INPUT|TEXTAREA)$/.test((e.target as HTMLElement)?.tagName)) {
        setOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const judgedScenes = Object.entries(state).filter(
    ([k, v]) => k !== "" && Object.keys(v.verdicts).length > 0,
  ).length;
  const overall = state[""]?.verdicts?.overall;

  return (
    <div className="relative min-h-[100dvh]">
      <LessonRunner lesson={lesson} onScene={onScene} onComplete={onComplete} />

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-50 rounded-full bg-zinc-900 px-4 py-2 text-sm font-bold text-white shadow-lg"
        >
          Review ({judgedScenes})
        </button>
      )}

      {open && (
        <aside className="fixed bottom-0 right-0 z-50 w-full max-w-[380px] rounded-tl-2xl border-l border-t border-zinc-300 bg-white/97 p-4 shadow-[0_-8px_30px_-12px_rgba(0,0,0,.3)] backdrop-blur">
          <div className="mb-2 flex items-baseline gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-600">
              {done ? "Overall verdict" : `Scene ${scene.i + 1} of ${scene.n}`}
            </span>
            <code className="truncate font-mono text-[10px] text-zinc-400">{target || lesson.id}</code>
            <span className="ml-auto text-[10px] font-mono text-zinc-400">
              {saving === "saving" ? "saving…" : saving === "error" ? "SAVE FAILED" : `${judgedScenes} judged`}
            </span>
            <button onClick={() => setOpen(false)} className="text-xs text-zinc-400 hover:text-zinc-700" title="Hide (\\)">
              ✕
            </button>
          </div>

          {done ? (
            <div className="mb-3 flex gap-2">
              {(["up", "down"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => thumb("overall", v)}
                  className={`flex-1 rounded-lg border-2 px-3 py-2.5 text-sm font-bold transition ${
                    overall === v
                      ? v === "up"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                        : "border-red-600 bg-red-50 text-red-700"
                      : "border-zinc-200 text-zinc-500 hover:border-violet-400"
                  }`}
                >
                  {v === "up" ? "👍 Ship it" : "👎 Needs work"}
                </button>
              ))}
            </div>
          ) : (
            <div className="mb-3 grid gap-1.5">
              {CATS.map((c) => (
                <div key={c.key} className="flex items-center gap-2">
                  <span className="w-16 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    {c.label}
                  </span>
                  {(["up", "down"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => thumb(c.key, v)}
                      className={`h-7 w-9 rounded border text-sm transition ${
                        row.verdicts[c.key] === v
                          ? v === "up"
                            ? "border-emerald-600 bg-emerald-50"
                            : "border-red-600 bg-red-50"
                          : "border-zinc-200 hover:border-violet-400"
                      }`}
                      title={v === "up" ? "good" : "off"}
                    >
                      {v === "up" ? "👍" : "👎"}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}

          <textarea
            value={row.note ?? ""}
            onChange={(e) => note(e.target.value)}
            placeholder={done ? "Overall notes on this lesson…" : "What felt off in this scene?"}
            className="h-16 w-full resize-y rounded-lg border border-zinc-200 p-2 text-sm text-zinc-800 outline-none focus:border-violet-500"
          />

          <div className="mt-2 flex items-center gap-2 text-xs">
            <Link href="/owner/review" className="font-semibold text-violet-600 hover:underline">
              All lessons
            </Link>
            {prev && (
              <Link href={`/owner/review/${prev.slug}`} className="ml-auto text-zinc-500 hover:text-zinc-800">
                ← prev
              </Link>
            )}
            {next && (
              <Link
                href={`/owner/review/${next.slug}`}
                className={`${prev ? "" : "ml-auto"} font-semibold text-zinc-700 hover:text-violet-600`}
              >
                next →
              </Link>
            )}
          </div>
          {saving === "error" && (
            <p className="mt-2 text-xs font-semibold text-red-600">
              That did not save. Check you are signed in as a platform admin.
            </p>
          )}
        </aside>
      )}
    </div>
  );
}
