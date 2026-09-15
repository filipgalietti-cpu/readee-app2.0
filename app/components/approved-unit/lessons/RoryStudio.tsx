"use client";
import RoryRhymeMachine from "./RoryRhymeMachine";
import PackageStudio from "@/app/components/lesson-v2/delivery/PackageStudio";
import ClueHunt from "@/app/components/lesson-v2/delivery/ClueHunt";
import {
  roryAsset,
  roryLesson,
  roryWelcome,
  roryCompletion,
  roryLearned,
  roryPractice,
  roryPracticeCount,
  roryPracticeDone,
  roryPerfectDone,
  roryWarmup,
} from "@/app/data/lesson-packages/rhyme-time";
import "./pip-studio.css";
import "./rory-studio.css";
/** Whole, deterministic shapes. Motion comes from the proven collector physics. */
export function WorkshopPart({ kind }: { kind: string }) {
  return (
    <svg viewBox="0 0 100 110" aria-hidden="true">
      <ellipse cx="50" cy="86" rx="32" ry="8" fill="#382f27" opacity=".15" />
      {kind === "gear" ? (
        <g fill="#deb564" stroke="#614c32" strokeWidth="3">
          <path d="M40 14h20l2 12 9 5 12-4 10 18-10 8v10l10 8-10 18-12-4-9 5-2 12H40l-2-12-9-5-12 4L7 71l10-8V53L7 45l10-18 12 4 9-5z" />
          <circle cx="50" cy="58" r="18" fill="#f2e6d0" />
          <circle cx="50" cy="58" r="10" fill="#776347" />
        </g>
      ) : kind === "bolt" ? (
        <g fill="#8aabb9" stroke="#3b5968" strokeWidth="3" strokeLinejoin="round">
          <path d="M38 33h24v58H38z" />
          <path d="M27 13h46v23H27z" />
          <path d="m38 47 24-6m-24 18 24-6m-24 18 24-6m-24 18 24-6" fill="none" />
        </g>
      ) : (
        <g fill="#b4b7a5" stroke="#4d594e" strokeWidth="4">
          <path d="m50 17 35 20v40L50 97 15 77V37z" />
          <circle cx="50" cy="57" r="20" fill="#f2e6d0" />
          <circle cx="50" cy="57" r="13" fill="#776347" />
        </g>
      )}
    </svg>
  );
}
function RhymeWorld({ props }: { props: Record<string, string | number | boolean> }) {
  if (props.target) return <RoryRhymeMachine target={String(props.target)} state={String(props.responseState || "ready")} heard={String(props.responseText || "")} goal={Number(props.responseGoal||1)} words={String(props.responseWords||"").split("|").filter(Boolean)} />;
  const words = String(props.words || "")
    .split("|")
    .filter(Boolean);
  if (!words.length)
    return <img className="rory-scene" src={String(props.image)} alt={String(props.alt || "")} />;
  const spoken = String(props.narrationCaption || "")
    .split(/\s+/)
    [Number(props.narrationWord ?? -1)]?.replace(/[^a-z]/gi, "")
    .toLowerCase();
  return (
    <div className="rory-machine">
      <div className="rory-machine-rivets" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <img
        className="rory-machine-picture"
        src={String(props.image)}
        alt={String(props.alt || "")}
      />
      <div className="rory-machine-words">
        {words.map((word) => (
          <span key={word} className={spoken === word ? "le-word-active" : ""}>
            {word}
          </span>
        ))}
      </div>
      <div className="rory-machine-feet" aria-hidden="true" />
    </div>
  );
}
export default function RoryStudio({
  onExit,
  warmupOnly = false,
}: {
  onExit: () => void;
  warmupOnly?: boolean;
}) {
  return (
    <div className="pip-studio rory-studio">
      <PackageStudio
        lesson={roryLesson}
        flowId="rhyme-time-v1"
        assetRoot="/lesson-studio/rhyme-time"
        welcome={roryWelcome}
        completion={roryCompletion}
        learned={roryLearned}
        practice={roryPractice}
        practiceCount={roryPracticeCount}
        practiceVersion="three-rhymes-sun-v3"
        practiceTitle="Your turn with rhymes"
        practiceTopic="rhyme"
        practiceDone={roryPracticeDone}
        perfectDone={roryPerfectDone}
        onExit={onExit}
        warmupOnly={warmupOnly}
        cover={
          <img
            className="le-cover pip-opening-art"
            src={roryAsset("opening-matching-rory.webp")}
            alt="Rory, a friendly blue robot, beside his rhyme machine in a painted workshop"
          />
        }
        ambience={{
          src: roryAsset("robot-happy-forward-reverse.mp3"),
          label: "Rory’s robot sounds",
          volume: 0.22,
          duckVolume: 0.04,
        }}
        renderVisual={(_scene, props) => <RhymeWorld props={props} />}
        renderWarmup={(manifest, done) => (
          <ClueHunt
            game={roryWarmup}
            manifest={manifest}
            onComplete={done}
            renderSprite={(kind) => <WorkshopPart kind={kind} />}
          />
        )}
      />
    </div>
  );
}
