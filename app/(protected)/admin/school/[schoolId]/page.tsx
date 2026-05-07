import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Users2,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Target,
  Download,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import AddAdminButton from "../../_components/AddAdminButton";
import AdminList from "../../_components/AdminList";
import EditScopeButton from "../../_components/EditScopeButton";
import SchoolJoinCodePanel from "../../_components/SchoolJoinCodePanel";
import { daysAgoIso } from "@/lib/utils/dates";

export const dynamic = "force-dynamic";

export default async function SchoolAdminPage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: school } = await supabase
    .from("schools")
    .select("id, name, city, state, district_id, join_code")
    .eq("id", schoolId)
    .maybeSingle();

  if (!school) notFound();

  const { data: membership } = await supabase
    .from("admin_memberships")
    .select("id")
    .eq("profile_id", profile.id)
    .or(`school_id.eq.${schoolId},district_id.eq.${(school as any).district_id ?? "00000000-0000-0000-0000-000000000000"}`)
    .limit(1)
    .maybeSingle();

  if (!membership) notFound();

  const { data: classrooms } = await supabase
    .from("classrooms")
    .select("id, name, grade_level, archived_at, teacher_id")
    .eq("school_id", schoolId)
    .is("archived_at", null)
    .order("name", { ascending: true });

  const classroomList = (classrooms ?? []) as {
    id: string;
    name: string;
    grade_level: string | null;
    teacher_id: string;
  }[];

  const classroomIds = classroomList.map((c) => c.id);

  const [{ data: memberships }, { data: assignments }] = await Promise.all([
    classroomIds.length
      ? supabase
          .from("classroom_memberships")
          .select("classroom_id, child_id")
          .in("classroom_id", classroomIds)
      : Promise.resolve({ data: [] as any[] }),
    classroomIds.length
      ? supabase
          .from("assignments")
          .select("id, classroom_id")
          .in("classroom_id", classroomIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const studentIdsByClassroom = new Map<string, Set<string>>();
  (memberships ?? []).forEach((m: any) => {
    const set = studentIdsByClassroom.get(m.classroom_id) ?? new Set<string>();
    set.add(m.child_id);
    studentIdsByClassroom.set(m.classroom_id, set);
  });

  const assignmentCountByClassroom = new Map<string, number>();
  (assignments ?? []).forEach((a: any) => {
    assignmentCountByClassroom.set(
      a.classroom_id,
      (assignmentCountByClassroom.get(a.classroom_id) ?? 0) + 1,
    );
  });

  const allStudentIds = Array.from(
    new Set(Array.from(studentIdsByClassroom.values()).flatMap((s) => Array.from(s))),
  );

  const thirtyDaysAgo = daysAgoIso(30);
  const sevenDaysAgo = daysAgoIso(7);

  const { data: practice } = allStudentIds.length
    ? await supabase
        .from("practice_results")
        .select("child_id, questions_attempted, questions_correct, completed_at")
        .in("child_id", allStudentIds)
        .gte("completed_at", thirtyDaysAgo)
    : { data: [] as any[] };

  const practiceRows = (practice ?? []) as {
    child_id: string;
    questions_attempted: number;
    questions_correct: number;
    completed_at: string;
  }[];

  let totalAttempted = 0;
  let totalCorrect = 0;
  const activeSet = new Set<string>();
  for (const p of practiceRows) {
    totalAttempted += p.questions_attempted;
    totalCorrect += p.questions_correct;
    if (p.completed_at >= sevenDaysAgo) activeSet.add(p.child_id);
  }

  const schoolMastery = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : null;

  const totalStudents = allStudentIds.length;
  const totalClassrooms = classroomList.length;
  const totalAssignments = (assignments ?? []).length;

  const s = school as any;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        All scopes
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
            School admin
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {s.name}
          </h1>
          {(s.city || s.state) && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
              {[s.city, s.state].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <EditScopeButton
            kind="school"
            id={schoolId}
            initialName={s.name}
            initialCity={s.city ?? null}
            initialState={s.state ?? null}
          />
          <AddAdminButton scope="school" schoolId={schoolId} label="Add school admin" />
          <a
            href={`/api/admin/school/${schoolId}/export`}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            title="Download school-wide progress as CSV"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </a>
        </div>
      </div>

      <div className="mt-6">
        <SchoolJoinCodePanel schoolId={schoolId} initialCode={s.join_code} />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={Users2} label="Classrooms" value={totalClassrooms.toString()} hint="active in school" />
        <SummaryCard icon={GraduationCap} label="Students" value={totalStudents.toString()} hint="enrolled" />
        <SummaryCard
          icon={BookOpen}
          label="Active (7d)"
          value={`${activeSet.size}/${totalStudents}`}
          hint="practiced this week"
        />
        <SummaryCard
          icon={Target}
          label="Mastery (30d)"
          value={schoolMastery === null ? "—" : `${schoolMastery}%`}
          hint="school-wide accuracy"
        />
      </div>

      <section className="mt-10">
        <div className="mb-3 flex items-center gap-2">
          <Users2 className="h-4 w-4 text-indigo-600" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
            School admins
          </h2>
        </div>
        <AdminList scope="school" scopeId={schoolId} selfProfileId={profile.id} />
      </section>

      <section className="mt-10">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-indigo-600" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
            Classrooms ({totalClassrooms})
          </h2>
        </div>
        {classroomList.length === 0 ? (
          <div className="mt-4 rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-sm text-zinc-500 dark:text-slate-400">
              No classrooms linked to this school yet.
            </p>
          </div>
        ) : (
          <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-slate-800 dark:bg-slate-900/40">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-left dark:border-slate-800 dark:bg-slate-900/60">
                <tr className="text-xs uppercase tracking-wider text-zinc-500 dark:text-slate-400">
                  <th className="px-5 py-3 font-semibold">Classroom</th>
                  <th className="px-5 py-3 font-semibold">Grade</th>
                  <th className="px-5 py-3 text-right font-semibold">Students</th>
                  <th className="px-5 py-3 text-right font-semibold">Assignments</th>
                </tr>
              </thead>
              <tbody>
                {classroomList.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-zinc-100 last:border-0 hover:bg-indigo-50/40 dark:border-slate-800 dark:hover:bg-indigo-950/20"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/classroom/${c.id}`}
                        className="group inline-flex items-center gap-1 font-semibold text-zinc-900 hover:text-indigo-700 hover:underline dark:text-white dark:hover:text-indigo-300"
                      >
                        {c.name}
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-600" />
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-slate-400">
                      {c.grade_level ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-zinc-700 dark:text-slate-300">
                      {studentIdsByClassroom.get(c.id)?.size ?? 0}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-zinc-700 dark:text-slate-300">
                      {assignmentCountByClassroom.get(c.id) ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-4 text-xs text-zinc-400 dark:text-slate-500">
          Totals computed over the last 30 days of practice activity.{" "}
          {totalAssignments} assignment{totalAssignments === 1 ? "" : "s"} total across the school.
        </p>
      </section>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users2;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">{value}</div>
      <div className="mt-1 text-[11px] text-zinc-400 dark:text-slate-500">{hint}</div>
    </div>
  );
}
