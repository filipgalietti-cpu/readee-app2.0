import { describe, expect, it } from "vitest";
import {
  cleanCampaignValue,
  safeAuthDestination,
  safePostLoginDestination,
} from "@/lib/auth/auth-navigation";

describe("auth destination validation", () => {
  it.each([
    ["/placement/setup", "/placement/setup"],
    ["/placement/ready?child=test#start", "/placement/ready?child=test#start"],
    [null, "/dashboard"],
  ])("maps %s to %s", (value, expected) => {
    expect(safeAuthDestination(value)).toBe(expected);
  });

  it.each([
    "https://evil.example/path",
    "//evil.example/path",
    "%2F%2Fevil.example/path",
    "%252F%252Fevil.example/path",
    "/\\evil.example/path",
    "javascript:alert(1)",
    "/place\u0000ment",
    "%E0%A4%A",
  ])("rejects an unsafe destination: %s", (value) => {
    expect(safeAuthDestination(value)).toBe("/dashboard");
  });

  it("preserves encoding in a valid destination", () => {
    expect(safeAuthDestination("/placement/ready?child=a%2Fb")).toBe(
      "/placement/ready?child=a%2Fb",
    );
  });

  it("prevents auth redirect loops", () => {
    expect(safePostLoginDestination("/login?redirect=/placement/setup")).toBe("/dashboard");
    expect(safePostLoginDestination("/signup")).toBe("/dashboard");
    expect(safePostLoginDestination("/auth/callback")).toBe("/dashboard");
  });
});

describe("campaign value validation", () => {
  it("keeps bounded campaign text and strips markup", () => {
    expect(cleanCampaignValue("hero-cta<script>alert(1)</script>")).toBe(
      "hero-ctascriptalert1/script",
    );
  });
});
