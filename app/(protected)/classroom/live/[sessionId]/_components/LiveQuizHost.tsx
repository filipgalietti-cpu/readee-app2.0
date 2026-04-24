"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Users, Play, ArrowRight, Square, Loader2, Trophy } from "lucide-react";
import Link from "next/link";
import { advanceLiveQuiz, endLiveQuiz } from "../../../live-actions";

type Question = {
  id: string;
  prompt: string;
  choices: string[];
  correct: string;
};

type ParticipantRow = {
  child_id: string;
  first_name: string;
};

type AnswerRow = {
  child_id: string;
  question_idx: number;
  answer: string;
  is_correct: boolean;
};

export default function LiveQuizHost({
  sessionId,
  classroomId,
  sessionCode,
  initialStatus,
  initialIdx,
  questions,
}: {
  sessionId: string;
  classroomId: string;
  sessionCode: string;
  initialStatus: "lobby" | "running" | "ended";
  initialIdx: number;
  questions: Question[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [idx, setIdx] = useState(initialIdx);
  const [pending, start] = useTransition();
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [answers, setAnswers] = useState<AnswerRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Poll participants + answers for the current question. In a future
  // upgrade, swap to Supabase Realtime on these tables.
  // Realtime: initial fetch, then subscribe to postgres_changes on the
  // two tables filtered to this session. Teacher's auth session gives
  // them RLS access. A 30s fallback poll covers WebSocket hiccups.
  useEffect(() => {
    let cancelled = false;
    const sb = supabaseBrowser();

    async function refetch() {
      const [{ data: memberships }, { data: answerRows }] = await Promise.all([
        sb
          .from("live_quiz_participants")
          .select("child_id, children(id, first_name)")
          .eq("session_id", sessionId),
        sb
          .from("live_quiz_answers")
          .select("child_id, question_idx, answer, is_correct")
          .eq("session_id", sessionId),
      ]);
      if (cancelled) return;
      const p = ((memberships ?? []) as any[])
        .map((m) => ({
          child_id: m.child_id as string,
          first_name: (m.children?.first_name as string) ?? "Student",
        }))
        .sort((a, b) => a.first_name.localeCompare(b.first_name));
      setParticipants(p);
      setAnswers(((answerRows ?? []) as any[]) as AnswerRow[]);
    }

    refetch();

    const channel = sb
      .channel(`live_quiz_host:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "live_quiz_participants",
          filter: `session_id=eq.${sessionId}`,
        },
        () => refetch(),
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "live_quiz_answers",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload: any) => {
          if (cancelled) return;
          const row = payload.new as AnswerRow;
          setAnswers((prev) =>
            prev.some(
              (a) => a.child_id === row.child_id && a.question_idx === row.question_idx,
            )
              ? prev
              : [...prev, row],
          );
        },
      )
      .subscribe();

    pollRef.current = setInterval(refetch, 30_000);
    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
      sb.removeChannel(channel);
    };
  }, [sessionId]);

  const currentQ = status === "running" ? questions[idx] : null;
  const answersForCurrent = useMemo(
    () => answers.filter((a) => a.question_idx === idx),
    [answers, idx],
  );
  const answeredChildIds = useMemo(
    () => new Set(answersForCurrent.map((a) => a.child_id)),
    [answersForCurrent],
  );

  // Per-choice counts for the current question
  const choiceCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of answersForCurrent) {
      m.set(a.answer, (m.get(a.answer) ?? 0) + 1);
    }
    return m;
  }, [answersForCurrent]);

  // Leaderboard at end: correct-answer count per participant
  const leaderboard = useMemo(() => {
    if (status !== "ended") return [];
    const scores = new Map<string, number>();
    for (const a of answers) {
      if (!a.is_correct) continue;
      scores.set(a.child_id, (scores.get(a.child_id) ?? 0) + 1);
    }
    const rows = participants.map((p) => ({
      childId: p.child_id,
      name: p.first_name,
      score: scores.get(p.child_id) ?? 0,
    }));
    rows.sort((a, b) => b.score - a.score);
    return rows;
  }, [status, participants, answers]);

  // Broadcast state transitions on a channel the students also listen
  // to. This is pub/sub without RLS — both sides connect with the anon
  // key. Teacher's (protected) page has a Supabase auth session; student
  // pages use anon auth for broadcast-only channels.
  async function broadcastState(newStatus: string, newIdx: number) {
    const sb = supabaseBrowser();
    const ch = sb.channel(`live_quiz:${sessionId}`);
    await ch.subscribe();
    await ch.send({
      type: "broadcast",
      event: "state",
      payload: { status: newStatus, idx: newIdx, ts: Date.now() },
    });
    // Leave the channel so it doesn't stay open. The teacher's
    // postgres_changes subscription above is what keeps the lobby
    // counters fresh.
    sb.removeChannel(ch);
  }

  function advance() {
    setErr(null);
    start(async () => {
      const res = await advanceLiveQuiz({ sessionId });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setStatus(res.status as any);
      setIdx(res.idx);
      void broadcastState(res.status, res.idx);
      router.refresh();
    });
  }

  function end() {
    if (!confirm("End this live quiz now?")) return;
    setErr(null);
    start(async () => {
      const res = await endLiveQuiz({ sessionId });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setStatus("ended");
      void broadcastState("ended", idx);
      router.refresh();
    });
  }

  if (status === "lobby") {
    return (
      <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-8 text-center dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-violet-950/30">
        <div className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
          Waiting room
        </div>
        <h2 className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">
          Students join with this code
        </h2>
        <div className="mx-auto mt-4 inline-block rounded-2xl bg-white px-8 py-6 shadow-lg dark:bg-slate-800">
          <div className="font-mono text-6xl font-black tracking-[0.3em] text-indigo-700 dark:text-indigo-200">
            {sessionCode}
          </div>
        </div>
        <p className="mt-4 text-sm text-zinc-600 dark:text-slate-400">
          On their device: sign in to the student app → tap the live quiz banner,
          or visit <code className="rounded bg-zinc-200 px-1 dark:bg-slate-700">/student/live</code> and enter this code.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-indigo-700 dark:bg-slate-800 dark:text-indigo-300">
          <Users className="h-4 w-4" />
          {participants.length} student{participants.length === 1 ? "" : "s"} joined
        </div>

        {participants.length > 0 && (
          <ul className="mx-auto mt-4 flex max-w-xl flex-wrap justify-center gap-1.5">
            {participants.map((p) => (
              <li
                key={p.child_id}
                className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-700 shadow-sm dark:bg-slate-800 dark:text-slate-300"
              >
                {p.first_name}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={advance}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Start quiz ({questions.length} Q)
          </button>
          <button
            type="button"
            onClick={end}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-600 transition hover:border-red-300 hover:text-red-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
          >
            <Square className="h-3.5 w-3.5" />
            Cancel
          </button>
        </div>
        {err && <p className="mt-3 text-xs font-semibold text-red-600">{err}</p>}
      </div>
    );
  }

  if (status === "running" && currentQ) {
    const isLast = idx >= questions.length - 1;
    const answered = answeredChildIds.size;
    const total = participants.length;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between text-sm">
          <div className="font-semibold text-indigo-600">
            Question {idx + 1} of {questions.length}
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 font-mono text-xs font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
            <Users className="h-3 w-3" />
            {answered}/{total} answered
          </div>
        </div>

        <div className="rounded-3xl border-2 border-indigo-200 bg-white p-8 shadow-lg dark:border-indigo-900/50 dark:bg-slate-900">
          <div className="text-center text-2xl font-extrabold leading-tight text-zinc-900 dark:text-white sm:text-3xl">
            {currentQ.prompt}
          </div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {currentQ.choices.map((c) => {
              const count = choiceCounts.get(c) ?? 0;
              const pct = answered > 0 ? Math.round((count / answered) * 100) : 0;
              const isCorrect = c === currentQ.correct;
              return (
                <li
                  key={c}
                  className={`relative overflow-hidden rounded-2xl border-2 p-4 ${
                    isCorrect
                      ? "border-green-500 bg-green-50 dark:border-green-700 dark:bg-green-950/30"
                      : "border-zinc-200 bg-zinc-50 dark:border-slate-700 dark:bg-slate-800"
                  }`}
                >
                  <div
                    className={`absolute inset-y-0 left-0 ${
                      isCorrect ? "bg-green-200/60 dark:bg-green-900/40" : "bg-indigo-100/50 dark:bg-indigo-950/30"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                  <div className="relative flex items-center justify-between">
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {c}
                    </span>
                    <span className="font-mono text-sm font-bold text-zinc-700 dark:text-slate-300">
                      {count}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-center text-[11px] text-zinc-400">
            Correct answer highlighted in green. Counts update as students answer.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={advance}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {isLast ? "End quiz" : "Next question"}
          </button>
          <button
            type="button"
            onClick={end}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:border-red-300 hover:text-red-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
          >
            <Square className="h-3 w-3" />
            End early
          </button>
        </div>
        {err && <p className="text-center text-xs font-semibold text-red-600">{err}</p>}
      </div>
    );
  }

  // Ended — leaderboard
  return (
    <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-8 dark:border-amber-900/50 dark:from-amber-950/30 dark:to-orange-950/30">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
        <Trophy className="h-4 w-4" />
        Final leaderboard
      </div>
      <h2 className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">
        Great work, class!
      </h2>

      {leaderboard.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500 dark:text-slate-400">
          No answers recorded.
        </p>
      ) : (
        <ol className="mt-5 space-y-2">
          {leaderboard.map((r, i) => (
            <li
              key={r.childId}
              className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full font-mono font-bold ${
                    i === 0
                      ? "bg-amber-400 text-white"
                      : i === 1
                      ? "bg-zinc-300 text-zinc-800"
                      : i === 2
                      ? "bg-orange-300 text-orange-900"
                      : "bg-zinc-100 text-zinc-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {i + 1}
                </div>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {r.name}
                </span>
              </div>
              <div className="font-mono text-sm font-bold text-zinc-900 dark:text-white">
                {r.score} / {questions.length}
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-6 text-center">
        <Link
          href={`/classroom/${classroomId}?tab=assignments`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:underline"
        >
          Back to classroom
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
