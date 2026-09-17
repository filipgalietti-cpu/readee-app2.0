import { beforeEach, expect, it, vi } from "vitest";
const h = vi.hoisted(() => ({
  user: { id: "parent" } as { id: string } | null,
  reader: null as { id: string; first_name: string } | null,
  tables: [] as string[],
  filters: [] as unknown[][],
  resultError: false,
}));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw Error("redirect:" + path);
  },
  notFound: () => {
    throw Error("not-found");
  },
  useRouter: () => ({}),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: h.user } }) },
    from: (table: string) => {
      h.tables.push(table);
      const query = {
        select: () => query,
        eq: (...args: unknown[]) => {
          h.filters.push([table, ...args]);
          return query;
        },
        maybeSingle: async () => ({ data: h.reader, error: null }),
        then: (resolve: (value: unknown) => unknown) =>
          Promise.resolve({ data: [], error: h.resultError ? { message: "failed" } : null }).then(
            resolve,
          ),
      };
      return query;
    },
  }),
}));
import Page from "@/app/(protected)/learn/unit-one/report/page";
const child = "11111111-1111-4111-8111-111111111111";
beforeEach(() => {
  h.user = { id: "parent" };
  h.reader = null;
  h.tables = [];
  h.filters = [];
  h.resultError = false;
});
it("requires login before querying a child report", async () => {
  h.user = null;
  await expect(Page({ searchParams: Promise.resolve({ child }) })).rejects.toThrow(
    "redirect:/login",
  );
  expect(h.tables).toEqual([]);
});
it("does not fetch results for a child the parent does not own", async () => {
  await expect(Page({ searchParams: Promise.resolve({ child }) })).rejects.toThrow("not-found");
  expect(h.filters).toContainEqual(["children", "parent_id", "parent"]);
  expect(h.filters).toContainEqual(["children", "id", child]);
  expect(h.tables).toEqual(["children"]);
});
it("reports data failures rather than claiming the child has no progress", async () => {
  h.reader = { id: child, first_name: "Synthetic" };
  h.resultError = true;
  await expect(Page({ searchParams: Promise.resolve({ child }) })).rejects.toThrow("saved results");
  expect(h.filters).toContainEqual(["approved_unit_sessions", "child_id", child]);
});
