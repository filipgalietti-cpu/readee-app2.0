"use client";

/**
 * LunaOrb — Luna's face: a ChatGPT-style "fluid sky" voice orb, ported from
 * the Claude Design "Luna Full Flow" mockup. A perfect circle of drifting
 * cream/violet light over a vivid color mass whose horizon undulates with the
 * child's voice.
 *
 * The orb has two personalities that cross-fade on `mode`:
 *  - resting (idle): slow-breathing, soft white/violet, light drifting inside
 *  - engaged (listening/thinking/speaking): the color blooms toward a
 *    per-mode palette, the fluid speeds up, and the rim brightens.
 * `eng` (engagement) is eased separately from `amp` (loudness) so the state
 * change reads even before the child makes a sound. While listening we take
 * real amplitude off the AnalyserNode; otherwise the motion is procedural.
 *
 * Purely presentational: the parent owns the mic/recording and drives `mode`.
 * Size-independent — the canvas math normalizes by a fixed buffer, so it
 * looks identical from a 44px chip to a 210px hero.
 */

import { useEffect, useRef } from "react";

export type LunaMode = "idle" | "listening" | "thinking" | "speaking";

// [skyTop, skyMid, massLight, massDeep, glow]
const REST: [string, string, string, string, string] = [
  "#ffffff", "#f5f3ff", "#c4b5fd", "#8b5cf6", "#8b5cf6",
];
const ACTIVE: Record<LunaMode, [string, string, string, string, string]> = {
  idle: ["#fdf4ff", "#ede9fe", "#a78bfa", "#5b21b6", "#7c3aed"],
  listening: ["#fbfdff", "#dbeafe", "#818cf8", "#3730a3", "#4338ca"],
  thinking: ["#fdf4ff", "#ede9fe", "#a78bfa", "#5b21b6", "#7c3aed"],
  speaking: ["#fdf4ff", "#ede9fe", "#c4b5fd", "#6d28d9", "#8b5cf6"],
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
  const modeRef = useRef<LunaMode>(mode);
  const analyserRef = useRef<AnalyserNode | null>(analyser ?? null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { analyserRef.current = analyser ?? null; }, [analyser]);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let t = 0, amp = 0, eng = 0;
    let p1 = 0, p2 = 3, p3 = 7, d1 = 1.4, d2 = 5.1;
    let level = 0.6, wAmp = 3;
    let td: Uint8Array<ArrayBuffer> | null = null;

    // mix two #rrggbb colors -> an "r,g,b" triplet so callers build rgb()/rgba() freely
    const mix = (c1: string, c2: string, k: number) => {
      const h = (s: string): [number, number, number] => [
        parseInt(s.slice(1, 3), 16),
        parseInt(s.slice(3, 5), 16),
        parseInt(s.slice(5, 7), 16),
      ];
      const A = h(c1), B = h(c2);
      return A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(",");
    };
    const rgb = (trip: string, al?: number) =>
      al == null ? `rgb(${trip})` : `rgba(${trip},${al})`;

    const loop = () => {
      t += 1 / 60;
      const m = modeRef.current;
      const an = analyserRef.current;

      // --- amplitude (loudness) ---
      let target = 0;
      if (m === "listening" && an) {
        if (!td || td.length !== an.fftSize) td = new Uint8Array(an.fftSize);
        an.getByteTimeDomainData(td);
        let sum = 0;
        for (let i = 0; i < td.length; i++) { const v = (td[i] - 128) / 128; sum += v * v; }
        target = Math.min(1, Math.sqrt(sum / td.length) * 4.5);
      } else if (m === "listening" || m === "thinking") {
        target = Math.min(1, 0.3 + 0.2 * Math.abs(Math.sin(t * 2) + 0.5 * Math.sin(t * 3.3)));
      } else if (m === "speaking") {
        target = Math.min(1, 0.22 + 0.2 * Math.abs(Math.sin(t * 2.1) + 0.5 * Math.sin(t * 3.6)));
      }
      amp += (target - amp) * (target > amp ? 0.05 : 0.03);
      const a = amp;

      // --- engagement (state), eased apart from loudness ---
      const wantEng = m === "idle" ? 0 : 1;
      eng += (wantEng - eng) * (wantEng > eng ? 0.045 : 0.03);
      const e = eng;

      const active = ACTIVE[m] ?? ACTIVE.thinking;
      const [skyTop, skyMid, massLight, massDeep, glow] = REST.map((c1, i) =>
        mix(c1, active[i], e),
      );

      // resting drift is slow but never zero; engagement + loudness multiply it
      const spd = reduce ? 0.14 : 0.45 + e * 1.1 + a * 2.4;
      p1 += (1 / 60) * (0.1 * spd + a * 1.6);
      p2 += (1 / 60) * (0.075 * spd + a * 1.2);
      p3 += (1 / 60) * (0.13 * spd + a * 2.0);
      d1 += (1 / 60) * (reduce ? 0.05 : 0.34 + e * 0.34 + a * 0.9);
      d2 += (1 / 60) * (reduce ? 0.04 : 0.25 + e * 0.28 + a * 0.7);

      const breathe = reduce ? 0.5 : Math.sin(t * 0.52) * 0.5 + 0.5; // resting inhale/exhale
      const wantLevel = 0.6 - e * 0.03 - a * 0.15 + (1 - e) * (breathe - 0.5) * 0.07;
      level += (wantLevel - level) * 0.05;
      const wantAmp = 3 + (1 - e) * (4 + breathe * 6) + e * 9 + a * 30;
      wAmp += (wantAmp - wAmp) * 0.06;

      // --- canvas ---
      const cv = canvasRef.current;
      const c = cv?.getContext("2d");
      if (cv && c) {
        const S = cv.width, k = S / 300; // k keeps the look size-independent
        c.clearRect(0, 0, S, S);
        const g = c.createLinearGradient(0, 0, 0, S);
        g.addColorStop(0, rgb(skyTop)); g.addColorStop(0.6, rgb(skyMid)); g.addColorStop(1, rgb(skyMid));
        c.fillStyle = g; c.fillRect(0, 0, S, S);

        // slow-drifting light within the orb — the resting state's whole personality
        const drift = (cx: number, cy: number, r: number, trip: string, alpha: number) => {
          c.save(); c.globalAlpha = alpha;
          const rgd = c.createRadialGradient(cx, cy, 0, cx, cy, r);
          rgd.addColorStop(0, rgb(trip, 1)); rgd.addColorStop(1, rgb(trip, 0));
          c.fillStyle = rgd; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill(); c.restore();
        };
        const dr = 1 + e * 0.25 + a * 0.35;
        const pulse = 0.9 + 0.18 * Math.sin(d1 * 1.3);
        drift(S * (0.36 + 0.26 * Math.sin(d1)), S * (0.32 + 0.2 * Math.cos(d1 * 0.83)),
          S * 0.34 * dr * pulse, "255,255,255", 0.62 + e * 0.12);
        drift(S * (0.68 + 0.24 * Math.cos(d2 * 0.9)), S * (0.42 + 0.22 * Math.sin(d2)),
          S * 0.29 * dr * (1.9 - pulse), massLight, 0.46 + e * 0.14);
        drift(S * (0.5 + 0.3 * Math.sin(d2 * 0.62 + 2)), S * (0.6 + 0.18 * Math.cos(d1 * 0.7)),
          S * 0.3 * dr * pulse, massDeep, 0.24 + e * 0.16);

        const mass = (levelY: number, ampl: number, f1: number, f2: number, ph1: number, ph2: number, fill: string | CanvasGradient, blur: number, alpha: number) => {
          c.save(); c.filter = `blur(${blur}px)`; c.globalAlpha = alpha;
          c.beginPath(); c.moveTo(-50, S + 50); c.lineTo(-50, levelY);
          for (let x = -50; x <= S + 50; x += 14 * k) {
            c.lineTo(x, levelY + ampl * (0.62 * Math.sin(x * f1 + ph1) + 0.38 * Math.sin(x * f2 + ph2)));
          }
          c.lineTo(S + 50, S + 50); c.closePath(); c.fillStyle = fill; c.fill(); c.restore();
        };
        mass(S * (level - 0.07), wAmp * 1.25 * k, 0.015 / k, 0.032 / k, p2, p3, rgb(massLight), (22 - e * 6) * k, 0.5 + e * 0.12);
        const mg = c.createLinearGradient(0, S * (level - 0.15), 0, S);
        mg.addColorStop(0, rgb(massLight)); mg.addColorStop(0.45, rgb(massDeep)); mg.addColorStop(1, rgb(massDeep));
        mass(S * level, wAmp * k, 0.018 / k, 0.037 / k, p1, p3 * 1.3, mg, (16 - e * 6) * k, 1);

        c.save(); c.filter = `blur(${(20 - e * 4) * k}px)`; c.globalAlpha = 0.55 + e * 0.3;
        c.beginPath(); c.ellipse(S * 0.42 + Math.sin(p2) * (10 + e * 10) * k, S * 0.2 + Math.cos(d1 * 0.8) * 8 * k, S * 0.4, S * 0.17, 0, 0, Math.PI * 2);
        c.fillStyle = "#ffffff"; c.fill(); c.restore();
      }

      // --- shell (breathing scale, rim, glow) ---
      const blob = blobRef.current;
      if (blob) {
        const bs = 1 + (1 - e) * (breathe - 0.5) * 0.024 + e * 0.03 + a * 0.06;
        blob.style.transform = `scale(${bs})`;
        blob.style.borderColor = rgb(mix("#c4b5fd", "#5b21b6", e));
        blob.style.borderWidth = `${2 + e}px`;
        blob.style.boxShadow =
          `0 10px 40px -12px ${rgb(glow, 0.2 + e * 0.24)}, 0 0 ${8 + e * 22 + a * 50}px ${rgb(glow, 0.14 + e * 0.24)}`;
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const box = Math.round(size * 1.23);

  return (
    <div style={{ position: "relative", width: box, height: box, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <button
        type="button"
        onClick={onTap}
        aria-label="Tap to talk to Luna"
        ref={blobRef}
        style={{
          width: size, height: size, borderRadius: "50%",
          background: "#ede9fe", border: "2px solid #c4b5fd",
          boxShadow: "0 10px 40px -12px rgba(139,92,246,.2)",
          cursor: onTap ? "pointer" : "default", position: "relative",
          overflow: "hidden", willChange: "transform", padding: 0,
        }}
      >
        <canvas ref={canvasRef} width={424} height={424} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: "50%" }} />
      </button>
    </div>
  );
}
