import "server-only";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { allowedRubrics } from "./state";
import { responseReceipt } from "./receipts";
import { isResponseRubricId, usableResponseTranscript } from "@/lib/lesson-engine/response/rubrics";
import { evaluateResponse } from "@/lib/lesson-engine/response/evaluate";
export type SpeechRequest = {
  kind: "speech" | "response";
  rubricId?: string;
  transcript?: string;
  confidence?: number;
};
const json = (value: unknown, status = 200) =>
  NextResponse.json(value, { status, headers: { "Cache-Control": "private, no-store" } });
/** Caller authenticates and authorizes lesson scope before entering this shared budget. */
export async function serveUnitSpeech(
  parent: string,
  lessonId: string,
  p: SpeechRequest,
  child?: string,
) {
  const admin = supabaseAdmin();
  if (
    p.kind === "response" &&
    (!isResponseRubricId(p.rubricId) ||
      !allowedRubrics(lessonId).has(p.rubricId) ||
      p.transcript === undefined)
  )
    return json({ error: "Unknown question" }, 400);
  const { data: reserved, error } = await admin.rpc("reserve_unit_service", {
    p_parent: parent,
    p_kind: p.kind,
    p_limit: p.kind === "speech" ? 30 : 120,
  });
  if (error) return json({ error: "Luna is temporarily unavailable" }, 503);
  if (!reserved) return json({ error: "Please try again later" }, 429);
  if (p.kind === "speech") {
    const key = process.env.AZURE_SPEECH_KEY,
      region = process.env.AZURE_SPEECH_REGION;
    if (!key || !region || !/^[a-z0-9-]+$/.test(region))
      return json({ error: "Luna is not configured" }, 503);
    const r = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
      method: "POST",
      headers: { "Ocp-Apim-Subscription-Key": key },
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
    if (!r.ok) return json({ error: "Luna could not connect" }, 503);
    return json({ token: await r.text(), region });
  }
  if (
    !isResponseRubricId(p.rubricId) ||
    !usableResponseTranscript(p.rubricId, p.transcript!, p.confidence, false)
  )
    return json({ verdict: "unclear", reason: "unclear" });
  const result = await evaluateResponse(p.rubricId, p.transcript!, AbortSignal.timeout(12000));
  return json({
    ...result,
    ...(result.verdict === "unclear" || !child
      ? {}
      : {
          receipt: responseReceipt(child, lessonId, p.rubricId, result.verdict === "accepted"),
        }),
  });
}
