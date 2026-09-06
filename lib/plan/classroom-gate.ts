/**
 * The B2B kill switch.
 *
 * Readee stopped pursuing schools and committed to B2C. The classroom side is
 * still in the tree - teacher dashboards, rosters, student sign-in, IEP tools,
 * school and district admin - but it is not advertised, not finished, and not
 * something anyone should be able to reach.
 *
 * Leaving unfinished surface reachable is how most of the security audit
 * happened. Forged classroom membership reaching another family's child,
 * institutional admin reading support records across schools, shared class
 * credentials letting one student act as another, semantic search crossing
 * teacher boundaries: every one of those lives behind a door nobody was meant
 * to walk through. Closing the door removes the class of problem rather than
 * patching each instance.
 *
 * ‼️ DEFAULT IS OFF. The switch is `CLASSROOM_ENABLED=true`, and anything else -
 * unset, empty, "false", a typo - keeps it closed. A kill switch that fails open
 * when someone forgets an env var is not a kill switch.
 *
 * This gate is enforced in proxy.ts, which runs on pages AND API routes, so it
 * covers direct API calls as well as navigation. It is a front door, not a
 * substitute for the RLS work: a determined caller can still reach Postgres
 * through PostgREST, which is why migration 141 also fixed the underlying
 * membership policy.
 */

export const CLASSROOM_ENABLED = process.env.CLASSROOM_ENABLED === "true";

/**
 * Paths that belong to the B2B product.
 *
 * Deliberately NOT the whole of /admin: /admin/qc, /admin/community and
 * /admin/tools are platform-owner surfaces behind isPlatformAdmin and have
 * nothing to do with schools. Only the institutional parts are listed.
 */
const B2B_PREFIXES = [
  "/classroom",       // covers /classroom, /classroom-join, /classroom-dev
  "/class/",          // student sign-in by class code
  "/join/",           // teacher invite links
  "/student",         // the (student) route group
  "/admin/school",
  "/admin/district",
  "/admin/classroom",
  "/onboarding/teacher",
  "/api/classroom",
  "/api/student",
  "/api/iep-plan",
  "/api/admin/school",
  "/api/coach-analyze",          // running-record analyser, teacher-only tool
  "/api/running-record-suggest",
];

/** Is this path part of the disabled B2B product? */
export function isB2BPath(pathname: string): boolean {
  return B2B_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
}

/** Should this request be refused right now? */
export function b2bBlocked(pathname: string): boolean {
  return !CLASSROOM_ENABLED && isB2BPath(pathname);
}
