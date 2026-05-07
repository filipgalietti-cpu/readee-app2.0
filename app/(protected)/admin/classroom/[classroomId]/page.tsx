import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Users2,
  GraduationCap,
  ClipboardList,
  Target,
  BookOpen,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireProfile } from "@/lib/auth/helpers";
import { daysAgoIso } from "@/lib/utils/dates";

export const dynamic = "force-dynamic";

export default async function AdminClassroomDetailPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  // Load classroom — RLS enforces that caller is either teacher of it
  // or admin of its school/district. If neither, RLS returns null → 404.
  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id, name, grade_level, teacher_id, school_id, archived_at")
    .eq("id", classroomId)
    .maybeSingle();
  if (!classroom) notFound();
  const c = classroom as any;

  // Resolve the teacher's email via service role (profiles RLS is own-only).
  const admin = supabaseAdmin();
  const { data: teacher } = await admin
    .from("profiles")
    .select("email")
    .eq("id", c.teacher_id)
    .maybeSingle();
  const teacherEmail = (teacher as any)?.email ?? "(unknown)";

  // Confirm the caller has admin scope over this classroom's school.
  if (!c.school_id) notFound();
  const { data: selfDirect } = await supabase
    .from("admin_memberships")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("scope", "school")
    .eq("school_id", c.school_id)
    .maybeSingle();
  let canSee = !!selfDirect;
  if (!canSee) {
    const { data: school } = await supabase
      .from("schools")
      .select("district_id")
      .eq("id", c.school_id)
      .maybeSingle();
    const districtId = (school as any)?.district_id;
    if (districtId) {
      const { data: selfDistrict } = await supabase
        .from("admin_memberships")
        .select("id")
        .eq("profile_id", profile.id)
        .eq("scope", "district")
        .eq("district_id", districtId)
        .maybeSingle();
      canSee = !!selfDistrict;
    }
  }
  if (!canSee) notFound();

  // Load roster (classroom_memberships.children(*) works for admin via auth_admin_sees_child RLS).
  const { data: memberships } = await supabase
    .from("classroom_memberships")
    .select("child_id, children(id, first_name, grade, owner_type, carrots, streak_days, last_lesson_at)")
    .eq("classroom_id", classroomId);

  const roster = ((memberships ?? []) as any[])
    .map((m) => m.children)
    .filter(Boolean) as {
    id: string;
    first_name: string;
    grade: string | null;
    owner_type: string;
    carrots: number;
    streak_days: number;
    last_lesson_at: string | null;
  }[];

  const studentIds = roster.map((s) => s.id);
  const thirtyDaysAgo = daysAgoIso(30);
  const sevenDaysAgo = daysAgoIso(7);

  const [{ data: practice }, { data: assignments }, { data: subs }] = await Promise.all([
    studentIds.length
      ? supabase
          .from("practice_results")
          .select("child_id, questions_attempted, questions_correct, completed_at")
          .in("child_id", studentIds)
          .gte("completed_at", thirtyDaysAgo)
      : Promise.resolve({ data: [] as any[] }),
    supabase
      .from("assignments")
      .select("id, title, source_id, kind, due_at")
      .eq("classroom_id", classroomId)
      .order("due_at", { ascending: true, nullsFirst: false }),
    studentIds.length
      ? supabase
          .from("assignment_submissions")
          .select("assignment_id, child_id, completed_at, score_percent")
          .in("child_id", studentIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const masteryByChild = new Map<string, { attempted: number; correct: number }>();
  const activeChildren = new Set<string>();
  for (const p of (practice ?? []) as any[]) {
    const cur = masteryByChild.get(p.child_id) ?? { attempted: 0, correct: 0 };
    cur.attempted += p.questions_attempted;
    cur.correct += p.questions_correct;
    masteryByChild.set(p.child_id, cur);
    if (p.completed_at >= sevenDaysAgo) activeChildren.add(p.child_id);
  }

  const assignmentsList = ((assignments ?? []) as any[]).map((a) => a) as {
    id: string;
    title: string;
    source_id: string;
    kind: string;
    due_at: string | null;
  }[];

  const doneByAssignment = new Map<string, number>();
  for (const s of (subs ?? []) as any[]) {
    if (s.completed_at) {
      doneByAssignment.set(s.assignment_id, (doneByAssignment.get(s.assignment_id) ?? 0) + 1);
    }
  }

  // School-wide mastery for the summary card
  let totalAttempted = 0;
  let totalCorrect = 0;
  for (const m of masteryByChild.values()) {
    totalAttempted += m.attempted;
    totalCorrect += m.correct;
  }
  const classMastery = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href={`/admin/school/${c.school_id}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to school
      </Link>

      <div className="mt-3">
        <div className="text-[11px] font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
          Classroom · admin view
        </div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {c.name}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
          {c.grade_level ? `${c.grade_level} · ` : ""}Teacher: {teacherEmail}
          {c.archived_at && " · Archived"}
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={GraduationCap} label="Students" value={roster.length.toString()} hint="enrolled" />
        <SummaryCard
          icon={BookOpen}
          label="Active (7d)"
          value={`${activeChildren.size}/${roster.length}`}
          hint="practiced this week"
        />
        <SummaryCard
          icon={Target}
          label="Mastery (30d)"
          value={classMastery === null ? "—" : `${classMastery}%`}
          hint="class accuracy"
        />
        <SummaryCard
          icon={ClipboardList}
          label="Assignments"
          value={assignmentsList.length.toString()}
          hint="in this class"
        />
      </div>

      <section className="mt-10">
        <div className="mb-3 flex items-center gap-2">
          <Users2 className="h-4 w-4 text-indigo-600" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
            Roster
          </h2>
        </div>
        {roster.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 dark:border-slate-800 dark:bg-slate-900/40">
            No students enrolled yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-slate-800 dark:bg-slate-900/40">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-left dark:border-slate-800 dark:bg-slate-900/60">
                <tr className="text-xs uppercase tracking-wider text-zinc-500 dark:text-slate-400">
                  <th className="px-5 py-3 font-semibold">Student</th>
                  <th className="px-5 py-3 font-semibold">Grade</th>
                  <th className="px-5 py-3 text-right font-semibold">Mastery (30d)</th>
                  <th className="px-5 py-3 text-right font-semibold">Questions</th>
                  <th className="px-5 py-3 text-right font-semibold">Last active</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((s) => {
                  const m = masteryByChild.get(s.id);
                  const masteryPct = m && m.attempted > 0
                    ? Math.round((m.correct / m.attempted) * 100)
                    : null;
                  const daysAgo = s.last_lesson_at
                    ? Math.floor((Date.now() - new Date(s.last_lesson_at).getTime()) / 86_400_000)
                    : null;
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60 dark:border-slate-800"
                    >
                      <td className="px-5 py-3 font-semibold text-zinc-900 dark:text-white">
                        {s.first_name}
                      </td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-slate-400">
                        {s.grade ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-zinc-700 dark:text-slate-300">
                        {masteryPct === null ? "—" : `${masteryPct}%`}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-zinc-700 dark:text-slate-300">
                        {m?.attempted ?? 0}
                      </td>
                      <td className="px-5 py-3 text-right text-xs text-zinc-500 dark:text-slate-400">
                        {daysAgo === null
                          ? "Never"
                          : daysAgo === 0
                          ? "Today"
                          : daysAgo === 1
                          ? "Yesterday"
                          : `${daysAgo}d ago`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-indigo-600" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
            Assignments
          </h2>
        </div>
        {assignmentsList.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 dark:border-slate-800 dark:bg-slate-900/40">
            No assignments yet.
          </div>
        ) : (
          <ul className="space-y-2">
            {assignmentsList.map((a) => {
              const done = doneByAssignment.get(a.id) ?? 0;
              const total = roster.length;
              return (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-900/40"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-zinc-900 dark:text-white">
                      {a.title}
                    </div>
                    <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-slate-400">
                      {a.kind === "readee_lesson" ? "Lesson" : "Custom quiz"} · {a.source_id}
                      {a.due_at && (
                        <>
                          {" · "}
                          <span className="inline-flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            Due {new Date(a.due_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-700 dark:bg-slate-800 dark:text-slate-300">
                      <CheckCircle2 className="h-3 w-3" />
                      {done}/{total}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="mt-10 text-xs text-zinc-400 dark:text-slate-500">
        Read-only admin view. For roster edits, assignments, and settings,
        the classroom teacher manages this from their{" "}
        <Link
          href={`/classroom/${classroomId}`}
          className="font-semibold text-indigo-600 underline"
        >
          classroom dashboard
        </Link>
        {" "}(teacher login required).
      </p>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Target;
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
