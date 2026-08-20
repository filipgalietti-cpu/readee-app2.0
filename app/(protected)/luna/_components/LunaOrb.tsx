"use client";

/**
 * LunaOrb — Luna's face: a ChatGPT-style "fluid sky" voice orb, ported
 * from the Claude Design "Readee AI Buddy" mockup. A perfect circle with
 * cream/white clouds up top melting into a vivid color mass below; the
 * horizon undulates with the child's voice (real amplitude while
 * listening, procedural while Luna speaks). Colors shift by mode.
 *
 * Purely presentational: the parent owns the mic/recording and drives
 * `mode`; when listening it also passes a live AnalyserNode so the orb
 * reacts to real speech.
 */

import { useEffect, useRef } from "react";

export type LunaMode = "idle" | "listening" | "thinking" | "speaking";

const COLS: Record<LunaMode, [string, string, string, string, string]> = {
  // [skyTop, skyMid, massLight, massDeep, glow]
  idle: ["#fffdf4", "#e0e7ff", "#a5b4fc", "#6366f1", "#818cf8"],
  listening: ["#fffdf4", "#dbeafe", "#818cf8", "#4338ca", "#4338ca"],
  thinking: ["#fffdf4", "#e0e7ff", "#a5b4fc", "#6366f1", "#818cf8"],
  speaking: ["#fdf4ff", "#ede9fe", "#a78bfa", "#6d28d9", "#7c3aed"],
};

export default function LunaOrb({
  mode,
  analyser,
  onTap,
  size = 210,
}: {
  mode: LunaMode;
  analyser?: AnalyserNode | null;
  onTap?: () => void;
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobRef = useRef<HTMLButtonElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<LunaMode>(mode);
  const analyserRef = useRef<AnalyserNode | null>(analyser ?? null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { analyserRef.current = analyser ?? null; }, [analyser]);

  useEffect(() => {
    let t = 0, amp = 0, p1 = 0, p2 = 3, p3 = 7, level = 0.58, wAmp = 4;
    let td: Uint8Array<ArrayBuffer> | null = null;

    const loop = () => {
      t += 1 / 60;
      const m = modeRef.current;
      const an = analyserRef.current;
      let target = 0;
      if (m === "listening" && an) {
        if (!td || td.length !== an.fftSize) td = new Uint8Array(an.fftSize);
        an.getByteTimeDomainData(td);
        let sum = 0;
        for (let i = 0; i < td.length; i++) { const v = (td[i] - 128) / 128; sum += v * v; }
        target = Math.min(1, Math.sqrt(sum / td.length) * 4.5);
      } else if (m === "listening") {
        target = 0.12 + 0.08 * Math.abs(Math.sin(t * 1.7));
      } else if (m === "speaking") {
        target = Math.min(1, 0.22 + 0.2 * Math.abs(Math.sin(t * 2.1) + 0.5 * Math.sin(t * 3.6)));
      } else if (m === "thinking") {
        target = 0.04;
      }
      amp += (target - amp) * (target > amp ? 0.07 : 0.04);
      const a = amp;
      const [skyTop, skyMid, massLight, massDeep, glow] = COLS[m];

      const blob = blobRef.current;
      if (blob) {
        blob.style.transform = `scale(${1 + a * 0.07})`;
        blob.style.boxShadow = `0 10px 40px -12px ${glow}66, 0 0 ${14 + a * 60}px ${glow}55`;
      }
      const halo = haloRef.current;
      if (halo) halo.style.background = `radial-gradient(circle,${glow}4d,transparent 70%)`;

      const cv = canvasRef.current;
      if (cv) {
        const c = cv.getContext("2d");
        if (c) {
          const S = 420;
          p1 += (1 / 60) * (0.1 + a * 2.2);
          p2 += (1 / 60) * (0.07 + a * 1.6);
          p3 += (1 / 60) * (0.13 + a * 2.8);
          const wantLevel = 0.58 - a * 0.16;
          level += (wantLevel - level) * 0.05;
          wAmp += ((4 + a * 52) - wAmp) * 0.06;
          c.clearRect(0, 0, S, S);
          let g = c.createLinearGradient(0, 0, 0, S);
          g.addColorStop(0, skyTop); g.addColorStop(0.6, skyMid); g.addColorStop(1, skyMid);
          c.fillStyle = g; c.fillRect(0, 0, S, S);
          const mass = (levelY: number, ampl: number, f1: number, f2: number, ph1: number, ph2: number, fill: string | CanvasGradient, blur: number, alpha: number) => {
            c.save(); c.filter = `blur(${blur}px)`; c.globalAlpha = alpha;
            c.beginPath(); c.moveTo(-60, S + 60); c.lineTo(-60, levelY + ampl * Math.sin(-60 * f1 + ph1));
            for (let x = -60; x <= S + 60; x += 24) {
              const y = levelY + ampl * (0.62 * Math.sin(x * f1 + ph1) + 0.38 * Math.sin(x * f2 + ph2));
              c.lineTo(x, y);
            }
            c.lineTo(S + 60, S + 60); c.closePath(); c.fillStyle = fill; c.fill(); c.restore();
          };
          mass(S * (level - 0.07), wAmp * 1.2, 0.011, 0.023, p2, p3, massLight, 30, 0.55);
          const mg = c.createLinearGradient(0, S * (level - 0.15), 0, S);
          mg.addColorStop(0, massLight); mg.addColorStop(0.45, massDeep); mg.addColorStop(1, massDeep);
          mass(S * level, wAmp, 0.013, 0.027, p1, p3 * 1.3, mg, 20, 1);
          c.save(); c.filter = "blur(26px)"; c.globalAlpha = 0.8;
          c.beginPath(); c.ellipse(S * 0.42 + Math.sin(p2) * 18, S * 0.2, S * 0.4, S * 0.17, 0, 0, Math.PI * 2);
          c.fillStyle = "#ffffff"; c.fill(); c.restore();
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <div style={{ position: "relative", width: size + 90, height: size + 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div ref={haloRef} style={{ position: "absolute", width: size + 40, height: size + 40, borderRadius: "50%", background: "radial-gradient(circle,#c7d2fe66,transparent 70%)", animation: "lunaPulse 3.2s ease-in-out infinite" }} />
      <button
        type="button"
        onClick={onTap}
        aria-label="Tap to talk to Luna"
        ref={blobRef}
        style={{ width: size, height: size, borderRadius: "50%", background: "#e0e7ff", border: "3px solid #3730a3", boxShadow: "0 10px 40px -12px rgba(49,46,129,.35)", cursor: "pointer", position: "relative", overflow: "hidden", willChange: "transform", padding: 0 }}
      >
        <canvas ref={canvasRef} width={420} height={420} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: "50%" }} />
        {mode === "thinking" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {[0, 0.15, 0.3].map((d, i) => (
              <span key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: "#fff", animation: `lunaDot 1s ${d}s infinite` }} />
            ))}
          </div>
        )}
      </button>
      <style>{`
        @keyframes lunaPulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.15;transform:scale(1.18)}}
        @keyframes lunaDot{0%,100%{transform:translateY(0);opacity:.55}50%{transform:translateY(-8px);opacity:1}}
        @media (prefers-reduced-motion: reduce){[style*="lunaPulse"]{animation:none!important}}
      `}</style>
    </div>
  );
}
