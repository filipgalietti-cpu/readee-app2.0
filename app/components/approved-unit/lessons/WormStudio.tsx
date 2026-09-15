"use client";
import PackageStudio from "@/app/components/lesson-v2/delivery/PackageStudio";
import GardenMazeGame from "@/app/components/lesson-v2/delivery/GardenMazeGame";
import PrintedPage from "@/app/components/lesson-v2/delivery/PrintedPage";
import type { PrintPageDef } from "@/lib/lesson-engine/types";
import {
  wormAsset,
  wormPageOne,
  wormLesson,
  wormWelcome,
  wormCompletion,
  wormLearned,
  wormPractice,
  wormPracticeCount,
  wormPracticeDone,
  wormPerfectDone,
  wormWarmup,
  wormPracticeStandards,
} from "@/app/data/lesson-packages/book-basics";
import "./pip-studio.css";
import "./worm-studio.css";
function WormActor() {
  return <image href={wormAsset("wormy.webp")} width="190" height="155" preserveAspectRatio="xMidYMid meet" />;
}
export default function WormStudio({
  onExit,
  warmupOnly = false,
}: {
  onExit: () => void;
  warmupOnly?: boolean;
}) {
  return (
    <div className="pip-studio worm-studio">
      <PackageStudio
        lesson={wormLesson}
        flowId="book-basics-v1"
        assetRoot="/lesson-studio/book-basics"
        welcome={wormWelcome}
        completion={wormCompletion}
        learned={wormLearned}
        practice={wormPractice}
        practiceStandards={wormPracticeStandards}
        practiceCount={wormPracticeCount}
        practiceVersion="four-bands-v1"
        practiceTitle="Follow new word trails"
        practiceTopic="print-trail"
        practiceDone={wormPracticeDone}
        perfectDone={wormPerfectDone}
        onExit={onExit}
        warmupOnly={warmupOnly}
        cover={
          <img
            className="le-cover pip-opening-art"
            src={wormAsset("opening.webp")}
            alt="Wormy beside an open book in a leafy garden nook"
          />
        }
        ambience={{
          src: wormAsset("garden-birds.mp3"),
          label: "Garden birds",
          volume: 0.32,
          duckVolume: 0.075,
        }}
        renderVisual={(scene, props) => {
          if (scene.visual?.id === "worm-page") {
            const page: PrintPageDef = {
              lines: JSON.parse(String(props.lines)),
              showSpaces: !!props.showSpaces,
              ...(props.markerId ? { markerId: String(props.markerId) } : {}),
            };
            return (
              <div className="worm-book-page">
                <div className="worm-page-stack">
                <PrintedPage
                  page={page}
                  caption={String(props.narrationCaption || "")}
                  activeWord={Number(props.narrationWord ?? -1)}
                  readingLine={Number(props.readingLine ?? -1)}
                />
                {Number(props.pageNumber) === 2 && props.activation && <div key={String(props.activation)} className="worm-turning-sheet" aria-hidden="true">
                  <PrintedPage page={wormPageOne} />
                </div>}
                </div>
                <span className="worm-page-number" aria-label={`Page ${props.pageNumber}`}>
                  {props.pageNumber}
                </span>
              </div>
            );
          }
          if (scene.visual?.id === "worm-letters")
            return (
              <div className="worm-letter-word" role="img" aria-label={String(props.word)}>
                {Array.from(String(props.word)).map((letter, index) => (
                  <span key={index} aria-hidden>
                    {letter}
                  </span>
                ))}
              </div>
            );
          return (
            <img className="worm-scene" src={String(props.image)} alt={String(props.alt || "")} />
          );
        }}
        renderWarmup={(manifest, done) => (
          <GardenMazeGame
            config={wormWarmup}
            manifest={manifest}
            onComplete={done}
            renderActor={() => <WormActor />}
          />
        )}
      />
    </div>
  );
}
