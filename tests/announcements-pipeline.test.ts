import { describe, it, expect } from "vitest";
import { stageOf, askFor, countByStage, type AudienceMember } from "@/lib/announcements/audience";
import { announceToken, announceTokenValid, isAnnounceAction } from "@/lib/announcements/approval";
import { bannerPrompt } from "@/lib/announcements/banner";
import { buildAnnouncementPreview } from "@/lib/announcements/preview";
import { ANNOUNCEMENTS } from "@/lib/data/announcements";
import { OUTFITS } from "@/app/_components/Bunny/outfits";

// Set at load, not in beforeAll: the preview below is built while the suite is
// being collected, which is before any hook runs.
process.env.DAILY_REVIEW_SECRET = "test-secret-for-announcements";

const fall = ANNOUNCEMENTS.find((a) => a.id === "2026-fall-costumes")!;
const fallback = { ctaLabel: "See the Shop", ctaHref: "https://learn.readee.app/shop" };

/**
 * The football email sold cosmetic outfits to 106 families, about 67 of whom had
 * never taken the reading check. Same news, wrong ask, for most of the list.
 */
describe("where a family is", () => {
  const none = new Set<string>();
  it("is unassessed with no child at all", () => {
    expect(stageOf({ plan: "free", childIds: [], assessed: none, withLesson: none }).stage).toBe("unassessed");
  });
  it("is unassessed with a child who never took the check", () => {
    expect(stageOf({ plan: "free", childIds: ["c1"], assessed: none, withLesson: none })).toEqual({
      stage: "unassessed",
      childId: "c1",
    });
  });
  it("is assessed once a report exists, and links to THAT child", () => {
    expect(stageOf({ plan: "free", childIds: ["c1", "c2"], assessed: new Set(["c2"]), withLesson: none })).toEqual({
      stage: "assessed",
      childId: "c2",
    });
  });
  it("is reading once any lesson has been opened", () => {
    expect(
      stageOf({ plan: "free", childIds: ["c1"], assessed: new Set(["c1"]), withLesson: new Set(["c1"]) }).stage,
    ).toBe("reading");
  });
  it("is paying regardless of anything else", () => {
    expect(stageOf({ plan: "premium", childIds: [], assessed: none, withLesson: none }).stage).toBe("paying");
  });
});

describe("the ask follows the family, one step at a time", () => {
  it("asks an unassessed family for the free check, and never shows them a price", () => {
    const ask = askFor("unassessed", "c1", fallback);
    expect(ask.ctaLabel).toBe("Start Reading Assessment");
    expect(ask.ctaHref).toContain("/placement/ready?child=c1");
    expect(ask.line).toMatch(/no card/i);
    expect(ask.line).not.toMatch(/\$|Readee\+/);
  });

  it("sends a family with no child to setup rather than a dead link", () => {
    expect(askFor("unassessed", null, fallback).ctaHref).toContain("/placement/setup");
  });

  it("tells an assessed family the truth about the free allowance", () => {
    // Three, in lib/approved-unit/entitlement.ts. If that number moves, this
    // sentence is a lie in every inbox, so the test says it out loud.
    expect(askFor("assessed", "c1", fallback).line).toContain("first three lessons are free");
  });

  it("only mentions the trial to a family already reading", () => {
    const ask = askFor("reading", "c1", fallback);
    expect(ask.ctaHref).toContain("/upgrade");
    expect(ask.line).toMatch(/\$0/);
  });

  it("leaves a paying family with the announcement's own button and no pitch", () => {
    expect(askFor("paying", "c1", fallback)).toEqual({ line: "", ...fallback });
  });

  it("counts every family exactly once", () => {
    const audience = [
      { stage: "unassessed" },
      { stage: "unassessed" },
      { stage: "paying" },
    ] as AudienceMember[];
    expect(countByStage(audience)).toEqual({ unassessed: 2, assessed: 0, reading: 0, paying: 1 });
  });
});

describe("approval links", () => {
  it("bind one action to one announcement", () => {
    const t = announceToken("2026-fall-costumes", "approve");
    expect(announceTokenValid("2026-fall-costumes", "approve", t)).toBe(true);
    // A cancel link must not be editable into an approve link.
    expect(announceTokenValid("2026-fall-costumes", "cancel", t)).toBe(false);
    expect(announceTokenValid("2026-football-season", "approve", t)).toBe(false);
  });
  it("reject junk without throwing", () => {
    expect(announceTokenValid("x", "approve", "")).toBe(false);
    expect(isAnnounceAction("send-now")).toBe(false);
  });
});

describe("the banner is made from what is being announced", () => {
  it("names the real costumes", () => {
    const prompt = bannerPrompt(fall);
    expect(prompt).toContain("Pumpkin");
    expect(prompt).toContain("Ghost");
  });
  it("forbids lettering, because the reference banner has jersey numbers on it", () => {
    expect(bannerPrompt(fall)).toMatch(/No text, no letters, no numbers/);
  });
  it("still has something to draw for news with no costumes", () => {
    const news = { ...fall, outfitIds: undefined, title: "New Grade 2 lessons", body: "Twelve of them." };
    expect(bannerPrompt(news)).toContain("New Grade 2 lessons");
  });
});

describe("the preview", () => {
  const counts = { unassessed: 67, assessed: 22, reading: 7, paying: 5 };
  const { subject, html } = buildAnnouncementPreview(fall, "https://example.supabase.co/banner.png", counts);

  it("asks a question in the subject line", () => {
    expect(subject).toMatch(/^Approve\?/);
  });
  it("says how many families and that nothing has been sent", () => {
    expect(html).toContain("<strong>101</strong>");
    expect(html).toMatch(/Nothing sends until you approve/);
  });
  it("carries all three signed buttons", () => {
    for (const a of ["approve", "redraw", "cancel"] as const) {
      expect(html).toContain(`a=${a}&t=${announceToken(fall.id, a)}`);
    }
  });
  it("shows the generated picture and the popup that goes live alongside it", () => {
    expect(html).toContain("https://example.supabase.co/banner.png");
    expect(html).toContain("New Fall Costumes!");
  });
});

/**
 * An earlier draft of this email promised a costume "by Halloween". Probably
 * true, and still a projection. The copy now states a price, and this test
 * keeps the price honest if someone reprices the shop.
 */
describe("the fall email says only what the product says", () => {
  it("quotes the real cheapest fall costume", () => {
    const fallIds = ["pumpkin", "ghost", "skeleton", "blackcat", "candycorn", "spider", "bat", "scarecrow", "sorceress", "acorn"];
    const cheapest = Math.min(...fallIds.map((n) => OUTFITS.find((o) => o.id === `bunny_${n}`)!.price));
    expect(fall.email!.items.join(" ")).toContain(`${cheapest} carrots`);
  });
  it("really is ten costumes", () => {
    expect(fall.email!.intro).toMatch(/^Ten /);
  });
  it("never claims they are new today, since they shipped on 22 Aug", () => {
    const copy = `${fall.email!.heading} ${fall.email!.intro} ${fall.email!.items.join(" ")}`;
    expect(copy).not.toMatch(/\b(new|just landed|just arrived|today)\b/i);
  });
  it("waits for approval rather than using a hand-made banner", () => {
    expect(fall.email!.banner).toBe("generated");
  });
});

describe("when the picture could not be drawn", () => {
  const counts = { unassessed: 67, assessed: 22, reading: 7, paying: 5 };
  const { html } = buildAnnouncementPreview(fall, null, counts);

  it("says so, above the buttons", () => {
    expect(html).toContain("The picture could not be drawn.");
    expect(html.indexOf("could not be drawn")).toBeLessThan(html.indexOf("Approve and send"));
  });
  it("never uses the word 'generated' as though it were an image file", () => {
    expect(html).not.toMatch(/images\/email\/generated/);
    expect(html).toContain("banner-whats-new");
  });
});
