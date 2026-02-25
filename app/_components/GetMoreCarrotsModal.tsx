"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const CARROT_PACKS = [
  { id: "pack_small", label: "Small Pack", carrots: 100, price: "$0.99" },
  { id: "pack_medium", label: "Medium Pack", carrots: 300, price: "$1.99" },
  { id: "pack_large", label: "Large Pack", carrots: 1000, price: "$4.99" },
] as const;

export function GetMoreCarrotsModal({
  itemName,
  shortfall,
  childId,
  onClose,
}: {
  itemName: string;
  shortfall: number;
  childId: string;
  onClose: () => void;
}) {
  const [toast, setToast] = useState<string | null>(null);

  const handlePurchase = async (packId: string) => {
    try {
      const res = await fetch("/api/carrots/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, packId }),
      });
      const data = await res.json();
      if (!data.success) {
        setToast(data.message || "Coming soon!");
        setTimeout(() => setToast(null), 2500);
      }
    } catch {
      setToast("Coming soon!");
      setTimeout(() => setToast(null), 2500);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl p-6 pb-10 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-slate-600 mx-auto mb-4" />

          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white text-center mb-1">
            Get More Carrots
          </h2>
          <p className="text-sm text-zinc-500 dark:text-slate-400 text-center mb-6">
            You need {shortfall} more carrots for {itemName}
          </p>

          {/* Earn More section */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Earn More
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={`/practice?child=${childId}&standard=K.RF.1`}
                className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-zinc-50 dark:bg-slate-800 p-4 text-center hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                onClick={onClose}
              >
                <div className="text-2xl mb-1">{"\uD83C\uDFAF"}</div>
                <div className="text-sm font-bold text-zinc-900 dark:text-white">Practice</div>
                <div className="text-xs text-zinc-400 dark:text-slate-500">5 carrots per question</div>
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-zinc-50 dark:bg-slate-800 p-4 text-center hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                onClick={onClose}
              >
                <div className="text-2xl mb-1">{"\uD83D\uDCDA"}</div>
                <div className="text-sm font-bold text-zinc-900 dark:text-white">Lessons</div>
                <div className="text-xs text-zinc-400 dark:text-slate-500">Up to 20 carrots each</div>
              </Link>
            </div>
          </div>

          {/* Carrot Packs section */}
          <div>
            <h3 className="text-xs font-bold text-zinc-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Carrot Packs (for parents)
            </h3>
            <div className="space-y-2">
              {CARROT_PACKS.map((pack) => (
                <button
                  key={pack.id}
                  onClick={() => handlePurchase(pack.id)}
                  className="w-full flex items-center justify-between rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{"\uD83E\uDD55"}</span>
                    <div className="text-left">
                      <div className="text-sm font-bold text-zinc-900 dark:text-white">
                        {pack.carrots} Carrots
                      </div>
                      <div className="text-xs text-zinc-400 dark:text-slate-500">{pack.label}</div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    {pack.price}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Toast */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 text-center text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl py-2 px-4"
              >
                {toast}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
