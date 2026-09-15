import { spokenFragmentIndex } from "@/lib/lesson-engine/delivery/spoken-fragment";
export default function Karaoke({
  text,
  caption,
  activeWord,
  preserveLineBreaks = false,
}: {
  preserveLineBreaks?: boolean;
  text: string;
  caption: string;
  activeWord: number;
}) {
  const highlighted = spokenFragmentIndex(text, caption, activeWord);
  const tokens = preserveLineBreaks ? text.match(/\S+|\n/g) ?? [] : text.split(/\s+/);
  return (
    <span className="le-karaoke" aria-label={text}>
      {tokens.map((word, index) => {
        if (word === "\n") return <br key={index} aria-hidden="true" />;
        const wordIndex = tokens.slice(0, index + 1).filter(token => token !== "\n").length - 1;
        return (
        <span
          key={index}
          aria-hidden="true"
          className={wordIndex === highlighted ? "le-word-active" : ""}
        >
          {word}{" "}
        </span>
      );})}
    </span>
  );
}
