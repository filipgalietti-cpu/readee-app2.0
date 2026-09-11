import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  user: { id: "parent" } as { id: string } | null,
  rows: {} as Record<string, any>,
  filters: [] as unknown[][],
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: state.user } }) },
    from: (table: string) => {
      const q: any = {
        select: () => q,
        eq: (...args: unknown[]) => {
          state.filters.push([table, ...args]);
          return q;
        },
        order: () => q,
        limit: () => q,
        single: async () => state.rows[table],
        maybeSingle: async () => state.rows[table],
        then: (resolve: (v: unknown) => unknown) =>
          Promise.resolve(state.rows[table]).then(resolve),
      };
      return q;
    },
  }),
}));
import { loadJourneySnapshot } from "@/lib/journey/load.server";
beforeEach(() => {
  state.user = { id: "parent" };
  state.filters = [];
  state.rows = {
    children: { data: { id: "reader", first_name: "Synthetic" } },
    profiles: { data: { plan: "premium", created_at: "2026-09-13", had_subscription: true } },
    practice_results: { data: [] },
    lessons_progress: { data: [] },
    placements: { data: null },
  };
});
it("resolves owned reader, billing, and progress before painting the journey", async () => {
  const result = await loadJourneySnapshot("reader");
  expect(result?.billing).toEqual({
    fullAccess: true,
    eligibleForTrial: false,
    signupAt: "2026-09-13",
  });
  expect(state.filters).toContainEqual(["children", "parent_id", "parent"]);
  expect(state.filters).toContainEqual(["children", "id", "reader"]);
  expect(state.filters).toContainEqual(["profiles", "id", "parent"]);
  expect(state.filters).toContainEqual(["placements", "child_id", "reader"]);
});
it("does not read another child's placement when ownership fails", async () => {
  state.rows.children = { data: null };
  expect(await loadJourneySnapshot("not-owned")).toBeNull();
  expect(state.filters.some((f) => f[0] === "placements")).toBe(false);
  state.user = null;
  state.filters = [];
  expect(await loadJourneySnapshot()).toBeNull();
  expect(state.filters).toEqual([]);
});
it.each(["profiles", "placements", "practice_results", "lessons_progress"])(
  "surfaces %s failures without inventing a free plan or losing progress",
  async (table) => {
    state.rows[table] = { data: null, error: { message: "unavailable" } };
    await expect(loadJourneySnapshot("reader")).rejects.toThrow("reading journey");
  },
);
