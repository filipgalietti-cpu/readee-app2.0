/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node CommonJS browser harness, matching the existing Journey tooling. */
const { chromium, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const base = process.env.JOURNEY_V2_URL || "http://127.0.0.1:3443/demo/journey-v2";
// Capture outside Next's watched worktree. Import artifacts after every browser closes.
const artifactRoot = fs.mkdtempSync("/tmp/readee-journey-v2-review-");
const output = path.join(artifactRoot, "screenshots");
fs.mkdirSync(output, { recursive: true });
const report = {
  viewports: [],
  fixtures: [],
  interactions: [],
  browserErrors: [],
  consoleNotes: [],
  writes: [],
};
async function pageFor(browser, viewport, extra = {}) {
  const context = await browser.newContext({ viewport, ...extra });
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__journeyTones = [];
    const start = OscillatorNode.prototype.start;
    OscillatorNode.prototype.start = function (...args) {
      window.__journeyTones.push(this.frequency.value);
      return start.apply(this, args);
    };
  });
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  cdp.on("Network.requestWillBeSent", (event) => {
    if (event.type === "Document")
      console.log("Document request:", event.request.url, JSON.stringify(event.initiator));
  });
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) console.log("Navigation:", frame.url());
  });
  page.on("pageerror", (e) => report.browserErrors.push(e.message));
  page.on("console", (e) => {
    if (e.text().includes("Refresh")) console.log(e.text());
    if (e.type() === "error") report.consoleNotes.push(e.text().slice(0, 220));
  });
  page.on("request", (r) => {
    if (
      ["POST", "PUT", "PATCH", "DELETE"].includes(r.method()) &&
      /\/api\/(checkout|placement|learn|practice|journey)|supabase.*\/rest\//.test(r.url())
    )
      report.writes.push(r.url());
  });
  await page.goto(base);
  await expect(page.locator("[data-journey-v2]")).toBeVisible({ timeout: 30000 });
  // Hide only the dev-tool badge from exported review screenshots; product DOM remains unchanged.
  await page.evaluate(() => {
    const style = document.createElement("style");
    style.textContent = "nextjs-portal { display:none!important; }";
    document.head.appendChild(style);
  });
  return { page, context };
}
async function ready(page) {
  const skip = page.getByRole("button", { name: "Skip animation", exact: true });
  if (await skip.isVisible()) {
    try {
      await skip.click({ timeout: 1500 });
    } catch (error) {
      // OS reduced motion or the timed reveal can remove this optional button between checks.
      if (await skip.count()) throw error;
    }
  }
  await expect(page.locator("[data-node-state=current] button").first()).toBeVisible();
  await expect(page.locator("[data-bunny] svg").first()).toBeVisible({ timeout: 30000 });
  await expect(page.locator("[data-node-state=current] button").first()).toBeEnabled();
  await page.waitForTimeout(750);
}
async function fixture(page, id) {
  await page.getByText("Design studio", { exact: false }).first().click();
  await page.getByLabel("Reader fixture", { exact: true }).selectOption(id);
  await page.getByText("Design studio", { exact: false }).first().click();
  await ready(page);
}
(async () => {
  const browser = await chromium.launch();
  try {
    for (const [name, width, height] of [
      ["desktop", 1440, 1000],
      ["tablet", 820, 1180],
      ["mobile", 390, 844],
    ]) {
      console.log("Checking", name);
      const { page, context } = await pageFor(browser, { width, height });
      await ready(page);
      await expect(page.locator("[data-site-header]")).toBeHidden();
      await expect(page.locator("[data-site-footer]")).toBeHidden();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect(
        await page.locator("[data-bunny] .bn-ground").evaluate((e) => getComputedStyle(e).display),
      ).toBe("none");
      const layers = await page
        .locator("[data-trail-layer]")
        .evaluateAll((es) => es.map((e) => e.getAttribute("data-trail-layer")));
      expect(layers.lastIndexOf("edge")).toBeLessThan(layers.indexOf("fill"));
      expect(layers.lastIndexOf("fill")).toBeLessThan(layers.indexOf("progress"));
      const layout = await page.locator("[data-map-layout]").getAttribute("data-map-layout");
      expect(layout).toBe("wide");
      expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
      const map = page.locator("[data-world-viewport]");
      expect(await map.evaluate((e) => e.scrollHeight <= e.clientHeight + 1)).toBe(true);
      await map.hover();
      await page.mouse.wheel(0, 400);
      expect(await map.evaluate((e) => e.scrollTop)).toBe(0);
      await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true });
      await page.getByRole("button", { name: "Let’s begin", exact: true }).click();
      await expect(page.getByRole("dialog")).toContainText("Sentence Shapes");
      await page.getByRole("button", { name: "Finish lesson preview" }).click();
      await expect(page.locator("[data-bunny]")).toHaveAttribute("data-travel", "true");
      expect(await page.evaluate(() => window.__journeyTones)).toEqual([523, 659, 784]);
      expect(
        await page
          .locator('[data-lesson="sentence-shapes"] button')
          .evaluate((e) => getComputedStyle(e).opacity),
      ).toBe("1");
      const start = await page.locator("[data-bunny]").getAttribute("style");
      await page.waitForTimeout(700);
      expect(await page.locator("[data-bunny]").getAttribute("style")).not.toBe(start);
      if (name === "mobile") {
        const view = page.locator("[data-world-viewport]");
        await view.hover();
        await page.mouse.wheel(110, 0);
        await expect(view).toHaveAttribute("data-camera", "manual");
      }
      await expect(page.locator("[data-bunny]")).toHaveAttribute("data-travel", "false", {
        timeout: 7000,
      });
      await expect(page.locator("[data-lesson=sentence-shapes]")).toHaveAttribute(
        "data-node-state",
        "completed",
      );
      await expect(page.locator("[data-lesson=blend-builders]")).toHaveAttribute(
        "data-node-state",
        "current",
      );
      if (name === "mobile") {
        const view = page.locator("[data-world-viewport]");
        const top = await view.evaluate((e) => e.scrollLeft);
        await page.waitForTimeout(700);
        expect(Math.abs((await view.evaluate((e) => e.scrollLeft)) - top)).toBeLessThan(2);
      }
      await page.getByRole("button", { name: "Back to bunny", exact: true }).click();
      await page.getByRole("button", { name: "Continue with Readee+", exact: true }).click();
      await expect(page.getByRole("dialog")).toContainText("Unlock Filus’s reading journey");
      await expect
        .poll(() =>
          page
            .locator("dialog img")
            .evaluateAll((images) => images.every((img) => img.complete && img.naturalWidth > 0)),
        )
        .toBe(true);
      if (name === "desktop")
        await page.screenshot({ path: path.join(output, "paywall.png"), fullPage: false });
      await page.getByRole("button", { name: /Preview \d+-day trial/ }).click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(page.getByLabel("Fixture access")).toHaveValue("subscriber");
      await page.getByRole("button", { name: "Let’s begin", exact: true }).click();
      await page.getByRole("button", { name: "Finish lesson preview" }).click();
      await expect(page.locator("[data-bunny]")).toHaveAttribute("data-travel", "false", {
        timeout: 7000,
      });
      await page.getByRole("button", { name: "Let’s begin", exact: true }).click();
      await page.getByRole("button", { name: "Finish lesson preview" }).click();
      await expect(page.locator("[data-bunny]")).toHaveAttribute("data-travel", "false", {
        timeout: 7000,
      });
      if (name === "desktop") {
        const bunny = await page.locator("[data-bunny] svg").boundingBox();
        const world = await page.locator("[data-world-viewport]").boundingBox();
        expect(bunny.y).toBeGreaterThanOrEqual(world.y);
        await page.screenshot({ path: path.join(output, "checkpoint.png"), fullPage: true });
      }
      await page.getByRole("button", { name: "Open chapter checkpoint" }).click();
      await page.getByRole("button", { name: "Finish checkpoint preview" }).click();
      await expect(page.getByRole("dialog")).toContainText("Sound Garden, explored!");
      await page.getByRole("button", { name: "Explore the next chapter" }).click();
      await expect(page.locator("[data-theme=valley]")).toBeVisible();
      report.viewports.push({ name, width, height, layout, passed: true });
      await context.close();
    }
    const { page, context } = await pageFor(browser, { width: 1440, height: 1000 });
    await ready(page);
    await expect(page.locator('[aria-label="Journey chapters"]')).toHaveCount(0);
    for (const id of [
      "foundations",
      "farther",
      "meaning",
      "above",
      "provisional",
      "progress",
      "subscriber",
      "free",
      "garden-later",
      "woods",
    ]) {
      await fixture(page, id);
      await page.screenshot({ path: path.join(output, `fixture-${id}.png`), fullPage: true });
      report.fixtures.push({
        id,
        title: await page.getByRole("heading", { level: 1 }).innerText(),
        lessons: await page.locator("[data-lesson]").count(),
        current: await page.locator("[data-node-state=current]").getAttribute("data-lesson"),
      });
    }
    await fixture(page, "above");
    await page.getByLabel("Journey review controls", { exact: true }).click();
    await page.getByLabel("Completed lessons").selectOption("3");
    await page.getByLabel("Journey review controls", { exact: true }).click();
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(output, "tablet-fourth-lesson.png"), fullPage: true });
    await page.getByLabel("Journey review controls", { exact: true }).click();
    await page.getByLabel("Completed lessons").selectOption("7");
    await page.getByLabel("Journey review controls", { exact: true }).click();
    await expect(page.locator("[data-node-state=current]")).toHaveCount(0);
    await page.getByRole("button", { name: "Open chapter checkpoint" }).click();
    await expect(page.getByRole("button", { name: "Finish checkpoint preview" })).toBeEnabled();
    await page.keyboard.press("Escape");
    await page.setViewportSize({ width: 1440, height: 1000 });
    await fixture(page, "provisional");
    await page.getByRole("button", { name: "Why this journey?", exact: true }).click();
    await expect(page.getByRole("dialog")).toContainText("Provisional start");
    await page.getByText("See the reason and evidence source", { exact: true }).click();
    await expect(page.getByRole("dialog")).toContainText("provisional follow up");
    await page.screenshot({ path: path.join(output, "parent-evidence.png"), fullPage: false });
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(
      await page
        .getByRole("button", { name: "Why this journey?", exact: true })
        .evaluate((e) => e === document.activeElement),
    ).toBe(true);
    await fixture(page, "foundations");
    await page.getByLabel("Journey review controls", { exact: true }).click();
    await page.getByRole("button", { name: "Replay the reveal", exact: true }).click();
    await page.getByLabel("Journey review controls", { exact: true }).click();
    await page.waitForTimeout(1750);
    await page.screenshot({ path: path.join(output, "assessment-reveal.png"), fullPage: true });
    await page.getByRole("button", { name: "Build my journey", exact: true }).click();
    await expect(page.locator('[data-magic-cover]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Skip animation", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Show reading journey now" }).click();
    await expect(page.locator('[data-phase="ready"]')).toHaveCount(1, { timeout: 5000 });
    await ready(page);
    await context.close();
    const narrow = await pageFor(browser, { width: 320, height: 780 });
    await ready(narrow.page);
    await fixture(narrow.page, "provisional");
    expect(
      await narrow.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBe(true);
    await narrow.page.getByText("Design studio", { exact: false }).first().click();
    await narrow.page.getByLabel("Simulate reduced motion", { exact: true }).check();
    await narrow.page.getByText("Design studio", { exact: false }).first().click();
    await narrow.page.getByLabel("Journey review controls", { exact: true }).click();
    await narrow.page.getByRole("button", { name: "Replay the reveal", exact: true }).click();
    await narrow.page.getByLabel("Journey review controls", { exact: true }).click();
    expect(
      await narrow.page.getByRole("button", { name: "Skip animation", exact: true }).count(),
    ).toBe(0);
    await narrow.page.screenshot({
      path: path.join(output, "mobile-long-name.png"),
      fullPage: true,
    });
    await expect(
      narrow.page.getByRole("button", { name: "Let’s begin", exact: true }),
    ).toBeVisible();
    await narrow.context.close();
    const reduced = await pageFor(
      browser,
      { width: 390, height: 844 },
      { reducedMotion: "reduce" },
    );
    await ready(reduced.page);
    expect(
      await reduced.page.getByRole("button", { name: "Skip animation", exact: true }).count(),
    ).toBe(0);
    await reduced.page.getByRole("button", { name: "Let’s begin", exact: true }).click();
    await reduced.page.getByRole("button", { name: "Finish lesson preview" }).click();
    await expect(reduced.page.locator("[data-bunny]")).toHaveAttribute("data-travel", "false");
    await reduced.page.screenshot({
      path: path.join(output, "reduced-motion.png"),
      fullPage: true,
    });
    await reduced.context.close();
    const video = await pageFor(
      browser,
      { width: 1280, height: 900 },
      {
        recordVideo: {
          dir: path.join(artifactRoot, "recording"),
          size: { width: 1280, height: 900 },
        },
      },
    );
    await video.page.waitForTimeout(1800);
    await video.page.getByRole("button", { name: "Build my journey", exact: true }).click();
    await video.page.waitForTimeout(3600);
    await video.page.getByRole("button", { name: "Let’s begin", exact: true }).click();
    await video.page.waitForTimeout(600);
    await video.page.getByRole("button", { name: "Finish lesson preview" }).click();
    await video.page.waitForTimeout(2600);
    await video.page.getByRole("button", { name: "Continue with Readee+", exact: true }).click();
    await video.page.waitForTimeout(1400);
    const videoPath = await video.page.video().path();
    await video.context.close();
    fs.copyFileSync(videoPath, path.join(artifactRoot, "journey-v2-demo.webm"));
    const quiet = await pageFor(browser, { width: 1440, height: 1000 });
    await ready(quiet.page);
    await quiet.page.getByRole("button", { name: "Mute journey sounds", exact: true }).click();
    await quiet.page.getByRole("button", { name: "Let’s begin", exact: true }).click();
    await quiet.page.getByRole("button", { name: "Finish lesson preview" }).click();
    await quiet.page.waitForTimeout(400);
    expect(await quiet.page.evaluate(() => window.__journeyTones)).toEqual([]);
    await quiet.context.close();
    expect(report.browserErrors).toEqual([]);
    expect(report.writes).toEqual([]);
    report.consoleNotes = [...new Set(report.consoleNotes)];
    report.interactions = [
      "Build my journey staged reveal",
      "Completion audio: C5-E5-G5, suppressed when muted",
      "Early provisional checkpoint and later entry fixtures",
      "Measured-path bunny travel",
      "User scroll cancels camera follow",
      "Return to bunny",
      "Completion credit",
      "Fixture paywall and trial access",
      "Checkpoint and chapter keepsake",
      "Chapter progression through the completion keepsake",
      "Evidence provenance",
      "Escape and focus restoration",
      "Reduced motion",
    ];
    fs.writeFileSync(
      path.join(artifactRoot, "browser-verification.json"),
      JSON.stringify(report, null, 2) + "\n",
    );
    await browser.close();
    fs.cpSync(output, "docs/journey-v2/screenshots", { recursive: true });
    for (const file of ["browser-verification.json", "journey-v2-demo.webm"])
      fs.copyFileSync(path.join(artifactRoot, file), path.join("docs/journey-v2", file));
    console.log(JSON.stringify(report, null, 2));
  } finally {
    fs.writeFileSync(
      path.join(artifactRoot, "last-observations.json"),
      JSON.stringify(report, null, 2),
    );
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
