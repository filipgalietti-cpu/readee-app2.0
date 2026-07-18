"use client";

/**
 * Reading Journey — cinematic map. Faithful port of the Claude Design
 * "Journey Unlock" (project a205aaa2): a winding road of real-lesson nodes,
 * unit banners, treasure chests, grade gates, and a final trophy. When the kid
 * returns from finishing a lesson (justCompletedId), the bunny hops the road
 * with camera-follow, the node flips to done, the road fills, the next lesson
 * unlocks, and chests/gates/trophy open with particles + WebAudio SFX. The 3D
 * chest (three.js) is lazy-loaded on open. Data + navigation + rewards are
 * wired to the real app via props.
 */

import React from "react";
import { Bunny, BunnyReaction } from "@/app/_components/Bunny/Bunny";

export type JStatus = "completed" | "started" | "current" | "locked" | "premium";
export interface JLesson { id: string; title: string; status: JStatus }
export interface JUnit { domKey: string; domainName: string; lessons: JLesson[] }
export interface JGrade { grade: string; badge: string; units: JUnit[] }

export interface JourneyMapProps {
  grades: JGrade[];
  kidName: string;
  streak: number;
  carrots: number;
  equippedOutfitId: string | null;
  onStart: (lesson: JLesson) => void;
  onPremium: () => void;
  /** Set (via ?completed=) when the kid just finished this lesson — plays the
   *  unlock celebration on mount. */
  justCompletedId?: string | null;
  /** Grant real carrots for opening a unit chest (parent persists + credits
   *  the wallet). Returns nothing; fire-and-forget. */
  onChestReward?: (chestId: string, carrots: number) => void;
  /** Grant the end-of-journey trophy reward. */
  onTrophyReward?: (carrots: number) => void;
}

const ACC: Record<string, { grad: string; dark: string }> = {
  RF: { grad: "linear-gradient(135deg,#10b981,#059669)", dark: "#065f46" },
  RL: { grad: "linear-gradient(135deg,#6366f1,#4338ca)", dark: "#312e81" },
  RI: { grad: "linear-gradient(135deg,#38bdf8,#0284c7)", dark: "#075985" },
  L: { grad: "linear-gradient(135deg,#8b5cf6,#7c3aed)", dark: "#5b21b6" },
};
const FALLBACK_ACC = ACC.RL;
const FUN_NAME: Record<string, string> = { RL: "Story Treasures", RI: "Fact Finders", RF: "Sound Workshop", L: "Word Magic" };
const CHEST_CARROTS = 20;
const TROPHY_CARROTS = 50;

type Pt = [number, number];
type BannerN = { kind: "banner"; id: string; x: number; y: number; grad: string; dark: string; eyebrow: string; title: string; lessonIds: string[]; ptIndex: number };
type LessonN = { kind: "lesson"; id: string; title: string; x: number; y: number; num: number; cnt: number; unit: string; ptIndex: number };
type ChestN = { kind: "chest"; id: string; x: number; y: number; unit: string; ptIndex: number };
type GateN = { kind: "gate"; id: string; x: number; y: number; badge: string; title: string; ptIndex: number };
type TrophyN = { kind: "trophy"; x: number; y: number; ptIndex: number };
type AnyNode = BannerN | LessonN | ChestN | GateN | TrophyN;

interface JState {
  statuses: Record<string, JStatus | "completed" | "current" | "locked">;
  stars: Record<string, number>;
  opened: Record<string, boolean>;
  gatesOpen: Record<string, boolean>;
  carrots: number;
  doneDash: string; doneOff: number; doneTrans: string;
  particles: Particle[]; flyers: Flyer[];
  counterPulse: number; bannerPulse: Record<string, number>;
  busy: boolean; soundOn: boolean; finished: boolean;
  chestOverlay: boolean; chestOverlayIn: boolean; chestReward: boolean; chestTitle: string;
  chestChar: boolean; chestRewardText: string; chestHint: boolean; chestHintText: string;
  justCompleted: string | null; justUnlocked: string | null; justChest: string | null;
  chestFlash: string | null; justGate: string | null; nudged: string | null;
}
interface Particle { key: string; x: number; y: number; w: number; h: number; r: number; c: string; dx: number; dy: number; rot: number; dur: number; go: boolean }
interface Flyer { key: string; x: number; y: number; dx: number; dy: number; dur: number; delay: number; go: boolean }

const CARROT_PATH_1 = "M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7z";

export default class JourneyMap extends React.Component<JourneyMapProps, JState> {
  colW = 420; CX = 210; H = 0; total = 0;
  pts: Pt[] = []; nodeAtPt: AnyNode[] = [];
  bannersL: BannerN[] = []; lessonsL: LessonN[] = []; chestsL: ChestN[] = []; gatesL: GateN[] = [];
  trophy: TrophyN = { kind: "trophy", x: 210, y: 0, ptIndex: 0 };
  roadD = ""; cumLen: number[] | null = null;
  bunnyPos: { x: number; y: number } | null = null;
  camOn = false; camCur = 0; camTarget = 0;
  canvasRef = React.createRef<HTMLDivElement>();
  svgRef = React.createRef<SVGSVGElement>();
  bunnyRef = React.createRef<HTMLDivElement>();
  carrotChipRef = React.createRef<HTMLDivElement>();
  chest3dRef = React.createRef<HTMLDivElement>();
  _ac: AudioContext | null = null;
  _chestTap: (() => void) | null = null;
  _onResize = () => { if (!this.state.busy) this.syncLayout(); };
  _timers: number[] = [];

  constructor(props: JourneyMapProps) {
    super(props);
    this.buildLayout(this.colW);
    this.state = this.initialState();
  }

  buildLayout(colW: number) {
    const CX = Math.round(colW / 2);
    const AMP = Math.max(96, Math.min(420, Math.round(colW / 2) - 140));
    const pts: Pt[] = []; const nodeAtPt: AnyNode[] = [];
    const banners: BannerN[] = [], lessons: LessonN[] = [], chests: ChestN[] = [], gates: GateN[] = [];
    let y = 96, ph = 0, unitNo = 0, totalUnits = 0;
    this.props.grades.forEach((g) => { totalUnits += g.units.length; });
    this.props.grades.forEach((g, gi) => {
      g.units.forEach((u) => {
        unitNo++;
        const a = ACC[u.domKey] ?? FALLBACK_ACC;
        const b: BannerN = { kind: "banner", id: "u" + unitNo, x: CX, y, grad: a.grad, dark: a.dark, eyebrow: "Unit " + unitNo + " of " + totalUnits + " · " + u.domainName, title: FUN_NAME[u.domKey] ?? u.domainName, lessonIds: u.lessons.map((l) => l.id), ptIndex: pts.length };
        banners.push(b); nodeAtPt[pts.length] = b; pts.push([CX, y]); y += 118;
        u.lessons.forEach((lesson, k) => {
          ph++;
          const x = CX + Math.round(Math.sin(ph * 1.25) * AMP);
          const node: LessonN = { kind: "lesson", id: lesson.id, title: lesson.title, x, y, num: k + 1, cnt: u.lessons.length, unit: b.title, ptIndex: pts.length };
          lessons.push(node); nodeAtPt[pts.length] = node; pts.push([x, y]); y += 106;
        });
        ph++;
        const cxx = CX + Math.round(Math.sin(ph * 1.25) * AMP);
        const ch: ChestN = { kind: "chest", id: "chest" + unitNo, x: cxx, y, unit: b.title, ptIndex: pts.length };
        chests.push(ch); nodeAtPt[pts.length] = ch; pts.push([cxx, y]); y += 114;
      });
      if (gi < this.props.grades.length - 1) {
        const ng = this.props.grades[gi + 1];
        const gt: GateN = { kind: "gate", id: "gate" + gi, x: CX, y: y + 6, badge: ng.badge, title: ng.grade, ptIndex: pts.length };
        gates.push(gt); nodeAtPt[pts.length] = gt; pts.push([CX, y + 6]); y += 196;
      }
    });
    const trophy: TrophyN = { kind: "trophy", x: CX, y: y + 50, ptIndex: pts.length };
    nodeAtPt[pts.length] = trophy; pts.push([CX, y + 50]); y += 260;
    this.CX = CX; this.pts = pts; this.nodeAtPt = nodeAtPt;
    this.bannersL = banners; this.lessonsL = lessons; this.chestsL = chests; this.gatesL = gates;
    this.trophy = trophy; this.H = y; this.roadD = this.bez(pts);
  }

  initialState(): JState {
    const statuses: JState["statuses"] = {}, stars: Record<string, number> = {}, opened: Record<string, boolean> = {};
    this.props.grades.forEach((g) => g.units.forEach((u) => {
      const allDone = u.lessons.every((l) => l.status === "completed");
      u.lessons.forEach((l, k) => {
        // Map real statuses → the three the map animates with.
        statuses[l.id] = l.status === "completed" ? "completed"
          : (l.status === "current" || l.status === "started") ? "current" : "locked";
        if (l.status === "completed") stars[l.id] = k % 3 === 1 ? 2 : 3;
      });
      opened["chest" + this.unitNoOf(u)] = allDone;
    }));
    return {
      statuses, stars, opened, gatesOpen: {}, carrots: this.props.carrots ?? 0,
      doneDash: "99999 99999", doneOff: 99999, doneTrans: "none",
      particles: [], flyers: [], counterPulse: 0, bannerPulse: {},
      busy: false, soundOn: true, finished: false,
      chestOverlay: false, chestOverlayIn: false, chestReward: false, chestTitle: "",
      chestChar: false, chestRewardText: "", chestHint: false, chestHintText: "",
      justCompleted: null, justUnlocked: null, justChest: null, chestFlash: null, justGate: null, nudged: null,
    };
  }
  // unit index helper (chests keyed by absolute unit number, matching buildLayout)
  private _unitNoCache: Map<JUnit, number> | null = null;
  unitNoOf(u: JUnit): number {
    if (!this._unitNoCache) {
      this._unitNoCache = new Map();
      let n = 0;
      this.props.grades.forEach((g) => g.units.forEach((uu) => { n++; this._unitNoCache!.set(uu, n); }));
    }
    return this._unitNoCache.get(u) ?? 0;
  }

  bez(arr: Pt[]): string {
    if (arr.length < 2) return "";
    let d = "M " + arr[0][0] + " " + arr[0][1];
    for (let i = 1; i < arr.length; i++) {
      const p = arr[i - 1], q = arr[i], dy = q[1] - p[1];
      d += " C " + p[0] + " " + (p[1] + dy * 0.55) + ", " + q[0] + " " + (q[1] - dy * 0.55) + ", " + q[0] + " " + q[1];
    }
    return d;
  }

  componentDidMount() {
    window.addEventListener("resize", this._onResize);
    this.after(60, () => {
      this.syncLayout();
      const cur = this.curLesson();
      if (cur) {
        window.scrollTo(0, Math.max(0, this.canvasTop() + cur.y - window.innerHeight * 0.45));
        this.camCur = window.scrollY;
      }
      // Real trigger: the kid just finished a lesson → play the unlock sequence.
      if (this.props.justCompletedId) this.after(700, () => this.playUnlock(this.props.justCompletedId!));
    });
  }
  componentWillUnmount() { window.removeEventListener("resize", this._onResize); this.camOn = false; this._timers.forEach(clearTimeout); }
  after(ms: number, fn: () => void) { this._timers.push(window.setTimeout(fn, ms)); }
  sleep(ms: number) { return new Promise<void>((r) => this.after(ms, r)); }

  measureRoad() {
    const svg = this.svgRef.current; if (!svg) return;
    const cum = [0];
    for (let i = 1; i < this.pts.length; i++) {
      const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", this.bez(this.pts.slice(0, i + 1)));
      svg.appendChild(p); cum.push((p as SVGPathElement).getTotalLength()); svg.removeChild(p);
    }
    this.cumLen = cum; this.total = cum[cum.length - 1];
  }
  syncLayout() {
    const c = this.canvasRef.current; if (!c) return;
    const w = Math.min(c.offsetWidth || 420, 1320);
    if (w && w !== this.colW) { this.colW = w; this.buildLayout(w); }
    this.forceUpdate();
    this.after(30, () => {
      this.measureRoad();
      if (!this.cumLen) return;
      const cur = this.curLesson();
      const L = cur ? this.cumLen[cur.ptIndex] : this.total;
      this.setState({ doneDash: this.total + " " + this.total, doneOff: this.total - L, doneTrans: "none" });
      if (cur) { this.bunnyPos = this.idlePosFor(cur.x, cur.y); this.placeBunny(this.bunnyPos.x, this.bunnyPos.y, 1, 1, 0); }
    });
  }
  curLesson(): LessonN | undefined { return this.lessonsL.find((l) => this.state.statuses[l.id] === "current"); }
  idlePosFor(x: number, y: number) { return { x: x < this.CX ? x + 44 : x - 140, y: y - 66 }; }
  canvasTop() { const c = this.canvasRef.current; return c ? c.getBoundingClientRect().top + window.scrollY : 0; }
  placeBunny(x: number, y: number, sx: number, sy: number, rot: number) {
    const b = this.bunnyRef.current; if (!b) return;
    b.style.left = x + "px"; b.style.top = y + "px";
    b.style.transform = "scaleX(" + sx + ") scaleY(" + sy + ") rotate(" + rot + "deg)";
    b.style.transformOrigin = "50% 100%";
  }
  intensity() { return 1; }

  /* ── WebAudio SFX ── */
  ac() { if (!this._ac) this._ac = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)(); if (this._ac.state === "suspended") void this._ac.resume(); return this._ac; }
  t(freq: number, o: { at?: number; dur?: number; type?: OscillatorType; to?: number; vol?: number } = {}) {
    if (!this.state.soundOn) return;
    const c = this.ac(), osc = c.createOscillator(), g = c.createGain(), t0 = c.currentTime + (o.at || 0), dur = o.dur || 0.15;
    osc.type = o.type || "sine"; osc.frequency.setValueAtTime(freq, t0);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(o.vol || 0.2, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(c.destination); osc.start(t0); osc.stop(t0 + dur + 0.05);
  }
  nz(dur: number, f0: number, f1: number, vol: number, at?: number) {
    if (!this.state.soundOn) return;
    const c = this.ac(), t0 = c.currentTime + (at || 0);
    const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(); src.buffer = buf;
    const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.1;
    bp.frequency.setValueAtTime(f0, t0); bp.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + dur * 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(bp); bp.connect(g); g.connect(c.destination); src.start(t0); src.stop(t0 + dur + 0.05);
  }
  sPop() { this.t(320, { dur: 0.12, type: "triangle", to: 90, vol: 0.25 }); }
  sDing() { [523.25, 659.25, 783.99].forEach((f, i) => this.t(f, { at: i * 0.085, dur: 0.35, type: "triangle", vol: 0.22 })); this.t(1567.98, { at: 0.3, dur: 0.5, vol: 0.1 }); }
  sWhoosh(d: number) { this.nz(d, 400, 2800, 0.12); this.t(220, { dur: d, to: 640, vol: 0.07 }); }
  sUnlock() { this.t(392, { dur: 0.09, type: "square", vol: 0.1 }); this.t(587.33, { at: 0.09, dur: 0.22, type: "square", vol: 0.1 }); this.t(1174.7, { at: 0.12, dur: 0.32, vol: 0.15 }); this.t(75, { dur: 0.16, to: 45, vol: 0.3 }); }
  sBoing() { this.t(230, { dur: 0.16, to: 430, vol: 0.11 }); }
  sLand() { this.t(140, { dur: 0.09, to: 70, vol: 0.16 }); }
  sCoins(n: number) { for (let i = 0; i < n; i++) { this.t(1900 + ((i * 137) % 420), { at: i * 0.07, dur: 0.09, type: "square", vol: 0.06 }); this.t(2533, { at: i * 0.07 + 0.03, dur: 0.06, type: "square", vol: 0.04 }); } }
  sChest() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.t(f, { at: i * 0.08, dur: 0.32, type: "triangle", vol: 0.2 })); this.nz(0.6, 3000, 6000, 0.06, 0.15); }
  sFanfare() { [392, 493.88, 587.33].forEach((f) => this.t(f, { dur: 0.35, type: "triangle", vol: 0.14 })); [523.25, 659.25, 783.99, 1046.5].forEach((f) => this.t(f, { at: 0.28, dur: 0.85, type: "triangle", vol: 0.15 })); }
  sGate() { [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => this.t(f, { at: i * 0.11, dur: 0.4, type: "triangle", vol: 0.16 })); this.t(1568, { at: 0.6, dur: 0.7, vol: 0.1 }); this.nz(0.7, 2500, 6000, 0.05, 0.35); }
  sTick() { this.t(980, { dur: 0.05, type: "square", vol: 0.05 }); }
  sFinale() {
    [523.25, 587.33, 659.25, 783.99, 880, 1046.5].forEach((f, i) => this.t(f, { at: i * 0.09, dur: 0.22, type: "triangle", vol: 0.14 }));
    [261.63, 329.63, 392, 523.25].forEach((f) => this.t(f, { at: 0.6, dur: 0.5, type: "triangle", vol: 0.13 }));
    [349.23, 440, 523.25, 698.46].forEach((f) => this.t(f, { at: 1.15, dur: 0.5, type: "triangle", vol: 0.13 }));
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f) => this.t(f, { at: 1.7, dur: 1.4, type: "triangle", vol: 0.14 }));
    [2093, 1567.98, 2637, 2093, 3135.96].forEach((f, i) => this.t(f, { at: 1.75 + i * 0.13, dur: 0.35, vol: 0.06 }));
    this.t(98, { at: 0.6, dur: 0.3, to: 60, vol: 0.3 }); this.t(98, { at: 1.15, dur: 0.3, to: 60, vol: 0.3 }); this.t(130, { at: 1.7, dur: 0.5, to: 65, vol: 0.34 });
    this.nz(1.6, 4000, 9000, 0.07, 1.7); this.nz(0.5, 2000, 7000, 0.06, 0.6);
  }

  /* ── Camera ── */
  camStart() { if (this.camOn) return; this.camOn = true; this.camCur = window.scrollY; const loop = () => { if (!this.camOn) return; this.camCur += (this.camTarget - this.camCur) * 0.085; if (Math.abs(this.camTarget - this.camCur) > 1) window.scrollTo(0, this.camCur); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
  camTo(canvasY: number) { this.camTarget = Math.max(0, this.canvasTop() + canvasY - window.innerHeight * 0.45); }
  camStop() { this.camOn = false; }

  /* ── Particles / flyers ── */
  burst(x: number, y: number, n: number, palette: "gold" | "green" | "mix") {
    n = Math.round(n * this.intensity());
    const cols = palette === "gold" ? ["#fbbf24", "#f59e0b", "#fde68a", "#fff7ed"] : palette === "green" ? ["#10b981", "#34d399", "#a7f3d0", "#fff"] : ["#6366f1", "#8b5cf6", "#f59e0b", "#10b981", "#38bdf8", "#f43f5e"];
    const arr: Particle[] = [];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = 55 + Math.random() * 110;
      arr.push({ key: "p" + performance.now() + "_" + i, x, y, w: 5 + Math.random() * 7, h: 5 + Math.random() * 5, r: Math.random() < 0.5 ? 999 : 2, c: cols[i % cols.length], dx: Math.cos(a) * v, dy: Math.sin(a) * v * 0.8 + 70 + Math.random() * 50, rot: (Math.random() - 0.5) * 540, dur: 750 + Math.random() * 450, go: false });
    }
    this.setState((s) => ({ particles: [...s.particles, ...arr] }));
    this.after(30, () => this.setState((s) => ({ particles: s.particles.map((p) => arr.some((a2) => a2.key === p.key) ? { ...p, go: true } : p) })));
    this.after(1600, () => this.setState((s) => ({ particles: s.particles.filter((p) => !arr.some((a2) => a2.key === p.key)) })));
  }
  flyCarrots(x: number, y: number, n: number, amount: number) {
    const chip = this.carrotChipRef.current, canvas = this.canvasRef.current;
    if (!chip || !canvas) { this.setState((s) => ({ carrots: s.carrots + amount })); return; }
    const cr = chip.getBoundingClientRect(), kr = canvas.getBoundingClientRect();
    const tx = cr.left + cr.width / 2 - kr.left, ty = cr.top + cr.height / 2 - kr.top;
    const arr: Flyer[] = [];
    for (let i = 0; i < n; i++) {
      const sx = x + (Math.random() - 0.5) * 44, sy = y + (Math.random() - 0.5) * 30;
      arr.push({ key: "f" + performance.now() + "_" + i, x: sx, y: sy, dx: tx - sx, dy: ty - sy, dur: 680, delay: i * 75, go: false });
    }
    this.setState((s) => ({ flyers: [...s.flyers, ...arr] }));
    this.sCoins(n);
    this.after(30, () => this.setState((s) => ({ flyers: s.flyers.map((f) => arr.some((a2) => a2.key === f.key) ? { ...f, go: true } : f) })));
    this.after(750 + n * 75, () => { this.setState((s) => ({ flyers: s.flyers.filter((f) => !arr.some((a2) => a2.key === f.key)), carrots: s.carrots + amount, counterPulse: s.counterPulse + 1 })); this.sTick(); });
  }

  fillTo(ptIdx: number, dur: number) { if (!this.cumLen) return; this.setState({ doneTrans: "stroke-dashoffset " + dur + "ms ease-in-out", doneOff: this.total - this.cumLen[ptIdx] }); }
  hopBunny(target: { x: number; y: number }, dur: number) {
    return new Promise<void>((res) => {
      const from = this.bunnyPos || target;
      const dist = Math.hypot(target.x - from.x, target.y - from.y);
      const hops = Math.max(1, Math.round(dist / 120));
      const t0 = performance.now(); let lastHop = -1;
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const x = from.x + (target.x - from.x) * e, yb = from.y + (target.y - from.y) * e;
        const hp = (t * hops) % 1, hi = Math.floor(t * hops);
        if (hi !== lastHop && t < 1) { lastHop = hi; this.sBoing(); }
        const arc = Math.sin(Math.PI * hp) * 30;
        const sy = 1 + 0.14 * Math.sin(Math.PI * hp), sx = 1 - 0.07 * Math.sin(Math.PI * hp);
        const lean = (target.x - from.x > 0 ? 1 : -1) * 4 * Math.sin(Math.PI * hp);
        this.placeBunny(x, yb - arc, sx, sy, lean);
        this.camTo(yb + 30);
        if (t < 1) requestAnimationFrame(step);
        else { this.bunnyPos = target; this.placeBunny(target.x, target.y, 1.06, 0.92, 0); this.sLand(); this.after(130, () => this.placeBunny(target.x, target.y, 1, 1, 0)); res(); }
      };
      requestAnimationFrame(step);
    });
  }

  /* ── Unlock sequence (fires when the kid returns from finishing a lesson) ── */
  async playUnlock(completedId: string) {
    if (this.state.busy) return;
    const cur = this.lessonsL.find((l) => l.id === completedId);
    if (!cur) return;
    this.setState({ busy: true });
    this.sPop();
    this.camStart(); this.camTo(cur.y);
    await this.sleep(200);
    this.sDing();
    this.burst(cur.x, cur.y, 26, "mix");
    this.setState((s) => ({ statuses: { ...s.statuses, [cur.id]: "completed" }, stars: { ...s.stars, [cur.id]: 3 }, justCompleted: cur.id }));
    this.flyCarrots(cur.x, cur.y, 5, 10);
    await this.sleep(1050);
    this.setState({ justCompleted: null });
    let i = cur.ptIndex + 1;
    while (i < this.pts.length) {
      const node = this.nodeAtPt[i];
      const idle = node.kind === "lesson" || node.kind === "chest" ? this.idlePosFor(node.x, node.y) : { x: node.x - 132, y: node.y - 20 };
      const from = this.bunnyPos || idle;
      const dist = Math.hypot(idle.x - from.x, idle.y - from.y);
      const segDur = Math.max(450, Math.min(2000, Math.round(dist * 2.6)));
      this.fillTo(i, segDur);
      this.sWhoosh(segDur / 1000);
      await this.hopBunny(idle, segDur + 120);
      if (node.kind === "banner") { this.sTick(); this.pulseBanner(node.id); await this.sleep(300); i++; continue; }
      if (node.kind === "chest") { await this.openChest(node); i++; continue; }
      if (node.kind === "gate") { await this.openGate(node); i++; continue; }
      if (node.kind === "trophy") { await this.finale(); return; }
      // next lesson unlocks → becomes current
      this.sUnlock();
      this.burst(node.x, node.y, 14, "green");
      this.setState((s) => ({ statuses: { ...s.statuses, [node.id]: "current" }, justUnlocked: node.id }));
      await this.sleep(900);
      this.setState({ justUnlocked: null, busy: false });
      this.camStop();
      return;
    }
    this.setState({ busy: false }); this.camStop();
  }
  pulseBanner(id: string) {
    this.setState((s) => ({ bannerPulse: { ...s.bannerPulse, [id]: (s.bannerPulse[id] || 0) + 1 } }));
    this.after(600, () => this.setState((s) => ({ bannerPulse: { ...s.bannerPulse, [id]: 0 } })));
  }
  async openChest(node: ChestN) {
    this.setState({ justChest: node.id });
    this.sTick(); this.after(180, () => this.sTick());
    await this.sleep(520);
    this.setState({ justChest: null, chestOverlay: true, chestTitle: node.unit + " treasure!", chestReward: false, chestChar: false, chestHint: true, chestHintText: "Tap the chest to unlock it!" });
    let sc: { open: () => void; close: () => void; dispose: () => void } | null = null;
    try {
      const mod = await import("./chest3d");
      await this.sleep(60);
      if (this.chest3dRef.current) sc = mod.createChestScene(this.chest3dRef.current);
    } catch (e) { console.warn("3D chest failed, falling back", e); }
    this.setState({ chestOverlayIn: true });
    if (sc) {
      await new Promise<void>((res) => { this._chestTap = res; });
      this._chestTap = null;
      this.setState({ chestHint: false });
      this.sChest(); sc.open();
      await this.sleep(700);
      // Real reward: carrots to the wallet (parent persists + credits).
      this.setState({ chestReward: true, chestRewardText: "+" + CHEST_CARROTS + " carrots!" });
      this.sCoins(5);
      this.props.onChestReward?.(node.id, CHEST_CARROTS);
      await this.sleep(600);
      this.setState({ chestHint: true, chestHintText: "Tap again to keep going!" });
      await new Promise<void>((res) => { this._chestTap = res; });
      this._chestTap = null;
      this.setState({ chestHint: false }); this.sPop();
    } else { this.sChest(); await this.sleep(900); }
    this.setState({ chestOverlayIn: false });
    await this.sleep(380);
    if (sc) sc.dispose();
    this.setState((s) => ({ chestOverlay: false, chestFlash: node.id, opened: { ...s.opened, [node.id]: true } }));
    this.camTo(node.y);
    await this.sleep(350);
    this.burst(node.x, node.y, 32, "gold");
    this.flyCarrots(node.x, node.y, 8, CHEST_CARROTS);
    await this.sleep(1400);
    this.setState({ chestFlash: null, chestChar: false });
  }
  async openGate(node: GateN) {
    this.camTo(node.y);
    this.setState({ justGate: node.id });
    this.sGate();
    await this.sleep(700);
    this.setState((s) => ({ gatesOpen: { ...s.gatesOpen, [node.id]: true } }));
    this.burst(node.x, node.y, 24, "mix");
    this.sFanfare();
    await this.sleep(1100);
    this.setState({ justGate: null });
  }
  async finale() {
    this.camTo(this.trophy.y);
    this.sFinale();
    this.burst(this.trophy.x, this.trophy.y - 30, 40, "gold");
    await this.sleep(600);
    this.burst(this.trophy.x - 90, this.trophy.y + 20, 28, "mix");
    this.burst(this.trophy.x + 90, this.trophy.y - 60, 28, "mix");
    await this.sleep(550);
    this.flyCarrots(this.trophy.x, this.trophy.y, 10, TROPHY_CARROTS);
    this.props.onTrophyReward?.(TROPHY_CARROTS);
    await this.sleep(600);
    this.burst(this.trophy.x, this.trophy.y - 60, 36, "gold");
    await this.sleep(900);
    this.setState({ busy: false, finished: true });
    this.camStop();
  }
  nudge(id: string) {
    this.sTick();
    this.setState({ nudged: id });
    this.after(450, () => this.setState({ nudged: null }));
  }

  render() {
    const s = this.state;
    const H = this.H, CX = this.CX;
    const carrotSvg = (size: number, stroke = "#ea580c") => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d={CARROT_PATH_1} /><path d="M8.64 14l-2.05-2.04" /><path d="M15.34 15l-2.46-2.46" />
        <path d="M22 9s-1.33-2-3.5-2-3.5 2-3.5 2 1.33 2 3.5 2 3.5-2 3.5-2z" /><path d="M15 2s-2 1.33-2 3.5S15 9 15 9s2-1.84 2-3.5C17 3.33 15 2 15 2z" />
      </svg>
    );
    return (
      <div style={{ position: "relative", minHeight: "100vh", overflowX: "clip", fontFamily: "var(--font-nunito), sans-serif" }}>
        <style>{KEYFRAMES}</style>
        <div style={{ position: "absolute", inset: 0, zIndex: 0, background: "linear-gradient(180deg,#cfe8fd 0%,#dbeafe 22%,#fdf3d0 46%,#d9f2dd 66%,#fde9c4 86%,#f8d3e2 100%)" }} />

        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 1320, margin: "0 auto", padding: "0 0 120px" }}>
          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "26px 24px 6px", textAlign: "center" }}>
            <div style={{ fontSize: 25, fontWeight: 700, color: "#1e1b4b", fontFamily: "var(--font-baloo), sans-serif", lineHeight: 1.1 }}>{this.props.kidName}&apos;s Reading Journey</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.85)", borderRadius: 999, padding: "5px 12px", boxShadow: "0 2px 8px -2px rgba(30,27,75,.18)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#f97316" stroke="#f97316" strokeWidth="1.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#3f3f46" }}>{this.props.streak} days</span>
              </div>
              <div ref={this.carrotChipRef} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.85)", borderRadius: 999, padding: "5px 12px", boxShadow: "0 2px 8px -2px rgba(30,27,75,.18)" }}>
                {carrotSvg(15)}
                <span style={{ fontSize: 13, fontWeight: 800, color: "#3f3f46", display: "inline-block", animation: s.counterPulse ? (s.counterPulse % 2 ? "rj-countpop .45s ease-out both" : "rj-countpop2 .45s ease-out both") : "none" }}>{s.carrots} carrots</span>
              </div>
              <button onClick={() => this.setState((x) => ({ soundOn: !x.soundOn }))} title="Sound on/off" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, background: "rgba(255,255,255,.85)", borderRadius: 999, border: "none", cursor: "pointer", boxShadow: "0 2px 8px -2px rgba(30,27,75,.18)", padding: 0 }}>
                {s.soundOn
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="m23 9-6 6" /><path d="m17 9 6 6" /></svg>}
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div ref={this.canvasRef} style={{ position: "relative", width: "100%", maxWidth: 1320, margin: "0 auto", height: H }}>
            <svg ref={this.svgRef} width={this.colW} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", overflow: "visible" }}>
              <defs><linearGradient id="rj-done" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#6366f1" /></linearGradient></defs>
              <path d={this.roadD} fill="none" stroke="rgba(30,27,75,.16)" strokeWidth="58" strokeLinecap="round" transform="translate(0,5)" />
              <path d={this.roadD} fill="none" stroke="rgba(255,255,255,.72)" strokeWidth="52" strokeLinecap="round" />
              <path d={this.roadD} fill="none" stroke="#fff" strokeWidth="44" strokeLinecap="round" opacity=".8" />
              <path d={this.roadD} fill="none" stroke="url(#rj-done)" strokeWidth="44" strokeLinecap="round" opacity=".92" style={{ strokeDasharray: s.doneDash, strokeDashoffset: s.doneOff, transition: s.doneTrans }} />
              <path d={this.roadD} fill="none" stroke="rgba(30,27,75,.28)" strokeWidth="3" strokeDasharray="1 14" strokeLinecap="round" />
            </svg>

            {/* Banners */}
            {this.bannersL.map((b) => {
              const doneN = b.lessonIds.filter((id) => s.statuses[id] === "completed").length;
              const p = s.bannerPulse[b.id] || 0;
              const anim = p ? (p % 2 ? "rj-pop .5s ease-out both" : "rj-pop2 .5s ease-out both") : "none";
              return (
                <div key={b.id} style={{ position: "absolute", left: b.x, top: b.y, transform: "translate(-50%,-50%)", zIndex: 10 }}>
                  <div style={{ width: 312, borderRadius: 20, padding: "13px 18px", display: "flex", alignItems: "center", gap: 12, background: b.grad, boxShadow: `0 6px 0 0 ${b.dark},0 16px 30px -12px rgba(30,27,75,.4)`, animation: anim }}>
                    <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.4, color: "rgba(255,255,255,.75)", textTransform: "uppercase" }}>{b.eyebrow}</div>
                      <div style={{ fontSize: 19, fontWeight: 700, color: "#fff", fontFamily: "var(--font-baloo), sans-serif", lineHeight: 1.15 }}>{b.title}</div>
                    </div>
                    <div style={{ flex: "none", fontSize: 12.5, fontWeight: 800, color: "#fff", background: "rgba(255,255,255,.18)", borderRadius: 999, padding: "5px 11px" }}>{doneN}/{b.lessonIds.length}</div>
                  </div>
                </div>
              );
            })}

            {/* Lesson nodes */}
            {this.lessonsL.map((l) => {
              const st = s.statuses[l.id];
              const done = st === "completed", cur = st === "current";
              const lessonObj = this.findLesson(l.id);
              const prem = lessonObj?.status === "premium";
              let bg = "linear-gradient(180deg,#f4f4f5,#e4e4e7)", shadow = "0 4px 0 0 #d4d4d8", ring = "#f4f4f5", dim = 0.9;
              if (done) { bg = "linear-gradient(180deg,#fbbf24,#f59e0b)"; shadow = "0 5px 0 0 #b45309,0 14px 22px -10px rgba(180,83,9,.55)"; ring = "#fde68a"; dim = 1; }
              else if (cur) { bg = "linear-gradient(180deg,#10b981,#059669)"; shadow = "0 5px 0 0 #047857,0 16px 26px -10px rgba(30,27,75,.5)"; ring = "#fff"; dim = 1; }
              let anim = "none";
              if (s.justCompleted === l.id || s.justUnlocked === l.id) anim = "rj-goldpop .6s cubic-bezier(0.34,1.56,0.64,1) both";
              else if (s.nudged === l.id) anim = "rj-nudge .45s ease-in-out both";
              const size = cur ? 74 : 64, z = cur ? 22 : 10;
              const nStars = s.stars[l.id] || 0;
              const onClick = cur ? () => this.props.onStart({ id: l.id, title: l.title, status: "current" })
                : prem ? () => this.props.onPremium()
                : () => this.nudge(l.id);
              const startAnim = s.justUnlocked === l.id ? "rj-startdrop .5s cubic-bezier(0.34,1.56,0.64,1) both,rj-bob 1.6s ease-in-out .55s infinite" : "rj-bob 1.6s ease-in-out infinite";
              return (
                <div key={l.id} style={{ position: "absolute", left: l.x, top: l.y, transform: "translate(-50%,-50%)", zIndex: z }}>
                  <div style={{ position: "relative", width: size, height: size }}>
                    {cur && <>
                      <div style={{ position: "absolute", left: "50%", top: "50%", width: size, height: size, borderRadius: 999, border: "4px solid #10b981", animation: "rj-halo 1.9s ease-out infinite", pointerEvents: "none" }} />
                      <div onClick={onClick} style={{ position: "absolute", left: "50%", bottom: "calc(100% + 14px)", animation: startAnim, background: "#fff", color: "#059669", fontFamily: "var(--font-baloo), sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: ".06em", padding: "6px 16px", borderRadius: 999, boxShadow: "0 6px 16px -4px rgba(30,27,75,.35),inset 0 0 0 2px #d1fae5", whiteSpace: "nowrap", transform: "translate(-50%,0)", cursor: "pointer" }}>START</div>
                    </>}
                    {s.justUnlocked === l.id && <div style={{ position: "absolute", left: "50%", top: "50%", width: size, height: size, borderRadius: 999, border: "5px solid #34d399", animation: "rj-shock .75s ease-out both", pointerEvents: "none" }} />}
                    <button onClick={onClick} style={{ width: "100%", height: "100%", borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: bg, boxShadow: shadow, border: `3px solid ${ring}`, opacity: dim, cursor: "pointer", padding: 0, animation: anim }}>
                      {done && <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}
                      {cur && <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" stroke="none" style={{ marginLeft: 3 }}><polygon points="6 3 20 12 6 21 6 3" /></svg>}
                      {!done && !cur && (prem
                        ? <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        : <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>)}
                    </button>
                    {done && <div style={{ position: "absolute", left: "50%", top: "calc(100% + 5px)", transform: "translate(-50%,0)", display: "flex", alignItems: "center", gap: 3, background: "#fff", borderRadius: 999, padding: "2.5px 9px", boxShadow: "0 2px 8px -2px rgba(180,83,9,.4)" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: "#b45309" }}>x{nStars}</span>
                    </div>}
                  </div>
                </div>
              );
            })}

            {/* Chests */}
            {this.chestsL.map((c) => {
              const opened = !!s.opened[c.id];
              const anim = s.justChest === c.id ? "rj-chestshake .5s ease-in-out both" : (s.chestFlash === c.id ? "rj-goldpop .6s cubic-bezier(0.34,1.56,0.64,1) both" : "none");
              const iconColor = opened ? "#92400e" : "#a1a1aa", iconFill = opened ? "#fde68a" : "#fafafa";
              return (
                <div key={c.id} style={{ position: "absolute", left: c.x, top: c.y, transform: "translate(-50%,-50%)", zIndex: 10 }}>
                  {s.chestFlash === c.id && <div style={{ position: "absolute", left: "50%", top: "50%", width: 70, height: 70, borderRadius: 999, background: "radial-gradient(circle,rgba(253,230,138,.95),rgba(251,191,36,0) 70%)", animation: "rj-flash .8s ease-out both", pointerEvents: "none" }} />}
                  <div style={{ width: 58, height: 58, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", border: `3px solid ${opened ? "#fde68a" : "#f4f4f5"}`, background: opened ? "linear-gradient(180deg,#fbbf24,#f59e0b)" : "linear-gradient(180deg,#f4f4f5,#e4e4e7)", boxShadow: opened ? "0 5px 0 0 #b45309,0 14px 22px -10px rgba(180,83,9,.55)" : "0 4px 0 0 #d4d4d8", opacity: opened ? 1 : 0.9, animation: anim }}>
                    <svg width="30" height="30" viewBox="0 0 28 28" fill="none" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 13 h20 v9 a2 2 0 0 1 -2 2 h-16 a2 2 0 0 1 -2 -2 z" fill={iconFill} /><path d="M4 13 v-2.5 a5 5 0 0 1 5 -5 h10 a5 5 0 0 1 5 5 v2.5" fill={iconFill} /><rect x="12" y="11.5" width="4" height="5.5" rx="1" fill={iconColor} stroke="none" /></svg>
                  </div>
                </div>
              );
            })}

            {/* Gates */}
            {this.gatesL.map((g) => {
              const open = !!s.gatesOpen[g.id];
              return (
                <div key={g.id} style={{ position: "absolute", left: g.x, top: g.y, transform: "translate(-50%,-50%)", zIndex: 10 }}>
                  <div style={{ width: 300, borderRadius: 24, padding: "16px 18px 14px", display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,.92)", backdropFilter: "blur(4px)", boxShadow: open ? "0 10px 40px -12px rgba(67,56,202,.5),inset 0 0 0 2px #a5b4fc" : "0 10px 40px -12px rgba(49,46,129,.3),inset 0 0 0 1px rgba(226,232,240,.9)", animation: s.justGate === g.id ? "rj-gateopen 1.4s ease-in-out both" : "none" }}>
                    <div style={{ width: 58, height: 58, borderRadius: 999, backgroundImage: `url('${g.badge}')`, backgroundSize: "cover", backgroundPosition: "center", boxShadow: "0 4px 12px -3px rgba(30,27,75,.35)", flex: "none", animation: s.justGate === g.id ? "rj-badgespin .9s cubic-bezier(0.34,1.56,0.64,1) .55s both" : "none" }} />
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.4, color: "#4338ca", textTransform: "uppercase" }}>New chapter</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: "#1e1b4b", fontFamily: "var(--font-baloo), sans-serif", lineHeight: 1.1 }}>{g.title}</div>
                      <div style={{ fontSize: 12, color: "#71717a", marginTop: 1 }}>{open ? "The gate is open — keep climbing!" : "Finish the chapter to open this gate"}</div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Trophy */}
            <div style={{ position: "absolute", left: this.trophy.x, top: this.trophy.y, transform: "translate(-50%,-50%)", zIndex: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ width: 96, height: 96, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg,#fde68a,#f59e0b)", border: "4px solid #fef3c7", animation: "rj-glow 2.6s ease-in-out infinite" }}>
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2z" /></svg>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#1e1b4b", fontFamily: "var(--font-baloo), sans-serif", textShadow: "0 2px 10px rgba(255,255,255,.7)", whiteSpace: "nowrap" }}>The Grand Story Treasure</div>
                <div style={{ fontSize: 13, color: "#52525b", marginTop: -8 }}>Finish the journey to claim it</div>
              </div>
            </div>

            {/* Walking bunny */}
            <div ref={this.bunnyRef} style={{ position: "absolute", left: -300, top: -300, width: 96, height: 105, zIndex: 21, pointerEvents: "none", willChange: "transform" }}>
              <Bunny outfitId={this.props.equippedOutfitId} />
            </div>

            {/* Particles */}
            {s.particles.map((p) => (
              <div key={p.key} style={{ position: "absolute", left: p.x, top: p.y, width: p.w, height: p.h, borderRadius: p.r, background: p.c, transform: `translate(${p.go ? p.dx : 0}px,${p.go ? p.dy : 0}px) rotate(${p.go ? p.rot : 0}deg)`, opacity: p.go ? 0 : 1, transition: `transform ${p.dur}ms cubic-bezier(.15,.6,.35,1),opacity 380ms ease-in ${Math.max(0, p.dur - 380)}ms`, pointerEvents: "none", zIndex: 30 }} />
            ))}
            {/* Carrot flyers */}
            {s.flyers.map((f) => (
              <div key={f.key} style={{ position: "absolute", left: f.x, top: f.y, transform: `translate(${f.go ? f.dx : 0}px,${f.go ? f.dy : 0}px) scale(${f.go ? 0.5 : 1})`, opacity: f.go ? 0.15 : 1, transition: `transform ${f.dur}ms cubic-bezier(.45,.05,.55,.95) ${f.delay}ms,opacity 200ms ease-in ${f.delay + f.dur - 220}ms`, pointerEvents: "none", zIndex: 60 }}>
                {carrotSvg(20)}
              </div>
            ))}
          </div>
        </div>

        {/* Chest overlay */}
        {s.chestOverlay && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(30,27,75,.45)", backdropFilter: "blur(6px)", opacity: s.chestOverlayIn ? 1 : 0, transition: "opacity .4s ease" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${s.chestOverlayIn ? 1 : 0.6})`, transition: "transform .45s cubic-bezier(0.34,1.56,0.64,1)" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#fff", fontFamily: "var(--font-baloo), sans-serif", textShadow: "0 2px 14px rgba(30,27,75,.6)" }}>{s.chestTitle}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#c7d2fe", opacity: s.chestHint ? 1 : 0, transition: "opacity .3s ease" }}>{s.chestHintText}</div>
              <div style={{ position: "relative" }}>
                <div ref={this.chest3dRef} onClick={() => { if (this._chestTap) this._chestTap(); }} style={{ width: "min(640px,92vw)", height: "min(600px,74vh)", cursor: "pointer" }} />
                {s.chestChar && (
                  <div style={{ position: "absolute", left: "50%", bottom: "44%", width: 170, height: 184, pointerEvents: "none", transform: "translateX(-50%)", animation: "rj-bunnyrise .8s cubic-bezier(0.34,1.56,0.64,1) both" }}>
                    <BunnyReaction outfitId={this.props.equippedOutfitId} state="levelup" />
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.92)", borderRadius: 999, padding: "8px 18px", boxShadow: "0 8px 24px -8px rgba(30,27,75,.5)", opacity: s.chestReward ? 1 : 0, transition: "opacity .35s ease" }}>
                {carrotSvg(17)}
                <span style={{ fontSize: 16, fontWeight: 800, color: "#3f3f46", fontFamily: "var(--font-baloo), sans-serif" }}>{s.chestRewardText}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  private _lessonIndex: Map<string, JLesson> | null = null;
  findLesson(id: string): JLesson | undefined {
    if (!this._lessonIndex) {
      this._lessonIndex = new Map();
      this.props.grades.forEach((g) => g.units.forEach((u) => u.lessons.forEach((l) => this._lessonIndex!.set(l.id, l))));
    }
    return this._lessonIndex.get(id);
  }
}

const KEYFRAMES = `
@keyframes rj-bob{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,-7px)}}
@keyframes rj-halo{0%{transform:translate(-50%,-50%) scale(.9);opacity:.7}70%,100%{transform:translate(-50%,-50%) scale(1.45);opacity:0}}
@keyframes rj-glow{0%,100%{box-shadow:0 0 30px 6px rgba(251,191,36,.55)}50%{box-shadow:0 0 55px 16px rgba(251,191,36,.8)}}
@keyframes rj-goldpop{0%{transform:scale(1)}30%{transform:scale(.8)}60%{transform:scale(1.24)}100%{transform:scale(1)}}
@keyframes rj-shock{0%{transform:translate(-50%,-50%) scale(.4);opacity:.95}100%{transform:translate(-50%,-50%) scale(2.8);opacity:0}}
@keyframes rj-startdrop{0%{transform:translate(-50%,-18px);opacity:0}100%{transform:translate(-50%,0);opacity:1}}
@keyframes rj-chestshake{0%,100%{transform:rotate(0)}15%{transform:rotate(-9deg)}30%{transform:rotate(8deg)}45%{transform:rotate(-7deg)}60%{transform:rotate(6deg)}75%{transform:rotate(-3deg)}}
@keyframes rj-flash{0%{transform:translate(-50%,-50%) scale(.3);opacity:.95}100%{transform:translate(-50%,-50%) scale(3.4);opacity:0}}
@keyframes rj-countpop{0%{transform:scale(1)}45%{transform:scale(1.45)}100%{transform:scale(1)}}
@keyframes rj-countpop2{0%{transform:scale(1)}45%{transform:scale(1.45)}100%{transform:scale(1)}}
@keyframes rj-pop{0%{transform:scale(1)}45%{transform:scale(1.07)}100%{transform:scale(1)}}
@keyframes rj-pop2{0%{transform:scale(1)}45%{transform:scale(1.07)}100%{transform:scale(1)}}
@keyframes rj-nudge{0%,100%{transform:rotate(0)}25%{transform:rotate(-7deg)}55%{transform:rotate(6deg)}80%{transform:rotate(-3deg)}}
@keyframes rj-gateopen{0%{transform:scale(1)}35%{transform:scale(1.06)}60%{transform:scale(.98)}100%{transform:scale(1)}}
@keyframes rj-bunnyrise{0%{transform:translateX(-50%) translateY(55%) scale(.3);opacity:0}55%{opacity:1}100%{transform:translateX(-50%) translateY(0) scale(1);opacity:1}}
@keyframes rj-badgespin{0%{transform:scale(.4) rotate(-160deg)}70%{transform:scale(1.15) rotate(12deg)}100%{transform:scale(1) rotate(0)}}
@media (prefers-reduced-motion: reduce){*{animation:none !important}}
`;
