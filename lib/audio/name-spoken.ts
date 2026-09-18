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

/**
 * Does this respelling actually tell the voice anything?
 *
 * ‼️ FIL WAS READ ALOUD AS THE ENGLISH WORD "FILE". A pronunciation had been
 * captured and stored, as `FIL`. Strip the hyphens and capitals the format asks
 * for and you get back `Fil`, which is the written name, so `withSpokenName`
 * correctly decided there was nothing to substitute and handed the voice the
 * raw name. The feature ran, stored a value, and did nothing.
 *
 * That is not a one-off. For any single-syllable name, a correctly formatted
 * respelling IS the name in capitals, so the whole feature collapses exactly
 * where it is needed most: short names an English voice will mispronounce.
 *
 * A respelling that survives normalisation unchanged is not a respelling. Treat
 * it as absent and ask again, rather than storing a value that makes the record
 * look handled.
 */
export function usableSaidAs(firstName: string, saidAs: string | null | undefined): boolean {
  const cleaned = cleanSaidAs(saidAs);
  if (!cleaned) return false;
  const written = (firstName ?? "").trim().split(" ")[0] ?? "";
  return spokenNameOf(written, cleaned) !== written;
}

/** Swap the written first name for its spoken form in text bound for the voice (captions keep the written name). */
export function withSpokenName(text: string, firstName: string, saidAs: string | null | undefined): string {
  const written = (firstName ?? "").trim().split(" ")[0] ?? "";
  const spoken = spokenNameOf(written, saidAs);
  if (!written || spoken === written) return text;
  const re = new RegExp(`\\b${written.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
  return text.replace(re, spoken);
}
