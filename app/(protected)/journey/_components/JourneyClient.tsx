"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { JourneySnapshot } from "@/lib/journey/types";
import { assignedJourneyCatalog } from "@/lib/journey/next-lesson";
import {
  freeJourneyLesson,
  hasLegacyLessonAllowance,
  lessonCompleted,
} from "@/lib/journey/lesson-access";
import { buildRevealCopy } from "@/app/(protected)/placement/_components/reveal/copy";
import { GradeLadder } from "@/app/(protected)/placement/_components/reveal/GradeLadder";
import TrialOffer from "@/app/_components/TrialOffer";
import { PaywallModal } from "@/app/_components/PaywallModal";
import { Glyph } from "@/app/_components/Glyph";
import { audioManager } from "@/lib/audio/audio-manager";
import { trackFunnelClient } from "@/lib/analytics/funnel";
import { usePlanStore } from "@/lib/stores/plan-store";
import { supabaseBrowser } from "@/lib/supabase/client";
import { savedOk } from "@/lib/db/checked-write";
import { awardCarrots } from "@/lib/levels/award-carrots";
import JourneyMap, { type JGrade, type JLesson } from "./JourneyMap";

const BADGES: Record<string, string> = {
  Kindergarten: "k",
  "1st Grade": "1",
  "2nd Grade": "2",
  "3rd Grade": "3",
  "4th Grade": "4",
};
const PRIMARY =
  "inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-6 py-3 font-semibold text-white hover:from-violet-700 hover:to-violet-600";

export default function JourneyClient({
  snapshot,
  completed,
  checkout,
}: {
  snapshot: JourneySnapshot;
  completed?: string;
  checkout?: string;
}) {
  const router = useRouter();
  const [child, setChild] = useState(snapshot.child);
  const [fullAccess, setFullAccess] = useState(snapshot.billing.fullAccess);
  const [confirming, setConfirming] = useState(
    checkout === "success" && !snapshot.billing.fullAccess,
  );
  const [confirmError, setConfirmError] = useState(false);
  const [confirmAttempt, setConfirmAttempt] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const rewardQueue = useRef(Promise.resolve());
  const childRef = useRef(child);
  const result = snapshot.result;
  const placement = result?.plan;
  const copy = result ? buildRevealCopy(result) : null;
  const name = child.first_name || "Reader";
  const catalog = useMemo(
    () => assignedJourneyCatalog(child.reading_level ?? null, placement),
    [child.reading_level, placement],
  );
  const done = (id: string) => lessonCompleted(id, snapshot.practice, snapshot.lessonProgress);
  const current = catalog.find((lesson) => !done(lesson.standardId));
  const first = catalog[0];
  const justCompleted = completed && done(completed) ? completed : null;
  const legacy = hasLegacyLessonAllowance(snapshot.billing.signupAt);
  const free = (lesson: (typeof catalog)[number]) =>
    freeJourneyLesson({
      lesson,
      signupAt: snapshot.billing.signupAt,
      readingLevel: child.reading_level ?? null,
      placement,
    });
  const sample =
    catalog.find((lesson) => free(lesson) && !done(lesson.standardId)) ??
    (first && free(first) ? first : undefined);
  const lessonUrl = (id: string) => `/learn?child=${child.id}&standard=${encodeURIComponent(id)}`;
  const upcoming = catalog.filter((lesson) => !done(lesson.standardId)).slice(0, 3);
  const goals =
    placement?.steps
      .filter((step) => step.kind === "start" || step.kind === "target")
      .slice(0, 2) ?? [];
  const p = copy?.placement;

  useEffect(() => {
    trackFunnelClient("funnel.journey_viewed", {
      has_placement: !!snapshot.result,
      full_access: snapshot.billing.fullAccess,
      from_checkout: checkout === "success",
    });
  }, [snapshot.child.id, snapshot.result, snapshot.billing.fullAccess, checkout]);

  useEffect(() => {
    if (checkout !== "success" || fullAccess) return;
    let alive = true;
    const controller = new AbortController();
    const timers = new Set<ReturnType<typeof setTimeout>>();
    void (async () => {
      setConfirming(true);
      setConfirmError(false);
      for (let attempt = 0; attempt < 4 && alive; attempt++) {
        const request = new AbortController();
        const abort = () => request.abort();
        controller.signal.addEventListener("abort", abort, { once: true });
        const timeout = window.setTimeout(abort, 15000);
        try {
          const response = await fetch("/api/billing/confirm", {
            method: "POST",
            signal: request.signal,
          });
          const body = await response.json();
          if (response.ok && body.fullAccess) {
            if (!alive) return;
            setFullAccess(true);
            setConfirming(false);
            void usePlanStore.getState().refresh();
            trackFunnelClient("funnel.checkout_return_confirmed", { source: "journey" });
            return;
          }
        } catch {
          /* A delayed webhook or network can be retried without a second checkout. */
        } finally {
          window.clearTimeout(timeout);
          controller.signal.removeEventListener("abort", abort);
        }
        if (alive && attempt < 3)
          await new Promise<void>((resolve) => {
            const timer = setTimeout(() => {
              timers.delete(timer);
              resolve();
            }, 1500);
            timers.add(timer);
          });
      }
      if (alive) {
        setConfirming(false);
        setConfirmError(true);
      }
    })();
    return () => {
      alive = false;
      controller.abort();
      timers.forEach(clearTimeout);
    };
  }, [checkout, fullAccess, confirmAttempt]);

  function openPaywall() {
    trackFunnelClient("funnel.journey_paywall_viewed", { source: "lesson_node" });
    setShowPaywall(true);
  }
  function start(lesson: JLesson) {
    const selected = catalog.find((l) => l.standardId === lesson.id);
    if (!selected) return;
    if (!fullAccess && !free(selected)) {
      openPaywall();
      return;
    }
    audioManager.resumeContextSync();
    router.push(lessonUrl(lesson.id));
  }
  function creditReward(id: string, amount: number) {
    // Serialize chest writes so rapid rewards cannot overwrite the opened list.
    rewardQueue.current = rewardQueue.current.then(async () => {
      const c = childRef.current;
      if (c.opened_chests?.includes(id)) return;
      const nextOpened = [...(c.opened_chests ?? []), id];
      const saved = await savedOk(
        "journey:reward",
        supabaseBrowser().from("children").update({ opened_chests: nextOpened }).eq("id", c.id),
      );
      if (!saved) return;
      const awarded = await awardCarrots(supabaseBrowser(), c.id, amount);
      const updated = {
        ...childRef.current,
        opened_chests: nextOpened,
        carrots: awarded?.carrots ?? childRef.current.carrots,
      };
      childRef.current = updated;
      setChild(updated);
    });
    return rewardQueue.current;
  }
  const grades: JGrade[] = [];
  for (const lesson of catalog) {
    let grade = grades.find((g) => g.grade === lesson.grade);
    if (!grade) {
      grade = {
        grade: lesson.grade,
        badge: `/images/ui/grades/grade-${BADGES[lesson.grade] ?? "k"}.png`,
        units: [],
      };
      grades.push(grade);
    }
    let unit = grade.units.find((u) => u.domainName === lesson.domain);
    if (!unit) {
      unit = { domainName: lesson.domain, domKey: lesson.standardId.split(".")[0], lessons: [] };
      grade.units.push(unit);
    }
    const status = done(lesson.standardId)
      ? "completed"
      : !fullAccess && !free(lesson)
        ? "premium"
        : lesson.standardId === current?.standardId
          ? "current"
          : "locked";
    unit.lessons.push({ id: lesson.standardId, title: lesson.title, status });
  }

  return (
    <div data-journey className="pb-12">
      <div className="mx-auto max-w-6xl px-5 pb-10 pt-8 sm:px-8 sm:pt-12">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link
            href={`/dashboard?child=${child.id}`}
            className="inline-flex min-h-10 items-center gap-2 font-medium text-zinc-600"
          >
            <Glyph name="home" size={17} />
            Home
          </Link>
          {result && (
            <Link
              href={`/placement/report?child=${child.id}`}
              className="inline-flex min-h-10 items-center gap-2 font-semibold text-violet-700"
            >
              View {name}’s reading report
              <Glyph name="arrow-right" size={16} />
            </Link>
          )}
        </div>
        {checkout === "canceled" && (
          <p
            role="status"
            className="mb-6 rounded-xl border border-violet-100 bg-violet-50 p-4 text-sm text-violet-900"
          >
            Your reading journey is saved. You can start Readee+ whenever you’re ready.
          </p>
        )}
        {checkout === "success" && (
          <section
            aria-live="polite"
            className="mb-6 rounded-xl border border-violet-200 bg-violet-50 p-5"
            data-checkout-return
          >
            <p className="font-semibold text-violet-900">
              {fullAccess
                ? "Readee+ is ready. Let’s begin."
                : confirming
                  ? "Confirming your Readee+ access…"
                  : "Your checkout has returned. We’re still checking your access."}
            </p>
            {!fullAccess && (
              <p className="mt-2 text-sm text-zinc-600">
                Your child’s plan is saved. You don’t need to enter your card again.
              </p>
            )}
            {confirmError && (
              <button
                className="mt-3 min-h-11 font-semibold text-violet-700 underline"
                onClick={() => setConfirmAttempt((n) => n + 1)}
              >
                Check again
              </button>
            )}
          </section>
        )}
        <div
          className={`grid items-start gap-8 xl:gap-12 ${!fullAccess ? "lg:grid-cols-[minmax(0,1fr)_360px]" : ""}`}
        >
          <div className="min-w-0">
            <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl">
              {name}’s custom reading journey
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-7 text-zinc-600">
              {placement?.firstUnit
                ? `We’ll begin with ${placement.firstUnit.title.toLowerCase()}, then build on what ${name} learns in each lesson.`
                : "A clear next step for reading, with practice and support along the way."}
            </p>
            {!fullAccess && checkout !== "success" && (
              <a href="#readee-trial" className={`${PRIMARY} mt-6 lg:hidden`}>
                {snapshot.billing.eligibleForTrial
                  ? "Start a 14-day free trial"
                  : "Continue with Readee+"}
                <Glyph name="arrow-right" size={18} className="ml-2" />
              </a>
            )}
            {fullAccess && current && (
              <div
                className="mt-7 rounded-2xl border border-violet-200 bg-violet-50 p-5 sm:p-6"
                data-next-lesson
              >
                <p className="text-sm font-semibold text-violet-700">Today’s lesson</p>
                <h2 className="mt-2 text-xl font-bold text-zinc-900">{current.title}</h2>
                <p className="mt-2 text-sm text-zinc-600">
                  {current.grade} · {current.domain}
                </p>
                <Link
                  href={lessonUrl(current.standardId)}
                  onClick={() => audioManager.resumeContextSync()}
                  className={`${PRIMARY} mt-5`}
                >
                  Continue reading
                  <Glyph name="arrow-right" size={18} className="ml-2" />
                </Link>
              </div>
            )}
            {!current && (
              <p className="mt-6 text-lg font-semibold text-violet-800">
                You’ve completed this journey. Choose a lesson below to practice again.
              </p>
            )}
            {p && !fullAccess && (
              <section
                className="@container mt-8 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"
                aria-label="Your child’s reading starting point"
              >
                <h2 className="text-lg font-semibold text-zinc-900">
                  A starting point that fits {name}
                </h2>
                <dl className="my-5 grid grid-cols-2 gap-5 text-sm">
                  <div>
                    <dt className="text-zinc-500">Enrolled in</dt>
                    <dd className="mt-1 text-lg font-semibold text-zinc-900">
                      {copy?.enrolledLabel}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Lessons start with</dt>
                    <dd className="mt-1 text-lg font-semibold text-violet-800">
                      {placement?.firstUnit?.grade ?? "Guided reading"}
                    </dd>
                  </div>
                </dl>
                <GradeLadder
                  provisional={p.provisional}
                  enrolled={p.enrolled}
                  placed={p.placed}
                  childName={name}
                  bandName={p.band}
                  categoryText={p.categoryText}
                  animate
                  instant
                />
              </section>
            )}
            {!result && (
              <p className="mt-6 text-base leading-6 text-zinc-600">
                An assessment helps us choose the right starting point.{" "}
                <Link
                  href={`/placement?child=${child.id}`}
                  className="font-semibold text-violet-700 underline"
                >
                  Find {name}’s reading level
                </Link>
              </p>
            )}
            {goals.length > 0 && !fullAccess && (
              <section className="mt-8" aria-label="Why these lessons">
                <h2 className="text-lg font-semibold text-zinc-900">What we’ll work on first</h2>
                <ol className="mt-4 divide-y divide-zinc-100">
                  {goals.map((goal, i) => (
                    <li key={`${goal.title}-${i}`} className="flex gap-4 py-4">
                      <span className="mt-0.5 text-sm font-semibold text-violet-600">0{i + 1}</span>
                      <div>
                        <h3 className="font-semibold text-zinc-900">{goal.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-zinc-600">{goal.reason}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Lessons are selected from {name}’s assessment. We’ll use practice and reading
                  evidence to guide the next steps.
                </p>
              </section>
            )}
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
              <a
                href="#lesson-path"
                className="inline-flex min-h-11 items-center gap-2 font-semibold text-violet-700"
              >
                Explore the lesson path
                <Glyph name="chevron-down" size={17} />
              </a>
              <span className="text-zinc-500">
                About {placement?.minutesPerDay ?? 10} minutes a day
              </span>
            </div>
          </div>
          {!fullAccess && checkout !== "success" && (
            <div className="lg:sticky lg:top-24">
              <TrialOffer
                childId={child.id}
                childName={name}
                eligibleForTrial={snapshot.billing.eligibleForTrial}
                source="journey"
                focus={
                  placement?.firstUnit
                    ? `Start with ${placement.firstUnit.title.toLowerCase()} and keep building through ${name}’s plan.`
                    : undefined
                }
                sampleHref={sample ? lessonUrl(sample.standardId) : undefined}
                sampleLabel={
                  legacy
                    ? "Explore an included lesson"
                    : first && done(first.standardId)
                      ? "Read the sample lesson again"
                      : "Try the first lesson"
                }
                onSample={() => {
                  audioManager.resumeContextSync();
                  trackFunnelClient("funnel.journey_sample_clicked", {
                    source: "journey",
                    legacy_allowance: legacy,
                  });
                }}
              />
              <p className="mt-4 px-2 text-center text-xs leading-5 text-zinc-500">
                Your assessment and saved reading report remain available on the free plan.
              </p>
            </div>
          )}
        </div>
        {!fullAccess && upcoming.length > 0 && (
          <section className="mt-10 border-t border-zinc-200 pt-7" aria-label="Upcoming lessons">
            <h2 className="text-lg font-semibold text-zinc-900">
              The first steps in {name}’s plan
            </h2>
            <ol className="mt-3 divide-y divide-zinc-100">
              {upcoming.map((lesson, i) => (
                <li
                  key={lesson.standardId}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="text-sm font-semibold text-violet-600">{i + 1}</span>
                    <div>
                      <p className="font-semibold text-zinc-900">{lesson.title}</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {lesson.domain} · {lesson.grade}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-violet-700">
                    {free(lesson) ? "Included" : "Readee+"}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
      <section id="lesson-path" className="scroll-mt-20" aria-label="Interactive reading journey">
        <JourneyMap
          key={`${child.id}:${fullAccess}`}
          grades={grades}
          kidName={name}
          streak={child.streak_days ?? 0}
          carrots={child.carrots ?? 0}
          equippedOutfitId={child.equipped_items?.outfit ?? null}
          openedChests={child.opened_chests ?? []}
          justCompletedId={justCompleted}
          autoFocusCurrent={false}
          onStart={start}
          onPremium={openPaywall}
          onChestReward={(id, amount) => {
            void creditReward(id, amount);
          }}
          onTrophyReward={(amount) => {
            void creditReward("__trophy__", amount);
          }}
        />
      </section>
      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        childId={child.id}
        childName={name}
        eligibleForTrial={snapshot.billing.eligibleForTrial}
        trigger="lesson"
      />
    </div>
  );
}
