"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Mic, MicOff, Loader2, AlertCircle, Sparkles } from "lucide-react";

type Turn = { role: "child" | "buddy"; text: string };

export default function BuddyChat() {
  const [passage, setPassage] = useState(
    "The little fox stepped quietly through the fall leaves. She was looking for her best friend, the rabbit, who liked to hide in the soft yellow grass.",
  );
  const [history, setHistory] = useState<Turn[]>([]);
  const [recording, setRecording] = useState(false);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState(false);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ok =
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function" &&
      typeof MediaRecorder !== "undefined";
    if (!ok) setUnsupported(true);
  }, []);

  async function start() {
    setErr(null);
    if (unsupported) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { noiseSuppression: true, echoCancellation: true },
      });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        if (blob.size < 500) {
          setErr("Didn't catch that. Try again.");
          return;
        }
        await sendTurn(blob);
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch (e: any) {
      setErr(e?.message ?? "Microphone permission denied.");
    }
  }

  function stop() {
    setRecording(false);
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
    }
  }

  async function sendTurn(blob: Blob) {
    setPending(true);
    try {
      const form = new FormData();
      form.append("audio", blob, "turn.webm");
      form.append("passage", passage);
      form.append("history", JSON.stringify(history));
      const res = await fetch("/api/buddy-turn", { method: "POST", body: form });
      const json = await res.json();
      if (!json.ok) {
        setErr(json.error ?? "Buddy didn't respond.");
        return;
      }
      const t = json.turn as {
        childTranscript: string;
        reply: string;
        audioUrl: string | null;
        endSession: boolean;
      };
      const next: Turn[] = [
        ...history,
        { role: "child", text: t.childTranscript || "(unclear)" },
        { role: "buddy", text: t.reply },
      ];
      setHistory(next);
      if (t.audioUrl) {
        const audio = new Audio(t.audioUrl);
        audio.play().catch(() => {});
      }
    } catch (e: any) {
      setErr(e?.message ?? "Buddy turn failed.");
    } finally {
      setPending(false);
    }
  }

  if (unsupported) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center">
        <Image
          src="/images/ui/bunny-sleepy.png"
          alt=""
          width={80}
          height={80}
          className="mx-auto h-20 w-20 object-contain"
        />
        <div className="mt-3 font-bold text-amber-900">
          Readee can&apos;t hear you on this browser.
        </div>
        <p className="mx-auto mt-2 max-w-sm text-sm text-amber-800">
          The reading buddy needs microphone access — try Chrome, Safari,
          or Edge on a phone or tablet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Passage you&apos;re reading
        </label>
        <textarea
          rows={4}
          value={passage}
          onChange={(e) => setPassage(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm leading-relaxed focus:border-violet-500 focus:outline-none"
        />
      </div>

      {history.length === 0 && !pending ? (
        <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-pink-50 p-5 text-center">
          <Image
            src="/images/ui/bunny-welcome.png"
            alt=""
            width={88}
            height={88}
            className="mx-auto h-20 w-20 object-contain"
          />
          <div className="mt-2 text-sm font-bold text-zinc-900">
            Readee is ready to listen.
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Tap the mic below, read the passage, or ask Readee anything about
            it. Try &ldquo;What does &lsquo;quietly&rsquo; mean?&rdquo;
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((t, i) => (
            <div
              key={i}
              className={`flex ${t.role === "child" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  t.role === "child"
                    ? "bg-emerald-100 text-emerald-900"
                    : "bg-violet-100 text-violet-900"
                }`}
              >
                {t.text}
              </div>
            </div>
          ))}
          {pending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-violet-100 px-3 py-2 text-sm text-violet-900">
                <Loader2 className="h-3 w-3 animate-spin" />
                Thinking…
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={recording ? stop : start}
          disabled={pending}
          className={`flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition disabled:opacity-60 ${
            recording
              ? "bg-red-600 text-white animate-pulse"
              : "bg-violet-600 text-white hover:bg-violet-700"
          }`}
          aria-label={recording ? "Stop and send" : "Start talking"}
        >
          {recording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
        </button>
      </div>
      <div className="text-center text-xs text-zinc-500">
        {recording ? "Listening… tap to send" : "Tap to talk to Readee"}
      </div>

      {err && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {err}
        </div>
      )}

      <div className="rounded-xl bg-violet-50 p-3 text-xs text-violet-800">
        <div className="flex items-center gap-1.5 font-bold">
          <Sparkles className="h-3 w-3" />
          Tip
        </div>
        Try: &ldquo;What does &lsquo;quietly&rsquo; mean?&rdquo; or
        &ldquo;Help me read this part.&rdquo;
      </div>
    </div>
  );
}
