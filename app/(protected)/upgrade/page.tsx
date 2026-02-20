"use client";

import { useEffect, useState } from "react";
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

const READING_LEVELS = [
  "Emerging Reader",
  "Beginning Reader",
  "Developing Reader",
  "Growing Reader",
  "Independent Reader",
  "Advanced Reader",
];

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
  const [completedCount, setCompletedCount] = useState(0);
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
        const [{ data: childData }, { data: progressData }] = await Promise.all([
          supabase.from("children").select("*").eq("id", childId).single(),
          supabase.from("lessons_progress").select("lesson_id, section").eq("child_id", childId),
        ]);

        if (childData) setChild(safeValidate(ChildSchema, childData) as Child);
        if (progressData) {
          const byLesson: Record<string, Set<string>> = {};
          for (const p of progressData) {
            if (!byLesson[p.lesson_id]) byLesson[p.lesson_id] = new Set();
            byLesson[p.lesson_id].add(p.section);
          }
          let count = 0;
          for (const sections of Object.values(byLesson)) {
            if (sections.has("learn") && sections.has("practice") && sections.has("read")) count++;
          }
          setCompletedCount(count);
        }
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
      className="max-w-3xl mx-auto py-8 px-4 pb-16 space-y-14 min-h-screen bg-gradient-to-b from-white via-indigo-50/30 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* ── HERO: Celebrate Progress ── */}
      {child ? (
        <motion.div variants={fadeUp} className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/40 text-sm font-medium text-green-700 dark:text-green-300">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {child.first_name} is making great progress
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-slate-100 tracking-tight leading-tight">
            Don&apos;t let {child.first_name}&apos;s<br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
              reading momentum
            </span>{" "}
            stop here
          </h1>
          <p className="text-zinc-500 dark:text-slate-400 max-w-md mx-auto">
            {child.first_name} has already earned {child.xp} XP and completed {completedCount} lesson{completedCount !== 1 ? "s" : ""}. Unlock the full curriculum to keep the growth going.
          </p>

          {/* Progress badges */}
          <div className="flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-sm font-medium text-amber-700 dark:text-amber-300">
              {child.xp} XP earned
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 text-sm font-medium text-indigo-700 dark:text-indigo-300">
              {completedCount} lesson{completedCount !== 1 ? "s" : ""} done
            </span>
            {child.reading_level && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/40 text-sm font-medium text-violet-700 dark:text-violet-300">
                {child.reading_level}
              </span>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-slate-100 tracking-tight leading-tight">
            Give your child the{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
              reading superpowers
            </span>{" "}
            they deserve
          </h1>
          <p className="text-zinc-500 dark:text-slate-400 max-w-md mx-auto">
            {totalLessons}+ structured lessons, audio narration, and a full K-4th grade curriculum — all aligned to Common Core ELA standards.
          </p>
        </motion.div>
      )}

      {/* ── SOCIAL PROOF: Stats Bar ── */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4">
        {[
          { value: `${totalLessons}+`, label: "Lessons" },
          { value: "5", label: "Reading levels" },
          { value: "36", label: "Standards covered" },
        ].map((stat) => (
          <div key={stat.label} className="text-center py-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stat.value}</div>
            <div className="text-xs text-zinc-500 dark:text-slate-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* ── LOCKED LESSONS PREVIEW ── */}
      <motion.div variants={slideUp} className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-slate-100 text-center">
          {child ? `What ${child.first_name} will unlock` : "Unlock the full curriculum"}
        </h2>

        <div className="space-y-2">
          {lockedLessons.slice(0, 4).map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-50 dark:bg-slate-700 border border-zinc-100 dark:border-slate-600"
            >
              <svg className="w-4 h-4 text-zinc-300 dark:text-slate-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-zinc-600 dark:text-slate-300 block truncate">
                  {lesson.title}
                </span>
                <span className="text-xs text-zinc-400 dark:text-slate-500">{lesson.skill}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-zinc-400 dark:text-slate-500 text-center">
          + {totalLockedLessons - Math.min(lockedLessons.length, 4)} more lessons across 5 reading levels
        </p>

        {/* Reading level progression */}
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {READING_LEVELS.map((level, i) => {
            const isCurrent = child?.reading_level === level;
            return (
              <div key={level} className="flex items-center gap-1.5">
                <div className="flex flex-col items-center gap-1">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      isCurrent
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-zinc-100 dark:bg-slate-700 text-zinc-400 dark:text-slate-400"
                    }`}
                  >
                    {level}
                  </span>
                  {isCurrent && (
                    <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      You are here
                    </span>
                  )}
                </div>
                {i < READING_LEVELS.length - 1 && (
                  <span className="text-zinc-200 dark:text-slate-600 text-xs">&rarr;</span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── COMPARISON TABLE: Free vs Readee+ ── */}
      <motion.div variants={slideUp} className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
        <div className="grid grid-cols-[1fr,80px,80px] sm:grid-cols-[1fr,100px,100px] text-center">
          {/* Header */}
          <div className="px-4 py-3 text-left text-sm font-bold text-zinc-700 dark:text-slate-300 border-b border-zinc-100 dark:border-slate-700">
            Feature
          </div>
          <div className="px-2 py-3 text-sm font-bold text-zinc-500 dark:text-slate-400 border-b border-zinc-100 dark:border-slate-700">
            Free
          </div>
          <div className="px-2 py-3 text-sm font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-b border-indigo-100 dark:border-indigo-900/30">
            Readee+
          </div>

          {/* Rows */}
          {COMPARISON_ROWS.map((row, i) => (
            <ComparisonRow key={i} feature={row.feature} free={row.free} premium={row.premium} isLast={i === COMPARISON_ROWS.length - 1} />
          ))}
        </div>
      </motion.div>

      {/* ── PRICING CARDS ── */}
      <motion.div variants={slideUp} className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-slate-100 text-center">
          Choose your plan
        </h2>
        <p className="text-sm text-zinc-500 dark:text-slate-400 text-center">
          Both plans include a 7-day free trial. Cancel anytime.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end pt-2">
          {/* Monthly */}
          <motion.div
            className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 space-y-4 self-center"
            whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-sm font-semibold text-zinc-500 dark:text-slate-400">Monthly</div>
            <div>
              <div className="text-3xl font-bold text-zinc-900 dark:text-slate-100">$9.99</div>
              <div className="text-sm text-zinc-500 dark:text-slate-400">/month</div>
            </div>
            <p className="text-xs text-zinc-400 dark:text-slate-500">Billed monthly. Flexibility to cancel anytime.</p>
            <button
              onClick={() => handleOpenModal("monthly")}
              className="w-full py-3.5 rounded-xl border-2 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
            >
              Start 7-Day Free Trial
            </button>
          </motion.div>

          {/* Annual — highlighted */}
          <motion.div
            className="rounded-2xl border-2 border-indigo-400 dark:border-indigo-500 bg-gradient-to-b from-white to-indigo-50/40 dark:from-slate-800 dark:to-indigo-950/20 p-7 space-y-4 relative shadow-lg shadow-indigo-100/50 dark:shadow-indigo-900/30"
            whileHover={{ y: -6, boxShadow: "0 16px 32px rgba(99,102,241,0.2)" }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-sm">
                Best Value — Save $21
              </span>
            </div>
            <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Annual</div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-zinc-900 dark:text-slate-100">$99</span>
                <span className="text-sm text-zinc-400 dark:text-slate-500 line-through">$119.88</span>
              </div>
              <div className="text-sm text-zinc-500 dark:text-slate-400">/year</div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-slate-400">
              Just <span className="font-semibold text-indigo-600 dark:text-indigo-400">$8.25/month</span> — billed annually
            </p>
            <button
              onClick={() => handleOpenModal("annual")}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-sm hover:from-indigo-700 hover:to-violet-600 transition-all shadow-md"
            >
              Start 7-Day Free Trial
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* ── TRUST SIGNALS ── */}
      <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-x-6 gap-y-2">
        {[
          { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", label: "7-day free trial" },
          { icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", label: "Cancel anytime" },
          { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "30-day money back" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-slate-400">
            <svg className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            {item.label}
          </div>
        ))}
      </motion.div>

      {/* ── TESTIMONIALS ── */}
      <motion.div variants={slideUp} className="space-y-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-slate-100 text-center">
          Parents love Readee
        </h3>
        <div className="space-y-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 space-y-3"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <svg key={j} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-zinc-700 dark:text-slate-300 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="text-xs text-zinc-500 dark:text-slate-400">
                <span className="font-semibold text-zinc-700 dark:text-slate-300">{t.name}</span> &middot; {t.detail}
              </div>
            </motion.div>
          ))}
        </div>
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
          {child
            ? `Start ${child.first_name}'s free trial today`
            : "Start your child's reading journey today"}
        </h2>
        <p className="text-indigo-100 text-sm max-w-md mx-auto">
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

/* ── Comparison Row Sub-component ── */
function ComparisonRow({ feature, free, premium, isLast }: { feature: string; free: boolean; premium: boolean; isLast: boolean }) {
  const borderClass = isLast ? "" : "border-b border-zinc-50 dark:border-slate-700/50";
  return (
    <>
      <div className={`px-4 py-3 text-left text-sm text-zinc-600 dark:text-slate-300 ${borderClass}`}>
        {feature}
      </div>
      <div className={`px-2 py-3 flex items-center justify-center ${borderClass}`}>
        {free ? (
          <svg className="w-5 h-5 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span className="w-4 h-0.5 bg-zinc-200 dark:bg-slate-600 rounded" />
        )}
      </div>
      <div className={`px-2 py-3 flex items-center justify-center bg-indigo-50/50 dark:bg-indigo-950/10 ${borderClass}`}>
        <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </>
  );
}
