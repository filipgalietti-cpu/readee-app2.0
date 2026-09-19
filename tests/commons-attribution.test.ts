import { describe, it, expect } from "vitest";
import { cleanCommonsArtist } from "@/lib/ai/historical-artifacts";

/**
 * Filip, seeing a credit under a photograph on a children's page:
 * "Unknown authorUnknown author · Public domain · via Wikimedia Commons
 *  what is that"
 *
 * Commons' author templates carry a hidden machine-readable copy of the name
 * beside the visible one. This is the real value the API returned for the
 * Roberto Clemente photograph, fetched 2026-09-19.
 */
describe("cleanCommonsArtist", () => {
  it("drops the hidden duplicate Commons ships beside the visible name", () => {
    expect(cleanCommonsArtist('Unknown author<span style="display: none;">Unknown author</span>')).toBe(
      "Unknown author",
    );
  });

  it("handles the same template with different spacing or quoting", () => {
    expect(cleanCommonsArtist("Jane Doe<span style='display:none'>Jane Doe</span>")).toBe("Jane Doe");
    expect(cleanCommonsArtist('Jane Doe<div style="color:red;display:none;">Jane Doe</div>')).toBe("Jane Doe");
  });

  it("keeps an ordinary linked credit", () => {
    expect(cleanCommonsArtist('<a href="//commons.wikimedia.org/wiki/User:Paolaricaurte">Paolaricaurte</a>')).toBe(
      "Paolaricaurte",
    );
  });

  it("collapses a name doubled some other way", () => {
    expect(cleanCommonsArtist("Ansel AdamsAnsel Adams")).toBe("Ansel Adams");
  });

  it("does not mangle a genuinely repetitive name", () => {
    // Not an even split, so the doubling rule must not fire.
    expect(cleanCommonsArtist("Anna Anna Smith")).toBe("Anna Anna Smith");
  });

  it("returns null rather than an empty credit", () => {
    expect(cleanCommonsArtist("")).toBeNull();
    expect(cleanCommonsArtist(null)).toBeNull();
    expect(cleanCommonsArtist(undefined)).toBeNull();
    expect(cleanCommonsArtist("<span></span>")).toBeNull();
  });

  it("flattens whitespace so the credit sits on one line", () => {
    expect(cleanCommonsArtist("Jane\n  Doe")).toBe("Jane Doe");
  });
});
