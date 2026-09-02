"use client";

/**
 * PLACEMENT RUNNER — the exam the child takes, run by Luna in examiner mode.
 *
 * Stages (see docs/briefs/placement-report.md and the plan artifact):
 *   greeting → mic check → warm-up word → [foundations for K/1] → word lists
 *   (the ladder) → [foundations if the lists land at K] → cold passage(s) →
 *   comprehension (or the K listening story) → close → /api/placement/complete
 *   → /placement/reveal.
 *
 * Examiner mode: no help ladder, no echo rescue, no praise tied to right
 * answers, no visible timer, no scores on screen. Neutral acknowledgements
 * between items. Progression never gates on audio `ended` alone.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PLACEMENT_BANK } from "@/app/data/placement-bank";
import { createLadder, recordWord, activeList, decodingLevel, needsFoundations, BAND_LABEL, type LadderState, type Band, type PlacedBand } from "@/lib/placement/ladder";
import { gradeRead, gradeWord } from "@/lib/placement/read-grade";
import { PASSAGE_READ_SECONDS, type BankQuestion } from "@/lib/placement/bank";
import type { Moment, PlacementSubmission } from "@/lib/placement/types";
import type { PassageEvidence, CountEvidence } from "@/lib/placement/decide";
import { usePlacementMic, type MicState } from "./mic";
import { playNarr, playUrlAsync, playSeq, clipUrl, phonemeUrl, childAudioUrl, stopClip, setFastAudio, softTick } from "./audio";
import LunaOrb, { type LunaMode } from "@/app/(protected)/luna/_components/LunaOrb";
import { Bunny, BunnyReaction } from "@/app/_components/Bunny/Bunny";
import { FluentIcon } from "@/app/_components/FluentIcon";

const WORD_TIMEOUT_MS = 6000; // hesitation rule: no read after this = not read (DIBELS uses 3 s; K needs more)
const WARMUP_WORD = "sun"; // not in any list; never scored
const ACKS = ["ack-1", "ack-2", "ack-3", "ack-4"] as const;

type Screen =
  | { kind: "luna"; caption: string }
  | { kind: "mic"; status: MicState; retry: boolean }
  | { kind: "word"; word: string; listening: boolean; nonsense?: boolean; band?: number }
  | { kind: "tiles"; caption: string; tiles: string[]; picked: string | null }
  | { kind: "passage"; title: string; text: string; reading: boolean }
  | { kind: "question"; prompt: string; options: { id: string; label: string }[]; picked: string | null; readingIdx: number; correctId?: string }
  | { kind: "blocked"; reason: MicState }
  | { kind: "closing"; error: string | null };

export default function PlacementRunner({
  childId,
  childName,
  enrolled,
  outfitId,
  robot = false,
  demo = false,
  onDemoComplete,
}: {
  childId: string;
  childName: string;
  enrolled: PlacedBand;
  outfitId: string | null;
  /** QA robots: no microphone; verdict buttons replace listening (server-gated by NEXT_PUBLIC_PLACEMENT_ROBOT). */
  robot?: boolean;
  /** Demo: no account, no saves; the run ends on a summary instead of the reveal. */
  demo?: boolean;
  onDemoComplete?: (submission: PlacementSubmission) => void;
}) {
  const router = useRouter();
  const mic = usePlacementMic();
  const [screen, setScreen] = useState<Screen>({ kind: "luna", caption: "" });
  const [orb, setOrb] = useState<LunaMode>("idle");
  const [stage, setStage] = useState("greeting");
  const tapRef = useRef<((id: string) => void) | null>(null);
  const skipRef = useRef<(() => void) | null>(null);
  const startedRef = useRef<number>(0);
  const runRef = useRef(false);
  const cancelledRef = useRef(false);
  const micRef = useRef(mic);
  micRef.current = mic;

  const waitTap = useCallback(() => new Promise<string>((res) => { tapRef.current = res; }), []);
  const tap = useCallback((id: string) => { const r = tapRef.current; tapRef.current = null; r?.(id); }, []);
  const say = useCallback(async (key: Parameters<typeof playNarr>[0], caption: string) => {
    setOrb("speaking");
    setScreen({ kind: "luna", caption });
    await playNarr(key);
    setOrb("idle");
  }, []);
  // A soft tick says "heard you" after each word; Luna speaks only every fourth word so the acks never feel like a loop.
  const ack = useCallback(async (i: number) => {
    if (i % 4 === 3) await playNarr(ACKS[(i >> 2) % ACKS.length], 2500);
    else { softTick(); await new Promise((r) => setTimeout(r, robot ? 0 : 220)); }
  }, [robot]);

  /** One spoken word: listen with the word as the reference; resolve on a verdict, a tap, or the hesitation timeout. */
  const listenWord = useCallback(async (word: string, nonsense = false, band?: number): Promise<boolean> => {
    setScreen({ kind: "word", word, listening: false, nonsense, band });
    setOrb("listening");
    if (robot) {
      setScreen({ kind: "word", word, listening: true, nonsense, band });
      const v = await waitTap();
      setOrb("idle");
      return v === "correct";
    }
    let resolved = false;
    let verdict = false;
    const done = new Promise<void>((res) => {
      const finish = (v: boolean) => { if (resolved) return; resolved = true; verdict = v; res(); };
      skipRef.current = () => finish(false);
      const phrases: import("@/app/(protected)/luna/_components/azure-stream").PAWord[][] = [];
      void micRef.current.listen(word, (p) => {
        phrases.push(p.words);
        const g = gradeWord(word, phrases);
        if (g.heard) finish(g.correct);
      }).then((l) => {
        if (!l) { finish(false); return; }
        setScreen({ kind: "word", word, listening: true, nonsense, band });
        const t = window.setTimeout(() => finish(false), WORD_TIMEOUT_MS);
        void done.then(() => { window.clearTimeout(t); void l.stop(); });
      });
    });
    await done;
    skipRef.current = null;
    setOrb("idle");
    return verdict;
  }, [robot, waitTap]);

  /** Tap items (letter sounds, blending, comprehension): play the prompt audio, then wait for a tap. */
  const askTiles = useCallback(async (caption: string, tiles: string[], audio: () => Promise<void>): Promise<string> => {
    setScreen({ kind: "tiles", caption, tiles, picked: null });
    setOrb("speaking");
    await audio();
    setOrb("idle");
    const picked = await waitTap();
    setScreen({ kind: "tiles", caption, tiles, picked });
    return picked;
  }, [waitTap]);

  const askQuestion = useCallback(async (q: BankQuestion): Promise<boolean> => {
    const correctId = robot ? q.correctId : undefined; // robots may see the key; children never do
    setScreen({ kind: "question", prompt: q.prompt, options: q.options, picked: null, readingIdx: -1, correctId });
    setOrb("speaking");
    await playUrlAsync(clipUrl(`q-${q.id}`));
    let answered: string | null = null;
    const tapP = waitTap().then((id) => { answered = id; return id; });
    // Read the options aloud, lighting each; a tap interrupts.
    for (let i = 0; i < q.options.length && answered === null; i++) {
      setScreen({ kind: "question", prompt: q.prompt, options: q.options, picked: null, readingIdx: i, correctId });
      await Promise.race([playUrlAsync(clipUrl(`opt-${q.id}-${q.options[i].id}`), 4000), tapP]);
      if (answered === null) await new Promise((r) => setTimeout(r, 250));
    }
    setOrb("idle");
    setScreen({ kind: "question", prompt: q.prompt, options: q.options, picked: null, readingIdx: -1, correctId });
    const picked = answered ?? (await tapP);
    stopClip();
    setScreen({ kind: "question", prompt: q.prompt, options: q.options, picked, readingIdx: -1, correctId });
    await new Promise((r) => setTimeout(r, 400));
    return picked === q.correctId;
  }, [robot, waitTap]);

  /** The cold read: reference = the whole passage, 60 seconds, no help. Returns evidence + the recording. */
  const readPassage = useCallback(async (band: Band): Promise<{ ev: PassageEvidence; keptGoing: boolean; blob: Blob | null }> => {
    const p = PLACEMENT_BANK.bands[band].passage!;
    await playUrlAsync(clipUrl(`title-${band}`), 5000);
    setScreen({ kind: "passage", title: p.title, text: p.text, reading: false });
    setOrb("listening");
    if (robot) {
      setScreen({ kind: "passage", title: p.title, text: p.text, reading: true });
      const v = await waitTap(); // "<wordsCorrect>/<wordsTotal>"
      const [c, t] = v.split("/").map((n) => Number(n));
      setOrb("idle");
      return { ev: { band, wordsCorrect: c || 0, wordsTotal: t || 0, durationSeconds: 60, prosody: null }, keptGoing: (t || 0) > 0, blob: null };
    }
    const phrases: import("@/app/(protected)/luna/_components/azure-stream").PAWord[][] = [];
    const totalWords = p.text.split(/\s+/).filter(Boolean).length;
    let lastPhraseAt = Date.now();
    let finishedEarly = false;
    let stopNow: (() => void) | null = null;
    const listener = await micRef.current.listen(p.text, (ph) => {
      phrases.push(ph.words);
      lastPhraseAt = Date.now();
      const g = gradeRead(p.text, phrases);
      if (g.wordsAttempted >= totalWords) { finishedEarly = true; stopNow?.(); }
    });
    const startedAt = Date.now();
    micRef.current.startRecording();
    setScreen({ kind: "passage", title: p.title, text: p.text, reading: true });
    await new Promise<void>((res) => {
      stopNow = res;
      window.setTimeout(res, PASSAGE_READ_SECONDS * 1000);
    });
    const elapsed = Math.min(PASSAGE_READ_SECONDS, (Date.now() - startedAt) / 1000);
    if (listener) await listener.stop();
    const blob = micRef.current.stopRecording();
    setOrb("idle");
    await playNarr("passage-stop", 3000);
    const g = gradeRead(p.text, phrases);
    const keptGoing = finishedEarly || Date.now() - lastPhraseAt < 15000;
    return {
      ev: { band, wordsCorrect: g.wordsCorrect, wordsTotal: Math.max(g.wordsAttempted, g.wordsCorrect), durationSeconds: Math.max(1, Math.round(elapsed)), prosody: null },
      keptGoing,
      blob,
    };
  }, [robot, waitTap]);

  const uploadRecording = useCallback(async (blob: Blob, band: Band): Promise<string | null> => {
    try {
      const fd = new FormData();
      fd.set("child", childId); fd.set("band", String(band)); fd.set("file", blob, `passage-${band}.wav`);
      const r = await fetch("/api/placement/recording", { method: "POST", body: fd });
      const j = await r.json();
      return r.ok && j.ok ? (j.path as string) : null;
    } catch { return null; }
  }, [childId]);

  // ───────────────────────────────────────────────── the exam script
  useEffect(() => {
    // StrictMode mounts twice in dev: the script starts once (runRef) and the
    // first fake cleanup must not cancel it, so cancellation lives in a ref
    // that each (re)mount resets and only a real unmount leaves set.
    cancelledRef.current = false;
    if (runRef.current) return () => { cancelledRef.current = true; };
    runRef.current = true;
    setFastAudio(robot); // robots do not wait for clips to finish
    const cancelled = () => cancelledRef.current;
    const moments: Moment[] = [];
    (async () => {
      // 0. Greeting: the child's own name if the pack clip exists, else the generic line.
      setStage("greeting");
      setOrb("speaking");
      setScreen({ kind: "luna", caption: `Hi, ${childName}!` });
      const hi = demo ? null : await childAudioUrl(`greetings/${childId}-hi.wav`);
      await playUrlAsync(hi ?? clipUrl("narr-hi-generic"), 4000);
      await say("intro-frame", "Let's read some words together. Some will be easy and some will be tricky, and that's exactly how I learn about you.");

      // 1. Mic check: open the mic, ask for a hello, wait for sound.
      setStage("mic");
      let status: MicState = robot ? "open" : await micRef.current.open();
      if (status !== "open") { setScreen({ kind: "blocked", reason: status }); return; }
      const heard = async (): Promise<boolean> => {
        const until = Date.now() + 8000;
        while (Date.now() < until) {
          if (cancelled()) return false;
          if (micRef.current.level > 0.12) return true;
          await new Promise((r) => setTimeout(r, 100));
        }
        return false;
      };
      setScreen({ kind: "mic", status, retry: false });
      await playNarr("mic-check", 4000);
      let ok = robot ? true : await heard();
      if (!ok) {
        setScreen({ kind: "mic", status, retry: true });
        await playNarr("mic-again", 4000);
        ok = await heard();
      }
      if (!ok) { status = "unavailable"; setScreen({ kind: "blocked", reason: status }); return; }
      await say("mic-heard", "I heard you. Let's begin.");
      startedRef.current = Date.now();

      // 2. Warm-up: one practice word, never scored.
      setStage("warmup");
      await say("warmup-word", "Here is a practice word. Read it out loud when you see it.");
      await listenWord(WARMUP_WORD);
      await say("warmup-done", "That was just practice. Now the real words.");

      let foundations: PlacementSubmission["foundations"] = null;
      const runFoundations = async () => {
        setStage("foundations");
        const f = PLACEMENT_BANK.foundations;
        await say("found-intro", "Now let's play with sounds.");
        await say("letter-sounds-intro", "I will say a sound. Tap the letter that makes that sound.");
        const ls: CountEvidence = { correct: 0, total: f.letterSounds.length };
        for (const [i, it] of f.letterSounds.entries()) {
          const picked = await askTiles("Which letter makes this sound?", it.letters, () => playSeq([clipUrl("narr-letter-sounds-prompt"), phonemeUrl(it.sound)]));
          if (picked === it.correct) ls.correct++;
          await ack(i);
        }
        await say("blending-intro", "Now I will say some sounds. Tap the word they make.");
        const bl: CountEvidence = { correct: 0, total: f.blending.length };
        for (const [i, it] of f.blending.entries()) {
          const picked = await askTiles("Which word do these sounds make?", it.options, () => playSeq([clipUrl("narr-blending-prompt"), ...it.sounds.map(phonemeUrl)], 350));
          if (picked === it.correct) bl.correct++;
          await ack(i);
        }
        await say("nonsense-intro", "These next words are make-believe words. Sound them out the best you can.");
        const nw: CountEvidence = { correct: 0, total: f.nonsenseWords.length };
        for (const [i, w] of f.nonsenseWords.entries()) {
          if (await listenWord(w, true)) nw.correct++;
          await ack(i);
        }
        foundations = { letterSounds: ls, blending: bl, nonsenseWords: nw };
        moments.push({ kind: "foundation", skill: "letterSounds", correct: ls.correct, total: ls.total });
        moments.push({ kind: "foundation", skill: "blending", correct: bl.correct, total: bl.total });
        moments.push({ kind: "foundation", skill: "nonsenseWords", correct: nw.correct, total: nw.total });
      };
      if (enrolled <= 1) await runFoundations();

      // 3. Word lists: the ladder.
      setStage("words");
      await say("words-intro", "Read each word out loud when it appears. If you do not know a word, say I don't know, and we will go to the next one.");
      let ladder: LadderState = createLadder(enrolled);
      let lastBand: Band | null = null;
      let itemCount = 0;
      while (!ladder.done) {
        if (cancelled()) return;
        const list = activeList(ladder);
        if (!list) break;
        if (lastBand !== null && list.band !== lastBand) {
          await say(list.band > lastBand ? "words-next-list" : "words-easier", list.band > lastBand ? "Here comes the next set of words." : "Let's try some different words.");
        }
        lastBand = list.band;
        const word = PLACEMENT_BANK.bands[list.band].words[list.attempts.length]?.word ?? "";
        const correct = await listenWord(word, false, list.band);
        ladder = recordWord(ladder, word, correct);
        await ack(itemCount++);
        const completed = ladder.lists.find((l) => l.band === list.band && l.complete);
        if (completed && completed.attempts.length === list.attempts.length + 1) {
          if (completed.passed) {
            moments.push({ kind: "list-passed", band: completed.band, misses: completed.missed });
            if (completed.missed === 0 && completed.band < enrolled) moments.push({ kind: "list-easy", band: completed.band });
          } else {
            moments.push({ kind: "list-hard", band: completed.band, words: completed.attempts.filter((a) => !a.correct).map((a) => a.word) });
          }
        }
      }
      await say("words-done", "That's all the words. Nice work.");
      const level = decodingLevel(ladder);
      if (enrolled > 1 && needsFoundations(ladder)) await runFoundations();

      // 4. Passage(s): decoding band first; the enrolled-grade passage too when it is one band up.
      const passages: PassageEvidence[] = [];
      let recordingPath: string | null = null;
      let comprehension: PlacementSubmission["comprehension"] = null;
      const decodingBand = level.band === null ? 0 : Math.min(5, level.band);
      const readBand = decodingBand as Band;
      if (readBand >= 1) {
        setStage("passage");
        await say("passage-intro", "Now a story. Read it out loud the best you can. If you get stuck, keep going. I will tell you when to stop.");
        const first = await readPassage(readBand);
        passages.push(first.ev);
        if (first.keptGoing) moments.push({ kind: "passage-kept-going", band: readBand });
        if (first.ev.wordsTotal > 0 && first.ev.wordsCorrect / first.ev.wordsTotal >= 0.95) moments.push({ kind: "passage-accurate", band: readBand, accuracy: first.ev.wordsCorrect / first.ev.wordsTotal });
        let recBlob = first.blob; let recBand: Band = readBand;
        const gap = enrolled - readBand;
        if (gap === 1 && enrolled >= 1) {
          await say("passage-second", "One more story. This one is a little harder. Just do your best.");
          const second = await readPassage(enrolled as Band);
          passages.push(second.ev);
          if (second.keptGoing) moments.push({ kind: "passage-kept-going", band: enrolled as Band });
          recBlob = second.blob ?? recBlob; recBand = enrolled as Band;
        }
        if (recBlob && !demo) recordingPath = await uploadRecording(recBlob, recBand);

        // 5. Comprehension on the passage the child read at their level.
        setStage("comprehension");
        await say("comp-intro", "Now three questions about the story. I will read each one to you. Tap your answer.");
        const qs = PLACEMENT_BANK.bands[readBand].passage!.questions;
        let correct = 0;
        for (const [i, q] of qs.entries()) { if (await askQuestion(q)) correct++; await ack(i); }
        comprehension = { correct, total: qs.length, band: readBand };
        moments.push({ kind: "comprehension", band: readBand, correct, total: qs.length });
      } else {
        // K path: the listening story instead of a passage.
        setStage("listening");
        const f = PLACEMENT_BANK.foundations;
        await say("listen-intro", "Now I will read you a story. Listen carefully. Then I will ask you two questions.");
        setScreen({ kind: "luna", caption: "Listen..." });
        setOrb("speaking");
        await playUrlAsync(clipUrl("story-listen"), 60000);
        await say("listen-questions", "Here come the questions.");
        let correct = 0;
        for (const [i, q] of f.listening.questions.entries()) { if (await askQuestion(q)) correct++; await ack(i); }
        comprehension = { correct, total: f.listening.questions.length, band: 0 };
        moments.push({ kind: "comprehension", band: 0, correct, total: f.listening.questions.length });
      }

      // 6. Close and save.
      setStage("closing");
      setScreen({ kind: "closing", error: null });
      setOrb("speaking");
      await playNarr("close", 3500);
      micRef.current.close();
      const submission: PlacementSubmission = {
        childId, enrolled, ladder, passages, comprehension, foundations, moments,
        durationSeconds: Math.round((Date.now() - startedRef.current) / 1000),
        passageRecordingPath: recordingPath,
      };
      if (demo) { onDemoComplete?.(submission); return; }
      try {
        const r = await fetch("/api/placement/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(submission) });
        const j = await r.json();
        if (!r.ok || !j.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
        router.push(`/placement/reveal?child=${childId}`);
      } catch (e) {
        setScreen({ kind: "closing", error: String((e as Error)?.message ?? e) });
      }
    })();
    return () => { cancelledRef.current = true; stopClip(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ───────────────────────────────────────────────── render
  return (
    <main className="h-dvh overflow-hidden bg-violet-50/40 text-violet-950" data-placement-stage={stage}>
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col px-5 py-4 md:px-10 md:py-6">
        {/* Header: the child's own bunny (their equipped outfit) with their name on the left, Luna on the right. */}
        <header className="flex w-full shrink-0 items-center justify-between" data-runner-header>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-20 w-20 md:h-28 md:w-28" data-bunny>
              {stage === "greeting" ? (
                <BunnyReaction outfitId={outfitId ?? "bunny_classic"} state="wave" />
              ) : (
                <Bunny outfitId={outfitId ?? "bunny_classic"} />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-violet-900 md:text-lg" data-child-name>{childName}</p>
              <p className="text-xs text-violet-500 md:text-sm">{BAND_LABEL[enrolled]} grade placement</p>
            </div>
          </div>
          <LunaOrb mode={orb} analyser={mic.analyser} size={88} />
        </header>

        <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-6 py-4 md:gap-8">
          {screen.kind === "luna" && (
            <p className="max-w-2xl text-center text-2xl font-semibold leading-relaxed md:text-4xl md:leading-snug" data-caption>{screen.caption}</p>
          )}

          {screen.kind === "mic" && (
            <div className="flex flex-col items-center gap-6" data-mic-check>
              <p className="text-center text-2xl font-semibold">{screen.retry ? "Let's try once more. Say hello!" : "Say hello to me!"}</p>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-[0_10px_40px_-12px_rgba(49,46,129,0.18)]">
                <FluentIcon name="microphone" size={44} />
              </div>
              <div className="h-2 w-48 overflow-hidden rounded-full bg-violet-100">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-500 transition-[width] duration-150" style={{ width: `${Math.round(mic.level * 100)}%` }} />
              </div>
            </div>
          )}

          {screen.kind === "word" && (
            <div className="flex flex-col items-center gap-6" data-word={screen.word} data-band={screen.band ?? ""}>
              <div className="rounded-3xl bg-white px-12 py-8 text-6xl font-semibold tracking-wide text-violet-900 shadow-[0_10px_40px_-12px_rgba(49,46,129,0.18)] md:px-20 md:py-12 md:text-8xl">
                {screen.word}
              </div>
              <div className={`flex items-center gap-2 text-sm ${screen.listening ? "text-violet-700" : "text-violet-400"}`}>
                <FluentIcon name="microphone" size={18} /> {screen.listening ? "I'm listening" : "One moment"}
              </div>
              <button
                type="button"
                className="min-h-14 rounded-2xl border border-violet-200 bg-white px-8 py-3 text-lg font-semibold text-violet-800 shadow-[0_4px_14px_-4px_rgba(49,46,129,0.20)] transition active:scale-[0.97] md:text-xl"
                onClick={() => skipRef.current?.()}
                data-skip-word
              >
                I don&apos;t know
              </button>
              {robot && screen.listening && (
                <div className="flex gap-3" data-robot-controls>
                  <button type="button" data-robot="correct" className="rounded-xl bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800" onClick={() => tap("correct")}>read it</button>
                  <button type="button" data-robot="wrong" className="rounded-xl bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800" onClick={() => tap("wrong")}>missed it</button>
                </div>
              )}
            </div>
          )}

          {screen.kind === "tiles" && (
            <div className="flex w-full flex-col items-center gap-6">
              <p className="text-center text-xl font-semibold md:text-3xl">{screen.caption}</p>
              <div className={`grid w-full max-w-3xl gap-4 md:gap-6 ${screen.tiles.length > 3 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
                {screen.tiles.map((t) => (
                  <button
                    key={t}
                    type="button"
                    data-tile={t}
                    disabled={screen.picked !== null}
                    onClick={() => tap(t)}
                    className={`rounded-2xl bg-white py-8 text-4xl font-semibold text-violet-900 shadow-[0_4px_14px_-4px_rgba(49,46,129,0.20)] transition active:scale-[0.96] md:py-12 md:text-6xl ${screen.picked === t ? "bg-violet-100 shadow-[0_0_0_3px_rgba(139,92,246,0.35)]" : "hover:-translate-y-0.5"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {screen.kind === "passage" && (
            <article className="flex min-h-0 w-full max-w-3xl flex-col overflow-y-auto rounded-3xl bg-white p-6 shadow-[0_10px_40px_-12px_rgba(49,46,129,0.18)] md:p-10" data-passage-reading={screen.reading ? "1" : "0"}>
              <h1 className="mb-3 text-2xl font-semibold text-violet-900 md:text-3xl">{screen.title}</h1>
              <p className="whitespace-pre-line text-[20px] leading-[1.8] text-violet-950 md:text-[24px]">{screen.text}</p>
              <div className={`mt-6 flex items-center gap-2 text-sm ${screen.reading ? "text-violet-700" : "text-violet-400"}`}>
                <FluentIcon name="microphone" size={18} /> {screen.reading ? "Read it out loud" : "Get ready"}
              </div>
              {robot && screen.reading && (
                <form
                  className="mt-4 flex items-center gap-2 text-sm"
                  data-robot-passage
                  onSubmit={(e) => { e.preventDefault(); const f = e.currentTarget; tap(`${(f.elements.namedItem("c") as HTMLInputElement).value}/${(f.elements.namedItem("t") as HTMLInputElement).value}`); }}
                >
                  <input name="c" defaultValue="60" className="w-16 rounded-lg border border-violet-200 px-2 py-1" aria-label="words correct" />
                  <span>of</span>
                  <input name="t" defaultValue="70" className="w-16 rounded-lg border border-violet-200 px-2 py-1" aria-label="words attempted" />
                  <button type="submit" data-robot="passage" className="rounded-xl bg-violet-100 px-3 py-1 font-semibold text-violet-800">done</button>
                </form>
              )}
            </article>
          )}

          {screen.kind === "question" && (
            <div className="flex w-full max-w-3xl flex-col items-center gap-6" data-question>
              <p className="text-center text-2xl font-semibold leading-snug md:text-3xl">{screen.prompt}</p>
              <div className="grid w-full gap-3 md:gap-4">
                {screen.options.map((o, i) => (
                  <button
                    key={o.id}
                    type="button"
                    data-option-id={o.id}
                    data-correct={screen.correctId === o.id ? "1" : undefined}
                    disabled={screen.picked !== null}
                    onClick={() => tap(o.id)}
                    className={`rounded-2xl bg-white px-6 py-5 text-left text-xl font-semibold text-violet-900 shadow-[0_4px_14px_-4px_rgba(49,46,129,0.20)] transition active:scale-[0.98] ${screen.readingIdx === i ? "shadow-[0_0_0_3px_rgba(139,92,246,0.15)]" : ""} ${screen.picked === o.id ? "bg-violet-100 shadow-[0_0_0_3px_rgba(139,92,246,0.35)]" : ""}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {screen.kind === "blocked" && (
            <div className="flex max-w-md flex-col items-center gap-4 text-center" data-blocked={screen.reason}>
              <p className="text-2xl font-semibold">Luna can&apos;t hear yet.</p>
              <p className="text-violet-700">
                {screen.reason === "denied"
                  ? "The microphone is blocked for this site. Allow it in the browser's address bar, then try again."
                  : "Check that a microphone is connected and nothing else is using it, then try again."}
              </p>
              <button type="button" className="rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 px-6 py-3 font-semibold text-white shadow-[0_8px_24px_-8px_rgba(139,92,246,0.45)]" onClick={() => window.location.reload()}>
                Try again
              </button>
              <a href="/dashboard" className="text-sm text-violet-500 underline underline-offset-4">Skip the placement for now</a>
            </div>
          )}

          {screen.kind === "closing" && (
            <div className="flex flex-col items-center gap-4 text-center" data-closing>
              <p className="text-2xl font-semibold">That&apos;s everything. You did it.</p>
              {screen.error ? (
                <>
                  <p className="text-violet-700">Something went wrong saving the results ({screen.error}).</p>
                  <button type="button" className="rounded-2xl bg-white px-5 py-3 font-semibold text-violet-800 shadow-[0_4px_14px_-4px_rgba(49,46,129,0.20)]" onClick={() => window.location.reload()}>Try again</button>
                </>
              ) : (
                <p className="text-violet-500">One moment...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
