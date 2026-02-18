"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
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

const FEATURES = [
  "40+ structured reading lessons",
  "Full curriculum from K through 4th grade",
  "Aligned to Common Core ELA standards",
  "Tracks progress across 5 reading levels",
  "Up to 5 children on one account",
  "Detailed parent progress reports",
  "Audio narration (coming soon)",
];

const FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel with one click, no questions asked.",
  },
  {
    q: "What happens to my child's progress if I cancel?",
    a: "All progress is saved. You just won't have access to premium lessons until you resubscribe.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes! Try Readee+ free for 7 days. You won't be charged until the trial ends.",
  },
  {
    q: "What's included in the free plan?",
    a: "The diagnostic assessment, your first 2 lessons per level, 1 child profile, and basic progress tracking.",
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

        if (childData) setChild(childData as Child);
        if (progressData) {
          // Count fully completed lessons
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
      // Silently handle — better UX than an error
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
    <div className="max-w-3xl mx-auto py-8 px-4 pb-16 space-y-12">
      {/* ── SECTION 1: Celebrate Progress ── */}
      {child && (
        <div className="text-center animate-slideUp">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            {child.first_name} is making amazing progress!
          </h1>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-sm font-medium text-amber-700">
              ⭐ {child.xp} XP earned
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-sm font-medium text-indigo-700">
              📚 {completedCount} lesson{completedCount !== 1 ? "s" : ""} completed
            </span>
            {child.reading_level && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-sm font-medium text-violet-700">
                📖 {child.reading_level}
              </span>
            )}
          </div>
        </div>
      )}

      {!child && (
        <div className="text-center animate-slideUp">
          <div className="text-5xl mb-4">🚀</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Unlock the full reading journey
          </h1>
          <p className="text-zinc-500 mt-2">
            Give your child access to the complete Readee curriculum
          </p>
        </div>
      )}

      {/* ── SECTION 2: What's Next ── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4 dash-slide-up-1">
        <h2 className="text-lg font-bold text-zinc-900 text-center">
          {child ? `Unlock ${child.first_name}'s full reading journey` : "Unlock the full curriculum"}
        </h2>

        <div className="space-y-2">
          {lockedLessons.slice(0, 5).map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-100"
            >
              <span className="text-lg">🔒</span>
              <span className="text-sm font-medium text-zinc-600">
                {lesson.title}
              </span>
            </div>
          ))}
        </div>

        <p className="text-sm text-zinc-400 text-center">
          ...and {totalLockedLessons - Math.min(lockedLessons.length, 5)} more lessons across 5 reading levels
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
                        : "bg-zinc-100 text-zinc-400"
                    }`}
                  >
                    {level}
                  </span>
                  {isCurrent && (
                    <span className="text-[9px] font-bold text-indigo-600 whitespace-nowrap">You are here</span>
                  )}
                </div>
                {i < READING_LEVELS.length - 1 && (
                  <span className="text-zinc-200 text-xs">→</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 3: Pricing Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end dash-slide-up-2">
        {/* Monthly */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4 self-center">
          <div>
            <div className="text-3xl font-bold text-zinc-900">$9.99</div>
            <div className="text-sm text-zinc-500">/month</div>
          </div>
          <p className="text-xs text-zinc-400">Billed monthly</p>
          <button
            onClick={() => handleOpenModal("monthly")}
            className="w-full py-3.5 rounded-xl border-2 border-indigo-600 text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition-all"
          >
            Start 7-Day Free Trial
          </button>
        </div>

        {/* Annual — highlighted */}
        <div className="rounded-2xl border-2 border-indigo-400 bg-gradient-to-b from-white to-indigo-50/40 p-7 space-y-4 relative shadow-lg shadow-indigo-100/50">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-sm">
              Best Value
            </span>
          </div>
          <div>
            <div className="text-3xl font-bold text-zinc-900">$99</div>
            <div className="text-sm text-zinc-500">/year</div>
          </div>
          <p className="text-xs text-zinc-500">
            <span className="font-semibold text-indigo-600">$8.25/month</span> — Save $20
          </p>
          <button
            onClick={() => handleOpenModal("annual")}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-sm hover:from-indigo-700 hover:to-violet-600 transition-all shadow-md"
          >
            Start 7-Day Free Trial
          </button>
        </div>
      </div>

      {/* ── SECTION 4: Trust Signals ── */}
      <div className="text-center dash-slide-up-3">
        <p className="text-xs text-zinc-400">
          Cancel anytime &middot; 30-day money-back guarantee &middot; No commitment
        </p>
      </div>

      {/* ── SECTION 5: What's Included ── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4 dash-slide-up-4">
        <h3 className="text-base font-bold text-zinc-900">What&apos;s included in Readee+</h3>
        <div className="space-y-3">
          {FEATURES.map((feature) => (
            <div key={feature} className="flex items-start gap-3">
              <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
              <span className="text-sm text-zinc-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 6: FAQ ── */}
      <div className="space-y-2 dash-slide-up-5">
        <h3 className="text-base font-bold text-zinc-900 mb-3">Frequently Asked Questions</h3>
        {FAQS.map((faq, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-50 transition-colors"
            >
              <span className="text-sm font-medium text-zinc-800">{faq.q}</span>
              <svg
                className={`w-4 h-4 text-zinc-400 transition-transform flex-shrink-0 ${
                  openFaq === i ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openFaq === i && (
              <div className="px-4 pb-4">
                <p className="text-sm text-zinc-500">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── SECTION 7: Secondary Exit ── */}
      <div className="text-center pt-4 dash-slide-up-6">
        <Link
          href="/dashboard"
          className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          Continue with Free Plan →
        </Link>
      </div>

      {/* ── Waitlist Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 space-y-5 animate-scaleIn relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 hover:bg-zinc-200 transition-colors"
            >
              ×
            </button>

            {!submitted ? (
              <>
                <div className="text-center">
                  <div className="text-4xl mb-3">🚀</div>
                  <h2 className="text-xl font-bold text-zinc-900">
                    Readee+ is launching soon!
                  </h2>
                  <p className="text-sm text-zinc-500 mt-2">
                    Be first in line and get <span className="font-semibold text-indigo-600">20% off</span> your first year.
                  </p>
                </div>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />

                <button
                  onClick={handleSubmitWaitlist}
                  disabled={!email.trim() || submitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-sm hover:from-indigo-700 hover:to-violet-600 transition-all shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Joining..." : "Join the Waitlist"}
                </button>

                <p className="text-[11px] text-zinc-400 text-center">
                  {modalPlan === "annual" ? "Annual plan selected" : "Monthly plan selected"} &middot; We&apos;ll email you when ready
                </p>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-xl font-bold text-zinc-900">
                  You&apos;re on the list!
                </h2>
                <p className="text-sm text-zinc-500 mt-2">
                  We&apos;ll email you when Readee+ is ready.
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-zinc-100 text-sm font-medium text-zinc-700 hover:bg-zinc-200 transition-colors"
                >
                  Got it!
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
