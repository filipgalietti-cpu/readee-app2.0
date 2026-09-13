"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import MagicTrick from "@/app/(protected)/dashboard/_components/MagicTrick";
import { audioManager } from "@/lib/audio/audio-manager";
import styles from "./journey-v2.module.css";

/** Reuse the saved routine; its mount delay is 1.5s, followed by a 6s trick. */
export default function JourneyMagicReveal({ onComplete, soundEnabled = true }: { onComplete: () => void; soundEnabled?: boolean }) {
  const cancelAudio = useRef<(() => void) | null>(null);
  const played = useRef(false);
  useEffect(() => {
    if (!soundEnabled) cancelAudio.current?.();
    return () => cancelAudio.current?.();
  }, [soundEnabled]);
  const finish = () => { cancelAudio.current?.(); onComplete(); };
  const [poof, setPoof] = useState(false);
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
      onKeyDown={(event) => { if (event.key === "Escape") finish(); }}
      initial={{ opacity: 1 }}
      animate={{ opacity: poof ? 0 : 1 }}
      transition={{ duration: 0.95, delay: poof ? 0.15 : 0 }}
      onAnimationComplete={() => { if (poof) finish(); }}
      onAnimationStartCapture={(event) => {
        if (event.animationName !== "mtBody" || played.current) return;
        played.current = true;
        if (soundEnabled) cancelAudio.current = audioManager?.playJourneyMagic();
      }}
      onAnimationEndCapture={(event) => {
        if (event.animationName === "mtBody") setPoof(true);
      }}
    >
      <span className={styles.magicPresentation}>
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
        TA-DA!!!
      </motion.span>
      </span>
      <span className={styles.magicCloud} aria-hidden="true">
        {Array.from({ length: 7 }, (_, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, scale: 0.2 }}
            animate={poof ? {
              opacity: [0, 0.9, 0],
              scale: [0.2, 1.2, 1.8],
              x: Math.cos(index * Math.PI * 2 / 7) * 95,
              y: Math.sin(index * Math.PI * 2 / 7) * 75,
            } : { opacity: 0, scale: 0.2 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        ))}
      </span>
    </motion.button>
  );
}
