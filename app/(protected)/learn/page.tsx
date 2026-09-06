import { redirect } from "next/navigation";
import sampleLessons from "@/app/data/sample-lessons.json";
import { getUserPlan } from "@/lib/plan/check-access";
import { firstUnitDomainByGrade, isLessonInFreeUnit } from "@/lib/plan/free-lessons";
import LearnClient from "./LearnClient";
import LessonV2Client from "./LessonV2Client";
import { v2LessonForStandard } from "@/lib/lessons/v2-lookup";

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
 * The paywall below is unchanged and deliberately runs first: it keys off the
 * standard, so it gates both engines identically.
 *
 * Free tier unlocks each grade's FIRST unit (its first-appearance domain);
 * everything past it is Readee+. LearnClient runs the same check client-side
 * for instant UX, but THIS is the enforcement the client can't skip — a
 * free/lapsed reader opening a premium lesson is redirected to /upgrade before
 * any UI renders. Trial + premium bypass (getUserPlan returns the EFFECTIVE
 * plan, so a reader inside the reverse trial resolves to "premium").
 */
export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ standard?: string; child?: string }>;
}) {
  const sp = await searchParams;
  const standardId = sp.standard ?? null;

  if (standardId) {
    const lessons = sampleLessons as SL[];
    const lesson = lessons.find((l) => l.standardId === standardId);
    if (lesson) {
      const freeUnit = firstUnitDomainByGrade(lessons);
      if (!isLessonInFreeUnit(lesson, freeUnit)) {
        const plan = await getUserPlan(); // effective: trial/paid -> "premium"
        if (plan && plan !== "premium") {
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

  return <LearnClient />;
}
