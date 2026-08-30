"use client";

/**
 * Warm-Up Arcade runner v2 — ported from Filip's Claude Design "Carrot
 * Patch" round (start → ready countdown → 45s spawn round → celebration).
 *
 * Two skins of one mechanic: "carrot" (word-carrots pop out of soil
 * mounds) and "sky" (word-balloons drift down). Spawning is imperative
 * DOM into a field layer, like the lesson engine's fx: dozens of
 * transient nodes per round is the wrong job for React state.
 *
 * No-fail contract (Jennifer's spec, non-negotiable): wrong taps shiver
 * and duck away with no penalty, score only counts up, misses are never
 * counted or shown, completion always pays carrots and celebrates.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { WarmupDef } from "@/lib/warmup-engine/types";
import { Carrot } from "lucide-react";
import { BunnyReaction } from "@/app/_components/Bunny/Bunny";

type Screen = "start" | "intro" | "ready" | "play" | "end";
export type WarmupSkin = "carrot" | "sky";

const SLOT_W = [
  { x: 0.15, y: 0.62, z: 12 }, { x: 0.42, y: 0.58, z: 12 }, { x: 0.7, y: 0.61, z: 12 },
  { x: 0.28, y: 0.85, z: 16 }, { x: 0.56, y: 0.87, z: 16 }, { x: 0.84, y: 0.84, z: 16 },
];
const SLOT_N = [
  { x: 0.256, y: 0.468, z: 12 }, { x: 0.744, y: 0.45, z: 12 }, { x: 0.154, y: 0.646, z: 16 },
  { x: 0.59, y: 0.664, z: 16 }, { x: 0.359, y: 0.841, z: 20 }, { x: 0.833, y: 0.823, z: 20 },
];
const BCOLS = [
  { l: "#c4b5fd", d: "#8b5cf6" }, { l: "#fda4af", d: "#f43f5e" }, { l: "#7dd3fc", d: "#0284c7" },
  { l: "#fcd34d", d: "#f59e0b" }, { l: "#6ee7b7", d: "#10b981" },
];
const GREETINGS = [1, 2, 3, 4].map((n) => `/audio/warmups-v2/shared/greeting-${n}.mp3`);

const CARROT_SVG = `<svg width="104" height="132" viewBox="0 0 104 132" style="display:block"><ellipse cx="32" cy="18" rx="11" ry="17" fill="#16a34a" transform="rotate(-28 32 18)"></ellipse><ellipse cx="72" cy="18" rx="11" ry="17" fill="#16a34a" transform="rotate(28 72 18)"></ellipse><ellipse cx="52" cy="14" rx="10" ry="19" fill="#4ade80"></ellipse><path d="M22 36 Q52 24 82 36 Q88 46 80 66 Q68 104 57 124 Q52 132 47 124 Q36 104 24 66 Q16 46 22 36 Z" fill="#fb923c" stroke="#c2410c" stroke-width="4" stroke-linejoin="round"></path><path d="M34 80 q9 5 18 5 M41 100 q6 4 12 4" stroke="#ea580c" stroke-width="3.5" fill="none" stroke-linecap="round"></path><ellipse cx="37" cy="48" rx="6" ry="11" fill="#fdba74" opacity=".65" transform="rotate(-10 37 48)"></ellipse></svg>`;

type Live = {
  el: HTMLDivElement;
  wrap?: HTMLDivElement;
  inner?: HTMLDivElement;
  word: string;
  correct: boolean;
  audio?: string;
  col?: { l: string; d: string };
  fall?: Animation;
  duckT?: ReturnType<typeof setTimeout>;
  gone: boolean;
};

export default function WarmupArcade({
  warmup,
  skin = "carrot",
  lessonTitle,
  outfitId = null,
  childName,
  greetingAudioUrl = null,
  onComplete,
}: {
  warmup: WarmupDef;
  skin?: WarmupSkin;
  /** Shown in the "Warming up for …" chip. Falls back to the lesson id. */
  lessonTitle?: string;
  /** The child's bunny outfit — journey wiring passes the reader's own. */
  outfitId?: string | null;
  /** Shown in the on-screen welcome ("Welcome, Maya!"). */
  childName?: string;
  /** The child's personal recorded greeting (synthesized at name submission).
   *  Falls back to a generic variant when absent. */
  greetingAudioUrl?: string | null;
  onComplete?: () => void;
}) {
  const [screen, setScreen] = useState<Screen>("start");
  const [score, setScore] = useState(0);
  const [countText, setCountText] = useState("1");
  const [endBest, setEndBest] = useState<{ best: number; isBest: boolean } | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const basketRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<HTMLDivElement>(null);

  const live = useRef(new Map<number, Live>());
  const roundActive = useRef(false);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const playing = useRef(false);
  const endsAt = useRef(0);
  const tickI = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastWords = useRef<string[]>([]);
  const callIdx = useRef(0);
  const scoreRef = useRef(0);
  const tapLockUntil = useRef(0);
  const greetingSrc = useRef<string | null>(null);
  const greetingStarted = useRef(false);
  const ac = useRef<AudioContext | null>(null);
  const voice = useRef<HTMLAudioElement | null>(null);
  const rm = useRef(false);

  const isCarrot = skin === "carrot";
  const isCall = warmup.mode === "call";
  const playSeconds = warmup.playSeconds ?? 45;
  const bestKey = `warmup-best:${warmup.id}`;

  // ---- pools (rule mode draws freely; call mode walks the waves) ----
  const matchPool = warmup.waves.flatMap((w) => w.tiles.filter((t) => t.isMatch).map((t) => t.word));
  const decoyPool = warmup.waves.flatMap((w) => w.tiles.filter((t) => !t.isMatch).map((t) => t.word));

  const to = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(() => { timers.current.delete(t); fn(); }, ms);
    timers.current.add(t);
    return t;
  }, []);

  const stopAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
    if (tickI.current) clearInterval(tickI.current);
    if (voice.current) { voice.current.pause(); voice.current.src = ""; }
  }, []);

  useEffect(() => {
    rm.current = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const keyH = (e: KeyboardEvent) => {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 6) tapRef.current(n - 1);
    };
    window.addEventListener("keydown", keyH);
    return () => { window.removeEventListener("keydown", keyH); stopAll(); };
  }, [stopAll]);

  // Start-screen greeting: prefer the child's personal clip (loads async from
  // the demo hook / journey context), falling back to a generic variant if it
  // has not arrived shortly after mount. Plays exactly once.
  const greetingPlayed = useRef(false);
  useEffect(() => {
    if (greetingPlayed.current || screen !== "start") return;
    const playGreeting = (src: string) => {
      greetingPlayed.current = true;
      greetingSrc.current = src;
      const a = new Audio(src);
      voice.current = a;
      a.play()
        .then(() => { greetingStarted.current = true; })
        .catch(() => {
          // Autoplay blocked on a cold load. No retry games: onPlay chains
          // the greeting in front of the intro so it is always heard.
        });
    };
    if (greetingAudioUrl) {
      playGreeting(greetingAudioUrl);
      return;
    }
    const t = setTimeout(() => {
      if (!greetingPlayed.current) playGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
    }, 3500);
    return () => clearTimeout(t);
  }, [greetingAudioUrl, screen]);

  // ---- audio: Autonoe voice clips + WebAudio chimes (C-major family) ----
  const say = useCallback((src: string, onEnd?: () => void) => {
    if (voice.current) voice.current.pause();
    const a = new Audio(src);
    voice.current = a;
    if (onEnd) a.onended = onEnd;
    a.play().catch(() => onEnd?.());
  }, []);

  const tone = useCallback((f: number, t = 0, d = 0.18, type: OscillatorType = "sine", g = 0.1) => {
    try {
      if (!ac.current) ac.current = new AudioContext();
      if (ac.current.state === "suspended") void ac.current.resume();
      const o = ac.current.createOscillator(), gn = ac.current.createGain(), t0 = ac.current.currentTime + t;
      o.type = type; o.frequency.value = f;
      gn.gain.setValueAtTime(0.0001, t0);
      gn.gain.linearRampToValueAtTime(g, t0 + 0.015);
      gn.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      o.connect(gn).connect(ac.current.destination);
      o.start(t0); o.stop(t0 + d + 0.05);
    } catch { /* sound is a garnish, never a blocker */ }
  }, []);
  const sCorrect = useCallback(() => { tone(523, 0, 0.15, "triangle", 0.11); tone(659, 0.06, 0.15, "triangle", 0.1); tone(784, 0.12, 0.2, "triangle", 0.09); tone(1568, 0.18, 0.12, "sine", 0.045); }, [tone]);
  const sWrong = useCallback(() => tone(392, 0, 0.16, "sine", 0.04), [tone]);
  const sPop = useCallback(() => tone(1046, 0, 0.05, "square", 0.02), [tone]);
  const sEnd = useCallback(() => [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.26, "triangle", 0.09)), [tone]);

  const stageW = () => stageRef.current?.offsetWidth || 1280;
  const stageH = () => stageRef.current?.offsetHeight || 800;
  const slotPx = (i: number) => {
    const w = stageW(), h = stageH();
    const s = (w > 700 ? SLOT_W : SLOT_N)[i];
    return { x: s.x * w, y: s.y * h, z: s.z };
  };
  const lanePx = (i: number) => 70 + (stageW() - 230) * (i / 5);

  // ---- particles ----
  const burst = useCallback((x: number, y: number, colors: string[], n: number, spread: number) => {
    const field = fieldRef.current;
    if (!field) return;
    for (let i = 0; i < n; i++) {
      const p = document.createElement("div");
      const a = Math.random() * Math.PI * 2, d = spread * (0.5 + Math.random() * 0.5);
      const w = 4 + Math.random() * 5;
      p.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${w}px;border-radius:${Math.random() < 0.5 ? "50%" : "2px"};background:${colors[i % colors.length]};z-index:55;pointer-events:none;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d - 16}px;animation:wuPart ${0.4 + Math.random() * 0.25}s ease-out both;`;
      field.appendChild(p);
      to(() => p.remove(), 700);
    }
  }, [to]);

  // ---- word picking ----
  const pickWord = useCallback((): { word: string; correct: boolean } => {
    if (isCall) {
      const wave = warmup.waves[callIdx.current];
      const visible = [...live.current.values()].map((l) => l.word);
      const target = wave.tiles.find((t) => t.isMatch)!.word;
      // the called word must be findable: if it is not on screen, spawn it
      if (!visible.includes(target)) return { word: target, correct: true };
      const decoys = wave.tiles.filter((t) => !t.isMatch).map((t) => t.word)
        .concat(decoyPool).filter((w) => !visible.includes(w));
      return { word: decoys[Math.floor(Math.random() * decoys.length)] ?? target, correct: false };
    }
    const visible = [...live.current.values()].map((l) => l.word);
    let pool = (Math.random() < 0.6 ? matchPool : decoyPool)
      .filter((w) => !visible.includes(w) && !lastWords.current.includes(w));
    if (!pool.length) pool = matchPool.concat(decoyPool).filter((w) => !visible.includes(w));
    const w = pool[Math.floor(Math.random() * pool.length)];
    lastWords.current = [w, ...lastWords.current].slice(0, 2);
    return { word: w, correct: isCall ? false : matchPool.includes(w) };
  }, [isCall, warmup.waves, matchPool, decoyPool]);

  // ---- spawn / dismiss / tap ----
  const dismiss = useCallback((idx: number) => {
    const e = live.current.get(idx);
    if (!e || e.gone) return;
    e.gone = true;
    if (e.duckT) clearTimeout(e.duckT);
    e.el.style.pointerEvents = "none";
    if (e.inner) e.inner.style.pointerEvents = "none";
    if (isCarrot && !rm.current) e.el.style.animation = "wuDuck .42s cubic-bezier(.55,0,.8,.4) both";
    else (e.inner || e.el).style.animation = "wuFadeOut .35s ease both";
    to(() => { (e.wrap ?? e.el).remove(); live.current.delete(idx); }, 440);
  }, [isCarrot, to]);

  const collect = useCallback((idx: number) => {
    const e = live.current.get(idx)!;
    e.gone = true;
    if (e.duckT) clearTimeout(e.duckT);
    e.fall?.pause();
    sCorrect();
    // Say the caught word ("Thunder!") — pre-teaching through the ears too.
    const tileAudio = warmup.waves.flatMap((w) => w.tiles).find((t) => t.word === e.word)?.audio;
    if (tileAudio) say(tileAudio);
    const stage = stageRef.current!, basket = basketRef.current;
    const r = e.el.getBoundingClientRect(), pr = stage.getBoundingClientRect();
    const cx = r.left + r.width / 2 - pr.left, cy = r.top + r.height / 2 - pr.top;
    if (!rm.current) {
      if (isCarrot) burst(cx, cy + 44, ["#a9714b", "#7a4b26", "#d4a373"], 9, 58);
      else burst(cx, cy - 10, [e.col!.d, e.col!.l, "#ffffff"], 10, 62);
    }
    const fly = document.createElement("div");
    fly.style.cssText = `position:absolute;left:${r.left - pr.left}px;top:${r.top - pr.top}px;width:${r.width}px;height:${r.height}px;z-index:60;pointer-events:none;`;
    fly.innerHTML = isCarrot
      ? e.el.innerHTML
      : `<div style="display:inline-block;margin:26px 0 0 4px;background:#fff;border-radius:12px;padding:5px 12px;font-family:'Baloo 2',cursive;font-weight:800;font-size:20px;color:#4338ca;box-shadow:0 6px 18px rgba(30,27,75,.3);">${e.word}</div>`;
    stage.appendChild(fly);
    (e.wrap ?? e.el).remove();
    live.current.delete(idx);
    if (basket) {
      const br = basket.getBoundingClientRect();
      const dx = br.left + br.width / 2 - (r.left + r.width / 2);
      const dy = br.top + br.height / 2 - (r.top + r.height / 2);
      if (rm.current) { fly.style.transition = "opacity .35s ease"; fly.style.opacity = "0"; }
      else {
        fly.style.transform = "scale(1.12) rotate(-6deg)";
        requestAnimationFrame(() => requestAnimationFrame(() => {
          fly.style.transition = "transform .44s cubic-bezier(.45,-.18,.6,1), opacity .08s .36s ease";
          fly.style.transform = `translate(${dx}px,${dy}px) scale(.2) rotate(26deg)`;
          fly.style.opacity = "0";
        }));
      }
    }
    to(() => {
      fly.remove();
      const b = basketRef.current;
      if (b && !rm.current) {
        b.style.animation = "none";
        void b.offsetWidth;
        b.style.animation = "wuBasketPop .42s cubic-bezier(.34,1.56,.64,1) both";
        const bp = b.getBoundingClientRect(), pp = stageRef.current!.getBoundingClientRect();
        burst(bp.left + bp.width / 2 - pp.left, bp.top - pp.top + 8, ["#fbbf24", "#fde68a", "#ffffff"], 6, 34);
      }
      scoreRef.current += 1;
      setScore(scoreRef.current);
      // call mode: a catch advances to the next call
      if (isCall) {
        callIdx.current += 1;
        const next = warmup.waves[callIdx.current];
        if (!next) { endRoundRef.current(); return; }
        if (next.call) say(next.call.audio);
      }
    }, rm.current ? 360 : 430);
  }, [burst, isCall, isCarrot, sCorrect, say, to, warmup.waves]);

  const shy = useCallback((idx: number) => {
    const e = live.current.get(idx)!;
    sWrong();
    if (isCarrot) {
      if (!rm.current) { e.el.style.animation = "wuShiver .34s ease both"; to(() => dismiss(idx), 330); }
      else dismiss(idx);
      return;
    }
    e.gone = true;
    if (e.duckT) clearTimeout(e.duckT);
    e.fall?.pause();
    e.inner!.style.pointerEvents = "none";
    if (rm.current) e.inner!.style.animation = "wuFadeOut .4s ease both";
    else {
      e.inner!.style.animation = "wuShiver .3s ease both";
      to(() => {
        e.inner!.animate(
          [{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-150px)", opacity: 0 }],
          { duration: 700, easing: "ease-in", fill: "forwards" },
        );
      }, 300);
    }
    to(() => { e.el.remove(); live.current.delete(idx); }, rm.current ? 420 : 1050);
  }, [dismiss, isCarrot, sWrong, to]);

  const tap = useCallback((idx: number) => {
    if (!playing.current) return;
    // Soft anti-spam: a wrong tap locks input for half a second. Spam-clicking
    // becomes useless without ever being punished (no-fail contract).
    if (Date.now() < tapLockUntil.current) return;
    const e = live.current.get(idx);
    if (!e || e.gone) return;
    if (e.correct) collect(idx);
    else {
      tapLockUntil.current = Date.now() + 500;
      shy(idx);
    }
  }, [collect, shy]);
  const tapRef = useRef(tap);
  useEffect(() => { tapRef.current = tap; }, [tap]);

  const spawnCarrot = useCallback((idx: number, word: string, correct: boolean) => {
    const slot = slotPx(idx), field = fieldRef.current;
    if (!field) return;
    const wrap = document.createElement("div");
    wrap.style.cssText = `position:absolute;left:${slot.x - 52}px;top:${slot.y - 166}px;width:104px;height:158px;overflow:hidden;z-index:${slot.z + 1};pointer-events:none;`;
    const c = document.createElement("div");
    c.style.cssText = "position:absolute;left:0;bottom:-16px;width:104px;height:140px;cursor:pointer;pointer-events:auto;transform:translateY(120%);touch-action:manipulation;";
    c.innerHTML = CARROT_SVG + `<div style="position:absolute;top:40px;left:0;width:100%;text-align:center;font-family:'Baloo 2',cursive;font-weight:800;font-size:21px;color:#fff;text-shadow:0 2px 0 #c2410c;letter-spacing:.5px;">${word}</div>`;
    wrap.appendChild(c);
    field.appendChild(wrap);
    c.style.animation = rm.current ? "wuFadeIn .4s ease both" : "wuRise .55s cubic-bezier(.34,1.56,.64,1) both";
    if (!rm.current) burst(slot.x, slot.y - 8, ["#a9714b", "#7a4b26", "#d4a373"], 7, 44);
    sPop();
    const entry: Live = { el: c, wrap, word, correct, gone: false };
    entry.duckT = to(() => dismiss(idx), 2500 + Math.random() * 1500);
    c.addEventListener("pointerdown", (e) => { e.preventDefault(); tapRef.current(idx); });
    live.current.set(idx, entry);
  }, [burst, dismiss, sPop, to]);

  const spawnBalloon = useCallback((idx: number, word: string, correct: boolean) => {
    const x = lanePx(idx), field = fieldRef.current;
    if (!field) return;
    const col = BCOLS[Math.floor(Math.random() * BCOLS.length)];
    const el = document.createElement("div");
    el.style.cssText = `position:absolute;left:${x - 44}px;top:150px;width:88px;height:152px;z-index:12;pointer-events:none;`;
    const inner = document.createElement("div");
    inner.style.cssText = "position:absolute;inset:0;cursor:pointer;pointer-events:auto;touch-action:manipulation;";
    inner.innerHTML = `<div style="position:absolute;left:5px;top:0;width:78px;height:92px;border-radius:50% 50% 50% 50%/55% 55% 45% 45%;background:radial-gradient(circle at 32% 26%,${col.l},${col.d} 78%);box-shadow:inset -6px -9px 0 rgba(0,0,0,.12);"></div>
      <div style="position:absolute;left:38px;top:89px;width:12px;height:10px;background:${col.d};clip-path:polygon(50% 0,0 100%,100% 100%);"></div>
      <svg style="position:absolute;left:0;top:98px" width="88" height="54" viewBox="0 0 88 54"><path d="M44 0 Q52 18 42 30 Q34 42 46 54" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round"></path></svg>
      <div style="position:absolute;top:31px;left:5px;width:78px;text-align:center;font-family:'Baloo 2',cursive;font-weight:800;font-size:21px;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.28);">${word}</div>`;
    el.appendChild(inner);
    field.appendChild(el);
    const entry: Live = { el, inner, word, correct, col, gone: false };
    const stay = 3400 + Math.random() * 1400;
    if (rm.current) {
      el.style.transform = `translateY(${-40 + Math.random() * 380}px)`;
      el.style.opacity = "0";
      el.style.transition = "opacity .45s";
      requestAnimationFrame(() => { el.style.opacity = "1"; });
      entry.duckT = to(() => dismiss(idx), stay);
    } else {
      entry.fall = el.animate(
        [{ transform: "translateY(-190px)" }, { transform: `translateY(${stageH() - 90}px)` }],
        { duration: stay + 1200, easing: "linear", fill: "forwards" },
      );
      inner.style.animation = "wuSway 2.4s ease-in-out infinite";
      entry.duckT = to(() => dismiss(idx), stay + 900);
    }
    inner.addEventListener("pointerdown", (e) => { e.preventDefault(); tapRef.current(idx); });
    live.current.set(idx, entry);
  }, [dismiss, to]);

  const trySpawn = useCallback(() => {
    if (live.current.size >= 3) return;
    const free: number[] = [];
    for (let i = 0; i < 6; i++) if (!live.current.has(i)) free.push(i);
    if (!free.length) return;
    const idx = free[Math.floor(Math.random() * free.length)];
    const { word, correct } = pickWord();
    if (isCarrot) spawnCarrot(idx, word, correct);
    else spawnBalloon(idx, word, correct);
  }, [isCarrot, pickWord, spawnBalloon, spawnCarrot]);

  const scheduleSpawn = useCallback((ms?: number) => {
    if (!playing.current) return;
    to(() => {
      if (!playing.current) return;
      trySpawn();
      if (Math.random() < 0.3) trySpawn();
      scheduleSpawn(400 + Math.random() * 500);
    }, ms ?? 400 + Math.random() * 500);
  }, [to, trySpawn]);

  const clearField = useCallback(() => {
    if (fieldRef.current) fieldRef.current.innerHTML = "";
    live.current.forEach((e) => { if (e.duckT) clearTimeout(e.duckT); });
    live.current.clear();
  }, []);

  // ---- round lifecycle ----
  const endRound = useCallback(() => {
    if (!playing.current) return;
    playing.current = false;
    roundActive.current = false;
    if (tickI.current) clearInterval(tickI.current);
    [...live.current.keys()].forEach((i) => dismiss(i));
    to(() => {
      const s = scoreRef.current;
      let best = 0;
      try { best = parseInt(localStorage.getItem(bestKey) || "0", 10) || 0; } catch { /* private mode */ }
      const isBest = s > best;
      if (isBest) { try { localStorage.setItem(bestKey, String(s)); } catch { /* private mode */ } }
      setEndBest({ best, isBest });
      setScreen("end");
      sEnd();
      const zero = s === 0 && warmup.celebrateZero;
      say(zero ? warmup.celebrateZero!.audio : warmup.celebrate.audio);
      to(() => {
        if (rm.current) return;
        const c = confettiRef.current;
        if (!c) return;
        c.innerHTML = "";
        const cols = ["#8b5cf6", "#f59e0b", "#10b981", "#f43f5e", "#38bdf8", "#a5b4fc"];
        for (let i = 0; i < 46; i++) {
          const p = document.createElement("div"), w = 6 + Math.random() * 6;
          p.style.cssText = `position:absolute;left:${Math.random() * 100}%;top:-24px;width:${w}px;height:${w * 1.5}px;border-radius:2px;background:${cols[i % 6]};--rx:${Math.random() * 720 - 360}deg;--lx:${Math.random() * 90 - 45}px;animation:wuConfetti ${2.4 + Math.random() * 2}s linear ${Math.random() * 1.4}s both;`;
          c.appendChild(p);
        }
      }, 100);
    }, 700);
  }, [bestKey, dismiss, sEnd, say, to, warmup.celebrate.audio]);
  const endRoundRef = useRef(endRound);
  useEffect(() => { endRoundRef.current = endRound; }, [endRound]);

  const tick = useCallback(() => {
    const rem = endsAt.current - Date.now();
    const t = Math.min(1, Math.max(0, 1 - rem / (playSeconds * 1000)));
    const s = sunRef.current;
    if (s) {
      s.style.left = `${30 + t * (stageW() - 200)}px`;
      s.style.top = `${128 - Math.sin(Math.PI * t) * 58}px`;
    }
    if (rem <= 0) endRoundRef.current();
  }, [playSeconds]);

  const beginRound = useCallback(() => {
    setScreen("play");
    scoreRef.current = 0;
    setScore(0);
    playing.current = true;
    lastWords.current = [];
    callIdx.current = 0;
    endsAt.current = Date.now() + playSeconds * 1000;
    scheduleSpawn(350);
    tickI.current = setInterval(tick, 220);
    tick();
    const firstCall = warmup.waves[0]?.call;
    if (isCall && firstCall) say(firstCall.audio);
  }, [isCall, playSeconds, say, scheduleSpawn, tick, warmup.waves]);

  const pulseCount = useCallback(() => {
    const el = countRef.current;
    if (!el) return;
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "wuPopIn .5s cubic-bezier(.34,1.56,.64,1) both";
  }, []);

  const countdown = useCallback(() => {
    // guard: intro-audio onended AND the Skip button can both land here;
    // only one may start the round (double-entry restarts mid-game)
    if (roundActive.current) return;
    roundActive.current = true;
    if (voice.current) { voice.current.onended = null; voice.current.pause(); }
    clearField();
    setScreen("ready");
    setCountText("3");
    to(() => { tone(659, 0, 0.15, "triangle", 0.08); pulseCount(); }, 20);
    to(() => { setCountText("2"); tone(659, 0, 0.15, "triangle", 0.08); pulseCount(); }, 800);
    to(() => { setCountText("1"); tone(659, 0, 0.15, "triangle", 0.08); pulseCount(); }, 1600);
    to(() => { setCountText("GO!"); tone(784, 0, 0.16, "triangle", 0.09); tone(1046, 0.08, 0.24, "triangle", 0.09); pulseCount(); }, 2400);
    to(beginRound, 3200);
  }, [beginRound, clearField, pulseCount, to, tone]);

  const onPlay = useCallback(() => {
    tone(523, 0, 0.14, "triangle", 0.07);
    // If the browser blocked the start-screen greeting (cold load), chain it
    // here so the child always hears their hello; then the rule, then GO.
    setScreen("intro");
    if (!greetingStarted.current && greetingSrc.current) {
      greetingStarted.current = true;
      say(greetingSrc.current, () => say(warmup.intro.audio, () => countdown()));
    } else {
      say(warmup.intro.audio, () => countdown());
    }
  }, [countdown, say, tone, warmup.intro.audio]);

  const onLesson = useCallback(() => { stopAll(); onComplete?.(); }, [onComplete, stopAll]);
  const onReplay = useCallback(() => { tone(659, 0, 0.12, "triangle", 0.07); countdown(); }, [countdown, tone]);

  const showChrome = screen === "ready" || screen === "play" || screen === "intro";
  const bestLine = endBest
    ? score === 0
      ? "The words will be waiting in the lesson."
      : endBest.isBest
        ? "That's your best catch yet!"
        : endBest.best > 0
          ? `Your best is ${Math.max(endBest.best, score)}. Way to go!`
          : "Way to go!"
    : "";

  // soil mounds for the carrot skin
  const mounds = [0, 1, 2, 3, 4, 5].map((i) => slotPx(i));

  return (
    <main
      ref={stageRef}
      className="fixed inset-0 z-50 select-none overflow-hidden"
      style={{ background: "#312e81", touchAction: "manipulation" }}
    >
      {/* ---------- backdrop ---------- */}
      {isCarrot ? (
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg,#1e1b4b 0%,#312e81 16%,#4338ca 32%,#8b5cf6 44%,#c4b5fd 50%)" }}>
          {[{ l: "8%", t: "9%" }, { l: "28%", t: "4%" }, { l: "55%", t: "11%" }, { l: "78%", t: "6%" }].map((s, i) => (
            <div key={i} className="absolute h-1 w-1 rounded-full bg-white" style={{ left: s.l, top: s.t, animation: `wuTwinkle ${2.4 + i * 0.4}s ease-in-out ${i * 0.4}s infinite` }} />
          ))}
          <div className="absolute rounded-full" style={{ left: "-8%", top: "32%", width: "42%", height: "22%", background: "#22c55e" }} />
          <div className="absolute rounded-full" style={{ left: "28%", top: "34%", width: "46%", height: "22%", background: "#4ade80" }} />
          <div className="absolute rounded-full" style={{ right: "-10%", top: "32%", width: "44%", height: "23%", background: "#16a34a" }} />
          <div className="absolute inset-x-0 bottom-0" style={{ top: "42%", background: "linear-gradient(180deg,#96613b 0%,#7a4b26 45%,#5e3a1c 100%)", borderRadius: "100% 100% 0 0/64px 64px 0 0" }} />
          {mounds.map((m, i) => (
            <div key={i} className="absolute" style={{ left: m.x - 60, top: m.y - 24, width: 120, height: 48, zIndex: m.z }}>
              <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(ellipse at 50% 30%,#ab7350,#7a4b26 72%)", boxShadow: "0 6px 0 rgba(0,0,0,.18)" }} />
              <div className="absolute rounded-full" style={{ left: 24, top: 7, width: 72, height: 19, background: "#452a11" }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg,#0284c7 0%,#38bdf8 32%,#bae6fd 68%,#e0f2fe 100%)" }}>
          {[{ l: "8%", t: "22%" }, { l: "46%", t: "30%" }, { l: "16%", t: "56%" }].map((c, i) => (
            <div key={i} className="absolute rounded-full bg-white" style={{ left: c.l, top: c.t, width: 110 - i * 8, height: 34 - i * 2, opacity: 0.9 - i * 0.1, boxShadow: "26px -16px 0 -6px #fff" }} />
          ))}
          <div className="absolute rounded-full" style={{ left: "-8%", bottom: "-14%", width: "48%", height: "30%", background: "#22c55e" }} />
          <div className="absolute rounded-full" style={{ left: "30%", bottom: "-18%", width: "50%", height: "30%", background: "#4ade80" }} />
          <div className="absolute rounded-full" style={{ right: "-10%", bottom: "-16%", width: "48%", height: "30%", background: "#16a34a" }} />
        </div>
      )}

      {/* mounds sit above rising carrots via z-index; the front lip clips them */}
      {isCarrot && mounds.map((m, i) => (
        <div key={`lip-${i}`} className="pointer-events-none absolute" style={{ left: m.x - 60, top: m.y - 24, width: 120, height: 48, zIndex: m.z + 2 }}>
          <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(ellipse at 50% 30%,#ab7350,#7a4b26 72%)", clipPath: "inset(52% 0 0 0)", boxShadow: "0 6px 0 rgba(0,0,0,.18)" }} />
        </div>
      ))}

      {/* ---------- spawn field ---------- */}
      <div ref={fieldRef} className="pointer-events-none absolute inset-0" />

      {/* ---------- play chrome ---------- */}
      {showChrome && (
        <>
          <div ref={sunRef} className="pointer-events-none absolute z-[6] h-11 w-11 rounded-full" style={{ left: 26, top: 118, background: "radial-gradient(circle at 35% 30%,#fef3c7,#fbbf24 60%,#f59e0b)", boxShadow: "0 0 26px 6px rgba(251,191,36,.55)", transition: "left .25s linear,top .25s linear" }} />
          <div className="pointer-events-none absolute left-1/2 top-4 z-30 -translate-x-1/2 rounded-3xl bg-white/95 px-5 py-3 text-center shadow-lg" style={{ width: "min(560px, calc(100% - 140px))" }}>
            <span className="font-display text-lg font-bold text-zinc-900">{warmup.playPrompt}</span>
          </div>
          <div ref={basketRef} className="pointer-events-none absolute right-5 top-5 z-[32] h-[76px] w-[92px]">
            <div className="absolute inset-x-1 bottom-0 top-[18px] rounded-b-3xl rounded-t-xl border-[3px]" style={{ background: "repeating-linear-gradient(105deg,#d4a373 0 10px,#c08d5a 10px 20px),linear-gradient(180deg,#d4a373,#a16207)", borderColor: "#854d0e", boxShadow: "inset 0 -8px 0 rgba(0,0,0,.16)" }} />
            <div className="absolute inset-x-0 top-3 h-[15px] rounded-lg" style={{ background: "#854d0e", boxShadow: "0 3px 0 rgba(0,0,0,.15)" }} />
            <div className="absolute -top-2 -right-1.5 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-white font-display text-base font-extrabold text-white" style={{ background: "#10b981" }} aria-live="polite">
              {score}
            </div>
          </div>
        </>
      )}

      {/* ---------- intro voice-over veil ---------- */}
      {screen === "intro" && (
        <div className="absolute inset-0 z-[42] flex flex-col items-center justify-center gap-6 px-6" style={{ background: "rgba(30,27,75,.55)" }}>
          <p className="font-display text-2xl font-bold text-white" style={{ textShadow: "0 3px 0 rgba(30,27,75,.4)", animation: "wuFadeUp .4s ease both" }}>
            Welcome{childName ? `, ${childName}` : ""}!
          </p>
          <div className="rounded-[2rem] bg-white px-12 py-8 text-center font-display font-bold text-indigo-900 shadow-2xl" style={{ fontSize: warmup.intro.cardText.length <= 4 ? "5.5rem" : "2.75rem", lineHeight: 1.1, animation: "wuPopIn .4s cubic-bezier(.34,1.56,.64,1) both" }}>
            {warmup.intro.cardText}
          </div>
          <button type="button" onClick={countdown} className="rounded-full bg-white/20 px-5 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-white/30">
            Skip
          </button>
        </div>
      )}

      {/* ---------- ready countdown ---------- */}
      {screen === "ready" && (
        <div className="pointer-events-none absolute inset-0 z-[44] flex items-center justify-center" style={{ background: "rgba(30,27,75,.42)" }}>
          <div ref={countRef} className="font-display text-7xl font-extrabold text-white" style={{ textShadow: "0 6px 0 rgba(30,27,75,.5)", animation: "wuPopIn .5s cubic-bezier(.34,1.56,.64,1) both" }}>
            {countText}
          </div>
        </div>
      )}

      {/* ---------- start screen ---------- */}
      {screen === "start" && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 p-6 text-center sm:gap-6 sm:p-8" style={{ background: "linear-gradient(160deg,#ffe8ed 0%,#ffffff 40%,#f0e8ff 80%,#e0ecff 100%)" }}>
          <div className="text-sm font-extrabold uppercase tracking-[0.24em] text-indigo-700">Warm up</div>
          <h1 className="font-display text-5xl font-extrabold leading-[1.05] sm:text-7xl" style={{ background: "linear-gradient(90deg,#4338ca,#7c3aed)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            {warmup.title}
          </h1>
          <div className="flex items-end gap-6">
            {isCarrot ? <PeekCarrot delay={0} /> : <BobBalloon color="#8b5cf6" light="#c4b5fd" delay={0} />}
            <div className="wu-fast-wave pointer-events-none h-44 w-40 sm:h-60 sm:w-56">
              <BunnyReaction outfitId={outfitId} state="wave" />
            </div>
            {isCarrot ? <PeekCarrot delay={1.8} /> : <BobBalloon color="#f43f5e" light="#fda4af" delay={1.4} />}
          </div>
          <div className="rounded-3xl bg-white px-7 py-4 font-display text-xl font-bold text-zinc-900 shadow-lg">
            {warmup.playPrompt}
          </div>
          <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-5 py-2.5">
            <span className="text-base font-bold text-zinc-600">Warming up for</span>
            <span className="text-base font-extrabold text-indigo-700">{lessonTitle ?? warmup.lessonId}</span>
          </div>
          <button
            type="button"
            onClick={onPlay}
            className="rounded-full bg-indigo-700 px-12 py-4 text-2xl font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-indigo-900 active:scale-[0.96]"
          >
            Let&apos;s play!
          </button>
        </div>
      )}

      {/* ---------- celebration ---------- */}
      {screen === "end" && (
        <div className="absolute inset-0 z-[46] overflow-hidden" style={{ background: "linear-gradient(160deg,#ffe8ed 0%,#ffffff 40%,#f0e8ff 80%,#e0ecff 100%)" }}>
          <div ref={confettiRef} className="pointer-events-none absolute inset-0" />
          <div className="absolute inset-0 flex flex-wrap content-center items-center justify-center gap-4 p-6 sm:gap-12 sm:p-10">
            <div className="pointer-events-none h-48 w-44 sm:h-72 sm:w-64" style={{ animation: "wuFadeUp .5s ease both" }}>
              <BunnyReaction outfitId={outfitId} state="levelup" />
            </div>
            <div className="flex max-w-lg flex-col items-center gap-3 text-center sm:gap-4">
              <CelebrationBasket />
              <h2 className="font-display text-4xl font-extrabold leading-tight sm:text-6xl" style={{ background: "linear-gradient(90deg,#4338ca,#7c3aed)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", animation: "wuFadeUp .5s .14s ease both" }}>
                {score > 0 ? `You caught ${score}!` : "Great warm up!"}
              </h2>
              <p className="text-lg font-bold text-zinc-600" style={{ animation: "wuFadeUp .5s .2s ease both" }}>{bestLine}</p>
              {score > 0 && (
                <p className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-4 py-2 text-sm font-extrabold text-orange-600" style={{ animation: "wuFadeUp .5s .23s ease both" }}>
                  <Carrot className="h-4 w-4" />+{score} carrots
                </p>
              )}
              <div className="flex items-center gap-6" style={{ animation: "wuFadeUp .5s .26s ease both" }}>
                <button type="button" onClick={onLesson} className="rounded-full bg-indigo-700 px-8 py-3.5 text-lg font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-indigo-900 active:scale-[0.96] sm:px-11 sm:py-4 sm:text-xl">
                  On to the lesson!
                </button>
                <button type="button" onClick={onReplay} className="text-base font-extrabold text-indigo-700 underline">
                  Play again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/** Little soil mound with a carrot that peeks up and ducks back down. */
function PeekCarrot({ delay }: { delay: number }) {
  return (
    <div className="relative hidden h-28 w-24 sm:block">
      <div className="absolute inset-x-0 bottom-0 h-[30px] rounded-full" style={{ background: "radial-gradient(ellipse at 50% 30%,#ab7350,#7a4b26 72%)" }} />
      <div className="absolute bottom-3 left-5 right-5 h-3.5 rounded-full" style={{ background: "#452a11" }} />
      <div className="absolute inset-x-0 top-0 bottom-[17px] overflow-hidden">
        <div className="absolute bottom-[-10px] left-5" style={{ animation: `wuPeek 4s ease-in-out ${delay}s infinite` }}>
          <svg width="54" height="69" viewBox="0 0 104 132">
            <ellipse cx="52" cy="14" rx="10" ry="19" fill="#4ade80" />
            <path d="M22 36 Q52 24 82 36 Q88 46 80 66 Q68 104 57 124 Q52 132 47 124 Q36 104 24 66 Q16 46 22 36 Z" fill="#fb923c" stroke="#c2410c" strokeWidth="5" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[30px] rounded-full" style={{ background: "radial-gradient(ellipse at 50% 30%,#ab7350,#7a4b26 72%)", clipPath: "inset(55% 0 0 0)" }} />
    </div>
  );
}

/** The harvest basket from the Claude Design round: woven basket with three
 *  carrots poking out — the celebration's visual payoff. */
function CelebrationBasket() {
  const carrot = (
    <svg width="44" height="56" viewBox="0 0 104 132">
      <ellipse cx="52" cy="14" rx="10" ry="19" fill="#4ade80" />
      <path d="M22 36 Q52 24 82 36 Q88 46 80 66 Q68 104 57 124 Q52 132 47 124 Q36 104 24 66 Q16 46 22 36 Z" fill="#fb923c" stroke="#c2410c" strokeWidth="6" />
    </svg>
  );
  return (
    <div className="relative h-[110px] w-[170px]" style={{ animation: "wuFadeUp .5s .08s ease both" }}>
      <div className="absolute" style={{ left: 16, top: -14, transform: "rotate(-14deg)" }}>{carrot}</div>
      <div className="absolute" style={{ left: 62, top: -24, transform: "scale(1.15)" }}>{carrot}</div>
      <div className="absolute" style={{ left: 112, top: -12, transform: "rotate(15deg)" }}>{carrot}</div>
      <div className="absolute inset-x-2 bottom-0 top-[36px] rounded-b-[38px] rounded-t-2xl border-4" style={{ background: "repeating-linear-gradient(105deg,#d4a373 0 12px,#c08d5a 12px 24px),linear-gradient(180deg,#d4a373,#a16207)", borderColor: "#854d0e", boxShadow: "inset 0 -12px 0 rgba(0,0,0,.16)" }} />
      <div className="absolute inset-x-0 top-[26px] h-[22px] rounded-xl" style={{ background: "#854d0e", boxShadow: "0 4px 0 rgba(0,0,0,.15)" }} />
    </div>
  );
}

/** Sky Catch start-screen flanker: a balloon bobbing on its string, ported
 *  from the Claude Design round. */
function BobBalloon({ color, light, delay }: { color: string; light: string; delay: number }) {
  return (
    <div className="relative hidden h-36 w-24 sm:block" style={{ animation: `wuSway 3.4s ease-in-out ${delay}s infinite` }}>
      <div className="absolute left-2 top-0 h-[92px] w-[78px]" style={{ borderRadius: "50% 50% 50% 50%/55% 55% 45% 45%", background: `radial-gradient(circle at 32% 26%, ${light}, ${color} 78%)`, boxShadow: "inset -6px -9px 0 rgba(0,0,0,.12)" }} />
      <div className="absolute left-[42px] top-[89px] h-[10px] w-3" style={{ background: color, clipPath: "polygon(50% 0,0 100%,100% 100%)" }} />
      <svg className="absolute left-1 top-[98px]" width="88" height="46" viewBox="0 0 88 54">
        <path d="M44 0 Q52 18 42 30 Q34 42 46 54" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
