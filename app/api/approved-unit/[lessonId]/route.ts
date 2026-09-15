import { isDeepStrictEqual } from "node:util";
import { NextResponse } from "next/server";
import { z } from "zod";
import { unitAccess } from "@/lib/approved-unit/access";
import { UNIT_VERSION, approvedLesson } from "@/lib/approved-unit/catalogue";
import { validateState, allowedRubrics, type SessionState } from "@/lib/approved-unit/state";
import { isResponseRubricId, usableResponseTranscript } from "@/lib/lesson-engine/response/rubrics";
import { evaluateResponse } from "@/lib/lesson-engine/response/evaluate";
import { responseReceipt } from "@/lib/approved-unit/receipts";
export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store" };
const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers });
type Context = { params: Promise<{ lessonId: string }> };
async function body(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin) throw Error("origin");
  if (!req.headers.get("content-type")?.startsWith("application/json")) throw Error("body");
  const reader = req.body?.getReader();
  if (!reader) throw Error("body");
  let n = 0,
    text = "";
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    n += value.length;
    if (n > 262144) {
      await reader.cancel();
      throw Error("size");
    }
    text += decoder.decode(value, { stream: true });
  }
  return JSON.parse(text + decoder.decode());
}
const identity = z.object({ child: z.uuid() });
export async function GET(req: Request, { params }: Context) {
  const child = new URL(req.url).searchParams.get("child"),
    p = identity.safeParse({ child });
  if (!p.success) return json({ error: "Invalid reader" }, 400);
  const { lessonId } = await params,
    a = await unitAccess(p.data.child, lessonId);
  if ("error" in a) return json({ error: "Lesson unavailable" }, a.error);
  const { data, error } = await a.db
    .from("approved_unit_sessions")
    .select("revision,state,completed,result,carrots_awarded")
    .eq("child_id", child)
    .eq("release_id", UNIT_VERSION)
    .eq("lesson_id", lessonId)
    .maybeSingle();
  return error
    ? json({ error: "Progress unavailable" }, 503)
    : json(data ?? { revision: 0, state: {}, completed: false, result: null, carrots_awarded: 0 });
}
export async function PUT(req: Request, { params }: Context) {
  try {
    const raw = await body(req),
      p = z
        .object({ child: z.uuid(), revision: z.number().int().min(0), state: z.unknown() })
        .parse(raw);
    const { lessonId } = await params,
      a = await unitAccess(p.child, lessonId);
    if ("error" in a) return json({ error: "Lesson unavailable" }, a.error);
    const { data: prior, error } = await a.db
      .from("approved_unit_sessions")
      .select("state,revision")
      .eq("child_id", p.child)
      .eq("release_id", UNIT_VERSION)
      .eq("lesson_id", lessonId)
      .maybeSingle();
    if (error) return json({ error: "Progress unavailable" }, 503);
    if (prior && prior.revision !== p.revision) {
      if (isDeepStrictEqual(prior.state, p.state)) return json({ revision: prior.revision });
      return json({ error: "This lesson changed in another tab. Reload to continue." }, 409);
    }
    const checked = validateState(lessonId, p.child, p.state, (prior?.state ?? {}) as SessionState);
    const { data: revision, error: saveError } = await a.admin.rpc("save_approved_unit", {
      p_parent: a.user.id,
      p_child: p.child,
      p_release: UNIT_VERSION,
      p_lesson: lessonId,
      p_revision: p.revision,
      p_state: checked.state,
      p_completed: checked.completed,
      p_result: checked.result,
      p_carrots: checked.carrots,
      p_standard: approvedLesson(lessonId)?.standard ?? null,
    });
    if (saveError)
      return json(
        {
          error:
            saveError.code === "40001"
              ? "Progress changed. Reload to continue."
              : "Progress could not save",
        },
        saveError.code === "40001" ? 409 : 503,
      );
    return json({ revision, result: checked.result, completed: checked.completed });
  } catch {
    return json({ error: "The lesson response could not be saved" }, 400);
  }
}
export async function POST(req: Request, { params }: Context) {
  try {
    const raw = await body(req),
      p = z
        .object({
          child: z.uuid(),
          kind: z.enum(["speech", "response"]),
          rubricId: z.string().max(100).optional(),
          transcript: z.string().max(240).optional(),
          confidence: z.number().min(0).max(1).optional(),
        })
        .parse(raw);
    const { lessonId } = await params,
      a = await unitAccess(p.child, lessonId);
    if ("error" in a) return json({ error: "Lesson unavailable" }, a.error);
    if (
      p.kind === "response" &&
      (!isResponseRubricId(p.rubricId) ||
        !allowedRubrics(lessonId).has(p.rubricId) ||
        p.transcript === undefined)
    )
      return json({ error: "Unknown question" }, 400);
    const { data: reserved, error } = await a.admin.rpc("reserve_unit_service", {
      p_parent: a.user.id,
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
      ...(result.verdict === "unclear"
        ? {}
        : {
            receipt: responseReceipt(p.child, lessonId, p.rubricId, result.verdict === "accepted"),
          }),
    });
  } catch {
    return json({ error: "Luna could not check that answer" }, 503);
  }
}
