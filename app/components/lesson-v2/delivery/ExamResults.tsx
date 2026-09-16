"use client";
import { useState } from "react";
import { useUnitRuntime } from "@/lib/approved-unit/runtime";
import type { CheckpointProbe } from "@/lib/lesson-engine/production/checkpoint-types";
import type { PracticeAttempt } from "@/lib/lesson-engine/production/practice";
import type { CheckpointPlan } from "@/lib/lesson-engine/production/checkpoint";
import { examReadiness } from "@/lib/lesson-engine/production/exam-readiness";
const skillNames: Record<string, string> = {
  "RF.K.2a": "Rhyming",
  "RL.K.1": "Story details",
  "RF.K.2b": "Syllables",
  "RL.K.6": "Authors and illustrators",
  "RF.K.1d": "Letter partners",
  "RF.K.1": "How print works",
  "K.L.6": "Position words",
  "RL.K.5": "Types of books",
};
const outcomes: Record<string, string> = {
  correct: "Correct independently",
  incorrect: "Practice recommended",
  assisted: "Answered with help",
  skipped: "Not answered",
  unavailable: "Could not check",
  practice: "Supported practice",
};
export default function ExamResults({
  plan,
  attempt,
  scoredClosing = [],
  onBack,
  onExit,
  onRead,
}: {
  plan: CheckpointPlan;
  scoredClosing?: readonly CheckpointProbe[];
  attempt: PracticeAttempt;
  onBack: () => void;
  onExit: () => void;
  onRead: (text: string) => void;
}) {
  const runtime = useUnitRuntime();
  const production = !!runtime;
  const [retrying, setRetrying] = useState(false),
    [retryError, setRetryError] = useState("");
  async function retryExam() {
    if (!runtime?.retryExam || retrying) return;
    setRetrying(true);
    setRetryError("");
    try {
      await runtime.retryExam();
    } catch {
      setRetryError("The exam could not restart. Please try again.");
      setRetrying(false);
    }
  }
  const result = examReadiness(plan, attempt, scoredClosing);
  return (
    <main className="le-frame le-exam-results">
      <header>
        <p className="le-eyebrow">For your grown-up · Unit 1 check-in</p>
        <h1>
          {result.status === "ready"
            ? "Ready to continue"
            : result.status === "practice"
              ? "A little more practice"
              : "A little more information needed"}
        </h1>
        <p>
          {result.percent === null
            ? `${result.correct} correct across ${result.independent} independently checked questions.`
            : `${result.correct} of ${result.total} questions correct (${result.percent}%).`}
        </p>
        <p>
          Our starting readiness rule is at least {result.requiredCorrect} of {result.total} correct
          at regular difficulty or above, with every assigned area independently checked. This short
          check does not establish mastery.
        </p>
        <p>
          Each question counts once, including a whole matching or sorting set. Answers given with
          help and technical failures need an independent follow-up. Easier questions need a
          regular-level follow-up.
        </p>
      </header>
      <div className="le-exam-result-list">
        {result.rows.map((row) => {
          const probe = [...plan.pool, ...scoredClosing].find((p) => p.id === row.probeId);
          return (
            <details key={row.probeId ?? row.standard}>
              <summary>
                <b>
                  {skillNames[row.standard] ?? row.standard}
                  {scoredClosing.some((p) => p.id === row.probeId) ? " · Spoken answer" : ""}
                </b>
                <span>{outcomes[row.outcome]}</span>
              </summary>
              <p>
                {row.standard} · {row.band === "core" ? "Regular" : row.band} · One sampled question
              </p>
              {probe?.tasks.map((t) => (
                <div key={t.id}>
                  <p>
                    <strong>{t.scene.prompt}</strong>
                  </p>
                  <p>{t.scene.feedback?.correct}</p>
                  {t.scene.feedback?.correct && (
                    <button onClick={() => onRead(t.scene.feedback!.correct!)}>
                      Hear the explanation
                    </button>
                  )}
                </div>
              ))}
            </details>
          );
        })}
      </div>
      {result.omitted.length > 0 && (
        <p>
          Not covered in this sitting:{" "}
          {result.omitted.map((x) => skillNames[x.standard] ?? x.standard).join(", ")}.
        </p>
      )}
      <p>
        Next step:{" "}
        {result.status === "ready"
          ? "Continue the journey and revisit any missed skill."
          : result.status === "practice"
            ? production
              ? "Practice the areas listed above with your grown-up."
              : "Practice the areas listed above, then check again with fresh questions."
            : "Finish the missing checks or try regular-level questions before deciding readiness."}{" "}
        {!production && "This local preview does not update a child’s journey."}
      </p>
      {runtime?.retryExam && result.status !== "ready" && (
        <p>
          After practicing, you can try this check-in again. Your earlier result is kept, and
          completion carrots are awarded only once.
        </p>
      )}
      {retryError && <p role="alert">{retryError}</p>}
      <nav>
        {runtime?.retryExam && result.status !== "ready" && (
          <button disabled={retrying} className="le-primary" onClick={() => void retryExam()}>
            {retrying ? "Opening exam…" : "Try the exam again"}
          </button>
        )}
        <button onClick={onBack}>Back to celebration</button>
        <button className="le-primary" onClick={onExit}>
          Back to my unit
        </button>
      </nav>
    </main>
  );
}
