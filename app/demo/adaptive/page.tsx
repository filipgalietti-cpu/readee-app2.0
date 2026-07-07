/**
 * Readee Adapts — live interactive demo.
 *
 * Drives the REAL adaptive engine (classifyState + selectIntervention, the
 * same code the app uses) so this is a true showcase, not a mockup. You play
 * the child: answer correctly or struggle, and watch the engine hit the
 * brakes or pump the gas in real time — then see the parent-facing insight
 * it produces. Public demo route (no auth), safe: touches nothing live.
 */
"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
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

const STATE_STYLE: Record<
  AdaptiveReading["state"],
  { color: string; ring: string; label: string; sub: string }
> = {
  breezing: { color: "text-emerald-600", ring: "ring-emerald-400", label: "Breezing", sub: "Pumping the gas" },
  flow: { color: "text-violet-600", ring: "ring-violet-400", label: "In the zone", sub: "Just right — holding" },
  struggling: { color: "text-amber-600", ring: "ring-amber-400", label: "Struggling", sub: "Easing on the brakes" },
  frustrated: { color: "text-rose-600", ring: "ring-rose-400", label: "Frustrated", sub: "Full brakes — re-teaching" },
};

const KIND_STYLE: Record<Intervention["kind"], { bg: string; icon: string }> = {
  gas: { bg: "bg-emerald-50 border-emerald-200", icon: "▲" },
  hold: { bg: "bg-violet-50 border-violet-200", icon: "•" },
  brakes: { bg: "bg-amber-50 border-amber-200", icon: "▼" },
};

export default function AdaptiveDemoPage() {
  const [events, setEvents] = useState<AdaptiveEventLite[]>([]);
  const [history, setHistory] = useState<Intervention[]>([]);
  const [feed, setFeed] = useState<{ id: number; iv: Intervention }[]>([]);
  const [qNum, setQNum] = useState(1);
  // Refs hold the source of truth so state-setter side effects never nest
  // inside an updater (which React StrictMode would double-invoke in dev).
  const eventsRef = useRef<AdaptiveEventLite[]>([]);
  const historyRef = useRef<Intervention[]>([]);
  const idRef = useRef(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reading = useMemo(() => classifyState(events), [events]);

  const answer = useCallback((correct: boolean) => {
    // Struggling readers labor longer; confident ones are quick.
    const latencyMs = correct ? 3000 + Math.round(Math.random() * 3000) : 12000 + Math.round(Math.random() * 8000);
    const next = [...eventsRef.current, { correct, attempts: 1, hintUsed: !correct, latencyMs, surface: "practice" as const }];
    eventsRef.current = next;
    setEvents(next);
    setQNum(next.length + 1);

    const r = classifyState(next);
    if (r.directive !== "hold" && r.confidence >= 0.4) {
      const iv = selectIntervention(r, historyRef.current);
      if (iv.type !== "none") {
        historyRef.current = [...historyRef.current, iv];
        setHistory(historyRef.current);
        idRef.current += 1;
        const entry = { id: idRef.current, iv };
        setFeed((f) => [entry, ...f].slice(0, 6));
      }
    }
  }, []);

  const stopAuto = useCallback(() => {
    if (autoRef.current) {
      clearInterval(autoRef.current);
      autoRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stopAuto();
    eventsRef.current = [];
    historyRef.current = [];
    setEvents([]);
    setHistory([]);
    setFeed([]);
    setQNum(1);
  }, [stopAuto]);

  const runPersona = useCallback(
    (correctRate: number) => {
      reset();
      setTimeout(() => {
        autoRef.current = setInterval(() => {
          answer(Math.random() < correctRate);
        }, 1100);
      }, 50);
    },
    [answer, reset],
  );

  // stop auto-play once we've asked ~10 questions
  useEffect(() => {
    if (qNum > 10) stopAuto();
  }, [qNum, stopAuto]);
  useEffect(() => () => stopAuto(), [stopAuto]);

  const st = STATE_STYLE[reading.state];
  // throttle −2..+2 → 0..100% along the gauge
  const needlePct = ((reading.throttle + 2) / 4) * 100;
  const insight = narrateSession("this skill", history);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white px-4 py-8 text-zinc-800">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-violet-500">Readee Adapts</div>
          <h1 className="mt-1 text-3xl font-extrabold text-violet-700">The engine that reads your reader</h1>
          <p className="mt-2 text-sm text-zinc-600">
            You play the child. Answer along and watch Readee hit the brakes or pump the gas — never too easy, never too hard.
          </p>
        </header>

        {/* Persona controls */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          <button onClick={() => runPersona(0.25)} className="rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow hover:bg-amber-600">
            🐢 Auto: struggling reader
          </button>
          <button onClick={() => runPersona(0.95)} className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow hover:bg-emerald-600">
            🚀 Auto: advanced reader
          </button>
          <button onClick={reset} className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-bold text-zinc-600 shadow-sm hover:bg-zinc-50">
            ↺ Reset
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* ── The child's turn ── */}
          <div className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">The child · question {qNum}</span>
              <span className="text-xs text-zinc-400">{events.length} answered</span>
            </div>
            <div className="rounded-2xl bg-violet-50 p-6 text-center">
              <div className="text-lg font-bold text-violet-800">What did Lily have?</div>
              <div className="mt-2 text-sm text-violet-400">(tap how the child did)</div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={() => { stopAuto(); answer(true); }} className="rounded-2xl bg-emerald-500 py-4 text-lg font-extrabold text-white shadow hover:bg-emerald-600">
                ✓ Nailed it
              </button>
              <button onClick={() => { stopAuto(); answer(false); }} className="rounded-2xl bg-rose-500 py-4 text-lg font-extrabold text-white shadow hover:bg-rose-600">
                ✗ Struggled
              </button>
            </div>
          </div>

          {/* ── The engine ── */}
          <div className={`rounded-3xl border-2 bg-white p-6 shadow-sm ring-2 ${st.ring} border-transparent`}>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">The engine (live)</span>
            <div className="mt-2 flex items-baseline gap-3">
              <span className={`text-3xl font-extrabold ${st.color}`}>{st.label}</span>
              <span className="text-sm text-zinc-500">{st.sub}</span>
            </div>
            <p className="mt-1 text-sm text-zinc-500">{reading.reason}</p>

            {/* brakes ← → gas gauge */}
            <div className="mt-5">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className="text-rose-500">◀ Brakes</span>
                <span className="text-violet-400">Hold</span>
                <span className="text-emerald-500">Gas ▶</span>
              </div>
              <div className="relative mt-1 h-3 rounded-full bg-gradient-to-r from-rose-300 via-violet-200 to-emerald-300">
                <motion.div
                  className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-zinc-800 shadow"
                  animate={{ left: `${needlePct}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-zinc-400">
                <span>confidence</span>
                <span>{Math.round(reading.confidence * 100)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full rounded-full bg-violet-400 transition-all" style={{ width: `${reading.confidence * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Interventions firing ── */}
        <div className="mt-6">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">What Readee did about it</span>
          <div className="mt-2 space-y-2">
            <AnimatePresence initial={false}>
              {feed.length === 0 && (
                <div className="rounded-2xl border border-dashed border-zinc-200 p-4 text-center text-sm text-zinc-400">
                  Answer a few questions and watch the adjustments appear here.
                </div>
              )}
              {feed.map(({ id, iv }) => {
                const ks = KIND_STYLE[iv.kind];
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, x: iv.kind === "gas" ? 24 : -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    className={`flex items-start gap-3 rounded-2xl border p-4 ${ks.bg}`}
                  >
                    <span className="mt-0.5 text-lg">{ks.icon}</span>
                    <div>
                      <div className="font-bold text-zinc-800">
                        {iv.title}
                        <span className="ml-2 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                          {iv.kind}
                        </span>
                      </div>
                      <div className="text-sm text-zinc-600">“{iv.message}”</div>
                      <div className="mt-0.5 text-xs text-zinc-400">{iv.rationale}</div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* ── The parent's view (the selling point) ── */}
        <div className="mt-6 rounded-3xl border border-violet-200 bg-violet-600 p-6 text-white shadow-lg">
          <div className="text-xs font-bold uppercase tracking-widest text-violet-200">What the parent sees</div>
          <div className="mt-2 text-lg font-semibold leading-relaxed">{insight}</div>
          <div className="mt-2 text-xs text-violet-200">
            Delivered in the weekly parent digest — the tutor-quality personalization parents pay for, made visible.
          </div>
        </div>
      </div>
    </div>
  );
}
