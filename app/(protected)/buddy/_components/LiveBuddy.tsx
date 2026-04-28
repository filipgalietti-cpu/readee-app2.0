"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, AlertCircle, Sparkles, Loader2 } from "lucide-react";
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

const LIVE_WS_BASE =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent";

export default function LiveBuddy({
  passage,
  gradeLevel,
}: {
  passage: string;
  gradeLevel: string;
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
      // 1) Mint a one-shot ephemeral token from our server.
      const tokRes = await fetch("/api/buddy-live/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passage, gradeLevel }),
      });
      const tokJson = await tokRes.json();
      if (!tokJson.ok) throw new Error(tokJson.error ?? "Token failed.");
      const token: string = tokJson.token;
      const model: string = tokJson.model;

      // 2) Open WebSocket directly to Google with the token in the URL.
      const wsUrl = `${LIVE_WS_BASE}?access_token=${encodeURIComponent(token)}`;
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

      // 3) Send the setup message — model + AUDIO output modality.
      console.info("[buddy-live] sending setup with model", model);
      ws.send(
        JSON.stringify({
          setup: {
            model: `models/${model}`,
            generationConfig: { responseModalities: ["AUDIO"] },
          },
        }),
      );

      // If Google doesn't return setupComplete within 12s, surface
      // a real error instead of spinning forever. Most common causes:
      // model not enabled on the project, or the candidate name is
      // wrong. The token route already tries multiple candidates.
      setupTimeoutRef.current = setTimeout(() => {
        if (status !== "listening" && status !== "speaking") {
          setErr(
            `Live mode didn't start (model: ${model}). Try Step-by-step mode below — same buddy, slightly slower.`,
          );
          setStatus("error");
          disconnect();
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

        // If the model is speaking and the kid starts talking again,
        // stop playback locally — the server-side VAD will also issue
        // an interruption signal in serverContent.interrupted.
        if (playerRef.current?.isPlaying()) {
          // crude energy threshold for local interruption
          let max = 0;
          for (let i = 0; i < input.length; i++) {
            const v = Math.abs(input[i]);
            if (v > max) max = v;
          }
          if (max > 0.08) {
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
          setStatus("listening");
          return;
        }
        if (msg.error || msg.serverError) {
          console.warn("[buddy-live] server error", msg.error || msg.serverError);
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

        if (sc.inputTranscription?.text) {
          setTranscripts((prev) => [
            ...prev,
            { role: "child", text: sc.inputTranscription.text as string },
          ]);
        }
        if (sc.outputTranscription?.text) {
          setTranscripts((prev) => [
            ...prev,
            { role: "buddy", text: sc.outputTranscription.text as string },
          ]);
        }

        if (sc.turnComplete) {
          setStatus(playerRef.current?.isPlaying() ? "speaking" : "listening");
        }
      };

      ws.onclose = () => {
        if (status !== "error") setStatus("idle");
      };
      ws.onerror = () => {
        setErr("Connection lost. Tap to try again.");
        setStatus("error");
      };
    } catch (e: any) {
      setErr(e?.message ?? "Couldn't start Live mode.");
      setStatus("error");
      disconnect();
    }
  }

  function handleToggle() {
    if (status === "idle" || status === "error") {
      connect();
    } else {
      disconnect();
      setStatus("idle");
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

      <div className="rounded-xl bg-violet-50 p-3 text-xs text-violet-800">
        <div className="flex items-center gap-1.5 font-bold">
          <Sparkles className="h-3 w-3" />
          Live mode
        </div>
        Real-time voice — under half a second per reply. Tap the mic to
        end the session.
      </div>
    </div>
  );
}
