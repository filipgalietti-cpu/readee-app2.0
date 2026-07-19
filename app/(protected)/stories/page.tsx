"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { savedOk } from "@/lib/db/checked-write";
import { Child } from "@/lib/db/types";
import { levelNameToGradeKey } from "@/lib/assessment/questions";
import { useAudio } from "@/lib/audio/use-audio";
import { LoadingImage } from "@/app/components/ui/LoadingImage";
import Image from "next/image";
import { useLifetimeCarrots } from "@/lib/levels/use-lifetime-carrots";
import LevelProgressCard from "@/app/_components/LevelProgressCard";
import storiesBank from "@/scripts/stories-bank.json";
import { usePlanStore } from "@/lib/stores/plan-store";
import { useChildStore } from "@/lib/stores/child-store";
import { getLimits } from "@/lib/plan/limits";
import { BookOpen, Lock, ChevronDown, Play, Volume2 } from "lucide-react";
import { SkeletonPage } from "@/app/_components/Skeleton";

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
  return `${SUPABASE_BASE}/images/stories/${story.grade}/${story.id}.png?v=5`;
}

function storyAudioUrl(story: Story) {
  return `${SUPABASE_BASE}/audio/stories/${story.grade}/${story.id}-story.mp3?v=5`;
}

/* ── Page ──────────────────────────────────────────── */

export default function StoriesPage() {
  return (
    <Suspense fallback={<SkeletonPage cards={5} />}>
      <StoriesContent />
    </Suspense>
  );
}

function StoriesContent() {
  const searchParams = useSearchParams();
  const childIdParam = searchParams.get("child");
  const { playUrl, stop, unlockAudio } = useAudio();

  const router = useRouter();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const plan = usePlanStore((s) => s.plan);
  const fetchPlan = usePlanStore((s) => s.fetch);
  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);
  const [activeStory, setActiveStory] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  // Story-complete cap state: prevents the kid from instantly bouncing
  // back to the library after the last question. Holds the final score
  // and the carrots awarded so the celebration card + LevelProgressCard
  // can render without re-reading state that closeStory() will wipe.
  const [finishedScore, setFinishedScore] = useState<{
    correct: number;
    total: number;
    carrots: number;
  } | null>(null);
  // Surface a save failure on completion instead of swallowing it in
  // console.error. Kids/parents who finish a story expect their
  // progress to count; a silent miss erodes trust over time.
  const [saveError, setSaveError] = useState(false);

  // Resolve the active child even when ?child= isn't on the URL —
  // same defensive pattern as /practice-hub and /analytics. Smart
  // search currently passes ?child=, but bookmark / share-link
  // landings won't, and without this they stall on the skeleton
  // forever.
  useEffect(() => {
    let alive = true;
    async function load() {
      const supabase = supabaseBrowser();
      let resolvedId = childIdParam;

      if (!resolvedId) {
        const store = useChildStore.getState();
        const storeChild = store.childData || store.children[0] || null;
        if (storeChild) {
          resolvedId = storeChild.id;
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: kids } = await supabase
              .from("children")
              .select("*")
              .eq("parent_id", user.id)
              .order("created_at", { ascending: true })
              .limit(1);
            if (kids && kids.length > 0) resolvedId = kids[0].id;
          }
        }
      }

      if (!resolvedId) {
        if (alive) {
          router.replace("/dashboard");
          setLoading(false);
        }
        return;
      }

      if (!childIdParam && resolvedId && typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("child", resolvedId);
        window.history.replaceState(null, "", url.toString());
      }

      const { data } = await supabase
        .from("children")
        .select("*")
        .eq("id", resolvedId)
        .single();
      if (!alive) return;
      if (data) {
        setChild(data as Child);
        setExpandedGrade(levelNameToGradeKey(data.reading_level) || "kindergarten");
      }
      setLoading(false);
    }
    load();
    return () => {
      alive = false;
    };
  }, [childIdParam, router]);
  // Effective child id for downstream use — fall back to the resolved
  // child record once it's loaded so deep links without ?child= still
  // build correct save payloads below.
  const childId = childIdParam ?? child?.id ?? null;

  // Pre-session lifetime carrots, used to render the LevelProgressCard
  // on the celebration screen. Hook is single-fetch + manual refresh,
  // so this stays pinned at "lifetime BEFORE the current story" until
  // we call refresh() on goNext, at which point it picks up the row
  // we just wrote and becomes "lifetime BEFORE the next story".
  const { lifetimeCarrots: priorLifetimeCarrots, refresh: refreshLifetime } =
    useLifetimeCarrots(childId);

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

  // Deep-link from smart search: `/stories?child=X#<storyId>` opens
  // the matching story automatically once the child has loaded. We
  // strip the hash after consuming it so the back button returns to
  // the library list instead of re-opening the story in a loop.
  const deepLinkConsumed = useRef(false);
  useEffect(() => {
    if (deepLinkConsumed.current) return;
    if (loading || !child) return;
    if (typeof window === "undefined") return;
    const raw = window.location.hash.replace(/^#/, "");
    if (!raw) return;
    const target = allStories.find((s) => s.id === decodeURIComponent(raw));
    if (!target) return;
    deepLinkConsumed.current = true;
    openStory(target);
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    // allStories is a stable import; openStory is memoized via useCallback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, child]);

  if (loading || !child) {
    return <SkeletonPage cards={5} />;
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

    const handleNext = async () => {
      if (isLastQ) {
        const finalCorrect =
          correctCount + (selectedAnswer === q.correct ? 1 : 0);
        // Award carrots so stories actually count toward the reader-
        // level ladder. Matches the lesson formula scale (5 carrots
        // per correct answer); a perfect 3/3 = 15 carrots, an even
        // 1/3 = 5. The same value goes into `xp_earned` too so the
        // existing analytics keep working.
        const carrotsForStory = finalCorrect * 5;
        // Hold on to the score for the celebration card BEFORE we
        // close — closeStory() wipes mid-quiz state.
        setFinishedScore({
          correct: finalCorrect,
          total: story.questions.length,
          carrots: carrotsForStory,
        });
        // Save story completion to database
        if (childId) {
          try {
            const supabase = supabaseBrowser();
            const { error } = await supabase.from("practice_results").insert({
              child_id: childId,
              standard_id: story.id,
              questions_attempted: story.questions.length,
              questions_correct: finalCorrect,
              carrots_earned: carrotsForStory,
              xp_earned: carrotsForStory,
            });
            if (error) throw error;
            setSaveError(false);
            // Bump the spendable balance too so the kid sees their
            // wallet grow at the shop. Read-then-write to avoid
            // clobbering concurrent updates from other surfaces.
            if (carrotsForStory > 0) {
              const { data: current } = await supabase
                .from("children")
                .select("carrots")
                .eq("id", childId)
                .single();
              if (current) {
                await savedOk("stories:carrots", supabase
                  .from("children")
                  .update({
                    carrots: (current.carrots || 0) + carrotsForStory,
                  })
                  .eq("id", childId));
              }
            }
          } catch (e) {
            console.error("[stories] Failed to save progress:", e);
            // Surface to the parent on the library screen instead of
            // silently dropping the win. Closing the story still feels
            // right (the kid finished); a banner on return flags that
            // progress didn't record.
            setSaveError(true);
          }
        }
        // Stay on the story view so we can render the celebration +
        // next-story CTA. Library is one tap away if they want it.
        return;
      }
      setCurrentQ((c) => c + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    };

    // Celebration phase: kid just answered the final question. Show the
    // score + a "Next story" CTA (or "Back to library" if it's the last
    // story in their grade) instead of bouncing them to the library.
    if (finishedScore) {
      const sameGradeStories = allStories.filter((s) => s.grade === story.grade);
      const idx = sameGradeStories.findIndex((s) => s.id === story.id);
      const next = idx >= 0 ? sameGradeStories[idx + 1] : undefined;
      const isPerfect = finishedScore.correct === finishedScore.total;
      const isGood = finishedScore.correct >= Math.max(1, finishedScore.total - 1);

      const goNext = () => {
        if (!next) return;
        // Refresh lifetime so the next story's LevelProgressCard
        // anchors on the post-this-story total instead of repeating
        // the same prior twice.
        refreshLifetime();
        setFinishedScore(null);
        // openStory resets quiz state and starts the audio + clean Q1.
        openStory(next);
      };

      const goLibrary = () => {
        setFinishedScore(null);
        closeStory();
      };

      return (
        <div className="max-w-lg mx-auto py-10 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl bg-white shadow-md p-8"
          >
            <Image
              src={
                isPerfect
                  ? "/images/ui/bunny-celebrate.png"
                  : isGood
                    ? "/images/ui/bunny-cheer.png"
                    : "/images/ui/bunny-thinking.png"
              }
              alt=""
              width={128}
              height={128}
              className="mx-auto h-32 w-32 object-contain"
              priority
            />
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-zinc-900">
              {isPerfect
                ? "Perfect reading!"
                : isGood
                  ? "Nice work!"
                  : "Good try!"}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {finishedScore.correct} of {finishedScore.total} correct
              {finishedScore.carrots > 0
                ? ` · +${finishedScore.carrots} 🥕`
                : ""}
              {childId ? " — saved to your progress." : "."}
            </p>

            {childId && (
              <div className="mt-5 text-left">
                <LevelProgressCard
                  priorLifetimeCarrots={priorLifetimeCarrots}
                  sessionCarrots={finishedScore.carrots}
                  childId={childId}
                  outfitId={child.equipped_items?.outfit ?? null}
                  href={`/levels?child=${childId}`}
                />
              </div>
            )}

            <div className="mt-6 space-y-2">
              {next ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="block w-full rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 py-4 text-base font-extrabold text-white shadow-sm transition active:scale-[0.97] hover:from-violet-700 hover:to-violet-600"
                >
                  Next story: {next.title} →
                </button>
              ) : (
                <p className="text-xs text-zinc-400">
                  That was the last story in this grade — great job!
                </p>
              )}
              <button
                type="button"
                onClick={goLibrary}
                className="block w-full rounded-2xl py-3 text-sm font-semibold text-zinc-500 transition hover:text-zinc-900"
              >
                Back to library
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="max-w-lg mx-auto py-6 px-4">
        <button onClick={closeStory} className="text-sm text-violet-600 font-medium mb-4">
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
            className="w-full aspect-square object-contain bg-violet-50"
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
              className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 text-sm font-medium hover:bg-violet-100 transition-colors"
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
              className="w-full mt-4 py-3 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-700 transition-colors"
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
        <BookOpen className="w-10 h-10 text-violet-500 mx-auto mb-2" strokeWidth={1.5} />
        <h1 className="text-2xl font-extrabold text-zinc-900">Stories Library</h1>
      </motion.div>

      {saveError && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200"
        >
          We couldn&apos;t save the last story&apos;s progress just now.
          Your reader still finished it — try reading it again later and
          it&apos;ll record then.
        </div>
      )}

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
                isExpanded ? "bg-gradient-to-r from-violet-600 to-violet-500" : ""
              }`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isExpanded ? "bg-white/20" : isLocked ? "bg-zinc-100" : "bg-violet-50"
                }`}>
                  {isLocked
                    ? <Lock className="w-4 h-4 text-zinc-400" />
                    : <BookOpen className={`w-4 h-4 ${isExpanded ? "text-white" : "text-violet-600"}`} strokeWidth={1.5} />
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
                    {group.stories.map((s, sIdx) => {
                      const limits = getLimits(plan);
                      const isStoryLocked = sIdx >= limits.storiesPerGrade;

                      if (isStoryLocked) {
                        return (
                          <div key={s.id} onClick={() => router.push("/upgrade?reason=story")} className="cursor-pointer">
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: sIdx * 0.05 }}
                              className="rounded-xl overflow-hidden bg-zinc-50 text-left opacity-50 relative"
                            >
                              <div className="relative">
                                <LoadingImage src={storyImageUrl(s)} className="w-full h-36 sm:h-40 object-cover rounded-t-xl grayscale" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="px-3 py-1.5 rounded-lg bg-violet-100 text-violet-700 text-xs font-bold flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> Readee+
                                  </div>
                                </div>
                              </div>
                              <div className="p-3">
                                <p className="text-sm font-bold text-zinc-400 leading-tight">{s.title}</p>
                              </div>
                            </motion.div>
                          </div>
                        );
                      }

                      return (
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
                              <Play className="w-5 h-5 text-violet-600 ml-0.5" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-bold text-zinc-900 leading-tight">{s.title}</p>
                          <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{s.text.slice(0, 60)}...</p>
                        </div>
                      </motion.button>
                      );
                    })}
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
