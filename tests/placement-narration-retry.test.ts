import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ signedIn: true, owns: true, generate: vi.fn(async () => {}) }));
vi.mock("next/server", () => ({ NextResponse: { json: (data: unknown, options?: ResponseInit) => Response.json(data, options) } }));
vi.mock("@/lib/observability/critical", () => ({ reportFailure: vi.fn() }));
vi.mock("@/lib/placement/generate-narration", () => ({ generatePlacementNarration: state.generate }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({
  auth: { getUser: async () => ({ data: { user: state.signedIn ? { id: "parent" } : null } }) },
  from: (table: string) => {
    const filters: Record<string, unknown> = {};
    const q = { select: () => q, eq: (key: string, value: unknown) => { filters[key] = value; return q; }, order: () => q, limit: () => q,
      maybeSingle: async () => ({ data: table === "children" ? state.owns && filters.parent_id === "parent" ? { id: filters.id, first_name: "Reader", name_said_as: null } : null : { id: "saved-placement" } }) };
    return q;
  },
}) }));
import { POST } from "@/app/api/placement/narration/route";
const childId = "00000000-0000-4000-8000-000000000001";
const request = (body: object) => new Request("https://learn.readee.app/api/placement/narration", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
beforeEach(() => { state.signedIn = true; state.owns = true; state.generate.mockReset().mockResolvedValue(undefined); });
it("only retries the owned server-authored report, ignoring supplied narration text", async () => {
  expect((await POST(request({ childId, text: "Untrusted text", placementId: "another-placement" }))).status).toBe(200);
  expect(state.generate).toHaveBeenCalledWith("saved-placement", "Reader", null);
});
it("rejects unauthenticated and cross-parent retries without generation", async () => {
  state.signedIn = false;
  expect((await POST(request({ childId }))).status).toBe(401);
  state.signedIn = true; state.owns = false;
  expect((await POST(request({ childId }))).status).toBe(404);
  expect(state.generate).not.toHaveBeenCalled();
});
it("returns a retryable failure instead of claiming audio exists", async () => {
  state.generate.mockRejectedValue(new Error("backend failure"));
  expect((await POST(request({ childId }))).status).toBe(503);
});
