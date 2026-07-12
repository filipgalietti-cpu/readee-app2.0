"use client";

/**
 * JourneyMap — the Duolingo-style reading path (from the Claude Design
 * "Journey Map"). A winding node trail down a storybook world: unit
 * banners, lesson nodes (done/current/locked/premium), reward chests at
 * unit ends, grade gates, and a final trophy. Purely presentational —
 * the real grade→domain→lesson data + statuses come in as props; this
 * owns the serpentine layout, the SVG road, world gradient, scroll
 * chrome (sticky bar + jump FAB), reveal-on-scroll and the node popover.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Bunny } from "@/app/_components/Bunny/Bunny";
import { Flame, Carrot, Check, Play, Lock, Trophy, ArrowUp } from "lucide-react";

const BALOO = "var(--font-baloo), 'Baloo 2', sans-serif";

export type JStatus = "completed" | "started" | "current" | "locked" | "premium";
export interface JLesson { id: string; title: string; status: JStatus }
export interface JUnit { domKey: string; domainName: string; lessons: JLesson[] }
export interface JGrade { grade: string; badge: string; units: JUnit[] }

export interface JourneyMapProps {
  grades: JGrade[];
  kidName: string;
  streak: number;
  carrots: number;
  equippedOutfitId: string;
  /** Fired when the kid opens a startable lesson (route to /learn). */
  onStart: (lesson: JLesson) => void;
  /** Fired when the kid taps a premium-locked lesson. */
  onPremium: () => void;
}

const ACC: Record<string, { main: string; soft: string; dark: string; grad: string }> = {
  RL: { main: "#4338ca", soft: "#e0e7ff", dark: "#312e81", grad: "linear-gradient(135deg,#6366f1,#4338ca)" },
  RI: { main: "#0284c7", soft: "#e0f2fe", dark: "#075985", grad: "linear-gradient(135deg,#38bdf8,#0284c7)" },
  RF: { main: "#059669", soft: "#d1fae5", dark: "#065f46", grad: "linear-gradient(135deg,#10b981,#059669)" },
  L:  { main: "#7c3aed", soft: "#ede9fe", dark: "#5b21b6", grad: "linear-gradient(135deg,#8b5cf6,#7c3aed)" },
};
const FALLBACK_ACC = ACC.RL;
const FUN_NAME: Record<string, string> = { RL: "Story Treasures", RI: "Fact Finders", RF: "Sound Workshop", L: "Word Magic" };

type Node =
  | { kind: "banner"; x: number; y: number; grad: string; dark: string; eyebrow: string; title: string; count: string; unitNo: number; grade: string; startY: number; accGrad: string }
  | { kind: "lesson"; x: number; y: number; lesson: JLesson; done: boolean; cur: boolean; lock: boolean; prem: boolean; stars: number; num: number; cnt: number; unit: string; size: number; acc: typeof FALLBACK_ACC }
  | { kind: "chest"; x: number; y: number; opened: boolean; unit: string }
  | { kind: "gate"; x: number; y: number; badge: string; title: string; eyebrow: string; sub: string }
  | { kind: "trophy"; x: number; y: number };

function bez(arr: Array<[number, number]>): string {
  if (arr.length < 2) return "";
  let d = `M ${arr[0][0]} ${arr[0][1]}`;
  for (let i = 1; i < arr.length; i++) {
    const [px, py] = arr[i - 1], [qx, qy] = arr[i], dy = qy - py;
    d += ` C ${px} ${py + dy * 0.55}, ${qx} ${qy - dy * 0.55}, ${qx} ${qy}`;
  }
  return d;
}

export default function JourneyMap(props: JourneyMapProps) {
  const colRef = useRef<HTMLDivElement | null>(null);
  const [colW, setColW] = useState(420);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [activeUnit, setActiveUnit] = useState(0);
  const [showSticky, setShowSticky] = useState(false);
  const [fab, setFab] = useState<"none" | "up" | "down">("none");

  const layout = useMemo(() => {
    const W = colW || 420;
    const CX = Math.round(W / 2);
    const AMP = Math.max(96, Math.min(190, Math.round(W / 2) - 96));
    const nodes: Node[] = [];
    const pts: Array<[number, number]> = [];
    const units: Extract<Node, { kind: "banner" }>[] = [];
    const gradeStarts: number[] = [];
    let y = 96, ph = 0, unitNo = 0;
    let totalUnits = 0;
    props.grades.forEach((g) => { totalUnits += g.units.length; });
    let currentPt: [number, number] | null = null;
    let curNode: Extract<Node, { kind: "lesson" }> | null = null;

    props.grades.forEach((g, gi) => {
      gradeStarts.push(y - 50);
      g.units.forEach((u) => {
        unitNo++;
        const a = ACC[u.domKey] ?? FALLBACK_ACC;
        const done = u.lessons.filter((l) => l.status === "completed").length;
        const banner: Extract<Node, { kind: "banner" }> = {
          kind: "banner", x: CX, y, grad: a.grad, dark: a.dark,
          eyebrow: `Unit ${unitNo} of ${totalUnits} · ${u.domainName}`,
          title: FUN_NAME[u.domKey] ?? u.domainName,
          count: `${done}/${u.lessons.length}`,
          unitNo, grade: g.grade, startY: y - 60, accGrad: a.grad,
        };
        nodes.push(banner); units.push(banner); pts.push([CX, y]); y += 118;

        u.lessons.forEach((lesson, k) => {
          ph++;
          const x = CX + Math.round(Math.sin(ph * 1.25) * AMP);
          const isDone = lesson.status === "completed";
          const isCur = lesson.status === "current" || lesson.status === "started";
          const isPrem = lesson.status === "premium";
          const isLock = lesson.status === "locked";
          const stars = isDone ? (k % 3 === 1 ? 2 : 3) : 0;
          const node: Extract<Node, { kind: "lesson" }> = {
            kind: "lesson", x, y, lesson, done: isDone, cur: isCur, lock: isLock, prem: isPrem,
            stars, num: k + 1, cnt: u.lessons.length, unit: banner.title, size: isCur ? 74 : 64, acc: a,
          };
          nodes.push(node);
          if (isCur && !currentPt) { currentPt = [x, y]; curNode = node; }
          pts.push([x, y]); y += 106;
        });

        ph++;
        const cxx = CX + Math.round(Math.sin(ph * 1.25) * AMP);
        nodes.push({ kind: "chest", x: cxx, y, opened: done === u.lessons.length, unit: banner.title });
        pts.push([cxx, y]); y += 114;
      });

      if (gi < props.grades.length - 1) {
        const ng = props.grades[gi + 1];
        const nextStarted = ng.units.some((u) => u.lessons.some((l) => l.status !== "locked" && l.status !== "premium"));
        nodes.push({
          kind: "gate", x: CX, y: y + 6, badge: ng.badge, title: ng.grade, eyebrow: "New chapter",
          sub: nextStarted ? "The gate is open — keep climbing!" : `Finish ${g.grade} to open this gate`,
        });
        pts.push([CX, y + 6]); y += 196;
      }
    });

    nodes.push({ kind: "trophy", x: CX, y: y + 50 });
    pts.push([CX, y + 50]); y += 260;

    const H = y;
    let curPtIdx = 0;
    if (currentPt) curPtIdx = pts.findIndex((p) => p[0] === currentPt![0] && p[1] === currentPt![1]);
    return {
      nodes, pts, units, gradeStarts, H, CX,
      roadD: bez(pts), doneD: curPtIdx > 0 ? bez(pts.slice(0, curPtIdx + 1)) : (currentPt ? "" : bez(pts)),
      currentPt, curNode,
    };
  }, [props.grades, colW]);

  // Resize → column width
  useEffect(() => {
    const onResize = () => {
      const col = colRef.current;
      const w = Math.min(col ? col.offsetWidth : window.innerWidth, 900);
      if (w) setColW(w);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Scroll → sticky unit bar + jump FAB + active unit
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const col = colRef.current;
        if (!col) return;
        const rect = col.getBoundingClientRect();
        let active = 0;
        layout.units.forEach((u, i) => { if (rect.top + u.startY <= 84) active = i; });
        const sticky = window.scrollY > 150;
        let f: "none" | "up" | "down" = "none";
        if (layout.currentPt) {
          const sy = rect.top + layout.currentPt[1];
          if (sy < -40) f = "down";
          else if (sy > window.innerHeight + 40) f = "up";
        }
        setActiveUnit(active); setShowSticky(sticky); setFab(f);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [layout]);

  // Reveal-on-scroll
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-jreveal]");
    const io = new IntersectionObserver((entries) => {
      const upd: Record<number, boolean> = {};
      let any = false;
      entries.forEach((e) => {
        if (e.isIntersecting) { upd[Number(e.target.getAttribute("data-jreveal"))] = true; any = true; io.unobserve(e.target); }
      });
      if (any) setRevealed((s) => ({ ...s, ...upd }));
    }, { rootMargin: "0px 0px -6% 0px" });
    els.forEach((el) => io.observe(el));
    const fallback = setTimeout(() => {
      setRevealed((s) => {
        if (Object.keys(s).length > 0) return s;
        const all: Record<number, boolean> = {};
        els.forEach((el) => { all[Number(el.getAttribute("data-jreveal"))] = true; });
        return all;
      });
    }, 600);
    return () => { io.disconnect(); clearTimeout(fallback); };
  }, [layout.nodes.length]);

  // Close popover on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (openIdx == null) return;
      if (t.closest?.("[data-jnode]") || t.closest?.("[data-jpop]")) return;
      setOpenIdx(null);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [openIdx]);

  // World gradient (storybook: morning → meadow → golden → sunset → night)
  const H = layout.H;
  const gp = layout.gradeStarts.map((gy) => Math.round((gy / H) * 100));
  const worldGradient = gp.length >= 5
    ? `linear-gradient(180deg,#cfe8fd 0%,#dbeafe ${gp[1] * 0.6}%,#fdf3d0 ${gp[1]}%,#d9f2dd ${gp[2]}%,#fde9c4 ${gp[3]}%,#f8d3e2 ${gp[4]}%,#b9c1f2 ${Math.round(gp[4] + (100 - gp[4]) * 0.55)}%,#3b3690 100%)`
    : "linear-gradient(180deg,#cfe8fd,#dbeafe)";

  // Decorations (deterministic — no Math.random at module eval)
  const rand = (i: number, m: number) => (((i * 2654435761) % 1000) / 1000) * m;
  const clouds = Array.from({ length: 7 }, (_, i) => ({
    left: Math.round(rand(i + 2, 80)), top: Math.round(60 + rand(i + 11, H * ((gp[2] ?? 40) / 100))),
    w: 120 + Math.round(rand(i + 5, 120)), h: 34 + Math.round(rand(i + 7, 26)),
    op: (0.5 + rand(i + 3, 0.35)).toFixed(2), blur: 6 + Math.round(rand(i + 9, 8)),
  }));
  const stars = Array.from({ length: 26 }, (_, i) => ({
    left: Math.round(rand(i + 1, 96)) + 2, top: Math.round(H * 0.87 + rand(i + 13, H * 0.12)),
    size: i % 4 === 0 ? 3.5 : 2, dur: (1.6 + rand(i, 2.4)).toFixed(1), delay: rand(i + 6, 2).toFixed(1),
  }));

  const au = layout.units[activeUnit] || layout.units[0];
  const doneAll = layout.nodes.filter((n) => n.kind === "lesson" && n.done).length;
  const totalAll = layout.nodes.filter((n) => n.kind === "lesson").length;

  const jumpToCurrent = () => {
    const col = colRef.current;
    if (!col || !layout.currentPt) return;
    const top = col.getBoundingClientRect().top + window.scrollY + layout.currentPt[1] - window.innerHeight * 0.45;
    window.scrollTo({ top, behavior: "smooth" });
  };

  // Popover
  const on = openIdx != null ? layout.nodes[openIdx] : null;
  const popW = Math.min(372, colW - 24);
  const popLeft = on ? Math.min(Math.max(on.x - popW / 2, 12), colW - popW - 12) : 12;

  const cn = layout.curNode as Extract<Node, { kind: "lesson" }> | null;
  const bunnyX = cn ? (cn.x < 210 ? cn.x + 60 : cn.x - 118) : -300;
  const bunnyY = cn ? cn.y - 30 : -300;

  return (
    <div style={{ position: "relative", minHeight: "100vh", overflowX: "clip" }}>
      <style>{`
        @keyframes rj-bob{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,-7px)}}
        @keyframes rj-halo{0%{transform:translate(-50%,-50%) scale(.9);opacity:.7}70%,100%{transform:translate(-50%,-50%) scale(1.45);opacity:0}}
        @keyframes rj-twinkle{0%,100%{opacity:.9}50%{opacity:.25}}
        @keyframes rj-pop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.08);opacity:1}100%{transform:scale(1);opacity:1}}
        @keyframes rj-glow{0%,100%{box-shadow:0 0 30px 6px rgba(251,191,36,.55)}50%{box-shadow:0 0 55px 16px rgba(251,191,36,.8)}}
        @keyframes rj-bunbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @media (prefers-reduced-motion: reduce){*{animation:none !important}}
      `}</style>

      {/* World backdrop */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, background: worldGradient }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {clouds.map((c, i) => (
          <div key={`c${i}`} style={{ position: "absolute", left: `${c.left}%`, top: c.top, width: c.w, height: c.h, borderRadius: 999, background: `rgba(255,255,255,${c.op})`, filter: `blur(${c.blur}px)` }} />
        ))}
        {stars.map((s, i) => (
          <div key={`s${i}`} style={{ position: "absolute", left: `${s.left}%`, top: s.top, width: s.size, height: s.size, borderRadius: 999, background: "#fff", opacity: 0.8, animation: `rj-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite` }} />
        ))}
      </div>

      {/* Sticky unit bar */}
      <div style={{ position: "fixed", top: 84, left: "50%", zIndex: 40, width: "min(396px,calc(100vw - 24px))", transform: `translateX(-50%) translateY(${showSticky ? 0 : -16}px)`, opacity: showSticky ? 1 : 0, pointerEvents: showSticky ? "auto" : "none", transition: "opacity .25s ease,transform .25s ease" }}>
        <div style={{ borderRadius: 18, padding: "11px 16px", display: "flex", alignItems: "center", gap: 12, background: au ? au.accGrad : "linear-gradient(135deg,#6366f1,#4338ca)", boxShadow: "0 10px 24px -10px rgba(30,27,75,.45),inset 0 0 0 1px rgba(255,255,255,.22)" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.4, color: "rgba(255,255,255,.75)", textTransform: "uppercase" }}>{au ? `${au.grade} · Unit ${au.unitNo} of ${layout.units.length}` : ""}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", fontFamily: BALOO, lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{au ? au.title : ""}</div>
          </div>
          <div style={{ flex: "none", fontSize: 12.5, fontWeight: 800, color: "#fff", background: "rgba(255,255,255,.18)", borderRadius: 999, padding: "5px 11px" }}>{doneAll}/{totalAll}</div>
        </div>
      </div>

      {/* Column */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 900, margin: "0 auto", padding: "0 0 60px" }}>
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "26px 24px 6px", textAlign: "center" }}>
          <div style={{ fontSize: 25, fontWeight: 700, color: "#1e1b4b", fontFamily: BALOO, lineHeight: 1.1, textShadow: "0 1px 0 rgba(255,255,255,.6)" }}>{props.kidName}&apos;s Reading Journey</div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.85)", borderRadius: 999, padding: "5px 12px", boxShadow: "0 2px 8px -2px rgba(30,27,75,.18)" }}>
              <Flame className="h-[15px] w-[15px]" fill="#f97316" stroke="#f97316" strokeWidth={1.5} />
              <span style={{ fontSize: 13, fontWeight: 800, color: "#3f3f46" }}>{props.streak} {props.streak === 1 ? "day" : "days"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.85)", borderRadius: 999, padding: "5px 12px", boxShadow: "0 2px 8px -2px rgba(30,27,75,.18)" }}>
              <Carrot className="h-[15px] w-[15px]" stroke="#ea580c" strokeWidth={2.2} />
              <span style={{ fontSize: 13, fontWeight: 800, color: "#3f3f46" }}>{props.carrots} carrots</span>
            </div>
          </div>
        </div>

        {/* Path canvas */}
        <div ref={colRef} style={{ position: "relative", width: "100%", margin: "0 auto", height: layout.H }}>
          {/* Road */}
          <svg width={colW} height={layout.H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", overflow: "visible" }}>
            <defs>
              <linearGradient id="rj-done" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <path d={layout.roadD} fill="none" stroke="rgba(30,27,75,.16)" strokeWidth="58" strokeLinecap="round" transform="translate(0,5)" />
            <path d={layout.roadD} fill="none" stroke="rgba(255,255,255,.72)" strokeWidth="52" strokeLinecap="round" />
            <path d={layout.roadD} fill="none" stroke="#fff" strokeWidth="44" strokeLinecap="round" opacity=".8" />
            {layout.doneD && <path d={layout.doneD} fill="none" stroke="url(#rj-done)" strokeWidth="44" strokeLinecap="round" opacity=".92" />}
            <path d={layout.roadD} fill="none" stroke="rgba(30,27,75,.28)" strokeWidth="3" strokeDasharray="1 14" strokeLinecap="round" />
          </svg>

          {/* Nodes */}
          {layout.nodes.map((n, i) => {
            const seen = !!revealed[i];
            const z = n.kind === "lesson" && n.cur ? 22 : 10;
            return (
              <div key={i} data-jnode="1" data-jidx={i} style={{ position: "absolute", left: n.x, top: n.y, transform: "translate(-50%,-50%)", zIndex: z }}>
                <div data-jreveal={i} style={{ opacity: seen ? 1 : 0, transform: `translateY(${seen ? 0 : 26}px)`, transition: "opacity .5s ease,transform .5s cubic-bezier(0.34,1.56,0.64,1)" }}>
                  {n.kind === "banner" && (
                    <div style={{ width: Math.min(312, colW - 32), borderRadius: 20, padding: "13px 18px", display: "flex", alignItems: "center", gap: 12, background: n.grad, boxShadow: `0 6px 0 0 ${n.dark},0 16px 30px -12px rgba(30,27,75,.4)` }}>
                      <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                        <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.4, color: "rgba(255,255,255,.75)", textTransform: "uppercase" }}>{n.eyebrow}</div>
                        <div style={{ fontSize: 19, fontWeight: 700, color: "#fff", fontFamily: BALOO, lineHeight: 1.15 }}>{n.title}</div>
                      </div>
                      <div style={{ flex: "none", fontSize: 12.5, fontWeight: 800, color: "#fff", background: "rgba(255,255,255,.18)", borderRadius: 999, padding: "5px 11px" }}>{n.count}</div>
                    </div>
                  )}

                  {n.kind === "lesson" && (
                    <LessonNode n={n} onClick={() => setOpenIdx(openIdx === i ? null : i)} />
                  )}

                  {n.kind === "chest" && (
                    <button onClick={() => setOpenIdx(openIdx === i ? null : i)} style={{ width: 58, height: 58, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: `3px solid ${n.opened ? "#fde68a" : "#f4f4f5"}`, background: n.opened ? "linear-gradient(180deg,#fbbf24,#f59e0b)" : "linear-gradient(180deg,#f4f4f5,#e4e4e7)", boxShadow: n.opened ? "0 5px 0 0 #b45309,0 14px 22px -10px rgba(180,83,9,.55)" : "0 4px 0 0 #d4d4d8", opacity: n.opened ? 1 : 0.9 }}>
                      <ChestIcon color={n.opened ? "#92400e" : "#a1a1aa"} fill={n.opened ? "#fde68a" : "#fafafa"} />
                    </button>
                  )}

                  {n.kind === "gate" && (
                    <div style={{ width: Math.min(300, colW - 32), borderRadius: 24, padding: "16px 18px 14px", display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,.92)", backdropFilter: "blur(4px)", boxShadow: "0 10px 40px -12px rgba(49,46,129,.3),inset 0 0 0 1px rgba(226,232,240,.9)" }}>
                      <div role="img" aria-label={n.title} style={{ width: 58, height: 58, borderRadius: 999, backgroundImage: `url('${n.badge}')`, backgroundSize: "cover", backgroundPosition: "center", boxShadow: "0 4px 12px -3px rgba(30,27,75,.35)", flex: "none" }} />
                      <div style={{ flex: 1, textAlign: "left" }}>
                        <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.4, color: "#4338ca", textTransform: "uppercase" }}>{n.eyebrow}</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "#1e1b4b", fontFamily: BALOO, lineHeight: 1.1 }}>{n.title}</div>
                        <div style={{ fontSize: 12, color: "#71717a", marginTop: 1 }}>{n.sub}</div>
                      </div>
                    </div>
                  )}

                  {n.kind === "trophy" && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 96, height: 96, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg,#fde68a,#f59e0b)", border: "4px solid #fef3c7", animation: "rj-glow 2.6s ease-in-out infinite" }}>
                        <Trophy className="h-11 w-11" stroke="#92400e" strokeWidth={2} />
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", fontFamily: BALOO, textShadow: "0 2px 10px rgba(30,27,75,.6)", whiteSpace: "nowrap" }}>The Grand Story Treasure</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,.78)", marginTop: -8 }}>Finish 4th grade to claim it</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Bunny on the current node */}
          {cn && (
            <div style={{ position: "absolute", left: bunnyX, top: bunnyY, width: 64, height: 70, zIndex: 21, pointerEvents: "none", animation: "rj-bunbob 1.8s ease-in-out infinite" }}>
              <Bunny outfitId={props.equippedOutfitId} />
            </div>
          )}

          {/* Popover */}
          {on && (on.kind === "lesson" || on.kind === "chest") && (
            <NodePopover
              node={on}
              left={popLeft}
              width={popW}
              arrowX={Math.min(Math.max(on.x - popLeft - 9, 18), popW - 36)}
              onStart={() => { if (on.kind === "lesson") props.onStart(on.lesson); setOpenIdx(null); }}
              onPremium={() => { props.onPremium(); setOpenIdx(null); }}
            />
          )}
        </div>
      </div>

      {/* Jump-to-current FAB */}
      <button onClick={jumpToCurrent} style={{ position: "fixed", bottom: 22, left: "50%", transform: `translateX(-50%) translateY(${fab === "none" ? 16 : 0}px)`, opacity: fab === "none" ? 0 : 1, pointerEvents: fab === "none" ? "none" : "auto", zIndex: 50, transition: "opacity .25s ease,transform .25s ease", cursor: "pointer", border: "none", background: "transparent", padding: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#4338ca", color: "#fff", borderRadius: 999, padding: "11px 20px", boxShadow: "0 5px 0 0 #312e81,0 16px 30px -10px rgba(30,27,75,.5)", fontFamily: BALOO, fontWeight: 700, fontSize: 15 }}>
          <ArrowUp className="h-4 w-4" strokeWidth={3} style={{ transform: `rotate(${fab === "down" ? 180 : 0}deg)`, transition: "transform .2s" }} />
          Jump to my lesson
        </div>
      </button>
    </div>
  );
}

function LessonNode({ n, onClick }: { n: Extract<Node, { kind: "lesson" }>; onClick: () => void }) {
  let bg = "linear-gradient(180deg,#f4f4f5,#e4e4e7)", shadow = "0 4px 0 0 #d4d4d8", ring = "#f4f4f5", dim = 0.9;
  if (n.done) { bg = "linear-gradient(180deg,#fbbf24,#f59e0b)"; shadow = "0 5px 0 0 #b45309,0 14px 22px -10px rgba(180,83,9,.55)"; ring = "#fde68a"; dim = 1; }
  else if (n.cur) { bg = "linear-gradient(180deg,#10b981,#059669)"; shadow = "0 5px 0 0 #047857,0 16px 26px -10px rgba(30,27,75,.5)"; ring = "#fff"; dim = 1; }
  else if (n.prem) { bg = "linear-gradient(180deg,#f5f3ff,#ede9fe)"; shadow = "0 4px 0 0 #ddd6fe"; ring = "#ede9fe"; dim = 0.95; }
  return (
    <div style={{ position: "relative", width: n.size, height: n.size, cursor: "pointer" }}>
      {n.cur && (
        <>
          <div style={{ position: "absolute", left: "50%", top: "50%", width: n.size, height: n.size, borderRadius: 999, border: "4px solid #10b981", animation: "rj-halo 1.9s ease-out infinite" }} />
          <div style={{ position: "absolute", left: "50%", bottom: "calc(100% + 14px)", transform: "translate(-50%,0)", animation: "rj-bob 1.6s ease-in-out infinite", background: "#fff", color: "#059669", fontFamily: BALOO, fontWeight: 700, fontSize: 15, letterSpacing: ".06em", padding: "6px 16px", borderRadius: 999, boxShadow: `0 6px 16px -4px rgba(30,27,75,.35),inset 0 0 0 2px ${n.acc.soft}`, whiteSpace: "nowrap" }}>START</div>
        </>
      )}
      <button onClick={onClick} style={{ width: "100%", height: "100%", borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: bg, boxShadow: shadow, border: `3px solid ${ring}`, opacity: dim, cursor: "pointer", padding: 0 }}>
        {n.done && <Check className="h-[26px] w-[26px]" stroke="#fff" strokeWidth={3.4} />}
        {n.cur && <Play className="h-[26px] w-[26px]" fill="#fff" stroke="none" style={{ marginLeft: 3 }} />}
        {n.lock && <Lock className="h-[21px] w-[21px]" stroke="#a1a1aa" strokeWidth={2.4} />}
        {n.prem && <Lock className="h-[21px] w-[21px]" stroke="#7c3aed" strokeWidth={2.4} />}
      </button>
      {n.done && (
        <div style={{ position: "absolute", left: "50%", top: "calc(100% + 5px)", transform: "translate(-50%,0)", display: "flex", alignItems: "center", gap: 3, background: "#fff", borderRadius: 999, padding: "2.5px 9px", boxShadow: "0 2px 8px -2px rgba(180,83,9,.4)" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: "#b45309" }}>x{n.stars}</span>
        </div>
      )}
      {n.prem && (
        <div style={{ position: "absolute", left: "50%", top: "calc(100% + 5px)", transform: "translate(-50%,0)", fontSize: 10, fontWeight: 800, letterSpacing: ".08em", color: "#7c3aed", background: "#ede9fe", borderRadius: 6, padding: "2px 7px" }}>PLUS</div>
      )}
    </div>
  );
}

function NodePopover({ node, left, width, arrowX, onStart, onPremium }: {
  node: Extract<Node, { kind: "lesson" }> | Extract<Node, { kind: "chest" }>;
  left: number; width: number; arrowX: number; onStart: () => void; onPremium: () => void;
}) {
  const isLesson = node.kind === "lesson";
  const top = node.y + (isLesson ? (node.size || 64) / 2 : 29) + 18;
  let title = "", meta = "", stars = 0, showBtn = false, showPlus = false, btnLabel = "", btnColor = "#10b981", btnDark = "#047857";
  if (isLesson) {
    title = node.lesson.title;
    meta = `Lesson ${node.num} of ${node.cnt} · ${node.unit} · ${node.lesson.id}`;
    if (node.done) { stars = node.stars; showBtn = true; btnLabel = "Practice again · +5 carrots"; btnColor = "#f59e0b"; btnDark = "#b45309"; }
    else if (node.cur) { showBtn = true; btnLabel = "Start lesson · +10 carrots"; }
    else if (node.prem) { meta = "This lesson is part of Readee+"; showPlus = true; }
    else { meta = "Finish the lesson above to unlock this one. You've got this!"; }
  } else {
    title = node.opened ? "Chest opened!" : "Reward chest";
    meta = node.opened ? `You earned 20 carrots for finishing ${node.unit}.` : `Finish every lesson in ${node.unit} to open it.`;
  }
  return (
    <div data-jpop="1" style={{ position: "absolute", left, width, top, zIndex: 45, animation: "rj-pop .25s cubic-bezier(0.34,1.56,0.64,1) both" }}>
      <div style={{ position: "absolute", left: arrowX, top: -8, width: 18, height: 18, transform: "rotate(45deg)", background: "#fff", borderRadius: 4 }} />
      <div style={{ position: "relative", background: "#fff", borderRadius: 24, padding: "18px 20px", boxShadow: "0 20px 50px -16px rgba(30,27,75,.45),inset 0 0 0 1px #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <div style={{ flex: 1, fontSize: 19, fontWeight: 700, color: "#1e1b4b", fontFamily: BALOO, lineHeight: 1.2 }}>{title}</div>
          {stars > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 3, flex: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#b45309" }}>x{stars}</span>
            </div>
          )}
        </div>
        <div style={{ fontSize: 13, color: "#71717a", marginTop: 3 }}>{meta}</div>
        {showBtn && (
          <button onClick={onStart} style={{ marginTop: 14, width: "100%", background: btnColor, boxShadow: `0 4px 0 0 ${btnDark}`, borderRadius: 999, fontFamily: BALOO, fontWeight: 700, fontSize: 16, padding: "13px 24px", color: "#fff", border: "none", cursor: "pointer" }}>{btnLabel}</button>
        )}
        {showPlus && (
          <button onClick={onPremium} style={{ marginTop: 14, width: "100%", background: "linear-gradient(90deg,#4338ca,#7c3aed)", borderRadius: 999, fontFamily: BALOO, fontWeight: 700, fontSize: 16, padding: "13px 24px", color: "#fff", border: "none", cursor: "pointer" }}>Unlock with Readee+</button>
        )}
      </div>
    </div>
  );
}

function ChestIcon({ color, fill }: { color: string; fill: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 13 h20 v9 a2 2 0 0 1 -2 2 h-16 a2 2 0 0 1 -2 -2 z" fill={fill} />
      <path d="M4 13 v-2.5 a5 5 0 0 1 5 -5 h10 a5 5 0 0 1 5 5 v2.5" fill={fill} />
      <rect x="12" y="11.5" width="4" height="5.5" rx="1" fill={color} stroke="none" />
    </svg>
  );
}
