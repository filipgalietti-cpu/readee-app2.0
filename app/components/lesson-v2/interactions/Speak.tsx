"use client";

import { useEffect, useRef, useState } from "react";
import type { SpeakDef } from "@/lib/lesson-engine/types";
import { sfxCorrect, playTryAgain, playPraise, playNiceTry, speak as sayFallback } from "@/lib/lesson-engine/cues";
import { startPronAssessment, type PAPhrase, type StreamController } from "@/app/(protected)/luna/_components/azure-stream";
import { FluentIcon } from "@/app/_components/FluentIcon";
import LunaOrb from "@/app/(protected)/luna/_components/LunaOrb";

// Minimal Web Speech API typing (not in the DOM lib).
interface SRResult { transcript: string }
interface SRInstance {
  lang: string; maxAlternatives: number; interimResults: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<SRResult>> }) => void;
  onerror: () => void; onend: () => void; start: () => void;
}
type SRCtor = new () => SRInstance;
function getSR(): SRCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// Short-lived Azure token, cached module-wide (one mint serves a whole quiz).
// A failed mint (logged-out demo, Azure unconfigured) blocks retries briefly so
// every speak question doesn't re-fetch a known failure.
let tokCache: { token: string; region: string; exp: number } | null = null;
let tokBlockedUntil = 0;
async function speechToken(): Promise<{ token: string; region: string } | null> {
  if (tokCache && tokCache.exp > Date.now() + 30000) return tokCache;
  if (Date.now() < tokBlockedUntil) return null;
  try {
    const r = await fetch("/api/luna/speech-token", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ purpose: "lesson" }) });
    const j = await r.json();
    if (r.ok && j.ok && j.token) {
      tokCache = { token: j.token, region: j.region, exp: Date.now() + 9 * 60 * 1000 };
      return tokCache;
    }
  } catch { /* offline etc. */ }
  tokBlockedUntil = Date.now() + 60000;
  return null;
}

/**
 * `speak` — read the text aloud; scored. AUTO-LISTEN: the mic opens as the
 * question appears and Azure Pronunciation Assessment (the Luna engine) streams
 * live — the child just talks, no tap needed. Word-level accuracy judges an
 * exact read; open-production accept-lists match transcript tokens. Falls back
 * to tap-to-talk browser SpeechRecognition, then to "continue" — never traps.
 */
export default function Speak({
  data,
  onSolved,
  textShownInPrompt = false,
}: {
  data: SpeakDef;
  /** The scene prompt already displays the passage, so do not print it twice. */
  textShownInPrompt?: boolean;
  onSolved: (meta?: { attempts?: number; correct?: boolean }) => void;
}) {
  const [status, setStatus] = useState<"idle" | "listening" | "good" | "retry">("idle");
  const [engine, setEngine] = useState<"azure" | "sr">("sr");
  const [attempts, setAttempts] = useState(0);
  const attemptsRef = useRef(0);
  const doneRef = useRef(false);
  const ctrlRef = useRef<StreamController | null>(null);
  const micRef = useRef<{ ctx: AudioContext; stream: MediaStream } | null>(null);
  // Feeds the Luna orb, so it responds to the child speaking rather than
  // looping an idle animation at them.
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const SR = getSR();
  // TWO DIFFERENT TASKS, and the engine used to guess between them by word
  // count plus the literal substring " my ". That guess was wrong both ways:
  // "She reads and they play." graded as an accept-list, so saying "cats play"
  // passed; and because accept-lists hide their text, 404 of 422 speak scenes
  // showed a child "?" instead of the sentence they were told to read aloud.
  //
  //   read - the whole text must be said, and it IS SHOWN.
  //   any  - `text` is a space-separated accept list ("rain raining"); one entry
  //          is enough, and it stays HIDDEN because it is the answer.
  //
  // `data.mode` wins. Without it, classify from the text's own shape: a
  // capitalised opener, terminal punctuation, or a function word all mean this
  // is a sentence to read, not a list of alternatives.
  const STOP = new Set(["a", "an", "the", "to", "of", "and"]);
  const words = data.text.toLowerCase().split(/\s+/);
  const FUNCTION_WORD =
    /\b(the|a|an|and|is|are|was|were|my|to|of|in|on|it|he|she|they|we|you|has|have)\b/i;
  const trimmed = data.text.trim();
  const looksLikeSentence =
    /^[A-Z]/.test(trimmed) || /[.!?]$/.test(trimmed) || FUNCTION_WORD.test(trimmed);
  const readMode = data.mode ? data.mode === "read" : words.length === 1 || looksLikeSentence;
  const acceptMode = !readMode;
  const targets = acceptMode ? words.filter((w) => !STOP.has(w)) : [data.text.toLowerCase()];

  function stopMic() {
    const ctrl = ctrlRef.current; ctrlRef.current = null;
    if (ctrl) void ctrl.stop();
    const m = micRef.current; micRef.current = null;
    if (m) {
      try { m.stream.getTracks().forEach((t) => t.stop()); } catch { /* ignore */ }
      try { void m.ctx.close(); } catch { /* ignore */ }
    }
  }

  function solveCorrect() {
    if (doneRef.current) return;
    doneRef.current = true;
    stopMic();
    sfxCorrect(); // chime on every correct...
    setStatus("good");
    // ...then the spoken praise; solve when the clip ENDS (never cut off)
    let fired = false;
    const solveOnce = () => {
      if (fired) return;
      fired = true;
      onSolved({ attempts: attemptsRef.current + 1, correct: true });
    };
    window.setTimeout(() => playPraise(solveOnce), 300);
    window.setTimeout(solveOnce, 4500);
  }

  function missAttempt() {
    if (doneRef.current) return;
    const used = attemptsRef.current + 1;
    attemptsRef.current = used;
    setAttempts(used);
    if (used >= 2) {
      // 2-try rule: encourage and move on — never strand an early reader
      doneRef.current = true;
      stopMic();
      playNiceTry();
      setStatus("good");
      window.setTimeout(() => onSolved({ attempts: used, correct: false }), 1200);
    } else {
      playTryAgain();
      setStatus("retry"); // mic stays hot on the Azure path — just try again
    }
  }

  function saidTokensOf(text: string): Set<string> {
    return new Set(text.toLowerCase().split(/[^a-z']+/).filter(Boolean));
  }

  // Azure phrase → verdict. Accept-list: transcript tokens. Exact read: the
  // per-word scores are the truth (Azure's transcript is reference-biased, so a
  // matching transcript alone is NOT proof of a correct read — Luna's lesson).
  function judgePhrase(p: PAPhrase) {
    if (doneRef.current) return;
    if (!p.text.trim()) return; // silence chunk — not an attempt
    if (acceptMode) {
      const tokens = saidTokensOf(p.text);
      if (targets.some((t) => tokens.has(t))) solveCorrect();
      else missAttempt();
      return;
    }
    const refWords = p.words.filter((w) => w.errorType !== "Insertion");
    const ok = refWords.length > 0 && refWords.every((w) => w.errorType === "None" && w.accuracy >= 55);
    if (ok) solveCorrect();
    else missAttempt();
  }

  // AUTO-LISTEN: open the Luna streaming engine as the question mounts. Any
  // failure (no token, no mic, blocked permission, headless robot) silently
  // leaves the tap-to-talk fallback in place.
  useEffect(() => {
    let dead = false;
    (async () => {
      const tok = await speechToken();
      if (!tok || dead) return;
      let ctrl: StreamController;
      try {
        ctrl = await startPronAssessment({
          token: tok.token,
          region: tok.region,
          // Accept mode: the accept list as reference biases recognition toward
          // the answers we take (kind to K speech); judging uses transcript only.
          referenceText: acceptMode ? targets.join(" ") : data.text,
          onPhrase: judgePhrase,
        });
      } catch { return; }
      if (dead) { void ctrl.stop(); return; }
      let mic: { ctx: AudioContext; stream: MediaStream };
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
        const ctx = new AudioContext();
        if (ctx.state === "suspended") { try { await ctx.resume(); } catch { /* ignore */ } }
        const src = ctx.createMediaStreamSource(stream);
        const proc = ctx.createScriptProcessor(4096, 1, 1);
        proc.onaudioprocess = (e) => ctrlRef.current?.pushSamples(new Float32Array(e.inputBuffer.getChannelData(0)), ctx.sampleRate);
        const sink = ctx.createGain(); sink.gain.value = 0;
        src.connect(proc); proc.connect(sink); sink.connect(ctx.destination);
        const an = ctx.createAnalyser(); an.fftSize = 256; src.connect(an);
        setAnalyser(an);
        mic = { ctx, stream };
      } catch { void ctrl.stop(); return; }
      if (dead) {
        void ctrl.stop();
        try { mic.stream.getTracks().forEach((t) => t.stop()); } catch { /* ignore */ }
        try { void mic.ctx.close(); } catch { /* ignore */ }
        return;
      }
      ctrlRef.current = ctrl;
      micRef.current = mic;
      setEngine("azure");
      setStatus("listening");
    })();
    return () => { dead = true; stopMic(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tap-to-talk fallback (browser SpeechRecognition) when Azure isn't live.
  function listen() {
    if (engine === "azure") return; // already auto-listening
    if (!SR) {
      solveCorrect();
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.maxAlternatives = 4;
    rec.interimResults = false;
    setStatus("listening");
    rec.onresult = (e) => {
      const alts = e.results[0];
      let said = "";
      for (let i = 0; i < alts.length; i++) said += " " + alts[i].transcript.toLowerCase();
      const saidTokens = saidTokensOf(said);
      if (acceptMode ? targets.some((t) => saidTokens.has(t)) : targets.some((t) => said.includes(t))) {
        solveCorrect();
      } else {
        missAttempt();
      }
    };
    rec.onerror = () => setStatus("retry");
    rec.onend = () => setStatus((s) => (s === "listening" ? "retry" : s));
    rec.start();
  }

  return (
    <div className="gb-tx">
      <div className="gb-word">
        <div
          className="gb-tile"
          style={{
            width: "auto",
            padding: "0 20px",
            ...(status === "good"
              ? { background: "#ecfdf5", boxShadow: "inset 0 0 0 3px #10b981", color: "#047857" }
              : {}),
          }}
        >
          {/* Show the text only when the prompt is NOT already showing it. A
              read task has to be visible somewhere, but this tile is sized for
              one word and a whole sentence spilled straight out of it. An
              accept-list stays hidden either way: the list is the answer. */}
          {readMode
            ? textShownInPrompt
              ? status === "good"
                ? "YES!"
                : "listening…"
              : data.text.toUpperCase()
            : status === "good"
              ? "YES!"
              : "?"}
        </div>
      </div>
      {data.allowHear && (
        <button className="gb-secondary" onClick={() => sayFallback(data.text)} aria-label="Hear it">
          ► hear it first
        </button>
      )}
      {/* The Luna orb, same component and same size the placement assessment uses.
          Every other place a child speaks to Readee shows it, so a lesson that
          asks for their voice and shows only a grey pill reads as a different,
          less alive product - and gives no feedback that the mic is hearing
          anything. It is driven by the live analyser, so it moves with the
          child's voice rather than looping. */}
      {status !== "good" && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
          <LunaOrb
            mode={status === "listening" ? "listening" : "idle"}
            analyser={analyser}
            size={88}
          />
        </div>
      )}
      {engine === "azure" && status !== "good" ? (
        <div className="gb-piece gb-listening" style={{ width: "auto", padding: "0 22px", display: "inline-flex", alignItems: "center", gap: 8 }}>
          <FluentIcon name="microphone" size={22} /> I&apos;m listening…
        </div>
      ) : (
        status !== "good" && (
          <button
            className="gb-piece"
            style={{ width: "auto", padding: "0 22px" }}
            onClick={listen}
            disabled={status === "listening"}
          >
            {status === "listening" ? (
              "listening…"
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <FluentIcon name="microphone" size={22} /> read it aloud
              </span>
            )}
          </button>
        )
      )}
      {status === "good" && <div className="gb-hint gb-ok">Great reading!</div>}
      {status === "retry" && (
        <div className="gb-coach">
          {targets.length > 1 ? "Give it another try!" : `Give it another try. Say “${data.text.toUpperCase()}”.`}
        </div>
      )}
      {status !== "good" && (
        <button className="gb-secondary" onClick={() => {
            // A broken mic is not a wrong answer and it is certainly not a
            // right one. Omitting `correct` here made every skip count as a
            // correct read, in 73 lessons and half of all challenge scenes.
            doneRef.current = true; stopMic(); onSolved({ attempts: attempts || 1, correct: false });
          }}>
          mic not working? continue →
        </button>
      )}
    </div>
  );
}
