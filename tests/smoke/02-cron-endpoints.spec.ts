import { test, expect } from "@playwright/test";

/**
 * Cron auth — make sure the cron endpoints reject unauthenticated
 * requests AND accept the secret. Skips if CRON_SECRET isn't set
 * (e.g. local dev without env vars).
 */

const CRON_SECRET = process.env.CRON_SECRET;

test.describe("Cron auth", () => {
  test("daily question cron rejects without auth", async ({ request }) => {
    const r = await request.get("/api/cron/daily-question");
    expect([401, 403]).toContain(r.status());
  });

  test("parent digest cron rejects without auth", async ({ request }) => {
    const r = await request.get("/api/cron/parent-digest");
    expect([401, 403]).toContain(r.status());
  });

  test("daily question cron accepts the secret", async ({ request }) => {
    test.skip(!CRON_SECRET, "CRON_SECRET env var not set — skipping authed test");
    const r = await request.get("/api/cron/daily-question", {
      headers: { Authorization: `Bearer ${CRON_SECRET!}` },
    });
    // 200 = built/ok, 500 = orchestrator error (still surfaces). The
    // important thing: NOT 401.
    expect(r.status()).not.toBe(401);
    expect(r.status()).not.toBe(403);
    if (r.ok()) {
      const json = await r.json();
      expect(json).toHaveProperty("ok");
    }
  });
});
