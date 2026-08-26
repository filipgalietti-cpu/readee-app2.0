"use client";

import { useMemo, useState } from "react";
import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { buildPlacement } from "@/lib/lesson-engine/placement";

const GRADES = ["Kindergarten", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade"];

// PLACEMENT DEMO — pick the grade from signup, then ride the staircase:
// spoon-fed start for your grade, climbs on every correct, all the way into
// the hardest above-grade items we own.
export default function Page() {
  const [gradeIdx, setGradeIdx] = useState<number | null>(null);
  const engine = useMemo(() => (gradeIdx === null ? null : buildPlacement(gradeIdx)), [gradeIdx]);

  if (!engine) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-indigo-50 to-white p-8">
        <h1 className="text-2xl font-semibold text-indigo-900">What grade is your reader in?</h1>
        <div className="flex flex-wrap justify-center gap-3">
          {GRADES.map((g, i) => (
            <button
              key={g}
              data-grade={i}
              onClick={() => setGradeIdx(i)}
              className="rounded-2xl bg-white px-6 py-4 text-lg font-semibold text-indigo-700 shadow-md transition hover:scale-105 hover:shadow-lg"
            >
              {g}
            </button>
          ))}
        </div>
      </main>
    );
  }
  return <QuizRunner quiz={engine.quiz} picker={engine.picker} resultNote={engine.resultNote} />;
}
