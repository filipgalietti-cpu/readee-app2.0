"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import { Bunny } from "@/app/_components/Bunny/Bunny";
import { FluentIcon } from "@/app/_components/FluentIcon";
import CompletedLessonNode from "./CompletedLessonNode";
import { Glyph } from "@/app/_components/Glyph";
import type {
  AdventureLesson,
  AdventureChapter,
  AdventureReader,
} from "@/lib/journey/adventure-view";
import { mapGeometry, type Point } from "./geometry";
import { useJourneyCamera } from "./useJourneyCamera";
import JourneyLandscape, { CheckpointLandmark, MilestoneLandmark } from "./JourneyLandscape";
import styles from "./journey-v2.module.css";

export type JourneyPhase = "insights" | "building" | "ready";
export type BunnyTravel = { from: string; to: string; serial: number };

export default function JourneyWorld({
  fixture,
  chapter,
  completed,
  checkpointComplete,
  bunnyPresent,
  phase,
  reduced,
  travel,
  onArrival,
  onLesson,
  onCheckpoint,
  onMilestone,
  onAssessment,
  onInterrupt,
  intro,
  milestoneComplete = checkpointComplete,
}: {
  fixture: AdventureReader;
  chapter: AdventureChapter;
  completed: ReadonlySet<string>;
  checkpointComplete: boolean;
  bunnyPresent: boolean;
  phase: JourneyPhase;
  reduced: boolean;
  travel: BunnyTravel | null;
  onArrival: () => void;
  onLesson: (lesson: AdventureLesson) => void;
  onCheckpoint: () => void;
  onMilestone: () => void;
  onAssessment: () => void;
  onInterrupt: () => void;
  intro?: ReactNode;
  milestoneComplete?: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLDivElement>(null);
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const camera = useJourneyCamera(frame, reduced, onInterrupt);
  const lessons = useMemo(
    () => chapter.lessonIds.map((id) => fixture.definition.lessons.find((l) => l.lessonId === id)!),
    [chapter, fixture],
  );
  const geometry = useMemo(() => mapGeometry(lessons.length, false), [lessons.length]);
  // Start at the geometry's native scale so a long unit never flashes as a
  // compressed overview before ResizeObserver measures the viewport.
  const [width, setWidth] = useState(geometry.width);
  const scale = width / geometry.width;
  const currentIndex = lessons.findIndex((l) => !completed.has(l.nodeId));
  const remainingLessons = lessons.filter((lesson) => !completed.has(lesson.nodeId)).length;
  const activePoint = currentIndex < 0 ? lessons.length + 1 : currentIndex + 1;
  const bunnyX = useMotionValue(0),
    bunnyY = useMotionValue(0),
    hop = useMotionValue(0),
    drawing = useMotionValue(0);
  const [landing, setLanding] = useState(false);
  const callback = useRef(onArrival);
  useEffect(() => {
    callback.current = onArrival;
  }, [onArrival]);
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width: availableWidth, height } = entry.contentRect;
      const proportionalWidth = (height * geometry.width) / geometry.height;
      // Compact chapters can fit in the available frame. A complete unit keeps
      // each destination readable and uses the existing horizontal camera.
      setWidth(
        geometry.width > 1000
          ? Math.max(availableWidth, proportionalWidth)
          : availableWidth < 980
            ? proportionalWidth
            : Math.min(availableWidth, proportionalWidth),
      );
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [geometry.height, geometry.width]);
  const restSide = useCallback(
    (point: Point) => {
      const split = geometry.mobile ? 180 : geometry.width > 1000 ? geometry.width / 2 : 750;
      return point.x < split ? 1 : -1;
    },
    [geometry.mobile, geometry.width],
  );
  const rest = (index: number) => {
    const p = geometry.points[index];
    const side = restSide(p);
    return { x: p.x * scale + side * (geometry.mobile ? 83 : 86), y: p.y * scale - 3 };
  };
  useEffect(() => {
    if (travel) return;
    const p = geometry.points[activePoint];
    const side = restSide(p);
    bunnyX.set(p.x * scale + side * (geometry.mobile ? 83 : 86));
    bunnyY.set(p.y * scale - 3);
  }, [activePoint, geometry, scale, travel, bunnyX, bunnyY, restSide]);

  useEffect(() => {
    if (phase === "insights") return;
    // Travel owns the camera from departure through arrival. Starting a second
    // settle animation toward the newly-completed model is what made the view
    // snap forward, back to the bunny, and forward again.
    if (travel) return;
    if (phase === "building" && !reduced) camera.target(geometry.points[0].x * scale, "reveal");
    else camera.target(geometry.points[activePoint].x * scale, "settled");
    // Settle on chapter/viewport changes, never on camera state updates or by moving focus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, geometry, activePoint, reduced, travel]);

  useEffect(() => {
    if (!travel) return;
    const fromIndex = lessons.findIndex((l) => l.lessonId === travel.from) + 1;
    const toIndex =
      travel.to === "checkpoint"
        ? lessons.length + 1
        : lessons.findIndex((l) => l.lessonId === travel.to) + 1;
    const segment = paths.current[fromIndex];
    if (!segment || toIndex !== fromIndex + 1) {
      callback.current();
      return;
    }
    const pathLength = segment.getTotalLength();
    const from = geometry.points[fromIndex],
      to = geometry.points[toIndex];
    const offset = (p: Point) => restSide(p) * (geometry.mobile ? 83 : 86);
    bunnyX.set(from.x * scale + offset(from));
    bunnyY.set(from.y * scale - 3);
    camera.begin();
    drawing.set(0);
    const controls = animate(0, 1, {
      duration: reduced ? 0 : 2.15,
      ease: "easeInOut",
      onUpdate: (t) => {
        const moving = Math.max(0, Math.min(1, t));
        const p = segment.getPointAtLength(pathLength * moving);
        const sideOffset = offset(from) + (offset(to) - offset(from)) * moving;
        bunnyX.set(p.x * scale + sideOffset);
        bunnyY.set(p.y * scale - 3);
        hop.set(reduced ? 0 : -Math.abs(Math.sin(moving * Math.PI * 4)) * 23);
        drawing.set(moving);
        camera.target(p.x * scale, "follow");
      },
      onComplete: () => {
        hop.set(0);
        setLanding(true);
        callback.current();
      },
    });
    return () => controls.stop();
    // Geometry changes cancel and restart travel from the same measured segment, never a second path formula.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travel, geometry, scale, reduced, lessons, restSide]);
  useEffect(() => {
    if (!landing) return;
    const timer = window.setTimeout(() => setLanding(false), 700);
    return () => clearTimeout(timer);
  }, [landing]);
  const position = (point: Point): CSSProperties => ({
    left: `${(point.x / geometry.width) * 100}%`,
    top: `${(point.y / geometry.height) * 100}%`,
  });
  const arrived = phase === "ready" || reduced;
  const show = (index: number) => ({
    initial: false as const,
    animate: { opacity: phase === "insights" ? 0 : 1, scale: 1, y: 0 },
    transition: { duration: reduced ? 0 : 0.35, delay: phase === "building" ? index * 0.32 : 0 },
  });
  const movingFrom = travel ? lessons.findIndex((l) => l.lessonId === travel.from) + 1 : -1;
  const bunnyPoint = rest(activePoint);
  return (
    <div
      className={styles.worldShell}
      data-theme={chapter.theme}
      data-phase={phase}
      data-reduced={reduced}
    >
      {intro}
      <div className={styles.worldCaption}>
        <span>{chapter.eyebrow ?? `CHAPTER ${fixture.chapters.indexOf(chapter) + 1}`}</span>
        <h2>{chapter.name}</h2>
        <p>{chapter.subtitle}</p>
      </div>
      <div
        ref={frame}
        inert={!!intro}
        className={styles.viewport}
        data-camera={camera.mode}
        data-world-viewport
        tabIndex={0}
        aria-label={`${chapter.name} adventure map. Swipe, scroll, or use the arrow buttons to explore the full path. Use Back to bunny to return.`}
      >
        <div
          ref={canvas}
          className={styles.canvas}
          data-map-layout={geometry.mobile ? "mobile" : "wide"}
          style={{ width, aspectRatio: `${geometry.width}/${geometry.height}` }}
        >
          <JourneyLandscape geometry={geometry} theme={chapter.theme} />
          <svg
            className={styles.route}
            viewBox={`0 0 ${geometry.width} ${geometry.height}`}
            aria-hidden="true"
          >
            {(["edge", "fill", "progress"] as const).flatMap((layer) =>
              geometry.segments.map((d, i) => {
                const isDone =
                  i === 0 ||
                  (i <= lessons.length &&
                    lessons.slice(0, i).every((l) => completed.has(l.nodeId))) ||
                  checkpointComplete;
                const ahead = i === activePoint && bunnyPresent && !checkpointComplete;
                const nextLesson = lessons[i];
                const locked = nextLesson && !nextLesson.available;
                return (
                  <g
                    key={`${layer}-${d}`}
                    data-trail-layer={layer}
                    data-trail-state={
                      isDone ? "completed" : ahead ? "next" : locked ? "locked" : "future"
                    }
                  >
                    {layer === "edge" && (
                      <motion.path
                        d={d}
                        fill="none"
                        stroke="#b6a581"
                        strokeWidth={geometry.mobile ? 23 : 25}
                        strokeLinecap="round"
                        initial={false}
                        animate={{
                          opacity: phase === "insights" ? 0 : 1,
                          pathLength: phase === "insights" ? 0 : 1,
                        }}
                        transition={{
                          duration: !reduced && phase === "building" ? 1.5 : 0,
                          delay: phase === "building" ? i * 0.25 : 0,
                        }}
                      />
                    )}
                    {layer === "fill" && (
                      <motion.path
                        d={d}
                        initial={false}
                        animate={{ pathLength: phase === "insights" ? 0 : 1 }}
                        transition={{
                          duration: !reduced && phase === "building" ? 1.5 : 0,
                          delay: phase === "building" ? i * 0.25 : 0,
                        }}
                        ref={(el) => {
                          paths.current[i] = el;
                        }}
                        fill="none"
                        stroke="#fff5d9"
                        strokeWidth={geometry.mobile ? 17 : 19}
                        strokeLinecap="round"
                        opacity={phase === "insights" ? 0 : 1}
                      />
                    )}
                    {layer === "progress" && (
                      <motion.path
                        d={d}
                        fill="none"
                        stroke={
                          isDone ? "#8051b0" : ahead ? "#a486ba" : locked ? "#b9aa8b" : "#9c8b68"
                        }
                        strokeWidth={isDone ? 6 : ahead ? 4 : 2}
                        strokeDasharray={
                          isDone ? undefined : ahead ? "1 13" : locked ? "2 11" : "2 7"
                        }
                        className={
                          ahead && arrived && !reduced && !travel
                            ? styles.directionTrail
                            : undefined
                        }
                        strokeLinecap="round"
                        style={i === movingFrom ? { pathLength: drawing } : undefined}
                        initial={false}
                        animate={{ opacity: phase === "insights" ? 0 : 1 }}
                      />
                    )}
                  </g>
                );
              }),
            )}
          </svg>
          <motion.div className={styles.origin} style={position(geometry.points[0])} {...show(0)}>
            <button
              onClick={onAssessment}
              aria-label={
                fixture.assessmentComplete === false
                  ? "Find a reading starting point"
                  : "View the reading assessment"
              }
            >
              <Glyph
                name={fixture.assessmentComplete === false ? "book-open" : "check"}
                size={30}
              />
              <span>{chapter.originLabel ?? "Your assessment"}</span>
            </button>
          </motion.div>
          {lessons.map((lesson, index) => {
            const done = completed.has(lesson.nodeId),
              current = index === currentIndex && !travel && bunnyPresent && arrived,
              access = lesson.available;
            const visual = lesson;
            const state = done
              ? "completed"
              : current
                ? "current"
                : access
                  ? "upcoming"
                  : "premium";
            return (
              <motion.article
                key={lesson.nodeId}
                className={styles.stop}
                data-lesson={lesson.lessonId}
                data-node-state={state}
                data-destination-shape={visual.shape}
                style={position(geometry.points[index + 1])}
                {...show(index + 1)}
              >
                {done ? (
                  <CompletedLessonNode
                    lesson={lesson}
                    disabled={!!travel || !arrived}
                    onReplay={() => onLesson(lesson)}
                  />
                ) : (
                  <button
                    className={styles.destination}
                    disabled={!!travel || !arrived}
                    onClick={() => onLesson(lesson)}
                    aria-label={`${done ? "Completed" : current ? "Current lesson" : "Upcoming lesson"}: ${lesson.title}${!access ? `, ${lesson.lockedReason ?? "Readee+ required"}` : ""}`}
                  >
                    {done ? (
                      <Glyph name="check" size={29} />
                    ) : (
                      <FluentIcon name={visual.icon} size={current ? 42 : 33} />
                    )}
                  </button>
                )}
                <div
                  className={current ? styles.currentCard : styles.stopLabel}
                  data-card-enter={current && arrived}
                >
                  {current && (
                    <span className={styles.nextLabel}>
                      {travel ? "A new step ahead" : "YOUR NEXT DISCOVERY"}
                    </span>
                  )}
                  <h3>{lesson.title}</h3>
                  {current && visual.objective && (
                    <p className={styles.lessonObjective}>{visual.objective}</p>
                  )}
                  {current ? (
                    <button
                      className={styles.primary}
                      onClick={() => onLesson(lesson)}
                      disabled={!!travel || !arrived}
                    >
                      {access ? "Let’s begin" : (lesson.lockedReason ?? "Continue with Readee+")}
                      <Glyph name="arrow-right" size={18} />
                    </button>
                  ) : (
                    <span>
                      {done
                        ? "Completed"
                        : !access
                          ? (lesson.lockedReason ?? "Readee+")
                          : "Coming up"}
                    </span>
                  )}
                </div>
              </motion.article>
            );
          })}
          <motion.div
            className={styles.checkpoint}
            data-checkpoint-ready={currentIndex < 0 && !checkpointComplete}
            data-confirmation={fixture.provisional}
            style={position(geometry.points[lessons.length + 1])}
            {...show(lessons.length + 1)}
          >
            <button
              disabled={!!travel || !arrived}
              onClick={onCheckpoint}
              aria-label="Open chapter checkpoint"
            >
              <CheckpointLandmark complete={checkpointComplete} />
              <div className={styles.checkpointSign}>
                <strong>
                  {chapter.checkpointLabel ??
                    (fixture.provisional ? "Starting-point check" : "Storybook checkpoint")}
                </strong>
                <span>
                  {checkpointComplete
                    ? "Completed"
                    : currentIndex < 0
                      ? "Ready to explore"
                      : `${remainingLessons} ${remainingLessons === 1 ? "lesson" : "lessons"} away`}
                </span>
              </div>
            </button>
          </motion.div>
          <motion.div
            className={styles.milestone}
            data-milestone-ready={checkpointComplete}
            style={position(geometry.points[lessons.length + 2])}
            {...show(lessons.length + 2)}
          >
            <button
              onClick={onMilestone}
              disabled={!arrived || !checkpointComplete}
              aria-label={
                checkpointComplete
                  ? "Open the unit completion keepsake"
                  : "Pass the unit exam to unlock the keepsake"
              }
            >
              <MilestoneLandmark complete={milestoneComplete} />
              <strong>{chapter.milestoneLabel ?? "Chapter keepsake"}</strong>
              <span>
                {milestoneComplete
                  ? "Unit complete!"
                  : checkpointComplete
                    ? "Ready to open"
                    : "Pass the exam to unlock"}
              </span>
            </button>
          </motion.div>
          {phase !== "insights" && bunnyPresent && (
            <motion.div
              className={styles.bunnyAnchor}
              data-bunny
              data-travel={!!travel}
              data-resting={!travel && !landing && arrived}
              data-looking={travel ? "ahead" : "rest"}
              data-facing={
                travel && geometry.points[movingFrom + 1].x < geometry.points[movingFrom].x
                  ? "left"
                  : "right"
              }
              style={{ x: bunnyX, y: bunnyY }}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: phase === "building" ? 1.5 : 0, duration: 0.35 }}
            >
              <motion.div
                style={{ y: hop }}
                animate={{
                  scaleX:
                    landing && !reduced ? [1, 1.1, 0.98, 1] : travel && !reduced ? [1, 1.08, 1] : 1,
                  scaleY:
                    landing && !reduced ? [1, 0.9, 1.03, 1] : travel && !reduced ? [1, 0.92, 1] : 1,
                  rotate: travel && !reduced ? -5 : 0,
                }}
                transition={{ duration: 0.5 }}
                className={styles.bunny}
              >
                <Bunny outfitId={fixture.outfitId} />
                <span className={styles.bunnyName} title={fixture.name}>
                  {fixture.name}
                </span>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
      <div className={styles.mapFooter} inert={!!intro}>
        <span>
          <i />
          {
            chapter.lessonIds.filter((id) =>
              completed.has(fixture.definition.lessons.find((l) => l.lessonId === id)!.nodeId),
            ).length
          }{" "}
          of {chapter.lessonIds.length} {chapter.progressLabel ?? "chapter lessons"} complete
        </span>
        <div className={styles.mapControls} aria-label="Explore the journey path">
          {geometry.width > 1000 && (
            <>
              <button onClick={() => camera.nudge(-1)} aria-label="See earlier journey stops">
                <Glyph name="arrow-left" size={18} />
              </button>
              <span>Scroll the path</span>
              <button onClick={() => camera.nudge(1)} aria-label="See later journey stops">
                <Glyph name="arrow-right" size={18} />
              </button>
            </>
          )}
          {bunnyPresent && (
            <button onClick={() => camera.target(bunnyPoint.x, "settled", true)}>
              <Glyph name="target" size={17} />
              Back to bunny
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
