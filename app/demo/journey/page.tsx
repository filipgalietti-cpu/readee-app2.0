"use client";
import { useState } from "react";
import JourneyClient from "@/app/(protected)/journey/_components/JourneyClient";
import JourneySkeleton from "@/app/(protected)/journey/_components/JourneySkeleton";
import { fixtureSpectrumMaya, fixtureUnconfirmedReader } from "@/lib/placement/spectrum-fixtures";
import type { JourneySnapshot } from "@/lib/journey/types";
import { assignedJourneyCatalog } from "@/lib/journey/next-lesson";
const result = fixtureSpectrumMaya();
const unconfirmed = fixtureUnconfirmedReader();
export default function JourneyDemo() {
  const [scenario, setScenario] = useState("new");
  const selected = scenario === "unconfirmed" ? unconfirmed : result;
  const first = assignedJourneyCatalog(null, selected.plan)[0];
  const snapshot = {
    child: {
      id: selected.childId,
      parent_id: "demo-parent",
      owner_type: "parent",
      owner_classroom_id: null,
      created_by_teacher: null,
      stories_read: 0,
      last_lesson_at: null,
      created_at: "2026-09-13T00:00:00Z",
      first_name: selected.childName,
      grade: "4th Grade",
      reading_level: selected.decision.readingLevelName,
      carrots: 0,
      streak_days: 0,
      opened_chests: [],
      equipped_items: {},
    },
    result: selected,
    practice:
      scenario === "completed" ? [{ standard_id: first.standardId, questions_correct: 3 }] : [],
    lessonProgress: [],
    billing: {
      fullAccess: scenario === "paid",
      eligibleForTrial: scenario !== "lapsed",
      signupAt: scenario === "legacy" ? "2026-09-01T00:00:00Z" : "2026-09-13T00:00:00Z",
    },
  } as JourneySnapshot;
  return (
    <>
      <div className="relative z-40 flex items-center gap-3 border-b bg-white p-3 text-sm">
        <label htmlFor="scenario">Journey preview</label>
        <select
          id="scenario"
          value={scenario}
          onChange={(event) => setScenario(event.target.value)}
          className="rounded border p-2"
        >
          {[
            "new",
            "paid",
            "legacy",
            "lapsed",
            "completed",
            "unconfirmed",
            "checkout",
            "canceled",
            "loading",
          ].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
      {scenario === "loading" ? (
        <JourneySkeleton />
      ) : (
        <JourneyClient
          key={scenario}
          snapshot={snapshot}
          completed={scenario === "completed" ? first.standardId : undefined}
          checkout={
            scenario === "checkout" ? "success" : scenario === "canceled" ? "canceled" : undefined
          }
        />
      )}
    </>
  );
}
