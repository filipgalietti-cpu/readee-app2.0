import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import RevealFlow from "../_components/RevealFlow";

/**
 * /placement/reveal?child=<id> — the show: celebration (child), hold-to-build
 * (the grown-up gate that is also the loading beat), then the card-by-card
 * reveal with the audio guide, ending in "Start <Name>'s plan".
 */
export default async function PlacementRevealPage({ searchParams }: { searchParams: Promise<{ child?: string }> }) {
  const profile = await requireProfile();
  const { child: childId } = await searchParams;
  if (!childId) redirect("/dashboard");
  const supabase = await createClient();
  const { data: child } = await supabase
    .from("children")
    .select("id, first_name, parent_id, equipped_items, carrots")
    .eq("id", childId)
    .eq("parent_id", profile.id)
    .maybeSingle();
  if (!child) redirect("/dashboard");
  const row = child as { id: string; first_name: string | null; equipped_items?: { outfit?: string | null } | null; carrots?: number | null };
  const { data: placement } = await supabase.from("placements").select("id").eq("child_id", row.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!placement) redirect(`/placement?child=${row.id}`);
  return (
    <RevealFlow
      childId={row.id}
      childName={(row.first_name ?? "").split(" ")[0] || "Reader"}
      outfitId={row.equipped_items?.outfit ?? null}
    />
  );
}
