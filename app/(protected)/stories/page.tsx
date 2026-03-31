"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import { levelNameToGradeKey } from "@/lib/assessment/questions";
import { useAudio } from "@/lib/audio/use-audio";
import { LoadingImage } from "@/app/components/ui/LoadingImage";
import storiesBank from "@/scripts/stories-bank.json";
import { BookOpen, Lock, ChevronDown, Play, Volume2 } from "lucide-react";

/* ── Types ─────────────────────────────────────────── */

interface Story {
  id: string;
  grade: string;
  title: string;
  skill: string;
  text: string;
  questions: { prompt: string; choices: string[]; correct: string }[];
}

const SUPABASE_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`
  : "";

const GRADE_ORDER = ["kindergarten", "1st", "2nd", "3rd", "4th"];
const GRADE_LABELS: Record<string, string> = {
  kindergarten: "Kindergarten",
  "1st": "1st Grade",
  "2nd": "2nd Grade",
  "3rd": "3rd Grade",
  "4th": "4th Grade",
};

function storyImageUrl(story: Story) {
  return `${SUPABASE_BASE}/images/stories/${story.grade}/${story.id}.png?v=4`;
}

function storyAudioUrl(story: Story) {
  return `${SUPABASE_BASE}/audio/stories/${story.grade}/${story.id}-story.mp3?v=4`;
}

/* ── Page ──────────────────────────────────────────── */

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
  const { playUrl, stop, unlockAudio } = useAudio();

  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);
  const [activeStory, setActiveStory] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    async function load() {
      if (!childId) return;
      const supabase = supabaseBrowser();
      const { data } = await supabase.from("children").select("*").eq("id", childId).single();
      if (data) {
        setChild(data as Child);
        setExpandedGrade(levelNameToGradeKey(data.reading_level) || "kindergarten");
      }
      setLoading(false);
    }
    load();
  }, [childId]);

  const allStories = (storiesBank as { stories: Story[] }).stories;
  const gradeGroups = GRADE_ORDER.map((grade) => ({
    grade,
    label: GRADE_LABELS[grade],
    stories: allStories.filter((s) => s.grade === grade),
  }));

  const openStory = useCallback((story: Story) => {
    unlockAudio();
    setActiveStory(story.id);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectCount(0);
    playUrl(storyAudioUrl(story));
  }, [unlockAudio, playUrl]);

  const closeStory = useCallback(() => {
    stop();
    setActiveStory(null);
  }, [stop]);

  if (loading || !child) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  const childGradeKey = levelNameToGradeKey(child.reading_level);
  const childGradeIdx = GRADE_ORDER.indexOf(childGradeKey);

  // Active story view
  const story = activeStory ? allStories.find((s) => s.id === activeStory) : null;
  if (story) {
    const q = story.questions[currentQ];
    const isLastQ = currentQ >= story.questions.length - 1;

    const handleAnswer = (choice: string) => {
      if (selectedAnswer) return;
      setSelectedAnswer(choice);
      if (choice === q.correct) setCorrectCount((c) => c + 1);
      setShowResult(true);
    };

    const handleNext = () => {
      if (isLastQ) {
        closeStory();
        return;
      }
      setCurrentQ((c) => c + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    };

    return (
      <div className="max-w-lg mx-auto py-6 px-4">
        <button onClick={closeStory} className="text-sm text-indigo-600 font-medium mb-4">
          &larr; Back to Stories
        </button>

        {/* Story card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white shadow-md overflow-hidden mb-6"
        >
          <LoadingImage
            src={storyImageUrl(story)}
            className="w-full aspect-square object-contain bg-indigo-50"
          />
          <div className="p-5">
            <h1 className="text-xl font-extrabold text-zinc-900 mb-3">{story.title}</h1>
            <div className="space-y-2">
              {story.text.split(/(?<=[.!?])\s+/).map((sentence, i) => (
                <p key={i} className="text-base text-zinc-700 leading-relaxed">{sentence}</p>
              ))}
            </div>
            <button
              onClick={() => playUrl(storyAudioUrl(story))}
              className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium hover:bg-indigo-100 transition-colors"
            >
              <Volume2 className="w-4 h-4" /> Listen again
            </button>
          </div>
        </motion.div>

        {/* Question */}
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl bg-white shadow-md p-5"
        >
          <p className="text-xs text-zinc-400 font-medium mb-2">
            Question {currentQ + 1} of {story.questions.length}
          </p>
          <p className="text-base font-bold text-zinc-900 mb-4">{q.prompt}</p>

          <div className="space-y-2">
            {q.choices.map((choice) => {
              let style = "border-zinc-200 bg-white hover:bg-zinc-50";
              if (showResult) {
                if (choice === q.correct) style = "border-emerald-400 bg-emerald-50";
                else if (choice === selectedAnswer) style = "border-red-300 bg-red-50";
                else style = "border-zinc-100 opacity-50";
              }
              return (
                <button
                  key={choice}
                  onClick={() => handleAnswer(choice)}
                  disabled={!!selectedAnswer}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${style}`}
                >
                  {choice}
                </button>
              );
            })}
          </div>

          {showResult && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleNext}
              className="w-full mt-4 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors"
            >
              {isLastQ ? "Done" : "Next Question"}
            </motion.button>
          )}
        </motion.div>
      </div>
    );
  }

  // Library view
  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-2"
      >
        <BookOpen className="w-10 h-10 text-indigo-500 mx-auto mb-2" strokeWidth={1.5} />
        <h1 className="text-2xl font-extrabold text-zinc-900">Stories Library</h1>
        <p className="text-sm text-zinc-500 mt-1">{allStories.length} stories across {GRADE_ORDER.length} grades</p>
      </motion.div>

      {/* Grade accordions */}
      {gradeGroups.map((group, gIdx) => {
        const isExpanded = expandedGrade === group.grade;
        const isLocked = GRADE_ORDER.indexOf(group.grade) > childGradeIdx;

        return (
          <motion.div
            key={group.grade}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gIdx * 0.04 }}
            className="rounded-2xl bg-white shadow-sm overflow-hidden"
          >
            <button
              onClick={() => !isLocked && setExpandedGrade(isExpanded ? null : group.grade)}
              className={`w-full text-left ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className={`px-5 py-4 flex items-center gap-3 ${
                isExpanded ? "bg-gradient-to-r from-indigo-600 to-violet-500" : ""
              }`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isExpanded ? "bg-white/20" : isLocked ? "bg-zinc-100" : "bg-indigo-50"
                }`}>
                  {isLocked
                    ? <Lock className="w-4 h-4 text-zinc-400" />
                    : <BookOpen className={`w-4 h-4 ${isExpanded ? "text-white" : "text-indigo-600"}`} strokeWidth={1.5} />
                  }
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${isExpanded ? "text-white" : "text-zinc-900"}`}>
                    {group.label}
                  </p>
                  <p className={`text-xs ${isExpanded ? "text-white/70" : "text-zinc-400"}`}>
                    {group.stories.length} stories
                  </p>
                </div>
                {!isLocked && (
                  <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform ${
                    isExpanded ? "text-white/60 rotate-180" : "text-zinc-400"
                  }`} />
                )}
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {group.stories.map((s, sIdx) => (
                      <motion.button
                        key={s.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: sIdx * 0.05 }}
                        onClick={() => openStory(s)}
                        className="rounded-xl overflow-hidden bg-zinc-50 hover:bg-zinc-100 transition-colors text-left group"
                      >
                        <div className="relative">
                          <LoadingImage
                            src={storyImageUrl(s)}
                            className="w-full h-36 sm:h-40 object-cover rounded-t-xl"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                              <Play className="w-5 h-5 text-indigo-600 ml-0.5" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-bold text-zinc-900 leading-tight">{s.title}</p>
                          <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{s.text.slice(0, 60)}...</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
