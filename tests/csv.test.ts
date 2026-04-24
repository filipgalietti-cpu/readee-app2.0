import { describe, it, expect } from "vitest";
import { csvEscape, safeExportFilename } from "@/lib/util/csv";

describe("csvEscape", () => {
  it("returns empty string for null / undefined", () => {
    expect(csvEscape(null)).toBe("");
    expect(csvEscape(undefined)).toBe("");
  });

  it("passes numbers through unquoted", () => {
    expect(csvEscape(42)).toBe("42");
    expect(csvEscape(0)).toBe("0");
  });

  it("passes plain strings through unquoted", () => {
    expect(csvEscape("Emma")).toBe("Emma");
    expect(csvEscape("2nd")).toBe("2nd");
  });

  it("quotes and escapes strings containing commas", () => {
    expect(csvEscape("Hello, world")).toBe('"Hello, world"');
  });

  it("quotes strings containing newlines and carriage returns", () => {
    expect(csvEscape("line1\nline2")).toBe('"line1\nline2"');
    expect(csvEscape("line1\r\nline2")).toBe('"line1\r\nline2"');
  });

  it("escapes embedded double quotes by doubling them", () => {
    expect(csvEscape('He said "hi"')).toBe('"He said ""hi"""');
  });

  it("handles the combined nightmare: commas + quotes + newlines", () => {
    expect(csvEscape('a,"b"\nc')).toBe('"a,""b""\nc"');
  });
});

describe("safeExportFilename", () => {
  it("strips punctuation and collapses whitespace", () => {
    const name = safeExportFilename("Mrs. K's 3rd Grade", "roster");
    expect(name).toMatch(/^Mrs_Ks_3rd_Grade-roster-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it("falls back to 'export' when the name strips to empty", () => {
    const name = safeExportFilename("!!!", "progress");
    expect(name).toMatch(/^export-progress-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it("preserves hyphens", () => {
    const name = safeExportFilename("Pre-K", "roster");
    expect(name).toMatch(/^Pre-K-roster-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it("ends with a current ISO date", () => {
    const name = safeExportFilename("Room 204", "roster");
    const today = new Date().toISOString().slice(0, 10);
    expect(name.endsWith(`${today}.csv`)).toBe(true);
  });
});
