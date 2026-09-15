"use client";
import { useMemo, useRef, useState } from "react";
import type { SequenceDef } from "@/lib/lesson-engine/types";
import type { InteractionProps } from "@/lib/lesson-engine/registry";
import { seededShuffle } from "@/lib/lesson-engine/shuffle";
import { placeToken } from "@/lib/lesson-engine/delivery/evidence";
import Karaoke from "./Karaoke";
import { playUrl, sfxCorrect, sfxWrong } from "@/lib/lesson-engine/cues";
export default function Sequence({
  data,
  support,
  onSolved,
  onWrong,
}: InteractionProps<SequenceDef>) {
  const [order, setOrder] = useState<string[]>(() => data.order.map(() => "")),
    [message, setMessage] = useState(""),
    [solved, setSolved] = useState(false),
    [readingPart, setReadingPart] = useState(-1);
  const attempts = useRef(0),
    done = useRef(false);
  const pool = useMemo(() => {
    const items = seededShuffle(data.items, data.order.join("|"));
    return items.map((i) => i.id).join("|") === data.order.join("|") ? [...items].reverse() : items;
  }, [data]);
  const move = (id: string, index: number) => {
    if (done.current || !data.items.some((i) => i.id === id)) return;
    setOrder((o) => placeToken(o, id, index));
    setMessage("");
    const item = data.items.find((i) => i.id === id)!;
    if (support) support.say(item.spoken ?? item.label);
    else if (item.audio) playUrl(item.audio);
  };
  const readPart = (index: number, chain = false) => {
    const part = data.resultParts?.[index];
    if (!part) return;
    setReadingPart(index);
    support?.say(part.text, () => {
      if (chain && index + 1 < data.resultParts!.length) readPart(index + 1, true);
      else setReadingPart(-1);
    });
  };
  const check = () => {
    if (done.current) return;
    attempts.current++;
    const correct = order.join("|") === data.order.join("|");
    if (support?.answer("sequence", correct, {order}) === false) return;
    if (correct) {
      done.current = true;
      setSolved(true);
      const text = support?.scene.feedback?.correct ?? "Your sequence is complete.";
      setMessage(data.resultParts || data.result === text ? "" : text);
      if (data.resultParts) readPart(0, true);
      else if (data.readResult && data.result && data.result !== text)
        support?.say(text, () => support?.say(data.result!));
      else support?.say(text);
      if (!support) sfxCorrect();
      onSolved({ attempts: attempts.current, correct: true });
    } else {
      setOrder(data.order.map(() => ""));
      const text =
        support?.scene.feedback?.incorrect ?? data.coachWrong ?? "Try a different order.";
      setMessage(text);
      support?.say(text);
      onWrong?.();
      if (!support) sfxWrong();
    }
  };
  return (
    <div className={`le-activity ${data.items.some((i) => i.image) ? "le-picture-sequence" : ""}`}>
      {solved && data.resultParts ? (
        <div className="le-story-result" aria-label="Your story in order">
          {data.resultParts.map((part, index) => (
            <button
              key={part.text}
              className={`le-story-pill ${readingPart === index ? "is-reading" : ""}`}
              onClick={() => readPart(index)}
              aria-label={`Read story part ${index + 1}`}
            >
              <span className="le-part-number">{index + 1}</span>
              {part.image && <img src={part.image} alt="" />}
              <span>
                <Karaoke
                  text={part.text}
                  caption={support?.narration?.caption ?? ""}
                  activeWord={support?.narration?.activeWord ?? -1}
                />
              </span>
            </button>
          ))}
        </div>
      ) : (
        solved &&
        data.result && (
          <div className="le-answer-reveal">
            {data.success && (
              <img className="le-answer-photo" src={data.success.image} alt={data.success.alt} />
            )}
            <p
              className={
                data.success ? "le-answer-card le-sentence le-answer-centered" : "le-sentence"
              }
            >
              <Karaoke text={data.result} caption={support?.narration?.caption ?? ""} activeWord={support?.narration?.activeWord ?? -1} />
            </p>
          </div>
        )
      )}
      {!solved && (
        <>
          <div
            className="le-sequence"
            aria-label={data.items.some((i) => i.image) ? "Story order builder" : "Word builder"}
          >
            {data.order.map((_, i) => (
              <div
                key={i}
                className="le-slot"
                data-slot={i}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  move(e.dataTransfer.getData("text/plain"), i);
                }}
              >
                <span>{i + 1}</span>
                {order[i] ? (
                  <button
                    draggable={!solved}
                    disabled={solved}
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", order[i])}
                    onClick={() => setOrder((o) => o.map((word, n) => (n === i ? "" : word)))}
                  >
                    {data.items.find((t) => t.id === order[i])?.image && (
                      <img
                        className="le-sequence-picture"
                        src={data.items.find((t) => t.id === order[i])!.image}
                        alt=""
                      />
                    )}
                    {data.items.find((t) => t.id === order[i])?.label}
                  </button>
                ) : (
                  <span className="le-slot-hint">Drop here</span>
                )}
              </div>
            ))}
          </div>
          <div className="le-options">
            {pool.map((item) => (
              <button
                key={item.id}
                draggable={!solved && !order.includes(item.id)}
                disabled={solved || order.includes(item.id)}
                className="le-tile"
                onDragStart={(e) => e.dataTransfer.setData("text/plain", item.id)}
                onClick={() => move(item.id, order.indexOf(""))}
              >
                {item.image && <img className="le-sequence-picture" src={item.image} alt="" />}
                {item.label}
              </button>
            ))}
          </div>
          <button
            className="le-primary"
            disabled={solved || order.some((word) => !word)}
            onClick={check}
          >
            Check my order
          </button>
        </>
      )}
      <p className="le-feedback" role="status">
        {message}
      </p>
    </div>
  );
}
