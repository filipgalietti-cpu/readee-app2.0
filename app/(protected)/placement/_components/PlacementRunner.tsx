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
import { type LadderState, type Band, type PlacedBand } from "@/lib/placement/ladder";
import {
  wordSearch,
  readingSearch,
  languageSearch,
  ORAL_BLENDS,
  type SpectrumEvidence,
} from "@/lib/placement/spectrum";
import { type SpectrumPassage } from "@/app/data/placement-spectrum/reading";
import { spectrumClip } from "@/app/data/placement-spectrum/audio";
import { gradeRead, gradeWord, passageRate } from "@/lib/placement/read-grade";
import {
  PASSAGE_MAX_SECONDS,
  PASSAGE_READ_SECONDS,
  PASSAGE_SILENCE_STOP_MS,
  type BankQuestion,
} from "@/lib/placement/bank";
import { trackFunnelClient } from "@/lib/analytics/funnel";
import type { Moment, PlacementSubmission } from "@/lib/placement/types";
import type { PassageEvidence } from "@/lib/placement/decide";
import { usePlacementMic, type MicState } from "./mic";
import {
  PlacementAudioCancelled,
  PlacementAudioError,
  playNarrRequired as playNarr,
  playUrlRequired as playUrlAsync,
  playSeqRequired as playSeq,
  clipUrl,
  phonemeUrl,
  childAudioUrl,
  stopClip,
  setFastAudio,
  softTick,
} from "./audio";
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
  const manualQuestionAudio = useRef(false);
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

  const waitTap = useCallback(
    () =>
      new Promise<string>((res) => {
        tapRef.current = res;
      }),
    [],
  );
  const tap = useCallback((id: string) => {
    const r = tapRef.current;
    tapRef.current = null;
    r?.(id);
  }, []);
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
  const ack = useCallback(
    async (_i: number) => {
      softTick();
      await new Promise((r) => setTimeout(r, robot ? 0 : 220));
    },
    [robot],
  );

  const recover = useCallback(
    async <T,>(task: () => Promise<T>): Promise<T> => {
      for (;;) {
        try {
          return await task();
        } catch {
          micRef.current.close();
          setOrb("idle");
          setScreen({ kind: "recovery" });
          await waitTap();
          if (cancelledRef.current) throw new Error("Assessment closed.");
          // A failed reopen remains a technical failure, never a scored attempt.
          while ((await micRef.current.open()) !== "open") {
            setScreen({ kind: "recovery" });
            await waitTap();
            if (cancelledRef.current) throw new Error("Assessment closed.");
          }
        }
      }
    },
    [waitTap],
  );

  const saveSubmission = useCallback(async () => {
    const submission = submissionRef.current;
    if (!submission || savingRef.current) return;
    savingRef.current = true;
    setScreen({ kind: "closing", error: null });
    try {
      const r = await fetch("/api/placement/complete", {
        method: "POST",
        signal: AbortSignal.timeout(30000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error ?? "Could not save your results.");
      try {
        sessionStorage.removeItem(`readee.placement.pending.${childId}`);
      } catch {
        /* storage unavailable */
      }
      router.push(`/placement/reveal?child=${childId}`);
    } catch (error) {
      reportFailure("placement.save_client", error, { route: "/placement" });
      setScreen({
        kind: "closing",
        error: "Your answers are still here. Please check your connection and try saving again.",
      });
    } finally {
      savingRef.current = false;
    }
  }, [childId, router]);

  /** One spoken word: listen with the word as the reference; score only a recognized response or an explicit skip; silence remains unmeasured. */
  const listenWordOnce = useCallback(
    async (word: string, nonsense = false, band?: number, displayWord = word): Promise<boolean> => {
      replayRef.current = null;
      setScreen({
        kind: "word",
        word: displayWord,
        oral: displayWord !== word,
        listening: false,
        nonsense,
        band,
      });
      setOrb("listening");
      if (robot) {
        setScreen({
          kind: "word",
          word: displayWord,
          oral: displayWord !== word,
          listening: true,
          nonsense,
          band,
        });
        const v = await waitTap();
        setOrb("idle");
        return v === "correct";
      }
      let resolved = false;
      let verdict = false;
      const done = new Promise<void>((res, reject) => {
        const finish = (v: boolean) => {
          if (resolved) return;
          resolved = true;
          verdict = v;
          res();
        };
        const fail = () => {
          if (resolved) return;
          resolved = true;
          reject(new Error("Recognition failed."));
        };
        skipRef.current = () => finish(false);
        const phrases: import("@/app/(protected)/luna/_components/azure-stream").PAWord[][] = [];
        void micRef.current
          .listen(
            word,
            (p) => {
              // "I don't know" (or a skip word) ends the item now instead of waiting out the hesitation timeout:
              // the reference word comes back as an omission, which never counts as heard.
              if (SKIP_PHRASE.test(p.text)) {
                finish(false);
                return;
              }
              phrases.push(p.words);
              const g = gradeWord(word, phrases);
              if (g.heard) finish(g.correct);
            },
            fail,
          )
          .then((l) => {
            let stopping: Promise<void> | undefined;
            const stop = () => (stopping ??= l.stop());
            if (resolved) {
              void stop().catch(() => {});
              return;
            }
            setScreen({
              kind: "word",
              word: displayWord,
              oral: displayWord !== word,
              listening: true,
              nonsense,
              band,
            });
            // Drain the last phrase before deciding that nothing was measured.
            // A bounded drain also recovers when the SDK never acknowledges stop.
            let drainTimer: number | undefined;
            const t = window.setTimeout(() => {
              drainTimer = window.setTimeout(fail, 4000);
              void stop().then(() => {
                if (!resolved) fail();
              }, fail);
            }, WORD_TIMEOUT_MS);
            const cleanup = () => {
              window.clearTimeout(t);
              window.clearTimeout(drainTimer);
              void stop().catch(() => {});
            };
            void done.then(cleanup, cleanup);
          })
          .catch(fail);
      });
      try {
        await done;
        return verdict;
      } finally {
        skipRef.current = null;
        setOrb("idle");
      }
    },
    [robot, waitTap],
  );

  const listenWord = useCallback(
    (word: string, nonsense = false, band?: number) =>
      recover(() => listenWordOnce(word, nonsense, band)),
    [recover, listenWordOnce],
  );

  /** Tap items (letter sounds, blending, comprehension): play the prompt audio, then wait for a tap. */
  const askTiles = useCallback(
    async (caption: string, tiles: string[], audio: () => Promise<void>): Promise<string> => {
      replayRef.current = async () => {
        setOrb("speaking");
        try {
          await audio();
        } finally {
          if (!cancelledRef.current) setOrb("idle");
        }
      };
      setScreen({ kind: "tiles", caption, tiles, picked: null });
      setOrb("speaking");
      const answer = waitTap();
      try {
        await audio();
      } catch (error) {
        if (!(error instanceof PlacementAudioCancelled)) throw error;
      }
      setOrb("idle");
      const picked = await answer;
      replayRef.current = null;
      stopClip();
      setScreen({ kind: "tiles", caption, tiles, picked });
      return picked;
    },
    [waitTap],
  );

  /**
   * One question. `readOptions` (K and 1st-grade passages) reads every choice aloud like i-Ready's K-3 audio
   * support; from 2nd grade up the child reads the choices (each has its own speaker for a re-read on request).
   */
  const askQuestion = useCallback(
    async (
      q: BankQuestion & { audio?: string; promptAudio?: string },
      readOptions = true,
      passage?: { title: string; text: string },
    ): Promise<string> => {
      manualQuestionAudio.current = false;
      const tolerateInterruption = (error: unknown) => {
        if (!(error instanceof PlacementAudioCancelled)) throw error;
      };
      const promptAudio =
        q.audio ?? (q.id.startsWith("sp-") ? spectrumClip(`q-${q.id}`) : clipUrl(`q-${q.id}`));
      const playPrompt = () =>
        q.promptAudio
          ? playSeq([promptAudio, q.promptAudio], 250)
          : playUrlAsync(promptAudio, 8000);
      const optionAudio = (id: string) =>
        q.id.startsWith("sp-") ? spectrumClip(`opt-${q.id}-${id}`) : clipUrl(`opt-${q.id}-${id}`);
      replayRef.current = async () => {
        manualQuestionAudio.current = true;
        setOrb("speaking");
        try {
          await playPrompt();
        } finally {
          if (!cancelledRef.current) setOrb("idle");
        }
      };
      const correctId = robot ? q.correctId : undefined; // robots may see the key; children never do
      const base = {
        kind: "question" as const,
        prompt: q.prompt,
        options: q.options,
        correctId,
        speakers: true,
        qid: q.id,
        passage,
      };
      setScreen({ ...base, picked: null, readingIdx: -1 });
      setOrb("speaking");
      // Arm the tap before the question plays: a child (or robot) who answers during the audio is not lost.
      let answered: string | null = null;
      const tapP = waitTap().then((id) => {
        answered = id;
        return id;
      });
      await Promise.race([playPrompt().catch(tolerateInterruption), tapP]);
      if (readOptions) {
        // Read the options aloud, lighting each; a tap interrupts.
        for (
          let i = 0;
          i < q.options.length && answered === null && !manualQuestionAudio.current;
          i++
        ) {
          setScreen({ ...base, picked: null, readingIdx: i });
          await Promise.race([
            playUrlAsync(optionAudio(q.options[i].id), 12000).catch(tolerateInterruption),
            tapP,
          ]);
          if (answered === null) await new Promise((r) => setTimeout(r, 250));
        }
      }
      if (!manualQuestionAudio.current) setOrb("idle");
      // Never re-enable the choices once answered (a flash of enabled buttons between two renders).
      if (answered === null && !manualQuestionAudio.current)
        setScreen({ ...base, picked: null, readingIdx: -1 });
      const picked = answered ?? (await tapP);
      replayRef.current = null;
      stopClip();
      setScreen({ ...base, picked, readingIdx: -1 });
      await new Promise((r) => setTimeout(r, 400));
      return picked;
    },
    [robot, waitTap],
  );

  /**
   * The cold read: reference = the whole passage, no help. The one-minute mark is scored silently for rate
   * (DIBELS window); the child reads on to the end (MAP Reading Fluency style), capped at PASSAGE_MAX_SECONDS
   * or a long silence after the window. Accuracy comes from everything read. Returns evidence + the recording.
   */
  const readPassageOnce = useCallback(
    async (
      band: Band,
      custom?: SpectrumPassage,
    ): Promise<{ ev: PassageEvidence; keptGoing: boolean; blob: Blob | null }> => {
      replayRef.current = null;
      const p = custom ?? PLACEMENT_BANK.bands[band].passage!;
      await playUrlAsync(
        custom && !custom.legacy ? spectrumClip(`title-${custom.id}`) : clipUrl(`title-${band}`),
        5000,
      );
      setScreen({ kind: "passage", title: p.title, text: p.text, reading: false });
      setOrb("listening");
      if (robot) {
        setScreen({ kind: "passage", title: p.title, text: p.text, reading: true });
        const v = await waitTap(); // "<wordsCorrect>/<wordsTotal>"
        const [c, t] = v.split("/").map((n) => Number(n));
        setOrb("idle");
        return {
          ev: {
            band,
            wordsCorrect: c || 0,
            wordsTotal: t || 0,
            durationSeconds: 60,
            minuteWordsCorrect: c || 0,
            minuteSeconds: 60,
            prosody: null,
          },
          keptGoing: (t || 0) > 0,
          blob: null,
        };
      }
      const phrases: import("@/app/(protected)/luna/_components/azure-stream").PAWord[][] = [];
      const totalWords = p.text.split(/\s+/).filter(Boolean).length;
      let lastPhraseAt = Date.now();
      let finishedEarly = false;
      let stopNow: (() => void) | null = null;
      let lastAttempted = 0;
      let heardAudio = false;
      let captureError: string | null = null;
      const listener = await micRef.current.listen(
        p.text,
        (ph) => {
          phrases.push(ph.words);
          lastPhraseAt = Date.now();
          const g = gradeRead(p.text, phrases);
          lastAttempted = g.wordsAttempted;
          // Within three words of the end counts as finished: the recognizer rarely aligns the very last words,
          // and waiting for them (then for the silence rule) was a long pause after the child had stopped.
          if (g.wordsAttempted >= Math.max(Math.ceil(totalWords * 0.95), totalWords - 3)) {
            finishedEarly = true;
            stopNow?.();
          }
        },
        (message) => {
          captureError = message;
          stopNow?.();
        },
      );
      const startedAt = Date.now();
      micRef.current.startRecording();
      setScreen({ kind: "passage", title: p.title, text: p.text, reading: true });
      await new Promise<void>((res) => {
        let settled = false;
        const timers: number[] = [];
        const end = () => {
          if (settled) return;
          settled = true;
          timers.forEach((t) => window.clearTimeout(t));
          window.clearInterval(quiet);
          res();
        };
        stopNow = end;
        if (captureError) {
          res();
          return;
        }
        // Missing speech is a technical retry, not a minute of silent testing.
        timers.push(
          window.setTimeout(() => {
            if (lastAttempted === 0 && !heardAudio) {
              captureError = "No reading was captured.";
              end();
            }
          }, 12000),
        );
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
          await Promise.race([
            listener.stop(),
            new Promise<never>((_, reject) => {
              drainTimer = setTimeout(
                () => reject(new Error("Speech recognition did not finish.")),
                4000,
              );
            }),
          ]);
        } finally {
          clearTimeout(drainTimer);
        }
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
    },
    [robot, waitTap],
  );

  const readPassage = useCallback(
    (band: Band, custom?: SpectrumPassage) => recover(() => readPassageOnce(band, custom)),
    [recover, readPassageOnce],
  );

  const uploadRecording = useCallback(
    async (blob: Blob, band: Band): Promise<string | null> => {
      try {
        const fd = new FormData();
        fd.set("child", childId);
        fd.set("band", String(band));
        fd.set("file", blob, `passage-${band}.wav`);
        const r = await fetch("/api/placement/recording", { method: "POST", body: fd });
        const j = await r.json();
        return r.ok && j.ok ? (j.path as string) : null;
      } catch {
        return null;
      }
    },
    [childId],
  );

  // ───────────────────────────────────────────────── the exam script
  useEffect(() => {
    if (!begun) return;
    // StrictMode mounts twice in dev: the script starts once (runRef) and the
    // first fake cleanup must not cancel it, so cancellation lives in a ref
    // that each (re)mount resets and only a real unmount leaves set.
    cancelledRef.current = false;
    if (runRef.current)
      return () => {
        cancelledRef.current = true;
      };
    runRef.current = true;
    if (!demo) {
      try {
        const saved = JSON.parse(
          sessionStorage.getItem(`readee.placement.pending.${childId}`) ?? "null",
        );
        if (saved?.submission?.childId === childId && Date.now() - saved.savedAt < 24 * 3600_000) {
          submissionRef.current = saved.submission;
          void saveSubmission();
          return () => {
            cancelledRef.current = true;
            stopClip();
          };
        }
        sessionStorage.removeItem(`readee.placement.pending.${childId}`);
      } catch {
        /* a damaged draft never blocks a new assessment */
      }
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
      await say(
        "intro-frame",
        "Let's read some words together. Some will be easy and some will be tricky, and that's exactly how I learn about you.",
      );

      // 1. Mic check: open the mic, ask for a hello, wait for sound.
      setStage("mic");
      let status: MicState = robot ? "open" : await micRef.current.open();
      if (status !== "open") {
        setScreen({ kind: "blocked", reason: status });
        return;
      }
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
      if (!ok) {
        status = "unavailable";
        setScreen({ kind: "blocked", reason: status });
        return;
      }
      await say("mic-heard", "I heard you. Let's begin.");
      startedRef.current = Date.now();

      // The unscored warm-up checks recognition before any reading evidence.
      if (!demo) trackFunnelClient("funnel.assessment_start", { child_id: childId, enrolled });
      setStage("warmup");
      await say("warmup-word", "Let's try one together first.");
      await listenWord(WARMUP_WORD);
      const spectrum: SpectrumEvidence = { words: [], reading: [], language: [], blending: [] };
      setStage("words");
      await say("words-intro", "Read each word out loud when it appears.");
      let wordState = wordSearch(enrolled, spectrum.words);
      while (wordState.next) {
        if (cancelled()) return;
        const item = wordState.next;
        let correct: boolean;
        if (item.step === 0) {
          const letters = [
            item.word,
            ...["b", "d", "g", "r"].filter((l) => l !== item.word).slice(0, 3),
          ];
          // Vary the answer location; receptive recognition, not sound production.
          for (let n = 0; n < item.index % 4; n++) letters.push(letters.shift()!);
          const picked = await askTiles("Which letter makes this sound?", letters, () =>
            playSeq([clipUrl("narr-letter-sounds-prompt"), phonemeUrl(item.word)], 350),
          );
          correct = picked === item.word;
        } else correct = await listenWord(item.word, false, item.grade);
        spectrum.words.push({ itemId: item.id, correct });
        wordState = wordSearch(enrolled, spectrum.words);
        await ack(spectrum.words.length);
      }
      // Oral blending has no printed answer: it measures putting sounds together.
      if (wordState.grade <= 1) {
        setStage("foundations");
        setScreen({ kind: "luna", caption: "Listen to the sounds. Say the word." });
        setOrb("speaking");
        await playUrlAsync(spectrumClip("blend-intro"));
        for (const item of ORAL_BLENDS) {
          const correct = await recover(async () => {
            setScreen({ kind: "luna", caption: "Listen to the sounds." });
            setOrb("speaking");
            await playSeq(item.sounds.map(phonemeUrl), 350);
            return listenWordOnce(item.word, false, undefined, "Say the word");
          });
          spectrum.blending.push({ itemId: item.id, correct });
          await ack(spectrum.blending.length);
        }
      }
      let readingState = readingSearch(enrolled, spectrum.words, spectrum.reading);
      let recordingPath: string | null = null;
      while (readingState.next) {
        if (cancelled()) return;
        const passage = readingState.next;
        setStage("passage");
        setScreen({ kind: "luna", caption: "Read this text out loud. Take your time." });
        setOrb("speaking");
        await playUrlAsync(spectrumClip("reading-intro"));
        const read = await readPassage(passage.grade, passage);
        setStage("comprehension");
        const choices = [];
        for (const q of passage.questions) {
          const choiceId = await askQuestion(q, passage.grade <= 1, {
            title: passage.title,
            text: passage.text,
          });
          choices.push({ itemId: q.id, choiceId });
          await ack(choices.length);
        }
        spectrum.reading.push({ passageId: passage.id, speech: read.ev, choices });
        readingState = readingSearch(enrolled, spectrum.words, spectrum.reading);
        if (readingState.confirmed !== null && read.blob && !demo)
          recordingPath = await uploadRecording(read.blob, passage.grade);
      }
      setStage("listening");
      setScreen({
        kind: "luna",
        caption: "This time, I'll read to you. Listen, then choose an answer.",
      });
      setOrb("speaking");
      await playUrlAsync(spectrumClip("language-intro"));
      const languageStart = Math.max(enrolled, readingState.confirmed ?? 0) as PlacedBand;
      let languageState = languageSearch(languageStart, spectrum.language);
      while (languageState.next) {
        if (cancelled()) return;
        const item = languageState.next;
        const choiceId = await askQuestion(
          { ...item, kind: "inferential" },
          !item.audioIncludesOptions,
          { title: "Listen and think", text: item.text },
        );
        spectrum.language.push({ itemId: item.id, choiceId });
        languageState = languageSearch(languageStart, spectrum.language);
        await ack(spectrum.language.length);
      }
      // Legacy fields stay empty. The server replays version 4's named probes;
      // it never turns new responses into invented legacy word-list scores.
      const ladder: LadderState = { enrolled, current: 0, lists: [], phase: "done", done: true };
      if (cancelled()) return;
      // 6. Close and save.
      setStage("closing");
      setScreen({ kind: "closing", error: null });
      setOrb("speaking");
      await playNarr("close", 3500);
      micRef.current.close();
      const submission: PlacementSubmission = {
        evidenceVersion: 4,
        spectrum,
        childId,
        sessionId: crypto.randomUUID(),
        enrolled,
        ladder,
        passages: [],
        comprehension: null,
        foundations: null,
        moments,
        durationSeconds: Math.round((Date.now() - startedRef.current) / 1000),
        passageRecordingPath: recordingPath,
      };
      if (demo) {
        onDemoComplete?.(submission);
        return;
      }
      submissionRef.current = submission;
      try {
        sessionStorage.setItem(
          `readee.placement.pending.${childId}`,
          JSON.stringify({ savedAt: Date.now(), submission }),
        );
      } catch {
        /* retry still works in memory */
      }
      await saveSubmission();
    })().catch((error) => {
      if (!cancelled()) {
        micRef.current.close();
        setOrb("idle");
        setScreen({
          kind: "blocked",
          reason: error instanceof PlacementAudioError ? "audio" : "unavailable",
        });
      }
    });
    return () => {
      cancelledRef.current = true;
      stopClip();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [begun]);

  // ───────────────────────────────────────────────── render
  return (
    <PlacementView
      screen={screen}
      stage={stage}
      childName={childName}
      outfitId={outfitId}
      orb={orb}
      analyser={mic.analyser}
      level={mic.level}
      robot={robot}
      onBegin={() => setBegun(true)}
      onTap={tap}
      onSkip={() => skipRef.current?.()}
      onRetry={() => window.location.reload()}
      onSave={() => {
        void saveSubmission();
      }}
      onReplay={
        (screen.kind === "tiles" && screen.picked === null) ||
        (screen.kind === "question" && screen.picked === null)
          ? () => {
              void replayRef.current?.().catch((error) => {
                if (error instanceof PlacementAudioCancelled || cancelledRef.current) return;
                micRef.current.close();
                setScreen({ kind: "blocked", reason: "audio" });
              });
            }
          : undefined
      }
      onReadOption={(qid, id) => {
        manualQuestionAudio.current = true;
        setOrb("speaking");
        setScreen((current) =>
          current.kind === "question" && current.qid === qid
            ? { ...current, readingIdx: current.options.findIndex((option) => option.id === id) }
            : current,
        );
        void playUrlAsync(
          qid.startsWith("sp-") ? spectrumClip(`opt-${qid}-${id}`) : clipUrl(`opt-${qid}-${id}`),
          12000,
        )
          .catch((error) => {
            if (error instanceof PlacementAudioCancelled || cancelledRef.current) return;
            micRef.current.close();
            setScreen({ kind: "blocked", reason: "audio" });
          })
          .finally(() => {
            if (cancelledRef.current) return;
            setOrb("idle");
            setScreen((current) =>
              current.kind === "question" && current.qid === qid
                ? { ...current, readingIdx: -1 }
                : current,
            );
          });
      }}
    />
  );
}
