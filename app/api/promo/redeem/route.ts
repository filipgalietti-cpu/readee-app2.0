import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
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

  // Send welcome email (don't block the success response on failure)
  try {
    const { data: profile } = await admin
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();

    const firstName = (profile as { display_name?: string } | null)?.display_name?.split(" ")[0] || "there";

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: emailError } = await resend.emails.send({
      from: "hello@readee.app",
      to: user.email!,
      subject: "Welcome to Readee+! \u{1F389}",
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(30,27,75,0.08);">
      <div style="background:linear-gradient(135deg,#4338ca,#8b5cf6);padding:40px 32px;text-align:center;">
        <div style="font-size:28px;font-weight:800;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;letter-spacing:-0.5px;">READ<span style="color:#c7d2fe;">EE</span></div>
        <div style="margin-top:16px;font-size:40px;">\u{1F451}</div>
        <h1 style="margin:12px 0 0;font-size:24px;font-weight:700;color:#ffffff;">Welcome to Readee+, ${firstName}!</h1>
      </div>
      <div style="padding:32px;">
        <p style="font-size:16px;line-height:1.7;color:#374151;margin:0 0 20px;">
          Your account has been upgraded to <strong style="color:#4338ca;">Readee+ Premium</strong>. Every lesson, every reading level, and every feature is now unlocked for your family.
        </p>
        <div style="background:#eef2ff;border-radius:12px;padding:24px;margin:0 0 24px;">
          <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:0.5px;">What\u2019s now unlocked</p>
          <table style="width:100%;border-spacing:0;">
            <tr>
              <td style="padding:6px 12px 6px 0;vertical-align:top;width:24px;font-size:16px;">\u2705</td>
              <td style="padding:6px 0;font-size:14px;line-height:1.6;color:#374151;">Full curriculum with <strong>42+ lessons</strong> across 5 reading levels</td>
            </tr>
            <tr>
              <td style="padding:6px 12px 6px 0;vertical-align:top;width:24px;font-size:16px;">\u2705</td>
              <td style="padding:6px 0;font-size:14px;line-height:1.6;color:#374151;">Up to <strong>5 child profiles</strong> with detailed progress tracking</td>
            </tr>
            <tr>
              <td style="padding:6px 12px 6px 0;vertical-align:top;width:24px;font-size:16px;">\u2705</td>
              <td style="padding:6px 0;font-size:14px;line-height:1.6;color:#374151;">Audio narration, parent reports, and standards-aligned practice</td>
            </tr>
          </table>
        </div>
        <div style="text-align:center;margin:32px 0 8px;">
          <a href="https://learn.readee.app/dashboard" style="display:inline-block;background:linear-gradient(135deg,#4338ca,#6366f1);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:16px;font-weight:700;box-shadow:0 4px 16px rgba(99,102,241,0.3);">
            Start a Lesson \u2192
          </a>
        </div>
      </div>
      <div style="padding:24px 32px;background:#f9fafb;border-top:1px solid #f3f4f6;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
          You\u2019re receiving this because you upgraded to Readee+ Premium.<br>
          Questions? Reply to this email \u2014 we\u2019re happy to help.
        </p>
      </div>
    </div>
    <div style="text-align:center;margin-top:24px;">
      <p style="font-size:12px;color:#9ca3af;">\u00a9 2026 Readee \u00b7 Helping every child become a confident reader</p>
    </div>
  </div>
</body>
</html>`,
    });

    if (emailError) console.error("Promo welcome email error:", emailError);
  } catch (emailErr) {
    console.error("Failed to send promo welcome email:", emailErr);
  }

  return NextResponse.json({
    success: true,
    message: "Welcome to Readee+! Your account has been upgraded.",
  });
}
