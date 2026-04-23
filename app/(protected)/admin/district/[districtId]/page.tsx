import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, School, Users2, GraduationCap, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import CreateSchoolButton from "../../_components/CreateSchoolButton";
import AddAdminButton from "../../_components/AddAdminButton";
import AdminList from "../../_components/AdminList";
import EditScopeButton from "../../_components/EditScopeButton";

export const dynamic = "force-dynamic";

export default async function DistrictAdminPage({
  params,
}: {
  params: Promise<{ districtId: string }>;
}) {
  const { districtId } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: district } = await supabase
    .from("districts")
    .select("id, name, state")
    .eq("id", districtId)
    .maybeSingle();

  if (!district) notFound();

  const { data: membership } = await supabase
    .from("admin_memberships")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("district_id", districtId)
    .eq("scope", "district")
    .maybeSingle();

  if (!membership) notFound();

  const { data: schools } = await supabase
    .from("schools")
    .select("id, name, city, state")
    .eq("district_id", districtId)
    .order("name", { ascending: true });

  const schoolList = (schools ?? []) as { id: string; name: string; city: string | null; state: string | null }[];
  const schoolIds = schoolList.map((s) => s.id);

  const { data: classrooms } = schoolIds.length
    ? await supabase
        .from("classrooms")
        .select("id, school_id")
        .in("school_id", schoolIds)
        .is("archived_at", null)
    : { data: [] as any[] };

  const classroomsBySchool = new Map<string, string[]>();
  (classrooms ?? []).forEach((c: any) => {
    const list = classroomsBySchool.get(c.school_id) ?? [];
    list.push(c.id);
    classroomsBySchool.set(c.school_id, list);
  });

  const allClassroomIds = (classrooms ?? []).map((c: any) => c.id as string);

  const { data: memberships } = allClassroomIds.length
    ? await supabase
        .from("classroom_memberships")
        .select("classroom_id, child_id")
        .in("classroom_id", allClassroomIds)
    : { data: [] as any[] };

  const studentsBySchool = new Map<string, Set<string>>();
  (memberships ?? []).forEach((m: any) => {
    const schoolId = (classrooms ?? []).find((c: any) => c.id === m.classroom_id)?.school_id;
    if (!schoolId) return;
    const set = studentsBySchool.get(schoolId) ?? new Set<string>();
    set.add(m.child_id);
    studentsBySchool.set(schoolId, set);
  });

  const allStudentIds = Array.from(
    new Set((memberships ?? []).map((m: any) => m.child_id as string)),
  );

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

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

  const districtMastery = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : null;

  const d = district as any;

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
          <div className="text-[11px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
            District admin
          </div>
          <h1 className="mt-1 flex items-center gap-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            <Building2 className="h-7 w-7 text-violet-600" />
            {d.name}
          </h1>
          {d.state && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">{d.state}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <EditScopeButton
            kind="district"
            id={districtId}
            initialName={d.name}
            initialState={d.state ?? null}
          />
          <CreateSchoolButton districtId={districtId} />
          <AddAdminButton scope="district" districtId={districtId} label="Add district admin" />
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={School} label="Schools" value={schoolList.length.toString()} hint="under this district" />
        <SummaryCard icon={GraduationCap} label="Students" value={allStudentIds.length.toString()} hint="enrolled" />
        <SummaryCard
          icon={Users2}
          label="Active (7d)"
          value={`${activeSet.size}/${allStudentIds.length}`}
          hint="practiced this week"
        />
        <SummaryCard
          icon={Target}
          label="Mastery (30d)"
          value={districtMastery === null ? "—" : `${districtMastery}%`}
          hint="district-wide accuracy"
        />
      </div>

      <section className="mt-10">
        <div className="mb-3 flex items-center gap-2">
          <Users2 className="h-4 w-4 text-violet-600" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
            District admins
          </h2>
        </div>
        <AdminList scope="district" scopeId={districtId} selfProfileId={profile.id} />
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-center gap-2">
          <School className="h-4 w-4 text-indigo-600" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
            Schools
          </h2>
        </div>
        {schoolList.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-sm text-zinc-500 dark:text-slate-400">
              No schools in this district yet. Contact{" "}
              <a href="mailto:hello@readee.app" className="font-semibold text-indigo-600 underline">
                hello@readee.app
              </a>{" "}
              to add one.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {schoolList.map((s) => {
              const classroomCount = classroomsBySchool.get(s.id)?.length ?? 0;
              const studentCount = studentsBySchool.get(s.id)?.size ?? 0;
              return (
                <Link
                  key={s.id}
                  href={`/admin/school/${s.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
                >
                  <div className="min-w-0">
                    <div className="font-extrabold text-zinc-900 dark:text-white">{s.name}</div>
                    {(s.city || s.state) && (
                      <div className="text-xs text-zinc-500 dark:text-slate-400">
                        {[s.city, s.state].filter(Boolean).join(", ")}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-6 text-right">
                    <div>
                      <div className="font-mono text-sm font-bold text-zinc-900 dark:text-white">{classroomCount}</div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-400">Classrooms</div>
                    </div>
                    <div>
                      <div className="font-mono text-sm font-bold text-zinc-900 dark:text-white">{studentCount}</div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-400">Students</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
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
  icon: typeof School;
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
