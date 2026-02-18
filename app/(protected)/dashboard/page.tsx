"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child, LessonProgress } from "@/lib/db/types";
import { levelNameToGradeKey } from "@/lib/assessment/questions";
import lessonsData from "@/lib/data/lessons.json";
import LevelProgressBar, { GRADES } from "@/app/_components/LevelProgressBar";

const AVATARS = ["😊", "🦊", "🐱", "🦋", "🐻"];

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
                  grade={child.grade}
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
  const childIndex = children.findIndex((c) => c.id === child.id);
  const avatar = AVATARS[childIndex % AVATARS.length];
  const hasMultiple = children.length > 1;

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

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      {/* Nav */}
      {hasMultiple && (
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
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

      {/* Greeting */}
      <div className="text-center pt-4">
        <div className="w-20 h-20 rounded-2xl bg-indigo-50 mx-auto mb-4 flex items-center justify-center text-4xl">
          {avatar}
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Hey {child.first_name}!
        </h1>
        <p className="text-zinc-500 mt-1">Ready to read today?</p>
        {child.grade && (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 mt-3">
            {child.grade}
          </span>
        )}
      </div>

      {/* Reading Level Progress */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <LevelProgressBar
          currentLevel={readingLevel}
          onLevelChange={handleReadingLevelChange}
          grade={child.grade}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon="⭐" label="Total XP" value={String(child.xp)} />
        <StatCard
          icon="📖"
          label="Stories Read"
          value={String(child.stories_read)}
        />
        <StatCard
          icon="🔥"
          label="Streak"
          value={`${child.streak_days}d`}
        />
      </div>

      {/* Primary CTA: Assessment if not taken, Lesson Path if done */}
      {hasAssessment ? (
        <LessonPath child={child} readingLevel={readingLevel} lessonProgress={lessonProgress} />
      ) : (
        <Link href={`/assessment?child=${child.id}`} className="block">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 p-6 text-center text-white hover:from-indigo-700 hover:to-violet-600 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-lg font-bold">Take Your Reading Quiz!</div>
            <div className="text-indigo-200 text-sm mt-1">
              A fun 10-question quiz to find {child.first_name}&apos;s reading level
            </div>
          </div>
        </Link>
      )}

      {/* Weekly Progress */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h3 className="text-base font-bold text-zinc-900 mb-4">
          Weekly Progress
        </h3>
        <div className="space-y-3">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="flex items-center gap-3">
              <span className="w-10 text-xs font-medium text-zinc-500">
                {day}
              </span>
              <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: "0%" }} />
              </div>
              <span className="w-12 text-right text-xs text-zinc-400">
                —
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h3 className="text-base font-bold text-zinc-900 mb-4">
          Recent Activity
        </h3>
        <p className="text-sm text-zinc-400 text-center py-6">
          No activity yet. Start reading to see your progress here!
        </p>
      </div>
    </div>
  );
}

/* ─── Lesson Path ─────────────────────────────────────── */

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
              className={`rounded-xl border p-4 transition-all ${
                complete
                  ? "border-green-200 bg-green-50/50"
                  : isNext
                  ? "border-indigo-300 bg-indigo-50/50 shadow-sm"
                  : "border-zinc-100 bg-zinc-50/50 opacity-60"
              }`}
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
                    {lesson.skill}
                  </div>
                </div>
                {complete && (
                  <span className="text-xs font-semibold text-green-600">Completed</span>
                )}
                {isNext && (
                  <Link
                    href={`/lesson?child=${child.id}&lesson=${lesson.id}`}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-xs font-bold hover:from-indigo-700 hover:to-violet-600 transition-all shadow-sm"
                  >
                    Start Lesson
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

/* ─── Stat Card ───────────────────────────────────────── */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center">
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-xl font-bold text-zinc-900">{value}</div>
      <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
    </div>
  );
}
