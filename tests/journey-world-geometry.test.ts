import { describe, expect, it } from "vitest";
import { mapGeometry } from "@/app/_components/journey/geometry";

describe("production journey geometry", () => {
  it("lays out a complete nine-stop unit on one continuous scrollable path", () => {
    const geometry = mapGeometry(9, false);
    const lessons = geometry.points.slice(1, 10);

    expect(geometry.width).toBeGreaterThan(2000);
    expect(geometry.height).toBe(620);
    expect(geometry.points).toHaveLength(12);
    expect(geometry.segments).toHaveLength(11);
    expect(lessons.every((point, index) => index === 0 || point.x > lessons[index - 1].x)).toBe(
      true,
    );
    expect(lessons.every((point) => point.y >= 175 && point.y <= 300)).toBe(true);
    expect(geometry.points[10].x).toBeGreaterThan(lessons.at(-1)!.x);
    expect(geometry.points[11].x).toBeGreaterThan(geometry.points[10].x);
  });

  it("keeps compact legacy scenes at their existing width", () => {
    expect(mapGeometry(3, false).width).toBe(1000);
    expect(mapGeometry(4, false).width).toBe(1000);
  });
});
