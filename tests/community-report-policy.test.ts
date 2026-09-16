import { expect, it } from "vitest";
import { normalizeReportReason, shouldEmailReport } from "@/lib/community/report-policy";

const quiet = { removed: false, compliant: true, errored: false, reason: null };

it("keeps a bare tap on a story the AI still passes out of the inbox", () => {
  expect(shouldEmailReport(quiet)).toBe(false);
});

it("emails when a person can act: reason given, AI disagrees, takedown, or review errored", () => {
  expect(shouldEmailReport({ ...quiet, reason: "Not for kids" })).toBe(true);
  expect(shouldEmailReport({ ...quiet, compliant: false })).toBe(true);
  expect(shouldEmailReport({ ...quiet, removed: true })).toBe(true);
  expect(shouldEmailReport({ ...quiet, errored: true })).toBe(true);
});

it("normalizes the reason: trimmed, capped, empty becomes none", () => {
  expect(normalizeReportReason("  Not true ")).toBe("Not true");
  expect(normalizeReportReason("")).toBeNull();
  expect(normalizeReportReason("   ")).toBeNull();
  expect(normalizeReportReason(42)).toBeNull();
  expect(normalizeReportReason("x".repeat(600))).toHaveLength(500);
});
