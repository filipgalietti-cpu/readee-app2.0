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

export type PAWord = { word: string; accuracy: number; errorType: string; phonemeMin: number; worst: string; /** Seconds from the start of this recognition stream, not callback arrival time. */ offsetSeconds?: number; durationSeconds?: number };
export type PAPhrase = { words: PAWord[]; fluency: number; prosody: number; text: string };

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
  segmentationSilenceMs?: number;
  initialSilenceMs?: number;
  enableMiscue?: boolean;
  onRecognizing?: (partialText: string) => void;
  /** Optional plain-speech channel for commands that pronunciation alignment omits. */
  onCommandText?: (text: string) => void;
  onPhrase?: (phrase: PAPhrase) => void;
  onError?: (msg: string) => void;
  log?: (msg: string) => void;
}): Promise<StreamController> {
  const log = opts.log ?? (() => {});
  const SDK = await import("microsoft-cognitiveservices-speech-sdk");
  log("sdk imported");

  const speechConfig = SDK.SpeechConfig.fromAuthorizationToken(opts.token, opts.region);
  speechConfig.speechRecognitionLanguage = opts.language || "en-US";
  // Early/struggling readers pause between words while they decode. Azure's
  // default endpointing (~0.5s) treats those pauses as the end of the utterance
  // and chops the read into a fragment. Widen the in-phrase silence tolerance so
  // a slow, word-by-word read is still captured as one continuous phrase.
  try { speechConfig.setProperty(SDK.PropertyId.Speech_SegmentationSilenceTimeoutMs, String(opts.segmentationSilenceMs ?? 2500)); } catch { /* older SDK */ }

  if (opts.initialSilenceMs !== undefined) speechConfig.setProperty(SDK.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, String(opts.initialSilenceMs));

  const format = SDK.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
  const pushStream = SDK.AudioInputStream.createPushStream(format);
  const audioConfig = SDK.AudioConfig.fromStreamInput(pushStream);

  const recognizer = new SDK.SpeechRecognizer(speechConfig, audioConfig);
  log("recognizer ready");
  const paConfig = new SDK.PronunciationAssessmentConfig(
    opts.referenceText,
    SDK.PronunciationAssessmentGradingSystem.HundredMark,
    SDK.PronunciationAssessmentGranularity.Phoneme, // per-phoneme scores → catch a single wrong sound
    opts.enableMiscue ?? true, // enableMiscue — align to the reference (omissions/insertions)
  );
  try { (paConfig as unknown as { enableProsodyAssessment: boolean }).enableProsodyAssessment = true; } catch { /* older SDK */ }
  paConfig.applyTo(recognizer);

  recognizer.recognizing = (_s, e) => {
    try { if (e.result?.text) opts.onRecognizing?.(e.result.text); } catch { /* ignore */ }
  };
  recognizer.recognized = (_s, e) => {
    try {
      if (e.result.reason !== SDK.ResultReason.RecognizedSpeech) return;
      const pa = SDK.PronunciationAssessmentResult.fromResult(e.result);
      const detail = (pa as unknown as { detailResult?: { Words?: unknown[] } }).detailResult ?? {};
      const rawWords = (detail.Words ?? []) as Array<{ Word?: string; Offset?: number; Duration?: number; PronunciationAssessment?: { AccuracyScore?: number; ErrorType?: string }; Phonemes?: Array<{ Phoneme?: string; PronunciationAssessment?: { AccuracyScore?: number } }> }>;
      const words: PAWord[] = rawWords.map((w) => {
        let phonemeMin = 100, worst = "";
        for (const ph of w.Phonemes ?? []) {
          const a = ph.PronunciationAssessment?.AccuracyScore ?? 100;
          if (a < phonemeMin) { phonemeMin = a; worst = ph.Phoneme ?? ""; }
        }
        return {
          word: String(w.Word ?? "").trim(),
          accuracy: Math.round(w.PronunciationAssessment?.AccuracyScore ?? 100),
          errorType: w.PronunciationAssessment?.ErrorType ?? "None",
          phonemeMin: Math.round(phonemeMin),
          worst,
          // Azure offsets/durations are in 100-nanosecond ticks.
          offsetSeconds: typeof w.Offset === "number" ? w.Offset / 10_000_000 : undefined,
          durationSeconds: typeof w.Duration === "number" ? w.Duration / 10_000_000 : undefined,
        };
      });
      const fluency = Math.round((pa as unknown as { fluencyScore?: number }).fluencyScore ?? 100);
      const prosody = Math.round((pa as unknown as { prosodyScore?: number }).prosodyScore ?? 100);
      opts.onPhrase?.({ words, fluency, prosody, text: e.result.text || "" });
    } catch (err) { opts.onError?.(err instanceof Error ? err.message : "parse error"); }
  };
  recognizer.canceled = (_s, e) => {
    if (e.reason === SDK.CancellationReason.Error) opts.onError?.(e.errorDetails || "canceled");
  };

  // Pronunciation assessment can return an empty phrase for "I don't know".
  // A separate, unscored recognizer hears explicit commands on the same PCM.
  const commandStream = opts.onCommandText ? SDK.AudioInputStream.createPushStream(format) : null;
  const commandConfig = opts.onCommandText ? SDK.SpeechConfig.fromAuthorizationToken(opts.token, opts.region) : null;
  if (commandConfig) {
    commandConfig.speechRecognitionLanguage = opts.language || "en-US";
    commandConfig.setProperty(SDK.PropertyId.Speech_SegmentationSilenceTimeoutMs, "500");
    commandConfig.setProperty(SDK.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, String(opts.initialSilenceMs ?? 60000));
  }
  const commands = commandStream && commandConfig ? new SDK.SpeechRecognizer(commandConfig, SDK.AudioConfig.fromStreamInput(commandStream)) : null;
  if (commands) {
    commands.recognizing = (_s, e) => { if (e.result?.text) opts.onCommandText?.(e.result.text); };
    commands.recognized = (_s, e) => { if (e.result.reason === SDK.ResultReason.RecognizedSpeech && e.result.text) opts.onCommandText?.(e.result.text); };
    commands.canceled = (_s, e) => { if (e.reason === SDK.CancellationReason.Error) opts.onError?.("Speech commands unavailable."); };
  }
  log("starting recognition…");
  const start = (r: InstanceType<typeof SDK.SpeechRecognizer>) => new Promise<void>((resolve, reject) => r.startContinuousRecognitionAsync(resolve, err => reject(new Error(String(err)))));
  try { await Promise.all([start(recognizer), ...(commands ? [start(commands)] : [])]); }
  catch (error) {
    try { pushStream.close(); recognizer.close(); commandStream?.close(); commands?.close(); } catch { /* released as far as possible */ }
    throw error;
  }

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
    try { pushStream.write(buf); commandStream?.write(buf); } catch { /* stream closed */ }
  };

  let stopping: Promise<void> | undefined;
  const stopRecognizer = (r: InstanceType<typeof SDK.SpeechRecognizer>) => new Promise<void>(resolve => {
    const done = () => { try { r.close(); } catch { /* already closed */ } resolve(); };
    try { r.stopContinuousRecognitionAsync(done, done); } catch { done(); }
  });
  return {
    pushSamples,
    stop: () => stopping ??= (async () => {
      try { pushStream.close(); commandStream?.close(); } catch { /* already closed */ }
      await Promise.all([stopRecognizer(recognizer), ...(commands ? [stopRecognizer(commands)] : [])]);
    })(),
  };
}
