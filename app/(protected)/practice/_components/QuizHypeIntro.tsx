"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles, Flame, Carrot, ArrowRight } from "lucide-react";

/**
 * Pre-quiz hype sequence — a port of the "Quiz Hype Intro" Claude Design.
 *
 * Three beats:
 *   1. HYPE      — "Get ready, {name}!" + streak/carrots chips + breathing CTA
 *   2. COUNTDOWN — 3·2·1 on a dark indigo overlay, ring-burst per tick
 *   3. GO!       — full-screen flash, then hands off to the real runner
 *
 * The parent still owns audio-unlock (must happen inside the "Let's go!"
 * click gesture) and the actual quiz reveal:
 *   - onLetsGo()   fires synchronously on the button press to unlock audio.
 *   - onComplete() fires when the GO! flash finishes → parent reveals quiz.
 *
 * Sound here is a tiny Web-Audio blip/fanfare (respects `soundOn`), separate
 * from the Howler question audio the runner plays.
 */
export default function QuizHypeIntro({
  kidName,
  quizName,
  questionCount,
  streakDays,
  carrots,
  soundOn = true,
  countdownFrom = 3,
  confettiAmount = 90,
  onLetsGo,
  onComplete,
  onBack,
}: {
  kidName: string;
  quizName: string;
  questionCount: number;
  streakDays: number;
  carrots: number;
  soundOn?: boolean;
  countdownFrom?: number;
  confettiAmount?: number;
  onLetsGo: () => void;
  onComplete: () => void;
  onBack: () => void;
}) {
  const [phase, setPhase] = useState<"hype" | "count" | "go">("hype");
  const [count, setCount] = useState<number | null>(null);
  const [confetti, setConfetti] = useState<ConfettiBit[]>([]);
  const [burstId, setBurstId] = useState(0);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const acRef = useRef<AudioContext | null>(null);
  const doneRef = useRef(false);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  const after = useCallback((ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  /* ── sound ── */
  const blip = useCallback(
    (freq: number, dur = 0.25, type: OscillatorType = "sine", gainV = 0.12) => {
      if (!soundOn) return;
      try {
        acRef.current =
          acRef.current ||
          new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const ac = acRef.current;
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = type;
        o.frequency.value = freq;
        g.gain.setValueAtTime(gainV, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
        o.connect(g).connect(ac.destination);
        o.start();
        o.stop(ac.currentTime + dur);
      } catch {
        /* AudioContext unavailable — silent */
      }
    },
    [soundOn],
  );
  const fanfare = useCallback(() => {
    [523, 659, 784, 1047].forEach((f, i) => after(i * 90, () => blip(f, 0.35, "triangle", 0.14)));
  }, [after, blip]);

  /* ── confetti ── */
  const burst = useCallback(
    (mult = 1) => {
      const amount = Math.round(confettiAmount * mult);
      setConfetti(makeConfetti(amount));
      setBurstId((b) => b + 1);
    },
    [confettiAmount],
  );

  /* ── flow ── */
  const letsGo = useCallback(() => {
    const from = Math.max(1, Math.round(countdownFrom));
    clearTimers();
    onLetsGo(); // unlock audio inside the click gesture
    burst(0.5);
    blip(440, 0.2, "triangle");
    setPhase("count");
    setCount(from);
  }, [countdownFrom, clearTimers, onLetsGo, burst, blip]);

  // Drive the 3·2·1 countdown: each tick schedules the next number; the final
  // tick fires the fanfare + confetti and flips to the GO! flash.
  useEffect(() => {
    if (phase !== "count" || count == null) return;
    if (count > 1) {
      const id = setTimeout(() => {
        blip(440, 0.2, "triangle");
        setCount(count - 1);
      }, 950);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      fanfare();
      burst(1);
      setPhase("go");
    }, 950);
    return () => clearTimeout(id);
  }, [phase, count, blip, fanfare, burst]);

  // After the GO! flash, hand off to the real runner (exactly once).
  useEffect(() => {
    if (phase !== "go") return;
    const id = setTimeout(() => {
      if (doneRef.current) return;
      doneRef.current = true;
      onComplete();
    }, 1400);
    return () => clearTimeout(id);
  }, [phase, onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #eef2ff 100%)",
        fontFamily: "var(--font-nunito), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <style>{KEYFRAMES}</style>

      {/* ambient orbs + floating shapes */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div style={orb("-120px", undefined, undefined, "-100px", 480, "rgba(99,102,241,0.18)", "orbDrift 9s ease-in-out infinite")} />
        <div style={orb(undefined, "-140px", "-120px", undefined, 520, "rgba(139,92,246,0.16)", "orbDrift 11s ease-in-out infinite reverse")} />
        <span style={shape("12%", undefined, undefined, "14%", 28, 8, "#c7d2fe", "rotate(15deg)", "floatShape 6s ease-in-out infinite")} />
        <span style={shape("30%", undefined, "10%", undefined, 18, "50%", "#fcd34d", "none", "floatShape 7s ease-in-out 0.8s infinite")} />
        <span style={shape(undefined, "22%", "16%", undefined, 22, "50%", "#a5b4fc", "none", "floatShape 8s ease-in-out 1.4s infinite")} />
        <span style={shape(undefined, "30%", undefined, "10%", 20, 6, "#ddd6fe", "rotate(-12deg)", "floatShape 6.5s ease-in-out 0.4s infinite")} />
      </div>

      {/* ═══ HYPE ═══ */}
      {phase === "hype" && (
        <div className="relative z-[2] flex min-h-full flex-col items-center justify-center gap-6 px-6 pb-28 pt-6 text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[15px] font-extrabold"
            style={{ background: "#eef2ff", borderColor: "#c7d2fe", color: "#4338ca", animation: "chipIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.35s both" }}
          >
            <Sparkles className="h-4 w-4" strokeWidth={2.5} />
            <span>{quizName}</span>
            <span style={{ color: "#6366f1" }}>·</span>
            <span>{questionCount} questions</span>
          </div>

          <h1
            className="m-0 flex flex-wrap justify-center gap-x-4"
            style={{
              fontFamily: "var(--font-baloo), var(--font-nunito), sans-serif",
              fontSize: "clamp(44px, 7vw, 84px)",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "#1e1b4b",
            }}
          >
            <span style={{ display: "inline-block", animation: "wordPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.5s both" }}>Get</span>
            <span style={{ display: "inline-block", animation: "wordPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.65s both" }}>ready,</span>
            <span
              style={{
                display: "inline-block",
                animation: "wordPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.8s both",
                background: "linear-gradient(100deg, #4338ca, #8b5cf6)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {kidName}!
            </span>
          </h1>

          <p className="m-0 text-[22px] font-extrabold" style={{ color: "#52525b", animation: "chipIn 0.5s ease 1s both" }}>
            You&apos;ve got this. Show what you know!
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-base font-extrabold"
              style={{ background: "#fef3c7", color: "#92400e", animation: "chipIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 1.15s both" }}
            >
              <Flame className="h-[18px] w-[18px]" style={{ color: "#f59e0b" }} strokeWidth={2.5} />
              <span>{streakDays} day streak</span>
            </div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-base font-extrabold"
              style={{ background: "#ffedd5", color: "#9a3412", animation: "chipIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 1.3s both" }}
            >
              <Carrot className="h-[18px] w-[18px]" style={{ color: "#ea580c" }} strokeWidth={2.5} />
              <span>{carrots} carrots</span>
            </div>
          </div>

          <button
            type="button"
            onClick={letsGo}
            className="relative mt-4 inline-flex cursor-pointer items-center gap-3.5 overflow-hidden rounded-full border-none text-white transition-transform active:scale-95"
            style={{
              background: "#4f46e5",
              padding: "22px 56px",
              fontFamily: "var(--font-baloo), var(--font-nunito), sans-serif",
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "0.01em",
              animation: "chipIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 1.5s both, ctaBreathe 2.2s ease-in-out 2.2s infinite",
            }}
          >
            <span className="relative z-[2]">Let&apos;s go!</span>
            <ArrowRight className="relative z-[2] h-[30px] w-[30px]" strokeWidth={3} />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[1]"
              style={{
                background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
                animation: "ctaShine 3s ease-in-out 2.5s infinite",
              }}
            />
          </button>

          <button
            type="button"
            onClick={onBack}
            className="mt-2 text-sm font-bold text-zinc-400 transition-colors hover:text-zinc-600"
          >
            &larr; Back
          </button>
        </div>
      )}

      {/* ═══ COUNTDOWN ═══ */}
      {phase === "count" && count != null && (
        <div
          className="fixed inset-0 z-20 flex flex-col items-center justify-center gap-3"
          style={{ background: "radial-gradient(ellipse at 50% 40%, #312e81 0%, #1e1b4b 65%)", animation: "overlayIn 0.35s ease both" }}
        >
          <span style={cdDot("10%", undefined, undefined, "12%", 10, "#a5b4fc", 0.5, "floatShape 5s ease-in-out infinite")} />
          <span style={cdDot("24%", undefined, "16%", undefined, 8, "#fcd34d", 0.6, "floatShape 6s ease-in-out 0.7s infinite")} />
          <span style={cdDot(undefined, "18%", undefined, "22%", 12, "#c4b5fd", 0.5, "floatShape 7s ease-in-out 1.2s infinite")} />

          <div
            style={{ fontFamily: "var(--font-baloo), sans-serif", fontSize: 28, fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.12em", textTransform: "uppercase" }}
          >
            Starting in
          </div>
          <div className="relative flex items-center justify-center" style={{ width: 340, height: 340 }}>
            <div
              key={"ring-" + count}
              className="absolute rounded-full"
              style={{ inset: 40, border: "5px solid rgba(165,180,252,0.7)", animation: "ringBurst 0.9s ease-out both" }}
            />
            <div
              key={"num-" + count}
              style={{
                fontFamily: "var(--font-baloo), sans-serif",
                fontSize: 220,
                fontWeight: 800,
                lineHeight: 1,
                color: "#ffffff",
                textShadow: "0 8px 0 #312e81, 0 20px 50px rgba(0,0,0,0.4)",
                animation: "countPop 0.7s cubic-bezier(0.34,1.56,0.64,1) both",
              }}
            >
              {count}
            </div>
          </div>
          <div className="text-xl font-extrabold" style={{ color: "#c7d2fe" }}>
            Eyes ready… brain ready…
          </div>
        </div>
      )}

      {/* ═══ GO! ═══ */}
      {phase === "go" && (
        <div
          className="fixed inset-0 z-20 flex flex-col items-center justify-center"
          style={{ background: "radial-gradient(ellipse at 50% 40%, #4338ca 0%, #1e1b4b 70%)" }}
        >
          <div
            style={{
              fontFamily: "var(--font-baloo), sans-serif",
              fontSize: "clamp(110px, 18vw, 220px)",
              fontWeight: 800,
              lineHeight: 1,
              color: "#ffffff",
              textShadow: "0 10px 0 #312e81, 0 24px 60px rgba(0,0,0,0.4)",
              animation: "goZoom 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            GO!
          </div>
        </div>
      )}

      {/* confetti */}
      <div key={"confetti-" + burstId} className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
        {confetti.map((c, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: -20,
              left: c.left + "%",
              width: c.size,
              height: c.size * (c.round ? 1 : 0.55),
              background: c.color,
              borderRadius: c.round ? "50%" : 2,
              animation: `confettiFall ${c.dur}s linear ${c.delay}s both`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── helpers ── */
type ConfettiBit = { left: number; delay: number; dur: number; size: number; color: string; round: boolean };

function makeConfetti(n: number): ConfettiBit[] {
  const colors = ["#6366f1", "#8b5cf6", "#f59e0b", "#10b981", "#f43f5e", "#38bdf8", "#fcd34d"];
  const out: ConfettiBit[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      dur: 1.8 + Math.random() * 1.4,
      size: 7 + Math.random() * 9,
      color: colors[i % colors.length],
      round: Math.random() > 0.5,
    });
  }
  return out;
}

function orb(top?: string, bottom?: string, right?: string, left?: string, size = 480, color = "rgba(99,102,241,0.18)", animation = ""): React.CSSProperties {
  return {
    position: "absolute", top, bottom, right, left,
    width: size, height: size, borderRadius: "50%",
    background: `radial-gradient(circle, ${color}, transparent 70%)`,
    filter: "blur(10px)", animation,
  };
}
function shape(top?: string, bottom?: string, left?: string, right?: string, size = 24, radius: number | string = 8, color = "#c7d2fe", transform = "none", animation = ""): React.CSSProperties {
  return {
    position: "absolute", top, bottom, left, right,
    width: size, height: size, borderRadius: radius, background: color, transform, animation,
  };
}
function cdDot(top?: string, bottom?: string, left?: string, right?: string, size = 10, color = "#a5b4fc", opacity = 0.5, animation = ""): React.CSSProperties {
  return {
    position: "absolute", top, bottom, left, right,
    width: size, height: size, borderRadius: "50%", background: color, opacity, animation,
  };
}

const KEYFRAMES = `
@keyframes wordPop { 0% { transform: scale(0) rotate(-6deg); opacity: 0; } 60% { transform: scale(1.25) rotate(2deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
@keyframes chipIn { 0% { transform: translateY(24px) scale(0.6); opacity: 0; } 60% { transform: translateY(-4px) scale(1.08); opacity: 1; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
@keyframes ctaBreathe { 0%,100% { transform: scale(1); box-shadow: 0 6px 0 0 #4338ca, 0 0 0 0 rgba(99,102,241,0.45), 0 16px 40px rgba(99,102,241,0.35); } 50% { transform: scale(1.05); box-shadow: 0 6px 0 0 #4338ca, 0 0 0 18px rgba(99,102,241,0), 0 16px 48px rgba(99,102,241,0.45); } }
@keyframes ctaShine { 0%,70% { transform: translateX(-220%) skewX(-20deg); } 95%,100% { transform: translateX(220%) skewX(-20deg); } }
@keyframes orbDrift { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-24px) scale(1.1); } }
@keyframes floatShape { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-18px) rotate(12deg); } }
@keyframes countPop { 0% { transform: scale(0.2); opacity: 0; } 45% { transform: scale(1.35); opacity: 1; } 65% { transform: scale(0.92); } 100% { transform: scale(1); opacity: 1; } }
@keyframes ringBurst { 0% { transform: scale(0.3); opacity: 0.9; } 100% { transform: scale(2.6); opacity: 0; } }
@keyframes confettiFall { 0% { transform: translateY(-40px) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
@keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes goZoom { 0% { transform: scale(0.1) rotate(-8deg); opacity: 0; } 55% { transform: scale(1.3) rotate(2deg); opacity: 1; } 75% { transform: scale(0.95) rotate(0deg); } 100% { transform: scale(1); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.001s !important; animation-iteration-count: 1 !important; } }
`;
