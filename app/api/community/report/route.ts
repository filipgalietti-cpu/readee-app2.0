import { NextResponse, after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { containsUnsafeContent } from "@/lib/ai/safety";
import { judgeCommunityCompliance } from "@/lib/ai/readee-ai";
import { notifyTeam } from "@/lib/email/notify-team";
import { rateLimit, clientIp } from "@/lib/security/rate-limit";
import { normalizeReportReason, shouldEmailReport } from "@/lib/community/report-policy";

export const dynamic = "force-dynamic";

// Escape kid/attacker-controlled text before it lands in the moderation email
// HTML. `reason` is fully user-supplied and the endpoint is anonymous, so an
// unescaped <a>/<style> could spoof the very email an admin uses to decide
// takedowns.
function esc(s: unknown): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

/**
 * POST /api/community/report — flag a published community story. Returns fast;
 * the actual handling runs in the background (Next `after`):
 *   1. Log the report (community_reports).
 *   2. Re-review the story with AI (banlist + compliance judge).
 *   3. If it now FAILS, auto-take it down (status -> rejected). Trolls can't
 *      nuke a clean story — takedown only happens when the AI agrees it's bad.
 *   4. Store the verdict on the report (the /admin/community Flagged tab) and
 *      email the team only when a person can act on it: a takedown, an AI
 *      verdict that no longer passes, a review that could not run, or a reader
 *      who said what was wrong. A bare anonymous tap on a story the AI still
 *      passes is queue-only (Sep 16 2026: a crawler flagged a featured story).
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
  const reason = normalizeReportReason(b?.reason);
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  // Anonymous reports are allowed by design, so throttle per IP — each report
  // triggers a paid AI re-review + a team email; looping slugs would flood
  // both. Silent-ok (return ok) so it isn't a probe oracle.
  const rl = await rateLimit({ bucket: "community-report", key: clientIp(req), limit: 10, windowMs: 3600_000 });
  if (!rl.ok) return NextResponse.json({ ok: true });

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

  const { data: inserted } = await admin
    .from("community_reports")
    .insert({
      community_id: p.id,
      slug,
      reason,
      reporter_id: reporterId,
    })
    .select("id")
    .maybeSingle();
  const reportId = (inserted as { id?: string } | null)?.id ?? null;

  // Background: re-review + maybe take down + record + maybe email the team.
  after(async () => {
    let removed = false;
    let compliant = true;
    let errored = false;
    let verdict = "not re-reviewed";
    if (p.status === "approved") {
      const banned = containsUnsafeContent(`${p.title} ${p.passage_text}`);
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
          errored = true;
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

    if (reportId) {
      await admin
        .from("community_reports")
        .update({ verdict: verdict.slice(0, 300), removed, reviewed_at: new Date().toISOString() })
        .eq("id", reportId);
    }

    if (!shouldEmailReport({ removed, compliant, errored, reason })) {
      console.log("[community/report] queued without email", { slug, verdict });
      return;
    }

    await notifyTeam(
      `Community story flagged${removed ? " + auto-removed" : ""}: ${p.title}`,
      `<p>A community story was flagged.</p>
       <ul>
         <li><b>Title:</b> ${esc(p.title)}</li>
         <li><b>By:</b> ${esc(p.display_byline ?? "unknown")}</li>
         <li><b>Reason given:</b> ${esc(reason ?? "(none)")}</li>
         <li><b>Reporter:</b> ${reporterId ? "signed in" : "anonymous"}</li>
         <li><b>AI re-review:</b> ${esc(verdict)}</li>
         <li><b>Action:</b> ${removed ? "TAKEN DOWN (status -> rejected)" : "left live; please review"}</li>
         <li><b>Link:</b> https://learn.readee.app/community/${esc(slug)}</li>
       </ul>
       <p>Review it at https://learn.readee.app/admin/community?status=flagged</p>`,
    );
  });

  return NextResponse.json({ ok: true });
}
