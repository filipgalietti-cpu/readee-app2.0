import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST() {
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

  // Find all redemptions for this user (to decrement promo_codes.current_uses)
  const { data: redemptions } = await admin
    .from("promo_redemptions")
    .select("promo_code_id")
    .eq("user_id", user.id);

  // Decrement current_uses for each redeemed promo code
  if (redemptions && redemptions.length > 0) {
    for (const r of redemptions) {
      const { data: promo } = await admin
        .from("promo_codes")
        .select("id, current_uses")
        .eq("id", r.promo_code_id)
        .single();

      if (promo && promo.current_uses > 0) {
        await admin
          .from("promo_codes")
          .update({ current_uses: promo.current_uses - 1 })
          .eq("id", promo.id);
      }
    }
  }

  // Delete all promo redemptions for this user
  await admin.from("promo_redemptions").delete().eq("user_id", user.id);

  // Set plan back to free
  await admin.from("profiles").update({ plan: "free" }).eq("id", user.id);

  return NextResponse.json({ success: true });
}
