"use client";
import { useState } from "react";
import AdaptivePractice from "@/app/components/lesson-v2/delivery/AdaptivePractice";
import type { PracticeQuestion, PracticeAttempt } from "@/lib/lesson-engine/production/practice";
import JourneyAdventure from "@/app/(protected)/journey/_components/JourneyAdventure";
import { buildAdventureView } from "@/lib/journey/adventure-view";
import { UNIT_ONE } from "@/lib/approved-unit/catalogue";
import type { JourneySnapshot } from "@/lib/journey/types";
export default function Review({ pool }: { pool: PracticeQuestion[] }) {
  const [mode, setMode] = useState("menu");
  const outcomes = [
    "correct",
    "incorrect",
    "assisted",
    "unavailable",
    "skipped",
    "practice",
  ] as const;
  function practice() {
    const attempt: PracticeAttempt = {
      version: 1,
      id: crypto.randomUUID(),
      flowId: "question-results-review",
      asked: pool.map((q) => q.id),
      finished: true,
      evidence: {},
      results: pool.map((q, i) => ({
        itemId: q.id,
        standard: q.standard,
        band: q.band,
        outcome: outcomes[i],
      })),
    };
    localStorage.setItem(
      "readee:preview:practice:question-results-review",
      JSON.stringify(attempt),
    );
    setMode("results");
  }
  if (mode === "results")
    return (
      <AdaptivePractice
        id="question-results-review"
        title="Pip’s Tree · Synthetic review"
        pool={pool}
        standards={[...new Set(pool.map((q) => q.standard))]}
        maxItems={pool.length}
        manifest={{}}
        completion="Your practice is complete."
        learned={["Find the clues in a story."]}
        onExit={() => setMode("menu")}
      />
    );
  if (mode === "gate" || mode === "passed") {
    const snapshot = {
      child: { id: "synthetic", first_name: "Reader", reading_level: "Beginning Reader" },
      approvedUnitEnabled: true,
      completedStandards: UNIT_ONE.map((l) => l.standard),
      unitOneExamStatus: mode === "passed" ? "ready" : "more-evidence",
      result: null,
      practice: [],
      lessonProgress: [],
      billing: { fullAccess: true, signupAt: "2026-09-01" },
    } as unknown as JourneySnapshot;
    return (
      <JourneyAdventure
        model={buildAdventureView(snapshot)}
        childId="synthetic"
        placementId={null}
        introduce={false}
        justCompleted={null}
        openedChests={[]}
        onStart={() => setMode("menu")}
        onPlan={() => setMode("menu")}
        onReward={async () => {}}
        billingNotice={
          <p style={{ margin: 0, textAlign: "center" }}>
            Synthetic review · No child data saved.{" "}
            <button onClick={() => setMode("menu")}>Back to review menu</button>
          </p>
        }
      />
    );
  }
  return (
    <div style={{ padding: 40, maxWidth: 760, margin: "auto" }}>
      <h1>Question results and unit gateway</h1>
      <p>Synthetic examples only. No family accounts, speech calls, rewards or progress writes.</p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 24 }}>
        <button className="le-primary" onClick={practice}>
          Review practice results
        </button>
        <button className="le-primary" onClick={() => setMode("gate")}>
          Before exam pass
        </button>
        <button className="le-primary" onClick={() => setMode("passed")}>
          After exam pass
        </button>
      </div>
    </div>
  );
}
