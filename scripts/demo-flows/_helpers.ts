/**
 * Shared helpers for demo recording flows.
 *
 * Each flow exports a `run(ctx)` that drives a Playwright Page through
 * a scripted user journey. Helpers below standardize the common bits
 * (login, child handoff, click-with-cursor-highlight) so the flow
 * scripts stay focused on what to show.
 */

import type { BrowserContext, Page } from "@playwright/test";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { existsSync } from "node:fs";

export type FlowCtx = {
  page: Page;
  context: BrowserContext;
  baseUrl: string;
  parentEmail: string;
  parentPassword: string;
  /** Active child id — every kid surface (/learn, /practice, /stories) requires `?child=<id>`. */
  childId: string;
};

const AUTH_STATE_PATH = path.resolve(process.cwd(), ".demo-auth.json");
const AUTH_MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6 hrs — Supabase session is longer than this

/**
 * Tiny "cursor pulse" effect — injected once, then triggered before
 * each click. Gives the recording a subtle ring that highlights what
 * the user is about to tap. Competitor demos use this to make clicks
 * legible at speed.
 */
export async function installCursor(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      .__demo-cursor-pulse {
        position: fixed;
        pointer-events: none;
        width: 36px;
        height: 36px;
        border-radius: 999px;
        background: rgba(99, 102, 241, 0.35);
        border: 2px solid rgba(99, 102, 241, 0.9);
        transform: translate(-50%, -50%) scale(0);
        z-index: 999999;
        animation: __demo-pulse 600ms ease-out forwards;
      }
      @keyframes __demo-pulse {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 0.9; }
        100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
      }
    `,
  });
}

/** Click while showing the cursor-pulse ring at the click point. */
export async function clickWithPulse(page: Page, selector: string, opts: { timeout?: number } = {}): Promise<void> {
  const el = await page.waitForSelector(selector, {
    state: "visible",
    timeout: opts.timeout ?? 10_000,
  });
  const box = await el.boundingBox();
  if (box) {
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    // Show ring
    await page.evaluate(
      ({ cx, cy }: { cx: number; cy: number }) => {
        const ring = document.createElement("div");
        ring.className = "__demo-cursor-pulse";
        ring.style.left = `${cx}px`;
        ring.style.top = `${cy}px`;
        document.body.appendChild(ring);
        setTimeout(() => ring.remove(), 800);
      },
      { cx, cy },
    );
    await page.waitForTimeout(150);
  }
  await el.click();
}

/**
 * Hide widgets that intercept clicks or clutter the frame during
 * recording: the feedback bubble (bottom-right), the dev-tools "N"
 * Next.js indicator (bottom-left), and any toasts that linger. Add
 * to every page once cursor styles are installed.
 */
export async function hideRecordingChrome(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      button[aria-label*="feedback" i],
      button[aria-label*="Report an issue" i],
      [class*="intercom"],
      nextjs-portal,
      [data-nextjs-toast],
      [data-nextjs-dev-tools-button],
      [aria-label*="Open Next.js Dev Tools"] {
        display: none !important;
      }
    `,
  });
}

/** Pause with a comment so the timeline log reads clearly when debugging. */
export async function beat(page: Page, ms: number, label?: string): Promise<void> {
  if (label) console.log(`    ${label} (${ms}ms)`);
  await page.waitForTimeout(ms);
}

/** Sign in as the parent credentials from .env.local. */
export async function signInAsParent(ctx: FlowCtx): Promise<void> {
  const { page, baseUrl, parentEmail, parentPassword } = ctx;
  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('input[type="email"]', { state: "visible" });
  await page.fill('input[type="email"]', parentEmail);
  await page.fill('input[type="password"]', parentPassword);
  await clickWithPulse(page, 'button[type="submit"]');
  // Wait for redirect to dashboard.
  await page.waitForURL((url) => url.pathname.startsWith("/dashboard"), { timeout: 15_000 });
}

/**
 * Auth state cache — log in once via the orchestrator, dump cookies +
 * storage to disk, reuse across all subsequent recordings until the
 * cache expires. Each flow that needs auth starts mid-app instead of
 * mid-login form. Saves ~5s of dead air per recording and lets the
 * hero open on a kid surface directly.
 */
export function authStatePath(): string {
  return AUTH_STATE_PATH;
}

export async function isAuthStateFresh(): Promise<boolean> {
  if (!existsSync(AUTH_STATE_PATH)) return false;
  const stat = await fs.stat(AUTH_STATE_PATH);
  return Date.now() - stat.mtimeMs < AUTH_MAX_AGE_MS;
}

/** Use in the orchestrator to refresh the cached auth state. */
export async function captureAuthState(ctx: FlowCtx): Promise<void> {
  await signInAsParent(ctx);
  await ctx.context.storageState({ path: AUTH_STATE_PATH });
}

/**
 * Resolve the parent's first child id by visiting /dashboard and
 * scraping `child=<uuid>` from any sidebar link. Returns "" if
 * nothing resolved (caller will log + bail).
 *
 * Every kid surface (/learn, /practice, /stories) bails to a
 * "We lost track of which reader" fallback when this param is
 * missing, so we resolve it once per recording session.
 */
export async function resolveChildId(page: Page, baseUrl: string): Promise<string> {
  await page.goto(`${baseUrl}/dashboard`, { waitUntil: "domcontentloaded" });
  // Wait for the sidebar to populate the child store via Supabase.
  // Any link that includes `child=` carries the active child uuid.
  try {
    await page.waitForFunction(
      () => {
        const a = document.querySelector('a[href*="child="]') as HTMLAnchorElement | null;
        if (!a) return false;
        const m = a.href.match(/child=([^&]+)/);
        return !!(m && m[1] && m[1].length > 10);
      },
      undefined,
      { timeout: 10_000 },
    );
  } catch {
    return "";
  }
  const id = await page.evaluate(() => {
    const a = document.querySelector('a[href*="child="]') as HTMLAnchorElement | null;
    if (!a) return "";
    const m = a.href.match(/child=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : "";
  });
  return id;
}

/**
 * Smooth scroll to a selector. Uses Playwright's locator API so
 * selector engines like `:has-text()` work — raw document.querySelector
 * only accepts CSS selectors.
 */
export async function smoothScrollTo(page: Page, selector: string): Promise<void> {
  try {
    const loc = page.locator(selector).first();
    if (await loc.count()) {
      await loc.scrollIntoViewIfNeeded({ timeout: 3000 });
    }
  } catch {
    // no-op if nothing matches; the flow continues
  }
  await page.waitForTimeout(700);
}
