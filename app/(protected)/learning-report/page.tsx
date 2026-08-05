import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import { hasAnyPaidTier } from "@/lib/plan/teacher-gate";
import { createClient } from "@/lib/supabase/server";
import { getLearnerModel } from "@/lib/adaptive/learner-model";
import { getLunaReport } from "@/lib/luna/report";
import LearningReport from "./_components/LearningReport";

export const dynamic = "force-dynamic";

export default async function LearningReportPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const profile = await requireProfile();
  if (!hasAnyPaidTier((profile as any).plan)) {
    redirect("/upgrade?reason=analytics");
  }

  const { child: childIdParam } = await searchParams;
  const supabase = await createClient();

  // Load the named child (verified as this parent's), else the parent's first.
  let child: { id: string; name: string } | null = null;
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
    };
  }

  if (!child) {
    redirect("/dashboard");
  }

  const [model, luna] = await Promise.all([
    getLearnerModel(supabase, child.id),
    getLunaReport(supabase, child.id),
  ]);

  return (
    <LearningReport name={child.name} childId={child.id} model={model} luna={luna} />
  );
}
