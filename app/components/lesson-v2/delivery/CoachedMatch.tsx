"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Karaoke from "./Karaoke";
import { itemNarrationCaption } from "@/lib/lesson-engine/delivery/spoken-choice";
import { presentInteraction } from "@/lib/lesson-engine/delivery/presentation";
import { Volume2 } from "lucide-react";
import { TapToPair } from "@/app/components/practice/TapToPair";
import type { MatchDef } from "@/lib/lesson-engine/types";
import type { InteractionProps } from "@/lib/lesson-engine/registry";
import { shuffledPartners } from "@/lib/lesson-engine/shuffle";

/** Reuse the existing pairing mechanic; one submitted set is one scored item.
 * Neutral connections avoid revealing correctness before the whole set is answered. */
export default function CoachedMatch({ data: authoredData, support, onSolved }: InteractionProps<MatchDef>) {
  const data=presentInteraction(support?.scene,authoredData);
  const [round, setRound] = useState(0),
    [solved, setSolved] = useState(false),
    [feedback, setFeedback] = useState(""),
    [pendingAnswer, setPendingAnswer] = useState<boolean | null>(null);
  const submission=useRef<Record<string,string>>({});
  const active = useRef(true),
    generation = useRef(0),
    done = useRef(false);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const left = useMemo(() => data.pairs.map((p) => p.left), [data]);
  const right = useMemo(() => shuffledPartners(data.pairs.map(p=>p.right),left.join("|")),[data,left]);
  const pairs = useMemo(() => Object.fromEntries(data.pairs.map((p) => [p.left, p.right])), [data]);
  const canPlayItem = (text: string) => !data.silentLabels?.includes(text);
  const sayItem = (text: string) => {
    if (!canPlayItem(text)) return;
    if ((data.replayIsHelp || data.replayHelpLabels?.includes(text)) && !done.current) support?.help();
    support?.say(data.spoken?.[text] ?? text, undefined, `match:${text}`);
  };
  return (
    <div className={`le-activity le-match ${data.pairs.every(p=>/^[A-Za-z]$/.test(p.left)&&/^[A-Za-z]$/.test(p.right)) ? "le-match-letters" : ""} ${data.compactImages ? "le-match-compact-images" : ""}`} data-pair-count={data.pairs.length}>
      {solved && data.success ? (
        <div className="le-answer-reveal">
          <img className="le-answer-photo" src={data.success.image} alt={data.success.alt} />
          <div className="le-answer-card">
            <p><Karaoke text={data.success.sentence} caption={support?.narration?.caption ?? ""} activeWord={support?.narration?.activeWord ?? -1} /></p>
            <button
              className="le-listen"
              aria-label={`Hear ${data.success.sentence}`}
              onClick={() => support?.say(data.success!.sentence)}
            >
              <Volume2 size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div className="le-pair-board">
          <TapToPair
            key={round}
            prompt=""
            leftItems={left}
            rightItems={right}
            correctPairs={pairs}
            answered={solved}
            assessmentMode
            presentation="coached"
            renderLabel={text => <>
              {data.images?.[text] && <img className="le-match-picture" src={data.images[text].src} alt={data.images[text].alt} />}
              <Karaoke text={text} caption={itemNarrationCaption(`match:${text}`, support?.narration)} activeWord={support?.narration?.activeWord ?? -1} />
            </>}
            onPlayItem={sayItem}
            canPlayItem={canPlayItem}
            autoPlayOnSelect={data.autoPlayOnSelect ?? (data.replayHelpLabels ? text => !data.replayIsHelp && !data.replayHelpLabels!.includes(text) : !data.replayIsHelp)}
            audioLabel={text => data.spoken?.[text] ?? text}
            allowMatchedReplay
            onAnswer={(correct, _answer, pairs) => {
              submission.current=pairs??{};
              if (active.current && !done.current && generation.current === round)
                setPendingAnswer(correct);
            }}
          />
          {!solved && <button
            className={`le-primary le-check-matches ${pendingAnswer !== null ? "is-ready" : ""}`}
            disabled={pendingAnswer === null}
            onClick={() => {
              if (pendingAnswer === null) return;
              support?.stopVoice();
              const correct = pendingAnswer;
              if (!active.current || done.current || generation.current !== round) return;
              if (support?.answer("match", correct, {pairs:submission.current}) === false) {
                done.current = true;
                return;
              }
              setPendingAnswer(null);
              const text = correct
                ? support?.scene.feedback?.correct
                : support?.scene.feedback?.incorrect;
              setFeedback(text ?? "");
              if (text) support?.say(text);
              if (correct) {
                done.current = true;
                setSolved(true);
                onSolved({ correct: true });
              } else {
                generation.current++;
                setRound(generation.current);
              }
            }}
          >
            Check my matches
          </button>}
        </div>
      )}
      <p className={solved && data.success?.sentence === feedback ? "sr-only" : "le-feedback"} role="status">
        {feedback}
      </p>
    </div>
  );
}
