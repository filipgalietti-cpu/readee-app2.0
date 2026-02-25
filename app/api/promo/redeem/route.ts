import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { code } = body as { code?: string };

  if (!code || !code.trim()) {
    return NextResponse.json(
      { success: false, message: "Please enter a promo code." },
      { status: 400 },
    );
  }

  // Get authenticated user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "You must be logged in." },
      { status: 401 },
    );
  }

  const admin = supabaseAdmin();
  const trimmedCode = code.trim();

  // Look up the promo code (case-insensitive)
  const { data: promoCode, error: lookupError } = await admin
    .from("promo_codes")
    .select("*")
    .ilike("code", trimmedCode)
    .single();

  if (lookupError || !promoCode) {
    return NextResponse.json(
      { success: false, message: "Invalid promo code." },
      { status: 404 },
    );
  }

  // Check expiration
  if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
    return NextResponse.json(
      { success: false, message: "This promo code has expired." },
      { status: 410 },
    );
  }

  // Check max uses
  if (
    promoCode.max_uses !== null &&
    promoCode.current_uses >= promoCode.max_uses
  ) {
    return NextResponse.json(
      { success: false, message: "This promo code has reached its usage limit." },
      { status: 410 },
    );
  }

  // Check if user already redeemed this code
  const { data: existing } = await admin
    .from("promo_redemptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("promo_code_id", promoCode.id)
    .single();

  if (existing) {
    return NextResponse.json(
      { success: false, message: "You've already redeemed this code." },
      { status: 409 },
    );
  }

  // Redeem: insert redemption, increment uses, upgrade profile
  const { error: redemptionError } = await admin
    .from("promo_redemptions")
    .insert({ user_id: user.id, promo_code_id: promoCode.id });

  if (redemptionError) {
    console.error("Promo redemption insert error:", redemptionError);
    return NextResponse.json(
      { success: false, message: "Failed to redeem code. Please try again." },
      { status: 500 },
    );
  }

  await admin
    .from("promo_codes")
    .update({ current_uses: promoCode.current_uses + 1 })
    .eq("id", promoCode.id);

  await admin
    .from("profiles")
    .update({ plan: "premium" })
    .eq("id", user.id);

  return NextResponse.json({
    success: true,
    message: "Welcome to Readee+! Your account has been upgraded.",
  });
}
