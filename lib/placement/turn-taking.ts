/** A sound starts a turn; it does not finish one. The greeting waits for a
 * sustained quiet interval so Luna does not speak over a child's hello. */
export async function waitForHello(
  level: () => number,
  cancelled: () => boolean,
  clock = {
    now: () => Date.now(),
    wait: (ms: number) => new Promise<void>((r) => setTimeout(r, ms)),
  },
): Promise<boolean> {
  const start = clock.now();
  let firstVoice: number | null = null,
    lastVoice = start,
    voicedTicks = 0;
  while (!cancelled()) {
    const now = clock.now();
    if (level() > 0.12) {
      firstVoice ??= now;
      lastVoice = now;
      voicedTicks++;
    }
    if (voicedTicks >= 3 && now - lastVoice >= 1800 && now - firstVoice! >= 2500) return true;
    if (firstVoice === null && now - start >= 30000) return false;
    // A continuously noisy room is not a completed hello.
    if (now - start >= 45000) return false;
    await clock.wait(100);
  }
  return false;
}
