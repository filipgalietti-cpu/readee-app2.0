"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TransformDef } from "@/lib/lesson-engine/types";
import { MOTION, SPARKLES } from "@/lib/lesson-engine/animation";
import { sfxCorrect, sfxWrong, playTryAgain, playUrl, playPraise, playNiceTry } from "@/lib/lesson-engine/cues";
import { seededShuffle } from "@/lib/lesson-engine/shuffle";
import LessonImage from "../LessonImage";

/**
 * `transform` — move a piece onto a word and watch it change.
 * Subject-agnostic: labels ("silent"), marks (ă→ā), images, and audio all come
 * from data. Serves silent-E today; any add-a-letter / change-a-piece concept
 * tomorrow. Tap-to-snap (default) + drag, one logic. Motion values from
 * animation.ts tokens (Claude Design's surface).
 */
export default function Transform({
  data,
  auto,
  cue,
  fallbackMs,
  onSolved,
  onWrong,
  feedbackAudio,
}: {
  data: TransformDef;
  auto?: boolean;
  /** Auto scenes: fires the transform (cue resolved from narration timestamps). */
  cue?: boolean;
  /** Safety timer for auto scenes if narration never plays (autoplay blocked). */
  fallbackMs?: number;
  onSolved: (meta?: { attempts?: number; correct?: boolean }) => void;
  onWrong?: () => void;
  feedbackAudio?: { hint?: string; explain?: string };
}) {
  const [placed, setPlaced] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [showCoach, setShowCoach] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const solvedRef = useRef(false);

  const baseLetters = data.base.toUpperCase().split("");
  const resultLetters = data.result.toUpperCase().split("");
  const [salt] = useState(() => Math.random().toString(36).slice(2));
  const options = useMemo(
    () => seededShuffle((data.options ?? [data.add]).map((o) => o.toUpperCase()), data.base + salt),
    [data.options, data.add, data.base, salt],
  );
  const correct = data.add.toUpperCase();

  function finish(opts?: { gaveUp?: boolean; skipPraise?: boolean }) {
    if (solvedRef.current) return;
    solvedRef.current = true;
    setPlaced(true);
    setWrong(null);
    if (!auto && !opts?.gaveUp) {
      sfxCorrect(); // chime on every correct
      if (!opts?.skipPraise) window.setTimeout(() => playPraise(), 260);
    } else if (auto) sfxCorrect();
    const used = attempts + 1;
    setTimeout(
      () => onSolved({ attempts: used, correct: !opts?.gaveUp }),
      MOTION.successHoldMs,
    );
  }

  function pick(letter: string) {
    if (placed) return;
    if (letter.toUpperCase() === correct) {
      // AUDIO RULE: never overlap, never race timers. Word first ("kite!"),
      // praise chained on the clip's END.
      if (data.successAudio) {
        finish({ skipPraise: true });
        window.setTimeout(() => playUrl(data.successAudio as string, () => playPraise()), 260);
      } else {
        finish();
      }
    } else {
      const used = attempts + 1;
      setAttempts(used);
      setWrong(letter.toUpperCase());
      window.setTimeout(() => setWrong(null), 700);
      onWrong?.();
      setShowCoach(true);
      if (used >= 2) {
        // 2nd wrong → tricky-explain (question-specific) then reveal
        if (feedbackAudio?.explain) playUrl(feedbackAudio.explain, () => finish({ gaveUp: true }));
        else playNiceTry(() => finish({ gaveUp: true }));
        window.setTimeout(() => finish({ gaveUp: true }), 12000); // finish() is once-guarded
      } else {
        sfxWrong();
        window.setTimeout(() => {
          if (feedbackAudio?.hint) playUrl(feedbackAudio.hint);
          else playTryAgain();
        }, 320);
      }
    }
  }

  // Auto (model) scenes: transform on the narration cue; fallback timer only
  // rescues a blocked-audio state.
  useEffect(() => {
    if (auto && cue) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, cue]);
  useEffect(() => {
    if (!auto) return;
    const t = window.setTimeout(() => finish(), fallbackMs ?? 15000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto]);

  const shown = placed ? resultLetters : baseLetters;
  const img = placed ? data.imageAfter : data.imageBefore;
  const emoji = placed ? data.emojiAfter : data.emojiBefore;
  const hasPic = data.imageBefore || data.imageAfter || data.emojiBefore || data.emojiAfter;

  return (
    <div className="gb-tx">
      {/* meaning picture — flips old meaning → new meaning */}
      {hasPic && (
        <div style={{ height: 210, display: "grid", placeItems: "center", perspective: 700 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={placed ? "after" : "before"}
              className="gb-emoji"
              initial={{ rotateY: -90, scale: 0.5, opacity: 0 }}
              animate={{ rotateY: 0, scale: 1, opacity: 1 }}
              exit={{ rotateY: 90, scale: 0.5, opacity: 0 }}
              transition={MOTION.flipSpring}
            >
              {img ? <LessonImage src={img} width={200} height={200} /> : emoji}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* the word */}
      <div className="gb-word" style={{ position: "relative" }}>
        {shown.map((ch, i) => {
          const isChanged = i === data.changeIndex;
          const isNew = placed && i === resultLetters.length - 1;
          const displayCh = isChanged && data.marks ? (placed ? data.marks.after ?? ch : data.marks.before ?? ch) : ch;
          const label = placed ? (isNew ? data.labels?.added : isChanged ? data.labels?.changed : null) : null;

          return (
            <div key={i} className="gb-tilewrap">
              <motion.div
                className="gb-tile"
                initial={false}
                animate={
                  isChanged && placed
                    ? { scale: MOTION.emphasis.scale, boxShadow: MOTION.emphasis.glow }
                    : isNew
                    ? { scale: MOTION.arrival.scale, rotate: MOTION.arrival.rotate }
                    : {}
                }
                transition={{ duration: MOTION.emphasis.duration, ease: "easeOut" }}
                style={{
                  background: isNew ? "#d7f5df" : "#fff",
                  borderColor: placed && (isChanged || isNew) ? "#10b981" : "#cbcbe0",
                  color: placed && isChanged ? "#047857" : "#1e1b3a",
                }}
              >
                {displayCh}
              </motion.div>
              {label && (
                <motion.div
                  className="gb-tag"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  style={{ color: isNew ? "#857fa0" : "#047857" }}
                >
                  {label}
                </motion.div>
              )}
            </div>
          );
        })}

        {!placed && (
          <div
            className={`gb-slot${dragOver ? " over" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              pick(e.dataTransfer.getData("text/plain"));
            }}
          >
            ?
          </div>
        )}

        {/* correctBurst */}
        <AnimatePresence>
          {placed &&
            SPARKLES.map((s) => (
              <motion.span
                key={s.i}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: Math.cos(s.angle) * s.dist,
                  y: Math.sin(s.angle) * s.dist,
                  scale: [0, 1.1, 0],
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 0.75, delay: s.delay, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "45%",
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: s.hue,
                  pointerEvents: "none",
                }}
              />
            ))}
        </AnimatePresence>
      </div>

      {/* letter pieces — tap OR drag */}
      {!placed && !auto && (
        <div className="gb-pieces">
          {options.map((opt) => (
            <button
              key={opt}
              className={`gb-piece${wrong === opt ? " shake" : ""}`}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", opt)}
              onClick={() => pick(opt)}
              aria-label={`Add ${opt}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {auto && !placed && <div className="gb-hint">watching…</div>}
      {showCoach && !placed && data.coachWrong && <div className="gb-coach">{data.coachWrong}</div>}
    </div>
  );
}
