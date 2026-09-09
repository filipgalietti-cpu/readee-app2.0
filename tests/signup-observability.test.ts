import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ fail: "", report: vi.fn() }));
vi.mock("@/lib/observability/critical", () => ({ reportFailure: mock.report }));
vi.mock("@/lib/audio/child-greeting", () => ({ synthesizeChildGreeting: vi.fn() }));
vi.mock("@/lib/plan/access", () => ({ hasFullAccessFromProfile: () => false }));
vi.mock("resend", () => ({ Resend: class { emails = { send: async () => ({ data: { id: "mail" }, error: null }) }; } }));
vi.mock("@/lib/supabase/admin", () => ({ supabaseAdmin: () => ({
  auth: { admin: {
    createUser: async () => mock.fail === "auth" ? { error: { code: "unexpected_failure", message: "Auth failed" } } : { data: { user: { id: "parent" } } },
    generateLink: async () => ({ data: { properties: { action_link: "https://example.invalid/reset" } } }),
  } },
  from: (table: string) => {
    let insert = false;
    const result = () => ({ data: insert && table === "children" ? [] : { id: "signup", plan: "free" }, count: 0,
      error: insert && mock.fail === table ? { code: "08006", message: "database unavailable" } : null });
    const q: any = { select: () => q, eq: () => q, gte: () => q, insert: () => { insert = true; return q; },
      single: async () => result(), maybeSingle: async () => result(), then: (resolve: any) => resolve(result()) };
    return q;
  },
}) }));
import { POST } from "@/app/api/signups/route";
const request = () => new Request("http://localhost/api/signups", { method: "POST", headers: { Origin: "https://learn.readee.app", "Content-Type": "application/json" }, body: JSON.stringify({ role: "parent", first_name: "Test", last_name: "Parent", email: "test@example.invalid", children: [{ name: "Test", grade: "2nd Grade" }] }) }) as any;

describe("signup failures reach operational monitoring", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.stubEnv("TURNSTILE_SECRET_KEY", ""); vi.spyOn(console, "log").mockImplementation(() => {}); });
  afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });
  it.each([["signups", "signup.save"], ["auth", "signup.auth_create"], ["profiles", "signup.profile_create"], ["children", "signup.children_create"]])("captures a failed %s operation", async (stage, operation) => {
    mock.fail = stage;
    const response = await POST(request());
    expect(response.status).toBe(stage === "signups" ? 500 : 201);
    expect(mock.report).toHaveBeenCalledWith(operation, expect.objectContaining({ code: stage === "auth" ? "unexpected_failure" : "08006" }), expect.objectContaining({ route: "/api/signups", requestId: expect.any(String) }));
  });
});
