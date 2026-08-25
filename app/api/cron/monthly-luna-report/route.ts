import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { notifyTeam } from "@/lib/email/notify-team";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/cron/monthly-luna-report — runs on the 1st of each month
 * (vercel.json) and emails hello@ a "Luna sessions this Month" summary for
 * the month that just ended: sessions, readers, reading minutes, accuracy,
 * plus Azure speech-call counts (speech_token_mints) for margin tracking.
 * Auth: CRON_SECRET bearer, same as the other crons. ?force=1 to re-send.
 */
export async function GET(req: NextRequest) {
  const provided = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // The month that just ended (running on the 1st): [start, end)
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 1, 1));
  const monthLabel = start.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

  const admin = supabaseAdmin();

  // Luna sessions (one fluency_readings row per completed session).
  const { data: sessions } = await admin
    .from("fluency_readings")
    .select("child_id, words_total, words_correct, duration_seconds, created_at")
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString())
    .limit(10000);
  const rows = (sessions ?? []) as { child_id: string; words_total: number | null; words_correct: number | null; duration_seconds: number | null }[];
  const totalSessions = rows.length;
  const readers = new Set(rows.map((r) => r.child_id)).size;
  const minutes = Math.round(rows.reduce((s, r) => s + (r.duration_seconds ?? 0), 0) / 60);
  const wt = rows.reduce((s, r) => s + (r.words_total ?? 0), 0);
  const wc = rows.reduce((s, r) => s + (r.words_correct ?? 0), 0);
  const accuracy = wt > 0 ? Math.round((wc / wt) * 100) : null;

  // Azure speech calls (token mints) by surface — the metered cost driver.
  const { data: mints } = await admin
    .from("speech_token_mints")
    .select("context")
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString())
    .limit(50000);
  const byCtx = new Map<string, number>();
  for (const m of (mints ?? []) as { context: string }[]) {
    byCtx.set(m.context, (byCtx.get(m.context) ?? 0) + 1);
  }
  const mintTotal = (mints ?? []).length;
  const mintLine = mintTotal
    ? Array.from(byCtx.entries()).map(([c, n]) => `${c}: ${n}`).join(" · ")
    : "none recorded";

  const html = `
    <h2 style="margin:0 0 4px">Luna sessions - ${monthLabel}</h2>
    <table style="border-collapse:collapse;font-size:14px">
      <tr><td style="padding:4px 12px 4px 0"><b>Sessions completed</b></td><td>${totalSessions}</td></tr>
      <tr><td style="padding:4px 12px 4px 0"><b>Unique readers</b></td><td>${readers}</td></tr>
      <tr><td style="padding:4px 12px 4px 0"><b>Reading time</b></td><td>${minutes} min</td></tr>
      <tr><td style="padding:4px 12px 4px 0"><b>Word accuracy</b></td><td>${accuracy != null ? `${accuracy}%` : "n/a"}</td></tr>
      <tr><td style="padding:4px 12px 4px 0"><b>Azure speech calls</b></td><td>${mintTotal} (${mintLine})</td></tr>
    </table>
    <p style="font-size:12px;color:#666;margin-top:12px">
      Azure calls = token mints at the streaming choke point (Luna reads, word
      checks, lesson Speak). Compare against the Azure billing blade to true-up
      cost-per-session estimates.
    </p>`;

  await notifyTeam(`Luna sessions this month - ${monthLabel}`, html);

  return NextResponse.json({
    ok: true,
    month: monthLabel,
    sessions: totalSessions,
    readers,
    minutes,
    accuracy,
    speechCalls: mintTotal,
  });
}
