import type { FunnelProps } from "./funnel";
import { cleanCampaignValue } from "@/lib/auth/auth-navigation";

const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "ref",
  "gclid",
  "fbclid",
  "referrer",
  "landing",
  "at",
] as const;

function cookieValue(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=") || null;
  }
  return null;
}

/** Read the marketing site's first-touch cookie without allowing arbitrary
 * cookie keys or unbounded values into PostHog. The cookie contains campaign
 * context only; no parent or child fields are accepted. */
export function signupAttributionFromCookie(cookieHeader: string | null): FunnelProps {
  const raw = cookieValue(cookieHeader, "readee_attr");
  if (!raw || raw.length > 1_200) return {};

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    const result: FunnelProps = {};
    for (const key of ATTRIBUTION_KEYS) {
      const value = (parsed as Record<string, unknown>)[key];
      if (typeof value !== "string") continue;
      const cleaned = cleanCampaignValue(value);
      if (cleaned) result[`attribution_${key}`] = cleaned;
    }
    return result;
  } catch {
    return {};
  }
}
