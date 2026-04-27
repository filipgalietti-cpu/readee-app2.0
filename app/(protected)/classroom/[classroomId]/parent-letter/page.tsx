import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import ParentLetterEditor from "./_components/ParentLetterEditor";

export const dynamic = "force-dynamic";

export default async function ParentLetterPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;
  const profile = await requireProfile();
  if (profile.role !== "educator") notFound();

  const supabase = await createClient();
  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id, name, grade_level")
    .eq("id", classroomId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!classroom) notFound();
  const c = classroom as any;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={`/classroom/${classroomId}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {c.name}
      </Link>

      <div className="mt-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
          <Sparkles className="h-4 w-4" />
          Readee.ai
        </div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Weekly parent letter
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
          Draft a warm weekly update for families. Hit Translate to send the
          same message to families in their language.
        </p>
      </div>

      <div className="mt-6">
        <ParentLetterEditor classroomId={classroomId} />
      </div>
    </div>
  );
}
