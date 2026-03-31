"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { X, Sparkles, BookOpen, Headphones, BarChart3, Users } from "lucide-react";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  childId?: string | null;
  childName?: string | null;
  /** What triggered the paywall */
  trigger?: "lesson" | "story" | "analytics" | "child";
}

const TRIGGERS: Record<string, { title: string; subtitle: string }> = {
  lesson: {
    title: "Want to keep learning?",
    subtitle: "Your child just finished all the free lessons. Upgrade to unlock the full curriculum!",
  },
  story: {
    title: "More stories are waiting!",
    subtitle: "Unlock all 25 stories across every grade level with Readee+.",
  },
  analytics: {
    title: "See how your child is doing",
    subtitle: "Detailed progress reports and analytics are available with Readee+.",
  },
  child: {
    title: "Add more readers",
    subtitle: "Readee+ lets you create up to 5 child profiles — perfect for siblings.",
  },
};

const FEATURES = [
  { Icon: BookOpen, text: "All lessons across K–4th grade" },
  { Icon: Headphones, text: "Every story with audio narration" },
  { Icon: BarChart3, text: "Detailed progress reports" },
  { Icon: Users, text: "Up to 5 child profiles" },
];

export function PaywallModal({ open, onClose, childId, childName, trigger = "lesson" }: PaywallModalProps) {
  const t = TRIGGERS[trigger] || TRIGGERS.lesson;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[15%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[420px] z-50 rounded-2xl bg-white shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-zinc-100 transition-colors"
            >
              <X className="w-4 h-4 text-zinc-500" />
            </button>

            {/* Header */}
            <div
              className="px-6 pt-8 pb-6 text-center"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)" }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", bounce: 0.5 }}
              >
                <Image
                  src="/images/bunny-hero.png"
                  alt="Readee bunny"
                  width={818}
                  height={1436}
                  className="mx-auto w-[70px] h-auto drop-shadow-lg mb-3"
                />
              </motion.div>
              <h2 className="text-xl font-extrabold text-white">{t.title}</h2>
              <p className="text-sm text-white/80 mt-1.5 max-w-[280px] mx-auto">{t.subtitle}</p>
            </div>

            {/* Features */}
            <div className="px-6 py-5 space-y-3">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <f.Icon className="w-4 h-4 text-indigo-600" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm text-zinc-700 font-medium">{f.text}</p>
                </motion.div>
              ))}
            </div>

            {/* Pricing */}
            <div className="px-6 pb-2">
              <div className="rounded-xl bg-indigo-50 p-4 text-center">
                <p className="text-xs text-indigo-600 font-semibold">Starting at</p>
                <p className="text-2xl font-extrabold text-zinc-900">
                  $6.67<span className="text-sm font-medium text-zinc-500">/month</span>
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">Billed annually at $79.99/year</p>
              </div>
            </div>

            {/* CTA */}
            <div className="px-6 pt-3 pb-6 space-y-2">
              <Link
                href={childId ? `/upgrade?child=${childId}` : "/upgrade"}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  boxShadow: "0 4px 0 0 #4f46e5",
                }}
                onClick={onClose}
              >
                <Sparkles className="w-4 h-4" />
                Start 7-Day Free Trial
              </Link>
              <button
                onClick={onClose}
                className="w-full py-2.5 text-sm text-zinc-400 hover:text-zinc-600 transition-colors font-medium"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
