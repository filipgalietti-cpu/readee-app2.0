import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendWelcomeEmailNow } from "@/lib/email/lifecycle";

export const dynamic = "force-dynamic";

/**
 * POST /api/lifecycle/welcome — fire the welcome email immediately after a
 * parent finishes onboarding (creates their first reader), instead of waiting
 * for the next daily lifecycle cron. Deduped, so a later cron never re-sends.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const admin = supabaseAdmin();
  const [{ data: profile }, { data: kid }] = await Promise.all([
    admin.from("profiles").select("id, email, display_name").eq("id", user.id).maybeSingle(),
    admin.from("children").select("first_name").eq("parent_id", user.id).order("created_at", { ascending: true }).limit(1).maybeSingle(),
  ]);
  if (profile) {
    await sendWelcomeEmailNow(profile as any, (kid as any)?.first_name ?? null);
  }
  return NextResponse.json({ ok: true });
}
