import { supabaseAdmin } from "@/lib/supabase/admin";
import { notifyTeam } from "@/lib/email/notify-team";
import { lookupSignupLocations } from "@/lib/analytics/posthog-geo";

/**
 * Net-new signup alerts.
 *
 * Announces every account that has appeared since the last run, exactly once.
 * Idempotency lives in `signup_alerts` (one row per profile) rather than a
 * timestamp watermark, so a run that dies after sending cannot re-announce, and
 * a profile created mid-query cannot be skipped.
 *
 * Deliberately keyed off the profile row rather than a hook in the signup page:
 * accounts arrive by email/password, by Google OAuth, and in principle by an
 * admin insert, and all three land in `profiles` via the handle_new_user
 * trigger. One watcher on the table catches every path, including ones added
 * later, instead of three call sites that have to remember to fire.
 */

/** Never announce an account older than this. */
const MAX_AGE_DAYS = 7;
/** One email covers at most this many accounts; the rest wait for the next run. */
const BATCH = 25;

type NewProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: string;
  plan: string;
  created_at: string;
  onboarding_complete: boolean;
};

type Child = { parent_id: string; first_name: string | null; grade: string | null; id: string };

function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** "3 minutes ago" — how fresh the signup is when the alert lands. */
function ago(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins === 1) return "1 minute ago";
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.round(mins / 60);
  return hrs === 1 ? "1 hour ago" : `${hrs} hours ago`;
}

export async function notifyNewSignups(): Promise<{
  /** New profiles waiting, including any beyond this run's batch. */
  found: number;
  /** How many this run actually put in an email. */
  announced: number;
}> {
  const admin = supabaseAdmin();

  // Profiles we have already announced. Reading the ids and filtering in JS
  // keeps this to two simple queries; at Readee's volume the alert table is
  // small, and it stays correct without a view or an RPC.
  const { data: alerted, error: alertErr } = await admin
    .from("signup_alerts")
    .select("profile_id");
  if (alertErr) throw new Error(`signup_alerts read: ${alertErr.message}`);
  const seen = new Set((alerted ?? []).map((r) => (r as { profile_id: string }).profile_id));

  const floor = new Date(Date.now() - MAX_AGE_DAYS * 86400_000).toISOString();
  const { data: recent, error: profErr } = await admin
    .from("profiles")
    .select("id, email, display_name, role, plan, created_at, onboarding_complete")
    .gte("created_at", floor)
    .order("created_at", { ascending: true })
    .limit(200);
  if (profErr) throw new Error(`profiles read: ${profErr.message}`);

  const fresh = ((recent ?? []) as NewProfile[]).filter((p) => !seen.has(p.id));
  if (fresh.length === 0) return { found: 0, announced: 0 };

  const batch = fresh.slice(0, BATCH);

  // What each new parent has done so far. By the time the cron fires, a real
  // signup has usually added a child, and that is the difference between a
  // genuine family and a bot filling in a form.
  const { data: kids } = await admin
    .from("children")
    .select("id, parent_id, first_name, grade")
    .in("parent_id", batch.map((p) => p.id));
  const childrenBy = new Map<string, Child[]>();
  for (const c of (kids ?? []) as Child[]) {
    const list = childrenBy.get(c.parent_id) ?? [];
    list.push(c);
    childrenBy.set(c.parent_id, list);
  }

  // Where they are, from PostHog's geoip on their own events. Best-effort:
  // an empty map just means the alert goes out without the line.
  const locations = await lookupSignupLocations(batch.map((p) => p.id));

  const childIds = ((kids ?? []) as Child[]).map((c) => c.id);
  const placed = new Set<string>();
  if (childIds.length) {
    const { data: placements } = await admin
      .from("placements")
      .select("child_id")
      .in("child_id", childIds);
    for (const p of (placements ?? []) as { child_id: string }[]) placed.add(p.child_id);
  }

  const rows = batch
    .map((p) => {
      const kidsFor = childrenBy.get(p.id) ?? [];
      const kidLine = kidsFor.length
        ? kidsFor
            .map((c) => {
              const name = esc(c.first_name || "unnamed");
              const grade = c.grade ? ` (${esc(c.grade)})` : "";
              return `${name}${grade}${placed.has(c.id) ? ", assessment done" : ""}`;
            })
            .join("; ")
        : "no reader added yet";
      // "location not known yet" rather than a blank: an absent line reads as a
      // bug, and for a brand-new account it usually just means PostHog has not
      // ingested their first event yet.
      const place = locations.get(p.id);
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee">
            <strong>${esc(p.email || "(no email)")}</strong><br>
            <span style="color:#666;font-size:13px">
              ${esc(p.display_name || "no name")} &middot; ${esc(p.role)} &middot; ${esc(p.plan)}
              &middot; ${esc(ago(p.created_at))}
            </span><br>
            <span style="font-size:13px">${
              place
                ? `<strong>${esc(place)}</strong>`
                : `<span style="color:#999">location not known yet</span>`
            }</span><br>
            <span style="font-size:13px">${kidLine}</span>
          </td>
        </tr>`;
    })
    .join("");

  const one = batch.length === 1;
  const first = batch[0];
  const firstPlace = locations.get(first.id);
  const subject = one
    ? `New Readee signup: ${first.email || first.display_name || "(no email)"}${
        firstPlace ? ` (${firstPlace})` : ""
      }`
    : `${batch.length} new Readee signups`;

  const html = `<div style="font-family:sans-serif;max-width:560px">
      <h2 style="margin:0 0 12px">${one ? "New signup" : `${batch.length} new signups`}</h2>
      <table style="width:100%;border-collapse:collapse">${rows}</table>
      <p style="margin:16px 0 0;color:#666;font-size:12px">
        Sent by the new-signups cron. "No reader added yet" means they created the
        account but have not finished onboarding.
      </p>
    </div>`;

  await notifyTeam(subject, html);

  // Record only after the send. notifyTeam swallows its own errors by design,
  // so this cannot distinguish a delivered mail from a Resend outage: recording
  // afterwards at least means a thrown error above leaves the batch unclaimed
  // and the next run retries it.
  const { error: insErr } = await admin
    .from("signup_alerts")
    .upsert(
      batch.map((p) => ({ profile_id: p.id, reason: "sent" })),
      { onConflict: "profile_id", ignoreDuplicates: true },
    );
  if (insErr) throw new Error(`signup_alerts write: ${insErr.message}`);

  return { found: fresh.length, announced: batch.length };
}
