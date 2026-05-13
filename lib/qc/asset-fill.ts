/**
 * Nightly asset backfill. Walks questions_db for rows missing audio
 * or image URLs and tops them up. Budgeted via
 * content_production_caps.question_audio_fill + question_image_fill
 * so a single night can't blow the API budget.
 *
 * generateImage already uploads to Supabase and returns the URL,
 * so for images we just persist the URL. generateSpeechVertex
 * returns base64 PCM that we upload to the audio bucket ourselves.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateSpeechVertex } from "@/lib/ai/vertex-tts";
import { generateImage } from "@/lib/ai/readee-ai";
import { getCap } from "@/lib/content/caps";
import { trackError } from "@/lib/observability/track";

const TEACHER_ID =
  process.env.QC_BOT_TEACHER_ID ?? process.env.DAILY_QUESTION_TEACHER_ID ?? "";

function gradeFolder(grade: string): string {
  const g = grade.toLowerCase();
  if (g === "k" || g === "kindergarten") return "kindergarten";
  if (g === "1" || g === "1st") return "1st-grade";
  if (g === "2" || g === "2nd") return "2nd-grade";
  if (g === "3" || g === "3rd") return "3rd-grade";
  if (g === "4" || g === "4th") return "4th-grade";
  return "kindergarten";
}

type Row = {
  id: string;
  grade: string;
  standard_id: string;
  prompt: string;
  choices: any;
  audio_url: string | null;
  image_url: string | null;
};

async function fillOneAudio(row: Row): Promise<"ok" | "fail"> {
  try {
    const isEarlyReader =
      row.grade === "K" ||
      row.grade === "kindergarten" ||
      row.grade === "1" ||
      row.grade === "1st";
    const choicesList: string[] = Array.isArray(row.choices)
      ? (row.choices as any[]).map(String)
      : [];
    const text =
      isEarlyReader && choicesList.length > 0
        ? `${row.prompt}. ${choicesList.join(". ")}.`
        : row.prompt;
    const r = await generateSpeechVertex({ text, voice: "Autonoe" });
    if (!r.ok) return "fail";

    const admin = supabaseAdmin();
    const path = `${gradeFolder(row.grade)}/${row.standard_id}/${row.id}.wav`;
    const bytes = Buffer.from(r.pcmBase64, "base64");
    const { error: upErr } = await admin.storage
      .from("audio")
      .upload(path, bytes, { contentType: "audio/wav", upsert: true });
    if (upErr) return "fail";
    const { data } = admin.storage.from("audio").getPublicUrl(path);
    if (!data?.publicUrl) return "fail";

    await admin
      .from("questions_db")
      .update({ audio_url: data.publicUrl, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    return "ok";
  } catch (e) {
    trackError(e, {
      route: "asset-fill.audio",
      extra: { id: row.id, standard: row.standard_id },
    });
    return "fail";
  }
}

async function fillOneImage(row: Row): Promise<"ok" | "fail"> {
  try {
    const brief = `Illustration for a K-4 reading question. Prompt: ${row.prompt}`;
    const r = await generateImage({ teacherId: TEACHER_ID, prompt: brief });
    if (!r.ok) return "fail";
    const admin = supabaseAdmin();
    await admin
      .from("questions_db")
      .update({ image_url: r.imageUrl, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    return "ok";
  } catch (e) {
    trackError(e, {
      route: "asset-fill.image",
      extra: { id: row.id, standard: row.standard_id },
    });
    return "fail";
  }
}

export type AssetFillResult = {
  audioAttempted: number;
  audioFilled: number;
  imageAttempted: number;
  imageFilled: number;
};

export async function runAssetFill(): Promise<AssetFillResult> {
  const admin = supabaseAdmin();
  const audioCap = await getCap("question_audio_fill");
  const imageCap = await getCap("question_image_fill");

  const [audioGapsResp, imageGapsResp] = await Promise.all([
    admin
      .from("questions_db")
      .select("id, grade, standard_id, prompt, choices, audio_url, image_url")
      .or("audio_url.is.null,audio_url.eq.")
      .order("created_at", { ascending: true })
      .limit(audioCap.target),
    admin
      .from("questions_db")
      .select("id, grade, standard_id, prompt, choices, audio_url, image_url")
      .or("image_url.is.null,image_url.eq.")
      .order("created_at", { ascending: true })
      .limit(imageCap.target),
  ]);

  const audioRows = (audioGapsResp.data ?? []) as Row[];
  const imageRows = (imageGapsResp.data ?? []) as Row[];

  let audioFilled = 0;
  for (const r of audioRows) {
    if ((await fillOneAudio(r)) === "ok") audioFilled++;
  }
  let imageFilled = 0;
  for (const r of imageRows) {
    if ((await fillOneImage(r)) === "ok") imageFilled++;
  }

  return {
    audioAttempted: audioRows.length,
    audioFilled,
    imageAttempted: imageRows.length,
    imageFilled,
  };
}
