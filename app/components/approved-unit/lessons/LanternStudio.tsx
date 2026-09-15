"use client";
import PackageStudio from "@/app/components/lesson-v2/delivery/PackageStudio";
import StoneMatchGame from "@/app/components/lesson-v2/delivery/StoneMatchGame";
import {
  lanternAsset,
  lanternLesson,
  lanternWelcome,
  lanternCompletion,
  lanternLearned,
  lanternPractice,
  lanternPracticeCount,
  lanternPracticeDone,
  lanternPerfectDone,
  lanternWarmup,
} from "@/app/data/lesson-packages/letter-pairs";
import "./pip-studio.css";
import "./lantern-studio.css";
import LanternWorld from "./LanternWorld";
function TileBack() {
  return (
    <svg viewBox="0 0 140 116" aria-hidden="true">
      <rect
        x="8"
        y="8"
        width="124"
        height="100"
        rx="20"
        fill="#faf2d8"
        stroke="#70603f"
        strokeWidth="4"
      />
      <path
        d="M53 34q17-24 34 0M48 38h44v42H48zM48 51h44M48 67h44M62 38v42m16-42v42"
        fill="none"
        stroke="#9e7e42"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M57 85h26" stroke="#70603f" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
export default function LanternStudio({
  onExit,
  warmupOnly = false,
}: {
  onExit: () => void;
  warmupOnly?: boolean;
}) {
  return (
    <div className="pip-studio lantern-studio">
      <PackageStudio
        lesson={lanternLesson}
        flowId="letter-pairs-v1"
        assetRoot="/lesson-studio/letter-pairs"
        welcome={lanternWelcome}
        completion={lanternCompletion}
        learned={lanternLearned}
        practice={lanternPractice}
        practiceCount={lanternPracticeCount}
        practiceVersion="four-bands-v1"
        practiceTitle="Your turn with letter pairs"
        practiceTopic="letter"
        practiceDone={lanternPracticeDone}
        perfectDone={lanternPerfectDone}
        onExit={onExit}
        warmupOnly={warmupOnly}
        cover={
          <img
            className="le-cover pip-opening-art"
            src={lanternAsset("opening.webp")}
            alt="A painted garden at dusk with warm paper lanterns above a winding path"
          />
        }
        ambience={{
          src: "/lesson-studio/three-houses/woodland-ambience.mp3",
          label: "Garden birds and breeze",
          volume: 0.3,
          duckVolume: 0.065,
        }}
        renderVisual={(scene, props) => <LanternWorld props={{ ...props, largeLetters: scene.id.startsWith("meet-") || scene.id.startsWith("guided-") }} />}
        renderWarmup={(manifest, done) => (
          <StoneMatchGame
            config={lanternWarmup}
            manifest={manifest}
            onComplete={done}
            renderBack={TileBack}
            renderPicture={(i) => <img src={lanternWarmup.pictures[i]} alt="" />}
          />
        )}
      />
    </div>
  );
}
