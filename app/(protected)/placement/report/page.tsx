import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { ReportStatic } from "../_components/reveal";
import type { PlacementResult } from "@/lib/placement/types";

/** /placement/report?child=<id> — the static, printable report (what "Skip to full report", "Not now" and the email land on). */
export default async function PlacementReportPage({ searchParams }: { searchParams: Promise<{ child?: string }> }) {
  const profile = await requireProfile();
  const { child: childId } = await searchParams;
  if (!childId) redirect("/dashboard");
  const supabase = await createClient();
  const { data: child } = await supabase.from("children").select("id, first_name, parent_id").eq("id", childId).eq("parent_id", profile.id).maybeSingle();
  if (!child) redirect("/dashboard");
  const { data: row } = await supabase
    .from("placements")
    .select("id, child_id, enrolled, decision, moments, plan, narration, passage_recording_path, duration_seconds, created_at")
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!row) redirect(`/placement?child=${childId}`);
  const r = row as Record<string, unknown>;
  const result: PlacementResult = {
    id: String(r.id),
    childId: String(r.child_id),
    childName: (((child as { first_name?: string | null }).first_name ?? "").split(" ")[0] || "Reader"),
    enrolled: Number(r.enrolled) as PlacementResult["enrolled"],
    decision: r.decision as PlacementResult["decision"],
    moments: (r.moments ?? []) as PlacementResult["moments"],
    plan: r.plan as PlacementResult["plan"],
    narration: (r.narration ?? []) as PlacementResult["narration"],
    passageRecordingPath: (r.passage_recording_path as string | null) ?? null,
    durationSeconds: Number(r.duration_seconds ?? 0),
    createdAt: String(r.created_at),
  };
  return <ReportStatic result={result} />;
}
