"use client";
import Karaoke from "./Karaoke";
/** Book-specific scenery; mechanics, answer keys and narration remain in data. */
export default function BookWorkshopScene({
  show,
  image,
  alt,
  text = "",
  caption = "",
  activeWord = -1,
  title = "",
  authorLabel = "",
  illustratorLabel = "",
}: {
  show: string;
  image: string;
  alt: string;
  text?: string;
  caption?: string;
  activeWord?: number;
  title?: string;
  authorLabel?: string;
  illustratorLabel?: string;
}) {
  if (show.startsWith("cover"))
    return (
      <div className="book-front-cover" aria-label={`Pretend book cover: ${title}`}>
        <h2>{title}</h2>
        <img src={image} alt="A cat sleeping on a mat" />
        <div className="book-cover-names">
          <p className={show === "cover-author" ? "is-active" : ""}><Karaoke text={authorLabel} caption={caption} activeWord={activeWord} /></p>
          <p className={show === "cover-illustrator" ? "is-active" : ""}><Karaoke text={illustratorLabel} caption={caption} activeWord={activeWord} /></p>
        </div>
      </div>
    );
  if (show === "photo")
    return (
      <img className="book-scene-photo" src={image} alt={alt} />
    );
  return (
    <div className="book-spread" aria-label="Our pretend storybook page">
      <div className={`book-page book-words ${show === "picture" ? "is-quiet" : ""}`}>
        {show !== "picture" && (
          <p>
            <Karaoke text={text} caption={caption} activeWord={activeWord} />
          </p>
        )}
      </div>
      <div className={`book-page book-picture ${show === "words" ? "is-quiet" : ""}`}>
        {show !== "words" && <img src={image} alt={alt} />}
      </div>
    </div>
  );
}
export function BookCoverBack() {
  return (
    <svg viewBox="0 0 140 116" aria-hidden="true">
      <path
        d="M22 8h91q10 0 10 10v87H26q-12 0-12-12V21q0-13 8-13Z"
        fill="#598b88"
        stroke="#375f61"
        strokeWidth="3"
      />
      <path d="M25 12v84M25 99h94" fill="none" stroke="#e8d9b9" strokeWidth="5" />
      <path d="M43 20h61v57H43z" fill="none" stroke="#c9d6bd" strokeWidth="2" />
      <path d="m74 33 5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2Z" fill="#e6c37c" />
      <path d="M98 83v25l7-5 7 5V83" fill="#bd6555" />
    </svg>
  );
}
