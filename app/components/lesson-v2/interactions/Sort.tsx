"use client";

import { useMemo, useRef, useState } from "react";
import type { SortDef } from "@/lib/lesson-engine/types";
import { playYes, playTryAgain, playUrl, speak, playPraise, sfxCorrect, sfxWrong } from "@/lib/lesson-engine/cues";
import { seededShuffle } from "@/lib/lesson-engine/shuffle";
import LessonImage from "../LessonImage";

/**
 * `sort` — classify items into buckets. Subject-agnostic: short/long vowels
 * today, odd/even numbers or capitalize/expense later — same renderer.
 * Tap-to-place (tap item → tap bucket) + drag-and-drop, one logic.
 */
export default function Sort({
  data,
  onSolved,
  onWrong,
  onItemCorrect,
}: {
  data: SortDef;
  onSolved: (meta?: { attempts?: number; correct?: boolean }) => void;
  onWrong?: () => void;
  onItemCorrect?: () => void;
}) {
  const [salt] = useState(() => Math.random().toString(36).slice(2));
  const initial = useMemo(
    () => seededShuffle(data.items.map((it) => it.label), data.items.map((it) => it.label).join("|") + salt),
    [data.items, salt],
  );
  const bucketOf = useMemo(() => {
    const m: Record<string, string> = {};
    for (const it of data.items) m[it.label] = it.bucket;
    return m;
  }, [data.items]);
  const audioOf = useMemo(() => {
    const m: Record<string, string | undefined> = {};
    for (const it of data.items) m[it.label] = it.audio;
    return m;
  }, [data.items]);
  const imageOf = useMemo(() => {
    const m: Record<string, string | undefined> = {};
    for (const it of data.items) m[it.label] = it.image;
    return m;
  }, [data.items]);

  const [pool, setPool] = useState<string[]>(initial);
  const [placed, setPlaced] = useState<Record<string, string[]>>(
    () => Object.fromEntries(data.buckets.map((b) => [b, []])),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [wrongCoach, setWrongCoach] = useState(false);
  const [flashBucket, setFlashBucket] = useState<string | null>(null);
  const solvedRef = useRef(false);
  const chainRef = useRef(0); // rapid placements: only the LATEST chain may speak

  function place(label: string, bucket: string, saidItem = false) {
    if (!label || solvedRef.current) return;
    const wordClip = audioOf[label];
    const bucketClip = data.bucketAudio?.[bucket];
    const correct = bucketOf[label] === bucket;
    const isFinal = correct && pool.length - 1 === 0;
    // THE CHAIN: (item if not already heard)… bucket… verdict — all on clip-ends,
    // NEVER timers. Final praise's END releases onSolved so nothing gets cut.
    const solveOnce = (() => {
      let fired = false;
      return () => {
        if (fired) return;
        fired = true;
        onSolved({ attempts: attempts + 1 });
      };
    })();
    const token = ++chainRef.current;
    const live = () => token === chainRef.current; // a newer placement mutes this chain
    const verdict = () => {
      if (!live() && !isFinal) return;
      if (correct) {
        sfxCorrect();
        window.setTimeout(() => {
          if (isFinal) playPraise(solveOnce);
          else if (live()) playYes();
        }, 240);
      } else {
        sfxWrong();
        window.setTimeout(() => { if (live()) playTryAgain(); }, 300);
      }
    };
    const sayBucket = () => {
      if (!live()) return;
      if (bucketClip) playUrl(bucketClip, () => window.setTimeout(verdict, 280));
      else verdict();
    };
    // Tap-to-place already read the word on selection — don't say it twice.
    if (!saidItem && wordClip) playUrl(wordClip, () => window.setTimeout(sayBucket, 280));
    else sayBucket();

    if (correct) {
      onItemCorrect?.();
      setPool((p) => p.filter((w) => w !== label));
      setPlaced((pl) => ({ ...pl, [bucket]: [...pl[bucket], label] }));
      setSelected(null);
      setWrongCoach(false);
      setFlashBucket(null);
      if (isFinal) {
        solvedRef.current = true; // onSolved fires when the praise clip ENDS (chain above)
        window.setTimeout(solveOnce, 4500); // ...or here, if any link in the chain dies
      }
    } else {
      onWrong?.();
      setAttempts((a) => a + 1);
      setWrongCoach(true);
      setSelected(null);
      setFlashBucket(bucket);
      window.setTimeout(() => setFlashBucket(null), 500);
    }
  }

  function hear(label: string) {
    const clip = audioOf[label];
    if (clip) playUrl(clip);
    else speak(label);
  }

  return (
    <div className="gb-sort">
      <div className="gb-pool">
        {pool.map((w) => (
          <button
            key={w}
            className={`gb-item${selected === w ? " sel" : ""}`}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", w)}
            onClick={() => {
              setSelected((s) => (s === w ? null : w));
              hear(w);
            }}
            aria-label={`Item ${w}`}
            style={imageOf[w] ? { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 } : undefined}
          >
            {imageOf[w] && <LessonImage src={imageOf[w] as string} width={96} height={96} />}
            {w}
          </button>
        ))}
        {pool.length === 0 && <div className="gb-hint gb-ok">All sorted!</div>}
      </div>

      <div className="gb-buckets">
        {data.buckets.map((b) => (
          <div
            key={b}
            className={`gb-bucket${flashBucket === b ? " bad" : ""}`}
            onClick={() => (selected ? place(selected, b, true) : data.bucketAudio?.[b] ? playUrl(data.bucketAudio[b]) : speak(b))}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              place(e.dataTransfer.getData("text/plain"), b);
            }}
          >
            <div className="gb-bucket-label">{b}</div>
            <div className="gb-bucket-items">
              {placed[b].map((w) => (
                <span key={w} className="gb-item done">
                  {w}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected && <div className="gb-hint">Now tap the bucket for “{selected}”.</div>}
      {wrongCoach && data.coachWrong && <div className="gb-coach">{data.coachWrong}</div>}
    </div>
  );
}
