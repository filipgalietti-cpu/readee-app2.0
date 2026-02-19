import type { Variants } from "framer-motion";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 15 },
  },
};

export const wrongShake: Variants = {
  idle: { x: 0 },
  shake: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: { duration: 0.5 },
  },
};

export const feedbackSlideUp: Variants = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
  exit: { y: "100%", transition: { duration: 0.2 } },
};

export function confettiPiece(left: number, delay: number): Variants {
  const xDrift = (Math.random() - 0.5) * 100;
  return {
    hidden: { y: -20, x: 0, rotate: 0, opacity: 1 },
    visible: {
      y: "100vh",
      x: xDrift,
      rotate: 720,
      opacity: [1, 1, 0],
      transition: { duration: 2.5, delay, ease: "easeIn" },
    },
  };
}
