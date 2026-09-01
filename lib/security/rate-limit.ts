import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Central, DB-backed rate limiter — the backstop the app lacked (no /api gate
 * in proxy.ts, no per-route throttle). Counts attempts per (bucket, key) in a
 * sliding window via the rate_limit_hits ledger, so it holds across serverless
 * instances. Use on abuse-prone endpoints (unauthenticated forms, enumeration
 * surfaces, expensive ops).
 *
 * Fail-open by design: if the ledger read/write errors, we allow the request
 * rather than take the feature down — this is abuse mitigation, not an auth
 * boundary. The endpoints it guards have their own primary controls.
 */
export async function rateLimit(opts: {
  bucket: string;
  key: string;
  limit: number;
  windowMs: number;
}): Promise<{ ok: boolean; remaining: number }> {
  const { bucket, key, limit, windowMs } = opts;
  if (!key) return { ok: true, remaining: limit }; // no key (e.g. no IP) — can't throttle, don't block
  const admin = supabaseAdmin();
  const since = new Date(Date.now() - windowMs).toISOString();
  try {
    // Record this attempt, then count the window (this request included).
    await admin.from("rate_limit_hits").insert({ bucket, key });
    const { count } = await admin
      .from("rate_limit_hits")
      .select("id", { count: "exact", head: true })
      .eq("bucket", bucket)
      .eq("key", key)
      .gte("created_at", since);
    const used = count ?? 0;
    return { ok: used <= limit, remaining: Math.max(0, limit - used) };
  } catch {
    return { ok: true, remaining: limit }; // fail open — never take the endpoint down
  }
}

/**
 * Best-effort client IP. Prefers Vercel's `x-real-ip` (set by the platform's
 * proxy, not client-forgeable) over `x-forwarded-for` — whose LEFTMOST value
 * is attacker-supplied and defeats naive throttles.
 */
export function clientIp(req: Request): string {
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    // Right-most hop is the one our own proxy appended = closest to trusted.
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return "";
}
