"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Fast per-route fade. Previously used `AnimatePresence mode="wait"`, which
 * serialized navigation — the old page had to finish exiting (0.2s) before
 * the new one mounted, then fade in (0.2s), adding ~0.4s of dead time to
 * EVERY back-and-forth. Now the new page mounts instantly (keyed on the
 * path) and fades in quickly; no exit-wait, so navigation feels immediate.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
