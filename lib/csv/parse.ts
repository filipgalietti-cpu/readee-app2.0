/**
 * Minimal CSV parser used by the teacher quiz importer.
 *
 * Handles:
 *   - Quoted fields with embedded commas: `"foo, bar",baz`
 *   - Escaped quotes inside quotes: `"she said ""hi"""`
 *   - Quoted fields with embedded newlines (multi-line cells)
 *   - Lines longer than 50 chars / fields up to 8KB
 *
 * Doesn't handle:
 *   - Custom delimiters (comma only)
 *   - BOM stripping (we strip it explicitly below)
 *   - Encoding conversion (assumes UTF-8)
 *
 * Returns rows of string arrays; first row is treated as header by
 * the caller.
 */

export function parseCsv(input: string): string[][] {
  // Strip BOM if Excel-Mac sneaks one in.
  const text = input.replace(/^﻿/, "");

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const n = text.length;

  while (i < n) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          // Escaped quote
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (ch === "\r") {
      // CRLF: treat \r as part of line break, swallow \n if it follows
      if (text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += ch;
    i++;
  }

  // Tail field/row
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop blank trailing rows (Excel often adds them).
  while (rows.length > 0) {
    const last = rows[rows.length - 1];
    if (last.length === 1 && last[0].trim() === "") rows.pop();
    else break;
  }
  return rows;
}

/** Build a CSV row, properly quoting any field that needs it. */
export function csvRow(fields: (string | number | null | undefined)[]): string {
  return fields
    .map((f) => {
      const s = f === null || f === undefined ? "" : String(f);
      if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    })
    .join(",");
}
