"use client";
import PackageStudio from "@/app/components/lesson-v2/delivery/PackageStudio";
import GardenMazeGame from "@/app/components/lesson-v2/delivery/GardenMazeGame";
import {
  positionLayout,
  positionViewBox,
  type PositionAnchor,
  type PositionRelation,
} from "@/lib/lesson-engine/delivery/position-layout";
import {
  acornAsset,
  acornLesson,
  acornWelcome,
  acornCompletion,
  acornLearned,
  acornPractice,
  acornPracticeCount,
  acornPracticeDone,
  acornPerfectDone,
  acornWarmup,
} from "@/app/data/lesson-packages/big-kid-words";
import ratios from "@/app/data/lesson-packages/big-kid-words-art-ratios.json";
import "./pip-studio.css";
import "./acorn-studio.css";
function PositionWorld({ props }: { props: Record<string, string | number | boolean> }) {
  const anchor = String(props.anchor) as PositionAnchor,
    position = String(props.position) as PositionRelation;
  const layout = positionLayout(anchor, position, ratios[anchor].ratio, ratios[anchor].contact),
    object = String(props.object);
  const moving = (
    <image
      key="moving-object"
      className="acorn-moving-object"
      href={acornAsset(object + "-object.webp")}
      {...layout.object}
      preserveAspectRatio="xMidYMax meet"
    />
  );
  return (
    <div className="acorn-world-stage">
      <figure className="acorn-guide"><img src={acornAsset("squeaky-object.webp")} alt="Squeaky the squirrel" /></figure>
    <svg
      className="acorn-position-world"
      viewBox={positionViewBox(
        (["on", "under", "next to"] as const).map((p) =>
          positionLayout(anchor, p, ratios[anchor].ratio, ratios[anchor].contact),
        ),
      )}
      role="img"
      aria-label={String(props.alt)}
      data-position={position}
    >
      {layout.behind && moving}
      <image
        key="anchor"
        className="acorn-anchor"
        href={acornAsset(anchor + "-anchor.webp")}
        {...layout.anchor}
        preserveAspectRatio="xMidYMax meet"
      />
      {!layout.behind && moving}
    </svg>
    </div>
  );
}
export default function AcornStudio({
  onExit,
  warmupOnly = false,
}: {
  onExit: () => void;
  warmupOnly?: boolean;
}) {
  return (
    <div className="pip-studio acorn-studio">
      <PackageStudio
        lesson={acornLesson}
        flowId="big-kid-words-v1"
        assetRoot="/lesson-studio/big-kid-words"
        welcome={acornWelcome}
        completion={acornCompletion}
        learned={acornLearned}
        practice={acornPractice}
        practiceCount={acornPracticeCount}
        practiceVersion="four-bands-v1"
        practiceTitle="Your turn with hiding places"
        practiceTopic="word"
        practiceDone={acornPracticeDone}
        perfectDone={acornPerfectDone}
        onExit={onExit}
        warmupOnly={warmupOnly}
        cover={
          <img
            className="le-cover pip-opening-art"
            src={acornAsset("opening.webp")}
            alt="Squeaky explores a painted woodland clearing beside his basket"
          />
        }
        ambience={{
          src: acornAsset("woodland.mp3"),
          label: "Woodland sounds",
          volume: 0.3,
          duckVolume: 0.06,
        }}
        renderVisual={(scene, props) =>
          scene.visual?.id === "position-world" ? (
            <PositionWorld props={props} />
          ) : (
            <img className="acorn-scene" src={String(props.image)} alt={String(props.alt || "")} />
          )
        }
        renderWarmup={(manifest, done) => (
          <GardenMazeGame
            config={acornWarmup}
            manifest={manifest}
            onComplete={done}
            renderActor={() => (
              <svg viewBox="0 0 190 155">
                <image
                  href={acornAsset("squeaky-object.webp")}
                  width="190"
                  height="155"
                  preserveAspectRatio="xMidYMid meet"
                />
              </svg>
            )}
          />
        )}
      />
    </div>
  );
}
