import { expect, it, vi } from "vitest";
vi.mock("@/lib/ai/build-parent-snapshot", () => ({ buildParentSnapshot: vi.fn() }));
vi.mock("@/lib/email/journey-context", () => ({ childJourneyContext: vi.fn() }));
import { renderDigest } from "@/lib/email/parent-digest";
it("includes reviewed progress and the protected parent report in HTML and plain text without sending", () => {
  const kid: Parameters<typeof renderDigest>[0]["children"][number] = {
    childId: "11111111-1111-4111-8111-111111111111",
    firstName: "Reader",
    grade: "K",
    passagesFinished: 0,
    questionsAttempted: 0,
    questionsCorrect: 0,
    comprehensionPct: null,
    daysThisWeek: 0,
    streak: 0,
    bestStreak: 0,
    aiHeadline: null,
    aiAction: null,
    weakestStandard: null,
    strongestStandard: null,
    nextLessonTitle: null,
    nextLessonUnit: null,
    milestoneLine: null,
    unlocksThisWeek: [],
    reviewedLessons: [
      { title: "Pip <Tree>", line: "5 of 6 independently checked questions correct (83%)" },
    ],
  };
  const mail = renderDigest({
    parentName: "Parent",
    children: [kid],
    unsubscribeUrl: "https://example.test/unsubscribe",
  });
  expect(mail.html).toContain("Pip &lt;Tree&gt;");
  expect(mail.html).toContain("5 of 6 independently");
  expect(mail.text).toContain("/learn/unit-one/report?child=" + kid.childId);
  expect(mail.html).toContain("/learn/unit-one/report?child=" + kid.childId);
  expect(mail.subject).not.toContain("0%");
  expect(mail.text).not.toContain("No Readee time");
  expect(mail.text).toContain("https://example.test/unsubscribe");
});
