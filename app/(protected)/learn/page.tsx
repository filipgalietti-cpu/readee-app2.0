import { redirect } from "next/navigation";
import sampleLessons from "@/app/data/sample-lessons.json";
import { getUserPlan } from "@/lib/plan/check-access";
import { firstUnitDomainByGrade, isLessonInFreeUnit } from "@/lib/plan/free-lessons";
import LearnClient from "./LearnClient";

type SL = { standardId: string; grade: string; domain: string };

/**
 * Server-side paywall gate for lessons.
 *
 * Free tier unlocks each grade's FIRST unit (its first-appearance domain);
 * everything past it is Readee+. LearnClient runs the same check client-side
 * for instant UX, but THIS is the enforcement the client can't skip — a
 * free/lapsed reader opening a premium lesson is redirected to /upgrade before
 * any UI renders. Trial + premium bypass (getUserPlan returns the EFFECTIVE
 * plan, so a reader inside the 7-day reverse trial resolves to "premium").
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

  return <LearnClient />;
}
