/**
 * What the PUBLIC (logged-out) library shows.
 *
 * Kids' Story Studio stories stay inside the app: signed-in families see
 * them on /practice-hub/community, but a child's story never goes out on
 * the open web with the child's first name on it (Filip, Sep 17 2026).
 * The public shelf is the Readee-made passages only.
 *
 * PostgREST `or` filter string — AND it onto the usual status/slug
 * filters with `.or(PUBLIC_KIND_FILTER)`. NULL-safe: rows with no
 * source_kind are legacy Readee passages and stay visible.
 */
export const PUBLIC_KIND_FILTER = "source_kind.is.null,source_kind.neq.kid_story";

/** Where every public-library CTA sends people: the free assessment. */
export function assessmentSignupHref(placement: string): string {
  return `/signup?ref=${encodeURIComponent(placement)}&next=${encodeURIComponent("/placement/setup")}`;
}
