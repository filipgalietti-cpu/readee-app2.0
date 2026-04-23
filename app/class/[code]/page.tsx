import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import StudentNamePicker from "./_components/StudentNamePicker";

export const dynamic = "force-dynamic";

type ClassroomLookup = {
  id: string;
  name: string;
  grade_level: string | null;
  archived_at: string | null;
};

type StudentTile = {
  id: string;
  first_name: string;
};

export default async function ClassCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) notFound();

  const admin = supabaseAdmin();

  const { data: classroom } = await admin
    .from("classrooms")
    .select("id, name, grade_level, archived_at")
    .eq("join_code", code)
    .maybeSingle();

  if (!classroom) notFound();
  const c = classroom as ClassroomLookup;
  if (c.archived_at) {
    return (
      <CenteredMessage
        title="This class was archived"
        body="Ask your teacher for the new class code."
      />
    );
  }

  const { data: students } = await admin
    .from("children")
    .select("id, first_name")
    .eq("owner_classroom_id", c.id)
    .eq("owner_type", "classroom")
    .order("first_name", { ascending: true });

  const tiles = (students ?? []) as StudentTile[];

  return (
    <div className="mx-auto min-h-[100dvh] max-w-4xl px-5 py-10">
      <div className="text-center">
        <div className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
          {c.grade_level ? `${c.grade_level} · ` : ""}Class sign-in
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {c.name}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
          Tap your name to start.
        </p>
      </div>

      {tiles.length === 0 ? (
        <div className="mt-10 rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-sm text-zinc-500 dark:text-slate-400">
            Your teacher hasn&apos;t added student names yet. Check back soon.
          </p>
        </div>
      ) : (
        <div className="mt-8">
          <StudentNamePicker code={code} classroomId={c.id} students={tiles} />
        </div>
      )}

      <div className="mt-10 text-center text-xs text-zinc-400">
        Wrong class?{" "}
        <Link href="/class" className="font-semibold text-indigo-600 underline">
          Enter a different code
        </Link>
      </div>
    </div>
  );
}

function CenteredMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto min-h-[100dvh] max-w-md px-5 py-16 text-center">
      <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        {title}
      </h1>
      <p className="mt-3 text-sm text-zinc-500 dark:text-slate-400">{body}</p>
    </div>
  );
}
