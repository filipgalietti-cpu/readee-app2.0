import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { checkLunaReadAllowance } from "@/lib/plan/luna-guard";

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
  // word checks, lesson Speak steps).
  //
  // ‼️ Context used to come from the Referer alone, and an unrecognised or
  // ABSENT Referer fell through to "other", which skipped the Luna allowance
  // gate below entirely. Omitting one header was enough to mint past the free
  // read limit.
  //
  // Callers now declare their purpose in the body and the two are combined by
  // taking the MORE RESTRICTIVE answer: you cannot claim "lesson" from a Luna
  // page, and anything unknown is treated as "luna" rather than waved through.
  // Unknown costs you the gate now instead of skipping it.
  //
  // Being straight about the ceiling: the Azure token is FUNGIBLE. It authorises
  // streaming, not a feature, so someone who forges a plausible Referer and
  // declares "lesson" still mints. Per-context gating is a monetisation
  // guardrail here, not a security boundary; the real bound on abuse is the hard
  // 60/hour cap below, which applies to every context. Making it airtight needs
  // a server-created session the mint references - a bigger change than this
  // route.
  const ref = req.headers.get("referer") ?? "";
  const fromRef: string | null = ref.includes("placement") ? "placement"
    : ref.includes("/luna") ? "luna"
    : /lesson|learn|demo|unit/.test(ref) ? "lesson"
    : null;

  let declared: string | null = null;
  try {
    const body = (await req.json().catch(() => null)) as { purpose?: unknown } | null;
    const p = body?.purpose;
    if (p === "luna" || p === "lesson" || p === "placement") declared = p;
  } catch { /* body is optional */ }

  const context =
    fromRef === "luna" || declared === "luna"
      ? "luna"
      : (fromRef ?? declared ?? "luna");
  try {
    // .then() is required — supabase builders only execute when awaited.
    supabaseAdmin().from("speech_token_mints").insert({ user_id: user.id, context })
      .then(undefined, () => { /* metering must never break the mint */ });
  } catch { /* ignore */ }

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) return NextResponse.json({ ok: false, configured: false }, { status: 200 });

  // Hard per-user mint cap across ALL contexts — a token authorizes real-time
  // Azure streaming billed per second, so an authed user looping this endpoint
  // is an unbounded Azure bill. 60/hour is far above any real child's use
  // (a read refreshes a token every ~10 min) but stops the abuse, and it also
  // bounds the Referer-spoof path that dodges the free-taste gate below.
  {
    const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await supabaseAdmin()
      .from("speech_token_mints")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneHourAgo);
    if ((count ?? 0) >= 60) {
      return NextResponse.json({ error: "rate_limit", reason: "too many requests" }, { status: 429 });
    }
  }

  // Free allowance (server-enforced): Luna reads are a 3-taste feature, so a
  // genuinely-free reader past 3 completed reads gets a 402 instead of a
  // token. ONLY the luna context is gated — this same mint also powers
  // placement and lesson Speak steps, which stay open on free.
  if (context === "luna") {
    const gate = await checkLunaReadAllowance(user.id);
    if (!gate.ok) {
      return NextResponse.json({ error: "limit", reason: gate.reason }, { status: 402 });
    }
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
