import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Layers,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import LeveledViewer from "./_components/LeveledViewer";
import AssignLeveledButton from "./_components/AssignLeveledButton";

export const dynamic = "force-dynamic";

type Version = {
  level: "easy" | "on_level" | "advanced";
  grade: string;
  title: string;
  body: string;
  audio_url: string | null;
  question_ids: string[];
};

export default async function LeveledDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ passageId: string }>;
  searchParams: Promise<{ built?: string; warn?: string }>;
}) {
  const { passageId } = await params;
  const { built, warn } = await searchParams;
  const profile = await requireProfile();
  if (profile.role !== "educator") notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("differentiated_passages")
    .select("id, title, topic, base_grade, shared_image_url, versions, qc_overall")
    .eq("id", passageId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!data) notFound();
  const d = data as any;
  const versions = (d.versions ?? []) as Version[];

  // Pull comprehension questions for any version that has them.
  const allQids = versions.flatMap((v) => v.question_ids ?? []);
  let questionsByVersion: Record<string, { id: string; prompt: string; choices: string[]; correct: string; hint: string | null }[]> = {};
  if (allQids.length > 0) {
    const { data: qrows } = await supabase
      .from("custom_questions")
      .select("id, prompt, choices, correct, hint")
      .in("id", allQids);
    const byId = new Map(((qrows ?? []) as any[]).map((q) => [q.id, q]));
    for (const v of versions) {
      questionsByVersion[v.level] = (v.question_ids ?? [])
        .map((id) => byId.get(id))
        .filter(Boolean)
        .map((q: any) => ({
          id: q.id,
          prompt: q.prompt,
          choices: (q.choices ?? []) as string[],
          correct: String(q.correct),
          hint: q.hint ?? null,
        }));
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href="/classroom/leveled"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All leveled passages
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
            <Layers className="h-4 w-4" />
            Leveled passage
            {d.base_grade && (
              <>
                <span className="text-zinc-300">·</span>
                <span>Center: {d.base_grade}</span>
              </>
            )}
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {d.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
            {versions.length} version{versions.length === 1 ? "" : "s"} · same
            story, three reading levels
          </p>
        </div>
        <AssignLeveledButton passageId={passageId} defaultLevel="on_level" />
      </div>

      {built === "1" && warn && (
        <div className="mt-5 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
          <div>
            <div className="font-bold">Passage built — with warnings.</div>
            <div className="mt-0.5 text-xs">{warn}</div>
          </div>
        </div>
      )}
      {built === "1" && !warn && (
        <div className="mt-5 flex items-start gap-2 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 p-4 text-sm text-violet-900">
          <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-600" />
          <div>
            <div className="font-bold">Three versions ready.</div>
            <div className="mt-0.5 text-xs">
              Toggle between easy, on-level, and advanced below — same
              story, three reading levels.
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <LeveledViewer
          versions={versions}
          sharedImageUrl={d.shared_image_url}
          questionsByVersion={questionsByVersion}
        />
      </div>
    </div>
  );
}
