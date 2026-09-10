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
import { reportFailure } from "@/lib/observability/critical";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PLACEMENT_NARRATION } from "@/app/data/placement-bank/narration";
import { PLACEMENT_BANK } from "@/app/data/placement-bank";
import { createLadder, recordWord, activeList, decodingLevel, needsFoundations, type LadderState, type Band, type PlacedBand } from "@/lib/placement/ladder";
import { gradeRead, gradeWord, passageRate } from "@/lib/placement/read-grade";
import { nextPassageBand, type ComprehensionCheck } from "@/lib/placement/passage-search";
import { PASSAGE_MAX_SECONDS, PASSAGE_READ_SECONDS, PASSAGE_SILENCE_STOP_MS, type BankQuestion } from "@/lib/placement/bank";
import { trackFunnelClient } from "@/lib/analytics/funnel";
import type { Moment, PlacementSubmission } from "@/lib/placement/types";
import type { PassageEvidence, CountEvidence } from "@/lib/placement/decide";
import { usePlacementMic, type MicState } from "./mic";
import { PlacementAudioCancelled, PlacementAudioError, playNarrRequired as playNarr, playUrlRequired as playUrlAsync, playSeqRequired as playSeq, clipUrl, phonemeUrl, childAudioUrl, stopClip, setFastAudio, softTick } from "./audio";
import { type LunaMode } from "@/app/(protected)/luna/_components/LunaOrb";
import PlacementView, { type PlacementScreen as Screen } from "./PlacementView";

/** What a child says to pass on a word (the intro invites "I don't know"). */
const SKIP_PHRASE = /\b(i\s+)?(don'?t|do not)\s+know\b|\bdunno\b|\b(skip|pass|next one)\b/i;
const WORD_TIMEOUT_MS = 6000; // No recognized response means retry, never an incorrect answer.
const WARMUP_WORD = "sun"; // not in any list; never scored

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
  const [begun, setBegun] = useState(robot);
  const [screen, setScreen] = useState<Screen>({ kind: "ready" });
  const replayRef = useRef<(() => Promise<void>) | null>(null);
  const [orb, setOrb] = useState<LunaMode>("idle");
  const [stage, setStage] = useState("greeting");
  const tapRef = useRef<((id: string) => void) | null>(null);
  const skipRef = useRef<(() => void) | null>(null);
  const startedRef = useRef<number>(0);
  const runRef = useRef(false);
  const submissionRef = useRef<PlacementSubmission | null>(null);
  const savingRef = useRef(false);
  const cancelledRef = useRef(false);
  const micRef = useRef(mic);
  micRef.current = mic;

  const waitTap = useCallback(() => new Promise<string>((res) => { tapRef.current = res; }), []);
  const tap = useCallback((id: string) => { const r = tapRef.current; tapRef.current = null; r?.(id); }, []);
  const say = useCallback(async (key: Parameters<typeof playNarr>[0], _caption: string) => {
    const caption = PLACEMENT_NARRATION[key];
    replayRef.current = null;
    setOrb("speaking");
    setScreen({ kind: "luna", caption });
    await playNarr(key);
    setOrb("idle");
  }, []);
  // One consistent "heard you" after every item: the soft tick, no voice. Luna speaks only between lists
  // (a mix of ticks and "very good" read as random to the first parent who tried it).
  const ack = useCallback(async (_i: number) => {
    softTick();
    await new Promise((r) => setTimeout(r, robot ? 0 : 220));
  }, [robot]);

  const recover = useCallback(async <T,>(task: () => Promise<T>): Promise<T> => {
    for (;;) {
      try { return await task(); }
      catch {
        micRef.current.close();
        setOrb("idle");
        setScreen({ kind: "recovery" });
        await waitTap();
        if (cancelledRef.current) throw new Error("Assessment closed.");
        // A failed reopen remains a technical failure, never a scored attempt.
        while (await micRef.current.open() !== "open") {
          setScreen({ kind: "recovery" });
          await waitTap();
          if (cancelledRef.current) throw new Error("Assessment closed.");
        }
      }
    }
  }, [waitTap]);

  const saveSubmission = useCallback(async () => {
    const submission = submissionRef.current;
    if (!submission || savingRef.current) return;
    savingRef.current = true;
    setScreen({ kind: "closing", error: null });
    try {
      const r = await fetch("/api/placement/complete", { method: "POST", signal: AbortSignal.timeout(30000), headers: { "Content-Type": "application/json" }, body: JSON.stringify(submission) });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error ?? "Could not save your results.");
      try { sessionStorage.removeItem(`readee.placement.pending.${childId}`); } catch { /* storage unavailable */ }
      router.push(`/placement/reveal?child=${childId}`);
    } catch (error) {
      reportFailure("placement.save_client", error, { route: "/placement" });
      setScreen({ kind: "closing", error: "Your answers are still here. Please check your connection and try saving again." });
    } finally { savingRef.current = false; }
  }, [childId, router]);

  /** One spoken word: listen with the word as the reference; score only a recognized response or an explicit skip; silence remains unmeasured. */
  const listenWordOnce = useCallback(async (word: string, nonsense = false, band?: number): Promise<boolean> => {
    replayRef.current = null;
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
    const done = new Promise<void>((res, reject) => {
      const finish = (v: boolean) => { if (resolved) return; resolved = true; verdict = v; res(); };
      const fail = () => { if (resolved) return; resolved = true; reject(new Error("Recognition failed.")); };
      skipRef.current = () => finish(false);
      const phrases: import("@/app/(protected)/luna/_components/azure-stream").PAWord[][] = [];
      void micRef.current.listen(word, (p) => {
        // "I don't know" (or a skip word) ends the item now instead of waiting out the hesitation timeout:
        // the reference word comes back as an omission, which never counts as heard.
        if (SKIP_PHRASE.test(p.text)) { finish(false); return; }
        phrases.push(p.words);
        const g = gradeWord(word, phrases);
        if (g.heard) finish(g.correct);
      }, fail).then((l) => {
        let stopping: Promise<void> | undefined;
        const stop = () => stopping ??= l.stop();
        if (resolved) { void stop().catch(() => {}); return; }
        setScreen({ kind: "word", word, listening: true, nonsense, band });
        // Drain the last phrase before deciding that nothing was measured.
        // A bounded drain also recovers when the SDK never acknowledges stop.
        let drainTimer: number | undefined;
        const t = window.setTimeout(() => {
          drainTimer = window.setTimeout(fail, 4000);
          void stop().then(() => { if (!resolved) fail(); }, fail);
        }, WORD_TIMEOUT_MS);
        const cleanup = () => {
          window.clearTimeout(t);
          window.clearTimeout(drainTimer);
          void stop().catch(() => {});
        };
        void done.then(cleanup, cleanup);
      }).catch(fail);
    });
    try {
      await done;
      return verdict;
    } finally {
      skipRef.current = null;
      setOrb("idle");
    }
  }, [robot, waitTap]);

  const listenWord = useCallback((word: string, nonsense = false, band?: number) => recover(() => listenWordOnce(word, nonsense, band)), [recover, listenWordOnce]);

  /** Tap items (letter sounds, blending, comprehension): play the prompt audio, then wait for a tap. */
  const askTiles = useCallback(async (caption: string, tiles: string[], audio: () => Promise<void>): Promise<string> => {
    replayRef.current = async () => { setOrb("speaking"); try { await audio(); } finally { if (!cancelledRef.current) setOrb("idle"); } };
    setScreen({ kind: "tiles", caption, tiles, picked: null });
    setOrb("speaking");
    const answer = waitTap();
    await audio();
    setOrb("idle");
    const picked = await answer;
    replayRef.current = null;
    stopClip();
    setScreen({ kind: "tiles", caption, tiles, picked });
    return picked;
  }, [waitTap]);

  /**
   * One question. `readOptions` (K and 1st-grade passages) reads every choice aloud like i-Ready's K-3 audio
   * support; from 2nd grade up the child reads the choices (each has its own speaker for a re-read on request).
   */
  const askQuestion = useCallback(async (q: BankQuestion, readOptions = true, passage?: { title: string; text: string }): Promise<boolean> => {
    replayRef.current = async () => { setOrb("speaking"); try { await playUrlAsync(clipUrl(`q-${q.id}`)); } finally { if (!cancelledRef.current) setOrb("idle"); } };
    const correctId = robot ? q.correctId : undefined; // robots may see the key; children never do
    const base = { kind: "question" as const, prompt: q.prompt, options: q.options, correctId, speakers: !readOptions, qid: q.id, passage };
    setScreen({ ...base, picked: null, readingIdx: -1 });
    setOrb("speaking");
    // Arm the tap before the question plays: a child (or robot) who answers during the audio is not lost.
    let answered: string | null = null;
    const tapP = waitTap().then((id) => { answered = id; return id; });
    await Promise.race([playUrlAsync(clipUrl(`q-${q.id}`)), tapP]);
    if (readOptions) {
      // Read the options aloud, lighting each; a tap interrupts.
      for (let i = 0; i < q.options.length && answered === null; i++) {
        setScreen({ ...base, picked: null, readingIdx: i });
        await Promise.race([playUrlAsync(clipUrl(`opt-${q.id}-${q.options[i].id}`), 4000), tapP]);
        if (answered === null) await new Promise((r) => setTimeout(r, 250));
      }
    }
    setOrb("idle");
    // Never re-enable the choices once answered (a flash of enabled buttons between two renders).
    if (answered === null) setScreen({ ...base, picked: null, readingIdx: -1 });
    const picked = answered ?? (await tapP);
    replayRef.current = null;
    stopClip();
    setScreen({ ...base, picked, readingIdx: -1 });
    await new Promise((r) => setTimeout(r, 400));
    return picked === q.correctId;
  }, [robot, waitTap]);

  /**
   * The cold read: reference = the whole passage, no help. The one-minute mark is scored silently for rate
   * (DIBELS window); the child reads on to the end (MAP Reading Fluency style), capped at PASSAGE_MAX_SECONDS
   * or a long silence after the window. Accuracy comes from everything read. Returns evidence + the recording.
   */
  const readPassageOnce = useCallback(async (band: Band): Promise<{ ev: PassageEvidence; keptGoing: boolean; blob: Blob | null }> => {
    replayRef.current = null;
    const p = PLACEMENT_BANK.bands[band].passage!;
    await playUrlAsync(clipUrl(`title-${band}`), 5000);
    setScreen({ kind: "passage", title: p.title, text: p.text, reading: false });
    setOrb("listening");
    if (robot) {
      setScreen({ kind: "passage", title: p.title, text: p.text, reading: true });
      const v = await waitTap(); // "<wordsCorrect>/<wordsTotal>"
      const [c, t] = v.split("/").map((n) => Number(n));
      setOrb("idle");
      return { ev: { band, wordsCorrect: c || 0, wordsTotal: t || 0, durationSeconds: 60, minuteWordsCorrect: c || 0, minuteSeconds: 60, prosody: null }, keptGoing: (t || 0) > 0, blob: null };
    }
    const phrases: import("@/app/(protected)/luna/_components/azure-stream").PAWord[][] = [];
    const totalWords = p.text.split(/\s+/).filter(Boolean).length;
    let lastPhraseAt = Date.now();
    let finishedEarly = false;
    let stopNow: (() => void) | null = null;
    let lastAttempted = 0;
    let heardAudio = false;
    let captureError: string | null = null;
    const listener = await micRef.current.listen(p.text, (ph) => {
      phrases.push(ph.words);
      lastPhraseAt = Date.now();
      const g = gradeRead(p.text, phrases);
      lastAttempted = g.wordsAttempted;
      // Within three words of the end counts as finished: the recognizer rarely aligns the very last words,
      // and waiting for them (then for the silence rule) was a long pause after the child had stopped.
      if (g.wordsAttempted >= totalWords - 3) { finishedEarly = true; stopNow?.(); }
    }, (message) => { captureError = message; stopNow?.(); });
    const startedAt = Date.now();
    micRef.current.startRecording();
    setScreen({ kind: "passage", title: p.title, text: p.text, reading: true });
    await new Promise<void>((res) => {
      let settled = false;
      const timers: number[] = [];
      const end = () => { if (settled) return; settled = true; timers.forEach((t) => window.clearTimeout(t)); window.clearInterval(quiet); res(); };
      stopNow = end;
      if (captureError) { res(); return; }
      // Missing speech is a technical retry, not a minute of silent testing.
      timers.push(window.setTimeout(() => {
        if (lastAttempted === 0 && !heardAudio) { captureError = "No reading was captured."; end(); }
      }, 12000));
      // The rate window is scored from word timestamps after recognition drains.
      timers.push(window.setTimeout(end, PASSAGE_MAX_SECONDS * 1000));
      // Silence means the child has stopped: a short one once most of the passage is read, a long one otherwise
      // (never before the rate window unless they are near the end).
      const quiet = window.setInterval(() => {
        heardAudio ||= micRef.current.level > 0.12;
        const nearlyDone = lastAttempted >= totalWords * 0.8;
        const pastWindow = Date.now() - startedAt > PASSAGE_READ_SECONDS * 1000;
        const quietMs = nearlyDone ? 5000 : PASSAGE_SILENCE_STOP_MS;
        if ((pastWindow || nearlyDone) && Date.now() - lastPhraseAt > quietMs) end();
      }, 1000);
    });
    const elapsed = Math.min(PASSAGE_MAX_SECONDS, (Date.now() - startedAt) / 1000);
    if (listener) {
      let drainTimer: ReturnType<typeof setTimeout> | undefined;
      try {
        await Promise.race([listener.stop(), new Promise<never>((_, reject) => {
          drainTimer = setTimeout(() => reject(new Error("Speech recognition did not finish.")), 4000);
        })]);
      } finally { clearTimeout(drainTimer); }
    }
    const blob = micRef.current.stopRecording();
    setOrb("idle");
    if (captureError) throw new Error(captureError);
    const g = gradeRead(p.text, phrases);
    if (g.wordsAttempted === 0) throw new Error("No reading was captured.");
    const minute = passageRate(g, elapsed, finishedEarly);
    await playNarr(finishedEarly ? "passage-done" : "passage-stop", 3000);
    const keptGoing = finishedEarly || Date.now() - lastPhraseAt < 15000;
    return {
      ev: {
        band,
        wordsCorrect: g.wordsCorrect,
        wordsTotal: Math.max(g.wordsAttempted, g.wordsCorrect),
        durationSeconds: Math.max(1, Math.round(elapsed)),
        minuteWordsCorrect: minute.wordsCorrect,
        minuteSeconds: minute.seconds,
        prosody: null,
      },
      keptGoing,
      blob,
    };
  }, [robot, waitTap]);

  const readPassage = useCallback((band: Band) => recover(() => readPassageOnce(band)), [recover, readPassageOnce]);

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
    if (!begun) return;
    // StrictMode mounts twice in dev: the script starts once (runRef) and the
    // first fake cleanup must not cancel it, so cancellation lives in a ref
    // that each (re)mount resets and only a real unmount leaves set.
    cancelledRef.current = false;
    if (runRef.current) return () => { cancelledRef.current = true; };
    runRef.current = true;
    if (!demo) {
      try {
        const saved = JSON.parse(sessionStorage.getItem(`readee.placement.pending.${childId}`) ?? "null");
        if (saved?.submission?.childId === childId && Date.now() - saved.savedAt < 24 * 3600_000) {
          submissionRef.current = saved.submission;
          void saveSubmission();
          return () => { cancelledRef.current = true; stopClip(); };
        }
        sessionStorage.removeItem(`readee.placement.pending.${childId}`);
      } catch { /* a damaged draft never blocks a new assessment */ }
    }
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
      setOrb("speaking");
      await playNarr("mic-check", 4000);
      setOrb("listening");
      let ok = robot ? true : await heard();
      if (!ok) {
        setScreen({ kind: "mic", status, retry: true });
        setOrb("speaking");
        await playNarr("mic-again", 4000);
        setOrb("listening");
        ok = await heard();
      }
      if (!ok) { status = "unavailable"; setScreen({ kind: "blocked", reason: status }); return; }
      await say("mic-heard", "I heard you. Let's begin.");
      startedRef.current = Date.now();

      // 2. Warm-up: one practice word, never scored.
      // The assessment has genuinely begun: mic open, warm-up word next. Fired here
      // (not at the greeting) so a blocked microphone never counts as a start.
      if (!demo) trackFunnelClient("funnel.assessment_start", { child_id: childId, enrolled });
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

      // 4. Establish a comfortable connected-text level, starting at the word-list level.
      const passages: PassageEvidence[] = [];
      const comprehensionChecks: ComprehensionCheck[] = [];
      let recordingPath: string | null = null;
      let comprehension: PlacementSubmission["comprehension"] = null;
      const decodingBand = level.band === null ? 0 : Math.min(5, level.band);
      let readBand = decodingBand as Band;
      while (readBand >= 1) {
        if (cancelled()) return;
        setStage("passage");
        await say("passage-intro", "Now a story. Read it out loud the best you can. If you get stuck, keep going. I will tell you when to stop.");
        const first = await readPassage(readBand);
        passages.push(first.ev);
        if (first.keptGoing) moments.push({ kind: "passage-kept-going", band: readBand });
        if (first.ev.wordsTotal > 0 && first.ev.wordsCorrect / first.ev.wordsTotal >= 0.95) moments.push({ kind: "passage-accurate", band: readBand, accuracy: first.ev.wordsCorrect / first.ev.wordsTotal });

        // 5. Comprehension on the passage the child read at their level.
        setStage("comprehension");
        // Audio support follows the passage the child just read: K/1st passages get every choice read
        // (i-Ready reads items for K-3); from a 2nd-grade passage up the child reads the choices.
        const readChoices = readBand <= 1;
        if (readChoices) await say("comp-intro", "Now three questions about the story. I will read each one to you. Tap your answer.");
        else await say("comp-intro-read", "Now three questions about the story. Read each one and tap your answer. Tap the little speaker if you want me to read one to you.");
        const bankPassage = PLACEMENT_BANK.bands[readBand].passage!;
        const qs = bankPassage.questions;
        let correct = 0;
        // The passage stays on screen for these. It is the child's own read, and
        // the questions seed RL.x.1, which is explicitly about finding the answer
        // IN the text - so taking the text away measured memory instead.
        const lookBack = { title: bankPassage.title, text: bankPassage.text };
        for (const [i, q] of qs.entries()) { if (await askQuestion(q, readChoices, lookBack)) correct++; await ack(i); }
        comprehension = { correct, total: qs.length, band: readBand };
        comprehensionChecks.push(comprehension);
        moments.push({ kind: "comprehension", band: readBand, correct, total: qs.length });
        const next = nextPassageBand(first.ev, comprehension);
        if (next === null) {
          if (first.blob && !demo) recordingPath = await uploadRecording(first.blob, readBand);
          break;
        }
        readBand = next;
      }
      if (readBand === 0) {
        if (!foundations) await runFoundations();
        // K path: the listening story instead of a passage.
        setStage("listening");
        const f = PLACEMENT_BANK.foundations;
        await say("listen-intro", "Now I will read you a story. Listen carefully. Then I will ask you two questions.");
        setScreen({ kind: "luna", caption: "Listen..." });
        setOrb("speaking");
        await playUrlAsync(clipUrl("story-listen"), 60000);
        setStage("comprehension");
        await say("listen-questions", "Here come the questions.");
        let correct = 0;
        for (const [i, q] of f.listening.questions.entries()) { if (await askQuestion(q)) correct++; await ack(i); }
        comprehension = { correct, total: f.listening.questions.length, band: 0 };
        moments.push({ kind: "comprehension", band: 0, correct, total: f.listening.questions.length });
      }

      if (cancelled()) return;
      // 6. Close and save.
      setStage("closing");
      setScreen({ kind: "closing", error: null });
      setOrb("speaking");
      await playNarr("close", 3500);
      micRef.current.close();
      const submission: PlacementSubmission = {
        evidenceVersion: 3, comprehensionChecks,
        childId, sessionId: crypto.randomUUID(), enrolled, ladder, passages, comprehension, foundations, moments,
        durationSeconds: Math.round((Date.now() - startedRef.current) / 1000),
        passageRecordingPath: recordingPath,
      };
      if (demo) { onDemoComplete?.(submission); return; }
      submissionRef.current = submission;
      try { sessionStorage.setItem(`readee.placement.pending.${childId}`, JSON.stringify({ savedAt: Date.now(), submission })); } catch { /* retry still works in memory */ }
      await saveSubmission();
    })().catch((error) => { if (!cancelled()) { micRef.current.close(); setOrb("idle"); setScreen({ kind: "blocked", reason: error instanceof PlacementAudioError ? "audio" : "unavailable" }); } });
    return () => { cancelledRef.current = true; stopClip(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [begun]);

  // ───────────────────────────────────────────────── render
  return (
    <PlacementView
      screen={screen} stage={stage} childName={childName} outfitId={outfitId}
      orb={orb} analyser={mic.analyser} level={mic.level} robot={robot}
      onBegin={() => setBegun(true)} onTap={tap} onSkip={() => skipRef.current?.()}
      onRetry={() => window.location.reload()} onSave={() => { void saveSubmission(); }}
      onReplay={(screen.kind === "tiles" && screen.picked === null) || (screen.kind === "question" && screen.picked === null)
        ? () => { void replayRef.current?.().catch((error) => { if (error instanceof PlacementAudioCancelled || cancelledRef.current) return; micRef.current.close(); setScreen({ kind: "blocked", reason: "audio" }); }); } : undefined}
      onReadOption={(qid, id) => {
        setOrb("speaking");
        setScreen(current => current.kind === "question" && current.qid === qid
          ? { ...current, readingIdx: current.options.findIndex(option => option.id === id) } : current);
        void playUrlAsync(clipUrl(`opt-${qid}-${id}`), 4000).catch((error) => {
          if (error instanceof PlacementAudioCancelled || cancelledRef.current) return;
          micRef.current.close(); setScreen({ kind: "blocked", reason: "audio" });
        }).finally(() => {
          if (cancelledRef.current) return;
          setOrb("idle");
          setScreen(current => current.kind === "question" && current.qid === qid
            ? { ...current, readingIdx: -1 } : current);
        });
      }}
    />
  );
}
