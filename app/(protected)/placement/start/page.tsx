import Link from "next/link";
import { redirect } from "next/navigation";
import { loadOwnedPlacementPlan } from "@/lib/placement/owned-plan";
import { assignedJourneyCatalog } from "@/lib/journey/next-lesson";

/** The child's first activity in their saved plan. The /learn gate grants its unit free access. */
export default async function PlacementStartPage({ searchParams }: { searchParams: Promise<{ child?: string }> }) {
  const { child } = await searchParams;
  if (!child) redirect("/dashboard");
  let plan;
  try { plan = await loadOwnedPlacementPlan(child); }
  catch {
    return <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 p-8 text-center" role="alert">
      <p>Your results are saved, but we could not open the lesson. Please try again.</p>
      <a className="rounded-xl bg-violet-600 px-6 py-3 text-white" href={`/placement/start?child=${encodeURIComponent(child)}`}>Try again</a>
      <Link href="/dashboard">Return to dashboard</Link>
    </div>;
  }
  if (!plan) redirect(`/placement?child=${encodeURIComponent(child)}`);
  const lesson = assignedJourneyCatalog(null, plan).find((l) => l.grade === plan.firstUnit?.grade && l.domain === plan.firstUnit.domain);
  if (!lesson) redirect(`/journey?child=${encodeURIComponent(child)}`);
  redirect(`/learn?child=${encodeURIComponent(child)}&standard=${encodeURIComponent(lesson.standardId)}`);
}
