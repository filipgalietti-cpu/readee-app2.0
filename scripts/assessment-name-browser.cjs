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
      window.turns = [];
      document.addEventListener("DOMContentLoaded", () => {
        new MutationObserver(() => {
          const frame = document.querySelector("[data-screen]");
          const phase = document.querySelector("[data-name-turn]")?.getAttribute("data-name-turn") || frame?.getAttribute("data-screen");
          if (!phase || window.turns.at(-1)?.phase === phase) return;
          const rect = document.querySelector(".pa-greeting-orb")?.getBoundingClientRect();
          window.turns.push({ phase, box: rect && { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, opens: window.micOpens, stops: window.micStops });
        }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-screen", "data-name-turn"] });
      });
      window.micOpens = 0;
      window.micStops = 0;
      // Real PCM through the production hook; only the input device is synthetic.
      navigator.mediaDevices.getUserMedia = async () => {
        window.micOpens++;
        const ctx = new AudioContext();
        await ctx.resume();
        const oscillator = ctx.createOscillator(), gain = ctx.createGain(), destination = ctx.createMediaStreamDestination();
        oscillator.frequency.value = 220;
        gain.gain.value = 0;
        oscillator.connect(gain).connect(destination);
        oscillator.start();
        window.voiceGain = gain;
        for (const track of destination.stream.getTracks()) {
          const stop = track.stop.bind(track);
          track.stop = () => { window.micStops++; stop(); void ctx.close(); };
        }
        return destination.stream;
      };
      window.audioEnded = [];
      const play = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function () {
        this.addEventListener("playing", () => window.audioPlayed.push(this.src), { once: true });
        this.addEventListener("ended", () => window.audioEnded.push(this.src), { once: true });
        this.playbackRate = 3;
        return play.call(this);
      };
    });
    // Apply the production media policy without buffering Next's dev HTML stream.
    await page.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        const policy = document.createElement("meta");
        policy.httpEquiv = "Content-Security-Policy";
        policy.content = "media-src 'self' blob: https://*.supabase.co";
        document.head.append(policy);
      }, { once: true });
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
      } else if (r.request().url().includes("luna/speech-token")) {
        await r.fulfill({ json: { ok: true, token: "test-only", region: "eastus" } });
      } else if (r.request().url().includes("child-name/preview")) {
        await r.fulfill({ json: { ok: true, audioUrl: previewUrl } });
      } else throw new Error("Unexpected write: " + r.request().url());
    });
    const base = process.env.PLACEMENT_BASE_URL || "http://127.0.0.1:3431";
    const voice = async () => {
      await page.evaluate(() => window.voiceGain.gain.value = 0.12);
      await expect(page.getByText("Luna can hear you.", { exact: true })).toBeVisible({ timeout: 5000 });
      await page.waitForTimeout(900);
      await page.evaluate(() => window.voiceGain.gain.value = 0);
    };
    await page.goto(base + "/demo/placement-run?grade=1", { waitUntil: "domcontentloaded" });
    await page.locator("[data-begin]").click();
    await expect.poll(() => page.evaluate(() => window.audioEnded.some(u => u.includes("mic-check"))), { timeout: 30000 }).toBe(true);
    const helloBox = await page.locator(".pa-greeting-orb").boundingBox();
    await voice();
    await expect(page.locator('[data-name-turn="listening"]')).toBeVisible({ timeout: 15000 }).catch(async e => { console.log(await page.locator(".pa-stage").innerText(), await page.evaluate(() => window.audioEnded)); throw e; });
    const nameBox = await page.locator(".pa-greeting-orb").boundingBox();
    expect(nameBox).toEqual(helloBox);
    // Silence followed by Done stays in the same turn, with a usable retry/skip.
    await page.locator("[data-name-done]").click();
    await expect(page.locator('[data-name-turn="quiet"]')).toBeVisible();
    expect(await page.locator(".pa-greeting-orb").boundingBox()).toEqual(nameBox);
    await page.locator("[data-name-done]").click();
    await expect(page.locator('[data-name-turn="listening"]')).toBeVisible();
    await page.waitForTimeout(2000); // A child can think before answering.
    await voice();
    // The acknowledgement can be shorter than a polling interval at 3x audio.
    // Observe the transition itself rather than waiting for that transient slide.
    await expect(page.locator('[data-word="sun"]')).toBeVisible({ timeout: 15000 });
    const turns = await page.evaluate(() => window.turns);
    expect(turns.find(t => t.phase === "received").box).toEqual(nameBox);
    expect(turns.find(t => t.phase === "word")).toMatchObject({ opens: 1, stops: 0 });
    expect(nameFinished).toBe(false); // Reading starts while pronunciation is pending.
    expect(nameBody.childId).toBe("00000000-0000-0000-0000-000000000000");
    expect(Buffer.from(nameBody.audioBase64, "base64").subarray(0, 4).toString()).toBe("RIFF");
    expect(await page.evaluate(() => window.audioEnded.some(u => u.endsWith("nice-to-meet-you.mp3")))).toBe(true);
    releaseName();
    await expect.poll(() => nameFinished).toBe(true);
    expect(aborted).toEqual([]);
    console.log("Passed real hello/name/warmup with one microphone and no orb movement.");
    await page.goto(base + "/demo/placement-studio", { waitUntil: "domcontentloaded" });
    // The studio is server-rendered. Wait for Luna's first painted frame before
    // changing its native select so an action cannot precede hydration.
    await expect.poll(() => page.locator(".pa-reading-orb button").first().evaluate(el => el.style.transform)).toContain("scale(");
    await page.getByRole("combobox").selectOption("2");
    for (const [width, height] of [[390,844],[320,568],[1280,800]]) {
      await page.setViewportSize({ width, height });
      let fixedBox;
      for (const label of ["Microphone", "Name prompt", "Child name", "Name retry", "Name received"]) {
        await page.getByRole("combobox").selectOption({ label });
        const box = await page.locator(".pa-greeting-orb").boundingBox();
        if (fixedBox) expect(box).toEqual(fixedBox);
        fixedBox = box;
        await expect(page.locator(".pa-greeting-orb")).toBeInViewport({ ratio: 1 });
        if (label !== "Microphone") {
          await expect(page.locator("[data-name-done]")).toBeInViewport({ ratio: 1 });
          await expect(page.locator("[data-name-skip]")).toBeInViewport({ ratio: 1 });
        }
        await page.screenshot({ path: `/private/tmp/assessment-${width}-${label.replaceAll(" ", "-")}.png` });
      }
      let wordBox;
      for (const label of ["A word", "Word connecting", "Word thinking", "Word microphone retry"]) {
        await page.getByRole("combobox").selectOption({ label });
        const box = await page.locator(".pa-mic-row .pa-reading-orb").boundingBox();
        if (wordBox) expect(box).toEqual(wordBox);
        wordBox = box;
      }
      await page.getByRole("combobox").selectOption("2");
      const rabbit = await page.locator(".pa-word-bunny").boundingBox(), orb = await page.locator(".pa-mic-row .pa-reading-orb").boundingBox();
      expect(rabbit.width).toBeGreaterThanOrEqual(width < 600 ? 124 : 260);
      expect(rabbit.x + rabbit.width <= orb.x || rabbit.y >= orb.y + orb.height).toBe(true);
      await expect(page.locator("[data-skip-word]")).toBeInViewport();
    }
    await page.goto(base + "/demo/name-pronunciation", { waitUntil: "load" });
    // First prove that the old data URL really is blocked under this policy.
    expect(await page.evaluate(async url => { try { await new Audio(url).play(); return false; } catch { return true; } }, previewUrl)).toBe(true);
    await page.locator("[data-say-name-hear]").click();
    await expect.poll(() => page.evaluate(() => window.audioEnded.some(u => u.startsWith("blob:")))) .toBe(true);
    await expect(page.getByText("Tap Hear it again to play the pronunciation.")).toHaveCount(0);
    await page.locator("[data-say-name-hear]").click();
    await expect.poll(() => page.evaluate(() => window.audioEnded.filter(u => u.startsWith("blob:")).length)).toBe(2);
    await page.goto(base + "/demo/reader-loading", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-reader-loading]")).toBeInViewport();
    expect(errors).toEqual([]);
    console.log("Passed: actual hello/name/warmup handoff, one microphone, silent retry, stationary Luna, pending pronunciation, production CSP playback, rabbit and loading.");
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
