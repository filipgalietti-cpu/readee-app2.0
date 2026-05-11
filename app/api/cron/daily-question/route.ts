import { NextRequest, NextResponse } from "next/server";
import {
  buildDailyQuestion,
  targetedImageRegen,
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

  if (res.ok && res.qcOverall === "fail" && res.created) {
    // Try up to 3 targeted image regens before falling back to a
    // full rebuild. The image judge is the most common flaky check
    // and regenning just the image is ~50% cheaper than a full
    // pipeline rerun (~$0.05 vs ~$0.10) and keeps the proven-good
    // passage + questions.
    for (let i = 0; i < 3; i++) {
      const targeted = await targetedImageRegen({ date });
      attempts.push(
        targeted.ok
          ? targeted.regenerated
            ? `image-regen-${i + 1}:${targeted.newOverall}`
            : `image-regen-skip:${targeted.reason}`
          : `image-regen-err:${targeted.error}`,
      );
      if (!targeted.ok) break;
      if (!targeted.regenerated) break; // non-image failures — full rebuild path
      if (targeted.newOverall !== "fail") {
        res = { ...res, qcOverall: targeted.newOverall };
        break;
      }
    }

    // Still fail (or had non-image failures) — full rebuild once.
    if (res.qcOverall === "fail") {
      const rebuild = await buildDailyQuestion({ date, force: true });
      attempts.push("full-rebuild");
      if (rebuild.ok) res = rebuild;
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
