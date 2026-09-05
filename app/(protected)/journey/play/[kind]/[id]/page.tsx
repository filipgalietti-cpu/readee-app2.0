import { notFound, redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import { LESSONS } from "@/app/data/lessons-v2";
import { QUIZZES } from "@/app/data/quizzes-v2";
import { WARMUPS } from "@/app/data/warmups-v2";
import { journeyCatalog } from "@/lib/journey-v2/catalog";
import { locateItem } from "@/lib/journey-v2/items";
import { loadJourney } from "@/lib/journey-v2/load";
import type { ItemKind } from "@/lib/journey-v2/types";
import JourneyPlay from "../../_components/JourneyPlay";

const KINDS: ItemKind[] = ["warmup", "lesson", "quiz", "exam", "final"];

/**
 * /journey/play/<kind>/<id>?child=<id> — play one step of the child's V2
 * journey. This is the server-side gate the client cannot skip: the child
 * must be the caller's, the item must exist on the roadmap, and it must be on
 * the child's plan (the prescribed free unit, or Readee+). Everything else
 * redirects before any runner renders.
 */
export default async function JourneyPlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string; id: string }>;
  searchParams: Promise<{ child?: string }>;
}) {
  const profile = await requireProfile();
  const { kind: rawKind, id: rawId } = await params;
  const { child: childParam } = await searchParams;
  const kind = rawKind as ItemKind;
  const id = decodeURIComponent(rawId);
  if (!KINDS.includes(kind)) notFound();

  const loaded = await loadJourney({ parentId: profile.id, childId: childParam ?? null });
  if (!loaded) redirect("/dashboard");
  const where = locateItem(kind, id);
  if (!where) notFound();

  const { view, child } = loaded;
  const onPlan = view.fullAccess || (where.unitId === view.prescribedUnitId && kind !== "final");
  if (!onPlan) redirect(`/upgrade?reason=journey&child=${child.id}`);

  const def = kind === "lesson" ? LESSONS[id]?.lesson : kind === "warmup" ? WARMUPS[id] : QUIZZES[id];
  if (!def) notFound();
  const unit = journeyCatalog().find((u) => u.id === where.unitId);
  const unitName = unit ? `${unit.grade} · ${unit.name}` : "";

  return (
    <JourneyPlay
      kind={kind}
      def={def}
      childId={child.id}
      childName={child.firstName}
      outfitId={child.outfitId}
      unitName={unitName}
      difficulty={view.difficulty}
    />
  );
}
