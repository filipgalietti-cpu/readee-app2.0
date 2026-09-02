"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { NarrationId, NarrationLine, PlacementResult } from "@/lib/placement/types";
import { playAudioUrl, stopAudio } from "@/lib/audio";
import { Glyph } from "@/app/_components/Glyph";
import { Bunny } from "@/app/_components/Bunny/Bunny";
import { PercentileBar } from "./PercentileBar";
import { SkillBar } from "./SkillBar";
import { PathRoute } from "./PathRoute";
import { buildRevealCopy, narrationFor, type RevealCopy } from "./copy";
import { AUTO_ADVANCE_MS, CARD_SLIDE, COUNT_MS, NODE_GAP_MS, POP_GAP_S, RISE, riseT, useCountUp, useReduced, wait } from "./motion";

export type RevealWizardProps = {
  result: PlacementResult;
  /** Where a narration line's audio lives, or null when there is none (the card then runs its motion on mount). */
  audioUrlFor: (line: NarrationLine) => string | null;
  onStartPlan: () => void;
  onNotNow: () => void;
  onSkipToReport: () => void;
  /** Signed URL for the passage recording; the button only shows when result.passageRecordingPath is set. */
  recordingUrl?: string | null;
};

const CARD_IDS = ["strengths", "number", "placement", "skills", "path", "plan", "ask"] as const;
type CardId = (typeof CARD_IDS)[number];

/** How long a segment holds when there is no audio to time it. */
const SEGMENT_MS: Record<CardId, number> = {
  strengths: 1400,
  number: 2400,
  placement: 1600,
  skills: 1200,
  path: 1800,
  plan: 1400,
  ask: 1400,
};

const SURFACE = "rounded-2xl border border-zinc-200 bg-white shadow-[0_4px_14px_-4px_rgba(49,46,129,0.20)]";
/** The same surface, applied only at desktop width. Written out in full so Tailwind can see every class. */
const SURFACE_2XL = "@2xl:rounded-2xl @2xl:border @2xl:border-zinc-200 @2xl:bg-white @2xl:shadow-[0_4px_14px_-4px_rgba(49,46,129,0.20)]";

function linesFor(result: PlacementResult, id: CardId): NarrationLine[] {
  const ids: NarrationId[] = id === "skills" ? ["skill-decoding", "skill-fluency", "skill-comprehension"] : [id];
  return ids.map((n) => narrationFor(result, n)).filter((l): l is NarrationLine => l !== null);
}

/**
 * Cards R2 to R8. The root is a container: below 672 px wide it is the phone
 * layout, at or above it every card spreads into its desktop layout, so the
 * same component serves a phone, a tablet and a 1000 px frame.
 */
export function RevealWizard({ result, audioUrlFor, onStartPlan, onNotNow, onSkipToReport, recordingUrl = null }: RevealWizardProps) {
  const reduced = useReduced();
  const copy = useMemo(() => buildRevealCopy(result), [result]);
  const [index, setIndex] = useState(0);
  const [voiceOn, setVoiceOn] = useState(true);
  const [stage, setStage] = useState(0);
  const [caption, setCaption] = useState("");
  const voiceRef = useRef(true);
  const runRef = useRef(0);
  const cancelRef = useRef<() => void>(() => {});
  const touchX = useRef<number | null>(null);
  const last = CARD_IDS.length - 1;
  const cardId = CARD_IDS[index];

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => Math.max(0, Math.min(last, i + delta)));
    },
    [last],
  );

  const playLine = useCallback(
    (url: string) =>
      new Promise<"ended" | "cancelled">((resolve) => {
        cancelRef.current = () => {
          stopAudio();
          resolve("cancelled");
        };
        playAudioUrl(url).then(() => resolve("ended"));
      }),
    [],
  );

  // One run per card: narrate each line (when the voice is on and audio
  // exists), start that line's motion as it begins, and auto-advance 1.5 s
  // after the last line ends.
  useEffect(() => {
    const token = ++runRef.current;
    const alive = () => runRef.current === token;
    const lines = linesFor(result, cardId);
    let playedAny = false;
    setStage(0);
    setCaption(lines[0]?.text ?? "");
    (async () => {
      const count = Math.max(1, lines.length);
      for (let i = 0; i < count; i++) {
        if (!alive()) return;
        setStage(i);
        const line = lines[i] ?? null;
        if (line) setCaption(line.text);
        const url = voiceRef.current && line ? audioUrlFor(line) : null;
        if (url) {
          playedAny = true;
          await playLine(url);
        } else {
          await wait(SEGMENT_MS[cardId]);
        }
      }
      if (!alive()) return;
      setStage(count);
      if (playedAny && voiceRef.current && index < last) {
        await wait(AUTO_ADVANCE_MS);
        if (alive() && voiceRef.current) go(1);
      }
    })();
    return () => {
      runRef.current++;
      cancelRef.current();
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const toggleVoice = useCallback(() => {
    setVoiceOn((v) => {
      const next = !v;
      voiceRef.current = next;
      if (!next) cancelRef.current();
      return next;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const hearRecording = useCallback(() => {
    if (recordingUrl) void playAudioUrl(recordingUrl);
  }, [recordingUrl]);

  let card: React.ReactNode;
  switch (cardId) {
    case "strengths":
      card = <StrengthsCard copy={copy} reduced={reduced} />;
      break;
    case "number":
      card = (
        <NumberCard
          copy={copy}
          reduced={reduced}
          hasRecording={result.passageRecordingPath !== null && recordingUrl !== null}
          onHear={hearRecording}
        />
      );
      break;
    case "placement":
      card = <PlacementCard copy={copy} reduced={reduced} />;
      break;
    case "skills":
      card = <SkillsCard copy={copy} stage={stage} />;
      break;
    case "path":
      card = <PathCard copy={copy} reduced={reduced} />;
      break;
    case "plan":
      card = <PlanCard copy={copy} reduced={reduced} />;
      break;
    case "ask":
      card = <AskCard copy={copy} reduced={reduced} onStartPlan={onStartPlan} onNotNow={onNotNow} />;
      break;
  }

  const backButton = (
    <button
      type="button"
      aria-label="Back"
      onClick={() => go(-1)}
      disabled={index === 0}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-zinc-400 disabled:opacity-0"
    >
      <Glyph name="chevron-left" size={22} />
    </button>
  );
  const dots = (
    <div className="flex shrink-0 items-center gap-2" aria-label={`Card ${index + 1} of ${CARD_IDS.length}`}>
      {CARD_IDS.map((id, i) => (
        <motion.span
          key={id}
          className={`h-2 rounded-full ${i === index ? "bg-violet-600" : "bg-violet-200"}`}
          initial={false}
          animate={{ width: i === index ? 24 : 8 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
        />
      ))}
    </div>
  );
  const nextButton =
    index < last ? (
      <button
        type="button"
        aria-label="Next"
        onClick={() => go(1)}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white shadow-[0_8px_24px_-8px_rgba(139,92,246,0.45)] hover:bg-violet-700 @2xl:h-14 @2xl:w-14"
      >
        <Glyph name="arrow-right" size={22} />
      </button>
    ) : (
      <span className="h-12 w-12 shrink-0 @2xl:h-14 @2xl:w-14" />
    );

  return (
    <div
      className="flex h-full flex-col bg-zinc-50 text-zinc-900 @container"
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const x0 = touchX.current;
        const x1 = e.changedTouches[0]?.clientX;
        touchX.current = null;
        if (x0 === null || x1 === undefined) return;
        const dx = x1 - x0;
        if (dx < -48) go(1);
        if (dx > 48) go(-1);
      }}
    >
      <div className="flex items-center justify-between px-5 pt-4 @2xl:px-10 @2xl:pt-6">
        <button type="button" onClick={onSkipToReport} className="text-sm font-semibold text-violet-700 @2xl:text-base">
          Skip to full report
        </button>
        <button
          type="button"
          aria-pressed={voiceOn}
          aria-label={voiceOn ? "Turn the voice off" : "Turn the voice on"}
          onClick={toggleVoice}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-violet-700 shadow-sm ring-1 ring-zinc-200 @2xl:h-12 @2xl:w-12"
        >
          <Glyph name={voiceOn ? "volume2" : "volume-x"} size={20} />
        </button>
      </div>

      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-5 py-6 @2xl:px-12 @2xl:py-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            key={cardId}
            className="my-auto w-full"
            initial={reduced ? false : { opacity: 0, y: CARD_SLIDE.y }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: reduced ? 0 : CARD_SLIDE.duration, ease: "easeOut" }}
          >
            {card}
          </motion.section>
        </AnimatePresence>
      </div>

      {/* Pinned chrome. Phone: caption line, then back / dots / next. Desktop: one row, caption beside the arrow. */}
      <div className="relative z-10 border-t border-violet-100 bg-zinc-50 px-5 pb-6 pt-3 @2xl:px-8 @2xl:pt-4">
        <p className="min-h-10 text-sm leading-5 text-zinc-500 @2xl:hidden" aria-live="polite">
          {caption}
        </p>
        <div className="mt-3 flex items-center justify-between @2xl:mt-0 @2xl:gap-6">
          {backButton}
          {dots}
          <p className="hidden min-w-0 flex-1 text-base leading-6 text-zinc-500 @2xl:line-clamp-2" aria-live="polite">
            {caption}
          </p>
          {nextButton}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ cards */

type CardProps = { copy: RevealCopy; reduced: boolean };

const rise = (reduced: boolean, delay = 0) => ({
  initial: reduced ? false : RISE.initial,
  animate: RISE.animate,
  transition: riseT(reduced ? 0 : delay),
});

const H2 = "text-2xl font-semibold text-zinc-900 @2xl:text-4xl";

function StrengthsCard({ copy, reduced }: CardProps) {
  const n = copy.strengths.length;
  return (
    <div>
      <motion.h2 className={H2} {...rise(reduced)}>
        {copy.headline}
      </motion.h2>
      <ul className="mt-6 grid gap-3 @2xl:mt-8 @2xl:grid-cols-2 @2xl:gap-6">
        {copy.strengths.map((s, i) => (
          <motion.li
            key={s}
            className={`flex items-center gap-3 @2xl:gap-4 @2xl:p-5 ${SURFACE_2XL}`}
            initial={reduced ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut", delay: reduced ? 0 : POP_GAP_S * (i + 1) }}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 @2xl:h-12 @2xl:w-12">
              <Glyph name="check" size={20} />
            </span>
            <span className="text-lg text-zinc-800 @2xl:text-xl @2xl:font-semibold">{s}</span>
          </motion.li>
        ))}
      </ul>
      {copy.momentLine && (
        <motion.p className="mt-6 text-base text-zinc-500 @2xl:mt-8 @2xl:text-xl" {...rise(reduced, POP_GAP_S * (n + 1) + 0.35)}>
          {copy.momentLine}
        </motion.p>
      )}
      <motion.p className="mt-8 text-xs text-zinc-400 @2xl:text-sm" {...rise(reduced, POP_GAP_S * (n + 1) + 0.7)}>
        {copy.metaLine}
      </motion.p>
    </div>
  );
}

function NumberCard({ copy, reduced, hasRecording, onHear }: CardProps & { hasRecording: boolean; onHear: () => void }) {
  const n = copy.number;
  const [benchOn, setBenchOn] = useState(reduced);
  const [barOn, setBarOn] = useState(reduced);
  const value = useCountUp(n?.wcpm ?? 0, true, { instant: reduced });

  useEffect(() => {
    if (reduced) return;
    const a = window.setTimeout(() => setBenchOn(true), COUNT_MS);
    const b = window.setTimeout(() => setBarOn(true), COUNT_MS + 400);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [reduced]);

  if (!n) {
    return (
      <div>
        <h2 className={H2}>Reading speed</h2>
        <p className="mt-4 text-base text-zinc-600 @2xl:text-xl">{copy.childName} did not read a timed passage today, so there is no speed to show yet.</p>
      </div>
    );
  }

  return (
    <div className="@2xl:grid @2xl:grid-cols-2 @2xl:items-center @2xl:gap-12">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 @2xl:text-sm">{n.dataLabel}</p>
        <div className="mt-4 @2xl:mt-6">
          <div className="text-7xl font-semibold leading-none text-violet-700 tabular-nums @2xl:text-9xl">{value}</div>
          <div className="mt-2 text-sm text-zinc-500 @2xl:mt-3 @2xl:text-lg">words per minute</div>
        </div>
        {n.benchmark !== null && (
          <motion.div
            className="mt-4 @2xl:mt-8"
            initial={false}
            animate={{ opacity: benchOn ? 1 : 0 }}
            transition={{ duration: reduced ? 0 : 0.35 }}
          >
            <div className="text-3xl font-semibold leading-none text-zinc-400 tabular-nums @2xl:text-5xl">{n.benchmark}</div>
            <div className="mt-1 text-sm text-zinc-500 @2xl:mt-2 @2xl:text-lg">{n.benchmarkLabel}</div>
          </motion.div>
        )}
      </div>
      <div className="mt-6 @2xl:mt-0">
        {n.percentile !== null && <PercentileBar percentile={n.percentile} childName={copy.childName} animate={barOn} />}
        <p className="mt-6 text-base leading-6 text-zinc-700 @2xl:mt-8 @2xl:text-xl @2xl:leading-8">{n.sentence}</p>
        <p className="mt-2 text-xs text-zinc-400 @2xl:text-sm">{n.source}</p>
        {hasRecording && (
          <button
            type="button"
            onClick={onHear}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm ring-1 ring-zinc-200 @2xl:mt-6 @2xl:text-base"
          >
            <Glyph name="play" size={16} />
            Hear 8 seconds of {copy.childName} reading
          </button>
        )}
      </div>
    </div>
  );
}

function BandChip({ band }: { band: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-violet-600 to-violet-500 px-3 py-1 text-sm font-semibold text-white @2xl:px-4 @2xl:py-2 @2xl:text-base">
      {band}
    </span>
  );
}

function PlacementCard({ copy, reduced }: CardProps) {
  const p = copy.placement;
  return (
    <div className="@2xl:grid @2xl:grid-cols-3 @2xl:items-start @2xl:gap-10">
      <div className="@2xl:col-span-2">
        <motion.div className="flex flex-wrap items-center gap-2 @2xl:gap-3" {...rise(reduced)}>
          <BandChip band={p.band} />
          <span aria-hidden className="text-zinc-400">
            ·
          </span>
          <h2 className="text-xl font-semibold text-zinc-900 @2xl:text-3xl">{p.category}</h2>
        </motion.div>
        <motion.p className="mt-5 text-lg leading-7 text-zinc-800 @2xl:mt-8 @2xl:text-2xl @2xl:leading-9" {...rise(reduced, 0.35)}>
          {p.support}
        </motion.p>
      </div>
      {p.reassurance && (
        <motion.p
          className="mt-6 border-l-2 border-violet-200 pl-4 text-base leading-6 text-zinc-500 @2xl:mt-2 @2xl:rounded-2xl @2xl:border-l-0 @2xl:bg-violet-50 @2xl:p-6 @2xl:text-lg @2xl:leading-7 @2xl:text-zinc-600"
          {...rise(reduced, 1.2)}
        >
          {p.reassurance}
        </motion.p>
      )}
    </div>
  );
}

function SkillsCard({ copy, stage }: { copy: RevealCopy; stage: number }) {
  return (
    <div>
      <h2 className={H2}>Three skills</h2>
      <div className="mt-6 grid gap-6 @2xl:mt-8 @2xl:grid-cols-3">
        {copy.skills.map((s, i) => (
          <div key={s.id} className={`@2xl:p-6 ${SURFACE_2XL}`}>
            <SkillBar icon={s.icon} label={s.label} value={s.value} fillPct={s.fillPct} meaning={s.meaning} animate={stage >= i} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PathCard({ copy, reduced }: CardProps) {
  const total = copy.path.steps.length;
  const [lit, setLit] = useState(reduced ? total : 0);
  useEffect(() => {
    if (reduced) {
      setLit(total);
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setLit(i);
      if (i >= total) clearInterval(id);
    }, NODE_GAP_MS);
    return () => clearInterval(id);
  }, [reduced, total]);

  return (
    <div>
      <motion.h2 className={H2} {...rise(reduced)}>
        {copy.childName}&apos;s path
      </motion.h2>
      <motion.div className={`mt-4 p-4 @2xl:p-6 ${SURFACE}`} {...rise(reduced, 0.2)}>
        <PathRoute
          steps={copy.path.steps}
          milestones={copy.path.milestones}
          lessons={copy.path.lessons}
          weeks={copy.path.weeks}
          minutesPerDay={copy.path.minutesPerDay}
          reviewedBy={copy.path.reviewedBy}
          litCount={lit}
          childName={copy.childName}
        />
      </motion.div>
    </div>
  );
}

function PlanCard({ copy, reduced }: CardProps) {
  const p = copy.plan;
  return (
    <div className="@2xl:grid @2xl:grid-cols-5 @2xl:items-start @2xl:gap-10">
      <div className="@2xl:col-span-2">
        <motion.h2 className={`${H2} @2xl:leading-tight`} {...rise(reduced)}>
          {p.dose}
        </motion.h2>
        <motion.p className="hidden text-sm text-zinc-500 @2xl:mt-4 @2xl:block @2xl:text-base" {...rise(reduced, 0.2)}>
          {p.projection}
        </motion.p>
      </div>
      <motion.div className={`mt-4 p-4 @2xl:col-span-3 @2xl:mt-0 @2xl:p-6 ${SURFACE}`} {...rise(reduced, 0.2)}>
        <ul className="space-y-3">
          {p.milestones.map((m) => (
            <li key={m.date} className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 @2xl:h-10 @2xl:w-10">
                <Glyph name="flag" size={18} />
              </span>
              <span className="font-semibold text-zinc-900 @2xl:text-lg">{m.label}</span>
              <span className="ml-auto text-sm text-zinc-500 @2xl:text-base">{m.month}</span>
            </li>
          ))}
        </ul>
        <h3 className="mt-6 text-base font-semibold text-zinc-900 @2xl:mt-8 @2xl:text-lg">{p.tipsHeading}</h3>
        <ol className="mt-3 space-y-3 @2xl:mt-4">
          {p.tips.map((tip, i) => (
            <li key={tip} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700 @2xl:h-7 @2xl:w-7 @2xl:text-sm">
                {i + 1}
              </span>
              <span className="text-base leading-6 text-zinc-700 @2xl:text-lg @2xl:leading-7">{tip}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-xs text-zinc-400 @2xl:hidden">{p.projection}</p>
      </motion.div>
    </div>
  );
}

function AskCard({ copy, reduced, onStartPlan, onNotNow }: CardProps & { onStartPlan: () => void; onNotNow: () => void }) {
  const a = copy.ask;
  return (
    <div className="@2xl:mx-auto @2xl:max-w-2xl @2xl:text-center">
      <motion.h2 className={H2} {...rise(reduced)}>
        {a.headline}
      </motion.h2>
      <motion.p className="mt-2 text-base text-zinc-600 @2xl:mt-3 @2xl:text-lg" {...rise(reduced, 0.2)}>
        {a.line}
      </motion.p>
      <motion.div className="mt-6 flex flex-col items-center gap-4 @2xl:mt-8 @2xl:flex-row @2xl:justify-center @2xl:gap-8" {...rise(reduced, 0.35)}>
        <div className="h-48 w-44 shrink-0" aria-hidden>
          <Bunny outfitId="bunny_classic" />
        </div>
        <button
          type="button"
          onClick={onStartPlan}
          className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 px-6 py-4 text-lg font-semibold text-white shadow-[0_8px_24px_-8px_rgba(139,92,246,0.45)] hover:from-violet-700 hover:to-violet-600 hover:shadow-[0_12px_28px_-8px_rgba(139,92,246,0.55)] @2xl:w-auto @2xl:px-12 @2xl:py-5 @2xl:text-xl"
        >
          {a.button}
        </button>
      </motion.div>
      {/* The dated trial timeline: today, the reminder, the first charge. */}
      <motion.ol className="mt-5 flex flex-col gap-2 @2xl:mt-4 @2xl:flex-row @2xl:justify-center @2xl:gap-8" {...rise(reduced, 0.5)}>
        {a.timeline.map((step, i) => (
          <li key={step.when} className="flex items-center gap-3 text-sm text-zinc-600 @2xl:flex-col @2xl:items-center @2xl:gap-1 @2xl:text-base">
            <span
              className={`flex h-2 w-2 shrink-0 rounded-full @2xl:h-3 @2xl:w-3 ${i === 0 ? "bg-violet-600" : "bg-violet-200"}`}
              aria-hidden
            />
            <span className="text-left @2xl:text-center">
              <span className="font-semibold text-zinc-800">{step.when}</span>
              <span className="@2xl:hidden"> · </span>
              <span className="@2xl:block">{step.text}</span>
            </span>
          </li>
        ))}
      </motion.ol>
      <motion.p className="mt-2 text-xs text-zinc-500 @2xl:text-sm" {...rise(reduced, 0.5)}>
        Cancel anytime in one tap.
      </motion.p>
      <motion.p className="mt-4 flex items-center gap-2 text-sm text-zinc-600 @2xl:mt-3 @2xl:justify-center @2xl:text-base" {...rise(reduced, 0.6)}>
        <Glyph name="shield-check" size={16} className="text-emerald-600" />
        {a.trust}
      </motion.p>
      <motion.div className="mt-8 @2xl:mt-6" {...rise(reduced, 0.7)}>
        <button type="button" onClick={onNotNow} className="text-sm font-semibold text-zinc-600 underline-offset-2 hover:underline @2xl:text-base">
          {a.notNow}
        </button>
        <p className="mt-1 text-xs text-zinc-400 @2xl:text-sm">{a.notNowSub}</p>
      </motion.div>
    </div>
  );
}
