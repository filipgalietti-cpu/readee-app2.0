import Link from "next/link";
import { notFound } from "next/navigation";
import { GraduationCap, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import InviteClaimForm from "./_components/InviteClaimForm";

export const dynamic = "force-dynamic";

type InviteLookup = {
  invite_id: string;
  classroom_id: string;
  classroom_name: string;
  teacher_email: string;
  student_first_name: string;
  student_last_initial: string | null;
  parent_email: string | null;
  status: "pending" | "joined" | "revoked";
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: invite } = await supabase
    .rpc("get_invite_by_token", { p_token: token })
    .maybeSingle();

  if (!invite) notFound();
  const inv = invite as InviteLookup;

  const studentDisplay = inv.student_last_initial
    ? `${inv.student_first_name} ${inv.student_last_initial}.`
    : inv.student_first_name;
  const teacherDisplay = teacherDisplayFromEmail(inv.teacher_email);

  if (inv.status === "revoked") {
    return (
      <StatusShell
        title="This invite was revoked"
        body={`${teacherDisplay} no longer has an active invite for ${studentDisplay}. Reach out to your teacher if you think this is a mistake.`}
      />
    );
  }
  if (inv.status === "joined") {
    return (
      <StatusShell
        title="Already connected"
        body={`${studentDisplay} is already in ${inv.classroom_name}. Head to the dashboard to keep reading.`}
        ctaHref="/dashboard"
        ctaLabel="Go to dashboard"
      />
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const nextPath = encodeURIComponent(`/invite/${token}`);
    const emailPrefill = inv.parent_email ? `&email=${encodeURIComponent(inv.parent_email)}` : "";
    return (
      <Shell
        teacherDisplay={teacherDisplay}
        classroomName={inv.classroom_name}
        studentDisplay={studentDisplay}
      >
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-sm text-zinc-700 dark:text-slate-300">
            Sign in or create a free Readee account to connect{" "}
            <strong>{studentDisplay}</strong> to this class.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link
              href={`/login?redirect=${nextPath}${emailPrefill}`}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Sign in
            </Link>
            <Link
              href={`/signup?redirect=${nextPath}${emailPrefill}`}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <UserPlus className="h-4 w-4" />
              Create account
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  const { data: children } = await supabase
    .from("children")
    .select("id, first_name, grade")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: true });

  return (
    <Shell
      teacherDisplay={teacherDisplay}
      classroomName={inv.classroom_name}
      studentDisplay={studentDisplay}
    >
      <InviteClaimForm
        token={token}
        studentFirstName={inv.student_first_name}
        children={(children ?? []) as { id: string; first_name: string; grade: string | null }[]}
      />
    </Shell>
  );
}

function Shell({
  teacherDisplay,
  classroomName,
  studentDisplay,
  children,
}: {
  teacherDisplay: string;
  classroomName: string;
  studentDisplay: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-xl px-5 py-12">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
          <GraduationCap className="h-5 w-5" />
        </span>
        <div className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
          Classroom invite
        </div>
      </div>
      <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        {teacherDisplay} invited {studentDisplay} to {classroomName}
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-slate-400">
        Connect {studentDisplay}&apos;s Readee profile below. Once linked,
        {" "}
        {studentDisplay} will see assignments from this class on their
        dashboard.
      </p>
      {children}
    </div>
  );
}

function StatusShell({
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-xl px-5 py-16 text-center">
      <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        {title}
      </h1>
      <p className="mt-3 text-sm text-zinc-500 dark:text-slate-400">{body}</p>
      {ctaHref && ctaLabel && (
        <Link
          href={ctaHref}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}

function teacherDisplayFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  const pretty = local
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
  return pretty || "Your teacher";
}
