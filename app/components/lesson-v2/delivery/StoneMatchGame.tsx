"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight, Volume2, RotateCcw } from "lucide-react";
import { BunnyReaction } from "@/app/_components/Bunny/Bunny";
import { useLessonVoice } from "@/lib/lesson-engine/delivery/use-voice";
import { sfxCorrect, sfxWrong } from "@/lib/lesson-engine/cues";
import { audioManager } from "@/lib/audio/audio-manager";
import {
  createStoneBoard,
  flipStone,
  closeStonePair,
  stoneCarrots,
  STONE_PAIR_CARROTS,
  STONE_COMPLETION_BONUS,
  type StoneBoard,
} from "@/lib/lesson-engine/delivery/stone-match";
import "./stone-match.css";

type GameConfig = {
  title: string;
  seconds: number;
  largeBoard: number;
  compactBoard: number;
  backdrop: string;
  greeting: string;
  intro: string;
  finish: string;
  emptyFinish: string;
  labels: string[];
  tileName?: "book" | "tile" | "window";
  invitation?: string;
  nextLabel?: string;
};
function StoneBack({ variant = 0 }: { variant?: number }) {
  return (
    <svg viewBox="0 0 140 116" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M20 11Q52 2 116 10Q135 19 134 49L132 94Q118 111 77 109L23 106Q7 99 7 79L5 36Q7 18 20 11Z"
        fill={["#a8a797", "#a0a597", "#a9aa9b", "#aca898"][variant % 4]}
        stroke="#777d70"
        strokeWidth="3"
      />
      <path
        d="M17 31Q23 17 48 17L111 18"
        stroke="#d4d2bf"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path d="m94 86 9 9 14-2m-23-7 5-10" stroke="#878e7c" strokeWidth="2" fill="none" />
      <path d="M10 73q10 6 13 20l-10-3m104-77-6 11 18 3" fill="#8d9b71" opacity=".7" />
    </svg>
  );
}
export default function StoneMatchGame({
  config,
  manifest,
  onComplete,
  renderPicture,
  renderBack,
}: {
  config: GameConfig;
  manifest: Record<string, string>;
  onComplete: (carrots: number) => void;
  renderPicture: (index: number) => ReactNode;
  renderBack?: () => ReactNode;
}) {
  const voice = useLessonVoice(manifest);
  const [phase, setPhase] = useState<"welcome" | "instructions" | "countdown" | "play" | "party">(
    "welcome",
  );
  const [countdown, setCountdown] = useState(3);
  const phaseRef = useRef(phase),
    live = useRef(true),
    completed = useRef(false),
    silent = useRef(false);
  const [board, setBoard] = useState<StoneBoard>(() =>
    createStoneBoard(config.compactBoard, config.labels.length, () => 0.37),
  );
  const current = useRef(board),
    [remaining, setRemaining] = useState(config.seconds),
    [message, setMessage] = useState(config.tileName === "book" ? "Open two books." : config.tileName === "tile" ? "Tap two tiles." : config.tileName === "window" ? "Open two windows." : "Tap two stones."),
    [spark, setSpark] = useState<number[]>([]);
  const tally = useRef<HTMLDivElement>(null);
  const [bursts, setBursts] = useState<
    { id: number; x: number; y: number; dx: number; dy: number }[]
  >([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]),
    finishPending = useRef(false);
  const publish = (next: StoneBoard) => {
    current.current = next;
    setBoard(next);
  };
  function later(fn: () => void, ms: number) {
    timers.current.push(
      setTimeout(() => {
        if (live.current) fn();
      }, ms),
    );
  }
  function changePhase(next: typeof phase) {
    phaseRef.current = next;
    setPhase(next);
  }
  useEffect(() => {
    live.current = true;
    voice.say(config.greeting);
    return () => {
      live.current = false;
      timers.current.forEach(clearTimeout);
    };
  }, []);
  function start(withoutSound = false) {
    if (!live.current || phaseRef.current !== "instructions") return;
    silent.current = withoutSound;
    voice.stop();
    const count =
      Math.min(window.innerWidth, window.innerHeight) < 600
        ? config.compactBoard
        : config.largeBoard;
    publish(createStoneBoard(count, config.labels.length));
    setRemaining(config.seconds);
    setCountdown(3);
    changePhase("countdown");
  }
  useEffect(() => {
    if (phase !== "countdown") return;
    if (!silent.current) audioManager?.playPopSound();
    // Keep each beat visible; backgrounding must not silently start the game.
    const advance = () => {
      if (document.hidden) {
        timeout = setTimeout(advance, 250);
        return;
      }
      if (countdown > 0) setCountdown(countdown - 1);
      else changePhase("play");
    };
    let timeout = setTimeout(advance, countdown > 0 ? 1000 : 650);
    return () => clearTimeout(timeout);
  }, [phase, countdown]);
  function finish() {
    if (phaseRef.current !== "play") return;
    timers.current.forEach(clearTimeout);
    voice.stop();
    changePhase("party");
    if (!silent.current) voice.say(current.current.pairs ? config.finish : config.emptyFinish);
  }
  function requestFinish() {
    if (finishPending.current) return;
    finishPending.current = true;
    if (current.current.open.length === 2) later(finish, 1500);
    else finish();
  }
  useEffect(() => {
    if (phase !== "play") return;
    let elapsed = 0,
      last = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      if (!document.hidden) elapsed += Math.min(0.5, (now - last) / 1000);
      last = now;
      setRemaining(Math.max(0, config.seconds - Math.floor(elapsed)));
      if (elapsed >= config.seconds) requestFinish();
    }, 100);
    return () => clearInterval(interval);
  }, [phase]);
  function reveal(id: number, tile: HTMLButtonElement) {
    if (phaseRef.current !== "play" || finishPending.current) return;
    const before = current.current,
      next = flipStone(before, id);
    if (next === before) return;
    publish(next);
    if (next.pairs > before.pairs) {
      const matched = next.matched.slice(-2);
      setSpark(matched);
      const from = tile.getBoundingClientRect(),
        to = tally.current?.getBoundingClientRect();
      if (to) {
        const x = from.left + from.width / 2,
          y = from.top + from.height / 2;
        const burst = {
          id: next.pairs,
          x,
          y,
          dx: to.left + to.width / 2 - x,
          dy: to.top + to.height / 2 - y,
        };
        setBursts((old) => [...old, burst]);
        later(() => setBursts((old) => old.filter((b) => b.id !== burst.id)), 1100);
      }
      setMessage("A match! Keep exploring.");
      sfxCorrect();
      if (!silent.current) voice.say(config.labels[next.stones[id].picture]);
      later(() => setSpark([]), 700);
      if (next.matched.length === next.stones.length) {
        finishPending.current = true;
        later(finish, 2200);
      }
      return;
    }
    if (next.open.length === 2) {
      setMessage("Remember these pictures…");
      sfxWrong();
      later(() => {
        publish(closeStonePair(current.current));
        setMessage("Try another pair.");
      }, 1500);
    } else setMessage("Where is its match?");
  }
  const prize = stoneCarrots(board.pairs);
  const matchCarrots = board.pairs * STONE_PAIR_CARROTS;
  return (
    <section
      className={`sm-screen sm-${phase}`}
      style={{ "--sm-backdrop": `url("${config.backdrop}")` } as CSSProperties}
      aria-label={`${config.title} warm-up`}
      data-game-screen={phase}
    >
      <div className="sm-world" aria-hidden="true" />
      {phase === "play" && (
        <div className="sm-reward-layer" aria-hidden="true">
          {bursts.map((b) => (
            <div
              key={b.id}
              className="sm-carrot-flight"
              style={
                {
                  left: b.x,
                  top: b.y,
                  "--reward-x": `${b.dx}px`,
                  "--reward-y": `${b.dy}px`,
                } as CSSProperties
              }
            >
              <img src="/icons/fluent/carrot.svg" alt="" />
              <b>+{STONE_PAIR_CARROTS}</b>
            </div>
          ))}
        </div>
      )}
      {phase === "party" ? (
        <>
          <div className="sm-confetti" aria-hidden="true">
            {Array.from({ length: 24 }, (_, i) => (
              <i
                key={i}
                style={{
                  left: `${(i * 43) % 100}%`,
                  background: ["#99b177", "#dcb461", "#9b88ca"][i % 3],
                  animationDelay: `${(i % 5) * 0.1}s`,
                }}
              />
            ))}
          </div>
          <div className="sm-party-bunny">
            <BunnyReaction state="levelup" outfitId="classic" />
          </div>
          <div className="sm-party-copy">
            <p className="sm-eyebrow">Warm-up complete</p>
            <h1>{board.pairs ? "You found the matches!" : "Ready for a story!"}</h1>
            <p>
              {board.pairs} {board.pairs === 1 ? "pair" : "pairs"} uncovered. Good exploring!
            </p>
            <div className="sm-prize">
              <img src="/icons/fluent/carrot.svg" alt="" />
              <strong>+{prize}</strong>
              <span>carrots</span>
            </div>
            <p className="sm-prize-breakdown">
              {matchCarrots} from matches + {STONE_COMPLETION_BONUS} for warming up
            </p>
            <button
              className="sm-primary"
              onClick={() => {
                if (completed.current) return;
                completed.current = true;
                voice.stop();
                onComplete(prize);
              }}
            >
              {config.nextLabel ?? "Into the story"} <ArrowRight size={20} />
            </button>
          </div>
        </>
      ) : (
        <>
          <header className="sm-hud">
            <div>
              <p className="sm-eyebrow">
                Warm up ·{" "}
                {phase === "play" ? (
                  <span className="sm-pair-count">
                    <b>{board.pairs}</b> / {board.stones.length / 2} pairs
                  </span>
                ) : (
                  "Look, remember, match"
                )}
              </p>
              <h1>{config.title}</h1>
            </div>
            {(phase === "play" || phase === "countdown") && (
              <div className="sm-score">
                <span aria-label={`${remaining} seconds left`}>{remaining}s</span>
                <div
                  className="sm-carrots"
                  ref={tally}
                  aria-label={`${matchCarrots} carrots earned`}
                  aria-live="polite"
                >
                  <img src="/icons/fluent/carrot.svg" alt="" />
                  <strong key={board.pairs} className={board.pairs ? "sm-tally-pop" : ""}>
                    {matchCarrots}
                  </strong>
                </div>
              </div>
            )}
          </header>
          {phase === "countdown" ? (
            <div className="sm-countdown-stage" role="status" aria-live="assertive" aria-atomic="true">
              <strong key={countdown} className="sm-countdown-number">
                {countdown || "Go!"}
              </strong>
            </div>
          ) : phase === "play" ? (
            <>
              <div
                className={`sm-board ${board.stones.length === config.compactBoard ? "sm-small-board" : ""}`}
                data-stone-count={board.stones.length}
                aria-label={config.tileName === "book" ? "Matching books" : config.tileName === "tile" ? "Matching tiles" : config.tileName === "window" ? "Matching windows" : "Matching stones"}
              >
                {board.stones.map((stone) => {
                  const matched = board.matched.includes(stone.id),
                    up = matched || board.open.includes(stone.id);
                  return (
                    <button
                      key={stone.id}
                      className={`sm-stone ${up ? "is-open" : ""} ${matched ? "is-matched" : ""} ${spark.includes(stone.id) ? "is-sparkling" : ""}`}
                      aria-label={
                        up
                          ? `${config.labels[stone.picture]}, ${config.tileName ?? "stone"} ${stone.id + 1}${matched ? ", matched" : ""}`
                          : `${config.tileName === "book" ? "Book" : config.tileName === "tile" ? "Tile" : config.tileName === "window" ? "Window" : "Stone"} ${stone.id + 1}, face down`
                      }
                      aria-pressed={up}
                      aria-disabled={matched}
                      data-stone={stone.id}
                      data-picture={stone.picture}
                      data-matched={matched}
                      onClick={(event) => reveal(stone.id, event.currentTarget)}
                    >
                      <span className="sm-flipper">
                        <span className="sm-back">
                          {renderBack ? renderBack() : <StoneBack variant={stone.id} />}
                        </span>
                        <span className="sm-front">{renderPicture(stone.picture)}</span>
                      </span>
                      <span className="sm-match-spark" aria-hidden="true">
                        ✦
                      </span>
                    </button>
                  );
                })}
              </div>
              <footer className="sm-game-footer">
                <p role="status">{message}</p>
                <button onClick={requestFinish}>
                  Finish warm-up <ArrowRight size={16} />
                </button>
              </footer>
            </>
          ) : (
            <div className="sm-welcome-content">
              <div className="sm-demo" aria-hidden="true">
                <div>
                  {renderBack ? renderBack() : <StoneBack />}
                </div>
                <div>{renderPicture(0)}</div>
                <div>{renderPicture(0)}</div>
              </div>
              <h2>{config.invitation ?? "What’s hiding under the stones?"}</h2>
              <p>
                Flip two. Remember the pictures.
                <br />
                Find their matches!
              </p>
              {phase === "welcome" ? (
                <button
                  className="sm-primary"
                  onClick={() => {
                    changePhase("instructions");
                    voice.say(config.intro, () => start());
                  }}
                >
                  Let’s play <ArrowRight size={22} />
                </button>
              ) : voice.error ? (
                <>
                  <p role="alert">The instructions could not play.</p>
                  <button className="sm-primary" onClick={() => start(true)}>
                    Play without sound
                  </button>
                  <button
                    className="sm-retry"
                    onClick={() => voice.say(config.intro, () => start())}
                  >
                    <RotateCcw size={18} /> Try the audio again
                  </button>
                </>
              ) : (
                <p className="sm-listening">
                  <Volume2 size={22} /> Listen, then we’ll play…
                </p>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
