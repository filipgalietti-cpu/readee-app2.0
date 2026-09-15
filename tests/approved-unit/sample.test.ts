import { beforeEach, describe, it, expect, vi } from "vitest";
const f = vi.hoisted(() => ({
  user: { id: "parent" } as { id: string } | null,
  rpc: vi.fn(),
  evaluate: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: f.user } }) } }),
}));
vi.mock("@/lib/supabase/admin", () => ({ supabaseAdmin: () => ({ rpc: f.rpc }) }));
vi.mock("@/lib/approved-unit/access", () => ({ unitOneEnabled: () => true }));
vi.mock("@/lib/lesson-engine/response/evaluate", () => ({ evaluateResponse: f.evaluate }));
import { POST } from "@/app/api/approved-unit/sample/route";
import { allowedRubrics } from "@/lib/approved-unit/state";
import { serveUnitSpeech } from "@/lib/approved-unit/speech-service";
import { receiptVerdict } from "@/lib/approved-unit/receipts";
import { isResponseRubricId } from "@/lib/lesson-engine/response/rubrics";
const rubric = [...allowedRubrics("k-unit-1-checkpoint")].find(isResponseRubricId)!;
const payload = { kind: "speech" };
const responsePayload = {
  kind: "response" as const,
  rubricId: rubric,
  transcript: "M.",
  confidence: 0.99,
};
const request = (body: unknown, origin = "https://readee.test") =>
  new Request("https://readee.test/api/approved-unit/sample", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  f.user = { id: "parent" };
  f.rpc.mockReset().mockResolvedValue({ data: true, error: null });
  f.evaluate.mockReset().mockResolvedValue({ verdict: "accepted", reason: "correct" });
  process.env.SUPABASE_SERVICE_ROLE_KEY = "unit-test-signing-only";
  process.env.AZURE_SPEECH_KEY = "local-fixture";
  process.env.AZURE_SPEECH_REGION = "eastus";
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("synthetic-azure-token")));
});
describe("one approved free sample", () => {
  it("requires an authenticated parent before spending a service budget", async () => {
    f.user = null;
    expect((await POST(request(payload))).status).toBe(401);
    expect(f.rpc).not.toHaveBeenCalled();
  });
  it("rejects cross-origin requests", async () => {
    expect((await POST(request(payload, "https://evil.test"))).status).toBe(400);
    expect(f.rpc).not.toHaveBeenCalled();
  });
  it("cannot accept another child or lesson identity from the browser", async () => {
    for (const extra of [{ child: "123" }, { lessonId: "rhyme-time" }])
      expect((await POST(request({ ...payload, ...extra }))).status).toBe(400);
    expect(f.rpc).not.toHaveBeenCalled();
  });
  it("only grades the fixed sample rubric allowlist", async () => {
    expect((await POST(request(responsePayload))).status).toBe(400);
    expect(f.evaluate).not.toHaveBeenCalled();
  });
  it("shares the parent budget and gives no persistent-answer receipt", async () => {
    const r = await POST(request(payload));
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ token: "synthetic-azure-token", region: "eastus" });
    expect(f.rpc).toHaveBeenCalledWith("reserve_unit_service", {
      p_parent: "parent",
      p_kind: "speech",
      p_limit: 30,
    });
    expect(r.headers.get("Cache-Control")).toBe("private, no-store");
  });
  it("stops evaluation when the atomic budget is exhausted or unavailable", async () => {
    f.rpc.mockResolvedValueOnce({ data: false, error: null });
    expect((await POST(request(payload))).status).toBe(429);
    f.rpc.mockResolvedValueOnce({ data: null, error: { message: "unavailable" } });
    expect((await POST(request(payload))).status).toBe(503);
    expect(f.evaluate).not.toHaveBeenCalled();
  });
  it("retains scoped receipts for authorized saved lessons", async () => {
    const r = await serveUnitSpeech("parent", "k-unit-1-checkpoint", responsePayload, "child");
    const b = await r.json();
    expect(receiptVerdict(b.receipt, "child", "k-unit-1-checkpoint", rubric)).toBe(true);
    expect(receiptVerdict(b.receipt, "other-child", "k-unit-1-checkpoint", rubric)).toBeNull();
  });
  it("does not grade oversized or uncertain speech", async () => {
    expect((await POST(request({ ...payload, transcript: "x".repeat(241) }))).status).toBe(400);
    const r = await serveUnitSpeech(
      "parent",
      "k-unit-1-checkpoint",
      { ...responsePayload, confidence: 0 },
      "child",
    );
    expect((await r.json()).verdict).toBe("unclear");
    expect(f.evaluate).not.toHaveBeenCalled();
  });
});
