"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import PlacementRunner from "@/app/(protected)/placement/_components/PlacementRunner";
import { decidePlacement } from "@/lib/placement/decide";
import type { PlacementSubmission } from "@/lib/placement/types";
import type { PlacedBand } from "@/lib/placement/ladder";


/**
 * PLACEMENT RUNNER DEMO — no account, nothing saved. Pick the enrolled grade;
 * add ?robot=1 to replace the microphone with verdict buttons (what the QA
 * robots drive). Ends on the submission + decision instead of the reveal.
 */
export default function Page() {
  // In the app the grade comes from signup (the child never re-enters it). This
  // dev demo stands in for that with ?grade=0..4 (default 4) and ?robot=1.
  const [band, setBand] = useState<PlacedBand | null>(null);
  const [done, setDone] = useState<PlacementSubmission | null>(null);
  const [robot, setRobot] = useState(false);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setRobot(q.get("robot") === "1");
    const g = Number(q.get("grade") ?? "4");
    setBand((Number.isInteger(g) && g >= 0 && g <= 4 ? g : 4) as PlacedBand);
  }, []);
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_PLACEMENT_DEMO !== "1") notFound();

  if (done) {
    const decision = decidePlacement({ enrolled: done.enrolled, ladder: done.ladder, passages: done.passages, comprehension: done.comprehension, foundations: done.foundations });
    return (
      <main className="mx-auto max-w-3xl p-8" data-demo-done>
        <h1 className="text-2xl font-semibold text-violet-900">Placement demo: done</h1>
        <p className="mt-1 text-sm text-violet-500">Dev demo. Try another grade: {[0, 1, 2, 3, 4].map((g) => <a key={g} className="mr-2 underline" href={`?grade=${g}${robot ? "&robot=1" : ""}`}>{g === 0 ? "K" : g}</a>)}</p>
        <p className="mt-2 text-violet-700" data-placed-band={decision.placedBand}>
          Placed: <b>{decision.readingLevelName}</b> ({decision.relative.label}) · {done.durationSeconds}s
        </p>
        <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-xs text-violet-950 shadow-[0_4px_14px_-4px_rgba(49,46,129,0.20)]">{JSON.stringify({ decision, submission: done }, null, 2)}</pre>
      </main>
    );
  }
  if (band === null) return null;
  return (
    <PlacementRunner
      childId="00000000-0000-0000-0000-000000000000"
      childName="Maya"
      enrolled={band}
      outfitId={null}
      robot={robot}
      demo
      onDemoComplete={setDone}
    />
  );
}
