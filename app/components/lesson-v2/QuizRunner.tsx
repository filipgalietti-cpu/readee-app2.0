"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { QuizDef, QuizQuestion, QuizResultItem } from "@/lib/lesson-engine/quiz";
import type { LearningEvent } from "@/lib/lesson-engine/types";
import { getInteraction } from "@/lib/lesson-engine/registry";
import { emitLearningEvent } from "@/lib/lesson-engine/events";
import { playNarration, stopNarration, sfxComplete } from "@/lib/lesson-engine/cues";
import { Bunny, BunnyReaction } from "@/app/_components/Bunny/Bunny";
import QuizSummary from "./QuizSummary";
import QuizHypeIntro from "@/app/(protected)/practice/_components/QuizHypeIntro";
import SealOfApproval from "@/app/(protected)/practice/_components/SealOfApproval";
import { FluentIcon } from "@/app/_components/FluentIcon";
import { Glyph } from "@/app/_components/Glyph";

/**
 * QuizRunner — the post-lesson quiz, built on Filip's designed beats:
 *   countdown 3-2-1 → question → correct = bunny dance → 3-in-a-row = FLAME →
 *   perfect score = celebration popup → post-quiz performance review.
 * Questions render through the same interaction registry as lessons.
 * ADAPTIVE LADDER: starts at difficulty 2; right → harder, wrong → easier
 * (disabled for unit exams: fixed order, a measure not practice).
 */
export default function QuizRunner({
  quiz,
  onEvent,
  picker,
  resultNote,
}: {
  quiz: QuizDef;
  onEvent?: (e: LearningEvent) => void;
  /** Override the band ladder (placement staircase etc.). Receives the results
   *  so far, the asked questions, and the unasked pool; return null to end. */
  picker?: (answered: QuizResultItem[], asked: QuizQuestion[], pool: QuizQuestion[]) => QuizQuestion | null;
  /** Extra line for the summary (e.g. placement "Reading level: Grade 2.4"). */
  resultNote?: (results: QuizResultItem[]) => string;
}) {
  const [phase, setPhase] = useState<"intro" | "question" | "seal" | "review">("intro");
  const [asked, setAsked] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState<QuizQuestion | null>(null);
  const [results, setResults] = useState<QuizResultItem[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [bunny, setBunny] = useState<"idle" | "dance" | "sad">("idle");
  const [cueQ, setCueQ] = useState<string | null>(null); // narration finished for qid
  const [carrots, setCarrots] = useState(0);
  const [carrotFlash, setCarrotFlash] = useState(false);
  const [carrotGains, setCarrotGains] = useState<{ id: number; amt: number }[]>([]);
  const [displayCarrots, setDisplayCarrots] = useState(0); // tallies up 1-by-1
  const [flyers, setFlyers] = useState<{ key: string; style: React.CSSProperties }[]>([]);
  const gainId = useRef(0);
  const followUp = useRef<string | null>(null);
  const BANDS = ["easier", "core", "harder"] as const;
  const bandIdx = useRef(1); // start at core
  const bandRun = useRef(0); // consecutive first-try corrects within current band
  const qStart = useRef(0);

  useEffect(() => {
    if (displayCarrots < carrots) {
      const t = window.setTimeout(() => setDisplayCarrots((d) => d + 1), 90);
      return () => clearTimeout(t);
    }
  }, [displayCarrots, carrots]);

  // ── pick next question: adaptive ladder or fixed order ─────────────
  function pickNext(answered: QuizResultItem[], askedSoFar: QuizQuestion[]): QuizQuestion | null {
    if (answered.length >= quiz.askCount) return null;
    const used = new Set(askedSoFar.map((q) => q.id));
    const pool = quiz.questions.filter((q) => !used.has(q.id));
    if (pool.length === 0) return null;
    // ALLEY-OOP: a correct answer can pin its follow-up as the next question.
    if (followUp.current) {
      const fu = pool.find((q) => q.id === followUp.current);
      followUp.current = null;
      if (fu) return fu;
    }
    if (picker) return picker(answered, askedSoFar, pool);
    if (!quiz.adaptive) return pool[0];
    // BAND ladder with CORE-MAJORITY GUARANTEE: the approved core questions ARE
    // the quiz; easier/harder are adjustments capped at 2 each per run.
    const counts = { easier: 0, core: 0, harder: 0 } as Record<string, number>;
    for (const q of askedSoFar) counts[q.band ?? "core"] += 1;
    let want = BANDS[bandIdx.current];
    if (want !== "core" && counts[want] >= 2) want = "core"; // cap reached → core
    const wantPool = pool.filter((q) => (q.band ?? "core") === want);
    const usePool = wantPool.length > 0 ? wantPool : pool.filter((q) => (q.band ?? "core") === "core");
    const finalPool = usePool.length > 0 ? usePool : pool;
    finalPool.sort((a, b) => a.difficulty - b.difficulty);
    return finalPool[0];
  }

  function streakTier(consec: number): { mult: number; fires: number } {
    if (consec >= 5) return { mult: 3, fires: 3 };
    if (consec >= 3) return { mult: 2, fires: 1 };
    return { mult: 1, fires: 0 };
  }

  function launchCarrots(n: number) {
    // legacy "launchCarrots": carrots fly from the question area to the tally
    const next = Array.from({ length: n }, (_, i) => {
      const x = window.innerWidth * (0.35 + 0.3 * Math.random());
      const y = window.innerHeight * (0.35 + 0.25 * Math.random());
      return {
        key: `${Date.now()}-${i}`,
        style: {
          position: "fixed", left: x, top: y, zIndex: 130, pointerEvents: "none",
          ["--tx" as string]: `${window.innerWidth - 180 - x}px`,
          ["--ty" as string]: `${34 - y}px`,
          animation: `qFlyCarrot .85s cubic-bezier(.5,.05,.55,1) ${i * 75}ms both`,
        } as React.CSSProperties,
      };
    });
    setFlyers(next);
    window.setTimeout(() => setFlyers([]), 1700);
  }

  function gainCarrots(amt: number) {
    setCarrots((c) => c + amt);
    setCarrotFlash(true);
    window.setTimeout(() => setCarrotFlash(false), 900);
    const id = ++gainId.current;
    setCarrotGains((g) => [...g, { id, amt }]);
    window.setTimeout(() => setCarrotGains((g) => g.filter((x) => x.id !== id)), 1300);
  }

  function startQuiz() {
    const first = pickNext([], []);
    setAsked(first ? [first] : []);
    setCurrent(first);
    setPhase("question");
  }

  // ── per-question narration (choices read aloud via cue) ───────────
  useEffect(() => {
    if (phase !== "question" || !current) return;
    qStart.current = Date.now();
    setBunny("idle");
    if (current.narration) {
      playNarration(current.narration.audio, { onEnded: () => setCueQ(current.id), onPlayingChange: () => {} });
    } else {
      setCueQ(current.id);
    }
    return () => stopNarration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, phase]);

  function handleSolved(meta?: { attempts?: number; correct?: boolean }) {
    if (!current) return;
    const correct = meta?.correct !== false;
    // LEGACY SCORING SEMANTIC: a question counts as correct ONLY when answered
    // right on the FIRST try. Second-try saves still praise the kid in-flow, but
    // they don't score — so seal, stars, and "Perfect" all agree.
    const firstTryClean = correct && (meta?.attempts ?? 1) === 1;
    const item: QuizResultItem = {
      questionId: current.id,
      prompt: current.prompt,
      band: current.band ?? "core",
      difficulty: current.difficulty,
      correct: firstTryClean,
      attempts: meta?.attempts ?? 1,
    };
    const nextResults = [...results, item];
    setResults(nextResults);

    emitLearningEvent({
      lessonId: quiz.lessonId,
      sceneId: `quiz:${current.id}`,
      conceptId: quiz.standard,
      interactionType: current.interaction.type,
      itemId: current.band,
      correct,
      attempts: meta?.attempts ?? 1,
      responseTimeMs: Date.now() - qStart.current,
      ts: Date.now(),
    });
    onEvent?.({} as LearningEvent);

    // beats: dance on correct, streak flame math, ladder move
    if (correct && current.followUpId) followUp.current = current.followUpId;
    if (correct) {
      // STREAK LAW: only FIRST-TRY corrects extend the flame (legacy rule).
      const firstTry = (meta?.attempts ?? 1) === 1;
      const s = firstTry ? streak + 1 : 0;
      setStreak(s);
      setBestStreak((b) => Math.max(b, s));
      setBunny("dance");
      if (firstTry) {
        const tier = streakTier(s); // streak INCLUDING this answer
        // band-weighted base: easier +1, core +2, harder +3 (relative difficulty credit)
        const base = current.band === "harder" ? 3 : current.band === "easier" ? 1 : 2;
        gainCarrots(base * tier.mult);
        launchCarrots(Math.min(8, 4 + 2 * tier.mult));
        // band ladder: 3 straight first-try corrects → step up a band
        bandRun.current += 1;
        if (bandRun.current >= 3 && bandIdx.current < 2) {
          bandIdx.current += 1;
          bandRun.current = 0;
        }
      } else {
        bandRun.current = 0; // second-try correct holds the band
      }
    } else {
      setStreak(0);
      setBunny("sad");
      // a miss steps DOWN a band immediately (support first)
      bandRun.current = 0;
      if (bandIdx.current > 0) bandIdx.current -= 1;
    }

    // advance after the feedback beat lands
    window.setTimeout(() => {
      const next = pickNext(nextResults, asked);
      if (!next) {
        const perfect = nextResults.length > 0 && nextResults.every((r) => r.correct); // correct already = first-try-clean
        if (perfect) {
          // PERFECT: full-screen seal FIRST, then the summary
          setPhase("seal");
          window.setTimeout(() => setPhase("review"), 5200);
        } else {
          setPhase("review");
        }
        sfxComplete();
        return;
      }
      setAsked((a) => [...a, next]);
      setCurrent(next);
    }, correct ? 3200 : 3600);
  }

  const score = useMemo(() => {
    const c = results.filter((r) => r.correct).length;
    const total = results.length;
    // legacy getStars thresholds (practice runner)
    const stars = total === 0 ? 0 : c === total ? 3 : c >= total - 1 ? 2 : c >= 1 ? 1 : 0;
    const firstTryAll = total > 0 && results.every((r) => r.correct && r.attempts === 1);
    return { correct: c, total, pct: total ? Math.round((c / total) * 100) : 0, stars, firstTryAll };
  }, [results]);

  const Renderer = current ? getInteraction(current.interaction.type) : null;
  const qNum = results.length + (phase === "question" ? 1 : 0);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-gradient-to-b from-white via-[#fbfaff] to-indigo-50/60 text-[#1e1b3a]">
      {/* ── top bar: progress + STREAK FLAME ── */}
      {phase !== "seal" && phase !== "review" && (
      <header className="relative flex h-[60px] flex-shrink-0 items-center gap-3 border-b border-dashed border-zinc-200 bg-white/90 px-8">
        <div className="text-sm font-semibold text-zinc-500">
          {quiz.title}
        </div>
        <div className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 gap-1.5">
          {Array.from({ length: quiz.askCount }).map((_, i) => (
            <div
              key={i}
              className={`h-2.5 rounded-full transition-all ${
                i < results.length
                  ? results[i].correct
                    ? "w-6 bg-emerald-400"
                    : "w-6 bg-rose-300"
                  : i === results.length && phase === "question"
                    ? "w-6 bg-violet-500"
                    : "w-2.5 bg-zinc-200"
              }`}
            />
          ))}
        </div>
        <div className="flex-1" />
        {/* streak flame — immediately LEFT of the carrot pill (design: Streak Flame Pill.dc.html) */}
        <AnimatePresence>
          {streak >= 3 && (
            <motion.div
              key={streak >= 5 ? "fire3" : "fire2"}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className={streak >= 5 ? "qz-pill3" : "qz-pill2"}
            >
              {streak >= 5 && (
                <>
                  <span className="qz-spark" />
                  <span className="qz-spark" />
                  <span className="qz-spark" />
                </>
              )}
              <motion.span
                animate={
                  streak >= 5
                    ? { scale: [1, 1.35, 1], rotate: [-6, 6, -6] }
                    : { scale: [1, 1.18, 1] }
                }
                transition={{ duration: streak >= 5 ? 0.55 : 0.8, repeat: Infinity, ease: "easeInOut" }}
                style={streak >= 5 ? { filter: "drop-shadow(0 0 8px rgba(251,146,60,.9))" } : undefined}
              >
                <FluentIcon
                  name="fire"
                  size={streak >= 5 ? 24 : 18}
                />
              </motion.span>
              <span className="qz-ftxt">{streak >= 5 ? "YOU'RE ON FIRE! 3x!" : `${streak} in a row! 2x!`}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          animate={carrotFlash ? { scale: [1, 1.25, 1] } : {}}
          transition={{ duration: 0.5 }}
          className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 ring-1 ${
            carrotFlash ? "bg-orange-50 ring-orange-300" : "bg-zinc-50 ring-zinc-200"
          }`}
        >
          <FluentIcon name="carrot" size={16} />
          <span className="text-sm font-extrabold text-zinc-700">{displayCarrots}</span>
          <AnimatePresence>
            {carrotGains.map((g) => (
              <motion.span
                key={g.id}
                initial={{ opacity: 0, y: 8, scale: 0.7 }}
                animate={{ opacity: 1, y: -16, scale: 1 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 1.1, ease: "easeOut" }}
                className="absolute -top-1 right-1 text-sm font-extrabold text-orange-500"
              >
                +{g.amt}
              </motion.span>
            ))}
          </AnimatePresence>
        </motion.div>
        <button
          onClick={() => (typeof window !== "undefined" ? window.history.back() : null)}
          aria-label="Close quiz"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-zinc-500 transition hover:bg-zinc-100"
        >
          <Glyph name="x" size={18} />
        </button>
      </header>
      )}

      <main className="relative flex min-h-0 flex-1 items-center justify-center px-10">
        {/* ── INTRO — the existing QuizHypeIntro (hype → countdown → GO!) ── */}
        {phase === "intro" && (
          <div className="absolute inset-0 z-30">
            <QuizHypeIntro
              kidName="Reader"
              quizName={quiz.title}
              questionCount={quiz.askCount}
              streakDays={0}
              carrots={0}
              onLetsGo={() => {}}
              onComplete={startQuiz}
              onBack={() => (typeof window !== "undefined" ? window.history.back() : null)}
            />
          </div>
        )}

        {/* ── QUESTION ── */}
        {phase === "question" && current && Renderer && (
          <motion.div
            key={current.id}
            data-qid={current.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex w-full max-w-[1000px] flex-col items-center gap-8 text-center"
          >
            <div className="max-w-[640px] text-[32px] font-bold leading-[1.2] tracking-tight [text-wrap:balance]">
              {current.prompt}
            </div>
            {current.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={current.image} alt="" className="max-h-[220px] rounded-2xl object-contain drop-shadow-lg" />
            )}
            <div className="w-full">
              <Renderer
                key={current.id}
                data={current.interaction}
                cue={cueQ === current.id}
                onSolved={handleSolved}
                onItemCorrect={() => gainCarrots(1)}
                feedbackAudio={{ hint: current.hint?.audio, explain: current.explain?.audio }}
              />
            </div>
          </motion.div>
        )}

        {/* ── PERFORMANCE REVIEW — the LEGACY completion screen ── */}
        {phase === "review" && (
          <QuizSummary
            quizTitle={quiz.title}
            standard={quiz.standard}
            results={results}
            carrotsEarned={carrots}
            bestStreak={bestStreak}
            note={resultNote?.(results)}
            againHref={typeof window !== "undefined" ? window.location.pathname : "#"}
          />
        )}

        {/* ── PERFECT SCORE — full-screen seal, FIRST, then the summary ── */}
        {phase === "seal" && (
          <div className="absolute inset-0 z-20 bg-white">
            <SealOfApproval ribbonText="PERFECT!" background="sky" />
          </div>
        )}
      </main>

      {/* ── bunny corner: the reaction rig animates ITSELF; container stays still ── */}
      {phase === "question" && (
        <div className="pointer-events-none fixed bottom-8 left-8 z-[110] h-52 w-52">
          {bunny === "dance" ? (
            <BunnyReaction outfitId={null} state="correct" />
          ) : bunny === "sad" ? (
            <BunnyReaction outfitId={null} state="incorrect" />
          ) : (
            <Bunny outfitId={null} />
          )}
        </div>
      )}

      {/* flying carrots (legacy launchCarrots) */}
      {flyers.map((f) => (
        <span key={f.key} style={f.style}>
          <FluentIcon name="carrot" size={22} />
        </span>
      ))}

      {/* interaction skin (same classes the lessons use) */}
      <QuizStyles />
    </div>
  );
}

function QuizStyles() {
  return (
    <style>{`
      .gb-tx, .gb-sort { display:flex; flex-direction:column; align-items:center; gap:24px; width:100%; }
      .gb-sort { position:relative; padding-bottom:44px; }
      .gb-sort .gb-hint, .gb-sort .gb-coach { position:absolute; bottom:0; left:50%; transform:translateX(-50%); white-space:nowrap; }
      .gb-emoji { font-size:72px; line-height:1; }
      .gb-word { display:flex; gap:12px; flex-wrap:wrap; justify-content:center; align-items:flex-start; position:relative; }
      .gb-tilewrap { display:flex; flex-direction:column; align-items:center; gap:7px; }
      .gb-tag { font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:.05em; }
      .gb-tile { width:70px; height:82px; border:0; border-radius:18px; background:#fff; box-shadow:0 2px 0 #e4e4ec, 0 6px 16px -8px rgba(50,30,90,.18), inset 0 0 0 2px #e8e7f2; display:grid; place-items:center; font-family:'Baloo 2',-apple-system,sans-serif; font-weight:800; font-size:46px; color:#1e1b3a; transition:all .25s ease; }
      .gb-slot { width:70px; height:82px; border:3px dashed #c7c5dd; border-radius:18px; background:#fbfaff; display:grid; place-items:center; font-size:30px; color:#b6b3cf; transition:all .2s ease; }
      .gb-slot.over { border-color:#6366f1; background:#eef2ff; transform:scale(1.05); }
      .gb-pieces { display:flex; gap:16px; }
      .gb-piece { min-width:64px; height:76px; border:0; border-radius:16px; background:linear-gradient(180deg,#eef2ff,#e0e7ff); box-shadow:0 3px 0 #c7d2fe, 0 8px 18px -8px rgba(79,70,229,.35), inset 0 0 0 2px #c7d2fe; color:#4338ca; font-family:'Baloo 2',sans-serif; font-size:40px; font-weight:800; cursor:grab; transition:transform .12s ease, box-shadow .12s ease; }
      .gb-piece:hover { transform:translateY(-3px); }
      .gb-piece:active { cursor:grabbing; transform:scale(.92); }
      .gb-piece.shake { animation:gb-shake .35s; color:#e11d48; box-shadow:0 3px 0 #fecdd3, 0 8px 18px -8px rgba(225,29,72,.35), inset 0 0 0 2px #fecdd3; background:linear-gradient(180deg,#fff1f2,#ffe4e6); }
      @keyframes gb-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
      .gb-pool { display:flex; gap:14px; flex-wrap:wrap; justify-content:center; min-height:60px; }
      .gb-item { border:0; border-radius:18px; background:#fff; box-shadow:0 2px 0 #e4e4ec, 0 8px 20px -10px rgba(50,30,90,.2), inset 0 0 0 2px #e8e7f2; padding:14px 18px; font-family:'Baloo 2',sans-serif; font-size:24px; font-weight:800; color:#1e1b3a; cursor:pointer; transition:transform .12s ease, box-shadow .12s ease; }
      .gb-item:hover { transform:translateY(-3px); }
      .gb-item:active { transform:scale(.95); }
      .gb-item.big { font-size:30px; padding:22px 28px 18px; border-radius:24px; letter-spacing:.04em; color:#4338ca; min-width:200px; }
      .gb-item.sel { box-shadow:0 2px 0 #c7d2fe, 0 8px 20px -10px rgba(79,70,229,.4), inset 0 0 0 3px #6366f1; background:#eef2ff; }
      .gb-item.win { box-shadow:inset 0 0 0 3px #10b981, 0 8px 20px -10px rgba(16,185,129,.45); background:#ecfdf5; color:#047857; }
      .gb-item.done { box-shadow:inset 0 0 0 2px #a7f3d0; background:#ecfdf5; color:#047857; font-size:22px; padding:12px 16px; cursor:default; }
      .gb-item.shake { animation:gb-shake .35s; }
      .gb-buckets { display:flex; gap:18px; width:100%; }
      .gb-bucket { flex:1; border:3px dashed #c7c5dd; border-radius:20px; background:#fbfaff; padding:16px; min-height:140px; cursor:pointer; transition:all .2s ease; }
      .gb-bucket:hover { border-color:#a5b4fc; background:#f5f6ff; }
      .gb-bucket.bad { border-color:#fb7185; background:#fff1f2; animation:gb-shake .35s; }
      .gb-bucket-label { font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; color:#6d28d9; margin-bottom:10px; text-align:center; }
      .gb-bucket-items { display:flex; gap:6px; flex-wrap:wrap; justify-content:center; }
      .gb-hint { font-size:15px; font-weight:600; color:#52525b; }
      .gb-hint.gb-ok, .gb-ok { color:#047857; font-weight:700; }
      .gb-coach { font-size:16px; color:#e11d48; font-weight:700; background:#fff1f2; border-radius:999px; padding:6px 16px; }
      .gb-secondary { border:0; background:#fff; box-shadow:inset 0 0 0 2px #e8e7f2; color:#52525b; border-radius:999px; padding:9px 18px; font-size:14px; font-weight:700; cursor:pointer; }
      /* streak pills — from the Claude Design Streak Flame Pill catalog */
      .qz-pill2 { position:relative; display:flex; align-items:center; gap:7px; border-radius:999px; padding:7px 15px; background:linear-gradient(180deg,#fff7ed,#ffedd5); box-shadow:inset 0 0 0 1.5px #fdba74, 0 4px 12px -4px rgba(249,115,22,.4); }
      .qz-pill2 .qz-ftxt { font-family:'Baloo 2',sans-serif; font-weight:800; font-size:14px; color:#c2410c; }
      .qz-flame2 { position:relative; width:18px; height:22px; }
      .qz-flame2 i { position:absolute; border-radius:50% 50% 50% 50% / 62% 62% 38% 38%; }
      .qz-flame2 .qz-fouter { inset:0; background:linear-gradient(180deg,#fb923c,#ea580c); transform-origin:50% 90%; animation:qzflick .5s ease-in-out infinite alternate; }
      .qz-flame2 .qz-finner { inset:22% 22% 8% 22%; background:linear-gradient(180deg,#fde047,#f59e0b); transform-origin:50% 95%; animation:qzflick .42s .1s ease-in-out infinite alternate; }
      .qz-pill3 { position:relative; display:flex; align-items:center; gap:8px; border-radius:999px; padding:8px 16px; background:linear-gradient(180deg,#7f1d1d,#450a0a); box-shadow:inset 0 0 0 1.5px #fca5a5, 0 0 22px 2px rgba(239,68,68,.55); animation:qzheat 1.6s ease-in-out infinite; }
      .qz-pill3 .qz-ftxt { font-family:'Baloo 2',sans-serif; font-weight:800; font-size:14px; background:linear-gradient(90deg,#fde047,#fb923c,#fde047); background-size:200% 100%; -webkit-background-clip:text; background-clip:text; color:transparent; animation:qzlava 1.4s linear infinite; }
      .qz-flame3 { position:relative; width:22px; height:27px; filter:drop-shadow(0 0 6px rgba(251,146,60,.8)); }
      .qz-flame3 i { position:absolute; border-radius:50% 50% 50% 50% / 62% 62% 38% 38%; }
      .qz-flame3 .qz-fouter { inset:0; background:linear-gradient(180deg,#ef4444,#b91c1c); transform-origin:50% 92%; animation:qzflick .38s ease-in-out infinite alternate; }
      .qz-flame3 .qz-fmid { inset:14% 16% 4% 16%; background:linear-gradient(180deg,#fb923c,#ea580c); transform-origin:50% 94%; animation:qzflick .32s .06s ease-in-out infinite alternate; }
      .qz-flame3 .qz-fcore { inset:34% 30% 8% 30%; background:linear-gradient(180deg,#fef9c3,#fde047); transform-origin:50% 96%; animation:qzflick .28s .12s ease-in-out infinite alternate; }
      .qz-spark { position:absolute; width:4px; height:4px; border-radius:50%; background:#fdba74; opacity:0; animation:qzrise 1.2s ease-out infinite; }
      .qz-spark:nth-of-type(1){ left:18%; animation-delay:0s } .qz-spark:nth-of-type(2){ left:48%; animation-delay:.4s } .qz-spark:nth-of-type(3){ left:75%; animation-delay:.8s }
      @keyframes qzflick { from{transform:scaleY(1) scaleX(1) rotate(-2deg)} to{transform:scaleY(1.14) scaleX(.94) rotate(2.5deg)} }
      @keyframes qzheat { 0%,100%{box-shadow:inset 0 0 0 1.5px #fca5a5, 0 0 18px 1px rgba(239,68,68,.45)} 50%{box-shadow:inset 0 0 0 1.5px #fecaca, 0 0 30px 5px rgba(249,115,22,.65)} }
      @keyframes qzlava { to{background-position:200% 0} }
      @keyframes qzrise { 0%{bottom:20%;opacity:0;transform:scale(.6)} 25%{opacity:1} 100%{bottom:120%;opacity:0;transform:scale(.2) translateX(4px)} }
      @keyframes qFlyCarrot { 0%{opacity:0;transform:translate(0,0) scale(.5) rotate(0)} 15%{opacity:1} 100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(1) rotate(180deg)} }
      @media (prefers-reduced-motion: reduce){ .gb-piece:hover, .gb-item:hover { transform:none } }
    `}</style>
  );
}
