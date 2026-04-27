import { Brain } from "lucide-react";
import { requireTeacherTier } from "@/lib/plan/teacher-gate";
import CoachRecorder from "./_components/CoachRecorder";

export const dynamic = "force-dynamic";

export default async function CoachPage() {
  await requireTeacherTier({ min: "teacher_solo", reason: "coach_mode" });

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-blue-600">
        <Brain className="h-4 w-4" />
        Coach mode
      </div>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        Record a small group, get per-kid analysis
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Tap record, set the recorder near your reading group. Stop when
        done. Readee transcribes, identifies each speaker (A/B/C — you
        relabel later), and flags reading errors per kid with a target
        focus area.
      </p>
      <div className="mt-6">
        <CoachRecorder />
      </div>
    </div>
  );
}
