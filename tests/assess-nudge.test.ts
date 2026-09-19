import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

/**
 * Until 19 Sep 2026 a family that signed up and never took the assessment got
 * "Tariq hasn't logged a lesson in 14 days. Reading streaks rebuild fast" every
 * week. There was no streak. They were 78 of the 105 families on the list, and
 * the email never asked for the one thing that starts the product.
 */
process.env.DAILY_REVIEW_SECRET = "test-secret-for-assess-nudge";
process.env.RESEND_API_KEY = "test";

type Row = Record<string, unknown>;
let tables: Record<string, Row[]> = {};
const sends: { to: string; subject: string; from: string; text: string }[] = [];

/** Just enough of the query builder: filters narrow an in-memory table. */
function from(table: string) {
  let rows = [...(tables[table] ?? [])];
  const q: Record<string, unknown> = {
    select: () => q,
    eq: (c: string, v: unknown) => ((rows = rows.filter((r) => r[c] === v)), q),
    in: (c: string, v: unknown[]) => ((rows = rows.filter((r) => v.includes(r[c]))), q),
    order: (c: string, o?: { ascending?: boolean }) => (
      rows.sort((a, b) => (String(a[c]) < String(b[c]) ? -1 : 1) * (o?.ascending === false ? -1 : 1)), q
    ),
    limit: (n: number) => ((rows = rows.slice(0, n)), q),
    maybeSingle: async () => ({ data: rows[0] ?? null, error: null }),
    insert: async (row: Row) => {
      (tables[table] ??= []).push({ sent_at: new Date().toISOString(), ...row });
      return { error: null };
    },
    then: (resolve: (v: unknown) => void) => resolve({ data: rows, count: rows.length, error: null }),
  };
  return new Proxy(q, { get: (t, k: string) => t[k] ?? (() => q) });
}

vi.mock("@/lib/supabase/admin", () => ({ supabaseAdmin: () => ({ from }) }));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: async (m: (typeof sends)[number]) => (sends.push(m), { data: { id: "x" }, error: null }) };
  },
}));
vi.mock("next/server", async (orig) => ({ ...(await orig<typeof import("next/server")>()), after: () => undefined }));

const { evaluateAndSendLifecycle } = await import("@/lib/email/lifecycle");
const { assessNudgeDue, renderAssessNudge, buildAssessNudgePreview, ASSESS_NUDGE_ID } = await import("@/lib/email/assess-nudge");
const { announceToken } = await import("@/lib/announcements/approval");
const route = await import("@/app/api/announcements/action/route");

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
const parent = (over: Row = {}) =>
  ({ id: "p1", email: "dana@family.com", display_name: "Dana", created_at: daysAgo(10), email_weekly_digest: true, plan: "free", ...over }) as Parameters<typeof evaluateAndSendLifecycle>[0];

beforeEach(() => {
  sends.length = 0;
  tables = { children: [{ id: "c1", parent_id: "p1", first_name: "Maya", created_at: daysAgo(10) }] };
});

describe("a family that never started", () => {
  it("is not told about a reading streak it never had", async () => {
    const res = await evaluateAndSendLifecycle(parent());
    expect(res).toEqual({ ok: true, sent: false, reason: "never_started_no_nudge_due" });
    expect(sends).toHaveLength(0);
  });

  it("gets the assessment email from Jennifer once it is approved", async () => {
    const res = await evaluateAndSendLifecycle(parent(), { assessNudgeApproved: true });
    expect(res).toMatchObject({ sent: true, stage: "assess_nudge" });
    expect(sends).toHaveLength(1);
    expect(sends[0].from).toContain("Jennifer");
    expect(sends[0].subject).toBe("A ten minute reading assessment for Maya");
    expect(sends[0].text).toContain("/placement/ready?child=c1");
  });

  it("does not get a second one the next morning", async () => {
    await evaluateAndSendLifecycle(parent(), { assessNudgeApproved: true });
    await evaluateAndSendLifecycle(parent(), { assessNudgeApproved: true });
    expect(sends).toHaveLength(1);
  });

  it("gets the second, and last, fourteen days later, and then nothing", async () => {
    tables.lifecycle_email_sends = [{ profile_id: "p1", stage: "assess_nudge", status: "sent", sent_at: daysAgo(15) }];
    await evaluateAndSendLifecycle(parent({ created_at: daysAgo(30) }), { assessNudgeApproved: true });
    expect(sends[0].subject).toBe("What you get from Maya's reading assessment");
    expect(sends[0].text).toContain("This is the last reminder I will send about it.");

    tables.lifecycle_email_sends[1].sent_at = daysAgo(20);
    await evaluateAndSendLifecycle(parent({ created_at: daysAgo(60) }), { assessNudgeApproved: true });
    expect(sends).toHaveLength(1);
  });

  it("is left alone in the first week, which welcome and the placement nudge own", async () => {
    const res = await evaluateAndSendLifecycle(parent({ created_at: daysAgo(6) }), { assessNudgeApproved: true });
    expect(res).toMatchObject({ sent: false });
    expect(sends).toHaveLength(0);
  });

  it("is never sent to a test address", async () => {
    const res = await evaluateAndSendLifecycle(parent({ email: "qa@example.com" }), { assessNudgeApproved: true });
    expect(res).toEqual({ ok: true, sent: false, reason: "undeliverable" });
  });
});

describe("a family with reading history and no assessment (signed up before it existed)", () => {
  it("still gets the habit email, because for them it is true", async () => {
    tables.lessons_progress = [{ id: "l1", child_id: "c1", section: "learn", created_at: daysAgo(9) }];
    const res = await evaluateAndSendLifecycle(parent({ created_at: daysAgo(40) }), { assessNudgeApproved: true });
    expect(res).toMatchObject({ sent: true, stage: "re_engage" });
  });
});

describe("when one is due", () => {
  const base = { approved: true, ageDays: 10, sentCount: 0, daysSinceLast: null };
  it("never before approval", () => expect(assessNudgeDue({ ...base, approved: false })).toEqual({ due: false }));
  it("first", () => expect(assessNudgeDue(base)).toEqual({ due: true, nth: 1 }));
  it("not again inside fourteen days", () => expect(assessNudgeDue({ ...base, sentCount: 1, daysSinceLast: 13.9 })).toEqual({ due: false }));
  it("second after fourteen", () => expect(assessNudgeDue({ ...base, sentCount: 1, daysSinceLast: 14 })).toEqual({ due: true, nth: 2 }));
  it("never a third", () => expect(assessNudgeDue({ ...base, sentCount: 2, daysSinceLast: 99 })).toEqual({ due: false }));
});

describe("the copy", () => {
  const both = ([1, 2] as const).map((nth) =>
    renderAssessNudge({ parentName: "Dana", kidName: "Maya", childId: "c1", nth, unsubscribeUrl: "https://learn.readee.app/u" }),
  );

  it("follows the house rules: child not kid, no em dashes, no emoji", () => {
    for (const e of both) {
      expect(e.text).not.toMatch(/\bkids?\b/i);
      expect(e.text + e.subject).not.toMatch(/[—–]/);
      expect(e.text + e.subject).not.toMatch(/\p{Extended_Pictographic}/u);
    }
  });
  it("says what free means in the same sentence", () => {
    for (const e of both) expect(e.text).toMatch(/free[^.]*no card/);
  });
  it("never shows a price or the paid plan to a family that has not seen a report", () => {
    for (const e of both) expect(e.text + e.html).not.toMatch(/\$\d|Readee\+|trial|upgrade/i);
  });
  it("credits Jennifer with the role the report already gives her", () => {
    expect(both[0].text).toContain("certified reading specialist and 3rd-grade teacher");
  });
  it("uses the same button words as the website", () => {
    for (const e of both) expect(e.html).toContain("Start Reading Assessment");
  });
  it("does not tell a family with no child profile that their child's account is set up", () => {
    const e = renderAssessNudge({ parentName: null, kidName: null, childId: null, nth: 1, unsubscribeUrl: "u" });
    expect(e.text).toContain("Your account is set up");
    expect(e.text).not.toContain("child's account");
    expect(e.text).toContain("/placement/setup");
  });
});

describe("approval", () => {
  const url = (a: "approve" | "redraw" | "cancel") =>
    `https://learn.readee.app/api/announcements/action?id=${ASSESS_NUDGE_ID}&a=${a}&t=${announceToken(ASSESS_NUDGE_ID, a)}`;

  it("the preview shows both emails and only the buttons that apply", () => {
    const { subject, html } = buildAssessNudgePreview(54);
    expect(subject).toMatch(/^Approve\?/);
    expect(html).toContain("<strong>54</strong> families are due");
    expect(html).toContain("A ten minute reading assessment for Maya");
    expect(html).toMatch(/What you get from Maya(&#39;|&#x27;|&apos;|')s reading assessment/);
    expect(html).toContain(`a=approve&t=${announceToken(ASSESS_NUDGE_ID, "approve")}`);
    expect(html).toContain(`a=cancel&t=${announceToken(ASSESS_NUDGE_ID, "cancel")}`);
    expect(html).not.toContain("a=redraw");
  });

  it("a fetched link changes nothing, the button approves", async () => {
    const get = await route.GET(new NextRequest(url("approve")));
    expect(await get.text()).toContain('<form method="post">');
    expect(tables.lifecycle_email_sends ?? []).toHaveLength(0);
  });

  it("has no picture to redraw, so that link is refused even when correctly signed", async () => {
    const res = await route.POST(new NextRequest(url("redraw"), { method: "POST" }));
    expect(res.status).toBe(400);
  });
});
