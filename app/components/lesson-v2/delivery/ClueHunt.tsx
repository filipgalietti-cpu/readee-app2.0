"use client";
import { useEffect, useRef, useState, type ReactNode, Fragment } from "react";
import { ArrowRight, Volume2 } from "lucide-react";
import { BunnyReaction } from "@/app/_components/Bunny/Bunny";
import { useLessonVoice } from "@/lib/lesson-engine/delivery/use-voice";
import { sfxCorrect } from "@/lib/lesson-engine/cues";
import { separateCrawlers, turnToward } from "@/lib/lesson-engine/delivery/crawler-motion";
import OpeningAmbience from "./OpeningAmbience";
import { audioManager } from "@/lib/audio/audio-manager";
import "./clue-hunt.css";

type Hunt = {
  id: string;
  title: string;
  lessonTitle?: string;
  nextLabel?: string;
  finishLabel?: string;
  introEyebrow?: string;
  ambienceLabel?: string;
  seconds: number;
  greeting: string;
  intro: string;
  ready: string;
  finish: string;
  backdrop: string;
  ambience: string;
  targets: { id: string; label: string; instruction: string }[];
  sprites: { id: string; label: string; image: string }[];
  /** Optional authored skin; defaults preserve the approved bug game exactly. */
  presentation?: {
    singular: string;
    plural: string;
    fieldLabel: string;
    welcome: string;
    instructions: string;
    celebration: string;
    exampleIds: string[];
    foliage?: boolean;
  };
};
type Crawler = {
  x: number;
  y: number;
  angle: number;
  endX: number;
  endY: number;
  hiddenUntil: number;
  speed: number;
  targetSpeed: number;
  speedAt: number;
};
// Each crossing has its own pace; contact yields gently without abrupt turns.
const crawlSpeed = () =>
  Math.random() < 0.25 ? 145 + Math.random() * 55 : 60 + Math.random() * 70;
function randomEntrance(width = window.innerWidth, height = window.innerHeight - 245) {
  const side = Math.floor(Math.random() * 4);
  const along = 0.12 + Math.random() * 0.76;
  const destination = 0.12 + Math.random() * 0.76;
  const mx = 75 / Math.max(1, width),
    my = 75 / Math.max(1, height);
  const x = side === 0 ? -mx : side === 1 ? 1 + mx : along;
  const y = side === 2 ? -my : side === 3 ? 1 + my : along;
  const endX = side === 0 ? 1 + mx : side === 1 ? -mx : destination;
  const endY = side === 2 ? 1 + my : side === 3 ? -my : destination;
  return { x, y, endX, endY, angle: Math.atan2((endX - x) * width, -(endY - y) * height) };
}
const COLORS: Record<string, string> = {
  "red-bug": "#c54d39",
  "blue-bug": "#498898",
  "gold-bug": "#b48c34",
  leaf: "#719056",
};
/** Top-down, jointed legs. The body travels continuously through the scenery. */
function Beetle({ kind }: { kind: string }) {
  return (
    <svg className="ch-beetle" viewBox="0 0 100 110" aria-hidden="true">
      <ellipse cx="50" cy="65" rx="24" ry="29" fill="#28351e" opacity=".18" />
      {[0, 1, 2].map((i) => (
        <g
          key={i}
          className={`ch-legs ch-legs-${i}`}
          style={{ transformOrigin: `50px ${39 + i * 15}px` }}
          stroke="#43392a"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        >
          <path d={`M35 ${39 + i * 15} L21 ${32 + i * 17} L13 ${39 + i * 18}`} />
          <path d={`M65 ${39 + i * 15} L79 ${46 + i * 13} L87 ${38 + i * 17}`} />
        </g>
      ))}
      <path d="M42 28 35 12m23 16 7-16" stroke="#43392a" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="50" cy="32" rx="13" ry="12" fill="#43392a" />
      <ellipse
        cx="50"
        cy="59"
        rx="23"
        ry="30"
        fill={COLORS[kind] ?? COLORS["red-bug"]}
        stroke="#493c2a"
        strokeWidth="2.5"
      />
      <path d="M50 32v55" stroke="#493c2a" strokeWidth="2.5" />
      <g fill="#493c2a">
        <circle cx="39" cy="47" r="4.5" />
        <circle cx="61" cy="47" r="4.5" />
        <circle cx="38" cy="65" r="5" />
        <circle cx="62" cy="65" r="5" />
        <circle cx="43" cy="79" r="3" />
        <circle cx="57" cy="79" r="3" />
      </g>
      <path
        d="M34 50q-3 12 2 19"
        stroke="#fff1d1"
        strokeWidth="3"
        opacity=".35"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
function Ferns() {
  return (
    <svg
      className="ch-foreground"
      viewBox="0 0 1000 650"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g fill="#466a48" stroke="#36513b" strokeWidth="2">
        <path d="M-20 650Q65 525 111 390Q105 521 21 650Z" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} transform={`translate(${i * 16} ${620 - i * 39}) rotate(${i * 4})`}>
            <path d="M0 0Q-57-1-67-40Q-16-38 0 0Z" />
            <path d="M0 0Q55 16 82-17Q33-31 0 0Z" />
          </g>
        ))}
        <path d="M1020 650Q932 518 902 418Q906 549 979 650Z" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${995 - i * 21} ${625 - i * 45}) rotate(${-i * 5})`}>
            <path d="M0 0Q-68 6-78-30Q-20-36 0 0Z" />
            <path d="M0 0Q52 0 63-35Q15-36 0 0Z" />
          </g>
        ))}
      </g>
    </svg>
  );
}
/** One timed crawling game; lesson data supplies the clues, imagery and recordings. */
export default function ClueHunt({
  game,
  manifest,
  onComplete,
  renderSprite,
}: {
  game: Hunt;
  manifest: Record<string, string>;
  onComplete: (carrots: number) => void;
  renderSprite?: (kind: string) => ReactNode;
}) {
  const voice = useLessonVoice(manifest);
  const [screen, setScreen] = useState<"welcome" | "intro" | "ready" | "play" | "end">("welcome");
  const [count, setCount] = useState(3);
  const silent = useRef(false);
  const [score, setScore] = useState(0),
    [left, setLeft] = useState(game.seconds),
    [target, setTarget] = useState(0),
    [reaction, setReaction] = useState(false);
  const [kinds, setKinds] = useState<string[]>([]);
  const nodes = useRef<(HTMLButtonElement | null)[]>([]),
    field = useRef<HTMLDivElement | null>(null),
    crawlers = useRef<Crawler[]>([]);
  const scoreRef = useRef(0),
    done = useRef(false),
    delivered = useRef(false),
    turn = useRef(0),
    voiceRef = useRef(voice),
    endRef = useRef(() => {});
  useEffect(() => { voiceRef.current = voice; }, [voice]);
  const reduced = useRef(false);
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    voice.say(game.greeting);
  }, [game.id]);
  function arrange(next: number) {
    nodes.current.forEach((node) => {
      if (node) {
        node.disabled = false;
        delete node.dataset.caught;
      }
    });
    const decoys = game.sprites.filter((s) => s.id !== game.targets[next].id && s.id !== "leaf");
    setKinds(
      Array.from({ length: 7 }, (_, i) =>
        i % 2 === 0 ? game.targets[next].id : decoys[Math.floor(i / 2) % decoys.length].id,
      ),
    );
    crawlers.current = Array.from({ length: 7 }, (_, i) => ({
      ...(reduced.current
        ? { x: 0.18 + (i % 3) * 0.3, y: 0.12 + (i / 7) * 0.75, angle: 0, endX: 0, endY: 0 }
        : randomEntrance()),
      hiddenUntil: 0,
      speed: crawlSpeed(),
      targetSpeed: crawlSpeed(),
      speedAt: performance.now() + 650 + Math.random() * 1500,
    }));
  }
  function begin() {
    if (done.current) return;
    arrange(0);
    setScreen("play");
    if (!silent.current) voiceRef.current.say(game.targets[0].instruction);
  }
  function countdown(withoutSound = false) {
    silent.current = withoutSound;
    voiceRef.current.stop();
    setCount(3);
    setScreen("ready");
  }
  useEffect(() => {
    if (screen !== "ready") return;
    if (!silent.current) audioManager?.playPopSound();
    const advance = () => {
      if (document.hidden) {
        timeout = setTimeout(advance, 250);
        return;
      }
      if (count > 0) setCount(count - 1);
      else begin();
    };
    let timeout = setTimeout(advance, count > 0 ? 1000 : 650);
    return () => clearTimeout(timeout);
  }, [screen, count]);
  function start() {
    silent.current = false;
    setScreen("intro");
    voice.say(game.intro, () => countdown());
  }
  function finish() {
    if (done.current) return;
    done.current = true;
    setScreen("end");
    if (!silent.current) voiceRef.current.say(game.finish);
  }
  useEffect(() => { endRef.current = finish; });
  useEffect(() => {
    if (screen !== "play") return;
    let raf = 0,
      last = performance.now(),
      width = 1,
      height = 1;
    const measure = () => {
      width = field.current?.clientWidth || 1;
      height = field.current?.clientHeight || 1;
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (field.current) observer.observe(field.current);
    const tick = (now: number) => {
      if (document.hidden) {
        last = now;
        raf = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      crawlers.current.forEach((bug, i) => {
        const el = nodes.current[i];
        if (!el) return;
        if (bug.hiddenUntil > now) return;
        if (bug.hiddenUntil) {
          bug.hiddenUntil = 0;
          el.disabled = false;
          delete el.dataset.caught;
          Object.assign(
            bug,
            reduced.current
              ? { x: 0.15 + (i % 3) * 0.3, y: 0.14 + Math.random() * 0.68, angle: 0 }
              : randomEntrance(width, height),
          );
          bug.speed = crawlSpeed();
          bug.speedAt = 0;
        }
        if (!reduced.current) {
          if (now > bug.speedAt) {
            bug.targetSpeed = crawlSpeed();
            bug.speedAt = now + 650 + Math.random() * 1500;
          }
          bug.speed += (bug.targetSpeed - bug.speed) * (1 - Math.exp(-7 * dt));
          const dx = (bug.endX - bug.x) * width,
            dy = (bug.endY - bug.y) * height;
          const distance = Math.hypot(dx, dy),
            step = bug.speed * dt;
          if (distance <= step) {
            // Both endpoints are fully outside the frame, so no visible teleport.
            Object.assign(bug, randomEntrance(width, height));
            bug.speed = crawlSpeed();
            bug.speedAt = 0;
          } else {
            bug.angle = turnToward(bug.angle, Math.atan2(dx, -dy), dt);
            bug.x += ((dx / distance) * step) / width;
            bug.y += ((dy / distance) * step) / height;
          }
        }
      });
      separateCrawlers(crawlers.current, width, height, width <= 600 ? 76 : 90, now);
      crawlers.current.forEach((bug, i) => {
        const el = nodes.current[i];
        if (!el || bug.hiddenUntil > now) return;
        el.style.transform = `translate3d(${bug.x * width}px,${bug.y * height}px,0) translate(-50%,-50%) rotate(${bug.angle}rad)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    let elapsed = 0,
      clockAt = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      if (!document.hidden) elapsed += Math.min(0.5, (now - clockAt) / 1000);
      clockAt = now;
      setLeft(Math.max(0, Math.ceil(game.seconds - elapsed)));
      if (elapsed >= game.seconds) {
        endRef.current();
        return;
      }
      const next = Math.min(
        game.targets.length - 1,
        Math.floor(elapsed / (game.seconds / game.targets.length)),
      );
      if (next !== turn.current) {
        turn.current = next;
        setTarget(next);
        if (!silent.current) voiceRef.current.say(game.targets[next].instruction);
      }
    }, 200);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(timer);
      observer.disconnect();
    };
  }, [screen, game]);
  useEffect(() => {
    if (!reaction) return;
    const t = setTimeout(() => setReaction(false), 1000);
    return () => clearTimeout(t);
  }, [score, reaction]);
  function catchBug(i: number, now: number) {
    const bug = crawlers.current[i],
      el = nodes.current[i];
    if (screen !== "play" || done.current || !bug || bug.hiddenUntil > now) return;
    bug.hiddenUntil = now + 1250;
    if (el) {
      el.disabled = true;
      el.dataset.caught = kinds[i] === game.targets[turn.current].id ? "yes" : "away";
    }
    if (kinds[i] !== game.targets[turn.current].id) return;
    scoreRef.current++;
    setScore(scoreRef.current);
    setReaction(true);
    sfxCorrect();
  }
  const cue = game.targets[target];
  const sprite = (kind: string) =>
    renderSprite ? (
      <div className="ch-beetle ch-custom-sprite">{renderSprite(kind)}</div>
    ) : (
      <Beetle kind={kind} />
    );
  const examples = game.presentation?.exampleIds ?? ["red-bug", "blue-bug", "gold-bug"];
  return (
    <section className={`ch-frame ch-${screen}`} aria-label={game.title} data-game-screen={screen}>
      <img className="ch-landscape" src={game.backdrop} alt="" />
      {game.presentation?.foliage !== false && <Ferns />}
      <header className="ch-top">
        <span>Warm up · {game.lessonTitle ?? game.title}</span>
        <span className="ch-carrots" aria-label={`${screen === "end" ? score + 2 : score} carrots`}>
          <img src="/icons/fluent/carrot.svg" alt="Carrots" />
          <b key={screen === "end" ? score + 2 : score}>{screen === "end" ? score + 2 : score}</b>
          {reaction && <i aria-hidden="true">+1</i>}
        </span>
      </header>
      {screen === "play" ? (
        <>
          <div className="ch-clue" role="status">
            {sprite(cue.id)}
            <h1>{cue.label}</h1>
            <button aria-label="Hear the clue" onClick={() => voice.say(cue.instruction)}>
              <Volume2 size={22} />
            </button>
          </div>
          <div
            className="ch-time"
            role="progressbar"
            aria-label="Warm-up time"
            aria-valuemin={0}
            aria-valuemax={game.seconds}
            aria-valuenow={game.seconds - left}
          >
            <span style={{ width: `${(100 * left) / game.seconds}%` }} />
          </div>
          <div
            className="ch-field"
            ref={field}
            aria-label={game.presentation?.fieldLabel ?? "Catch the crawling bugs"}
          >
            {kinds.map((kind, i) => (
              <button
                key={i}
                ref={(el) => {
                  nodes.current[i] = el;
                }}
                className="ch-crawler"
                data-sprite={kind}
                aria-label={`Catch ${game.sprites.find((s) => s.id === kind)?.label}`}
                onClick={(event) => catchBug(i, event.timeStamp)}
                style={{ "--stride": `${0.24 + i * 0.025}s` } as React.CSSProperties}
              >
                {sprite(kind)}
              </button>
            ))}
          </div>
        </>
      ) : screen === "end" ? (
        <div className="ch-celebration" role="status">
          <div className="ch-celebration-character">
            <div className="ch-celebration-bunny" aria-label="Readee Rabbit celebrates with you">
              <BunnyReaction state="levelup" outfitId="classic" />
            </div>
            <div className="ch-party-bugs" aria-hidden="true">
              {examples.slice(0, 3).map((kind) => (
                <Fragment key={kind}>{sprite(kind)}</Fragment>
              ))}
            </div>
          </div>
          <h1>{game.presentation?.celebration ?? "Ready, clue finder!"}</h1>
          <p>
            You caught {score}{" "}
            {score === 1
              ? (game.presentation?.singular ?? "bug")
              : (game.presentation?.plural ?? "bugs")}
            !
          </p>
          <p className="ch-prize">
            <img src="/icons/fluent/carrot.svg" alt="Carrots" />
            {score + 2} carrots <small>Includes +2 for warming up</small>
          </p>
          <button
            className="ch-primary"
            onClick={() => {
              if (delivered.current) return;
              delivered.current = true;
              voice.stop();
              onComplete(scoreRef.current + 2);
            }}
          >
            {game.nextLabel ?? "Into the story"} <ArrowRight size={23} />
          </button>
          <button aria-label="Hear celebration" onClick={() => voice.say(game.finish)}>
            <Volume2 size={20} />
          </button>
        </div>
      ) : (
        <div className="ch-invitation">
          <p className="ch-eyebrow">{game.introEyebrow ?? "A little game before the story"}</p>
          <h1
            className={screen === "ready" ? "ch-countdown" : undefined}
            role={screen === "ready" ? "status" : undefined}
            aria-live="polite"
          >
            {screen === "ready" ? count || "Go!" : game.title}
          </h1>
          <div className="ch-example" aria-hidden="true">
            {examples.slice(0, 2).map((kind) => (
              <Fragment key={kind}>{sprite(kind)}</Fragment>
            ))}
          </div>
          <p>
            {screen === "welcome"
              ? (game.presentation?.welcome ?? "Look closely. Little legs everywhere!")
              : screen === "ready"
                ? "Here they come…"
                : (game.presentation?.instructions ??
                  "Catch the red bugs. Let the others crawl away.")}
          </p>
          {screen === "welcome" && (
            <button className="ch-primary" onClick={start}>
              Let’s play <ArrowRight size={23} />
            </button>
          )}
          {voice.error && screen === "intro" && (
            <div className="ch-recovery" role="alert">
              <p>The instructions could not play.</p>
              <button onClick={start}>Hear instructions again</button>
              <button onClick={() => countdown(true)}>Play without sound</button>
            </div>
          )}
        </div>
      )}
      <footer>
        <OpeningAmbience
          volume={0.32}
          duckVolume={0.1}
          src={game.ambience}
          label={game.ambienceLabel ?? "Bird sounds"}
          duck={voice.speaking}
        />
        {screen === "play" && (
          <button className="ch-finish" onClick={finish}>
            {game.finishLabel ?? "Into the story"} <ArrowRight size={18} />
          </button>
        )}
      </footer>
    </section>
  );
}
