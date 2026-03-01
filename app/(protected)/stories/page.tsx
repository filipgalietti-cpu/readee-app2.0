"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child, LessonProgress } from "@/lib/db/types";
import { levelNameToGradeKey } from "@/lib/assessment/questions";
import lessonsData from "@/lib/data/lessons.json";
import { BookOpen, Lock, CheckCircle } from "lucide-react";

const GRADE_KEYS = ["pre-k", "kindergarten", "1st", "2nd", "3rd", "4th"] as const;
const GRADE_LABELS: Record<string, string> = {
  "pre-k": "Foundational",
  "kindergarten": "Kindergarten",
  "1st": "1st Grade",
  "2nd": "2nd Grade",
  "3rd": "3rd Grade",
  "4th": "4th Grade",
};

interface LessonRaw {
  id: string;
  title: string;
  skill: string;
  read: { type: string; title: string; text: string; questions: unknown[] };
}

interface LevelData {
  level_name: string;
  level_number: number;
  focus: string;
  lessons: LessonRaw[];
}

interface LessonsFile {
  levels: Record<string, LevelData>;
}

export default function StoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
      }
    >
      <StoriesContent />
    </Suspense>
  );
}

function StoriesContent() {
  const searchParams = useSearchParams();
  const childId = searchParams.get("child");
  const [child, setChild] = useState<Child | null>(null);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!childId) return;
      const supabase = supabaseBrowser();

      const [{ data: childData }, { data: progressData }] = await Promise.all([
        supabase.from("children").select("*").eq("id", childId).single(),
        supabase.from("lessons_progress").select("*").eq("child_id", childId),
      ]);

      if (childData) setChild(childData as Child);
      if (progressData) setProgress(progressData as LessonProgress[]);

      // Auto-expand current grade
      if (childData?.reading_level) {
        setExpandedGrade(levelNameToGradeKey(childData.reading_level));
      }
      setLoading(false);
    }
    load();
  }, [childId]);

  if (loading || !child) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  const file = lessonsData as unknown as LessonsFile;
  const childGradeKey = levelNameToGradeKey(child.reading_level);
  const childGradeIdx = GRADE_KEYS.indexOf(childGradeKey as typeof GRADE_KEYS[number]);

  const isReadComplete = (lessonId: string) => {
    return progress.some((p) => p.lesson_id === lessonId && p.section === "read");
  };

  const isLessonComplete = (lessonId: string) => {
    const sections = progress.filter((p) => p.lesson_id === lessonId);
    const completedSections = new Set(sections.map((s) => s.section));
    return completedSections.has("learn") && completedSections.has("practice") && completedSections.has("read");
  };

  const totalStories = Object.values(file.levels).reduce((sum, l) => sum + l.lessons.length, 0);
  const completedStories = Object.values(file.levels)
    .flatMap((l) => l.lessons)
    .filter((l) => isReadComplete(l.id)).length;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
        >
          &larr; Back
        </Link>
      </div>

      <div className="text-center animate-slideUp">
        <BookOpen className="w-12 h-12 text-indigo-500 mx-auto mb-3" strokeWidth={1.5} />
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Stories Library</h1>
        <p className="text-zinc-500 mt-1">
          {completedStories} of {totalStories} stories read
        </p>
      </div>

      {/* Progress bar */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dash-slide-up-1">
        <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
            style={{ width: `${totalStories > 0 ? Math.round((completedStories / totalStories) * 100) : 0}%` }}
          />
        </div>
      </div>

      {/* Grade sections */}
      <div className="space-y-3 dash-slide-up-2">
        {GRADE_KEYS.map((gradeKey, gradeIdx) => {
          const level = file.levels[gradeKey];
          if (!level) return null;
          const isExpanded = expandedGrade === gradeKey;
          const isCurrent = gradeKey === childGradeKey;
          const isLocked = gradeIdx > childGradeIdx;
          const gradeCompleted = level.lessons.filter((l) => isReadComplete(l.id)).length;

          return (
            <div key={gradeKey}>
              <button
                onClick={() => setExpandedGrade(isExpanded ? null : gradeKey)}
                className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all ${
                  isCurrent
                    ? "bg-indigo-50 border border-indigo-200"
                    : isLocked
                    ? "bg-zinc-50 border border-zinc-100 opacity-60"
                    : "bg-white border border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {isLocked ? (
                      <Lock className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
                    ) : isCurrent ? (
                      <BookOpen className="w-5 h-5 text-indigo-600" strokeWidth={1.5} />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-500" strokeWidth={1.5} />
                    )}
                  </span>
                  <div>
                    <span className={`text-sm font-bold ${isCurrent ? "text-indigo-700" : "text-zinc-700"}`}>
                      {GRADE_LABELS[gradeKey]}
                    </span>
                    <span className="text-xs text-zinc-400 ml-2">
                      {gradeCompleted}/{level.lessons.length} stories
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full ml-2">
                        Current
                      </span>
                    )}
                  </div>
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
                <div className="mt-2 space-y-2 pl-2">
                  {level.lessons.map((lesson) => {
                    const completed = isReadComplete(lesson.id);
                    const fullyComplete = isLessonComplete(lesson.id);
                    const available = !isLocked;
                    const preview = lesson.read.text.slice(0, 80) + (lesson.read.text.length > 80 ? "..." : "");

                    return (
                      <div
                        key={lesson.id}
                        className={`rounded-xl border p-4 transition-all ${
                          completed
                            ? "border-green-200 bg-green-50/50"
                            : available
                            ? "border-zinc-200 bg-white hover:shadow-sm"
                            : "border-zinc-100 bg-zinc-50 opacity-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5 ${
                            completed ? "bg-green-100 text-green-600" : available ? "bg-indigo-100 text-indigo-600" : "bg-zinc-100 text-zinc-400"
                          }`}>
                            {completed ? (
                              <CheckCircle className="w-4 h-4" strokeWidth={2} />
                            ) : isLocked ? (
                              <Lock className="w-4 h-4" strokeWidth={1.5} />
                            ) : (
                              <BookOpen className="w-4 h-4" strokeWidth={1.5} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-semibold text-sm ${isLocked ? "text-zinc-400" : "text-zinc-900"}`}>
                              {lesson.read.title}
                            </div>
                            <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{preview}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-400">
                                {GRADE_LABELS[gradeKey]}
                              </span>
                              {fullyComplete && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-600 font-medium">
                                  Complete
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {completed && available ? (
                              <Link
                                href={`/lesson?child=${child.id}&lesson=${lesson.id}`}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                              >
                                Read Again
                              </Link>
                            ) : available ? (
                              <Link
                                href={`/lesson?child=${child.id}&lesson=${lesson.id}`}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                              >
                                Read
                              </Link>
                            ) : (
                              <span className="text-[10px] text-zinc-300">Keep learning!</span>
                            )}
                          </div>
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
    </div>
  );
}
