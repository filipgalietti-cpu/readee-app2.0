"use client";
import PackageStudio from "@/app/components/lesson-v2/delivery/PackageStudio";
import ClueHunt from "@/app/components/lesson-v2/delivery/ClueHunt";
import { bugHunt } from "@/app/data/lesson-packages/pip-bug-hunt";
import PipsTree from "@/app/components/lesson-v2/delivery/PipsTree";
import {
  pipLesson, pipWelcome, pipCompletion, pipLearned,
  pipPracticePool, pipPracticeDone, pipPerfectDone,
} from "@/app/data/lesson-packages/pips-tree";
import "./pip-studio.css";

export default function PipStudio({ onExit, warmupOnly = false }: {
  onExit: () => void; warmupOnly?: boolean;
}) {
  return (
    <div className="pip-studio">
      <PackageStudio
        lesson={pipLesson}
        flowId="pips-tree-v3"
        assetRoot="/lesson-studio/pips-tree"
        extraManifestUrls={["/lesson-studio/audio/audio-v2.json"]}
        welcome={pipWelcome}
        completion={pipCompletion}
        learned={pipLearned}
        practice={pipPracticePool}
        practiceVersion="luna-v4"
        practiceTitle="Find the clues"
        practiceDone={pipPracticeDone}
        perfectDone={pipPerfectDone}
        onExit={onExit}
        warmupOnly={warmupOnly}
        cover={<img className="le-cover pip-opening-art"
          src="/lesson-studio/pips-tree/pip-opening-v3.webp"
          alt="Pip swooping beside his tree to catch a little red bug" />}
        ambience={{ src: "/lesson-studio/pips-tree/birdsong-ambience.mp3",
          label: "Bird sounds", volume: 0.32, duckVolume: 0.10 }}
        renderVisual={(scene, props) => scene.visual?.id === "pips-tree"
          ? <PipsTree moment={String(props.moment ?? "rest")} /> : null}
        renderWarmup={(manifest, done) =>
          <ClueHunt game={bugHunt} manifest={manifest} onComplete={done} />}
      />
    </div>
  );
}
