import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import LunaCreate from "./_components/LunaCreate";

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
 * Luna — one page. The AI reading tutor: tick what you want, Luna writes a
 * story you can actually read at your level, then coaches you through reading
 * it out loud (orb + Azure). No hub, no menu.
 */
export default async function LunaPage({
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

  // "My Readings" keepsake — the child's recent generated stories, re-readable.
  const { data: readingRows } = await supabase
    .from("child_ai_content")
    .select("id, title, passage_text, phonics_pattern")
    .eq("child_id", child.id)
    .eq("kind", "luna_reading")
    .order("created_at", { ascending: false })
    .limit(8);
  const readings = ((readingRows ?? []) as any[]).map((r) => ({
    id: r.id as string,
    title: (r.title as string) || "Your story",
    text: r.passage_text as string,
    patternLabel: (r.phonics_pattern as string) || null,
  }));

  return (
    <div className="mx-auto min-h-[calc(100dvh-72px)] max-w-2xl px-6 pt-8 pb-28">
      <LunaCreate
        childId={child.id}
        childName={child.name}
        grade={gradeToken(child.grade)}
        readings={readings}
      />
    </div>
  );
}
