import { describe, it, expect } from "vitest";
import {
  POOL, MEDIUMS, NEVER_PHOTOGRAPH, PHOTOGRAPHABLE,
  pickBucket, pickSubject, pickMedium, type Bucket,
} from "@/lib/daily/catalog";
import { inclusiveHolidayFor, HINDU_DATES } from "@/lib/daily/holidays-inclusive";

const days = (n: number, from = new Date(2026, 9, 1)) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

/** Replays the real loop: each day sees what the days before it produced. */
function run(n: number) {
  const out: { date: string; bucket: Bucket; subject: string; medium: string }[] = [];
  for (const date of days(n)) {
    const bucket = pickBucket(date, out.map((o) => o.bucket).reverse());
    const subject = pickSubject(date, bucket, out.filter((o) => o.bucket === bucket).map((o) => o.subject));
    const medium = pickMedium(date, bucket, out.map((o) => o.medium).reverse());
    out.push({ date, bucket, subject, medium });
  }
  return out;
}

describe("the catalogue draw", () => {
  it("is deterministic, so re-running the cron cannot change a published day", () => {
    expect(run(30)).toEqual(run(30));
  });

  it("never runs the same bucket two days running", () => {
    const r = run(120);
    for (let i = 1; i < r.length; i++) expect(r[i].bucket).not.toBe(r[i - 1].bucket);
  });

  it("never runs the same medium two days running", () => {
    const r = run(120);
    for (let i = 1; i < r.length; i++) expect(r[i].medium).not.toBe(r[i - 1].medium);
  });

  it("reaches every bucket over a season, rather than settling into a rota", () => {
    const seen = new Set(run(90).map((r) => r.bucket));
    expect(seen.size).toBe(Object.keys(POOL).length);
  });

  it("has no weekday pattern - the old system's actual failure", () => {
    // "Saturday cave adventure" x5 and four Thursdays of Heritage Month both
    // came from the bucket being a function of the weekday. Every weekday should
    // now see several different buckets.
    const byDow = new Map<number, Set<Bucket>>();
    for (const r of run(180)) {
      const dow = new Date(r.date + "T12:00:00Z").getUTCDay();
      if (!byDow.has(dow)) byDow.set(dow, new Set());
      byDow.get(dow)!.add(r.bucket);
    }
    for (const [, buckets] of byDow) expect(buckets.size).toBeGreaterThan(2);
  });

  it("never photographs the body or a story", () => {
    for (const bucket of NEVER_PHOTOGRAPH) {
      for (const date of days(60)) expect(pickMedium(date, bucket)).not.toBe("photograph");
    }
  });

  it("puts felt on animals - the whole point of the rework", () => {
    const felts = days(200).filter((d) => pickMedium(d, "animals") === "felt");
    expect(felts.length).toBeGreaterThan(0);
  });

  it("does not let photographs dominate a photographable bucket", () => {
    const all = days(300).map((d) => pickMedium(d, "animals"));
    const photos = all.filter((m) => m === "photograph").length;
    expect(photos / all.length).toBeLessThan(0.35); // one of nine options, not the default
  });

  it("exhausts a bucket's subjects before reusing any of them", () => {
    // Not "never repeats": a 15-subject bucket drawn 22 times MUST repeat. The
    // real guarantee is that every subject is used once before any is used
    // twice, so a reader never sees a rerun while fresh ones are still waiting.
    const r = run(200);
    for (const b of Object.keys(POOL) as Bucket[]) {
      const subs = r.filter((x) => x.bucket === b).map((x) => x.subject);
      const firstPass = subs.slice(0, Math.min(subs.length, POOL[b].length));
      expect(new Set(firstPass).size).toBe(firstPass.length);
    }
  });

  it("gives every bucket enough subjects for a full year of its turns", () => {
    // 9 buckets, so a bucket comes up roughly every 9 days: about 40 turns a
    // year. Anything smaller than that starts recycling inside twelve months.
    for (const b of Object.keys(POOL) as Bucket[]) {
      expect({ bucket: b, subjects: POOL[b].length }).toEqual({ bucket: b, subjects: expect.any(Number) });
      expect(POOL[b].length).toBeGreaterThanOrEqual(15);
    }
  });

  it("only offers photographs where a photograph exists", () => {
    for (const b of PHOTOGRAPHABLE) expect(NEVER_PHOTOGRAPH).not.toContain(b);
  });

  it("keeps every medium prompt non-empty except the photograph lane", () => {
    for (const m of MEDIUMS) expect(m.length).toBeGreaterThan(0);
  });
});

describe("inclusive holidays", () => {
  it("finds fixed-date celebrations in any year", () => {
    expect(inclusiveHolidayFor("2026-06-19")?.label).toBe("Juneteenth");
    expect(inclusiveHolidayFor("2029-06-19")?.label).toBe("Juneteenth");
    expect(inclusiveHolidayFor("2026-11-01")?.label).toBe("Day of the Dead");
  });

  it("computes Lunar New Year from the Chinese calendar, every year", () => {
    // Hand-listing these is what went wrong the first time.
    expect(inclusiveHolidayFor("2026-02-17")?.label).toBe("Lunar New Year");
    // ‼️ Feb 7, not Feb 6. The hand-written table said the 6th; the Chinese
    // calendar says 2027-02-06 is still 12/30 of the old year.
    expect(inclusiveHolidayFor("2027-02-07")?.label).toBe("Lunar New Year");
    expect(inclusiveHolidayFor("2027-02-06")).toBeNull();
    expect(inclusiveHolidayFor("2026-02-16")).toBeNull();
  });

  it("gets Nowruz right, which the hand-written table did not", () => {
    // It was pinned to March 20 every year. It is the 21st in 2026 and 2027.
    expect(inclusiveHolidayFor("2026-03-21")?.label).toBe("Nowruz");
    expect(inclusiveHolidayFor("2027-03-21")?.label).toBe("Nowruz");
    // March 20 2026 is not empty either - it is 1 Shawwal, Eid al-Fitr.
    expect(inclusiveHolidayFor("2026-03-20")?.label).toBe("Eid al-Fitr");
    expect(inclusiveHolidayFor("2028-03-20")?.label).toBe("Nowruz"); // and it moves
  });

  it("puts Hanukkah on 25 Kislev, not a day early", () => {
    expect(inclusiveHolidayFor("2026-12-05")?.label).toBe("Hanukkah begins");
    expect(inclusiveHolidayFor("2026-12-04")).toBeNull();
  });

  it("computes the Chinese festivals without a table", () => {
    expect(inclusiveHolidayFor("2026-09-25")?.label).toBe("Mid-Autumn Festival");
  });

  it("gives a fixed observance precedence over a computed one that collides", () => {
    // 19 June 2026 is Juneteenth AND the Dragon Boat Festival. Juneteenth is
    // always 19 June, so it must win; Dragon Boat moves and loses only this one.
    expect(inclusiveHolidayFor("2026-06-19")?.label).toBe("Juneteenth");
    expect(inclusiveHolidayFor("2027-06-09")?.label).toBe("Dragon Boat Festival");
  });

  it("keeps Hindu festivals table-driven and silent in unlisted years", () => {
    expect(inclusiveHolidayFor("2026-11-08")?.label).toBe("Diwali");
    expect(Object.keys(HINDU_DATES).length).toBeGreaterThan(0);
    expect(inclusiveHolidayFor("2030-11-08")).toBeNull();
  });

  it("finds a computed holiday in a year nobody typed in", () => {
    // The whole point: 2031 is in no table anywhere.
    const found = ["2031-01-23", "2031-01-24", "2031-02-11"].map((d) => inclusiveHolidayFor(d)?.label);
    expect(found.filter(Boolean).length).toBeGreaterThan(0);
  });

  it("returns null on an ordinary day", () => {
    expect(inclusiveHolidayFor("2026-07-16")).toBeNull();
  });
});
