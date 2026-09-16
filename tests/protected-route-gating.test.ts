import { describe, it, expect } from "vitest";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { AUTH_REQUIRED_PREFIXES, requiresAuth } from "@/lib/auth/auth-required-prefixes";

/**
 * Every URL segment under app/(protected) must be gated in the proxy.
 *
 * Why: a protected page that the proxy does not gate still starts rendering for
 * a signed-out visitor. Its requireProfile() throws "Unauthorized" while the
 * (protected) layout is redirecting to /login in parallel, so the visitor is
 * fine but Sentry logs an unhandled 500 every time (JAVASCRIPT-NEXTJS-D on
 * /placement; 2755a50d on /explore, Sep 16 2026). This test turns the next
 * forgotten segment into a red test instead of a production error.
 */
const PROTECTED_ROOT = path.resolve(__dirname, "..", "app", "(protected)");

function protectedSegments(dir = PROTECTED_ROOT): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (!statSync(full).isDirectory() || entry.startsWith("_")) continue;
    // Route groups add no URL segment: descend into them.
    if (entry.startsWith("(") && entry.endsWith(")")) {
      out.push(...protectedSegments(full));
      continue;
    }
    // A dynamic segment at the top level would gate nothing useful; flag it.
    if (entry.startsWith("[")) {
      out.push(`/${entry}`);
      continue;
    }
    out.push(`/${entry}`);
  }
  return out;
}

describe("protected route gating", () => {
  const segments = protectedSegments();

  it("finds the protected route tree", () => {
    expect(segments.length).toBeGreaterThan(20);
  });

  it("gates every segment under app/(protected) in the proxy", () => {
    const missing = segments.filter((s) => !AUTH_REQUIRED_PREFIXES.includes(s));
    expect(missing, `add these to lib/auth/auth-required-prefixes.ts: ${missing.join(", ")}`).toEqual([]);
  });

  it("matches the segment and its children but not look-alike prefixes", () => {
    expect(requiresAuth("/explore")).toBe(true);
    expect(requiresAuth("/explore/anything")).toBe(true);
    expect(requiresAuth("/explorer")).toBe(false);
    expect(requiresAuth("/")).toBe(false);
    expect(requiresAuth("/login")).toBe(false);
  });
});
