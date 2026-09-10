import { beforeEach, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ failedTable: "", parent: "audit-parent" }));
vi.mock("next/server", () => ({ NextResponse: { json: (body: unknown, opts?: ResponseInit) => Response.json(body, opts) } }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({
  auth: { getUser: async () => ({ data: { user: { id: "audit-parent" } } }) },
  from: (table: string) => {
    const q = { select: () => q, eq: () => q, order: () => q, limit: () => q, maybeSingle: async () => table === mock.failedTable
      ? { data: null, error: { message: "database unavailable" } }
      : { data: table === "children" ? { id: "11111111-1111-4111-8111-111111111111", parent_id: mock.parent, first_name: "Reader" } : null, error: null } };
    return q;
  },
}) }));
import { GET } from "@/app/api/placement/result/route";
const request = () => new Request("http://localhost/api/placement/result?child=11111111-1111-4111-8111-111111111111");
beforeEach(() => { mock.failedTable = ""; mock.parent = "audit-parent"; });
it.each(["children", "placements"])("returns a retryable error for a failed %s query", async (table) => {
  mock.failedTable = table;
  const response = await GET(request());
  expect(response.status).toBe(503);
  expect((await response.json()).ok).toBe(false);
});
it("returns an empty plan only when the query succeeded", async () => {
  const response = await GET(request());
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ ok: true, result: null });
});
it("still rejects another family's child", async () => {
  mock.parent = "another-parent";
  expect((await GET(request())).status).toBe(404);
});
