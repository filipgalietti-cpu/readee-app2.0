"use client";
import { useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import type { HighlightDef } from "@/lib/lesson-engine/types";
import type { InteractionProps } from "@/lib/lesson-engine/registry";
import { highlightWords, highlightTargetIndices } from "@/lib/lesson-engine/delivery/highlight";
import { sfxCorrect } from "@/lib/lesson-engine/cues";
import Karaoke from "./Karaoke";
import { spokenFragmentIndex } from "@/lib/lesson-engine/delivery/spoken-fragment";
import "./highlight.css";
/** Same evidence/retry contract as the other coached interactions; no authored words here. */
export default function CoachedHighlight({
  data,
  support,
  onSolved,
}: InteractionProps<HighlightDef>) {
  const found = useRef(new Set<number>()),
    locked = useRef(false);
  const [selected, setSelected] = useState<number[]>([]),
    [wrong, setWrong] = useState<number | null>(null),
    [message, setMessage] = useState("");
  const targets = highlightTargetIndices(data),
    words = highlightWords(data, new Set(selected));
  const solved = targets.length > 0 && targets.every((i) => selected.includes(i));
  function pick(index: number) {
    if (locked.current || found.current.has(index)) return;
    if (!targets.includes(index)) {
      if (support?.answer("highlight", false, {indices:[...found.current,index]}) === false) {
        locked.current = true;
        return;
      }
      setWrong(index);
      const text = support?.scene.feedback?.incorrect ?? data.coachWrong ?? "";
      setMessage(text);
      support?.say(text);
      return;
    }
    found.current.add(index);
    setSelected([...found.current]);
    setWrong(null);
    if (targets.every((i) => found.current.has(i))) {
      locked.current = true;
      if (support?.answer("highlight", true, {indices:[...found.current]}) === false) return;
      const text = support?.scene.feedback?.correct ?? "";
      setMessage(text);
      support?.say(text, () => {
        if (data.result && data.result !== text) support?.say(data.result);
      });
      onSolved({ correct: true });
    } else {
      sfxCorrect();
      const text = highlightWords(data, found.current)[index];
      setMessage("");
      support?.say(text);
    }
  }
  const caption = support?.narration?.caption ?? "",
    active = support?.narration?.activeWord ?? -1;
  const highlighted = spokenFragmentIndex(words.join(" "), caption, active);
  if (solved && data.success)
    return (
      <div className="le-answer-reveal le-highlight-result" role="status">
        <img className="le-answer-photo" src={data.success.image} alt={data.success.alt} />
        <div className="le-answer-card">
          <p className="le-sentence">
            <Karaoke
              text={data.result ?? data.success.sentence}
              caption={caption}
              activeWord={active}
            />
          </p>
          <button
            className="le-replay"
            aria-label="Read the corrected sentence"
            onClick={() => support?.say(data.result ?? data.success!.sentence)}
          >
            <Volume2 size={20} />
          </button>
        </div>
        {message && message !== (data.result ?? data.success.sentence) && (
          <p className="le-feedback">
            <Karaoke text={message} caption={caption} activeWord={active} />
          </p>
        )}
      </div>
    );
  return (
    <div className="le-activity le-highlight" data-highlight-complete={solved ? "yes" : "no"}>
      <div className="le-highlight-page" aria-label="Sentence to check">
        {words.map((word, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Word ${index + 1}: ${word}`}
            aria-pressed={selected.includes(index)}
            className={`le-highlight-word ${selected.includes(index) ? "is-found" : ""} ${wrong === index ? "is-retry" : ""}`}
            onClick={() => pick(index)}
          >
            <span className={index === highlighted ? "le-word-active" : ""}>{word}</span>
          </button>
        ))}
      </div>
      <button
        className="le-replay"
        aria-label="Read this sentence"
        onClick={() => support?.say(solved ? (data.result ?? data.text) : data.text)}
      >
        <Volume2 size={20} />
      </button>
      <p className="le-feedback" role="status">
        <Karaoke text={message} caption={caption} activeWord={active} />
      </p>
    </div>
  );
}
