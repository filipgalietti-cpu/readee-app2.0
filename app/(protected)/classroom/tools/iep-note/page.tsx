import { Notebook, Info, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireTeacherTier } from "@/lib/plan/teacher-gate";
import IepWorkspace from "./_components/IepWorkspace";

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
        .from("classroom_memberships")
        .select("child_id, children(id, first_name)")
        .in("classroom_id", classroomIds)
    : { data: [] };

  const studentMap = new Map<string, string>();
  for (const e of (enrollments ?? []) as any[]) {
    const c = Array.isArray(e.children) ? e.children[0] : e.children;
    if (c?.id && c?.first_name) studentMap.set(c.id, c.first_name);
  }
  const students = [...studentMap.entries()].map(([id, name]) => ({ id, name }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-600">
        <Notebook className="h-4 w-4" />
        IEP / 504 workspace
      </div>
      <div className="mt-1 flex flex-wrap items-baseline gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Special-education tools
        </h1>
        <details className="group">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-500 transition hover:border-amber-300 hover:text-amber-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 [&::-webkit-details-marker]:hidden">
            <Info className="h-3 w-3" />
            How it works
          </summary>
          <p className="mt-2 max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-zinc-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-slate-300">
            Three tabs: <span className="font-bold">Goals</span> stores
            each student&apos;s annual IEP/504 goals once, so you don&apos;t
            paste them every quarter. <span className="font-bold">Note</span>{" "}
            drafts an IDEA-aligned progress note grounded in the
            student&apos;s real Readee data (practice, lessons, running
            records). <span className="font-bold">Plan</span> turns a
            progress note into a 2-week intervention plan with concrete
            sessions and material recommendations.
          </p>
        </details>
      </div>

      <div className="mt-6">
        <IepWorkspace students={students} />
      </div>

      <div className="mt-8 flex items-start gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-[11px] text-zinc-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-500">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
        <span>
          AI-assisted drafts. Always review with your IEP team before
          submitting. Readee never proposes a Tier-3 intervention program
          or a diagnosis — those decisions belong to the IEP team and the
          school psychologist.
        </span>
      </div>
    </div>
  );
}
