"use client";

import { useEffect, useRef, useState } from "react";
import type { ReadAlongDef, WordTiming } from "@/lib/lesson-engine/types";
import { stopNarration, alignTextToTimings } from "@/lib/lesson-engine/cues";

/**
 * `read-along` — karaoke sentence: the words light up as the teacher reads them
 * (Whisper word-timestamps + an rAF clock). This is the core Readee reading
 * mechanic for K — hear the sentence WHILE seeing each word. Solved after one
 * full read-through; replay any time.
 */
export default function ReadAlong({
  data,
  words,
  cue,
  onSolved,
}: {
  data: ReadAlongDef;
  /** Whisper timings for the sentence clip (runner passes `<sceneId>-sentence`). */
  words?: WordTiming[];
  /** True when the scene's intro narration has finished — auto-start reading. */
  cue?: boolean;
  onSolved: (meta?: { attempts?: number; correct?: boolean }) => void;
}) {
  const textWords = data.text.split(/\s+/);
  const [current, setCurrent] = useState(-1); // index being spoken
  const [played, setPlayed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef(0);
  const solvedRef = useRef(false);

  function stop() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    cancelAnimationFrame(rafRef.current);
    setPlaying(false);
  }

  function play() {
    stop();
    stopNarration(); // one voice at a time, always
    const el = new Audio(data.audio);
    audioRef.current = el;

    // EXACT sync to the TTS: char-timeline alignment (robust to Whisper
    // splitting/merging words — "Milo" → "My low"). Proven in Stories karaoke.
    const starts = alignTextToTimings(data.text, words);

    const tick = () => {
      if (!audioRef.current || audioRef.current !== el) return;
      const t = el.currentTime;
      let idx = -1;
      for (let i = 0; i < starts.length; i++) {
        if (t >= starts[i]) idx = i;
      }
      setCurrent(idx);
      rafRef.current = requestAnimationFrame(tick);
    };

    el.addEventListener("ended", () => {
      cancelAnimationFrame(rafRef.current);
      setCurrent(textWords.length - 1);
      setPlaying(false);
      setPlayed(true);
      window.setTimeout(() => setCurrent(-1), 800);
      if (!solvedRef.current) {
        solvedRef.current = true;
        onSolved({ attempts: 1 });
      }
    }, { once: true });

    el.play()
      .then(() => {
        setPlaying(true);
        // No timings? Still play; highlight sweeps on an even split as fallback.
        rafRef.current = requestAnimationFrame(tick);
      })
      .catch(() => setPlaying(false));
  }

  // Reading starts AUTOMATICALLY when the intro narration ends.
  const startedRef = useRef(false);
  useEffect(() => {
    if (cue && !startedRef.current) {
      startedRef.current = true;
      play();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cue]);

  useEffect(() => () => stop(), []);

  return (
    <div className="gb-tx">
      <div className="gb-karaoke">
        {textWords.map((w, i) => (
          <span key={i} className={`gb-kword${i === current ? " now" : ""}${i < current ? " read" : ""}`}>
            {w}
          </span>
        ))}
      </div>
      <button className="gb-piece" style={{ width: "auto", padding: "0 24px" }} onClick={play} disabled={playing}>
        {playing ? "reading…" : played ? "► Read it again" : "► Read to me"}
      </button>
      {played && <div className="gb-hint gb-ok">Now you read it out loud too!</div>}
      <style>{`
        .gb-karaoke { display:flex; flex-wrap:wrap; gap:8px 14px; justify-content:center; max-width:600px; }
        .gb-kword { font-family:'Baloo 2',sans-serif; font-size:40px; font-weight:800; color:#a5a3b8; padding:2px 6px; border-radius:12px; transition:all .15s ease; }
        .gb-kword.read { color:#1e1b3a; }
        .gb-kword.now { color:#4338ca; background:#eef2ff; transform:scale(1.12); }
      `}</style>
    </div>
  );
}
