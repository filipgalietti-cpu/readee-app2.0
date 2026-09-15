"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { LessonDef, SceneDef } from "@/lib/lesson-engine/types";
import type { PracticeQuestion } from "@/lib/lesson-engine/production/practice";
import type { NarrationTimings } from "@/lib/lesson-engine/delivery/word-timings";
import {useUnitRuntime} from "@/lib/approved-unit/runtime";
import { localAttemptStore } from "@/lib/lesson-engine/delivery/store";
import { practiceCarrots, practiceStreak } from "@/lib/lesson-engine/delivery/evidence";
import { validateCoachedLesson } from "@/lib/lesson-engine/delivery/validate";
import CoachedFlowRunner from "./CoachedFlowRunner";
import AdaptivePractice from "./AdaptivePractice";
import { previewSpeechToken, previewEvaluateResponse } from "./preview-services";

export type PackageAudioAssets = { manifest: Record<string, string>; timings: NarrationTimings };

/** A package supplies content and scene art; this wrapper reuses the existing
 * lesson/practice runners and owns only preview asset loading and handoff. */
export default function PackageStudio({
  lesson,
  flowId,
  assetRoot,
  welcome,
  completion,
  learned,
  practice,
  practiceDone,
  perfectDone,
  onExit,
  warmupOnly = false,
  practiceVersion,
  practiceCount = practice.length,
  practiceTitle = "Try a new story",
  practiceTopic = "story",
  practiceStandards,
  extraManifestUrls = [],
  suppliedAssets,
  renderWarmup,
  renderVisual,
  cover,
  ambience,
}: {
  lesson: LessonDef;
  flowId: string;
  assetRoot: string;
  welcome: string;
  completion: string;
  learned: string[];
  practice: PracticeQuestion[];
  practiceDone: string;
  perfectDone: string;
  onExit: () => void;
  warmupOnly?: boolean;
  practiceVersion?: string;
  practiceCount?: number;
  practiceTitle?: string;
  practiceTopic?: string;
  /** Capstones retain each comprehension item’s actual skill, separate from participation. */
  practiceStandards?: string[];
  extraManifestUrls?: readonly string[];
  /** A validated package can share the exact snapshot used for its model cues. */
  suppliedAssets?: PackageAudioAssets;
  renderWarmup: (manifest: Record<string, string>, done: (carrots: number) => void) => ReactNode;
  renderVisual: (scene: SceneDef, props: Record<string, string | number | boolean>, playback: { currentTime: () => number; speaking: boolean; caption: string }) => ReactNode;
  cover: ReactNode;
  ambience: { src: string; label: string; volume?: number; duckVolume?: number };
}) {
  const runtime=useUnitRuntime();
  const store=runtime?.store ?? localAttemptStore;
  const speechToken=runtime?.speechToken ?? previewSpeechToken;
  const evaluateResponse=runtime?.evaluateResponse ?? previewEvaluateResponse;
  const [loadedAssets, setAssets] = useState<{
      manifest: Record<string, string>;
      timings: NarrationTimings;
    } | null>(null),
    [error, setError] = useState(false),
    [inPractice, setInPractice] = useState(false);
  const [carry, setCarry] = useState({
    carrots: 0,
    streak: 0,
    source: undefined as string | undefined,
  });
  const assets = suppliedAssets ?? loadedAssets;
  const phases = useMemo(() => [lesson], [lesson]);
  const extraManifestKey = JSON.stringify(extraManifestUrls);
  useEffect(() => {
    if (suppliedAssets) return;
    const ac = new AbortController();
    Promise.all(
      [`${assetRoot}/audio-v2.json`, `${assetRoot}/word-timings.json`, ...JSON.parse(extraManifestKey)].map(async (url) => {
        const r = await fetch(url, { signal: ac.signal, cache: "no-store" });
        if (!r.ok) throw Error("Asset unavailable");
        return r.json();
      }),
    )
      .then(([manifest, timings, ...extras]) => setAssets({ manifest: Object.assign({}, ...extras, manifest), timings }))
      .catch((e) => {
        if (e.name !== "AbortError") setError(true);
      });
    return () => ac.abort();
  }, [assetRoot, extraManifestKey, suppliedAssets]);
  if (!assets)
    return (
      <main className="le-frame">
        <p>
          {error
            ? "The lesson’s audio could not load. Return and try again."
            : "Opening your story…"}
        </p>
        <button onClick={onExit}>Back to unit</button>
      </main>
    );
  if (warmupOnly) return renderWarmup(assets.manifest, () => onExit());
  const errors = validateCoachedLesson(lesson);
  if (errors.length) return <pre>{errors.join("\n")}</pre>;
  if (inPractice)
    return (
      <div className="pip-practice">
        <AdaptivePractice
          id={`${flowId}-practice${practiceVersion ? `-${practiceVersion}` : ""}`}
          speechToken={speechToken}
          evaluateResponse={evaluateResponse}
          renderVisual={(scene,props)=>renderVisual(scene,props,{currentTime:()=>0,speaking:false,caption:""})}
          title={practiceTitle}
          questionTopic={practiceTopic}
          pool={practice}
          standards={practiceStandards ?? [lesson.standard]}
          maxItems={practiceCount}
          manifest={assets.manifest}
          timings={assets.timings}
          completion={practiceDone}
          perfectCompletion={perfectDone}
          learned={learned}
          carryCarrots={carry.carrots}
          carryStreak={carry.streak}
          sourceAttemptId={carry.source}
          onExit={onExit}
          visiblePassage
        />
      </div>
    );
  return (
    <CoachedFlowRunner
      id={flowId}
      title={lesson.title}
      phases={phases}
      welcome={welcome}
      completion={completion}
      completionTitle="Ready to practice!"
      learned={learned}
      manifest={assets.manifest}
      timings={assets.timings}
      store={store}
      speechToken={speechToken}
      evaluateResponse={evaluateResponse}
      cover={cover}
      openingSound={ambience}
      renderVisual={renderVisual}
      renderWarmup={(done) => renderWarmup(assets.manifest, done)}
      onContinue={() => {
        const saved = store.load(flowId);
        setCarry({
          carrots: saved ? practiceCarrots(saved.evidence) + (saved.warmupAwarded ?? 0) + 5 : 0,
          streak: saved ? practiceStreak(saved.evidence) : 0,
          source: saved?.sessionId,
        });
        setInPractice(true);
      }}
    />
  );
}
