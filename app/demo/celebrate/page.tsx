"use client";

import { useState, useEffect, useCallback } from "react";

/* ─── Custom SVG Icons ──────────────────────────────── */
const StarIcon = ({ size = 64 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    <path d="M32 4l8.9 18.1L61 25.2l-14.5 14.1 3.4 20.1L32 50.3 14.1 59.4l3.4-20.1L3 25.2l20.1-3.1z" fill="url(#sg)" stroke="#d97706" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const TrophyIcon = ({ size = 72 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>
    <path d="M20 12h24v18c0 6.627-5.373 12-12 12s-12-5.373-12-12V12z" fill="url(#tg)" stroke="#b45309" strokeWidth="1.5" />
    <path d="M20 18H12c0 6 4 10 8 10v-10z" fill="#fcd34d" stroke="#b45309" strokeWidth="1.5" />
    <path d="M44 18h8c0 6-4 10-8 10v-10z" fill="#fcd34d" stroke="#b45309" strokeWidth="1.5" />
    <rect x="28" y="42" width="8" height="8" rx="2" fill="#b45309" />
    <rect x="22" y="50" width="20" height="5" rx="2.5" fill="#92400e" />
    <path d="M30 26l1.5 1.5 3-3" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FlameIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="fg" x1="0.5" y1="1" x2="0.5" y2="0">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="50%" stopColor="#f43f5e" />
        <stop offset="100%" stopColor="#ef4444" />
      </linearGradient>
      <linearGradient id="fi" x1="0.5" y1="1" x2="0.5" y2="0">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#fcd34d" />
      </linearGradient>
    </defs>
    <path d="M16 3c0 0-8 8-8 16a8 8 0 0016 0c0-4-2-7-4-9 0 0 0 4-2 6s-4 0-4-4c0-3 2-9 2-9z" fill="url(#fg)" />
    <path d="M16 14c0 0-3 3-3 7a3 3 0 006 0c0-2-1-4-1.5-4.5 0 0-0.5 1.5-1 2s-1 0-1-1.5c0-1 0.5-3 0.5-3z" fill="url(#fi)" />
  </svg>
);

const BookIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M5 6c0-1.1.9-2 2-2h6c1.7 0 3 1.3 3 3v18l-1-1-2 1-2-1-2 1-2-1-2 1V6z" fill="#6366f1" />
    <path d="M27 6c0-1.1-.9-2-2-2h-6c-1.7 0-3 1.3-3 3v18l1-1 2 1 2-1 2 1 2-1 2 1V6z" fill="#818cf8" />
    <rect x="8" y="8" width="5" height="1.5" rx="0.75" fill="white" opacity="0.5" />
    <rect x="8" y="12" width="4" height="1.5" rx="0.75" fill="white" opacity="0.5" />
    <rect x="19" y="8" width="5" height="1.5" rx="0.75" fill="white" opacity="0.4" />
    <rect x="19" y="12" width="4" height="1.5" rx="0.75" fill="white" opacity="0.4" />
  </svg>
);

/* ─── Confetti ───────────────────────────────────────── */
function Confetti() {
  const colors = ["#6366f1", "#8b5cf6", "#f59e0b", "#10b981", "#f43f5e", "#38bdf8", "#fbbf24", "#34d399"];
  const particles = Array.from({ length: 80 }, (_, i) => ({
    id: i, color: colors[i % colors.length],
    left: Math.random() * 100, delay: Math.random() * 0.6,
    duration: 1.8 + Math.random() * 1.5, size: 5 + Math.random() * 7,
    rotation: Math.random() * 360, shape: i % 3,
    drift: (Math.random() - 0.5) * 80,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.left}%`, top: "-20px",
          width: p.shape === 2 ? p.size * 0.4 : p.size, height: p.size,
          backgroundColor: p.color, borderRadius: p.shape === 1 ? "50%" : "2px",
          animation: `confetti-fall-${p.id % 3} ${p.duration}s ${p.delay}s ease-in forwards`, opacity: 0,
        }} />
      ))}
      <style>{`
        @keyframes confetti-fall-0 { 0%{opacity:1;transform:translateY(0) translateX(0) rotate(0deg)} 100%{opacity:0;transform:translateY(100vh) translateX(40px) rotate(720deg)} }
        @keyframes confetti-fall-1 { 0%{opacity:1;transform:translateY(0) translateX(0) rotate(0deg)} 100%{opacity:0;transform:translateY(100vh) translateX(-50px) rotate(540deg)} }
        @keyframes confetti-fall-2 { 0%{opacity:1;transform:translateY(0) translateX(0) rotate(0deg)} 100%{opacity:0;transform:translateY(100vh) translateX(20px) rotate(900deg)} }
      `}</style>
    </div>
  );
}

/* ─── Sparkle burst ─────────────────────────────────── */
function SparkleBurst() {
  const colors = ["#6366f1", "#fbbf24", "#f43f5e", "#10b981", "#8b5cf6", "#38bdf8"];
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {colors.map((c, i) => (
        <svg key={i} width="20" height="20" viewBox="0 0 32 32" style={{
          position: "absolute", left: `${15 + i * 13}%`, top: "40%",
          animation: `sparkle-burst 1.5s ${0.1 + i * 0.12}s ease-out forwards`, opacity: 0,
        }}>
          <path d="M16 2l2.5 10.5L29 16l-10.5 3.5L16 30l-2.5-10.5L3 16l10.5-2.5z" fill={c} />
        </svg>
      ))}
      <style>{`
        @keyframes sparkle-burst {
          0% { opacity:0; transform:scale(0.3) rotate(0deg); }
          30% { opacity:1; transform:scale(1.3) rotate(90deg); }
          100% { opacity:0; transform:scale(0.5) translateY(-150px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
}

/* ─── Choice colors (matching real app) ──────────────── */
const CHOICE_BG = [
  "bg-blue-100 text-blue-800 border-blue-300",
  "bg-purple-100 text-purple-800 border-purple-300",
  "bg-amber-100 text-amber-800 border-amber-300",
  "bg-emerald-100 text-emerald-800 border-emerald-300",
];

/* ─── Stages ─────────────────────────────────────────── */
type Stage = "question" | "selecting" | "feedback" | "xp" | "levelup";

export default function CelebratePage() {
  const [stage, setStage] = useState<Stage>("question");
  const [carrots, setCarrots] = useState(12);
  const [xpCount, setXpCount] = useState(0);
  const [progressPct, setProgressPct] = useState(80);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hideChrome, setHideChrome] = useState(false);
  const [dots, setDots] = useState([true, true, false, true, null]); // true=correct, false=wrong, null=current

  const STORAGE = "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public";
  const image = `${STORAGE}/images/kindergarten/RL.K.1/RL.K.1-Q1.png`;

  const choices = ["A stick", "A red ball", "A bone", "A toy car"];
  const correct = "A red ball";

  const restart = useCallback(() => {
    setStage("question");
    setCarrots(12);
    setXpCount(0);
    setProgressPct(80);
    setShowConfetti(false);
    setDots([true, true, false, true, null]);
  }, []);

  /* Auto-play: question → selecting after 1.5s */
  useEffect(() => {
    if (stage !== "question") return;
    const t = setTimeout(() => setStage("selecting"), 1500);
    return () => clearTimeout(t);
  }, [stage]);

  /* Selecting → feedback after 0.8s (simulates click) */
  useEffect(() => {
    if (stage !== "selecting") return;
    const t = setTimeout(() => {
      setStage("feedback");
      setDots([true, true, false, true, true]);
      setProgressPct(100);
      setCarrots(c => c + 3);
    }, 800);
    return () => clearTimeout(t);
  }, [stage]);

  /* Feedback → xp after 1.8s */
  useEffect(() => {
    if (stage !== "feedback") return;
    setShowConfetti(true);
    const t = setTimeout(() => setStage("xp"), 1800);
    return () => clearTimeout(t);
  }, [stage]);

  /* XP count up → levelup */
  useEffect(() => {
    if (stage !== "xp") return;
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current >= 20) { current = 20; clearInterval(interval); }
      setXpCount(current);
    }, 40);
    const t = setTimeout(() => { setStage("levelup"); setShowConfetti(true); }, 2500);
    return () => { clearInterval(interval); clearTimeout(t); };
  }, [stage]);

  const showQuestion = stage === "question" || stage === "selecting" || stage === "feedback";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Demo controls */}
      {!hideChrome && (
        <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-2 z-[60]">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Demo</span>
            <div className="flex items-center gap-2">
              <button onClick={restart} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200">Restart</button>
              <button onClick={() => setHideChrome(true)} className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Hide</button>
            </div>
          </div>
        </div>
      )}
      {hideChrome && (
        <button onClick={() => setHideChrome(false)} className="fixed top-2 right-2 z-[60] px-2 py-1 text-xs bg-black/10 text-black/40 rounded hover:bg-black/20">Show</button>
      )}

      {showConfetti && <Confetti />}
      {stage === "feedback" && <SparkleBurst />}

      {/* ── App chrome: top bar (matches real practice page) ── */}
      {showQuestion && (
        <div className="flex items-center gap-3 px-4 pt-4 pb-2 max-w-lg mx-auto w-full">
          {/* Close button */}
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Progress bar */}
          <div className="flex-1 h-4 bg-zinc-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500 relative overflow-hidden" style={{
              width: `${progressPct}%`,
              background: "linear-gradient(90deg, #4ade80, #22c55e)",
              boxShadow: "0 0 8px rgba(74,222,128,0.4)",
            }}>
              <div className="absolute inset-0 rounded-full" style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                width: "50%", animation: "shimmer 2s linear infinite",
              }} />
            </div>
          </div>

          {/* Carrot counter */}
          <div className={`flex items-center gap-1 bg-zinc-200 px-3 py-1.5 rounded-full transition-all ${stage === "feedback" ? "scale-125 shadow-[0_0_8px_4px_rgba(251,191,36,0.5)]" : ""}`} style={{ transition: "all 0.6s" }}>
            <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 0-2.4.6-3 1.5C8.4 3.6 7.2 3 6 3c-2.5 0-4 2-4 4.5C2 11 6 14 12 21c6-7 10-10 10-13.5C22 5 20.5 3 18 3c-1.2 0-2.4.6-3 1.5-.6-.9-1.8-1.5-3-1.5z" />
            </svg>
            <span className="text-sm font-bold text-orange-600 tabular-nums">{carrots}</span>
          </div>

          {/* Mute */}
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M11 5L6 9H2v6h4l5 4V5z" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Question content ── */}
      {showQuestion && (
        <div className="flex-1 max-w-lg mx-auto w-full px-4 pt-4 pb-32 flex flex-col">
          {/* Image */}
          <div className="flex justify-center mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" className="max-h-[180px] sm:max-h-[220px] w-auto object-contain rounded-2xl shadow-md border-2 border-white" />
          </div>

          {/* Passage */}
          <div className="mb-5 rounded-2xl bg-amber-50 border border-amber-200 p-6">
            <p className="text-xl leading-loose font-semibold text-gray-800 tracking-wide" style={{ lineHeight: "1.9" }}>
              Max the dog ran to the park. He played fetch with a red ball.
            </p>
          </div>

          {/* Question + replay */}
          <div className="mb-3">
            <div className="flex items-center gap-2 max-w-[600px] mx-auto justify-center">
              <h2 className="text-2xl font-bold text-gray-900 leading-snug text-center">What did Max play with?</h2>
              <button className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-indigo-50 hover:bg-indigo-100 flex-shrink-0">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M11 5L6 9H2v6h4l5 4V5z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {dots.map((d, i) => (
              <div key={i} className={`rounded-full transition-all duration-300 ${
                d === true ? "bg-emerald-500 w-2.5 h-2.5"
                  : d === false ? "bg-red-400 w-2.5 h-2.5"
                  : "bg-indigo-500 w-3.5 h-3.5"
              }`} />
            ))}
          </div>

          {/* Answer choices — 2x2 colorful grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {choices.map((choice, i) => {
              const isCorrectChoice = choice === correct;
              const isAnswered = stage === "feedback";
              const isSelecting = stage === "selecting" && isCorrectChoice;

              let bg = CHOICE_BG[i];
              let textColor = "";
              let extra = "";

              if (isSelecting) {
                extra = "ring-2 ring-offset-2 ring-indigo-500 scale-[0.95]";
              } else if (isAnswered && isCorrectChoice) {
                bg = "bg-emerald-500 border-emerald-600";
                textColor = "text-white";
                extra = "scale-[1.05]";
              } else if (isAnswered) {
                extra = "opacity-40";
              }

              return (
                <div key={i} className={`
                  flex items-center justify-center px-3 py-3 rounded-2xl border-2 relative
                  transition-all duration-300 min-h-[64px] ${bg} ${textColor} ${extra}
                `}>
                  <div className="flex items-center justify-center gap-2">
                    {isAnswered && isCorrectChoice && (
                      <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <span className={`text-base font-bold leading-snug text-center ${textColor}`}>{choice}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Correct banner */}
          {stage === "feedback" && (
            <div className="mt-6 text-center animate-in">
              <div className="inline-flex items-center gap-2 bg-emerald-50 border-2 border-emerald-300 px-6 py-3 rounded-2xl">
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-lg font-extrabold text-emerald-700">Correct!</span>
                <span className="text-sm font-bold text-orange-500">+3</span>
                <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 0-2.4.6-3 1.5C8.4 3.6 7.2 3 6 3c-2.5 0-4 2-4 4.5C2 11 6 14 12 21c6-7 10-10 10-13.5C22 5 20.5 3 18 3c-1.2 0-2.4.6-3 1.5-.6-.9-1.8-1.5-3-1.5z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── XP STAGE ── */}
      {stage === "xp" && (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-8 animate-in">
            <div className="inline-block animate-bounce-in"><StarIcon size={80} /></div>
            <div>
              <div className="inline-block bg-gradient-to-r from-amber-400 to-amber-500 text-indigo-900 px-8 py-4 rounded-2xl shadow-lg shadow-amber-200">
                <span className="text-4xl font-extrabold">+{xpCount} XP</span>
              </div>
            </div>
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-zinc-600">Today&apos;s progress</span>
                <span className="font-bold text-emerald-600">5/5 complete!</span>
              </div>
              <div className="h-4 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000" style={{ width: "100%" }} />
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <FlameIcon size={28} />
              <span className="text-xl font-bold text-zinc-700">5 day streak!</span>
            </div>
          </div>
        </div>
      )}

      {/* ── LEVEL UP STAGE ── */}
      {stage === "levelup" && (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-8 animate-in">
            <div className="inline-block animate-bounce-in"><TrophyIcon size={88} /></div>
            <h2 className="text-4xl font-extrabold text-zinc-900">Level Complete!</h2>
            <div className="inline-block bg-gradient-to-br from-indigo-500 to-violet-500 text-white px-10 py-6 rounded-3xl shadow-xl shadow-indigo-200">
              <p className="text-sm font-semibold text-indigo-200 uppercase tracking-wider mb-1">Reading Level</p>
              <p className="text-3xl font-extrabold text-white">Kindergarten RL.K.1</p>
              <p className="text-indigo-200 mt-2 font-medium">Key Ideas & Details</p>
            </div>
            <div className="flex items-center justify-center gap-6 text-lg">
              <div className="flex items-center gap-2">
                <BookIcon size={28} />
                <span className="font-bold text-zinc-700">5/5 correct</span>
              </div>
              <div className="flex items-center gap-2">
                <StarIcon size={28} />
                <span className="font-bold text-zinc-700">100 XP earned</span>
              </div>
            </div>
            <button onClick={restart} className="px-8 py-3 rounded-full bg-indigo-600 text-white font-bold text-base hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
              Next Level &rarr;
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(300%)} }
        .animate-in { animation: fadeScaleIn 0.5s ease both; }
        @keyframes fadeScaleIn { from{opacity:0;transform:scale(0.95) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .animate-bounce-in { animation: bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }
        @keyframes bounceIn { from{opacity:0;transform:scale(0.3)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}
