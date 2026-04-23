import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { getStudentSession } from "@/lib/auth/student-session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import SignOutButton from "./_components/SignOutButton";

export const dynamic = "force-dynamic";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getStudentSession();
  if (!session) redirect("/class");

  const admin = supabaseAdmin();

  const [{ data: childRaw }, { data: classroomRaw }] = await Promise.all([
    admin
      .from("children")
      .select("id, first_name, owner_type, owner_classroom_id, grade, carrots")
      .eq("id", session.childId)
      .maybeSingle(),
    admin
      .from("classrooms")
      .select("id, name, grade_level, archived_at")
      .eq("id", session.classroomId)
      .maybeSingle(),
  ]);

  if (!childRaw || !classroomRaw) redirect("/class");
  const child = childRaw as {
    id: string;
    first_name: string;
    owner_type: string;
    owner_classroom_id: string | null;
    grade: string | null;
    carrots: number;
  };
  const classroom = classroomRaw as {
    id: string;
    name: string;
    grade_level: string | null;
    archived_at: string | null;
  };

  if (
    child.owner_type !== "classroom" ||
    child.owner_classroom_id !== classroom.id ||
    classroom.archived_at
  ) {
    redirect("/class");
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-indigo-50/40 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <Link href="/student" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-extrabold text-white">
              R
            </div>
            <div className="text-sm font-extrabold text-zinc-900 dark:text-white">
              Readee
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-extrabold text-zinc-900 dark:text-white">
                {child.first_name}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-slate-400">
                {classroom.name}
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-6">{children}</main>
    </div>
  );
}
