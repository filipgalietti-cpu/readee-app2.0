import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, ClipboardList, BarChart3, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import StudentsTab from "./_tabs/StudentsTab";
import AssignmentsTab from "./_tabs/AssignmentsTab";
import InsightsTab from "./_tabs/InsightsTab";
import SettingsTab from "./_tabs/SettingsTab";
import JoinCodePanel from "./_components/JoinCodePanel";
import type { Classroom } from "@/lib/db/types";

export const dynamic = "force-dynamic";

type TabKey = "students" | "assignments" | "insights" | "settings";

const TABS: { key: TabKey; label: string; icon: typeof Users }[] = [
  { key: "students", label: "Students", icon: Users },
  { key: "assignments", label: "Assignments", icon: ClipboardList },
  { key: "insights", label: "Insights", icon: BarChart3 },
  { key: "settings", label: "Settings", icon: Settings },
];

export default async function ClassroomPage({
  params,
  searchParams,
}: {
  params: Promise<{ classroomId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { classroomId } = await params;
  const { tab } = await searchParams;
  const active: TabKey = (["students", "assignments", "insights", "settings"] as TabKey[]).includes(
    tab as TabKey,
  )
    ? (tab as TabKey)
    : "students";

  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("*")
    .eq("id", classroomId)
    .eq("teacher_id", profile.id)
    .maybeSingle();

  if (!classroom) notFound();

  const c = classroom as Classroom;
  if (c.archived_at) redirect("/classroom");

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/classroom"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        All classes
      </Link>

      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {c.name}
          </h1>
          {c.grade_level && (
            <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-slate-400">
              {c.grade_level} grade
            </p>
          )}
        </div>
        <JoinCodePanel classroomId={c.id} initialCode={c.join_code} />
      </div>

      {/* Tabs */}
      <nav
        role="tablist"
        aria-label="Classroom sections"
        className="mt-8 flex gap-1 border-b border-zinc-200 dark:border-slate-800"
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = t.key === active;
          return (
            <Link
              key={t.key}
              role="tab"
              aria-selected={isActive}
              href={`/classroom/${c.id}?tab=${t.key}`}
              className={`relative -mb-px flex items-center gap-2 px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "border-b-2 border-indigo-600 text-indigo-700 dark:text-indigo-300"
                  : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8">
        {active === "students" && <StudentsTab classroomId={c.id} />}
        {active === "assignments" && <AssignmentsTab classroomId={c.id} />}
        {active === "insights" && <InsightsTab classroomId={c.id} />}
        {active === "settings" && <SettingsTab classroomId={c.id} />}
      </div>
    </div>
  );
}
