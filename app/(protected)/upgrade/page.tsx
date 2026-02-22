"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { staggerContainer, slideUp, fadeUp } from "@/lib/motion/variants";
import { safeValidate } from "@/lib/validate";
import { ChildSchema } from "@/lib/schemas";
import { Child } from "@/lib/db/types";
import { levelNameToGradeKey } from "@/lib/assessment/questions";
import lessonsData from "@/lib/data/lessons.json";

const COMPARISON_ROWS = [
  { feature: "Diagnostic assessment", free: true, premium: true },
  { feature: "First 2 lessons per level", free: true, premium: true },
  { feature: "1 child profile", free: true, premium: true },
  { feature: "Basic progress tracking", free: true, premium: true },
  { feature: "Full curriculum (40+ lessons)", free: false, premium: true },
  { feature: "All 5 reading levels (K–4th)", free: false, premium: true },
  { feature: "Up to 5 child profiles", free: false, premium: true },
  { feature: "Detailed parent reports", free: false, premium: true },
  { feature: "Audio narration for every question", free: false, premium: true },
  { feature: "Standards-aligned practice", free: false, premium: true },
];

const TESTIMONIALS = [
  {
    quote: "My daughter went from sounding out every word to reading full sentences in just 3 weeks. She asks to do Readee every morning before school!",
    name: "Jessica M.",
    detail: "Mom of a kindergartener",
  },
  {
    quote: "As a teacher, I recommend Readee to every parent. The lessons follow the same standards I teach in class, so kids get extra practice at home.",
    name: "Mrs. Rodriguez",
    detail: "1st grade teacher",
  },
  {
    quote: "Worth every penny. My son struggled with reading and now he's ahead of his class. The progress tracking helps me see exactly where he's improving.",
    name: "David K.",
    detail: "Dad of two early readers",
  },
];

const FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel with one click, no questions asked. You keep access through the end of your billing period.",
  },
  {
    q: "What happens to my child's progress if I cancel?",
    a: "All progress is saved permanently. You just won't have access to premium lessons until you resubscribe.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes! Try Readee+ free for 7 days. You won't be charged until the trial ends, and you can cancel anytime during the trial.",
  },
  {
    q: "What's included in the free plan?",
    a: "The diagnostic assessment, your first 2 lessons per level, 1 child profile, and basic progress tracking. Upgrade anytime to unlock everything.",
  },
  {
    q: "What ages is Readee designed for?",
    a: "Readee covers kindergarten through 4th grade reading levels. The diagnostic assessment places your child at exactly the right level, regardless of their age.",
  },
];

const ACCENT_COLORS = ["#60a5fa", "#4ade80", "#fb923c", "#a78bfa"];
const TESTIMONIAL_BORDER_COLORS = ["#6366f1", "#6d28d9", "#8b5cf6"];

interface LessonData {
  id: string;
  title: string;
  skill: string;
}
interface LevelData {
  level_name: string;
  level_number: number;
  focus: string;
  lessons: LessonData[];
}
interface LessonsFile {
  levels: Record<string, LevelData>;
}

function isLessonFree(lessonId: string): boolean {
  const match = lessonId.match(/L(\d+)$/);
  if (!match) return true;
  return parseInt(match[1]) <= 2;
}

/* ─── useCountUp ─────────────────────────────────────── */

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    if (counted.current || target === 0) { setValue(target); return; }
    const el = ref.current;
    if (!el) { setValue(target); return; }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const start = performance.now();
          function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

/* ═══════════════════════════════════════════════════════ */
/*  Page                                                   */
/* ═══════════════════════════════════════════════════════ */

export default function UpgradePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
      }
    >
      <UpgradeContent />
    </Suspense>
  );
}

function UpgradeContent() {
  const searchParams = useSearchParams();
  const childId = searchParams.get("child");

  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalPlan, setModalPlan] = useState<"monthly" | "annual">("annual");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = supabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setEmail(user.email || "");
      }

      if (childId) {
        const { data: childData } = await supabase.from("children").select("*").eq("id", childId).single();
        if (childData) setChild(safeValidate(ChildSchema, childData) as Child);
      }
      setLoading(false);
    }
    load();
  }, [childId]);

  const handleOpenModal = (plan: "monthly" | "annual") => {
    setModalPlan(plan);
    setShowModal(true);
    setSubmitted(false);
  };

  const handleSubmitWaitlist = async () => {
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), plan_interest: modalPlan }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  // Get locked lessons for preview
  const file = lessonsData as unknown as LessonsFile;
  const gradeKey = child?.reading_level ? levelNameToGradeKey(child.reading_level) : "kindergarten";
  const currentLessons = file.levels[gradeKey]?.lessons || [];
  const lockedLessons = currentLessons.filter((l) => !isLessonFree(l.id));
  const totalLessons = Object.values(file.levels).reduce((sum, l) => sum + l.lessons.length, 0);
  const totalLockedLessons = Object.values(file.levels)
    .flatMap((l) => l.lessons)
    .filter((l) => !isLessonFree(l.id)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-3xl mx-auto py-8 px-4 pb-16 space-y-8 min-h-screen bg-gradient-to-b from-white via-indigo-50/30 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* ── HERO ── */}
      <motion.div variants={fadeUp} className="text-center space-y-4">
        <div className="text-5xl">🚀</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-slate-100 tracking-tight leading-tight">
          Give your child the{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            reading superpowers
          </span>{" "}
          they deserve with{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Readee+
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent bg-[length:200%_100%] bg-clip-text text-transparent animate-textShimmer pointer-events-none" aria-hidden="true">
              Readee+
            </span>
          </span>
        </h1>
        <p className="text-zinc-500 dark:text-slate-400 max-w-md mx-auto">
          42+ structured lessons, audio narration, and a full K-4th grade curriculum — all aligned to Common Core ELA standards.
        </p>
      </motion.div>

      {/* ── ANIMATED STAT COUNTERS ── */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4">
        <CountUpStatCard target={totalLessons} suffix="+" label="Lessons" />
        <CountUpStatCard target={5} label="Reading levels" />
        <CountUpStatCard target={36} label="Standards covered" />
      </motion.div>

      {/* ── LIVE DEMO PREVIEW ── */}
      <motion.div variants={slideUp}>
        <MiniDemoQuestion onTrialClick={() => handleOpenModal("annual")} />
      </motion.div>

      {/* ── LOCKED LESSONS PREVIEW ── */}
      <motion.div variants={slideUp} className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-slate-100 text-center">
          What your child will unlock
        </h2>

        <div className="space-y-2">
          {lockedLessons.slice(0, 3).map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-50 dark:bg-slate-700 border border-zinc-100 dark:border-slate-600"
            >
              <svg className="w-4 h-4 text-zinc-300 dark:text-slate-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-zinc-600 dark:text-slate-300 truncate">
                {lesson.title}
              </span>
            </div>
          ))}
        </div>

        {totalLockedLessons > 3 && (
          <p className="text-sm text-zinc-400 dark:text-slate-500 text-center">
            +{totalLockedLessons - 3} more lessons across 5 reading levels
          </p>
        )}
      </motion.div>

      {/* ── COMPARISON TABLE: Free vs Readee+ ── */}
      <motion.div variants={slideUp} className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-slate-700">
              <th className="px-4 py-3 text-left text-sm font-bold text-zinc-700 dark:text-slate-300">Feature</th>
              <th className="w-20 sm:w-24 px-2 py-3 text-center text-sm font-bold text-zinc-500 dark:text-slate-400">Free</th>
              <th className="w-20 sm:w-24 px-2 py-3 text-center text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30">Readee+</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, i) => (
              <tr key={i} className={i < COMPARISON_ROWS.length - 1 ? "border-b border-zinc-50 dark:border-slate-700/50" : ""}>
                <td className="px-4 py-3 text-left text-sm text-zinc-600 dark:text-slate-300">{row.feature}</td>
                <td className="px-2 py-3 text-center">
                  {row.free ? (
                    <svg className="w-5 h-5 text-green-500 dark:text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="inline-block w-4 h-0.5 bg-zinc-200 dark:bg-slate-600 rounded" />
                  )}
                </td>
                <td className="px-2 py-3 text-center bg-indigo-50/50 dark:bg-indigo-950/10">
                  <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* ── PRICING — SIDE BY SIDE ── */}
      <motion.div variants={slideUp} className="space-y-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-slate-100 text-center">
          Choose your plan
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Monthly card */}
          <motion.div
            className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-7 flex flex-col justify-between space-y-6 order-2 md:order-1"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-1">
              <div className="text-sm font-semibold text-zinc-500 dark:text-slate-400">Monthly</div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-zinc-900 dark:text-slate-100">$9.99</span>
                <span className="text-sm text-zinc-400 dark:text-slate-500">/month</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-slate-400 pt-1">Billed monthly</p>
              <p className="text-xs text-zinc-400 dark:text-slate-500 pt-2">Flexibility to cancel anytime</p>
            </div>

            <button
              onClick={() => handleOpenModal("monthly")}
              className="w-full py-4 rounded-xl border-2 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
            >
              Start 7-Day Free Trial
            </button>
          </motion.div>

          {/* Annual card (recommended) */}
          <motion.div
            className="relative rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-7 flex flex-col justify-between space-y-6 order-1 md:order-2 md:-mt-2 shadow-xl shadow-indigo-300/40 dark:shadow-indigo-900/50"
            whileHover={{ y: -6 }}
            animate={{ y: [0, -4, 0] }}
            transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
          >
            {/* Best Value badge */}
            <div className="absolute -top-3 -right-2 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-md">
              Best Value
            </div>

            <div className="space-y-1">
              <div className="text-sm font-semibold text-white/80">Annual</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">$99</span>
                <span className="text-sm text-white/60 line-through">$119.88</span>
                <span className="text-sm text-white/70">/year</span>
              </div>
              <p className="text-sm font-bold text-white pt-1">Just $8.25/month</p>
              <span className="inline-block mt-2 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-400/20 text-emerald-100 border border-emerald-300/30">
                Save $21 per year
              </span>
            </div>

            <button
              onClick={() => handleOpenModal("annual")}
              className="w-full py-4 rounded-xl bg-white text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition-all shadow-md"
            >
              Start 7-Day Free Trial
            </button>
          </motion.div>
        </div>

        <p className="text-center text-xs text-zinc-400 dark:text-slate-500">
          7 days free, then your selected plan. Cancel anytime.
        </p>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-zinc-500 dark:text-slate-400">
          <span>🔒 Secure payment</span>
          <span className="text-zinc-300 dark:text-slate-600">·</span>
          <span>✅ Cancel anytime</span>
          <span className="text-zinc-300 dark:text-slate-600">·</span>
          <span>💰 30-day money back</span>
        </div>
      </motion.div>

      {/* ── TESTIMONIAL CAROUSEL ── */}
      <motion.div variants={slideUp}>
        <TestimonialCarousel />
      </motion.div>

      {/* ── FAQ ── */}
      <motion.div variants={slideUp} className="space-y-3">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-slate-100 text-center mb-4">
          Frequently asked questions
        </h3>
        {FAQS.map((faq, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <span className="text-sm font-medium text-zinc-800 dark:text-slate-200">{faq.q}</span>
              <svg
                className={`w-4 h-4 text-zinc-400 dark:text-slate-500 transition-transform flex-shrink-0 ml-2 ${
                  openFaq === i ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <AnimatePresence>
              {openFaq === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4">
                    <p className="text-sm text-zinc-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </motion.div>

      {/* ── FINAL CTA ── */}
      <motion.div variants={slideUp} className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-center space-y-4 shadow-xl shadow-indigo-200/40 dark:shadow-indigo-900/40">
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Start your child&apos;s reading journey today
        </h2>
        <p className="text-white/80 text-sm max-w-md mx-auto">
          7 days free, then just $8.25/month with the annual plan. Cancel anytime — no risk, no commitment.
        </p>
        <button
          onClick={() => handleOpenModal("annual")}
          className="px-8 py-4 rounded-xl bg-white text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition-all shadow-md"
        >
          Start 7-Day Free Trial
        </button>
      </motion.div>

      {/* ── Secondary Exit ── */}
      <motion.div variants={fadeUp} className="text-center pt-2 pb-4">
        <Link
          href="/dashboard"
          className="text-sm text-zinc-400 dark:text-slate-500 hover:text-zinc-600 dark:hover:text-slate-300 transition-colors"
        >
          Continue with Free Plan &rarr;
        </Link>
      </motion.div>

      {/* ── Waitlist Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowModal(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-8 space-y-5 relative"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 dark:bg-slate-700 flex items-center justify-center text-zinc-400 dark:text-slate-300 hover:bg-zinc-200 dark:hover:bg-slate-600 transition-colors"
              >
                &times;
              </button>

              {!submitted ? (
                <>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-slate-100">
                      Readee+ is launching soon!
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-slate-400 mt-2">
                      Be first in line and get{" "}
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">20% off</span> your first year.
                    </p>
                  </div>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-zinc-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />

                  <button
                    onClick={handleSubmitWaitlist}
                    disabled={!email.trim() || submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-sm hover:from-indigo-700 hover:to-violet-600 transition-all shadow-sm disabled:opacity-50"
                  >
                    {submitting ? "Joining..." : "Join the Waitlist"}
                  </button>

                  <p className="text-[11px] text-zinc-400 dark:text-slate-500 text-center">
                    {modalPlan === "annual" ? "Annual plan selected" : "Monthly plan selected"} &middot; We&apos;ll email you when ready
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-slate-100">
                    You&apos;re on the list!
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-slate-400 mt-2">
                    We&apos;ll email you when Readee+ is ready with your exclusive 20% discount.
                  </p>
                  <button
                    onClick={() => setShowModal(false)}
                    className="mt-6 px-6 py-2.5 rounded-xl bg-zinc-100 dark:bg-slate-700 text-sm font-medium text-zinc-700 dark:text-slate-200 hover:bg-zinc-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Got it!
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  CountUp Stat Card                                      */
/* ═══════════════════════════════════════════════════════ */

function CountUpStatCard({ target, suffix, label }: { target: number; suffix?: string; label: string }) {
  const { value, ref } = useCountUp(target);

  return (
    <div ref={ref} className="text-center py-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{value}{suffix || ""}</div>
      <div className="text-xs text-zinc-500 dark:text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  Mini Demo Question                                     */
/* ═══════════════════════════════════════════════════════ */

const DEMO_CHOICES = ["A stick", "A red ball", "A bone", "A toy car"];
const DEMO_CORRECT = "A red ball";

function MiniDemoQuestion({ onTrialClick }: { onTrialClick: () => void }) {
  const [phase, setPhase] = useState<"idle" | "active" | "answered" | "upsell">("idle");
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = useCallback(() => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      const audio = new Audio("/audio/kindergarten/RL.K.1-q1.mp3");
      audioRef.current = audio;
      audio.play().catch(() => {});
    } catch {
      // Audio playback not available
    }
  }, []);

  const handleStart = () => {
    setPhase("active");
    playAudio();
  };

  const handleAnswer = (choice: string) => {
    if (phase !== "active") return;
    setSelected(choice);
    setIsCorrect(choice === DEMO_CORRECT);
    setPhase("answered");
    setTimeout(() => setPhase("upsell"), 2000);
  };

  const handleReset = () => {
    setPhase("idle");
    setSelected(null);
    setIsCorrect(false);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-500 px-5 py-3">
        <h2 className="text-white font-bold text-sm">Try a sample question!</h2>
        <p className="text-white/90 text-xs">See what your child&apos;s practice sessions look like</p>
      </div>

      <div className="p-5 space-y-4">
        {phase === "idle" ? (
          <div className="text-center py-4 space-y-4">
            <div className="text-4xl">📖</div>
            <p className="text-sm text-zinc-600 dark:text-slate-300 font-medium">
              Experience a real Readee question — with audio!
            </p>
            <button
              onClick={handleStart}
              className="w-full max-w-xs mx-auto h-14 rounded-xl bg-white text-indigo-600 font-extrabold text-base hover:bg-indigo-50 transition-all shadow-md hover:shadow-lg animate-pulse"
            >
              Try it!
            </button>
          </div>
        ) : phase === "upsell" ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-4 space-y-4"
          >
            <div className="text-4xl">🌟</div>
            <p className="text-base font-bold text-zinc-900 dark:text-slate-100">
              Your child gets hundreds of questions just like this with Readee+
            </p>
            <p className="text-sm text-zinc-500 dark:text-slate-400">
              Audio narration, instant feedback, and progress tracking — all included.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onTrialClick}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-sm hover:from-indigo-700 hover:to-violet-600 transition-all shadow-md"
              >
                Start Free Trial →
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-3 rounded-xl text-sm font-medium text-zinc-500 dark:text-slate-400 hover:text-zinc-700 dark:hover:text-slate-200 hover:bg-zinc-100 dark:hover:bg-slate-700 transition-colors"
              >
                Try again
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Question prompt */}
            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 p-4">
              <p className="text-sm text-zinc-800 dark:text-slate-200 leading-relaxed">
                🐶 Read: &ldquo;Max the dog ran to the park. He played fetch with a red ball.&rdquo;
              </p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-slate-100 mt-2">
                What did Max play with?
              </p>
            </div>

            {/* Answer choices */}
            <div className="space-y-2">
              {DEMO_CHOICES.map((choice, i) => {
                const isSelected = selected === choice;
                const isCorrectChoice = choice === DEMO_CORRECT;
                const answered = phase === "answered";

                let bg = "bg-white dark:bg-slate-800 border-zinc-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-600";
                if (answered && isSelected && isCorrect) bg = "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-500";
                if (answered && isSelected && !isCorrect) bg = "bg-red-50 dark:bg-red-950/30 border-red-400 dark:border-red-500";
                if (answered && !isSelected && isCorrectChoice && !isCorrect) bg = "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-500";

                return (
                  <motion.button
                    key={choice}
                    whileHover={!answered ? { scale: 1.02 } : undefined}
                    whileTap={!answered ? { scale: 0.98 } : undefined}
                    onClick={() => handleAnswer(choice)}
                    disabled={answered}
                    className={`group w-full text-left px-5 py-4 rounded-xl border-2 relative overflow-hidden transition-all duration-200 ${bg} ${answered ? "cursor-default" : "cursor-pointer"}`}
                  >
                    {/* Color accent bar */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[3px] group-hover:w-[5px] rounded-l-xl transition-all duration-200"
                      style={{ backgroundColor: ACCENT_COLORS[i % 4] }}
                    />
                    <div className="flex items-center gap-3">
                      {answered && isSelected && isCorrect && (
                        <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {answered && isSelected && !isCorrect && (
                        <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                      {answered && !isSelected && isCorrectChoice && !isCorrect && (
                        <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <span className="text-base font-medium text-zinc-800 dark:text-slate-200 leading-snug flex-1">
                        {choice}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback bar */}
            <AnimatePresence>
              {phase === "answered" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`rounded-xl p-4 flex items-center gap-3 ${
                    isCorrect
                      ? "bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40"
                      : "bg-red-100 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl ${
                    isCorrect ? "bg-emerald-200 dark:bg-emerald-900/50" : "bg-red-200 dark:bg-red-900/50"
                  }`}>
                    {isCorrect ? "🎉" : "💡"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm ${isCorrect ? "text-emerald-800 dark:text-emerald-200" : "text-red-800 dark:text-red-200"}`}>
                      {isCorrect ? "Amazing! That's correct!" : "Not quite — the answer is \"A red ball\""}
                    </p>
                    {isCorrect && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">+5 🥕</p>
                    )}
                    {!isCorrect && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">Hint: Look at the second sentence!</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Audio button */}
        {(phase === "active" || phase === "answered") && (
          <button
            onClick={playAudio}
            className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            Play audio
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  Testimonial Carousel                                   */
/* ═══════════════════════════════════════════════════════ */

function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-zinc-900 dark:text-slate-100 text-center">
        Parents love Readee
      </h3>

      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="p-6 space-y-3 relative"
            style={{ borderLeft: `3px solid ${TESTIMONIAL_BORDER_COLORS[current % TESTIMONIAL_BORDER_COLORS.length]}` }}
          >
            {/* Quotation mark graphic */}
            <span className="absolute top-2 right-4 text-6xl font-serif leading-none text-indigo-100 dark:text-indigo-900/40 pointer-events-none select-none">&ldquo;</span>
            {/* Stars */}
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <svg key={j} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-zinc-700 dark:text-slate-300 leading-relaxed relative z-10">
              &ldquo;{TESTIMONIALS[current].quote}&rdquo;
            </p>
            <div className="text-xs text-zinc-500 dark:text-slate-400">
              <span className="font-semibold text-zinc-700 dark:text-slate-300">{TESTIMONIALS[current].name}</span> &middot; {TESTIMONIALS[current].detail}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-2 pb-4">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "bg-indigo-600 dark:bg-indigo-400 w-6"
                  : "bg-zinc-300 dark:bg-slate-600 hover:bg-zinc-400 dark:hover:bg-slate-500"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
