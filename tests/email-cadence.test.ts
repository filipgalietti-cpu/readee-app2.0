import { describe, it, expect } from "vitest";
import { renderQuietNudge, renderTrialEnding, renderTrialStarted, renderWinBack } from "@/lib/email/cadence";
import type { ChildJourneyContext } from "@/lib/email/journey-context";

const ctx: ChildJourneyContext = {
  childId: "c1",
  firstName: "Maya",
  grade: "4th",
  streak: 3,
  nextLesson: { title: "Long vowel teams", unit: "2nd Grade Sound Workshop", standardId: "RF.2.3b" },
  placement: { levelLabel: "2nd grade", readingLevelName: "Growing Reader", topNeed: "3rd-grade words", nextMilestone: { label: "Reads like a 3rd grader", month: "late April" }, lessons: 83, weeks: 20 },
};
const plain = (h: string) => h.replace(/&#39;/g, "'").replace(/&quot;/g, '"').toLowerCase();
const u = "https://learn.readee.app/u?t=x";
const end = Math.floor(new Date("2026-09-16T12:00:00Z").getTime() / 1000);

describe("email cadence", () => {
  it("trial started: first lesson by name, the routine, the first flag, the honest trial line", () => {
    const e = renderTrialStarted("Sam", ctx, end, u);
    expect(e.subject).toBe("Readee+ is on: Maya's first week");
    for (const s of ["Long vowel teams", "Ten minutes a day", "reading like a 3rd grader by late April", "free until September 16", "cancel in one tap"]) expect(plain(e.html)).toContain(s.toLowerCase());
  });
  it("trial ending: what she did, what is next, the date, the amount, the exit", () => {
    const e = renderTrialEnding("Sam", ctx, { lessons: 6, days: 4 }, end, "$9.99 a month", u);
    expect(e.subject).toBe("Maya's Readee+ trial ends in 3 days");
    for (const s of ["finished 6 lessons on 4 days", "3-day streak", "Next up: Long vowel teams", "$9.99 a month starts on September 16", "keeps the free first unit"]) expect(plain(e.html)).toContain(s.toLowerCase());
  });
  it("trial ending with no lessons yet says so plainly", () => {
    const e = renderTrialEnding(null, ctx, { lessons: 0, days: 0 }, end, "$9.99 a month", u);
    expect(plain(e.html)).toContain("has not started a lesson yet");
  });
  it("win-back: where she was, the waiting lesson, the way back", () => {
    const e = renderWinBack("Sam", ctx, u);
    for (const s of ["placed at 2nd grade (growing reader), working on 3rd-grade words", "Long vowel teams", "free first unit stays open", "/upgrade?reason=winback"]) expect(plain(e.html)).toContain(s.toLowerCase());
  });
  it("quiet nudge: the next lesson by name and the placement's reason", () => {
    const e = renderQuietNudge("Sam", ctx, 4, u);
    expect(e.subject).toBe("Maya's next lesson: Long vowel teams");
    for (const s of ["4 days since", "3rd-grade words", "restarts the streak"]) expect(plain(e.html)).toContain(s.toLowerCase());
  });
  it("works without a child context", () => {
    expect(renderQuietNudge(null, null, 3, u).subject).toContain("your reader");
    expect(renderTrialStarted(null, null, null, u).html).toContain("free");
  });
});
