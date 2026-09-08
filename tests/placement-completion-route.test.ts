import { beforeEach, describe, expect, it, vi } from "vitest";
import { completedSubmission } from "./fixtures/placement-submission";

const mock = vi.hoisted(() => ({ rpc: vi.fn(), after: vi.fn(), parent: "parent-a" }));
vi.mock("next/server", () => ({ NextResponse: { json: (body: unknown, opts?: ResponseInit) => Response.json(body, opts) }, after: mock.after }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({
  auth: { getUser: async () => ({ data: { user: { id: "parent-a" } } }) },
  from: () => { const q = { select: () => q, eq: () => q, maybeSingle: async () => ({ data: { id: "11111111-1111-4111-8111-111111111111", parent_id: mock.parent, grade: "2nd Grade", first_name: "Reader" } }) }; return q; },
}) }));
vi.mock("@/lib/supabase/admin", () => ({ supabaseAdmin: () => ({ rpc: mock.rpc }) }));
vi.mock("@/lib/ai/vertex-tts", () => ({ generateSpeechVertex: vi.fn() }));
vi.mock("@/lib/email/placement-report", () => ({ sendPlacementReportEmail: vi.fn() }));
vi.mock("@/lib/analytics/funnel.server", () => ({ trackFunnel: vi.fn(async () => {}) }));
import { POST } from "@/app/api/placement/complete/route";
const request = (body = completedSubmission()) => new Request("http://localhost/api/placement/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

describe("placement commit boundary", () => {
  beforeEach(() => { vi.clearAllMocks(); mock.parent = "parent-a"; });
  it("does not report success or generate narration if the transaction fails", async () => {
    mock.rpc.mockResolvedValue({ data: null, error: { message: "database failure" } });
    const response = await POST(request());
    expect(response.status).toBe(500);
    expect((await response.json()).ok).toBe(false);
    expect(mock.after).not.toHaveBeenCalled();
  });
  it("returns the existing placement without regenerating narration on retry", async () => {
    mock.rpc.mockResolvedValue({ data: [{ placement_id: "saved", replayed: true }], error: null });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect((await response.json()).placementId).toBe("saved");
    expect(mock.after).not.toHaveBeenCalled();
  });
  it("commits all required state together and schedules narration afterward", async () => {
    mock.rpc.mockResolvedValue({ data: [{ placement_id: "saved", replayed: false }], error: null });
    expect((await POST(request())).status).toBe(200);
    expect(mock.rpc).toHaveBeenCalledWith("complete_placement", expect.objectContaining({ p_parent: "parent-a", p_session: completedSubmission().sessionId, p_placement: expect.any(Object), p_assessment: expect.any(Object), p_seeds: expect.any(Array) }));
    expect(mock.after).toHaveBeenCalledOnce();
  });
  it("rejects another family's child before making privileged writes", async () => {
    mock.parent = "parent-b";
    expect((await POST(request())).status).toBe(404);
    expect(mock.rpc).not.toHaveBeenCalled();
  });
  it("rejects impossible evidence before making privileged writes", async () => {
    const sub = completedSubmission(); sub.comprehension!.correct = 999;
    expect((await POST(request(sub))).status).toBe(400);
    expect(mock.rpc).not.toHaveBeenCalled();
  });
  it("returns a retryable limit response without extra provider work", async () => {
    mock.rpc.mockResolvedValue({ data: null, error: { message: "placement daily limit" } });
    expect((await POST(request())).status).toBe(429);
    expect(mock.after).not.toHaveBeenCalled();
  });
});
