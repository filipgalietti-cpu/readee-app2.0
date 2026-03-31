"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child, LessonProgress } from "@/lib/db/types";
import { levelNameToGradeKey } from "@/lib/assessment/questions";
import lessonsData from "@/lib/data/lessons.json";
import LevelProgressBar, { GRADES } from "@/app/_components/LevelProgressBar";
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
import { Target, Puzzle, BookOpen, Map, Carrot, Flame, Sun, CloudSun, Moon, Sparkles, Star, Rocket, Trophy, BarChart3, Sprout, ChevronDown, Lock, User, CreditCard, Bell, LogOut, ChevronsUpDown, Home, BookText, ListChecks, ClipboardCheck } from "lucide-react";
import type { ReactNode } from "react";
import { getShopIcon } from "@/lib/data/shop-icons";

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

const AVATARS = ["😊", "🦊", "🐱", "🦋", "🐻"];

const GRADE_KEYS = ["pre-k", "kindergarten", "1st", "2nd", "3rd", "4th"] as const;
const GRADE_LABELS: Record<string, string> = {
  "pre-k": "Foundational",
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
  if (h < 12) return { text: "Good morning", icon: <Sun className="w-8 h-8 text-amber-400" strokeWidth={1.5} /> };
  if (h < 17) return { text: "Good afternoon", icon: <CloudSun className="w-8 h-8 text-amber-400" strokeWidth={1.5} /> };
  return { text: "Good evening", icon: <Moon className="w-8 h-8 text-indigo-400" strokeWidth={1.5} /> };
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
  const children = useChildStore((s) => s.children);
  const selectedChild = useChildStore((s) => s.childData);
  const setStoreChildren = useChildStore((s) => s.setChildren);
  const setStoreChildData = useChildStore((s) => s.setChildData);
  const [loading, setLoading] = useState(true);
  const userPlan = usePlanStore((s) => s.plan) ?? "free";
  const fetchPlan = usePlanStore((s) => s.fetch);

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
        setLoading(false);
        return;
      }

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
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  if (children.length === 0) {
    return <AddChildrenForm userPlan={userPlan} onDone={(kids) => {
      setChildren(kids);
      if (kids.length === 1) setSelectedChild(kids[0]);
    }} />;
  }

  if (selectedChild) {
    return (
      <ChildDashboard
        child={selectedChild}
        children={children}
        onBack={() => setSelectedChild(null)}
        onSwitch={setSelectedChild}
      />
    );
  }

  return <ChildSelector children={children} onSelect={setSelectedChild} />;
}

/* ─── Add Children Form ───────────────────────────────── */

interface ChildRow {
  name: string;
  grade: string;
}

function AddChildrenForm({ userPlan, onDone }: { userPlan: string; onDone: (kids: Child[]) => void }) {
  const router = useRouter();
  const [rows, setRows] = useState<ChildRow[]>([{ name: "", grade: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateRow = (index: number, field: keyof ChildRow, value: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const maxChildren = userPlan === "premium" ? 5 : 1;

  const addRow = () => {
    if (rows.length < maxChildren) setRows((prev) => [...prev, { name: "", grade: "" }]);
  };

  const removeRow = (index: number) => {
    if (rows.length > 1) setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const canSubmit = rows.every((r) => r.name.trim() && r.grade);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError("");

    const supabase = supabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Not logged in");
      setSaving(false);
      return;
    }

    const insertRows = rows.map((r) => ({
      parent_id: user.id,
      first_name: r.name.trim(),
      grade: r.grade,
    }));

    const { data, error: insertError } = await supabase
      .from("children")
      .insert(insertRows)
      .select();

    if (insertError) {
      console.error("Error saving children:", insertError);
      setError("Failed to save. Please try again.");
      setSaving(false);
      return;
    }

    const kids = (data || []) as Child[];
    onDone(kids);

    // Auto-redirect to assessment for the first child
    if (kids.length > 0) {
      router.push(`/assessment?child=${kids[0].id}`);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4 space-y-8">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-indigo-50 mx-auto mb-6 flex items-center justify-center">
          <BookOpen className="w-10 h-10 text-indigo-500" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-slate-100 tracking-tight">
          Welcome to Readee!
        </h1>
        <p className="text-zinc-500 dark:text-slate-400 mt-2">
          Let&apos;s set up your readers.
        </p>
      </div>

      <div className="space-y-4">
        {userPlan !== "premium" && (
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 to-violet-50/80 p-4">
            <p className="text-sm font-semibold text-zinc-900">Family plan option available</p>
            <p className="text-xs text-zinc-600 mt-1">
              Free includes 1 reader profile. Readee+ Household unlocks up to 5 reader profiles plus the full curriculum.
            </p>
          </div>
        )}
        {rows.map((row, index) => (
          <div key={index} className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-500 dark:text-slate-400">
                {AVATARS[index % AVATARS.length]} Reader {index + 1}
              </span>
              {rows.length > 1 && (
                <button
                  onClick={() => removeRow(index)}
                  className="text-zinc-400 hover:text-red-500 text-sm font-medium transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Child's first name"
              value={row.name}
              onChange={(e) => updateRow(index, "name", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-zinc-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <select
              value={row.grade}
              onChange={(e) => updateRow(index, "grade", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 text-zinc-700 dark:text-slate-200"
            >
              <option value="">Select grade</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {rows.length < maxChildren ? (
        <button
          onClick={addRow}
          className="w-full py-3 rounded-xl border-2 border-dashed border-zinc-200 text-sm font-medium text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
        >
          + Add another child
        </button>
      ) : userPlan !== "premium" && (
        <Link href="/upgrade" className="block">
          <div className="w-full py-3 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 text-center text-sm font-medium text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
            <Star className="w-4 h-4 inline-block" strokeWidth={1.5} /> Upgrade to Readee+ for up to 5 children
          </div>
        </Link>
      )}

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || saving}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-lg hover:from-indigo-700 hover:to-violet-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Setting up..." : "Let's Go!"}
      </button>
    </div>
  );
}

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
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-slate-100 tracking-tight">
          Who&apos;s reading today?
        </h1>
        <p className="text-zinc-500 dark:text-slate-400 mt-2">Select a reader to get started</p>
      </div>

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-5" variants={staggerFast} initial="hidden" animate="visible">
        {children.map((child, index) => (
          <motion.button
            key={child.id}
            onClick={() => onSelect(child)}
            className="group text-left w-full"
            variants={slideUp}
          >
            <div className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200 group-hover:scale-[1.02] space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img src={getChildAvatarImage(child, index)} alt={child.first_name} className="w-full h-full object-cover" draggable={false} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-slate-100 truncate">
                    {child.first_name}
                  </h2>
                  {child.grade && (
                    <span className="text-xs font-medium text-indigo-600">
                      {GRADE_LABELS[child.grade] || child.grade}
                    </span>
                  )}
                </div>
                <div className="text-right text-xs text-zinc-400 space-y-1">
                  <div className="flex items-center gap-0.5">{Number(child.carrots) || 0} <Carrot className="w-3 h-3 text-orange-500" strokeWidth={1.5} /></div>
                  <div>{child.streak_days}d streak</div>
                </div>
              </div>
              <LevelProgressBar
                currentLevel={child.reading_level}
                readOnly
              />
            </div>
          </motion.button>
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
  const [showCurriculum, setShowCurriculum] = useState(false);
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);
  const userPlan = usePlanStore((s) => s.plan) ?? "free";
  const fetchPlan = usePlanStore((s) => s.fetch);
  const setStoreChildren = useChildStore((s) => s.setChildren);
  const setStoreChildData = useChildStore((s) => s.setChildData);
  const childIndex = children.findIndex((c) => c.id === child.id);
  const [currentChild, setCurrentChild] = useState(child);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [purchases, setPurchases] = useState<ShopPurchase[]>([]);
  const [parentMode, setParentMode] = useState(false);
  const sidebarOpen = useSidebarStore((s) => s.open);
  const setSidebarOpen = useSidebarStore((s) => s.setOpen);
  const avatarSrc = getChildAvatarImage(currentChild, childIndex);

  // Remove main container constraints so sidebar can be flush left
  useEffect(() => {
    const main = document.querySelector("main");
    if (main) { main.style.paddingLeft = "0"; main.style.paddingRight = "0"; main.style.paddingBottom = "0"; main.style.maxWidth = "none"; }
    return () => {
      if (main) { main.style.paddingLeft = ""; main.style.paddingRight = ""; main.style.paddingBottom = ""; main.style.maxWidth = ""; }
    };
  }, []);
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

  // Compute lesson data for CTA
  const file = lessonsData as unknown as LessonsFile;
  const gradeKey = levelNameToGradeKey(readingLevel);
  const level = file.levels[gradeKey];
  const lessons = level?.lessons || [];

  const isLessonComplete = (lessonId: string) => {
    return lessonProgress.some(
      (p) => p.lesson_id === lessonId && p.section === "practice" && p.score >= 60
    );
  };

  const completedCount = lessons.filter((l) => isLessonComplete(l.id)).length;
  let nextLesson: LessonData | null = null;
  let nextLessonIdx = -1;
  for (let i = 0; i < lessons.length; i++) {
    if (!isLessonComplete(lessons[i].id)) {
      nextLesson = lessons[i];
      nextLessonIdx = i;
      break;
    }
  }

  // Recent completed lessons (last 3, newest first)
  const recentCompleted = lessons
    .map((l, i) => ({ lesson: l, idx: i }))
    .filter(({ lesson }) => isLessonComplete(lesson.id))
    .slice(-3)
    .reverse();

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

  const carrots = Number(child.carrots) || 0;
  const carrotCount = useCountUp(carrots);
  const storiesCount = useCountUp(child.stories_read);
  const streakCount = useCountUp(child.streak_days);

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

  return (
    <>
    {bgImage && <DashboardBackdrop src={bgImage} />}

    {/* ── Mobile Parent Sidebar Overlay ── */}
    <AnimatePresence>
      {parentMode && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setParentMode(false)} />
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="absolute top-0 left-0 bottom-0 w-[272px] bg-white shadow-2xl overflow-hidden border-r border-zinc-200"
          >
            <ParentSidebar
              child={child}
              currentChild={currentChild}
              childIndex={childIndex}
              hasAssessment={hasAssessment}
              readingLevel={readingLevel}
              lessonProgress={lessonProgress}
              userPlan={userPlan}
              weeklyCarrots={weeklyCarrots}
              recentCompleted={recentCompleted}
              getCompletionDate={getCompletionDate}
              showCurriculum={showCurriculum}
              setShowCurriculum={setShowCurriculum}
              expandedGrade={expandedGrade}
              setExpandedGrade={setExpandedGrade}
              onClose={() => setParentMode(false)}
            />
          </motion.aside>
        </div>
      )}
    </AnimatePresence>

    {/* Fixed sidebar (desktop) */}
    <aside
      className={`hidden lg:flex flex-col fixed top-[76px] left-0 bottom-0 z-30 bg-white dark:bg-slate-900 border-r border-zinc-200 dark:border-slate-700 transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        sidebarOpen ? "w-[272px]" : "w-[72px]"
      }`}
    >
      <div className="flex flex-col h-full">
          {sidebarOpen ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="flex-1 overflow-y-auto overflow-x-hidden"
            >
              <ParentSidebar
                child={child}
                currentChild={currentChild}
                childIndex={childIndex}
                hasAssessment={hasAssessment}
                readingLevel={readingLevel}
                lessonProgress={lessonProgress}
                userPlan={userPlan}
                weeklyCarrots={weeklyCarrots}
                recentCompleted={recentCompleted}
                getCompletionDate={getCompletionDate}
                showCurriculum={showCurriculum}
                setShowCurriculum={setShowCurriculum}
                expandedGrade={expandedGrade}
                setExpandedGrade={setExpandedGrade}
                onToggle={() => setSidebarOpen(false)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="flex flex-col items-center h-full py-3"
            >
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors mb-2"
                aria-label="Expand sidebar"
              >
                <ChevronDown className="w-5 h-5 text-zinc-400 rotate-90" strokeWidth={2} />
              </button>

              {/* Main */}
              <div className="space-y-1">
                <SidebarTooltip label="Dashboard">
                  <Link href="/dashboard" className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-50 transition-colors">
                    <Home className="w-5 h-5 text-indigo-500" strokeWidth={1.5} />
                  </Link>
                </SidebarTooltip>
                <SidebarTooltip label={hasAssessment ? "Placement Test Results" : "Take Placement Test"}>
                  <Link
                    href={hasAssessment ? `/assessment-results?child=${child.id}` : `/assessment?child=${child.id}`}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      !hasAssessment ? "bg-indigo-50" : "hover:bg-zinc-100"
                    }`}
                  >
                    <ClipboardCheck className={`w-5 h-5 ${!hasAssessment ? "text-indigo-500" : "text-zinc-500"}`} strokeWidth={1.5} />
                  </Link>
                </SidebarTooltip>
                <SidebarTooltip label="Analytics">
                  <Link href={`/analytics?child=${child.id}`} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors">
                    <BarChart3 className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
                  </Link>
                </SidebarTooltip>
              </div>

              <div className="w-5 h-px bg-zinc-200 my-2" />

              {/* Learning */}
              <div className="space-y-1">
                <SidebarTooltip label="Word Bank">
                  <Link href="/word-bank" className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors">
                    <BookText className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
                  </Link>
                </SidebarTooltip>
                <SidebarTooltip label="Practice">
                  <Link href={`/practice-hub?child=${child.id}`} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors">
                    <ListChecks className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
                  </Link>
                </SidebarTooltip>
                <SidebarTooltip label="Reading Journey">
                  <Link href={`/journey?child=${child.id}`} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors">
                    <Map className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
                  </Link>
                </SidebarTooltip>
              </div>

              <div className="w-5 h-px bg-zinc-200 my-2" />

              {/* Fun */}
              <div className="space-y-1">
                <SidebarTooltip label="Shop">
                  <Link href={`/shop?child=${child.id}`} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors">
                    <Carrot className="w-[19px] h-[19px] text-orange-500" strokeWidth={1.5} />
                  </Link>
                </SidebarTooltip>
                <SidebarTooltip label="Leaderboard">
                  <Link href={`/leaderboard?child=${child.id}`} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors">
                    <Trophy className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
                  </Link>
                </SidebarTooltip>
              </div>

              {/* Avatar at bottom */}
              <div className="mt-auto">
                <SidebarTooltip label={currentChild.first_name}>
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="w-10 h-10 rounded-lg overflow-hidden ring-2 ring-zinc-200 hover:ring-indigo-300 transition-all"
                  >
                    <img src={avatarSrc} alt={currentChild.first_name} className="w-full h-full object-cover" draggable={false} />
                  </button>
                </SidebarTooltip>
              </div>
            </motion.div>
          )}
        </div>
    </aside>

    {/* Main content with left margin to account for fixed sidebar */}
    <div className={`min-h-screen transition-[margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarOpen ? "lg:ml-[272px]" : "lg:ml-[72px]"}`}>
      <motion.div
        className="max-w-3xl mx-auto px-4 pt-10 pb-12"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* ── Nav bar (multi-child) ── */}
        {hasMultiple && (
          <motion.div variants={slideUp} className="flex items-center justify-between pt-2">
            <button
              onClick={onBack}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              &larr; All Readers
            </button>
            <select
              value={child.id}
              onChange={(e) => {
                const next = children.find((c) => c.id === e.target.value);
                if (next) onSwitch(next);
              }}
              className="text-sm border border-zinc-200 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800 text-zinc-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.first_name}
                </option>
              ))}
            </select>
          </motion.div>
        )}

        {/* ── Avatar + Greeting ── */}
        <motion.div variants={slideUp} className="text-center pt-6 pb-2">
          <div className="relative mx-auto mb-4 w-28">
            <button
              onClick={() => setAvatarPickerOpen(true)}
              className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer overflow-hidden ring-4 ring-white dark:ring-slate-800"
              aria-label="Change avatar"
            >
              <img src={avatarSrc} alt={currentChild.first_name} className="w-full h-full rounded-full object-cover" draggable={false} />
            </button>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-md pointer-events-none ring-2 ring-white dark:ring-slate-800">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-slate-100 tracking-tight">
            {greeting.text}, {currentChild.first_name}!
          </h1>
          <p className="text-zinc-500 dark:text-slate-400 mt-1 text-sm flex items-center justify-center gap-1.5">
            <span className="animate-wave inline-block">{greeting.icon}</span>
            {motivation}
          </p>
        </motion.div>

        {/* ── Stats Strip — horizontal bar ── */}
        <motion.div variants={slideUp} className="flex items-center justify-center gap-6 py-4">
          <Link href={`/carrot-rewards?child=${child.id}`} className="flex items-center gap-1.5 group">
            <Carrot className="w-5 h-5 text-amber-500 group-hover:animate-subtleBounce" strokeWidth={1.5} />
            <span ref={carrotCount.ref} className="text-lg font-extrabold text-zinc-900 dark:text-slate-100">{carrotCount.value}</span>
          </Link>
          <div className="w-px h-6 bg-zinc-200 dark:bg-slate-700" />
          <Link href={`/leaderboard?child=${child.id}`} className="flex items-center gap-1.5 group">
            <Flame className={`w-5 h-5 text-orange-500 ${child.streak_days > 0 ? "animate-fireGlow" : ""}`} strokeWidth={1.5} />
            <span ref={streakCount.ref} className="text-lg font-extrabold text-zinc-900 dark:text-slate-100">{streakCount.value}</span>
            <span className="text-xs text-zinc-400 font-medium">day streak</span>
          </Link>
          <div className="w-px h-6 bg-zinc-200 dark:bg-slate-700" />
          <Link href={`/stories?child=${child.id}`} className="flex items-center gap-1.5 group">
            <BookOpen className="w-5 h-5 text-indigo-500 group-hover:animate-subtleBounce" strokeWidth={1.5} />
            <span ref={storiesCount.ref} className="text-lg font-extrabold text-zinc-900 dark:text-slate-100">{storiesCount.value}</span>
          </Link>
        </motion.div>

        {/* ── Daily Goal + Next Action ── */}
        <motion.div variants={slideUp} className="space-y-4">
          {/* Daily Goal */}
          <div className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" className="dark:stroke-slate-700" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke={dailyGoalMet ? "#10b981" : "#6366f1"}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray="251"
                  strokeDashoffset={dailyGoalMet ? 0 : 251}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                {dailyGoalMet ? <Sparkles className="w-6 h-6 text-emerald-500" strokeWidth={1.5} /> : <Target className="w-6 h-6 text-indigo-500" strokeWidth={1.5} />}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-zinc-900 dark:text-slate-100">
                {dailyGoalMet ? "You did it!" : "Today's Goal"}
              </div>
              <div className="text-sm text-zinc-500 dark:text-slate-400">
                {dailyGoalMet
                  ? "Amazing work! Come back tomorrow for more."
                  : "Do 1 lesson today!"}
              </div>
            </div>
          </div>

          {/* Primary CTA: Assessment or Next Lesson */}
          {hasAssessment === false && (
            <Link href={`/assessment?child=${child.id}`} className="block">
              <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-500 p-6 text-center text-white hover:from-indigo-700 hover:to-violet-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                <Target className="w-14 h-14 text-white mx-auto mb-3" strokeWidth={1.5} />
                <div className="text-xl font-extrabold">Take Your Reading Quiz!</div>
                <div className="text-indigo-200 text-sm mt-1">
                  A fun 10-question quiz to find your reading level
                </div>
              </div>
            </Link>
          )}

          {hasAssessment && nextLesson && (
            <Link href={`/lesson?child=${child.id}&lesson=${nextLesson.id}`} className="block">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-500 p-5 text-white shadow-lg cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    {completedCount === 0 ? <Rocket className="w-9 h-9 text-white" strokeWidth={1.5} /> : <BookOpen className="w-9 h-9 text-white" strokeWidth={1.5} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">
                      {completedCount === 0 ? "Start Your Adventure!" : `Lesson ${nextLessonIdx + 1} of ${lessons.length}`}
                    </div>
                    <div className="text-white font-extrabold text-xl leading-tight truncate mt-0.5">
                      {nextLesson.title}
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3l14 9-14 9V3z" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </Link>
          )}

          {hasAssessment && !nextLesson && lessons.length > 0 && (
            <div className="rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-center text-white shadow-lg">
              <Trophy className="w-14 h-14 text-white mx-auto mb-3" strokeWidth={1.5} />
              <div className="text-xl font-extrabold">All Lessons Complete!</div>
              <div className="text-emerald-100 text-sm mt-1">
                {child.first_name} has finished all {lessons.length} lessons. Amazing!
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Hero Tiles — 2×2 grid ── */}
        <motion.div variants={slideUp} className="grid grid-cols-2 gap-4 pt-4">
          <Link
            href={hasAssessment ? `/practice?child=${child.id}&standard=${nextPracticeStandard.standard_id}` : `/assessment?child=${child.id}`}
            className="block"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="h-[150px] rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 p-5 flex flex-col items-center justify-center text-center shadow-lg cursor-pointer"
            >
              <Target className="w-14 h-14 text-white mb-2" strokeWidth={1.5} />
              <span className="text-lg font-extrabold text-white">Practice</span>
            </motion.div>
          </Link>

          <Link href={`/practice?child=${child.id}&types=sentence_build,category_sort`} className="block">
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="h-[150px] rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 p-5 flex flex-col items-center justify-center text-center shadow-lg cursor-pointer"
            >
              <Puzzle className="w-14 h-14 text-white mb-2" strokeWidth={1.5} />
              <span className="text-lg font-extrabold text-white">Games</span>
            </motion.div>
          </Link>

          <Link href={`/stories?child=${child.id}`} className="block">
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="h-[150px] rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 p-5 flex flex-col items-center justify-center text-center shadow-lg cursor-pointer"
            >
              <BookOpen className="w-14 h-14 text-white mb-2" strokeWidth={1.5} />
              <span className="text-lg font-extrabold text-white">Stories</span>
            </motion.div>
          </Link>

          <Link href={`/journey?child=${child.id}`} className="block">
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="h-[150px] rounded-3xl bg-gradient-to-br from-pink-400 to-rose-500 p-5 flex flex-col items-center justify-center text-center shadow-lg cursor-pointer"
            >
              <Map className="w-14 h-14 text-white mb-2" strokeWidth={1.5} />
              <span className="text-lg font-extrabold text-white">My Journey</span>
            </motion.div>
          </Link>
        </motion.div>

        {/* ── Mobile: Parent Dashboard toggle ── */}
        <motion.div variants={slideUp} className="pt-4 lg:hidden">
          <button
            onClick={() => setParentMode(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-zinc-400 dark:text-slate-500 hover:text-zinc-600 dark:hover:text-slate-300 hover:bg-zinc-50 dark:hover:bg-slate-800/50 transition-all border border-zinc-200 dark:border-slate-700"
          >
            <Lock className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Parent Dashboard</span>
          </button>
        </motion.div>

      {/* ── Avatar Picker Modal ── */}
      {avatarPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAvatarPickerOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 rounded-3xl bg-white dark:bg-slate-800 shadow-2xl overflow-hidden"
          >
            <div className="p-6 pb-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-slate-100">Choose Your Avatar</h2>
                <button
                  onClick={() => setAvatarPickerOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-6 pb-2">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Defaults</p>
              <div className="grid grid-cols-5 gap-3">
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
                          ? "ring-3 ring-indigo-500 scale-110"
                          : "hover:scale-105"
                      }`}
                    >
                      <img src={imgSrc} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover rounded-2xl" draggable={false} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-6 pt-4 pb-6 max-h-[40vh] overflow-y-auto">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Shop Avatars</p>
              <div className="grid grid-cols-5 gap-3">
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
                          ? "ring-3 ring-indigo-500 scale-110"
                          : owned
                            ? "hover:scale-105"
                            : "opacity-40 cursor-not-allowed grayscale"
                      }`}
                      title={owned ? item.name : `${item.name} — ${item.price} carrots`}
                    >
                      {imgSrc ? (
                        <img src={imgSrc} alt={item.name} className="w-full h-full object-cover rounded-2xl" draggable={false} />
                      ) : (
                        (() => { const SI = getShopIcon(item.icon); return <SI className="w-7 h-7 text-indigo-500" strokeWidth={1.5} />; })()
                      )}
                      {!owned && (
                        <span className="absolute bottom-0.5 right-0.5">
                          <Lock className="w-3 h-3 text-zinc-500" strokeWidth={2} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {shopAvatars.some((item) => !ownedAvatarIds.has(item.id)) && (
                <p className="text-xs text-zinc-400 mt-3 text-center">
                  Earn carrots <Carrot className="w-3 h-3 inline-block text-orange-500" strokeWidth={1.5} /> to unlock more avatars in the <Link href={`/shop?child=${currentChild.id}`} className="text-indigo-600 font-semibold hover:underline" onClick={() => setAvatarPickerOpen(false)}>Shop</Link>!
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
        ? "bg-indigo-50 text-indigo-700 font-medium"
        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
    }`;

  const navIconClass = (href: string) =>
    `w-4 h-4 ${isActive(href) ? "text-indigo-500" : "text-zinc-400"}`;

  const NAV_SECTIONS = [
    {
      label: "Main",
      items: [
        { href: "/dashboard", icon: Home, label: "Dashboard" },
        hasAssessment
          ? { href: `/assessment-results?child=${child.id}`, icon: ClipboardCheck, label: "Placement Test Results" }
          : { href: `/assessment?child=${child.id}`, icon: ClipboardCheck, label: "Take Placement Test", emphasis: true },
        { href: `/analytics?child=${child.id}`, icon: BarChart3, label: "Analytics" },
      ],
    },
    {
      label: "Learning",
      items: [
        { href: "/word-bank", icon: BookText, label: "Word Bank" },
        { href: `/practice-hub?child=${child.id}`, icon: ListChecks, label: "Practice" },
        { href: `/journey?child=${child.id}`, icon: Map, label: "Reading Journey" },
      ],
    },
    {
      label: "Fun",
      items: [
        { href: `/shop?child=${child.id}`, icon: Carrot, label: "Shop", iconColor: "w-[17px] h-[17px] text-orange-500" },
        { href: `/leaderboard?child=${child.id}`, icon: Trophy, label: "Leaderboard" },
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
            <ChevronDown className="w-4 h-4 text-zinc-400 -rotate-90" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* ── Separator ── */}
      <div className="mx-3 h-px bg-zinc-200" />

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto py-2 space-y-4">
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
                    ? "flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[13px] font-semibold transition-colors bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    : navLinkClass(href)
                  }
                >
                  <Icon className={iconColor || (emphasis && !isActive(href) ? "w-4 h-4 text-indigo-500" : navIconClass(href))} strokeWidth={1.5} />
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
                        ? "bg-indigo-200"
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
        <ChevronsUpDown className="w-4 h-4 text-zinc-400 flex-shrink-0" strokeWidth={1.5} />
      </button>

      {/* Popover (opens upward) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
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
                <User className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                Account
              </Link>
              <Link
                href="/billing"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <CreditCard className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                Billing
              </Link>
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <Bell className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                Notifications
              </Link>
            </div>

            <div className="h-px bg-zinc-100" />

            <div className="py-1 px-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <LogOut className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
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
          className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
        >
          <Star className="w-3.5 h-3.5 text-indigo-500" fill="currentColor" strokeWidth={0} />
          <span className="text-[12px] font-medium text-indigo-700">Unlock {lockedLessonsCount} more lessons</span>
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
                    <div className="w-[18px] h-[18px] rounded-full bg-indigo-500 ring-4 ring-indigo-100 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  ) : isLocked ? (
                    <div className="w-[18px] h-[18px] rounded-full bg-zinc-200 flex items-center justify-center">
                      <Lock className="w-2 h-2 text-zinc-400" strokeWidth={2.5} />
                    </div>
                  ) : (
                    <div className="w-[18px] h-[18px] rounded-full border-2 border-zinc-200 bg-white" />
                  )}
                </div>

                {/* Content */}
                <Link
                  href={isLocked ? `/upgrade?child=${child.id}` : `/lesson?child=${child.id}&lesson=${lesson.id}`}
                  className={`flex-1 min-w-0 rounded-lg px-2 py-1.5 -mx-1 transition-colors ${
                    isNext
                      ? "bg-indigo-50 hover:bg-indigo-100"
                      : isLocked
                      ? "opacity-50"
                      : "hover:bg-zinc-50"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-bold tabular-nums ${
                      complete ? "text-emerald-600" : isNext ? "text-indigo-600" : "text-zinc-400"
                    }`}>
                      {i + 1}
                    </span>
                    <span className={`text-[12px] font-medium truncate ${
                      isLocked || isFuture ? "text-zinc-400" : isNext ? "text-indigo-900" : "text-zinc-700"
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
    <div className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-5 hover:bg-zinc-50/50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <h3 className="text-base font-bold text-zinc-900 dark:text-slate-100">Full Curriculum</h3>
        <span className="text-xs text-indigo-600 font-medium">
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
                      ? "bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40"
                      : "bg-zinc-50 dark:bg-slate-700/50 border border-zinc-100 dark:border-slate-700 hover:bg-zinc-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-semibold ${isCurrent ? "text-indigo-700 dark:text-indigo-300" : "text-zinc-700 dark:text-slate-300"}`}>
                      {GRADE_LABELS[key]}
                    </span>
                    <span className={`text-xs ${isCurrent ? "text-indigo-500 dark:text-indigo-400" : "text-zinc-400 dark:text-slate-500"}`}>
                      {level.level_name}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                    strokeWidth={2}
                  />
                </button>

                {isExpanded && (
                  <div className="mt-1 ml-3 pl-3 border-l-2 border-zinc-100 dark:border-slate-700 space-y-1.5 py-2">
                    <p className="text-[11px] text-zinc-400 dark:text-slate-500 mb-1">{level.focus}</p>
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
                            <span className="text-sm text-zinc-700 dark:text-slate-300">{lesson.title}</span>
                            <span className="text-xs text-zinc-400 dark:text-slate-500 ml-1.5">
                              · {formatSkillName(lesson.skill)}
                            </span>
                            {lesson.standards && lesson.standards.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {lesson.standards.map((s) => (
                                  <span key={s} className="text-[10px] px-1 py-px rounded bg-zinc-100 dark:bg-slate-700 text-zinc-400 dark:text-slate-500">
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
