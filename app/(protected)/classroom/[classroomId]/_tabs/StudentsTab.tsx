import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UserRound, Flame, Carrot, BookOpen, AlertTriangle, Sparkles, Mail, MailX, Download } from "lucide-react";
import RemoveStudentButton from "../_components/RemoveStudentButton";
import InviteStudentsButton from "../_components/InviteStudentsButton";
import PendingInviteRowActions from "../_components/PendingInviteRowActions";
import ClassLoginBanner from "../_components/ClassLoginBanner";
import EditStudentButton from "../_components/EditStudentButton";

type RosterRow = {
  child_id: string;
  first_name: string;
  grade: string | null;
  owner_type: string;
  carrots: number;
  streak_days: number;
  last_lesson_at: string | null;
  lessons_this_week: number;
  mastery_pct: number | null;
};

type PendingInvite = {
  id: string;
  student_first_name: string;
  student_last_initial: string | null;
  parent_email: string | null;
  invite_token: string;
  email_sent_at: string | null;
  created_at: string;
};

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function statusFor(row: RosterRow): { label: string; tone: string; Icon: typeof Sparkles } {
  const inactiveDays = daysSince(row.last_lesson_at);
  if (inactiveDays === null || inactiveDays > 5) {
    return { label: "Inactive", tone: "bg-zinc-100 text-zinc-600 dark:bg-slate-800 dark:text-slate-400", Icon: AlertTriangle };
  }
  if (row.mastery_pct !== null && row.mastery_pct >= 85 && row.lessons_this_week >= 3) {
    return { label: "Excelling", tone: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300", Icon: Sparkles };
  }
  if (row.mastery_pct !== null && row.mastery_pct < 60) {
    return { label: "Falling behind", tone: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300", Icon: AlertTriangle };
  }
  return { label: "On track", tone: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300", Icon: Sparkles };
}

async function loadRoster(classroomId: string): Promise<RosterRow[]> {
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("classroom_memberships")
    .select("child_id, children(id, first_name, grade, carrots, streak_days, last_lesson_at, owner_type)")
    .eq("classroom_id", classroomId);

  const childIds = (memberships ?? [])
    .map((m) => (m as { child_id: string }).child_id);
  if (childIds.length === 0) return [];

  const oneWeekAgo = new Date(Date.now() - 7 * 86400 * 1000).toISOString();

  const { data: practice } = await supabase
    .from("practice_results")
    .select("child_id, questions_attempted, questions_correct, completed_at")
    .in("child_id", childIds)
    .gte("completed_at", oneWeekAgo);

  const { data: lessons } = await supabase
    .from("lessons_progress")
    .select("child_id, completed_at")
    .in("child_id", childIds)
    .gte("completed_at", oneWeekAgo);

  const lessonCount = new Map<string, number>();
  (lessons ?? []).forEach((l: { child_id: string }) =>
    lessonCount.set(l.child_id, (lessonCount.get(l.child_id) ?? 0) + 1),
  );

  const mastery = new Map<string, { attempted: number; correct: number }>();
  (practice ?? []).forEach((p: { child_id: string; questions_attempted: number; questions_correct: number }) => {
    const cur = mastery.get(p.child_id) ?? { attempted: 0, correct: 0 };
    cur.attempted += p.questions_attempted;
    cur.correct += p.questions_correct;
    mastery.set(p.child_id, cur);
  });

  return (memberships ?? []).map((m) => {
    const raw = m as unknown as {
      child_id: string;
      children: {
        id: string;
        first_name: string;
        grade: string | null;
        owner_type: string;
        carrots: number;
        streak_days: number;
        last_lesson_at: string | null;
      };
    };
    const c = raw.children;
    const mt = mastery.get(c.id);
    return {
      child_id: c.id,
      first_name: c.first_name,
      grade: c.grade,
      owner_type: c.owner_type,
      carrots: c.carrots ?? 0,
      streak_days: c.streak_days ?? 0,
      last_lesson_at: c.last_lesson_at,
      lessons_this_week: lessonCount.get(c.id) ?? 0,
      mastery_pct: mt && mt.attempted > 0 ? Math.round((mt.correct / mt.attempted) * 100) : null,
    };
  });
}

async function loadPendingInvites(classroomId: string): Promise<PendingInvite[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("roster_invites")
    .select("id, student_first_name, student_last_initial, parent_email, invite_token, email_sent_at, created_at")
    .eq("classroom_id", classroomId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  return (data ?? []) as PendingInvite[];
}

function baseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    "https://learn.readee.app"
  ).replace(/\/$/, "");
}

export default async function StudentsTab({ classroomId }: { classroomId: string }) {
  const supabase = await createClient();
  const [{ data: classroomData }, roster, pending] = await Promise.all([
    supabase.from("classrooms").select("join_code").eq("id", classroomId).maybeSingle(),
    loadRoster(classroomId),
    loadPendingInvites(classroomId),
  ]);

  const base = baseUrl();
  const joinCode = (classroomData as any)?.join_code as string | undefined;
  const hasClassroomStudents = roster.some((r) => r.owner_type === "classroom");

  return (
    <div className="space-y-5">
      {joinCode && (roster.length > 0 || hasClassroomStudents) && (
        <ClassLoginBanner code={joinCode} baseUrl={base} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-zinc-500 dark:text-slate-400">
          {roster.length} student{roster.length === 1 ? "" : "s"}
          {pending.length > 0 && <> · {pending.length} pending</>}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {roster.length > 0 && (
            <>
              <a
                href={`/api/classroom/${classroomId}/export?type=roster`}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                title="Download class roster as CSV"
              >
                <Download className="h-3.5 w-3.5" />
                Roster CSV
              </a>
              <a
                href={`/api/classroom/${classroomId}/export?type=assignments`}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                title="Download per-assignment completions as CSV"
              >
                <Download className="h-3.5 w-3.5" />
                Assignments CSV
              </a>
            </>
          )}
          <InviteStudentsButton classroomId={classroomId} />
        </div>
      </div>

      {roster.length === 0 && pending.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-zinc-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
            <UserRound className="h-7 w-7" />
          </span>
          <h2 className="mt-5 text-lg font-bold text-zinc-900 dark:text-white">
            No students yet
          </h2>
          <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-slate-400">
            Invite students by email or share the join code above — they show up here as they join.
          </p>
          <div className="mt-5">
            <InviteStudentsButton classroomId={classroomId} />
          </div>
        </div>
      ) : (
        <>
          {roster.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-slate-800 dark:bg-slate-900/40">
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50 text-left dark:border-slate-800 dark:bg-slate-900/60">
                  <tr className="text-xs uppercase tracking-wider text-zinc-500 dark:text-slate-400">
                    <th className="px-5 py-3 font-semibold">Student</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Mastery (7d)</th>
                    <th className="px-5 py-3 text-right font-semibold">Lessons this week</th>
                    <th className="px-5 py-3 text-right font-semibold">Streak</th>
                    <th className="px-5 py-3 text-right font-semibold">Carrots</th>
                    <th className="px-5 py-3 font-semibold sr-only">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((r) => {
                    const { label, tone, Icon } = statusFor(r);
                    return (
                      <tr
                        key={r.child_id}
                        className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60 dark:border-slate-800 dark:hover:bg-slate-900/60"
                      >
                        <td className="px-5 py-3">
                          <Link
                            href={`/classroom/${classroomId}/students/${r.child_id}`}
                            className="group inline-flex flex-col"
                          >
                            <span className="font-semibold text-zinc-900 group-hover:text-indigo-600 group-hover:underline dark:text-white">
                              {r.first_name}
                            </span>
                            {r.grade && (
                              <span className="text-xs text-zinc-500 dark:text-slate-400">
                                {r.grade}
                              </span>
                            )}
                          </Link>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
                            <Icon className="h-3 w-3" />
                            {label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-mono font-semibold text-zinc-900 dark:text-white">
                          {r.mastery_pct === null ? "—" : `${r.mastery_pct}%`}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-zinc-700 dark:text-slate-300">
                          <span className="inline-flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5 text-zinc-400" />
                            {r.lessons_this_week}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-zinc-700 dark:text-slate-300">
                          <span className="inline-flex items-center gap-1.5">
                            <Flame className="h-3.5 w-3.5 text-rose-400" />
                            {r.streak_days}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-zinc-700 dark:text-slate-300">
                          <span className="inline-flex items-center gap-1.5">
                            <Carrot className="h-3.5 w-3.5 text-orange-500" />
                            {r.carrots}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <EditStudentButton
                              studentId={r.child_id}
                              firstName={r.first_name}
                              grade={r.grade}
                              ownerType={r.owner_type}
                            />
                            <RemoveStudentButton
                              classroomId={classroomId}
                              childId={r.child_id}
                              firstName={r.first_name}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {pending.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-950/10">
              <div className="flex items-center gap-2 border-b border-amber-200 px-5 py-3 dark:border-amber-900/50">
                <Mail className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Pending invites ({pending.length})
                </h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-amber-50 text-left dark:bg-amber-950/20">
                  <tr className="text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    <th className="px-5 py-2 font-semibold">Student</th>
                    <th className="px-5 py-2 font-semibold">Parent email</th>
                    <th className="px-5 py-2 font-semibold">Sent</th>
                    <th className="px-5 py-2 text-right font-semibold sr-only">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((inv) => (
                    <tr
                      key={inv.id}
                      className="border-b border-amber-100 last:border-0 dark:border-amber-950/40"
                    >
                      <td className="px-5 py-2.5">
                        <div className="font-semibold text-zinc-900 dark:text-white">
                          {inv.student_first_name}
                          {inv.student_last_initial ? ` ${inv.student_last_initial}.` : ""}
                        </div>
                      </td>
                      <td className="px-5 py-2.5 text-zinc-700 dark:text-slate-300">
                        {inv.parent_email ?? (
                          <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                            <MailX className="h-3 w-3" />
                            no email
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-2.5 text-xs text-zinc-500 dark:text-slate-400">
                        {inv.email_sent_at
                          ? new Date(inv.email_sent_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : inv.parent_email
                          ? "not sent"
                          : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <PendingInviteRowActions
                          inviteId={inv.id}
                          hasEmail={!!inv.parent_email}
                          inviteUrl={`${base}/invite/${inv.invite_token}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
