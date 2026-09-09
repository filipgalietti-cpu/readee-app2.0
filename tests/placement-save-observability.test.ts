import { beforeEach, describe, expect, it, vi } from "vitest";
import { completedSubmission } from "./fixtures/placement-submission";
const mock = vi.hoisted(() => ({ report: vi.fn(), after: vi.fn(), signedIn: true, throws: false, childError: null as any }));
vi.mock("@/lib/observability/critical", () => ({ reportFailure: mock.report }));
vi.mock("next/server", () => ({ NextResponse: { json: (body: unknown, options?: ResponseInit) => Response.json(body, options) }, after: mock.after }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { getUser: async () => { if(mock.throws) throw new Error("provider failure"); return { data: { user: mock.signedIn ? { id: "parent" } : null } }; } },
  from: () => { const q = { select: () => q, eq: () => q, maybeSingle: async () => ({ data: { parent_id: "parent", first_name: "Test", grade: "2nd Grade" }, error: mock.childError }) }; return q; },
}) }));
vi.mock("@/lib/supabase/admin", () => ({ supabaseAdmin: () => ({ rpc: async () => ({ data: null, error: { code: "08006" } }) }) }));
vi.mock("@/lib/ai/vertex-tts", () => ({ generateSpeechVertex: vi.fn() }));
vi.mock("@/lib/email/placement-report", () => ({ sendPlacementReportEmail: vi.fn() }));
vi.mock("@/lib/analytics/funnel.server", () => ({ trackFunnel: vi.fn() }));
import { POST } from "@/app/api/placement/complete/route";
const request = () => new Request("http://localhost/api/placement/complete", { method: "POST", body: JSON.stringify(completedSubmission()) });

describe("placement save reporting", () => {
  beforeEach(() => { vi.clearAllMocks(); mock.signedIn = true; mock.throws = false; mock.childError = null; });
  it("reports a failed atomic save and returns its correlation ID without scheduling emails", async () => {
    const r = await POST(request()); expect(r.status).toBe(500);
    const body = await r.json();
    expect(mock.report).toHaveBeenCalledWith("placement.save", expect.anything(), expect.objectContaining({ requestId: body.requestId, userId: "parent" }));
    expect(mock.after).not.toHaveBeenCalled();
  });
  it("reports an unavailable reader lookup as a retryable failure", async () => {
    mock.childError = { code: "08006" };
    expect((await POST(request())).status).toBe(503);
    expect(mock.report).toHaveBeenCalledWith("placement.child_lookup", expect.anything(), expect.anything());
  });
  it("reports unexpected provider exceptions", async () => {
    mock.throws = true; expect((await POST(request())).status).toBe(500);
    expect(mock.report).toHaveBeenCalledWith("placement.complete", expect.anything(), expect.anything());
  });
  it("keeps ordinary signed-out responses out of the error feed", async () => {
    mock.signedIn = false; expect((await POST(request())).status).toBe(401);
    expect(mock.report).not.toHaveBeenCalled();
  });
});
