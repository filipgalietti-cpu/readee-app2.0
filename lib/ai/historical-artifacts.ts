/**
 * Historical-figure image fallback.
 *
 * Imagen can't render named real people — and Filip caught that the
 * hard way when the May 6 daily question about Roger Bannister
 * shipped with a runner who had no eyes (it passed the old QC judge
 * because the scene matched, even though the face was broken).
 *
 * The QC image judge now flags anatomy bands, but the cleaner fix is
 * to never ask Imagen to depict a named figure in the first place.
 *
 * Strategy:
 * 1. detectHistoricalFigure(passage) — Gemini extracts named real
 *    historical figures (returns null if the passage is fictional or
 *    figure-free).
 * 2. findRoyaltyFreeImage(name) — Wikipedia REST summary endpoint
 *    returns the article's lead image, which is overwhelmingly
 *    public-domain or CC-licensed for historical figures.
 * 3. resolveHistoricalImage(passage) — orchestrator that returns
 *    {kind: "wikipedia"} if the passage names a person we can pull
 *    from Wikipedia, or {kind: "ai", brief} where the brief
 *    explicitly avoids portraying the named figure (thematic
 *    stand-in only — a runner, a scientist's lab, a stage, etc.).
 *
 * Why Wikipedia REST instead of Wikimedia Commons:
 *   - One HTTP call per figure (Commons needs filename → image URL
 *     resolution).
 *   - Wikipedia automatically picks the canonical "lead image" which
 *     is curated by editors — better than ranking Commons search
 *     results.
 *   - Lead images are stable URLs we can cache. Commons file URLs
 *     also work.
 */

import { GoogleGenAI } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabase/admin";

const FIGURE_DETECTION_MODEL = "gemini-2.5-flash";

// Figures we cache locally so we don't keep hitting Wikipedia for
// the same K-4 curriculum mainstays. Bumped via the resolve flow.
type CachedArtifact = {
  figureName: string;
  imageUrl: string | null;
  attribution: string | null;
  /** Wikipedia article summary — used by qcFactCheck to ground
   *  passage claims against the public record. Null when the article
   *  doesn't exist or doesn't have a summary. */
  extract: string | null;
  fetchedAt: string;
};

const memoryCache = new Map<string, CachedArtifact>();
const MEMORY_CACHE_TTL = 24 * 60 * 60_000; // 24h
const WIKI_UA = "ReadeeBot/1.0 (https://readee.app; hello@readee.app)";

/**
 * License gate for re-hosting Wikimedia images in a commercial product.
 *
 * The Wikipedia REST summary happily returns a fair-use lead image, and
 * "the figure died long ago" does NOT make a specific photograph public
 * domain (the photographer's copyright outlives the subject). So before we
 * cache + serve an image we verify its actual license on Wikimedia Commons.
 *
 * Two-layer check:
 *   1. The file must exist ON COMMONS. Fair-use / non-free files are hosted
 *      locally on the language wiki, never on Commons, so "missing on
 *      Commons" is itself a reject.
 *   2. Its LicenseShortName must be a free license (public domain / CC0 /
 *      CC BY / CC BY-SA). Anything else is rejected.
 *
 * Conservative by design: any error, missing file, or unrecognized license
 * returns null, and the caller falls back to an AI stand-in. We would rather
 * draw a generic scene than re-host a rights-encumbered photo.
 */
function isFreeLicense(shortName: string | null): boolean {
  if (!shortName) return false;
  const l = shortName.toLowerCase();
  if (l.includes("fair use") || l.includes("non-free") || l.includes("all rights")) {
    return false;
  }
  return (
    l.includes("public domain") ||
    l.includes("cc0") ||
    l.includes("cc by") || // "CC BY 4.0", "CC BY-SA 3.0"
    l.includes("cc-by") ||
    l.includes("pdm") || // Public Domain Mark
    l === "pd"
  );
}

async function verifyCommonsLicense(
  imageUrl: string,
): Promise<{ license: string; artist: string | null } | null> {
  try {
    const fname = decodeURIComponent(imageUrl.split("/").pop() ?? "");
    if (!fname) return null;
    const api = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      "File:" + fname,
    )}&prop=imageinfo&iiprop=extmetadata&format=json`;
    const res = await fetch(api, {
      headers: { "User-Agent": WIKI_UA, Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      query?: {
        pages?: Record<
          string,
          {
            missing?: string;
            imageinfo?: { extmetadata?: Record<string, { value?: string }> }[];
          }
        >;
      };
    };
    const pages = data.query?.pages ?? {};
    const page = Object.values(pages)[0];
    // Not on Commons (missing) → local/non-free file → reject.
    if (!page || page.missing !== undefined) return null;
    const md = page.imageinfo?.[0]?.extmetadata ?? {};
    const license = md.LicenseShortName?.value ?? null;
    if (!isFreeLicense(license)) return null;
    const artist = (md.Artist?.value ?? "").replace(/<[^>]+>/g, "").trim() || null;
    return { license: license as string, artist };
  } catch {
    return null;
  }
}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenAI({ apiKey });
}

const FIGURE_DETECTION_SYSTEM = `You read a short children's reading passage and identify whether it centers on a specific real-world historical figure (a real person, alive or deceased, who is the protagonist of the passage).

Rules:
- Return ONLY a JSON object, no commentary, no markdown fences.
- If the passage is about a real named historical figure: {"figure": "<canonical Wikipedia-style name>", "is_living": <bool>}
- If the passage is fictional, about an animal, an object, a generic person, or a contemporary celebrity: {"figure": null}
- If the passage references multiple figures, return only the most central one.
- "Canonical Wikipedia-style name" means the form Wikipedia would title the article — "Marie Curie" not "Madame Curie", "Martin Luther King Jr." not "MLK".

Examples:
- Passage about Roger Bannister breaking the 4-minute mile → {"figure": "Roger Bannister", "is_living": false}
- Passage about a fox who learns to share → {"figure": null}
- Passage about Marie Curie's lab → {"figure": "Marie Curie", "is_living": false}
- Passage about a kid named Sam at school → {"figure": null}`;

export type HistoricalFigure = {
  name: string;
  isLiving: boolean;
};

/**
 * Returns the named historical figure if the passage centers on one,
 * otherwise null. Errors fall through as null — callers proceed with
 * the standard image gen path.
 */
export async function detectHistoricalFigure(
  passageTitle: string,
  passageBody: string,
): Promise<HistoricalFigure | null> {
  if (!process.env.GEMINI_API_KEY) return null;
  try {
    const client = getClient();
    const userPrompt = `Title: ${passageTitle}\n\nPassage:\n${passageBody.slice(0, 1800)}\n\nReturn the JSON object.`;
    const response = await client.models.generateContent({
      model: FIGURE_DETECTION_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: FIGURE_DETECTION_SYSTEM,
        temperature: 0.0,
        responseMimeType: "application/json",
      },
    });
    const raw = (response.text ?? "").trim();
    const parsed = JSON.parse(raw) as { figure: string | null; is_living?: boolean };
    if (!parsed?.figure || typeof parsed.figure !== "string") return null;
    return { name: parsed.figure, isLiving: Boolean(parsed.is_living) };
  } catch {
    return null;
  }
}

/**
 * Wikipedia REST summary endpoint. Returns the article's
 * curator-picked lead image when one exists — these are
 * overwhelmingly public-domain or CC-licensed for historical figures
 * who died long ago.
 */
async function fetchWikipediaArtifact(
  name: string,
): Promise<CachedArtifact | null> {
  const memHit = memoryCache.get(name.toLowerCase());
  if (memHit && Date.now() - new Date(memHit.fetchedAt).getTime() < MEMORY_CACHE_TTL) {
    return memHit;
  }

  const slug = encodeURIComponent(name.replace(/ /g, "_"));
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${slug}?redirect=true`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "ReadeeBot/1.0 (https://readee.app; hello@readee.app)",
        Accept: "application/json",
      },
    });
    if (!res.ok) {
      const miss: CachedArtifact = {
        figureName: name,
        imageUrl: null,
        attribution: null,
        extract: null,
        fetchedAt: new Date().toISOString(),
      };
      memoryCache.set(name.toLowerCase(), miss);
      return null;
    }
    const data = (await res.json()) as {
      title?: string;
      thumbnail?: { source?: string };
      originalimage?: { source?: string };
      content_urls?: { desktop?: { page?: string } };
      extract?: string;
    };
    // Prefer originalimage (full-resolution). Fall back to thumbnail.
    const candidateUrl = data.originalimage?.source ?? data.thumbnail?.source ?? null;

    // License gate — only re-host images we've verified are free on
    // Commons. An unverified image is dropped (imageUrl stays null) so
    // resolveHistoricalImage falls back to an AI stand-in rather than
    // serving a rights-encumbered photo from a commercial product.
    let imageUrl: string | null = null;
    let attribution: string | null = null;
    if (candidateUrl) {
      const lic = await verifyCommonsLicense(candidateUrl);
      if (lic) {
        imageUrl = candidateUrl;
        attribution = lic.artist
          ? `${lic.artist} · ${lic.license} · via Wikimedia Commons`
          : `${lic.license} · via Wikimedia Commons`;
      }
    }
    const hit: CachedArtifact = {
      figureName: data.title ?? name,
      imageUrl,
      attribution,
      extract: typeof data.extract === "string" ? data.extract : null,
      fetchedAt: new Date().toISOString(),
    };
    memoryCache.set(name.toLowerCase(), hit);
    return hit;
  } catch {
    return null;
  }
}

export type ResolvedImage =
  | {
      kind: "royalty_free";
      figureName: string;
      imageUrl: string;
      attribution: string;
      source: "wikipedia";
    }
  | {
      kind: "ai";
      // The image-brief generator should NOT name the figure — it
      // describes a thematic stand-in scene. Used when:
      //   - the passage names a figure but no royalty-free image
      //     exists (or fetch failed)
      //   - the figure is still living (likeness-rights risk)
      figureName: string | null;
      avoidNamedPerson: boolean;
    };

/**
 * One-call orchestrator. Caller passes the passage; gets back either
 * a ready-to-use royalty-free image URL OR a flag telling the image
 * generator to use a thematic stand-in.
 */
export async function resolveHistoricalImage(
  passageTitle: string,
  passageBody: string,
): Promise<ResolvedImage> {
  const figure = await detectHistoricalFigure(passageTitle, passageBody);
  if (!figure) {
    return { kind: "ai", figureName: null, avoidNamedPerson: false };
  }

  // Anti-hallucination guard. Gemini occasionally returns a real
  // figure name that has nothing to do with the passage (e.g.,
  // "Harriet Tubman" for an Edison passage about lightbulbs — the
  // May 11 incident). Before we trust the detection and pull that
  // figure's Wikipedia portrait, confirm SOMETHING distinctive from
  // the name actually appears in the title or body. We tokenize the
  // figure name, drop very common words (the, of, and, etc.), and
  // require at least one remaining token to match.
  const haystack = `${passageTitle}\n${passageBody}`.toLowerCase();
  const STOP_WORDS = new Set([
    "the", "of", "and", "a", "an", "to", "in", "for", "or", "by",
    "jr", "sr", "i", "ii", "iii", "iv", "von", "van", "de", "la", "le",
  ]);
  const nameTokens = figure.name
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z]/g, ""))
    .filter((t) => t.length >= 3 && !STOP_WORDS.has(t));
  const tokenInPassage = nameTokens.some((t) => haystack.includes(t));
  if (!tokenInPassage) {
    // Detection was a hallucination — passage doesn't mention this
    // person. Fall back to thematic AI image with no figure tag so
    // no other-figure Wikipedia cache gets reused.
    return { kind: "ai", figureName: null, avoidNamedPerson: false };
  }

  // Living figures: skip Wikipedia fetch (likeness-rights friction)
  // and just tell the AI to use a thematic stand-in.
  if (figure.isLiving) {
    return {
      kind: "ai",
      figureName: figure.name,
      avoidNamedPerson: true,
    };
  }

  const artifact = await fetchWikipediaArtifact(figure.name);
  if (artifact?.imageUrl) {
    return {
      kind: "royalty_free",
      figureName: artifact.figureName,
      imageUrl: artifact.imageUrl,
      attribution: artifact.attribution ?? "Image via Wikipedia",
      source: "wikipedia",
    };
  }

  // Figure named but no Wikipedia image — fall back to AI gen with
  // explicit "no named likeness" guardrail.
  return {
    kind: "ai",
    figureName: figure.name,
    avoidNamedPerson: true,
  };
}

/**
 * Returns the Wikipedia article summary for a named figure, used as
 * a grounding source for the fact-check judge in lib/ai/qc.ts.
 *
 * Hits the same in-memory cache as fetchWikipediaArtifact so we don't
 * double-fetch when the image pipeline already touched this figure.
 * Returns null when Wikipedia has no article for the name (we then
 * skip fact-checking entirely for that piece — too risky to fact-
 * check against the LLM's own training data).
 */
export async function fetchWikipediaSummary(
  name: string,
): Promise<string | null> {
  const hit = await fetchWikipediaArtifact(name);
  return hit?.extract ?? null;
}

/**
 * Persist a Wikipedia-sourced image into Supabase Storage so the
 * asset survives even if Wikipedia changes the lead image. Returns
 * the new public URL.
 *
 * Storage path: images/historical/{slug}.jpg
 *
 * Idempotent: if a cached file already exists for this figure, we
 * skip the download and return the existing URL.
 */
export async function cacheWikipediaImageToSupabase(
  figureName: string,
  wikipediaImageUrl: string,
): Promise<string | null> {
  const admin = supabaseAdmin();
  const slug = figureName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const path = `historical/${slug}.jpg`;

  // If already cached, return the existing public URL.
  const { data: existing } = await admin.storage.from("images").list("historical", {
    search: `${slug}.jpg`,
    limit: 1,
  });
  if (existing && existing.length > 0) {
    const { data: pub } = admin.storage.from("images").getPublicUrl(path);
    return pub?.publicUrl ?? null;
  }

  try {
    const res = await fetch(wikipediaImageUrl, {
      headers: {
        "User-Agent": "ReadeeBot/1.0 (https://readee.app; hello@readee.app)",
      },
    });
    if (!res.ok) return null;
    const arrayBuf = await res.arrayBuffer();
    const buf = Buffer.from(arrayBuf);
    const contentType = res.headers.get("content-type") ?? "image/jpeg";

    const { error } = await admin.storage.from("images").upload(path, buf, {
      contentType,
      upsert: true,
    });
    if (error) return null;

    const { data: pub } = admin.storage.from("images").getPublicUrl(path);
    return pub?.publicUrl ?? null;
  } catch {
    return null;
  }
}
