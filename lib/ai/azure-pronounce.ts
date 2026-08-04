/**
 * Azure AI Speech — Pronunciation Assessment (the "reading" scenario).
 *
 * This is the PURPOSE-BUILT measurement engine for Luna: forced-alignment +
 * Goodness-of-Pronunciation scoring against the known reference text, returning
 * deterministic per-word accuracy + miscue types (omission/insertion/
 * mispronunciation) + a fluency score. Same output shape as the Gemini
 * `gradeLine` grader so the route + client are drop-in compatible.
 *
 * Uses the REST short-audio endpoint (no SDK dependency). Audio must be
 * 16 kHz / 16-bit / mono PCM WAV (the Luna client records exactly this).
 * NOTE: the REST endpoint caps a single request at ~60s of audio — long whole-
 * passage reads by very slow readers may exceed it; the route falls back to the
 * Gemini grader if this call fails.
 */
import type { LineGrade } from "@/lib/ai/luna-grade";

// Tunables. Azure word AccuracyScore: cleanly-read words ~80-100, sloppy/wrong
// reads drop lower. Threshold catches mispronunciations even when Azure's own
// ErrorType stays "None". Raise to catch more, lower to be gentler on articulation.
const ACCURACY_TRICKY_BELOW = 60; // ErrorType None but accuracy below this → tricky
const FLUENCY_DISFLUENT_BELOW = 50; // NBest FluencyScore below this → disfluent

type AzureWord = {
  Word?: string;
  Offset?: number;
  Duration?: number;
  PronunciationAssessment?: { AccuracyScore?: number; ErrorType?: string };
};
type AzureNBest = {
  Lexical?: string;
  Display?: string;
  PronunciationAssessment?: { AccuracyScore?: number; FluencyScore?: number; CompletenessScore?: number; PronScore?: number };
  Words?: AzureWord[];
};

export function azureConfigured(): boolean {
  return Boolean(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION);
}

export type PADebugWord = { word: string; acc: number; err: string };

export async function assessPronunciation(input: {
  wavBytes: Buffer;
  referenceText: string;
  language?: string;
}): Promise<{ ok: true; grade: LineGrade; debug: PADebugWord[] } | { ok: false; error: string }> {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) return { ok: false, error: "Azure Speech not configured." };
  if (!input.referenceText.trim()) return { ok: false, error: "Missing reference text." };

  const lang = input.language || "en-US";
  const paConfig = {
    ReferenceText: input.referenceText,
    GradingSystem: "HundredMark",
    Granularity: "Word",
    Dimension: "Comprehensive",
    EnableMiscue: true,
  };
  const paHeader = Buffer.from(JSON.stringify(paConfig), "utf-8").toString("base64");
  const url = `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${encodeURIComponent(lang)}&format=detailed`;

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
        "Pronunciation-Assessment": paHeader,
        Accept: "application/json",
      },
      body: new Uint8Array(input.wavBytes),
    });
    if (!resp.ok) {
      const t = await resp.text().catch(() => "");
      return { ok: false, error: `Azure ${resp.status}: ${t.slice(0, 200)}` };
    }
    const j = (await resp.json()) as { RecognitionStatus?: string; DisplayText?: string; NBest?: AzureNBest[] };
    const status = j.RecognitionStatus || "";
    const nb = j.NBest?.[0];

    // Silence / no speech → treat the whole reference as missed so the child
    // simply re-reads (never a hard failure).
    if (status !== "Success" || !nb || !Array.isArray(nb.Words)) {
      const refWords = input.referenceText.split(/\s+/).filter(Boolean);
      return {
        ok: true,
        debug: refWords.map((w) => ({ word: w, acc: 0, err: "NoSpeech" })),
        grade: {
          wordAnnotations: refWords.map((w) => ({ word: w, status: "missed" })),
          wordsCorrect: 0,
          wordsTotal: refWords.length,
          durationSeconds: 0,
          disfluent: false,
          heardTranscript: "",
          coach: "Let's try reading that again.",
        },
      };
    }

    const wordAnnotations: LineGrade["wordAnnotations"] = [];
    const debug: PADebugWord[] = [];
    let wordsCorrect = 0, wordsTotal = 0, lastEndTicks = 0;
    for (const w of nb.Words) {
      const errType = w.PronunciationAssessment?.ErrorType ?? "None";
      const acc = Math.round(w.PronunciationAssessment?.AccuracyScore ?? 100);
      if (typeof w.Offset === "number" && typeof w.Duration === "number") lastEndTicks = Math.max(lastEndTicks, w.Offset + w.Duration);
      debug.push({ word: (w.Word || "").trim() || "?", acc, err: errType });
      // Inserted words aren't part of the reference — don't score them.
      if (errType === "Insertion") continue;
      wordsTotal++;
      let stat: string;
      if (errType === "Omission") stat = "missed";
      else if (errType === "Mispronunciation") stat = "substituted";
      else if (acc < ACCURACY_TRICKY_BELOW) stat = "substituted";
      else { stat = "correct"; wordsCorrect++; }
      wordAnnotations.push({ word: (w.Word || "").trim() || "?", status: stat });
    }

    const fluency = nb.PronunciationAssessment?.FluencyScore ?? 100;
    const grade: LineGrade = {
      wordAnnotations,
      wordsCorrect,
      wordsTotal: wordsTotal || wordAnnotations.length,
      durationSeconds: lastEndTicks ? lastEndTicks / 1e7 : 0,
      disfluent: fluency < FLUENCY_DISFLUENT_BELOW,
      heardTranscript: j.DisplayText || nb.Display || nb.Lexical || "",
      coach: "",
    };
    return { ok: true, grade, debug };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Azure request failed." };
  }
}
