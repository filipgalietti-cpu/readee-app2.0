import { describe, it, expect } from "vitest";
import { fixtureMaya } from "@/lib/placement/fixtures";
import { framingFor, renderPlacementReportEmail } from "@/lib/email/placement-report";

const opts = { parentName: "Sam", premium: false, unsubscribeUrl: "https://learn.readee.app/u?t=x" };
/** The HTML escapes apostrophes and quotes; compare on the unescaped, case-folded text. */
const plain = (html: string) => html.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").toLowerCase();
const has = (html: string, s: string) => plain(html).includes(s.toLowerCase());

describe("placement report email", () => {
  const r = fixtureMaya();
  it("frames a below-grade reader around the plan and sends them to the report to start the trial", () => {
    expect(framingFor(r)).toBe("below");
    const e = renderPlacementReportEmail(r, opts);
    expect(e.subject).toBe("Maya's reading placement: the plan to catch up");
    expect(has(e.html, "Maya's Reading Journey is ready")).toBe(true);
    expect(e.ctaHref).toContain(`/placement/report?child=${r.childId}`);
    expect(has(e.html, "Start Maya's Reading Journey")).toBe(true);
    expect(has(e.html, "14-day free trial")).toBe(true);
  });
  it("carries the reveal's numbers, skills, journey, milestones, tips and the reviewer", () => {
    const e = renderPlacementReportEmail(r, opts);
    for (const s of ["words a minute", "Custom Reading Journey", "late April", "Three things to do at home this week", "Jennifer Klingerman", "hand-crafted", "See the full report"]) {
      expect(has(e.html, s)).toBe(true);
      expect(e.text.toLowerCase().includes(s.toLowerCase())).toBe(true);
    }
    expect(has(e.html, "Skipped:")).toBe(false);
  });
  it("sends a Readee+ parent straight to the first lesson with no trial copy", () => {
    const e = renderPlacementReportEmail(r, { ...opts, premium: true });
    expect(e.ctaHref).toBe("https://learn.readee.app/dashboard");
    expect(has(e.html, "Start Maya's first lesson")).toBe(true);
    expect(has(e.html, "14-day free trial")).toBe(false);
  });
  it("never leaks raw HTML from content strings", () => {
    const hacked = { ...r, childName: "<b>Maya</b>" };
    const e = renderPlacementReportEmail(hacked, opts);
    expect(e.html).not.toContain("<b>Maya</b>");
  });
});
