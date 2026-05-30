import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { requireProfile } from "@/lib/auth/helpers";
import { isPlatformAdmin } from "@/lib/auth/admin-gate";

/**
 * Local-dev review store for the lesson timing audit. Writes to
 * scripts/lesson-timing-reviews.json (gitignored — review artifact,
 * not source content). Owner-gated.
 */

const REVIEWS_FILE = path.resolve(
  process.cwd(),
  "scripts/lesson-timing-reviews.json",
);

type Review = {
  lessonId: string;
  slideNum: number;
  rating: "up" | "down" | null;
  notes: string;
};

async function readReviews(): Promise<{ reviews: Review[]; updated: string | null }> {
  try {
    const raw = await fs.readFile(REVIEWS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
      updated: parsed.updated ?? null,
    };
  } catch {
    return { reviews: [], updated: null };
  }
}

export async function GET() {
  const profile = await requireProfile();
  if (!isPlatformAdmin(profile as any)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const data = await readReviews();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const profile = await requireProfile();
  if (!isPlatformAdmin(profile as any)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const incoming: Review[] = Array.isArray(body.reviews) ? body.reviews : [];
  const reviews = incoming.filter(
    (r) =>
      typeof r?.lessonId === "string" &&
      typeof r?.slideNum === "number" &&
      (r.rating === "up" ||
        r.rating === "down" ||
        r.rating === null ||
        r.rating === undefined),
  );
  await fs.writeFile(
    REVIEWS_FILE,
    JSON.stringify(
      { reviews, updated: new Date().toISOString() },
      null,
      2,
    ),
  );
  return NextResponse.json({ ok: true, count: reviews.length });
}
