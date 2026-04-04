"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { usePlanStore } from "@/lib/stores/plan-store";
import {
  Check,
  BookOpen,
  Headphones,
  Users,
  BarChart3,
  GraduationCap,
  Award,
  Star,
  Flame,
  Palette,
  ChevronDown,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

/* ─── Constants ───────────────────────────────────────── */

const FEATURES = [
  { icon: BookOpen, text: "All 57 lessons, Kindergarten through 4th grade" },
  { icon: Headphones, text: "911 standards-aligned practice questions" },
  { icon: GraduationCap, text: "Full Reading Journey with progress tracking" },
  { icon: Flame, text: "XP system, streaks, and daily rewards" },
  { icon: Palette, text: "Avatar customization and backgrounds" },
  { icon: Users, text: "Up to 5 child profiles per household" },
  { icon: BarChart3, text: "Detailed parent analytics and reports" },
  { icon: Star, text: "25 original stories with comprehension questions" },
];

const REASON_COPY: Record<string, { title: string; subtitle: string }> = {
  lesson: {
    title: "Unlock all 57 lessons",
    subtitle: "Your child has finished the free lessons. Upgrade to continue the full curriculum.",
  },
  practice: {
    title: "Unlock unlimited practice",
    subtitle: "Free accounts are limited to 10 questions per standard. Upgrade for unlimited practice.",
  },
  analytics: {
    title: "See your child's full progress",
    subtitle: "Parent analytics show strengths, weaknesses, and growth over time.",
  },
  story: {
    title: "Unlock all 25 stories",
    subtitle: "Free accounts include 2 stories per grade. Upgrade for the full library.",
  },
  child: {
    title: "Add another reader",
    subtitle: "Free accounts support 1 child profile. Upgrade to add up to 5.",
  },
};

const FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel with one click, no questions asked. You keep access through the end of your billing period.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes. Try Readee+ free for 7 days. You won't be charged until the trial ends, and you can cancel anytime during the trial.",
  },
  {
    q: "What's included in the free plan?",
    a: "The diagnostic assessment, your first 5 lessons per level, 1 child profile, and unlimited practice questions. Upgrade to unlock everything.",
  },
  {
    q: "What happens to my child's progress if I cancel?",
    a: "All progress is saved permanently. You just won't have access to premium features until you resubscribe.",
  },
  {
    q: "What ages is Readee designed for?",
    a: "Readee covers Kindergarten through 4th grade. The diagnostic assessment places your child at exactly the right level.",
  },
  {
    q: "How is Readee different from other reading apps?",
    a: "Readee is built on real Common Core ELA standards — the same ones teachers use in school. Every lesson follows a learn, practice, read structure so kids build skills in order.",
  },
];

/* ─── Page ────────────────────────────────────────────── */

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
  const router = useRouter();
  const reason = searchParams.get("reason");
  const plan = usePlanStore((s) => s.plan);
  const fetchPlan = usePlanStore((s) => s.fetch);

  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoResult, setPromoResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  const monthlyPrice = 9.99;
  const annualMonthly = 6.99;
  const annualTotal = 83.88;
  const savings = Math.round(((monthlyPrice - annualMonthly) / monthlyPrice) * 100);

  const reasonCopy = reason ? REASON_COPY[reason] : null;

  async function handleStartTrial() {
    // Stripe checkout placeholder
    console.log(`Starting 7-day free trial — ${billing} plan`);
  }

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
      if (data.success) {
        fetchPlan();
      }
    } catch {
      setPromoResult({ success: false, message: "Something went wrong." });
    }
    setPromoLoading(false);
  }

  // If already premium, show confirmation
  if (plan === "premium") {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">You have Readee+</h1>
        <p className="text-zinc-500">You have full access to all lessons, stories, and features.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 pb-20 space-y-12">
      {/* ── Hero ── */}
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {reasonCopy ? (
          <>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
              {reasonCopy.title}
            </h1>
            <p className="text-zinc-500 max-w-md mx-auto">{reasonCopy.subtitle}</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
              Unlock the full{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                reading journey
              </span>
            </h1>
            <p className="text-zinc-500 max-w-md mx-auto">
              A complete K-4 reading curriculum built by educators. 57 lessons, 911 practice questions, and everything your child needs to become a confident reader.
            </p>
          </>
        )}
      </motion.div>

      {/* ── Pricing Cards ── */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              billing === "monthly"
                ? "bg-indigo-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              billing === "annual"
                ? "bg-indigo-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            Annual
            <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">
              Save {savings}%
            </span>
          </button>
        </div>

        {/* Price Card */}
        <div className="rounded-2xl border-2 border-indigo-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-indigo-600 mb-2">Readee+</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-extrabold text-zinc-900">
              ${billing === "annual" ? annualMonthly.toFixed(2) : monthlyPrice.toFixed(2)}
            </span>
            <span className="text-zinc-400 text-sm">/month</span>
          </div>
          {billing === "annual" && (
            <p className="text-xs text-zinc-400 mt-1">
              ${annualTotal.toFixed(2)} billed annually
            </p>
          )}

          <button
            onClick={handleStartTrial}
            className="w-full mt-6 py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Start 7-Day Free Trial
          </button>

          <p className="text-xs text-zinc-400 mt-3">
            Cancel anytime &middot; No commitment
          </p>
        </div>
      </motion.div>

      {/* ── Features ── */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-lg font-bold text-zinc-900 text-center">Everything in Readee+</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.text}
                className="flex items-start gap-3 p-4 rounded-xl bg-white border border-zinc-100 shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-indigo-600" />
                </div>
                <p className="text-sm text-zinc-700 leading-snug">{f.text}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Trust Signal ── */}
      <motion.div
        className="rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 p-6 border border-indigo-100"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="font-bold text-zinc-900">Built by a reading specialist</p>
            <p className="text-sm text-zinc-600 mt-1">
              Every lesson in Readee was designed by{" "}
              <span className="font-semibold">Jennifer Klingerman</span> — Certified Reading Specialist,
              3rd Grade Teacher, and Readee co-founder. The curriculum is aligned to Common Core ELA
              and grounded in the Science of Reading.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-xs font-medium text-indigo-700 border border-indigo-200">
                <ShieldCheck className="w-3 h-3" /> Certified Reading Specialist
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-xs font-medium text-indigo-700 border border-indigo-200">
                <GraduationCap className="w-3 h-3" /> 3rd Grade Teacher
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-xs font-medium text-indigo-700 border border-indigo-200">
                <BookOpen className="w-3 h-3" /> Readee Co-founder
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Promo Code ── */}
      <motion.div
        className="rounded-2xl bg-white border border-zinc-100 p-6 shadow-sm space-y-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        <p className="text-sm font-semibold text-zinc-900">Have a promo code?</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={handleRedeemPromo}
            disabled={promoLoading || !promoCode.trim()}
            className="px-5 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {promoLoading ? "Redeeming..." : "Redeem"}
          </button>
        </div>
        {promoResult && (
          <p className={`text-sm ${promoResult.success ? "text-emerald-600" : "text-red-500"}`}>
            {promoResult.message}
          </p>
        )}
      </motion.div>

      {/* ── FAQ ── */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-lg font-bold text-zinc-900 text-center">Frequently asked questions</h2>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-xl border border-zinc-100 bg-white overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-5 py-4 flex items-center justify-between text-left"
              >
                <span className="text-sm font-semibold text-zinc-900">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-200 flex-shrink-0 ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-zinc-500 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Bottom CTA ── */}
      <div className="space-y-3 text-center pb-4">
        <button
          onClick={handleStartTrial}
          className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Start 7-Day Free Trial
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Continue with free plan
        </Link>
      </div>
    </div>
  );
}
