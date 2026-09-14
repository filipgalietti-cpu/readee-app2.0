import { beforeEach, expect, it, vi } from "vitest";

const s = vi.hoisted(() => ({
  // What the database holds right now; a concurrent webhook flips linkedSub.
  linkedSub: null as string | null,
  reads: 0,
  updates: 0,
  // "once": a concurrent webhook links sub_1 right after our first read.
  // "always": the row changes after every read, so no compare-and-swap lands.
  writer: "once" as "once" | "always" | "never",
  updateError: null as { message: string } | null,
}));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    subscriptions: {
      list: () => ({
        async *[Symbol.asyncIterator]() {
          yield { id: "sub_1", status: "active", created: 1, items: { data: [{ price: { id: "price_plus" } }] } };
        },
      }),
    },
  },
  planFromPriceId: (id: string | undefined) => (id === "price_plus" ? "premium" : null),
}));

vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: () => ({
    from: () => {
      let expectedLinked: string | null | undefined;
      const q = {
        select: () => q,
        eq: (column: string, value: string) => {
          if (column === "stripe_subscription_id") expectedLinked = value;
          return q;
        },
        is: (column: string, value: null) => {
          if (column === "stripe_subscription_id") expectedLinked = value;
          return q;
        },
        update: () => {
          s.updates++;
          return q;
        },
        maybeSingle: async () => {
          if (expectedLinked === undefined) {
            // The profile read.
            s.reads++;
            const snapshot = { id: "profile", email: "p@example.com", stripe_subscription_id: s.linkedSub };
            if (s.writer === "once" && s.reads === 1) s.linkedSub = "sub_1";
            if (s.writer === "always") s.linkedSub = `sub_other_${s.reads}`;
            return { data: snapshot, error: null };
          }
          // The compare-and-swap write: matches only when the row still looks like the snapshot.
          if (s.updateError) return { data: null, error: s.updateError };
          if (expectedLinked !== s.linkedSub) return { data: null, error: null };
          return { data: { id: "profile", email: "p@example.com" }, error: null };
        },
      };
      return q;
    },
  }),
}));

import { syncCustomerSubscription } from "@/lib/billing/sync-subscription";

beforeEach(() => {
  s.linkedSub = null;
  s.reads = 0;
  s.updates = 0;
  s.writer = "once";
  s.updateError = null;
});

it("re-reads and settles when a concurrent webhook linked the subscription first", async () => {
  const result = await syncCustomerSubscription("cus_1", "sub_1");
  expect(result.profile).toEqual({ id: "profile", email: "p@example.com" });
  expect(result.subscription?.id).toBe("sub_1");
  expect(s.reads).toBe(2);
  expect(s.updates).toBe(2);
});

it("does not retry errors that a re-read cannot fix", async () => {
  s.writer = "never";
  s.updateError = { message: "permission denied" };
  await expect(syncCustomerSubscription("cus_1", "sub_1")).rejects.toMatchObject({ message: "permission denied" });
  expect(s.updates).toBe(1);
});

it("gives up after three attempts so Stripe's own retry takes over", async () => {
  // The row keeps changing under us: every compare-and-swap misses.
  s.writer = "always";
  await expect(syncCustomerSubscription("cus_1", "sub_1")).rejects.toMatchObject({ code: "stripe_profile_changed" });
  expect(s.updates).toBe(3);
});
