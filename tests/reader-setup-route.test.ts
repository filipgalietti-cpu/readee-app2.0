import { beforeEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  signedIn: true,
  rows: [] as any[],
  inserted: [] as any[],
  reads: [] as any[],
  insertError: false,
  committedError: false,
  readError: false,
  after: vi.fn(),
  report: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
}));
vi.mock("@/lib/auth/helpers", () => ({
  requireProfile: async () => ({ id: "parent-a", role: "parent" }),
}));
vi.mock("@/lib/audio/child-greeting", () => ({ synthesizeChildNamePack: vi.fn() }));
vi.mock("next/server", () => ({
  NextResponse: { json: (body: unknown, options?: ResponseInit) => Response.json(body, options) },
  after: state.after,
}));
vi.mock("@/lib/observability/critical", () => ({ reportFailure: state.report }));
vi.mock("@/lib/analytics/funnel.server", () => ({ trackFunnel: vi.fn() }));
vi.mock("@/lib/email/lifecycle", () => ({ sendWelcomeEmailNow: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ supabaseAdmin: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: state.signedIn ? { id: "parent-a" } : null } }) },
    from: (table: string) => {
      let payload: any,
        operation = "read",
        single = false;
      const filters: Record<string, string> = {};
      const q: any = {
        select: () => q,
        eq: (key: string, value: string) => {
          filters[key] = value;
          return q;
        },
        order: () => q,
        limit: () => q,
        insert: (body: any) => {
          payload = body;
          operation = "insert";
          return q;
        },
        update: () => {
          operation = "update";
          return q;
        },
        maybeSingle: () => {
          single = true;
          return q;
        },
        then: (resolve: any, reject: any) =>
          Promise.resolve()
            .then(() => {
              if (operation === "insert") {
                state.inserted.push(payload);
                if (!state.insertError || state.committedError) state.rows.push(payload);
                return {
                  error: state.insertError || state.committedError ? { code: "08006" } : null,
                };
              }
              if (operation === "update") return { error: null };
              state.reads.push({ table, filters: { ...filters } });
              const rows = state.rows.filter((r) =>
                Object.entries(filters).every(([k, v]) => r[k] === v),
              );
              return {
                data: single ? (rows[0] ?? null) : rows,
                error: state.readError ? { code: "08006" } : null,
              };
            })
            .then(resolve, reject),
      };
      return q;
    },
  }),
}));
import { POST } from "@/app/api/onboarding/reader/route";
import ReaderSetupPage from "@/app/(protected)/placement/setup/page";
import ReaderHandoff from "@/app/(protected)/placement/ready/page";
import PlacementPage from "@/app/(protected)/placement/page";
const body = { requestId: "22222222-2222-4222-8222-222222222222", first_name: "", grade: "4th" };
const request = (data: any = body) =>
  new Request("http://localhost/api/onboarding/reader", {
    method: "POST",
    body: JSON.stringify(data),
  });
describe("parent-led reader setup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(state, {
      signedIn: true,
      rows: [],
      inserted: [],
      reads: [],
      insertError: false,
      committedError: false,
      readError: false,
    });
  });
  it("routes a new parent's saved reader through the handoff into the current K–4 runner", async () => {
    const setup = await ReaderSetupPage();
    expect(setup.props.parentId).toBe("parent-a");
    const response = await POST(request());
    const saved = await response.json();
    expect(saved.childId).toBe(body.requestId);
    const handoff = await ReaderHandoff({
      searchParams: Promise.resolve({ child: saved.childId }),
    });
    expect(handoff.props).toMatchObject({
      name: "Reader",
      gradeLabel: "Grade 4",
      startHref: `/placement?child=${saved.childId}`,
    });
    const runner = await PlacementPage({
      searchParams: Promise.resolve({ child: saved.childId, retake: "1" }),
    });
    expect(runner.props).toMatchObject({
      childId: saved.childId,
      childName: "Reader",
      enrolled: 4,
    });
    expect(state.inserted).toHaveLength(1);
  });
  it("saves the first form with a default nickname and the real enrollment grade", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(state.inserted).toEqual([
      expect.objectContaining({
        id: body.requestId,
        parent_id: "parent-a",
        first_name: "Reader",
        grade: "4th",
      }),
    ]);
    expect(state.inserted[0]).not.toHaveProperty("reading_level");
    expect(state.after).toHaveBeenCalledTimes(1);
  });
  it("replays a lost response without creating a second reader or resending welcome work", async () => {
    await POST(request());
    const replay = await POST(request());
    expect(await replay.json()).toMatchObject({
      ok: true,
      childId: body.requestId,
      replayed: true,
    });
    expect(state.inserted).toHaveLength(1);
    expect(state.after).toHaveBeenCalledTimes(1);
  });
  it("recovers an insert that committed before reporting an error", async () => {
    state.committedError = true;
    expect((await POST(request())).status).toBe(200);
    expect(state.rows).toHaveLength(1);
    expect(state.after).not.toHaveBeenCalled();
  });
  it.each([undefined, null, "", "5th", "unknown"])(
    "rejects a missing or unsupported grade: %s",
    async (grade) => {
      expect((await POST(request({ ...body, grade }))).status).toBe(400);
      expect(state.inserted).toHaveLength(0);
    },
  );
  it("never accepts a supplied parent identity", async () => {
    await POST(request({ ...body, parent_id: "parent-b" }));
    expect(state.inserted[0].parent_id).toBe("parent-a");
    expect(state.reads.every((r) => r.filters.parent_id === "parent-a")).toBe(true);
  });
  it("keeps a failed lookup from creating a duplicate", async () => {
    state.readError = true;
    expect((await POST(request())).status).toBe(503);
    expect(state.inserted).toHaveLength(0);
    expect(state.report).toHaveBeenCalled();
  });
  it("reports save errors and leaves the same request retryable", async () => {
    state.insertError = true;
    expect((await POST(request())).status).toBe(503);
    state.insertError = false;
    expect((await POST(request())).status).toBe(200);
    expect(state.rows).toHaveLength(1);
    expect(state.rows[0].id).toBe(body.requestId);
  });
  it("does not treat another parent's reader as a replay", async () => {
    state.rows = [{ id: body.requestId, parent_id: "parent-b" }];
    state.insertError = true;
    expect((await POST(request())).status).toBe(503);
    expect(state.after).not.toHaveBeenCalled();
  });
  it("sends an existing parent back to their dashboard instead of adding a reader", async () => {
    state.rows = [{ id: "another", parent_id: "parent-a" }];
    expect((await POST(request())).status).toBe(409);
    expect(state.inserted).toHaveLength(0);
  });
  it("requires authentication", async () => {
    state.signedIn = false;
    expect((await POST(request())).status).toBe(401);
    expect(state.inserted).toHaveLength(0);
  });
});
