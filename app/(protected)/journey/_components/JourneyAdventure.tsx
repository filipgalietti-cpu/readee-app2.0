"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Glyph } from "@/app/_components/Glyph";
import { FluentIcon } from "@/app/_components/FluentIcon";
import JourneyWorld, { type BunnyTravel } from "@/app/_components/journey/JourneyWorld";
import JourneyMagicReveal from "@/app/_components/journey/JourneyMagicReveal";
import type { buildAdventureView } from "@/lib/journey/adventure-view";
import { UNIT_EXAM_ID } from "@/lib/approved-unit/gateway";
import { journeyReturnTransition } from "@/lib/journey/return-transition";
import { audioManager } from "@/lib/audio/audio-manager";
import JourneyPlanDialog from "./JourneyPlanDialog";
import styles from "@/app/_components/journey/journey-v2.module.css";

const query = "(prefers-reduced-motion: reduce)";
const subscribe = (notify: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
const readMotion = () => window.matchMedia(query).matches;
const serverMotion = () => false;
type Model = ReturnType<typeof buildAdventureView>;

export default function JourneyAdventure({
  model,
  childId,
  placementId,
  introduce,
  justCompleted,
  openedChests,
  approvedUnitEnabled,
  onStart,
  onPlan,
  onReward,
  billingNotice,
}: {
  model: Model;
  approvedUnitEnabled?: boolean;
  childId: string;
  placementId: string | null;
  introduce: boolean;
  justCompleted: string | null;
  openedChests: string[];
  onStart: (id: string) => void;
  onPlan: () => void;
  onReward: (id: string, amount: number) => Promise<void>;
  billingNotice?: ReactNode;
}) {
  const reduced = useSyncExternalStore(subscribe, readMotion, serverMotion);
  const transition = useMemo(
    () => journeyReturnTransition(model, justCompleted),
    [model, justCompleted],
  );
  const [chapterIndex, setChapterIndex] = useState(transition.startChapter);
  const chapter = model.chapters[chapterIndex];
  const [phase, setPhase] = useState<"magic" | "building" | "ready">(introduce ? "magic" : "ready");
  const [review, setReview] = useState(false);
  const [rewardBusy, setRewardBusy] = useState(false);
  const [rewardError, setRewardError] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [travel, setTravel] = useState<BunnyTravel | null>(null);
  const [arrived, setArrived] = useState(!transition.travel);
  const returned = useRef(false);
  const openingKey = `readee:journey-adventure:${childId}:${placementId ?? "none"}`;
  const actualPhase = reduced ? "ready" : phase;
  const chapterDone = !!chapter && chapter.lessonIds.every((id) => model.completed.has(id));
  const unitDone = !!chapter && chapter.unitLessonIds.every((id) => model.completed.has(id));
  const rewardClaimed = !!chapter?.rewardId && openedChests.includes(chapter.rewardId);
  const bunnyPresent =
    chapterIndex === model.currentChapter || (!arrived && transition.startChapter === chapterIndex);
  const fromReport = introduce && !!placementId;
  useEffect(() => {
    if (!fromReport) return;
    try {
      if (sessionStorage.getItem(openingKey)) setPhase("ready");
    } catch {
      /* Optional UI storage. */
    }
  }, [fromReport, openingKey]);
  useEffect(() => {
    if (actualPhase !== "building") return;
    const timer = setTimeout(() => {
      setPhase("ready");
      try {
        sessionStorage.setItem(openingKey, "seen");
      } catch {
        /* Optional UI storage. */
      }
    }, 3200);
    return () => clearTimeout(timer);
  }, [actualPhase, openingKey]);
  useEffect(() => {
    if (returned.current || !transition.travel || !justCompleted) return;
    returned.current = true;
    const settle = () => {
      setArrived(true);
      setChapterIndex(transition.finishChapter);
    };
    const completionKey = `readee:journey-arrival:${childId}:${justCompleted}:${model.completed.size}`;
    try {
      if (sessionStorage.getItem(completionKey)) {
        settle();
        return;
      }
      sessionStorage.setItem(completionKey, "seen");
    } catch {
      /* Progress itself always comes from the server snapshot. */
    }
    if (reduced) {
      settle();
      return;
    }
    setTravel(transition.travel);
    if (soundOn) {
      audioManager.resumeContextSync();
      audioManager.playCompleteChime();
    }
  }, [childId, justCompleted, model.completed.size, reduced, soundOn, transition]);
  const arrival = useCallback(() => {
    setTravel(null);
    setArrived(true);
    setChapterIndex(transition.finishChapter);
  }, [transition.finishChapter]);
  const interrupt = useCallback(() => {
    setPhase("ready");
  }, []);
  const showMap = useCallback(() => setPhase("building"), []);
  const allDone = model.lessons.length > 0 && model.completed.size === model.lessons.length;
  const next = () => {
    setReview(false);
    setTravel(null);
    setChapterIndex((index) => Math.min(index + 1, model.chapters.length - 1));
    setPhase("ready");
  };
  const selectChapter = (index: number) => {
    setChapterIndex(index);
    setTravel(null);
    setArrived(true);
    setPhase("ready");
  };
  async function collect(id: string, amount: number) {
    if (rewardBusy || openedChests.includes(id)) return;
    setRewardBusy(true);
    setRewardError(false);
    try {
      await onReward(id, amount);
    } catch {
      setRewardError(true);
    } finally {
      setRewardBusy(false);
    }
  }
  // Hide the just-completed destination only during the return hop's first render.
  const displayCompleted = useMemo(() => {
    if (!arrived && !travel && justCompleted) {
      const set = new Set(model.completed);
      set.delete(justCompleted);
      return set;
    }
    return model.completed;
  }, [arrived, travel, justCompleted, model.completed]);
  return (
    <div
      className={`${styles.experience} ${styles.liveExperience}`}
      data-journey
      data-live-journey
      data-reduced={reduced}
    >
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.wordmark} aria-label="Readee dashboard">
          <img src="/readee-logo.png" alt="Readee" width={160} height={54} />
        </Link>
        <div className={styles.readerHeading}>
          <h1>{model.reader.name}’s reading journey</h1>
          <span>
            {model.completed.size} of {model.lessons.length} learning stops complete
          </span>
        </div>
        <div className={styles.headerTools}>
          <button
            className={styles.soundControl}
            onClick={() => setSoundOn((value) => !value)}
            aria-label={soundOn ? "Mute journey sounds" : "Enable journey sounds"}
            aria-pressed={soundOn}
          >
            <Glyph name={soundOn ? "volume2" : "volume-x"} size={20} />
          </button>
          <button onClick={onPlan} aria-label="Why this journey?">
            <Glyph name="book-open" size={19} /> Why this journey?
          </button>
          <details className={styles.reviewMenu}>
            <summary aria-label="Browse reading journey">
              <Glyph name="map" size={20} />
            </summary>
            <div className={styles.reviewPopover}>
              <label className={styles.journeyBrowseLabel}>
                Explore your path
                <select
                  aria-label="Choose journey chapter"
                  value={chapterIndex}
                  onChange={(event) => selectChapter(Number(event.target.value))}
                >
                  {model.chapters.map((entry, index) => (
                    <option key={entry.id} value={index}>
                      {entry.grade} · {entry.name} · {entry.part}/{entry.parts}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className={styles.liveMenuButton}
                onClick={() => selectChapter(model.currentChapter)}
              >
                Return to current lesson
              </button>
              <button
                className={styles.liveMenuButton}
                onClick={() => {
                  audioManager?.resumeContextSync();
                  setPhase(reduced ? "ready" : "magic");
                }}
              >
                Watch the magic again
              </button>
              {approvedUnitEnabled && (
                <Link className={styles.liveMenuButton} href={`/learn/unit-one?child=${childId}`}>
                  Kindergarten Unit 1 · Lessons and check-in
                </Link>
              )}
              {approvedUnitEnabled && (
                <Link
                  className={styles.liveMenuButton}
                  href={`/learn/unit-one/report?child=${childId}`}
                >
                  Parent progress report
                </Link>
              )}
              <Link className={styles.liveMenuButton} href="/dashboard">
                Dashboard
              </Link>
            </div>
          </details>
        </div>
      </header>
      {billingNotice}
      <div className={styles.main}>
        {chapter ? (
          <section className={styles.adventure} aria-label={`${model.reader.name}’s adventure`}>
            <JourneyWorld
              key={chapter.id}
              fixture={model.reader}
              chapter={chapter}
              completed={displayCompleted}
              checkpointComplete={chapterDone}
              milestoneComplete={rewardClaimed}
              bunnyPresent={bunnyPresent}
              phase={actualPhase === "magic" ? "insights" : actualPhase}
              intro={
                actualPhase === "magic" ? (
                  <JourneyMagicReveal soundEnabled={soundOn} onComplete={showMap} />
                ) : undefined
              }
              reduced={reduced}
              travel={travel}
              onArrival={arrival}
              onLesson={(lesson) => onStart(lesson.lessonId)}
              onAssessment={onPlan}
              onCheckpoint={() => setReview(true)}
              onMilestone={() => setReview(true)}
              onInterrupt={interrupt}
            />
          </section>
        ) : (
          <section className={styles.emptyJourney}>
            <h2>Let’s find a starting point.</h2>
            <Link href={`/assessment?child=${encodeURIComponent(childId)}`}>
              Start the reading assessment
            </Link>
          </section>
        )}
      </div>
      <p className={styles.srOnly} role="status">
        {travel
          ? "Your bunny is moving to the next destination."
          : `${model.completed.size} lessons complete.`}
      </p>
      {review && chapter && (
        <JourneyPlanDialog onClose={() => setReview(false)}>
          <div className={styles.liveReview}>
            {chapter.unitKey === "approved:k-unit-1" && (
              <p>
                {model.gate.ready
                  ? "Unit exam passed. The next unit is open."
                  : "Complete the eight lessons, then pass the Story Garden exam to continue."}{" "}
                <Link
                  href={`/learn/unit-one?child=${childId}${model.gate.examAvailable ? "&lesson=" + UNIT_EXAM_ID : ""}`}
                >
                  View Unit 1 and exam
                </Link>
              </p>
            )}
            <FluentIcon name="open-book" size={72} />
            <h2>{chapterDone ? "A chapter worth celebrating." : chapter.name}</h2>
            <p>
              {chapter.lessonIds.filter((id) => model.completed.has(id)).length} of{" "}
              {chapter.lessonIds.length} lessons complete in this part.
            </p>
            <p>{chapter.reason}</p>
            <ul>
              {chapter.lessonIds.map((id) => (
                <li key={id}>
                  <Glyph name={model.completed.has(id) ? "check" : "book-open"} size={18} />
                  <button
                    onClick={() => {
                      setReview(false);
                      onStart(id);
                    }}
                  >
                    {model.lessons.find((lesson) => lesson.lessonId === id)!.title}
                  </button>
                </li>
              ))}
            </ul>
            {chapter.rewardId && unitDone && !rewardClaimed && (
              <button
                className={styles.primary}
                disabled={rewardBusy}
                onClick={() => collect(chapter.rewardId!, 20)}
              >
                {rewardBusy ? "Saving…" : "Collect your unit keepsake"}{" "}
                <FluentIcon name="carrot" size={20} /> 20
              </button>
            )}
            {rewardClaimed && <p>Your unit keepsake is collected.</p>}
            {allDone && !openedChests.includes("__trophy__") && (
              <button
                className={styles.primary}
                disabled={rewardBusy}
                onClick={() => collect("__trophy__", 50)}
              >
                Collect your journey trophy <FluentIcon name="carrot" size={20} /> 50
              </button>
            )}
            {rewardError && <p role="alert">We couldn’t save the keepsake. Please try again.</p>}
            {chapterIndex < model.chapters.length - 1 && (
              <button className={styles.primary} onClick={next}>
                {chapterDone ? "Explore the next part" : "Look ahead"}{" "}
                <Glyph name="arrow-right" size={18} />
              </button>
            )}
          </div>
        </JourneyPlanDialog>
      )}
    </div>
  );
}
