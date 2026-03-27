"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import CelebrationOverlay from "@/app/_components/CelebrationOverlay";
import { safeValidate } from "@/lib/validate";
import { ChildSchema } from "@/lib/schemas";
import { Child } from "@/lib/db/types";
import { levelNameToGradeKey } from "@/lib/assessment/questions";
import lessonsData from "@/lib/data/lessons.json";
import { getChildAvatarImage } from "@/lib/utils/get-child-avatar";
import {
  Lock,
  ShieldCheck,
  BadgeDollarSign,
  BookOpen,
  Star,
  Users,
  Headphones,
  BarChart3,
  GraduationCap,
  ChevronRight,
} from "lucide-react";

/* ─── Data ─────────────────────────────────────────── */

const BENEFIT_CARDS = [
  { icon: BookOpen, title: "42+ structured lessons", description: "Guided reading practice from phonics to comprehension" },
  { icon: Headphones, title: "Audio narration", description: "Every question read aloud so kids stay independent" },
  { icon: Users, title: "5 child profiles", description: "One household plan covers every reader in your family" },
  { icon: BarChart3, title: "Parent reports", description: "See exactly where your child is growing and what needs work" },
  { icon: Star, title: "5 reading levels", description: "Kindergarten through 4th grade, each with its own curriculum" },
  { icon: GraduationCap, title: "Standards-aligned", description: "Built on Common Core ELA so practice matches what school expects" },
];

const ICON_BG: Record<string, string> = {
  BookOpen: "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
  Headphones: "bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400",
  Users: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
  BarChart3: "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
  Star: "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400",
  GraduationCap: "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400",
};

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
  {
    quote: "We tried three other apps before Readee. This is the only one my daughter actually asks to open. The lessons feel like games but she's actually learning.",
    name: "Amanda T.",
    detail: "Mom of a 2nd grader",
  },
];

const TESTIMONIAL_BORDER_COLORS = ["#6366f1", "#6d28d9", "#8b5cf6", "#a78bfa"];

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
  {
    q: "How is Readee different from other reading apps?",
    a: "Readee is built on real Common Core ELA standards — the same ones teachers use in school. Every lesson is structured with learn, practice, and read sections so kids build skills in order. Most apps are just random quizzes. Readee is a full curriculum.",
  },
];

/* ─── Types ────────────────────────────────────────── */

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

/* ─── CountUp hook ─────────────────────────────────── */

function useCountUp(target: number, inView: boolean, duration = 700) {
  const [value, setValue] = useState(0);
  const counted = useRef(false);

  useEffect(() => {
    if (!inView || counted.current || target === 0) {
      if (target === 0) setValue(0);
      return;
    }
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
  }, [inView, target, duration]);

  return value;
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

  // Promo code state
  const [showPromo, setShowPromo] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoResult, setPromoResult] = useState<{ success: boolean; message: string } | null>(null);

  // Refs for scroll-triggered sections
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.5 });

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

  async function handleRedeemPromo() {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoResult(null);
    try {
      const res = await fetch("/api/promo/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim() }),
      });
      const data = await res.json();
      setPromoResult({ success: data.success, message: data.message });
    } catch {
      setPromoResult({ success: false, message: "Something went wrong. Please try again." });
    }
    setPromoLoading(false);
  }

  // Get locked lessons for preview
  const file = lessonsData as unknown as LessonsFile;
  const gradeKey = child?.reading_level ? levelNameToGradeKey(child.reading_level) : "kindergarten";
  const currentLessons = file.levels[gradeKey]?.lessons || [];
  const lockedLessons = currentLessons.filter((l) => !isLessonFree(l.id));
  const totalLockedLessons = Object.values(file.levels)
    .flatMap((l) => l.lessons)
    .filter((l) => !isLessonFree(l.id)).length;

  const childName = child?.first_name;
  const avatarSrc = child ? getChildAvatarImage(child, 0) : null;

  // CountUp values (only used when child exists)
  const storiesCount = useCountUp(child?.stories_read ?? 0, statsInView);
  const streakCount = useCountUp(child?.streak_days ?? 0, statsInView);
  const waitingCount = useCountUp(lockedLessons.length, statsInView);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 pb-16 space-y-10 min-h-screen bg-gradient-to-b from-white via-indigo-50/30 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">

      {/* ── PERSONALIZED HERO ── */}
      <div className="text-center space-y-5">
        {avatarSrc ? (
          <motion.div
            className="flex justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
          >
            <Image
              src={avatarSrc}
              alt={`${childName}'s avatar`}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full border-2 border-indigo-200 dark:border-indigo-700 shadow-lg"
            />
          </motion.div>
        ) : null}

        <motion.h1
          className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-slate-100 tracking-tight leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {childName ? (
            <>
              {childName} is ready for the next step in their{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                reading journey
              </span>
            </>
          ) : (
            <>
              Unlock the full{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                reading journey
              </span>{" "}
              with{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                  Readee+
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent bg-[length:200%_100%] bg-clip-text text-transparent animate-textShimmer pointer-events-none" aria-hidden="true">
                  Readee+
                </span>
              </span>
            </>
          )}
        </motion.h1>

        <motion.p
          className="text-zinc-500 dark:text-slate-400 max-w-md mx-auto"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          {childName && child?.reading_level
            ? `${childName} is at the ${child.reading_level} level. Readee+ unlocks the full curriculum so they can keep growing.`
            : "42+ structured lessons, audio narration, and a full K\u20134th grade curriculum \u2014 all aligned to Common Core ELA standards."}
        </motion.p>

        <motion.div
          className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.55 }}
        >
          One Readee+ household plan covers up to 5 children
        </motion.div>
      </div>

      {/* ── CHILD PROGRESS SNAPSHOT (counting numbers) ── */}
      {child && (
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5"
        >
          <div className="grid grid-cols-3 divide-x divide-zinc-100 dark:divide-slate-700">
            {[
              { value: storiesCount, label: "lessons completed" },
              { value: streakCount, label: "day streak" },
              { value: waitingCount, label: "lessons waiting" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center px-2"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 * i }}
              >
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stat.value}</div>
                <div className="text-xs text-zinc-500 dark:text-slate-400 mt-0.5">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── LOCKED LESSONS PREVIEW (staggered rows) ── */}
      <div className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 space-y-4">
        <motion.h2
          className="text-lg font-bold text-zinc-900 dark:text-slate-100 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {childName ? `Lessons waiting for ${childName}` : "What your child will unlock"}
        </motion.h2>

        <div className="space-y-2">
          {lockedLessons.slice(0, 5).map((lesson, i) => (
            <motion.div
              key={lesson.id}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-50 dark:bg-slate-700 border border-zinc-100 dark:border-slate-600"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 * i, ease: "easeOut" }}
            >
              <Lock className="w-4 h-4 text-zinc-300 dark:text-slate-500 flex-shrink-0 transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400" strokeWidth={2} />
              <span className="text-sm font-medium text-zinc-600 dark:text-slate-300 truncate flex-1">
                {lesson.title}
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-slate-500 flex-shrink-0 transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400" strokeWidth={2} />
            </motion.div>
          ))}
        </div>

        {totalLockedLessons > 5 && (
          <motion.p
            className="text-sm text-zinc-400 dark:text-slate-500 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            +{totalLockedLessons - 5} more lessons across 5 reading levels
          </motion.p>
        )}
      </div>

      {/* ── BENEFIT CARDS (staggered pop-in) ── */}
      <div className="space-y-4">
        <motion.h2
          className="text-lg font-bold text-zinc-900 dark:text-slate-100 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          Everything included with Readee+
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BENEFIT_CARDS.map((card, i) => {
            const Icon = card.icon;
            const colorClass = ICON_BG[card.icon.displayName || Icon.name] || ICON_BG.BookOpen;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: 0.08 * i, ease: "easeOut" }}
                whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(99,102,241,0.12)" }}
                className="flex items-start gap-3 p-4 rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-shadow"
              >
                <motion.div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
                  initial={{ rotate: -15, scale: 0.7 }}
                  whileInView={{ rotate: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 250, damping: 15, delay: 0.08 * i + 0.15 }}
                >
                  <Icon className="w-4.5 h-4.5" strokeWidth={1.8} />
                </motion.div>
                <div>
                  <div className="text-sm font-bold text-zinc-800 dark:text-slate-200">{card.title}</div>
                  <div className="text-xs text-zinc-500 dark:text-slate-400 mt-0.5 leading-relaxed">{card.description}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── PRICING — SIDE BY SIDE (slide from opposite sides) ── */}
      <div className="space-y-6">
        <motion.h2
          className="text-xl font-bold text-zinc-900 dark:text-slate-100 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {childName ? `Give ${childName} everything they need` : "Choose your plan"}
        </motion.h2>
        <motion.p
          className="text-center text-sm text-zinc-500 dark:text-slate-400 -mt-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          7-day free trial. Cancel anytime. One plan covers your whole family.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Monthly card — slides from left */}
          <motion.div
            className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-7 flex flex-col justify-between space-y-6 order-2 md:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ y: -4 }}
          >
            <div className="space-y-1">
              <div className="text-sm font-semibold text-zinc-500 dark:text-slate-400">Monthly</div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-zinc-900 dark:text-slate-100">$9.99</span>
                <span className="text-sm text-zinc-400 dark:text-slate-500">/month</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-slate-400 pt-1">Billed monthly</p>
              <p className="text-xs text-zinc-400 dark:text-slate-500 pt-2">Includes up to 5 child profiles</p>
            </div>

            <button
              onClick={() => handleOpenModal("monthly")}
              className="w-full py-4 rounded-xl border-2 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
            >
              Start 7-Day Free Trial
            </button>
          </motion.div>

          {/* Annual card — slides from right */}
          <motion.div
            className="relative rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-7 flex flex-col justify-between space-y-6 order-1 md:order-2 md:-mt-2 shadow-xl shadow-indigo-300/40 dark:shadow-indigo-900/50"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
            whileHover={{ y: -6 }}
          >
            {/* Best Value badge */}
            <motion.div
              className="absolute -top-3 -right-2 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-md"
              initial={{ scale: 0, rotate: -20 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.5 }}
            >
              Best Value
            </motion.div>

            <div className="space-y-1">
              <div className="text-sm font-semibold text-white/80">Annual</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">$79.99</span>
                <span className="text-sm text-white/60 line-through">$119.88</span>
                <span className="text-sm text-white/70">/year</span>
              </div>
              <p className="text-sm font-bold text-white pt-1">Just $6.67/month</p>
              <span className="inline-block mt-2 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-400/20 text-emerald-100 border border-emerald-300/30">
                Save 40%
              </span>
              <p className="text-xs text-white/70 pt-2">Includes up to 5 child profiles</p>
            </div>

            <button
              onClick={() => handleOpenModal("annual")}
              className="w-full py-4 rounded-xl bg-white text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition-all shadow-md"
            >
              Start 7-Day Free Trial
            </button>
          </motion.div>
        </div>

        <motion.p
          className="text-center text-xs text-zinc-400 dark:text-slate-500"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          7 days free, then your selected plan. Cancel anytime.
        </motion.p>

        {/* Trust badges */}
        <motion.div
          className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-zinc-500 dark:text-slate-400"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <span className="inline-flex items-center gap-1"><Lock className="w-3.5 h-3.5" strokeWidth={1.5} /> Secure payment</span>
          <span className="text-zinc-300 dark:text-slate-600">&middot;</span>
          <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} /> Cancel anytime</span>
          <span className="text-zinc-300 dark:text-slate-600">&middot;</span>
          <span className="inline-flex items-center gap-1"><BadgeDollarSign className="w-3.5 h-3.5" strokeWidth={1.5} /> 30-day money back</span>
        </motion.div>
      </div>

      {/* ── PROMO CODE ── */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
      >
        {!showPromo ? (
          <button
            onClick={() => setShowPromo(true)}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
          >
            Have a promo code?
          </button>
        ) : (
          <motion.div
            className="max-w-sm mx-auto space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => { setPromoCode(e.target.value); setPromoResult(null); }}
                placeholder="Enter promo code"
                disabled={promoResult?.success}
                className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-zinc-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-zinc-400 dark:placeholder:text-slate-500 disabled:opacity-50"
                onKeyDown={(e) => { if (e.key === "Enter") handleRedeemPromo(); }}
              />
              <button
                onClick={handleRedeemPromo}
                disabled={promoLoading || !promoCode.trim() || promoResult?.success}
                className="px-5 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {promoLoading ? "..." : "Redeem"}
              </button>
            </div>
            {promoResult && (
              <div className={`flex items-center justify-center gap-2 text-sm font-medium ${promoResult.success ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                {promoResult.success && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {promoResult.message}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* ── TESTIMONIALS (staggered, alternating slide) ── */}
      <div className="space-y-4">
        <motion.h3
          className="text-lg font-bold text-zinc-900 dark:text-slate-100 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          Trusted by parents and teachers
        </motion.h3>

        <div className="space-y-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              className="relative rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 space-y-2"
              style={{ borderLeftWidth: 3, borderLeftColor: TESTIMONIAL_BORDER_COLORS[i % TESTIMONIAL_BORDER_COLORS.length] }}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: 0.1 * i, ease: "easeOut" }}
            >
              <span className="absolute top-1 right-3 text-5xl font-serif leading-none text-indigo-100 dark:text-indigo-900/40 pointer-events-none select-none">&ldquo;</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <motion.svg
                    key={j}
                    className="w-3.5 h-3.5 text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.2, delay: 0.1 * i + 0.05 * j + 0.2 }}
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </motion.svg>
                ))}
              </div>
              <p className="text-sm text-zinc-700 dark:text-slate-300 leading-relaxed relative z-10">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="text-xs text-zinc-500 dark:text-slate-400">
                <span className="font-semibold text-zinc-700 dark:text-slate-300">{t.name}</span> &middot; {t.detail}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── FAQ (staggered from right) ── */}
      <div className="space-y-3">
        <motion.h3
          className="text-lg font-bold text-zinc-900 dark:text-slate-100 text-center mb-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          Questions parents ask
        </motion.h3>
        {FAQS.map((faq, i) => (
          <motion.div
            key={i}
            className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.35, delay: 0.07 * i, ease: "easeOut" }}
          >
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <span className="text-sm font-medium text-zinc-800 dark:text-slate-200">{faq.q}</span>
              <motion.svg
                className="w-4 h-4 text-zinc-400 dark:text-slate-500 flex-shrink-0 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: openFaq === i ? 180 : 0 }}
                transition={{ duration: 0.25 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>
            <AnimatePresence>
              {openFaq === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4">
                    <p className="text-sm text-zinc-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* ── FINAL CTA (scale up) ── */}
      <motion.div
        className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-center space-y-4 shadow-xl shadow-indigo-200/40 dark:shadow-indigo-900/40"
        initial={{ opacity: 0, scale: 0.88 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          {childName ? `${childName}\u2019s reading adventure starts here` : "Start your child\u2019s reading journey today"}
        </h2>
        <p className="text-white/80 text-sm max-w-md mx-auto">
          7 days free, then just $6.67/month with the annual plan. Cancel anytime — no risk, no commitment.
        </p>
        <motion.button
          onClick={() => handleOpenModal("annual")}
          className="px-8 py-4 rounded-xl bg-white text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition-all shadow-md"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Start 7-Day Free Trial
        </motion.button>
      </motion.div>

      {/* ── Secondary Exit ── */}
      <motion.div
        className="text-center pt-2 pb-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Link
          href="/dashboard"
          className="text-sm text-zinc-400 dark:text-slate-500 hover:text-zinc-600 dark:hover:text-slate-300 transition-colors"
        >
          Continue with Free Plan &rarr;
        </Link>
      </motion.div>

      {/* ── Celebration Overlay (promo success) ── */}
      <CelebrationOverlay show={!!promoResult?.success} />

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
    </div>
  );
}
