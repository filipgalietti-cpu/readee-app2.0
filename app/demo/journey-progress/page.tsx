import JourneyProgressReview from "./review";
import { packages } from "@/lib/approved-unit/packages";
import { parentQuestionReport } from "@/lib/approved-unit/parent-report";
export default function Page() {
  const pool = packages["key-details"].pool
    .filter((q) => q.scene.evidence === "assessed")
    .slice(0, 6);
  const results = pool.map((q, i) => ({
    itemId: q.id,
    standard: q.standard,
    band: q.band,
    outcome: i === 3 ? "incorrect" : "correct",
  }));
  const report = parentQuestionReport("key-details", results)!;
  return (
    <main>
      <JourneyProgressReview report={report} />
    </main>
  );
}
