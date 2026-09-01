"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { LessonDef, LearningEvent } from "@/lib/lesson-engine/types";
import { getInteraction } from "@/lib/lesson-engine/registry";
import { emitLearningEvent } from "@/lib/lesson-engine/events";
import { playNarration, stopNarration, replayNarration, speak, sfxComplete } from "@/lib/lesson-engine/cues";
import { LessonShellDesktop, CelebrationLeftPanel } from "@/app/components/lesson/LessonShellDesktop";
import { Bunny, BunnyReaction } from "@/app/_components/Bunny/Bunny";
import TextFX from "./TextFX";
import LessonImage from "./LessonImage";
import { playUrl } from "@/lib/lesson-engine/cues";

/** Purpose chips in KID language (the internal names are authoring jargon). */
const PURPOSE_LABEL: Record<string, string> = {
  hook: "Let's Look",
  model: "Watch Me",
  guided: "Your Turn",
  apply: "You Try",
  challenge: "All By Yourself",
  celebrate: "You Did It!",
};

/**
 * The lesson runtime, mounted on the REAL lesson shell (LessonShellDesktop).
 * Fully data-driven: scenes come from a LessonDef; interactions resolve through
 * the registry; narration cues fire off Whisper word-timestamps (rAF clock);
 * progression is input-gated (`gate`), never timer-driven.
 * A new lesson should require ZERO changes here.
 */
export default function LessonRunner({
  lesson,
  onEvent,
}: {
  lesson: LessonDef;
  onEvent?: (e: LearningEvent) => void;
}) {
  const [idx, setIdx] = useState(0);
  // Scene-SCOPED flags: store the scene id the flag belongs to instead of a
  // boolean reset in an effect. A boolean stays stale for the first render of
  // the next scene (effects run after render), which made back-to-back cue
  // scenes fire their transform instantly on arrival. Id-comparison can't go
  // stale — a new scene id simply doesn't match.
  const [solvedScene, setSolvedScene] = useState<string | null>(null);
  const [solveWasCorrect, setSolveWasCorrect] = useState(true);
  const [wrongTick, setWrongTick] = useState(0);
  const [cueScene, setCueScene] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const sceneStart = useRef(0);

  const scene = lesson.scenes[idx];
  const isLast = idx === lesson.scenes.length - 1;
  const inter = scene.interaction;
  const timing = lesson.timings?.[scene.id];
  const fallbackMs = timing ? Math.round((timing.duration + 3) * 1000) : 12000;
  const solved = solvedScene === scene.id;
  const cueFired = cueScene === scene.id;

  useEffect(() => {
    const sid = scene.id;
    sceneStart.current = Date.now();
    if (scene.narration) {
      playNarration(scene.narration.audio, {
        cues: scene.cues,
        words: timing?.words,
        onCue: (c) => {
          if (c.do.effect === "fire") setCueScene(sid);
        },
        onEnded: () => setCueScene(sid), // reveal never stranded
        onPlayingChange: setAudioPlaying,
      });
    }
    return () => stopNarration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  function handleSolved(meta?: { attempts?: number; correct?: boolean }) {
    setSolvedScene(scene.id);
    setSolveWasCorrect(meta?.correct !== false);
    const e: LearningEvent = {
      lessonId: lesson.id,
      sceneId: scene.id,
      conceptId: lesson.concepts[0] ?? lesson.standard,
      interactionType: inter?.type ?? "info",
      correct: meta?.correct ?? true,
      attempts: meta?.attempts ?? 1,
      responseTimeMs: Date.now() - sceneStart.current,
      ts: Date.now(),
    };
    emitLearningEvent(e);
    onEvent?.(e);
  }

  function goNext() {
    if (isLast) {
      sfxComplete();
      setDone(true);
      if (lesson.completion) {
        window.setTimeout(() => playUrl(`/audio/lessons-v2/${lesson.id}/complete.mp3`), 600);
      }
      return;
    }
    setIdx((n) => n + 1);
  }

  function replay() {
    if (scene.narration) replayNarration(scene.narration.audio);
    else speak(scene.prompt);
  }

  const canAdvance = scene.gate === "none" || solved;

  const Renderer = inter ? getInteraction(inter.type) : null;
  // key=scene.id is LOAD-BEARING: consecutive scenes often use the same
  // interaction type (transform → transform), and without a key React reuses
  // the component instance — the new scene arrives pre-solved with stale state.
  const interactionEl =
    inter && Renderer ? (
      <Renderer
        key={scene.id}
        data={inter}
        auto={scene.auto}
        cue={cueFired}
        fallbackMs={fallbackMs}
        words={lesson.timings?.[`${scene.id}-sentence`]?.words}
        onSolved={handleSolved}
        onWrong={() => setWrongTick((t) => t + 1)}
      />
    ) : null;

  const replayBtn = (
    <button
      onClick={replay}
      className="inline-flex items-center gap-2 rounded-full border border-indigo-200 px-5 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
    >
      ► Play again
    </button>
  );

  const full = scene.layout === "full";
  let leftSlot: ReactNode = undefined;
  let contentSlot: ReactNode;

  if (done) {
    leftSlot = (
      <div className="relative flex h-full w-full items-center justify-center">
        <div className="relative flex h-[74%] w-[88%] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-violet-100 to-indigo-100 shadow-[0_8px_24px_-8px_rgba(108,76,224,0.3)]">
          <div className="h-[64%] w-[64%]">
            <BunnyReaction outfitId={null} state="levelup" />
          </div>
        </div>
      </div>
    );
    contentSlot = (
      <div className="m-auto w-full">
        <div className="mb-3 inline-flex rounded-full bg-violet-50 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-violet-500">
          You Did It!
        </div>
        <div className="text-[44px] font-bold leading-[1.15] tracking-tight text-violet-700 [text-wrap:balance]">
          {lesson.completion?.title ?? "Lesson complete!"}
        </div>
        <p className="mt-6 max-w-[460px] text-xl leading-relaxed text-zinc-500">
          {lesson.completion?.body ?? lesson.objective}
        </p>
      </div>
    );
  } else if (full) {
    contentSlot = (
      <div className="m-auto flex w-full flex-col items-center gap-6 text-center">
        <div className="flex flex-col items-center gap-2.5">
          <div className="rounded-full bg-violet-50 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-violet-500">
            {PURPOSE_LABEL[scene.purpose] ?? scene.purpose}
          </div>
          <div className="max-w-[600px] text-[32px] font-bold leading-[1.2] tracking-tight text-[#1e1b3a] [text-wrap:balance]">
            {scene.prompt}
          </div>
        </div>
        {scene.image && <LessonImage src={scene.image} containerClassName="h-40 w-64 rounded-2xl" className="h-full w-full object-contain drop-shadow-sm" />}
        <div className="w-full">{interactionEl ?? <div className="text-6xl">✦</div>}</div>
        {replayBtn}
      </div>
    );
  } else {
    // SPLIT (the signature layout): LEFT = the big visual — the interaction if
    // there is one, else the scene picture LARGE, else the motion-library stage
    // (the key sentence, animated). The visual side is never empty.
    leftSlot = interactionEl ?? (
      scene.image ? (
        <div className="lv2-kenburns flex h-full w-full items-center justify-center">
          <LessonImage src={scene.image} containerClassName="h-[92%] w-[94%] rounded-3xl" className="h-full w-full rounded-3xl object-contain drop-shadow-xl" />
        </div>
      ) : scene.fx ? (
        <TextFX text={scene.fx.text} effect={scene.fx.effect} />
      ) : (
        <CelebrationLeftPanel />
      )
    );
    contentSlot = (
      <div className="m-auto flex w-full flex-col gap-7">
        <div>
          <div className="mb-3 inline-flex rounded-full bg-violet-50 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-violet-500">
            {PURPOSE_LABEL[scene.purpose] ?? scene.purpose}
          </div>
          <div className="text-[38px] font-bold leading-[1.18] tracking-tight text-[#1e1b3a] [text-wrap:balance]">
            {scene.prompt}
          </div>
        </div>
        {interactionEl && scene.image && (
          <LessonImage
            src={scene.image}
            containerClassName="h-[280px] w-full rounded-2xl"
            className="h-full w-full rounded-2xl object-contain drop-shadow-lg"
          />
        )}
        <div>{replayBtn}</div>
      </div>
    );
  }

  return (
    <>
      <InteractionStyles />
      {!done && (
        <BunnyCorner
          happy={
            solved &&
            solveWasCorrect &&
            !scene.auto &&
            !!inter &&
            ["choose", "transform", "sort", "sequence", "highlight", "speak"].includes(inter.type)
          }
          wrongTick={wrongTick}
        />
      )}
      <LessonShellDesktop
        slideNum={idx + 1}
        totalSlides={lesson.scenes.length}
        lessonTitle={lesson.title}
        onClose={() => {
          if (typeof window !== "undefined") window.history.back();
        }}
        onNext={goNext}
        nextDisabled={!done && !canAdvance}
        nextLabel={isLast ? "Finish" : "Next →"}
        leftSlot={leftSlot}
        contentSlot={contentSlot}
        audioPlaying={audioPlaying}
        wide={full}
      />
    </>
  );
}

/* The existing Readee mascot, bottom-left like the original slides. Idle bob;
   celebrates (existing BunnyReaction "correct" pose) when the scene is solved. */
function BunnyCorner({ happy, wrongTick }: { happy: boolean; wrongTick: number }) {
  const [sad, setSad] = useState(false);
  const lastTick = useRef(0);
  useEffect(() => {
    if (wrongTick > 0 && wrongTick !== lastTick.current) {
      lastTick.current = wrongTick;
      setSad(true);
      const t = window.setTimeout(() => setSad(false), 1800);
      return () => clearTimeout(t);
    }
  }, [wrongTick]);

  return (
    <motion.div
      className="pointer-events-none fixed bottom-24 left-8 z-[110] h-40 w-40"
      initial={false}
      animate={happy ? { y: [0, -26, 0, -12, 0], scale: [1, 1.08, 1] } : { y: 0, scale: 1 }}
      transition={happy ? { duration: 0.9, ease: "easeOut" } : { duration: 0.2 }}
    >
      {happy ? (
        <BunnyReaction outfitId={null} state="correct" />
      ) : sad ? (
        <BunnyReaction outfitId={null} state="incorrect" />
      ) : (
        <Bunny outfitId={null} />
      )}
    </motion.div>
  );
}

/* Interaction piece styling (tiles, buckets, sparkle). Chrome = the real shell. */
function InteractionStyles() {
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
      .gb-celebrate { font-size:72px; text-align:center; }
      .gb-secondary { border:0; background:#fff; box-shadow:inset 0 0 0 2px #e8e7f2; color:#52525b; border-radius:999px; padding:9px 18px; font-size:14px; font-weight:700; cursor:pointer; transition:all .15s ease; }
      .gb-secondary:hover { box-shadow:inset 0 0 0 2px #c7d2fe; color:#4338ca; }
      .lv2-kenburns img { animation: lv2-kb 16s ease-in-out infinite alternate; }
      @keyframes lv2-kb { from { transform: scale(1); } to { transform: scale(1.05); } }
      @media (prefers-reduced-motion: reduce){ .gb-piece:hover, .gb-item:hover { transform:none } .lv2-kenburns img { animation:none } }
    `}</style>
  );
}
