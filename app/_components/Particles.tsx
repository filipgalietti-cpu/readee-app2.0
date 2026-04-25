"use client";

/**
 * Canvas-based particle field — modeled after Magic UI's Particles
 * component, rebuilt locally so we don't pull in their registry.
 *
 * Particles drift slowly and react to the mouse cursor: any particle
 * within a small radius gets gently pushed away, with a critical-damping
 * spring back to its drift trajectory.
 *
 * Pointer-events:none so it never blocks UI underneath.
 */

import { useEffect, useRef } from "react";

export type ParticlesProps = {
  className?: string;
  quantity?: number;
  /** Hex string, e.g. "#8b5cf6" */
  color?: string;
  /** Higher = slower easing back to drift (more "pushable"). 1-200 */
  ease?: number;
  /** Mouse staze radius in CSS pixels. */
  staticity?: number;
  /** Min/max particle radius. */
  size?: number;
  /** Re-randomize layout when this changes. */
  refresh?: boolean;
};

type Particle = {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v = h.length === 3
    ? h.split("").map((c) => c + c).join("")
    : h;
  const num = parseInt(v, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export default function Particles({
  className = "",
  quantity = 100,
  color = "#8b5cf6",
  ease = 80,
  staticity = 50,
  size = 0.4,
  refresh = false,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const dprRef = useRef(1);
  const sizeRef = useRef({ w: 0, h: 0 });
  const rafRef = useRef<number | null>(null);
  const colorRef = useRef(hexToRgb(color));

  useEffect(() => {
    colorRef.current = hexToRgb(color);
  }, [color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctxRef.current = ctx;

    function resize() {
      if (!container || !canvas || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      const rect = container.getBoundingClientRect();
      sizeRef.current = { w: rect.width, h: rect.height };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedParticles();
    }

    function seedParticles() {
      const { w, h } = sizeRef.current;
      const next: Particle[] = [];
      for (let i = 0; i < quantity; i++) {
        const baseSize = Math.floor(Math.random() * 2) + size;
        next.push({
          x: Math.random() * w,
          y: Math.random() * h,
          translateX: 0,
          translateY: 0,
          size: baseSize,
          alpha: 0,
          targetAlpha: parseFloat((Math.random() * 0.6 + 0.1).toFixed(2)),
          dx: (Math.random() - 0.5) * 0.2,
          dy: (Math.random() - 0.5) * 0.2,
          magnetism: 0.1 + Math.random() * 4,
        });
      }
      particlesRef.current = next;
    }

    function onMouseMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }

    function tick() {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      const [r, g, b] = colorRef.current;
      const mouse = mouseRef.current;

      for (const p of particles) {
        // Drift
        p.x += p.dx;
        p.y += p.dy;
        // Wrap-around so particles never disappear
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Mouse repulsion
        const distX = p.x - mouse.x;
        const distY = p.y - mouse.y;
        const dist = Math.sqrt(distX * distX + distY * distY);
        const maxDist = staticity * 2;
        if (dist < maxDist && dist > 0) {
          const pushX = (distX / dist) * (1 - dist / maxDist) * p.magnetism;
          const pushY = (distY / dist) * (1 - dist / maxDist) * p.magnetism;
          p.translateX += (pushX - p.translateX) / ease;
          p.translateY += (pushY - p.translateY) / ease;
        } else {
          p.translateX += (0 - p.translateX) / ease;
          p.translateY += (0 - p.translateY) / ease;
        }

        // Fade in
        if (p.alpha < p.targetAlpha) {
          p.alpha = Math.min(p.targetAlpha, p.alpha + 0.02);
        }

        // Draw
        ctx.beginPath();
        ctx.arc(p.x + p.translateX, p.y + p.translateY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    resize();
    tick();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantity, ease, staticity, size, refresh]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
      aria-hidden
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
