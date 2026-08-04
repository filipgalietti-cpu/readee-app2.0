"use client";

/**
 * Real-time Azure Pronunciation Assessment over a streamed mic (Speech SDK,
 * loaded dynamically, browser-only). We feed PCM in ourselves via a push stream
 * (one shared mic drives both this and the orb analyser), so per-word scores
 * arrive phrase-by-phrase (karaoke coloring) and the final result is ready the
 * instant the child stops — no upload round-trip.
 *
 * Connects with a short-lived auth token (minted server-side) — the Azure key
 * never touches the client.
 */

export type PAWord = { word: string; accuracy: number; errorType: string };
export type PAPhrase = { words: PAWord[]; fluency: number; text: string };

export type StreamController = {
  /** Feed a raw Float32 mic frame at its native sample rate; resampled to 16k. */
  pushSamples: (frame: Float32Array, inRate: number) => void;
  stop: () => Promise<void>;
};

export async function startPronAssessment(opts: {
  token: string;
  region: string;
  referenceText: string;
  language?: string;
  onRecognizing?: (partialText: string) => void;
  onPhrase?: (phrase: PAPhrase) => void;
  onError?: (msg: string) => void;
  log?: (msg: string) => void;
}): Promise<StreamController> {
  const log = opts.log ?? (() => {});
  const SDK = await import("microsoft-cognitiveservices-speech-sdk");
  log("sdk imported");

  const speechConfig = SDK.SpeechConfig.fromAuthorizationToken(opts.token, opts.region);
  speechConfig.speechRecognitionLanguage = opts.language || "en-US";

  const format = SDK.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
  const pushStream = SDK.AudioInputStream.createPushStream(format);
  const audioConfig = SDK.AudioConfig.fromStreamInput(pushStream);

  const recognizer = new SDK.SpeechRecognizer(speechConfig, audioConfig);
  log("recognizer ready");
  const paConfig = new SDK.PronunciationAssessmentConfig(
    opts.referenceText,
    SDK.PronunciationAssessmentGradingSystem.HundredMark,
    SDK.PronunciationAssessmentGranularity.Word,
    true, // enableMiscue — align to the reference (omissions/insertions)
  );
  paConfig.applyTo(recognizer);

  recognizer.recognizing = (_s, e) => {
    try { if (e.result?.text) opts.onRecognizing?.(e.result.text); } catch { /* ignore */ }
  };
  recognizer.recognized = (_s, e) => {
    try {
      if (e.result.reason !== SDK.ResultReason.RecognizedSpeech) return;
      const pa = SDK.PronunciationAssessmentResult.fromResult(e.result);
      const detail = (pa as unknown as { detailResult?: { Words?: unknown[] } }).detailResult ?? {};
      const rawWords = (detail.Words ?? []) as Array<{ Word?: string; PronunciationAssessment?: { AccuracyScore?: number; ErrorType?: string } }>;
      const words: PAWord[] = rawWords.map((w) => ({
        word: String(w.Word ?? "").trim(),
        accuracy: Math.round(w.PronunciationAssessment?.AccuracyScore ?? 100),
        errorType: w.PronunciationAssessment?.ErrorType ?? "None",
      }));
      const fluency = Math.round((pa as unknown as { fluencyScore?: number }).fluencyScore ?? 100);
      opts.onPhrase?.({ words, fluency, text: e.result.text || "" });
    } catch (err) { opts.onError?.(err instanceof Error ? err.message : "parse error"); }
  };
  recognizer.canceled = (_s, e) => {
    if (e.reason === SDK.CancellationReason.Error) opts.onError?.(e.errorDetails || "canceled");
  };

  log("starting recognition…");
  await new Promise<void>((resolve, reject) =>
    recognizer.startContinuousRecognitionAsync(() => { log("recognition started cb"); resolve(); }, (err) => reject(new Error(String(err)))),
  );

  // Continuous linear resampler (native rate → 16 kHz) with phase carried across
  // frames so there's no drift over a long read.
  let phase = 0, prevLast = 0;
  const pushSamples = (frame: Float32Array, inRate: number) => {
    if (!frame.length) return;
    const ratio = inRate / 16000;
    const out: number[] = [];
    let pos = phase;
    while (pos < frame.length) {
      const i = Math.floor(pos), frac = pos - i;
      const a = i < 0 ? prevLast : frame[i];
      const b = i + 1 < frame.length ? frame[i + 1] : frame[frame.length - 1];
      out.push(a * (1 - frac) + b * frac);
      pos += ratio;
    }
    phase = pos - frame.length;
    prevLast = frame[frame.length - 1] ?? prevLast;
    const buf = new ArrayBuffer(out.length * 2);
    const view = new DataView(buf);
    for (let i = 0; i < out.length; i++) { const s = Math.max(-1, Math.min(1, out[i])); view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); }
    try { pushStream.write(buf); } catch { /* stream closed */ }
  };

  return {
    pushSamples,
    stop: () =>
      new Promise<void>((resolve) => {
        try { pushStream.close(); } catch { /* ignore */ }
        try {
          recognizer.stopContinuousRecognitionAsync(
            () => { try { recognizer.close(); } catch { /* ignore */ } resolve(); },
            () => { try { recognizer.close(); } catch { /* ignore */ } resolve(); },
          );
        } catch { resolve(); }
      }),
  };
}
