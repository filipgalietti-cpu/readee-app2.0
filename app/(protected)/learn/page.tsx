import { redirect, notFound } from "next/navigation";
import sampleLessons from "@/app/data/sample-lessons.json";
import { getUserPlan } from "@/lib/plan/check-access";
import { firstUnitDomainByGrade, isLessonInFreeUnit } from "@/lib/plan/free-lessons";
import { loadOwnedPlacementPlan } from "@/lib/placement/owned-plan";
import LearnClient from "./LearnClient";
import LessonV2Client from "./LessonV2Client";
import { v2LessonForStandard } from "@/lib/lessons/v2-lookup";
import PreviewLesson from "./PreviewLesson";

type SL = { standardId: string; grade: string; domain: string };

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
 * Free access includes the first catalogue unit in each grade and this child's
 * first placement unit. Ownership and the saved plan are checked on the server.
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

  // Browsing does not require a child. Only existing free catalogue units
  // can be previewed; ?preview=1 never bypasses a paid or owned-plan gate.
  if (sp.preview === "1") {
    const lesson = sampleLessons.find((item) => item.standardId === standardId);
    if (!lesson || !isLessonInFreeUnit(lesson, firstUnitDomainByGrade(sampleLessons))) notFound();
    const v2 = v2LessonForStandard(lesson.standardId);
    if (!v2) notFound();
    return <PreviewLesson lesson={v2} />;
  }

  if (standardId) {
    const lessons = sampleLessons as SL[];
    const lesson = lessons.find((l) => l.standardId === standardId);
    if (lesson) {
      const freeUnit = firstUnitDomainByGrade(lessons);
      if (!isLessonInFreeUnit(lesson, freeUnit)) {
        const placement = sp.child ? await loadOwnedPlacementPlan(sp.child) : null;
        placementStartUnlocked = isLessonInFreeUnit(lesson, freeUnit, placement?.firstUnit);
        const plan = await getUserPlan(); // effective: trial/paid -> "premium"
        if (!placementStartUnlocked && plan !== "premium") {
          redirect("/upgrade?reason=lesson");
        }
      }
    }
  }

  // V2 when the standard has an authored lesson; legacy otherwise.
  if (standardId) {
    const v2 = v2LessonForStandard(standardId);
    if (v2) return <LessonV2Client lesson={v2} />;
  }

  return <LearnClient placementStartUnlocked={placementStartUnlocked} />;
}
