"use client";
import { useEffect, useState } from "react";
import { modelCueIssue, type ModelCueTrack } from "@/lib/lesson-engine/delivery/model-cues";
import PackageStudio, {
  type PackageAudioAssets,
} from "@/app/components/lesson-v2/delivery/PackageStudio";
import GardenMazeGame from "@/app/components/lesson-v2/delivery/GardenMazeGame";
import {
  beatAsset,
  beatLesson,
  beatWelcome,
  beatCompletion,
  beatLearned,
  beatPractice,
  beatPracticeCount,
  beatPracticeDone,
  beatPerfectDone,
  beatWarmup,
  beatAudioModels,
  beatSpeech,
} from "@/app/data/lesson-packages/syllable-beats";
import "./pip-studio.css";
import "./beat-studio.css";
type Track = ModelCueTrack;
type Playback = { currentTime: () => number; speaking: boolean; caption: string };
function BeatStage({
  props,
  playback,
  track,
}: {
  props: Record<string, string | number | boolean>;
  playback: Playback;
  track?: Track;
}) {
  const [hit, setHit] = useState(-1),
    [heard, setHeard] = useState(0),
    [sounding, setSounding] = useState(-1);
  const active = playback.caption === props.modelScript && playback.speaking;
  useEffect(() => {
    if (!active || !track) {
      const reset=requestAnimationFrame(()=>{setHit(-1);setSounding(-1);});
      return ()=>cancelAnimationFrame(reset);
    }
    let frame = 0;
    function tick() {
      const t = playback.currentTime();
      let h = -1,
        n = 0,
        spoken = -1;
      track!.syllables.forEach((s, i) => {
        if (t >= s.start) n = i + 1;
        if (t >= s.start && t < s.end) spoken = i;
        if (t >= s.start && t < Math.min(s.end, s.start + 0.17)) h = i;
      });
      setHit((x) => (x === h ? x : h));
      setSounding((x) => (x === spoken ? x : spoken));
      setHeard((x) => (x === n ? x : n));
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, track, playback.currentTime, props.modelScript, props.activation]);
  return (
    <div
      className={`beat-stage ${props.guided ? "beat-guided" : ""}`}
      data-beats-heard={heard}
      data-beat-active={hit}
      data-syllable-active={sounding}
    >
      <img className="beat-word-picture" src={String(props.image)} alt={String(props.alt)} />
      <div className="beat-instrument">
        <img
          src={beatAsset("drum.svg")}
          className={hit >= 0 ? "beat-drum is-tapped" : "beat-drum"}
          alt=""
        />
        {!props.guided && (
          <div className="beat-counts" aria-label={`${props.count} syllables`}>
            {Array.from({ length: Number(props.count) }, (_, i) => (
              <span
                key={i}
                className={`${i < heard ? "is-heard" : ""} ${i === sounding ? "is-tapped" : ""}`}
                aria-hidden
              >
                {i + 1}
              </span>
            ))}
          </div>
        )}
      </div>
      <strong className={sounding >= 0 ? "le-word-active" : ""}>{props.word}</strong>
      {props.guided ? (
        <p className="beat-word-caption">Listen and clap along.</p>
      ) : (
        <p className="beat-word-caption">
          One word · {Number(props.count) === 1 ? "one syllable" : `${props.count} syllables`}
        </p>
      )}
    </div>
  );
}
export default function BeatStudio({
  onExit,
  warmupOnly = false,
}: {
  onExit: () => void;
  warmupOnly?: boolean;
}) {
  const speechKey = beatSpeech.join("\u001f");
  const [bundle, setBundle] = useState<{
      tracks: Record<string, Track>;
      assets: PackageAudioAssets;
      speechKey: string;
    } | null>(null),
    [error, setError] = useState(false),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all(
      ["beat-cues.json", "audio-v2.json", "word-timings.json"].map(async (name) => {
        const r = await fetch(beatAsset(name), { signal: controller.signal, cache: "no-store" });
        if (!r.ok) throw Error("Missing model");
        return r.json();
      }),
    )
      .then(([cues, manifest, timings]) => {
        for (const m of beatAudioModels) {
          const t = cues.tracks?.[m.script];
          if (modelCueIssue(m, t, manifest, timings)) throw Error("Stale model");
        }
        if (beatSpeech.some((script) => !manifest[script])) throw Error("Incomplete lesson audio");
        setBundle({ tracks: cues.tracks, assets: { manifest, timings }, speechKey });
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [retry, speechKey]);
  if (!bundle || bundle.speechKey !== speechKey)
    return (
      <main className="pip-studio beat-studio beat-loading">
        <h1>Beat Buddy’s Music Clearing</h1>
        <p role="status">
          {error
            ? "The lesson audio could not load. Try again in a moment."
            : "Getting the word beats ready…"}
        </p>
        {error && <button onClick={() => {setError(false);setRetry((x) => x + 1);}}>Try again</button>}
        <button onClick={onExit}>Back</button>
      </main>
    );
  return (
    <div className="pip-studio beat-studio">
      <PackageStudio
        lesson={beatLesson}
        suppliedAssets={bundle.assets}
        flowId="syllable-beats-v1"
        assetRoot="/lesson-studio/syllable-beats"
        welcome={beatWelcome}
        completion={beatCompletion}
        learned={beatLearned}
        practice={beatPractice}
        practiceCount={beatPracticeCount}
        practiceVersion="four-bands-v1"
        practiceTitle="Your turn with word beats"
        practiceTopic="syllable"
        practiceDone={beatPracticeDone}
        perfectDone={beatPerfectDone}
        onExit={onExit}
        warmupOnly={warmupOnly}
        cover={
          <img
            className="le-cover pip-opening-art"
            src={beatAsset("opening.webp")}
            alt="Beat Buddy beside a drum in a painted jungle music clearing"
          />
        }
        ambience={{
          src: beatAsset("rainforest.mp3"),
          label: "Rainforest sounds",
          volume: 0.3,
          duckVolume: 0.065,
        }}
        renderVisual={(scene, props, playback) =>
          scene.visual?.id === "beat-stage" ? (
            <BeatStage
              props={props}
              playback={playback}
              track={bundle.tracks[String(props.modelScript)]}
            />
          ) : (
            <img className="beat-scene" src={String(props.image)} alt={String(props.alt || "")} />
          )
        }
        renderWarmup={(manifest, done) => (
          <GardenMazeGame
            config={beatWarmup}
            manifest={manifest}
            onComplete={done}
            renderActor={() => (
              <image
                href={beatAsset("buddy-actor.webp")}
                width="190"
                height="155"
                preserveAspectRatio="xMidYMid meet"
              />
            )}
          />
        )}
      />
    </div>
  );
}
