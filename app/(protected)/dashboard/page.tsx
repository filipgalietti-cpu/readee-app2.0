"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child, LessonProgress } from "@/lib/db/types";
import { levelNameToGradeKey } from "@/lib/assessment/questions";
import lessonsData from "@/lib/data/lessons.json";
import LevelProgressBar, { GRADES } from "@/app/_components/LevelProgressBar";
import { useChildStore } from "@/lib/stores/child-store";
import { safeValidate } from "@/lib/validate";
import { ChildSchema } from "@/lib/schemas";
import { staggerContainer, slideUp, staggerFast } from "@/lib/motion/variants";
import { getStandardsForGrade } from "@/lib/data/all-standards";
import { getChildAvatar, DEFAULT_AVATARS } from "@/lib/utils/get-child-avatar";
import { getItemsByCategory } from "@/lib/data/shop-items";
import type { ShopPurchase, EquippedItems } from "@/lib/db/types";

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
  "You're doing amazing! 🌟",
  "Every lesson makes you stronger! 💪",
  "Reading superstar in the making! ⭐",
  "Keep it up, you're on fire! 🔥",
  "Your brain is growing! 🧠",
  "One more page, one more adventure! 🚀",
  "Readers are leaders! 📚",
  "You're unstoppable! 💫",
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

function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good morning", emoji: "☀️" };
  if (h < 17) return { text: "Good afternoon", emoji: "🌤️" };
  return { text: "Good evening", emoji: "🌙" };
}

export default function Dashboard() {
  const children = useChildStore((s) => s.children);
  const selectedChild = useChildStore((s) => s.childData);
  const setStoreChildren = useChildStore((s) => s.setChildren);
  const setStoreChildData = useChildStore((s) => s.setChildData);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string>("free");

  const setChildren = (kids: Child[]) => setStoreChildren(kids);
  const setSelectedChild = (child: Child | null) => setStoreChildData(child);

  useEffect(() => {
    async function fetchChildren() {
      const supabase = supabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch user plan
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();
      setUserPlan((profile as { plan?: string } | null)?.plan || "free");

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
      }
      setLoading(false);
    }
    fetchChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <div className="w-20 h-20 rounded-2xl bg-indigo-50 mx-auto mb-6 flex items-center justify-center text-4xl">
          📚
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-slate-100 tracking-tight">
          Welcome to Readee!
        </h1>
        <p className="text-zinc-500 dark:text-slate-400 mt-2">
          Let&apos;s set up your readers.
        </p>
      </div>

      <div className="space-y-4">
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
            ⭐ Upgrade to Readee+ for up to 5 children
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
    <div className="py-10 space-y-10 max-w-[480px] mx-auto">
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
                <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl flex-shrink-0">
                  {getChildAvatar(child, index)}
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
                  <div>{Number(child.carrots) || 0} 🥕</div>
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
  const [userPlan, setUserPlan] = useState<string>("free");
  const setStoreChildren = useChildStore((s) => s.setChildren);
  const setStoreChildData = useChildStore((s) => s.setChildData);
  const childIndex = children.findIndex((c) => c.id === child.id);
  const [currentChild, setCurrentChild] = useState(child);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [purchases, setPurchases] = useState<ShopPurchase[]>([]);
  const avatar = getChildAvatar(currentChild, childIndex);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .single();
        setUserPlan((profile as { plan?: string } | null)?.plan || "free");
      }

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

  // Reading level is now settings-only — removed handleReadingLevelChange

  // Compute lesson data for CTA
  const file = lessonsData as unknown as LessonsFile;
  const gradeKey = levelNameToGradeKey(readingLevel);
  const level = file.levels[gradeKey];
  const lessons = level?.lessons || [];

  const isLessonComplete = (lessonId: string) => {
    const sections = lessonProgress.filter((p) => p.lesson_id === lessonId);
    const completedSections = new Set(sections.map((s) => s.section));
    return completedSections.has("learn") && completedSections.has("practice") && completedSections.has("read");
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
    const dayOfWeek = now.getDay(); // 0 = Sunday
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
          // Estimate carrots from section: learn=5, practice=5, read=10
          const carrots = p.section === "read" ? 10 : 5;
          carrotsPerDay[diff] += carrots;
        }
      }
    }

    const todayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const maxCarrots = Math.max(...carrotsPerDay, 20); // 20 as minimum max for bar scale

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

  // Carrot milestone
  const carrots = Number(child.carrots) || 0;

  // Count-up animations for stats
  const carrotCount = useCountUp(carrots);
  const storiesCount = useCountUp(child.stories_read);
  const streakCount = useCountUp(child.streak_days);

  // ── Avatar picker logic ──
  const shopAvatars = getItemsByCategory("avatars");
  const ownedAvatarIds = new Set(purchases.filter((p) => p.item_id.startsWith("avatar_")).map((p) => p.item_id));
  const equippedAvatarId = currentChild.equipped_items?.avatar ?? null;

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
      // Sync zustand store: update selected child + children array
      setStoreChildData(updated);
      setStoreChildren(children.map((c) => (c.id === updated.id ? updated : c)));
    }
    setAvatarPickerOpen(false);
  };

  return (
    <motion.div
      className="max-w-[480px] mx-auto space-y-6 pb-12 px-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Nav */}
      {hasMultiple && (
        <motion.div variants={slideUp} className="flex items-center justify-between">
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
            {children.map((c, i) => (
              <option key={c.id} value={c.id}>
                {getChildAvatar(c, i)} {c.first_name}
              </option>
            ))}
          </select>
        </motion.div>
      )}

      {/* ── Greeting (enlarged) ── */}
      <motion.div variants={slideUp} className="text-center pt-4">
        <div className="relative mx-auto mb-4 w-24">
          <button
            onClick={() => setAvatarPickerOpen(true)}
            className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center text-5xl shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            aria-label="Change avatar"
          >
            {avatar}
          </button>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shadow-md pointer-events-none">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-slate-100 tracking-tight">
          {greeting.text}, {currentChild.first_name}! <span className="animate-wave">{greeting.emoji}</span>
        </h1>
        <p className="text-zinc-500 dark:text-slate-400 mt-1 text-sm">{motivation}</p>
      </motion.div>

      {/* ── Avatar Picker Modal ── */}
      {avatarPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAvatarPickerOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
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
              <div className="grid grid-cols-5 gap-3">
                {DEFAULT_AVATARS.map((emoji, i) => {
                  const id = `default_${i}`;
                  const isActive = equippedAvatarId === id || (!equippedAvatarId && i === childIndex % DEFAULT_AVATARS.length);
                  return (
                    <button
                      key={id}
                      onClick={() => handleEquipAvatar(i === childIndex % DEFAULT_AVATARS.length ? null : id)}
                      className={`aspect-square rounded-2xl flex items-center justify-center text-3xl transition-all duration-200 ${
                        isActive
                          ? "bg-indigo-100 ring-2 ring-indigo-500 scale-110"
                          : "bg-zinc-100 hover:bg-zinc-200 hover:scale-105"
                      }`}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-6 pt-4 pb-6">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Shop Avatars</p>
              <div className="grid grid-cols-5 gap-3">
                {shopAvatars.map((item) => {
                  const owned = ownedAvatarIds.has(item.id);
                  const isActive = equippedAvatarId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => owned && handleEquipAvatar(item.id)}
                      disabled={!owned}
                      className={`aspect-square rounded-2xl flex items-center justify-center text-3xl relative transition-all duration-200 ${
                        isActive
                          ? "bg-indigo-100 ring-2 ring-indigo-500 scale-110"
                          : owned
                            ? "bg-zinc-100 hover:bg-zinc-200 hover:scale-105"
                            : "bg-zinc-50 opacity-40 cursor-not-allowed"
                      }`}
                      title={owned ? item.name : `${item.name} — ${item.price} carrots`}
                    >
                      {item.emoji}
                      {!owned && (
                        <span className="absolute bottom-0.5 right-0.5 text-[10px]">
                          🔒
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {shopAvatars.some((item) => !ownedAvatarIds.has(item.id)) && (
                <p className="text-xs text-zinc-400 mt-3 text-center">
                  Earn carrots to unlock more avatars in the Shop!
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Hero Tiles — 2×2 grid ── */}
      <motion.div variants={slideUp} className="grid grid-cols-2 gap-4">
        {/* Practice */}
        <Link
          href={hasAssessment ? `/practice?child=${child.id}&standard=${nextPracticeStandard.standard_id}` : `/assessment?child=${child.id}`}
          className="block"
        >
          <div className="min-h-[140px] rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-500 dark:from-indigo-700 dark:to-violet-600 p-5 flex flex-col items-center justify-center text-center shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-transform duration-200 cursor-pointer">
            <span className="text-5xl mb-2">🎯</span>
            <span className="text-lg font-extrabold text-white">Practice</span>
          </div>
        </Link>

        {/* Games */}
        <Link
          href={`/practice?child=${child.id}&types=sentence_build,category_sort`}
          className="block"
        >
          <div className="min-h-[140px] rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 p-5 flex flex-col items-center justify-center text-center shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-transform duration-200 cursor-pointer">
            <span className="text-5xl mb-2">🧩</span>
            <span className="text-lg font-extrabold text-white">Games</span>
          </div>
        </Link>

        {/* Stories */}
        <Link href={`/stories?child=${child.id}`} className="block">
          <div className="min-h-[140px] rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 p-5 flex flex-col items-center justify-center text-center shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-transform duration-200 cursor-pointer">
            <span className="text-5xl mb-2">📚</span>
            <span className="text-lg font-extrabold text-white">Stories</span>
          </div>
        </Link>

        {/* My Journey */}
        <Link href={`/roadmap?child=${child.id}`} className="block">
          <div className="min-h-[140px] rounded-3xl bg-gradient-to-br from-pink-500 to-rose-500 dark:from-pink-600 dark:to-rose-600 p-5 flex flex-col items-center justify-center text-center shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-transform duration-200 cursor-pointer">
            <span className="text-5xl mb-2">🗺️</span>
            <span className="text-lg font-extrabold text-white">My Journey</span>
          </div>
        </Link>
      </motion.div>

      {/* ── Stats Row — chunky stat cards ── */}
      <motion.div variants={slideUp} className="grid grid-cols-3 gap-4">
        {/* Carrots Card */}
        <Link href={`/carrot-rewards?child=${child.id}`} className="block">
          <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/30 dark:to-slate-800 p-4 min-h-[120px] flex flex-col items-center justify-center text-center hover:shadow-md hover:scale-[1.02] transition-all duration-200 group cursor-pointer">
            <div className="text-4xl mb-1 group-hover:animate-subtleBounce">🥕</div>
            <div ref={carrotCount.ref} className="text-3xl font-extrabold text-zinc-900 dark:text-slate-100">{carrotCount.value}</div>
            <div className="text-sm text-zinc-500 dark:text-slate-400 mt-0.5 font-medium">Carrots</div>
          </div>
        </Link>

        {/* Stories Card */}
        <Link href={`/stories?child=${child.id}`} className="block">
          <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/30 dark:to-slate-800 p-4 min-h-[120px] flex flex-col items-center justify-center text-center hover:shadow-md hover:scale-[1.02] transition-all duration-200 group cursor-pointer">
            <div className="text-4xl mb-1 group-hover:animate-subtleBounce">📚</div>
            <div ref={storiesCount.ref} className="text-3xl font-extrabold text-zinc-900 dark:text-slate-100">{storiesCount.value}</div>
            <div className="text-sm text-zinc-500 dark:text-slate-400 mt-0.5 font-medium">Stories</div>
          </div>
        </Link>

        {/* Streak Card */}
        <Link href={`/leaderboard?child=${child.id}`} className="block">
          <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-gradient-to-b from-orange-50 to-white dark:from-orange-950/30 dark:to-slate-800 p-4 min-h-[120px] flex flex-col items-center justify-center text-center hover:shadow-md hover:scale-[1.02] transition-all duration-200 group cursor-pointer">
            <div className={`text-4xl mb-1 ${child.streak_days > 0 ? "animate-fireGlow" : ""}`}>🔥</div>
            <div ref={streakCount.ref} className="text-3xl font-extrabold text-zinc-900 dark:text-slate-100">{streakCount.value}</div>
            <div className="text-sm text-zinc-500 dark:text-slate-400 mt-0.5 font-medium">Day Streak</div>
          </div>
        </Link>
      </motion.div>

      {/* ── Daily Goal (simplified, full-width tile) ── */}
      <motion.div variants={slideUp} className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 flex items-center gap-5">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" className="dark:stroke-slate-700" />
            <circle
              cx="50" cy="50" r="40" fill="none"
              stroke={dailyGoalMet ? "#10b981" : "#6366f1"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="251"
              strokeDashoffset={dailyGoalMet ? 0 : 251}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            {dailyGoalMet ? "🎉" : "🎯"}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-zinc-900 dark:text-slate-100 text-base">
            {dailyGoalMet ? "You did it!" : "Today's Goal"}
          </div>
          <div className="text-sm text-zinc-500 dark:text-slate-400 mt-0.5">
            {dailyGoalMet
              ? "Amazing work! Come back tomorrow for more."
              : "Do 1 lesson today!"}
          </div>
        </div>
      </motion.div>

      {/* ── Primary CTA: Assessment or Next Lesson (enlarged) ── */}
      {hasAssessment === false && (
        <motion.div variants={slideUp}>
          <Link href={`/assessment?child=${child.id}`} className="block">
            <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-500 p-7 text-center text-white hover:from-indigo-700 hover:to-violet-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
              <div className="text-5xl mb-3">🎯</div>
              <div className="text-xl font-extrabold">Take Your Reading Quiz!</div>
              <div className="text-indigo-200 text-base mt-1">
                A fun 10-question quiz to find {child.first_name}&apos;s reading level
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {hasAssessment && nextLesson && (
        <motion.div variants={slideUp}>
          <Link href={`/lesson?child=${child.id}&lesson=${nextLesson.id}`} className="block">
            <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-500 p-6 text-white hover:from-indigo-700 hover:to-violet-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-4xl flex-shrink-0">
                  {completedCount === 0 ? "🚀" : "📖"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-indigo-200 text-sm font-medium">
                    {completedCount === 0 ? "Begin Your Reading Adventure!" : `Continue: Lesson ${nextLessonIdx + 1}`}
                  </div>
                  <div className="text-white font-extrabold text-xl leading-tight truncate">
                    {nextLesson.title}
                  </div>
                  <div className="text-indigo-200 text-sm mt-1">
                    {completedCount} of {lessons.length} lessons complete
                  </div>
                </div>
                <div className="flex-shrink-0 text-white/80">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {hasAssessment && !nextLesson && lessons.length > 0 && (
        <motion.div variants={slideUp}>
          <div className="rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 p-7 text-center text-white shadow-lg">
            <div className="text-5xl mb-3">🏆</div>
            <div className="text-xl font-extrabold">All Lessons Complete!</div>
            <div className="text-emerald-100 text-base mt-1">
              {child.first_name} has finished all {lessons.length} lessons. Amazing!
            </div>
          </div>
        </motion.div>
      )}

      {/* ── For Parents divider ── */}
      <motion.div variants={slideUp} className="flex items-center gap-3 pt-2">
        <div className="flex-1 h-px bg-zinc-200 dark:bg-slate-700" />
        <span className="text-xs font-semibold text-zinc-400 dark:text-slate-500 uppercase tracking-wider">For Parents</span>
        <div className="flex-1 h-px bg-zinc-200 dark:bg-slate-700" />
      </motion.div>

      {/* ── Analytics Link ── */}
      <motion.div variants={slideUp}>
        <Link href={`/analytics?child=${child.id}`} className="block">
          <div className="rounded-2xl border border-violet-200 dark:border-violet-800/40 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 p-4 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-xl shadow-sm group-hover:scale-105 transition-transform">
                📊
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-zinc-900 dark:text-slate-100">Progress Report</div>
                <div className="text-[11px] text-zinc-500 dark:text-slate-400 mt-0.5">Performance analytics</div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* ── Lesson Path ── */}
      {hasAssessment && (
        <motion.div variants={slideUp}>
          <LessonPath child={child} readingLevel={readingLevel} lessonProgress={lessonProgress} userPlan={userPlan} />
        </motion.div>
      )}

      {/* ── Curriculum Overview ── */}
      <motion.div variants={slideUp}>
        <CurriculumOverview
          readingLevel={readingLevel}
          lessonProgress={lessonProgress}
          showCurriculum={showCurriculum}
          setShowCurriculum={setShowCurriculum}
          expandedGrade={expandedGrade}
          setExpandedGrade={setExpandedGrade}
        />
      </motion.div>

      {/* ── Weekly Progress ── */}
      <motion.div variants={slideUp} className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <h3 className="text-base font-bold text-zinc-900 dark:text-slate-100 mb-4">Weekly Progress</h3>
        <div className="space-y-2.5">
          {weeklyCarrots.map(({ day, carrots, pct, isToday, isPast }) => (
            <div key={day} className="flex items-center gap-3">
              <span className={`w-10 text-xs font-semibold ${isToday ? "text-indigo-600" : "text-zinc-500"}`}>
                {day}
              </span>
              <div className="flex-1 h-2.5 bg-zinc-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    carrots > 0
                      ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                      : isToday
                      ? "bg-indigo-200"
                      : ""
                  }`}
                  style={{ width: carrots > 0 ? `${Math.max(pct, 8)}%` : isToday ? "4%" : "0%" }}
                />
              </div>
              <span className={`w-14 text-right text-xs font-medium ${
                carrots > 0 ? "text-emerald-600" : isToday ? "text-indigo-400" : isPast ? "text-zinc-300" : "text-zinc-300"
              }`}>
                {carrots > 0 ? `${carrots} 🥕` : isToday ? "Today" : "—"}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Recent Activity ── */}
      <motion.div variants={slideUp} className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <h3 className="text-base font-bold text-zinc-900 dark:text-slate-100 mb-4">Recent Activity</h3>
        {recentCompleted.length > 0 ? (
          <div className="space-y-3">
            {recentCompleted.map(({ lesson, idx }) => {
              const date = getCompletionDate(lesson.id);
              return (
                <div key={lesson.id} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-sm font-bold flex-shrink-0">
                    ✓
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-900 dark:text-slate-200 truncate">
                      Lesson {idx + 1}: {lesson.title}
                    </div>
                    <div className="text-xs text-zinc-400 dark:text-slate-500">
                      {formatSkillName(lesson.skill)}
                    </div>
                  </div>
                  {date && (
                    <span className="text-xs text-zinc-400 flex-shrink-0">{date}</span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-2xl mb-2">🌱</div>
            <p className="text-sm text-zinc-400">
              No activity yet. Start your first lesson to see progress here!
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
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

  const isLessonComplete = (lessonId: string) => {
    const sections = lessonProgress.filter((p) => p.lesson_id === lessonId);
    const completedSections = new Set(sections.map((s) => s.section));
    return completedSections.has("learn") && completedSections.has("practice") && completedSections.has("read");
  };

  let firstIncomplete = -1;
  for (let i = 0; i < lessons.length; i++) {
    if (!isLessonComplete(lessons[i].id)) {
      firstIncomplete = i;
      break;
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-zinc-900 dark:text-slate-100">Your Reading Path</h3>
        {readingLevel && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700">
            {readingLevel}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {lessons.map((lesson, i) => {
          const complete = isLessonComplete(lesson.id);
          const isNext = i === firstIncomplete;
          const isFuture = !complete && !isNext;
          const isFree = isLessonFree(lesson.id);
          const isLocked = !isFree && userPlan !== "premium";

          return (
            <div
              key={lesson.id}
              className={`rounded-xl border p-4 transition-all duration-200 relative ${
                isLocked
                  ? "border-zinc-200 dark:border-slate-700 bg-zinc-50/80 dark:bg-slate-800/50 opacity-75"
                  : complete
                  ? "border-green-200 dark:border-green-800/40 bg-green-50/50 dark:bg-green-950/20"
                  : isNext
                  ? "border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm"
                  : "border-zinc-100 dark:border-slate-700 bg-zinc-50/50 dark:bg-slate-800/50 opacity-60"
              } ${!isFuture && !isLocked ? "hover:shadow-md" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    isLocked
                      ? "bg-zinc-100 text-zinc-400"
                      : complete
                      ? "bg-green-100 text-green-600"
                      : isNext
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-zinc-100 text-zinc-400"
                  }`}
                >
                  {isLocked ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ) : complete ? "✓" : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${isLocked || isFuture ? "text-zinc-400 dark:text-slate-500" : "text-zinc-900 dark:text-slate-100"}`}>
                      Lesson {i + 1}: {lesson.title}
                    </span>
                    {isLocked && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-600">
                        Readee+
                      </span>
                    )}
                  </div>
                  <div className={`text-xs mt-0.5 ${isLocked || isFuture ? "text-zinc-300 dark:text-slate-600" : "text-zinc-500 dark:text-slate-400"}`}>
                    {formatSkillName(lesson.skill)}
                  </div>
                  {lesson.standards && lesson.standards.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {lesson.standards.map((s) => (
                        <span key={s} className={`text-[10px] px-1.5 py-0.5 rounded ${isLocked || isFuture ? "bg-zinc-100 dark:bg-slate-700 text-zinc-300 dark:text-slate-600" : "bg-zinc-100 dark:bg-slate-700 text-zinc-400 dark:text-slate-500"}`}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {isLocked && (
                  <Link
                    href={`/upgrade?child=${child.id}`}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[11px] font-bold hover:from-indigo-600 hover:to-violet-600 transition-all shadow-sm flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Unlock
                  </Link>
                )}
                {!isLocked && complete && (
                  <span className="text-xs font-semibold text-green-600">Completed</span>
                )}
                {!isLocked && isNext && (
                  <Link
                    href={`/practice?child=${child.id}&standard=${lesson.standards?.[0] || 'RF.K.1a'}`}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-xs font-bold hover:from-indigo-700 hover:to-violet-600 transition-all shadow-sm hover:shadow-md"
                  >
                    Start
                  </Link>
                )}
              </div>
            </div>
          );
        })}
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
    const sections = lessonProgress.filter((p) => p.lesson_id === lessonId);
    const completedSections = new Set(sections.map((s) => s.section));
    return completedSections.has("learn") && completedSections.has("practice") && completedSections.has("read");
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
                  <svg
                    className={`w-4 h-4 text-zinc-400 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
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
