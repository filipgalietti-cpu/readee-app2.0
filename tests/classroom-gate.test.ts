import { describe, it, expect } from "vitest";
import { isB2BPath } from "@/lib/plan/classroom-gate";

/**
 * Two ways this gate can be wrong, and both matter.
 *
 * Too narrow and an unfinished surface stays reachable, which is where most of
 * the September audit lived. Too wide and it takes B2C routes down with it,
 * which would be an outage for the actual product.
 */

describe("B2B path matching", () => {
  it("catches every classroom surface, including the join and dev variants", () => {
    for (const p of [
      "/classroom",
      "/classroom/abc-123",
      "/classroom-join",
      "/classroom-dev",
      "/classroom/tools/coach",
      "/classroom/reports/student/xyz",
    ]) {
      expect(isB2BPath(p), p).toBe(true);
    }
  });

  it("catches student sign-in, invites and the student app", () => {
    for (const p of ["/class/ABCD", "/join/teacher/XYZ", "/student", "/student/quiz/1"]) {
      expect(isB2BPath(p), p).toBe(true);
    }
  });

  it("catches institutional admin but NOT platform admin", () => {
    for (const p of ["/admin/school/1", "/admin/district/2", "/admin/classroom/3"]) {
      expect(isB2BPath(p), p).toBe(true);
    }
    // Owner-only surfaces behind isPlatformAdmin have nothing to do with schools
    // and must keep working.
    for (const p of ["/admin", "/admin/qc", "/admin/community", "/admin/tools"]) {
      expect(isB2BPath(p), p).toBe(false);
    }
  });

  it("catches the B2B API routes", () => {
    for (const p of [
      "/api/classroom/x/export",
      "/api/student/sign-in",
      "/api/iep-plan/push",
      "/api/admin/school/1/export",
      "/api/coach-analyze",
      "/api/running-record-suggest",
    ]) {
      expect(isB2BPath(p), p).toBe(true);
    }
  });

  it("leaves the whole B2C product alone", () => {
    for (const p of [
      "/", "/dashboard", "/learn", "/practice", "/journey", "/luna", "/placement",
      "/daily", "/today/2026-09-06", "/stories", "/shop", "/settings", "/billing",
      "/upgrade", "/signup", "/login", "/leaderboard", "/analytics", "/levels",
      "/api/placement/complete", "/api/daily/complete", "/api/luna/speak",
      "/api/promo/redeem", "/api/checkout", "/api/webhooks/stripe",
      "/api/admin/reset-premium", "/api/admin/schema-health",
    ]) {
      expect(isB2BPath(p), p).toBe(false);
    }
  });

  it("does not blanket-block /api/admin, which holds non-B2B tools", () => {
    expect(isB2BPath("/api/admin/school/1")).toBe(true);
    expect(isB2BPath("/api/admin/reset-premium")).toBe(false);
  });

  it("does not catch a B2C path that merely starts with the same letters", () => {
    // "/classroom" as a prefix must not swallow something like "/classes-info";
    // and "/student" must not swallow a hypothetical "/students-guide" page.
    expect(isB2BPath("/classes-info")).toBe(false);
    expect(isB2BPath("/stories")).toBe(false);
  });
});
