import { Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import { hasAnyPaidTier } from "@/lib/plan/teacher-gate";
import { createClient } from "@/lib/supabase/server";
import BuddyShell from "./_components/BuddyShell";

export const dynamic = "force-dynamic";

export default async function BuddyPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const profile = await requireProfile();
  if (!hasAnyPaidTier((profile as any).plan)) {
    redirect("/upgrade?reason=reading_buddy");
  }

  // If we got ?child=, fetch that kid so we can preload the system
  // prompt with name + grade + recent activity. Falls through to a
  // generic buddy when no child is named (e.g. teacher demoing).
  const { child: childId } = await searchParams;
  let child: { id: string; name: string; gradeLevel: string | null } | null = null;
  if (childId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("children")
      .select("id, name, reading_level, parent_id")
      .eq("id", childId)
      .maybeSingle();
    if (data && (data as any).parent_id === profile.id) {
      child = {
        id: (data as any).id,
        name: ((data as any).name ?? "").split(" ")[0] || "Reader",
        gradeLevel: (data as any).reading_level ?? null,
      };
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600">
        <Sparkles className="h-4 w-4" />
        Reading buddy
      </div>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        {child ? `Hi, ${child.name}!` : "Talk to Readee"}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        {child
          ? "What do you want to do today? Pick something below."
          : "Ask what a word means, get help reading, or hear a story."}
      </p>

      <div className="mt-6">
        <BuddyShell
          childId={child?.id ?? null}
          childName={child?.name ?? null}
          initialGradeLevel={child?.gradeLevel ?? null}
        />
      </div>
    </div>
  );
}
