import { NextRequest, NextResponse } from "next/server";
import { slugForDate } from "@/lib/daily/themes";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  buildDailyQuestion,
  autoHealDaily,
} from "@/lib/daily/build-daily";

export const dynamic = "force-dynamic";
// Image gen + TTS + 5 LLM calls + QC ≈ 60-90s end-to-end on a slow day.
// 5 minutes leaves headroom for retries and Gemini latency spikes.
export const maxDuration = 300;

/**
 * Daily question cron. Vercel hits this once a day; auth via
 * CRON_SECRET. Idempotent — if today's row already exists, returns
 * early without spending API credits.
 *
 * On QC fail:
 *   1. If only image.* checks failed → targeted image regen (up to 3
 *      tries). Cheap, fast, keeps already-passing passage + MCQs.
 *   2. If non-image failures present → full rebuild once with
 *      force=true.
 *   3. Still fail after that → leave the failed row in place; the
 *      reader (/today) filters qc_overall='fail' so kids see
 *      yesterday's pass content as a graceful fallback.
 *
 * May 6 2026 incident is why targeted regen exists: a single image
 * judge fail tanked a row whose passage + 3 questions all passed.
 */
async function run(req: NextRequest) {
  const provided = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";
  const dateParam = url.searchParams.get("date");
  const date = dateParam ? new Date(dateParam) : new Date();

  let res = await buildDailyQuestion({ date, force });
  const attempts: string[] = ["build"];

  // AI catches → AI addresses loop. autoHealDaily dispatches surgical
  // regens per failing check class: image → image regen, passage
  // (reading-level/fact-check/judge) → passage regen, questions
  // (learning-objective) → questions regen. Up to 3 sweeps in case
  // one fix exposes a downstream issue. Falls back to a single full
  // rebuild if the surgical path can't land a pass.
  // Drop the `res.created` check from the previous version: it
  // blocked heals on idempotent returns (existing row with the day's
  // failed verdict). Now the cron will also fix a historical row
  // that's still 'fail' or 'warn' — useful when re-triggered with
  // ?date=YYYY-MM-DD for manual heals.
  if (res.ok && res.qcOverall !== "pass") {
    for (let i = 0; i < 3; i++) {
      const heal = await autoHealDaily({ date });
      if (!heal.ok) {
        attempts.push(`auto-heal-err:${heal.error}`);
        break;
      }
      attempts.push(`auto-heal-${i + 1}:[${heal.healed.join(",")}]→${heal.newOverall}`);
      res = { ...res, qcOverall: heal.newOverall };
      // Stop when we land on pass, or when no further heals fire
      // (healed === [] means nothing left to do surgically).
      if (heal.newOverall === "pass" || heal.healed.length === 0) break;
    }

    // Still failing after the surgical sweeps. Rebuild - but on a DIFFERENT
    // SUBJECT each time.
    //
    // The old rebuild redrew the same subject, because the draw is a function of
    // the date, so it walked straight back into whatever the generator had
    // already got wrong three times. Some subjects are simply traps: the
    // 2026-09-06 comet passage kept contradicting itself about which way a tail
    // points, on every attempt. There are two hundred subjects in the pool, so
    // swapping costs nothing and fixes what retrying cannot.
    //
    // The day still ships either way - the rule is an article every day - but it
    // ships a passage that is actually right rather than a wrong one about
    // comets.
    if (res.qcOverall === "fail") {
      const tried: string[] = [];
      const admin = supabaseAdmin();
      for (let swap = 0; swap < 3 && res.qcOverall === "fail"; swap++) {
        const { data: row } = await admin
          .from("daily_questions")
          .select("subject")
          .eq("date", slugForDate(date))
          .maybeSingle();
        const failedSubject = (row as { subject?: string | null } | null)?.subject;
        if (failedSubject && !tried.includes(failedSubject)) tried.push(failedSubject);

        const rebuild = await buildDailyQuestion({ date, force: true, excludeSubjects: tried });
        attempts.push(`rebuild-${swap + 1}:avoid[${tried.join(",")}]→${rebuild.ok ? rebuild.qcOverall : "err"}`);
        if (rebuild.ok) res = rebuild;
        else break;
      }
    }
  }

  return NextResponse.json({ ...res, attempts });
}

export async function GET(req: NextRequest) {
  return run(req);
}
export async function POST(req: NextRequest) {
  return run(req);
}
