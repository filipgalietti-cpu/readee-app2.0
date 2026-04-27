import Link from "next/link";
import { notFound } from "next/navigation";
import { Layers, Sparkles, ArrowRight, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import AssetCardActions from "../_components/AssetCardActions";

export const dynamic = "force-dynamic";

export default async function LeveledHomePage() {
  const profile = await requireProfile();
  if (profile.role !== "educator") notFound();

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("differentiated_passages")
    .select(
      "id, title, topic, base_grade, shared_image_url, versions, updated_at, qc_overall",
    )
    .eq("teacher_id", profile.id)
    .order("updated_at", { ascending: false });

  const list = (rows ?? []) as {
    id: string;
    title: string;
    topic: string;
    base_grade: string | null;
    shared_image_url: string | null;
    versions: any[];
    updated_at: string;
    qc_overall: string;
  }[];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
            <Layers className="h-4 w-4" />
            Leveled passages
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Your differentiated passages
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
            One topic, three reading levels. Easy / on-level / advanced —
            same plot, different vocabulary. Assign the right version to
            each kid in a mixed-ability class.
          </p>
        </div>
        <Link
          href="/classroom/authoring/leveled-wizard"
          className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
        >
          <Sparkles className="h-4 w-4" />
          Build a leveled passage
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="mt-10 rounded-3xl border-2 border-dashed border-zinc-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
            <Layers className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
            One passage, every reader
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500 dark:text-slate-400">
            Type one topic. Get three versions of the SAME story at three
            reading levels. Drop each kid into the version that fits — no
            more retyping content for SPED + on-level + GT.
          </p>
          <Link
            href="/classroom/authoring/leveled-wizard"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            <Sparkles className="h-4 w-4" />
            Build with Readee.ai
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {list.map((p) => {
            const versionCount = Array.isArray(p.versions) ? p.versions.length : 0;
            return (
              <li key={p.id} className="relative">
                <AssetCardActions type="leveled" id={p.id} initialTitle={p.title} />
                <Link
                  href={`/classroom/leveled/${p.id}`}
                  className="block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40"
                >
                  {p.shared_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.shared_image_url}
                      alt=""
                      className="h-36 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-36 w-full items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-400 dark:from-indigo-950/40 dark:to-violet-950/40">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
                      Center: {p.base_grade ?? "?"}
                      <span className="text-zinc-300">·</span>
                      <span>{versionCount} levels</span>
                      {p.qc_overall === "warn" && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700">
                          Review
                        </span>
                      )}
                      {p.qc_overall === "fail" && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold text-red-700">
                          Failed QC
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 truncate text-sm font-bold text-zinc-900 dark:text-white">
                      {p.title}
                    </div>
                    <div className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-slate-400">
                      {p.topic}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
                      Open
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
