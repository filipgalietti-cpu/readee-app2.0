import { redirect, notFound } from "next/navigation";
import sampleLessons from "@/app/data/sample-lessons.json";
import { loadJourneySnapshot } from "@/lib/journey/load.server";
import { freeJourneyLesson } from "@/lib/journey/lesson-access";
import { previewLessons } from "@/lib/lessons/preview-catalog";
import LearnClient from "./LearnClient";
import LessonV2Client from "./LessonV2Client";
import { v2LessonForStandard } from "@/lib/lessons/v2-lookup";
import PreviewLesson from "./PreviewLesson";


/**
 * Server-side paywall gate, and the choice of lesson engine.
 *
 * Two engines run side by side. V2 (app/components/lesson-v2) is the authored
 * scene-based lesson and covers 181 of the 201 catalogue standards - all of
 * grades 1-3, most of K, half of grade 4. The remaining 20 have no V2 lesson
 * written yet and keep the legacy runner, so nothing regresses while the factory
 * finishes them; as each one lands, this route picks it up with no code change.
 *
 * The lookup happens HERE, on the server, and one lesson crosses to the client
 * as a prop. The V2 registry imports all 184 lessons - 7.9 MB - so a client-side
 * lookup would ship the whole catalogue to render one lesson.
 *
 * Free access uses the shared journey allowance for this parent's account. Ownership and the saved plan are checked on the server.
 * The legacy runner receives that authorization to keep its client gate aligned.
 */
export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ standard?: string; child?: string; preview?: string }>;
}) {
  const sp = await searchParams;
  const standardId = sp.standard ?? null;
  let placementStartUnlocked = false;

  // Browsing does not require a child. Only the five Explore samples
  // can be previewed; ?preview=1 never bypasses a paid or owned-plan gate.
  if (sp.preview === "1") {
    const lesson = previewLessons.find((item) => item.standardId === standardId);
    if (!lesson) notFound();
    const v2 = v2LessonForStandard(lesson.standardId);
    if (!v2) notFound();
    return <PreviewLesson lesson={v2} />;
  }

  if (!standardId || !sampleLessons.some(lesson => lesson.standardId === standardId)) notFound();
  const snapshot = await loadJourneySnapshot(sp.child);
  if (!snapshot) redirect("/placement/setup");
  if (!sp.child) redirect(`/learn?child=${snapshot.child.id}&standard=${encodeURIComponent(standardId)}`);
  const lesson = sampleLessons.find(item => item.standardId === standardId)!;
  placementStartUnlocked = freeJourneyLesson({ lesson, signupAt: snapshot.billing.signupAt, readingLevel: snapshot.child.reading_level ?? null, placement: snapshot.result?.plan });
  if (!snapshot.billing.fullAccess && !placementStartUnlocked) redirect(`/journey?child=${snapshot.child.id}&locked=${encodeURIComponent(standardId)}`);

  // V2 when the standard has an authored lesson; legacy otherwise.
  if (standardId) {
    const v2 = v2LessonForStandard(standardId);
    if (v2) return <LessonV2Client lesson={v2} />;
  }

  return <LearnClient placementStartUnlocked={placementStartUnlocked} />;
}
