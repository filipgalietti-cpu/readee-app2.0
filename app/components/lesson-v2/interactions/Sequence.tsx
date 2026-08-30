"use client";

import { useMemo, useRef, useState } from "react";
import type { SequenceDef } from "@/lib/lesson-engine/types";
import { playYes, playTryAgain, playUrl, playPraise, sfxWrong, sfxCorrect } from "@/lib/lesson-engine/cues";
import { seededShuffle } from "@/lib/lesson-engine/shuffle";
import LessonImage from "../LessonImage";

/**
 * `sequence` — put things in order (story events, steps, sentence words).
 * Tap items in order; immediate feedback per pick. Subject-agnostic.
 * Display order is a deterministic scramble (no Math.random → stable SSR).
 */
export default function Sequence({
  data,
  onSolved,
  onWrong,
  onItemCorrect,
}: {
  data: SequenceDef;
  onSolved: (meta?: { attempts?: number; correct?: boolean }) => void;
  onWrong?: () => void;
  onItemCorrect?: () => void;
}) {
  const [salt] = useState(() => Math.random().toString(36).slice(2));
  // Engine-shuffled pool (per-playthrough salt); nudged if it lands in solved order.
  const display = useMemo(() => {
    const seedBase = data.order.join("|") + salt;
    let out = seededShuffle(data.items, seedBase);
    if (out.map((it) => it.id).join("|") === data.order.join("|")) out = seededShuffle(data.items, seedBase + "x");
    if (out.map((it) => it.id).join("|") === data.order.join("|")) out = [...out].reverse();
    return out;
  }, [data.items, data.order]);

  const [placedCount, setPlacedCount] = useState(0);
  const [placedIds, setPlacedIds] = useState<string[]>([]);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const solvedRef = useRef(false);

  function tap(id: string) {
    if (solvedRef.current || placedIds.includes(id)) return;
    const item = data.items.find((it) => it.id === id);
    if (data.order[placedCount] === id) {
      const nextCount = placedCount + 1;
      const isFinal = nextCount >= data.order.length;
      sfxCorrect(); // chime on every correct
      // Word first, then feedback, chained (never overlapping).
      if (item?.audio) window.setTimeout(() => playUrl(item.audio as string, () => (isFinal ? playPraise() : playYes())), 240);
      else if (isFinal) playPraise();
      else playYes();
      onItemCorrect?.();
      setPlacedIds((p) => [...p, id]);
      setPlacedCount(nextCount);
      if (isFinal) {
        solvedRef.current = true;
        setTimeout(() => onSolved({ attempts: attempts + 1 }), 500);
      }
    } else {
      sfxWrong();
      if (item?.audio) window.setTimeout(() => playUrl(item.audio as string, () => playTryAgain()), 320);
      else window.setTimeout(() => playTryAgain(), 320);
      onWrong?.();
      setAttempts((a) => a + 1);
      setWrongId(id);
      window.setTimeout(() => setWrongId(null), 600);
    }
  }

  return (
    <div className="gb-tx">
      {/* slots */}
      <div className="gb-seq-slots">
        {data.order.map((id, i) => {
          const filled = i < placedCount ? data.items.find((it) => it.id === data.order[i]) : null;
          return (
            <div key={i} className={`gb-seq-slot${filled ? " filled" : ""}`}>
              <span className="gb-seq-n">{i + 1}</span>
              {filled ? (
                <>
                  {filled.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={filled.image} alt="" style={{ height: 84, width: 84, objectFit: "contain" }} />
                  )}
                  <span>{filled.label}</span>
                </>
              ) : (
                <span style={{ color: "#c4c4d4" }}>?</span>
              )}
            </div>
          );
        })}
      </div>

      {/* pool */}
      <div className="gb-pool">
        {display.map((it) =>
          placedIds.includes(it.id) ? null : (
            <button
              key={it.id}
              className={`gb-item${wrongId === it.id ? " shake" : ""}`}
              onClick={() => tap(it.id)}
              aria-label={it.label}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
            >
              {it.image && <LessonImage src={it.image} width={110} height={110} />}
              {it.label}
            </button>
          ),
        )}
      </div>

      {wrongId && data.coachWrong && <div className="gb-coach">{data.coachWrong}</div>}
      {solvedRef.current && <div className="gb-hint gb-ok">Perfect order!</div>}
      <style>{`
        .gb-seq-slots { display:flex; gap:22px; justify-content:center; }
        .gb-seq-slot { position:relative; min-width:170px; min-height:185px; border:3px dashed #cbcbe0; border-radius:20px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; padding:14px; font-family:'Baloo 2',sans-serif; font-weight:800; font-size:22px; color:#1e1b3a; }
        .gb-seq-slot.filled { border-style:solid; border-color:#10b981; background:#ecfdf5; color:#047857; }
        .gb-seq-n { position:absolute; top:-14px; left:-10px; width:32px; height:32px; border-radius:999px; background:#6366f1; color:#fff; font-size:16px; display:grid; place-items:center; box-shadow:0 2px 8px rgba(79,70,229,.4); }
      `}</style>
    </div>
  );
}
