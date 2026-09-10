import { beforeEach, describe, expect, it, vi } from "vitest";
import { isLessonInFreeUnit } from "@/lib/plan/free-lessons";

const mock = vi.hoisted(() => ({ user: { id: "parent" } as { id: string } | null, child: {} as any, saved: {} as any, filters: [] as unknown[][] }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({
  auth: { getUser: async () => ({ data: { user: mock.user } }) },
  from: (table: string) => {
    const q = { select: () => q, eq: (...args: unknown[]) => { mock.filters.push([table, ...args]); return q; },
      order: () => q, limit: () => q, maybeSingle: async () => table === "children" ? mock.child : mock.saved };
    return q;
  },
}) }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`redirect:${url}`); } }));
vi.mock("@/lib/plan/check-access", () => ({ getUserPlan: async () => "free" }));
vi.mock("@/app/(protected)/learn/LearnClient", () => ({ default: () => null }));
vi.mock("@/app/(protected)/learn/LessonV2Client", () => ({ default: () => null }));

import { loadOwnedPlacementPlan } from "@/lib/placement/owned-plan";
import LearnPage from "@/app/(protected)/learn/page";
import StartPage from "@/app/(protected)/placement/start/page";

const childId = "22222222-2222-4222-8222-222222222222";
const firstUnit = { grade: "2nd Grade", domain: "Informational", title: "Fact Finders", lessons: 9 };

describe("the placement start unit is free only for its reader", () => {
  beforeEach(() => {
    mock.user = { id: "parent" };
    mock.child = { data: { id: childId }, error: null };
    mock.saved = { data: { plan: { version: 2, entryBand: 2, firstUnit, steps: [] } }, error: null };
    mock.filters = [];
  });
  it("unlocks the assigned domain at the assessed grade without unlocking other units", () => {
    const defaults = new Map([["2nd Grade", "Literature"]]);
    expect(isLessonInFreeUnit(firstUnit, defaults, firstUnit)).toBe(true);
    expect(isLessonInFreeUnit({ ...firstUnit, grade: "4th Grade" }, defaults, firstUnit)).toBe(false);
    expect(isLessonInFreeUnit({ ...firstUnit, domain: "Language" }, defaults, firstUnit)).toBe(false);
    expect(isLessonInFreeUnit(firstUnit, defaults)).toBe(false);
  });
  it("requires signed-in parent ownership before reading the placement", async () => {
    expect((await loadOwnedPlacementPlan(childId))?.firstUnit).toEqual(firstUnit);
    expect(mock.filters).toContainEqual(["children", "parent_id", "parent"]);
    mock.child = { data: null, error: null }; mock.filters = [];
    expect(await loadOwnedPlacementPlan(childId)).toBeNull();
    expect(mock.filters.some((f) => f[0] === "placements")).toBe(false);
    mock.user = null;
    expect(await loadOwnedPlacementPlan(childId)).toBeNull();
  });
  it("surfaces a failed plan read instead of inventing a free plan", async () => {
    mock.saved = { data: null, error: { message: "offline" } };
    await expect(loadOwnedPlacementPlan(childId)).rejects.toThrow("reading plan");
  });
  it("routes a second-grade placement to its actual first lesson", async () => {
    await expect(StartPage({ searchParams: Promise.resolve({ child: childId }) })).rejects.toThrow(`redirect:/learn?child=${childId}&standard=RI.2.1`);
  });
  it("serves that lesson to a free parent, but still gates other premium units", async () => {
    expect(await LearnPage({ searchParams: Promise.resolve({ child: childId, standard: "RI.2.1" }) })).toBeTruthy();
    await expect(LearnPage({ searchParams: Promise.resolve({ child: childId, standard: "L.2.1" }) })).rejects.toThrow("redirect:/upgrade");
  });
  it("does not accept the child query parameter as proof of access", async () => {
    mock.child = { data: null, error: null };
    await expect(LearnPage({ searchParams: Promise.resolve({ child: childId, standard: "RI.2.1" }) })).rejects.toThrow("redirect:/upgrade");
  });
});
