import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ track: vi.fn(), setUser: vi.fn() }));
vi.mock("@/lib/observability/track", () => ({ trackError: mock.track }));
vi.mock("@sentry/nextjs", () => ({ setUser: mock.setUser }));
import { reportFailure } from "@/lib/observability/critical";
import { withCronReporting } from "@/lib/observability/cron";
import { scrubErrorEvent } from "@/lib/observability/privacy";
import { bindErrorIdentity } from "@/lib/observability/auth-identity";

describe("safe operational error reporting", () => {
  beforeEach(() => vi.clearAllMocks());
  it("keeps operation codes and correlation IDs without attaching sensitive provider messages", () => {
    reportFailure("signup.auth_create", { code: "unexpected_failure", status: 500, message: "password=secret parent@example.com", details: "child recording" }, { route: "/api/signups", requestId: "request-1" });
    const [error, context] = mock.track.mock.calls[0];
    expect(error.message).toBe("signup.auth_create failed");
    expect(context.tags.error_code).toBe("unexpected_failure");
    expect(context.extra.request_id).toBe("request-1");
    expect(JSON.stringify([error, context])).not.toMatch(/secret|parent@|recording/);
  });
  it("scrubs captured request content and contact information while keeping the opaque identity", () => {
    const event: any = { request: { url: "https://app/signup?email=private#token", data: { password: "secret" }, headers: { authorization: "Bearer token" }, cookies: "session", query_string: "private" }, user: { id: "parent-id", email: "private", ip_address: "private" } };
    expect(scrubErrorEvent(event)).toEqual({ request: { url: "https://app/signup" }, user: { id: "parent-id" } });
  });
  it.each([Response.json({ ok: false }), Response.json({ error: "db" }, { status: 500 })])("reports returned cron failures and preserves the response", async (response) => {
    const wrapped = withCronReporting("/api/cron/save-health", async () => response);
    const received = await wrapped();
    expect(received).toBe(response);
    expect(await received.json()).toBeTruthy();
    expect(mock.track).toHaveBeenCalledOnce();
  });
  it("reports thrown cron failures without returning private exception text", async () => {
    const response = await withCronReporting("/api/cron/save-health", async () => { throw new Error("private token"); })();
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("private token");
    expect(mock.track).toHaveBeenCalledOnce();
  });
  it("does not report authorized successes or expected auth denials", async () => {
    for (const response of [Response.json({ ok: true }), Response.json({ error: "unauthorized" }, { status: 401 })]) await withCronReporting("/cron", async () => response)();
    expect(mock.track).not.toHaveBeenCalled();
  });
  it("keeps logout authoritative over an in-flight identity lookup and cleans up the listener", async () => {
    let change: any, resolve: any;
    const unsubscribe = vi.fn();
    const auth: any = { onAuthStateChange: (fn: any) => { change = fn; return { data: { subscription: { unsubscribe } } }; }, getUser: () => new Promise(r => { resolve = r; }) };
    const cleanup = bindErrorIdentity(auth);
    change("SIGNED_IN", { user: { id: "parent", email: "private" } });
    expect(mock.setUser).toHaveBeenLastCalledWith({ id: "parent" });
    change("SIGNED_OUT", null);
    resolve({ data: { user: { id: "old-parent" } } });
    await Promise.resolve();
    expect(mock.setUser).toHaveBeenLastCalledWith(null);
    cleanup(); expect(unsubscribe).toHaveBeenCalledOnce();
  });
});
