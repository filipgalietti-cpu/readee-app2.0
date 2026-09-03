import { describe, it, expect } from "vitest";
import { cleanSaidAs, spokenNameOf, withSpokenName } from "@/lib/audio/name-spoken";

describe("how a name is said", () => {
  it("cleans a respelling", () => {
    expect(cleanSaidAs(" fee-LOOSH!! ")).toBe("fee-LOOSH");
    expect(cleanSaidAs(null)).toBe("");
    expect(cleanSaidAs("a".repeat(60))).toHaveLength(40);
  });
  it("turns the respelling into one plain token for the voice", () => {
    expect(spokenNameOf("Filus", "fee-LOOSH")).toBe("Feeloosh");
    expect(spokenNameOf("Maria", "ma-REE-ah")).toBe("Mareeah");
    expect(spokenNameOf("Maya", "")).toBe("Maya");
    expect(spokenNameOf("Maya Jane", null)).toBe("Maya");
  });
  it("swaps only the written first name, whole word, everywhere in a line", () => {
    expect(withSpokenName("Filus read 61 words. Filus's speed is climbing.", "Filus", "fee-LOOSH")).toBe("Feeloosh read 61 words. Feeloosh's speed is climbing.");
    expect(withSpokenName("Maya did a great job today.", "Maya", null)).toBe("Maya did a great job today.");
    expect(withSpokenName("Mayan history", "Maya", "MY-ah")).toBe("Mayan history");
  });
});
