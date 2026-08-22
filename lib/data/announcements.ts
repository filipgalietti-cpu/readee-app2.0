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
}

export const WHATS_NEW_SEEN_KEY = "readee_seen_announcements";

export const ANNOUNCEMENTS: Announcement[] = [
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
