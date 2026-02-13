"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Icon } from "../components/ui/Icon";
import { ProgressBar } from "../components/ui/ProgressBar";

interface Lesson {
  id: string;
  title: string;
  description: string;
  order_index: number;
  duration_minutes: number;
  completed: boolean;
  score: number | null;
}

interface Unit {
  id: string;
  title: string;
  description: string;
  order_index: number;
  icon_emoji: string;
  lessons?: Lesson[];
}

export default function LearningPath() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);

  const fetchUnits = useCallback(async () => {
    try {
      const response = await fetch("/api/content/units");
      const data = await response.json();
      setUnits(data.units || []);
    } catch (error) {
      console.error("Failed to fetch units:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const fetchLessons = async (unitId: string) => {
    try {
      const response = await fetch(`/api/content/lessons?unitId=${unitId}`);
      const data = await response.json();
      
      setUnits((prev) =>
        prev.map((unit) =>
          unit.id === unitId ? { ...unit, lessons: data.lessons || [] } : unit
        )
      );
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
    }
  };

  const toggleUnit = (unitId: string) => {
    if (expandedUnit === unitId) {
      setExpandedUnit(null);
    } else {
      setExpandedUnit(unitId);
      const unit = units.find((u) => u.id === unitId);
      if (unit && !unit.lessons) {
        fetchLessons(unitId);
      }
    }
  };

  if (loading) {
    return (
      <div className="container-page py-12">
        <div className="text-center">
          <Icon name="book" className="mx-auto mb-4 text-blue-500" size={48} />
          <p className="text-zinc-600">Loading your learning path...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-zinc-900 mb-2">Your Learning Path</h1>
        <p className="text-zinc-600">Follow the path to build your reading skills</p>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Vertical path visualization */}
        <div className="relative">
          {/* Vertical line connecting units */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-zinc-200" />

          {units.map((unit, idx) => {
            const isExpanded = expandedUnit === unit.id;
            const completedLessons = unit.lessons?.filter((l) => l.completed).length || 0;
            const totalLessons = unit.lessons?.length || 0;

            return (
              <div key={unit.id} className="relative mb-8">
                {/* Unit circle on the path */}
                <div className="absolute left-4 w-8 h-8 bg-white border-4 border-blue-500 rounded-full flex items-center justify-center z-10">
                  <span className="text-xs font-bold text-blue-500">{idx + 1}</span>
                </div>

                {/* Unit card */}
                <div className="ml-20">
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => toggleUnit(unit.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{unit.icon_emoji}</span>
                            <CardTitle>{unit.title}</CardTitle>
                          </div>
                          <p className="text-sm text-zinc-600">{unit.description}</p>
                        </div>
                        <button className="text-zinc-400 hover:text-zinc-600">
                          <svg
                            className={`w-6 h-6 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </div>
                      {totalLessons > 0 && (
                        <ProgressBar
                          current={completedLessons}
                          total={totalLessons}
                          className="mt-4"
                        />
                      )}
                    </CardHeader>

                    {/* Lessons list (expanded) */}
                    {isExpanded && unit.lessons && (
                      <CardContent>
                        <div className="space-y-3 pt-4 border-t border-zinc-200">
                          {unit.lessons.map((lesson) => (
                            <Link
                              key={lesson.id}
                              href={`/lesson/${lesson.id}`}
                              className="block"
                            >
                              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-50 transition">
                                <div className="flex-shrink-0">
                                  {lesson.completed ? (
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                      <Icon name="check" className="text-white" size={16} />
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center">
                                      <Icon name="play" className="text-zinc-500" size={16} />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-zinc-900">{lesson.title}</h4>
                                  <p className="text-sm text-zinc-600">{lesson.description}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-zinc-500">
                                    {lesson.duration_minutes} min
                                  </p>
                                  {lesson.score !== null && (
                                    <p className="text-sm font-semibold text-blue-600">
                                      {lesson.score}%
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
