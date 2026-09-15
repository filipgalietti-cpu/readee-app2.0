"use client";
import PackageStudio from "@/app/components/lesson-v2/delivery/PackageStudio";
import StoneMatchGame from "@/app/components/lesson-v2/delivery/StoneMatchGame";
import Karaoke from "@/app/components/lesson-v2/delivery/Karaoke";
import {
  shelfAsset,
  shelfBooks,
  shelfLesson,
  shelfWarmup,
  shelfWelcome,
  shelfCompletion,
  shelfLearned,
  shelfPractice,
  shelfPracticeCount,
  shelfPracticeDone,
  shelfPerfectDone,
} from "@/app/data/lesson-packages/story-kinds";
import "./pip-studio.css";
import "./shelf-studio.css";
function BookBack() {
  return (
    <svg viewBox="0 0 140 116" aria-hidden="true">
      <rect
        x="22"
        y="9"
        width="99"
        height="99"
        rx="8"
        fill="#f6ebd5"
        stroke="#456b64"
        strokeWidth="4"
      />
      <path
        d="M25 13h86v89H25q-10 0-10-10V24q0-11 10-11Z"
        fill="#608c7a"
        stroke="#365e51"
        strokeWidth="4"
      />
      <path d="M28 14v88M40 30h55v54H40z" fill="none" stroke="#e7d6a7" strokeWidth="3" />
      <path d="m68 41 6 12 13 2-10 9 2 13-11-6-11 6 2-13-10-9 13-2Z" fill="#e7d6a7" />
    </svg>
  );
}
function ShelfVisual({ props }: { props: Record<string, string | number | boolean> }) {
  const show = String(props.show),
    book = shelfBooks[String(props.book)];
  if (show === "photo")
    return (
      <img className="shelf-scene-photo" src={String(props.image)} alt={String(props.alt ?? "")} />
    );
  if (show === "closed" && props.explorer) return <span className="shelf-explorer-start" />;
  if (show === "closed" || show === "shelves")
    return (
      <div
        className={"shelf-display " + (show === "shelves" ? "is-complete" : "")}
        aria-label={
          show === "shelves"
            ? "Three kinds of books on a wooden shelf"
            : "Three closed books waiting to be opened"
        }
      >
        {["story", "information", "poem"].map((key, i) => (
          <div className={"shelf-standing-book shelf-book-" + i} key={key}>
            <img src={shelfAsset("shared-train-cover.webp")} alt="" />
            <b>{show === "shelves" ? shelfBooks[key].kind : shelfBooks[key].title}</b>
          </div>
        ))}
        <div className="shelf-wood" />
      </div>
    );
  if (!book) return null;
  return (
    <div className={props.explanation ? "shelf-book-model" : "shelf-book-explore"}>
      <figure
        className="shelf-open-book"
        key={String(props.book) + "-" + String(props.activation ?? "model")}
      >
        <div className="shelf-picture-page">
          <img src={book.image} alt={book.alt} />
        </div>
        <figcaption className={"shelf-reading-page " + (book.kind === "Poem" ? "is-poem" : "")}>
          <h2>
            <Karaoke
              text={book.title}
              caption={String(props.narrationCaption ?? "")}
              activeWord={Number(props.narrationWord ?? -1)}
            />
          </h2>
          <p>
            <Karaoke
              text={book.text}
              caption={String(props.narrationCaption ?? "")}
              activeWord={Number(props.narrationWord ?? -1)}
              preserveLineBreaks
            />
          </p>
        </figcaption>
      </figure>
      {props.explanation && (
        <p className="shelf-explanation">
          <Karaoke
            text={String(props.explanation)}
            caption={String(props.narrationCaption ?? "")}
            activeWord={Number(props.narrationWord ?? -1)}
          />
        </p>
      )}
    </div>
  );
}
export default function ShelfStudio({
  onExit,
  warmupOnly = false,
}: {
  onExit: () => void;
  warmupOnly?: boolean;
}) {
  return (
    <div className="pip-studio shelf-studio">
      <PackageStudio
        lesson={shelfLesson}
        flowId="story-kinds-v1"
        assetRoot="/lesson-studio/story-kinds"
        welcome={shelfWelcome}
        completion={shelfCompletion}
        learned={shelfLearned}
        practice={shelfPractice}
        practiceCount={shelfPracticeCount}
        practiceVersion="four-bands-v1"
        practiceTitle="Open new books with Luna"
        practiceTopic="book"
        practiceDone={shelfPracticeDone}
        perfectDone={shelfPerfectDone}
        onExit={onExit}
        warmupOnly={warmupOnly}
        cover={
          <img
            className="le-cover pip-opening-art"
            src={shelfAsset("opening.webp")}
            alt="A sunlit library window seat with inviting books and a toy train."
          />
        }
        ambience={{
          src: shelfAsset("train-whistle-opening.mp3"),
          label: "Train whistle",
          volume: 0.22,
          duckVolume: 0.045,
        }}
        renderVisual={(_scene, props) => <ShelfVisual props={props} />}
        renderWarmup={(manifest, done) => (
          <StoneMatchGame
            config={shelfWarmup}
            manifest={manifest}
            onComplete={done}
            renderBack={BookBack}
            renderPicture={(i) => <img src={shelfWarmup.pictures[i]} alt="" />}
          />
        )}
      />
    </div>
  );
}
