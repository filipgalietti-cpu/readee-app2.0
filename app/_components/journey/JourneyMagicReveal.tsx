"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import MagicTrick from "@/app/(protected)/dashboard/_components/MagicTrick";
import { audioManager } from "@/lib/audio/audio-manager";
import styles from "./journey-v2.module.css";

/** Reuse the saved routine; its mount delay is 1.5s, followed by a 6s trick. */
export default function JourneyMagicReveal({
  onComplete,
  soundEnabled = true,
}: {
  onComplete: () => void;
  soundEnabled?: boolean;
}) {
  const cancelAudio = useRef<(() => void) | null>(null);
  const played = useRef(false);
  useEffect(() => {
    if (!soundEnabled) cancelAudio.current?.();
    return () => cancelAudio.current?.();
  }, [soundEnabled]);
  const finish = () => {
    cancelAudio.current?.();
    onComplete();
  };
  const [poof, setPoof] = useState(false);
  /*
   * ‼️ FILIP: "The magician should appear before the background does btw that
   * looked cheap. The background should fade in the blurry background as the
   * magician waves his wand."
   *
   * Everything used to mount at once: stars, kicker, headline and magician all
   * arrived together, so nothing was conjured, it was just there. Now the
   * magician stands alone on an empty stage, and the world he is summoning
   * arrives out of focus and resolves, on the beat where the routine actually
   * starts.
   *
   * Driven by the routine's own animation rather than a second guessed timer,
   * so the two cannot drift apart: `mtBody` starts when MagicTrick's 1.5s mount
   * delay elapses, which is the wand waggle. The timeout below is only the
   * safety net for a backgrounded tab or disabled CSS animations.
   */
  const [conjured, setConjured] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setConjured(true), 1800);
    return () => window.clearTimeout(t);
  }, []);
  useEffect(() => {
    // A backgrounded tab or disabled CSS animation must never trap the preview.
    const fallback = window.setTimeout(() => setPoof(true), 9000);
    return () => window.clearTimeout(fallback);
  }, []);
  return (
    <motion.button
      type="button"
      className={styles.magicCover}
      data-magic-cover
      data-poof={poof}
      aria-label="Show reading journey now"
      onClick={finish}
      onKeyDown={(event) => {
        if (event.key === "Escape") finish();
      }}
      /*
       * ‼️ THE STAGE STARTS DARK. Filip, 19 Sep: "the magician animations should
       * show up first, right now we see the map already there, and the magician
       * renders in a bit afterwards."
       *
       * The cover's own background is rgba(67,45,80,0.18) and leans on a 10px
       * backdrop blur, so the finished map was legible underneath from the
       * first frame. Nothing was being revealed, because nothing was hidden:
       * the magician was performing in front of the thing he was meant to
       * conjure.
       *
       * So it opens nearly opaque, and eases back to the designed tint on the
       * same beat the backdrop resolves, which is when the wand actually moves.
       * The magician stands on an empty stage, waves, and the world arrives.
       */
      initial={{ opacity: 1, backgroundColor: "rgba(43,27,58,0.94)" }}
      animate={{
        opacity: poof ? 0 : 1,
        backgroundColor: conjured ? "rgba(67,45,80,0.18)" : "rgba(43,27,58,0.94)",
      }}
      transition={{
        opacity: { duration: 0.95, delay: poof ? 0.15 : 0 },
        backgroundColor: { duration: 1.2, ease: "easeOut" },
      }}
      onAnimationComplete={() => {
        if (poof) finish();
      }}
      onAnimationStartCapture={(event) => {
        if (event.animationName !== "mtBody" || played.current) return;
        played.current = true;
        setConjured(true);
        if (soundEnabled) cancelAudio.current = audioManager?.playJourneyMagic();
      }}
      onAnimationEndCapture={(event) => {
        if (event.animationName === "mtBody") setPoof(true);
      }}
    >
      <motion.span
        className={styles.magicBackdrop}
        aria-hidden="true"
        initial={{ opacity: 0, filter: "blur(16px)" }}
        animate={conjured ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: "blur(16px)" }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      >
        {Array.from({ length: 18 }, (_, index) => (
          <span key={index} style={{ "--star": index } as CSSProperties} />
        ))}
      </motion.span>
      <span className={styles.magicPresentation}>
        <motion.span
          className={styles.magicKicker}
          initial={{ opacity: 0 }}
          animate={{ opacity: conjured ? 1 : 0 }}
          transition={{ duration: 0.7, delay: conjured ? 0.25 : 0 }}
        >
          READEE’S MAP MAKER
        </motion.span>
        <motion.span
          className={styles.magicTitle}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: conjured ? 1 : 0, y: conjured ? 0 : 6 }}
          transition={{ duration: 0.7, delay: conjured ? 0.35 : 0 }}
        >
          Watch your reading journey appear!
        </motion.span>
        <motion.span
          className={styles.magicBunny}
          aria-hidden="true"
          animate={{ scale: poof ? 0.9 : 1, opacity: poof ? 0 : 1 }}
          transition={{ duration: 0.5 }}
        >
          <MagicTrick />
        </motion.span>
        <motion.span
          className={styles.magicTada}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: poof ? 0 : 1, y: 0 }}
          transition={{ delay: poof ? 0 : 6, duration: 0.45 }}
        >
          Your path is ready!
        </motion.span>
        <span className={styles.magicSkip}>Tap anywhere to reveal it now</span>
      </span>
      <span className={styles.magicCloud} aria-hidden="true">
        {Array.from({ length: 7 }, (_, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, scale: 0.2 }}
            animate={
              poof
                ? {
                    opacity: [0, 0.9, 0],
                    scale: [0.2, 1.2, 1.8],
                    x: Math.cos((index * Math.PI * 2) / 7) * 95,
                    y: Math.sin((index * Math.PI * 2) / 7) * 75,
                  }
                : { opacity: 0, scale: 0.2 }
            }
            transition={{ duration: 1, ease: "easeOut" }}
          />
        ))}
      </span>
    </motion.button>
  );
}
