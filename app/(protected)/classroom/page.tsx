import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import { Users, Plus, Archive } from "lucide-react";
import CreateClassroomButton from "./_components/CreateClassroomButton";
import type { Classroom } from "@/lib/db/types";

export const dynamic = "force-dynamic";

export default async function ClassroomIndex() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: classrooms } = await supabase
    .from("classrooms")
    .select("*")
    .eq("teacher_id", profile.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  const list = (classrooms ?? []) as Classroom[];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
            Teacher Dashboard
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Welcome back, {profile.display_name || "teacher"}.
          </h1>
          <p className="mt-2 max-w-lg text-sm text-zinc-500 dark:text-slate-400">
            Create a class, invite your students, and assign lessons or custom
            quizzes. Track who&apos;s done, who&apos;s stuck, and what to teach
            next.
          </p>
        </div>
        <CreateClassroomButton />
      </header>

      {list.length === 0 ? <EmptyState /> : <ClassroomGrid classrooms={list} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
        <Users className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-lg font-bold text-zinc-900 dark:text-white">
        Let&apos;s set up your first class
      </h2>
      <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-slate-400">
        You&apos;ll get a join code to share with parents. Kids show up in your
        roster as they join.
      </p>
      <CreateClassroomButton className="mt-6" />
    </div>
  );
}

function ClassroomGrid({ classrooms }: { classrooms: Classroom[] }) {
  return (
    <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {classrooms.map((c) => (
        <Link
          key={c.id}
          href={`/classroom/${c.id}`}
          className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/40"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                {c.name}
              </h3>
              {c.grade_level && (
                <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-slate-400">
                  {c.grade_level} grade
                </p>
              )}
            </div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
              {c.join_code}
            </span>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500 dark:text-slate-400">
            <Users className="h-3.5 w-3.5" />
            <span>Open classroom →</span>
          </div>
        </Link>
      ))}

      <Link
        href="/classroom#create"
        className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-200 p-5 text-sm font-medium text-zinc-500 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:text-slate-400 dark:hover:text-indigo-300"
      >
        <Plus className="h-4 w-4" />
        New class
      </Link>
    </div>
  );
}
