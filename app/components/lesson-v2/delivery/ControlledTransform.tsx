"use client";
import { useEffect, useRef, useState } from "react";
import type { TransformDef } from "@/lib/lesson-engine/types";
import type { InteractionProps } from "@/lib/lesson-engine/registry";
import { spokenFragmentIndex } from "@/lib/lesson-engine/delivery/spoken-fragment";
import Karaoke from "./Karaoke";
import LessonImage from "../LessonImage";
export default function ControlledTransform({
  data,
  support,
  onSolved,
}: InteractionProps<TransformDef>) {
  const [active, setActive] = useState(0),
    [hasSelected, setHasSelected] = useState(!data.startUnselected),
    [visited, setVisited] = useState<string[]>([]),
    [swapped, setSwapped] = useState(false);
  const [emphasized, setEmphasized] = useState(false);
  const done = useRef(false), activation = useRef(0);
  const states = data.states ?? [],
    state = states[active],
    swap = data.presentation === "swap";
  const highlighted = spokenFragmentIndex(
    state?.text ?? "",
    support?.narration?.caption ?? "",
    support?.narration?.activeWord ?? -1,
  );
  const clean = (word: string) => word.toLowerCase().replace(/[^a-z]/g, "");
  const spokenWord = support?.narration?.caption.split(/\s+/)[support.narration.activeWord] ?? "";
  useEffect(() => {
    if (
      state?.emphasis &&
      support?.narration?.caption === state.script &&
      clean(spokenWord) === clean(state.emphasis ?? "")
    ) {
      const frame=requestAnimationFrame(()=>setEmphasized(true));
      return ()=>cancelAnimationFrame(frame);
    }
  }, [state, spokenWord, support?.narration?.caption]);
  if (!state) return null;
  function explore(index: number) {
    const selected = states[index];
    const next = [...new Set([...visited, selected.id])];
    setVisited(next);
    support?.visual({ ...(selected.visual ?? {}), activation: ++activation.current });
    support?.say(selected.script);
    if (next.length === states.length && !done.current) {
      done.current = true;
      support?.finish();
      onSolved({ attempts: 0 });
    }
  }
  function choose(index: number) {
    setActive(index);
    setHasSelected(true);
    setEmphasized(false);
    setSwapped(false);
    if (swap) support?.say(states[index].before ?? states[index].text);
    else explore(index);
  }
  return (
    <div className={`le-activity le-demonstration ${swap ? "le-swap" : data.presentation === "book-covers" ? "le-book-covers" : ""}`}>
      {swap ? (
        <div className="le-pronoun-focus">
          {state.image && <LessonImage src={state.image} width={180} height={165} />}
          <p className="le-pronoun-name">{state.label}</p>
          <div className="le-pronoun-dots" aria-label="Meet four friends">
            {states.map((s, i) => (
              <button
                key={s.id}
                aria-label={s.label}
                aria-pressed={hasSelected && i === active}
                onClick={() => choose(i)}
              >
                {visited.includes(s.id) ? "✓" : i + 1}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="le-options">
          {states.map((s, i) => (
            <button
              key={s.id}
              className={`le-tile ${hasSelected && i === active ? "is-selected" : ""}`}
              aria-label={s.label}
              aria-pressed={hasSelected && i === active}
              onClick={() => choose(i)}
            >
              {data.presentation === "book-covers" && s.image && <img className="le-book-cover-picture" src={s.image} alt="" />}
              {data.presentation === "book-covers" ? <span className="le-transform-label">{s.label}</span> : s.label}
              {visited.includes(s.id) && (
                <span className="le-explored" aria-label="Explored">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      {!swap && state.context && <p className="le-context">{state.context}</p>}
      {(swap && !swapped ? (state.before ?? state.text) : state.text).trim() && <div
        className={`le-swap-sentence ${swapped ? "is-swapped" : ""}`}
        key={`${active}-${swapped}`}
      >
        <p className="le-sentence">
          {state.emphasis
            ? state.text.split(/\s+/).map((word, index) => (
                <span
                  key={index}
                  className={`${index === highlighted ? "le-word-active" : ""} ${
                    clean(word) === clean(state.emphasis ?? "")
                      ? `le-verb-emphasis ${emphasized ? "is-spoken" : ""}`
                      : ""
                  }`}
                >
                  {word}{" "}
                </span>
              ))
            : <Karaoke
                text={swap && !swapped ? (state.before ?? state.text) : state.text}
                caption={support?.narration?.caption ?? ""}
                activeWord={support?.narration?.activeWord ?? -1}
              />}
        </p>
      </div>}
      {swap && !swapped && (
        <button
          className="le-primary"
          onClick={() => {
            setSwapped(true);
            explore(active);
          }}
        >
          {state.actionLabel}
        </button>
      )}
      {swap && swapped && active < states.length - 1 && (
        <button onClick={() => choose(active + 1)}>Meet the next friend →</button>
      )}
      {!swap && <p className="le-small">{data.presentation === "book-covers" ? "Open each book. You can read it again." : "Try each button. You can explore again."}</p>}
    </div>
  );
}
