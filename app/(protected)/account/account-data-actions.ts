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
    return { ok: false, error: "Couldn't build your export — please try again." };
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
      "— Readee",
    ].join("\n");
    const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f7f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td>
          <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;color:#4f46e5;text-transform:uppercase;">Readee</div>
          <h1 style="margin:8px 0 0;font-size:24px;font-weight:800;color:#18181b;">${greeting}</h1>
          <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#3f3f46;">
            Your Readee account and all associated data have been permanently deleted.
            If you had a paid subscription, it has been cancelled and no further charges will occur.
          </p>
          <p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#6b7280;">
            If this wasn't you, please reply to this email immediately so we can investigate.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
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
