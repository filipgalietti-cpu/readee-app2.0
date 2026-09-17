"use client";
import dynamic from "next/dynamic";
import { SaveQueue } from "@/lib/approved-unit/save-queue";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UnitRuntimeContext, type UnitRuntime } from "@/lib/approved-unit/runtime";
import { approvedLesson, type ApprovedLessonId } from "@/lib/approved-unit/catalogue";
import type { AttemptSnapshot } from "@/lib/lesson-engine/delivery/types";
import type { PracticeAttempt } from "@/lib/lesson-engine/production/practice";
const loading = () => <p role="status">Opening your lesson…</p>;
const players = {
  "rhyme-time": dynamic(() => import("@/app/components/approved-unit/lessons/RoryStudio"), {
    loading,
  }),
  "key-details": dynamic(() => import("@/app/components/approved-unit/lessons/PipStudio"), {
    loading,
  }),
  "syllable-beats": dynamic(() => import("@/app/components/approved-unit/lessons/BeatStudio"), {
    loading,
  }),
  "book-makers": dynamic(() => import("@/app/components/approved-unit/lessons/BookMakersStudio"), {
    loading,
  }),
  "letter-pairs": dynamic(() => import("@/app/components/approved-unit/lessons/LanternStudio"), {
    loading,
  }),
  "book-basics": dynamic(() => import("@/app/components/approved-unit/lessons/WormStudio"), {
    loading,
  }),
  "story-kinds": dynamic(() => import("@/app/components/approved-unit/lessons/ShelfStudio"), {
    loading,
  }),
  "big-kid-words": dynamic(() => import("@/app/components/approved-unit/lessons/AcornStudio"), {
    loading,
  }),
  "k-unit-1-checkpoint": dynamic(
    () => import("@/app/components/approved-unit/lessons/StoryGardenStudio"),
    { loading },
  ),
};
type State = { lesson?: AttemptSnapshot; practice?: PracticeAttempt };
/** In-memory optimistic playback, serialized server saves. No child state in localStorage. */
export default function ApprovedUnitPlayer({
  child,
  lesson,
}: {
  child: string;
  lesson: ApprovedLessonId;
}) {
  const router = useRouter(),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  const state = useRef<State>({}),
    queue = useRef<SaveQueue | null>(null),
    alive = useRef(true),
    conflict = useRef(false),
    examRetry = useRef(false);
  const url = `/api/approved-unit/${lesson}`;
  async function flush() {
    if (!queue.current || conflict.current) return;
    setSaving(true);
    try {
      await queue.current.flush();
      if (alive.current) setError("");
    } catch (e) {
      if (alive.current) setError(e instanceof Error ? e.message : "Progress has not saved.");
    } finally {
      if (alive.current) setSaving(false);
    }
  }
  useEffect(() => {
    alive.current = true;
    const ac = new AbortController();
    fetch(`${url}?child=${child}`, { cache: "no-store", signal: ac.signal })
      .then(async (r) => {
        if (!r.ok)
          throw Error("Your lesson could not open. Please return to Unit 1 and try again.");
        return r.json();
      })
      .then((r) => {
        state.current = r.state;
        examRetry.current = lesson === "k-unit-1-checkpoint" && !!r.result?.previousAttemptId;
        queue.current = new SaveQueue(r.revision, async (snapshot, revision) => {
          const r = await fetch(url, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ child, revision, state: JSON.parse(snapshot) }),
            signal: AbortSignal.timeout(15000),
          });
          if (!r.ok) {
            conflict.current = r.status === 409;
            throw Error(
              conflict.current
                ? "This lesson is open in another tab. Reload to continue."
                : "Your progress has not saved yet. Please try again.",
            );
          }
          return (await r.json()).revision;
        });
        setReady(true);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    const before = (e: BeforeUnloadEvent) => {
      if (queue.current?.dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", before);
    return () => {
      alive.current = false;
      ac.abort();
      window.removeEventListener("beforeunload", before);
    };
  }, [url, child, lesson]);
  const runtime = useMemo<UnitRuntime>(() => {
    let token: { token: string; region: string; expires: number } | undefined;
    async function service(payload: Record<string, unknown>, signal?: AbortSignal) {
      const r = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ child, ...payload }),
        signal: signal
          ? AbortSignal.any([signal, AbortSignal.timeout(14000)])
          : AbortSignal.timeout(14000),
      });
      if (!r.ok) throw Error("Luna unavailable");
      return r.json();
    }
    function save() {
      queue.current?.enqueue(state.current);
      void flush();
    }
    return {
      get isExamRetry() {
        return examRetry.current;
      },
      store: {
        load: (id) => (state.current.lesson?.flowId === id ? state.current.lesson : null),
        save: (s) => {
          state.current = { ...state.current, lesson: s };
          save();
        },
      },
      loadPractice: (id) => (state.current.practice?.flowId === id ? state.current.practice : null),
      savePractice: (a) => {
        state.current = { ...state.current, practice: a };
        save();
      },
      speechToken: async () => {
        if (token && token.expires > Date.now()) return token;
        const t = await service({ kind: "speech" });
        token = { ...t, expires: Date.now() + 8 * 60000 };
        return t;
      },
      evaluateResponse: async (rubricId, transcript, confidence, signal) =>
        service({ kind: "response", rubricId, transcript, confidence }, signal),
    };
    // Each keyed player owns one child/lesson for its entire lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child, lesson]);
  const Player = players[lesson];
  async function exit() {
    await flush();
    if (!queue.current?.dirty) {
      const completed = state.current.practice?.finished
        ? (approvedLesson(lesson)?.standard ?? lesson)
        : null;
      router.push(
        `/journey?child=${encodeURIComponent(child)}${completed ? `&completed=${encodeURIComponent(completed)}` : ""}`,
      );
    }
  }
  if (!ready)
    return (
      <main className="p-8 text-center">
        <p role={error ? "alert" : "status"}>{error || "Loading your saved progress…"}</p>
        <a href={`/learn/unit-one?child=${child}`}>Back to Unit 1</a>
      </main>
    );
  return (
    <UnitRuntimeContext.Provider value={runtime}>
      <Player onExit={() => void exit()} />
      {error && (
        <div
          role="alert"
          className="fixed inset-x-4 top-4 z-[100] rounded-2xl bg-amber-50 p-4 text-center text-amber-950 shadow-lg"
        >
          {error}{" "}
          <button
            onClick={() => (conflict.current ? window.location.reload() : void flush())}
            className="font-bold underline"
          >
            {conflict.current ? "Reload" : "Retry save"}
          </button>
        </div>
      )}
      {saving && (
        <span role="status" className="fixed right-4 bottom-1 z-50 text-xs">
          Saving progress…
        </span>
      )}
    </UnitRuntimeContext.Provider>
  );
}
