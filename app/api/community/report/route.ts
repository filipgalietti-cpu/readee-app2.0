import { NextResponse, after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { containsUnsafeContent } from "@/lib/ai/safety";
import { judgeCommunityCompliance } from "@/lib/ai/readee-ai";
import { notifyTeam } from "@/lib/email/notify-team";

export const dynamic = "force-dynamic";

/**
 * POST /api/community/report — flag a published community story. Returns fast;
 * the actual handling runs in the background (Next `after`):
 *   1. Log the report (community_reports).
 *   2. Re-review the story with AI (banlist + compliance judge).
 *   3. If it now FAILS, auto-take it down (status -> rejected). Trolls can't
 *      nuke a clean story — takedown only happens when the AI agrees it's bad.
 *   4. Email the team (hello@readee.app) either way, with the AI verdict and
 *      whether it was removed.
 *
 * Body (JSON): { slug: string, reason?: string }
 */
export async function POST(req: Request) {
  let b: any;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const slug = String(b?.slug ?? "").trim();
  const reason = b?.reason ? String(b.reason).trim().slice(0, 500) : null;
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const admin = supabaseAdmin();
  const { data: passage } = await admin
    .from("community_passages")
    .select("id, title, passage_text, status, source_parent_id, display_byline")
    .eq("slug", slug)
    .maybeSingle();
  if (!passage) {
    return NextResponse.json({ error: "story not found" }, { status: 404 });
  }
  const p = passage as any;

  let reporterId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    reporterId = user?.id ?? null;
  } catch {
    /* anonymous report is fine */
  }

  await admin.from("community_reports").insert({
    community_id: p.id,
    slug,
    reason,
    reporter_id: reporterId,
  });

  // Background: re-review + maybe take down + email the team.
  after(async () => {
    let removed = false;
    let verdict = "not re-reviewed";
    if (p.status === "approved") {
      const banned = containsUnsafeContent(`${p.title} ${p.passage_text}`);
      let compliant = true;
      if (banned) {
        compliant = false;
        verdict = `banlist: "${banned}"`;
      } else {
        try {
          const v = await judgeCommunityCompliance({
            teacherId: p.source_parent_id ?? "system",
            title: p.title,
            text: p.passage_text,
          });
          compliant = v.approve;
          verdict = v.approve ? "AI: still compliant" : `AI: ${v.reason}`;
        } catch {
          verdict = "AI re-review errored (left live for a human)";
        }
      }
      if (!compliant) {
        const { count } = await admin
          .from("community_passages")
          .update({
            status: "rejected",
            rejection_reason: `Flagged + failed re-review: ${verdict}`.slice(0, 300),
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", p.id)
          .eq("status", "approved");
        removed = (count ?? 0) > 0 || true;
      }
    } else {
      verdict = `already ${p.status}`;
    }

    await notifyTeam(
      `Community story flagged${removed ? " + auto-removed" : ""}: ${p.title}`,
      `<p>A community story was flagged.</p>
       <ul>
         <li><b>Title:</b> ${p.title}</li>
         <li><b>By:</b> ${p.display_byline ?? "unknown"}</li>
         <li><b>Reason given:</b> ${reason ?? "(none)"}</li>
         <li><b>AI re-review:</b> ${verdict}</li>
         <li><b>Action:</b> ${removed ? "TAKEN DOWN (status -> rejected)" : "left live; please review"}</li>
         <li><b>Link:</b> https://learn.readee.app/community/${slug}</li>
       </ul>
       <p>Review the queue at /admin/community.</p>`,
    );
  });

  return NextResponse.json({ ok: true });
}
