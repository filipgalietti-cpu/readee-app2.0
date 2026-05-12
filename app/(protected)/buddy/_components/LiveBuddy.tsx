"use client";

import { useEffect, useRef, useState } from "react";
import posthog from "posthog-js";
import { Mic, MicOff, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { trackError } from "@/lib/observability/track";

function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    posthog.capture(event, props);
  } catch {}
}
import {
  LIVE_INPUT_SAMPLE_RATE,
  LIVE_OUTPUT_SAMPLE_RATE,
  StreamingPcmPlayer,
  base64ToInt16,
  downsampleFloat32,
  floatTo16BitPCM,
  int16ToBase64,
} from "@/lib/audio/live-pcm";

/**
 * Real-time Reading Buddy.
 *
 * Server mints a 60s-TTL ephemeral token; browser opens a WebSocket
 * directly to Gemini Live (no Vercel proxy). Mic streams in as 16-kHz
 * PCM, model audio comes back as 24-kHz PCM and plays gaplessly.
 *
 * If the kid talks while Readee is talking, we stop playback and
 * emit an "activity start" so the model interrupts itself.
 */

type Status = "idle" | "connecting" | "listening" | "thinking" | "speaking" | "error";

export default function LiveBuddy({
  passage,
  gradeLevel,
  mode,
  childId,
  onExhausted,
}: {
  passage: string;
  gradeLevel: string;
  /** Activity mode. Steers the system prompt for read-with-me,
   *  word-meaning, story-time, or quick-quiz behavior. */
  mode?: string;
  /** When set, the server enriches the system prompt with the kid's
   *  name + recent practice/fluency context. */
  childId?: string | null;
  /** Called when every Live model candidate has failed setup, so the
   *  parent shell can auto-fall-back to turn-based mode. */
  onExhausted?: () => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [err, setErr] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState(false);
  const [transcripts, setTranscripts] = useState<
    { role: "child" | "buddy"; text: string }[]
  >([]);

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playerRef = useRef<StreamingPcmPlayer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const setupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionStartRef = useRef<number | null>(null);
  const [lastSavedMemory, setLastSavedMemory] = useState<{
    summary: string;
    standardsTouched: string[];
    wordsAsked: string[];
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ok =
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function" &&
      typeof AudioContext !== "undefined" &&
      typeof WebSocket !== "undefined";
    if (!ok) setUnsupported(true);
  }, []);

  useEffect(() => {
    return () => disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Best-effort save buddy memory if the kid closes the tab mid-session.
  // navigator.sendBeacon survives unload and reaches the server. We
  // pass childId, the current transcripts, and approximate session
  // length. Server validates parent_id ownership before persisting.
  useEffect(() => {
    if (!childId) return;
    function flushMemory() {
      const t = transcripts;
      if (t.length < 2) return;
      const start = sessionStartRef.current;
      const sessionMinutes = start
        ? Math.max(1, Math.round((Date.now() - start) / 60000))
        : undefined;
      try {
        const blob = new Blob(
          [JSON.stringify({ childId, transcripts: t, sessionMinutes })],
          { type: "application/json" },
        );
        navigator.sendBeacon("/api/buddy-live/save-memory", blob);
      } catch {
        // sendBeacon can throw on some browsers; failure is silent.
      }
    }
    window.addEventListener("beforeunload", flushMemory);
    window.addEventListener("pagehide", flushMemory);
    return () => {
      window.removeEventListener("beforeunload", flushMemory);
      window.removeEventListener("pagehide", flushMemory);
    };
  }, [childId, transcripts]);

  function disconnect() {
    try {
      if (setupTimeoutRef.current) {
        clearTimeout(setupTimeoutRef.current);
        setupTimeoutRef.current = null;
      }
      processorRef.current?.disconnect();
      sourceNodeRef.current?.disconnect();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      wsRef.current?.close();
      playerRef.current?.stop();
      audioCtxRef.current?.close().catch(() => {});
    } catch {}
    processorRef.current = null;
    sourceNodeRef.current = null;
    streamRef.current = null;
    wsRef.current = null;
    playerRef.current = null;
    audioCtxRef.current = null;
  }

  async function connect() {
    setErr(null);
    setStatus("connecting");
    try {
      // 1) Mint a Live session from our server. The response is fully
      // self-contained: wsUrl + setupModel + systemInstruction.
      const tokRes = await fetch("/api/buddy-live/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passage,
          gradeLevel,
          mode: mode ?? "freeform",
          childId: childId ?? undefined,
        }),
      });
      const tokJson = await tokRes.json();
      if (!tokJson.ok) throw new Error(tokJson.error ?? "Could not mint Live session.");
      const wsUrl: string = tokJson.wsUrl;
      const setupModel: string = tokJson.setupModel;
      const systemInstruction: string = tokJson.systemInstruction ?? "";
      const provider: string = tokJson.provider ?? "vertex";

      // 2) Open WebSocket directly to Google (Vertex or AI Studio
      //    — server tells us which) with the token in the URL.
      const ws = new WebSocket(wsUrl);
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;

      const opened = new Promise<void>((resolve, reject) => {
        const t = setTimeout(() => reject(new Error("Connect timeout.")), 10000);
        ws.onopen = () => {
          clearTimeout(t);
          resolve();
        };
        ws.onerror = (ev) => {
          clearTimeout(t);
          reject(new Error("WebSocket error."));
        };
      });
      await opened;

      // 3) Send the setup message. Vertex uses snake_case + the full
      //    publisher resource path; AI Studio uses camelCase + a short
      //    model id. The server tells us which provider so we send
      //    the right shape.
      console.info("[buddy-live] sending setup", { provider, setupModel });
      // Tune VAD for real classroom/home environments — kitchens,
      // siblings, hum. Default sensitivity treats almost any sound as
      // "kid starting to speak" and interrupts Readee mid-reply.
      const realtimeInputConfig = {
        automatic_activity_detection: {
          start_of_speech_sensitivity: "START_SENSITIVITY_LOW",
          end_of_speech_sensitivity: "END_SENSITIVITY_LOW",
          prefix_padding_ms: 300,
          silence_duration_ms: 1200,
        },
      };
      const setupPayload =
        provider === "vertex"
          ? {
              setup: {
                model: setupModel,
                generation_config: {
                  response_modalities: ["AUDIO"],
                  // Affective dialog — match the kid's emotional tone.
                  // Frustration → gentler. Excitement → matched energy.
                  enable_affective_dialog: true,
                },
                system_instruction: systemInstruction
                  ? { parts: [{ text: systemInstruction }] }
                  : undefined,
                realtime_input_config: realtimeInputConfig,
                input_audio_transcription: {},
                output_audio_transcription: {},
              },
            }
          : {
              setup: {
                model: setupModel,
                generationConfig: { responseModalities: ["AUDIO"] },
                systemInstruction: systemInstruction
                  ? { parts: [{ text: systemInstruction }] }
                  : undefined,
                realtimeInputConfig: {
                  automaticActivityDetection: {
                    startOfSpeechSensitivity: "START_SENSITIVITY_LOW",
                    endOfSpeechSensitivity: "END_SENSITIVITY_LOW",
                    prefixPaddingMs: 300,
                    silenceDurationMs: 1200,
                  },
                },
                inputAudioTranscription: {},
                outputAudioTranscription: {},
              },
            };
      ws.send(JSON.stringify(setupPayload));

      // 12-second setupComplete timeout. If the server doesn't
      // respond by then, surface a clear error and offer Step-by-step
      // fall-back.
      setupTimeoutRef.current = setTimeout(() => {
        console.warn("[buddy-live] setupComplete timeout on", setupModel);
        trackError(new Error("buddy-live setupComplete timeout"), {
          route: "buddy-live.setupComplete",
          tags: { setup_model: setupModel, provider },
          extra: { childId: childId ?? null, mode: mode ?? null },
        });
        disconnect();
        setErr(
          `Live mode didn't start (model: ${setupModel}). Switching to Step-by-step…`,
        );
        setStatus("error");
        if (onExhausted) {
          setTimeout(() => onExhausted(), 2200);
        }
      }, 12000);

      // 4) Set up audio capture — 16 kHz mono PCM out the WS.
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (mediaErr: any) {
        const name = mediaErr?.name ?? "";
        if (name === "NotAllowedError" || name === "SecurityError") {
          throw new Error(
            "Microphone access denied. Click the lock icon in your browser's address bar, allow microphone, then tap the mic again.",
          );
        }
        if (name === "NotFoundError" || name === "OverconstrainedError") {
          throw new Error("No microphone detected. Plug one in or check your audio settings.");
        }
        if (name === "NotReadableError") {
          throw new Error("Your microphone is being used by another app. Close that app and try again.");
        }
        throw new Error(mediaErr?.message ?? "Couldn't open the microphone.");
      }
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      playerRef.current = new StreamingPcmPlayer(audioCtx, LIVE_OUTPUT_SAMPLE_RATE);

      const sourceNode = audioCtx.createMediaStreamSource(stream);
      sourceNodeRef.current = sourceNode;

      // ScriptProcessorNode is deprecated but most reliable across
      // browsers without bundling an AudioWorklet. Buffer 4096 frames.
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (ev) => {
        if (ws.readyState !== WebSocket.OPEN) return;
        const input = ev.inputBuffer.getChannelData(0);
        const downsampled = downsampleFloat32(
          input,
          audioCtx.sampleRate,
          LIVE_INPUT_SAMPLE_RATE,
        );
        const pcm16 = floatTo16BitPCM(downsampled);
        const b64 = int16ToBase64(pcm16);

        // If the model is speaking and the kid clearly starts
        // talking again, stop playback locally. We use a tighter
        // threshold than peak amplitude — noise (kitchen chopping,
        // siblings) hits 0.1+ easily. Voice has sustained energy
        // across the whole 4096-sample buffer, while a chop is a
        // single transient. Sample the RMS of the buffer + require
        // it above 0.05 (sustained voice) AND a peak above 0.25
        // (real speech volume, not ambient).
        if (playerRef.current?.isPlaying()) {
          let sum = 0;
          let max = 0;
          for (let i = 0; i < input.length; i++) {
            const v = Math.abs(input[i]);
            sum += v * v;
            if (v > max) max = v;
          }
          const rms = Math.sqrt(sum / input.length);
          if (rms > 0.05 && max > 0.25) {
            playerRef.current.stop();
            setStatus("listening");
          }
        }

        ws.send(
          JSON.stringify({
            realtimeInput: {
              mediaChunks: [
                {
                  mimeType: `audio/pcm;rate=${LIVE_INPUT_SAMPLE_RATE}`,
                  data: b64,
                },
              ],
            },
          }),
        );
      };

      sourceNode.connect(processor);
      processor.connect(audioCtx.destination);

      // 5) Handle incoming messages.
      ws.onmessage = async (ev) => {
        let msg: any;
        try {
          if (ev.data instanceof ArrayBuffer) {
            msg = JSON.parse(new TextDecoder().decode(new Uint8Array(ev.data)));
          } else if (ev.data instanceof Blob) {
            msg = JSON.parse(await ev.data.text());
          } else {
            msg = JSON.parse(ev.data);
          }
        } catch {
          return;
        }

        if (msg.setupComplete) {
          if (setupTimeoutRef.current) {
            clearTimeout(setupTimeoutRef.current);
            setupTimeoutRef.current = null;
          }
          console.info("[buddy-live] setupComplete received");
          sessionStartRef.current = Date.now();
          track("buddy_session_started", {
            mode,
            childId,
            hasPassage: !!passage,
            provider,
          });
          setStatus("listening");
          return;
        }
        if (msg.error || msg.serverError) {
          console.warn("[buddy-live] server error", msg.error || msg.serverError);
          const upstreamMsg =
            msg.error?.message || msg.serverError?.message || "unknown";
          trackError(new Error(`buddy-live server error: ${upstreamMsg}`), {
            route: "buddy-live.msg.serverError",
            tags: { provider, setup_model: setupModel },
            extra: {
              raw: msg.error || msg.serverError,
              childId: childId ?? null,
            },
          });
          setErr(
            (msg.error?.message || msg.serverError?.message) ??
              "Live mode hit a server error. Try Step-by-step mode below.",
          );
          setStatus("error");
          disconnect();
          return;
        }

        const sc = msg.serverContent;
        if (!sc) return;

        if (sc.interrupted) {
          playerRef.current?.stop();
          setStatus("listening");
        }

        const parts = sc.modelTurn?.parts ?? [];
        for (const p of parts) {
          if (p.inlineData?.data && p.inlineData.mimeType?.includes("audio/pcm")) {
            const pcm = base64ToInt16(p.inlineData.data);
            playerRef.current?.enqueue(pcm);
            setStatus("speaking");
          }
          if (p.text) {
            setTranscripts((prev) => [
              ...prev,
              { role: "buddy", text: p.text as string },
            ]);
          }
        }

        // Vertex streams transcription as small (2-3 word) chunks.
        // Append to the most recent bubble of the same role so the
        // sentence reads as one line; only start a new bubble when
        // the role changes or after turnComplete (handled below).
        const inText: string | undefined =
          sc.inputTranscription?.text ?? sc.input_transcription?.text;
        if (inText) {
          setTranscripts((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "child") {
              return [
                ...prev.slice(0, -1),
                { role: "child", text: last.text + inText },
              ];
            }
            return [...prev, { role: "child", text: inText }];
          });
        }
        const outText: string | undefined =
          sc.outputTranscription?.text ?? sc.output_transcription?.text;
        if (outText) {
          setTranscripts((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "buddy") {
              return [
                ...prev.slice(0, -1),
                { role: "buddy", text: last.text + outText },
              ];
            }
            return [...prev, { role: "buddy", text: outText }];
          });
        }

        if (sc.turnComplete) {
          setStatus(playerRef.current?.isPlaying() ? "speaking" : "listening");
        }
      };

      ws.onclose = (ev) => {
        if (status !== "error") setStatus("idle");
        // Server-initiated close with a non-1000 code — most often
        // means the upstream live model disconnected (quota, region
        // outage, etc). Capture so we see the failure rate; the
        // surface-level UX is the same "Tap to try again" toggle.
        if (ev.code !== 1000 && ev.code !== 1005) {
          trackError(new Error(`buddy-live ws closed code=${ev.code}`), {
            route: "buddy-live.ws.onclose",
            tags: {
              code: String(ev.code),
              provider,
              setup_model: setupModel,
            },
            extra: { reason: ev.reason || null, childId: childId ?? null },
          });
        }
      };
      ws.onerror = () => {
        setErr("Connection lost. Tap to try again.");
        setStatus("error");
        trackError(new Error("buddy-live ws.onerror fired"), {
          route: "buddy-live.ws.onerror",
          tags: { provider, setup_model: setupModel },
          extra: { childId: childId ?? null },
        });
      };
    } catch (e: any) {
      setErr(e?.message ?? "Couldn't start Live mode.");
      setStatus("error");
      // Anything that bubbles to this catch — token-mint failure,
      // initial WS handshake, getUserMedia denial, etc. The friendly
      // message stays on screen; Sentry gets the raw shape.
      trackError(e instanceof Error ? e : new Error(String(e)), {
        route: "buddy-live.connect.catch",
        extra: { childId: childId ?? null, mode: mode ?? null },
      });
      disconnect();
    }
  }

  function handleToggle() {
    if (status === "idle" || status === "error") {
      // Reset transcripts when starting a fresh session.
      setLastSavedMemory(null);
      connect();
    } else {
      // Snapshot transcripts before disconnect resets refs.
      const t = [...transcripts];
      const start = sessionStartRef.current;
      disconnect();
      setStatus("idle");
      // Best-effort save the session memory if we have a child + a
      // real conversation. This is fire-and-forget; failure is silent.
      if (childId && t.length >= 2) {
        const sessionMinutes = start
          ? Math.max(1, Math.round((Date.now() - start) / 60000))
          : undefined;
        track("buddy_session_ended", {
          mode,
          childId,
          sessionMinutes,
          turnCount: t.length,
        });
        void fetch("/api/buddy-live/save-memory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            childId,
            transcripts: t,
            sessionMinutes,
          }),
        })
          .then((r) => r.json())
          .then((j) => {
            if (j?.ok && j?.memory) setLastSavedMemory(j.memory);
          })
          .catch(() => {});
      } else if (start) {
        // No child or short session — still track end for analytics.
        const sessionMinutes = Math.max(
          1,
          Math.round((Date.now() - start) / 60000),
        );
        track("buddy_session_ended", {
          mode,
          childId,
          sessionMinutes,
          turnCount: t.length,
          memorySkipped: true,
        });
      }
    }
  }

  if (unsupported) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Live mode needs a modern browser with microphone + WebSocket
        support (Chrome, Safari, Edge).
      </div>
    );
  }

  const isOn = status === "listening" || status === "speaking" || status === "thinking";

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleToggle}
          disabled={status === "connecting"}
          className={`flex h-24 w-24 items-center justify-center rounded-full shadow-lg transition disabled:opacity-60 ${
            isOn
              ? "bg-emerald-600 text-white animate-pulse"
              : status === "error"
                ? "bg-red-600 text-white"
                : "bg-violet-600 text-white hover:bg-violet-700"
          }`}
        >
          {status === "connecting" ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : isOn ? (
            <MicOff className="h-9 w-9" />
          ) : (
            <Mic className="h-9 w-9" />
          )}
        </button>
        <div className="text-center text-xs font-semibold text-zinc-600">
          {status === "idle" && "Tap to start a live conversation"}
          {status === "connecting" && "Connecting…"}
          {status === "listening" && "Listening — talk to Readee"}
          {status === "speaking" && "Readee is talking…"}
          {status === "thinking" && "Thinking…"}
          {status === "error" && "Tap to try again"}
        </div>
      </div>

      {err && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {err}
        </div>
      )}

      {transcripts.length > 0 && (
        <div className="space-y-1.5">
          {transcripts.slice(-12).map((t, i) => (
            <div
              key={i}
              className={`flex ${t.role === "child" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-xs ${
                  t.role === "child"
                    ? "bg-emerald-100 text-emerald-900"
                    : "bg-violet-100 text-violet-900"
                }`}
              >
                {t.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post-session "what's next" — handoff to Practice / Stories /
          Fluency based on what Readee remembered from the chat. */}
      {status === "idle" && lastSavedMemory && (
        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
            <Sparkles className="h-3 w-3" />
            Memory saved
          </div>
          <p className="mt-1 text-sm text-zinc-800">{lastSavedMemory.summary}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {lastSavedMemory.standardsTouched.length > 0 && childId && (
              <a
                href={`/practice-hub?child=${childId}&standard=${encodeURIComponent(lastSavedMemory.standardsTouched[0])}`}
                className="inline-flex items-center justify-between gap-1 rounded-xl bg-white px-3 py-2 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 hover:ring-emerald-400"
              >
                <span>
                  Practice <span className="font-mono">{lastSavedMemory.standardsTouched[0]}</span>
                </span>
                <span aria-hidden>→</span>
              </a>
            )}
            {childId && (
              <a
                href={`/fluency?child=${childId}`}
                className="inline-flex items-center justify-between gap-1 rounded-xl bg-white px-3 py-2 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 hover:ring-emerald-400"
              >
                <span>Try a fluency check</span>
                <span aria-hidden>→</span>
              </a>
            )}
            {childId && (
              <a
                href={`/stories?child=${childId}`}
                className="inline-flex items-center justify-between gap-1 rounded-xl bg-white px-3 py-2 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 hover:ring-emerald-400"
              >
                <span>Pick a story</span>
                <span aria-hidden>→</span>
              </a>
            )}
            {childId && (
              <a
                href={`/dashboard?child=${childId}`}
                className="inline-flex items-center justify-between gap-1 rounded-xl bg-white px-3 py-2 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 hover:ring-emerald-400"
              >
                <span>Back to dashboard</span>
                <span aria-hidden>→</span>
              </a>
            )}
          </div>
          {lastSavedMemory.wordsAsked.length > 0 && (
            <div className="mt-3 text-[10px] font-semibold text-emerald-700">
              You asked about: {lastSavedMemory.wordsAsked.join(", ")}
            </div>
          )}
        </div>
      )}

      {!lastSavedMemory && (
        <div className="rounded-xl bg-violet-50 p-3 text-xs text-violet-800">
          <div className="flex items-center gap-1.5 font-bold">
            <Sparkles className="h-3 w-3" />
            Live mode
          </div>
          Real-time voice — under half a second per reply. Tap the mic to
          end the session.
        </div>
      )}
    </div>
  );
}
