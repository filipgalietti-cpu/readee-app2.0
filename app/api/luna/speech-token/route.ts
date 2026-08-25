import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasAnyPaidTier } from "@/lib/plan/teacher-gate";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/luna/speech-token — mint a short-lived Azure Speech authorization
 * token so the browser SDK can stream mic audio DIRECTLY to Azure for real-time
 * Pronunciation Assessment, WITHOUT ever exposing the subscription key client-
 * side. Token is valid ~10 min; the client caches + refreshes it.
 *
 * Returns { ok, token, region } or { ok:false, configured:false } if Azure isn't
 * set up (client then falls back to the record → /api/luna/grade path).
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Meter every mint (the choke point for ALL Azure streaming — Luna reads,
  // word checks, lesson Speak steps). Context inferred from the referer so we
  // don't touch callers. Fire-and-forget; never blocks the token.
  const ref = req.headers.get("referer") ?? "";
  const context = ref.includes("/luna") ? "luna" : /lesson|learn|demo/.test(ref) ? "lesson" : "other";
  try {
    // .then() is required — supabase builders only execute when awaited.
    supabaseAdmin().from("speech_token_mints").insert({ user_id: user.id, context })
      .then(undefined, () => { /* metering must never break the mint */ });
  } catch { /* ignore */ }

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) return NextResponse.json({ ok: false, configured: false }, { status: 200 });

  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).maybeSingle();
  if (!hasAnyPaidTier(((profile as any)?.plan ?? "free") as string)) {
    return NextResponse.json({ error: "Luna requires a paid plan.", reason: "plan" }, { status: 402 });
  }

  try {
    const r = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
      method: "POST",
      headers: { "Ocp-Apim-Subscription-Key": key, "Content-Length": "0" },
    });
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      return NextResponse.json({ ok: false, error: `token ${r.status}: ${t.slice(0, 120)}` }, { status: 200 });
    }
    const token = await r.text();
    return NextResponse.json({ ok: true, token, region });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "token failed" }, { status: 200 });
  }
}
