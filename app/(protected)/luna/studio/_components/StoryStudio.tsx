"use client";

/**
 * Luna Story Studio — a kid writes their own story with Luna, then shares it
 * with the community. A short 4-step wizard collects the story type, the kind
 * of writing, the kid's idea, and the cover style. Generation is
 * /api/luna/story; publishing routes through the community review queue with
 * the kid's first-name byline (publishKidStory action). Publishing plays a
 * full-screen celebration (confetti + carrots flying into the header counter).
 *
 * Hi-fi visuals/motion ported from the Claude Design "Luna Story Studio" mock.
 */

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Send,
  RotateCcw,
  ShieldCheck,
  Carrot,
  Check,
  Clock,
  BookOpen,
  Feather,
  ThumbsUp,
  Megaphone,
  GraduationCap,
  Mail,
} from "lucide-react";
import LunaOrb from "../../_components/LunaOrb";
import TodayQuestionPlayer from "@/app/today/[slug]/_components/TodayQuestionPlayer";
import ReadAloudButton from "@/app/today/[slug]/_components/ReadAloudButton";
import { publishKidStory } from "../actions";
import { STORY_CARROTS } from "@/lib/luna/story-rewards";
import { playPublishSfx } from "./studio-sfx";

type Phase = "make" | "generating" | "preview" | "published" | "error";

type QuizQ = {
  prompt: string;
  choices: string[];
  correct: string;
  hint: string | null;
};

type Story = {
  contentId: string | null;
  title: string;
  text: string;
  imageUrl: string | null;
  audioUrl: string | null;
  questions: QuizQ[];
};

const STORY_TYPES = [
  "Animals",
  "Space",
  "Magic",
  "Funny",
  "Mystery",
  "Superhero",
  "Ocean",
  "Dinosaurs",
];

// The kind of writing. Keys match the whitelist in /api/luna/story; the
// generator shapes the piece to the form (story arc, stanzas, letter, etc.).
const WRITING_FORMS: {
  key: string;
  label: string;
  desc: string;
  icon: typeof BookOpen;
}[] = [
  { key: "narrative", label: "Story", desc: "A beginning, middle, and happy ending", icon: BookOpen },
  { key: "poem", label: "Poem", desc: "Fun lines with rhythm and rhyme", icon: Feather },
  { key: "opinion", label: "Opinion", desc: "What you think, and why", icon: ThumbsUp },
  { key: "persuasive", label: "Persuasive", desc: "Convince the reader you're right", icon: Megaphone },
  { key: "informational", label: "Informational", desc: "Teach real, true facts", icon: GraduationCap },
  { key: "friendly letter", label: "Friendly Letter", desc: "Dear friend, guess what...", icon: Mail },
];

const IMAGE_STYLES: { key: string; label: string; from: string; to: string }[] = [
  { key: "cartoon", label: "Cartoon", from: "#fbbf24", to: "#f43f5e" },
  { key: "realistic", label: "Realistic", from: "#64748b", to: "#334155" },
  { key: "watercolor", label: "Watercolor", from: "#a7f3d0", to: "#38bdf8" },
  { key: "comic", label: "Comic", from: "#f0abfc", to: "#6366f1" },
];

const GEN_CAPTIONS = [
  "Thinking of a story you'll love...",
  "Picking just-right words...",
  "Putting the pages together...",
  "Adding the fun parts...",
];

const BALOO = { fontFamily: "'Baloo 2','Nunito',sans-serif" };
const CONFETTI_COLORS = ["#fbbf24", "#f43f5e", "#38bdf8", "#34d399", "#a78bfa", "#fff"];

export default function StoryStudio({
  childId,
  childName,
  avatarSrc,
  carrots,
}: {
  childId: string;
  childName: string;
  avatarSrc: string;
  carrots: number;
}) {
  const [phase, setPhase] = useState<Phase>("make");
  // Bumping this remounts the wizard so "Start over" returns to question 1.
  const [attempt, setAttempt] = useState(0);

  // The inputs the wizard collects.
  const [storyType, setStoryType] = useState<string>("");
  const [writingForm, setWritingForm] = useState<string>("narrative");
  const [idea, setIdea] = useState<string>("");
  const [imageStyle, setImageStyle] = useState<string>("cartoon");

  const [story, setStory] = useState<Story | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [published, setPublished] = useState<{ carrots: number } | null>(null);
  const [, startPublish] = useTransition();

  // Header carrot counter + publish celebration.
  const [carrotCount, setCarrotCount] = useState<number>(carrots);
  const [counterPop, setCounterPop] = useState(false);
  const [overlay, setOverlay] = useState<null | { out: boolean; stamped: boolean; confetti: boolean; carrots: number[] }>(null);
  const [publishing, setPublishing] = useState(false);
  const counterRef = useRef<HTMLSpanElement | null>(null);
  const orbCenterRef = useRef<HTMLDivElement | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function reset() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStoryType("");
    setWritingForm("narrative");
    setIdea("");
    setImageStyle("cartoon");
    setStory(null);
    setErrorMsg("");
    setPublished(null);
    setOverlay(null);
    setPublishing(false);
    setAttempt((n) => n + 1);
    setPhase("make");
  }

  async function generate() {
    setPhase("generating");
    try {
      const res = await fetch("/api/luna/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, storyType, writingForm, idea, imageStyle }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setErrorMsg(
          data?.reason === "plan"
            ? "Story Studio is a Readee+ feature."
            : data?.error || "Luna hit a snag. Let's try again.",
        );
        setPhase("error");
        return;
      }
      setStory({
        contentId: data.contentId ?? null,
        title: data.story.title,
        text: data.story.text,
        imageUrl: data.story.imageUrl ?? null,
        audioUrl: data.story.audioUrl ?? null,
        questions: Array.isArray(data.story.questions) ? data.story.questions : [],
      });
      setPhase("preview");
    } catch {
      setErrorMsg("Something went wrong. Let's try again.");
      setPhase("error");
    }
  }

  // Measure the flight path from the Luna orb (overlay center) to the header
  // carrot counter, so the reward carrots visibly fly into the tally.
  function launchCarrots() {
    const orb = orbCenterRef.current?.getBoundingClientRect();
    const counter = counterRef.current?.getBoundingClientRect();
    if (!orb || !counter) return;
    const dx = counter.left + counter.width / 2 - (orb.left + orb.width / 2);
    const dy = counter.top + counter.height / 2 - (orb.top + orb.height / 2);
    document.documentElement.style.setProperty("--carrot-dx", `${dx}px`);
    document.documentElement.style.setProperty("--carrot-dy", `${dy}px`);
    setOverlay((o) => (o ? { ...o, carrots: Array.from({ length: 10 }, (_, i) => i) } : o));
  }

  function publish() {
    if (!story?.contentId) {
      setErrorMsg("This story can't be shared. Try making a new one.");
      setPhase("error");
      return;
    }
    setPublishing(true);
    const sfx = playPublishSfx();
    sfx.whoosh();

    // Kick off the real submit immediately; the celebration runs on timers and
    // we reconcile at the end (submit is fast — deferHeavyMedia).
    let result: { ok: true; carrotsAwarded: number } | { ok: false; error: string } | null = null;
    startPublish(async () => {
      try {
        result = await publishKidStory({ contentId: story.contentId! });
      } catch {
        result = { ok: false, error: "That took too long. Please try publishing again." };
      }
    });

    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));

    at(420, () => setOverlay({ out: false, stamped: false, confetti: false, carrots: [] }));
    at(1250, () => {
      sfx.stamp();
      setOverlay((o) => (o ? { ...o, stamped: true } : o));
    });
    at(1650, () => {
      sfx.fanfare();
      setOverlay((o) => (o ? { ...o, confetti: true } : o));
      launchCarrots();
    });
    at(2650, () => {
      sfx.coin();
      setCarrotCount((c) => c + STORY_CARROTS.post);
      setCounterPop(true);
    });
    at(3300, () => setCounterPop(false));
    at(5300, () => setOverlay((o) => (o ? { ...o, out: true } : o)));
    at(6000, () => {
      setOverlay(null);
      setPublishing(false);
      if (result && !result.ok) {
        setErrorMsg(result.error);
        setPhase("error");
        return;
      }
      setPublished({ carrots: result?.ok ? result.carrotsAwarded : STORY_CARROTS.post });
      setPhase("published");
    });
  }

  const styleGradient = (() => {
    const s = IMAGE_STYLES.find((x) => x.key === imageStyle) ?? IMAGE_STYLES[0];
    return `linear-gradient(120deg, ${s.from}, ${s.to})`;
  })();

  const wide = phase === "preview" || phase === "published";

  return (
    <div className={`mx-auto px-4 pb-8 pt-3 sm:px-6 ${wide ? "max-w-[1120px]" : "max-w-3xl"}`}>
      <StudioKeyframes />

      {/* Top bar: back-to-start (once you've left make) + live carrot counter. */}
      <div className="flex min-h-[34px] items-center justify-between">
        {phase !== "make" ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-violet-700 dark:text-slate-400"
          >
            <ArrowLeft className="h-4 w-4" /> Start over
          </button>
        ) : (
          <span />
        )}
        <span
          ref={counterRef}
          className={`inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-extrabold text-orange-700 dark:bg-orange-950/30 dark:text-orange-300 ${
            counterPop ? "ss-counterPop" : ""
          }`}
          style={BALOO}
        >
          <Carrot className="h-4 w-4" /> {carrotCount}
        </span>
      </div>

      {phase === "make" && (
        <div>
          <div className="mb-4 mt-1 flex items-center justify-center gap-2.5">
            {/* Luna, our AI. The orb's halo box (size+90) is cropped to the blob. */}
            <div className="relative h-12 w-12 flex-none overflow-hidden rounded-full">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <LunaOrb mode="idle" size={44} />
              </div>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl" style={BALOO}>
              Write a story with Luna
            </h1>
          </div>

          <Wizard
            key={attempt}
            storyType={storyType}
            setStoryType={setStoryType}
            writingForm={writingForm}
            setWritingForm={setWritingForm}
            idea={idea}
            setIdea={setIdea}
            imageStyle={imageStyle}
            setImageStyle={setImageStyle}
            onDone={generate}
          />

          <p className="mt-6 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center text-sm text-zinc-500 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 flex-none text-emerald-500" /> Every story is checked to keep readers safe. Check out our{" "}
            <Link href="/safety" className="font-bold text-violet-600 underline transition hover:text-violet-700 dark:text-violet-300">
              safety policy
            </Link>
            .
          </p>
        </div>
      )}

      {phase === "generating" && <Generating />}

      {phase === "preview" && story && (
        <Preview
          story={story}
          childName={childName}
          avatarSrc={avatarSrc}
          styleGradient={styleGradient}
          publishing={publishing}
          onPublish={publish}
          onRetry={generate}
        />
      )}

      {phase === "published" && story && (
        <Published
          story={story}
          childName={childName}
          avatarSrc={avatarSrc}
          styleGradient={styleGradient}
          carrots={published?.carrots ?? STORY_CARROTS.post}
          onAgain={reset}
        />
      )}

      {phase === "error" && (
        <div className="mt-10 rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-900/40 dark:bg-rose-950/20">
          <p className="text-base font-bold text-rose-800 dark:text-rose-200">{errorMsg}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
          >
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
        </div>
      )}

      {overlay && (
        <PublishOverlay overlay={overlay} orbCenterRef={orbCenterRef} avatarChildName={childName} />
      )}
    </div>
  );
}

/* ───────────────────── Publish celebration overlay ───────────────────── */

function PublishOverlay({
  overlay,
  orbCenterRef,
  avatarChildName,
}: {
  overlay: { out: boolean; stamped: boolean; confetti: boolean; carrots: number[] };
  orbCenterRef: React.RefObject<HTMLDivElement | null>;
  avatarChildName: string;
}) {
  // Deterministic sparkle/confetti positions (no Math.random at module scope).
  const sparkles = Array.from({ length: 34 }, (_, i) => ({
    left: (i * 37) % 100,
    top: (i * 53) % 100,
    delay: (i % 10) * 0.18,
  }));
  const burst = Array.from({ length: 40 }, (_, i) => ({
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    angle: (i / 40) * Math.PI * 2,
    dist: 120 + (i % 5) * 44,
    delay: (i % 8) * 0.02,
  }));
  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center overflow-hidden text-center transition-all duration-500"
      style={{
        background: "linear-gradient(165deg,#312e81,#1e1b4b 55%,#2e1065)",
        opacity: overlay.out ? 0 : 1,
        transform: overlay.out ? "scale(1.06)" : "scale(1)",
      }}
      aria-live="polite"
    >
      {/* Drifting aurora blobs */}
      <div className="ss-aurora" style={{ background: "radial-gradient(circle, rgba(167,139,250,.5), transparent 60%)", left: "12%", top: "18%" }} />
      <div className="ss-aurora" style={{ background: "radial-gradient(circle, rgba(56,189,248,.3), transparent 60%)", right: "10%", top: "24%", animationDelay: "-4s" }} />
      <div className="ss-aurora" style={{ background: "radial-gradient(circle, rgba(244,114,182,.26), transparent 60%)", left: "30%", bottom: "10%", animationDelay: "-8s" }} />

      {sparkles.map((s, i) => (
        <span
          key={i}
          className="ss-twinkle absolute h-1.5 w-1.5 rounded-full bg-white"
          style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s` }}
        />
      ))}

      {/* Luna, spinning rays + expanding ring */}
      <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
        <div className="ss-raySpin absolute inset-0" style={{ background: "conic-gradient(from 0deg, transparent, rgba(167,139,250,.45), transparent 30%, rgba(56,189,248,.4), transparent 60%)", borderRadius: "999px" }} />
        <div className="ss-ring absolute" style={{ width: 150, height: 150, border: "2px solid rgba(196,181,253,.7)", borderRadius: "999px" }} />
        <div ref={orbCenterRef} className="ss-orbIn relative" style={{ width: 150, height: 150 }}>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <LunaOrb mode="speaking" size={150} />
          </div>
        </div>
      </div>

      {overlay.stamped && (
        <div
          className="ss-stampIn mt-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-extrabold"
          style={{ border: "3px solid #34d399", background: "#ecfdf5", color: "#047857", ...BALOO }}
        >
          <Check className="h-4 w-4" strokeWidth={3} /> Sent!
        </div>
      )}

      <p className="mt-6 text-[11px] font-extrabold uppercase tracking-[0.22em] text-violet-300">Story Studio</p>
      <h2 className="ss-titlePop mt-2 text-4xl font-extrabold text-white sm:text-5xl" style={BALOO}>
        Your story is on its way!
      </h2>
      <p className="mt-2 text-lg font-bold text-violet-200" style={BALOO}>
        Luna is walking it over to the library.
      </p>

      {/* Confetti burst */}
      {overlay.confetti &&
        burst.map((b, i) => (
          <span
            key={i}
            className="ss-burst absolute h-2.5 w-2.5 rounded-[2px]"
            style={{
              background: b.color,
              left: "50%",
              top: "42%",
              // @ts-expect-error CSS custom props
              "--bx": `${Math.cos(b.angle) * b.dist}px`,
              "--by": `${Math.sin(b.angle) * b.dist}px`,
              animationDelay: `${b.delay}s`,
            }}
          />
        ))}

      {/* Carrots flying to the header counter */}
      {overlay.carrots.map((i) => (
        <span
          key={i}
          className="ss-carrotFly absolute left-1/2 top-[42%] text-orange-400"
          style={{ animationDelay: `${i * 0.06}s` }}
        >
          <Carrot className="h-6 w-6" fill="#fb923c" />
        </span>
      ))}
    </div>
  );
}

/* Injects all celebration/step keyframes once. */
function StudioKeyframes() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
@keyframes ss-titlePop{0%{opacity:0;transform:translateY(10px) scale(.9)}60%{transform:translateY(0) scale(1.04)}100%{opacity:1;transform:none}}
@keyframes ss-popIn{0%{opacity:0;transform:scale(.5)}70%{transform:scale(1.15)}100%{opacity:1;transform:scale(1)}}
@keyframes ss-stepIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes ss-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes ss-bandRise{from{opacity:0;transform:translateY(18px) scale(.99)}to{opacity:1;transform:none}}
@keyframes ss-barFill{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes ss-counterPop{0%{transform:scale(1)}40%{transform:scale(1.25)}100%{transform:scale(1)}}
@keyframes ss-stampIn{0%{opacity:0;transform:rotate(-12deg) scale(.4)}70%{transform:rotate(4deg) scale(1.12)}100%{opacity:1;transform:rotate(-4deg) scale(1)}}
@keyframes ss-twinkle{0%,100%{opacity:.15;transform:scale(.7)}50%{opacity:1;transform:scale(1.2)}}
@keyframes ss-raySpin{to{transform:rotate(360deg)}}
@keyframes ss-ringOut{0%{opacity:.8;transform:scale(.6)}100%{opacity:0;transform:scale(1.7)}}
@keyframes ss-orbIn{0%{opacity:0;transform:scale(.6)}100%{opacity:1;transform:scale(1)}}
@keyframes ss-aurora{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-24px)}}
@keyframes ss-floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes ss-wiggle{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}
@keyframes ss-burst{0%{opacity:1;transform:translate(-50%,-50%)}100%{opacity:0;transform:translate(calc(-50% + var(--bx)),calc(-50% + var(--by))) rotate(240deg)}}
@keyframes ss-carrotFly{0%{opacity:0;transform:translate(-50%,-50%) scale(.4)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.1)}100%{opacity:0;transform:translate(calc(-50% + var(--carrot-dx)),calc(-50% + var(--carrot-dy))) scale(.35)}}
.ss-step{animation:ss-stepIn .4s ease both}
.ss-bandRise{animation:ss-bandRise .5s cubic-bezier(.34,1.56,.64,1) both}
.ss-counterPop{animation:ss-counterPop .5s ease}
.ss-aurora{position:absolute;width:340px;height:340px;filter:blur(20px);animation:ss-aurora 12s ease-in-out infinite}
.ss-twinkle{animation:ss-twinkle 2.4s ease-in-out infinite}
.ss-raySpin{animation:ss-raySpin 26s linear infinite}
.ss-ring{animation:ss-ringOut 1.8s ease-out infinite}
.ss-orbIn{animation:ss-orbIn .6s cubic-bezier(.34,1.56,.64,1) both}
.ss-stampIn{animation:ss-stampIn .5s cubic-bezier(.34,1.56,.64,1) both}
.ss-titlePop{animation:ss-titlePop .55s cubic-bezier(.34,1.56,.64,1) both}
.ss-burst{animation:ss-burst 1.1s ease-out forwards}
.ss-carrotFly{animation:ss-carrotFly 1.1s cubic-bezier(.5,0,.6,1) forwards}
.ss-floatY{animation:ss-floatY 3s ease-in-out infinite}
.ss-wiggle{animation:ss-wiggle 1.8s ease-in-out infinite;transform-origin:center}
.ss-pop{animation:ss-popIn .4s cubic-bezier(.34,1.56,.64,1) both}
.ss-titlepop-h2{animation:ss-titlePop .5s cubic-bezier(.34,1.56,.64,1) both}
.ss-bar{transform-origin:left;animation:ss-barFill .45s ease both}
@media (prefers-reduced-motion:reduce){.ss-step,.ss-bandRise,.ss-counterPop,.ss-aurora,.ss-twinkle,.ss-raySpin,.ss-ring,.ss-orbIn,.ss-stampIn,.ss-titlePop,.ss-burst,.ss-carrotFly,.ss-floatY,.ss-wiggle,.ss-pop,.ss-titlepop-h2,.ss-bar{animation-duration:.001s!important;animation-iteration-count:1!important}}
`,
      }}
    />
  );
}

/* ─────────────────── Shared input building blocks ─────────────────── */

/* Thumbnail with a shimmer skeleton until the image loads, then a soft fade. */
function ThumbImage({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <span className="relative block h-[120px] w-full overflow-hidden bg-zinc-100 dark:bg-slate-800 sm:h-[150px]">
      {!loaded && (
        <span className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-slate-800 dark:to-slate-700" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 h-full w-full object-cover transition duration-300 ease-out group-hover:scale-[1.06] ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </span>
  );
}

/* An image tile (story type or cover style) with a selected ring + check. */
function ImageTile({
  src,
  label,
  selected,
  onClick,
}: {
  src: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border bg-white text-center transition duration-200 active:scale-[0.96] dark:bg-slate-900/50 ${
        selected
          ? "border-violet-500 shadow-[0_0_0_3px_rgba(139,92,246,0.15)_inset]"
          : "border-zinc-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700"
      }`}
      style={BALOO}
    >
      <ThumbImage src={src} />
      <span
        className={`block px-1.5 py-3 text-[15px] sm:text-[17px] ${
          selected ? "bg-violet-50 text-violet-800 dark:bg-violet-950/30 dark:text-violet-200" : "text-zinc-700 dark:text-slate-200"
        }`}
      >
        {label}
      </span>
      {selected && (
        <span className="ss-pop absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-violet-500 text-white shadow">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

function TypeChips({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-[18px]">
      {STORY_TYPES.map((t) => (
        <ImageTile
          key={t}
          src={`/images/story-types/${t.toLowerCase()}.png`}
          label={t}
          selected={value === t}
          onClick={() => onChange(t)}
        />
      ))}
    </div>
  );
}

function StyleChips({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-[18px]">
      {IMAGE_STYLES.map((s) => (
        <ImageTile
          key={s.key}
          src={`/images/story-styles/${s.key}.png`}
          label={s.label}
          selected={value === s.key}
          onClick={() => onChange(s.key)}
        />
      ))}
    </div>
  );
}

function FormChips({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-[18px]">
      {WRITING_FORMS.map((f) => {
        const selected = value === f.key;
        const Icon = f.icon;
        return (
          <button
            key={f.key}
            type="button"
            onClick={() => onChange(f.key)}
            className={`group flex items-center gap-3 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] ${
              selected
                ? "border-violet-500 bg-violet-50 shadow-[0_0_0_3px_rgba(139,92,246,0.12)_inset] dark:bg-violet-950/30"
                : "border-zinc-200 bg-white hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900/50"
            }`}
            style={BALOO}
          >
            <span
              className={`flex h-[52px] w-[52px] flex-none items-center justify-center rounded-2xl ${
                selected ? "ss-pop bg-violet-600 text-white" : "bg-zinc-100 text-violet-600 dark:bg-slate-800 dark:text-violet-300"
              }`}
            >
              <Icon className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className={`block text-[18px] font-extrabold ${selected ? "text-violet-800 dark:text-violet-200" : "text-zinc-800 dark:text-slate-100"}`}>
                {f.label}
              </span>
              <span className="block text-sm text-zinc-500 dark:text-slate-400">{f.desc}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function IdeaBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        maxLength={200}
        placeholder="A brave space puppy who is scared of the dark..."
        className="w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-lg text-zinc-900 outline-none transition focus:border-violet-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(139,92,246,0.12)] dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
      />
      <span className="pointer-events-none absolute bottom-3 right-4 text-xs font-bold text-zinc-400">{value.length}/200</span>
    </div>
  );
}

/* ─────────────────────────── Wizard ─────────────────────────── */

function Wizard(props: MakerProps) {
  const { storyType, setStoryType, writingForm, setWritingForm, idea, setIdea, imageStyle, setImageStyle, onDone } = props;
  const [step, setStep] = useState(0);
  const next = () => setStep((s) => Math.min(3, s + 1));

  return (
    <div>
      {/* 4-segment cumulative progress bar. */}
      <div className="mb-6 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="h-[9px] flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-slate-700">
            {i <= step && <span className="ss-bar block h-full w-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />}
          </span>
        ))}
      </div>

      {step === 0 && (
        <div className="ss-step">
          <h2 className="ss-titlepop-h2 text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-3xl" style={BALOO}>Pick a kind of story</h2>
          <div className="mt-5"><TypeChips value={storyType} onChange={setStoryType} /></div>
          <NextButton disabled={!storyType} onClick={next} />
        </div>
      )}
      {step === 1 && (
        <div className="ss-step">
          <h2 className="ss-titlepop-h2 text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-3xl" style={BALOO}>What kind of writing is it?</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">Luna can write it lots of ways.</p>
          <div className="mt-5"><FormChips value={writingForm} onChange={setWritingForm} /></div>
          <NextButton disabled={!writingForm} onClick={next} />
        </div>
      )}
      {step === 2 && (
        <div className="ss-step">
          <h2 className="ss-titlepop-h2 text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-3xl" style={BALOO}>What happens in your story?</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">Tell Luna your idea. A few words is plenty.</p>
          <div className="mt-5"><IdeaBox value={idea} onChange={setIdea} /></div>
          <NextButton disabled={!idea.trim()} onClick={next} />
        </div>
      )}
      {step === 3 && (
        <div className="ss-step">
          <h2 className="ss-titlepop-h2 text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-3xl" style={BALOO}>How should it look?</h2>
          <div className="mt-5"><StyleChips value={imageStyle} onChange={setImageStyle} /></div>
          <MakeButton onClick={onDone} />
        </div>
      )}
    </div>
  );
}

function NextButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-lg font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
      style={BALOO}
    >
      Next <ArrowRight className="h-5 w-5" />
    </button>
  );
}

function MakeButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-4 text-lg font-extrabold text-white shadow-[0_8px_24px_-12px_rgba(245,158,11,0.9)] transition hover:-translate-y-0.5 hover:brightness-105 active:scale-[0.98]"
      style={BALOO}
    >
      <Sparkles className="ss-wiggle h-5 w-5" /> Make my story!
    </button>
  );
}

/* ─────────────────────────── Generating ─────────────────────────── */

function Generating() {
  const [cap, setCap] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCap((c) => (c + 1) % GEN_CAPTIONS.length), 1400);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="mt-12 flex flex-col items-center text-center">
      <LunaOrb mode="thinking" size={140} />
      <h2 className="mt-4 text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-3xl" style={BALOO}>
        Luna is writing your story...
      </h2>
      <p className="mt-1 text-base text-zinc-600 dark:text-slate-300">{GEN_CAPTIONS[cap]}</p>
    </div>
  );
}

/* Cover with a shimmer skeleton until the (remote) image loads, then fade in. */
function CoverImage({ src, styleGradient }: { src: string | null; styleGradient: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className="relative aspect-square overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 shadow-md ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-800"
      style={{ background: src ? undefined : styleGradient }}
    >
      {src && (
        <>
          {!loaded && <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-slate-800 dark:to-slate-700" />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            onLoad={() => setLoaded(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          />
        </>
      )}
    </div>
  );
}

/* Byline avatar + "Written by {name}". */
function Byline({ avatarSrc, childName }: { avatarSrc: string; childName: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-7 w-7 flex-none rounded-full bg-cover bg-center shadow-sm ring-2 ring-white dark:ring-slate-800"
        style={{ backgroundImage: `url(${avatarSrc})` }}
      />
      <span className="text-sm font-bold text-zinc-600 dark:text-slate-300" style={BALOO}>
        Written by {childName}
      </span>
    </div>
  );
}

/* ─────────────────────────── Preview ─────────────────────────── */

function Preview({
  story,
  childName,
  avatarSrc,
  styleGradient,
  publishing,
  onPublish,
  onRetry,
}: {
  story: Story;
  childName: string;
  avatarSrc: string;
  styleGradient: string;
  publishing: boolean;
  onPublish: () => void;
  onRetry: () => void;
}) {
  const wordCount = story.text.trim().split(/\s+/).filter(Boolean).length;
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
  });
  return (
    <div className="mt-4">
      {/* Daily Readee reader layout: image + passage LEFT, quiz sticky RIGHT. */}
      <div className="grid grid-cols-1 items-start gap-9 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          <motion.div {...rise(0)} className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-violet-700 dark:text-violet-300">
            <Sparkles className="h-3 w-3" /> Story Studio
          </motion.div>

          <motion.h1 {...rise(0.08)} className="mt-2 text-[34px] font-extrabold leading-[1.1] tracking-tight text-zinc-900 dark:text-white sm:text-[38px]" style={BALOO}>
            {story.title}
          </motion.h1>

          <motion.div {...rise(0.18)} className="mt-3">
            <Byline avatarSrc={avatarSrc} childName={childName} />
          </motion.div>

          <motion.div {...rise(0.28)} className="mt-5">
            <div className="mx-auto w-full max-w-[440px]">
              <CoverImage src={story.imageUrl} styleGradient={styleGradient} />
            </div>
          </motion.div>

          <motion.div {...rise(0.4)} className="mt-4 flex items-center gap-2 text-xs text-zinc-500 dark:text-slate-400">
            <BookOpen className="h-3.5 w-3.5" />
            {wordCount} words · {Math.max(1, Math.round(wordCount / 150))} min read
            {story.audioUrl && <ReadAloudButton audioUrl={story.audioUrl} />}
          </motion.div>

          <motion.div
            {...rise(0.5)}
            className="mt-[18px] flex flex-col gap-[18px] whitespace-pre-line text-[19px] leading-[1.75] text-zinc-900 dark:text-slate-100"
            style={{ fontFamily: 'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif' }}
          >
            {story.text}
          </motion.div>
        </div>

        {/* RIGHT — the quiz, sticky, exactly like Daily Readee (reused player) */}
        {story.questions.length > 0 && (
          <motion.div {...rise(0.55)} className="lg:sticky lg:top-[76px] lg:mt-[64px]">
            <TodayQuestionPlayer questions={story.questions} />
          </motion.div>
        )}
      </div>

      <motion.div {...rise(0.68)} className="mt-10 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onPublish}
          disabled={publishing}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-lg font-extrabold text-white transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60"
          style={BALOO}
        >
          <Send className="h-5 w-5" /> {publishing ? "Sending..." : "Publish to Readee"}
        </button>
        <button
          type="button"
          onClick={onRetry}
          disabled={publishing}
          className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-lg font-bold text-indigo-600 transition hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/50 dark:text-indigo-300"
          style={BALOO}
        >
          <RotateCcw className="h-5 w-5" /> Try again
        </button>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────── Published ─────────────────────────── */

function Published({
  story,
  childName,
  avatarSrc,
  styleGradient,
  carrots,
  onAgain,
}: {
  story: Story;
  childName: string;
  avatarSrc: string;
  styleGradient: string;
  carrots: number;
  onAgain: () => void;
}) {
  const wordCount = story.text.trim().split(/\s+/).filter(Boolean).length;
  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        {/* LEFT — the story card, "In review" */}
        <div className="ss-bandRise rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
          <div className="mx-auto w-full max-w-[372px]">
            <CoverImage src={story.imageUrl} styleGradient={styleGradient} />
          </div>
          <h3 className="mt-4 text-[26px] font-extrabold leading-tight text-zinc-900 dark:text-white" style={BALOO}>
            {story.title}
          </h3>
          <div className="mt-2">
            <Byline avatarSrc={avatarSrc} childName={childName} />
          </div>
          <div className="mt-4 flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 font-bold text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              <Clock className="h-3.5 w-3.5" /> In review
            </span>
            <span className="font-bold text-zinc-400">{wordCount} words</span>
          </div>
        </div>

        {/* RIGHT — success panel */}
        <div
          className="ss-bandRise flex flex-col items-center justify-center rounded-3xl border border-emerald-200 p-10 text-center dark:border-emerald-900/40"
          style={{ background: "linear-gradient(135deg,#ecfdf5,#f5f3ff)" }}
        >
          <span className="ss-pop flex h-[76px] w-[76px] items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-10 w-10 text-emerald-600" strokeWidth={3} />
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-zinc-900 sm:text-[34px]" style={BALOO}>
            Sent to the library!
          </h2>
          <p className="mt-2 max-w-md text-base text-zinc-600">
            Our team checks every story to keep Readee kind and safe. Yours will show up for other kids once it&apos;s approved.
          </p>
          <div className="ss-pop mt-6 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-base font-extrabold text-orange-700" style={BALOO}>
            <Carrot className="h-5 w-5" /> +{carrots} carrots for posting!
          </div>
          <p className="mt-3 text-sm text-zinc-500">
            You&apos;ll earn {STORY_CARROTS.perRead} more carrots every time a kid reads it.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onAgain}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-4 text-lg font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-violet-700 active:scale-[0.98]"
        style={BALOO}
      >
        <Sparkles className="ss-wiggle h-5 w-5" /> Make another story
      </button>
    </div>
  );
}

/* ─────────────────────────── shared types ─────────────────────────── */

type MakerProps = {
  storyType: string;
  setStoryType: (v: string) => void;
  writingForm: string;
  setWritingForm: (v: string) => void;
  idea: string;
  setIdea: (v: string) => void;
  imageStyle: string;
  setImageStyle: (v: string) => void;
  onDone: () => void;
};
