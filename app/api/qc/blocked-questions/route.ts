import { NextResponse } from "next/server";
import { getBlockedQuestionIds } from "@/lib/data/qc-filter";

export const runtime = "nodejs";
// 60s — matches the cache TTL inside qc-filter.ts. Edge surfaces fetch
// once per minute and filter client-side.
export const revalidate = 60;

export async function GET() {
  const ids = await getBlockedQuestionIds();
  return NextResponse.json({ ids: Array.from(ids) });
}
