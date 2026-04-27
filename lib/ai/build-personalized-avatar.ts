/**
 * Personalized animated avatar opener for each kid.
 *
 * Kid picks a Readee mascot (bunny, fox, owl). On their first visit
 * each day, Readee shows an 8-second animated greeting featuring
 * their mascot saying their name. Pure delight, drives daily-active.
 *
 * Built on top of build-veo-clip (Veo 3). Cached per (childId, mascot)
 * so we generate it once and reuse forever — total cost \$0.50 per
 * kid lifetime.
 *
 * Margin: ~\$0.50 sunk cost per kid amortized across hundreds of
 * daily logins. Pure retention play, not a margin product. Gate
 * behind Readee+ for the upcharge story.
 */

import { generateVeoClip } from "@/lib/ai/build-veo-clip";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type Mascot = "bunny" | "fox" | "owl" | "cat" | "dragon";

const MASCOT_DESCRIPTIONS: Record<Mascot, string> = {
  bunny:
    "Readee, a friendly cartoon white-and-violet bunny with big purple eyes and a small book under one paw",
  fox:
    "a friendly cartoon orange-and-white fox with bright green eyes and a soft scarf, smiling warmly",
  owl:
    "a wise but friendly cartoon golden owl with big round glasses and tufted ears, holding a tiny book",
  cat:
    "a friendly cartoon striped tabby cat with cheerful blue eyes and a long fluffy tail",
  dragon:
    "a tiny friendly cartoon teal dragon with soft round wings, big curious eyes, and a happy expression",
};

/**
 * Generate (or fetch from cache) the kid's animated greeting.
 */
export async function getOrGeneratePersonalizedAvatar(input: {
  childId: string;
  childFirstName: string;
  mascot: Mascot;
  callerId: string;
}): Promise<{ ok: true; videoUrl: string; cached: boolean } | { ok: false; error: string }> {
  const admin = supabaseAdmin();
  const cacheKey = `${input.childId}:${input.mascot}`;

  // Check cache first.
  const { data: existing } = await admin
    .from("personalized_avatars")
    .select("video_url")
    .eq("cache_key", cacheKey)
    .maybeSingle();
  if (existing && (existing as any).video_url) {
    return { ok: true, videoUrl: (existing as any).video_url as string, cached: true };
  }

  const description = MASCOT_DESCRIPTIONS[input.mascot] ?? MASCOT_DESCRIPTIONS.bunny;
  const firstName = (input.childFirstName ?? "friend").split(" ")[0].slice(0, 20) || "friend";
  const prompt = `Children's animation, bright 2D cartoon style, vibrant colors, kid-friendly. ${description} waves at the camera, smiles, and warmly says "Hi ${firstName}, ready to read?" The voice should sound friendly and energetic, perfect for a young child. Soft pastel background, no text on screen.`;

  const res = await generateVeoClip({
    userId: input.callerId,
    prompt,
  });
  if (!res.ok) return res;

  // Persist to cache.
  await admin.from("personalized_avatars").upsert(
    {
      cache_key: cacheKey,
      child_id: input.childId,
      mascot: input.mascot,
      video_url: res.videoUrl,
      storage_path: res.storagePath,
    },
    { onConflict: "cache_key" },
  );

  return { ok: true, videoUrl: res.videoUrl, cached: false };
}
