import { Notebook } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireTeacherTier } from "@/lib/plan/teacher-gate";
import IepNoteForm from "./_components/IepNoteForm";

export const dynamic = "force-dynamic";

export default async function IepNotePage() {
  // School/district-tier feature: SPED is sold into the District SKU.
  const profile = await requireTeacherTier({ min: "school", reason: "iep_note" });

  const supabase = await createClient();
  const { data: classrooms } = await supabase
    .from("classrooms")
    .select("id, name")
    .eq("teacher_id", profile.id);
  const classroomIds = ((classrooms ?? []) as { id: string }[]).map((c) => c.id);
  const { data: enrollments } = classroomIds.length
    ? await supabase
        .from("classroom_students")
        .select("child_id, children(id, name)")
        .in("classroom_id", classroomIds)
    : { data: [] };

  const studentMap = new Map<string, string>();
  for (const e of (enrollments ?? []) as any[]) {
    const c = e.children;
    if (c?.id && c?.name) studentMap.set(c.id, c.name);
  }
  const students = [...studentMap.entries()].map(([id, name]) => ({ id, name }));

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-600">
        <Notebook className="h-4 w-4" />
        IEP / 504 progress note
      </div>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        Draft a progress note
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Pick a student and paste their annual goal. Readee pulls their
        recent practice + lesson data and drafts a parent-readable
        progress note in the standard IEP format. Edit before sharing.
      </p>

      <div className="mt-6">
        <IepNoteForm students={students} />
      </div>
    </div>
  );
}
