import { examRetry, type StoredExamResult } from "@/lib/approved-unit/exam-retry";
import { isDeepStrictEqual } from "node:util";
import { NextResponse } from "next/server";
import { z } from "zod";
import { unitAccess } from "@/lib/approved-unit/access";
import { UNIT_VERSION, approvedLesson } from "@/lib/approved-unit/catalogue";
import { validateState, type SessionState } from "@/lib/approved-unit/state";
import { unitRequestBody } from "@/lib/approved-unit/request";
import { serveUnitSpeech } from "@/lib/approved-unit/speech-service";
export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store" };
const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers });
type Context = { params: Promise<{ lessonId: string }> };
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
    const raw = await unitRequestBody(req),
      p = z
        .object({ child: z.uuid(), revision: z.number().int().min(0), state: z.unknown() })
        .parse(raw);
    const { lessonId } = await params,
      a = await unitAccess(p.child, lessonId);
    if ("error" in a) return json({ error: "Lesson unavailable" }, a.error);
    const { data: prior, error } = await a.db
      .from("approved_unit_sessions")
      .select("state,revision,result")
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
    if (lessonId === "k-unit-1-checkpoint" && checked.result && prior?.result) {
      const previous = prior.result as StoredExamResult;
      checked.result.history = previous.history ?? [];
      checked.result.previousAttemptId = previous.previousAttemptId;
    }
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
    const raw = await unitRequestBody(req),
      p = z
        .object({
          child: z.uuid(),
          kind: z.enum(["speech", "response", "retry-exam"]),
          attemptId: z.uuid().optional(),
          rubricId: z.string().max(100).optional(),
          transcript: z.string().max(240).optional(),
          confidence: z.number().min(0).max(1).optional(),
        })
        .parse(raw);
    const { lessonId } = await params,
      a = await unitAccess(p.child, lessonId);
    if ("error" in a) return json({ error: "Lesson unavailable" }, a.error);
    if (p.kind === "retry-exam") {
      if (lessonId !== "k-unit-1-checkpoint" || !p.attemptId)
        return json({ error: "Invalid exam" }, 400);
      const { data: prior, error } = await a.db
        .from("approved_unit_sessions")
        .select("state,result,revision,completed")
        .eq("child_id", p.child)
        .eq("release_id", UNIT_VERSION)
        .eq("lesson_id", lessonId)
        .maybeSingle();
      if (error) return json({ error: "Results unavailable" }, 503);
      if (!prior?.completed) return json({ error: "Finish this exam first" }, 409);
      let retry;
      try {
        retry = examRetry(
          prior as { state: SessionState; result: StoredExamResult | null },
          p.attemptId,
        );
      } catch {
        return json({ error: "This exam changed. Reload to continue." }, 409);
      }
      if (!retry) return json({ revision: prior.revision });
      const saved = await a.admin.rpc("save_approved_unit", {
        p_parent: a.user.id,
        p_child: p.child,
        p_release: UNIT_VERSION,
        p_lesson: lessonId,
        p_revision: prior.revision,
        p_state: retry.state,
        p_completed: true,
        p_result: retry.result,
        p_carrots: 0,
        p_standard: null,
      });
      if (saved.error)
        return json(
          { error: "The exam could not restart. Reload to continue." },
          saved.error.code === "40001" ? 409 : 503,
        );
      return json({ revision: saved.data });
    }
    return await serveUnitSpeech(a.user.id, lessonId, { ...p, kind: p.kind }, p.child);
  } catch {
    return json({ error: "Luna could not check that answer" }, 503);
  }
}
