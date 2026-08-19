import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Wand2 } from "lucide-react";
import { requireProfile } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import LunaCreate from "../_components/LunaCreate";

export const dynamic = "force-dynamic";

/** Map a child's stored grade to a passage token ("K"/"1st"...). */
function gradeToken(g: string | null): string {
  const s = (g ?? "").toLowerCase();
  if (s.startsWith("1") || s.includes("first")) return "1st";
  if (s.startsWith("2") || s.includes("second")) return "2nd";
  if (s.startsWith("3") || s.includes("third")) return "3rd";
  if (s.startsWith("4") || s.includes("fourth")) return "4th";
  return "K";
}

/**
 * "Make a Story" — the premium prompt-to-passage flow. Open to everyone so
 * free users can pick a topic and see the magic pitch; the generation API
 * enforces the Readee+ gate (LunaCreate shows the upgrade CTA on 402).
 */
export default async function LunaCreatePage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const profile = await requireProfile();
  const { child: childIdParam } = await searchParams;
  const supabase = await createClient();

  let child: { id: string; name: string; grade: string | null } | null = null;
  const base = supabase
    .from("children")
    .select("id, first_name, grade, parent_id")
    .eq("parent_id", profile.id);
  const { data } = childIdParam
    ? await base.eq("id", childIdParam).maybeSingle()
    : await base.order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (data) {
    child = {
      id: (data as any).id,
      name: ((data as any).first_name ?? "").split(" ")[0] || "Reader",
      grade: (data as any).grade ?? null,
    };
  }
  if (!child) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-2xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/luna?child=${child.id}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-zinc-500 transition hover:text-violet-700 dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          Luna
        </Link>
        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
          <Wand2 className="h-4 w-4" />
          Make a Story
        </div>
      </div>

      <LunaCreate
        childId={child.id}
        childName={child.name}
        grade={gradeToken(child.grade)}
      />
    </div>
  );
}
