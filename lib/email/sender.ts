/**
 * Who the family-facing email is from.
 *
 * Filip, 19 Sep 2026, asked who should front the email: "Jen.. teacher customer
 * facing for sure."
 *
 * A named person outperforms a brand address, and for this product the person
 * is the argument: the whole pitch is that a working reading teacher wrote it.
 * A welcome or a report from "Readee" is a company talking. The same words from
 * Jennifer are a teacher talking, which is what a worried parent came for.
 *
 * The ADDRESS does not change. hello@readee.app is the authenticated sender
 * (SPF, DKIM and DMARC all checked 19 Sep), and replies land in the shared
 * inbox, not in her personal mail.
 *
 * Not used for money. Receipts, cancellations and trial-ending notices stay
 * from the company, because a bill from a teacher reads wrong, and those are
 * sent from the Stripe webhook, not from here.
 */
export const FAMILY_FROM = "Jennifer at Readee <hello@readee.app>";
