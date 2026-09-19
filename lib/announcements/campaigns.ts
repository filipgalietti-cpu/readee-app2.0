import { ANNOUNCEMENTS, type Announcement } from "@/lib/data/announcements";
import { ASSESS_NUDGE_ID } from "@/lib/email/assess-nudge";

/**
 * Everything that waits for a person before it reaches families.
 *
 * Product updates were the first thing behind the approval buttons. The
 * assessment reminder is the second, and it is not an announcement: it has no
 * popup, no date and no picture to redraw. This is the one place the approval
 * route looks, so a new kind of email cannot be approved by a link unless it is
 * listed here.
 */
export type Campaign = {
  id: string;
  /** What the confirmation page calls it. */
  heading: string;
  /** When it goes out once approved, as the end of "will go to families ...". */
  when: string;
  /** Only an announcement with a generated banner has a picture to redraw. */
  announcement: Announcement | null;
};

export function findCampaign(id: string): Campaign | null {
  if (id === ASSESS_NUDGE_ID) {
    return {
      id,
      heading: "The reading assessment reminder from Jennifer",
      when: "from the next morning, to families who never took the assessment",
      announcement: null,
    };
  }
  const a = ANNOUNCEMENTS.find((x) => x.id === id);
  if (!a?.email) return null;
  return { id, heading: a.email.heading, when: `on or after ${a.email.emailDate}`, announcement: a };
}

export function canRedraw(c: Campaign): boolean {
  return c.announcement?.email?.banner === "generated";
}
