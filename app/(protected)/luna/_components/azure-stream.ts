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

export type PAWord = {
  word: string;
  accuracy: number;
  errorType: string;
  phonemeMin: number;
  worst: string;
  offsetSeconds?: number;
  durationSeconds?: number;
};
export type PAPhrase = {
  words: PAWord[];
  fluency: number;
  prosody: number;
  text: string;
  confidence?: number;
};

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
  /** Free transcription: never bias the recognizer toward an expected answer. */
  transcribeOnly?: boolean;
  /** Explicit short oral response, never an expected-answer hint. Reading stays continuous. */
  captureMode?: "single-utterance";
  recognitionVocabulary?: "letter-names";
  onRecognizing?: (partialText: string) => void;
  /** Optional plain-speech channel for commands that pronunciation alignment omits. */
  onCommandText?: (text: string) => void;
  onPhrase?: (phrase: PAPhrase) => void;
  onError?: (msg: string) => void;
  log?: (msg: string) => void;
}): Promise<StreamController> {
  if (opts.captureMode && !opts.transcribeOnly)
    throw Error("Single-utterance capture requires free transcription");
  const single = opts.captureMode === "single-utterance";
  const log = opts.log ?? (() => {});
  const SDK = await import("microsoft-cognitiveservices-speech-sdk");
  log("sdk imported");

  const speechConfig = SDK.SpeechConfig.fromAuthorizationToken(opts.token, opts.region);
  speechConfig.speechRecognitionLanguage = opts.language || "en-US";
  if (opts.transcribeOnly) speechConfig.outputFormat = SDK.OutputFormat.Detailed;
  // Early/struggling readers pause between words while they decode. Azure's
  // default endpointing (~0.5s) treats those pauses as the end of the utterance
  // and chops the read into a fragment. Widen the in-phrase silence tolerance so
  // a slow, word-by-word read is still captured as one continuous phrase.
  // Lessons can request shorter scored phrases without closing the continuous
  // microphone; placement keeps its existing longer phrase window.
  // Short spoken responses are not decoding tasks: end after 1.2s of silence.
  try {
    speechConfig.setProperty(
      SDK.PropertyId.Speech_SegmentationSilenceTimeoutMs,
      String(opts.segmentationSilenceMs ?? (opts.transcribeOnly ? 1200 : 2500)),
    );
  } catch {
    /* older SDK */
  }

  if (single)
    speechConfig.setProperty(SDK.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, "1200");

  if (opts.initialSilenceMs !== undefined)
    speechConfig.setProperty(
      SDK.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs,
      String(opts.initialSilenceMs),
    );

  const format = SDK.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
  const pushStream = SDK.AudioInputStream.createPushStream(format);
  const audioConfig = SDK.AudioConfig.fromStreamInput(pushStream);

  const recognizer = new SDK.SpeechRecognizer(speechConfig, audioConfig);
  log("recognizer ready");
  if (opts.transcribeOnly && opts.recognitionVocabulary === "letter-names") {
    // Same vocabulary for every target: no answer-specific phrase boosting.
    const names = SDK.PhraseListGrammar.fromRecognizer(recognizer);
    names.addPhrases([
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
      "ay",
      "bee",
      "see",
      "dee",
      "ee",
      "ef",
      "gee",
      "aitch",
      "eye",
      "jay",
      "kay",
      "el",
      "em",
      "en",
      "oh",
      "pee",
      "cue",
      "ar",
      "ess",
      "tee",
      "you",
      "vee",
      "double u",
      "ex",
      "why",
      "zee",
      "zed",
    ]);
  }
  if (!opts.transcribeOnly) {
    const paConfig = new SDK.PronunciationAssessmentConfig(
      opts.referenceText,
      SDK.PronunciationAssessmentGradingSystem.HundredMark,
      SDK.PronunciationAssessmentGranularity.Phoneme, // per-phoneme scores → catch a single wrong sound
      opts.enableMiscue ?? true, // enableMiscue — align to the reference (omissions/insertions)
    );
    try {
      (paConfig as unknown as { enableProsodyAssessment: boolean }).enableProsodyAssessment = true;
    } catch {
      /* older SDK */
    }
    paConfig.applyTo(recognizer);
  }

  let disposed = false,
    singleSettled = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    try {
      pushStream.close();
      commandStream?.close();
    } catch {
      /* already closed */
    }
    try {
      recognizer.close();
      commands?.close();
    } catch {
      /* already closed */
    }
  };
  recognizer.recognizing = (_s, e) => {
    if (disposed || (single && singleSettled)) return;
    try {
      if (e.result?.text) opts.onRecognizing?.(e.result.text);
    } catch {
      /* ignore */
    }
  };
  let settleSingle: () => void = () => {};
  const singleFinished = new Promise<void>((resolve) => {
    settleSingle = resolve;
  });
  const receive = (result: InstanceType<typeof SDK.SpeechRecognitionResult>) => {
    if (disposed || (single && singleSettled)) return;
    try {
      if (result.reason !== SDK.ResultReason.RecognizedSpeech) {
        if (single && result.reason === SDK.ResultReason.NoMatch)
          opts.onPhrase?.({ words: [], fluency: 0, prosody: 0, text: "", confidence: 0 });
        return;
      }
      if (opts.transcribeOnly) {
        const detail = JSON.parse(
          result.properties.getProperty(SDK.PropertyId.SpeechServiceResponse_JsonResult) || "{}",
        );
        const confidence = detail.NBest?.[0]?.Confidence;
        opts.onPhrase?.({
          words: [],
          fluency: 0,
          prosody: 0,
          text: result.text || "",
          confidence: typeof confidence === "number" ? confidence : undefined,
        });
        return;
      }
      const pa = SDK.PronunciationAssessmentResult.fromResult(result);
      const detail = (pa as unknown as { detailResult?: { Words?: unknown[] } }).detailResult ?? {};
      const rawWords = (detail.Words ?? []) as Array<{
        Word?: string;
        Offset?: number;
        Duration?: number;
        PronunciationAssessment?: { AccuracyScore?: number; ErrorType?: string };
        Phonemes?: Array<{
          Phoneme?: string;
          PronunciationAssessment?: { AccuracyScore?: number };
        }>;
      }>;
      const words: PAWord[] = rawWords.map((w) => {
        let phonemeMin = 100,
          worst = "";
        for (const ph of w.Phonemes ?? []) {
          const a = ph.PronunciationAssessment?.AccuracyScore ?? 100;
          if (a < phonemeMin) {
            phonemeMin = a;
            worst = ph.Phoneme ?? "";
          }
        }
        return {
          word: String(w.Word ?? "").trim(),
          accuracy: Math.round(w.PronunciationAssessment?.AccuracyScore ?? 100),
          errorType: w.PronunciationAssessment?.ErrorType ?? "None",
          offsetSeconds: typeof w.Offset === "number" ? w.Offset / 10000000 : undefined,
          durationSeconds: typeof w.Duration === "number" ? w.Duration / 10000000 : undefined,
          phonemeMin: Math.round(phonemeMin),
          worst,
        };
      });
      const fluency = Math.round((pa as unknown as { fluencyScore?: number }).fluencyScore ?? 100);
      const prosody = Math.round((pa as unknown as { prosodyScore?: number }).prosodyScore ?? 100);
      opts.onPhrase?.({ words, fluency, prosody, text: result.text || "" });
    } catch (err) {
      opts.onError?.(err instanceof Error ? err.message : "parse error");
    }
  };
  // Single-shot results use their completion callback; do not deliver the same result twice.
  if (!single) recognizer.recognized = (_s, e) => receive(e.result);
  recognizer.canceled = (_s, e) => {
    if (disposed) return;
    if (single) {
      singleSettled = true;
      settleSingle();
    }
    if (e.reason === SDK.CancellationReason.Error) {
      // Quota/auth/network rejection is terminal. Release the SDK immediately,
      // including when cancellation happens before the hook stores a controller.
      dispose();
      opts.onError?.(e.errorDetails || "canceled");
    }
  };

  // Pronunciation assessment can return an empty phrase for "I don't know".
  // A separate, unscored recognizer hears explicit commands on the same PCM.
  const commandStream = opts.onCommandText ? SDK.AudioInputStream.createPushStream(format) : null;
  const commandConfig = opts.onCommandText
    ? SDK.SpeechConfig.fromAuthorizationToken(opts.token, opts.region)
    : null;
  if (commandConfig) {
    commandConfig.speechRecognitionLanguage = opts.language || "en-US";
    commandConfig.setProperty(SDK.PropertyId.Speech_SegmentationSilenceTimeoutMs, "500");
    commandConfig.setProperty(
      SDK.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs,
      String(opts.initialSilenceMs ?? 60000),
    );
  }
  const commands =
    commandStream && commandConfig
      ? new SDK.SpeechRecognizer(commandConfig, SDK.AudioConfig.fromStreamInput(commandStream))
      : null;
  if (commands) {
    commands.recognizing = (_s, e) => {
      if (e.result?.text) opts.onCommandText?.(e.result.text);
    };
    commands.recognized = (_s, e) => {
      if (e.result.reason === SDK.ResultReason.RecognizedSpeech && e.result.text)
        opts.onCommandText?.(e.result.text);
    };
    commands.canceled = (_s, e) => {
      if (e.reason === SDK.CancellationReason.Error) opts.onError?.("Speech commands unavailable.");
    };
  }
  log("starting recognition…");
  const start = (r: InstanceType<typeof SDK.SpeechRecognizer>) =>
    new Promise<void>((resolve, reject) =>
      r.startContinuousRecognitionAsync(resolve, (err) => reject(new Error(String(err)))),
    );
  try {
    if (single) {
      recognizer.recognizeOnceAsync(
        (result) => {
          receive(result);
          singleSettled = true;
          settleSingle();
        },
        (error) => {
          if (!disposed) opts.onError?.(String(error));
          singleSettled = true;
          settleSingle();
        },
      );
      if (commands) await start(commands);
    } else await Promise.all([start(recognizer), ...(commands ? [start(commands)] : [])]);
  } catch (error) {
    disposed = true;
    try {
      pushStream.close();
      recognizer.close();
      commandStream?.close();
      commands?.close();
    } catch {
      /* release resources */
    }
    throw error;
  }

  // Continuous linear resampler (native rate → 16 kHz) with phase carried across
  // frames so there's no drift over a long read.
  let phase = 0,
    prevLast = 0;
  const pushSamples = (frame: Float32Array, inRate: number) => {
    if (!frame.length || disposed || (single && singleSettled)) return;
    const ratio = inRate / 16000;
    const out: number[] = [];
    let pos = phase;
    while (pos < frame.length) {
      const i = Math.floor(pos),
        frac = pos - i;
      const a = i < 0 ? prevLast : frame[i];
      const b = i + 1 < frame.length ? frame[i + 1] : frame[frame.length - 1];
      out.push(a * (1 - frac) + b * frac);
      pos += ratio;
    }
    phase = pos - frame.length;
    prevLast = frame[frame.length - 1] ?? prevLast;
    const buf = new ArrayBuffer(out.length * 2);
    const view = new DataView(buf);
    for (let i = 0; i < out.length; i++) {
      const s = Math.max(-1, Math.min(1, out[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    try {
      pushStream.write(buf);
      commandStream?.write(buf);
    } catch {
      /* stream closed */
    }
  };

  let stopping: Promise<void> | undefined;
  const stopRecognizer = (r: InstanceType<typeof SDK.SpeechRecognizer>) =>
    new Promise<void>((resolve) => {
      const done = () => {
        try {
          r.close();
        } catch {}
        resolve();
      };
      try {
        r.stopContinuousRecognitionAsync(done, done);
      } catch {
        done();
      }
    });
  return {
    pushSamples,
    stop: () =>
      (stopping ??= (async () => {
        if (disposed) return;
        try {
          pushStream.close();
          commandStream?.close();
        } catch {}
        if (single) {
          let timer: ReturnType<typeof setTimeout> | undefined;
          try {
            await Promise.race([
              singleFinished,
              new Promise<void>((resolve) => {
                timer = setTimeout(resolve, 6000);
              }),
            ]);
          } finally {
            clearTimeout(timer);
            disposed = true;
            try {
              recognizer.close();
            } catch {}
          }
          if (commands) await stopRecognizer(commands);
        } else {
          await Promise.all([
            stopRecognizer(recognizer),
            ...(commands ? [stopRecognizer(commands)] : []),
          ]);
          disposed = true;
        }
      })()),
  };
}
