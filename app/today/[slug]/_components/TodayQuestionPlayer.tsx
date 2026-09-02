"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { BunnyReaction } from "@/app/_components/Bunny/Bunny";
import { FluentIcon } from "@/app/_components/FluentIcon";
import { Glyph } from "@/app/_components/Glyph";

type Q = {
  prompt: string;
  choices: string[];
  correct: string;
  hint: string | null;
};

const LETTERS = ["A", "B", "C", "D", "E", "F"];

/**
 * Interactive quiz card for /today/[slug] — the "Daily Readee" template.
 *
 * One question at a time (the surfaced question first, then any bonus
 * questions), with immediate green/red feedback on each pick, then a
 * celebration finish screen (bunny reaction + stars + score + review +
 * carrots). Engagement votes fire the same RPC the parent dashboard
 * widget uses so the signal is combined across surfaces.
 */
export default function TodayQuestionPlayer({
  date,
  questions,
}: {
  /** Daily-Readee date. When omitted (e.g. reused on Discover articles),
   *  the daily engagement vote is disabled and its row is hidden. */
  date?: string;
  questions: Q[];
}) {
  const qs = useMemo(() => questions.filter((q) => q && q.choices?.length >= 2), [questions]);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [results, setResults] = useState<{ prompt: string; ok: boolean }[]>([]);
  const [done, setDone] = useState(false);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);

  // On finish, record the read for the signed-in family so the /daily archive
  // can mark this day complete (green). Logged-out visitors are a server no-op.
  useEffect(() => {
    if (done && date) {
      fetch("/api/daily/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ date }),
      }).catch(() => {});
    }
  }, [done, date]);

  const q = qs[Math.min(qi, qs.length - 1)];
  const total = qs.length;
  const revealed = picked != null;
  const isLast = qi === total - 1;

  // Pick locks the answer + reveals feedback immediately (Readee's
  // green/red pedagogy). Records the result for the finish review.
  function pick(choice: string) {
    if (revealed) return;
    setPicked(choice);
    const ok = choice === q.correct;
    if (ok) setCorrectCount((c) => c + 1);
    setResults((r) => [...r, { prompt: q.prompt.replace(/\*\*/g, ""), ok }]);
  }

  function next() {
    if (!revealed) return;
    if (isLast) { setDone(true); return; }
    setQi((i) => i + 1);
    setPicked(null);
  }

  function restart() {
    setQi(0); setPicked(null); setCorrectCount(0); setResults([]); setDone(false);
  }

  function vote(dir: "up" | "down") {
    if (voted || !date) return;
    setVoted(dir);
    supabaseBrowser().rpc("bump_daily_question_engagement", { p_date: date, p_field: dir });
  }

  const CARD =
    "flex min-h-[420px] flex-col rounded-3xl border border-zinc-200 bg-white p-[22px] shadow-[0_10px_40px_-12px_rgba(49,46,129,0.18)]";

  if (done) {
    const pct = total ? Math.round((correctCount / total) * 100) : 0;
    const title = correctCount === total ? "Perfect read!" : correctCount >= Math.ceil(total / 2) ? "Nice reading today!" : "Good try - read it again!";
    const bunnyState = correctCount >= Math.ceil((total * 2) / 3) ? "correct" : "incorrect";
    return (
      <div className={CARD}>
        <div className="flex flex-col items-center px-1 text-center">
          <div className="h-[152px] w-[140px]">
            <BunnyReaction outfitId="classic" state={bunnyState} />
          </div>
          <div className="mt-1.5 flex gap-1">
            {[1, 2, 3].map((n) => {
              const filled = correctCount / total >= n / 3;
              return <FluentIcon name="star" size={26} />;
            })}
          </div>
          <div className="mt-2 font-display text-[22px] font-extrabold text-zinc-900">{title}</div>
          <div className="mt-0.5 text-sm text-zinc-500">
            You got {correctCount} of {total} right. <span className="font-extrabold text-violet-700">{pct}%</span>
          </div>
          <div className="mt-3.5 flex w-full flex-col gap-1.5 text-left">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-2 rounded-[10px] px-2.5 py-2" style={{ background: r.ok ? "#ecfdf5" : "#fef2f2" }}>
                {r.ok ? <Glyph name="check" size={14} className="shrink-0 text-emerald-600" /> : <Glyph name="x" size={14} className="shrink-0 text-red-600" />}
                <span className="shrink-0 text-[11px] font-extrabold text-zinc-500">Q{i + 1}</span>
                <span className="truncate text-xs font-semibold text-zinc-700">{r.prompt}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-5 py-2 text-[15px] font-extrabold text-emerald-700">
            <FluentIcon name="carrot" size={16} /> +{correctCount * 5} carrots
          </div>
          <button
            type="button"
            onClick={restart}
            className="mt-4 rounded-full border border-zinc-200 bg-white px-[18px] py-2 text-[13px] font-bold text-zinc-700 transition hover:border-violet-300"
          >
            Try again
          </button>
          {date && (
            <div className="mt-[18px] flex items-center gap-2 text-xs text-zinc-500">
              Was today&apos;s Readee good?
              <button type="button" onClick={() => vote("up")} disabled={voted != null} className={`grid h-8 w-8 place-items-center rounded-full transition ${voted === "up" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-400 hover:text-emerald-600"}`}>
                <Glyph name="thumbs-up" size={15} />
              </button>
              <button type="button" onClick={() => vote("down")} disabled={voted != null} className={`grid h-8 w-8 place-items-center rounded-full transition ${voted === "down" ? "bg-red-100 text-red-700" : "bg-zinc-100 text-zinc-400 hover:text-red-600"}`}>
                <Glyph name="thumbs-down" size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const qLabel = qi === 0 ? `Question 1 of ${total}` : `Bonus ${qi} · ${qi + 1} of ${total}`;

  return (
    <div className={CARD}>
      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">{qLabel}</span>
      </div>
      <div className="mt-1.5 text-[17px] font-bold leading-snug text-zinc-900">{q.prompt.replace(/\*\*/g, "")}</div>

      <div className="mt-3.5 flex flex-col gap-2.5">
        {q.choices.map((choice, i) => {
          const text = String(choice).replace(/\*\*/g, "");
          const isSel = picked === choice;
          const isCorrectChoice = choice === q.correct;
          let cls = "border-zinc-200 bg-white text-zinc-800";
          let badge = "border-zinc-300 bg-white text-zinc-500";
          let opacity = "opacity-100";
          if (!revealed && isSel) { cls = "border-violet-400 bg-violet-50 text-zinc-900"; badge = "border-violet-500 bg-violet-500 text-white"; }
          if (revealed) {
            if (isSel && isCorrectChoice) { cls = "border-emerald-400 bg-emerald-50 text-emerald-900"; badge = "border-emerald-500 bg-emerald-500 text-white"; }
            else if (isSel) { cls = "border-red-400 bg-red-50 text-red-900"; badge = "border-red-500 bg-red-500 text-white"; }
            else if (isCorrectChoice) { cls = "border-emerald-200 bg-emerald-50/50 text-emerald-800"; badge = "border-emerald-300 bg-white text-emerald-600"; }
            else { opacity = "opacity-45"; }
          }
          return (
            <button
              key={choice}
              type="button"
              disabled={revealed}
              onClick={() => pick(choice)}
              className={`flex min-h-[48px] w-full items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left text-[15px] font-semibold transition ${cls} ${opacity} ${!revealed ? "hover:border-violet-300" : ""}`}
            >
              <span className={`grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full border-2 text-xs font-extrabold ${badge}`}>{LETTERS[i]}</span>
              <span className="flex-1">{text}</span>
              {revealed && isCorrectChoice && <Glyph name="check" size={17} className="text-emerald-600" />}
              {revealed && isSel && !isCorrectChoice && <Glyph name="x" size={17} className="text-red-600" />}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div
          className="mt-3.5 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-extrabold"
          style={picked === q.correct ? { background: "#d1fae5", color: "#047857" } : { background: "#fef2f2", color: "#b91c1c" }}
        >
          {picked === q.correct ? "Nice - that's right!" : "Not quite - the right answer is highlighted."}
        </div>
      )}
      {revealed && picked !== q.correct && q.hint && (
        <div className="mt-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[13px] font-semibold text-amber-800">
          Hint: {q.hint}
        </div>
      )}

      {/* Growing spacer keeps the CTA pinned to the bottom on short
          questions; the button's own margin guarantees a gap from the last
          choice even when the card is full. */}
      <div className="flex-1" />
      <button
        type="button"
        onClick={next}
        disabled={!revealed}
        className={`mt-6 w-full rounded-full py-3.5 text-base font-extrabold transition ${revealed ? "bg-violet-600 text-white hover:bg-violet-700" : "cursor-default bg-zinc-200 text-zinc-400"}`}
      >
        {isLast ? "Finish" : "Next question"}
      </button>
    </div>
  );
}
