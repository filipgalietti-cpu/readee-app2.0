import { BarChart3 } from "lucide-react";

export default function InsightsTab({
  classroomId: _classroomId,
}: {
  classroomId: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-zinc-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900/40">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
        <BarChart3 className="h-7 w-7" />
      </span>
      <h2 className="mt-5 text-lg font-bold text-zinc-900 dark:text-white">
        Insights coming in Week 2
      </h2>
      <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-slate-400">
        Standards heatmap, most-missed questions, and a weekly leaderboard.
        Land in the next push once Week 1 feedback is in.
      </p>
    </div>
  );
}
