/** Layout shared by dynamic demonstrations and exported question pictures.
 * Art ratios are provided by the authored asset manifest; the mechanic owns no curriculum copy.
 */
export type PositionRelation = "on" | "under" | "next to";
export type PositionAnchor = "log" | "leaf" | "rock" | "hat" | "cup" | "stool" | "bench" | "box";
export type PictureBounds = { x: number; y: number; width: number; height: number };
export const POSITION_FRAME = { width: 420, height: 290 };
const frames: Record<PositionAnchor, { width: number; height: number }> = {
  log: { width: 220, height: 100 },
  leaf: { width: 205, height: 116 },
  rock: { width: 175, height: 96 },
  hat: { width: 230, height: 104 },
  cup: { width: 106, height: 128 },
  stool: { width: 196, height: 129 },
  bench: { width: 244, height: 119 },
  box: { width: 174, height: 126 },
};
export function positionLayout(
  anchor: PositionAnchor,
  position: PositionRelation,
  aspectRatio: number,
  contact = 0,
): { anchor: PictureBounds; object: PictureBounds; behind: boolean } {
  const f = frames[anchor];
  if (
    !f ||
    !["on", "under", "next to"].includes(position) ||
    !Number.isFinite(aspectRatio) ||
    aspectRatio <= 0
  )
    throw Error("Unsupported authored position geometry");
  const h = Math.min(f.height, f.width / aspectRatio),
    w = h * aspectRatio;
  const bounds = { x: 195 - w / 2, y: 232 - h, width: w, height: h };
  const openBelow = anchor === "bench" || anchor === "stool";
  const size = position === "under" && openBelow ? Math.min(58, h * 0.65) : 58;
  // Contact is at the asset's upper center; under an opaque object remains partly visible below its edge.
  const object = {
    x: position === "next to" ? bounds.x + w + 16 : 195 - size / 2,
    y:
      position === "on"
        ? bounds.y + h * contact - size + 3
        : position === "under"
          ? openBelow
            ? 232 - size
            : anchor === "hat" ? 246 : 212
          : 232 - size,
    width: size,
    height: size,
  };
  return { anchor: bounds, object, behind: position === "under" };
}

export function positionViewBox(layouts: ReturnType<typeof positionLayout>[]) {
  const all = layouts.flatMap((x) => [x.anchor, x.object]);
  const x = Math.min(...all.map((b) => b.x)) - 18,
    y = Math.min(...all.map((b) => b.y)) - 18;
  const right = Math.max(...all.map((b) => b.x + b.width)) + 18,
    bottom = Math.max(...all.map((b) => b.y + b.height)) + 18;
  return `${x} ${y} ${right - x} ${bottom - y}`;
}
