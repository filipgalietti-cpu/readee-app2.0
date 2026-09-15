import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { unitOneEnabled } from "@/lib/approved-unit/access";
import { unitRequestBody } from "@/lib/approved-unit/request";
import { serveUnitSpeech } from "@/lib/approved-unit/speech-service";
export const runtime = "nodejs";
const json = (error: string, status: number) =>
  NextResponse.json({ error }, { status, headers: { "Cache-Control": "private, no-store" } });
/** One existing free K sample. No child IDs, progress writes or usable reward receipts. */
export async function POST(req: Request) {
  if (!unitOneEnabled()) return json("Sample unavailable", 404);
  const db = await createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return json("Sign in to try the sample", 401);
  try {
    const p = z
      .object({
        kind: z.enum(["speech", "response"]),
        rubricId: z.string().max(100).optional(),
        transcript: z.string().max(240).optional(),
        confidence: z.number().min(0).max(1).optional(),
      })
      .strict()
      .parse(await unitRequestBody(req));
    return await serveUnitSpeech(user.id, "key-details", p);
  } catch {
    return json("Luna could not check that answer", 400);
  }
}
