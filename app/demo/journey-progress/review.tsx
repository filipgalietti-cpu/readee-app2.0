"use client";
import { useMemo, useRef, useState } from "react";
import JourneyAdventure from "@/app/(protected)/journey/_components/JourneyAdventure";
import { buildAdventureView } from "@/lib/journey/adventure-view";
import { UNIT_ONE } from "@/lib/approved-unit/catalogue";
import { UNIT_EXAM_ID } from "@/lib/approved-unit/gateway";
import { UnitRuntimeContext, type UnitRuntime } from "@/lib/approved-unit/runtime";
import type { JourneySnapshot } from "@/lib/journey/types";
import type { AttemptSnapshot } from "@/lib/lesson-engine/delivery/types";
import type { PracticePerformance } from "@/lib/lesson-engine/production/practice-performance";
import type { PracticeAttempt } from "@/lib/lesson-engine/production/practice";
import ParentProgressReport from "@/app/components/approved-unit/ParentProgressReport";
import StoryGardenStudio from "@/app/components/approved-unit/lessons/StoryGardenStudio";

function ExamPreview({ onBack, onPassed }: { onBack: () => void; onPassed: () => void }) {
  const lesson = useRef<AttemptSnapshot | null>(null);
  const practice = useRef<PracticeAttempt | null>(null);
  const token = useRef<{ token: string; region: string; expires: number } | null>(null);
  const runtime = useMemo<UnitRuntime>(() => {
    async function service(payload: Record<string, unknown>, signal?: AbortSignal) {
      const response = await fetch("/api/approved-unit/sample", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: signal
          ? AbortSignal.any([signal, AbortSignal.timeout(14000)])
          : AbortSignal.timeout(14000),
      });
      if (!response.ok) throw Error("Luna unavailable");
      return response.json();
    }
    return {
      store: {
        load: (id) => (lesson.current?.flowId === id ? lesson.current : null),
        save: (next) => {
          lesson.current = next;
        },
      },
      loadPractice: (id) => (practice.current?.flowId === id ? practice.current : null),
      savePractice: (next) => {
        practice.current = next;
      },
      speechToken: async () => {
        if (token.current && token.current.expires > Date.now()) return token.current;
        const next = (await service({ kind: "speech" })) as {
          token: string;
          region: string;
        };
        const fresh = { ...next, expires: Date.now() + 8 * 60000 };
        token.current = fresh;
        return fresh;
      },
      evaluateResponse: (rubricId, transcript, confidence, signal) =>
        service({ kind: "response", rubricId, transcript, confidence }, signal),
    };
  }, []);
  return (
    <UnitRuntimeContext.Provider value={runtime}>
      <StoryGardenStudio
        onExit={() => {
          if (practice.current?.finished) onPassed();
          else onBack();
        }}
      />
    </UnitRuntimeContext.Provider>
  );
}

export default function JourneyProgressReview({ report }: { report: PracticePerformance }) {
  const [count, setCount] = useState(2),
    [showReport, setShowReport] = useState(false),
    [showExam, setShowExam] = useState(false),
    [examPassed, setExamPassed] = useState(false),
    [recentCompletion, setRecentCompletion] = useState<string | null>(null),
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
    unitOneExamStatus: examPassed ? "ready" : undefined,
    lessonStats: Object.fromEntries(completed.map((id) => [id, stats])),
    result: null,
    practice: [],
    lessonProgress: [],
    billing: { fullAccess: true, signupAt: "2026-09-01" },
  } as unknown as JourneySnapshot;
  if (showExam)
    return (
      <ExamPreview
        onBack={() => setShowExam(false)}
        onPassed={() => {
          setExamPassed(true);
          setRecentCompletion(UNIT_EXAM_ID);
          setShowExam(false);
          setNotice("Story Garden passed. Your Unit 1 keepsake is ready!");
        }}
      />
    );
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
      model={buildAdventureView(snapshot)}
      childId="synthetic"
      placementId={null}
      introduce={false}
      justCompleted={recentCompletion}
      openedChests={[]}
      onStart={(id) => {
        if (completed.includes(id as (typeof completed)[number]))
          setNotice("A real lesson replay opens here. This preview does not save progress.");
        else if (id === UNIT_EXAM_ID && count === UNIT_ONE.length) setShowExam(true);
        else if (count < UNIT_ONE.length) {
          setRecentCompletion(UNIT_ONE[count].standard);
          setCount((n) => n + 1);
        }
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
