import { afterEach, describe, expect, it, vi } from "vitest";
import { createRouteProgress, type ProgressState } from "@/lib/navigation/progress";

afterEach(() => vi.useRealTimers());
describe("navigation feedback", () => {
  it("does not flash for a cached navigation", () => {
    vi.useFakeTimers();
    const publish = vi.fn();
    const progress = createRouteProgress(publish);
    progress.start();
    vi.advanceTimersByTime(100);
    progress.finish();
    vi.advanceTimersByTime(9000);
    expect(publish).not.toHaveBeenCalled();
  });
  it("keeps a new navigation alive when the previous fade would have fired", () => {
    vi.useFakeTimers();
    const states: ProgressState[] = [];
    const progress = createRouteProgress(s => states.push(s));
    progress.start();
    vi.advanceTimersByTime(200);
    progress.finish();
    vi.advanceTimersByTime(150);
    progress.start();
    vi.advanceTimersByTime(500);
    expect(states.at(-1)).toMatchObject({ visible: true, fading: false });
    progress.finish();
    vi.advanceTimersByTime(400);
    expect(states.at(-1)?.visible).toBe(false);
    const length = states.length;
    vi.advanceTimersByTime(10000);
    expect(states).toHaveLength(length);
  });
  it("cleans up on unmount and does not crawl with reduced motion", () => {
    vi.useFakeTimers();
    const publish = vi.fn();
    const progress = createRouteProgress(publish, true);
    progress.start();
    vi.advanceTimersByTime(2000);
    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenLastCalledWith({ visible: true, width: 90, fading: false });
    progress.dispose();
    vi.advanceTimersByTime(10000);
    expect(publish).toHaveBeenCalledTimes(1);
  });
});
