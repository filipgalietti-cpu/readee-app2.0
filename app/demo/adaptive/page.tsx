/**
 * Readee Adapts — live interactive demo (public, no login).
 *
 * A REAL practice experience on REAL catalog questions, driven by the REAL
 * adaptive engine (classifyState + selectIntervention — the same code the app
 * uses). You (or an auto-play persona) answer real questions; the engine reads
 * how it's going and physically moves the child up or down a difficulty ladder
 * — easing to easier questions when they struggle, pushing to harder ones when
 * they breeze — and narrates it for the parent. Touches nothing live.
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  classifyState,
  type AdaptiveEventLite,
  type AdaptiveReading,
} from "@/lib/adaptive/controller";
import {
  selectIntervention,
  narrateSession,
  type Intervention,
} from "@/lib/adaptive/interventions";
import { DEMO_LADDER, type DemoQuestion } from "./demo-questions";

type Level = "easy" | "on" | "hard";
const LEVELS: Level[] = ["easy", "on", "hard"];
const LEVEL_LABEL: Record<Level, string> = { easy: "Easier", on: "On level", hard: "Challenge" };

const POOL: Record<Level, DemoQuestion[]> = {
  easy: DEMO_LADDER.filter((q) => q.level === "easy"),
  on: DEMO_LADDER.filter((q) => q.level === "on"),
  hard: DEMO_LADDER.filter((q) => q.level === "hard"),
};

const STATE_STYLE: Record<AdaptiveReading["state"], { color: string; ring: string; label: string; sub: string }> = {
  breezing: { color: "text-emerald-600", ring: "ring-emerald-400", label: "Breezing", sub: "Pumping the gas" },
  flow: { color: "text-violet-600", ring: "ring-violet-400", label: "In the zone", sub: "Just right — holding" },
  struggling: { color: "text-amber-600", ring: "ring-amber-400", label: "Struggling", sub: "Easing on the brakes" },
  frustrated: { color: "text-rose-600", ring: "ring-rose-400", label: "Frustrated", sub: "Full brakes — re-teaching" },
};
const KIND_BG: Record<Intervention["kind"], string> = {
  gas: "bg-emerald-50 border-emerald-200",
  hold: "bg-violet-50 border-violet-200",
  brakes: "bg-amber-50 border-amber-200",
};

function pick(level: Level, exclude?: string): DemoQuestion {
  const pool = POOL[level];
  const options = pool.filter((q) => q.prompt !== exclude);
  const arr = options.length ? options : pool;
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function AdaptiveDemoPage() {
  const [levelIdx, setLevelIdx] = useState(1); // start on-level
  const [q, setQ] = useState<DemoQuestion>(() => pick("on"));
  const [selected, setSelected] = useState<string | null>(null);
  const [events, setEvents] = useState<AdaptiveEventLite[]>([]);
  const [history, setHistory] = useState<Intervention[]>([]);
  const [feed, setFeed] = useState<{ id: number; iv: Intervention }[]>([]);
  const [qNum, setQNum] = useState(1);
  const [moved, setMoved] = useState<"up" | "down" | null>(null);

  const eventsRef = useRef<AdaptiveEventLite[]>([]);
  const historyRef = useRef<Intervention[]>([]);
  const levelRef = useRef(1);
  const idRef = useRef(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const qRef = useRef<DemoQuestion>(q); // always the CURRENT question (no stale closures)
  const busyRef = useRef(false); // true during feedback so answers don't overlap
  useEffect(() => { qRef.current = q; }, [q]);

  const reading = useMemo(() => classifyState(events), [events]);

  const stopAuto = useCallback(() => {
    if (autoRef.current) { clearInterval(autoRef.current); autoRef.current = null; }
  }, []);

  // Stable (no q/selected deps) — grades against qRef so auto-play is correct.
  const answer = useCallback((choice: string) => {
    if (busyRef.current) return;
    const cur = qRef.current;
    busyRef.current = true;
    setSelected(choice);
    const correct = choice === cur.correct;
    const latencyMs = correct ? 3200 : 14000;
    const next = [...eventsRef.current, { correct, attempts: 1, hintUsed: !correct, latencyMs, surface: "practice" as const }];
    eventsRef.current = next;
    setEvents(next);

    const r = classifyState(next);
    let move: "up" | "down" | null = null;
    if (r.directive !== "hold" && r.confidence >= 0.4) {
      const iv = selectIntervention(r, historyRef.current);
      if (iv.type !== "none") {
        historyRef.current = [...historyRef.current, iv];
        setHistory(historyRef.current);
        idRef.current += 1;
        setFeed((f) => [{ id: idRef.current, iv }, ...f].slice(0, 5));
        if (iv.type === "level_up" || iv.type === "stretch") move = "up";
        if (iv.type === "level_down") move = "down";
      }
    }

    // Show feedback, then advance (and move levels if the engine said so).
    setTimeout(() => {
      let idx = levelRef.current;
      if (move === "up") idx = Math.min(2, idx + 1);
      if (move === "down") idx = Math.max(0, idx - 1);
      levelRef.current = idx;
      setLevelIdx(idx);
      setMoved(move);
      setQ(pick(LEVELS[idx], cur.prompt));
      setSelected(null);
      setQNum((n) => n + 1);
      busyRef.current = false;
      setTimeout(() => setMoved(null), 1200);
    }, 1300);
  }, []);

  const reset = useCallback(() => {
    stopAuto();
    busyRef.current = false;
    eventsRef.current = []; historyRef.current = []; levelRef.current = 1;
    const first = pick("on");
    qRef.current = first;
    setEvents([]); setHistory([]); setFeed([]); setLevelIdx(1); setQNum(1);
    setSelected(null); setMoved(null); setQ(first);
  }, [stopAuto]);

  const runPersona = useCallback((correctRate: number) => {
    reset();
    setTimeout(() => {
      autoRef.current = setInterval(() => {
        if (busyRef.current) return; // wait out the feedback beat
        const cur = qRef.current;
        const wantCorrect = Math.random() < correctRate;
        const choice = wantCorrect ? cur.correct : (cur.choices.find((c) => c !== cur.correct) ?? cur.choices[0]);
        answer(choice);
      }, 1600);
    }, 80);
  }, [answer, reset]);

  useEffect(() => { if (qNum > 12) stopAuto(); }, [qNum, stopAuto]);
  useEffect(() => () => stopAuto(), [stopAuto]);

  const st = STATE_STYLE[reading.state];
  const needlePct = ((reading.throttle + 2) / 4) * 100;
  const insight = narrateSession("word meaning", history);
  const answered = selected !== null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white px-4 py-8 text-zinc-800">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-violet-500">Readee Adapts</div>
          <h1 className="mt-1 text-3xl font-extrabold text-violet-700">The engine that reads your reader</h1>
          <p className="mt-2 text-sm text-zinc-600">Real questions. The engine watches how it's going and eases up or pushes ahead — never too easy, never too hard.</p>
        </header>

        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          <button onClick={() => runPersona(0.2)} className="rounded-full bg-amber-500 px-5 py-2 text-sm font-bold text-white shadow hover:bg-amber-600">Auto-play: struggling reader</button>
          <button onClick={() => runPersona(0.95)} className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-bold text-white shadow hover:bg-emerald-600">Auto-play: advanced reader</button>
          <button onClick={reset} className="rounded-full border border-zinc-300 bg-white px-5 py-2 text-sm font-bold text-zinc-600 shadow-sm hover:bg-zinc-50">Reset</button>
        </div>

        {/* Difficulty ladder */}
        <div className="mb-5 flex items-center justify-center gap-2">
          {LEVELS.map((lvl, i) => (
            <div key={lvl} className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              i === levelIdx ? "bg-violet-600 text-white scale-105 shadow" : "bg-white text-zinc-400 border border-zinc-200"
            }`}>
              {LEVEL_LABEL[lvl]}
              {i === levelIdx && moved && (
                <span className="ml-1">{moved === "up" ? "▲" : "▼"}</span>
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* The real question */}
          <div className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span>The child · question {qNum}</span>
              <span>{LEVEL_LABEL[LEVELS[levelIdx]]}</span>
            </div>
            <div className="rounded-2xl bg-violet-50 p-5 text-violet-900 font-semibold leading-snug">{q.prompt}</div>
            <div className="mt-4 grid gap-2">
              {q.choices.map((c) => {
                const isCorrect = c === q.correct;
                const chosen = selected === c;
                const show = answered && (isCorrect || chosen);
                return (
                  <button key={c} disabled={answered} onClick={() => { stopAuto(); answer(c); }}
                    className={`rounded-xl border-2 px-4 py-3 text-left font-semibold transition-all ${
                      show && isCorrect ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                      : show && chosen ? "border-rose-400 bg-rose-50 text-rose-800"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-violet-300"}`}>
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* The engine */}
          <div className={`rounded-3xl border-2 bg-white p-6 shadow-sm ring-2 ${st.ring} border-transparent`}>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">The engine (live)</span>
            <div className="mt-2 flex items-baseline gap-3">
              <span className={`text-3xl font-extrabold ${st.color}`}>{st.label}</span>
              <span className="text-sm text-zinc-500">{st.sub}</span>
            </div>
            <p className="mt-1 text-sm text-zinc-500">{reading.reason}</p>
            <div className="mt-5">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className="text-rose-500">◀ Brakes</span><span className="text-violet-400">Hold</span><span className="text-emerald-500">Gas ▶</span>
              </div>
              <div className="relative mt-1 h-3 rounded-full bg-gradient-to-r from-rose-300 via-violet-200 to-emerald-300">
                <motion.div className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-zinc-800 shadow"
                  animate={{ left: `${needlePct}%` }} transition={{ type: "spring", stiffness: 300, damping: 25 }} />
              </div>
              <div className="mt-3 flex justify-between text-[10px] text-zinc-400"><span>confidence</span><span>{Math.round(reading.confidence * 100)}%</span></div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100"><div className="h-full rounded-full bg-violet-400 transition-all" style={{ width: `${reading.confidence * 100}%` }} /></div>
            </div>
          </div>
        </div>

        {/* Interventions */}
        <div className="mt-6">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">What Readee did about it</span>
          <div className="mt-2 space-y-2">
            <AnimatePresence initial={false}>
              {feed.length === 0 && <div className="rounded-2xl border border-dashed border-zinc-200 p-4 text-center text-sm text-zinc-400">Answer a few and watch the adjustments appear.</div>}
              {feed.map(({ id, iv }) => (
                <motion.div key={id} initial={{ opacity: 0, x: iv.kind === "gas" ? 24 : -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }} className={`flex items-start gap-3 rounded-2xl border p-4 ${KIND_BG[iv.kind]}`}>
                  <span className="mt-0.5 text-lg">{iv.kind === "gas" ? "▲" : iv.kind === "brakes" ? "▼" : "•"}</span>
                  <div>
                    <div className="font-bold text-zinc-800">{iv.title}<span className="ml-2 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">{iv.kind}</span></div>
                    <div className="text-sm text-zinc-600">“{iv.message}”</div>
                    <div className="mt-0.5 text-xs text-zinc-400">{iv.rationale}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Parent view */}
        <div className="mt-6 rounded-3xl border border-violet-200 bg-violet-600 p-6 text-white shadow-lg">
          <div className="text-xs font-bold uppercase tracking-widest text-violet-200">What the parent sees</div>
          <div className="mt-2 text-lg font-semibold leading-relaxed">{insight}</div>
          <div className="mt-2 text-xs text-violet-200">Delivered in the weekly parent digest — the tutor-quality personalization parents pay for, made visible.</div>
        </div>
      </div>
    </div>
  );
}
