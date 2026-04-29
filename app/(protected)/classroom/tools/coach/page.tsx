import { ClipboardList, Info } from "lucide-react";
import { requireTeacherTier } from "@/lib/plan/teacher-gate";
import { createClient } from "@/lib/supabase/server";
import RunningRecordRecorder from "./_components/CoachRecorder";

export const dynamic = "force-dynamic";

export default async function CoachPage() {
  const profile = await requireTeacherTier({
    min: "teacher_solo",
    reason: "running_record",
  });

  // Fetch the teacher's classrooms + roster so the recorder can show
  // a child picker without a client-side query.
  const supabase = await createClient();
  const { data: classroomRows } = await supabase
    .from("classrooms")
    .select("id, name, grade_level")
    .eq("teacher_id", profile.id)
    .order("created_at", { ascending: true });
  const classroomList = (classroomRows ?? []) as {
    id: string;
    name: string;
    grade_level: string | null;
  }[];

  let roster: {
    classroomId: string;
    classroomName: string;
    classroomGrade: string | null;
    children: { id: string; first_name: string; grade: string | null }[];
  }[] = [];

  if (classroomList.length > 0) {
    try {
      const ids = classroomList.map((c) => c.id);
      const { data: memberships } = await supabase
        .from("classroom_memberships")
        .select("classroom_id, child_id")
        .in("classroom_id", ids);
      const memberRows =
        (memberships ?? []) as { classroom_id: string; child_id: string }[];
      const childIds = Array.from(new Set(memberRows.map((m) => m.child_id)));
      const childMap = new Map<string, { first_name: string; grade: string | null }>();
      if (childIds.length > 0) {
        const { data: kids } = await supabase
          .from("children")
          .select("id, first_name, grade")
          .in("id", childIds);
        for (const k of (kids ?? []) as {
          id: string;
          first_name: string | null;
          grade: string | null;
        }[]) {
          childMap.set(k.id, {
            first_name: k.first_name ?? "Student",
            grade: k.grade,
          });
        }
      }
      const byClass = new Map<
        string,
        { id: string; first_name: string; grade: string | null }[]
      >();
      for (const m of memberRows) {
        const c = childMap.get(m.child_id);
        if (!c) continue;
        const arr = byClass.get(m.classroom_id) ?? [];
        arr.push({ id: m.child_id, first_name: c.first_name, grade: c.grade });
        byClass.set(m.classroom_id, arr);
      }
      roster = classroomList.map((c) => ({
        classroomId: c.id,
        classroomName: c.name,
        classroomGrade: c.grade_level,
        children: (byClass.get(c.id) ?? []).sort((a, b) =>
          a.first_name.localeCompare(b.first_name),
        ),
      }));
    } catch {
      // Empty roster falls through to "no students" state.
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-blue-600">
        <ClipboardList className="h-4 w-4" />
        AI Running Record
      </div>
      <div className="mt-1 flex flex-wrap items-baseline gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          1:1 reading assessment in 90 seconds
        </h1>
        <details className="group">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-500 transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 [&::-webkit-details-marker]:hidden">
            <Info className="h-3 w-3" />
            How it works
          </summary>
          <p className="mt-2 max-w-2xl rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-zinc-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-slate-300">
            For weekly running records, IEP progress checks, and Title I
            diagnostics. Generate a passage targeting any phonics skill, or
            paste your own. Tap record, listen as the student reads, and
            Readee returns transcript, WCPM, accuracy, miscues, and a focus
            area, saved to that student&apos;s record log.
          </p>
        </details>
      </div>
      <div className="mt-6">
        <RunningRecordRecorder roster={roster} />
      </div>
    </div>
  );
}
