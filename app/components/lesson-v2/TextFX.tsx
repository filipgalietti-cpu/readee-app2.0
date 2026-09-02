"use client";

import { motion } from "framer-motion";

/**
 * TextFX — the MOTION LIBRARY stage, implementing the Claude Design catalog
 * 1:1 (claude.ai/design → "Readee Lesson Engine UI" → Motion Library.dc.html).
 * Lesson data requests a named effect: `fx: { text, effect: "underline" }`.
 * Mark target words with **stars**; `**cat|hat**` gives word-swap its pair.
 * Adding a catalog effect = add its CSS here once; every lesson can use it.
 */
export const SUPPORTED_EFFECTS = [
  "pop-words", "underline", "cross-out", "glow", "bounce", "burst",
  "wiggle", "spotlight", "rainbow", "stamp", "letters-fly-in", "word-swap",
  "typewriter", "shrink-grow", "shake", "wave", "flip-in", "slide-in",
  "blur-in", "highlight", "circle", "heartbeat", "confetti", "swing",
  "fireworks", "rocket", "magic", "bubbles", "jelly", "balloon", "lightning",
] as const;
export type TextEffect = (typeof SUPPORTED_EFFECTS)[number];

const PARTICLES = [
  { l: "8%", bg: "#f59e0b", d: "0s" }, { l: "30%", bg: "#8b5cf6", d: ".25s" },
  { l: "52%", bg: "#10b981", d: ".5s" }, { l: "72%", bg: "#f43f5e", d: ".15s" },
  { l: "92%", bg: "#4338ca", d: ".4s" },
];
const FW = [
  { dx: 66, dy: -22, bg: "#f59e0b" }, { dx: -66, dy: -22, bg: "#8b5cf6" },
  { dx: 44, dy: -60, bg: "#10b981" }, { dx: -44, dy: -60, bg: "#f43f5e" },
  { dx: 74, dy: 18, bg: "#38bdf8" }, { dx: -74, dy: 18, bg: "#4338ca" },
  { dx: 14, dy: -80, bg: "#f43f5e" }, { dx: -14, dy: 64, bg: "#f59e0b" },
];
const PUFFS = [
  { l: -24, b: 0, d: ".95s" }, { l: -42, b: 10, d: "1.05s" }, { l: -60, b: 22, d: "1.15s" },
];
const STARS = [
  { l: "-2%", t: -8, bg: "#f59e0b", d: ".3s" }, { l: "22%", t: -16, bg: "#8b5cf6", d: ".5s" },
  { l: "46%", t: -8, bg: "#f59e0b", d: ".7s" }, { l: "70%", t: -18, bg: "#38bdf8", d: ".9s" },
  { l: "94%", t: -8, bg: "#8b5cf6", d: "1.1s" },
];
const SPARKS = [
  { dx: 44, dy: -30, bg: "#f59e0b", d: "1s" }, { dx: -40, dy: -26, bg: "#8b5cf6", d: "1.05s" },
  { dx: 30, dy: 30, bg: "#10b981", d: "1.1s" }, { dx: -34, dy: 26, bg: "#f43f5e", d: "1.02s" },
  { dx: 0, dy: -44, bg: "#4338ca", d: "1.08s" },
];

export default function TextFX({ text, effect }: { text: string; effect: string }) {
  const tokens = text.split(/\s+/).map((raw) => {
    const target = /^\*\*.*\*\*[.,!?]?$/.test(raw) || /\*\*/.test(raw);
    const word = raw.replace(/\*\*/g, "");
    const [main, alt] = word.split("|");
    return { word: main, alt, target };
  });
  const anyTarget = tokens.some((t) => t.target);
  const perLetter = effect === "letters-fly-in" || effect === "wave" || effect === "magic";
  const wholeLine = effect === "typewriter" || effect === "blur-in";

  const targetClass: Record<string, string> = {
    underline: "fxul", "cross-out": "fxstrike", glow: "fxglow", bounce: "fxbounce",
    wiggle: "fxwiggle", spotlight: "fxspot", rainbow: "fxrainbow", stamp: "fxstamp",
    "shrink-grow": "fxpulse", shake: "fxshake", "flip-in": "fxflip", "slide-in": "fxslide",
    highlight: "fxmark", circle: "fxcirc", heartbeat: "fxbeat", swing: "fxswing",
    fireworks: "fxfw", rocket: "fxrkt", jelly: "fxjelly", balloon: "fxballoon",
    lightning: "fxzap", bubbles: "fxbub",
  };

  return (
    <div className="fx-stage">
      {(effect === "confetti") && (
        <span className="fxconfetti">
          {PARTICLES.map((p, i) => (
            <i key={i} style={{ left: p.l, background: p.bg, animationDelay: p.d }} />
          ))}
        </span>
      )}
      <div className={`fx-line${wholeLine ? ` fxline-${effect}` : ""}`}>
        {tokens.map((t, i) => {
          const hot = t.target || (!anyTarget && !["pop-words", "typewriter", "blur-in"].includes(effect));
          const cls = hot ? targetClass[effect] ?? "" : effect === "spotlight" ? "fxdim" : "";

          if (effect === "word-swap" && t.target && t.alt) {
            return (
              <span key={i} className="fxswap">
                <span className="fx-hot">{t.word}</span>
                <span>{t.alt}</span>
              </span>
            );
          }
          if (perLetter && hot) {
            return (
              <span key={i} className={`fx-hot fx-${effect}`}>
                {t.word.split("").map((ch, j) => (
                  <span key={j} style={{ animationDelay: `${0.3 + j * 0.12}s`, ["--fi" as string]: j }}>
                    {ch}
                  </span>
                ))}
                {effect === "magic" &&
                  STARS.map((st, k) => (
                    <i key={k} className="fxmstar" style={{ left: st.l, top: st.t, background: st.bg, animationDelay: st.d }} />
                  ))}
              </span>
            );
          }
          return (
            <motion.span
              key={i}
              className={`fx-word ${cls}${t.target ? " fx-hot" : ""}`}
              initial={{ opacity: 0, y: 16, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.13, type: "spring", stiffness: 320, damping: 20 }}
            >
              {t.word}
              {hot && effect === "fireworks" &&
                FW.map((s2, k) => (
                  <i key={k} className="fxfwi" style={{ background: s2.bg, ["--dx" as string]: `${s2.dx}px`, ["--dy" as string]: `${s2.dy}px` }} />
                ))}
              {hot && effect === "rocket" &&
                PUFFS.map((pf, k) => (
                  <i key={k} className="fxpuff" style={{ left: pf.l, bottom: pf.b, animationDelay: pf.d }} />
                ))}
              {t.target && effect === "burst" &&
                SPARKS.map((s, k) => (
                  <i
                    key={k}
                    className="fxspark"
                    style={{ background: s.bg, animationDelay: s.d, ["--dx" as string]: `${s.dx}px`, ["--dy" as string]: `${s.dy}px` }}
                  />
                ))}
            </motion.span>
          );
        })}
      </div>
      <style>{`
        .fx-stage { position:relative; display:grid; place-items:center; width:100%; height:100%; min-height:300px; padding:24px; overflow:hidden; }
        .fx-line { display:flex; flex-wrap:wrap; gap:10px 16px; justify-content:center; max-width:500px; text-align:center;
          font-family:'Baloo 2',-apple-system,sans-serif; font-weight:800; font-size:46px; line-height:1.25; color:#1e1b3a; }
        .fx-word { display:inline-block; position:relative; }
        .fx-hot { color:#4338ca; position:relative; display:inline-block; }
        .fxul::after { content:""; position:absolute; left:-2px; right:-2px; bottom:-6px; height:7px; border-radius:4px;
          background:linear-gradient(90deg,#4338ca,#8b5cf6); transform:scaleX(0); transform-origin:left; animation:fxdraw .5s .9s ease-out forwards; }
        .fxstrike::after { content:""; position:absolute; left:-4px; right:-4px; top:52%; height:6px; border-radius:3px;
          background:#f43f5e; transform:scaleX(0) rotate(-4deg); transform-origin:left; animation:fxdraw .45s .9s ease-in-out forwards; }
        @keyframes fxdraw { to { transform:scaleX(1) } }
        .fxglow { animation:fxglow 2.2s .8s ease-in-out infinite; }
        @keyframes fxglow { 0%,100%{text-shadow:none} 45%{text-shadow:0 0 22px rgba(99,102,241,.85)} }
        .fxbounce { animation:fxbounce 1.6s .8s ease-in-out infinite; }
        @keyframes fxbounce { 0%,100%{transform:none} 30%{transform:translateY(-14px)} 45%{transform:none} }
        .fxwiggle { animation:fxwiggle 1s .8s ease-in-out infinite; }
        @keyframes fxwiggle { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-7deg)} 75%{transform:rotate(7deg)} }
        .fxdim { animation:fxdim 2.6s .7s ease-in-out infinite; }
        @keyframes fxdim { 0%,12%,88%,100%{opacity:1} 35%,65%{opacity:.18} }
        .fxspot { animation:fxglow 2.6s .7s ease-in-out infinite; }
        .fxrainbow { background:linear-gradient(90deg,#4338ca,#8b5cf6,#f43f5e,#f59e0b,#10b981,#4338ca); background-size:300% 100%;
          -webkit-background-clip:text; background-clip:text; color:transparent; animation:fxrainbow 2.5s linear infinite; }
        @keyframes fxrainbow { to { background-position:300% 0 } }
        .fxstamp { opacity:0; animation:fxstamp .5s 1s cubic-bezier(.34,1.56,.64,1) forwards; }
        @keyframes fxstamp { from{opacity:0;transform:scale(2.6) rotate(9deg)} to{opacity:1;transform:scale(1) rotate(-3deg)} }
        .fx-letters-fly-in span { display:inline-block; opacity:0; animation:fxfly .55s cubic-bezier(.34,1.56,.64,1) forwards; }
        .fx-letters-fly-in span:nth-child(odd) { --fx:-56px; --fy:-34px; --fr:-35deg; }
        .fx-letters-fly-in span:nth-child(even) { --fx:52px; --fy:34px; --fr:35deg; }
        @keyframes fxfly { from{opacity:0;transform:translate(var(--fx),var(--fy)) rotate(var(--fr))} to{opacity:1;transform:none} }
        .fxswap { display:inline-grid; text-align:center; }
        .fxswap span { grid-area:1/1; animation:fxswapA 3s ease-in-out infinite; }
        .fxswap span:nth-child(2) { animation-name:fxswapB; color:#8b5cf6; }
        @keyframes fxswapA { 0%,40%{opacity:1;transform:none} 50%,90%{opacity:0;transform:translateY(-16px)} 100%{opacity:1;transform:none} }
        @keyframes fxswapB { 0%,40%{opacity:0;transform:translateY(16px)} 50%,90%{opacity:1;transform:none} 100%{opacity:0;transform:translateY(16px)} }
        .fxline-typewriter { display:inline-block; overflow:hidden; white-space:nowrap; border-right:4px solid #4338ca;
          animation:fxtype 1.6s .5s steps(14) both, fxcaret .8s step-end infinite; flex-wrap:nowrap; }
        @keyframes fxtype { from{max-width:0} to{max-width:14ch} }
        @keyframes fxcaret { 50%{border-color:transparent} }
        .fxpulse { animation:fxpulse 1.8s .8s ease-in-out infinite; }
        @keyframes fxpulse { 0%,100%{transform:scale(1)} 35%{transform:scale(1.35)} 65%{transform:scale(.85)} }
        .fxshake { animation:fxshake 2.2s .8s ease-in-out infinite; color:#f43f5e; }
        @keyframes fxshake { 0%,30%,100%{transform:none} 5%,15%,25%{transform:translateX(-9px)} 10%,20%{transform:translateX(9px)} }
        .fx-wave span { display:inline-block; animation:fxwave 1.4s ease-in-out infinite; animation-delay:calc(var(--fi) * .1s); }
        @keyframes fxwave { 0%,100%{transform:none} 30%{transform:translateY(-12px)} 60%{transform:translateY(3px)} }
        .fxflip { opacity:0; transform-origin:bottom; animation:fxflip .7s .8s cubic-bezier(.34,1.56,.64,1) forwards; }
        @keyframes fxflip { from{opacity:0;transform:perspective(400px) rotateX(88deg)} to{opacity:1;transform:perspective(400px) rotateX(0)} }
        .fxslide { opacity:0; animation:fxslidein .6s .7s cubic-bezier(.22,1,.36,1) forwards; }
        @keyframes fxslidein { from{opacity:0;transform:translateX(-56px)} to{opacity:1;transform:none} }
        .fxline-blur-in { animation:fxblur 1s .5s ease-out both; }
        @keyframes fxblur { from{opacity:0;filter:blur(12px);transform:scale(1.15)} to{opacity:1;filter:blur(0)} }
        .fxmark { z-index:0; }
        .fxmark::before { content:""; position:absolute; left:-4px; right:-4px; top:8%; bottom:2%; background:rgba(245,158,11,.4);
          border-radius:6px; transform:scaleX(0); transform-origin:left; animation:fxdraw .5s .9s ease-out forwards; z-index:-1; }
        .fxcirc::after { content:""; position:absolute; inset:-10px -14px; border:4px solid #f43f5e; border-radius:50%;
          opacity:0; transform:scale(1.6) rotate(-6deg); animation:fxcirc .5s .9s ease-out forwards; }
        @keyframes fxcirc { to{opacity:1;transform:scale(1) rotate(-6deg)} }
        .fxbeat { animation:fxbeat 1.6s .8s ease-in-out infinite; color:#f43f5e; }
        @keyframes fxbeat { 0%,30%,100%{transform:scale(1)} 8%{transform:scale(1.25)} 16%{transform:scale(1)} 24%{transform:scale(1.18)} }
        .fxswing { transform-origin:top center; animation:fxswing 2s .8s ease-in-out infinite; }
        @keyframes fxswing { 0%,100%{transform:rotate(0)} 20%{transform:rotate(10deg)} 40%{transform:rotate(-8deg)} 60%{transform:rotate(5deg)} 80%{transform:rotate(-3deg)} }
        .fxspark { position:absolute; left:50%; top:40%; width:10px; height:10px; border-radius:3px; opacity:0; animation:fxspark .9s ease-out infinite; }
        @keyframes fxspark { 0%{opacity:0;transform:translate(0,0) scale(0)} 20%{opacity:1} 100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(1)} }
        .fxconfetti { position:absolute; inset:0; pointer-events:none; }
        .fxconfetti i { position:absolute; top:-16px; width:8px; height:12px; border-radius:2px; opacity:0; animation:fxfall 1.7s ease-in infinite; }
        @keyframes fxfall { 0%{opacity:0;transform:translateY(0) rotate(0)} 15%{opacity:1} 100%{opacity:0;transform:translateY(320px) rotate(220deg)} }
        .fxfw { animation:fxfwlaunch .7s .3s cubic-bezier(.4,0,1,1) both; }
        @keyframes fxfwlaunch { 0%{opacity:0;transform:translateY(70px) scale(.4)} 60%{opacity:1} 100%{transform:translateY(0) scale(1)} }
        .fxfw::before { content:""; position:absolute; left:50%; top:50%; width:14px; height:14px; margin:-7px; border:4px solid #f59e0b;
          border-radius:50%; opacity:0; animation:fxfwring .7s 1s ease-out forwards; }
        @keyframes fxfwring { 0%{opacity:1;transform:scale(.4)} 100%{opacity:0;transform:scale(7)} }
        .fxfwi { position:absolute; left:50%; top:50%; width:9px; height:9px; border-radius:50%; opacity:0; animation:fxfwburst .9s 1s ease-out forwards; }
        @keyframes fxfwburst { 0%{opacity:1;transform:translate(0,0) scale(.4)} 100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(1)} }
        .fxrkt { animation:fxrkt .9s .4s cubic-bezier(.2,.8,.3,1.2) both; }
        @keyframes fxrkt { 0%{opacity:0;transform:translate(-110px,60px) rotate(-12deg) skewX(-14deg)} 70%{opacity:1;transform:translate(8px,-6px) skewX(6deg)} 100%{transform:none} }
        .fxpuff { position:absolute; width:10px; height:10px; border-radius:50%; background:#d8d6ea; opacity:0; animation:fxpuff .5s ease-out forwards; }
        @keyframes fxpuff { 0%{opacity:.8;transform:scale(.5)} 100%{opacity:0;transform:scale(2.2) translate(-14px,8px)} }
        .fx-magic span { display:inline-block; opacity:0; animation:fxmfade .4s forwards; }
        @keyframes fxmfade { to{opacity:1} }
        .fxmstar { position:absolute; width:15px; height:15px; opacity:0; animation:fxmstar .6s ease-out forwards;
          clip-path:polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%); }
        @keyframes fxmstar { 0%{opacity:0;transform:scale(0) rotate(0)} 50%{opacity:1;transform:scale(1.3) rotate(90deg)} 100%{opacity:0;transform:scale(.4) rotate(180deg)} }
        .fxbub { animation:fxbubfloat .9s cubic-bezier(.22,1,.36,1) both; }
        .fxbub::before { content:""; position:absolute; inset:-14px; border:3px solid rgba(56,189,248,.75);
          background:radial-gradient(circle at 32% 28%,rgba(255,255,255,.95),rgba(56,189,248,.12)); border-radius:50%; animation:fxbubpop .35s 1.3s ease-out forwards; }
        @keyframes fxbubfloat { from{opacity:0;transform:translateY(52px)} to{opacity:1;transform:none} }
        @keyframes fxbubpop { 0%{opacity:1;transform:scale(1)} 60%{opacity:1;transform:scale(1.25)} 100%{opacity:0;transform:scale(1.7)} }
        .fxjelly { animation:fxjelly 1.9s .8s ease-in-out infinite; transform-origin:bottom; color:#10b981; }
        @keyframes fxjelly { 0%,100%{transform:scale(1,1)} 15%{transform:scale(1.25,.72)} 30%{transform:scale(.8,1.2)} 45%{transform:scale(1.15,.9)} 60%{transform:scale(.95,1.06)} 75%{transform:scale(1.02,.98)} }
        .fxballoon { animation:fxbfloat 3s .6s ease-in-out infinite; }
        .fxballoon::before { content:""; position:absolute; left:50%; top:-54px; width:36px; height:44px; margin-left:-18px;
          background:radial-gradient(circle at 35% 30%,#fda4af,#f43f5e); border-radius:50% 50% 50% 50%/55% 55% 45% 45%; }
        .fxballoon::after { content:""; position:absolute; left:50%; top:-11px; width:2px; height:12px; background:#b9b4d8; }
        @keyframes fxbfloat { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-16px) rotate(2deg)} }
        .fxzap { animation:fxzapshake 2.4s .7s linear infinite; }
        @keyframes fxzapshake { 0%,19%,32%,100%{transform:none;text-shadow:none} 21%{transform:translate(-5px,2px);text-shadow:0 0 24px rgba(245,158,11,.9)} 24%{transform:translate(5px,-2px);text-shadow:0 0 24px rgba(245,158,11,.9)} 27%{transform:translate(-3px,1px)} }
        .fxzap::before { content:""; position:absolute; left:50%; top:-56px; width:28px; height:52px; margin-left:-38px; background:#f59e0b;
          clip-path:polygon(60% 0,20% 55%,45% 55%,30% 100%,85% 40%,55% 40%); opacity:0; animation:fxbolt 2.4s .7s linear infinite; }
        @keyframes fxbolt { 0%,17%{opacity:0;transform:translateY(-16px)} 19%,26%{opacity:1;transform:none} 30%,100%{opacity:0} }
        @media (prefers-reduced-motion: reduce){ .fx-stage * { animation:none !important; } }
      `}</style>
    </div>
  );
}
