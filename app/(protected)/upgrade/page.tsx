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
  ChevronDown,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Lock,
  Award,
  GraduationCap,
} from "lucide-react";
// Single source of truth for billing copy, pricing, features, FAQ.
// If you edit any of these, update lib/billing-copy.ts — never inline.
import {
  PRICING,
  PREMIUM_FEATURES,
  REASON_COPY,
  FAQ as FAQS,
  TRUST_SIGNALS,
  SUPPORT,
} from "@/lib/billing-copy";
import { SkeletonPage } from "@/app/_components/Skeleton";

/* ─── Page ────────────────────────────────────────────── */

export default function UpgradePage() {
  return (
    <Suspense fallback={<SkeletonPage cards={3} />}>
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

  const monthlyPrice = PRICING.monthly.perMonth;
  const annualMonthly = PRICING.annual.perMonth;
  const annualTotal = PRICING.annual.perYear;
  const savings = Math.round(((monthlyPrice - annualMonthly) / monthlyPrice) * 100);

  // Teacher Solo is parked per the May 4 reshape — B2C-only. Live
  // Stripe products don't exist for it, so the CTA would error if
  // shown. Hidden until B2B reactivates.
  const showTeacherSolo = false;
  // Teacher Solo display values (only used if showTeacherSolo flips true)
  const teacherMonthly = 19;
  const teacherAnnualMonthly = 15;
  const teacherAnnualTotal = 180;

  // Even when reason=teacher_solo lands here today, fall back to
  // parent (premium) since the Teacher Solo card is hidden.
  const leadWithTeacher = false;

  const reasonCopy = reason ? REASON_COPY[reason] : null;

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  // Surface checkout failures to the parent inline instead of silently
  // un-spinning the button. Parents are typing in their card details
  // 30 seconds from now — a silent failure here is direct lost revenue.
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  async function handleStartTrial(sku: "premium" | "teacher_solo" = "premium") {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billing, sku }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return; // keep the spinner up during the Stripe redirect
      }
      setCheckoutError(
        data.error
          ? `Couldn't start checkout: ${data.error}. Try again — and email hello@readee.app if it keeps happening.`
          : "Couldn't start checkout. Try again — and email hello@readee.app if it keeps happening.",
      );
    } catch {
      setCheckoutError(
        "Couldn't reach Stripe. Check your connection and try again — email hello@readee.app if it keeps happening.",
      );
    } finally {
      setCheckoutLoading(false);
    }
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

  // If already on a paid plan, show confirmation tailored to the tier.
  if (plan === "premium" || plan === "teacher_solo") {
    const planLabel = plan === "teacher_solo" ? "Teacher Solo" : "Readee+";
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">You have {planLabel}</h1>
        <p className="text-zinc-500">
          You have full access to everything your plan includes.
        </p>
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

        {/* Single tier — Readee+ for parents. B2C-only per May 4 reshape. */}
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl border-2 border-indigo-300 bg-white p-6 text-left shadow-sm ring-2 ring-indigo-100">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                  Readee+
                </p>
                <p className="mt-0.5 text-sm text-zinc-500">For families</p>
              </div>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                Most parents
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-zinc-900">
                $
                {billing === "annual"
                  ? annualMonthly.toFixed(2)
                  : monthlyPrice.toFixed(2)}
              </span>
              <span className="text-sm text-zinc-400">/mo</span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-400">
              {billing === "annual"
                ? `$${annualTotal.toFixed(2)} billed annually · save ${savings}%`
                : `Billed monthly · cancel anytime`}
            </p>
            <ul className="mt-4 space-y-1.5 text-xs text-zinc-600">
              {PREMIUM_FEATURES.slice(0, 4).map((line) => (
                <li key={line} className="flex items-start gap-1.5">
                  <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-500" strokeWidth={2.4} />
                  {line}
                </li>
              ))}
              <li className="text-[11px] text-zinc-400">
                + {PREMIUM_FEATURES.length - 4} more — see below
              </li>
            </ul>
            <button
              onClick={() => handleStartTrial("premium")}
              disabled={checkoutLoading}
              className="mt-5 w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {checkoutLoading
                ? "Redirecting…"
                : `Start ${PRICING.trialDays}-day free trial`}
            </button>
            {checkoutError && (
              <div
                role="alert"
                className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
              >
                {checkoutError}
              </div>
            )}
            <p className="mt-2 text-center text-[11px] text-zinc-400">
              No charge until day {PRICING.trialDays + 1}. Cancel anytime.
            </p>
          </div>
        </div>

        {/* Trust signal row directly under the price card — close to the
            CTA for max impact. */}
        <ul className="mx-auto flex max-w-md flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] font-semibold text-zinc-500">
          {TRUST_SIGNALS.map((t) => (
            <li key={t} className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3 text-emerald-500" strokeWidth={2.4} />
              {t}
            </li>
          ))}
        </ul>

        <p className="text-center text-xs text-zinc-400">
          Questions? <a href={`mailto:${SUPPORT.email}`} className="underline hover:text-zinc-600">{SUPPORT.email}</a>
        </p>
      </motion.div>

      {/* ── Features ── */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-lg font-bold text-zinc-900 text-center">
          Everything in Readee+
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PREMIUM_FEATURES.map((line) => (
            <li
              key={line}
              className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-white p-4 shadow-sm"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                <Check className="h-4 w-4 text-indigo-600" strokeWidth={2.4} />
              </div>
              <p className="text-sm leading-snug text-zinc-700">{line}</p>
            </li>
          ))}
        </ul>

        {/* What's free — explicit so parents know the gate, not just
            the gold version. Trust through clarity. */}
        <details className="group rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-zinc-700 [&::-webkit-details-marker]:hidden">
            <Lock className="mr-2 inline h-3.5 w-3.5 text-zinc-500" strokeWidth={2.2} />
            What&apos;s in the Free plan?
          </summary>
          <ul className="mt-3 space-y-1.5 text-xs text-zinc-600">
            <li>• The adaptive K–4 placement test</li>
            <li>• First lesson per grade level</li>
            <li>• 10 practice questions per standard</li>
            <li>• 2 stories per grade</li>
            <li>• Daily question (free, no login)</li>
            <li>• Community library (free, no login)</li>
          </ul>
          <p className="mt-3 text-xs text-zinc-500">
            Free is genuinely useful — try it. Most families upgrade once
            their reader hits the practice cap or runs out of stories.
          </p>
        </details>
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
          onClick={() => handleStartTrial(leadWithTeacher ? "teacher_solo" : "premium")}
          disabled={checkoutLoading}
          className={`w-full py-3.5 rounded-xl text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-50 ${
            leadWithTeacher
              ? "bg-violet-600 hover:bg-violet-700"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {checkoutLoading
            ? "Redirecting..."
            : leadWithTeacher
            ? "Start Teacher Solo trial"
            : "Start 7-Day Free Trial"}
        </button>
        {checkoutError && (
          <div
            role="alert"
            className="mx-auto max-w-sm rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
          >
            {checkoutError}
          </div>
        )}
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
