"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChooseDef } from "@/lib/lesson-engine/types";
import { playPraise, playNiceTry, playTryAgain, playUrl, speak, sfxWrong, sfxCorrect } from "@/lib/lesson-engine/cues";
import { seededShuffle } from "@/lib/lesson-engine/shuffle";
import LessonImage from "../LessonImage";

/**
 * `choose` — pick the right option (image tiles). Subject-agnostic: "who is the
 * story about" today, "which number is even" for Mathee later. Wrong picks
 * coach + retry (never a dead end).
 */
export default function Choose({
  data,
  cue,
  onSolved,
  onWrong,
  feedbackAudio,
}: {
  data: ChooseDef;
  /** Narration finished — time to read the choices aloud. */
  cue?: boolean;
  onSolved: (meta?: { attempts?: number; correct?: boolean }) => void;
  onWrong?: () => void;
  feedbackAudio?: { hint?: string; explain?: string };
}) {
  // Engine-shuffled + per-playthrough random salt (answers CAN land first —
  // it's honest randomization, not banned positions).
  const [salt] = useState(() => Math.random().toString(36).slice(2));
  const display = useMemo(
    () => seededShuffle(data.options, data.options.map((o) => o.id).join("|") + salt),
    [data.options, salt],
  );
  const [picked, setPicked] = useState<string | null>(null); // correct pick
  // K students can't read the labels (Jennifer): after the narration, read each
  // choice aloud, lighting its tile as it's spoken. Tapping interrupts.
  const [readingIdx, setReadingIdx] = useState(-1);
  const readStarted = useRef(false);
  const cancelled = useRef(false);
  useEffect(() => {
    if (!cue || readStarted.current || solvedRef.current) return;
    readStarted.current = true;
    let i = 0;
    const readNext = () => {
      if (cancelled.current || solvedRef.current || i >= display.length) {
        setReadingIdx(-1);
        return;
      }
      const opt = display[i];
      setReadingIdx(i);
      i++;
      if (opt.audio) playUrl(opt.audio, () => window.setTimeout(readNext, 350));
      else {
        speak(opt.label);
        window.setTimeout(readNext, 900);
      }
    };
    const t = window.setTimeout(readNext, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cue]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [showCoach, setShowCoach] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const solvedRef = useRef(false);

  function pick(id: string) {
    if (solvedRef.current) return;
    cancelled.current = true; // kid answered — stop the read-through
    setReadingIdx(-1);
    const opt = data.options.find((o) => o.id === id);
    if (id === data.correctId) {
      solvedRef.current = true;
      setPicked(id);
      sfxCorrect(); // the chime — on EVERY correct answer (Filip's law)
      // K reinforcement: say the ANSWER WORD ("Barn!"), THEN praise — chained on
      // clip end so nothing gets cut off.
      if (opt?.audio) playUrl(opt.audio, () => playPraise());
      else playPraise();
      setTimeout(() => onSolved({ attempts: attempts + 1 }), 1600);
    } else {
      const used = attempts + 1;
      setAttempts(used);
      setWrong(id);
      window.setTimeout(() => setWrong(null), 700);
      onWrong?.();
      setShowCoach(true);
      if (used >= 2) {
        // 2nd wrong → "That one was tricky!" + explanation, reveal, move on
        solvedRef.current = true;
        setPicked(data.correctId);
        let fired = false;
        const solveOnce = () => {
          if (fired) return;
          fired = true;
          onSolved({ attempts: used, correct: false });
        };
        if (feedbackAudio?.explain) playUrl(feedbackAudio.explain, solveOnce);
        else playNiceTry(solveOnce);
        window.setTimeout(solveOnce, 12000); // explains are long; still never stall
      } else {
        // 1st wrong → buzz, then the question's own subtle hint (legacy pattern)
        sfxWrong();
        window.setTimeout(() => {
          if (feedbackAudio?.hint) playUrl(feedbackAudio.hint);
          else playTryAgain();
        }, 320);
      }
    }
  }

  return (
    <div className="gb-tx">
      <div className="gb-pool">
        {display.map((o) => (
          <button
            key={o.id}
            className={`gb-item big${picked === o.id ? " win" : ""}${wrong === o.id ? " shake" : ""}${readingIdx >= 0 && display[readingIdx]?.id === o.id ? " sel" : ""}`}
            onClick={() => pick(o.id)}
            aria-label={o.label}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
          >
            {o.image && <LessonImage src={o.image} width={140} height={140} />}
            {o.label}
          </button>
        ))}
      </div>
      {showCoach && !picked && data.coachWrong && <div className="gb-coach">{data.coachWrong}</div>}
      {picked && <div className="gb-hint gb-ok">That's it!</div>}
    </div>
  );
}
