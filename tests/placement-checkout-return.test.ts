import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ owns: true, signedIn: true, usedTrial: false, sessions: vi.fn(async (_params: Record<string, unknown>) => ({ url: "https://checkout.stripe.com/test" })) }));
vi.mock("next/server", () => ({ NextResponse: { json: (body: unknown, init?: ResponseInit) => Response.json(body, init) } }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { getUser: async () => ({ data: { user: state.signedIn ? { id: "parent-a", email: "synthetic@example.test" } : null } }) } }) }));
vi.mock("@/lib/supabase/admin", () => ({ supabaseAdmin: () => ({ from: (table: string) => {
  const filters: Record<string, string> = {};
  const query: any = { select: () => query, eq: (key: string, value: string) => { filters[key] = value; return query; },
    single: async () => ({ data: { stripe_customer_id: "cus_synthetic", had_subscription: state.usedTrial } }),
    maybeSingle: async () => ({ data: state.owns && table === "children" && filters.parent_id === "parent-a" ? { id: filters.id } : null, error: null }) };
  return query;
} }) }));
vi.mock("@/lib/stripe", () => ({ stripe: { checkout: { sessions: { create: state.sessions } } }, PRICES: { monthly: "price_monthly", annual: "price_annual" } }));
import { POST } from "@/app/api/checkout/route";
const childId = "00000000-0000-4000-8000-000000000001";
const request = (body: object) => new Request("https://learn.readee.app/api/checkout", { method: "POST", headers: { origin: "https://learn.readee.app", "Content-Type": "application/json" }, body: JSON.stringify(body) }) as any;
beforeEach(() => { state.owns = true; state.signedIn = true; state.usedTrial = false; state.sessions.mockClear(); });
it("requires a card and returns an owned placement journey after checkout", async () => {
  const response = await POST(request({ billing: "monthly", childId, cancelTo: `/journey?child=${childId}&from=placement` }));
  expect(response.status).toBe(200);
  expect(state.sessions).toHaveBeenCalledWith(expect.objectContaining({ payment_method_collection: "always", subscription_data: { trial_period_days: 14 }, line_items: [{ price: "price_monthly", quantity: 1 }], success_url: `https://learn.readee.app/journey?child=${childId}&checkout=success`, cancel_url: `https://learn.readee.app/journey?child=${childId}&from=placement` }));
});
it("does not start checkout for another parent's reader", async () => {
  state.owns = false;
  expect((await POST(request({ billing: "annual", childId }))).status).toBe(404);
  expect(state.sessions).not.toHaveBeenCalled();
});
it("retains existing dashboard checkout and does not repeat a used trial", async () => {
  state.usedTrial = true;
  await POST(request({ billing: "annual" }));
  const sent = state.sessions.mock.calls[0][0] as any;
  expect(sent.subscription_data).toBeUndefined();
  expect(sent.success_url).toBe("https://learn.readee.app/dashboard?checkout=success");
});
it("rejects invalid billing and unauthenticated requests before Stripe", async () => {
  expect((await POST(request({ billing: "invalid" }))).status).toBe(400);
  state.signedIn = false;
  expect((await POST(request({ billing: "monthly", childId }))).status).toBe(401);
  expect(state.sessions).not.toHaveBeenCalled();
});
