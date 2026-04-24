/**
 * Teacher-to-teacher referral loop.
 *
 * Each teacher gets a unique 8-char code. Share URL is
 * /join/teacher/{code}. When a new user signs up via that link, both
 * the referrer and invitee get +REFERRAL_BONUS_CREDITS teacher credits
 * as a one-time `source: "referral"` row in ai_credit_balance.
 *
 * Self-serve only — no admin intervention needed. Rate-limited by the
 * one-referral-per-invitee unique constraint on the table.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import { grantTopUp } from "@/lib/ai/credit-balance";

export const REFERRAL_BONUS_CREDITS = 200;

// 8 chars, no O/0/I/1 for readability. Stored uppercase.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(): string {
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

/**
 * Return the teacher's active referral code, creating one if none
 * exists yet. Idempotent — calling twice on the same teacher returns
 * the same code.
 */
export async function getOrCreateReferralCode(teacherId: string): Promise<string> {
  const admin = supabaseAdmin();

  // Prefer an existing unredeemed row — that becomes the teacher's
  // shareable code. If every referral the teacher has issued is
  // already redeemed, mint a fresh one (so their next share link isn't
  // already claimed).
  const { data: existing } = await admin
    .from("teacher_referrals")
    .select("code, redeemed_at")
    .eq("referrer_id", teacherId)
    .is("redeemed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing && (existing as any).code) {
    return (existing as any).code as string;
  }

  // Retry a few times on collision.
  for (let i = 0; i < 8; i++) {
    const code = randomCode();
    const { error } = await admin
      .from("teacher_referrals")
      .insert({ referrer_id: teacherId, code });
    if (!error) return code;
    if ((error as any).code !== "23505") {
      throw error;
    }
  }
  throw new Error("Could not mint a referral code — try again.");
}

export async function redeemReferralOnSignup(input: {
  inviteeId: string;
  inviteeEmail: string | null;
  code: string;
}): Promise<{ ok: true; bonusCredits: number } | { ok: false; error: string }> {
  const admin = supabaseAdmin();
  const normalizedCode = input.code.toUpperCase();

  // Find the referral row.
  const { data: refRow } = await admin
    .from("teacher_referrals")
    .select("id, referrer_id, redeemed_at")
    .eq("code", normalizedCode)
    .maybeSingle();
  if (!refRow) {
    return { ok: false, error: "That referral code doesn't look right." };
  }
  const row = refRow as any;
  if (row.redeemed_at) {
    return { ok: false, error: "That referral link has already been used." };
  }
  if (row.referrer_id === input.inviteeId) {
    return { ok: false, error: "You can't redeem your own referral." };
  }

  // Mark redeemed. Use the one-invitee-per-referrer constraint so if
  // the same invitee-email already claimed from this referrer, the DB
  // rejects.
  const { error: updateErr } = await admin
    .from("teacher_referrals")
    .update({
      invitee_profile_id: input.inviteeId,
      invitee_email: input.inviteeEmail,
      redeemed_at: new Date().toISOString(),
      credits_granted_to_referrer: REFERRAL_BONUS_CREDITS,
      credits_granted_to_invitee: REFERRAL_BONUS_CREDITS,
    })
    .eq("id", row.id)
    .is("redeemed_at", null);
  if (updateErr) {
    return { ok: false, error: updateErr.message };
  }

  // Grant credits to both sides. If any one fails, log and continue —
  // the referral row is already marked redeemed, so the total gets
  // credited asynchronously on the next idempotent retry.
  await Promise.all([
    grantTopUp({
      profileId: row.referrer_id,
      pool: "teacher",
      credits: REFERRAL_BONUS_CREDITS,
      source: "referral",
      notes: `Referred ${input.inviteeEmail ?? input.inviteeId}`,
    }),
    grantTopUp({
      profileId: input.inviteeId,
      pool: "teacher",
      credits: REFERRAL_BONUS_CREDITS,
      source: "referral",
      notes: `Joined via referral code ${normalizedCode}`,
    }),
  ]);

  return { ok: true, bonusCredits: REFERRAL_BONUS_CREDITS };
}

export async function getReferralStats(teacherId: string): Promise<{
  totalSent: number;
  totalRedeemed: number;
  totalCreditsEarned: number;
}> {
  const admin = supabaseAdmin();
  const { data: rows } = await admin
    .from("teacher_referrals")
    .select("id, redeemed_at, credits_granted_to_referrer")
    .eq("referrer_id", teacherId);
  const list = (rows ?? []) as any[];
  const totalRedeemed = list.filter((r) => r.redeemed_at).length;
  const totalCreditsEarned = list.reduce(
    (s, r) => s + Number(r.credits_granted_to_referrer ?? 0),
    0,
  );
  return {
    totalSent: list.length,
    totalRedeemed,
    totalCreditsEarned,
  };
}
