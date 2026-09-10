import { describe, expect, it, vi } from "vitest";
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("notFound"); }, redirect: (url: string) => { throw new Error(url); } }));
vi.mock("@/lib/plan/check-access", () => ({ getUserPlan: async () => "free" }));
vi.mock("@/lib/placement/owned-plan", () => ({ loadOwnedPlacementPlan: vi.fn() }));
vi.mock("@/app/(protected)/learn/LearnClient", () => ({ default: () => null }));
vi.mock("@/app/(protected)/learn/LessonV2Client", () => ({ default: () => null }));
vi.mock("@/app/(protected)/learn/PreviewLesson", () => ({ default: () => null }));
import LearnPage from "@/app/(protected)/learn/page";
import { loadOwnedPlacementPlan } from "@/lib/placement/owned-plan";
describe("lesson previews", () => {
  it.each(["RL.K.1", "RL.1.1", "RL.2.1", "RL.3.1", "RL.4.1"])("opens an existing free lesson without a child: %s", async (standard) => {
    expect(await LearnPage({ searchParams: Promise.resolve({ standard, preview: "1" }) })).toBeTruthy();
    expect(loadOwnedPlacementPlan).not.toHaveBeenCalled();
  });
  it.each(["L.2.1", "RI.2.1", "not-a-standard"])("cannot use a preview query to bypass paid content: %s", async (standard) => {
    await expect(LearnPage({ searchParams: Promise.resolve({ standard, preview: "1", child: "other-child" }) })).rejects.toThrow("notFound");
  });
});
