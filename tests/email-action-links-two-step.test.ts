import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

/**
 * A link in an email gets fetched by things that are not people: provider
 * scanners, link previews, security gateways. On 16 Sep 2026 one of them filed
 * a community report. These routes used to act on that fetch.
 *
 * What is pinned here: following the link (GET) changes NOTHING, and only
 * pressing the button on the page it shows (POST) does the work.
 */
process.env.DAILY_REVIEW_SECRET = "test-secret-for-action-links";

const approve = vi.fn();
const cancel = vi.fn();
const runReviewAction = vi.fn();
const background: (() => unknown)[] = [];

vi.mock("next/server", async (orig) => ({
  ...(await orig<typeof import("next/server")>()),
  after: (fn: () => unknown) => void background.push(fn),
}));
vi.mock("@/lib/announcements/approval", async (orig) => ({
  ...(await orig<typeof import("@/lib/announcements/approval")>()),
  approve: (id: string) => approve(id),
  cancel: (id: string) => cancel(id),
}));
vi.mock("@/lib/daily/run-review-action", () => ({
  runReviewAction: (slug: string, action: string) => runReviewAction(slug, action),
}));

const { announceToken } = await import("@/lib/announcements/approval");
const { reviewToken } = await import("@/lib/daily/review-actions");
const announcements = await import("@/app/api/announcements/action/route");
const daily = await import("@/app/api/daily-review/action/route");

const ID = "2026-fall-costumes";
const announceUrl = (a: "approve" | "redraw" | "cancel", t = announceToken(ID, a)) =>
  `https://learn.readee.app/api/announcements/action?id=${ID}&a=${a}&t=${t}`;
const dailyUrl = (a: "image" | "passage" | "rebuild", t = reviewToken("2026-09-19", a)) =>
  `https://learn.readee.app/api/daily-review/action?date=2026-09-19&a=${a}&t=${t}`;

beforeEach(() => {
  approve.mockClear();
  cancel.mockClear();
  runReviewAction.mockClear();
  background.length = 0;
});

describe("product update approval", () => {
  it("does nothing when the link is merely fetched", async () => {
    for (const a of ["approve", "redraw", "cancel"] as const) {
      const res = await announcements.GET(new NextRequest(announceUrl(a)));
      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain('<form method="post">');
      // No action attribute: the form posts back to this signed address.
      expect(html).not.toMatch(/<form[^>]*action=/);
    }
    expect(approve).not.toHaveBeenCalled();
    expect(cancel).not.toHaveBeenCalled();
    expect(background).toHaveLength(0);
  });

  it("approves only on the button press", async () => {
    const res = await announcements.POST(new NextRequest(announceUrl("approve"), { method: "POST" }));
    expect(await res.text()).toContain("Approved");
    expect(approve).toHaveBeenCalledWith(ID);
  });

  it("cancels only on the button press", async () => {
    await announcements.POST(new NextRequest(announceUrl("cancel"), { method: "POST" }));
    expect(cancel).toHaveBeenCalledWith(ID);
    expect(approve).not.toHaveBeenCalled();
  });

  it("refuses a forged token on the button press too", async () => {
    const res = await announcements.POST(new NextRequest(announceUrl("approve", "0".repeat(32)), { method: "POST" }));
    expect(res.status).toBe(400);
    expect(approve).not.toHaveBeenCalled();
  });

  it("refuses a cancel token reused as an approve", async () => {
    const res = await announcements.POST(
      new NextRequest(announceUrl("approve", announceToken(ID, "cancel")), { method: "POST" }),
    );
    expect(res.status).toBe(400);
    expect(approve).not.toHaveBeenCalled();
  });
});

describe("daily review actions", () => {
  it("does not redraw a live picture because a scanner followed the link", async () => {
    for (const a of ["image", "passage", "rebuild"] as const) {
      const res = await daily.GET(new NextRequest(dailyUrl(a)));
      expect(await res.text()).toContain('<form method="post">');
    }
    expect(background).toHaveLength(0);
    expect(runReviewAction).not.toHaveBeenCalled();
  });

  it("runs the action on the button press", async () => {
    await daily.POST(new NextRequest(dailyUrl("image"), { method: "POST" }));
    expect(background).toHaveLength(1);
    await background[0]();
    expect(runReviewAction).toHaveBeenCalledWith("2026-09-19", "image");
  });

  it("refuses a forged token", async () => {
    const res = await daily.POST(new NextRequest(dailyUrl("image", "nope"), { method: "POST" }));
    expect(res.status).toBe(400);
    expect(background).toHaveLength(0);
  });
});
