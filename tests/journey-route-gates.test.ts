import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ snapshot: null as any }));
vi.mock("@/lib/journey/load.server", () => ({ loadJourneySnapshot: async () => state.snapshot }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
  notFound: () => {
    throw new Error("not-found");
  },
}));
vi.mock("@/app/(protected)/learn/LearnClient", () => ({ default: () => null }));
vi.mock("@/app/(protected)/learn/LessonV2Client", () => ({ default: () => null }));
vi.mock("@/app/(protected)/lesson/LegacyLessonClient", () => ({ default: () => null }));
vi.mock("@/app/(protected)/learn/PreviewLesson", () => ({ default: () => null }));
import LearnPage from "@/app/(protected)/learn/page";
import LessonPage from "@/app/(protected)/lesson/page";
import { fixtureSpectrumMaya } from "@/lib/placement/spectrum-fixtures";
import { assignedJourneyCatalog } from "@/lib/journey/next-lesson";
import { previewLessons } from "@/lib/lessons/preview-catalog";
const result = fixtureSpectrumMaya();
const catalog = assignedJourneyCatalog(null, result.plan);
const learn = (standard: string, preview?: string) =>
  LearnPage({ searchParams: Promise.resolve({ child: result.childId, standard, preview }) });
beforeEach(() => {
  state.snapshot = {
    child: { id: result.childId, reading_level: result.decision.readingLevelName },
    result,
    billing: { signupAt: "2026-09-13", fullAccess: false },
  };
});
it("serves the assigned sample and rejects a direct link to the next lesson", async () => {
  expect(await learn(catalog[0].standardId)).toBeTruthy();
  await expect(learn(catalog[1].standardId)).rejects.toThrow(
    `redirect:/journey?child=${result.childId}`,
  );
});
it("preserves old included units and unlocks the full catalog for subscribed families", async () => {
  state.snapshot.billing.signupAt = "2026-09-01";
  expect(await learn(catalog[1].standardId)).toBeTruthy();
  state.snapshot.billing.signupAt = "2026-09-13";
  state.snapshot.billing.fullAccess = true;
  expect(await learn(catalog.at(-1)!.standardId)).toBeTruthy();
});
it("does not let the legacy lesson library bypass the new allowance", async () => {
  const open = () => LessonPage({ searchParams: Promise.resolve({ child: result.childId }) });
  await expect(open()).rejects.toThrow("redirect:/journey");
  state.snapshot.billing.fullAccess = true;
  expect(await open()).toBeTruthy();
});
it("preview accepts only advertised samples, not arbitrary free-unit lessons", async () => {
  expect(await learn(previewLessons[0].standardId, "1")).toBeTruthy();
  await expect(learn("RI.2.2", "1")).rejects.toThrow("not-found");
});
