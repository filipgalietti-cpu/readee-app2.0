"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Volume2 } from "lucide-react";
import { BunnyReaction } from "@/app/_components/Bunny/Bunny";
import { useLessonVoice } from "@/lib/lesson-engine/delivery/use-voice";
import { audioManager } from "@/lib/audio/audio-manager";
import { sfxCorrect } from "@/lib/lesson-engine/cues";
import {
  createGardenMaze,
  startMaze,
  stepMaze,
  mazeCarrots,
  type GardenMaze,
  type MazeRun,
  type Direction,
} from "@/lib/lesson-engine/delivery/garden-maze";
import "./garden-maze.css";
export type GardenMazeConfig = {
  title: string;
  actorName?: string;
  eyebrow?: string;
  goalLabel?: string;
  goalImage?: string;
  pickupImage?: string;
  boardLabel?: string;
  winTitle?: string;
  winMessage?: string;
  emptyMessage?: string;
  nextLabel?: string;
  introTitle?: string;
  introDescription?: string;
  trailMark?: "dots";
  seconds: number;
  backdrop: string;
  greeting: string;
  intro: string;
  finish: string;
  emptyFinish: string;
};
const CELL = 80,
  PAD = 18,
  SIZE = 596;
const center = (cell: number) => ({
  x: PAD + (cell % 7) * CELL + CELL / 2,
  y: PAD + Math.floor(cell / 7) * CELL + CELL / 2,
});
export default function GardenMazeGame({
  config,
  manifest,
  onComplete,
  renderActor,
}: {
  config: GardenMazeConfig;
  manifest: Record<string, string>;
  onComplete: (carrots: number) => void;
  renderActor: (happy: boolean) => ReactNode;
}) {
  const actorName = config.actorName ?? "Max";
  const goalLabel = config.goalLabel ?? "the ball";
  const voice = useLessonVoice(manifest);
  const [phase, setPhase] = useState<"welcome" | "instructions" | "countdown" | "play" | "party">(
    "welcome",
  );
  const phaseRef = useRef(phase),
    [maze] = useState<GardenMaze>(() => createGardenMaze()),
    mazeRef = useRef<GardenMaze>(maze);
  const [run, setRun] = useState<MazeRun>(() => startMaze(maze)),
    runRef = useRef<MazeRun>(run);
  const [count, setCount] = useState(3),
    [seconds, setSeconds] = useState(config.seconds),
    [left, setLeft] = useState(false),
    [burst, setBurst] = useState(0);
  const lastMove = useRef(0);
  const silent = useRef(false),
    complete = useRef(false),
    alive = useRef(true),
    root = useRef<HTMLElement>(null);
  const hold = useRef<ReturnType<typeof setInterval> | undefined>(undefined),
    winTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const drag = useRef<{ x: number; y: number; step: number } | null>(null),
    burstTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  function change(next: typeof phase) {
    phaseRef.current = next;
    setPhase(next);
  }
  function stopHold() {
    clearInterval(hold.current);
    hold.current = undefined;
  }
  function finish() {
    if (phaseRef.current !== "play" || !runRef.current) return;
    stopHold();
    clearTimeout(winTimer.current);
    voice.stop();
    change("party");
    if (!silent.current) voice.say(runRef.current.won ? config.finish : config.emptyFinish);
  }
  function move(direction: Direction) {
    if (
      phaseRef.current !== "play" ||
      !mazeRef.current ||
      !runRef.current ||
      document.hidden ||
      performance.now() - lastMove.current < 145
    )
      return;
    const before = runRef.current,
      next = stepMaze(mazeRef.current, before, direction);
    if (next === before) return;
    lastMove.current = performance.now();
    if (direction === "left" || direction === "right") setLeft(direction === "left");
    runRef.current = next;
    setRun(next);
    const earned = mazeCarrots(next) - mazeCarrots(before);
    if (earned) {
      setBurst(earned);
      clearTimeout(burstTimer.current);
      burstTimer.current = setTimeout(() => setBurst(0), 750);
      if (!silent.current) sfxCorrect();
    }
    if (next.won) {
      stopHold();
      winTimer.current = setTimeout(finish, 1000);
    }
  }
  const moveRef = useRef(move);
  useEffect(() => { moveRef.current = move; });
  useEffect(() => {
    alive.current = true;
    voice.say(config.greeting);
    const visibility = () => {
      if (document.hidden) {
        stopHold();
        drag.current = null;
      }
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      alive.current = false;
      stopHold();
      clearTimeout(winTimer.current);
      clearTimeout(burstTimer.current);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  function countdown(withoutSound = false) {
    if (!alive.current || phaseRef.current !== "instructions") return;
    silent.current = withoutSound;
    voice.stop();
    setCount(3);
    change("countdown");
  }
  useEffect(() => {
    if (phase !== "countdown") return;
    if (!silent.current) audioManager?.playPopSound();
    let timer: ReturnType<typeof setTimeout>;
    const advance = () => {
      if (document.hidden) {
        timer = setTimeout(advance, 200);
        return;
      }
      if (count > 0) setCount(count - 1);
      else {
        change("play");
        root.current?.focus();
      }
    };
    timer = setTimeout(advance, count > 0 ? 1000 : 550);
    return () => clearTimeout(timer);
  }, [phase, count]);
  useEffect(() => {
    if (phase !== "play") return;
    let elapsed = 0,
      last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      if (!document.hidden) elapsed += Math.min(300, now - last);
      last = now;
      setSeconds(Math.max(0, config.seconds - Math.floor(elapsed / 1000)));
      if (elapsed >= config.seconds * 1000 && !runRef.current?.won) finish();
    }, 100);
    return () => clearInterval(timer);
  }, [phase]);
  const pos = center(run?.position ?? 0),
    goal = center(maze?.goal ?? 48),
    playing = phase === "play";
  const controls = (["up", "left", "down", "right"] as Direction[]).map((direction, index) => {
    const Icon = [ArrowUp, ArrowLeft, ArrowDown, ArrowRight][index];
    return (
      <button
        key={direction}
        className={`mz-arrow mz-${direction}`}
        aria-label={`Move ${direction}`}
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          stopHold();
          move(direction);
          hold.current = setInterval(() => moveRef.current(direction), 170);
        }}
        onPointerUp={stopHold}
        onPointerCancel={stopHold}
        onLostPointerCapture={stopHold}
        onBlur={stopHold}
        onClick={(e) => {
          if (e.detail === 0) move(direction);
        }}
      >
        <Icon size={25} />
      </button>
    );
  });
  return (
    <section
      ref={root}
      tabIndex={-1}
      className={`mz-screen mz-${phase}`}
      data-game-screen={phase}
      aria-label={`${config.title} warm-up`}
      style={{ "--maze-backdrop": `url("${config.backdrop}")` } as CSSProperties}
      onKeyDown={(e) => {
        const d: Record<string, Direction> = {
          ArrowUp: "up",
          ArrowDown: "down",
          ArrowLeft: "left",
          ArrowRight: "right",
          w: "up",
          a: "left",
          s: "down",
          d: "right",
        };
        if (playing && d[e.key]) {
          e.preventDefault();
          move(d[e.key]);
        }
      }}
    >
      {phase === "party" ? (
        <>
          <div className="mz-confetti" aria-hidden="true">
            {Array.from({ length: 30 }, (_, i) => (
              <i
                key={i}
                style={{
                  left: `${(i * 37) % 100}%`,
                  background: ["#b5c38b", "#e9bd60", "#9783cd"][i % 3],
                  animationDelay: `${(i % 7) * 0.1}s`,
                }}
              />
            ))}
          </div>
          <div className="mz-party-bunny">
            <BunnyReaction state="levelup" outfitId="classic" />
          </div>
          <div className="mz-party-copy">
            <p className="mz-eyebrow">Warm-up complete</p>
            <h1>{run?.won ? (config.winTitle ?? "You found the ball!") : "Good exploring!"}</h1>
            <p>
              {run?.won
                ? (config.winMessage ?? `You and ${actorName} found your way together.`)
                : (config.emptyMessage ?? `${actorName} had a little adventure with you.`)}
            </p>
            <div className="mz-prize">
              <img src="/icons/fluent/carrot.svg" alt="" />
              <strong>+{mazeCarrots(run!, true)}</strong>
              <span>carrots</span>
            </div>
            <p>
              {run!.picked.length} collected{run!.won ? ` + 2 for ${goalLabel}` : ""} + 2 for
              warming up
            </p>
            <button
              className="mz-primary"
              onClick={() => {
                if (complete.current) return;
                complete.current = true;
                voice.stop();
                onComplete(mazeCarrots(run!, true));
              }}
            >
              {config.nextLabel ?? "Into the story"} <ArrowRight size={21} />
            </button>
          </div>
        </>
      ) : (
        <>
          <header className="mz-hud">
            <div>
              <p className="mz-eyebrow">{config.eyebrow ?? "A little backyard adventure"}</p>
              <h1>{config.title}</h1>
            </div>
            {(playing || phase === "countdown") && (
              <div className="mz-score">
                <span aria-label={`${seconds} seconds left`}>{seconds}s</span>
                <div className="mz-carrots">
                  <img src="/icons/fluent/carrot.svg" alt="Carrots" />
                  <strong key={run ? mazeCarrots(run) : 0}>{run ? mazeCarrots(run) : 0}</strong>
                </div>
              </div>
            )}
          </header>
          <div className="mz-playground">
            <svg
              className="mz-board"
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              role="img"
              aria-label={
                config.boardLabel ??
                `Garden maze. Guide ${actorName} along the paths to the red ball.`
              }
              data-position={run?.position}
              data-goal={maze?.goal}
              onPointerDown={(e) => {
                if (!playing) return;
                e.preventDefault();
                e.currentTarget.setPointerCapture(e.pointerId);
                drag.current = { x: e.clientX, y: e.clientY, step: 0 };
              }}
              onPointerMove={(e) => {
                if (!playing || !drag.current) return;
                const p = drag.current,
                  dx = e.clientX - p.x,
                  dy = e.clientY - p.y,
                  threshold = (e.currentTarget.getBoundingClientRect().width / 7) * 0.4;
                if (
                  Math.max(Math.abs(dx), Math.abs(dy)) < threshold ||
                  performance.now() - p.step < 100
                )
                  return;
                const direction =
                  Math.abs(dx) > Math.abs(dy)
                    ? dx > 0
                      ? "right"
                      : "left"
                    : dy > 0
                      ? "down"
                      : "up";
                move(direction);
                drag.current = { x: e.clientX, y: e.clientY, step: performance.now() };
              }}
              onPointerUp={() => (drag.current = null)}
              onPointerCancel={() => (drag.current = null)}
            >
              <rect
                x="8"
                y="8"
                width="580"
                height="580"
                rx="28"
                fill="#e9dfbd"
                stroke="#809365"
                strokeWidth="12"
              />
              {maze?.links.map((links, cell) => {
                const x = PAD + (cell % 7) * CELL,
                  y = PAD + Math.floor(cell / 7) * CELL;
                return (
                  <g key={cell} className="mz-hedge">
                    {cell % 7 < 6 && !links.includes(cell + 1) && (
                      <path d={`M${x + CELL} ${y}v${CELL}`} />
                    )}
                    {cell < 42 && !links.includes(cell + 7) && (
                      <path d={`M${x} ${y + CELL}h${CELL}`} />
                    )}
                  </g>
                );
              })}
              {run?.visited
                .filter((c) => c !== run.position)
                .map((c) => {
                  const p = center(c);
                  return (
                    <g key={c} opacity=".28" fill="#8e7756">
                      {config.trailMark === "dots" ? (
                        <circle cx={p.x} cy={p.y} r="4" />
                      ) : (
                        <>
                          <ellipse cx={p.x - 6} cy={p.y} rx="3" ry="5" />
                          <ellipse cx={p.x + 5} cy={p.y + 7} rx="3" ry="5" />
                        </>
                      )}
                    </g>
                  );
                })}
              {maze?.carrots
                .filter((c) => !run?.picked.includes(c))
                .map((c) => {
                  const p = center(c);
                  return (
                    <image
                      key={c}
                      href={config.pickupImage ?? "/icons/fluent/carrot.svg"}
                      x={p.x - 16}
                      y={p.y - 16}
                      width="32"
                      height="32"
                    />
                  );
                })}
              <g
                className={`mz-ball ${run?.won ? "is-found" : ""}`}
                transform={`translate(${goal.x} ${goal.y})`}
              >
                {config.goalImage ? (
                  <image href={config.goalImage} x="-28" y="-28" width="56" height="56" />
                ) : (
                  <>
                    <circle r="22" fill="#e67060" stroke="#ad453d" strokeWidth="3" />
                    <path
                      d="M-13-12Q-4-18 3-16"
                      fill="none"
                      stroke="#ffccaa"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </>
                )}
              </g>
              <g
                className="mz-max"
                style={{ transform: `translate(${pos.x - 34}px, ${pos.y - 34}px)` }}
              >
                <g transform={left ? "translate(68 0) scale(-1 1)" : undefined}>
                  <svg width="68" height="68" viewBox="0 0 190 155">
                    {renderActor(run?.won ?? false)}
                  </svg>
                </g>
              </g>
              {!!burst && (
                <text
                  key={`${run?.position}-${burst}`}
                  className="mz-burst"
                  x={pos.x}
                  y={pos.y - 25}
                >
                  +{burst}
                </text>
              )}
            </svg>
            {playing && (
              <aside className="mz-controls" aria-label={`Move ${actorName}`}>
                <div className="mz-pad">{controls}</div>
                <p>Drag {actorName} or use the arrows</p>
              </aside>
            )}
          </div>
          {(phase === "welcome" || phase === "instructions") && (
            <div className="mz-intro">
              <div className="mz-intro-copy">
                <div className="mz-intro-max" aria-hidden="true">
                  <svg viewBox="0 0 190 155">{renderActor(false)}</svg>
                  {config.goalImage ? (
                    <img
                      className="mz-intro-goal"
                      src={config.goalImage}
                      alt=""
                      width={72}
                      height={72}
                    />
                  ) : (
                    <span className="mz-intro-ball" />
                  )}
                </div>
                <h2>{config.introTitle ?? "Find a way to the ball."}</h2>
                <p>
                  {config.introDescription ?? (
                    <>
                      Guide {actorName} through the garden.
                      <br />
                      Pick up carrots along the way!
                    </>
                  )}
                </p>
                {phase === "welcome" ? (
                  <button
                    className="mz-primary"
                    onClick={() => {
                      change("instructions");
                      voice.say(config.intro, () => countdown());
                    }}
                  >
                    Let’s play <ArrowRight size={22} />
                  </button>
                ) : voice.error ? (
                  <>
                    <p role="status">The sound could not play.</p>
                    <button
                      className="mz-primary"
                      onClick={() => voice.say(config.intro, () => countdown())}
                    >
                      Try the sound again
                    </button>
                    <button className="mz-secondary" onClick={() => countdown(true)}>
                      Play without sound
                    </button>
                  </>
                ) : (
                  <p className="mz-listening">
                    <Volume2 size={21} /> Ready for a little adventure?
                  </p>
                )}
              </div>
            </div>
          )}
          {phase === "countdown" && (
            <div className="mz-countdown-overlay" role="status" aria-live="assertive">
              <strong key={count}>{count || "Go!"}</strong>
            </div>
          )}
          {playing && (
            <footer className="mz-bottom">
              <span aria-live="polite">
                {run?.won ? "Found it!" : burst ? `+${burst} carrots!` : "Follow your own path."}
              </span>
              <button className="mz-secondary" onClick={finish}>
                Finish warm-up <ArrowRight size={18} />
              </button>
            </footer>
          )}
        </>
      )}
    </section>
  );
}
