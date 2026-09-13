"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Glyph } from "@/app/_components/Glyph";
import { FluentIcon } from "@/app/_components/FluentIcon";
import { PRICING } from "@/lib/billing-copy";
import type { PlannedJourneyLesson } from "@/lib/journey/planner-contract";
import { gradeName, lessonTitle, type JourneyFixture, type JourneyChapter } from "../fixtures";
import styles from "@/app/_components/journey/journey-v2.module.css";

export function JourneyDialog({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (returnTo?.isConnected) returnTo.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`${styles.dialog} ${wide ? styles.wideDialog : ""}`}
      onCancel={onClose}
      aria-label={title}
    >
      <header>
        <span>Readee · For the grown-up</span>
        <button autoFocus onClick={onClose} aria-label="Close panel">
          <Glyph name="x" size={22} />
        </button>
      </header>
      <h2>{title}</h2>
      {children}
    </dialog>
  );
}

export function JourneyInsightPanel({
  fixture,
  chapter,
  lesson,
  onClose,
}: {
  fixture: JourneyFixture;
  chapter: JourneyChapter;
  lesson?: PlannedJourneyLesson;
  onClose: () => void;
}) {
  return (
    <JourneyDialog title={`Why this journey for ${fixture.name}?`} onClose={onClose}>
      <p className={styles.panelIntro}>A starting point, a purpose, and a reason for each step.</p>
      <div className={styles.gradeComparison}>
        <div>
          <span>Enrolled in</span>
          <strong>{gradeName(fixture.enrollment)}</strong>
        </div>
        <Glyph name="arrow-right" size={22} />
        <div>
          <span>{fixture.provisional ? "Provisional start" : "Lesson starting point"}</span>
          <strong>{gradeName(fixture.entry)}</strong>
        </div>
      </div>
      <dl className={styles.insightList}>
        <div>
          <dt>Strong with</dt>
          <dd>{fixture.strength}</dd>
        </div>
        <div>
          <dt>Building next</dt>
          <dd>{fixture.focus}</dd>
        </div>
        <div>
          <dt>Working toward</dt>
          <dd>{fixture.goal}</dd>
        </div>
      </dl>
      <section className={styles.reasonSection}>
        <span>WHY THIS CHAPTER</span>
        <h3>{chapter.name}</h3>
        <p>{chapter.why}</p>
        <small>Presentation chapter · {chapter.unitId} lesson references</small>
      </section>
      {lesson && (
        <section className={styles.reasonSection}>
          <span>WHY THIS LESSON</span>
          <h3>{lessonTitle(lesson.lessonId)}</h3>
          <p>{lesson.parentExplanation}</p>
          <small>{lesson.standardIds.join(" · ")}</small>
          <details>
            <summary>See the reason and evidence source</summary>
            <p>{lesson.reason.category.replaceAll("-", " ")}</p>
            <p>
              {"evidence" in lesson.reason
                ? lesson.reason.evidence.map((r) => `${r.source}: ${r.locator}`).join("; ")
                : "curriculumSource" in lesson.reason
                  ? lesson.reason.curriculumSource.locator
                  : "Checkpoint association"}
            </p>
            <p>Rule: {lesson.ruleVersion}</p>
          </details>
        </section>
      )}
      <section className={styles.evidenceNote}>
        <strong>About this assessment sample</strong>
        <p>{fixture.evidence}</p>
        <small>
          Source: {fixture.definition.sourcePlacementId}. All readers, recommendations, and chapter
          names on this demo are presentation fixtures. Curriculum approval is pending. Completion
          is not mastery.
        </small>
      </section>
    </JourneyDialog>
  );
}

export function JourneyPaywall({
  fixture,
  completed,
  onClose,
  onPreviewAccess,
}: {
  fixture: JourneyFixture;
  completed: ReadonlySet<string>;
  onClose: () => void;
  onPreviewAccess: () => void;
}) {
  const [annual, setAnnual] = useState(false);
  const price = annual ? PRICING.annual : PRICING.monthly;
  const remaining = fixture.definition.lessons.filter((l) => !completed.has(l.nodeId)).length;
  return (
    <JourneyDialog title={`Unlock ${fixture.name}’s reading journey`} onClose={onClose} wide>
      <p className={styles.panelIntro}>Keep the next discovery within reach.</p>
      <div className={styles.offerLayout}>
        <div className={styles.offerRoute}>
          <span>THE PATH AHEAD</span>
          {fixture.chapters.map((chapter, i) => (
            <div key={chapter.id}>
              <span className={styles.chapterSeal}>
                <FluentIcon
                  name={i === 0 ? "books" : i === 1 ? "deciduous-tree" : "open-book"}
                  size={28}
                />
              </span>
              <div>
                <strong>{chapter.name}</strong>
                <p>{chapter.subtitle}</p>
              </div>
            </div>
          ))}
          <p>
            {remaining} {remaining === 1 ? "lesson" : "lessons"} still to explore across{" "}
            {fixture.chapters.length} chapters.
          </p>
        </div>
        <div className={styles.offerCopy}>
          <h3>A little reading. A new step forward.</h3>
          <ul>
            <li>
              <Glyph name="check" size={18} />
              Access every lesson on this proposed route
            </li>
            <li>
              <Glyph name="check" size={18} />
              Continue from the bunny’s last stop
            </li>
            <li>
              <Glyph name="check" size={18} />
              See the purpose behind each lesson
            </li>
          </ul>
          <fieldset className={styles.planChoice}>
            <legend>Choose a plan</legend>
            <label>
              <input type="radio" name="plan" checked={!annual} onChange={() => setAnnual(false)} />
              Monthly
            </label>
            <label>
              <input type="radio" name="plan" checked={annual} onChange={() => setAnnual(true)} />
              Annual
            </label>
          </fieldset>
          <p className={styles.price}>
            <strong>{price.label}</strong>
            <span>{price.cadence}</span>
          </p>
          <p className={styles.trial}>{PRICING.trialDays} days free. Cancel anytime.</p>
          <button className={styles.primary} onClick={onPreviewAccess}>
            Preview {PRICING.trialDays}-day trial
            <Glyph name="arrow-right" size={18} />
          </button>
          <small className={styles.demoNote}>
            Design preview only. This changes demo access; no checkout opens and no subscription is
            created.
          </small>
        </div>
      </div>
    </JourneyDialog>
  );
}
