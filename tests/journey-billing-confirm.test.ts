import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  signedIn: true,
  customer: "cus_owned" as string | null,
  error: null as object | null,
  sync: vi.fn(),
  filters: [] as unknown[][],
  failure: vi.fn(),
}));
vi.mock("next/server", () => ({
  NextResponse: { json: (body: unknown, init?: ResponseInit) => Response.json(body, init) },
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: state.signedIn ? { id: "parent" } : null } }) },
    from: () => {
      const q = {
        select: () => q,
        eq: (...args: unknown[]) => {
          state.filters.push(args);
          return q;
        },
        single: async () => ({ data: { stripe_customer_id: state.customer }, error: state.error }),
      };
      return q;
    },
  }),
}));
vi.mock("@/lib/billing/sync-subscription", () => ({
  syncCustomerSubscription: state.sync,
  grantsSubscriptionAccess: (s: { status: string }) =>
    ["trialing", "active", "past_due"].includes(s.status),
}));
vi.mock("@/lib/observability/critical", () => ({ reportFailure: state.failure }));
import { POST } from "@/app/api/billing/confirm/route";
beforeEach(() => {
  state.signedIn = true;
  state.customer = "cus_owned";
  state.error = null;
  state.filters = [];
  state.sync.mockReset();
  state.failure.mockClear();
});
it("uses the signed-in parent's customer and actual Stripe state", async () => {
  state.sync.mockResolvedValue({ subscription: { status: "trialing" } });
  expect(await (await POST()).json()).toEqual({ ok: true, fullAccess: true });
  expect(state.filters).toEqual([["id", "parent"]]);
  expect(state.sync).toHaveBeenCalledWith("cus_owned");
});
it.each([null, { status: "canceled" }, { status: "incomplete" }])(
  "does not grant access from a success URL without an eligible subscription",
  async (subscription) => {
    state.sync.mockResolvedValue({ subscription });
    expect((await (await POST()).json()).fullAccess).toBe(false);
  },
);
it("keeps reconciliation failure retryable and observable", async () => {
  state.sync.mockRejectedValue(new Error("provider detail"));
  const response = await POST();
  expect(response.status).toBe(503);
  expect(JSON.stringify(await response.json())).not.toContain("provider detail");
  expect(state.failure).toHaveBeenCalled();
});
it("requires authentication and a linked customer", async () => {
  state.signedIn = false;
  expect((await POST()).status).toBe(401);
  state.signedIn = true;
  state.customer = null;
  expect((await (await POST()).json()).fullAccess).toBe(false);
  expect(state.sync).not.toHaveBeenCalled();
});
