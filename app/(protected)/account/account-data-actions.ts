"use server";

/**
 * Account data actions — COPPA/GDPR compliance surface.
 *
 *   exportUserDataAction()        — returns a JSON blob of everything we
 *                                    store about the parent and their kids.
 *   deleteAccountAction({email})  — verifies the parent typed their own
 *                                    email, cancels Stripe, deletes the
 *                                    Stripe customer, deletes the auth
 *                                    user (FK cascade cleans up profile +
 *                                    children + all per-child data).
 *
 * Both are server actions so we never hand the service-role key to the
 * browser. The delete path is irreversible and end-to-end on the server
 * — the client just shows the confirm modal and redirects after.
 */

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireProfile } from "@/lib/auth/helpers";
import { stripe } from "@/lib/stripe";
import { trackError, trackSignal } from "@/lib/observability/track";
import { Resend } from "resend";

const FROM = "Readee <hello@readee.app>";

// Tables that hold parent-scoped data. Cascade from profiles handles
// most of these, but we read them out for export.
const PARENT_TABLES = [
  "profiles",
  "onboarding_preferences",
  "promo_redemptions",
  "community_passages",
  "child_ai_content",
  "lifecycle_email_sends",
  "parent_digest_sends",
] as const;

// Tables that hold child-scoped data. Same idea — cascade from children
// cleans them up, we read them out for export.
const CHILD_TABLES = [
  "assessments",
  "lessons_progress",
  "practice_results",
  "shop_purchases",
  "reading_progress",
  "buddy_memories",
  "personalized_stories",
  "fluency_readings",
  "personalized_avatars",
  "running_records",
  "student_iep_goals",
  "intervention_plans",
  "iep_progress_notes",
  "kid_feedback",
] as const;

type ExportPayload = {
  exportedAt: string;
  parent: {
    id: string;
    email: string | null;
    tables: Record<string, unknown[]>;
  };
  children: Array<{
    id: string;
    first_name: string | null;
    tables: Record<string, unknown[]>;
  }>;
};

async function readParentTable(parentId: string, table: string): Promise<unknown[]> {
  const admin = supabaseAdmin();
  // profiles: filter by id; everyone else: filter by parent column.
  // Different tables use different column names — try the common ones.
  if (table === "profiles") {
    const { data } = await admin.from(table).select("*").eq("id", parentId);
    return data ?? [];
  }
  const candidates = ["parent_id", "user_id", "source_parent_id", "profile_id"];
  for (const col of candidates) {
    const { data, error } = await admin.from(table).select("*").eq(col, parentId);
    if (!error && data) return data;
  }
  return [];
}

async function readChildTable(childId: string, table: string): Promise<unknown[]> {
  const admin = supabaseAdmin();
  const { data } = await admin.from(table).select("*").eq("child_id", childId);
  return data ?? [];
}

/**
 * Gather everything we have on the parent + their children, return as
 * a single JSON object. Safe to call by the parent for their own data.
 */
export async function exportUserDataAction(): Promise<
  { ok: true; payload: ExportPayload } | { ok: false; error: string }
> {
  let profile;
  try {
    profile = await requireProfile();
  } catch {
    return { ok: false, error: "Not authenticated." };
  }
  const admin = supabaseAdmin();

  try {
    const parentTables: Record<string, unknown[]> = {};
    for (const t of PARENT_TABLES) {
      try {
        parentTables[t] = await readParentTable(profile.id, t);
      } catch {
        parentTables[t] = [];
      }
    }

    const { data: kids } = await admin
      .from("children")
      .select("*")
      .eq("parent_id", profile.id);

    const childrenOut: ExportPayload["children"] = [];
    for (const kid of (kids ?? []) as any[]) {
      const tables: Record<string, unknown[]> = { children: [kid] };
      for (const t of CHILD_TABLES) {
        try {
          tables[t] = await readChildTable(kid.id, t);
        } catch {
          tables[t] = [];
        }
      }
      childrenOut.push({
        id: kid.id,
        first_name: kid.first_name ?? null,
        tables,
      });
    }

    return {
      ok: true,
      payload: {
        exportedAt: new Date().toISOString(),
        parent: {
          id: profile.id,
          email: (profile as any).email ?? null,
          tables: parentTables,
        },
        children: childrenOut,
      },
    };
  } catch (e: any) {
    trackError(e instanceof Error ? e : new Error(String(e)), {
      route: "account.export.failed",
      userId: profile.id,
    });
    return { ok: false, error: "Couldn't build your export - please try again." };
  }
}

async function cancelStripeAndDeleteCustomer(parentId: string): Promise<void> {
  const admin = supabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id, stripe_subscription_id")
    .eq("id", parentId)
    .maybeSingle();
  const customerId = (profile as any)?.stripe_customer_id as string | null | undefined;
  const subscriptionId = (profile as any)?.stripe_subscription_id as string | null | undefined;

  if (subscriptionId) {
    try {
      await stripe.subscriptions.cancel(subscriptionId);
    } catch (e: any) {
      // 404 = already gone. Log everything else but keep deleting.
      if (e?.statusCode !== 404) {
        trackSignal("delete-account: stripe subscription cancel failed", {
          route: "account.delete.stripe.subscription",
          level: "warning",
          extra: { parentId, subscriptionId, error: String(e?.message ?? e) },
        });
      }
    }
  }
  if (customerId) {
    try {
      await stripe.customers.del(customerId);
    } catch (e: any) {
      if (e?.statusCode !== 404) {
        trackSignal("delete-account: stripe customer delete failed", {
          route: "account.delete.stripe.customer",
          level: "warning",
          extra: { parentId, customerId, error: String(e?.message ?? e) },
        });
      }
    }
  }
}

async function sendDeletionConfirmation(email: string, parentName: string | null): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  try {
    const resend = new Resend(apiKey);
    const greeting = parentName ? `Hi ${parentName},` : "Hi there,";
    const text = [
      greeting,
      "",
      "Your Readee account and all associated data have been permanently deleted.",
      "If you cancel a paid subscription, no further charges will occur.",
      "",
      "If this wasn't you, please reply to this email immediately.",
      "",
      "- Readee",
    ].join("\n");
    const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f5f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:32px 16px;background:#f6f5f2;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">
          <tr><td align="center" style="padding-bottom:20px;">
            <img src="https://learn.readee.app/readee-logo.png" alt="Readee" width="132" style="display:block;width:132px;height:auto;" />
          </td></tr>
          <tr><td style="background:#ffffff;border:1px solid #ececf0;border-radius:20px;padding:36px 34px;box-shadow:0 10px 40px -18px rgba(49,46,129,.18);">
            <img src="https://learn.readee.app/images/ui/bunny-wave-clipboard.png" alt="" width="96" style="display:block;margin:0 auto 18px;width:96px;height:auto;" />
            <h1 style="margin:0;text-align:center;font-size:23px;font-weight:800;color:#1e1b4b;letter-spacing:-.01em;">${greeting}</h1>
            <p style="margin:16px 0 0;font-size:15px;line-height:1.65;color:#3f3f46;text-align:center;">
              Your Readee account and all associated data have been <strong>permanently deleted.</strong> If you had a paid subscription, it has been cancelled and no further charges will occur.
            </p>
            <div style="height:1px;background:#ececf0;margin:26px 0;"></div>
            <p style="margin:0;font-size:13.5px;line-height:1.6;color:#6b7280;text-align:center;">
              If this wasn't you, reply to this email right away and we'll look into it.
            </p>
          </td></tr>
          <tr><td align="center" style="padding-top:22px;">
            <p style="margin:0;font-size:12px;line-height:1.7;color:#a1a1aa;">
              Questions? <a href="mailto:hello@readee.app" style="color:#4f46e5;text-decoration:none;">hello@readee.app</a><br/>
              <a href="https://instagram.com/readee.app" style="color:#4f46e5;text-decoration:none;">Instagram</a> &middot; <a href="https://tiktok.com/@readee.app" style="color:#4f46e5;text-decoration:none;">TikTok</a><br/>
              Readee Learning LLC &middot; Built by educators
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Your Readee account has been deleted",
      text,
      html,
    });
  } catch {
    // Confirmation email is best-effort — never block deletion on it.
  }
}

/**
 * Permanently delete the calling parent's account, all children, and
 * every cascading row. Requires the parent to retype their email as
 * a safety gate — protects against accidental clicks.
 */
export async function deleteAccountAction(input: {
  confirmEmail: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  let profile;
  try {
    profile = await requireProfile();
  } catch {
    return { ok: false, error: "Not authenticated." };
  }

  const myEmail = ((profile as any).email ?? "").toLowerCase().trim();
  const typed = (input.confirmEmail ?? "").toLowerCase().trim();
  if (!myEmail || !typed || myEmail !== typed) {
    return { ok: false, error: "Email didn't match. Please type your account email exactly." };
  }

  // 1) Stripe — cancel sub + delete customer (idempotent, best effort).
  await cancelStripeAndDeleteCustomer(profile.id);

  // 2) Confirmation email — sent BEFORE auth delete so we still have
  //    a known-good email address.
  await sendDeletionConfirmation(
    (profile as any).email ?? "",
    (profile as any).display_name ?? null,
  );

  // 3) Delete the auth user. Foreign-key cascade on profiles → children
  //    → all per-child + per-parent tables handles the rest.
  const admin = supabaseAdmin();
  const { error: authErr } = await admin.auth.admin.deleteUser(profile.id);
  if (authErr) {
    trackError(authErr, {
      route: "account.delete.auth",
      userId: profile.id,
    });
    return { ok: false, error: "Couldn't delete the account. Please email hello@readee.app." };
  }

  // 4) Sign the user out of the current browser session so the
  //    redirect they get post-delete doesn't try to re-auth.
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Cookie already expired — fine.
  }

  trackSignal("account deleted", {
    route: "account.delete.success",
    level: "info",
    tags: { had_stripe: String(!!(profile as any).stripe_customer_id) },
  });

  return { ok: true };
}
