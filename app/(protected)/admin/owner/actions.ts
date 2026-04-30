"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/helpers";
import { isPlatformAdmin } from "@/lib/auth/admin-gate";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function gate(): Promise<{ ok: true; adminId: string } | { ok: false; error: string }> {
  const me = await requireProfile();
  const ok = await isPlatformAdmin(me.id);
  if (!ok) return { ok: false, error: "Owner only." };
  return { ok: true, adminId: me.id };
}

/**
 * Comp AI credits to a user. Inserts an `ai_credit_balance` row tagged
 * with source='adjustment' so it's distinguishable from purchases.
 * Logs the action to cs_actions_log.
 */
export async function grantCredits(input: {
  profileId: string;
  pool: "teacher" | "parent";
  amount: number;
  reason: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const g = await gate();
  if (!g.ok) return g;
  const amount = Math.floor(Number(input.amount));
  if (!Number.isFinite(amount) || amount <= 0 || amount > 5000) {
    return { ok: false, error: "Amount must be 1–5000." };
  }
  if (!input.reason.trim()) return { ok: false, error: "Reason is required." };

  const supabase = supabaseAdmin();
  const { error } = await supabase.from("ai_credit_balance").insert({
    profile_id: input.profileId,
    pool: input.pool,
    balance: amount,
    source: "adjustment",
    notes: `CS comp: ${input.reason.trim()}`,
  });
  if (error) return { ok: false, error: error.message };

  await supabase.from("cs_actions_log").insert({
    target_profile_id: input.profileId,
    admin_id: g.adminId,
    action_kind: "credit_grant",
    payload: { pool: input.pool, amount, reason: input.reason.trim() },
  });

  revalidatePath(`/admin/owner/${input.profileId}`);
  return { ok: true };
}

/**
 * Add an internal CS note pinned to the account.
 */
export async function addCsNote(input: {
  profileId: string;
  body: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const g = await gate();
  if (!g.ok) return g;
  const body = input.body.trim();
  if (!body) return { ok: false, error: "Note body is required." };
  if (body.length > 4000) return { ok: false, error: "Note too long (max 4000)." };

  const supabase = supabaseAdmin();
  const { error } = await supabase.from("cs_notes").insert({
    profile_id: input.profileId,
    author_id: g.adminId,
    body,
  });
  if (error) return { ok: false, error: error.message };

  await supabase.from("cs_actions_log").insert({
    target_profile_id: input.profileId,
    admin_id: g.adminId,
    action_kind: "note_added",
    payload: { preview: body.slice(0, 80) },
  });

  revalidatePath(`/admin/owner/${input.profileId}`);
  return { ok: true };
}

/**
 * Change a user's plan tier. Updates profiles.plan and logs.
 * Stripe subscription is NOT touched — that's a manual operation
 * via the Stripe dashboard. This sets internal entitlements only.
 */
export async function changePlan(input: {
  profileId: string;
  newPlan: string;
  reason: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const g = await gate();
  if (!g.ok) return g;
  const allowed = new Set([
    "free",
    "premium",
    "teacher_solo",
    "classroom",
    "school",
    "district",
  ]);
  if (!allowed.has(input.newPlan)) return { ok: false, error: "Unknown plan." };
  if (!input.reason.trim()) return { ok: false, error: "Reason is required." };

  const supabase = supabaseAdmin();
  const { data: prev } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", input.profileId)
    .maybeSingle();
  const previousPlan = (prev as any)?.plan ?? null;

  const { error } = await supabase
    .from("profiles")
    .update({ plan: input.newPlan })
    .eq("id", input.profileId);
  if (error) return { ok: false, error: error.message };

  await supabase.from("cs_actions_log").insert({
    target_profile_id: input.profileId,
    admin_id: g.adminId,
    action_kind: "plan_change",
    payload: {
      from: previousPlan,
      to: input.newPlan,
      reason: input.reason.trim(),
    },
  });

  revalidatePath(`/admin/owner/${input.profileId}`);
  return { ok: true };
}

/**
 * Send a Supabase password-reset email to the user. Uses Supabase
 * Auth admin client; doesn't require knowing their current password.
 */
export async function sendPasswordReset(input: {
  profileId: string;
  email: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const g = await gate();
  if (!g.ok) return g;
  if (!input.email) return { ok: false, error: "Email missing." };

  const supabase = supabaseAdmin();
  const { error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: input.email,
  });
  if (error) return { ok: false, error: error.message };

  await supabase.from("cs_actions_log").insert({
    target_profile_id: input.profileId,
    admin_id: g.adminId,
    action_kind: "password_reset",
    payload: { email: input.email },
  });

  revalidatePath(`/admin/owner/${input.profileId}`);
  return { ok: true };
}
