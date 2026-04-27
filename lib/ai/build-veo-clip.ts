/**
 * Veo 3 — short animated story clips.
 *
 * Generates an 8-second animated MP4 with synced audio from a text
 * prompt. Used to produce one "trailer" per story or one animated
 * opener per lesson — pure engagement / retention boost for K-2.
 *
 * Cost (Google AI Studio Veo 3, 2026-04): ~\$0.50 per 8-second clip.
 * That's expensive — gate behind Readee+ heavily and cache the
 * generated MP4. Charge 100 credits per clip (\$0.50 cost / \$0.50
 * effective price = breakeven; the upcharge happens at the plan
 * boundary, not per clip).
 *
 * Implementation note: Veo is async — submit the prompt, poll the
 * operation until done. We persist the operation_id so we can pick
 * up later or surface progress in the UI.
 */

import { GoogleGenAI } from "@google/genai";
import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logUsage } from "@/lib/ai/readee-ai";
import { trackError } from "@/lib/observability/track";

const VEO_MODEL_ID = "veo-3.0-generate-001";

let cached: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (cached) return cached;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured.");
  cached = new GoogleGenAI({ apiKey });
  return cached;
}

/**
 * Submit the clip job. Returns an operation handle the caller can poll.
 * For MVP, we poll inside this function with a 2-min cap and return
 * the finished URL or an error.
 */
export async function generateVeoClip(input: {
  userId: string;
  prompt: string;
  /** Optional reference image to anchor the animation's visual style. */
  referenceImageBase64?: string | null;
  referenceImageMimeType?: string | null;
}): Promise<{ ok: true; videoUrl: string; storagePath: string } | { ok: false; error: string }> {
  const prompt = input.prompt.trim();
  if (!prompt) return { ok: false, error: "Prompt required." };
  if (prompt.length > 2000) {
    return { ok: false, error: "Prompt too long. Keep under 2,000 chars." };
  }

  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  try {
    // Submit the long-running Veo job.
    const config: Record<string, unknown> = {
      aspectRatio: "16:9",
      personGeneration: "allow_adult",
      durationSeconds: 8,
    };
    const submitArgs: any = {
      model: VEO_MODEL_ID,
      prompt,
      config,
    };
    if (input.referenceImageBase64 && input.referenceImageMimeType) {
      submitArgs.image = {
        imageBytes: input.referenceImageBase64,
        mimeType: input.referenceImageMimeType,
      };
    }
    let operation: any = await (ai.models as any).generateVideos(submitArgs);

    // Poll until done (cap ~3 min so a stuck job doesn't hang the request).
    const start = Date.now();
    const cap = 3 * 60 * 1000;
    while (!operation.done && Date.now() - start < cap) {
      await new Promise((r) => setTimeout(r, 6000));
      operation = await (ai.operations as any).getVideosOperation({
        operation,
      });
    }
    if (!operation.done) {
      return { ok: false, error: "Veo generation timed out. Try again." };
    }
    const generated =
      operation.response?.generatedVideos?.[0] ??
      operation.response?.videos?.[0];
    if (!generated) {
      return { ok: false, error: "Veo returned no clip." };
    }

    // Fetch the bytes — Veo returns a downloadable URI scoped to the API key.
    const videoFile: any = generated.video ?? generated;
    const fileUri: string | undefined = videoFile.uri ?? videoFile.fileUri;
    let videoBuffer: Buffer | null = null;
    if (videoFile.videoBytes) {
      videoBuffer = Buffer.from(videoFile.videoBytes, "base64");
    } else if (fileUri) {
      const apiKey = process.env.GEMINI_API_KEY!;
      const dl = await fetch(`${fileUri}&key=${apiKey}`);
      if (!dl.ok) {
        const body = await dl.text();
        throw new Error(`Veo download ${dl.status}: ${body.slice(0, 240)}`);
      }
      videoBuffer = Buffer.from(await dl.arrayBuffer());
    }
    if (!videoBuffer) {
      return { ok: false, error: "Couldn't retrieve the clip bytes." };
    }

    const admin = supabaseAdmin();
    const uuid = randomUUID();
    const storagePath = `veo/${input.userId}/${uuid}.mp4`;
    const upload = await admin.storage
      .from("audio") // reusing the audio bucket for now; can carve a "video" bucket later
      .upload(storagePath, videoBuffer, {
        contentType: "video/mp4",
        upsert: false,
      });
    if (upload.error) {
      throw new Error(`Upload failed: ${upload.error.message}`);
    }
    const { data: pub } = admin.storage.from("audio").getPublicUrl(storagePath);
    const videoUrl = pub?.publicUrl;
    if (!videoUrl) throw new Error("Could not resolve video URL.");

    await logUsage({
      teacherId: input.userId,
      kind: "image_generation", // closest existing bucket; we'd add 'video_generation' if it gets traction
      model: VEO_MODEL_ID,
      // ~\$0.50 per clip → 100 credits at \$0.005/credit.
      creditsUsed: 100,
      success: true,
      requestSummary: `veo: ${prompt.slice(0, 160)}`,
    });

    return { ok: true, videoUrl, storagePath };
  } catch (e: any) {
    trackError(e, { route: "build-veo-clip", userId: input.userId });
    await logUsage({
      teacherId: input.userId,
      kind: "image_generation",
      model: VEO_MODEL_ID,
      success: false,
      error: e.message,
      requestSummary: `veo: ${prompt.slice(0, 160)}`,
    });
    return { ok: false, error: e?.message ?? "Veo generation failed." };
  }
}
