import { Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import { hasAnyPaidTier } from "@/lib/plan/teacher-gate";
import { createClient } from "@/lib/supabase/server";
import passagesJson from "@/app/data/fluency-passages.json";
import LunaReader from "./_components/LunaReader";

export const dynamic = "force-dynamic";

const PASSAGES = passagesJson as { grade: string; title: string; text: string }[];

/** Map a child's stored grade ("Kindergarten"/"1st"...) to a passage token ("K"/"1st"...). */
function gradeToken(g: string | null): string {
  const s = (g ?? "").toLowerCase();
  if (s.startsWith("1") || s.includes("first")) return "1st";
  if (s.startsWith("2") || s.includes("second")) return "2nd";
  if (s.startsWith("3") || s.includes("third")) return "3rd";
  if (s.startsWith("4") || s.includes("fourth")) return "4th";
  return "K";
}

export default async function LunaPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const profile = await requireProfile();
  if (!hasAnyPaidTier((profile as any).plan)) {
    redirect("/upgrade?reason=reading_buddy");
  }

  const { child: childIdParam } = await searchParams;
  const supabase = await createClient();

  // Load the named child (verified as this parent's), else the parent's first.
  let child: { id: string; name: string; grade: string | null } | null = null;
  const base = supabase.from("children").select("id, first_name, grade, parent_id").eq("parent_id", profile.id);
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

  if (!child) {
    // No reader yet — send them to set one up.
    redirect("/dashboard");
  }

  const token = gradeToken(child.grade);
  const passages = PASSAGES.filter((p) => p.grade === token);
  const usable = passages.length ? passages : PASSAGES.filter((p) => p.grade === "1st");

  return (
    <div className="mx-auto max-w-2xl px-6 py-6">
      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600">
          <Sparkles className="h-4 w-4" />
          Luna
        </div>
        <h1 className="mt-0.5 font-extrabold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Baloo 2','Nunito',sans-serif", fontSize: 26 }}>
          Hi, {child.name}!
        </h1>
      </div>

      <LunaReader childId={child.id} childName={child.name} passages={usable} />
    </div>
  );
}
