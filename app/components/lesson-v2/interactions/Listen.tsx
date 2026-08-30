"use client";

import { useRef, useState } from "react";
import type { ListenDef } from "@/lib/lesson-engine/types";
import { playUrl, speak } from "@/lib/lesson-engine/cues";
import LessonImage from "../LessonImage";

/**
 * `listen` — tap tiles to hear them (word, sound, sentence word). Explore-and-
 * listen: reports solved once everything's been heard, but scenes using it
 * should set gate:"none" — listening never blocks progression.
 */
export default function Listen({
  data,
  onSolved,
}: {
  data: ListenDef;
  onSolved: (meta?: { attempts?: number; correct?: boolean }) => void;
}) {
  const [heard, setHeard] = useState<Set<number>>(new Set());
  const solvedRef = useRef(false);

  function tap(i: number) {
    const item = data.items[i];
    if (item.audio) playUrl(item.audio);
    else speak(item.label);
    // compute next OUTSIDE the setState updater — calling onSolved inside an
    // updater is a setState-during-render on the parent (React error).
    const next = new Set(heard);
    next.add(i);
    setHeard(next);
    if (next.size >= data.items.length && !solvedRef.current) {
      solvedRef.current = true;
      onSolved({ attempts: 1 });
    }
  }

  return (
    <div className="gb-word">
      {data.items.map((item, i) => (
        <button
          key={`${item.label}-${i}`}
          className="gb-item big"
          onClick={() => tap(i)}
          aria-label={`Hear ${item.label}`}
          style={item.image ? { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 } : undefined}
        >
          {item.image && <LessonImage src={item.image} width={130} height={130} />}
          {item.label}
        </button>
      ))}
    </div>
  );
}
