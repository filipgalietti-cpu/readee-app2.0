/**
 * Resolve a V2 lesson asset path to where the file actually lives.
 *
 * The 183 authored lesson files each build their own asset paths inline, like
 * `/audio/lessons-v2/<id>/hook.mp3` and `/images/lessons-v2/<id>/pip.png`. Those
 * are app-relative, and they were never deployable: public/audio and
 * public/images are gitignored, so both 404 in production and always have - the
 * reason /demo has never worked there either.
 *
 * The assets live in Supabase storage instead, in buckets `audio` and `images`
 * under the same `lessons-v2/...` path. Rewriting here rather than in the lesson
 * data means one place to change instead of 183, and the lesson files stay pure
 * data the factory can keep regenerating.
 *
 * ‼️ TWO rewrites, not one:
 *
 *   audio   /audio/lessons-v2/x/y.mp3   -> <base>/audio/lessons-v2/x/y.mp3
 *   images  /images/lessons-v2/x/y.png  -> <base>/images/lessons-v2/x/y.WEBP
 *
 * The images were converted to WebP on upload - `pip.png` at 300 KB is
 * `pip.webp` at 26 KB, which matters on a child's tablet - but the lesson data
 * still says `.png`. Forgetting the extension swap is the difference between
 * every picture loading and none of them loading.
 *
 * The base DERIVES from NEXT_PUBLIC_SUPABASE_URL, which is already set
 * everywhere this app runs. That is deliberate: an asset base that must be
 * remembered separately is an asset base someone forgets, and a forgotten one
 * fails exactly the way this feature failed the first time - silently, with a
 * green build. NEXT_PUBLIC_LESSON_ASSET_BASE overrides it if the files ever move
 * to a CDN.
 */

/** Bucket-relative prefixes this module owns; anything else passes through. */
const V2_AUDIO = "/audio/lessons-v2/";
const V2_IMAGE = "/images/lessons-v2/";

/**
 * Read at call time rather than module load. `NEXT_PUBLIC_*` is inlined
 * textually by Next either way, so this costs nothing in the browser and keeps
 * the function testable.
 */
export function lessonAssetBase(): string {
  const explicit = process.env.NEXT_PUBLIC_LESSON_ASSET_BASE;
  if (explicit) return explicit.replace(/\/+$/, "");
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabase) return `${supabase.replace(/\/+$/, "")}/storage/v1/object/public`;
  return "";
}

export function lessonAssetUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return pathOrUrl;
  // Already absolute - a lesson pointing somewhere external, or an already
  // resolved URL. Leave it alone.
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  const base = lessonAssetBase();
  if (!base) return pathOrUrl;

  if (pathOrUrl.startsWith(V2_AUDIO)) return base + pathOrUrl;
  if (pathOrUrl.startsWith(V2_IMAGE)) return base + pathOrUrl.replace(/\.png$/i, ".webp");
  return pathOrUrl;
}
