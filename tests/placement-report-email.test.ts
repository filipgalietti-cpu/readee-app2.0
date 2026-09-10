import { describe, it, expect } from "vitest";
import { fixtureMaya } from "@/lib/placement/fixtures";
import { framingFor, renderPlacementReportEmail } from "@/lib/email/placement-report";

import { spectrumSubmission } from "./fixtures/placement-spectrum";
import { decidePlacement } from "@/lib/placement/decide";
import { buildPlan } from "@/lib/placement/plan";

const opts = { parentName: "Sam", premium: false, unsubscribeUrl: "https://learn.readee.app/u?t=x" };
/** The HTML escapes apostrophes and quotes; compare on the unescaped, case-folded text. */
const plain = (html: string) => html.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").toLowerCase();
const has = (html: string, s: string) => plain(html).includes(s.toLowerCase());

describe("placement report email", () => {
  const r = fixtureMaya();
  it("frames a below-grade reader around the plan and links to their journey before checkout", () => {
    expect(framingFor(r)).toBe("below");
    const e = renderPlacementReportEmail(r, opts);
    expect(e.subject).toBe("Maya's reading placement: the plan to catch up");
    expect(has(e.html, "Maya's Reading Journey is ready")).toBe(true);
    expect(e.ctaHref).toContain(`/journey?child=${r.childId}&from=placement`);
    expect(has(e.html, "Go to Maya's Custom Reading Journey")).toBe(true);
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
  it("sends a Readee+ parent to their child’s journey with no trial copy", () => {
    const e = renderPlacementReportEmail(r, { ...opts, premium: true });
    expect(e.ctaHref).toBe(`https://learn.readee.app/journey?child=${r.childId}`);
    expect(has(e.html, "Go to Maya's Custom Reading Journey")).toBe(true);
    expect(has(e.html, "14-day free trial")).toBe(false);
  });
  it("rounds fractional reading speed in both email formats", () => {
    const fractional = structuredClone(r);
    fractional.decision.fluency!.wcpm = 8.268448976779439;
    const email = renderPlacementReportEmail(fractional, opts);
    expect(email.text).toContain("8 (words a minute)");
    expect(email.html).toMatch(/>8</);
    for (const content of [email.text, email.html]) expect(content).not.toContain("8.268");
  });
  it("does not invent a started trial, reminder date or first charge", () => {
    const email = renderPlacementReportEmail(r, opts);
    for (const content of [email.text, plain(email.html)]) {
      expect(content.toLowerCase()).not.toMatch(/starts today|first charge|we email you a reminder|\$0 due now/);
      expect(content).toContain("credit card");
    }
  });
  it("shows an actual guided grade and skill evidence for a provisional reader", () => {
    const submission = spectrumSubmission(3, 5, 2, 2);
    const decision = decidePlacement(submission);
    decision.spectrum!.readingBand = null;
    const current = { ...r, enrolled: submission.enrolled, decision,
      plan: buildPlan({ decision, moments: [], today: new Date(r.createdAt) }) };
    const email = renderPlacementReportEmail(current, opts);
    expect(email.text).toContain("Grade 2 (guided lesson start)");
    expect(email.text).toContain("word probes correct");
    expect(email.html).toContain("word probes correct");
    expect(email.text).toContain("Start with 2nd grade reading.");
  });
  it("never leaks raw HTML from content strings", () => {
    const hacked = { ...r, childName: "<b>Maya</b>" };
    const e = renderPlacementReportEmail(hacked, opts);
    expect(e.html).not.toContain("<b>Maya</b>");
  });
});
