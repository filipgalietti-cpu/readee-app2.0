"use client";
import {lessonAutoAdvanceDelay} from "@/lib/lesson-engine/delivery/auto-advance";
import {Volume2} from "lucide-react";
import {useUnitRuntime} from "@/lib/approved-unit/runtime";
import { useSlideTransition } from "@/lib/lesson-engine/delivery/use-slide-transition";
import { narrateScene } from "@/lib/lesson-engine/delivery/scene-narration";
import ReferencePage from "./ReferencePage";
import { readReferencePage } from "@/lib/lesson-engine/delivery/reference-page";
import PrintedPage from "./PrintedPage";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import type { LessonDef, SceneDef } from "@/lib/lesson-engine/types";
import { getInteraction } from "@/lib/lesson-engine/registry";
import {
  reduceEvidence,
  practiceCarrots,
  practiceStreak,
  type EvidenceAction,
  type EvidenceUpdate,
  sceneIsComplete,
  sceneItemIds,
} from "@/lib/lesson-engine/delivery/evidence";
import type {
  AttemptSnapshot,
  AttemptStore,
  ActivitySupport,
} from "@/lib/lesson-engine/delivery/types";
import { useLessonVoice } from "@/lib/lesson-engine/delivery/use-voice";
import {
  Bunny,
  BunnyReaction,
  reactionHoldMs,
  type ReactionState,
} from "@/app/_components/Bunny/Bunny";
import { StreakFire } from "@/app/_components/StreakFire";
import LunaOrb from "@/app/(protected)/luna/_components/LunaOrb";
import SealOfApproval from "@/app/(protected)/practice/_components/SealOfApproval";
import { sfxCorrect, sfxWrong } from "@/lib/lesson-engine/cues";
import "./delivery.css";
import Karaoke from "./Karaoke";
import CompletionParty from "./CompletionParty";
import type { NarrationTimings } from "@/lib/lesson-engine/delivery/word-timings";
import OpeningAmbience from "./OpeningAmbience";

export type CoachedFlowProps = {
  onContinue?: () => void;
  id: string;
  title: string;
  phases: LessonDef[];
  welcome: string;
  completion: string;
  completionTitle: string;
  completionExamples?: string[];
  learned?: string[];
  outfitId?: string;
  completionBonus?: number;
  timings?: NarrationTimings;
  cover?: ReactNode;
  openingSound?: { src: string; label: string; volume?: number; duckVolume?: number };
  renderWarmup?: (onComplete: (carrots: number) => void) => ReactNode;
  warmupCarrots?: number;
  manifest: Record<string, string>;
  store: AttemptStore;
  speechToken?: ActivitySupport["speechToken"];
  evaluateResponse?: ActivitySupport["evaluateResponse"];
  renderVisual?: (scene: SceneDef, props: Record<string, string | number | boolean>, playback: { currentTime: () => number; speaking: boolean; caption: string }) => ReactNode;
};
/** A coached presentation of the existing LessonDef + interaction registry.
 * No theme, story ids, answer keys or subject-specific mechanics belong here.
 * Persistence is injected; preview storage is never production authority.
 */
export default function CoachedFlowRunner({
  id,
  title,
  phases,
  welcome,
  completion,
  completionTitle,
  completionExamples = [],
  learned = [],
  outfitId = "classic",
  completionBonus = 5,
  timings,
  cover,
  openingSound,
  manifest,
  store,
  speechToken,
  evaluateResponse,
  renderVisual,
  renderWarmup,
  warmupCarrots = 0,
  onContinue,
}: CoachedFlowProps) {
  const production=!!useUnitRuntime();
  const [attempt, setAttempt] = useState<AttemptSnapshot | null>(null),
    [started, setStarted] = useState(false),
    [saveError, setSaveError] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  useEffect(() => {
    if (!celebrating) return;
    const timer = setTimeout(() => setCelebrating(false), 4200);
    return () => clearTimeout(timer);
  }, [celebrating]);
  const [capturing, setCapturing] = useState(false);
  const [visible,setVisible] = useState(true);
  useEffect(()=>{const update=()=>setVisible(!document.hidden);update();document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update);},[]);
  const [visual, setVisual] = useState<Record<string, string | number | boolean>>({});
  const [reaction, setReaction] = useState<ReactionState | null>(null),
    [rewardTick, setRewardTick] = useState(0),
    [rewardAmount, setRewardAmount] = useState(0);
  const current = useRef<AttemptSnapshot | null>(null),
    reactionTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    advanced = useRef<string | null>(null);
  const voice = useLessonVoice(manifest, timings);
  const [retryExit, setRetryExit] = useState<string | null>(null);
  const retryLock = useRef(false);
  useEffect(() => {
    if (!retryExit) return;
    const timer = setTimeout(() => next(true), 25000);
    return () => clearTimeout(timer);
    // The correction chain normally advances; this also exits on audio failure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryExit]);
  function save(next: AttemptSnapshot) {
    current.current = next;
    setAttempt(next);
    try {
      store.save(next);
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }
  function fresh() {
    const next: AttemptSnapshot = {
      version: 1,
      sessionId: crypto.randomUUID(),
      flowId: id,
      phase: 0,
      scene: 0,
      evidence: {},
      finished: false,
    };
    save(next);
    setStarted(false);
    setRewardAmount(0);
    setRewardTick(0);
    advanced.current = null;
    voice.stop();
  }
  useEffect(() => {
    let saved: AttemptSnapshot | null = null;
    try {
      saved = store.load(id);
    } catch {
      setSaveError(true);
    }
    if (
      saved &&
      saved.phase >= 0 &&
      saved.phase < phases.length &&
      saved.scene >= 0 &&
      saved.scene < phases[saved.phase].scenes.length
    ) {
      current.current = saved;
      setAttempt(saved);
    } else {
      const next: AttemptSnapshot = {
        version: 1,
        sessionId: crypto.randomUUID(),
        flowId: id,
        phase: 0,
        scene: 0,
        evidence: {},
        finished: false,
      };
      save(next);
    }
    return () => {
      clearTimeout(reactionTimer.current);
    };
  }, [id, store, phases]);
  const phase = phases[attempt?.phase ?? 0],
    scene = phase.scenes[attempt?.scene ?? 0],
    key = `${phase.id}/${scene.id}`;
  const { leaving, advance: next, cancel: cancelTransition } = useSlideTransition(key, commitNext);
  function react(state: ReactionState) {
    clearTimeout(reactionTimer.current);
    setReaction(state);
    reactionTimer.current = setTimeout(() => setReaction(null), reactionHoldMs(state));
  }
  function record(action: EvidenceUpdate, item = "scene") {
    const snapshot = current.current;
    if (!snapshot) return;
    const full = {
      ...action,
      key: `${key}/${item}`,
      skill: scene.skill ?? phase.standard,
    } satisfies EvidenceAction;
    const evidence = reduceEvidence(snapshot.evidence, full);
    if (evidence === snapshot.evidence) return;
    save({ ...snapshot, evidence });
    if (action.type === "answer" || action.type === "read-practice") {
      if (action.type === "read-practice" || action.correct) {
        react("correct");
        sfxCorrect();
        const earned = practiceCarrots(evidence) - practiceCarrots(snapshot.evidence);
        if (earned > 0) {
          setRewardAmount(earned);
          setRewardTick((t) => t + 1);
        }
      } else {
        react("incorrect");
        sfxWrong();
      }
    }
  }
  function help() {
    const snapshot = current.current;
    if (!snapshot) return;
    // Mark all not-yet-solved items. A later item must inherit scene-level help too.
    record({ type: "help" });
    for (const k of Object.keys(snapshot.evidence).filter(
      (k) => k.startsWith(key + "/") && !snapshot.evidence[k].completed,
    )) {
      const evidence = reduceEvidence(current.current!.evidence, {
        key: k,
        skill: scene.skill ?? phase.standard,
        type: "help",
      });
      save({ ...current.current!, evidence });
    }
  }
  const support: ActivitySupport = {
    scene,
    narration: {
      caption: voice.caption,
      activeWord: voice.activeWord,
      speaking: voice.speaking,
      choiceId: voice.choiceId,
      analyser: voice.analyser,
    },
    say: voice.say,
    stopVoice: voice.stop,
    capture: setCapturing,
    help,
    visual: setVisual,
    speechToken,
    evaluateResponse,
    responsePractice: (rubricId) => {
      if (retryLock.current || current.current?.evidence[`${key}/read`]?.completed) return;
      if (current.current?.evidence[`${key}/scene`]?.helped) record({ type: "help" }, "read");
      record({ type: "response-practice", rubricId }, "read");
    },
    reflect: (item) => {
      if (retryLock.current || current.current?.evidence[`${key}/${item}`]?.completed) return false;
      record({ type: "reflection" }, item);
    },
    readPractice: (reading) => {
      if (current.current?.evidence[`${key}/scene`]?.helped) record({ type: "help" }, "read");
      record({ type: "read-practice", reading }, "read");
    },
    answer: (item, correct, submission) => {
      if (retryLock.current) return false;
      if (current.current?.evidence[`${key}/scene`]?.helped) {
        record({ type: "help" }, item);
      }
      record(
        {
          type: "answer",
          submission,
          correct,
          practice:
            scene.evidence !== "assessed" ||
            current.current?.evidence[`${key}/scene`]?.outcome === "unavailable",
        },
        item,
      );
      const mistakes = Object.entries(current.current?.evidence ?? {})
        .filter(([entryKey]) => entryKey.startsWith(key + "/"))
        .reduce((n, [, entry]) => n + Math.max(0, entry.attempts - (entry.completed ? 1 : 0)), 0);
      if (!correct && mistakes >= 2) {
        retryLock.current = true;
        record({ type: "exhausted" }, item);
        const interaction = scene.interaction;
        const solution =
          interaction?.type === "choose"
            ? (interaction.printPage ? scene.feedback?.correct :
              (interaction.options.find((o) => o.id === interaction.correctId)?.spoken ??
              interaction.options.find((o) => o.id === interaction.correctId)?.label))
            : interaction?.type === "sequence" || interaction?.type === "highlight"
              ? interaction.result
              : interaction?.type === "sort"
                ? interaction.items[Number(item)]?.explanation
                : interaction?.type === "speak"
                  ? interaction.text
                  : scene.feedback?.hint;
        setRetryExit(solution ?? scene.feedback?.hint ?? scene.prompt);
        voice.say("Let’s learn this together.", () =>
          voice.say(solution ?? scene.prompt, () =>
            voice.say("We’ll try this again another time. Let’s keep going.", () => next(true)),
          ),
        );
        return false;
      }
      return true;
    },
    finish: () => {
      if (scene.evidence === "demonstration") record({ type: "participated" });
    },
    unavailable: () =>
      record({ type: "unavailable" }, scene.interaction?.type === "speak" ? "read" : "scene"),
  };
  function onSolved(meta?: { correct?: boolean; unavailable?: boolean }) {
    if (meta?.unavailable) {
      support.unavailable();
      return;
    }
    // Success is read from the ledger below. A callback alone cannot unlock Next.
  }
  function commitNext(skipped = false) {
    const s = current.current;
    if (!s || advanced.current === key) return;
    advanced.current = key;
    if (skipped) {
      for (const item of sceneItemIds(scene)) {
        const entry = current.current?.evidence[`${key}/${item}`];
        if (!entry?.completed && entry?.outcome !== "unavailable") record({ type: "skip" }, item);
      }
    }
    voice.stop();
    retryLock.current = false;
    setRetryExit(null);
    setVisual({});
    setCapturing(false);
    const latest = current.current!;
    if (latest.scene + 1 < phase.scenes.length) save({ ...latest, scene: latest.scene + 1 });
    else if (latest.phase + 1 < phases.length)
      save({ ...latest, phase: latest.phase + 1, scene: 0 });
    else {
      save({ ...latest, finished: true });
      setCelebrating(true);
      react("levelup");
      voice.say(completion);
    }
  }
  useEffect(() => {
    if (!started || !attempt || attempt.finished || (renderWarmup && !attempt.warmupDone)) return;
    const exhausted = Object.entries(attempt.evidence).find(
      ([entryKey, entry]) => entryKey.startsWith(key + "/") && entry.outcome === "exhausted",
    );
    if (exhausted) {
      support.answer(exhausted[0].slice(key.length + 1), false);
      return;
    }
    const script = scene.narration?.script ?? scene.prompt;
    if (scene.context && scene.contextMode !== "print-first" && !script.includes(scene.context))
      voice.say(scene.context, () => narrateScene(scene, voice.say));
    else narrateScene(scene, voice.say);
    // A scene owns its narration; callback changes from ledger writes must not restart it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, started, attempt?.warmupDone]);
  useEffect(() => {
    if (voice.error && started && !attempt?.finished) support.unavailable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice.failure]);
  const autoDelay=lessonAutoAdvanceDelay({scene,complete:!!attempt&&sceneIsComplete(attempt.evidence,key,scene),
    started,finished:!!attempt?.finished,warmupReady:!renderWarmup||!!attempt?.warmupDone,
    speechFinished:voice.finished,audioError:voice.error,capturing,retrying:!!retryExit,paused:false,visible});
  useEffect(()=>{
    if(autoDelay===null)return;
    const timer=setTimeout(()=>next(),autoDelay);
    return()=>{clearTimeout(timer);cancelTransition();};
    // The current scene owns this timer. New speech, recording, navigation or
    // a hidden tab cancels it; next() already guards duplicate transitions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[key,autoDelay,voice.finished,cancelTransition]);
  if (!attempt)
    return (
      <div className="le-frame">
        <p>Opening your lesson…</p>
      </div>
    );
  if (started && renderWarmup && !attempt.warmupDone && !attempt.finished)
    return (
      <div className="le-warmup">
        {renderWarmup((earned) => {
          if (current.current?.warmupDone) return;
          save({
            ...current.current!,
            warmupDone: true,
            warmupAwarded: Number.isFinite(earned)
              ? Math.max(warmupCarrots, Math.floor(earned))
              : warmupCarrots,
          });
          setRewardAmount(current.current?.warmupAwarded ?? warmupCarrots);
          setRewardTick((t) => t + 1);
        })}
      </div>
    );
  const carrots =
      practiceCarrots(attempt.evidence) +
      (attempt.warmupDone ? (attempt.warmupAwarded ?? warmupCarrots) : 0) +
      (attempt.finished ? completionBonus : 0),
    Interaction = scene.interaction ? getInteraction(scene.interaction.type) : null;
  const complete = sceneIsComplete(attempt.evidence, key, scene);
  const canNext = scene.gate === "none" || complete;
  const showVisual = !!scene.visual && !(complete && scene.visual.hideOnSuccess);
  const total = phases.reduce((n, p) => n + p.scenes.length, 0),
    position =
      phases.slice(0, attempt.phase).reduce((n, p) => n + p.scenes.length, 0) + attempt.scene;
  return (
    <section aria-label={title} className={`le-frame ${leaving ? "le-is-leaving" : ""}`} inert={leaving} data-scene={scene.id} data-phase={phase.id}>
      <div className="le-progress" aria-label="Lesson progress">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={attempt.finished ? total : position}
          style={{ width: `${((attempt.finished ? total : position) / total) * 100}%` }}
        />
      </div>
      <div className="le-top">
        <span>{attempt.finished ? title : started ? phase.title : title}</span>
        <div className="le-reward-hud">
          <StreakFire consecutiveCorrect={practiceStreak(attempt.evidence)} />
          <div className="le-carrots" key={rewardTick} aria-label={`${carrots} practice carrots`}>
            <img src="/icons/fluent/carrot.svg" width={30} height={30} alt="Carrots" />
            <b>{carrots}</b>
            {rewardAmount > 0 && (
              <span className="le-plus" aria-hidden="true">
                +{rewardAmount}
              </span>
            )}
          </div>
        </div>
      </div>
      {!started && !attempt.finished ? (
        <section className="le-welcome">
          {cover}
          <div>
            <p className="le-eyebrow">{phases[1]?.standard ?? phase.standard}</p>
            <h1>{title}</h1>
            <p>Warm up. Explore. Try it yourself.</p>
            <div className="le-welcome-actions">
              <button
                className="le-primary"
                onClick={() => {
                  setStarted(true);
                  if (!renderWarmup || attempt.warmupDone) voice.say(welcome);
                }}
              >
                {position ? "Continue your practice" : "Let’s begin"} <ArrowRight size={20} />
              </button>
              {openingSound && <OpeningAmbience {...openingSound} duck={voice.speaking} />}
            </div>
          </div>
        </section>
      ) : attempt.finished ? (
        <CompletionParty
          title={completionTitle}
          learned={learned}
          carrots={carrots}
          bonus={completionBonus}
          outfitId={outfitId}
          active={!celebrating}
          onRestart={production?undefined:fresh}
          onContinue={onContinue}
          autoContinue
          narrationFinished={voice.finished && !voice.error}
        />
      ) : (
        <section className={`le-stage le-slide-enter ${showVisual ? "le-with-visual" : ""}`} key={key}>
          <div className="le-prompt">
            <p className="le-eyebrow">
              {phases.length > 1 && attempt.phase === phases.length - 1
                ? "Try it yourself"
                : "Explore"}{" "}
              · {attempt.scene + 1} of {phase.scenes.length}
            </p>
            <h1><Karaoke text={scene.prompt} caption={voice.choiceId != null ? "" : voice.caption} activeWord={voice.activeWord}/></h1>
            {scene.context && <p className="le-context"><Karaoke text={scene.context} caption={voice.choiceId != null ? "" : voice.caption} activeWord={voice.activeWord}/>{scene.contextMode === "print-first" && <button className="le-context-audio" aria-label="Hear the word" onClick={() => { help(); voice.say(scene.context!); }}><Volume2 size={18}/></button>}</p>}
          </div>
          {showVisual && scene.visual && (
            <div className="le-visual">
              {renderVisual?.(scene, { ...scene.visual.props, ...visual, solved: complete, narrationCaption: voice.choiceId != null ? "" : voice.caption, narrationWord: voice.choiceId != null ? -1 : voice.activeWord }, {currentTime: voice.currentTime, speaking: voice.speaking && voice.choiceId == null, caption: voice.choiceId != null ? "" : voice.caption})}
            </div>
          )}
          {scene.referencePage && (!scene.interaction || !complete) && !retryExit && <ReferencePage
            page={scene.referencePage} caption={voice.choiceId ? "" : voice.caption} activeWord={voice.activeWord}
            key={scene.id} disabled={capturing} onSelect={index => voice.say(scene.referencePage!.sections[index].heading)} onRead={index => readReferencePage(index === undefined ? scene.referencePage! : {sections:[scene.referencePage!.sections[index]]}, voice.say)}
          />}
          <div className="le-interaction">
            {retryExit ? (
              <div className="le-retry-exit" role="status">
                <p className="le-eyebrow">Let’s learn this together</p>
                {scene.interaction?.type === "choose" && scene.interaction.printPage && (
                  <PrintedPage page={scene.interaction.printPage} picked={scene.interaction.correctId} solved onPick={() => {}} />
                )}
                <p className="le-sentence">{retryExit}</p>
                <p>We’ll try this again another time.</p>
                <button className="le-primary" onClick={() => next(true)}>
                  Keep going <ArrowRight size={20} />
                </button>
              </div>
            ) : Interaction && scene.interaction ? (
              <Interaction data={scene.interaction} support={support} onSolved={onSolved} />
            ) : (
              <p className="le-model-copy">
                <Karaoke
                  text={scene.narration?.script ?? scene.prompt}
                  caption={voice.choiceId != null ? "" : voice.caption}
                  activeWord={voice.activeWord}
                />
              </p>
            )}
          </div>
        </section>
      )}
      <footer className="le-footer" inert={celebrating}>
        <div className="le-bunny" aria-hidden="true" hidden={attempt.finished}>
          {reaction ? (
            <BunnyReaction state={reaction} outfitId={outfitId} />
          ) : (
            <Bunny outfitId={outfitId} />
          )}
        </div>
        <div className="le-narrator">
          {started && !attempt.finished && scene.interaction?.type === "speak" && scene.interaction.visualFeedback ? (
            <button className="le-mic-narration-replay" aria-label="Replay Luna narration" disabled={capturing} onClick={()=>voice.error && voice.caption ? voice.say(voice.caption, undefined, voice.choiceId ?? undefined) : narrateScene(scene,voice.say)}><Volume2 size={22}/></button>
          ) : <LunaOrb
            size={64}
            analyser={voice.analyser}
            mode={voice.speaking ? "speaking" : "idle"}
            label="Replay Luna narration"
            onTap={() =>
              !capturing &&
              (voice.error && voice.caption ? voice.say(voice.caption, undefined, voice.choiceId ?? undefined) : attempt.finished ? voice.say(completion) : !started ? voice.say(welcome) : narrateScene(scene, voice.say))
            }
          />}
          {voice.error && <p role="status">Audio is not available. Tap Luna to try again.</p>}
        </div>
        {started && !attempt.finished && !retryExit && (
          <div className="le-navigation">
            {scene.feedback?.hint && !canNext && (
              <button
                disabled={capturing}
                onClick={() => {
                  help();
                  voice.say(scene.feedback!.hint);
                }}
              >
                Help
              </button>
            )}
            {!canNext && (
              <button className="le-skip" onClick={() => next(true)}>
                Skip for now
              </button>
            )}
            <button
              className="le-primary"
              disabled={!canNext}
              onClick={() => next()}
              aria-label="Next"
            >
              Next <ArrowRight size={20} />
            </button>
          </div>
        )}
      </footer>
      {celebrating && (
        <div
          className="le-stamp-screen"
          role="dialog"
          aria-modal="true"
          aria-label="Practice celebration"
        >
          <SealOfApproval ribbonText="COMPLETED!" />
          <h1>You did it!</h1>
          <div className="le-summary-carrots">
            <img src="/icons/fluent/carrot.svg" width={52} height={52} alt="" />
            <strong>{carrots} practice carrots</strong>
          </div>
          <button className="le-primary" autoFocus onClick={() => setCelebrating(false)}>
            See my practice <ArrowRight size={20} />
          </button>
        </div>
      )}
      {saveError && (
        <p className="le-save-error" role="alert">
          Your progress could not be saved on this device.
        </p>
      )}
    </section>
  );
}
