"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { safeValidate } from "@/lib/validate";
import { FeedbackSchema } from "@/lib/schemas";
import { fadeUp, slideUp, popIn, staggerContainer } from "@/lib/motion/variants";
import { useAudio } from "@/lib/audio/use-audio";

/* ─── Constants ──────────────────────────────────────── */

const RATINGS = [
  { value: 1, emoji: "😫", label: "Terrible" },
  { value: 2, emoji: "😕", label: "Poor" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😍", label: "Amazing" },
];

const CATEGORIES = [
  { id: "bug", label: "Bug Report", emoji: "🐛" },
  { id: "feature", label: "Feature Request", emoji: "💡" },
  { id: "content", label: "Content Feedback", emoji: "📚" },
  { id: "general", label: "General", emoji: "💬" },
  { id: "praise", label: "Praise", emoji: "🌟" },
];

/* ─── Page ───────────────────────────────────────────── */

export default function FeedbackPage() {
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState<number | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confetti, setConfetti] = useState<{ id: number; x: number; color: string; delay: number }[]>([]);
  const { playWhoosh } = useAudio();

  function selectRating(val: number) {
    setRating(val);
    // Auto-advance after brief pause
    setTimeout(() => setStep(2), 300);
  }

  function selectCategory(id: string) {
    setCategory(id);
    setTimeout(() => setStep(3), 200);
  }

  async function handleSubmit() {
    if (!rating || !category) return;
    setSubmitting(true);

    const feedbackData = safeValidate(FeedbackSchema, {
      rating,
      category,
      message: message.trim() || null,
    });

    try {
      const supabase = supabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("feedback").insert({
          user_id: user.id,
          ...feedbackData,
        });
      } else {
        console.log("Feedback (not logged in):", feedbackData);
      }
    } catch {
      // Show success anyway — don't block the user experience
      console.log("Feedback saved locally:", feedbackData);
    }

    // Trigger confetti
    const particles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      color: ["#6366f1", "#8b5cf6", "#a78bfa", "#f59e0b", "#10b981", "#ec4899"][i % 6],
      delay: Math.random() * 0.5,
    }));
    setConfetti(particles);
    playWhoosh();
    setSubmitting(false);
    setSubmitted(true);
  }

  function resetForm() {
    setStep(1);
    setRating(null);
    setCategory(null);
    setMessage("");
    setSubmitted(false);
    setConfetti([]);
  }

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      {/* Nav */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
          &larr; Dashboard
        </Link>
      </div>

      {/* Submitted state */}
      {submitted ? (
        <div className="text-center space-y-6 relative overflow-hidden">
          {/* Confetti */}
          {confetti.map((p) => (
            <motion.div
              key={p.id}
              className="absolute w-2.5 h-2.5 rounded-sm"
              style={{
                left: `${p.x}%`,
                top: -20,
                backgroundColor: p.color,
              }}
              initial={{ y: -20, rotate: 0, opacity: 1 }}
              animate={{ y: "100vh", rotate: 720, opacity: [1, 1, 0] }}
              transition={{ duration: 2.5, delay: p.delay, ease: "easeIn" }}
            />
          ))}

          <motion.div
            className="relative z-10 pt-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={popIn}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 mx-auto mb-6 flex items-center justify-center shadow-lg shadow-emerald-200"
            >
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-2xl font-bold text-zinc-900 dark:text-slate-100 tracking-tight">
              Thank you!
            </motion.h1>
            <motion.p variants={fadeUp} className="text-zinc-500 dark:text-slate-400 mt-2 leading-relaxed">
              Your feedback helps us make Readee better for every family 💜
            </motion.p>

            {rating && (
              <motion.div variants={fadeUp} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/40">
                <span className="text-2xl">{RATINGS.find((r) => r.value === rating)?.emoji}</span>
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  {RATINGS.find((r) => r.value === rating)?.label}
                </span>
              </motion.div>
            )}

            <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center gap-3">
              <button
                onClick={resetForm}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-sm font-bold hover:from-indigo-700 hover:to-violet-600 transition-all shadow-md"
              >
                Submit Another
              </button>
              <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors">
                Back to Dashboard
              </Link>
            </motion.div>
          </motion.div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 mx-auto mb-4 flex items-center justify-center text-3xl">
              💬
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-slate-100 tracking-tight">
              Share Your Feedback
            </h1>
            <p className="text-zinc-500 dark:text-slate-400 text-sm mt-1">
              We&apos;d love to hear how your family&apos;s experience is going
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => { if (s <= step) setStep(s); }}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? "w-8 bg-indigo-500"
                    : s < step
                    ? "bg-indigo-300 dark:bg-indigo-600 cursor-pointer"
                    : "bg-zinc-200 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>

          {/* Step 1: Rating */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-slate-100 text-center">
                How&apos;s your experience with Readee?
              </h2>

              <div className="flex justify-center gap-3">
                {RATINGS.map((r) => (
                  <motion.button
                    key={r.value}
                    onClick={() => selectRating(r.value)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className={`group flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-colors duration-200 ${
                      rating === r.value
                        ? "bg-indigo-100 dark:bg-indigo-900/40 ring-2 ring-indigo-400"
                        : "hover:bg-zinc-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="text-3xl">
                      {r.emoji}
                    </span>
                    <span className={`text-[10px] font-medium ${
                      rating === r.value ? "text-indigo-700 dark:text-indigo-300" : "text-zinc-400 dark:text-slate-500"
                    }`}>
                      {r.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Category */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-slate-100 text-center">
                What kind of feedback?
              </h2>

              <div className="flex flex-wrap justify-center gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectCategory(c.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                      category === c.id
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                        : "bg-white dark:bg-slate-800 text-zinc-700 dark:text-slate-200 border-zinc-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30"
                    }`}
                  >
                    <span>{c.emoji}</span>
                    {c.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(1)}
                className="block mx-auto text-xs text-zinc-400 dark:text-slate-500 hover:text-zinc-600 dark:hover:text-slate-300 transition-colors"
              >
                &larr; Change rating
              </button>
            </div>
          )}

          {/* Step 3: Message + Submit */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-slate-100 text-center">
                Tell us more <span className="text-zinc-400 dark:text-slate-500 font-normal">(optional)</span>
              </h2>

              {/* Rating & category summary */}
              <div className="flex items-center justify-center gap-3">
                {rating && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-sm">
                    <span className="text-lg">{RATINGS.find((r) => r.value === rating)?.emoji}</span>
                    <span className="font-medium text-indigo-700 dark:text-indigo-300">{RATINGS.find((r) => r.value === rating)?.label}</span>
                  </span>
                )}
                {category && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-900/40 text-sm">
                    <span>{CATEGORIES.find((c) => c.id === category)?.emoji}</span>
                    <span className="font-medium text-violet-700 dark:text-violet-300">{CATEGORIES.find((c) => c.id === category)?.label}</span>
                  </span>
                )}
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What could we do better? What do you love?"
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-slate-600 text-sm text-zinc-900 dark:text-slate-100 bg-white dark:bg-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-zinc-400 dark:placeholder:text-slate-500"
              />

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-base hover:from-indigo-700 hover:to-violet-600 transition-all shadow-lg disabled:opacity-50"
              >
                {submitting ? "Sending..." : "Send Feedback 💜"}
              </button>

              <button
                onClick={() => setStep(2)}
                className="block mx-auto text-xs text-zinc-400 dark:text-slate-500 hover:text-zinc-600 dark:hover:text-slate-300 transition-colors"
              >
                &larr; Change category
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
