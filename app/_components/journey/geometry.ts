export type Point = { x: number; y: number };
export type MapGeometry = {
  width: number;
  height: number;
  points: Point[];
  segments: string[];
  mobile: boolean;
};

/** Shared cardinal tangents keep the trail smooth THROUGH landmarks, not flat at every stop. */
export function smoothTrail(points: Point[]): string[] {
  const tangents = points.map((p, i) => {
    const before = points[Math.max(0, i - 1)];
    const after = points[Math.min(points.length - 1, i + 1)];
    return { x: (after.x - before.x) / 6, y: (after.y - before.y) / 6 };
  });
  return points.slice(1).map((to, i) => {
    const from = points[i],
      a = tangents[i],
      b = tangents[i + 1];
    return `M ${from.x} ${from.y} C ${from.x + a.x} ${from.y + a.y}, ${to.x - b.x} ${to.y - b.y}, ${to.x} ${to.y}`;
  });
}

/** Both SVG strokes and HTML destinations use these points. Bunny travel measures the rendered strokes. */
export function mapGeometry(lessonCount: number, mobile: boolean): MapGeometry {
  const longPath = !mobile && lessonCount > 4;
  const width = mobile ? 360 : longPath ? 260 + (lessonCount - 1) * 240 + 480 : 1000;
  const stops: Point[] = mobile
    ? Array.from({ length: lessonCount }, (_, i) => ({
        x: i % 2 ? 238 : 122,
        y: 235 + i * 365,
      }))
    : longPath
      ? Array.from({ length: lessonCount }, (_, i) => ({
          x: 260 + i * 240,
          y: [290, 180, 300, 195][i % 4],
        }))
      : lessonCount === 4
        ? [
            { x: 230, y: 290 },
            { x: 430, y: 185 },
            { x: 580, y: 305 },
            { x: 795, y: 250 },
          ]
        : [
            { x: 275, y: 280 },
            { x: 485, y: 185 },
            { x: 695, y: 300 },
          ].slice(0, lessonCount);
  // Leave enough room for the expanded card before the next destination.
  const height = mobile ? 235 + lessonCount * 365 + 350 : 620;
  const points = mobile
    ? [{ x: 68, y: 80 }, ...stops, { x: 210, y: height - 250 }, { x: 110, y: height - 90 }]
    : longPath
      ? [{ x: 95, y: 230 }, ...stops, { x: width - 220, y: 145 }, { x: width - 80, y: 70 }]
      : lessonCount === 1
        ? [{ x: 95, y: 230 }, ...stops, { x: 650, y: 300 }, { x: 860, y: 150 }]
        : [{ x: 95, y: 230 }, ...stops, { x: 835, y: 140 }, { x: 950, y: 62 }];
  const segments = smoothTrail(points);
  return { width, height, points, segments, mobile };
}
