"use client";

/**
 * Seal of Approval — the perfect-score reward (from the Claude Design
 * "Seal of Approval"). A gold medallion drops + stamps down with a screen
 * thunk, shine rings, a sparkle burst, confetti, a light glint, and a
 * "PERFECT!" ribbon, then settles into a gentle breathing glow. Tap to
 * replay. Fill your own sized container; background defaults to transparent
 * so it can overlay the completion card. Faithful WAAPI port of the design.
 */

import { useEffect, useRef, useCallback } from "react";

export default function SealOfApproval({
  ribbonText = "PERFECT!",
  background = "transparent",
}: {
  ribbonText?: string;
  background?: "sky" | "transparent";
}) {
  const world = useRef<HTMLDivElement>(null);
  const drop = useRef<HTMLDivElement>(null);
  const breathe = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const ring2 = useRef<HTMLDivElement>(null);
  const glint = useRef<SVGRectElement>(null);
  const ribbon = useRef<HTMLDivElement>(null);
  const sparkle = useRef<HTMLDivElement>(null);
  const confetti = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const playing = useRef(false);
  const timers = useRef<number[]>([]);

  const after = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  const reduced = () => !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const sparkles = useCallback(() => {
    const layer = sparkle.current;
    if (!layer) return;
    layer.innerHTML = "";
    const N = 20;
    const colors = ["#ffe9a3", "#f5c542", "#f59e0b", "#ffffff", "#c4b5fd"];
    for (let i = 0; i < N; i++) {
      const s = document.createElement("div");
      const size = 8 + Math.random() * 18;
      const star = Math.random() > 0.4;
      s.style.cssText = `position:absolute;left:50%;top:50%;width:${size}px;height:${size}px;background:${colors[i % colors.length]};${star ? "clip-path:polygon(50% 0,63% 37%,100% 50%,63% 63%,50% 100%,37% 63%,0 50%,37% 37%);" : "border-radius:50%;"}will-change:transform,opacity;`;
      layer.appendChild(s);
      const ang = (i / N) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 130 + Math.random() * 170;
      const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist;
      s.animate([
        { transform: "translate(-50%,-50%) scale(0.3) rotate(0deg)", opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1.1) rotate(${Math.random() * 260 - 130}deg)`, opacity: 1, offset: 0.6 },
        { transform: `translate(calc(-50% + ${dx * 1.25}px), calc(-50% + ${dy * 1.25 + 30}px)) scale(0) rotate(${Math.random() * 360 - 180}deg)`, opacity: 0 },
      ], { duration: 850 + Math.random() * 350, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards" });
    }
    after(1400, () => { if (layer) layer.innerHTML = ""; });
  }, [after]);

  const confettiFn = useCallback(() => {
    const layer = confetti.current;
    if (!layer) return;
    layer.innerHTML = "";
    const colors = ["#4338ca", "#7c3aed", "#8b5cf6", "#f5c542", "#f59e0b", "#ffe9a3"];
    const H = layer.clientHeight || 600;
    const N = 70;
    for (let i = 0; i < N; i++) {
      const c = document.createElement("div");
      const w = 7 + Math.random() * 8;
      const h = w * (0.5 + Math.random() * 1.1);
      const round = Math.random() > 0.7;
      c.style.cssText = `position:absolute;top:-30px;left:${Math.random() * 100}%;width:${w}px;height:${round ? w : h}px;background:${colors[i % colors.length]};border-radius:${round ? "50%" : "2px"};will-change:transform,opacity;`;
      layer.appendChild(c);
      const fall = H + 80;
      const drift = (Math.random() - 0.5) * 160;
      const dur = 1600 + Math.random() * 1600;
      c.animate([
        { transform: "translate(0,0) rotateZ(0deg) rotateX(0deg)", opacity: 1 },
        { transform: `translate(${drift * 0.6}px,${fall * 0.55}px) rotateZ(${Math.random() * 400 - 200}deg) rotateX(200deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${drift}px,${fall}px) rotateZ(${Math.random() * 720 - 360}deg) rotateX(420deg)`, opacity: 0.9 },
      ], { duration: dur, delay: Math.random() * 450, easing: "cubic-bezier(0.3, 0.4, 0.6, 0.9)", fill: "forwards" });
    }
    after(4200, () => { if (layer) layer.innerHTML = ""; });
  }, [after]);

  const impact = useCallback(() => {
    const w = world.current;
    if (!w) return;
    w.animate([
      { transform: "translate(0, 0)" },
      { transform: "translate(0, 14px)" },
      { transform: "translate(-6px, -6px)" },
      { transform: "translate(5px, 4px)" },
      { transform: "translate(-3px, 2px)" },
      { transform: "translate(0, 0)" },
    ], { duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
    const ringAnim = (el: HTMLDivElement | null, delay: number, endScale: number) => {
      if (!el) return;
      el.animate([
        { opacity: 0.95, transform: "scale(0.85)" },
        { opacity: 0, transform: `scale(${endScale})` },
      ], { duration: 700, delay, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards" });
    };
    ringAnim(ring.current, 0, 1.7);
    ringAnim(ring2.current, 90, 2.1);
    sparkles();
    confettiFn();
  }, [sparkles, confettiFn]);

  const glintFn = useCallback(() => {
    const g = glint.current;
    if (!g) return;
    g.animate([
      { transform: "rotate(24deg) translateX(-260px)", opacity: 1 },
      { transform: "rotate(24deg) translateX(560px)", opacity: 1, offset: 0.92 },
      { transform: "rotate(24deg) translateX(640px)", opacity: 0 },
    ], { duration: 750, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" });
  }, []);

  const ribbonPop = useCallback(() => {
    const r = ribbon.current;
    if (!r) return;
    r.animate([
      { transform: "translateX(-50%) scale(0) rotate(-6deg)" },
      { transform: "translateX(-50%) scale(1.18) rotate(2deg)", offset: 0.6 },
      { transform: "translateX(-50%) scale(0.95) rotate(-1deg)", offset: 0.82 },
      { transform: "translateX(-50%) scale(1) rotate(0deg)" },
    ], { duration: 520, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)", fill: "forwards" });
    r.style.transform = "translateX(-50%) scale(1)";
  }, []);

  const idle = useCallback(() => {
    if (breathe.current) breathe.current.style.animation = "sealBreathe 2.6s ease-in-out infinite";
    if (glow.current) glow.current.style.animation = "sealGlow 2.6s ease-in-out infinite";
    if (hint.current) hint.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: "forwards" });
    playing.current = false;
  }, []);

  const play = useCallback(() => {
    if (playing.current) return;
    const d = drop.current;
    if (!d) return;
    playing.current = true;

    if (breathe.current) breathe.current.style.animation = "none";
    if (glow.current) { glow.current.style.animation = "none"; glow.current.style.opacity = "0"; }
    if (ribbon.current) ribbon.current.style.transform = "translateX(-50%) scale(0)";
    if (hint.current) hint.current.style.opacity = "0";
    d.style.opacity = "1";

    if (reduced()) {
      d.style.transform = "none";
      if (shadow.current) shadow.current.style.opacity = "1";
      if (ribbon.current) ribbon.current.style.transform = "translateX(-50%) scale(1)";
      if (glow.current) glow.current.style.opacity = "0.5";
      if (hint.current) hint.current.style.opacity = "1";
      playing.current = false;
      return;
    }

    d.animate([
      { transform: "translateY(-115vh) scale(1.5) rotate(-8deg)", offset: 0 },
      { transform: "translateY(0) scale(1.06) rotate(2deg)", offset: 0.72, easing: "cubic-bezier(0.55, 0, 1, 0.45)" },
      { transform: "translateY(0) scale(0.93) rotate(-1deg)", offset: 0.84 },
      { transform: "translateY(0) scale(1.03) rotate(0.5deg)", offset: 0.93 },
      { transform: "translateY(0) scale(1) rotate(0deg)", offset: 1 },
    ], { duration: 760, easing: "linear", fill: "forwards" });

    if (shadow.current) {
      shadow.current.animate([
        { opacity: 0, transform: "translateX(-50%) scale(0.4)" },
        { opacity: 0, transform: "translateX(-50%) scale(0.5)", offset: 0.5 },
        { opacity: 1, transform: "translateX(-50%) scale(1.15)", offset: 0.74 },
        { opacity: 0.85, transform: "translateX(-50%) scale(1)" },
      ], { duration: 760, fill: "forwards" });
    }

    const tImpact = 760 * 0.72;
    after(tImpact, () => impact());
    after(tImpact + 320, () => glintFn());
    after(tImpact + 420, () => ribbonPop());
    after(tImpact + 1300, () => idle());
  }, [after, impact, glintFn, ribbonPop, idle]);

  useEffect(() => {
    const t = timers.current;
    after(420, play);
    return () => { t.forEach((id) => clearTimeout(id)); };
  }, [after, play]);

  const bgCss = background === "transparent"
    ? "transparent"
    : "linear-gradient(180deg, #eef2ff 0%, #fdf6ff 40%, #e7f4ff 100%)";

  return (
    <div
      onClick={play}
      className="relative w-full h-full overflow-hidden select-none"
      style={{ background: bgCss, cursor: "pointer", fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", minHeight: 320 }}
    >
      <style>{`
        @keyframes sealBreathe{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}
        @keyframes sealGlow{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:.75;transform:scale(1.08)}}
      `}</style>

      <div ref={confetti} style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 6 }} />

      <div ref={world} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div ref={drop} style={{ position: "relative", width: "min(58vmin, 300px)", aspectRatio: "1", willChange: "transform", opacity: 0 }}>
          <div ref={shadow} style={{ position: "absolute", left: "50%", bottom: "-7%", width: "78%", height: "12%", transform: "translateX(-50%)", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(30,27,75,0.30), transparent 68%)", opacity: 0 }} />
          <div ref={glow} style={{ position: "absolute", inset: "-14%", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,197,66,0.55), rgba(245,158,11,0.18) 55%, transparent 72%)", opacity: 0, pointerEvents: "none" }} />
          <div ref={ring} style={{ position: "absolute", inset: "6%", borderRadius: "50%", border: "6px solid rgba(255,235,170,0.95)", boxShadow: "0 0 24px rgba(245,197,66,0.8), inset 0 0 18px rgba(245,197,66,0.6)", opacity: 0, pointerEvents: "none" }} />
          <div ref={ring2} style={{ position: "absolute", inset: "6%", borderRadius: "50%", border: "3px solid rgba(124,58,237,0.7)", opacity: 0, pointerEvents: "none" }} />

          <div ref={breathe} style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: "32%", bottom: "-12%", width: "13%", height: "26%", background: "linear-gradient(180deg, #4338ca, #6d28d9)", clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)", transform: "rotate(-8deg)", boxShadow: "0 4px 10px rgba(30,27,75,0.25)" }} />
            <div style={{ position: "absolute", right: "32%", bottom: "-12%", width: "13%", height: "26%", background: "linear-gradient(180deg, #7c3aed, #8b5cf6)", clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)", transform: "rotate(8deg)", boxShadow: "0 4px 10px rgba(30,27,75,0.25)" }} />

            <svg viewBox="0 0 400 400" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "drop-shadow(0 14px 22px rgba(120,72,0,0.35))" }}>
              <defs>
                <radialGradient id="soaFace" cx="42%" cy="36%" r="75%">
                  <stop offset="0%" stopColor="#ffe9a3" /><stop offset="45%" stopColor="#f5c542" /><stop offset="100%" stopColor="#e8a417" />
                </radialGradient>
                <radialGradient id="soaRim" cx="42%" cy="34%" r="80%">
                  <stop offset="0%" stopColor="#f7cf5e" /><stop offset="60%" stopColor="#e8a417" /><stop offset="100%" stopColor="#c47d0a" />
                </radialGradient>
                <linearGradient id="soaScallop" x1="0" y1="0" x2="0.6" y2="1">
                  <stop offset="0%" stopColor="#f2b93a" /><stop offset="100%" stopColor="#c47d0a" />
                </linearGradient>
                <clipPath id="soaClip"><circle cx="200" cy="200" r="168" /></clipPath>
              </defs>
              <g fill="url(#soaScallop)" stroke="#a8690a" strokeWidth="4">
                <circle cx="200" cy="32" r="30" /><circle cx="270" cy="46" r="30" /><circle cx="327" cy="86" r="30" /><circle cx="360" cy="148" r="30" />
                <circle cx="368" cy="218" r="30" /><circle cx="345" cy="285" r="30" /><circle cx="297" cy="336" r="30" /><circle cx="233" cy="364" r="30" />
                <circle cx="163" cy="362" r="30" /><circle cx="100" cy="332" r="30" /><circle cx="54" cy="280" r="30" /><circle cx="33" cy="213" r="30" />
                <circle cx="42" cy="143" r="30" /><circle cx="77" cy="83" r="30" /><circle cx="132" cy="45" r="30" />
              </g>
              <circle cx="200" cy="200" r="168" fill="url(#soaRim)" stroke="#a8690a" strokeWidth="5" />
              <circle cx="200" cy="200" r="138" fill="url(#soaFace)" stroke="#c47d0a" strokeWidth="4" />
              <circle cx="200" cy="200" r="152" fill="none" stroke="#fff3c9" strokeWidth="5" strokeDasharray="2 16" strokeLinecap="round" opacity="0.9" />
              <g transform="translate(-3,-3.5)" stroke="#ffedb0" strokeWidth="11" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
                <path d="M200 117 L221.7 175.1 L283.7 177.8 L235.2 216.4 L251.7 276.2 L200 242 L148.3 276.2 L164.8 216.4 L116.3 177.8 L178.3 175.1 Z" />
              </g>
              <g stroke="#b5750d" strokeWidth="11" fill="rgba(196,125,10,0.28)" strokeLinecap="round" strokeLinejoin="round">
                <path d="M200 117 L221.7 175.1 L283.7 177.8 L235.2 216.4 L251.7 276.2 L200 242 L148.3 276.2 L164.8 216.4 L116.3 177.8 L178.3 175.1 Z" />
              </g>
              <g clipPath="url(#soaClip)">
                <rect ref={glint} x="-140" y="-60" width="90" height="520" fill="rgba(255,255,255,0.55)" transform="rotate(24 200 200) translate(-260 0)" />
              </g>
            </svg>

            <div ref={ribbon} style={{ position: "absolute", left: "50%", bottom: "2%", transform: "translateX(-50%) scale(0)", zIndex: 3, filter: "drop-shadow(0 6px 12px rgba(30,27,75,0.35))" }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, #5b47e0, #4338ca)", border: "4px solid #312e81", borderRadius: 14, padding: "10px 30px 12px" }}>
                <span style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", fontWeight: 800, fontSize: "clamp(20px, 4.6vmin, 32px)", lineHeight: 1, color: "#fff", letterSpacing: "0.06em", textShadow: "0 2px 0 rgba(30,27,75,0.5)", whiteSpace: "nowrap" }}>{ribbonText}</span>
              </div>
            </div>
          </div>

          <div ref={sparkle} style={{ position: "absolute", inset: "-30%", pointerEvents: "none", zIndex: 5 }} />
        </div>
      </div>

      <div ref={hint} style={{ position: "absolute", bottom: 14, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: 0, pointerEvents: "none" }}>
        <span style={{ fontFamily: "var(--font-nunito), 'Nunito', sans-serif", fontWeight: 700, fontSize: 14, color: "#4338ca", background: "rgba(255,255,255,0.65)", padding: "6px 16px", borderRadius: 999, backdropFilter: "blur(4px)" }}>Tap the seal to stamp it again!</span>
      </div>
    </div>
  );
}
