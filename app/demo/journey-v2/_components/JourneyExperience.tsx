"use client";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Glyph } from "@/app/_components/Glyph";
import { FluentIcon } from "@/app/_components/FluentIcon";
import type { PlannedJourneyLesson } from "@/lib/journey/planner-contract";
import {
  JOURNEY_FIXTURES,
  canOpenDemoLesson,
  chapterForLesson,
  firstIncomplete,
  lessonTitle,
  lessonPresentation,
  type JourneyFixture,
} from "../fixtures";
import JourneyWorld, { type BunnyTravel, type JourneyPhase } from "./JourneyWorld";
import { JourneyDialog, JourneyInsightPanel, JourneyPaywall } from "./JourneyPanels";
import JourneyMagicReveal from "./JourneyMagicReveal";
import { audioManager } from "@/lib/audio/audio-manager";
import styles from "@/app/_components/journey/journey-v2.module.css";

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotionPreference(notify: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}
const readMotionPreference = () => window.matchMedia(motionQuery).matches;
const serverMotionPreference = () => false;

export default function JourneyExperience({ initialFixture, initialPhase = "insights" }: { initialFixture?: JourneyFixture; initialPhase?: JourneyPhase } = {}) {
  const fixtures = initialFixture ? [initialFixture, ...JOURNEY_FIXTURES.filter((fixture) => fixture.id !== initialFixture.id)] : JOURNEY_FIXTURES;
  const [fixtureId, setFixtureId] = useState(initialFixture?.id ?? "foundations"),
    [revision, setRevision] = useState(0);
  const [simulateReduced, setSimulateReduced] = useState(false);
  // Preserve the server's first render, then apply the OS preference before animation begins.
  const prefersReduced = useSyncExternalStore(
    subscribeMotionPreference,
    readMotionPreference,
    serverMotionPreference,
  );
  const reduced = simulateReduced || !!prefersReduced;
  const fixture = fixtures.find((f) => f.id === fixtureId)!;
  return (
    <div className={styles.experience} data-journey-v2 data-reduced={reduced}>
      <div className={styles.devbar}>
        <details>
          <summary>
            Design studio <Glyph name="chevron-down" size={14} />
          </summary>
          <div className={styles.devControls}>
            <label>
              Reader fixture
              <select
                aria-label="Reader fixture"
                value={fixtureId}
                onChange={(e) => setFixtureId(e.target.value)}
              >
                {fixtures.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={simulateReduced}
                onChange={(e) => setSimulateReduced(e.target.checked)}
              />
              Simulate reduced motion
            </label>
            <button onClick={() => setRevision((r) => r + 1)}>Reset reader</button>
            <Link href="/demo/journey">Original Journey</Link>
            <Link href="/demo/journey-v2/from-assessment">Assessment → Journey mock</Link>
          </div>
        </details>
        <span>Synthetic readers · unapproved presentation routes</span>
        <span className={styles.studioVersion}>JOURNEY / 02</span>
      </div>
      <ReaderJourney key={`${fixtureId}-${revision}`} fixture={fixture} reduced={reduced} initialPhase={initialPhase} />
    </div>
  );
}

function ReaderJourney({ fixture, reduced, initialPhase }: { fixture: JourneyFixture; reduced: boolean; initialPhase: JourneyPhase }) {
  const [soundOn, setSoundOn] = useState(true);
  const completeSound = () => {
    if (!soundOn) return;
    audioManager?.resumeContextSync();
    audioManager?.playCompleteChime();
  };
  const [completed, setCompleted] = useState(() => new Set(fixture.completed));
  const [subscriber, setSubscriber] = useState(fixture.subscriber);
  const [chapterIndex, setChapterIndex] = useState(() =>
    chapterForLesson(fixture, firstIncomplete(fixture, new Set(fixture.completed))?.lessonId),
  );
  const [bunnyChapter, setBunnyChapter] = useState(chapterIndex);
  const [checkpoints, setCheckpoints] = useState(() => new Set(fixture.completedCheckpoints));
  const [phase, setPhase] = useState<JourneyPhase>(reduced ? "ready" : initialPhase);
  const [replay, setReplay] = useState(0);
  const [buildPending, setBuildPending] = useState(false);
  const [magicActive, setMagicActive] = useState(initialPhase === "building" && !reduced);
  const [panel, setPanel] = useState<
    "insights" | "paywall" | "lesson" | "checkpoint" | "milestone" | null
  >(null);
  const [selected, setSelected] = useState<PlannedJourneyLesson>();
  const [travel, setTravel] = useState<BunnyTravel | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const serial = useRef(0);
  const worldFixture = useMemo(() => ({ ...fixture, definition: { lessons: fixture.definition.lessons.map((lesson) => ({
    ...lesson, title: lessonTitle(lesson.lessonId), ...lessonPresentation(lesson.lessonId),
    available: canOpenDemoLesson(fixture, lesson, subscriber, completed),
  })) } }), [fixture, subscriber, completed]);
  const chapter = fixture.chapters[chapterIndex];
  const current = firstIncomplete(fixture, completed);
  const currentInChapter = fixture.definition.lessons.find(
    (l) => chapter.lessonIds.includes(l.lessonId) && !completed.has(l.nodeId),
  );
  const unitDone = chapter.lessonIds.every((id) => completed.has(`${fixture.id}:${id}`));
  const effectivePhase = reduced ? "ready" : phase;
  useEffect(() => {
    if (reduced || magicActive || phase !== "building") return;
    const timer = window.setTimeout(() => setPhase("ready"), 3200);
    return () => clearTimeout(timer);
  }, [phase, reduced, replay, magicActive]);
  const buildJourney = () => {
    audioManager?.resumeContextSync();
    if (reduced) setPhase("ready");
    else setBuildPending(true);
  };
  const showAll = useCallback(() => {
    setBuildPending(false);
    setMagicActive(false);
    setPhase("ready");
  }, []);
  const arrival = useCallback(() => {
    setTravel(null);
    setAnnouncement("Your bunny has arrived. The next destination is ready.");
  }, []);
  const openLesson = (lesson: PlannedJourneyLesson) => {
    showAll();
    setSelected(lesson);
    setPanel(canOpenDemoLesson(fixture, lesson, subscriber, completed) ? "lesson" : "paywall");
  };
  const finishLesson = () => {
    if (
      !selected ||
      chapterIndex !== bunnyChapter ||
      completed.has(selected.nodeId) ||
      selected.nodeId !== currentInChapter?.nodeId
    )
      return;
    completeSound();
    const index = chapter.lessonIds.indexOf(selected.lessonId);
    setCompleted((previous) => new Set([...previous, selected.nodeId]));
    setPanel(null);
    setAnnouncement(
      `${lessonTitle(selected.lessonId)} completed in this preview. Moving to the next destination.`,
    );
    setTravel({
      from: selected.lessonId,
      to: chapter.lessonIds[index + 1] ?? "checkpoint",
      serial: ++serial.current,
    });
  };
  const navigate = (index: number) => {
    showAll();
    setTravel(null);
    setChapterIndex(index);
  };
  const jumpProgress = (count: number) => {
    const next = new Set(fixture.definition.lessons.slice(0, count).map((l) => l.nodeId));
    setCompleted(next);
    setTravel(null);
    showAll();
    setCheckpoints(new Set()); // A progress jump simulates lessons only, never checkpoint completion.
    const index = chapterForLesson(fixture, firstIncomplete(fixture, next)?.lessonId);
    setChapterIndex(index);
    setBunnyChapter(index);
  };
  return (
    <>
      <header className={styles.header}>
        <Link
          href="/demo/journey-v2"
          className={styles.wordmark}
          aria-label="Readee Journey studio"
        >
          read<span>ee</span>
          <i>®</i>
        </Link>
        <div className={styles.readerHeading}>
          <h1>{fixture.name}’s reading journey</h1>
          <span>{completed.size} of {fixture.definition.lessons.length} lessons complete</span>
        </div>
        <div className={styles.headerTools}>
          <button
            aria-label={soundOn ? "Mute journey sounds" : "Enable journey sounds"}
            aria-pressed={soundOn}
            onClick={() => setSoundOn(!soundOn)}
            className={styles.soundControl}
          >
            <Glyph name={soundOn ? "volume2" : "volume-x"} size={20} />
          </button>
          <button
            onClick={() => {
              showAll();
              setPanel("insights");
            }}
          >
            <Glyph name="book-open" size={19} />
            Why this journey?
          </button>
          <details className={styles.reviewMenu}>
            <summary aria-label="Journey review controls"><Glyph name="settings" size={20} /></summary>
            <div className={styles.reviewPopover}>
        <div className={styles.reviewControls}>
          <span>REVIEW CONTROLS</span>
          <label>
            Access
            <select
              aria-label="Fixture access"
              value={subscriber ? "subscriber" : "free"}
              onChange={(e) => setSubscriber(e.target.value === "subscriber")}
            >
              <option value="free">Non-subscriber</option>
              <option value="subscriber">Readee+ subscriber</option>
            </select>
          </label>
          <label>
            Completed
            <select
              aria-label="Completed lessons"
              value={completed.size}
              onChange={(e) => jumpProgress(Number(e.target.value))}
            >
              {Array.from({ length: fixture.definition.lessons.length + 1 }, (_, i) => (
                <option key={i} value={i}>
                  {i} lessons
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() => {
              setTravel(null);
              setBuildPending(false);
              setMagicActive(false);
              setPhase(reduced ? "ready" : "insights");
              setReplay((n) => n + 1);
            }}
          >
            Replay the reveal
          </button>
          <button onClick={() => navigate(bunnyChapter)}>Go to current chapter</button>
        </div>
        <p className={styles.fixtureNote}>
          Design preview. Chapter names and lesson selections are illustrative, not approved
          prescriptions. No child progress or subscription is saved.
        </p>
            </div>
          </details>
          <span className={styles.avatar} aria-label={`Reader: ${fixture.name}`}>
            {fixture.name.slice(0, 1)}
          </span>
        </div>
      </header>
      <div className={styles.main}>
        <section className={styles.adventure} aria-label={`${fixture.name}’s adventure`}>
          <JourneyWorld
            key={chapter.id}
            fixture={worldFixture}
            chapter={chapter}
            completed={completed}
            checkpointComplete={checkpoints.has(chapter.checkpointId)}
            bunnyPresent={chapterIndex === bunnyChapter}
            phase={magicActive && !reduced ? "insights" : effectivePhase}
            intro={magicActive && !reduced ? <JourneyMagicReveal soundEnabled={soundOn} onComplete={() => setMagicActive(false)} /> : undefined}
            reduced={reduced}
            travel={travel}
            onArrival={arrival}
            onLesson={(lesson) => openLesson(fixture.definition.lessons.find((entry) => entry.nodeId === lesson.nodeId)!)}
            onAssessment={() => {
              showAll();
              setPanel("insights");
            }}
            onCheckpoint={() => setPanel("checkpoint")}
            onMilestone={() => setPanel("milestone")}
            onInterrupt={showAll}
          />
          {chapterIndex !== bunnyChapter && (
            <div className={styles.browsingNote}>
              Your bunny is in {fixture.chapters[bunnyChapter].name}.
              <button onClick={() => navigate(bunnyChapter)}>
                Return to your lesson
                <Glyph name="arrow-right" size={16} />
              </button>
            </div>
          )}
          <AnimatePresence onExitComplete={() => {
            if (!buildPending) return;
            setBuildPending(false);
            setMagicActive(!reduced);
            setPhase(reduced ? "ready" : "building");
          }}>
            {effectivePhase === "insights" && !buildPending && (
              <motion.div
                className={styles.reveal}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.22 }}
              >
                <div className={styles.revealPaper} data-reveal-card>
                  <span className={styles.revealCheck}>
                    <Glyph name="check" size={24} />
                  </span>
                  <span className={styles.eyebrow}>YOUR ASSESSMENT → YOUR JOURNEY</span>
                  <motion.h2
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.35 }}
                  >
                    {fixture.provisional
                      ? `A starting point to explore with ${fixture.name}.`
                      : `We found ${fixture.name}’s starting point.`}
                  </motion.h2>
                  <dl>
                    {[
                      ["Strong with", fixture.strength],
                      ["Building next", fixture.focus],
                      ["Working toward", fixture.goal],
                    ].map(([label, value], index) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 + index * 0.18, duration: 0.25 }}
                      >
                        <dt>
                          <span className={styles.insightIcon} aria-hidden="true">
                            <Glyph
                              name={index === 0 ? "check" : index === 1 ? "book-open" : "flag"}
                              size={20}
                            />
                          </span>
                          {label}
                        </dt>
                        <dd>{value}</dd>
                      </motion.div>
                    ))}
                  </dl>
                  <button
                    className={styles.primary}
                    onClick={buildJourney}
                  >
                    Build my journey
                    <Glyph name="arrow-right" size={18} />
                  </button>
                  <button className={styles.skipReveal} onClick={showAll}>
                    Skip animation
                  </button>
                  <small>Illustrative assessment · development fixture</small>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
        <div className={styles.srOnly} role="status" aria-live="polite">
          {announcement}
        </div>
      </div>
      {panel === "insights" && (
        <JourneyInsightPanel
          fixture={fixture}
          chapter={chapter}
          lesson={currentInChapter ?? current}
          onClose={() => setPanel(null)}
        />
      )}
      {panel === "paywall" && (
        <JourneyPaywall
          fixture={fixture}
          completed={completed}
          onClose={() => setPanel(null)}
          onPreviewAccess={() => {
            setSubscriber(true);
            setPanel(null);
            setAnnouncement("Full access enabled for this preview only.");
          }}
        />
      )}
      {panel === "lesson" && selected && (
        <JourneyDialog title={lessonTitle(selected.lessonId)} onClose={() => setPanel(null)}>
          <div className={styles.lessonPreview}>
            <FluentIcon name="open-book" size={80} />
            <p>{selected.parentExplanation}</p>
            <span>{selected.standardIds.join(" · ")}</span>
          </div>
          <p className={styles.demoNote}>
            This is the lesson-launch interaction preview. The authored lesson would open here.
            Finishing this preview changes only the demo map.
          </p>
          {completed.has(selected.nodeId) ? (
            <p className={styles.completedNote}>
              <Glyph name="check-circle2" size={20} />
              Completion retained. No mastery claim.
            </p>
          ) : selected.nodeId === currentInChapter?.nodeId && chapterIndex === bunnyChapter ? (
            <button className={styles.primary} onClick={finishLesson}>
              Finish lesson preview
              <Glyph name="arrow-right" size={20} />
            </button>
          ) : (
            <button className={styles.primary} onClick={() => setPanel(null)}>
              Back to the adventure
            </button>
          )}
        </JourneyDialog>
      )}
      {panel === "checkpoint" && (
        <JourneyDialog title="A moment to bring it together" onClose={() => setPanel(null)}>
          <div className={styles.lessonPreview}>
            <FluentIcon name="books" size={74} />
            <p>This chapter checkpoint will bring together the ideas your reader has practiced.</p>
          </div>
          <p className={styles.demoNote}>
            Presentation checkpoint only. No questions are scored, no passing threshold is invented,
            and no mastery is awarded.
          </p>
          <button
            className={styles.primary}
            disabled={!unitDone || checkpoints.has(chapter.checkpointId)}
            onClick={() => {
              completeSound();
              setCheckpoints((old) => new Set([...old, chapter.checkpointId]));
              setPanel("milestone");
            }}
          >
            {checkpoints.has(chapter.checkpointId)
              ? "Checkpoint preview completed"
              : unitDone
                ? "Finish checkpoint preview"
                : "Finish the chapter lessons first"}
          </button>
        </JourneyDialog>
      )}
      {panel === "milestone" && (
        <JourneyDialog
          title={
            checkpoints.has(chapter.checkpointId)
              ? `${chapter.name}, explored!`
              : "A keepsake for the journey"
          }
          onClose={() => setPanel(null)}
        >
          <div className={styles.lessonPreview}>
            <FluentIcon name="gift" size={85} />
            <p>
              {checkpoints.has(chapter.checkpointId)
                ? "Your chapter is complete in this preview. The next discovery is waiting."
                : "Finish the chapter lessons and checkpoint to open this keepsake. Every completed stop remains part of your journey."}
            </p>
          </div>
          <p className={styles.demoNote}>
            No carrots, stars, or real rewards are granted by this demo.
          </p>
          <button
            className={styles.primary}
            onClick={() => {
              setPanel(null);
              if (
                checkpoints.has(chapter.checkpointId) &&
                chapterIndex < fixture.chapters.length - 1
              ) {
                setBunnyChapter(chapterIndex + 1);
                navigate(chapterIndex + 1);
              }
            }}
          >
            {checkpoints.has(chapter.checkpointId) && chapterIndex < fixture.chapters.length - 1
              ? "Explore the next chapter"
              : "Back to the adventure"}
            <Glyph name="arrow-right" size={19} />
          </button>
        </JourneyDialog>
      )}
    </>
  );
}
