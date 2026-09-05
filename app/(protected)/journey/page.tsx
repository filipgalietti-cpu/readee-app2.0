import { requireProfile } from "@/lib/auth/helpers";
import { loadJourney } from "@/lib/journey-v2/load";
import LegacyJourney from "./LegacyJourney";
import JourneyV2 from "./_components/JourneyV2";

/**
 * /journey — the child's reading journey.
 *
 * V2 spine (K-2 content today): the roadmap walked from the placed band, one
 * unit at a time, free = the prescribed unit, Readee+ = every unit. A child
 * whose walk would start above the V2 content (3rd, 4th) stays on the legacy
 * catalog journey until the factory lands those grades. `?legacy=1` shows the
 * legacy map for anyone (the "more lessons" catalog past the V2 units).
 */
export default async function JourneyPage({ searchParams }: { searchParams: Promise<{ child?: string; legacy?: string }> }) {
  const profile = await requireProfile();
  const { child, legacy } = await searchParams;
  if (legacy === "1") return <LegacyJourney />;
  const loaded = await loadJourney({ parentId: profile.id, childId: child ?? null });
  if (!loaded || !loaded.isV2Journey) return <LegacyJourney />;
  return <JourneyV2 view={loaded.view} child={loaded.child} hasPlacement={loaded.hasPlacement} />;
}
