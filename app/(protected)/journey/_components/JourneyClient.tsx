"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
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
import { PaywallModal } from "@/app/_components/PaywallModal";
import { Glyph } from "@/app/_components/Glyph";
import { audioManager } from "@/lib/audio/audio-manager";
import { PRICING } from "@/lib/billing-copy";
import { trackFunnelClient } from "@/lib/analytics/funnel";
import { useChildStore } from "@/lib/stores/child-store";
import { usePlanStore } from "@/lib/stores/plan-store";
import { supabaseBrowser } from "@/lib/supabase/client";
import { savedOk } from "@/lib/db/checked-write";
import { awardCarrots } from "@/lib/levels/award-carrots";
import JourneyPlanDialog from "./JourneyPlanDialog";
import JourneyOverview from "./JourneyOverview";
import { lessonPurpose } from "@/lib/journey/lesson-purpose";
import styles from "./journey.module.css";
import JourneyAdventure from "./JourneyAdventure";
import { buildAdventureView } from "@/lib/journey/adventure-view";
import type { JGrade, JLesson } from "./JourneyMap";
const JourneyMap = dynamic(() => import("./JourneyMap"));

const SKILL_PURPOSE: Record<string, string> = {
  RF: "Connect sounds and letters, read words accurately, and build fluency.",
  RL: "Talk about characters, events, and the details that explain a story.",
  RI: "Find facts, explain main ideas, and use details from informational texts.",
  L: "Build vocabulary and use words and sentences to express meaning.",
};
const BADGES: Record<string, string> = {
  Kindergarten: "k",
  "1st Grade": "1",
  "2nd Grade": "2",
  "3rd Grade": "3",
  "4th Grade": "4",
};

export default function JourneyClient({
  snapshot,
  completed,
  checkout,
  introduce = false,
  presentation = "adventure",
}: {
  snapshot: JourneySnapshot;
  completed?: string;
  checkout?: string;
  introduce?: boolean;
  presentation?: "adventure" | "classic";
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
  const [revealSequence, setRevealSequence] = useState(0);
  const [showPlan, setShowPlan] = useState(false);
  const [browseJourney, setBrowseJourney] = useState(false);
  const rewardQueue = useRef(Promise.resolve());
  const childRef = useRef(child);
  const result = snapshot.result;
  const placement = result?.plan;
  const adventure = useMemo(() => buildAdventureView({ ...snapshot, child }, fullAccess), [snapshot, child, fullAccess]);
  const copy = result ? buildRevealCopy(result) : null;
  const name = child.first_name || "Reader";
  const catalog = useMemo(
    () => assignedJourneyCatalog(child.reading_level ?? null, placement),
    [child.reading_level, placement],
  );
  const done = (id: string) => lessonCompleted(id, snapshot.practice, snapshot.lessonProgress, snapshot.completedStandards);
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
  const goals =
    placement?.steps
      .filter((step) => step.kind === "start" || step.kind === "target")
      .slice(0, 2) ?? [];
  const p = copy?.placement;
  const [gradeChoice, setGradeChoice] = useState<string | null>(null);
  const [unitChoice, setUnitChoice] = useState<string | null>(null);
  const openingKey = `readee:journey-inline-v1:${child.id}:${result?.id ?? "no-result"}`;
  useEffect(() => {
    if (!introduce || !result || completed || checkout) return;
    try {
      if (sessionStorage.getItem(openingKey)) return;
    } catch {
      /* Storage is optional. */
    }
    setRevealSequence(1);
  }, [introduce, openingKey, result, completed, checkout]);
  function finishReveal() {
    setRevealSequence(0);
    try {
      sessionStorage.setItem(openingKey, "seen");
    } catch {
      /* The map works without storage. */
    }
  }

  useEffect(() => {
    // This reader has already passed server ownership checks. Navigation can
    // use it immediately while NavAuth fetches the family's complete child list.
    const store = useChildStore.getState();
    if (store.ownerProfileId && store.ownerProfileId !== snapshot.child.parent_id) store.reset();
    store.setOwnerProfileId(snapshot.child.parent_id);
    store.setCurrentChild(snapshot.child.id);
    store.setChildData(snapshot.child);
  }, [snapshot.child]);

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

  function openPaywall(source: "lesson_node" | "journey_overview" | "plan_panel" = "lesson_node") {
    setShowPlan(false);
    trackFunnelClient("funnel.journey_paywall_viewed", { source });
    if (source !== "lesson_node") trackFunnelClient("funnel.journey_trial_clicked", { source });
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
    rewardQueue.current = rewardQueue.current.catch(() => undefined).then(async () => {
      const c = childRef.current;
      if (c.opened_chests?.includes(id)) return;
      const nextOpened = [...(c.opened_chests ?? []), id];
      const saved = await savedOk(
        "journey:reward",
        supabaseBrowser().from("children").update({ opened_chests: nextOpened }).eq("id", c.id),
      );
      if (!saved) throw new Error("Could not save the keepsake.");
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
      unit = {
        domainName: lesson.domain,
        domKey:
          lesson.standardId.split(".").find((part) => ["RF", "RL", "RI", "L"].includes(part)) ??
          lesson.standardId.split(".")[0],
        lessons: [],
      };
      grade.units.push(unit);
    }
    const status = done(lesson.standardId)
      ? "completed"
      : !fullAccess && !free(lesson)
        ? "premium"
        : lesson.standardId === current?.standardId
          ? "current"
          : "locked";
    unit.lessons.push({ id: lesson.standardId, title: lesson.title, purpose: lessonPurpose(lesson.standardId), status });
  }

  const completedGrade = justCompleted
    ? catalog.find((l) => l.standardId === justCompleted)?.grade
    : null;
  const selectedGrade =
    grades.find((g) => g.grade === gradeChoice) ??
    grades.find((g) => g.grade === completedGrade) ??
    grades.find((g) => g.grade === current?.grade) ??
    grades[0];
  const allUnits = grades.flatMap((grade) => grade.units.map((unit) => ({ grade, unit })));
  const chosen = allUnits.find(
    (entry, index) => `u${index + 1}` === unitChoice && entry.grade === selectedGrade,
  );
  const selectedUnit =
    chosen?.unit ??
    selectedGrade?.units.find((unit) =>
      unit.lessons.some((lesson) => lesson.id === (justCompleted || current?.standardId)),
    ) ??
    selectedGrade?.units[0];
  const selectedUnitIndex = allUnits.findIndex((entry) => entry.unit === selectedUnit);
  const selectedUnitId = `u${selectedUnitIndex + 1}`;
  const selectedLessons = selectedUnit?.lessons ?? [];
  const selectedDone = selectedLessons.filter((lesson) => done(lesson.id)).length;
  const unitIndexInGrade = selectedGrade?.units.indexOf(selectedUnit!) ?? 0;
  const unitReason = placement?.steps.find(
    (step) =>
      step.unit?.grade === selectedGrade?.grade &&
      step.unit.domain === selectedUnit?.domainName &&
      step.kind !== "skipped",
  )?.reason;
  function chooseUnit(index: number) {
    const entry = allUnits[index];
    if (!entry) return;
    finishReveal();
    setGradeChoice(entry.grade.grade);
    setUnitChoice(`u${index + 1}`);
    document.getElementById("lesson-path")?.scrollIntoView({ block: "start" });
  }

  const planContent = (
    <>
      {current ? (
        <section className={styles.today} data-next-lesson>
          <p className={styles.eyebrow}>Next up for {name}</p>
          <h2>{current.title}</h2>
          <p>
            {current.grade} · {current.domain}
          </p>
          <button
            type="button"
            onClick={() =>
              start({ id: current.standardId, title: current.title, status: "current" })
            }
            className={`${styles.primary} mt-4 w-full`}
          >
            {fullAccess || free(current) ? "Start this lesson" : "Unlock this lesson"}
            <Glyph name="arrow-right" size={18} />
          </button>
        </section>
      ) : (
        <section className={styles.today}>
          <h2>A journey worth celebrating.</h2>
          <p>You’ve finished these lessons. Choose any stop to read again.</p>
        </section>
      )}
      {copy && p && (
        <section className={styles.evidence} data-journey-evidence>
          <h2>Why this path?</h2>
          <p>
            Chosen from {name}’s reading assessment on {copy.dateLine}.
          </p>
          <dl className={styles.gradePair}>
            <div>
              <dt>Enrolled in</dt>
              <dd>{copy.enrolledLabel}</dd>
            </div>
            <div>
              <dt>Lessons start at</dt>
              <dd>{placement?.firstUnit?.grade ?? "Guided reading"}</dd>
            </div>
          </dl>
          {copy.skills.map((skill, index) => (
            <details key={skill.id} className={styles.skill} open={index === 0}>
              <summary>
                {skill.label}
                <strong>{skill.value}</strong>
              </summary>
              <p>{skill.evidence || skill.meaning}</p>
            </details>
          ))}
          {goals[0] && (
            <div className={styles.reason}>
              <strong>Our first focus: {goals[0].title}</strong>
              <p>{goals[0].reason}</p>
            </div>
          )}
          <details className={styles.skill}>
            <summary>Compare the starting point with school grade</summary>
            <GradeLadder
              provisional={p.provisional}
              enrolled={p.enrolled}
              placed={p.placed}
              childName={name}
              bandName={p.band}
              categoryText={p.categoryText}
              animate={false}
              instant
            />
          </details>
          <Link className={styles.textButton} href={`/placement/report?child=${child.id}`}>
            See the full reading report
            <Glyph name="arrow-right" size={16} />
          </Link>
        </section>
      )}
      {!result && (
        <section className={styles.evidence}>
          <h2>Find your starting point</h2>
          <p>A short reading assessment helps us choose the lessons to begin with.</p>
          <Link className={styles.textButton} href={`/placement?child=${child.id}`}>
            Start the assessment
            <Glyph name="arrow-right" size={16} />
          </Link>
        </section>
      )}
      {!fullAccess && checkout !== "success" && (
        <section className={styles.membership} id="readee-trial">
          <h2>Keep going with Readee+</h2>
          <p>Open every lesson in {name}’s journey, with reading practice and support from Luna.</p>
          <button type="button" className={styles.primary} onClick={() => openPaywall("plan_panel")}>
            {snapshot.billing.eligibleForTrial
              ? `Start ${PRICING.trialDays}-day free trial`
              : "See membership options"}
          </button>
          <small>
            {snapshot.billing.eligibleForTrial
              ? `$0 today, then ${PRICING.monthly.label} on the monthly plan. Credit card required. Cancel before the trial ends to avoid a charge.`
              : `Monthly ${PRICING.monthly.label}. Annual plans are also available.`}
          </small>
          {sample && (
            <Link
              className={styles.textButton}
              href={lessonUrl(sample.standardId)}
              onClick={() => {
                audioManager.resumeContextSync();
                trackFunnelClient("funnel.journey_sample_clicked", {
                  source: "journey",
                  legacy_allowance: legacy,
                });
              }}
            >
              {legacy ? "Explore an included lesson" : "Try the first lesson"}
            </Link>
          )}
        </section>
      )}
    </>
  );

  if (presentation === "adventure") return <>
    <JourneyAdventure approvedUnitEnabled={snapshot.approvedUnitEnabled} model={adventure} childId={child.id} placementId={result?.id ?? null}
      introduce={introduce && !!result && !completed && !checkout} justCompleted={justCompleted}
      openedChests={child.opened_chests ?? []} onStart={(id) => start({ id, title: "", status: "current" })}
      onPlan={() => result ? setShowPlan(true) : router.push(`/assessment?child=${encodeURIComponent(child.id)}`)}
      onReward={creditReward}
      billingNotice={checkout ? <div role="status" className={styles.connectedBilling} data-checkout-return>
        {checkout === "canceled" ? "Your reading journey is saved. You can start Readee+ whenever you’re ready."
          : fullAccess ? "Readee+ is ready. Let’s begin."
          : confirming ? "Confirming your Readee+ access…"
          : "We’re still checking your access. You don’t need to enter your card again."}
        {confirmError && <button onClick={() => setConfirmAttempt((value) => value + 1)}>Check again</button>}
      </div> : undefined} />
    <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} childId={child.id} childName={name} eligibleForTrial={snapshot.billing.eligibleForTrial} trigger="lesson" />
    {showPlan && <JourneyPlanDialog onClose={() => setShowPlan(false)}>{planContent}</JourneyPlanDialog>}
  </>;

  return (
    <div data-journey className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>{name}’s reading journey</h1>
          <p>
            {first
              ? `Starting with ${first.grade.toLowerCase()} lessons. About ${placement?.minutesPerDay ?? 10} minutes at a time.`
              : "Your next chapter starts here."}
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/dashboard" className={styles.textButton}>Dashboard</Link>
          <button
            type="button"
            className={`${styles.textButton} ${styles.mobilePlanButton}`}
            onClick={() => setShowPlan(true)}
          >
            <Glyph name="book-open" size={18} /> Plan & report
          </button>
          <button
            type="button"
            className={styles.textButton}
            onClick={() => setRevealSequence((value) => value + 1)}
          >
            <Glyph name="play" size={16} /> Watch the path unfold
          </button>
        </div>
      </header>
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

      {snapshot.approvedUnitEnabled&&<Link href={`/learn/unit-one?child=${child.id}`}>Kindergarten Unit 1 · Lessons and check-in</Link>}
      <JourneyOverview
        name={name}
        copy={copy}
        firstGrade={first?.grade}
        focusTitle={first?.title}
        purpose={first ? lessonPurpose(first.standardId) : undefined}
        currentTitle={current?.title}
        fullAccess={fullAccess}
        eligibleForTrial={snapshot.billing.eligibleForTrial}
        confirmingAccess={checkout === "success" && !fullAccess}
        minutes={placement?.minutesPerDay ?? 10}
        sampleTitle={sample?.title}
        onTrial={() => openPaywall("journey_overview")}
        onSample={() => {
          if (!sample) return;
          trackFunnelClient("funnel.journey_sample_clicked", { source: "journey_overview", legacy_allowance: legacy });
          start({ id: sample.standardId, title: sample.title, status: "current" });
        }}
        onLesson={() => { if (current) start({ id: current.standardId, title: current.title, status: "current" }); }}
        onReport={() => result ? setShowPlan(true) : router.push(`/assessment?child=${encodeURIComponent(child.id)}`)}
      />

      <div className={styles.layout}>
        <section id="lesson-path" className={styles.path} aria-label="Interactive reading journey">
          <div className={styles.gradeBar}>
            <button type="button" className={styles.textButton} aria-expanded={browseJourney} aria-controls="journey-browse" onClick={() => { finishReveal(); setBrowseJourney(value => !value); }}>
              {browseJourney ? "Close grade browser" : "Browse the full journey"} <Glyph name="chevron-down" size={16} />
            </button>
            <div id="journey-browse" hidden={!browseJourney}>
            <div role="tablist" aria-label="Lesson grade" className={styles.gradeTabs}>
              {grades.map((grade) => (
                <button
                  key={grade.grade}
                  id={`grade-tab-${BADGES[grade.grade]}`}
                  role="tab"
                  tabIndex={grade.grade === selectedGrade?.grade ? 0 : -1}
                  onKeyDown={(event) => {
                    const index = grades.indexOf(grade);
                    const next =
                      event.key === "ArrowRight"
                        ? (index + 1) % grades.length
                        : event.key === "ArrowLeft"
                          ? (index + grades.length - 1) % grades.length
                          : event.key === "Home"
                            ? 0
                            : event.key === "End"
                              ? grades.length - 1
                              : null;
                    if (next === null) return;
                    event.preventDefault();
                    finishReveal();
                    setGradeChoice(grades[next].grade);
                    document.getElementById(`grade-tab-${BADGES[grades[next].grade]}`)?.focus();
                  }}
                  aria-selected={grade.grade === selectedGrade?.grade}
                  aria-controls="journey-grade-panel"
                  onClick={() => { finishReveal(); setGradeChoice(grade.grade); }}
                >
                  {grade.grade}
                </button>
              ))}
            </div>
            </div>
            {selectedGrade && (
              <div
                id="journey-grade-panel"
                role="tabpanel"
                aria-labelledby={`grade-tab-${BADGES[selectedGrade.grade]}`}
                data-grade-summary={selectedGrade.grade}
              >
                <div className={styles.gradeSummary}>
                  <div>
                    <p>
                      {selectedGrade.grade} · Unit {unitIndexInGrade + 1} of{" "}
                      {selectedGrade.units.length}
                    </p>
                    <h2>{selectedUnit?.domainName}</h2>
                    <p>
                      {selectedLessons.length} lessons · {selectedDone} complete
                    </p>
                  </div>
                  <div className={styles.unitControls} hidden={!browseJourney}>
                    <button
                      type="button"
                      aria-label="Previous unit"
                      disabled={selectedUnitIndex <= 0}
                      onClick={() => chooseUnit(selectedUnitIndex - 1)}
                    >
                      <Glyph name="chevron-left" size={20} />
                    </button>
                    <label className="sr-only" htmlFor="journey-unit">
                      Choose a unit
                    </label>
                    <select
                      id="journey-unit"
                      value={selectedUnitId}
                      onChange={(event) => chooseUnit(Number(event.target.value.slice(1)) - 1)}
                    >
                      {selectedGrade.units.map((unit, index) => (
                        <option
                          key={unit.domainName}
                          value={`u${allUnits.findIndex((entry) => entry.unit === unit) + 1}`}
                        >
                          Unit {index + 1}: {unit.domainName}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      aria-label="Next unit"
                      disabled={selectedUnitIndex === allUnits.length - 1}
                      onClick={() => chooseUnit(selectedUnitIndex + 1)}
                    >
                      <Glyph name="chevron-right" size={20} />
                    </button>
                  </div>
                </div>
                <p className={styles.unitReason}>
                  {unitReason || SKILL_PURPOSE[selectedUnit?.domKey ?? ""]}
                </p>
                {copy && (
                  <button
                    type="button"
                    className={`${styles.textButton} ${styles.assessmentContext}`}
                    onClick={() => setShowPlan(true)}
                  >
                    See {name}’s Journey <Glyph name="arrow-right" size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
          <JourneyMap
            key={`${child.id}:${fullAccess}:${selectedUnitId}`}
            grades={grades}
            visibleGrade={selectedGrade?.grade}
            visibleUnit={selectedUnitId}
            revealSequence={revealSequence}
            pauseTour={showPlan || showPaywall}
            onRevealEnd={finishReveal}
            assessmentComplete={!!result}
            onAssessment={() => result ? setShowPlan(true) : router.push(`/assessment?child=${encodeURIComponent(child.id)}`)}
            kidName={name}
            streak={child.streak_days ?? 0}
            carrots={child.carrots ?? 0}
            equippedOutfitId={child.equipped_items?.outfit ?? null}
            openedChests={child.opened_chests ?? []}
            justCompletedId={
              selectedLessons.some((lesson) => lesson.id === justCompleted) ? justCompleted : null
            }
            autoFocusCurrent={false}
            quietStats={!fullAccess && !snapshot.practice.length && !snapshot.lessonProgress.length}
            onStart={start}
            onPremium={() => openPaywall()}
            onChestReward={(id, amount) => {
              void creditReward(id, amount);
            }}
            onTrophyReward={(amount) => {
              void creditReward("__trophy__", amount);
            }}
          />
          {selectedUnitIndex < allUnits.length - 1 && (
            <div className={styles.endGrade}>
              <button
                className={styles.textButton}
                onClick={() => chooseUnit(selectedUnitIndex + 1)}
              >
                Next unit: {allUnits[selectedUnitIndex + 1].unit.domainName}
                <Glyph name="arrow-right" size={18} />
              </button>
            </div>
          )}
        </section>
      </div>
      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        childId={child.id}
        childName={name}
        eligibleForTrial={snapshot.billing.eligibleForTrial}
        trigger="lesson"
      />
      {showPlan && (
        <JourneyPlanDialog
          onClose={() => {
            setShowPlan(false);
          }}
        >
          {planContent}
        </JourneyPlanDialog>
      )}
    </div>
  );
}
