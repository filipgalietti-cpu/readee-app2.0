"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child, LessonProgress } from "@/lib/db/types";
import { levelNameToGradeKey } from "@/lib/assessment/questions";
import lessonsData from "@/lib/data/lessons.json";
import LevelProgressBar, { GRADES } from "@/app/_components/LevelProgressBar";

const AVATARS = ["😊", "🦊", "🐱", "🦋", "🐻"];

const GRADE_KEYS = ["pre-k", "kindergarten", "1st", "2nd", "3rd"] as const;
const GRADE_LABELS: Record<string, string> = {
  "pre-k": "Pre-K",
  "kindergarten": "Kindergarten",
  "1st": "1st Grade",
  "2nd": "2nd Grade",
  "3rd": "3rd Grade",
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

function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good morning", emoji: "☀️" };
  if (h < 17) return { text: "Good afternoon", emoji: "🌤️" };
  return { text: "Good evening", emoji: "🌙" };
}

export default function Dashboard() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

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

      const kids = (data || []) as Child[];
      setChildren(kids);
      if (kids.length === 1) {
        setSelectedChild(kids[0]);
      }
      setLoading(false);
    }
    fetchChildren();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  if (children.length === 0) {
    return <AddChildrenForm onDone={(kids) => {
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

function AddChildrenForm({ onDone }: { onDone: (kids: Child[]) => void }) {
  const [rows, setRows] = useState<ChildRow[]>([{ name: "", grade: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateRow = (index: number, field: keyof ChildRow, value: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const addRow = () => {
    if (rows.length < 5) setRows((prev) => [...prev, { name: "", grade: "" }]);
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

    onDone((data || []) as Child[]);
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4 space-y-8">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-indigo-50 mx-auto mb-6 flex items-center justify-center text-4xl">
          📚
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Welcome to Readee!
        </h1>
        <p className="text-zinc-500 mt-2">
          Let&apos;s set up your readers.
        </p>
      </div>

      <div className="space-y-4">
        {rows.map((row, index) => (
          <div key={index} className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-500">
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
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <select
              value={row.grade}
              onChange={(e) => updateRow(index, "grade", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-zinc-700"
            >
              <option value="">Select grade</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {rows.length < 5 && (
        <button
          onClick={addRow}
          className="w-full py-3 rounded-xl border-2 border-dashed border-zinc-200 text-sm font-medium text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
        >
          + Add another child
        </button>
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
    <div className="py-10 space-y-10 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
          Who&apos;s reading today?
        </h1>
        <p className="text-zinc-500 mt-2">Select a reader to get started</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {children.map((child, index) => (
          <button
            key={child.id}
            onClick={() => onSelect(child)}
            className="group text-left w-full"
          >
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 hover:border-indigo-300 hover:shadow-md transition-all duration-200 group-hover:scale-[1.02] space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl flex-shrink-0">
                  {AVATARS[index % AVATARS.length]}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-zinc-900 truncate">
                    {child.first_name}
                  </h2>
                  {child.grade && (
                    <span className="text-xs font-medium text-indigo-600">
                      {child.grade}
                    </span>
                  )}
                </div>
                <div className="text-right text-xs text-zinc-400 space-y-1">
                  <div>{child.xp} XP</div>
                  <div>{child.streak_days}d streak</div>
                </div>
              </div>
              <div className="pointer-events-none">
                <LevelProgressBar
                  currentLevel={child.reading_level}
                  onLevelChange={() => {}}
                />
              </div>
            </div>
          </button>
        ))}
      </div>
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
  const childIndex = children.findIndex((c) => c.id === child.id);
  const avatar = AVATARS[childIndex % AVATARS.length];
  const hasMultiple = children.length > 1;
  const greeting = getGreeting();
  const motivation = useMemo(() => MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)], []);

  useEffect(() => {
    async function checkAssessment() {
      const supabase = supabaseBrowser();
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
  }, [child.id]);

  async function handleReadingLevelChange(level: string) {
    const supabase = supabaseBrowser();
    await supabase.from("children").update({ reading_level: level }).eq("id", child.id);
    setReadingLevel(level);
  }

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

  // Weekly progress: XP earned per day this week
  const weeklyXP = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const xpPerDay: number[] = [0, 0, 0, 0, 0, 0, 0];

    for (const p of lessonProgress) {
      const d = new Date(p.completed_at);
      if (d >= monday) {
        const diff = Math.floor((d.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff < 7) {
          // Estimate XP from section: learn=5, practice=5, read=10
          const xp = p.section === "read" ? 10 : 5;
          xpPerDay[diff] += xp;
        }
      }
    }

    const todayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const maxXP = Math.max(...xpPerDay, 20); // 20 as minimum max for bar scale

    return days.map((day, i) => ({
      day,
      xp: xpPerDay[i],
      pct: Math.round((xpPerDay[i] / maxXP) * 100),
      isToday: i === todayIdx,
      isPast: i < todayIdx,
    }));
  }, [lessonProgress]);

  // Daily goal: complete 1 lesson today
  const dailyGoalMet = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = new Set<string>();
    for (const p of lessonProgress) {
      const d = new Date(p.completed_at);
      if (d >= today) {
        completedToday.add(`${p.lesson_id}:${p.section}`);
      }
    }
    // Check if any lesson has all 3 sections completed today
    for (const l of lessons) {
      if (
        completedToday.has(`${l.id}:learn`) &&
        completedToday.has(`${l.id}:practice`) &&
        completedToday.has(`${l.id}:read`)
      ) {
        return true;
      }
    }
    return false;
  }, [lessonProgress, lessons]);

  // XP milestone
  const xpMilestones = [25, 50, 100, 200, 500, 1000];
  const nextMilestone = xpMilestones.find((m) => m > child.xp) || child.xp + 100;
  const prevMilestone = [...xpMilestones].reverse().find((m) => m <= child.xp) || 0;
  const xpProgress = Math.round(((child.xp - prevMilestone) / (nextMilestone - prevMilestone)) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 px-4">
      {/* Nav */}
      {hasMultiple && (
        <div className="flex items-center justify-between animate-slideUp">
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
            className="text-sm border border-zinc-200 rounded-lg px-3 py-1.5 bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {children.map((c, i) => (
              <option key={c.id} value={c.id}>
                {AVATARS[i % AVATARS.length]} {c.first_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ── Greeting ── */}
      <div className="text-center pt-4 dash-slide-up-1">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 mx-auto mb-4 flex items-center justify-center text-4xl shadow-sm">
          {avatar}
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
          {greeting.text}, {child.first_name}! <span className="animate-wave">{greeting.emoji}</span>
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">{motivation}</p>
      </div>

      {/* ── Reading Level Badge ── */}
      {readingLevel && (
        <div className="dash-slide-up-2">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-4 flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
              📖
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white/70 text-xs font-medium">Current Level</div>
              <div className="text-white font-bold text-lg leading-tight">{readingLevel}</div>
            </div>
            {child.grade && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white flex-shrink-0">
                {child.grade}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Reading Level Progress (clickable) ── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dash-slide-up-2">
        <LevelProgressBar
          currentLevel={readingLevel}
          onLevelChange={handleReadingLevelChange}
        />
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-3 gap-3 dash-slide-up-3">
        {/* XP Card */}
        <Link href={`/xp-rewards?child=${child.id}`} className="block">
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50 to-white p-4 text-center hover:shadow-md hover:scale-[1.02] transition-all duration-200 group cursor-pointer">
            <div className="text-xl mb-1 group-hover:animate-subtleBounce">⭐</div>
            <div className="text-xl font-bold text-zinc-900">{child.xp}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5 font-medium">XP</div>
            <div className="mt-2 h-1.5 bg-amber-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(xpProgress, 100)}%` }}
              />
            </div>
            <div className="text-[9px] text-amber-600 mt-1 font-medium">{child.xp}/{nextMilestone} XP</div>
            <div className="text-[9px] text-amber-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">View rewards →</div>
          </div>
        </Link>

        {/* Stories Card */}
        <Link href={`/stories?child=${child.id}`} className="block">
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50 to-white p-4 text-center hover:shadow-md hover:scale-[1.02] transition-all duration-200 group cursor-pointer">
            <div className="text-xl mb-1 group-hover:animate-subtleBounce">
              {child.stories_read > 0 ? "📚" : "📖"}
            </div>
            <div className="text-xl font-bold text-zinc-900">{child.stories_read}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5 font-medium">Stories Read</div>
            <div className="flex justify-center gap-0.5 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-4 rounded-sm transition-colors ${
                    i < Math.min(child.stories_read, 5)
                      ? "bg-indigo-400"
                      : "bg-zinc-100"
                  }`}
                />
              ))}
            </div>
            <div className="text-[9px] text-indigo-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">View library →</div>
          </div>
        </Link>

        {/* Streak Card */}
        <Link href={`/leaderboard?child=${child.id}`} className="block">
          <div className="rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50 to-white p-4 text-center hover:shadow-md hover:scale-[1.02] transition-all duration-200 group cursor-pointer">
            <div className={`text-xl mb-1 ${child.streak_days > 0 ? "animate-fireGlow" : ""}`}>
              🔥
            </div>
            <div className="text-xl font-bold text-zinc-900">{child.streak_days}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5 font-medium">
              {child.streak_days === 1 ? "Day Streak" : "Day Streak"}
            </div>
            {child.streak_days > 0 && (
              <div className="text-[10px] text-orange-600 font-bold mt-1.5">
                🔥 {child.streak_days} day{child.streak_days !== 1 ? "s" : ""}!
              </div>
            )}
            <div className="text-[9px] text-orange-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Leaderboard →</div>
          </div>
        </Link>
      </div>

      {/* ── Daily Goal Ring ── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 flex items-center gap-5 dash-slide-up-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
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
          <div className="absolute inset-0 flex items-center justify-center text-lg">
            {dailyGoalMet ? "✅" : "🎯"}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-zinc-900 text-sm">
            {dailyGoalMet ? "Daily Goal Complete!" : "Today's Goal"}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">
            {dailyGoalMet
              ? "Amazing work! Come back tomorrow for more."
              : "Complete 1 lesson to hit your daily goal"}
          </div>
        </div>
      </div>

      {/* ── Primary CTA: Assessment or Next Lesson ── */}
      {hasAssessment === false && (
        <Link href={`/assessment?child=${child.id}`} className="block dash-slide-up-5">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 p-6 text-center text-white hover:from-indigo-700 hover:to-violet-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.01] cursor-pointer">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-lg font-bold">Take Your Reading Quiz!</div>
            <div className="text-indigo-200 text-sm mt-1">
              A fun 10-question quiz to find {child.first_name}&apos;s reading level
            </div>
          </div>
        </Link>
      )}

      {hasAssessment && nextLesson && (
        <Link href={`/lesson?child=${child.id}&lesson=${nextLesson.id}`} className="block dash-slide-up-5">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 p-5 text-white hover:from-indigo-700 hover:to-violet-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.01] cursor-pointer animate-subtleBounce">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">
                {completedCount === 0 ? "🚀" : "📖"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-indigo-200 text-xs font-medium">
                  {completedCount === 0 ? "Begin Your Reading Adventure!" : `Continue: Lesson ${nextLessonIdx + 1}`}
                </div>
                <div className="text-white font-bold text-lg leading-tight truncate">
                  {nextLesson.title}
                </div>
                <div className="text-indigo-200 text-xs mt-1">
                  {completedCount} of {lessons.length} lessons complete
                </div>
              </div>
              <div className="flex-shrink-0 text-white/80">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      )}

      {hasAssessment && !nextLesson && lessons.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-center text-white shadow-lg dash-slide-up-5">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-lg font-bold">All Lessons Complete!</div>
          <div className="text-emerald-100 text-sm mt-1">
            {child.first_name} has finished all {lessons.length} lessons. Amazing!
          </div>
        </div>
      )}

      {/* ── Lesson Path ── */}
      {hasAssessment && (
        <div className="dash-slide-up-6">
          <LessonPath child={child} readingLevel={readingLevel} lessonProgress={lessonProgress} />
        </div>
      )}

      {/* ── Curriculum Overview ── */}
      <div className="dash-slide-up-6">
        <CurriculumOverview
          readingLevel={readingLevel}
          lessonProgress={lessonProgress}
          showCurriculum={showCurriculum}
          setShowCurriculum={setShowCurriculum}
          expandedGrade={expandedGrade}
          setExpandedGrade={setExpandedGrade}
        />
      </div>

      {/* ── Weekly Progress ── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dash-slide-up-7">
        <h3 className="text-base font-bold text-zinc-900 mb-4">Weekly Progress</h3>
        <div className="space-y-2.5">
          {weeklyXP.map(({ day, xp, pct, isToday, isPast }) => (
            <div key={day} className="flex items-center gap-3">
              <span className={`w-10 text-xs font-semibold ${isToday ? "text-indigo-600" : "text-zinc-500"}`}>
                {day}
              </span>
              <div className="flex-1 h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    xp > 0
                      ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                      : isToday
                      ? "bg-indigo-200"
                      : ""
                  }`}
                  style={{ width: xp > 0 ? `${Math.max(pct, 8)}%` : isToday ? "4%" : "0%" }}
                />
              </div>
              <span className={`w-14 text-right text-xs font-medium ${
                xp > 0 ? "text-emerald-600" : isToday ? "text-indigo-400" : isPast ? "text-zinc-300" : "text-zinc-300"
              }`}>
                {xp > 0 ? `${xp} XP` : isToday ? "Today" : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dash-slide-up-8">
        <h3 className="text-base font-bold text-zinc-900 mb-4">Recent Activity</h3>
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
                    <div className="text-sm font-medium text-zinc-900 truncate">
                      Lesson {idx + 1}: {lesson.title}
                    </div>
                    <div className="text-xs text-zinc-400">
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
      </div>
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

function LessonPath({
  child,
  readingLevel,
  lessonProgress,
}: {
  child: Child;
  readingLevel: string | null;
  lessonProgress: LessonProgress[];
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
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-zinc-900">Your Reading Path</h3>
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

          return (
            <div
              key={lesson.id}
              className={`rounded-xl border p-4 transition-all duration-200 ${
                complete
                  ? "border-green-200 bg-green-50/50"
                  : isNext
                  ? "border-indigo-300 bg-indigo-50/50 shadow-sm"
                  : "border-zinc-100 bg-zinc-50/50 opacity-60"
              } ${!isFuture ? "hover:shadow-md" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    complete
                      ? "bg-green-100 text-green-600"
                      : isNext
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-zinc-100 text-zinc-400"
                  }`}
                >
                  {complete ? "✓" : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm ${isFuture ? "text-zinc-400" : "text-zinc-900"}`}>
                    Lesson {i + 1}: {lesson.title}
                  </div>
                  <div className={`text-xs mt-0.5 ${isFuture ? "text-zinc-300" : "text-zinc-500"}`}>
                    {formatSkillName(lesson.skill)}
                  </div>
                  {lesson.standards && lesson.standards.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {lesson.standards.map((s) => (
                        <span key={s} className={`text-[10px] px-1.5 py-0.5 rounded ${isFuture ? "bg-zinc-100 text-zinc-300" : "bg-zinc-100 text-zinc-400"}`}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {complete && (
                  <span className="text-xs font-semibold text-green-600">Completed</span>
                )}
                {isNext && (
                  <Link
                    href={`/lesson?child=${child.id}&lesson=${lesson.id}`}
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
    <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-5 hover:bg-zinc-50/50 transition-colors"
      >
        <h3 className="text-base font-bold text-zinc-900">Full Curriculum</h3>
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
                      ? "bg-indigo-50 border border-indigo-200"
                      : "bg-zinc-50 border border-zinc-100 hover:bg-zinc-100"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-semibold ${isCurrent ? "text-indigo-700" : "text-zinc-700"}`}>
                      {GRADE_LABELS[key]}
                    </span>
                    <span className={`text-xs ${isCurrent ? "text-indigo-500" : "text-zinc-400"}`}>
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
