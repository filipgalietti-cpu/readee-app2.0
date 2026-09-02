import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { synthesizeChildNamePack } from "@/lib/audio/child-greeting";
import { bandFromGrade } from "@/lib/placement/decide";
import PlacementRunner from "./_components/PlacementRunner";

/**
 * /placement?child=<id> — the reading placement (Fulcrum's front door). Loads
 * the named child (verified as this parent's), kicks off the child's name-pack
 * clips if they do not exist yet, and mounts the runner full screen. A child
 * who already has a placement goes to the reveal instead; add ?retake=1 to
 * run it again.
 */
export default async function PlacementPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string; retake?: string; robot?: string }>;
}) {
  const profile = await requireProfile();
  const { child: childIdParam, retake, robot } = await searchParams;
  const robotMode = robot === "1" && process.env.NEXT_PUBLIC_PLACEMENT_ROBOT === "1";
  const supabase = await createClient();

  const base = supabase
    .from("children")
    .select("id, first_name, grade, reading_level, parent_id, equipped_items")
    .eq("parent_id", profile.id);
  const { data } = childIdParam
    ? await base.eq("id", childIdParam).maybeSingle()
    : await base.order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (!data) redirect("/dashboard");
  const row = data as { id: string; first_name: string | null; grade: string | null; equipped_items?: { outfit?: string | null } | null };

  if (retake !== "1") {
    const { data: existing } = await supabase
      .from("placements")
      .select("id")
      .eq("child_id", row.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existing) redirect(`/placement/reveal?child=${row.id}`);
  }

  const firstName = (row.first_name ?? "").split(" ")[0] || "Reader";
  // Fire-and-forget: the greeting clips that say the child's name. Usually
  // already there from signup; the runner falls back to generic clips if not.
  void synthesizeChildNamePack(row.id, firstName);

  return (
    <PlacementRunner
      childId={row.id}
      childName={firstName}
      enrolled={bandFromGrade(row.grade)}
      outfitId={row.equipped_items?.outfit ?? null}
      robot={robotMode}
    />
  );
}
