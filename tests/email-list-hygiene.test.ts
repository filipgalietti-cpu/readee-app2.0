import { describe, it, expect } from "vitest";
import { isDeliverable, RE_ENGAGE_CAP } from "@/lib/email/lifecycle";
import { FAMILY_FROM } from "@/lib/email/sender";

/**
 * 19 Sep 2026. The send log held 400 re-engagement emails to 81 people, one of
 * whom had received eleven, and a "failed" column that turned out to be a single
 * test account retried every morning for twelve days.
 */
describe("the list is the only marketing asset we own", () => {
  it("stops re-engaging after three", () => {
    // Filip confirmed the number. If this changes, it should be a decision, not
    // a drift, so the test names it.
    expect(RE_ENGAGE_CAP).toBe(3);
  });

  it("never sends to an address that cannot receive", () => {
    expect(isDeliverable("qa-robot@example.com")).toBe(false);
    expect(isDeliverable("seed@example.org")).toBe(false);
    expect(isDeliverable("someone@test.local")).toBe(false);
    expect(isDeliverable("")).toBe(false);
    expect(isDeliverable(null)).toBe(false);
  });

  it("does not mistake a real family for a test account", () => {
    expect(isDeliverable("parent@gmail.com")).toBe(true);
    expect(isDeliverable("mom.example@yahoo.com")).toBe(true); // "example" in the local part is fine
    expect(isDeliverable("dad@contest.org")).toBe(true); // "test" inside a real domain is fine
  });
});

describe("who the family email is from", () => {
  it("is a teacher, at the authenticated address", () => {
    expect(FAMILY_FROM).toContain("Jennifer");
    // The address must stay the one SPF, DKIM and DMARC are set up for.
    expect(FAMILY_FROM).toContain("<hello@readee.app>");
  });
});
