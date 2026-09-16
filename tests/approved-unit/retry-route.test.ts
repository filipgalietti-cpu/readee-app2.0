import type { SessionState } from "@/lib/approved-unit/state";
import type { StoredExamResult } from "@/lib/approved-unit/exam-retry";
import { beforeEach, expect, it, vi } from "vitest";
const h = vi.hoisted(() => ({
  accessError: 0,
  prior: null as {
    revision: number;
    completed: boolean;
    state: SessionState;
    result: StoredExamResult;
  } | null,
  writes: [] as Record<string, unknown>[],
  rpcError: null as { code: string } | null,
}));
vi.mock("@/lib/approved-unit/access", () => ({
  unitAccess: async () => {
    if (h.accessError) return { error: h.accessError };
    type Query = {
      select: () => Query;
      eq: () => Query;
      maybeSingle: () => Promise<{ data: typeof h.prior; error: null }>;
    };
    const q: Query = {
      select: () => q,
      eq: () => q,
      maybeSingle: async () => ({ data: h.prior, error: null }),
    };
    return {
      user: { id: "parent" },
      db: { from: () => q },
      admin: {
        rpc: async (_name: string, args: Record<string, unknown>) => {
          h.writes.push(args);
          return { data: 4, error: h.rpcError };
        },
      },
    };
  },
}));
vi.mock("@/lib/approved-unit/speech-service", () => ({ serveUnitSpeech: vi.fn() }));
import { POST } from "@/app/api/approved-unit/[lessonId]/route";
const child = "11111111-1111-4111-8111-111111111111";
const attemptId = "22222222-2222-4222-8222-222222222222";
function request(lessonId = "k-unit-1-checkpoint", origin = "http://localhost:3336") {
  return POST(
    new Request(`http://localhost:3336/api/approved-unit/${lessonId}`, {
      method: "POST",
      headers: { origin, "content-type": "application/json" },
      body: JSON.stringify({ child, kind: "retry-exam", attemptId }),
    }),
    { params: Promise.resolve({ lessonId }) },
  );
}
beforeEach(() => {
  h.accessError = 0;
  h.writes = [];
  h.rpcError = null;
  h.prior = {
    revision: 3,
    completed: true,
    state: { practice: { id: attemptId, finished: true } } as SessionState,
    result: { correct: 6, readiness: { status: "practice" } },
  };
});
it("uses the owned revision and existing once-per-release reward latch", async () => {
  expect((await request()).status).toBe(200);
  expect(h.writes[0]).toMatchObject({
    p_parent: "parent",
    p_child: child,
    p_revision: 3,
    p_carrots: 0,
    p_completed: true,
    p_standard: null,
    p_state: {},
    p_result: {
      correct: 0,
      readiness: { status: "more-evidence" },
      history: [{ attemptId, correct: 6 }],
    },
  });
});
it.each([401, 403, 404])("rejects an unauthorized retry (%s) before saving", async (error) => {
  h.accessError = error;
  expect((await request()).status).toBe(error);
  expect(h.writes).toHaveLength(0);
});
it("does not reset a passed exam or a lesson", async () => {
  h.prior!.result.readiness!.status = "ready";
  expect((await request()).status).toBe(409);
  expect((await request("key-details")).status).toBe(400);
  expect(h.writes).toHaveLength(0);
});
it("rejects cross-origin requests", async () => {
  expect((await request("k-unit-1-checkpoint", "https://example.org")).status).toBe(503);
  expect(h.writes).toHaveLength(0);
});
it("makes lost-response retries idempotent", async () => {
  h.prior!.state = {};
  h.prior!.result.previousAttemptId = attemptId;
  expect((await request()).status).toBe(200);
  expect(h.writes).toHaveLength(0);
});
it("reports a racing writer without claiming the restart saved", async () => {
  h.rpcError = { code: "40001" };
  expect((await request()).status).toBe(409);
});
