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
  const [overlay, setOverlay] = useState<null | {
    out: boolean;
    stamped: boolean;
    confetti: boolean;
    carrots: FlyingCarrot[];
  }>(null);
  const [publishing, setPublishing] = useState(false);
  const counterRef = useRef<HTMLSpanElement | null>(null);
  const centerRef = useRef<HTMLDivElement | null>(null);
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

  // Measure the flight path from the celebration center to the header carrot
  // counter, so the reward carrots visibly fly into the tally.
  function launchCarrots() {
    const center = centerRef.current?.getBoundingClientRect();
    const counter = counterRef.current?.getBoundingClientRect();
    if (!center || !counter) return;
    const ox = center.left + center.width / 2;
    const oy = center.top + center.height / 2 - 40;
    const dx = counter.left + counter.width / 2 - ox;
    const dy = counter.top + counter.height / 2 - oy;
    const items: FlyingCarrot[] = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: ox + (Math.random() * 70 - 35),
      y: oy + (Math.random() * 50 - 25),
      dx,
      dy,
      delay: i * 0.075,
    }));
    setOverlay((o) => (o ? { ...o, carrots: items } : o));
  }

  function publish() {
    if (!story?.contentId) {
      setErrorMsg("This story can't be shared. Try making a new one.");
      setPhase("error");
      return;
    }
    setPublishing(true);
    const sfx = playPublishSfx();

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

      {overlay && <PublishOverlay overlay={overlay} centerRef={centerRef} />}
    </div>
  );
}

/* ───────────────────── Publish celebration overlay ───────────────────── */

type FlyingCarrot = { id: number; x: number; y: number; dx: number; dy: number; delay: number };

// Deterministic pseudo-random so confetti pieces don't reshuffle each render.
const rnd = (i: number, k: number) => ((i * 7919 + k * 104729 + 12345) % 100003) / 100003;

// One confetti piece — three shapes (rectangle, dot, streamer).
function piece(i: number, kind: number, color: string): React.CSSProperties {
  if (kind === 0) return { width: 7 + rnd(i, 3) * 5, height: 11 + rnd(i, 4) * 7, borderRadius: 2, background: color };
  if (kind === 1) return { width: 8 + rnd(i, 5) * 4, height: 8 + rnd(i, 5) * 4, borderRadius: "50%", background: color };
  return { width: 3, height: 15 + rnd(i, 6) * 9, borderRadius: 3, background: color };
}

function PublishOverlay({
  overlay,
  centerRef,
}: {
  overlay: { out: boolean; stamped: boolean; confetti: boolean; carrots: FlyingCarrot[] };
  centerRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden"
      style={{
        opacity: overlay.out ? 0 : 1,
        transform: overlay.out ? "scale(1.06)" : "scale(1)",
        transition: "opacity .6s ease, transform .6s ease",
      }}
      aria-live="polite"
    >
      {/* Base gradient */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(165deg,#312e81,#1e1b4b 55%,#2e1065)" }} />
      {/* Drifting aurora blobs */}
      <div style={{ position: "absolute", left: "50%", top: "42%", height: 1100, width: 1100, transform: "translate(-50%,-50%)", background: "radial-gradient(circle,rgba(167,139,250,.5),rgba(99,102,241,.18) 45%,transparent 70%)", animation: "ss-aurora 9s ease-in-out infinite" }} />
      <div style={{ position: "absolute", left: "12%", top: "70%", height: 520, width: 520, borderRadius: "50%", background: "radial-gradient(circle,rgba(56,189,248,.3),transparent 70%)", filter: "blur(10px)", animation: "ss-aurora 11s ease-in-out 1.5s infinite" }} />
      <div style={{ position: "absolute", right: "8%", top: "8%", height: 460, width: 460, borderRadius: "50%", background: "radial-gradient(circle,rgba(244,114,182,.26),transparent 70%)", filter: "blur(10px)", animation: "ss-aurora 13s ease-in-out .8s infinite" }} />
      {/* Bottom purple fade */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "38%", background: "linear-gradient(to top,rgba(124,58,237,.42),transparent)" }} />

      {/* Twinkling star field */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {Array.from({ length: 34 }, (_, i) => {
          const r = ((i * 9301 + 49297) % 233280) / 233280;
          const r2 = ((i * 4177 + 12345) % 100000) / 100000;
          return (
            <span
              key={i}
              style={{ position: "absolute", left: `${r * 100}%`, top: `${r2 * 100}%`, width: 3 + r2 * 4, height: 3 + r2 * 4, borderRadius: "50%", background: "#fff", animation: `ss-twinkle ${1.6 + r * 1.8}s ease-in-out ${r2 * 2}s infinite` }}
            />
          );
        })}
      </div>

      {/* Center: Luna + spinning rays + glow + expanding ring + copy */}
      <div ref={centerRef} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 24px" }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", animation: "ss-orbIn .7s cubic-bezier(.34,1.56,.64,1) both" }}>
          <span
            style={{
              position: "absolute",
              height: 620,
              width: 620,
              borderRadius: "50%",
              background:
                "conic-gradient(from 0deg,rgba(255,255,255,.16),transparent 12deg,transparent 30deg,rgba(255,255,255,.16) 42deg,transparent 60deg,transparent 78deg,rgba(255,255,255,.13) 90deg,transparent 108deg,transparent 126deg,rgba(255,255,255,.16) 138deg,transparent 156deg,transparent 174deg,rgba(255,255,255,.13) 186deg,transparent 204deg,transparent 222deg,rgba(255,255,255,.16) 234deg,transparent 252deg,transparent 270deg,rgba(255,255,255,.13) 282deg,transparent 300deg,transparent 318deg,rgba(255,255,255,.16) 330deg,transparent 348deg)",
              WebkitMaskImage: "radial-gradient(circle,transparent 120px,#000 190px,transparent 300px)",
              maskImage: "radial-gradient(circle,transparent 120px,#000 190px,transparent 300px)",
              animation: "ss-raySpin 26s linear infinite",
              pointerEvents: "none",
            }}
          />
          <span style={{ position: "absolute", height: 300, width: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,255,255,.28),transparent 70%)", animation: "ss-glowPulse 3.4s ease-in-out infinite" }} />
          <span style={{ position: "absolute", height: 240, width: 240, borderRadius: "50%", border: "2px solid rgba(255,255,255,.5)", animation: "ss-ringOut 1.6s ease-out .5s infinite" }} />
          <LunaOrb mode="speaking" size={150} />
        </div>

        {overlay.stamped && (
          <div
            style={{
              marginTop: -18,
              position: "relative",
              zIndex: 2,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 999,
              border: "3px solid #34d399",
              background: "#ecfdf5",
              padding: "8px 18px",
              fontFamily: "'Baloo 2','Nunito',sans-serif",
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: ".02em",
              color: "#047857",
              boxShadow: "0 12px 30px -12px rgba(0,0,0,.55)",
              animation: "ss-stampIn .45s cubic-bezier(.34,1.56,.64,1) both",
            }}
          >
            <Check size={20} strokeWidth={3} /> Published
          </div>
        )}

        <div style={{ margin: "26px 0 0", display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".22em", color: "#c4b5fd", animation: "ss-rise .6s ease .45s both" }}>
          <span style={{ height: 1, width: 28, background: "rgba(196,181,253,.6)" }} />
          Story Studio
          <span style={{ height: 1, width: 28, background: "rgba(196,181,253,.6)" }} />
        </div>
        <h2 style={{ margin: "12px 0 0", fontFamily: "'Baloo 2','Nunito',sans-serif", fontSize: 56, fontWeight: 800, lineHeight: 1.02, letterSpacing: "-.02em", color: "#fff", textShadow: "0 10px 34px rgba(23,10,60,.5)", animation: "ss-titlePop .6s cubic-bezier(.34,1.56,.64,1) .55s both" }}>
          Your story is on its way!
        </h2>
        <p style={{ margin: "14px 0 0", fontFamily: "'Baloo 2','Nunito',sans-serif", fontSize: 20, fontWeight: 700, color: "#ddd6fe", animation: "ss-rise .6s ease .8s both" }}>
          Luna is walking it over to the library.
        </p>
      </div>

      {/* Confetti: a burst out of Luna + a slower flutter layer */}
      {overlay.confetti && (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", perspective: "700px" }}>
          {Array.from({ length: 54 }, (_, i) => {
            const ang = (i / 54) * Math.PI * 2 + rnd(i, 1) * 0.7;
            const dist = 130 + rnd(i, 2) * 320;
            const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
            return (
              <span
                key={`b${i}`}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "42%",
                  "--bx": `${Math.cos(ang) * dist}px`,
                  "--by": `${Math.sin(ang) * dist * 0.72}px`,
                  "--br": `${(rnd(i, 7) > 0.5 ? 1 : -1) * (360 + rnd(i, 8) * 540)}deg`,
                  animation: `ss-burst ${1.5 + rnd(i, 9) * 1.1}s cubic-bezier(.2,.6,.3,1) ${rnd(i, 10) * 0.16}s both`,
                  ...piece(i, i % 3, color),
                } as React.CSSProperties}
              />
            );
          })}
          {Array.from({ length: 30 }, (_, i) => {
            const color = CONFETTI_COLORS[(i + 2) % CONFETTI_COLORS.length];
            return (
              <span
                key={`f${i}`}
                style={{
                  position: "absolute",
                  left: `${rnd(i, 11) * 100}%`,
                  top: 0,
                  "--sway": `${(rnd(i, 12) - 0.5) * 130}px`,
                  animation: `ss-flutter ${3 + rnd(i, 13) * 2.2}s cubic-bezier(.35,.15,.5,.9) ${0.3 + rnd(i, 14) * 1.6}s both`,
                  ...piece(i, (i + 1) % 3, color),
                } as React.CSSProperties}
              />
            );
          })}
        </div>
      )}

      {/* Carrots flying into the header counter */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 80 }}>
        {overlay.carrots.map((c) => (
          <span
            key={c.id}
            style={{
              position: "fixed",
              left: c.x,
              top: c.y,
              "--dx": `${c.dx}px`,
              "--dy": `${c.dy}px`,
              animation: `ss-carrotFly 1.05s cubic-bezier(.4,0,.6,1) ${c.delay}s both`,
              filter: "drop-shadow(0 6px 12px rgba(0,0,0,.35))",
            } as React.CSSProperties}
          >
            <Carrot size={30} fill="#fb923c" color="#fb923c" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* Injects all celebration/step keyframes once. Overlay keyframes mirror the
   Claude Design mock exactly; wizard helpers reuse a few of them. */
function StudioKeyframes() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
@keyframes ss-titlePop{0%{opacity:0;transform:translateY(10px) scale(.9) rotate(-2deg)}60%{opacity:1;transform:translateY(0) scale(1.04) rotate(.6deg)}100%{opacity:1;transform:none}}
@keyframes ss-popIn{0%{transform:scale(0);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
@keyframes ss-stepIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes ss-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes ss-bandRise{from{opacity:0;transform:translateY(18px) scale(.99)}to{opacity:1;transform:none}}
@keyframes ss-barFill{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes ss-counterPop{0%{transform:scale(1)}40%{transform:scale(1.25)}100%{transform:scale(1)}}
@keyframes ss-stampIn{0%{transform:scale(2.6);opacity:0}60%{transform:scale(.92);opacity:1}100%{transform:scale(1);opacity:1}}
@keyframes ss-twinkle{0%,100%{opacity:.15;transform:scale(.7)}50%{opacity:1;transform:scale(1.1)}}
@keyframes ss-raySpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes ss-ringOut{0%{transform:scale(.4);opacity:.55}100%{transform:scale(2.4);opacity:0}}
@keyframes ss-orbIn{0%{transform:scale(.2);opacity:0}55%{transform:scale(1.12);opacity:1}100%{transform:scale(1);opacity:1}}
@keyframes ss-aurora{0%,100%{transform:translate3d(0,0,0) scale(1);opacity:.55}50%{transform:translate3d(4%,-3%,0) scale(1.12);opacity:.8}}
@keyframes ss-glowPulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.7;transform:scale(1.06)}}
@keyframes ss-wiggle{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}
@keyframes ss-burst{0%{transform:translate(0,0) rotate(0deg) scale(.4);opacity:0}6%{opacity:1}55%{transform:translate(calc(var(--bx) * .74),calc(var(--by) * .74 - 40px)) rotate(calc(var(--br) * .55)) scale(1)}100%{transform:translate(var(--bx),calc(var(--by) + 260px)) rotate(var(--br)) scale(.92);opacity:0}}
@keyframes ss-flutter{0%{transform:translate(0,-14vh) rotateZ(0deg) rotateY(0deg);opacity:0}8%{opacity:1}50%{transform:translate(var(--sway),46vh) rotateZ(200deg) rotateY(180deg);opacity:1}100%{transform:translate(calc(var(--sway) * -1),112vh) rotateZ(430deg) rotateY(360deg);opacity:.85}}
@keyframes ss-carrotFly{0%{transform:translate(0,0) scale(.4);opacity:0}12%{opacity:1}22%{transform:translate(calc(var(--dx) * .18),calc(var(--dy) * .12 - 90px)) scale(1.25)}100%{transform:translate(var(--dx),var(--dy)) scale(.45);opacity:0}}
.ss-step{animation:ss-stepIn .4s ease both}
.ss-bandRise{animation:ss-bandRise .5s cubic-bezier(.34,1.56,.64,1) both}
.ss-counterPop{animation:ss-counterPop .5s ease}
.ss-wiggle{animation:ss-wiggle 1.8s ease-in-out infinite;transform-origin:center}
.ss-pop{animation:ss-popIn .4s cubic-bezier(.34,1.56,.64,1) both}
.ss-titlepop-h2{animation:ss-titlePop .5s cubic-bezier(.34,1.56,.64,1) both}
.ss-bar{transform-origin:left;animation:ss-barFill .45s ease both}
@media (prefers-reduced-motion:reduce){*{animation-duration:.001s!important;animation-iteration-count:1!important}}
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
