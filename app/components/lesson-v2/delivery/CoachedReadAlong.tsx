"use client";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Volume2 } from "lucide-react";
import type { ReadAlongDef } from "@/lib/lesson-engine/types";
import type { InteractionProps } from "@/lib/lesson-engine/registry";
import Karaoke from "./Karaoke";

/** Hearing a story records participation only. Audio failure never finishes a page. */
export default function CoachedReadAlong({ data, support }: InteractionProps<ReadAlongDef>) {
  const pages = data.pages ?? [{ text: data.text }];
  const [page, setPage] = useState(0),
    [heard, setHeard] = useState<number[]>([]);
  const completed = useRef(new Set<number>());
  const current = pages[page];
  function read(index = page) {
    const entry = pages[index];
    if (entry.visual) support?.visual(entry.visual);
    support?.say(entry.text, () => {
      completed.current.add(index);
      setHeard([...completed.current]);
      if (completed.current.size === pages.length) support.finish();
    });
  }
  function turn(next: number) {
    setPage(next);
    read(next);
  }
  return (
    <div className="le-storybook">
      {current.image && <img className="le-story-picture" src={current.image} alt="" />}
      <p className={data.preserveLineBreaks ? "le-story-text le-poem-text" : "le-story-text"}>
        <Karaoke
          text={current.text}
          preserveLineBreaks={data.preserveLineBreaks}
          caption={support?.narration?.caption ?? ""}
          activeWord={support?.narration?.activeWord ?? -1}
        />
      </p>
      <div className="le-story-controls">
        {pages.length > 1 && <button
          aria-label="Previous story page"
          disabled={page === 0}
          onClick={() => turn(page - 1)}
        >
          <ArrowLeft size={20} />
        </button>}
        <button className="le-primary" onClick={() => read()}>
          <Volume2 size={20} />
          Read to me
        </button>
        {pages.length > 1 && <button
          aria-label="Next story page"
          disabled={!heard.includes(page) || page === pages.length - 1}
          onClick={() => turn(page + 1)}
        >
          <ArrowRight size={20} />
        </button>}
      </div>
      {pages.length > 1 && <p className="le-eyebrow">
        {page + 1} of {pages.length}
      </p>}
    </div>
  );
}
