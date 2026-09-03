/**
 * Pure helpers for the spoken form of a child's name (safe for the client).
 * The written name (children.first_name) never changes; `name_said_as` is a
 * respelling ("fee-LOOSH" for "Filus") that only the voice uses.
 */
export const SAID_AS_MAX = 40;

/** Clean a respelling for storage: letters, hyphens, apostrophes, spaces; capped. */
export function cleanSaidAs(raw: string | null | undefined): string {
  return (raw ?? "").replace(/[^A-Za-z'\- ]/g, "").replace(/\s+/g, " ").trim().slice(0, SAID_AS_MAX);
}

/** The form the voice should read: the respelling without hyphens, or the written name. */
export function spokenNameOf(firstName: string, saidAs: string | null | undefined): string {
  const s = cleanSaidAs(saidAs);
  const written = (firstName ?? "").trim().split(" ")[0] ?? "";
  if (!s) return written;
  // "fee-LOOSH" -> "Feeloosh": the voice reads a plain token far more reliably than hyphens and capitals.
  const joined = s.replace(/[-\s]/g, "").toLowerCase();
  return joined.charAt(0).toUpperCase() + joined.slice(1);
}

/** Swap the written first name for its spoken form in text bound for the voice (captions keep the written name). */
export function withSpokenName(text: string, firstName: string, saidAs: string | null | undefined): string {
  const written = (firstName ?? "").trim().split(" ")[0] ?? "";
  const spoken = spokenNameOf(written, saidAs);
  if (!written || spoken === written) return text;
  const re = new RegExp(`\\b${written.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
  return text.replace(re, spoken);
}
