import { describe, expect, it } from "vitest";
import { renderUnitCompleteEmail } from "@/lib/email/unit-complete";
import type { JourneyView, JourneyUnit } from "@/lib/journey-v2/types";

const unit = (id: string, status: JourneyUnit["status"], free: boolean): JourneyUnit => ({
  id, grade: "2nd Grade", band: 2, unitNo: Number(id.slice(-1)), name: `Unit ${id.slice(-1)}`, status, free,
  lessons: [{ id: "l", title: "L", standard: "RL.2.1", done: false, items: [{ kind: "lesson", id: "l", title: "L", unitId: id, done: false, passed: false, score: null, free, href: "/journey/play/lesson/l?child=c" }] }],
  exam: null, final: null, lessonsDone: 0, lessonsTotal: 1, credited: 0, pct: 0,
});

function view(free: boolean): JourneyView {
  const u2 = unit("g2-u2", "current", free);
  return {
    childId: "c", startBand: 2, enrolledBand: 4, prescribedUnitId: "g2-u1",
    units: [unit("g2-u1", "done", true), u2, unit("g2-u3", "next", free)], hiddenAhead: 0, unbuiltAhead: 8, beyondBar: 0,
    current: { unit: u2, item: u2.lessons[0].items[0] }, fullAccess: free, difficulty: "easier", credited: 8,
    why: ["Maya placed at 2nd grade, two grade levels below."],
    milestones: [{ label: "Reads like a 3rd grader", month: "late April", date: "2027-04-20" }],
  };
}

describe("unit-complete email", () => {
  it("free account: the ask lands on proof, with the road and the trial line", () => {
    const e = renderUnitCompleteEmail({ parentName: "Filip", childName: "Maya", childId: "c", unitName: "Unit 1", unitGrade: "2nd Grade", score: 90, premium: false, view: view(false), unsubscribeUrl: "https://x/u" });
    expect(e.subject).toBe("Maya passed 2nd Grade Unit 1");
    expect(e.ctaHref).toContain("/upgrade?reason=journey&child=c");
    expect(e.html).toContain("90%");
    expect(e.html).toContain("Unit 2 is ready");
    expect(e.html).toContain("late April");
    expect(e.html).toContain("14 days free");
    expect(e.text).toContain("Maya placed at 2nd grade");
    expect(e.html).not.toContain("—");
  });
  it("Readee+ account: points at the map, no trial line", () => {
    const e = renderUnitCompleteEmail({ parentName: null, childName: "Maya", childId: "c", unitName: "Unit 1", unitGrade: "2nd Grade", score: 75, premium: true, view: view(true), unsubscribeUrl: "https://x/u" });
    expect(e.ctaHref).toContain("/journey?child=c");
    expect(e.html).not.toContain("days free");
  });
});
