import { describe, it, expect, afterEach, vi } from "vitest";
import { lessonAssetUrl, lessonAssetBase } from "@/lib/lesson-engine/asset-url";

/**
 * The V2 lesson data says `.png`; Supabase holds `.webp`. That mismatch is the
 * whole reason this module exists, and it is invisible - a build passes either
 * way, and a missed rewrite shows up as a lesson where no picture ever loads.
 *
 * Audio is a straight prefix, images are a prefix AND an extension swap, and
 * anything that is not a V2 lesson asset must be left completely alone.
 */

afterEach(() => vi.unstubAllEnvs());

describe("resolving V2 lesson assets", () => {
  it("prefixes audio and leaves the extension alone", () => {
    vi.stubEnv("NEXT_PUBLIC_LESSON_ASSET_BASE", "https://cdn.example.com");
    expect(lessonAssetUrl("/audio/lessons-v2/key-details/hook.mp3")).toBe(
      "https://cdn.example.com/audio/lessons-v2/key-details/hook.mp3",
    );
  });

  it("prefixes images AND rewrites .png to .webp", () => {
    vi.stubEnv("NEXT_PUBLIC_LESSON_ASSET_BASE", "https://cdn.example.com");
    expect(lessonAssetUrl("/images/lessons-v2/key-details/pip.png")).toBe(
      "https://cdn.example.com/images/lessons-v2/key-details/pip.webp",
    );
  });

  it("rewrites .PNG too, since lesson data is generated and casing drifts", () => {
    vi.stubEnv("NEXT_PUBLIC_LESSON_ASSET_BASE", "https://cdn.example.com");
    expect(lessonAssetUrl("/images/lessons-v2/x/y.PNG")).toBe(
      "https://cdn.example.com/images/lessons-v2/x/y.webp",
    );
  });

  it("only rewrites the extension at the END of the path", () => {
    vi.stubEnv("NEXT_PUBLIC_LESSON_ASSET_BASE", "https://cdn.example.com");
    // A directory called "a.png" must survive intact.
    expect(lessonAssetUrl("/images/lessons-v2/a.png/b.png")).toBe(
      "https://cdn.example.com/images/lessons-v2/a.png/b.webp",
    );
  });

  it("leaves non-lesson assets alone", () => {
    vi.stubEnv("NEXT_PUBLIC_LESSON_ASSET_BASE", "https://cdn.example.com");
    for (const p of ["/images/shop/hat.png", "/audio/daily/x.mp3", "/logo.svg", "/images/lessons-v1/a.png"]) {
      expect(lessonAssetUrl(p), p).toBe(p);
    }
  });

  it("leaves absolute URLs alone", () => {
    vi.stubEnv("NEXT_PUBLIC_LESSON_ASSET_BASE", "https://cdn.example.com");
    const u = "https://other.example.com/audio/lessons-v2/x/y.mp3";
    expect(lessonAssetUrl(u)).toBe(u);
  });

  it("strips a trailing slash on the base so URLs never double up", () => {
    vi.stubEnv("NEXT_PUBLIC_LESSON_ASSET_BASE", "https://cdn.example.com/");
    expect(lessonAssetUrl("/audio/lessons-v2/a/b.mp3")).toBe("https://cdn.example.com/audio/lessons-v2/a/b.mp3");
  });
});

describe("where the base comes from", () => {
  it("derives from the Supabase URL, so nobody has to remember a second env var", () => {
    vi.stubEnv("NEXT_PUBLIC_LESSON_ASSET_BASE", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    expect(lessonAssetBase()).toBe("https://abc.supabase.co/storage/v1/object/public");
    expect(lessonAssetUrl("/images/lessons-v2/k/p.png")).toBe(
      "https://abc.supabase.co/storage/v1/object/public/images/lessons-v2/k/p.webp",
    );
  });

  it("an explicit base wins, for a future move to a real CDN", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_LESSON_ASSET_BASE", "https://cdn.readee.app");
    expect(lessonAssetBase()).toBe("https://cdn.readee.app");
  });

  it("with no base at all, paths pass through untouched rather than breaking", () => {
    vi.stubEnv("NEXT_PUBLIC_LESSON_ASSET_BASE", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect(lessonAssetUrl("/audio/lessons-v2/a/b.mp3")).toBe("/audio/lessons-v2/a/b.mp3");
  });
});
