"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import { usePlanStore } from "@/lib/stores/plan-store";
import { useChildStore } from "@/lib/stores/child-store";
import { getLimits } from "@/lib/plan/limits";
import { levelNameToGradeKey, gradeOrder as ASSESSMENT_GRADE_ORDER } from "@/lib/assessment/questions";
import sampleLessons from "@/app/data/sample-lessons.json";
import JourneyMap, { type JGrade } from "./_components/JourneyMap";
import { BookOpen, Type, Newspaper, MessageCircle } from "lucide-react";

const GRADE_BADGES: Record<string, string> = {
  "Kindergarten": "/images/ui/grades/grade-k.png",
  "1st Grade": "/images/ui/grades/grade-1.png",
  "2nd Grade": "/images/ui/grades/grade-2.png",
  "3rd Grade": "/images/ui/grades/grade-3.png",
  "4th Grade": "/images/ui/grades/grade-4.png",
};
import { PaywallModal } from "@/app/_components/PaywallModal";
import { SkeletonPage } from "@/app/_components/Skeleton";

/* ── Types ─────────────────────────────────────────── */

interface SampleLesson {
  standardId: string;
  grade: string;
  domain: string;
  title: string;
  slides: any[];
}

interface ProgressRecord {
  standard_id: string;
  questions_correct: number;
  questions_attempted: number;
}

interface LessonProgressRecord {
  lesson_id: string;
  section: string;
  score: number;
}

type LessonStatus = "completed" | "started" | "current" | "locked" | "premium";

interface LessonWithStatus extends SampleLesson {
  status: LessonStatus;
  idx: number;
}

interface DomainGroup {
  domain: string;
  Icon: typeof BookOpen;
  lessons: LessonWithStatus[];
  completedCount: number;
}

interface GradeGroup {
  grade: string;
  domains: DomainGroup[];
  totalLessons: number;
  completedCount: number;
}

/* ── Constants ─────────────────────────────────────── */

// FREE_LESSON_COUNT now comes from getLimits()

const DOMAIN_ICONS: Record<string, typeof BookOpen> = {
  "Reading Literature": BookOpen,
  "Reading Informational Text": Newspaper,
  "Foundational Skills": Type,
  "Language": MessageCircle,
};

/* ── Page ──────────────────────────────────────────── */

export default function JourneyPage() {
  return (
    <Suspense fallback={<SkeletonPage cards={5} />}>
      <JourneyContent />
    </Suspense>
  );
}

function JourneyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const childIdParam = searchParams.get("child");
  const plan = usePlanStore((s) => s.plan);
  const fetchPlan = usePlanStore((s) => s.fetch);

  const [child, setChild] = useState<Child | null>(null);
  const [practiceProgress, setPracticeProgress] = useState<ProgressRecord[]>([]);
  const [lessonProgress, setLessonProgress] = useState<LessonProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  // Resolve the active child even when ?child= isn't on the URL —
  // same store → DB → fallback pattern used by /practice-hub,
  // /analytics, /stories, and /roadmap. Without this, bookmark and
  // share-link landings stalled on the skeleton indefinitely.
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

      const [childRes, practiceRes, lessonRes] = await Promise.all([
        supabase.from("children").select("*").eq("id", resolvedId).single(),
        supabase.from("practice_results").select("standard_id, questions_correct, questions_attempted").eq("child_id", resolvedId),
        supabase.from("lessons_progress").select("lesson_id, section, score").eq("child_id", resolvedId),
      ]);
      if (!alive) return;
      if (childRes.data) setChild(childRes.data as Child);
      if (practiceRes.data) setPracticeProgress(practiceRes.data as ProgressRecord[]);
      if (lessonRes.data) setLessonProgress(lessonRes.data as LessonProgressRecord[]);
      setLoading(false);
    }
    load();
    return () => {
      alive = false;
    };
  }, [childIdParam, router]);

  // Keep a live ref to the child so JourneyMap's reward callbacks (fired from
  // outside React render, sometimes back-to-back — chest then trophy) always
  // read + accumulate the latest carrots/opened_chests instead of clobbering
  // each other on a stale snapshot.
  const childRef = useRef<Child | null>(child);
  useEffect(() => { childRef.current = child; }, [child]);

  // Credit a journey reward to the wallet exactly once, persisting the opened
  // chest/trophy id so re-opening never re-pays. Idempotent via opened_chests.
  const creditReward = useCallback(async (rewardId: string, amount: number) => {
    const c = childRef.current;
    if (!c) return;
    const already = c.opened_chests ?? [];
    if (already.includes(rewardId)) return;
    const nextOpened = [...already, rewardId];
    const nextCarrots = (c.carrots ?? 0) + amount;
    const updated = { ...c, opened_chests: nextOpened, carrots: nextCarrots };
    childRef.current = updated; // sync so rapid successive payouts accumulate
    setChild(updated);
    await supabaseBrowser()
      .from("children")
      .update({ opened_chests: nextOpened, carrots: nextCarrots })
      .eq("id", c.id);
  }, []);

  if (loading || !child) {
    return <SkeletonPage cards={5} />;
  }

  // From here on, the child is loaded and the URL has been rewritten
  // (when needed) so downstream JSX can rely on a non-null id without
  // the `childId!` cast that was sprinkled below.
  const childId = child.id;

  const allLessons = sampleLessons as SampleLesson[];

  // Check completion: practice_results has standard_id with good score, OR lessons_progress
  const hasCompleted = (standardId: string) =>
    practiceProgress.some((p) => p.standard_id === standardId && p.questions_correct >= 3) ||
    lessonProgress.some((p) => p.lesson_id === standardId && p.section === "practice" && p.score >= 60);

  // Build per-grade index map for free tier gating
  const gradeCounters = new Map<string, number>();

  // Placement floor: the journey begins at the grade the child TESTED into.
  // reading_level ("Growing Reader" → "2nd", etc.) → a grade key; every lesson
  // in a LOWER grade is treated as already mastered (tested out) so the first
  // "current" node lands on the tested grade's first lesson. No test yet →
  // levelNameToGradeKey(null) = "kindergarten" → starts at K (unchanged).
  const CATALOG_GRADE_KEY: Record<string, string> = {
    "Kindergarten": "kindergarten", "1st Grade": "1st", "2nd Grade": "2nd", "3rd Grade": "3rd", "4th Grade": "4th",
  };
  const testedIdx = ASSESSMENT_GRADE_ORDER.indexOf(levelNameToGradeKey(child.reading_level ?? null));
  const belowTested = (catalogGrade: string) => {
    const k = CATALOG_GRADE_KEY[catalogGrade] as (typeof ASSESSMENT_GRADE_ORDER)[number] | undefined;
    return k ? ASSESSMENT_GRADE_ORDER.indexOf(k) < testedIdx : false;
  };

  // Assign statuses. The journey is a linear spine: everything completed (or
  // below the tested placement floor) stays gold, the FIRST not-yet-completed
  // lesson is the single "current" node (green, playable), and everything after
  // it is locked/premium. Marking every *started* lesson as its own unlocked
  // node was the "everything ahead is unlocked" bug — a kid who peeked into
  // several lessons lit them all up green.
  let foundCurrent = false;
  const lessonsWithStatus: LessonWithStatus[] = allLessons.map((lesson, idx) => {
    // Track per-grade index
    const gradeIdx = gradeCounters.get(lesson.grade) ?? 0;
    gradeCounters.set(lesson.grade, gradeIdx + 1);

    let status: LessonStatus;
    if (hasCompleted(lesson.standardId) || belowTested(lesson.grade)) {
      status = "completed";
    } else if (!foundCurrent) {
      foundCurrent = true;
      status = "current";
    } else if (gradeIdx >= getLimits(plan).lessons && plan !== "premium") {
      status = "premium";
    } else {
      status = "locked";
    }
    return { ...lesson, status, idx };
  });

  // Group by grade → domain
  const gradeMap = new Map<string, LessonWithStatus[]>();
  const gradeOrder: string[] = [];
  for (const l of lessonsWithStatus) {
    if (!gradeMap.has(l.grade)) { gradeMap.set(l.grade, []); gradeOrder.push(l.grade); }
    gradeMap.get(l.grade)!.push(l);
  }

  const gradeGroups: GradeGroup[] = gradeOrder.map((grade) => {
    const lessons = gradeMap.get(grade)!;
    const domainMap = new Map<string, LessonWithStatus[]>();
    const domainOrder: string[] = [];
    for (const l of lessons) {
      if (!domainMap.has(l.domain)) { domainMap.set(l.domain, []); domainOrder.push(l.domain); }
      domainMap.get(l.domain)!.push(l);
    }
    const domains: DomainGroup[] = domainOrder.map((domain) => {
      const dLessons = domainMap.get(domain)!;
      return {
        domain,
        Icon: DOMAIN_ICONS[domain] || BookOpen,
        lessons: dLessons,
        completedCount: dLessons.filter((l) => l.status === "completed").length,
      };
    });
    return {
      grade,
      domains,
      totalLessons: lessons.length,
      completedCount: lessons.filter((l) => l.status === "completed").length,
    };
  });

  // ── Transform real grade→domain→lesson data into the JourneyMap shape ──
  const domKeyOf = (standardId: string, domainName: string): string => {
    const d = (domainName || "").toLowerCase();
    if (d.includes("literature")) return "RL";
    if (d.includes("inform")) return "RI";
    if (d.includes("foundational")) return "RF";
    if (d.includes("language")) return "L";
    const m = standardId.match(/(RL|RI|RF|L)/);
    return m ? m[1] : "RL";
  };
  const journeyGrades: JGrade[] = gradeGroups.map((gg) => ({
    grade: gg.grade,
    badge: GRADE_BADGES[gg.grade] || "",
    units: gg.domains.map((d) => ({
      domKey: domKeyOf(d.lessons[0]?.standardId ?? "", d.domain),
      domainName: d.domain,
      lessons: d.lessons.map((l) => ({ id: l.standardId, title: l.title, status: l.status })),
    })),
  }));

  // Return trigger: /learn sends the kid back here as ?completed=<standardId>
  // after they pass. Only fire the unlock cinematic if the DB actually
  // records that lesson as completed (guards against a lie if they bailed).
  const completedParam = searchParams.get("completed");
  const justCompletedId = completedParam && hasCompleted(completedParam) ? completedParam : null;

  return (
    <>
      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        childId={childId}
        childName={child.first_name}
        trigger="lesson"
      />
      <JourneyMap
        grades={journeyGrades}
        kidName={child.first_name}
        streak={child.streak_days || 0}
        carrots={child.carrots || 0}
        equippedOutfitId={child.equipped_items?.outfit ?? "bunny_classic"}
        justCompletedId={justCompletedId}
        openedChests={child.opened_chests ?? []}
        onChestReward={(chestId, carrots) => creditReward(chestId, carrots)}
        onTrophyReward={(carrots) => creditReward("__trophy__", carrots)}
        onStart={(l) => router.push(`/learn?child=${childId}&standard=${l.id}`)}
        onPremium={() => setShowPaywall(true)}
      />
    </>
  );
}
