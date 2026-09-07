import { describe, it, expect } from "vitest";
import { FREE_LIMITS, PREMIUM_LIMITS, getLimits } from "@/lib/plan/limits";

/**
 * Luna's free allowance used to be counted in COMPLETED reads, while every cost
 * in a session (Azure token, TTS clip, grading call) is incurred before one
 * completes. On 2026-09-07 every free account that had touched Luna had 0
 * completed reads and 1-5 token mints, so the wall had never fired for anyone.
 * The mint allowance is what makes the gate real, so it has to stay finite.
 */
describe("Luna free allowance", () => {
  it("caps free readers on token mints, not just completed reads", () => {
    expect(Number.isFinite(FREE_LIMITS.lunaMintsFree)).toBe(true);
    expect(FREE_LIMITS.lunaMintsFree).toBeGreaterThan(0);
  });

  it("never caps a paying reader", () => {
    expect(PREMIUM_LIMITS.lunaMintsFree).toBe(Infinity);
    expect(getLimits("premium").lunaMintsFree).toBe(Infinity);
    expect(getLimits("teacher_solo").lunaMintsFree).toBe(Infinity);
  });

  it("treats an unknown or absent plan as free, so the cap applies", () => {
    expect(getLimits(null).lunaMintsFree).toBe(FREE_LIMITS.lunaMintsFree);
    expect(getLimits("nonsense").lunaMintsFree).toBe(FREE_LIMITS.lunaMintsFree);
  });

  it("stays below the 60/hour hard mint cap in /api/luna/speech-token", () => {
    // The entitlement must bite before the abuse backstop, or the free taste is
    // really "60 an hour" and the wall never shows.
    expect(FREE_LIMITS.lunaMintsFree).toBeLessThan(60);
  });
});
