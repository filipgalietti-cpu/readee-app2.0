const DEFAULT_PARENT_DESTINATION = "/dashboard";

/**
 * Accept only an application-local path. Auth destinations cross several
 * browser/server boundaries, so every consumer uses this function instead of
 * relying on startsWith("/") checks that also accept protocol-relative URLs.
 */
export function safeAuthDestination(
  value: string | null | undefined,
  fallback = DEFAULT_PARENT_DESTINATION,
): string {
  if (!value) return fallback;

  let inspected = value;
  try {
    // Inspect nested encoding too. Return the original URL below so valid
    // encoded query values keep their meaning.
    for (let pass = 0; pass < 2; pass += 1) {
      const decoded = decodeURIComponent(inspected);
      if (decoded === inspected) break;
      inspected = decoded;
    }
  } catch {
    return fallback;
  }

  if (
    !inspected.startsWith("/") ||
    inspected.startsWith("//") ||
    inspected.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(inspected)
  ) {
    return fallback;
  }

  try {
    const url = new URL(value, "https://learn.readee.app");
    if (url.origin !== "https://learn.readee.app") return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function safePostLoginDestination(
  value: string | null | undefined,
  fallback = DEFAULT_PARENT_DESTINATION,
): string {
  const destination = safeAuthDestination(value, fallback);
  const pathname = destination.split(/[?#]/, 1)[0];

  if (pathname === "/login" || pathname === "/signup" || pathname === "/auth/callback") {
    return fallback;
  }

  return destination;
}

export function cleanCampaignValue(value: string | null | undefined): string | null {
  if (!value) return null;
  const cleaned = value.replace(/[^\w\-. :/]/g, "").slice(0, 80);
  return cleaned || null;
}
