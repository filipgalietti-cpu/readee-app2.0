const { chromium, expect } = require("@playwright/test");
const { readFileSync } = require("node:fs");
(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] });
  try {
    const page = await browser.newPage({ permissions: ["microphone"], viewport: { width: 390, height: 844 } });
    const errors = [], aborted = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("requestfailed", r => { if (r.url().includes("child-name/respell")) aborted.push(r.failure()); });
    await page.addInitScript(() => {
      window.audioPlayed = [];
      window.audioEnded = [];
      const play = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function () {
        this.addEventListener("playing", () => window.audioPlayed.push(this.src), { once: true });
        this.addEventListener("ended", () => window.audioEnded.push(this.src), { once: true });
        return play.call(this);
      };
    });
    // Reproduce production's media policy rather than testing permissive localhost.
    await page.route("**/demo/**", async r => {
      const response = await r.fetch();
      await r.fulfill({ response, headers: { ...response.headers(), "content-security-policy": "media-src 'self' blob: https://*.supabase.co" } });
    });
    let releaseName, nameBody, nameFinished = false;
    const previewUrl = "data:audio/mpeg;base64," + readFileSync("public/audio/placement-spectrum/nice-to-meet-you.mp3").toString("base64");
    await page.route("**/api/**", async r => {
      if (r.request().method() !== "POST") return r.continue();
      if (r.request().url().includes("child-name/respell")) {
        nameBody = r.request().postDataJSON();
        await new Promise(resolve => { releaseName = resolve; });
        await r.fulfill({ json: { ok: true, saidAs: "fee-LOOSH" } });
        nameFinished = true;
      } else if (r.request().url().includes("child-name/preview")) {
        await r.fulfill({ json: { ok: true, audioUrl: previewUrl } });
      } else throw new Error("Unexpected write: " + r.request().url());
    });
    await page.goto("http://127.0.0.1:3431/demo/placement-studio");
    await page.getByRole("combobox").selectOption("23");
    await expect(page.locator("[data-name-luna]")).toBeInViewport();
    await expect(page.locator("[data-say-name-record]")).toHaveText("Stop");
    await page.waitForTimeout(350);
    await page.locator("[data-say-name-record]").click();
    await expect(page.getByRole("heading", { name: "It’s so nice to meet you!", exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.audioEnded.some(u => u.endsWith("nice-to-meet-you.mp3")))).toBe(true);
    expect(nameFinished).toBe(false); // Greeting completes while inference is still pending.
    expect(nameBody.childId).toBe("00000000-0000-4000-8000-000000000001");
    await expect(page.locator("[data-say-name-hear]")).toHaveCount(0);
    await page.screenshot({ path: "/private/tmp/name-background-greeting.png" });
    await page.getByRole("combobox").selectOption("2"); // Unmount name screen while request is in flight.
    releaseName();
    await expect.poll(() => nameFinished).toBe(true);
    expect(aborted).toEqual([]);
    for (const [width, height] of [[390,844],[320,568],[1280,800]]) {
      await page.setViewportSize({ width, height });
      const rabbit = await page.locator(".pa-word-bunny").boundingBox(), orb = await page.locator(".pa-mic-row .pa-reading-orb").boundingBox();
      expect(rabbit.width).toBeGreaterThanOrEqual(width < 600 ? 124 : 260);
      expect(rabbit.x + rabbit.width <= orb.x || rabbit.y >= orb.y + orb.height).toBe(true);
      await expect(page.locator("[data-skip-word]")).toBeInViewport();
    }
    await page.goto("http://127.0.0.1:3431/demo/name-pronunciation");
    // First prove that the old data URL really is blocked under this policy.
    expect(await page.evaluate(async url => { try { await new Audio(url).play(); return false; } catch { return true; } }, previewUrl)).toBe(true);
    await page.locator("[data-say-name-hear]").click();
    await expect.poll(() => page.evaluate(() => window.audioEnded.some(u => u.startsWith("blob:")))) .toBe(true);
    await expect(page.getByText("Tap Hear it again to play the pronunciation.")).toHaveCount(0);
    await page.locator("[data-say-name-hear]").click();
    await expect.poll(() => page.evaluate(() => window.audioEnded.filter(u => u.startsWith("blob:")).length)).toBe(2);
    await page.goto("http://127.0.0.1:3431/demo/reader-loading");
    await expect(page.locator("[data-reader-loading]")).toBeInViewport();
    expect(errors).toEqual([]);
    console.log("Passed: production CSP regression, blob playback/replay, greeting during pending inference, request survives handoff, Luna, rabbit, controls and loading.");
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
