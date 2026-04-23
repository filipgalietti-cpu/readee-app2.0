import { createClient } from "@/lib/supabase/server";
import type { Classroom } from "@/lib/db/types";
import ClassroomSettingsForm from "../_components/ClassroomSettingsForm";
import ArchiveClassroomButton from "../_components/ArchiveClassroomButton";

export default async function SettingsTab({ classroomId }: { classroomId: string }) {
  const supabase = await createClient();

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("*")
    .eq("id", classroomId)
    .maybeSingle();

  if (!classroom) return null;
  const c = classroom as Classroom;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
          Class details
        </h3>
        <div className="mt-4">
          <ClassroomSettingsForm
            classroomId={c.id}
            initialName={c.name}
            initialGradeLevel={c.grade_level}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50/60 p-6 dark:border-red-950/50 dark:bg-red-950/20">
        <h3 className="text-sm font-bold uppercase tracking-wider text-red-700 dark:text-red-300">
          Danger zone
        </h3>
        <div className="mt-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-white">
              Archive this class
            </div>
            <p className="mt-0.5 text-xs text-zinc-600 dark:text-slate-400">
              Removes it from your list and stops new joiners. Student
              history and submissions are preserved.
            </p>
          </div>
          <ArchiveClassroomButton classroomId={c.id} />
        </div>
      </section>
    </div>
  );
}
