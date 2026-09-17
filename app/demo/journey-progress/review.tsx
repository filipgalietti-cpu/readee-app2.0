"use client";
import { useState } from "react";
import JourneyAdventure from "@/app/(protected)/journey/_components/JourneyAdventure";
import { buildAdventureView } from "@/lib/journey/adventure-view";
import { UNIT_ONE } from "@/lib/approved-unit/catalogue";
import type { JourneySnapshot } from "@/lib/journey/types";
import type { PracticePerformance } from "@/lib/lesson-engine/production/practice-performance";
import ParentProgressReport from "@/app/components/approved-unit/ParentProgressReport";
export default function JourneyProgressReview({ report }: { report: PracticePerformance }) {
  const [count, setCount] = useState(2),
    [showReport, setShowReport] = useState(false),
    [notice, setNotice] = useState("");
  const completed = UNIT_ONE.slice(0, count).map((l) => l.standard);
  const stats = {
    total: 6,
    correct: 5,
    checked: 6,
    helped: 0,
    pending: 0,
    supported: 0,
    percent: 83,
    carrots: 24,
  };
  const snapshot = {
    child: { id: "synthetic", first_name: "Reader", reading_level: "Beginning Reader" },
    approvedUnitEnabled: true,
    completedStandards: completed,
    lessonStats: Object.fromEntries(completed.map((id) => [id, stats])),
    result: null,
    practice: [],
    lessonProgress: [],
    billing: { fullAccess: true, signupAt: "2026-09-01" },
  } as unknown as JourneySnapshot;
  if (showReport)
    return (
      <>
        <ParentProgressReport
          name="Reader"
          reports={[{ id: "key-details", title: "Pip’s Tree", performance: report, carrots: 24 }]}
          backHref="/demo/journey-progress"
        />
      </>
    );
  return (
    <JourneyAdventure
      key={count}
      model={buildAdventureView(snapshot)}
      childId="synthetic"
      placementId={null}
      introduce={false}
      justCompleted={count > 2 ? UNIT_ONE[count - 1].standard : null}
      openedChests={[]}
      onStart={(id) => {
        if (completed.includes(id as (typeof completed)[number]))
          setNotice("A real lesson replay opens here. This preview does not save progress.");
        else if (count < UNIT_ONE.length) setCount((n) => n + 1);
      }}
      onPlan={() => setNotice("Synthetic review. No family data or emails.")}
      onReward={async () => {}}
      billingNotice={
        <div style={{ background: "#fff", padding: 10, textAlign: "center", fontSize: 14 }}>
          Hover or tap a checked stop to see stats. Select the next lesson to simulate its saved
          return.
          <button
            style={{ marginLeft: 14, color: "#6d28d9", textDecoration: "underline" }}
            onClick={() => setShowReport(true)}
          >
            Preview parent report
          </button>
          {notice && <p role="status">{notice}</p>}
        </div>
      }
    />
  );
}
