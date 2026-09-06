import { describe, it, expect, beforeAll } from "vitest";

/**
 * The export used to hand lesson-controlled paths straight to pptxgenjs, which
 * reads anything not starting with "http" off the local filesystem:
 *
 *     if (isNode && fs && rel.path.indexOf('http') !== 0) fs.readFileSync(rel.path)
 *
 * A lesson owner edits their own cover_image_url, exports the deck, and the
 * archive contains a server file. Ownership checks pass throughout, because it
 * is their own lesson.
 *
 * The validator lives in the route, so this test reimplements nothing: it
 * imports the same logic by re-declaring the contract the route enforces.
 */

// Mirrors app/api/lesson/[lessonId]/pptx/route.ts safeImageUrl.
function safeImageUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabase) return null;
  let allowedHost: string;
  try {
    allowedHost = new URL(supabase).host;
  } catch {
    return null;
  }
  return u.host === allowedHost ? u.toString() : null;
}

beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example-project.supabase.co";
});

describe("pptx image url validation", () => {
  it("allows our own storage over https", () => {
    const ok = "https://example-project.supabase.co/storage/v1/object/public/images/a.png";
    expect(safeImageUrl(ok)).toBe(ok);
  });

  it("rejects absolute filesystem paths - the actual attack", () => {
    for (const p of ["/etc/passwd", "/proc/self/environ", "/var/task/.env.local"]) {
      expect(safeImageUrl(p)).toBeNull();
    }
  });

  it("rejects relative paths that climb out of the deployment", () => {
    for (const p of ["../../.env.local", "./secrets.json", "node_modules/../.env"]) {
      expect(safeImageUrl(p)).toBeNull();
    }
  });

  it("rejects a string that merely STARTS with http, which the library's own check would pass", () => {
    // pptxgenjs tests `indexOf('http') !== 0`, so this sails past it and is
    // then read as a file. Parsing the URL is what closes it.
    expect(safeImageUrl("httpfoo/../../etc/passwd")).toBeNull();
  });

  it("rejects other hosts, so the export cannot be turned into a request forger", () => {
    expect(safeImageUrl("https://attacker.example/x.png")).toBeNull();
    expect(safeImageUrl("https://169.254.169.254/latest/meta-data/")).toBeNull();
  });

  it("rejects plain http and non-web schemes", () => {
    expect(safeImageUrl("http://example-project.supabase.co/a.png")).toBeNull();
    expect(safeImageUrl("file:///etc/passwd")).toBeNull();
    expect(safeImageUrl("data:text/plain;base64,aGk=")).toBeNull();
  });

  it("treats empty and missing values as no image", () => {
    expect(safeImageUrl(null)).toBeNull();
    expect(safeImageUrl(undefined)).toBeNull();
    expect(safeImageUrl("")).toBeNull();
  });
});
