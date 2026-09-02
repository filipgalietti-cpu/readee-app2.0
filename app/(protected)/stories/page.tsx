"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { savedOk } from "@/lib/db/checked-write";
import { Child } from "@/lib/db/types";
import { levelNameToGradeKey } from "@/lib/assessment/questions";
import { useAudio } from "@/lib/audio/use-audio";
import Image from "next/image";
import { useLifetimeCarrots } from "@/lib/levels/use-lifetime-carrots";
import LevelProgressCard from "@/app/_components/LevelProgressCard";
import storiesBank from "@/scripts/stories-bank.json";
import { usePlanStore } from "@/lib/stores/plan-store";
import { useChildStore } from "@/lib/stores/child-store";
import { getLimits, isPaidPlan } from "@/lib/plan/limits";
import { getActiveMultiplier } from "@/lib/carrots/active-multiplier";
import { SkeletonPage } from "@/app/_components/Skeleton";
import StoryKaraokeReader, { type StoryKaraoke } from "./_components/StoryKaraokeReader";
import storiesKaraoke from "@/app/data/stories-karaoke.json";
import { FluentIcon } from "@/app/_components/FluentIcon";
import { Glyph } from "@/app/_components/Glyph";

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

// Per-grade identity colors — shared with /practice-hub's grade switcher
// so the grade circles read consistently across both surfaces
// (K = violet, 1 = rose, 2 = teal, 3 = green, 4 = orange).
const GRADE_META: Record<string, { letter: string; main: string; soft: string; text: string }> = {
  kindergarten: { letter: "K", main: "#8b5cf6", soft: "#ede9fe", text: "#6d28d9" },
  "1st": { letter: "1", main: "#f43f5e", soft: "#ffe4e6", text: "#be123c" },
  "2nd": { letter: "2", main: "#0d9488", soft: "#ccfbf1", text: "#0f766e" },
  "3rd": { letter: "3", main: "#22c55e", soft: "#dcfce7", text: "#15803d" },
  "4th": { letter: "4", main: "#f97316", soft: "#ffedd5", text: "#c2410c" },
};

function storyImageUrl(story: Story) {
  return `${SUPABASE_BASE}/images/stories/${story.grade}/${story.id}.png?v=5`;
}

function storyAudioUrl(story: Story) {
  return `${SUPABASE_BASE}/audio/stories/${story.grade}/${story.id}-story.mp3?v=5`;
}

/** Map a story's grade ("kindergarten"/"1st"/…) to a real CCSS literary
 *  comprehension standard so story quiz results feed the learner model
 *  (RL.<grade>.1 = ask & answer key details about a story). */
function storyStandard(grade: string): string {
  const tok = /^k/i.test(grade) ? "K" : (grade.match(/\d/)?.[0] ?? "1");
  return `RL.${tok}.1`;
}

/* ── Celebration carrot count-up ───────────────────────
 * Ticks the reward total up one carrot at a time (with a little pop on
 * the pill) so the payoff at the end of a story feels earned, instead of
 * snapping straight to the final number. Self-contained hooks so it can
 * live inside the conditionally-rendered celebration block. */
function CarrotCountUp({ total }: { total: number }) {
  // Starts at 0 (fresh mount per celebration) and ticks up to `total`.
  const [n, setN] = useState(0);
  useEffect(() => {
    if (total <= 0) return;
    let cur = 0;
    const id = setInterval(() => {
      cur += 1;
      setN(cur);
      if (cur >= total) clearInterval(id);
    }, 90);
    return () => clearInterval(id);
  }, [total]);
  return <>{n}</>;
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
  const { stop, unlockAudio } = useAudio();

  const router = useRouter();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const plan = usePlanStore((s) => s.plan);
  const fetchPlan = usePlanStore((s) => s.fetch);
  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);
  const [activeStory, setActiveStory] = useState<string | null>(null);
  // Reading experience comes first (karaoke reader), then the quiz.
  const [phase, setPhase] = useState<"reading" | "quiz">("reading");
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  // Carrots earned in the current story — drives the top-bar tick-up animation.
  const [sessionEarned, setSessionEarned] = useState(0);
  // Stories this child has finished (for the card "Finished!" state + "X of 5 read").
  const [doneStories, setDoneStories] = useState<Set<string>>(new Set());
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
  // Load which stories this child has finished (done state + "X of 5 read" pill).
  useEffect(() => {
    if (!childId) return;
    let alive = true;
    (async () => {
      const { data } = await supabaseBrowser()
        .from("practice_results")
        .select("standard_id")
        .eq("child_id", childId);
      if (alive && data) {
        setDoneStories(
          new Set(
            data
              .map((r) => r.standard_id as string)
              .filter((id) => typeof id === "string" && id.startsWith("story-")),
          ),
        );
      }
    })();
    return () => { alive = false; };
  }, [childId]);

  const gradeGroups = GRADE_ORDER.map((grade) => {
    const stories = allStories.filter((s) => s.grade === grade);
    return {
      grade,
      label: GRADE_LABELS[grade],
      stories,
      doneCount: stories.filter((s) => doneStories.has(s.id)).length,
    };
  });

  const openStory = useCallback((story: Story) => {
    unlockAudio();
    setActiveStory(story.id);
    setPhase("reading"); // the karaoke reader owns audio playback now
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectCount(0);
    setSessionEarned(0);
  }, [unlockAudio]);

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
    // Respect the paywall on deep links too (smart-search emits #<id>), or a
    // free reader could open a locked Readee+ story straight from a URL.
    const grp = gradeGroups.find((g) => g.stories.some((st) => st.id === target.id));
    const sIdx = grp ? grp.stories.findIndex((st) => st.id === target.id) : 0;
    const aboveLevel = grp ? GRADE_ORDER.indexOf(grp.grade) > childGradeIdx : false;
    if (!isPaidPlan(plan) && (aboveLevel || sIdx >= getLimits(plan).storiesPerGrade)) {
      router.push("/upgrade?reason=story");
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      return;
    }
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
      if (choice === q.correct) {
        setCorrectCount((c) => c + 1);
        setSessionEarned((e) => e + 5); // top-bar carrots tick up on a correct answer
      }
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
        // existing analytics keep working. An active powerup (e.g.
        // mystery-box 2x) multiplies the reward, same as practice/lessons.
        const carrotsForStory = Math.floor(finalCorrect * 5 * getActiveMultiplier(child));
        // Hold on to the score for the celebration card BEFORE we
        // close — closeStory() wipes mid-quiz state.
        setFinishedScore({
          correct: finalCorrect,
          total: story.questions.length,
          carrots: carrotsForStory,
        });
        setDoneStories((d) => new Set(d).add(story.id)); // mark finished for the library

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
            // Feed story comprehension into the skill signal under a REAL
            // CCSS standard (practice_results above keeps story.id as the
            // per-story done-marker; practice_answers is what weak-spots +
            // the learner model actually read). Best-effort — never let this
            // break the story-save UX.
            try {
              const std = storyStandard(story.grade);
              await supabase.from("practice_answers").insert(
                story.questions.map((_q, i) => ({
                  child_id: childId,
                  question_id: `${story.id}-Q${i + 1}`,
                  standard_id: std,
                  type: "mcq",
                  was_correct: i < finalCorrect,
                  answered_at: new Date().toISOString(),
                })),
              );
            } catch {
              /* skill-signal write is non-critical */
            }
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
        <div className="fixed inset-x-0 bottom-0 top-[76px] z-10 overflow-y-auto lg:left-[272px]" style={{ background: "linear-gradient(160deg,#e8e0ff 0%,#ffffff 45%,#e0ecff 100%)" }}>
          <div className="flex min-h-full items-center justify-center px-6 py-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full"
              style={{ maxWidth: 820, background: "#ffffff", borderRadius: 32, boxShadow: "0 10px 40px -12px rgba(49,46,129,0.28)", padding: "44px 48px" }}
            >
              <div className="flex flex-wrap items-center justify-center gap-11">
                <div className="relative mx-auto flex-shrink-0">
                  <Image src={storyImageUrl(story)} alt="" width={270} height={270} className="block object-cover" style={{ width: 270, height: 270, borderRadius: 24, boxShadow: "0 10px 30px rgba(30,27,75,0.25)" }} />
                  <span className="absolute -right-5 -top-3.5 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-base font-extrabold" style={{ background: "#fef3c7", border: "3px solid #f59e0b", color: "#b45309", fontFamily: "var(--font-baloo, inherit)", animation: "stampIn 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.35s both" }}>
                    <Glyph name="star" size={16} /> Finished!
                  </span>
                </div>
                <div className="min-w-[280px] flex-1 text-center">
                  <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: "#1e1b4b", fontFamily: "var(--font-baloo, inherit)" }}>
                    {isPerfect ? "Perfect reading!" : isGood ? "Story finished!" : "Good try!"}
                  </h1>
                  <p className="mt-1.5 text-[17px] font-bold" style={{ color: "#52525b" }}>
                    {finishedScore.correct} of {finishedScore.total} questions right
                  </p>
                  <div className="mt-5">
                    <span className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-lg font-extrabold" style={{ background: "#fef3c7", color: "#b45309", animation: "counterPop 0.4s ease 0.4s both" }}>
                      <FluentIcon name="carrot" size={20} /> +<CarrotCountUp total={finishedScore.carrots} /> carrots
                    </span>
                  </div>
                  <div className="mx-auto mt-6 flex max-w-[380px] flex-col gap-2.5">
                    {next ? (
                      <button type="button" onClick={goNext} className="w-full rounded-2xl py-4 text-lg font-extrabold text-white shadow-md transition active:scale-[0.97]" style={{ background: "linear-gradient(90deg,#4338ca,#7c3aed)", fontFamily: "var(--font-baloo, inherit)" }}>
                        Read another: {next.title}
                      </button>
                    ) : (
                      <p className="text-xs" style={{ color: "#a1a1aa" }}>That was the last story in this grade - great job!</p>
                    )}
                    <button type="button" onClick={goLibrary} className="w-full rounded-2xl py-3 text-sm font-extrabold transition hover:bg-zinc-100" style={{ color: "#52525b" }}>
                      Back to library
                    </button>
                  </div>
                </div>
              </div>
              {childId && (
                <div className="mt-8">
                  <LevelProgressCard
                    priorLifetimeCarrots={priorLifetimeCarrots}
                    sessionCarrots={finishedScore.carrots}
                    childId={childId}
                    outfitId={child.equipped_items?.outfit ?? null}
                    href={`/levels?child=${childId}`}
                  />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      );
    }

    // One frame for the whole story: the karaoke reader, then the quiz REPLACES
    // the text on the SAME book spread (no separate page).
    return (
      <StoryKaraokeReader
        title={story.title}
        grade={story.grade}
        imageUrl={storyImageUrl(story)}
        fallbackText={story.text}
        fallbackAudioUrl={storyAudioUrl(story)}
        karaoke={(storiesKaraoke as Record<string, StoryKaraoke>)[story.id]}
        carrots={(child.carrots ?? 0) + sessionEarned}
        showQuiz={phase === "quiz"}
        onBack={closeStory}
        onFinishReading={() => setPhase("quiz")}
        quizSlot={
          <div className="flex min-h-0 flex-1 flex-col">
            <p className="text-[13px] font-extrabold uppercase tracking-[0.08em]" style={{ color: "#8b5cf6" }}>
              Question {currentQ + 1} of {story.questions.length}
            </p>
            <h2 className="mt-2 text-[24px] font-extrabold leading-snug" style={{ color: "#1e1b4b", fontFamily: "var(--font-baloo, inherit)" }}>
              {q.prompt}
            </h2>
            <div className="mt-5 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
              {q.choices.map((choice) => {
                let bg = "#ffffff", color = "#18181b", border = "2px solid #e4e4e7";
                if (showResult) {
                  if (choice === q.correct) { bg = "#d1fae5"; color = "#065f46"; border = "2px solid #10b981"; }
                  else if (choice === selectedAnswer) { bg = "#ffe4e6"; color = "#9f1239"; border = "2px solid #f43f5e"; }
                  else { bg = "#fafafa"; color = "#a1a1aa"; border = "2px solid #f4f4f5"; }
                }
                return (
                  <button
                    key={choice}
                    onClick={() => handleAnswer(choice)}
                    disabled={!!selectedAnswer}
                    className="w-full rounded-2xl px-5 py-4 text-left text-[18px] font-extrabold transition active:scale-[0.99]"
                    style={{ background: bg, color, border }}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
            {showResult && (
              <div className="mt-4">
                <p className="mb-3 text-sm font-bold" style={{ color: selectedAnswer === q.correct ? "#059669" : "#be123c" }}>
                  {selectedAnswer === q.correct ? "That's right! +5 carrots" : `Good try! The answer is "${q.correct}".`}
                </p>
                <button
                  onClick={handleNext}
                  className="w-full rounded-full py-4 text-lg font-extrabold text-white shadow-md active:scale-[0.98]"
                  style={{ background: "linear-gradient(90deg,#4338ca,#7c3aed)", fontFamily: "var(--font-baloo, inherit)" }}
                >
                  {isLastQ ? "Finish" : "Next question"}
                </button>
              </div>
            )}
          </div>
        }
      />
    );

  }

  // Library view
  return (
    <div
      className="fixed inset-x-0 bottom-0 top-[76px] z-10 overflow-y-auto px-4 py-8 md:px-8 lg:left-[272px]"
      style={{ background: "#f8fafc" }}
    >
     <div className="mx-auto space-y-4" style={{ maxWidth: 980 }}>

      {/* Greeting banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-3 rounded-3xl px-7 py-5 shadow-[0_10px_40px_-12px_rgba(49,46,129,0.18)]"
        style={{ background: "linear-gradient(160deg,#e8e0ff 0%,#ffffff 45%,#e0ecff 100%)" }}
      >
        <div className="min-w-[200px] flex-1">
          <h1 className="text-3xl font-extrabold" style={{ color: "#1e1b4b", fontFamily: "var(--font-baloo, inherit)" }}>
            Pick a story, {child.first_name || "reader"}!
          </h1>
          <p className="mt-1 text-sm font-semibold" style={{ color: "#6d28d9" }}>
            Five shelves of stories, made just for readers like you.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-extrabold" style={{ background: "#fef3c7", color: "#b45309" }}>
          <FluentIcon name="carrot" size={16} /> {child.carrots ?? 0}
        </span>
        {typeof child.streak_days === "number" && child.streak_days > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-extrabold" style={{ background: "#ffe4e6", color: "#be123c" }}>
            <FluentIcon name="fire" size={16} /> {child.streak_days} days
          </span>
        )}
      </motion.div>

      {saveError && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800"
        >
          We couldn&apos;t save the last story&apos;s progress just now.
          Your reader still finished it - try reading it again later and
          it&apos;ll record then.
        </div>
      )}

      {/* Grade accordions */}
      {gradeGroups.map((group, gIdx) => {
        const isExpanded = expandedGrade === group.grade;
        const isPremium = isPaidPlan(plan);
        // Grades above the child's reading level are a Readee+ upsell for
        // free readers; a subscription unlocks every grade. Free readers can
        // still expand a locked grade to preview covers — each story shows the
        // Readee+ lock and taps through to /upgrade.
        const gradeAboveLevel = GRADE_ORDER.indexOf(group.grade) > childGradeIdx;
        const isProLocked = gradeAboveLevel && !isPremium;

        return (
          <motion.div
            key={group.grade}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gIdx * 0.04 }}
            className="rounded-2xl bg-white shadow-sm overflow-hidden"
          >
            <button
              onClick={() => setExpandedGrade(isExpanded ? null : group.grade)}
              className="w-full text-left"
            >
              <div className="flex items-center gap-3 px-5 py-4" style={isExpanded ? { background: "linear-gradient(90deg,#4338ca,#7c3aed)" } : undefined}>
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full font-extrabold"
                  style={{
                    background: GRADE_META[group.grade].main,
                    color: "#fff",
                    fontSize: 20,
                    fontFamily: "var(--font-baloo, inherit)",
                    boxShadow: `0 0 0 3px rgba(255,255,255,0.9), 0 4px 10px -2px ${GRADE_META[group.grade].main}80`,
                  }}
                >
                  {GRADE_META[group.grade].letter}
                </div>
                <div className="flex-1">
                  <p className="text-xl font-extrabold" style={{ color: isExpanded ? "#fff" : "#1e1b4b", fontFamily: "var(--font-baloo, inherit)" }}>
                    {group.label}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: isExpanded ? "rgba(255,255,255,0.75)" : "#a1a1aa" }}>
                    {group.stories.length} stories
                  </p>
                </div>
                {isProLocked ? (
                  <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-extrabold" style={{ background: isExpanded ? "rgba(255,255,255,0.22)" : "#fef3c7", color: isExpanded ? "#fff" : "#b45309" }}>
                    <FluentIcon name="lock" size={12} /> Readee+
                  </span>
                ) : (
                  <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-extrabold" style={{ background: isExpanded ? "rgba(255,255,255,0.22)" : "#eef2ff", color: isExpanded ? "#fff" : "#4338ca" }}>
                    <Glyph name="star" size={12} /> {group.doneCount} of {group.stories.length} read
                  </span>
                )}
                <Glyph name="chevron-down" size={20} className={`flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} style={{ color: isExpanded ? "rgba(255,255,255,0.7)" : "#a1a1aa" }} />
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-4 px-4 py-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(196px, 1fr))" }}>
                    {group.stories.map((s, sIdx) => {
                      const limits = getLimits(plan);
                      const isStoryLocked =
                        !isPremium && (gradeAboveLevel || sIdx >= limits.storiesPerGrade);
                      const isDone = doneStories.has(s.id);

                      if (isStoryLocked) {
                        return (
                          <div key={s.id} onClick={() => router.push("/upgrade?reason=story")} className="cursor-pointer">
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: sIdx * 0.05 }}
                              className="relative overflow-hidden bg-white text-left shadow-sm"
                              style={{ borderRadius: 20, border: "1px solid #e4e4e7" }}
                            >
                              <div className="relative overflow-hidden" style={{ height: 150, background: "#ede9fe" }}>
                                <Image src={storyImageUrl(s)} alt="" fill sizes="240px" className="object-cover" style={{ filter: "saturate(0.55)" }} />
                                <div className="absolute inset-0 flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(255,251,235,0.35), rgba(245,158,11,0.22))" }}>
                                  <span className="pointer-events-none absolute" style={{ inset: "-20% -40%", background: "linear-gradient(105deg, transparent 40%, rgba(255,236,170,0.65) 50%, transparent 60%)", animation: "goldSweep 3.2s ease-in-out infinite" }} />
                                  <div className="relative flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-extrabold" style={{ background: "#fef3c7", color: "#b45309", boxShadow: "0 2px 8px rgba(180,83,9,0.25)" }}>
                                    <FluentIcon name="lock" size={12} /> Readee+
                                  </div>
                                </div>
                              </div>
                              <div className="p-3">
                                <p className="text-[17px] font-bold leading-tight" style={{ color: "#a1a1aa", fontFamily: "var(--font-baloo, inherit)" }}>{s.title}</p>
                                <p className="mt-1.5 text-[12.5px] font-bold" style={{ color: "#a1a1aa" }}>Unlock with Readee+</p>
                              </div>
                            </motion.div>
                          </div>
                        );
                      }

                      return (
                      <motion.button
                        key={s.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: sIdx * 0.05 }}
                        onClick={() => openStory(s)}
                        className="group overflow-hidden bg-white text-left shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-lg"
                        style={{ borderRadius: 20, border: isDone ? "2px solid #fcd34d" : "1px solid #e4e4e7" }}
                      >
                        <div className="relative overflow-hidden" style={{ height: 150, background: "#ede9fe" }}>
                          <Image src={storyImageUrl(s)} alt="" fill sizes="240px" className="object-cover" />
                          {isDone && (
                            <span className="absolute right-2 top-2 flex h-[34px] w-[34px] items-center justify-center rounded-full" style={{ background: "#f59e0b", boxShadow: "0 2px 8px rgba(180,83,9,0.4), 0 0 0 3px #fff" }}>
                              <Glyph name="star" size={18} className="text-white" />
                            </span>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/85 opacity-0 shadow transition-opacity group-hover:opacity-100">
                              <Glyph name="play" size={20} className="ml-0.5" style={{ color: "#6d28d9" }} />
                            </div>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-[17px] font-bold leading-tight" style={{ color: "#18181b", fontFamily: "var(--font-baloo, inherit)" }}>{s.title}</p>
                          {isDone ? (
                            <span className="mt-1.5 inline-flex items-center gap-1 text-[12.5px] font-extrabold" style={{ color: "#b45309" }}>
                              <FluentIcon name="check" size={12} /> Finished!
                            </span>
                          ) : (
                            <span className="mt-1.5 inline-flex items-center gap-1 text-[12.5px] font-bold" style={{ color: "#71717a" }}>
                              <Glyph name="play" size={12} /> New story
                            </span>
                          )}
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
    </div>
  );
}
