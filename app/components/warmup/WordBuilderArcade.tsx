"use client";

/**
 * Word Builder runner — ported from Filip's Claude Design "Word Builder"
 * round (start → ready countdown → 45s free-build round → celebration).
 * Owner spec (after two misreads, in writing): OPEN-ENDED AND TIMED.
 *
 * FREE BUILD (owner spec): no voice calls, no current target. Parts of
 * every not-yet-built word float by (plus decoys); the child snaps ANY
 * two parts onto the bench. An exact ordered match against the build set
 * fuses (compounds are ordered — sun+set is sunset, set+sun is not a
 * word); anything else gently shakes apart and the parts return to the
 * field. Built words stop spawning. The sun-arc timer ends the round.
 *
 * Two skins of one mechanic: "workshop" (word-planks drift by on ropes
 * under a twilight sky) and "pond" (word-fish swim past seaweed).
 * Tapping a part flies it into a bench slot; a real pair fuses into the
 * big word, says it, and sails to the "My words" shelf. Spawning is
 * imperative DOM into a field layer, same as WarmupArcade: dozens of
 * transient nodes per round is the wrong job for React state.
 *
 * No-fail contract (Jennifer's spec, non-negotiable): a wrong pair just
 * shivers out of the slots with no penalty (input locks for half a
 * second so spam is useless, never punished), the score only counts up,
 * and the round always ends in a celebration + carrots.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { WarmupBuild, WarmupDef } from "@/lib/warmup-engine/types";
import { Carrot } from "lucide-react";
import { BunnyReaction } from "@/app/_components/Bunny/Bunny";

type Screen = "start" | "intro" | "ready" | "play" | "end";
export type WordBuilderSkin = "workshop" | "pond";

const GREETINGS = [1, 2, 3, 4].map((n) => `/audio/warmups-v2/shared/greeting-${n}.mp3`);

/** Fish palettes from the Claude Design round, cycled by spawn id. */
const FISHCOLS = [
  { l: "#fda4af", d: "#f43f5e" }, { l: "#c4b5fd", d: "#8b5cf6" }, { l: "#fcd34d", d: "#f59e0b" },
  { l: "#6ee7b7", d: "#10b981" }, { l: "#fdba74", d: "#ea580c" },
];

const PLANK_BG = "repeating-linear-gradient(100deg,#d4a373 0 12px,#c08d5a 12px 24px),linear-gradient(180deg,#d4a373,#a16207)";
const BENCH_BG = "repeating-linear-gradient(100deg,#a16207 0 14px,#854d0e 14px 28px),linear-gradient(180deg,#a16207,#713f12)";

function fishSvg(word: string, c: { l: string; d: string }) {
  return `<div style="position:absolute;inset:6px 10px;animation:wuWiggle 1.6s ease-in-out infinite">
    <svg viewBox="0 0 170 90" width="150" height="88" style="display:block">
      <path d="M8 22 Q34 45 8 68 Q22 45 8 22 Z" fill="${c.d}"/><path d="M6 24 L38 36 L38 54 L6 66 Q24 45 6 24 Z" fill="${c.d}"/>
      <path d="M74 16 Q94 -4 118 14 L96 24 Z" fill="${c.d}"/>
      <ellipse cx="94" cy="48" rx="58" ry="31" fill="${c.d}"/>
      <ellipse cx="94" cy="42" rx="52" ry="22" fill="${c.l}" opacity=".55"/>
      <path d="M88 74 Q76 88 62 80 Q76 76 88 74 Z" fill="${c.l}" opacity=".8"/>
      <path d="M46 30 Q40 48 46 66" fill="none" stroke="${c.l}" stroke-width="3" stroke-linecap="round" opacity=".7"/>
      <circle cx="136" cy="40" r="6" fill="#fff"/><circle cx="138" cy="40" r="3.5" fill="#1e1b4b"/>
      <path d="M146 58 q8 5 14 0" fill="none" stroke="#1e1b4b" stroke-width="2.5" stroke-linecap="round" opacity=".55"/>
    </svg>
    <div style="position:absolute;left:38px;top:28px;width:104px;text-align:center;font-family:'Baloo 2',cursive;font-weight:800;font-size:25px;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.25)">${word}</div></div>`;
}

function plankHtml(word: string, swayDur: number) {
  return `<div style="position:absolute;inset:0;animation:wuHang ${swayDur}s ease-in-out infinite;transform-origin:50% 0">
    <svg width="170" height="16" viewBox="0 0 170 16" style="display:block"><path d="M34 14 Q60 -6 85 12 Q112 -6 136 14" fill="none" stroke="#78716c" stroke-width="3" stroke-linecap="round"/></svg>
    <div style="position:relative;margin-top:-2px;height:64px;background:${PLANK_BG};border:4px solid #854d0e;border-radius:14px;box-shadow:0 12px 30px -10px rgba(30,27,75,.5);display:flex;align-items:center;justify-content:center;font-family:'Baloo 2',cursive;font-weight:800;font-size:27px;color:#fff7ed;text-shadow:0 2px 0 #7a4b26">${word}</div></div>`;
}

type Live = {
  el: HTMLDivElement;
  inner: HTMLDivElement;
  word: string;
  anim?: Animation;
  dieT?: ReturnType<typeof setTimeout>;
  gone: boolean;
};

export default function WordBuilderArcade({
  warmup,
  skin = "workshop",
  lessonTitle,
  outfitId = null,
  childName,
  greetingAudioUrl = null,
  onComplete,
}: {
  warmup: WarmupDef;
  skin?: WordBuilderSkin;
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
  const [countText, setCountText] = useState("1");
  const [slotA, setSlotA] = useState<string | null>(null);
  const [slotB, setSlotB] = useState<string | null>(null);
  const [built, setBuilt] = useState<string[]>([]);
  const [assembling, setAssembling] = useState(false);
  const [builtWord, setBuiltWord] = useState("");
  const [endBest, setEndBest] = useState<{ best: number; isBest: boolean } | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<HTMLDivElement>(null);
  const shelfRef = useRef<HTMLDivElement>(null);
  const slotARef = useRef<HTMLDivElement>(null);
  const slotBRef = useRef<HTMLDivElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);

  const parts = useRef(new Map<number, Live>());
  const order = useRef<number[]>([]);
  const nextId = useRef(1);
  const pending = useRef({ a: false, b: false });
  const locked = useRef(false);
  const slotAVal = useRef<string | null>(null);
  const slotBVal = useRef<string | null>(null);
  const builtRef = useRef<string[]>([]);
  const assemblingRef = useRef(false);
  const roundActive = useRef(false);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const playing = useRef(false);
  const endsAt = useRef(0);
  const tickI = useRef<ReturnType<typeof setInterval> | null>(null);
  const greetingSrc = useRef<string | null>(null);
  const greetingStarted = useRef(false);
  const ac = useRef<AudioContext | null>(null);
  const voice = useRef<HTMLAudioElement | null>(null);
  const rm = useRef(false);

  const isPond = skin === "pond";
  const builds = warmup.builds ?? [];
  const decoyParts = warmup.decoyParts ?? [];
  const playSeconds = warmup.playSeconds ?? 45;
  const bestKey = `warmup-best:${warmup.id}`;
  const gameTitle = isPond ? "Fish Pond" : warmup.title;

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
      if (n >= 1 && n <= 9) {
        const id = order.current[n - 1];
        if (id != null) tapRef.current(id);
      }
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
  const sThunk = useCallback(() => { tone(196, 0, 0.12, "sine", 0.14); tone(523, 0.01, 0.09, "triangle", 0.06); }, [tone]);
  const sUnfuse = useCallback(() => { tone(392, 0, 0.18, "sine", 0.045); tone(330, 0.14, 0.22, "sine", 0.035); }, [tone]);
  const sFuse = useCallback(() => { tone(523, 0, 0.14, "triangle", 0.1); tone(659, 0.07, 0.14, "triangle", 0.1); tone(784, 0.14, 0.16, "triangle", 0.1); tone(1046, 0.22, 0.3, "triangle", 0.11); tone(2093, 0.3, 0.14, "sine", 0.04); }, [tone]);
  const sEnd = useCallback(() => [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.26, "triangle", 0.09)), [tone]);

  const stageW = () => stageRef.current?.offsetWidth || 1280;
  const stageH = () => stageRef.current?.offsetHeight || 800;

  // ---- particles ----
  const burst = useCallback((x: number, y: number, colors: string[], n: number, spread: number) => {
    const field = fieldRef.current;
    if (!field) return;
    for (let i = 0; i < n; i++) {
      const p = document.createElement("div");
      const a = Math.random() * Math.PI * 2, d = spread * (0.5 + Math.random() * 0.5);
      const w = 4 + Math.random() * 6;
      p.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${w}px;border-radius:${Math.random() < 0.5 ? "50%" : "2px"};background:${colors[i % colors.length]};z-index:55;pointer-events:none;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d - 20}px;animation:wuPart ${0.45 + Math.random() * 0.3}s ease-out both;`;
      field.appendChild(p);
      to(() => p.remove(), 800);
    }
  }, [to]);

  // ---- part picking: the free-build pool, rigged to be kind ----
  // Two fairness rules keep the game buildable (owner: "won't introduce
  // matches quick enough"):
  //   1. PARTNER BIAS — a part sitting in a slot makes its completing
  //      partner the heavily favored next spawn (85%).
  //   2. PAIR GUARANTEE — with empty slots, the field always works toward
  //      at least one complete buildable pair being on screen.
  // Decoys only sprinkle in when the kindness rules have nothing to do.
  const pickPart = useCallback((): string | null => {
    const visible = [...parts.current.values()].filter((p) => !p.gone).map((p) => p.word);
    const taken = [slotAVal.current, slotBVal.current].filter((w): w is string => !!w);
    const avail = (w: string) => !visible.includes(w) && !taken.includes(w);
    const unbuilt = builds.filter((b) => !builtRef.current.includes(b.word));

    // Rule 1: complete the slotted part.
    const slotted = taken[0];
    if (slotted) {
      const partners = unbuilt
        .flatMap((b) => (b.parts[0] === slotted ? [b.parts[1]] : b.parts[1] === slotted ? [b.parts[0]] : []))
        .filter(avail);
      const partnerVisible = unbuilt.some(
        (b) => (b.parts[0] === slotted && visible.includes(b.parts[1])) || (b.parts[1] === slotted && visible.includes(b.parts[0])),
      );
      if (partners.length && !partnerVisible && Math.random() < 0.85) {
        return partners[Math.floor(Math.random() * partners.length)];
      }
    }

    // Rule 2: keep a complete pair on screen.
    const pairOnScreen = unbuilt.some((b) => visible.includes(b.parts[0]) && visible.includes(b.parts[1]));
    if (!pairOnScreen) {
      const halves = unbuilt
        .filter((b) => visible.includes(b.parts[0]) !== visible.includes(b.parts[1]))
        .map((b) => (visible.includes(b.parts[0]) ? b.parts[1] : b.parts[0]))
        .filter(avail);
      if (halves.length) return halves[Math.floor(Math.random() * halves.length)];
    }

    const buildPartsPool = unbuilt.flatMap((b) => b.parts).filter(avail);
    const decoys = decoyParts.filter(avail);
    if (buildPartsPool.length && (Math.random() < 0.8 || !decoys.length)) {
      return buildPartsPool[Math.floor(Math.random() * buildPartsPool.length)];
    }
    if (!decoys.length) return null;
    return decoys[Math.floor(Math.random() * decoys.length)];
  }, [builds, decoyParts]);

  // ---- spawn / despawn / tap ----
  const despawn = useCallback((id: number) => {
    const p = parts.current.get(id);
    if (!p) return;
    p.gone = true;
    p.el.remove();
    parts.current.delete(id);
    order.current = order.current.filter((x) => x !== id);
  }, []);

  const trySpawn = useCallback(() => {
    const alive = [...parts.current.values()].filter((p) => !p.gone).length;
    if (alive >= 5) return;
    const word = pickPart();
    if (!word) return;
    const field = fieldRef.current;
    if (!field) return;
    const h = stageH(), lane = [0.24, 0.38, 0.52][Math.floor(Math.random() * 3)];
    const y = h * lane + (Math.random() * 40 - 20);
    const id = nextId.current++;
    const el = document.createElement("div");
    el.style.cssText = `position:absolute;left:0;top:${y}px;z-index:14;pointer-events:none;width:170px;height:${isPond ? 96 : 90}px;`;
    const inner = document.createElement("div");
    inner.style.cssText = "position:absolute;inset:0;cursor:pointer;pointer-events:auto;touch-action:manipulation;";
    inner.innerHTML = isPond
      ? fishSvg(word, FISHCOLS[id % FISHCOLS.length])
      : plankHtml(word, 2.2 + Math.random());
    el.appendChild(inner);
    field.appendChild(el);
    const entry: Live = { el, inner, word, gone: false };
    const w = stageW(), dur = 10000 + Math.random() * 4000;
    if (rm.current) {
      el.style.left = `${60 + Math.random() * (w - 320)}px`;
      el.style.opacity = "0";
      el.style.transition = "opacity .45s";
      requestAnimationFrame(() => { el.style.opacity = "1"; });
      entry.dieT = to(() => despawn(id), 4200);
    } else {
      // Fish swim in from the left; planks ride their rope in from the right.
      const from = isPond ? -220 : w + 40, dest = isPond ? w + 40 : -220;
      entry.anim = el.animate(
        [{ transform: `translateX(${from}px)` }, { transform: `translateX(${dest}px)` }],
        { duration: dur, easing: "linear", fill: "forwards" },
      );
      entry.anim.onfinish = () => despawn(id);
    }
    inner.addEventListener("pointerdown", (e) => { e.preventDefault(); tapRef.current(id); });
    parts.current.set(id, entry);
    order.current.push(id);
  }, [despawn, isPond, pickPart, to]);

  const scheduleSpawn = useCallback((ms: number) => {
    if (!playing.current) return;
    to(() => {
      if (!playing.current) return;
      trySpawn();
      scheduleSpawn(600 + Math.random() * 600);
    }, ms);
  }, [to, trySpawn]);

  const clearField = useCallback(() => {
    if (fieldRef.current) fieldRef.current.innerHTML = "";
    parts.current.forEach((p) => { if (p.dieT) clearTimeout(p.dieT); });
    parts.current.clear();
    order.current = [];
  }, []);

  // ---- the assembly moment ----
  const setSlot = useCallback((slot: "a" | "b", word: string | null) => {
    if (slot === "a") { slotAVal.current = word; setSlotA(word); }
    else { slotBVal.current = word; setSlotB(word); }
  }, []);

  /** A pair that is not a real word pops back apart: both slots shiver
   *  clear and the parts rejoin the pool. No penalty, no red. */
  const unfuse = useCallback(() => {
    locked.current = true;
    sUnfuse();
    [slotARef, slotBRef].forEach((ref) => {
      const el = ref.current;
      if (el && !rm.current) {
        el.style.animation = "none";
        void el.offsetWidth;
        el.style.animation = "wuShiver .45s ease both";
      }
    });
    to(() => {
      setSlot("a", null);
      setSlot("b", null);
      locked.current = false;
    }, rm.current ? 260 : 560);
  }, [setSlot, sUnfuse, to]);

  const endRoundRef = useRef<() => void>(() => {});

  const assemble = useCallback((t: WarmupBuild) => {
    assemblingRef.current = true;
    setAssembling(true);
    setBuiltWord(t.word);
    sFuse();
    // Voice says the built word right as it fuses.
    to(() => say(t.wordAudio), 250);
    to(() => {
      const b = bloomRef.current;
      if (b) {
        b.innerHTML = `<div style="width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(254,243,199,.55) 0%,rgba(254,243,199,.3) 45%,rgba(254,243,199,0) 70%);display:flex;align-items:center;justify-content:center;animation:${rm.current ? "wuPopIn .4s ease both" : "wuBloom .5s cubic-bezier(.34,1.56,.64,1) both"}"><div style="width:150px;height:150px;transform:translateY(-92px);filter:drop-shadow(0 8px 20px rgba(30,27,75,.3))">${t.emblem ?? ""}</div></div>`;
      }
      if (!rm.current) {
        const sr = stageRef.current?.getBoundingClientRect();
        if (sr) burst(sr.width / 2, sr.height * 0.44, ["#fbbf24", "#fde68a", "#ffffff", "#8b5cf6"], 14, 90);
      }
    }, 60);
    to(() => {
      // The finished word sails from the fuse card down to the shelf.
      const stage = stageRef.current, shelf = shelfRef.current;
      if (stage && shelf && !rm.current) {
        const sr = stage.getBoundingClientRect(), hr = shelf.getBoundingClientRect();
        const fly = document.createElement("div");
        fly.style.cssText = `position:absolute;left:${sr.width / 2 - 70}px;top:${sr.height * 0.44 - 30}px;z-index:62;pointer-events:none;`;
        fly.innerHTML = `<div style="background:repeating-linear-gradient(105deg,#d4a373 0 10px,#c08d5a 10px 20px);border:3px solid #854d0e;border-radius:10px;padding:5px 16px;font-family:'Baloo 2',cursive;font-weight:800;font-size:24px;color:#fff7ed;text-shadow:0 1px 0 #7a4b26">${t.word}</div>`;
        stage.appendChild(fly);
        const dx = hr.left + hr.width / 2 - sr.left - sr.width / 2, dy = hr.top + hr.height / 2 - sr.top - sr.height * 0.44;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          fly.style.transition = "transform .45s cubic-bezier(.45,-.15,.6,1), opacity .08s .38s";
          fly.style.transform = `translate(${dx}px,${dy}px) scale(.4)`;
          fly.style.opacity = "0";
        }));
        to(() => fly.remove(), 480);
      }
      builtRef.current = [...builtRef.current, t.word];
      setBuilt(builtRef.current);
      setSlot("a", null);
      setSlot("b", null);
      assemblingRef.current = false;
      setAssembling(false);
      setBuiltWord("");
      // All words built before the sun sets: celebrate early.
      if (builtRef.current.length >= builds.length) { to(() => endRoundRef.current(), 600); return; }
    }, 1350);
  }, [builds.length, burst, say, setSlot, sFuse, to]);

  const catchPart = useCallback((id: number, slot: "a" | "b") => {
    pending.current[slot] = true;
    const p = parts.current.get(id)!;
    p.gone = true;
    if (p.dieT) clearTimeout(p.dieT);
    p.anim?.pause();
    p.inner.style.pointerEvents = "none";
    sThunk();
    const stage = stageRef.current!, slotEl = (slot === "a" ? slotARef : slotBRef).current;
    const r = p.el.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    const fly = document.createElement("div");
    fly.style.cssText = `position:absolute;left:${r.left - sr.left}px;top:${r.top - sr.top}px;z-index:60;pointer-events:none;`;
    fly.innerHTML = `<div style="background:#fff7ed;border-radius:10px;padding:6px 16px;font-family:'Baloo 2',cursive;font-weight:800;font-size:26px;color:#713f12;box-shadow:0 8px 24px rgba(30,27,75,.35)">${p.word}</div>`;
    stage.appendChild(fly);
    p.el.remove();
    parts.current.delete(id);
    order.current = order.current.filter((x) => x !== id);
    const tr = slotEl ? slotEl.getBoundingClientRect() : sr;
    const dx = tr.left + tr.width / 2 - (r.left + r.width / 2), dy = tr.top + tr.height / 2 - (r.top + r.height / 2);
    const done = () => {
      fly.remove();
      pending.current[slot] = false;
      setSlot(slot, p.word);
      if (slotEl && !rm.current) {
        slotEl.style.animation = "none";
        void slotEl.offsetWidth;
        slotEl.style.animation = "wuSlotGlow .55s ease-out both";
      }
      const a = slotAVal.current, b = slotBVal.current;
      if (a && b) {
        const unbuiltMatch = (x: string, y: string) =>
          builds.find((bd) => !builtRef.current.includes(bd.word) && bd.parts[0] === x && bd.parts[1] === y);
        const match = unbuiltMatch(a, b);
        if (match) { assemble(match); return; }
        // Reversed pair (set+sun): the chips playfully hop into the right
        // order, then fuse — teaches the order without ever punishing it.
        const reversed = unbuiltMatch(b, a);
        if (reversed) {
          locked.current = true;
          [slotARef, slotBRef].forEach((ref) => {
            const el = ref.current;
            if (el && !rm.current) {
              el.style.animation = "none";
              void el.offsetWidth;
              el.style.animation = "wuSlotGlow .4s ease-out both";
            }
          });
          to(() => {
            setSlot("a", reversed.parts[0]);
            setSlot("b", reversed.parts[1]);
            locked.current = false;
            assemble(reversed);
          }, rm.current ? 120 : 420);
          return;
        }
        to(() => unfuse(), 380);
      }
    };
    if (rm.current) { fly.style.transition = "opacity .3s"; fly.style.opacity = "0"; to(done, 300); }
    else {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        fly.style.transition = "transform .38s cubic-bezier(.4,-.1,.55,1.15), opacity .06s .33s";
        fly.style.transform = `translate(${dx}px,${dy}px) scale(.92)`;
        fly.style.opacity = "0";
      }));
      to(done, 390);
    }
  }, [assemble, builds, setSlot, sThunk, to, unfuse]);

  const tap = useCallback((id: number) => {
    if (!playing.current || assemblingRef.current || locked.current) return;
    const p = parts.current.get(id);
    if (!p || p.gone) return;
    const busyA = !!slotAVal.current || pending.current.a;
    const busyB = !!slotBVal.current || pending.current.b;
    // Free build: parts land in the first open slot; the bench judges pairs.
    if (!busyA) catchPart(id, "a");
    else if (!busyB) catchPart(id, "b");
  }, [catchPart]);
  const tapRef = useRef(tap);
  useEffect(() => { tapRef.current = tap; }, [tap]);

  // ---- round lifecycle ----
  const endRound = useCallback(() => {
    if (!playing.current) return;
    // Never cut a fuse short: let the assembly land, then celebrate.
    if (assemblingRef.current) { to(() => endRoundRef.current(), 800); return; }
    playing.current = false;
    roundActive.current = false;
    if (tickI.current) clearInterval(tickI.current);
    parts.current.forEach((p) => {
      if (p.gone) return;
      p.gone = true;
      p.inner.style.pointerEvents = "none";
      p.el.style.transition = "opacity .4s";
      p.el.style.opacity = "0";
    });
    to(() => {
      clearField();
      const s = builtRef.current.length;
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
  }, [bestKey, clearField, sEnd, say, to, warmup.celebrate.audio, warmup.celebrateZero]);
  useEffect(() => { endRoundRef.current = endRound; }, [endRound]);

  // Free-build round: the sun-arc clock runs; the round ends when time is
  // up, or early if every word gets built.
  const tick = useCallback(() => {
    const rem = endsAt.current - Date.now();
    const t = Math.min(1, Math.max(0, 1 - rem / (playSeconds * 1000)));
    const sun = sunRef.current;
    if (sun) {
      sun.style.left = `${30 + t * (stageW() - 200)}px`;
      sun.style.top = `${128 - Math.sin(Math.PI * t) * 58}px`;
    }
    if (rem <= 0) endRoundRef.current();
  }, [playSeconds]);

  const beginRound = useCallback(() => {
    setScreen("play");
    builtRef.current = [];
    setBuilt([]);
    setSlot("a", null);
    setSlot("b", null);
    pending.current = { a: false, b: false };
    locked.current = false;
    playing.current = true;
    endsAt.current = Date.now() + playSeconds * 1000;
    tickI.current = setInterval(tick, 220);
    tick();
    scheduleSpawn(400);
  }, [playSeconds, scheduleSpawn, setSlot, tick]);

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

  const score = built.length;
  const showChrome = screen === "ready" || screen === "play" || screen === "intro";
  const bestLine = endBest
    ? score === 0
      ? "The words will be waiting in the lesson."
      : endBest.isBest
        ? "That's your best build yet!"
        : endBest.best > 0
          ? `Your best is ${Math.max(endBest.best, score)}. Great snapping!`
          : score >= 4
            ? "A master word mechanic!"
            : "Great snapping!"
    : "";

  const slotStyle: React.CSSProperties = isPond
    ? { width: 128, height: 62, borderRadius: 14, background: "rgba(224,242,254,.2)", border: "3px dashed rgba(224,242,254,.75)", display: "flex", alignItems: "center", justifyContent: "center" }
    : { width: 128, height: 62, borderRadius: 14, background: "rgba(255,247,237,.16)", border: "3px dashed rgba(255,247,237,.65)", display: "flex", alignItems: "center", justifyContent: "center" };
  const slotChip: React.CSSProperties = isPond
    ? { background: "#f0f9ff", borderRadius: 10, padding: "6px 16px", fontWeight: 800, fontSize: 26, color: "#0369a1", animation: "wuPopIn .25s cubic-bezier(.34,1.56,.64,1) both" }
    : { background: "#fff7ed", borderRadius: 10, padding: "6px 16px", fontWeight: 800, fontSize: 26, color: "#713f12", animation: "wuPopIn .25s cubic-bezier(.34,1.56,.64,1) both" };
  const benchSign: React.CSSProperties = { fontWeight: 800, fontSize: 32, color: isPond ? "#f0f9ff" : "#fff7ed" };
  const firstBuild = builds[0];

  return (
    <main
      ref={stageRef}
      className="fixed inset-0 z-50 select-none overflow-hidden"
      style={{ background: "#312e81", touchAction: "manipulation" }}
    >
      {/* ---------- backdrop ---------- */}
      {!isPond ? (
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg,#1e1b4b 0%,#312e81 14%,#4338ca 34%,#8b5cf6 56%,#c4b5fd 70%)" }}>
          {[{ l: "8%", t: "8%", d: 2.6, dl: 0 }, { l: "30%", t: "4%", d: 3.4, dl: 0.6 }, { l: "58%", t: "9%", d: 3, dl: 1.2 }, { l: "90%", t: "5%", d: 2.9, dl: 0.9 }].map((s, i) => (
            <div key={i} className="absolute h-1 w-1 rounded-full bg-white" style={{ left: s.l, top: s.t, animation: `wuTwinkle ${s.d}s ease-in-out ${s.dl}s infinite` }} />
          ))}
          <div className="absolute rounded-full" style={{ left: "-8%", top: "60%", width: "44%", height: "26%", background: "#22c55e" }} />
          <div className="absolute rounded-full" style={{ left: "28%", top: "63%", width: "48%", height: "26%", background: "#4ade80" }} />
          <div className="absolute rounded-full" style={{ right: "-10%", top: "60%", width: "46%", height: "27%", background: "#16a34a" }} />
          <div className="absolute inset-x-0 bottom-0" style={{ top: "72%", background: "linear-gradient(180deg,#65a30d 0%,#4d7c0f 60%,#3f6212 100%)" }} />
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg,#38bdf8 0%,#0ea5e9 26%,#0369a1 66%,#1e3a8a 100%)" }}>
          {[{ l: "12%", w: 110, h: "64%", o: 0.22, sk: -12 }, { l: "38%", w: 70, h: "56%", o: 0.16, sk: -10 }, { l: "78%", w: 130, h: "60%", o: 0.18, sk: -14 }].map((s, i) => (
            <div key={i} className="absolute" style={{ left: s.l, top: "-4%", width: s.w, height: s.h, background: `linear-gradient(180deg,rgba(255,255,255,${s.o}),rgba(255,255,255,0))`, transform: `skewX(${s.sk}deg)` }} />
          ))}
          {[{ l: "9%", b: "6%", s: 10, d: 9, dl: 0, o: 0.55 }, { l: "22%", b: "3%", s: 6, d: 12, dl: 2, o: 0.45 }, { l: "56%", b: "5%", s: 8, d: 10, dl: 4, o: 0.5 }, { l: "85%", b: "4%", s: 11, d: 11, dl: 1, o: 0.5 }, { l: "64%", b: "2%", s: 6, d: 13, dl: 6, o: 0.4 }].map((b, i) => (
            <div key={i} className="absolute rounded-full" style={{ left: b.l, bottom: b.b, width: b.s, height: b.s, border: `2px solid rgba(255,255,255,${b.o})`, animation: `wuBubbleUp ${b.d}s linear ${b.dl}s infinite` }} />
          ))}
          <div className="absolute inset-x-0 bottom-0" style={{ height: "11%", background: "linear-gradient(180deg,#d4b06a,#b08d4f)", borderRadius: "100% 100% 0 0/40px 40px 0 0" }} />
          <svg className="absolute" style={{ left: "4%", bottom: "8%", animation: "wuWeedSway 4.2s ease-in-out infinite", transformOrigin: "50% 100%" }} width="70" height="150" viewBox="0 0 70 150">
            <path d="M35 150 Q10 110 32 78 Q52 46 28 8" fill="none" stroke="#059669" strokeWidth="10" strokeLinecap="round" />
            <path d="M52 150 Q66 116 50 88 Q38 62 56 34" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
          </svg>
          <svg className="absolute" style={{ right: "6%", bottom: "8%", animation: "wuWeedSway 5s ease-in-out 1.4s infinite", transformOrigin: "50% 100%" }} width="70" height="120" viewBox="0 0 70 120">
            <path d="M30 120 Q54 88 34 58 Q16 30 40 2" fill="none" stroke="#059669" strokeWidth="9" strokeLinecap="round" />
            <path d="M14 120 Q4 92 20 66" fill="none" stroke="#10b981" strokeWidth="7" strokeLinecap="round" />
          </svg>
          <svg className="absolute" style={{ left: "30%", bottom: "7%", animation: "wuWeedSway 4.6s ease-in-out .8s infinite", transformOrigin: "50% 100%" }} width="50" height="90" viewBox="0 0 50 90">
            <path d="M25 90 Q8 62 26 38 Q40 18 22 0" fill="none" stroke="#34d399" strokeWidth="7" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* ---------- spawn field ---------- */}
      <div ref={fieldRef} className="pointer-events-none absolute inset-0" />

      {/* ---------- play chrome ---------- */}
      {showChrome && (
        <>
          {/* rule banner */}
          <div className="absolute left-1/2 top-4 z-30 flex -translate-x-1/2 items-center justify-center rounded-3xl bg-white/95 px-6 py-3 shadow-lg" style={{ width: "min(560px, calc(100% - 150px))" }}>
            <span className="text-center font-display text-lg font-bold leading-tight text-zinc-900">{warmup.playPrompt}</span>
          </div>
          <div ref={sunRef} className="pointer-events-none absolute z-[6] h-11 w-11 rounded-full" style={{ left: 26, top: 118, background: "radial-gradient(circle at 35% 30%,#fef3c7,#fbbf24 60%,#f59e0b)", boxShadow: "0 0 26px 6px rgba(251,191,36,.55)", transition: "left .25s linear,top .25s linear" }} />

          {/* the "My words" shelf */}
          <div ref={shelfRef} className="pointer-events-none absolute bottom-4 left-4 z-[32] min-w-[130px] rounded-2xl bg-white/95 px-4 py-3 shadow-lg">
            <div className="mb-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-indigo-700" aria-live="polite">My words · {score}</div>
            <div className="flex flex-col gap-1.5">
              {built.map((w) => (
                <div key={w} className="rounded-lg px-2.5 py-0.5 font-display text-[15px] font-extrabold" style={{ background: "repeating-linear-gradient(105deg,#d4a373 0 10px,#c08d5a 10px 20px)", border: "2px solid #854d0e", color: "#fff7ed", textShadow: "0 1px 0 #7a4b26", animation: "wuPopIn .4s cubic-bezier(.34,1.56,.64,1) both" }}>
                  {w}
                </div>
              ))}
            </div>
          </div>

          {/* the build bench */}
          <div className="pointer-events-none absolute bottom-6 left-1/2 z-[34] -translate-x-1/2">
            {isPond && (
              <svg width="440" height="60" viewBox="0 0 440 60" className="mx-auto block">
                <path d="M60 58 Q100 6 220 4 Q340 6 380 58" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
                <path d="M128 34 v18 M296 34 v18" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            )}
            <div
              className="relative flex items-center justify-center gap-3"
              style={isPond
                ? { padding: "14px 26px 20px", background: "repeating-linear-gradient(90deg,#a16207 0 26px,#854d0e 26px 30px),linear-gradient(180deg,#a16207,#713f12)", borderRadius: 14, border: "4px solid #713f12", boxShadow: "0 18px 50px -14px rgba(2,54,84,.6)" }
                : { padding: "18px 26px 22px", background: BENCH_BG, borderRadius: "18px 18px 8px 8px", border: "4px solid #713f12", boxShadow: "0 18px 50px -14px rgba(30,27,75,.6)" }}
            >
              <div ref={slotARef} style={slotStyle}>
                {slotA && <div className="font-display" style={slotChip}>{slotA}</div>}
              </div>
              <div className="font-display" style={benchSign}>+</div>
              <div ref={slotBRef} style={slotStyle}>
                {slotB && <div className="font-display" style={slotChip}>{slotB}</div>}
              </div>
              <div className="font-display" style={benchSign}>=</div>
              <div className="flex h-[62px] w-14 items-center justify-center font-display text-[34px] font-extrabold" style={{ color: "#fde68a" }}>?</div>
            </div>
          </div>

          {/* the fuse moment: bloom + the big completed word */}
          {assembling && (
            <div className="pointer-events-none absolute left-1/2 top-[44%] z-50 -translate-x-1/2 -translate-y-1/2 text-center">
              <div ref={bloomRef} className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2" />
              <div className="rounded-3xl bg-white px-10 py-4" style={{ boxShadow: "0 24px 70px -18px rgba(30,27,75,.55), 0 0 0 4px rgba(255,255,255,.6)", animation: "wuPopIn .32s cubic-bezier(.34,1.56,.64,1) .28s both" }}>
                <span className="font-display text-[58px] font-extrabold" style={{ letterSpacing: ".01em", background: "linear-gradient(90deg,#4338ca,#7c3aed)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                  {builtWord}
                </span>
              </div>
            </div>
          )}
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
          <p className="max-w-md px-4 text-center font-display text-3xl font-extrabold leading-snug text-white" style={{ textShadow: "0 3px 0 rgba(30,27,75,.45)", animation: "wuFadeUp .45s .15s ease both" }}>
            {warmup.playPrompt}
          </p>
          <p className="text-lg font-bold text-amber-300" style={{ textShadow: "0 2px 0 rgba(30,27,75,.4)", animation: "wuFadeUp .45s .25s ease both" }}>
            Every word you build earns 5 carrots!
          </p>
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
            {gameTitle}
          </h1>
          <div className="flex items-center gap-6 sm:gap-8">
            {isPond
              ? <FlankFish word={firstBuild?.parts[0] ?? "sun"} col={FISHCOLS[1]} flip />
              : <FlankPlank word={firstBuild?.parts[0] ?? "sun"} />}
            <div className="pointer-events-none h-44 w-40 sm:h-60 sm:w-56">
              <BunnyReaction outfitId={outfitId} state="wave" />
            </div>
            {isPond
              ? <FlankFish word={firstBuild?.parts[1] ?? "set"} col={FISHCOLS[0]} />
              : <FlankPlank word={firstBuild?.parts[1] ?? "set"} />}
          </div>
          <div className="rounded-3xl bg-white px-7 py-4 font-display text-xl font-bold text-zinc-900 shadow-lg">
            {warmup.startPrompt ?? warmup.playPrompt}
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
            Let&apos;s build!
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
              {score > 0 && (
                <div className="flex min-w-[280px] flex-wrap justify-center gap-2.5 rounded-2xl px-5 pb-6 pt-4" style={{ background: BENCH_BG, border: "4px solid #713f12", boxShadow: "0 18px 50px -14px rgba(30,27,75,.45)", animation: "wuFadeUp .5s .08s ease both" }}>
                  {built.map((w) => (
                    <div key={w} className="rounded-lg px-4 py-1.5 font-display text-[22px] font-extrabold" style={{ background: "#fff7ed", color: "#713f12" }}>
                      {w}
                    </div>
                  ))}
                </div>
              )}
              <h2 className="font-display text-4xl font-extrabold leading-tight sm:text-6xl" style={{ background: "linear-gradient(90deg,#4338ca,#7c3aed)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", animation: "wuFadeUp .5s .14s ease both" }}>
                {score > 0 ? `You built ${score} ${score === 1 ? "word" : "words"}!` : "Great warm up!"}
              </h2>
              <p className="text-lg font-bold text-zinc-600" style={{ animation: "wuFadeUp .5s .2s ease both" }}>{bestLine}</p>
              {score > 0 && (
                <p className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-4 py-2 text-sm font-extrabold text-orange-600" style={{ animation: "wuFadeUp .5s .23s ease both" }}>
                  <Carrot className="h-4 w-4" />+{score * 5} carrots
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

/** Start-screen flanker (workshop): a word-plank sitting beside the bunny. */
function FlankPlank({ word }: { word: string }) {
  return (
    <div className="relative hidden h-[66px] w-[130px] sm:block">
      <div
        className="absolute inset-0 flex items-center justify-center rounded-2xl font-display text-[26px] font-extrabold"
        style={{ background: PLANK_BG, border: "4px solid #854d0e", boxShadow: "0 10px 26px -10px rgba(30,27,75,.4)", color: "#fff7ed", textShadow: "0 2px 0 #7a4b26" }}
      >
        {word}
      </div>
    </div>
  );
}

/** Start-screen flanker (pond): a word-fish sitting beside the bunny. */
function FlankFish({ word, col, flip = false }: { word: string; col: { l: string; d: string }; flip?: boolean }) {
  return (
    <div className="relative hidden h-[80px] w-[150px] sm:block">
      <div className="absolute inset-0" style={{ transform: flip ? "scaleX(-1)" : undefined }}>
        <svg viewBox="0 0 170 90" width="150" height="80" className="block">
          <path d="M8 22 Q34 45 8 68 Q22 45 8 22 Z" fill={col.d} /><path d="M6 24 L38 36 L38 54 L6 66 Q24 45 6 24 Z" fill={col.d} />
          <path d="M74 16 Q94 -4 118 14 L96 24 Z" fill={col.d} />
          <ellipse cx="94" cy="48" rx="58" ry="31" fill={col.d} />
          <ellipse cx="94" cy="42" rx="52" ry="22" fill={col.l} opacity=".55" />
          <path d="M88 74 Q76 88 62 80 Q76 76 88 74 Z" fill={col.l} opacity=".8" />
          <circle cx="136" cy="40" r="6" fill="#fff" /><circle cx="138" cy="40" r="3.5" fill="#1e1b4b" />
        </svg>
      </div>
      <div className="absolute left-[23px] top-[25px] w-[104px] text-center font-display text-[22px] font-extrabold text-white" style={{ textShadow: "0 2px 0 rgba(0,0,0,.25)" }}>
        {word}
      </div>
    </div>
  );
}
