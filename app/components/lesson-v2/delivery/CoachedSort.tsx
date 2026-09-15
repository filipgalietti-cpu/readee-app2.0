"use client";
import { useMemo, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import type { SortDef } from "@/lib/lesson-engine/types";
import type { InteractionProps } from "@/lib/lesson-engine/registry";
import { interleavedSortOrder } from "@/lib/lesson-engine/shuffle";
import Karaoke from "./Karaoke";
import ExamSort from "./ExamSort";
import { itemNarrationCaption } from "@/lib/lesson-engine/delivery/spoken-choice";
import { presentInteraction } from "@/lib/lesson-engine/delivery/presentation";
export default function CoachedSort({
  data: authoredData,
  support,
  onSolved,
  onWrong,
  onItemCorrect,
}: InteractionProps<SortDef>) {
  const data=presentInteraction(support?.scene,authoredData);
  const showImages=data.showImages ?? data.items.some(item=>!!item.image);
  const compactWordCards=data.items.every(item=>item.label.length<=14);
  const order=useMemo(()=>interleavedSortOrder(data.items, (support?.scene.id ?? "sort")+data.items.map(i=>i.label).join("|")),[data.items,support?.scene.id]);
  const [selected, setSelected] = useState<number | null>(null),
    [placed, setPlaced] = useState<number[]>([]),
    [feedback, setFeedback] = useState("");
  const completed = useRef(new Set<number>()),
    attempts = useRef(0);
  function read(index: number) {
    setSelected(index);
    support?.say(data.items[index].spoken ?? data.items[index].label);
  }
  function place(bucket: string, index = selected) {
    if (index === null || !data.items[index] || completed.current.has(index)) return;
    attempts.current++;
    const item = data.items[index],
      correct = item.bucket === bucket;
    if (support?.answer(String(index), correct, {bucket}) === false) return;
    if (!correct) {
      const text =
        support?.scene.feedback?.byChoice?.[`${index}:${bucket}`] ??
        support?.scene.feedback?.incorrect ??
        data.coachWrong ??
        "Try again.";
      setFeedback(text);
      support?.say(text);
      onWrong?.();
      return;
    }
    completed.current.add(index);
    setPlaced([...completed.current]);
    setSelected(null);
    onItemCorrect?.();
    const text = item.explanation ?? item.spoken ?? item.label;
    setFeedback(text);
    if (completed.current.size === data.items.length) {
      support?.say(text, () => {
        const praise = support?.scene.feedback?.correct ?? "";
        setFeedback(praise);
        support?.say(praise);
      });
      onSolved({ correct: true, attempts: attempts.current });
    } else support?.say(text);
  }
  if (support?.deferFeedback) return <ExamSort data={data} support={support} onSolved={onSolved} />;
  return (
    <div className={`le-activity le-sort-board ${showImages ? "le-sort-illustrated" : ""} ${compactWordCards ? "le-sort-word-cards" : ""}`} data-bucket-count={data.buckets.length}>
      <div className="le-card-bank" aria-label="Cards to sort">
        {order.map(
          (index) =>
            !placed.includes(index) && (
              <button
                key={index}
                className={`le-sort-card ${selected === index ? "is-selected" : ""}`}
                aria-pressed={selected === index}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", String(index));
                  setSelected(index);
                }}
                onClick={() => read(index)}
              >
                {showImages && data.items[index].image && <img className="le-sort-art" src={data.items[index].image} alt="" />}
                <span>{data.items[index].label}</span>
              </button>
            ),
        )}
      </div>
      <div className="le-sort-homes">
        {data.buckets.map((bucket, index) => (
          <div
            className={`le-sort-home home-${index}`}
            key={bucket}
            role="group" aria-label={`${bucket} sorting area`}
            onClick={(event) => {
              // Child buttons retain their replay action; empty space places the selected card.
              if (!(event.target as HTMLElement).closest("button")) place(bucket);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const text = e.dataTransfer.getData("text/plain");
              if (/^\d+$/.test(text)) place(bucket, Number(text));
            }}
          >
            <div className="le-bucket-head">
              <button className="le-bucket" onClick={() => selected === null ? support?.say(bucket, undefined, `bucket:${bucket}`) : place(bucket)} aria-label={bucket}>
                {showImages && data.bucketImages?.[bucket] && <img className="le-sort-art" src={data.bucketImages[bucket]} alt="" />}
                {data.bucketMarkers?.[bucket] && <span className="le-syllable-markers" aria-hidden="true">{Array.from({length:data.bucketMarkers[bucket]},(_,i)=><i key={i}/>)}</span>}
                <Karaoke text={bucket} caption={itemNarrationCaption(`bucket:${bucket}`, support?.narration)} activeWord={support?.narration?.activeWord ?? -1}/>
              </button>
              <button type="button" className="le-bucket-audio" aria-label={`Hear ${bucket}`} onClick={() => support?.say(bucket, undefined, `bucket:${bucket}`)}>
                <Volume2 size={18}/>
              </button>
            </div>
            <div className="le-sorted-cards">
              {placed
                .filter((i) => data.items[i].bucket === bucket)
                .map((i) => (
                  <button key={i} onClick={() => support?.say(data.items[i].spoken ?? data.items[i].label)}>
                    {showImages && data.items[i].image && <img className="le-sort-art" src={data.items[i].image} alt="" />}
                    <span>{data.items[i].label}</span>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
      <p className="le-feedback" role="status">
        {feedback}
      </p>
    </div>
  );
}
