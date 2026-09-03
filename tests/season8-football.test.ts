import { describe, it, expect } from "vitest";
import { OUTFITS, S8_TEAMS, SEASON8_RELEASE, getOutfit, isOutfitAvailable, s8Id } from "@/app/_components/Bunny/outfits";
import { SHOP_ITEMS, ITEM_CATCHPHRASES, isShopItemAvailable } from "@/lib/data/shop-items";
import { ANNOUNCEMENTS, visibleAnnouncements } from "@/lib/data/announcements";

const before = new Date("2026-09-09T12:00:00Z");
const kickoff = new Date("2026-09-10T12:00:00Z");

describe("Season 8 football outfits", () => {
  const s8 = OUTFITS.filter((o) => o.id.startsWith("bunny_fb_"));
  it("ports all 32 colorways with unique ids and clip paths", () => {
    expect(S8_TEAMS).toHaveLength(32);
    expect(s8).toHaveLength(32);
    expect(new Set(s8.map((o) => o.id)).size).toBe(32);
    const clips = s8.map((o) => o.body?.match(/clipPath id="([^"]+)"/)?.[1]);
    expect(new Set(clips).size).toBe(32);
    for (const o of s8) {
      expect(o.head).toContain("<path");
      expect(o.body).toContain("<text");
      expect(o.unlock).toEqual({ type: "shop", price: 150 });
    }
  });
  it("carries no team names, logos or wordmarks (city names only)", () => {
    const banned = /bills|dolphins|patriots|jets|ravens|bengals|browns|steelers|texans|colts|jaguars|titans|broncos|chiefs|raiders|chargers|cowboys|giants|eagles|commanders|bears|lions|packers|vikings|falcons|panthers|saints|buccaneers|cardinals|rams|49ers|seahawks|nfl/i;
    for (const o of s8) expect(`${o.name} ${o.body} ${o.head}`).not.toMatch(banned);
  });
  it("is hidden until kickoff and released after", () => {
    const buffalo = getOutfit(s8Id("Buffalo"));
    expect(buffalo.availableFrom).toBe(SEASON8_RELEASE);
    expect(isOutfitAvailable(buffalo, before)).toBe(false);
    expect(isOutfitAvailable(buffalo, kickoff)).toBe(true);
    expect(isOutfitAvailable(getOutfit("bunny_classic"), before)).toBe(true);
  });
  it("has a shop entry and a catchphrase for every colorway, gated the same way", () => {
    for (const [city] of S8_TEAMS) {
      const item = SHOP_ITEMS.find((i) => i.id === s8Id(city));
      expect(item?.price).toBe(150);
      expect(ITEM_CATCHPHRASES[s8Id(city)]).toContain(city);
      expect(isShopItemAvailable(item!, before)).toBe(false);
      expect(isShopItemAvailable(item!, kickoff)).toBe(true);
    }
  });
  it("announces on kickoff day only, with the teaser email two days before", () => {
    const a = ANNOUNCEMENTS.find((x) => x.id === "2026-football-season")!;
    expect(a.date).toBe("2026-09-10");
    expect(a.email?.emailDate).toBe("2026-09-08");
    expect(visibleAnnouncements(before).some((x) => x.id === a.id)).toBe(false);
    expect(visibleAnnouncements(kickoff).some((x) => x.id === a.id)).toBe(true);
    for (const id of a.outfitIds ?? []) expect(OUTFITS.some((o) => o.id === id)).toBe(true);
  });
});
