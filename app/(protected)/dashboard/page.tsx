"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { effectiveStreak } from "@/lib/streak/effective-streak";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child, LessonProgress } from "@/lib/db/types";
import { levelNameToGradeKey } from "@/lib/assessment/questions";
import lessonsData from "@/lib/data/lessons.json";
import { computeJourneyProgress } from "@/lib/journey/next-lesson";
import { firstUnitDomainByGrade, isLessonInFreeUnit } from "@/lib/plan/free-lessons";
import { TRIAL_DAYS } from "@/lib/plan/access";
import sampleLessons from "@/app/data/sample-lessons.json";
import LevelProgressBar from "@/app/_components/LevelProgressBar";
import { useChildStore } from "@/lib/stores/child-store";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { usePlanStore } from "@/lib/stores/plan-store";
import { safeValidate } from "@/lib/validate";
import { ChildSchema } from "@/lib/schemas";
import { staggerContainer, slideUp, staggerFast } from "@/lib/motion/variants";
import { getStandardsForGrade } from "@/lib/data/all-standards";
import { getChildAvatarImage, AVATAR_IMAGES, DEFAULT_AVATARS } from "@/lib/utils/get-child-avatar";
import { getItemsByCategory, BACKGROUND_IMAGES } from "@/lib/data/shop-items";
import type { ShopPurchase, EquippedItems } from "@/lib/db/types";
import type { ReactNode } from "react";
import { getShopIcon } from "@/lib/data/shop-icons";
import { SkeletonPage } from "@/app/_components/Skeleton";
import ProductSearchBar from "@/app/_components/ProductSearchBar";
import { trackFunnelClient } from "@/lib/analytics/funnel";
import KidWelcomeFlow from "./_components/KidWelcomeFlow";
import LevelBadge from "@/app/_components/LevelBadge";
import { useLifetimeCarrots } from "@/lib/levels/use-lifetime-carrots";
import { computeLevel } from "@/lib/levels/levels";
import KidHome from "./_components/KidHome";
import UpgradeCelebration from "./_components/UpgradeCelebration";
import WhatsNew from "./_components/WhatsNew";
import { OUTFITS, isOutfitAvailable } from "@/app/_components/Bunny/outfits";
import { FluentIcon } from "@/app/_components/FluentIcon";
import { Glyph } from "@/app/_components/Glyph";

/** Placement v2 (Luna-run exam + reveal) replaces the legacy quiz when this flag is on. */
// Placement v2 (Luna-run reading exam + reveal) is the default; NEXT_PUBLIC_PLACEMENT_V2=0 falls back to the old quiz.
const PLACEMENT_V2 = process.env.NEXT_PUBLIC_PLACEMENT_V2 !== "0";

// Set of standards that have a real canonical lesson on the /learn
// slideshow route. Used to route navigation to /learn when possible
// and only fall back to the legacy /lesson route when there's no
// canonical lesson for that standard.
const LEARN_STANDARDS = new Set(
  (sampleLessons as Array<{ standardId: string }>).map((l) => l.standardId),
);

// 15 legacy lessons in lib/data/lessons.json have an empty standards
// array (5 K decodables + all 10 4th-grade lessons); map them by
// stable lesson ID to their canonical CCSS standard.
const LESSON_ID_TO_STANDARD: Record<string, string> = {
  "k-L9": "RF.K.3a", "k-L10": "RF.K.3a", "k-L11": "RF.K.3a",
  "k-L12": "RF.K.3a", "k-L13": "RF.K.3a",
  "4-L1": "L.4.4b", "4-L2": "L.4.5a", "4-L3": "L.4.5b", "4-L4": "RI.4.5",
  "4-L5": "RL.4.2", "4-L6": "RL.4.6", "4-L7": "RI.4.8", "4-L8": "L.4.4a",
  "4-L9": "RL.4.3", "4-L10": "RI.4.2",
};

/**
 * Resolve a legacy lessons.json lesson to a canonical /learn standard.
 * lessons.json uses "RF.K.1.d"; sample-lessons.json uses "RF.K.1d".
 * Returns the standard only when a real canonical lesson exists for it
 * (so callers never link to a /learn page that can't render); otherwise
 * null → caller keeps the legacy /lesson route.
 */
function lessonToLearnStandard(lesson: { id: string; standards?: string[] }): string | null {
  const raw = (lesson.standards ?? [])[0];
  const std = raw ? raw.replace(/\.([a-z])$/, "$1") : LESSON_ID_TO_STANDARD[lesson.id] ?? null;
  return std && LEARN_STANDARDS.has(std) ? std : null;
}

/** Friendly reading-level label for the momentum card. Pre-K is an internal
 *  tier only — never shown to families — so it surfaces as Kindergarten. */
function prettyLevel(lvl?: string | null): string {
  if (!lvl) return "just-right";
  const s = lvl.toLowerCase();
  if (s.includes("pre") || s.startsWith("k")) return "Kindergarten";
  const n = lvl.replace(/\D/g, "");
  return n ? `Grade ${n}` : lvl;
}

/**
 * Below-the-fold dashboard subcomponents — dynamic-imported for the
 * bundle-size win but with SSR ON (default) so the server renders
 * the initial markup and the layout doesn't shift when the chunk
 * finishes loading on the client. Components that *always* render
 * visible content get a sized skeleton; components that usually
 * render null (TeacherAssignments / FreshForYou / Testimonial) keep
 * loading=null because there's no layout to reserve when they no-op.
 *
 * CLS regression from the previous pass was caused by `ssr: false` +
 * `loading: () => null` together — content popped in mid-page after
 * hydration. Real fix is to keep them in SSR.
 */
const DailyQuestionCard = dynamic(
  () => import("@/app/_components/DailyQuestionCard"),
  { loading: () => <div className="rounded-3xl bg-zinc-100 animate-pulse" style={{ height: 420 }} /> },
);
const SharpenUpCard = dynamic(
  () => import("@/app/_components/SharpenUpCard"),
  // No SSR fallback — the tile self-hides when there's nothing to
  // show (no weak spots yet), so reserving layout would cause CLS.
  { ssr: false, loading: () => null },
);
const TeacherAssignmentsCard = dynamic(
  () => import("@/app/_components/TeacherAssignmentsCard"),
  { ssr: false, loading: () => null },
);
const TestimonialPrompt = dynamic(
  () => import("@/app/_components/TestimonialPrompt"),
  { ssr: false, loading: () => null },
);

/* ─── Count-up animation hook ─────────────────────────── */

function useCountUp(target: number, duration = 800) {
  const safeTarget = Number(target) || 0;
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    if (counted.current || safeTarget === 0) { setValue(safeTarget); return; }
    const el = ref.current;
    if (!el) { setValue(safeTarget); return; }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const start = performance.now();
          function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * safeTarget));
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
  }, [safeTarget, duration]);

  return { value, ref };
}

const GRADE_KEYS = ["pre-k", "kindergarten", "1st", "2nd", "3rd", "4th"] as const;
const GRADE_LABELS: Record<string, string> = {
  "pre-k": "Kindergarten",
  "kindergarten": "Kindergarten",
  "1st": "1st Grade",
  "2nd": "2nd Grade",
  "3rd": "3rd Grade",
  "4th": "4th Grade",
};

const MOTIVATIONAL = [
  "You're doing amazing!",
  "Every lesson makes you stronger!",
  "Reading superstar in the making!",
  "Keep it up, you're on fire!",
  "Your brain is growing!",
  "One more page, one more adventure!",
  "Readers are leaders!",
  "You're unstoppable!",
];

function formatSkillName(skill: string): string {
  return skill
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const DOMAIN_FRIENDLY_NAMES: Record<string, string> = {
  "Reading Literature": "Reading stories and answering questions",
  "Reading Informational Text": "Learning from real-world texts",
  "Foundational Skills": "Building reading skills",
  "Language": "Words and language practice",
};

function getFriendlyTopicName(domain: string): string {
  return DOMAIN_FRIENDLY_NAMES[domain] || "Reading practice";
}

function getGreeting(): { text: string; icon: ReactNode } {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good morning", icon: <FluentIcon name="sun" size={32} /> };
  if (h < 17) return { text: "Good afternoon", icon: <FluentIcon name="sun-cloud" size={32} /> };
  return { text: "Good evening", icon: <FluentIcon name="moon" size={32} /> };
}

function DashboardBackdrop({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <img src={src} alt="" className="hidden" onLoad={() => setLoaded(true)} />
      {!loaded && <div className="fixed inset-0 -z-10 skeleton-shimmer" />}
      <div
        className={`fixed inset-0 -z-10 transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
        style={{ backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
    </>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const children = useChildStore((s) => s.children);
  const selectedChild = useChildStore((s) => s.childData);
  const setStoreChildren = useChildStore((s) => s.setChildren);
  const setStoreChildData = useChildStore((s) => s.setChildData);
  const [loading, setLoading] = useState(true);
  const userPlan = usePlanStore((s) => s.rawPlan) ?? "free";
  const fetchPlan = usePlanStore((s) => s.fetch);
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);
  // Distinguishes "no children yet (show onboarding)" from "DB blip
  // (don't push them into onboarding by accident)". Without this a
  // transient Supabase error makes a real parent think their kid
  // got wiped.
  const [childrenLoadError, setChildrenLoadError] = useState(false);

  useEffect(() => {
    if (searchParams.get("checkout") !== "success") return;
    setShowCheckoutSuccess(true);
    router.replace("/dashboard", { scroll: false });

    // Stripe webhook fires async — the redirect can land here before
    // profiles.plan has flipped to premium. The store's fetch()
    // early-returns on cached state, so a one-shot fetchPlan() leaves
    // a paying parent showing as free until they manually refresh.
    // Poll the canonical refresh() up to 5x over ~10s, stopping the
    // moment we see the premium flag. Worst case we still settle on
    // the true server state within 10 seconds.
    let cancelled = false;
    let attempt = 0;
    const MAX = 5;
    const tick = async () => {
      if (cancelled) return;
      attempt += 1;
      await usePlanStore.getState().refresh();
      const next = usePlanStore.getState().plan;
      if (cancelled) return;
      if (next === "premium" || attempt >= MAX) return;
      setTimeout(tick, 2000);
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  const setChildren = (kids: Child[]) => setStoreChildren(kids);
  const setSelectedChild = (child: Child | null) => setStoreChildData(child);

  useEffect(() => {
    async function fetchChildren() {
      const supabase = supabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setStoreChildren([]);
        setStoreChildData(null);
        router.replace("/login");
        setLoading(false);
        return;
      }

      // Fetch user plan
      fetchPlan();

      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching children:", error);
        setChildrenLoadError(true);
        setLoading(false);
        return;
      }
      setChildrenLoadError(false);

      const kids = (data || []).map((d: unknown) => safeValidate(ChildSchema, d)) as Child[];
      setStoreChildren(kids);
      if (kids.length === 1) {
        setStoreChildData(kids[0]);
      } else if (kids.length > 1) {
        const existingSelected = useChildStore.getState().childData;
        const selectedStillValid = existingSelected && kids.some((k) => k.id === existingSelected.id);
        if (!selectedStillValid) {
          setStoreChildData(null);
        }
      } else {
        setStoreChildData(null);
      }
      setLoading(false);
    }
    fetchChildren();
  }, [router, setStoreChildData, setStoreChildren]);

  if (loading) {
    return <SkeletonPage cards={4} />;
  }

  // DB blip while resolving children — show a retry card instead of
  // pushing a real parent into onboarding by accident (which is what
  // happens if we fall through to KidWelcomeFlow with children=[]).
  if (childrenLoadError && children.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center">
        <img
          src="/images/ui/bunny-thinking.png"
          alt=""
          width={120}
          height={120}
          className="h-28 w-28 object-contain"
        />
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-zinc-900">
          Couldn&apos;t load your account.
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          We hit a temporary snag pulling your reader&apos;s profile.
          Refresh and try again - email hello@readee.app if it sticks.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-violet-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700"
        >
          Refresh
        </button>
      </div>
    );
  }

  if (children.length === 0) {
    return <KidWelcomeFlow onDone={(kids) => {
      setChildren(kids);
      if (kids.length === 1) setSelectedChild(kids[0]);
    }} />;
  }

  if (selectedChild) {
    return (
      <>
        {/* Upgrade celebration (full-screen confetti) on return from checkout */}
        {showCheckoutSuccess && (
          <UpgradeCelebration onClose={() => setShowCheckoutSuccess(false)} />
        )}
        <ChildDashboard
          child={selectedChild}
          children={children}
          onBack={() => setSelectedChild(null)}
          onSwitch={setSelectedChild}
        />
      </>
    );
  }

  return <ChildSelector children={children} onSelect={setSelectedChild} />;
}

/* ─── Onboarding flow: kid info → PfP → handoff → placement ───── */

/* ─── Child Selector ──────────────────────────────────── */

function ChildSelector({
  children,
  onSelect,
}: {
  children: Child[];
  onSelect: (c: Child) => void;
}) {
  return (
    <div className="py-10 space-y-10 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
          Who&apos;s reading today?
        </h1>
        <p className="text-zinc-500 mt-2">Select a reader to get started</p>
      </div>

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-5" variants={staggerFast} initial="hidden" animate="visible">
        {children.map((child, index) => (
          <motion.div
            key={child.id}
            className="group text-left w-full"
            variants={slideUp}
          >
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 hover:border-violet-300 hover:shadow-md transition-all duration-200 space-y-4">
              <button
                type="button"
                onClick={() => onSelect(child)}
                className="w-full text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img src={getChildAvatarImage(child, index)} alt={child.first_name} className="w-full h-full object-cover" draggable={false} loading="lazy" decoding="async" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-zinc-900 truncate">
                      {child.first_name}
                    </h2>
                    {child.grade && (
                      <span className="text-xs font-medium text-violet-600">
                        {GRADE_LABELS[child.grade] || child.grade}
                      </span>
                    )}
                  </div>
                  <div className="text-right text-xs text-zinc-400 space-y-1">
                    <div className="flex items-center gap-0.5">{Number(child.carrots) || 0} <FluentIcon name="carrot" size={12} /></div>
                    <div>{effectiveStreak(child.streak_days, child.last_lesson_at)}d streak</div>
                  </div>
                </div>
                <div className="mt-3">
                  <LevelProgressBar
                    currentLevel={child.reading_level}
                    readOnly
                  />
                </div>
              </button>
              <a
                href={`/play/${child.id}`}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-violet-700"
              >
                Hand the device to {child.first_name}
              </a>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Child Dashboard ─────────────────────────────────── */

function ChildDashboard({
  child,
  children,
  onBack,
  onSwitch,
}: {
  child: Child;
  children: Child[];
  onBack: () => void;
  onSwitch: (c: Child) => void;
}) {
  const [hasAssessment, setHasAssessment] = useState<boolean | null>(null);
  const [readingLevel, setReadingLevel] = useState<string | null>(child.reading_level);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [practiceRows, setPracticeRows] = useState<{ standard_id: string; questions_correct: number }[]>([]);
  const [showCurriculum, setShowCurriculum] = useState(false);
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);
  const userPlan = usePlanStore((s) => s.rawPlan) ?? "free";
  const fetchPlan = usePlanStore((s) => s.fetch);
  const dashParams = useSearchParams();
  const setStoreChildren = useChildStore((s) => s.setChildren);
  const setStoreChildData = useChildStore((s) => s.setChildData);
  const childIndex = children.findIndex((c) => c.id === child.id);
  const [currentChild, setCurrentChild] = useState(child);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [purchases, setPurchases] = useState<ShopPurchase[]>([]);
  const avatarSrc = getChildAvatarImage(currentChild, childIndex);
  const hasMultiple = children.length > 1;
  const greeting = getGreeting();
  const motivation = useMemo(() => MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)], []);
  const nextPracticeStandard = useMemo(() => {
    const gradeKey = levelNameToGradeKey(readingLevel);
    const standards = getStandardsForGrade(gradeKey);
    return standards[0] ?? { standard_id: "RL.K.1", standard_description: "", domain: "" };
  }, [readingLevel]);

  // Keep currentChild in sync when prop changes (e.g. switching children)
  useEffect(() => { setCurrentChild(child); }, [child]);

  useEffect(() => {
    async function checkAssessment() {
      const supabase = supabaseBrowser();

      // Fetch user plan
      fetchPlan();

      const { data, error } = await supabase
        .from("assessments")
        .select("reading_level_placed")
        .eq("child_id", child.id)
        .order("completed_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error checking assessment:", error);
        setHasAssessment(false);
        return;
      }

      if (data && data.length > 0) {
        setHasAssessment(true);
        setReadingLevel(data[0].reading_level_placed);

        // Fetch lesson progress
        const { data: progress } = await supabase
          .from("lessons_progress")
          .select("*")
          .eq("child_id", child.id);

        if (progress) {
          setLessonProgress(progress as LessonProgress[]);
        }
      } else {
        setHasAssessment(false);
      }
    }
    checkAssessment();

    // Fetch shop purchases for avatar picker
    async function fetchPurchases() {
      const supabase = supabaseBrowser();
      const { data } = await supabase
        .from("shop_purchases")
        .select("*")
        .eq("child_id", child.id);
      setPurchases((data || []) as ShopPurchase[]);
    }
    fetchPurchases();
  }, [child.id]);

  // Next lesson, computed the SAME way the Journey does (single source of
  // truth) so the CTA, Today's plan, and the journey card all mirror the path.
  const journeyCatalog = sampleLessons as { standardId: string; grade: string; domain: string; title: string }[];
  const freeUnitDomain = firstUnitDomainByGrade(journeyCatalog);
  const jp = computeJourneyProgress({
    practice: practiceRows,
    lessonProgress: lessonProgress.map((p) => ({ lesson_id: p.lesson_id, section: p.section, score: p.score })),
    readingLevel,
  });
  const nextLesson = jp.current; // { standardId, title, grade, domain } | null
  const completedCount = jp.gradeDone; // grade-level, for the badge milestone
  const gradeTotal = jp.gradeTotal;
  const unitPct = jp.unitTotal > 0 ? jp.unitDone / jp.unitTotal : 0;
  const nextLessonHref = nextLesson ? `/learn?child=${child.id}&standard=${nextLesson.standardId}` : "#";

  // Recent completed (dead ParentSidebar shape, kept type-valid).
  const recentCompleted = jp.recentCompleted.map((l) => ({
    lesson: { id: l.standardId, title: l.title, skill: "" },
    idx: 0,
  }));

  // Get completion dates from progress
  const getCompletionDate = (lessonId: string) => {
    const progress = lessonProgress
      .filter((p) => p.lesson_id === lessonId)
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
    if (progress.length > 0) {
      return new Date(progress[0].completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return null;
  };

  // Weekly progress: Carrots earned per day this week
  const weeklyCarrots = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const carrotsPerDay: number[] = [0, 0, 0, 0, 0, 0, 0];

    for (const p of lessonProgress) {
      const d = new Date(p.completed_at);
      if (d >= monday) {
        const diff = Math.floor((d.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff < 7) {
          const carrots = p.section === "read" ? 10 : 5;
          carrotsPerDay[diff] += carrots;
        }
      }
    }

    const todayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const maxCarrots = Math.max(...carrotsPerDay, 20);

    return days.map((day, i) => ({
      day,
      carrots: carrotsPerDay[i],
      pct: Math.round((carrotsPerDay[i] / maxCarrots) * 100),
      isToday: i === todayIdx,
      isPast: i < todayIdx,
    }));
  }, [lessonProgress]);

  // Daily goal: at least 1 practice session today
  const [dailyGoalMet, setDailyGoalMet] = useState(false);
  useEffect(() => {
    async function checkDailyPractice() {
      const supabase = supabaseBrowser();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("practice_results")
        .select("id", { count: "exact", head: true })
        .eq("child_id", child.id)
        .gte("completed_at", today.toISOString());
      setDailyGoalMet((count ?? 0) > 0);
    }
    checkDailyPractice();
  }, [child.id]);

  // Weakest recently-practiced skill — drives the adaptive "Today's plan"
  // step 1. We look at practice_results from the last ~14 days, aggregate
  // accuracy per standard, and surface the lowest-scoring one (<70%, with
  // at least a few attempts) as a targeted review. No signal → warm-up.
  const [weakStandard, setWeakStandard] = useState<{ standardId: string; title: string } | null>(null);
  // Distinct standards the child has genuinely mastered (>=80% over a handful
  // of attempts, all time) — the "skills mastered" number in the momentum card.
  const [masteredCount, setMasteredCount] = useState(0);
  useEffect(() => {
    async function findWeakSkill() {
      const supabase = supabaseBrowser();
      const since = new Date();
      since.setDate(since.getDate() - 14);
      // All-time aggregate powers the mastered count; the last-14-days slice
      // (filtered below) drives the weak-skill review pick.
      const { data } = await supabase
        .from("practice_results")
        .select("standard_id, questions_correct, questions_attempted, completed_at")
        .eq("child_id", child.id);
      setPracticeRows((data ?? []).map((r) => ({ standard_id: String((r as { standard_id?: string }).standard_id ?? ""), questions_correct: Number((r as { questions_correct?: number }).questions_correct) || 0 })));
      if (!data || data.length === 0) { setWeakStandard(null); setMasteredCount(0); return; }
      const agg: Record<string, { correct: number; attempted: number }> = {};
      const recent: Record<string, { correct: number; attempted: number }> = {};
      for (const r of data) {
        const s = (r as { standard_id?: string }).standard_id;
        if (!s) continue;
        const correct = Number((r as { questions_correct?: number }).questions_correct) || 0;
        const attempted = Number((r as { questions_attempted?: number }).questions_attempted) || 0;
        agg[s] ??= { correct: 0, attempted: 0 };
        agg[s].correct += correct; agg[s].attempted += attempted;
        const at = (r as { completed_at?: string }).completed_at;
        if (at && new Date(at) >= since) {
          recent[s] ??= { correct: 0, attempted: 0 };
          recent[s].correct += correct; recent[s].attempted += attempted;
        }
      }
      let mastered = 0;
      for (const v of Object.values(agg)) {
        if (v.attempted >= 4 && v.correct / v.attempted >= 0.8) mastered++;
      }
      setMasteredCount(mastered);
      let worst: { standardId: string; acc: number } | null = null;
      for (const [s, v] of Object.entries(recent)) {
        if (v.attempted < 3) continue;
        const acc = v.correct / v.attempted;
        if (acc >= 0.7) continue;
        if (!worst || acc < worst.acc) worst = { standardId: s, acc };
      }
      if (!worst) { setWeakStandard(null); return; }
      const match = journeyCatalog.find((l) => l.standardId === worst!.standardId);
      setWeakStandard({ standardId: worst.standardId, title: match?.title ?? worst.standardId });
    }
    findWeakSkill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child.id]);

  const carrots = Number(child.carrots) || 0;
  const carrotCount = useCountUp(carrots);
  const storiesCount = useCountUp(child.stories_read);
  // Honest streak: 0 once a day is missed, even before the next activity.
  const liveStreak = effectiveStreak(child.streak_days, child.last_lesson_at);
  const streakCount = useCountUp(liveStreak);
  // Lifetime carrots fuels the reader-level ladder — distinct from
  // the spendable `carrots` balance above, which shop purchases burn
  // down. Showing both in the same dashboard view keeps the level
  // gauge stable even after the kid spends carrots at /shop.
  const { lifetimeCarrots } = useLifetimeCarrots(child.id);
  const levelInfo = computeLevel(lifetimeCarrots);

  // ── Avatar picker logic ──
  const shopAvatars = getItemsByCategory("avatars");
  const ownedAvatarIds = new Set(purchases.filter((p) => p.item_id.startsWith("avatar_")).map((p) => p.item_id));
  const equippedAvatarId = currentChild.equipped_items?.avatar ?? null;

  // Equipped background image
  const equippedBgId = currentChild.equipped_items?.background ?? null;
  const bgImage = equippedBgId ? BACKGROUND_IMAGES[equippedBgId] ?? null : null;

  const handleEquipAvatar = async (avatarId: string | null) => {
    const newEquipped: EquippedItems = {
      ...currentChild.equipped_items,
      avatar: avatarId,
    };
    const supabase = supabaseBrowser();
    const { error } = await supabase
      .from("children")
      .update({ equipped_items: newEquipped })
      .eq("id", currentChild.id);

    if (!error) {
      const updated = { ...currentChild, equipped_items: newEquipped };
      setCurrentChild(updated);
      setStoreChildData(updated);
      setStoreChildren(children.map((c) => (c.id === updated.id ? updated : c)));
    }
    setAvatarPickerOpen(false);
  };

  // Equip a Bunny outfit straight from the home screen's mascot picker
  // (mirrors handleEquipAvatar; writes equipped_items.outfit).
  const handleEquipOutfit = async (outfitId: string) => {
    const prev = currentChild;
    const newEquipped: EquippedItems = {
      ...currentChild.equipped_items,
      outfit: outfitId,
    };
    const updated = { ...currentChild, equipped_items: newEquipped };
    // Optimistic: reflect the pick instantly so it feels like a toggle, then
    // persist in the background and revert only if the save fails.
    setCurrentChild(updated);
    setStoreChildData(updated);
    setStoreChildren(children.map((c) => (c.id === updated.id ? updated : c)));
    const supabase = supabaseBrowser();
    const { error } = await supabase
      .from("children")
      .update({ equipped_items: newEquipped })
      .eq("id", currentChild.id);
    if (error) {
      setCurrentChild(prev);
      setStoreChildData(prev);
      setStoreChildren(children.map((c) => (c.id === prev.id ? prev : c)));
    }
  };

  // ── Compose the redesigned kid-home props from the data above ──
  const firstDay = hasAssessment === false;
  const kidName = currentChild.first_name;
  const equippedOutfitId = currentChild.equipped_items?.outfit ?? "bunny_classic";
  const ownedOutfitIds = new Set<string>([
    "bunny_classic",
    ...purchases.filter((p) => p.item_id.startsWith("bunny_")).map((p) => p.item_id),
  ]);
  // Skin carousel: unlocked skins in a STABLE canonical order (OUTFITS
  // definition order), then a few greyed-out locked "defaults" as aspiration
  // when the reader hasn't unlocked much yet. Stable order matters — leading
  // with the equipped skin made the whole row reshuffle on every pick. Now
  // selecting just highlights in place. Always show at least MIN_SKINS so the
  // carousel never looks empty. KidHome adds left/right arrows to scroll it.
  const MIN_SKINS = 8;
  const ownedOrdered = OUTFITS.map((o) => o.id).filter((id) => ownedOutfitIds.has(id));
  const lockedIds = OUTFITS.filter((o) => isOutfitAvailable(o)).map((o) => o.id).filter((id) => !ownedOutfitIds.has(id));
  const carouselIds = ownedOrdered.length >= MIN_SKINS
    ? ownedOrdered
    : [...ownedOrdered, ...lockedIds.slice(0, MIN_SKINS - ownedOrdered.length)];
  const outfitChoices = carouselIds.map((id) => {
    const o = OUTFITS.find((x) => x.id === id)!;
    return { id, name: o.name, tint: o.tint, border: o.border, owned: ownedOutfitIds.has(id) };
  });

  // Primary CTA + today's plan, grounded in real state (nextLessonHref computed
  // above from the shared Journey helper — always the /learn route).
  const cta = firstDay
    ? (PLACEMENT_V2
        ? { href: `/placement?child=${child.id}`, text: "Start the reading placement", sub: "Read with Luna · about 10 min" }
        : { href: `/assessment?child=${child.id}`, text: "Take your reading quiz", sub: "A fun 10-question quiz · about 5 min" })
    : nextLesson
      ? { href: nextLessonHref, text: completedCount === 0 ? "Start your adventure" : "Keep going", sub: `Next: ${nextLesson.title}` }
      : { href: `/practice-hub?child=${child.id}`, text: "Practice time!", sub: "You finished every lesson - amazing!" };

  // Reverse trial (retired Sep 2 2026, TRIAL_DAYS = 0): a new reader used to get full Readee+ access for the first TRIAL_DAYS days
  // (no card), then drops to the limited free tier. Full access = paid OR in
  // trial; the locks + upgrade card only appear once the trial is over.
  const signupMs = child.created_at ? new Date(child.created_at).getTime() : Date.now();
  const daysSinceSignup = Math.max(0, Math.floor((Date.now() - signupMs) / 86400000));
  const realTrialLeft = Math.max(0, TRIAL_DAYS - daysSinceSignup);

  // Dev-only preview toggle (ignored in production):
  //   ?preview=trial   full access + trial countdown banner
  //   ?preview=free    post-trial limited (locks + upgrade card)
  //   ?preview=locked  lapsed subscriber (harder locks + reactivate pitch)
  //   ?preview=plus    paid, full access, no nudges
  const previewMode = process.env.NODE_ENV !== "production" ? dashParams.get("preview") : null;
  const previewing = !!previewMode;
  const isPaid = previewMode ? previewMode === "plus" : userPlan === "premium";
  const inTrial = previewMode ? previewMode === "trial" : (!isPaid && realTrialLeft > 0);
  // Lapsed = had Readee+ (trial or paid) and let it end. Same free entitlement,
  // but a win-back pitch built on the progress they'd lose. (Real detection —
  // a canceled/expired subscription flag — is a follow-up; preview-only today.)
  const lapsed = previewMode === "locked";
  const accessFull = isPaid || inTrial; // full access → no locks
  const trialLeft = previewMode === "trial" ? 5 : realTrialLeft;
  const upgradeHref = `/upgrade?reason=${lapsed ? "winback" : "momentum"}&child=${child.id}`;
  // Post-trial free = 1 lesson/grade; lock the next lesson so the free/paid line
  // is honest + visible. Full-access readers (paid or in-trial) never see it.
  // Locked when the next lesson is beyond the free first unit (matches the real
  // /learn gate) — not a "done >= 1" heuristic.
  const lessonLocked = !accessFull && !!nextLesson && (previewMode === "free" || !isLessonInFreeUnit({ grade: nextLesson.grade, domain: nextLesson.domain }, freeUnitDomain));

  const planSteps: Array<{ num: string; label: string; sub: string; status: "done" | "cur" | "todo"; href?: string; locked?: boolean }> = (firstDay && !previewing)
    ? [
        PLACEMENT_V2
          ? { num: "1", label: "Take the reading placement", sub: "Read with Luna · finds the just-right level", status: "cur", href: `/placement?child=${child.id}` }
          : { num: "1", label: "Take the reading quiz", sub: "Finds your just-right level", status: "cur", href: `/assessment?child=${child.id}` },
        { num: "2", label: "Your first lesson", sub: "Readee reads along with you", status: "todo" },
      ]
    : [
        weakStandard
          ? { num: "1", label: `Review: ${weakStandard.title}`, sub: dailyGoalMet ? "Done - nice work!" : "You missed a few of these last time", status: dailyGoalMet ? "done" : "cur", href: `/practice?standard=${encodeURIComponent(weakStandard.standardId)}&child=${child.id}` }
          : { num: "1", label: "Warm-up practice", sub: dailyGoalMet ? "Done - nice work!" : "5 quick questions", status: dailyGoalMet ? "done" : "cur", href: `/practice-hub?child=${child.id}` },
        { num: "2", label: nextLesson ? nextLesson.title : "All lessons done!", sub: lessonLocked ? "Unlock the rest of the lessons" : nextLesson ? "About 5 minutes" : "You finished them all", status: nextLesson ? (dailyGoalMet ? "cur" : "todo") : "done", href: lessonLocked ? upgradeHref : nextLesson ? nextLessonHref : undefined, locked: lessonLocked },
        { num: "3", label: "Read a story", sub: lapsed ? "Reactivate to keep reading" : "You pick which one", status: "todo", href: lapsed ? upgradeHref : `/stories?child=${child.id}`, locked: lapsed },
      ];
  // Locked (premium-gated) steps don't count toward the daily goal ring — a
  // free reader shouldn't see their ring capped by content they can't reach.
  const goalTotal = planSteps.filter((s) => !s.locked).length;
  const goalDone = planSteps.filter((s) => s.status === "done" && !s.locked).length;

  // Grade-level ratio powers the momentum "badge" milestone; unitPct (above)
  // powers the path teaser.
  const pathRatio = gradeTotal > 0 ? completedCount / gradeTotal : 0;

  // Momentum — the "getting better" proof that heads the dashboard and drives
  // the day-7 upgrade card. Same delta data will feed the parent report + email.
  let gradeName = prettyLevel(child.reading_level);
  if (previewing && gradeName === "just-right") gradeName = "Grade 1";
  const remainingLessons = Math.max(0, gradeTotal - completedCount);
  const momentum = (firstDay && !previewing) ? null : {
    levelName: gradeName,
    skillsMastered: masteredCount,
    progressPct: Math.round(pathRatio * 100),
    nextMilestone: remainingLessons > 0
      ? `${remainingLessons} lesson${remainingLessons === 1 ? "" : "s"} to your ${gradeName} badge`
      : `You finished every ${gradeName} lesson!`,
  };
  const doneNodes = Math.min(4, Math.max(0, Math.round(unitPct * 5)));
  const pathNodes: Array<"done" | "cur" | "lock"> = firstDay
    ? ["cur", "lock", "lock", "lock", "lock"]
    : Array.from({ length: 5 }, (_, i) => (i < doneNodes ? "done" : i === doneNodes ? "cur" : "lock"));

  const kidHomeProps = {
    childId: child.id,
    firstDay,
    firstName: kidName,
    fullAccess: accessFull,
    trial: inTrial ? { daysLeft: trialLeft } : null,
    lapsed,
    upgradeHref,
    momentum,
    bubbleTitle: firstDay ? `Welcome, ${kidName}!` : `${greeting.text}, ${kidName}!`,
    bubbleSub: firstDay
      ? "Readee is ready to read with you."
      : liveStreak > 0
        ? `You're on a ${liveStreak}-day streak!`
        : motivation,
    equippedOutfitId,
    equippedReactionId: currentChild.equipped_items?.reaction ?? null,
    outfitChoices,
    onPickOutfit: handleEquipOutfit,
    cta,
    streak: liveStreak,
    goalDone,
    goalTotal,
    goalLabel: firstDay
      ? `${goalTotal} things to do today`
      : goalDone >= goalTotal
        ? "All done - great job!"
        : `${goalTotal - goalDone} more to go!`,
    carrots,
    level: {
      name: levelInfo.current.name,
      num: levelInfo.current.number,
      xpPct: Math.round(levelInfo.progress01 * 100),
      xpLabel: levelInfo.next
        ? `${Math.max(0, levelInfo.next.threshold - levelInfo.lifetimeCarrots)} carrots to ${levelInfo.next.name}`
        : "Top of the ladder",
    },
    planBadge: `${goalDone} of ${goalTotal} done`,
    planSteps,
    path: {
      nodes: pathNodes,
      unitTitle: firstDay ? "Reading Journey" : nextLesson ? nextLesson.title : "Reading Journey",
      unitPct: Math.round(unitPct * 100),
      unitSub: firstDay ? "Your adventure starts here" : nextLesson ? `${jp.unitDone} of ${jp.unitTotal} in ${jp.unitName}` : "You finished them all!",
      href: `/journey?child=${child.id}`,
    },
    weekSub: firstDay ? "Your chart starts today" : "Keep the bars growing!",
    weekBars: weeklyCarrots.map((w) => ({ day: w.day[0], pct: w.pct, isToday: w.isToday, hasValue: w.carrots > 0 })),
    shop: {
      href: `/shop?child=${child.id}`,
      sub: firstDay ? "Earn carrots to spend here" : "Spend carrots on bunny outfits!",
      chip: firstDay ? "Carrots buy outfits" : `${carrots} to spend`,
    },
    league: {
      href: `/leaderboard?child=${child.id}`,
      title: "Leaderboard",
      sub: firstDay ? "Finish a lesson to join" : "See how you rank!",
      locked: firstDay,
    },
  };

  return (
    <>
    {bgImage && <DashboardBackdrop src={bgImage} />}

    {/* Sidebar is rendered by SidebarShell (the protected layout) so
        every page shares the same chrome. The dashboard used to host
        its own bespoke parent + collapsed-rail sidebars right here —
        ripped out in favor of the single shared AppSidebar. */}
    {/* Sidebar removed — SidebarShell renders the shared AppSidebar
        and handles the left margin, so this page just lays out
        content like every other parent surface. */}
    <div className="min-h-screen">
      <motion.div
        className="max-w-[1080px] mx-auto px-4 pt-3 pb-12 space-y-5"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* ── Nav bar (multi-child) ── */}
        {hasMultiple && (
          <motion.div variants={slideUp} className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors"
            >
              &larr; All Readers
            </button>
            <select
              value={child.id}
              onChange={(e) => {
                const next = children.find((c) => c.id === e.target.value);
                if (next) onSwitch(next);
              }}
              className="text-sm border border-zinc-200 rounded-lg px-3 py-1.5 bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.first_name}
                </option>
              ))}
            </select>
          </motion.div>
        )}

        {/* ── Kid home (redesigned "Adventure" home) ── */}
        <motion.div variants={slideUp}>
          <KidHome {...kidHomeProps} />
        </motion.div>

        {/* "What's New" popup: shows off new skins/content on app open */}
        <WhatsNew />

        {/* "Fresh for you" removed — it duplicated the Today's Readee card
            below and rendered as an out-of-place tile. */}

        {/* Today's Readee: full-width so it lines up with the quick-play
            tiles directly above it, not the narrower deeper-cards column. */}
        <motion.div variants={slideUp}>
          <DailyQuestionCard variant="parent" />
        </motion.div>

        {/* ── Deeper cards (kept from the previous dashboard) ── */}
        <motion.div variants={slideUp} className="mx-auto w-full max-w-3xl space-y-5">

        {/* ── Sharpen Up — premium adaptive review.
            Self-hides when the kid has no weak spots in the last
            30 days, so free users with no signal don't see it
            (avoids the empty-grey-box anti-pattern). Free users
            with signal see a "Unlock" CTA → /upgrade?reason=sharpen. */}
        <motion.div variants={slideUp}>
          <SharpenUpCard childId={child.id} userPlan={userPlan} />
        </motion.div>

        {/* ── From Your Teacher — only renders when there's a
             classroom membership + open work. Hidden by default for
             B2C accounts (which is most of them). */}
        <motion.div variants={slideUp}>
          <TeacherAssignmentsCard childId={child.id} />
        </motion.div>

        {/* Testimonial capture — fires once the kid has completed
            at least 3 lessons (a "happy parent" moment). Dismissed
            for 90 days after close. Submits go to parent_testimonials
            with marketing-consent flag for Jen/Filip to approve. */}
        <TestimonialPrompt
          childFirstName={currentChild.first_name}
          childGrade={readingLevel}
          completedLessons={completedCount}
        />
        </motion.div>

      {/* ── Avatar Picker Modal ── */}
      {avatarPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAvatarPickerOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 rounded-3xl bg-white shadow-2xl overflow-hidden"
          >
            <div className="p-6 pb-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-zinc-900">Choose Your Avatar</h2>
                <button
                  onClick={() => setAvatarPickerOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-6 pb-2">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Defaults</p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 sm:gap-3">
                {DEFAULT_AVATARS.map((_emoji, i) => {
                  const id = `default_${i}`;
                  const imgSrc = AVATAR_IMAGES[id];
                  const isActive = equippedAvatarId === id || (!equippedAvatarId && i === childIndex % DEFAULT_AVATARS.length);
                  return (
                    <button
                      key={id}
                      onClick={() => handleEquipAvatar(i === childIndex % DEFAULT_AVATARS.length ? null : id)}
                      className={`aspect-square rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-200 ${
                        isActive
                          ? "ring-3 ring-violet-500 scale-110"
                          : "hover:scale-105"
                      }`}
                    >
                      <img src={imgSrc} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover rounded-2xl" draggable={false} loading="lazy" decoding="async" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-6 pt-4 pb-6 max-h-[40vh] overflow-y-auto">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Shop Avatars</p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 sm:gap-3">
                {shopAvatars.map((item) => {
                  const owned = ownedAvatarIds.has(item.id);
                  const isActive = equippedAvatarId === item.id;
                  const imgSrc = AVATAR_IMAGES[item.id];
                  return (
                    <button
                      key={item.id}
                      onClick={() => owned && handleEquipAvatar(item.id)}
                      disabled={!owned}
                      className={`aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-200 ${
                        isActive
                          ? "ring-3 ring-violet-500 scale-110"
                          : owned
                            ? "hover:scale-105"
                            : "opacity-40 cursor-not-allowed grayscale"
                      }`}
                      title={owned ? item.name : `${item.name} - ${item.price} carrots`}
                    >
                      {imgSrc ? (
                        <img src={imgSrc} alt={item.name} className="w-full h-full object-cover rounded-2xl" draggable={false} loading="lazy" decoding="async" />
                      ) : (
                        <FluentIcon name={getShopIcon(item.icon)} size={28} />
                      )}
                      {!owned && (
                        <span className="absolute bottom-0.5 right-0.5">
                          <Glyph name="lock" size={12} className="text-zinc-500" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {shopAvatars.some((item) => !ownedAvatarIds.has(item.id)) && (
                <p className="text-xs text-zinc-400 mt-3 text-center">
                  Earn carrots <FluentIcon name="carrot" size={12} /> to unlock more avatars in the <Link href={`/shop?child=${currentChild.id}`} className="text-violet-600 font-semibold hover:underline" onClick={() => setAvatarPickerOpen(false)}>Shop</Link>!
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
    </div>
    </>
  );
}

/* ─── Sidebar Tooltip (hover card for collapsed rail) ─── */

function SidebarTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>(null);

  const handleEnter = () => {
    timeout.current = setTimeout(() => setShow(true), 200);
  };
  const handleLeave = () => {
    if (timeout.current) clearTimeout(timeout.current);
    setShow(false);
  };

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {children}
      {show && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none">
          <div className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-medium shadow-lg whitespace-nowrap">
            {label}
          </div>
          {/* Arrow */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-zinc-900 rotate-45" />
        </div>
      )}
    </div>
  );
}

/* ─── Parent Sidebar ──────────────────────────────────── */

interface ParentSidebarProps {
  child: Child;
  currentChild: Child;
  childIndex: number;
  hasAssessment: boolean | null;
  readingLevel: string | null;
  lessonProgress: LessonProgress[];
  userPlan: string;
  weeklyCarrots: { day: string; carrots: number; pct: number; isToday: boolean; isPast: boolean }[];
  recentCompleted: { lesson: LessonData; idx: number }[];
  getCompletionDate: (lessonId: string) => string | null;
  showCurriculum: boolean;
  setShowCurriculum: (v: boolean) => void;
  expandedGrade: string | null;
  setExpandedGrade: (v: string | null) => void;
  onClose?: () => void;
  onToggle?: () => void;
}

function ParentSidebar({
  child,
  currentChild,
  childIndex,
  hasAssessment,
  readingLevel,
  lessonProgress,
  userPlan,
  weeklyCarrots,
  recentCompleted,
  getCompletionDate,
  showCurriculum,
  setShowCurriculum,
  expandedGrade,
  setExpandedGrade,
  onClose,
  onToggle,
}: ParentSidebarProps) {
  const avatarSrc = getChildAvatarImage(currentChild, childIndex);
  const pathname = usePathname();
  const dismiss = onClose || onToggle;

  const isActive = (href: string) => {
    const base = href.split("?")[0];
    return pathname === base;
  };

  const navLinkClass = (href: string) =>
    `flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[13px] transition-colors ${
      isActive(href)
        ? "bg-violet-50 text-violet-700 font-medium"
        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
    }`;

  const navIconClass = (href: string) =>
    `w-4 h-4 ${isActive(href) ? "text-violet-500" : "text-zinc-400"}`;

  const NAV_SECTIONS = [
    {
      label: "Main",
      items: [
        { href: "/dashboard", icon: "home", label: "Dashboard" },
        { href: "/luna", icon: "sparkles", label: "Luna", emphasis: true },
        hasAssessment
          ? (PLACEMENT_V2
              ? { href: `/placement/report?child=${child.id}`, icon: "clipboard-check", label: "Placement report" }
              : { href: `/assessment-results?child=${child.id}`, icon: "clipboard-check", label: "Placement Test Results" })
          : { href: PLACEMENT_V2 ? `/placement?child=${child.id}` : `/assessment?child=${child.id}`, icon: "clipboard-check", label: PLACEMENT_V2 ? "Reading placement" : "Take Placement Test", emphasis: true },
        { href: `/analytics?child=${child.id}`, icon: "bar-chart3", label: "Analytics" },
        { href: `/review?child=${child.id}`, icon: "brain", label: "Today's review" },
      ],
    },
    {
      label: "Learning",
      items: [
        { href: "/word-bank", icon: "book", label: "Word Bank" },
        { href: `/practice-hub?child=${child.id}`, icon: "list-checks", label: "Practice" },
        { href: "/practice-hub/community", icon: "users", label: "Community library" },
        { href: "/discover", icon: "compass", label: "Discover" },
        { href: `/journey?child=${child.id}`, icon: "map", label: "Reading Journey" },
      ],
    },
    {
      label: "Fun",
      items: [
        { href: `/levels?child=${child.id}`, icon: "star", label: "Reader Levels" },
        { href: `/shop?child=${child.id}`, icon: "carrot", label: "Shop", iconColor: "text-orange-500" },
        { href: `/leaderboard?child=${child.id}`, icon: "trophy", label: "Leaderboard" },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="px-3 pt-3 pb-2 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-zinc-200">
          <img src={avatarSrc} alt={currentChild.first_name} className="w-full h-full object-cover" draggable={false} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-zinc-900 truncate leading-tight">{currentChild.first_name}</div>
          {readingLevel && (
            <div className="text-[11px] text-zinc-500 leading-tight">{readingLevel}</div>
          )}
        </div>
        {dismiss && (
          <button
            onClick={dismiss}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors"
            aria-label="Collapse"
          >
            <Glyph name="chevron-down" size={16} className="text-zinc-400 -rotate-90" />
          </button>
        )}
      </div>

      {/* ── Separator ── */}
      <div className="mx-3 h-px bg-zinc-200" />

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto py-2 space-y-4">
        {/* Smart search — single highest-leverage parent action, kept
            right at the top so parents don't have to dig through the
            nav to find content for their kid. Routes to the kid runner
            on click with ?child= already attached. */}
        <div className="px-3">
          <ProductSearchBar
            isPremium={userPlan === "premium"}
            childId={child.id}
          />
        </div>

        {/* Navigation sections */}
        {NAV_SECTIONS.map(({ label, items }) => (
          <div key={label} className="px-3">
            <p className="px-2 mb-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">{label}</p>
            <nav className="space-y-0.5">
              {items.map(({ href, icon: Icon, label: itemLabel, iconColor, emphasis }: any) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={emphasis && !isActive(href)
                    ? "flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[13px] font-semibold transition-colors bg-violet-50 text-violet-700 hover:bg-violet-100"
                    : navLinkClass(href)
                  }
                >
                  <Glyph name={Icon} size={16} className={iconColor || (emphasis && !isActive(href) ? "text-violet-500" : navIconClass(href))} />
                  <span>{itemLabel}</span>
                </Link>
              ))}
            </nav>
          </div>
        ))}

        {/* Reading Path */}
        {hasAssessment && (
          <>
            <div className="mx-3 h-px bg-zinc-200" />
            <div className="px-3">
              <p className="px-2 mb-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">Reading Path</p>
              <LessonPath child={child} readingLevel={readingLevel} lessonProgress={lessonProgress} userPlan={userPlan} />
            </div>
          </>
        )}

        {/* Separator */}
        <div className="mx-3 h-px bg-zinc-200" />

        {/* This Week */}
        <div className="px-3">
          <p className="px-2 mb-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">This Week</p>
          <div className="px-2 space-y-1">
            {weeklyCarrots.map(({ day, carrots: dayCarrots, pct, isToday }) => (
              <div key={day} className="flex items-center gap-2 h-5">
                <span className={`w-7 text-[11px] tabular-nums ${isToday ? "text-zinc-900 font-semibold" : "text-zinc-400"}`}>
                  {day}
                </span>
                <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      dayCarrots > 0
                        ? "bg-emerald-500"
                        : isToday
                        ? "bg-violet-200"
                        : ""
                    }`}
                    style={{ width: dayCarrots > 0 ? `${Math.max(pct, 8)}%` : isToday ? "4%" : "0%" }}
                  />
                </div>
                {dayCarrots > 0 && (
                  <span className="w-5 text-right text-[10px] font-medium text-emerald-600 tabular-nums">{dayCarrots}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="mx-3 h-px bg-zinc-200" />

        {/* Recent Activity */}
        <div className="px-3">
          <p className="px-2 mb-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">Recent Activity</p>
          {recentCompleted.length > 0 ? (
            <div className="space-y-0.5">
              {recentCompleted.map(({ lesson }) => {
                const date = getCompletionDate(lesson.id);
                return (
                  <div key={lesson.id} className="flex items-center gap-2 px-2 py-1 rounded-lg">
                    <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="flex-1 min-w-0 text-[13px] text-zinc-700 truncate">{lesson.title}</span>
                    {date && <span className="text-[10px] text-zinc-400 flex-shrink-0 tabular-nums">{date}</span>}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="px-2 py-1 text-[13px] text-zinc-400">No activity yet</p>
          )}
        </div>
      </div>

      {/* ── Footer — avatar with popover menu ── */}
      <div className="mx-3 h-px bg-zinc-200" />
      <SidebarUserMenu
        avatarSrc={avatarSrc}
        name={currentChild.first_name}
        plan={userPlan}
      />
    </div>
  );
}

/* ─── Sidebar User Menu (popover) ─────────────────────── */

function SidebarUserMenu({ avatarSrc, name, plan }: { avatarSrc: string; name: string; plan: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const handleLogout = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div ref={ref} className="relative px-3 py-2">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-zinc-200">
          <img src={avatarSrc} alt={name} className="w-full h-full object-cover" draggable={false} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[13px] font-medium text-zinc-900 truncate">{name}</div>
          <div className="text-[11px] text-zinc-400">{plan === "premium" ? "Readee+" : "Free Plan"}</div>
        </div>
        <Glyph name="chevrons-up-down" size={16} className="text-zinc-400 flex-shrink-0" />
      </button>

      {/* Popover (opens upward) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-3 right-3 mb-2 rounded-xl border border-zinc-200 bg-white shadow-lg overflow-hidden z-50"
          >
            {/* User info */}
            <div className="px-3 py-3 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-zinc-200">
                <img src={avatarSrc} alt={name} className="w-full h-full object-cover" draggable={false} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-zinc-900 truncate">{name}</div>
                <div className={`text-[11px] ${plan === "premium" ? "text-violet-500 font-medium" : "text-zinc-500"}`}>{plan === "premium" ? "Readee+ Member" : "Free Plan"}</div>
              </div>
            </div>

            <div className="h-px bg-zinc-100" />

            {/* Menu items */}
            <div className="py-1 px-1">
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <Glyph name="user" size={16} className="text-zinc-400" />
                Account
              </Link>
              <Link
                href="/billing"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <Glyph name="credit-card" size={16} className="text-zinc-400" />
                Billing
              </Link>
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <Glyph name="bell" size={16} className="text-zinc-400" />
                Notifications
              </Link>
            </div>

            <div className="h-px bg-zinc-100" />

            <div className="py-1 px-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <Glyph name="log-out" size={16} className="text-zinc-400" />
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Lesson Path ─────────────────────────────────────── */

interface LessonData {
  id: string;
  title: string;
  skill: string;
  standards?: string[];
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

function LessonPath({
  child,
  readingLevel,
  lessonProgress,
  userPlan,
}: {
  child: Child;
  readingLevel: string | null;
  lessonProgress: LessonProgress[];
  userPlan: string;
}) {
  const gradeKey = levelNameToGradeKey(readingLevel);
  const file = lessonsData as unknown as LessonsFile;
  const level = file.levels[gradeKey];
  const lessons = level?.lessons || [];
  const freeLessons = lessons.filter((l) => isLessonFree(l.id));
  const lockedLessonsCount = lessons.filter((l) => !isLessonFree(l.id)).length;

  const isLessonComplete = (lessonId: string) => {
    return lessonProgress.some(
      (p) => p.lesson_id === lessonId && p.section === "practice" && p.score >= 60
    );
  };

  let firstIncomplete = -1;
  for (let i = 0; i < lessons.length; i++) {
    if (!isLessonComplete(lessons[i].id)) {
      firstIncomplete = i;
      break;
    }
  }

  const completedFreeCount = freeLessons.filter((l) => isLessonComplete(l.id)).length;
  const freeProgressPct = freeLessons.length > 0
    ? Math.min(100, Math.round((completedFreeCount / freeLessons.length) * 100))
    : 0;
  const nearPaywall = userPlan !== "premium" && lockedLessonsCount > 0 && completedFreeCount >= Math.max(1, freeLessons.length - 1);
  const paywallLabel = readingLevel ? `${readingLevel} level` : "this level";

  return (
    <div className="space-y-3">
      {/* Progress summary */}
      {readingLevel && (
        <div className="flex items-center gap-2 px-1">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-700">{readingLevel}</span>
          <span className="text-[11px] text-zinc-400">
            {lessons.filter((l) => isLessonComplete(l.id)).length}/{lessons.length} complete
          </span>
        </div>
      )}

      {/* Upgrade banner (compact) */}
      {userPlan !== "premium" && lockedLessonsCount > 0 && (
        <Link
          href={`/upgrade?child=${child.id}`}
          className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-violet-50 hover:bg-violet-100 transition-colors"
        >
          <Glyph name="star" size={14} className="text-violet-500" />
          <span className="text-[12px] font-medium text-violet-700">Unlock {lockedLessonsCount} more lessons</span>
        </Link>
      )}

      {/* Timeline stepper */}
      <div className="max-h-[280px] overflow-y-auto pr-1">
        <div className="relative pl-7">
          {/* Vertical line */}
          <div className="absolute left-[17px] top-2 bottom-2 w-px bg-zinc-200" />

          {lessons.map((lesson, i) => {
            const complete = isLessonComplete(lesson.id);
            const isNext = i === firstIncomplete;
            const isFuture = !complete && !isNext;
            const isFree = isLessonFree(lesson.id);
            const isLocked = !isFree && userPlan !== "premium";
            const isLast = i === lessons.length - 1;
            const learnStd = lessonToLearnStandard(lesson);

            return (
              <div key={lesson.id} className={`relative flex items-start gap-2.5 ${isLast ? "" : "pb-2"}`}>
                {/* Dot */}
                <div className="absolute left-[-20px] top-[3px]">
                  {complete ? (
                    <div className="w-[18px] h-[18px] rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : isNext ? (
                    <div className="w-[18px] h-[18px] rounded-full bg-violet-500 ring-4 ring-violet-100 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  ) : isLocked ? (
                    <div className="w-[18px] h-[18px] rounded-full bg-zinc-200 flex items-center justify-center">
                      <Glyph name="lock" size={8} className="text-zinc-400" />
                    </div>
                  ) : (
                    <div className="w-[18px] h-[18px] rounded-full border-2 border-zinc-200 bg-white" />
                  )}
                </div>

                {/* Content */}
                <Link
                  href={
                    isLocked
                      ? `/upgrade?child=${child.id}`
                      : learnStd
                        ? `/learn?standard=${learnStd}&child=${child.id}`
                        : `/lesson?child=${child.id}&lesson=${lesson.id}`
                  }
                  className={`flex-1 min-w-0 rounded-lg px-2 py-1.5 -mx-1 transition-colors ${
                    isNext
                      ? "bg-violet-50 hover:bg-violet-100"
                      : isLocked
                      ? "opacity-50"
                      : "hover:bg-zinc-50"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-bold tabular-nums ${
                      complete ? "text-emerald-600" : isNext ? "text-violet-600" : "text-zinc-400"
                    }`}>
                      {i + 1}
                    </span>
                    <span className={`text-[12px] font-medium truncate ${
                      isLocked || isFuture ? "text-zinc-400" : isNext ? "text-violet-900" : "text-zinc-700"
                    }`}>
                      {lesson.title}
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Curriculum Overview ─────────────────────────────── */

function CurriculumOverview({
  readingLevel,
  lessonProgress,
  showCurriculum,
  setShowCurriculum,
  expandedGrade,
  setExpandedGrade,
}: {
  readingLevel: string | null;
  lessonProgress: LessonProgress[];
  showCurriculum: boolean;
  setShowCurriculum: (v: boolean) => void;
  expandedGrade: string | null;
  setExpandedGrade: (v: string | null) => void;
}) {
  const file = lessonsData as unknown as LessonsFile;
  const currentGradeKey = readingLevel ? levelNameToGradeKey(readingLevel) : null;

  const isLessonComplete = (lessonId: string) => {
    return lessonProgress.some(
      (p) => p.lesson_id === lessonId && p.section === "practice" && p.score >= 60
    );
  };

  function handleToggle() {
    if (!showCurriculum && !expandedGrade) {
      setExpandedGrade(currentGradeKey);
    }
    setShowCurriculum(!showCurriculum);
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-5 hover:bg-zinc-50/50 transition-colors"
      >
        <h3 className="text-base font-bold text-zinc-900">Full Curriculum</h3>
        <span className="text-xs text-violet-600 font-medium">
          {showCurriculum ? "Hide" : "View All Levels"}
        </span>
      </button>

      {showCurriculum && (
        <div className="px-5 pb-5 space-y-2">
          {GRADE_KEYS.map((key) => {
            const level = file.levels[key];
            if (!level) return null;
            const isExpanded = expandedGrade === key;
            const isCurrent = key === currentGradeKey;

            return (
              <div key={key}>
                <button
                  onClick={() => setExpandedGrade(isExpanded ? null : key)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors ${
                    isCurrent
                      ? "bg-violet-50 border border-violet-200"
                      : "bg-zinc-50 border border-zinc-100 hover:bg-zinc-100"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-semibold ${isCurrent ? "text-violet-700" : "text-zinc-700"}`}>
                      {GRADE_LABELS[key]}
                    </span>
                    <span className={`text-xs ${isCurrent ? "text-violet-500" : "text-zinc-400"}`}>
                      {level.level_name}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-semibold text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <Glyph name="chevron-down" size={16} className={`text-zinc-400 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`} />
                </button>

                {isExpanded && (
                  <div className="mt-1 ml-3 pl-3 border-l-2 border-zinc-100 space-y-1.5 py-2">
                    <p className="text-[11px] text-zinc-400 mb-1">{level.focus}</p>
                    {level.lessons.map((lesson: LessonData, i: number) => {
                      const complete = isCurrent && isLessonComplete(lesson.id);
                      return (
                        <div key={lesson.id} className="flex items-start gap-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 ${
                              complete ? "bg-green-100 text-green-600" : "bg-zinc-100 text-zinc-400"
                            }`}
                          >
                            {complete ? "✓" : i + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="text-sm text-zinc-700">{lesson.title}</span>
                            <span className="text-xs text-zinc-400 ml-1.5">
                              · {formatSkillName(lesson.skill)}
                            </span>
                            {lesson.standards && lesson.standards.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {lesson.standards.map((s) => (
                                  <span key={s} className="text-[10px] px-1 py-px rounded bg-zinc-100 text-zinc-400">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
