"use client";

import type { RevealCopy } from "@/app/(protected)/placement/_components/reveal/copy";
import { PRICING } from "@/lib/billing-copy";
import { Glyph } from "@/app/_components/Glyph";
import styles from "./journey.module.css";

type Props = {
  name: string;
  copy: RevealCopy | null;
  firstGrade?: string;
  focusTitle?: string;
  purpose?: string;
  currentTitle?: string;
  fullAccess: boolean;
  eligibleForTrial: boolean;
  confirmingAccess: boolean;
  minutes: number;
  sampleTitle?: string;
  onTrial: () => void;
  onSample: () => void;
  onLesson: () => void;
  onReport: () => void;
};

export default function JourneyOverview(props: Props) {
  const { name, copy, fullAccess, confirmingAccess } = props;
  return (
    <section id="journey-introduction" className={styles.overview} aria-label="Your reader’s plan" data-journey-overview>
      <div className={styles.planReason}>
        <p className={styles.eyebrow}>{copy ? "From the reading assessment" : "A place to begin"}</p>
        <h2>{copy ? `${name}’s reading plan` : `Let’s find ${name}’s starting point.`}</h2>
        {copy ? <>
          <dl className={styles.observations}>
            {copy.skills.slice(0, 2).map(skill => <div key={skill.id}>
              <dt>{skill.label}</dt>
              <dd>{skill.value.charAt(0).toUpperCase() + skill.value.slice(1)}</dd>
            </div>)}
          </dl>
          <div className={styles.nextFocus}>
            <span aria-hidden="true"><Glyph name="arrow-right" size={20} /></span>
            <div><h3>First: {props.focusTitle || "Guided reading"}</h3>
              <p>{props.purpose}</p>
              <small>{props.firstGrade}{copy.placement.provisional ? " · A guided starting point to check in lessons" : " · First lesson"}</small>
            </div>
          </div>
          <button type="button" className={styles.textButton} onClick={props.onReport}>Why these lessons? <Glyph name="arrow-right" size={16} /></button>
        </> : <>
          <p>A reading assessment helps us choose where to begin. The lesson map is here to explore while you get ready.</p>
          <button type="button" onClick={props.onReport} className={styles.textButton}>Find the starting point <Glyph name="arrow-right" size={16} /></button>
        </>}

      </div>
      <aside className={styles.planOffer} aria-label={fullAccess ? "Continue the reading plan" : "Readee+ membership"} data-journey-main-offer>
        <p className={styles.eyebrow}>{fullAccess ? "Included with Readee+" : confirmingAccess ? "Your plan is saved" : "Readee+"}</p>
        <h2>{fullAccess ? "Ready for the next lesson?" : confirmingAccess ? "Checking your access" : `Start ${name}’s plan.`}</h2>
        <p>{confirmingAccess ? "We’re checking your checkout status. There’s no need to enter your card again." : `Guided lessons and reading practice with Luna, about ${props.minutes} minutes at a time.`}</p>
        {!confirmingAccess && <>
          <ul>
            <li><Glyph name="check" size={16} /> Every lesson in this journey</li>
            <li><Glyph name="check" size={16} /> Saved progress on the lesson map</li>
          </ul>
          {fullAccess ? props.currentTitle ? <>
            <button type="button" className={styles.primary} onClick={props.onLesson}>Continue reading <Glyph name="arrow-right" size={18} /></button>
            <small>Next: {props.currentTitle}</small>
          </> : <p>You’ve completed this journey. Choose a lesson on the map to read again.</p> : <>
            <button type="button" className={styles.primary} onClick={props.onTrial} data-journey-primary-trial>
              {props.eligibleForTrial ? `Start ${PRICING.trialDays}-day free trial` : "Continue with Readee+"}
              <Glyph name="arrow-right" size={18} />
            </button>
            <small>{props.eligibleForTrial ? `$0 today, then ${PRICING.monthly.label} on the monthly plan. Credit card required. Cancel before the trial ends to avoid a charge.` : `${PRICING.monthly.label} on the monthly plan. Annual membership is also available.`}</small>
            {props.sampleTitle && <button type="button" className={styles.previewLesson} onClick={props.onSample}>Preview a lesson first <Glyph name="play" size={14} /></button>}
          </>}
        </>}
      </aside>
    </section>
  );
}
