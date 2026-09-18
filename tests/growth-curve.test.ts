import { describe, it, expect } from "vitest";
import { smoothPath } from "@/app/(protected)/placement/_components/reveal/GrowthChart";

/**
 * Filip: "Reading progress should be exponential graph... based on 10 mins a
 * day." The chart now curves instead of stepping between milestones.
 *
 * The property worth testing is not the look, it is the promise: every plotted
 * milestone is a real projection from published growth norms, and the curve
 * between them must not invent a value outside them. An ordinary spline
 * overshoots on uneven spacing, which on this chart would paint a dip in a
 * child's reading progress that the data never contained.
 */

/** Every coordinate pair in the path, control points included. */
function coords(d: string): { x: number; y: number }[] {
  const nums = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i + 1 < nums.length; i += 2) out.push({ x: nums[i], y: nums[i + 1] });
  return out;
}

describe("smoothPath", () => {
  // Remember SVG y is inverted: a RISING reading score has a FALLING y.
  const rising = [
    { x: 0, y: 200 },
    { x: 100, y: 170 },
    { x: 200, y: 120 },
    { x: 300, y: 40 },
  ];

  it("passes through every milestone", () => {
    const d = smoothPath(rising);
    for (const p of rising) {
      expect(d).toContain(`${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
    }
  });

  it("never leaves the range of the points it joins", () => {
    const d = smoothPath(rising);
    const ys = coords(d).map((p) => p.y);
    const lo = Math.min(...rising.map((p) => p.y));
    const hi = Math.max(...rising.map((p) => p.y));
    for (const y of ys) {
      expect(y).toBeGreaterThanOrEqual(lo - 0.01);
      expect(y).toBeLessThanOrEqual(hi + 0.01);
    }
  });

  it("does not manufacture a dip when growth flattens", () => {
    // A plateau then a rise is where a naive spline swings below the plateau.
    const plateau = [
      { x: 0, y: 200 },
      { x: 100, y: 200 },
      { x: 200, y: 100 },
    ];
    const ys = coords(smoothPath(plateau)).map((p) => p.y);
    expect(Math.max(...ys)).toBeLessThanOrEqual(200.01);
  });

  it("emits curve segments, not straight joins, once there are three points", () => {
    expect(smoothPath(rising)).toContain("C");
  });

  it("stays a straight line for the two-point practice chart", () => {
    // Kindergarten and emergent readers get a start-to-target line with no
    // middle to curve through.
    const d = smoothPath([{ x: 0, y: 100 }, { x: 200, y: 40 }]);
    expect(d).toBe("M0.0 100.0 L200.0 40.0");
    expect(d).not.toContain("C");
  });

  it("survives a single point and an empty series", () => {
    expect(smoothPath([{ x: 5, y: 5 }])).toBe("M5.0 5.0");
    expect(smoothPath([])).toBe("");
  });
});
