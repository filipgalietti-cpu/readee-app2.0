import { supabaseAdmin } from "@/lib/supabase/admin";
import { BASE_URL } from "@/lib/email/lifecycle";
import { PRICING } from "@/lib/billing-copy";

/**
 * One announcement, four different asks.
 *
 * ‼️ The football email sold 32 cosmetic outfits to 106 families, about 67 of
 * whom had added a child and never taken the reading check. For most of the
 * list the message was "there are new hats", sent to someone who had not yet
 * seen what the product does. It was the right email to five people.
 *
 * Filip, 19 Sep 2026: "Lets align it to our pricing, our paywall, and our
 * product."
 *
 * The alignment is already in the product, the email just never drew it:
 * costumes cost carrots, carrots come from reading, reading is lessons, and
 * lessons meet the paywall after the third one. So the same news carries a
 * different closing line and a different button depending on how far the family
 * has actually got. Every email moves a parent exactly one step, and nobody is
 * shown a price before they have seen a report.
 */

export type FamilyStage = "unassessed" | "assessed" | "reading" | "paying";

export type StageAsk = {
  /** A sentence joining the news to this family's next step. */
  line: string;
  ctaLabel: string;
  ctaHref: string;
};

export type AudienceMember = { parentId: string; email: string; stage: FamilyStage; childId: string | null };

/** Where a family is, from what they have actually done. Pure, so it can be tested. */
export function stageOf(input: {
  plan: string | null;
  childIds: string[];
  assessed: Set<string>;
  withLesson: Set<string>;
}): { stage: FamilyStage; childId: string | null } {
  const first = input.childIds[0] ?? null;
  if (input.plan === "premium") return { stage: "paying", childId: first };
  const assessedChild = input.childIds.find((id) => input.assessed.has(id)) ?? null;
  if (!assessedChild) return { stage: "unassessed", childId: first };
  if (!input.childIds.some((id) => input.withLesson.has(id))) return { stage: "assessed", childId: assessedChild };
  return { stage: "reading", childId: assessedChild };
}

/**
 * Every opted-in, reachable family and where they are. Four queries for the
 * whole list rather than four per parent, since this runs once for the preview
 * and again for the send.
 */
export async function loadAudience(isDeliverable: (email: string | null) => boolean): Promise<AudienceMember[]> {
  const admin = supabaseAdmin();
  const [{ data: parents }, { data: kids }, { data: placed }, { data: progress }] = await Promise.all([
    admin.from("profiles").select("id, email, plan").eq("email_weekly_digest", true).not("email", "is", null),
    admin.from("children").select("id, parent_id").order("created_at"),
    admin.from("placements").select("child_id"),
    admin.from("lessons_progress").select("child_id"),
  ]);
  const byParent = new Map<string, string[]>();
  for (const k of (kids ?? []) as { id: string; parent_id: string }[]) {
    byParent.set(k.parent_id, [...(byParent.get(k.parent_id) ?? []), k.id]);
  }
  const assessed = new Set(((placed ?? []) as { child_id: string }[]).map((r) => r.child_id));
  const withLesson = new Set(((progress ?? []) as { child_id: string }[]).map((r) => r.child_id));

  return ((parents ?? []) as { id: string; email: string | null; plan: string | null }[])
    .filter((p) => isDeliverable(p.email))
    .map((p) => ({
      parentId: p.id,
      email: p.email as string,
      ...stageOf({ plan: p.plan, childIds: byParent.get(p.id) ?? [], assessed, withLesson }),
    }));
}

export function countByStage(audience: AudienceMember[]): Record<FamilyStage, number> {
  const counts: Record<FamilyStage, number> = { unassessed: 0, assessed: 0, reading: 0, paying: 0 };
  for (const m of audience) counts[m.stage]++;
  return counts;
}

/** What this family is asked to do, given the announcement's own button as the fallback. */
export function askFor(
  stage: FamilyStage,
  childId: string | null,
  fallback: { ctaLabel: string; ctaHref: string },
): StageAsk {
  const child = childId ? `?child=${childId}` : "";
  switch (stage) {
    case "unassessed":
      return {
        line: "Your child earns these by reading, and it starts with a free ten minute reading check. No card.",
        ctaLabel: "Start Reading Assessment",
        ctaHref: childId ? `${BASE_URL}/placement/ready${child}` : `${BASE_URL}/placement/setup`,
      };
    case "assessed":
      return {
        line: "Your child's reading plan is ready, and the first three lessons are free. Every lesson earns carrots.",
        ctaLabel: "Open the first lesson",
        ctaHref: `${BASE_URL}/journey${child}`,
      };
    case "reading":
      return {
        line: `Keep the reading going: Readee+ opens every lesson, and the first ${PRICING.trialDays} days are $0.`,
        ctaLabel: `Start ${PRICING.trialDays} days free`,
        ctaHref: `${BASE_URL}/upgrade`,
      };
    case "paying":
      return { line: "", ctaLabel: fallback.ctaLabel, ctaHref: fallback.ctaHref };
  }
}
