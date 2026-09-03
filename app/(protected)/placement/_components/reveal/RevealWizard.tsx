"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { NarrationId, NarrationLine, PlacementResult } from "@/lib/placement/types";
import { playAudioUrl, stopAudio } from "@/lib/audio";
import { Glyph, type GlyphName } from "@/app/_components/Glyph";
import { FluentIcon } from "@/app/_components/FluentIcon";
import { PercentileBar } from "./PercentileBar";
import { SkillBar } from "./SkillBar";
import { PathRoute } from "./PathRoute";
import { GradeLadder } from "./GradeLadder";
import { BandChip } from "./BandChip";
import { TrialTimeline } from "./TrialTimeline";
import { GrowthChart } from "./GrowthChart";
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
  /** The child's equipped outfit, for the bunny on the strengths card. */
  outfitId?: string | null;
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
  const ids: NarrationId[] = id === "skills" ? ["skill-decoding", "skill-fluency", "skill-comprehension"] : id === "path" ? ["path", "path-crafted"] : [id];
  return ids.map((n) => narrationFor(result, n)).filter((l): l is NarrationLine => l !== null);
}

/**
 * Cards R2 to R8. The root is a container: below 672 px wide it is the phone
 * layout, at or above it every card spreads into its desktop layout, so the
 * same component serves a phone, a tablet and a 1000 px frame.
 */
export function RevealWizard({ result, audioUrlFor, onStartPlan, onNotNow, onSkipToReport, recordingUrl = null, outfitId = null }: RevealWizardProps) {
  const reduced = useReduced();
  const copy = useMemo(() => buildRevealCopy(result), [result]);
  const [index, setIndex] = useState(0);
  const [voiceOn, setVoiceOn] = useState(true);
  const [stage, setStage] = useState(0);
  const [caption, setCaption] = useState("");
  // Skills card: the footer shows only the hovered (or tapped) skill's line.
  const [hoverSkill, setHoverSkill] = useState<string | null>(null);
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
      card = <StrengthsCard copy={copy} reduced={reduced} outfitId={outfitId} sentence={narrationFor(result, "strengths")?.text ?? copy.headline} />;
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
      card = <SkillsCard copy={copy} stage={stage} hovered={hoverSkill} onHover={setHoverSkill} />;
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

  const shownCaption =
    cardId === "skills"
      ? hoverSkill
        ? (narrationFor(result, `skill-${hoverSkill}` as NarrationId)?.text ?? copy.skills.find((s) => s.id === hoverSkill)?.meaning ?? "")
        : ""
      : caption;
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

      <div data-reveal-viewport className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-5 py-5 @2xl:px-12 @2xl:py-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            key={cardId}
            className="flex flex-1 flex-col"
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
      <div className="relative z-10 border-t border-violet-100 bg-zinc-50 px-5 pb-5 pt-3 @2xl:px-8 @2xl:pb-6 @2xl:pt-4">
        <p className="min-h-10 text-sm leading-5 text-zinc-500 @2xl:hidden" aria-live="polite">
          {shownCaption}
        </p>
        <div className="mt-3 flex items-center justify-between @2xl:mt-0 @2xl:gap-6">
          {backButton}
          {dots}
          <p className="hidden min-w-0 flex-1 text-base leading-6 text-zinc-500 @2xl:line-clamp-2" aria-live="polite">
            {shownCaption}
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

function StrengthsCard({ copy, reduced, sentence }: CardProps & { outfitId: string | null; sentence: string }) {
  const n = copy.strengthTiles.length;
  return (
    <div className="my-auto">
      {/* The reward moment: the celebrating bunny on a soft scene, the spoken line as the hero copy. */}
      <div className="flex flex-col items-center rounded-3xl bg-gradient-to-br from-violet-50 to-indigo-50 px-5 pb-4 pt-3 text-center @2xl:flex-row @2xl:gap-8 @2xl:px-8 @2xl:py-4 @2xl:text-left">
        <motion.div
          className="relative h-32 w-32 shrink-0 @2xl:h-60 @2xl:w-60"
          aria-hidden
          initial={reduced ? false : { opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Image src="/images/ui/bunny-trophy.png" alt="" fill sizes="256px" className="object-contain" priority />
        </motion.div>
        <div>
          <motion.p className="text-xs font-semibold uppercase tracking-wide text-violet-600 @2xl:text-sm" {...rise(reduced)}>
            {copy.metaLine}
          </motion.p>
          <motion.h2 className="mt-1 text-lg font-semibold leading-snug text-zinc-900 @2xl:text-3xl" {...rise(reduced, 0.1)}>
            {sentence}
          </motion.h2>
          <motion.ul className="mt-3 flex flex-wrap justify-center gap-2 @2xl:justify-start" {...rise(reduced, 0.25)}>
            {copy.measured.map((m) => (
              <li key={m.label} className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-100 @2xl:text-sm">
                <Glyph name={m.icon} size={14} />
                {m.label}
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
      <ul className="mt-3 grid gap-2 @2xl:mt-5 @2xl:grid-cols-2 @2xl:gap-4">
        {copy.strengthTiles.map((tile, i) => (
          <motion.li
            key={tile.text}
            className={`flex items-center gap-3 px-3 py-2.5 @2xl:gap-4 @2xl:p-4 ${SURFACE}`}
            initial={reduced ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut", delay: reduced ? 0 : POP_GAP_S * (i + 1) }}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-50 @2xl:h-14 @2xl:w-14">
              <FluentIcon name="carrot" size={24} />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-zinc-900 @2xl:text-xl">{tile.text}</p>
              {tile.evidence && <p className="mt-1 text-sm text-zinc-500 @2xl:text-base">{tile.evidence}</p>}
            </div>
          </motion.li>
        ))}
      </ul>
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
      <div className="my-auto">
        <h2 className={H2}>Reading speed</h2>
        <p className="mt-4 text-base text-zinc-600 @2xl:text-xl">{copy.childName} did not read a timed passage today, so there is no speed to show yet.</p>
      </div>
    );
  }

  return (
    <div className="my-auto @2xl:grid @2xl:grid-cols-2 @2xl:items-center @2xl:gap-12">
      <div>
        <h2 className={H2}>{n.title}</h2>
        <p className="mt-1 text-sm text-zinc-500 @2xl:text-base">{n.subtitle}</p>
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

function PlacementCard({ copy, reduced }: CardProps) {
  const p = copy.placement;
  return (
    <div className="my-auto">
      {/* The ladder is the hero: where the child is, relative to their grade, before any sentence. */}
      <motion.div {...rise(reduced)}>
        <GradeLadder
          enrolled={p.enrolled}
          placed={p.placed}
          childName={copy.childName}
          bandName={p.band}
          categoryText={p.categoryText}
          animate
          instant={reduced}
        />
      </motion.div>
      <div className="mt-5 @2xl:mt-8 @2xl:grid @2xl:grid-cols-3 @2xl:items-start @2xl:gap-x-10">
        <div className="@2xl:col-span-2">
          <motion.div className="flex flex-wrap items-center gap-x-3 gap-y-2" {...rise(reduced, 0.9)}>
            <BandChip band={p.band} />
            <h2 className="text-xl font-semibold text-zinc-900 @2xl:text-3xl">{p.category}</h2>
          </motion.div>
          <motion.p className="mt-3 text-lg leading-7 text-zinc-800 @2xl:mt-5 @2xl:text-2xl @2xl:leading-9" {...rise(reduced, 1.1)}>
            {p.support}
          </motion.p>
        </div>
        {p.reassurance && (
          <motion.p
            className="mt-4 border-l-2 border-violet-200 pl-4 text-base leading-6 text-zinc-500 @2xl:mt-0 @2xl:rounded-2xl @2xl:border-l-0 @2xl:bg-violet-50 @2xl:p-6 @2xl:text-lg @2xl:leading-7"
            {...rise(reduced, 1.6)}
          >
            {p.reassurance}
          </motion.p>
        )}
      </div>
    </div>
  );
}

function SkillsCard({ copy, stage, hovered, onHover }: { copy: RevealCopy; stage: number; hovered: string | null; onHover: (id: string | null) => void }) {
  return (
    <div className="flex flex-1 flex-col @2xl:my-auto @2xl:block @2xl:flex-none">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className={H2}>Three skills</h2>
        <p className="text-xs text-zinc-400 @2xl:text-sm">
          <span className="hidden @2xl:inline">Hover a skill for the detail</span>
          <span className="@2xl:hidden">Tap a skill for the detail</span>
        </p>
      </div>
      <div className="mt-4 flex flex-1 flex-col justify-evenly gap-4 @2xl:mt-8 @2xl:grid @2xl:grid-cols-3 @2xl:gap-6">
        {copy.skills.map((s, i) => (
          <div
            key={s.id}
            role="button"
            tabIndex={0}
            onMouseEnter={() => onHover(s.id)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(s.id)}
            onBlur={() => onHover(null)}
            onClick={() => onHover(s.id)}
            className={`cursor-pointer rounded-2xl transition @2xl:p-6 ${SURFACE_2XL} ${hovered === s.id ? "shadow-[0_0_0_3px_rgba(139,92,246,0.15)]" : ""}`}
          >
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
    <div className="my-auto">
      <motion.h2 className={H2} {...rise(reduced)}>
        {copy.childName}&apos;s Custom Reading Journey
      </motion.h2>
      <motion.p className="mt-1 text-xs leading-snug text-zinc-500 @2xl:text-base" {...rise(reduced, 0.1)}>
        {copy.path.craftedLine}
      </motion.p>
      <motion.div className={`mt-3 p-4 @2xl:px-5 @2xl:py-4 ${SURFACE}`} {...rise(reduced, 0.2)}>
        <PathRoute
          steps={copy.path.steps}
          milestones={copy.path.milestones}
          lessons={copy.path.lessons}
          weeks={copy.path.weeks}
          minutesPerDay={copy.path.minutesPerDay}
          reviewedBy={copy.path.reviewedBy}
          trustChips={copy.path.trustChips}
          litCount={lit}
          childName={copy.childName}
        />
      </motion.div>
    </div>
  );
}

function PlanCard({ copy, reduced }: CardProps) {
  const p = copy.plan;
  const flags = (cls: string) => (
    <ul className={cls}>
      {p.milestones.map((m) => (
        <li key={m.date} className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Glyph name="flag" size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold leading-6 text-zinc-900 @2xl:text-lg">{m.label}</p>
            <p className="text-sm text-zinc-500">{m.month}</p>
          </div>
        </li>
      ))}
    </ul>
  );
  const tips = (
    <ol className="space-y-3">
      {p.tips.map((tip) => (
        <li key={tip.text} className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
            <Glyph name={tip.icon} size={16} />
          </span>
          <span className="text-[15px] leading-6 text-zinc-700 @2xl:text-base @2xl:leading-7">{tip.text}</span>
        </li>
      ))}
    </ol>
  );

  if (!p.growth) {
    // No timed passage (K or an emergent reader): milestones as tiles, no chart.
    return (
      <div className="flex flex-1 flex-col justify-between @2xl:my-auto @2xl:grid @2xl:flex-none @2xl:grid-cols-5 @2xl:items-start @2xl:gap-10">
        <div className="@2xl:col-span-2">
          <motion.h2 className={`${H2} @2xl:leading-tight`} {...rise(reduced)}>
            {p.dose}
          </motion.h2>
          <motion.div className="mt-5" {...rise(reduced, 0.2)}>
            {flags("space-y-4")}
          </motion.div>
        </div>
        <motion.div className={`p-4 @2xl:col-span-3 @2xl:p-6 ${SURFACE}`} {...rise(reduced, 0.35)}>
          <h3 className="text-base font-semibold text-zinc-900 @2xl:text-lg">{p.tipsHeading}</h3>
          <div className="mt-3">{tips}</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col justify-between gap-4 @2xl:my-auto @2xl:grid @2xl:flex-none @2xl:grid-cols-5 @2xl:items-start @2xl:gap-10">
      <div className="@2xl:col-span-2">
        <motion.h2 className={`${H2} @2xl:leading-tight`} {...rise(reduced)}>
          {p.dose}
        </motion.h2>
        <motion.div className="mt-5 hidden @2xl:block" {...rise(reduced, 0.2)}>
          {flags("space-y-4")}
        </motion.div>
        <motion.p className="mt-3 hidden text-sm text-zinc-500 @2xl:mt-6 @2xl:block" {...rise(reduced, 0.3)}>
          {p.projection}
        </motion.p>
        <motion.div className="relative mt-2 hidden h-52 w-52 @2xl:ml-12 @2xl:block" {...rise(reduced, 0.45)}>
          <Image src="/images/ui/bunny-reading.png" alt="" fill sizes="208px" className="object-contain" />
        </motion.div>
      </div>

      <div className="flex flex-col gap-4 @2xl:col-span-3">
        <motion.div className={`p-4 @2xl:p-6 ${SURFACE}`} {...rise(reduced, 0.2)}>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-base font-semibold text-zinc-900 @2xl:text-lg">Reading speed, projected</h3>
            <span className="text-xs text-zinc-500">words a minute</span>
          </div>
          <GrowthChart {...p.growth} reduced={reduced} delay={reduced ? 0 : 0.6} height={180} className="mt-1" />
          <p className="mt-1 text-xs text-zinc-400 @2xl:hidden">{p.projection}</p>
        </motion.div>

        <motion.div className={`p-4 @2xl:p-6 ${SURFACE}`} {...rise(reduced, 0.35)}>
          <h3 className="text-base font-semibold text-zinc-900 @2xl:text-lg">{p.tipsHeading}</h3>
          <div className="mt-3">{tips}</div>
        </motion.div>
      </div>
    </div>
  );
}

function AskCard({ copy, reduced, onStartPlan, onNotNow }: CardProps & { onStartPlan: () => void; onNotNow: () => void }) {
  const a = copy.ask;
  const steps = copy.path.steps.filter((s) => s.kind !== "skipped").length;
  const included: { icon: GlyphName; text: string }[] = [
    { icon: "map", text: `${copy.childName}'s curated path: ${steps} steps, starting where reading is comfortable today` },
    { icon: "mic", text: "Luna listens every day and adjusts the next lesson" },
    { icon: "mail", text: "A weekly progress email with the numbers from this report" },
  ];
  return (
    <div className="my-auto @2xl:grid @2xl:grid-cols-5 @2xl:items-center @2xl:gap-10">
      <div className="@2xl:col-span-3">
        <motion.h2 className={`text-xl font-semibold text-zinc-900 @2xl:text-4xl @2xl:text-4xl`} {...rise(reduced)}>
          {a.headline}
        </motion.h2>
        <motion.p className="mt-1.5 text-sm text-zinc-700 @2xl:mt-3 @2xl:text-xl" {...rise(reduced, 0.15)}>
          {a.subhead}
        </motion.p>
        <motion.p className="mt-1 text-xs text-zinc-600 @2xl:text-lg" {...rise(reduced, 0.2)}>
          {a.line.split("Readee+")[0]}<span className="font-semibold text-violet-700">Readee+</span>{a.line.split("Readee+")[1] ?? ""}
        </motion.p>
        <motion.ul className="mt-2.5 space-y-1 @2xl:mt-6 @2xl:space-y-3" {...rise(reduced, 0.3)}>
          {included.map((it) => (
            <li key={it.text} className="flex items-center gap-2 text-xs leading-snug text-zinc-800 @2xl:text-base">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 @2xl:h-9 @2xl:w-9">
                <Glyph name={it.icon} size={16} />
              </span>
              {it.text}
            </li>
          ))}
        </motion.ul>
        {/* Phone: the same trust line already sits on the path card, so the ask stays a one-pager. */}
        <motion.p className="mt-2 hidden items-center gap-2 text-[11px] text-zinc-500 @2xl:mt-6 @2xl:flex @2xl:text-sm" {...rise(reduced, 0.4)}>
          <Glyph name="shield-check" size={16} />
          <span>
            Content created and reviewed by <span className="font-semibold text-zinc-800">{a.reviewer.name}</span>,
            <br />
            {a.reviewer.role}
          </span>
        </motion.p>
      </div>
      <motion.div className={`mt-5 p-3.5 @2xl:col-span-2 @2xl:mt-0 @2xl:p-6 ${SURFACE}`} {...rise(reduced, 0.35)}>
        <p className="text-sm font-bold uppercase tracking-wide text-violet-600 @2xl:text-base">How the trial works</p>
        <div className="mt-2 @2xl:mt-3">
          <TrialTimeline steps={a.timeline} />
        </div>
        <p className="mt-2 text-xs text-zinc-500 @2xl:mt-3">Cancel anytime in one tap.<span className="hidden @2xl:inline"> Nothing is charged before {a.timeline[2]?.when ?? "the trial ends"}.</span></p>
        <button
          type="button"
          onClick={onStartPlan}
          className="mt-3 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 px-6 py-3 text-lg @2xl:mt-4 @2xl:py-3.5 font-semibold text-white shadow-[0_8px_24px_-8px_rgba(139,92,246,0.45)] hover:from-violet-700 hover:to-violet-600"
        >
          {a.button}
        </button>
        <div className="mt-2 text-center @2xl:mt-3">
          <button type="button" onClick={onNotNow} className="text-sm font-semibold text-zinc-600 underline-offset-2 hover:underline">
            {a.notNow}
          </button>
          <p className="mt-0.5 hidden text-xs text-zinc-400 @2xl:block">{a.notNowSub}</p>
        </div>
      </motion.div>
    </div>
  );
}
