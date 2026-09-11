import { redirect } from "next/navigation";
import { loadJourneySnapshot } from "@/lib/journey/load.server";
import { hasLegacyLessonAllowance } from "@/lib/journey/lesson-access";
import LegacyLessonClient from "./LegacyLessonClient";
/** Legacy library links cannot bypass the new account's sample allowance. */
export default async function LessonPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const { child } = await searchParams;
  const snapshot = await loadJourneySnapshot(child);
  if (!snapshot) redirect("/placement/setup");
  if (!snapshot.billing.fullAccess && !hasLegacyLessonAllowance(snapshot.billing.signupAt))
    redirect(`/journey?child=${snapshot.child.id}`);
  return <LegacyLessonClient />;
}
