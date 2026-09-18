import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * `force-dynamic` and `revalidate` in the same file.
 *
 * ‼️ THIS HAS SHIPPED THREE TIMES, ON THE THREE PAGES THAT MOST NEEDED THE
 * CACHING. Next's own docs are explicit: `force-dynamic` renders "for each user
 * at request time" and sets `revalidate: 0` on everything, so a `revalidate`
 * beside it is dead code. Nothing warns you. The page simply never caches and
 * the line saying it should sits there looking correct.
 *
 * /today/[slug] hit it first and carries a comment about it ("it overrode this
 * and re-queried the DB on every navigation, which is what made switching pages
 * laggy"). All four /community pages then did the same thing, which is how a
 * public page came to run seven live queries per visit and hand a brand new
 * parent an error page when one of them failed (Sentry aff62aa0).
 *
 * A comment on one page did not stop it happening on four others, so this is a
 * test rather than a convention.
 */

const APP = join(process.cwd(), "app");

/** Every route segment file under app/. Walked rather than globbed, because
 *  fs.globSync needs Node 22 and CI runs 20. */
function routeFiles(dir = APP, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) routeFiles(full, out);
    else if (/^(page|layout|route)\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe("route segment config", () => {
  it("never declares force-dynamic and revalidate in the same file", () => {
    const offenders: string[] = [];
    for (const file of routeFiles()) {
      const src = readFileSync(file, "utf8");
      // Only real exports; the explanatory comments on these pages mention both.
      const forced = /^export const dynamic\s*=\s*["']force-dynamic["']/m.test(src);
      const revalidates = /^export const revalidate\s*=\s*\d+/m.test(src);
      if (forced && revalidates) offenders.push(file.replace(`${process.cwd()}/`, ""));
    }
    expect(
      offenders,
      `force-dynamic makes revalidate dead code, so one of the two is a lie:\n  ${offenders.join("\n  ")}`,
    ).toEqual([]);
  });

  it("finds route files at all, so a passing result means something", () => {
    // A glob that silently matches nothing would make the check above vacuous.
    expect(routeFiles().length).toBeGreaterThan(50);
  });
});
