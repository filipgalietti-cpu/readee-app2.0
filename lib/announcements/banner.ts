import { readFile } from "node:fs/promises";
import path from "node:path";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateImage } from "@/lib/ai/readee-ai";
import { OUTFITS } from "@/app/_components/Bunny/outfits";
import type { Announcement } from "@/lib/data/announcements";

/**
 * The picture at the top of a product-update email, made from the update.
 *
 * Filip, 19 Sep 2026: "i want to have the image basically made from what we are
 * announcing ... same format as the football one."
 *
 * The football banner was drawn by hand in ChatGPT, which made every
 * announcement wait on a person opening another app. It is now the REFERENCE:
 * every new banner is generated with that file as its visual anchor, which is
 * why they come back with the same white bunny, the same thick outlines, the
 * same scatter of stars and the same wide 2:1 frame. Without the reference the
 * model draws *a* rabbit. With it, it draws ours.
 *
 * I argued for composing these from the in-app SVG bunny instead. Filip chose
 * generation, the first probe (a pumpkin and a ghost, 19 Sep) came back on
 * brand, and he was right.
 *
 * Nothing here can reach a parent on its own. A banner only ever appears in the
 * preview sent to the team inbox, and an announcement only sends after someone
 * approves that preview (see ./approval.ts).
 */

const BUCKET = "images";
const FOLDER = "email-banners";
/** The football banner's frame, which the email shell is laid out around. */
const WIDTH = 1500;
const HEIGHT = 750;

const STYLE =
  "Flat vector sticker illustration, thick clean black outlines, flat saturated colours, plain white background. ";

/** What the banner should show, in words, derived from the announcement itself. */
export function bannerPrompt(a: Announcement): string {
  const costumes = (a.outfitIds ?? [])
    .map((id) => OUTFITS.find((o) => o.id === id)?.name)
    .filter((n): n is string => !!n)
    .slice(0, 2);

  const subject =
    costumes.length >= 2
      ? `two of these bunnies, one dressed in a ${costumes[0]} costume and the other in a ${costumes[1]} costume, celebrating together`
      : costumes.length === 1
        ? `two of these bunnies, one dressed in a ${costumes[0]} costume, celebrating together`
        : `two of these bunnies happily showing off this news: ${a.title} ${a.body}`;

  return [
    "Draw a new wide announcement banner in EXACTLY the same style as the reference image:",
    "the same white bunny character with the same proportions and pink inner ears, the same thick black outlines, the same flat colours, the same plain white background with a few small coloured stars.",
    `Scene: ${subject}.`,
    `The mood and small props should suit this announcement: "${a.title}".`,
    "Replace the football field with a simple strip of ground that suits the scene.",
    "Same wide 2:1 composition as the reference, characters centred, generous white space.",
    // The reference has jersey numbers on it, and a model shown numbers draws numbers.
    "No text, no letters, no numbers anywhere, including on clothing.",
  ].join(" ");
}

/** Fit to the shell's frame on white, never cropping: ears are the first thing a crop takes. */
async function fitToFrame(png: Buffer): Promise<Buffer> {
  try {
    const sharp = (await import("sharp")).default;
    return await sharp(png)
      .resize(WIDTH, HEIGHT, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toBuffer();
  } catch {
    // sharp ships with Next rather than being listed by us. If it is ever
    // missing, a banner a few pixels off 2:1 beats no banner.
    return png;
  }
}

export async function generateBanner(
  a: Announcement,
  teacherId: string,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  let reference: string;
  try {
    reference = (
      await readFile(path.join(process.cwd(), "public", "images", "email", "banner-football.png"))
    ).toString("base64");
  } catch {
    return { ok: false, error: "reference banner missing" };
  }

  const img = await generateImage({
    teacherId,
    prompt: bannerPrompt(a),
    referenceImage: { data: reference, mimeType: "image/png" },
    stylePrefix: STYLE,
  });
  if (!img.ok) return { ok: false, error: img.error };

  const framed = await fitToFrame(Buffer.from(img.imageBase64, "base64"));
  // A new name per draw. Mail clients cache images by URL, so redrawing onto the
  // same path would show the OLD picture in the very preview asking about the
  // new one.
  const name = `${FOLDER}/${a.id}-${Date.now()}.png`;
  const admin = supabaseAdmin();
  const { error } = await admin.storage.from(BUCKET).upload(name, framed, { contentType: "image/png", upsert: false });
  if (error) return { ok: false, error: error.message };
  return { ok: true, url: admin.storage.from(BUCKET).getPublicUrl(name).data.publicUrl };
}

/** The most recent banner drawn for this announcement, if any. */
export async function latestBanner(announcementId: string): Promise<string | null> {
  const admin = supabaseAdmin();
  const { data } = await admin.storage
    .from(BUCKET)
    .list(FOLDER, { search: `${announcementId}-`, sortBy: { column: "created_at", order: "desc" }, limit: 1 });
  const file = data?.[0];
  return file ? admin.storage.from(BUCKET).getPublicUrl(`${FOLDER}/${file.name}`).data.publicUrl : null;
}
