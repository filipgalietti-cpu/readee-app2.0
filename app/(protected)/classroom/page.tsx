import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import {
  Users,
  Plus,
  Monitor,
  BookOpen,
  Sparkles,
  ArrowRight,
  GraduationCap,
  CheckCircle2,
  Circle,
} from "lucide-react";
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

  // Onboarding progress: check if any classroom has a student / an
  // assignment. Used to decide whether to show the "next step" nudge.
  let totalStudents = 0;
  let totalAssignments = 0;
  if (list.length > 0) {
    const classroomIds = list.map((c) => c.id);
    const [{ count: studentCount }, { count: assignmentCount }] = await Promise.all([
      supabase
        .from("classroom_memberships")
        .select("id", { count: "exact", head: true })
        .in("classroom_id", classroomIds),
      supabase
        .from("assignments")
        .select("id", { count: "exact", head: true })
        .in("classroom_id", classroomIds),
    ]);
    totalStudents = studentCount ?? 0;
    totalAssignments = assignmentCount ?? 0;
  }

  const hasClass = list.length > 0;
  const hasStudents = totalStudents > 0;
  const hasAssignments = totalAssignments > 0;
  const showNextStepNudge = hasClass && (!hasStudents || !hasAssignments);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
            Teacher Dashboard
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {hasClass
              ? `Welcome back, ${profile.display_name || "teacher"}.`
              : "Welcome to Readee Classroom"}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-zinc-500 dark:text-slate-400">
            Create a class, invite your students, and assign lessons or custom
            quizzes. Track who&apos;s done, who&apos;s stuck, and what to teach
            next.
          </p>
        </div>
        {hasClass && <CreateClassroomButton />}
      </header>

      {!hasClass && <Onboarding />}
      {showNextStepNudge && (
        <NextStepNudge
          firstClassroom={list[0]}
          hasStudents={hasStudents}
          hasAssignments={hasAssignments}
        />
      )}
      {hasClass && <ClassroomGrid classrooms={list} />}
    </div>
  );
}

/* ─── First-time onboarding (no classrooms yet) ────────────── */

function Onboarding() {
  return (
    <div className="mt-10 space-y-6">
      <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-8 dark:border-indigo-900/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-violet-950/30">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
          <GraduationCap className="h-4 w-4" />
          How Readee Classroom works
        </div>
        <h2 className="mt-3 text-2xl font-extrabold text-zinc-900 dark:text-white">
          Three steps to your first assignment.
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-slate-400">
          You can do this entirely free for one classroom — no credit card, no
          commitment. Pilot with Jennifer&apos;s class for a week and see if
          it clicks.
        </p>

        <ol className="mt-6 grid gap-3 md:grid-cols-3">
          <OnboardingStep
            n={1}
            icon={Users}
            title="Create a class"
            body="Give it a name and pick a grade. You get a 6-character class code students use to sign in."
          />
          <OnboardingStep
            n={2}
            icon={Monitor}
            title="Add students"
            body="Type names one at a time, paste a CSV, or import a Google Classroom roster. No parent emails required."
          />
          <OnboardingStep
            n={3}
            icon={BookOpen}
            title="Assign a lesson"
            body="Pick from 200+ CCSS-aligned Readee lessons, or build your own quiz. Track completion + score as students finish."
          />
        </ol>

        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <CreateClassroomButton />
          <span className="text-xs text-zinc-500 dark:text-slate-400">
            Takes about 30 seconds.
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <InfoCard
          icon={Sparkles}
          title="Readee.ai included"
          body="Generate 10 MCQs per hour with AI, reviewed by you before reaching students."
        />
        <InfoCard
          icon={Users}
          title="No parent chase-down"
          body="Students sign in with a class code and pick their name. No email, no password to remember."
        />
        <InfoCard
          icon={GraduationCap}
          title="Science of Reading"
          body="Curriculum authored by a certified reading specialist, not just MLs guessing at phonics."
        />
      </div>

      <p className="text-center text-xs text-zinc-500 dark:text-slate-400">
        Bringing Readee to your school or district?{" "}
        <Link
          href="/schools"
          className="font-semibold text-indigo-600 underline"
        >
          See pricing + procurement
        </Link>
      </p>
    </div>
  );
}

function OnboardingStep({
  n,
  icon: Icon,
  title,
  body,
}: {
  n: number;
  icon: typeof Users;
  title: string;
  body: string;
}) {
  return (
    <li className="relative rounded-2xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="absolute -top-3 left-5 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
        {n}
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="mt-3 font-bold text-zinc-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-xs text-zinc-500 dark:text-slate-400">{body}</p>
    </li>
  );
}

function InfoCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Users;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
        <Icon className="h-4 w-4" />
      </div>
      <h4 className="mt-3 text-sm font-bold text-zinc-900 dark:text-white">
        {title}
      </h4>
      <p className="mt-1 text-xs text-zinc-500 dark:text-slate-400">{body}</p>
    </div>
  );
}

/* ─── "Next step" nudge after first classroom is created ────── */

function NextStepNudge({
  firstClassroom,
  hasStudents,
  hasAssignments,
}: {
  firstClassroom: Classroom;
  hasStudents: boolean;
  hasAssignments: boolean;
}) {
  // Decide which step to nudge on. Students before assignments.
  const nextStep = !hasStudents
    ? {
        title: "Add students to get started",
        body: `${firstClassroom.name} is ready — now drop in a few names or paste a roster.`,
        href: `/classroom/${firstClassroom.id}?tab=students`,
        cta: "Add students",
      }
    : {
        title: "Assign your first lesson",
        body: `Your class has students. Assign a Readee lesson or a custom quiz to see who's strong and who's stuck.`,
        href: `/classroom/${firstClassroom.id}?tab=assignments`,
        cta: "Create assignment",
      };

  return (
    <div className="mt-8 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 p-5 dark:border-indigo-900/40 dark:from-indigo-950/30 dark:to-violet-950/30">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
        <Sparkles className="h-3.5 w-3.5" />
        Next step
      </div>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-extrabold text-zinc-900 dark:text-white">
            {nextStep.title}
          </h3>
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-slate-400">
            {nextStep.body}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              Class created
            </span>
            <span className="inline-flex items-center gap-1">
              {hasStudents ? (
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              ) : (
                <Circle className="h-3 w-3 text-zinc-300" />
              )}
              Students added
            </span>
            <span className="inline-flex items-center gap-1">
              {hasAssignments ? (
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              ) : (
                <Circle className="h-3 w-3 text-zinc-300" />
              )}
              Assigned work
            </span>
          </div>
        </div>
        <Link
          href={nextStep.href}
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          {nextStep.cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

/* ─── Existing classroom grid ────────────────────────────── */

function ClassroomGrid({ classrooms }: { classrooms: Classroom[] }) {
  return (
    <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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
