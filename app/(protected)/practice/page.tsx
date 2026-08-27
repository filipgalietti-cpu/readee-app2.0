import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getUserPlan } from "@/lib/plan/check-access";
import { getLimits } from "@/lib/plan/limits";
import PracticeClient from "./PracticeClient";

/**
 * Server-side paywall gate for standalone practice.
 *
 * PracticeClient also checks this client-side for instant UX (no flash), but
 * THIS is the enforcement the client can't skip: a free/lapsed reader who is
 * past the practicePerStandard cap is redirected here before any practice UI
 * renders, and the count runs with the service-role client so it can't be
 * spoofed by disabling JS or calling routes directly.
 *
 * Bypass rules mirror the client exactly:
 *  - Trial + premium pass (getUserPlan returns the EFFECTIVE plan, so a reader
 *    inside the 7-day reverse trial resolves to "premium").
 *  - Post-lesson quizzes (from=lesson) are never gated — a free kid replaying a
 *    lesson must not get bounced to /upgrade mid-quiz.
 *  - Only counts when the child belongs to the signed-in parent.
 */
export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string; standard?: string; from?: string }>;
}) {
  const sp = await searchParams;
  const childId = sp.child ?? null;
  const standardId = sp.standard ?? null;
  const fromLesson = sp.from === "lesson";

  if (childId && standardId && !fromLesson) {
    const plan = await getUserPlan(); // effective plan: trial/paid -> "premium"
    if (plan && plan !== "premium") {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const admin = supabaseAdmin();
        // Verify the child is this parent's before gating on their counts.
        const { data: kid } = await admin
          .from("children")
          .select("parent_id")
          .eq("id", childId)
          .maybeSingle();
        if (kid && (kid as { parent_id: string }).parent_id === user.id) {
          // Sum attempts across ALL sessions (one row per session, no upsert).
          const { data: rows } = await admin
            .from("practice_results")
            .select("questions_attempted")
            .eq("child_id", childId)
            .eq("standard_id", standardId);
          const attempted = (rows ?? []).reduce(
            (sum, r) => sum + (Number((r as { questions_attempted: number }).questions_attempted) || 0),
            0,
          );
          if (attempted >= getLimits(plan).practicePerStandard) {
            redirect("/upgrade?reason=practice");
          }
        }
      }
    }
  }

  return <PracticeClient />;
}
