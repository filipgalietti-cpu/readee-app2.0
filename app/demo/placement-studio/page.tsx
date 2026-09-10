"use client";

import { useState } from "react";
import PlacementView, {
  type PlacementScreen,
} from "@/app/(protected)/placement/_components/PlacementView";
import AssessmentHandoff from "@/app/(protected)/placement/_components/AssessmentHandoff";
import { spectrumPassage } from "@/app/data/placement-spectrum/reading";
import { LANGUAGE_ITEMS } from "@/lib/placement/spectrum";
import { spectrumClip } from "@/app/data/placement-spectrum/audio";
import { PLACEMENT_BANK } from "@/app/data/placement-bank";
import { clipUrl, playUrlAsync } from "@/app/(protected)/placement/_components/audio";

const passage = PLACEMENT_BANK.bands[2].passage!;
const question = passage.questions[2];
const kRead = spectrumPassage(0, "a");
const stretch = spectrumPassage(4, "a");
const listen = LANGUAGE_ITEMS.find((q) => q.id === "sp-RI.3.9-H2")!;
const examples: { label: string; stage: string; screen: PlacementScreen }[] = [
  { label: "Welcome", stage: "greeting", screen: { kind: "ready" } },
  { label: "Microphone", stage: "mic", screen: { kind: "mic", status: "open", retry: false } },
  {
    label: "A word",
    stage: "words",
    screen: { kind: "word", word: "garden", listening: true, band: 2 },
  },
  {
    label: "Sounds",
    stage: "foundations",
    screen: {
      kind: "tiles",
      caption: "Which letter makes this sound?",
      tiles: ["m", "s", "t", "p"],
      picked: null,
    },
  },
  {
    label: "Reading",
    stage: "passage",
    screen: { kind: "passage", title: passage.title, text: passage.text, reading: true },
  },
  {
    label: "Story question",
    stage: "comprehension",
    screen: {
      kind: "question",
      prompt: question.prompt,
      options: question.options,
      picked: null,
      readingIdx: -1,
      speakers: true,
      qid: question.id,
      passage: { title: passage.title, text: passage.text },
    },
  },
  { label: "Retry", stage: "words", screen: { kind: "recovery" } },
  { label: "Finish", stage: "closing", screen: { kind: "closing", error: null } },
  { label: "Parent handoff", stage: "greeting", screen: { kind: "ready" } },
  {
    label: "First K text",
    stage: "passage",
    screen: { kind: "passage", title: kRead.title, text: kRead.text, reading: true },
  },
  {
    label: "Fourth-grade stretch",
    stage: "comprehension",
    screen: {
      kind: "question",
      prompt: stretch.questions[1].prompt,
      options: stretch.questions[1].options,
      picked: null,
      readingIdx: -1,
      speakers: true,
      qid: stretch.questions[1].id,
      passage: { title: stretch.title, text: stretch.text },
    },
  },
  {
    label: "Listening separately",
    stage: "listening",
    screen: {
      kind: "question",
      prompt: listen.prompt,
      options: listen.options,
      picked: null,
      readingIdx: -1,
      speakers: true,
      qid: listen.id,
      passage: { title: "Listen and think", text: listen.text },
    },
  },
  {
    label: "Spoken blending",
    stage: "foundations",
    screen: { kind: "word", word: "Say the word", oral: true, listening: true },
  },
];

export default function PlacementStudio() {
  const [index, setIndex] = useState(0);
  const [readingIdx, setReadingIdx] = useState(-1);
  const [picked, setPicked] = useState<string | null>(null);
  const item = examples[Math.min(index, examples.length - 1)];
  const screen =
    item.screen.kind === "tiles" || item.screen.kind === "question"
      ? { ...item.screen, picked, ...(item.screen.kind === "question" ? { readingIdx } : {}) }
      : item.screen;
  const change = (i: number) => {
    setIndex(i);
    setPicked(null);
    setReadingIdx(-1);
  };
  const next = () => change((index + 1) % examples.length);
  return (
    <div className="pa-studio">
      <div className="pa-studio-controls">
        <span>Design preview · no recording or saved answers</span>
        <label>
          Screen{" "}
          <select value={index} onChange={(e) => change(Number(e.target.value))}>
            {examples.map((e, i) => (
              <option value={i} key={e.label}>
                {e.label}
              </option>
            ))}
          </select>
        </label>
        <button onClick={next}>Next screen</button>
      </div>
      {index === 8 ? (
        <AssessmentHandoff
          name="Maya"
          gradeLabel="Grade 4"
          startHref="/demo/placement-run?grade=4"
          exploreHref="/demo/placement-studio"
        />
      ) : (
        <PlacementView
          screen={screen}
          stage={item.stage}
          childName="Maya"
          outfitId={null}
          orb={readingIdx >= 0 ? "speaking" : "idle"}
          level={0}
          onBegin={next}
          onTap={(id) => (id === "retry" ? change(2) : setPicked(id))}
          onSkip={next}
          onRetry={() => change(1)}
          onSave={next}
          onReadOption={(qid, id) => {
            setReadingIdx(
              screen.kind === "question"
                ? screen.options.findIndex((option) => option.id === id)
                : -1,
            );
            void playUrlAsync(
              qid.startsWith("sp-")
                ? spectrumClip(`opt-${qid}-${id}`)
                : clipUrl(`opt-${qid}-${id}`),
            ).finally(() => setReadingIdx(-1));
          }}
          exitHref="/demo/placement-run"
        />
      )}
      <style>{`.pa-studio .pa-frame{top:54px;height:calc(100dvh - 54px)}.pa-studio-controls{position:fixed;inset:0 0 auto;z-index:60;height:54px;padding:8px 18px;display:flex;gap:18px;align-items:center;justify-content:space-between;background:#fff;border-bottom:1px solid #e6ddf4;font:12px var(--font-nunito),sans-serif;color:#655874}.pa-studio-controls label{display:flex;align-items:center;gap:8px}.pa-studio-controls select,.pa-studio-controls button{border:1px solid #e6ddf4;border-radius:8px;background:white;padding:7px;color:#5b21b6;font:inherit;min-height:36px}.pa-studio-controls button{cursor:pointer}@media(max-width:650px){.pa-studio-controls{gap:8px;padding:5px 10px;font-size:10px}.pa-studio-controls>span{max-width:110px}.pa-studio-controls label{gap:4px}}`}</style>
    </div>
  );
}
