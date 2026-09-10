import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import { bandFromGrade } from "@/lib/placement/decide";
import AssessmentHandoff from "../_components/AssessmentHandoff";

export default async function ReaderHandoff({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const parent = await requireProfile();
  const { child: childId } = await searchParams;
  if (!childId) redirect("/dashboard");
  const supabase = await createClient();
  const { data: child, error } = await supabase
    .from("children")
    .select("id, first_name, grade")
    .eq("id", childId)
    .eq("parent_id", parent.id)
    .maybeSingle();
  if (error) throw new Error("Could not load the reader handoff.");
  if (!child) redirect("/dashboard");
  const band = bandFromGrade(child.grade);
  return (
    <AssessmentHandoff
      name={child.first_name?.trim() || "Reader"}
      gradeLabel={band === 0 ? "Kindergarten" : `Grade ${band}`}
      startHref={`/placement?child=${encodeURIComponent(child.id)}`}
    />
  );
}
