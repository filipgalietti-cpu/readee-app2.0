/**
 * Where a signup came from, for the internal new-account alert.
 *
 * PostHog already geolocates every event it receives and, because the browser
 * client identifies with the Supabase user id, `distinct_id` IS `profiles.id`.
 * So the lookup is a straight read of the newest event for that id - no new
 * capture code, no column, nothing to backfill.
 *
 * ‼️ Strictly best-effort and strictly internal. Everything here returns an
 * empty answer rather than throwing, because a nice-to-have line in an ops
 * email must never be the reason Filip stops hearing about signups. Reasons it
 * legitimately comes back empty: the key is unset, the account signed up
 * seconds ago and PostHog has not ingested an event yet, the visitor blocks
 * analytics, or PostHog is slow and we time out on them.
 *
 * City-level only. Latitude and longitude are deliberately not read.
 */

/** Whole-lookup budget. The persons API answers in ~140ms, so this is only
 *  ever reached when PostHog is unwell. */
const TIMEOUT_MS = 2500;
/** Don't fan out over a big backlog; the rest simply go without a location. */
const MAX_LOOKUPS = 10;

const HOST = (process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com")
  // The ingestion host (us.i.posthog.com) does not serve the query API.
  .replace("us.i.posthog.com", "us.posthog.com")
  .replace(/\/$/, "");

type Props = Record<string, unknown>;

function str(p: Props, k: string): string | null {
  const v = p[k];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

/** "Omaha, Nebraska, United States" — as much as we actually know, no filler. */
function formatLocation(p: Props): string | null {
  const city = str(p, "$geoip_city_name");
  const region = str(p, "$geoip_subdivision_1_name");
  const country = str(p, "$geoip_country_name");
  const parts = [city, region, country].filter(Boolean) as string[];
  // A bare country is still worth printing; nothing at all is not.
  return parts.length ? parts.join(", ") : null;
}

async function lookupOne(
  userId: string,
  key: string,
  projectId: string,
  signal: AbortSignal,
): Promise<string | null> {
  // ‼️ persons, not events. The events endpoint answers the same question but
  // has to scan for a matching distinct_id, and an id with NO events - which is
  // exactly what a minutes-old signup looks like - takes so long we hit the
  // abort every time. Measured: persons 140ms whether or not the person exists,
  // events 4000ms (a timeout) for one that does not.
  const url =
    `${HOST}/api/projects/${encodeURIComponent(projectId)}/persons/` +
    `?distinct_id=${encodeURIComponent(userId)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${key}` },
    signal,
    cache: "no-store",
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { results?: { properties?: Props }[] };
  const props = body.results?.[0]?.properties;
  return props ? formatLocation(props) : null;
}

/**
 * Best-effort location per user id. Missing entries mean "we do not know",
 * which the caller should render as such rather than guessing.
 */
export async function lookupSignupLocations(
  userIds: string[],
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const key = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  if (!key || !projectId || userIds.length === 0) return out;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const ids = userIds.slice(0, MAX_LOOKUPS);
    const found = await Promise.all(
      ids.map((id) =>
        lookupOne(id, key, projectId, controller.signal).catch(() => null),
      ),
    );
    ids.forEach((id, i) => {
      const loc = found[i];
      if (loc) out.set(id, loc);
    });
  } catch {
    // Timeout or network: everyone goes without a location.
  } finally {
    clearTimeout(timer);
  }
  return out;
}
