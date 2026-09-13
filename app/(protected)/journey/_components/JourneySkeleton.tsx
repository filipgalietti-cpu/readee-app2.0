import JourneyLandscape from '@/app/_components/journey/JourneyLandscape';
import { mapGeometry } from '@/app/_components/journey/geometry';
import styles from '@/app/_components/journey/journey-v2.module.css';

/** Reserves the same map frame while ownership, progress and billing resolve together. */
export default function JourneySkeleton() {
  return <div className={`${styles.experience} ${styles.liveExperience}`} role="status" aria-label="Opening your reading journey" data-journey-loading>
    <header className={styles.header}><div className={styles.readerHeading}><h1>Your reading journey</h1><span>Opening your saved lesson path…</span></div></header>
    <div className={styles.main} aria-hidden="true"><div className={styles.adventure}><div className={styles.worldShell}><div className={styles.loadingLandscape}><JourneyLandscape geometry={mapGeometry(3, false)} theme="garden" /></div></div></div></div>
  </div>;
}
