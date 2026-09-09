import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ event: {} as any, subscriptions: [] as any[], profile: {} as any, readError: null as any, writeError: null as any, noWrite: false, listError: false, writes: [] as any[], report: vi.fn(), grant: vi.fn() }));
vi.mock("@/lib/stripe", () => ({ stripe: { webhooks: { constructEvent: () => mock.event }, subscriptions: { list: async function* () { if(mock.listError) throw new Error("Stripe unavailable"); yield* mock.subscriptions; } } }, planFromPriceId: (id: string) => id === "known-price" ? "premium" : null }));
vi.mock("@/lib/supabase/admin", () => ({ supabaseAdmin: () => ({ from: () => {
  let patch: any;
  const q = { select: () => q, eq: () => q, is: () => q, update: (value: any) => { patch = value; return q; }, maybeSingle: async () => {
    if (!patch) return { data: mock.profile, error: mock.readError };
    if (mock.writeError || mock.noWrite) return { data: null, error: mock.writeError };
    mock.writes.push(patch); Object.assign(mock.profile, patch); return { data: mock.profile, error: null };
  } }; return q;
} }) }));
vi.mock("@/lib/observability/critical", () => ({ reportFailure: mock.report }));
vi.mock("@/lib/ai/credit-balance", () => ({ grantTopUp: mock.grant }));
vi.mock("@/lib/analytics/funnel.server", () => ({ trackFunnel: vi.fn() }));
vi.mock("@/lib/email/notify-team", () => ({ notifyTeam: vi.fn() }));
vi.mock("@/lib/email/cadence", () => ({ sendTrialEndingEmail: vi.fn(), sendTrialStartedEmail: vi.fn(), sendWinBackEmail: vi.fn() }));
import { POST } from "@/app/api/webhooks/stripe/route";
const sub = (id: string, status = "active", created = 100) => ({ id, status, created, customer: "cus_test", items: { data: [{ price: { id: "known-price" } }] } });
const request = () => new Request("http://localhost/api/webhooks/stripe", { method: "POST", headers: { "stripe-signature": "test" }, body: "{}" }) as any;
const checkout = () => ({ id: "evt_checkout", type: "checkout.session.completed", data: { object: { id: "cs_test", mode: "subscription", customer: "cus_test", subscription: "sub_current" } } });

describe("Stripe fulfillment and retries", () => {
  beforeEach(() => {
    vi.clearAllMocks(); mock.event = checkout(); mock.subscriptions = [sub("sub_current")];
    mock.profile = { id: "parent", stripe_subscription_id: null }; mock.readError = null; mock.writeError = null; mock.noWrite = false; mock.listError = false; mock.writes = [];
  });
  it.each(["missing", "database", "provider", "concurrent", "missing-subscription", "unknown-price"])("returns retryable failure and an actionable event on %s failure", async (kind) => {
    if (kind === "missing") mock.profile = null;
    if (kind === "database") mock.writeError = { code: "08006" };
    if (kind === "provider") mock.listError = true;
    if (kind === "concurrent") mock.noWrite = true;
    if (kind === "missing-subscription") mock.subscriptions = [];
    if (kind === "unknown-price") mock.subscriptions[0].items.data[0].price.id = "unknown";
    expect((await POST(request())).status).toBe(503);
    expect(mock.report).toHaveBeenCalledWith("stripe.fulfillment", expect.anything(), expect.objectContaining({ eventId: "evt_checkout" }));
  });
  it("grants access after a retry and repeat delivery leaves entitlement unchanged", async () => {
    mock.writeError = { code: "08006" };
    expect((await POST(request())).status).toBe(503);
    mock.writeError = null;
    expect((await POST(request())).status).toBe(200);
    const fulfilled = { ...mock.profile };
    expect((await POST(request())).status).toBe(200);
    expect(mock.profile).toEqual(fulfilled);
    expect(mock.profile.plan).toBe("premium");
    expect(mock.grant).not.toHaveBeenCalled();
  });
  it("a delayed checkout cannot revive a canceled subscription", async () => {
    mock.subscriptions = [sub("sub_current", "canceled")];
    expect((await POST(request())).status).toBe(200);
    expect(mock.profile.plan).toBe("free");
  });
  it("an old deletion cannot downgrade a new active subscription", async () => {
    mock.profile.stripe_subscription_id = "sub_new";
    mock.subscriptions = [sub("sub_old", "canceled", 100), sub("sub_new", "active", 200)];
    mock.event = { id: "evt_delete", type: "customer.subscription.deleted", data: { object: sub("sub_old", "canceled") } };
    expect((await POST(request())).status).toBe(200);
    expect(mock.profile).toMatchObject({ plan: "premium", stripe_subscription_id: "sub_new" });
  });
  it("does not acknowledge an unsuccessful credit grant", async () => {
    mock.event = { id: "evt_credit", type: "checkout.session.completed", data: { object: { id: "cs_credit", mode: "payment", payment_status: "paid", metadata: { kind: "ai_credit_pack", supabase_user_id: "parent", pool: "parent", credits: "250" } } } };
    mock.grant.mockResolvedValue({ ok: false, error: "db" });
    expect((await POST(request())).status).toBe(503);
    mock.grant.mockResolvedValue({ ok: true });
    expect((await POST(request())).status).toBe(200);
    expect(mock.grant).toHaveBeenLastCalledWith(expect.objectContaining({ stripeCheckoutSessionId: "cs_credit" }));
  });
});
