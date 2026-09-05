import { describe, it, expect, vi, afterEach } from "vitest";
import { savedOk } from "@/lib/db/checked-write";

/**
 * A child's progress write is the one thing in the app that must not fail
 * quietly. These cover the two halves: recover the transient failure, and
 * report the one that survives.
 */

type Err = { message?: string; code?: string } | null;

/** A fake write that fails with `errors[i]` on attempt i, then succeeds. */
function flaky(errors: Err[]) {
  let calls = 0;
  const fn = () => {
    const error = errors[calls] ?? null;
    calls += 1;
    return Promise.resolve({ error });
  };
  return { fn, calls: () => calls };
}

afterEach(() => vi.restoreAllMocks());

describe("savedOk", () => {
  it("returns true when the write lands", async () => {
    const w = flaky([]);
    expect(await savedOk("t", w.fn, { retries: 2 })).toBe(true);
    expect(w.calls()).toBe(1);
  });

  it("retries a dropped connection and saves the child's work", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const w = flaky([{ message: "TypeError: Failed to fetch" }]);
    expect(await savedOk("practice:results", w.fn, { retries: 2, backoffMs: 1 })).toBe(true);
    expect(w.calls()).toBe(2); // failed once, succeeded on the retry
  });

  it("gives up after the configured retries and reports", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const w = flaky([{ code: "08006" }, { code: "08006" }, { code: "08006" }]);
    expect(await savedOk("practice:results", w.fn, { retries: 2, backoffMs: 1 })).toBe(false);
    expect(w.calls()).toBe(3); // the original + 2 retries
    expect(spy).toHaveBeenCalled();
  });

  it("does NOT retry a permanent failure - RLS denial fails the same way forever", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const w = flaky([{ code: "42501", message: "new row violates row-level security" }]);
    expect(await savedOk("t", w.fn, { retries: 3, backoffMs: 1 })).toBe(false);
    expect(w.calls()).toBe(1);
  });

  it("does NOT retry an unknown column - this is how the notifications page failed", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const w = flaky([{ code: "PGRST204", message: "column not found" }]);
    expect(await savedOk("t", w.fn, { retries: 3, backoffMs: 1 })).toBe(false);
    expect(w.calls()).toBe(1);
  });

  it("treats a unique violation as success - the row is already there", async () => {
    const w = flaky([{ code: "23505" }]);
    expect(await savedOk("t", w.fn, { retries: 2, backoffMs: 1 })).toBe(true);
    expect(w.calls()).toBe(1);
  });

  it("recovers a write that throws instead of resolving", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    let calls = 0;
    const fn = () => {
      calls += 1;
      if (calls === 1) throw new Error("network request failed");
      return Promise.resolve({ error: null });
    };
    expect(await savedOk("t", fn, { retries: 2, backoffMs: 1 })).toBe(true);
    expect(calls).toBe(2);
  });

  it("never retries a bare promise, so non-idempotent callers cannot double-write", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    let calls = 0;
    const started = (async () => {
      calls += 1;
      return { error: { message: "Failed to fetch" } as Err };
    })();
    expect(await savedOk("t", started, { retries: 5, backoffMs: 1 })).toBe(false);
    expect(calls).toBe(1);
  });

  it("broadcasts readee:save-failed so the notice can render", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const events: string[] = [];
    (globalThis as { window?: unknown }).window = {
      dispatchEvent: (e: { detail?: { label?: string } }) => events.push(e.detail?.label ?? ""),
    };
    class FakeEvent {
      detail: unknown;
      constructor(_type: string, init?: { detail?: unknown }) { this.detail = init?.detail; }
    }
    (globalThis as { CustomEvent?: unknown }).CustomEvent = FakeEvent;

    await savedOk("practice:results", () => Promise.resolve({ error: { code: "42501" } }));
    expect(events).toEqual(["practice:results"]);

    delete (globalThis as { window?: unknown }).window;
    delete (globalThis as { CustomEvent?: unknown }).CustomEvent;
  });
});
