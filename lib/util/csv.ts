/**
 * RFC 4180-compliant CSV cell escape. Returns the cell ready to be
 * joined into a line with commas.
 *
 * Quoting rules:
 * - Null / undefined → empty string.
 * - Cells containing a comma, double quote, newline, or carriage return
 *   are wrapped in double quotes. Embedded double quotes are doubled.
 * - Other cells (and number scalars) are emitted unquoted.
 *
 * Used by /api/classroom/[id]/export and /api/admin/school/[id]/export.
 */
export function csvEscape(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Filename-safe classroom/school name: strips punctuation, collapses
 * whitespace to single underscores. Leaves a minimum placeholder when
 * the input is empty or all-stripped.
 */
export function safeExportFilename(label: string, suffix: string): string {
  const clean = label
    .replace(/[^a-zA-Z0-9\- ]/g, "")
    .trim()
    .replace(/\s+/g, "_");
  const date = new Date().toISOString().slice(0, 10);
  return `${clean || "export"}-${suffix}-${date}.csv`;
}
