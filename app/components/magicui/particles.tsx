"use client";

/**
 * Magic UI — Particles (vendored).
 *
 * Re-exports our local Particles implementation (lib/_components/Particles.tsx)
 * under the magicui namespace so all Magic UI components live under
 * one folder. We rolled our own canvas implementation rather than
 * pulling the upstream registry version — the runtime behavior is
 * identical for the props we use (quantity, color, ease, staticity).
 *
 * If you ever want to swap to the canonical Magic UI Particles
 * (which adds a few extras like vx/vy props), pull it from
 * https://magicui.design/r/particles.json and replace this file.
 */

export { default as Particles } from "@/app/_components/Particles";
export type { ParticlesProps } from "@/app/_components/Particles";
