import { it, expect } from "vitest";
import { SaveQueue } from "@/lib/approved-unit/save-queue";
it("retries the exact lost response before sending newer state", async () => {
  const calls: unknown[] = [];
  let fail = true;
  const q = new SaveQueue(0, async (s, r) => {
    calls.push([JSON.parse(s), r]);
    if (fail) {
      fail = false;
      throw Error("response lost");
    }
    return r + 1;
  });
  q.enqueue({ step: 1 });
  await expect(q.flush()).rejects.toThrow();
  q.enqueue({ step: 2 });
  await q.flush();
  expect(calls).toEqual([
    [{ step: 1 }, 0],
    [{ step: 1 }, 0],
    [{ step: 2 }, 1],
  ]);
  expect(q.dirty).toBe(false);
});
it("coalesces pending saves while preserving a single in-flight request", async () => {
  let release: () => void = () => {};
  const wait = new Promise<void>((r) => (release = r));
  let calls = 0;
  const q = new SaveQueue(0, async (_s, r) => {
    calls++;
    if (calls === 1) await wait;
    return r + 1;
  });
  q.enqueue({ step: 1 });
  const a = q.flush();
  q.enqueue({ step: 2 });
  q.enqueue({ step: 3 });
  const b = q.flush();
  release();
  await Promise.all([a, b]);
  expect(calls).toBe(2);
  expect(q.revision).toBe(2);
});
