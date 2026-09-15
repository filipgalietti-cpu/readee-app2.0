"use client";
import PackageStudio from "@/app/components/lesson-v2/delivery/PackageStudio";
import StoneMatchGame from "@/app/components/lesson-v2/delivery/StoneMatchGame";
import BookWorkshopScene, {
  BookCoverBack,
} from "@/app/components/lesson-v2/delivery/BookWorkshopScene";
import {
  bookAsset,
  bookLesson,
  bookWelcome,
  bookCompletion,
  bookLearned,
  bookPractice,
  bookPracticeCount,
  bookPracticeDone,
  bookPerfectDone,
  bookWarmup,
} from "@/app/data/lesson-packages/book-makers";
import "./pip-studio.css";
import "./book-makers.css";
export default function BookMakersStudio({
  onExit,
  warmupOnly = false,
}: {
  onExit: () => void;
  warmupOnly?: boolean;
}) {
  return (
    <div className="pip-studio book-studio">
      <PackageStudio
        lesson={bookLesson}
        flowId="book-makers-v1"
        assetRoot="/lesson-studio/book-makers"
        welcome={bookWelcome}
        completion={bookCompletion}
        learned={bookLearned}
        practice={bookPractice}
        practiceCount={bookPracticeCount}
        practiceVersion="four-bands-v1"
        practiceTitle="Meet more book makers"
        practiceTopic="book"
        practiceDone={bookPracticeDone}
        perfectDone={bookPerfectDone}
        onExit={onExit}
        warmupOnly={warmupOnly}
        cover={
          <img
            className="le-cover pip-opening-art"
            src={bookAsset("opening.webp")}
            alt="Bookie’s sunlit book-making workshop"
          />
        }
        ambience={{
          src: "/lesson-studio/three-houses/woodland-ambience.mp3",
          label: "Birds outside the workshop window",
          volume: 0.24,
          duckVolume: 0.05,
        }}
        renderVisual={(scene, props) => (
          <BookWorkshopScene
            show={String(props.show)}
            image={String(props.image)}
            alt={props.show === "photo" ? scene.prompt : String(props.text ?? scene.prompt)}
            text={String(props.text ?? "")}
            title={String(props.title ?? "")}
            authorLabel={String(props.authorLabel ?? "")}
            illustratorLabel={String(props.illustratorLabel ?? "")}
            caption={String(props.narrationCaption ?? "")}
            activeWord={Number(props.narrationWord ?? -1)}
          />
        )}
        renderWarmup={(manifest, done) => (
          <StoneMatchGame
            config={bookWarmup}
            manifest={manifest}
            onComplete={done}
            renderBack={() => <BookCoverBack />}
            renderPicture={(i) => <img src={bookWarmup.pictures[i]} alt="" />}
          />
        )}
      />
    </div>
  );
}
