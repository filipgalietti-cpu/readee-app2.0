"use client";
import { useEffect, useState } from "react";
import { useUnitRuntime } from "@/lib/approved-unit/runtime";
import { practicePerformance } from "@/lib/lesson-engine/production/practice-performance";
import type { PracticeAttempt, PracticeQuestion } from "@/lib/lesson-engine/production/practice";
import "./practice-results.css";
const labels = {
  correct: "Correct on the first try",
  incorrect: "More practice",
  assisted: "Answered with help",
  skipped: "Not answered",
  unavailable: "Luna could not check",
  practice: "Supported practice",
};
const bands = { easier: "Easy", core: "Regular", harder: "Hard", challenging: "Challenging" };
export default function PracticeResults({
  title,
  attempt,
  pool,
  onExit,
  onRead,
}: {
  title: string;
  attempt: PracticeAttempt;
  pool: PracticeQuestion[];
  onExit: () => void;
  onRead: (text: string) => void;
}) {
  const runtime = useUnitRuntime();
  const [results, setResults] = useState<PracticeAttempt["results"] | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!runtime?.getPracticeResults) return;
    let alive = true;
    runtime
      .getPracticeResults(attempt.id)
      .then((value) => {
        if (alive) setResults(value);
      })
      .catch(() => {
        if (alive) setError("Your saved results could not load. Please try again.");
      });
    return () => {
      alive = false;
    };
  }, [runtime, attempt.id, retry]);
  if (runtime?.getPracticeResults && !results)
    return (
      <main className="le-practice-results">
        <header>
          <h1>Your question results</h1>
          <p role={error ? "alert" : "status"}>{error || "Saving and checking your answers…"}</p>
          {error && (
            <button
              onClick={() => {
                setError("");
                setRetry((n) => n + 1);
              }}
            >
              Retry results
            </button>
          )}
          <button onClick={onExit}>Back to my unit</button>
        </header>
      </main>
    );
  const saved = !!runtime?.getPracticeResults && !!results;
  const performance = practicePerformance(pool, {
    ...attempt,
    results: results ?? attempt.results,
  });
  return (
    <main className="le-practice-results" aria-label="Question results">
      <header>
        <p className="le-eyebrow">Your practice · For you and your grown-up</p>
        <h1>Look what you practiced!</h1>
        <p>{title}</p>
        <h2>
          {performance.percent === null
            ? `${performance.correct} correct independently`
            : `${performance.correct} of ${performance.scored} correct · ${performance.percent}%`}
        </h2>
        <p>
          {performance.total} activities · {performance.scored} scored questions ·{" "}
          {performance.supported} supported or personal-response activities.
        </p>
        {performance.pending > 0 && (
          <p>
            {performance.pending} scored{" "}
            {performance.pending === 1 ? "question needs" : "questions need"} another independent
            check. Help, skips and microphone problems are not wrong answers.
          </p>
        )}
        <p>
          We use the first answer to see what to practice next. Getting it right after another try
          still helps you learn. This practice score does not unlock the next unit; the unit exam
          does.
        </p>
        {!saved && (
          <p role="status">Local preview results. These are not a saved child assessment.</p>
        )}
      </header>
      <ol>
        {performance.rows.map((row, i) => (
          <li key={row.id} data-outcome={row.outcome}>
            <details>
              <summary>
                <span>
                  <b>
                    {i + 1}. {row.prompt}
                  </b>
                  <small>
                    {row.band ? bands[row.band] : ""}
                    {!row.assessed ? " · Not graded" : ""}
                  </small>
                </span>
                <strong>{labels[row.outcome]}</strong>
              </summary>
              {row.explanation && (
                <>
                  <p>{row.explanation}</p>
                  <button type="button" onClick={() => onRead(row.explanation!)}>
                    Hear the explanation
                  </button>
                </>
              )}
            </details>
          </li>
        ))}
      </ol>
      <nav>
        <button type="button" className="le-primary" onClick={onExit}>
          Back to my unit
        </button>
      </nav>
    </main>
  );
}
