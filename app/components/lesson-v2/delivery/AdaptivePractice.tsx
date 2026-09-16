"use client";
import { useUnitRuntime } from "@/lib/approved-unit/runtime";
import {
  useSlideTransition,
  ANSWER_SELECTION_HOLD_MS,
} from "@/lib/lesson-engine/delivery/use-slide-transition";
import { lessonAutoAdvanceDelay } from "@/lib/lesson-engine/delivery/auto-advance";
import { narrateScene } from "@/lib/lesson-engine/delivery/scene-narration";
import PrintedPage from "./PrintedPage";
import ReferencePage from "./ReferencePage";
import { readReferencePage } from "@/lib/lesson-engine/delivery/reference-page";
import { lessonAssetUrl } from "@/lib/lesson-engine/asset-url";
import { spokenSentences } from "@/lib/lesson-engine/delivery/sentences";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { SceneDef } from "@/lib/lesson-engine/types";
import { ArrowRight, Volume2 } from "lucide-react";
import { getInteraction } from "@/lib/lesson-engine/registry";
import {
  reduceEvidence,
  practiceCarrots,
  practiceStreak,
  sceneIsComplete,
  sceneItemIds,
} from "@/lib/lesson-engine/delivery/evidence";
import type { ActivitySupport } from "@/lib/lesson-engine/delivery/types";
import type { NarrationTimings } from "@/lib/lesson-engine/delivery/word-timings";
import { useLessonVoice } from "@/lib/lesson-engine/delivery/use-voice";
import {
  independentResult,
  isPerfectPractice,
  nextPracticeQuestion,
  validPracticeAttempt,
  type PracticeAttempt,
  type PracticeQuestion,
} from "@/lib/lesson-engine/production/practice";
import {
  Bunny,
  BunnyReaction,
  reactionHoldMs,
  type ReactionState,
} from "@/app/_components/Bunny/Bunny";
import { StreakFire } from "@/app/_components/StreakFire";
import LunaOrb from "@/app/(protected)/luna/_components/LunaOrb";
import { sfxCorrect, sfxWrong } from "@/lib/lesson-engine/cues";
import CompletionParty from "./CompletionParty";
import PracticeResults from "./PracticeResults";
import SealOfApproval from "@/app/(protected)/practice/_components/SealOfApproval";
import Karaoke from "./Karaoke";
import "./delivery.css";
/** Local review adapter only. Production must inject authenticated attempt storage
 * and server-owned scoring/rewards before this can write a child's journey. */
export default function AdaptivePractice({
  id,
  title,
  pool,
  standards,
  maxItems,
  manifest,
  timings,
  completion,
  perfectCompletion,
  learned,
  carryCarrots = 0,
  carryStreak = 0,
  sourceAttemptId,
  onExit,
  visiblePassage = false,
  questionTopic = "story",
  speechToken,
  evaluateResponse,
  selectNext = nextPracticeQuestion,
  progressLabel,
  completionTitle,
  renderVisual,
  exam,
}: {
  exam?: {
    autoAdvance?: boolean;
    acknowledgement?: string;
    resultSummary?: (attempt: PracticeAttempt) => string;
    renderResults: (attempt: PracticeAttempt, onBack: () => void) => ReactNode;
  };
  id: string;
  renderVisual?: (scene: SceneDef, props: Record<string, string | number | boolean>) => ReactNode;
  /** Optional checkpoint selection reuses this runner and its evidence/rewards. */
  selectNext?: typeof nextPracticeQuestion;
  progressLabel?: (attempt: PracticeAttempt) => string;
  completionTitle?: string;
  title: string;
  pool: PracticeQuestion[];
  standards: string[];
  maxItems: number;
  manifest: Record<string, string>;
  timings?: NarrationTimings;
  completion: string;
  perfectCompletion?: string;
  learned: string[];
  carryCarrots?: number;
  carryStreak?: number;
  sourceAttemptId?: string;
  onExit: () => void;
  visiblePassage?: boolean;
  questionTopic?: string;
  speechToken?: ActivitySupport["speechToken"];
  evaluateResponse?: ActivitySupport["evaluateResponse"];
}) {
  const runtime = useUnitRuntime();
  const [attempt, setAttempt] = useState<PracticeAttempt | null>(null),
    [saveError, setSaveError] = useState(false),
    [stamp, setStamp] = useState(false),
    [review, setReview] = useState(false),
    [story, setStory] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [resultsVisited, setResultsVisited] = useState(false);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const update = () => setVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  const [capturing, setCapturing] = useState(false);
  const [visual, setVisual] = useState<Record<string, string | number | boolean>>({});
  const [reaction, setReaction] = useState<ReactionState | null>(null);
  const reactionTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const current = useRef<PracticeAttempt | null>(null),
    locked = useRef(false),
    exitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const voice = useLessonVoice(manifest, timings);
  const storageKey = `readee:preview:practice:${id}`;
  function save(next: PracticeAttempt) {
    current.current = next;
    setAttempt(next);
    try {
      if (runtime) runtime.savePractice(next);
      else localStorage.setItem(storageKey, JSON.stringify(next));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }
  function start(replay = false) {
    const fresh: PracticeAttempt = {
      version: 1,
      id: crypto.randomUUID(),
      flowId: id,
      startingStreak: replay ? 0 : Math.max(0, Math.min(10000, Math.floor(carryStreak))),
      sourceAttemptId,
      asked: [],
      results: [],
      evidence: {},
      finished: false,
    };
    const first = selectNext(pool, standards, fresh, maxItems);
    if (!first) throw Error("No reviewed practice questions");
    save({ ...fresh, asked: [first.id] });
    setStamp(false);
    setShowResults(false);
    setResultsVisited(false);
    setReview(false);
    locked.current = false;
  }
  useEffect(() => {
    let saved: unknown;
    try {
      saved = runtime
        ? runtime.loadPractice(id)
        : JSON.parse(localStorage.getItem(storageKey) ?? "null");
    } catch {}
    if (
      validPracticeAttempt(saved, id, pool, maxItems) &&
      (!sourceAttemptId || saved.sourceAttemptId === sourceAttemptId)
    ) {
      current.current = saved;
      setAttempt(saved);
    } else start();
    return () => {
      clearTimeout(exitTimer.current);
      clearTimeout(reactionTimer.current);
    };
    // A keyed practice owns one immutable pool/version.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  const q = pool.find((q) => q.id === attempt?.asked.at(-1));
  const {
    leaving,
    advance: finishQuestion,
    cancel: cancelTransition,
  } = useSlideTransition(q?.id ?? "loading", commitQuestion);
  useEffect(() => setVisual({}), [q?.id]);
  function write(action: Parameters<typeof reduceEvidence>[1]) {
    const a = current.current;
    if (a) {
      const evidence = reduceEvidence(a.evidence, action, a.startingStreak ?? 0);
      if (exam && evidence[action.key])
        evidence[action.key] = { ...evidence[action.key], carrots: 0, streakAfter: 0 };
      save({ ...a, evidence });
    }
  }
  function commitQuestion() {
    clearTimeout(exitTimer.current);
    const a = current.current;
    if (!a || a.finished || !q || a.results.some((r) => r.itemId === q.id)) return;
    const result = independentResult(q, a.evidence);
    if (
      result.outcome === "skipped" &&
      !(
        (q.scene.interaction?.type === "choose" && q.scene.interaction.mode === "reflection") ||
        (q.scene.interaction?.type === "speak" && !!q.scene.interaction.reflection)
      )
    )
      write({ key: `${q.id}/skip`, skill: q.standard, type: "skip" });
    const updated = { ...current.current!, results: [...a.results, result] };
    clearTimeout(reactionTimer.current);
    setReaction(null);
    const next = selectNext(pool, standards, updated, maxItems);
    voice.stop();
    setStory(false);
    setCapturing(false);
    setReview(false);
    locked.current = false;
    if (next) save({ ...updated, asked: [...updated.asked, next.id] });
    else {
      save({ ...updated, finished: true });
      setStamp(true);
      voice.say(
        !exam && perfectCompletion && isPerfectPractice({ ...updated, finished: true }, maxItems)
          ? perfectCompletion
          : completion,
      );
    }
  }
  function readPassage(after?: () => void) {
    if (q?.scene.contextMode === "print-first")
      write({ key: `${q.id}/help`, skill: q.standard, type: "help" });
    const parts = spokenSentences(q?.scene.context ?? "");
    const play = (i: number) => {
      if (i >= parts.length) {
        after?.();
        return;
      }
      voice.say(parts[i], () => play(i + 1));
    };
    play(0);
  }
  useEffect(() => {
    if (!q || attempt?.finished) return;
    if (
      exam &&
      q.scene.evidence === "assessed" &&
      sceneItemIds(q.scene).every(
        (item) => (attempt?.evidence[`${q.id}/${item}`]?.attempts ?? 0) > 0,
      )
    ) {
      locked.current = true;
      if (!exam.autoAdvance) voice.say(exam.acknowledgement ?? "Answer saved.");
      return;
    }
    // On reload a two-error item remains exhausted. Never grant another first try.
    const errors = Object.entries(attempt?.evidence ?? {})
      .filter(([k]) => k.startsWith(q.id + "/"))
      .reduce((n, [, e]) => n + Math.max(0, e.attempts - (e.completed ? 1 : 0)), 0);
    if (errors >= 2) {
      locked.current = true;
      setReview(true);
      return;
    }
    if (visiblePassage && q.scene.context && q.scene.contextMode !== "print-first")
      readPassage(() => narrateScene(q.scene, voice.say));
    else narrateScene(q.scene, voice.say);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q?.id]);
  const examSubmitted =
    !!exam &&
    !!q &&
    q.scene.evidence === "assessed" &&
    sceneItemIds(q.scene).every(
      (item) => (attempt?.evidence[`${q.id}/${item}`]?.attempts ?? 0) > 0,
    );
  useEffect(() => {
    if (!exam?.autoAdvance || !examSubmitted || attempt?.finished || !visible) return;
    locked.current = true;
    // Hold the actual selection on its card before fading, without a separate interstitial.
    // This also resumes a saved submission after a reload and absorbs double taps.
    const timer = setTimeout(finishQuestion, ANSWER_SELECTION_HOLD_MS);
    return () => {
      clearTimeout(timer);
      cancelTransition();
    };
    // A submission belongs to this question; ref-backed evidence supplies the latest save.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q?.id, examSubmitted, attempt?.finished, exam?.autoAdvance, visible, cancelTransition]);
  useEffect(() => {
    // A failed neutral acknowledgement happens after submission; it cannot erase an answer.
    const alreadySubmitted =
      exam &&
      q?.scene.evidence === "assessed" &&
      sceneItemIds(q.scene).every(
        (item) => (current.current?.evidence[`${q.id}/${item}`]?.attempts ?? 0) > 0,
      );
    if (voice.error && q && !attempt?.finished && !alreadySubmitted)
      write({ key: `${q.id}/availability`, skill: q.standard, type: "unavailable" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice.failure]);
  useEffect(() => {
    if (stamp) {
      const timer = setTimeout(() => setStamp(false), 4200);
      return () => clearTimeout(timer);
    }
  }, [stamp]);
  const autoDelay =
    !exam && q
      ? lessonAutoAdvanceDelay({
          scene: q.scene,
          complete: !!attempt && sceneIsComplete(attempt.evidence, q.id, q.scene),
          started: !!attempt,
          finished: !!attempt?.finished,
          warmupReady: true,
          speechFinished: voice.finished,
          audioError: voice.error,
          capturing,
          retrying: review,
          paused: false,
          visible,
        })
      : null;
  useEffect(() => {
    if (autoDelay === null) return;
    const timer = setTimeout(finishQuestion, autoDelay);
    return () => {
      clearTimeout(timer);
      cancelTransition();
    };
    // A timer belongs to one question and is cancelled by replay, recording or pause.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q?.id, autoDelay, voice.finished, cancelTransition]);
  if (!attempt || !q) return <main className="le-frame">Opening practice…</main>;
  const assessedCount = attempt.results.filter((r) => r.outcome === "correct").length;
  const lunaCount = attempt.results.filter(
    (r) => pool.find((q) => q.id === r.itemId)?.scene.interaction?.type === "speak",
  ).length;
  const storyCount = attempt.results.length - lunaCount;
  const hasReading = pool.some((q) => q.phase === "reading-finish");
  const perfectLabel = hasReading
    ? `${assessedCount} ${questionTopic} answers, first try!`
    : `${maxItems} out of ${maxItems}!`;
  const perfect = !exam && !!perfectCompletion && isPerfectPractice(attempt, maxItems);
  const repeatExam = !!exam && !!runtime?.isExamRetry;
  const carrots = repeatExam
    ? 0
    : exam
      ? attempt.results.filter((r) =>
          ["correct", "incorrect", "assisted", "practice"].includes(r.outcome),
        ).length + (attempt.finished ? 3 : 0)
      : carryCarrots +
        practiceCarrots(attempt.evidence) +
        (attempt.finished ? 3 : 0) +
        (perfect ? 3 : 0);
  const deferred = !!exam && q.scene.evidence === "assessed";
  const submitted = examSubmitted;
  const savedInterstitial = submitted && !exam?.autoAdvance;
  const support: ActivitySupport = {
    scene: q.scene,
    deferFeedback: deferred,
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
    speechToken,
    evaluateResponse,
    reflect: (item) => {
      if (
        locked.current ||
        current.current?.evidence[`${q.id}/${item}`]?.completed ||
        (deferred && (current.current?.evidence[`${q.id}/${item}`]?.attempts ?? 0) > 0)
      )
        return false;
      write({ key: `${q.id}/${item}`, skill: q.standard, type: "reflection" });
      setReaction("correct");
      clearTimeout(reactionTimer.current);
      reactionTimer.current = setTimeout(() => setReaction(null), reactionHoldMs("correct"));
    },
    responsePractice: (rubricId) => {
      if (locked.current || current.current?.evidence[`${q.id}/read`]?.completed) return;
      write({ key: `${q.id}/read`, skill: q.standard, type: "response-practice", rubricId });
      sfxCorrect();
      setReaction("correct");
      clearTimeout(reactionTimer.current);
      reactionTimer.current = setTimeout(() => setReaction(null), reactionHoldMs("correct"));
    },
    visual: setVisual,
    finish: () => {},
    readPractice: (reading) => {
      if (locked.current || current.current?.evidence[`${q.id}/read`]?.completed) return;
      if (current.current?.evidence[`${q.id}/help`]?.helped)
        write({ key: `${q.id}/read`, skill: q.standard, type: "help" });
      write({ key: `${q.id}/read`, skill: q.standard, type: "read-practice", reading });
      if (current.current?.evidence[`${q.id}/read`]?.completed) {
        sfxCorrect();
        setReaction("correct");
        clearTimeout(reactionTimer.current);
        reactionTimer.current = setTimeout(() => setReaction(null), reactionHoldMs("correct"));
      }
    },
    help: () => {
      if (
        (q.scene.interaction?.type === "choose" && q.scene.interaction.mode === "reflection") ||
        (q.scene.interaction?.type === "speak" && !!q.scene.interaction.reflection)
      )
        return;
      write({ key: `${q.id}/help`, skill: q.standard, type: "help" });
    },
    unavailable: () =>
      write({ key: `${q.id}/availability`, skill: q.standard, type: "unavailable" }),
    answer: (item, correct, submission) => {
      if (
        locked.current ||
        current.current?.evidence[`${q.id}/${item}`]?.completed ||
        (deferred && (current.current?.evidence[`${q.id}/${item}`]?.attempts ?? 0) > 0)
      )
        return false;
      if (
        !current.current?.evidence[`${q.id}/${item}`]?.attempts &&
        current.current?.evidence[`${q.id}/help`]?.helped
      )
        write({ key: `${q.id}/${item}`, skill: q.standard, type: "help" });
      write({
        key: `${q.id}/${item}`,
        skill: q.standard,
        type: "answer",
        submission,
        correct,
        practice: q.scene.evidence !== "assessed",
      });
      if (deferred) {
        if (
          sceneItemIds(q.scene).every(
            (item) => (current.current?.evidence[`${q.id}/${item}`]?.attempts ?? 0) > 0,
          )
        ) {
          locked.current = true;
          voice.stop();
          if (!exam!.autoAdvance) voice.say(exam!.acknowledgement ?? "Answer saved.");
        }
        return false;
      }
      clearTimeout(reactionTimer.current);
      setReaction(correct ? "correct" : "incorrect");
      reactionTimer.current = setTimeout(
        () => setReaction(null),
        reactionHoldMs(correct ? "correct" : "incorrect"),
      );
      if (correct) sfxCorrect();
      else sfxWrong();
      const evidence = current.current!.evidence;
      const errors = Object.entries(evidence)
        .filter(([k]) => k.startsWith(q.id + "/"))
        .reduce((n, [, e]) => n + Math.max(0, e.attempts - (e.completed ? 1 : 0)), 0);
      if (!correct && errors >= 2) {
        locked.current = true;
        setReview(true);
        const explanation = q.explanation ?? q.scene.feedback?.correct ?? q.scene.prompt;
        voice.say("Let’s learn this together.", () =>
          voice.say(explanation, () => voice.say("Let’s try the next question.", finishQuestion)),
        );
        exitTimer.current = setTimeout(finishQuestion, 25000);
        return false;
      }
      return true;
    },
  };
  const Interaction = q.scene.interaction ? getInteraction(q.scene.interaction.type) : null;
  const solved = sceneIsComplete(attempt.evidence, q.id, q.scene);
  const hideQuestionSource = (solved && !submitted) || review || savedInterstitial;
  if (attempt.finished && showResults)
    return exam ? (
      <>{exam.renderResults(attempt, () => setShowResults(false))}</>
    ) : (
      <PracticeResults
        title={title}
        attempt={attempt}
        pool={pool}
        onExit={onExit}
        onRead={(text) => voice.say(text)}
      />
    );
  return (
    <section
      className={`le-frame ${leaving ? "le-is-leaving" : ""}`}
      inert={leaving}
      aria-label={title}
      data-question={q.id}
    >
      <div className="le-progress">
        <div
          role="progressbar"
          aria-label={exam ? "Exam progress" : "Practice progress"}
          aria-valuemin={0}
          aria-valuemax={maxItems}
          aria-valuenow={attempt.results.length}
          style={{ width: `${(attempt.results.length / maxItems) * 100}%` }}
        />
      </div>
      <div className="le-top">
        {voice.error && !attempt.finished ? (
          <span className="le-audio-status" role="status">
            Audio didn’t play. Tap Luna to retry.
          </span>
        ) : (
          <span>
            {attempt.finished
              ? title
              : (q.scene.interaction?.type === "choose" &&
                    q.scene.interaction.mode === "reflection") ||
                  (q.scene.interaction?.type === "speak" && !!q.scene.interaction.reflection)
                ? "Your feelings"
                : title}
          </span>
        )}
        <div className="le-reward-hud">
          {!exam && (
            <StreakFire
              consecutiveCorrect={practiceStreak(attempt.evidence, attempt.startingStreak ?? 0)}
            />
          )}
          <div className="le-carrots">
            <img src="/icons/fluent/carrot.svg" width={30} height={30} alt="Carrots" />
            <b>{carrots}</b>
          </div>
        </div>
      </div>
      {attempt.finished ? (
        <CompletionParty
          kind={exam ? "exam" : "practice"}
          title={
            completionTitle ??
            (perfect
              ? hasReading
                ? `Every ${questionTopic} answer, first try!`
                : "Every answer, first try!"
              : `Your ${questionTopic} practice is complete!`)
          }
          learned={learned}
          activitySummary={
            exam?.resultSummary
              ? exam.resultSummary(attempt)
              : lunaCount
                ? `${attempt.results.length} activities: ${storyCount} ${questionTopic} questions + ${lunaCount} Luna turns.`
                : undefined
          }
          carrots={carrots}
          bonus={repeatExam ? 0 : 3}
          rewardAlreadyEarned={repeatExam}
          perfectBonus={!repeatExam && perfect ? 3 : 0}
          achievement={perfect ? perfectLabel : undefined}
          outfitId="classic"
          active={!stamp}
          onRestart={runtime ? undefined : () => start(true)}
          onContinue={() => {
            setResultsVisited(true);
            setShowResults(true);
          }}
          autoContinue={!resultsVisited}
          narrationFinished={voice.finished && !voice.error}
          continueLabel="See results"
        />
      ) : (
        <main
          className={`le-stage le-slide-enter le-practice-stage ${q.scene.image && !q.scene.context && q.scene.interaction?.type === "speak" && q.scene.interaction.mode === "respond" ? "le-picture-response-stage" : ""}`}
          key={q.id}
        >
          <div className="le-prompt">
            <p className="le-eyebrow">
              {progressLabel
                ? progressLabel(attempt)
                : `Practice · ${attempt.asked.length} of ${maxItems}`}
            </p>
            <h1>
              <Karaoke
                text={q.scene.prompt}
                caption={voice.choiceId != null ? "" : voice.caption}
                activeWord={voice.activeWord}
              />
            </h1>
          </div>
          {q.scene.image && !q.scene.context && !hideQuestionSource && (
            <div className="le-passage le-picture-only" aria-label="Question picture">
              <img
                className="le-stimulus-picture"
                src={lessonAssetUrl(q.scene.image)}
                alt={q.scene.imageAlt ?? "Question illustration"}
                decoding="async"
              />
            </div>
          )}
          {q.scene.referencePage && !hideQuestionSource && (
            <ReferencePage
              page={q.scene.referencePage}
              caption={voice.choiceId ? "" : voice.caption}
              activeWord={voice.activeWord}
              key={q.id}
              disabled={capturing}
              onSelect={(index) => voice.say(q.scene.referencePage!.sections[index].heading)}
              onRead={(index) =>
                readReferencePage(
                  index === undefined
                    ? q.scene.referencePage!
                    : { sections: [q.scene.referencePage!.sections[index]] },
                  voice.say,
                )
              }
            />
          )}
          {q.scene.context &&
            (visiblePassage && !hideQuestionSource ? (
              <div
                className={`le-passage ${spokenSentences(q.scene.context).length >= 5 || q.scene.context.trim().split(/\s+/).length >= 30 ? "le-passage-long" : ""}`}
                aria-label="Text to read"
              >
                <div className="le-passage-label">
                  <span>
                    {q.scene.contextMode === "print-first"
                      ? "Word to read"
                      : q.scene.interaction?.type === "speak" &&
                          q.scene.interaction.mode === "respond"
                        ? "Listen to the text"
                        : "Read with Luna"}
                  </span>
                  <button aria-label="Read the passage" onClick={() => readPassage()}>
                    <Volume2 size={18} />
                  </button>
                </div>
                {q.scene.image && (
                  <img
                    className="le-stimulus-picture"
                    src={lessonAssetUrl(q.scene.image)}
                    alt={q.scene.imageAlt ?? "Story illustration"}
                    decoding="async"
                  />
                )}
                <div className="le-passage-body">
                  {q.scene.context
                    .split(/\n+/)
                    .filter(Boolean)
                    .map((paragraph, paragraphIndex) => (
                      <p className="le-passage-text" key={paragraphIndex}>
                        {spokenSentences(paragraph).map((sentence, sentenceIndex) => {
                          const text = sentence.trim();
                          return (
                            <span
                              className={`le-passage-sentence ${voice.caption === text && voice.speaking ? "is-reading" : ""}`}
                              key={sentenceIndex}
                            >
                              <Karaoke
                                text={text}
                                caption={voice.choiceId != null ? "" : voice.caption}
                                activeWord={voice.activeWord}
                              />{" "}
                            </span>
                          );
                        })}
                      </p>
                    ))}
                </div>
              </div>
            ) : (
              <div className="le-practice-story">
                <button
                  onClick={() => {
                    setStory(!story);
                    if (!story) readPassage();
                  }}
                >
                  <Volume2 size={18} />
                  Read the text again
                </button>
                {story && <p>{q.scene.context}</p>}
              </div>
            ))}
          {q.scene.visual &&
            q.scene.interaction?.type === "speak" &&
            q.scene.interaction.visualFeedback &&
            renderVisual && (
              <div className="le-visual">
                {renderVisual(q.scene, { ...q.scene.visual.props, ...visual })}
              </div>
            )}
          <div
            className={`le-interaction ${submitted ? "le-answer-registered" : ""}`}
            inert={submitted && !!exam?.autoAdvance}
          >
            {savedInterstitial ? (
              <div className="le-exam-saved" role="status">
                <p>{exam!.acknowledgement ?? "Answer saved."}</p>
              </div>
            ) : review ? (
              <div className="le-retry-exit" role="status">
                <p className="le-eyebrow">Let’s learn this together</p>
                {q.scene.interaction?.type === "choose" && q.scene.interaction.printPage && (
                  <PrintedPage
                    page={q.scene.interaction.printPage}
                    picked={q.scene.interaction.correctId}
                    solved
                    onPick={() => {}}
                  />
                )}
                <p className="le-sentence">{q.explanation ?? q.scene.feedback?.correct}</p>
                <button className="le-primary" onClick={finishQuestion}>
                  Keep going <ArrowRight size={20} />
                </button>
              </div>
            ) : Interaction && q.scene.interaction ? (
              <Interaction data={q.scene.interaction} support={support} onSolved={() => {}} />
            ) : null}
          </div>
        </main>
      )}
      {!attempt.finished && (
        <footer className="le-footer">
          <div className="le-bunny" aria-hidden="true">
            {reaction ? (
              <BunnyReaction outfitId="classic" state={reaction} />
            ) : (
              <Bunny outfitId="classic" />
            )}
          </div>
          {q.scene.interaction?.type !== "speak" && (
            <LunaOrb
              size={64}
              analyser={voice.analyser}
              mode={voice.speaking ? "speaking" : "idle"}
              label="Read the question again"
              onTap={submitted ? undefined : () => narrateScene(q.scene, voice.say)}
            />
          )}
          <div className="le-navigation">
            {!solved && !review && !submitted && (
              <>
                {!deferred && (
                  <button
                    disabled={capturing}
                    onClick={() => {
                      support.help();
                      voice.say(q.scene.feedback!.hint);
                    }}
                  >
                    Help
                  </button>
                )}
                <button onClick={finishQuestion}>Skip for now</button>
              </>
            )}
            {!exam?.autoAdvance && (
              <button
                className="le-primary"
                disabled={!solved && !review && !submitted}
                onClick={finishQuestion}
              >
                Next <ArrowRight size={20} />
              </button>
            )}
          </div>
        </footer>
      )}
      {stamp && (
        <div
          className="le-stamp-screen"
          role="dialog"
          aria-modal="true"
          aria-label="Practice celebration"
        >
          <SealOfApproval ribbonText="COMPLETED!" />
          <h1>{perfect ? perfectLabel : "You did it!"}</h1>
          <button className="le-primary" autoFocus onClick={() => setStamp(false)}>
            See my carrots
          </button>
        </div>
      )}
      {saveError && (
        <p className="le-save-error" role="alert">
          Practice could not be saved on this device.
        </p>
      )}
    </section>
  );
}
