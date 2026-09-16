import ExamRetryButton from "./ExamRetryButton";
import Link from "next/link";
import type { PracticePerformance } from "@/lib/lesson-engine/production/practice-performance";
const labels = {
  correct: "Correct independently",
  incorrect: "More practice recommended",
  assisted: "Answered with help",
  practice: "Supported practice · not graded",
  skipped: "Not answered",
  unavailable: "Could not check",
};
export type ParentLessonReport = {
  id: string;
  title: string;
  performance: PracticePerformance;
  carrots: number;
  examStatus?: string;
  retry?: { child: string; attemptId: string };
};
export default function ParentProgressReport({
  name,
  reports,
  backHref,
}: {
  name: string;
  reports: ParentLessonReport[];
  backHref: string;
}) {
  return (
    <main className="min-h-dvh bg-white px-5 py-10 text-[#29213a]">
      <div className="mx-auto max-w-3xl">
        <Link href={backHref} className="font-semibold text-violet-700">
          ← Back to journey
        </Link>
        <p className="mt-8 text-sm font-bold uppercase tracking-widest text-violet-700">
          For parents · Lesson progress
        </p>
        <h1 className="mt-3 text-3xl font-bold">{name}’s progress</h1>
        <p className="my-4 leading-relaxed">
          See the questions your child answered independently and where another check would help.
          First answers count toward the score; practice after a mistake still supports learning.
          Help, skips and microphone problems are shown separately.
        </p>
        {!reports.length && (
          <p className="rounded-2xl bg-violet-50 p-5">
            Completed lesson results will appear here after they save.
          </p>
        )}
        {reports.map((report) => (
          <details
            key={report.id}
            className="my-4 rounded-2xl border-2 border-violet-100 bg-white p-5"
          >
            <summary className="cursor-pointer">
              <h2 className="inline text-xl font-bold">{report.title}</h2>
              <p className="mt-2 text-violet-800">
                {report.performance.correct} of {report.performance.independent} independently
                checked questions correct
                {report.performance.percent !== null ? ` · ${report.performance.percent}%` : ""}
              </p>
              <p className="mt-1 text-sm">
                {report.performance.pending} need another independent check · {report.carrots}{" "}
                carrots earned
              </p>
            </summary>
            {report.examStatus && (
              <p className="mt-4 font-semibold">
                {report.examStatus === "ready"
                  ? "Unit exam passed · next unit open"
                  : report.examStatus === "practice"
                    ? "More practice before the next unit"
                    : "Another independent check is needed"}
              </p>
            )}
            {report.retry && <ExamRetryButton {...report.retry} />}
            <ol className="mt-5 space-y-4">
              {report.performance.rows.map((row, i) => (
                <li key={row.id} className="border-t border-violet-100 pt-4">
                  <p className="font-semibold">
                    {i + 1}. {row.prompt}
                  </p>
                  <p className="mt-1 text-sm">
                    {labels[row.outcome]} ·{" "}
                    {row.band === "core"
                      ? "Regular"
                      : row.band === "harder"
                        ? "Hard"
                        : row.band === "easier"
                          ? "Easy"
                          : "Challenging"}
                  </p>
                  {row.explanation && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{row.explanation}</p>
                  )}
                </li>
              ))}
            </ol>
          </details>
        ))}
        <p className="mt-6 text-sm text-slate-600">
          Personal responses and supported reading are not graded. Unit exam readiness also requires
          regular-level or harder questions across the assigned skills.
        </p>
      </div>
    </main>
  );
}
