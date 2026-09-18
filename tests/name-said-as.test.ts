import { describe, it, expect } from "vitest";
import { usableSaidAs, spokenNameOf, withSpokenName } from "@/lib/audio/name-spoken";

/**
 * Filip, on the report narration: "it ACTUALLY read the passage fast asf and
 * called me File".
 *
 * A pronunciation HAD been captured for Fil. It was stored as "FIL". Normalise
 * away the hyphens and capitals the format asks for and it is "Fil", the
 * written name, so the substitution correctly decided there was nothing to do
 * and the voice got the raw name and read it as the English word. The feature
 * ran, stored a value, and did nothing, which is worse than never running,
 * because the record looked handled.
 */
describe("usableSaidAs", () => {
  it("rejects the exact value that broke Fil", () => {
    expect(usableSaidAs("Fil", "FIL")).toBe(false);
  });

  it("rejects any respelling that is just the name restyled", () => {
    expect(usableSaidAs("Fil", "fil")).toBe(false);
    expect(usableSaidAs("Fil", "F-I-L")).toBe(false);
    expect(usableSaidAs("Maya", "MAY-A")).toBe(false); // collapses to "Maya"
  });

  it("accepts a real sound spelling", () => {
    expect(usableSaidAs("Fil", "fill")).toBe(true);
    expect(usableSaidAs("Filus", "fee-LOOSH")).toBe(true);
    expect(usableSaidAs("Mariah", "ma-REE-ah")).toBe(true);
  });

  it("treats a missing respelling as unusable rather than throwing", () => {
    expect(usableSaidAs("Fil", null)).toBe(false);
    expect(usableSaidAs("Fil", "")).toBe(false);
    expect(usableSaidAs("Fil", "   ")).toBe(false);
  });

  it("is exactly the condition under which the voice would be handed the raw name", () => {
    // The bug, stated as the invariant it broke: whenever a respelling is
    // unusable, substitution is a no-op, so the two must agree.
    for (const saidAs of ["FIL", "fil", "", null, "fill", "fee-LOOSH"]) {
      const substituted = withSpokenName("Fil read fast.", "Fil", saidAs) !== "Fil read fast.";
      expect(substituted).toBe(usableSaidAs("Fil", saidAs));
    }
  });
});

describe("spokenNameOf, unchanged behaviour", () => {
  it("still flattens a good respelling into one plain token", () => {
    expect(spokenNameOf("Filus", "fee-LOOSH")).toBe("Feeloosh");
  });

  it("falls back to the written name when there is nothing usable", () => {
    expect(spokenNameOf("Fil", "FIL")).toBe("Fil");
  });
});
