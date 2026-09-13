'use client';

import { audioManager } from "@/lib/audio/audio-manager";
import { useState } from 'react';
import Link from 'next/link';
import { Glyph } from '@/app/_components/Glyph';
import { GradeLadder } from '@/app/(protected)/placement/_components/reveal/GradeLadder';
import { buildRevealCopy } from '@/app/(protected)/placement/_components/reveal/copy';
import type { PlacementResult } from '@/lib/placement/types';
import type { JourneyFixture } from '../fixtures';
import JourneyExperience from '../_components/JourneyExperience';
import styles from './preview.module.css';

export default function AssessmentJourneyPreview({ result, journey }: { result: PlacementResult; journey: JourneyFixture }) {
  const [building, setBuilding] = useState(false);
  const copy = buildRevealCopy(result);
  if (building) return <JourneyExperience initialFixture={journey} initialPhase="building" />;
  return (
    <main className={styles.preview} data-assessment-journey-mock>
      <header className={styles.header}>
        <Link href="/demo/journey-v2" aria-label="Readee Journey demo">readee<span>®</span></Link>
        <span>Local preview · sample assessment · no account needed</span>
      </header>
      <div className={styles.report}>
        <div className={styles.heading}>
          <span className={styles.eyebrow}><Glyph name="check" size={17} /> ASSESSMENT COMPLETE</span>
          <h1>{result.childName}’s reading starting point</h1>
          <p>Here’s what we learned, and where the next chapter begins.</p>
        </div>
        <section className={styles.placement} aria-label="Assessment placement">
          <div className={styles.placementHeading}>
            <div><span>Enrolled in</span><strong>{copy.enrolledLabel}</strong></div>
            <div><span>Reading starting point</span><strong>Grade {result.decision.placedBand}</strong></div>
          </div>
          <div className="@container">
            <GradeLadder enrolled={result.enrolled} placed={result.decision.placedBand} childName={result.childName} bandName={copy.placement.band} categoryText={copy.placement.categoryText} animate instant />
          </div>
        </section>
        <section className={styles.skills} aria-label="What the assessment showed">
          {copy.skills.map((skill) => (
            <article key={skill.id}>
              <Glyph name={skill.icon} size={23} />
              <h2>{skill.label}</h2>
              <strong>{skill.value}</strong>
              <p>{skill.meaning}</p>
            </article>
          ))}
        </section>
        <section className={styles.next}>
          <div>
            <span className={styles.eyebrow}>THE NEXT CHAPTER</span>
            <h2>A reading journey for {result.childName}.</h2>
            <p>Start with words and sentences, then keep building toward longer stories.</p>
          </div>
          <button onClick={() => { audioManager?.resumeContextSync(); setBuilding(true); }}>Build {result.childName}’s journey <Glyph name="arrow-right" size={20} /></button>
        </section>
        <p className={styles.note}>Synthetic results, using Readee’s existing assessment scoring. The map demonstrates a proposed lesson sequence for design review.</p>
      </div>
    </main>
  );
}
