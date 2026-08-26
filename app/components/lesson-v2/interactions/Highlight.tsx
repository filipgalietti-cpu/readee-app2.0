"use client";

import { useMemo, useRef, useState } from "react";
import type { HighlightDef } from "@/lib/lesson-engine/types";
import { playYes, playTryAgain, playPraise, sfxWrong, sfxCorrect } from "@/lib/lesson-engine/cues";

/**
 * `highlight` — find the evidence: tap the word(s) in a sentence/passage that
 * answer the question. Subject-agnostic (text evidence today, "tap the verb"
 * or "tap the larger number" later). Solved when every target is found.
 */
export default function Highlight({
  data,
  onSolved,
  onWrong,
  onItemCorrect,
}: {
  data: HighlightDef;
  onSolved: (meta?: { attempts?: number; correct?: boolean }) => void;
  onWrong?: () => void;
  onItemCorrect?: () => void;
}) {
  const words = useMemo(() => data.text.split(/\s+/), [data.text]);
  const targetSet = useMemo(
    () => new Set(data.targets.map((t) => t.toLowerCase().replace(/[^a-z']/g, ""))),
    [data.targets],
  );
  const [found, setFound] = useState<Set<number>>(new Set());
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const solvedRef = useRef(false);

  function norm(w: string) {
    return w.toLowerCase().replace(/[^a-z']/g, "");
  }

  function tap(i: number) {
    if (solvedRef.current || found.has(i)) return;
    if (targetSet.has(norm(words[i]))) {
      const next = new Set(found);
      next.add(i);
      setFound(next);
      // solved when every distinct target word has at least one found instance
      const foundWords = new Set([...next].map((n) => norm(words[n])));
      if ([...targetSet].every((t) => foundWords.has(t))) {
        solvedRef.current = true;
        playPraise();
        setTimeout(() => onSolved({ attempts: attempts + 1 }), 500);
      } else {
        sfxCorrect();
        window.setTimeout(() => playYes(), 240);
      }
      onItemCorrect?.();
    } else {
      sfxWrong();
      window.setTimeout(() => playTryAgain(), 320);
      onWrong?.();
      setAttempts((a) => a + 1);
      setWrongIdx(i);
      window.setTimeout(() => setWrongIdx(null), 600);
    }
  }

  return (
    <div className="gb-tx">
      <div className="gb-passage">
        {words.map((w, i) => (
          <button
            key={i}
            className={`gb-pword${found.has(i) ? " hit" : ""}${wrongIdx === i ? " miss" : ""}`}
            onClick={() => tap(i)}
            aria-label={`Word ${w}`}
          >
            {w}
          </button>
        ))}
      </div>
      {wrongIdx != null && data.coachWrong && <div className="gb-coach">{data.coachWrong}</div>}
      {solvedRef.current && <div className="gb-hint gb-ok">Evidence found!</div>}
      <style>{`
        .gb-passage { display:flex; flex-wrap:wrap; gap:8px 12px; justify-content:center; max-width:760px; }
        .gb-pword { border:0; background:transparent; padding:6px 10px; border-radius:12px; font-family:'Baloo 2',sans-serif; font-size:44px; font-weight:700; color:#1e1b3a; cursor:pointer; border-bottom:3px solid transparent; transition:all .15s; }
        .gb-pword:hover { background:#eef2ff; }
        .gb-pword.hit { background:#ecfdf5; color:#047857; border-bottom-color:#10b981; }
        .gb-pword.miss { animation:gb-shake .35s; color:#f43f5e; }
      `}</style>
    </div>
  );
}
