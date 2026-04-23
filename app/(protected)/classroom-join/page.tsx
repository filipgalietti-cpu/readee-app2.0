import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import JoinClassroomForm from "./JoinClassroomForm";
import type { Child } from "@/lib/db/types";

export const dynamic = "force-dynamic";

/**
 * Parent-side: enter a teacher's join code to add one of their children
 * to that classroom. Educators land here too but we bounce them to the
 * teacher dashboard since this flow doesn't apply.
 */
export default async function JoinClassroomPage() {
  const profile = await requireProfile();
  if (profile.role === "educator") redirect("/classroom");

  const supabase = await createClient();
  const { data: children } = await supabase
    .from("children")
    .select("id, first_name, grade")
    .eq("parent_id", profile.id)
    .order("created_at", { ascending: true });

  const list = (children ?? []) as Pick<Child, "id" | "first_name" | "grade">[];

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
        For parents
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        Join your child&apos;s classroom
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-slate-400">
        If your child&apos;s teacher is using Readee Classroom, they gave you a
        6-character code. Enter it below and pick which child is joining.
      </p>

      <div className="mt-8">
        {list.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-white px-6 py-10 text-center text-sm text-zinc-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
            Add a child profile first, then come back to join a class.
          </div>
        ) : (
          <JoinClassroomForm children={list} />
        )}
      </div>
    </div>
  );
}
