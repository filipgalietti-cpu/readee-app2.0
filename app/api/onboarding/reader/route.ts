import { NextResponse, after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ReaderSetupSchema } from "@/lib/onboarding/reader-setup";
import { reportFailure } from "@/lib/observability/critical";
import { trackFunnel } from "@/lib/analytics/funnel.server";
import { sendWelcomeEmailNow } from "@/lib/email/lifecycle";

/** First-reader setup. The client request UUID is the child's primary key,
 * so replaying a lost response cannot create another reader. RLS scopes every
 * child query to this parent; this route never accepts a parent ID from input. */
export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });
    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
    const parsed = ReaderSetupSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Enter an enrollment grade from kindergarten through fourth grade." }, { status: 400 });
    const input = parsed.data;
    const { data: existing, error: lookupError } = await supabase.from("children").select("id").eq("parent_id", user.id).order("created_at", { ascending: true });
    if (lookupError) throw lookupError;
    let replayed = existing?.some((child) => child.id === input.requestId) ?? false;
    if (!replayed && existing?.length) return NextResponse.json({ ok: false, error: "reader_exists" }, { status: 409 });
    if (!replayed) {
      const { error } = await supabase.from("children").insert({ id: input.requestId, parent_id: user.id, first_name: input.first_name, grade: input.grade, equipped_items: { avatar: "avatar_fox" } });
      if (error) {
        // A simultaneous retry may have won the insert. Confirm ownership;
        // do not return success for another parent's UUID or a failed write.
        const { data: recovered, error: recoveryError } = await supabase.from("children").select("id").eq("id", input.requestId).eq("parent_id", user.id).maybeSingle();
        if (recoveryError || !recovered) throw recoveryError ?? error;
        replayed = true;
      }
    }
    const { error: flagError } = await supabase.from("profiles").update({ onboarding_complete: true, onboarding_completed_at: new Date().toISOString() }).eq("id", user.id);
    if (flagError) reportFailure("onboarding.profile_flag", flagError, { route: "/api/onboarding/reader", userId: user.id, requestId });
    if (!replayed) after(async () => {
      await trackFunnel("funnel.kid_added", user.id, { grade: input.grade, source: "parent_setup" });
      try {
        const { data: profile, error } = await supabaseAdmin().from("profiles").select("id, email, display_name").eq("id", user.id).maybeSingle();
        if (error) throw error;
        if (profile) await sendWelcomeEmailNow(profile, input.first_name);
      } catch (error) { reportFailure("onboarding.welcome_email", error, { route: "/api/onboarding/reader", userId: user.id, requestId }); }
    });
    return NextResponse.json({ ok: true, childId: input.requestId, replayed });
  } catch (error) {
    reportFailure("onboarding.reader_save", error, { route: "/api/onboarding/reader", requestId });
    return NextResponse.json({ ok: false, error: "Could not save your reader. Please retry.", requestId }, { status: 503 });
  }
}
