/**
 * Discovery articles cron. Daily at 10:00 UTC (right after the daily
 * Readee fires at 09:00). Generates ~3 articles across categories
 * per run, rotating through the 7 buckets so each gets covered every
 * 2-3 days at the conservative 3/day cadence.
 *
 * Why 3 per run and not 7: Vercel maxDuration is 300s and one article
 * end-to-end takes ~60-90s (passage + image + audio + 3 MCQs + 12
 * QC judges + possible auto-heal). 3 fits comfortably with headroom
 * for Gemini latency spikes.
 *
 * At 3/day across 7 categories the library grows ~90 articles/month,
 * ~1,000/year — a real browsable surface that compounds. Bump to 5+
 * per run once we trust the QC pass rate and Vertex quota allows.
 *
 * Auto-heal is built into buildDiscoveryArticle so this route just
 * iterates and counts outcomes.
 *
 * Cost: ~3 × $0.11 ≈ $0.35/day, ~$10/month.
 */

import { NextRequest, NextResponse } from "next/server";
import { buildDiscoveryArticle } from "@/lib/discover/build-discovery";
import {
  listCategories,
  type DiscoveryCategory,
} from "@/lib/discover/categories";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const PER_RUN = 3;

/**
 * Pick which 3 categories run today. Deterministic by date so a
 * re-fire on the same day doesn't change the pick, but each day
 * rotates the slate so all 7 get covered every ~2.5 days.
 */
function pickCategoriesForDate(date: Date): DiscoveryCategory[] {
  const cats = listCategories().map((c) => c.slug);
  const dayIndex = Math.floor(
    date.getTime() / (24 * 60 * 60 * 1000),
  );
  const out: DiscoveryCategory[] = [];
  for (let i = 0; i < PER_RUN; i++) {
    out.push(cats[(dayIndex + i) % cats.length]);
  }
  return out;
}

async function run(req: NextRequest) {
  const provided = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const count = Math.max(
    1,
    Math.min(
      7,
      parseInt(url.searchParams.get("count") ?? `${PER_RUN}`, 10) || PER_RUN,
    ),
  );
  const overrideCat = url.searchParams.get("category") as
    | DiscoveryCategory
    | null;
  const dateParam = url.searchParams.get("date");
  const date = dateParam ? new Date(dateParam) : new Date();

  const cats: DiscoveryCategory[] = overrideCat
    ? Array(count).fill(overrideCat)
    : pickCategoriesForDate(date).slice(0, count);

  const results: any[] = [];
  let passCount = 0;
  let warnCount = 0;
  let failCount = 0;
  for (const cat of cats) {
    try {
      const r = await buildDiscoveryArticle({ category: cat });
      if (r.ok) {
        if (r.qcOverall === "pass") passCount++;
        else if (r.qcOverall === "warn") warnCount++;
        else failCount++;
        results.push({
          category: cat,
          id: r.id,
          slug: r.slug,
          qcOverall: r.qcOverall,
          attempts: r.attempts,
        });
      } else {
        failCount++;
        results.push({ category: cat, error: r.error });
      }
    } catch (e: any) {
      failCount++;
      results.push({ category: cat, error: e?.message ?? "build threw" });
    }
  }

  return NextResponse.json({
    ok: true,
    date: date.toISOString().slice(0, 10),
    pass: passCount,
    warn: warnCount,
    fail: failCount,
    results,
  });
}

export async function GET(req: NextRequest) {
  return run(req);
}

export async function POST(req: NextRequest) {
  return run(req);
}
