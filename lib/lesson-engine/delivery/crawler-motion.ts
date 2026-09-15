/** Resolve body contact in pixel space. Translation and heading are independent:
 * a little sideways give lets oncoming bugs pass without spinning their sprites. */
export function separateCrawlers<T extends { x: number; y: number; hiddenUntil: number }>(
  bugs: T[],
  width: number,
  height: number,
  diameter: number,
  now: number,
) {
  for (let pass = 0; pass < 8; pass++) {
    for (let i = 0; i < bugs.length; i++) {
      const a = bugs[i];
      if (a.hiddenUntil > now) continue;
      for (let j = i + 1; j < bugs.length; j++) {
        const b = bugs[j];
        if (b.hiddenUntil > now) continue;
        const dx = (b.x - a.x) * width,
          dy = (b.y - a.y) * height;
        const distance = Math.hypot(dx, dy);
        if (distance >= diameter) continue;
        const nx = distance > 0.001 ? dx / distance : 1;
        const ny = distance > 0.001 ? dy / distance : 0;
        const push = (diameter - distance) / 2 + 0.02;
        const slip = pass === 0 ? Math.min(1.2, push * 0.3) : 0;
        a.x -= (nx * push - ny * slip) / width;
        a.y -= (ny * push + nx * slip) / height;
        b.x += (nx * push - ny * slip) / width;
        b.y += (ny * push + nx * slip) / height;
      }
    }
  }
}
export function turnToward(current: number, target: number, dt: number) {
  const delta = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + Math.max(-1.8 * dt, Math.min(1.8 * dt, delta));
}
