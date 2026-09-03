// "What's New" announcements shown to kids on the dashboard home.
//
// To announce something new (skins, lessons, a feature), prepend an
// object to ANNOUNCEMENTS. The dashboard <WhatsNew> popup shows any
// entry the kid has not dismissed yet (tracked per-device in
// localStorage under WHATS_NEW_SEEN_KEY), newest first.
//
// Keep `id` stable and unique forever, once shown it is remembered by
// that id. Copy is kid-facing: short, warm, no jargon, no em-dashes.

export type AnnouncementKind = "skins" | "content" | "feature";

export interface Announcement {
  /** Stable unique id. Used for "already seen" tracking. Never reuse. */
  id: string;
  /** ISO date, drives newest-first ordering. */
  date: string;
  kind: AnnouncementKind;
  /** Kid-facing headline. */
  title: string;
  /** One friendly line under the headline. */
  body: string;
  /** Button that takes the kid to the new thing. */
  cta: { label: string; href: string };
  /** For kind "skins": bunny outfit ids to model in the popup, cycled. */
  outfitIds?: string[];
  /** For non-skin kinds: a Lucide icon name to show instead of a bunny. */
  icon?: string;
  /** Optional parent email for this announcement, sent by the daily lifecycle cron on `emailDate` (once per parent). */
  email?: { emailDate: string; heading: string; intro: string; items: string[]; ctaLabel?: string; ctaHref?: string; banner?: string };
}

/** Announcements the popup may show right now: dated today or earlier (pre-timed launches stay hidden). */
export function visibleAnnouncements(now: Date = new Date()): Announcement[] {
  const today = now.toISOString().slice(0, 10);
  return ANNOUNCEMENTS.filter((a) => a.date <= today);
}

export const WHATS_NEW_SEEN_KEY = "readee_seen_announcements";

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "2026-football-season",
    date: "2026-09-10",
    kind: "skins",
    title: "Football season is here!",
    body: "32 new game-day looks just hit the Shop. Suit up your bunny in your city's colors.",
    cta: { label: "See the Shop", href: "/shop" },
    outfitIds: ["bunny_fb_buffalo", "bunny_fb_kansas_city", "bunny_fb_philadelphia", "bunny_fb_dallas", "bunny_fb_green_bay", "bunny_fb_seattle"],
    email: {
      emailDate: "2026-09-08",
      heading: "Football season lands Thursday",
      intro: "On Thursday, September 10, thirty-two new game-day looks hit the Readee Shop: a jersey, a helmet, and a number, in the colors of every football city.",
      items: [
        "32 city colorways, one for every football town",
        "150 carrots each in the Shop, from Thursday morning",
        "Read this week, and the carrots are ready for kickoff",
      ],
      ctaLabel: "Open Readee",
      ctaHref: "https://learn.readee.app/dashboard",
    },
  },
  {
    id: "2026-fall-costumes",
    date: "2026-08-22",
    kind: "skins",
    title: "New Fall Costumes!",
    body: "Ten spooky new looks just landed in the Shop. Dress your bunny up for fall.",
    cta: { label: "See the Shop", href: "/shop" },
    outfitIds: [
      "bunny_pumpkin",
      "bunny_ghost",
      "bunny_skeleton",
      "bunny_blackcat",
      "bunny_candycorn",
      "bunny_spider",
    ],
  },
];
