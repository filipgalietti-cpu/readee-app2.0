"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChooseDef } from "@/lib/lesson-engine/types";
import type { InteractionProps } from "@/lib/lesson-engine/registry";
import { playUrl, sfxCorrect, sfxWrong, playTryAgain } from "@/lib/lesson-engine/cues";
import { Volume2 } from "lucide-react";
import { spokenChoiceId } from "@/lib/lesson-engine/delivery/spoken-choice";
import LessonImage from "../LessonImage";
import PrintedPage from "./PrintedPage";
import Karaoke from "./Karaoke";
import { presentInteraction } from "@/lib/lesson-engine/delivery/presentation";
import { printPageText, repairedPrintPage } from "@/lib/lesson-engine/delivery/print-page";
export default function Choose({
  data: authoredData,
  support,
  onSolved,
  onWrong,
  feedbackAudio,
}: InteractionProps<ChooseDef>) {
  const data=presentInteraction(support?.scene,authoredData);
  const [picked, setPicked] = useState<string | null>(null),
    [feedback, setFeedback] = useState(""),
    [resolved, setResolved] = useState(false),
    [solved, setSolved] = useState(false);
  const found = useRef(new Set<string>());
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const attempts = useRef(0),
    done = useRef(false);
  const options = useMemo(
    () => data.options, // Narrated choices and visible choices share authored order.
    [data.options],
  );
  useEffect(() => {
    if (!picked || !done.current || !data.success || support?.deferFeedback) return;
    const timer = setTimeout(
      () => setResolved(true),
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 380,
    );
    return () => clearTimeout(timer);
  }, [picked, data.success, support?.deferFeedback]);
  const read = (text: string, audio?: string, choiceId?: string) => {
    if (support) support.say(text, undefined, choiceId);
    else if (audio) playUrl(audio);
  };
  const pick = (id: string) => {
    if (done.current) return;
    if (support?.deferFeedback) {
      // Selection acknowledgement is identical for correct and incorrect responses.
      done.current = true;
      setSolved(true);
      setPicked(id);
      support.answer("answer", (data.acceptedIds ?? [data.correctId]).includes(id), {choice:id});
      return;
    }
    if (data.mode === "reflection") {
      if (!support?.reflect || support.reflect("answer") === false) return;
      done.current = true;
      setSolved(true);
      setPicked(id);
      const selected = options.find((o) => o.id === id)!;
      const thanks = support.scene.feedback?.correct ?? "";
      setFeedback(thanks);
      support.say(selected.spoken ?? selected.label, () => support.say(thanks));
      return;
    }
    if (data.collectAll?.ids.includes(id)) {
      if (found.current.has(id)) return;
      found.current.add(id);
      setFoundIds([...found.current]);
      setPicked(null);
      if (!data.collectAll.ids.every(target => found.current.has(target))) {
        setFeedback(data.collectAll.progressScript);
        read(data.collectAll.progressScript);
        return;
      }
    }
    attempts.current++;
    const correct = (data.collectAll?.ids ?? data.acceptedIds ?? [data.correctId]).includes(id);
    if (support?.answer("answer", correct, data.collectAll?{choices:correct?[...found.current]:[id]}:{choice:id}) === false) return;
    setPicked(id);
    if (correct) {
      done.current = true;
      setSolved(true);
      const visual = options.find((o) => o.id === id)?.visual;
      if (visual) support?.visual(visual);
      setFeedback(support?.scene.feedback?.correct ?? "Correct.");
      if (!support) sfxCorrect();
      if (data.acceptedIds && support) {
        const selected = options.find((o) => o.id === id)!;
        support.say(selected.spoken ?? selected.label, () =>
          support.say(support.scene.feedback?.correct ?? ""),
        );
      } else
        read(
          support?.scene.feedback?.correct ?? options.find((o) => o.id === id)!.label,
          options.find((o) => o.id === id)?.audio,
        );
      onSolved({ correct: true, attempts: attempts.current });
    } else {
      onWrong?.();
      if (!support) sfxWrong();
      const text =
        support?.scene.feedback?.byChoice?.[id] ??
        support?.scene.feedback?.incorrect ??
        data.coachWrong ??
        "Try again.";
      setFeedback(text);
      if (support) read(text);
      else if (feedbackAudio?.hint) playUrl(feedbackAudio.hint);
      else playTryAgain();
    }
  };
  const spokenId = spokenChoiceId(options, support?.narration);
  const revealing = !!picked && solved && !!data.success && !support?.deferFeedback;
  const visiblePage = data.printPage && solved && data.printRepair && !support?.deferFeedback
    ? repairedPrintPage(data.printPage, data.printRepair) : data.printPage;
  return (
    <div
      className={`le-activity le-choose ${data.options.every(o=>/^[A-Za-z]$/.test(o.label)) ? "le-letter-choices" : ""} ${data.mode === "reflection" ? "le-reflection" : ""} ${revealing ? "le-revealing" : ""}`}
    >
      {resolved && data.success ? (
        <div className="le-answer-reveal">
          <img className="le-answer-photo" src={data.success.image} alt={data.success.alt} />
          <div className="le-answer-card">
            <p>{data.success.sentence}</p>
            <button
              className="le-listen"
              aria-label={`Hear ${data.success.sentence}`}
              onClick={() => read(data.success!.sentence)}
            >
              <Volume2 size={20} />
            </button>
          </div>
        </div>
      ) : data.printPage ? (
        <div>
          <PrintedPage
            page={visiblePage!}
            picked={picked}
            foundIds={foundIds}
            solved={solved}
            neutralSelection={support?.deferFeedback}
            onPick={pick}
            caption={support?.narration?.caption}
            activeWord={support?.narration?.activeWord}
          />
          <div className="le-print-tools">
            <button
              type="button"
              className="le-print-replay"
              aria-label="Hear the page"
              onClick={() => {
                if (!done.current) support?.help();
                read(printPageText(visiblePage!));
              }}
            >
              <Volume2 size={18} /> Hear the page
            </button>
          </div>
        </div>
      ) : (
        <>
          {data.stimulus && !revealing && <img className="le-choice-stimulus" src={data.stimulus.src} alt={data.stimulus.alt} />}
          <div className="le-options" data-choice-count={options.length}>
            {options.map((o) => (
              <div
                data-choice-id={o.id}
                onClick={(event) => {
                  // The visible card includes space outside its two native buttons.
                  // Keep answer/replay button clicks independent and count a card tap once.
                  if (event.target instanceof Element && event.target.closest("button")) return;
                  pick(o.id);
                }}
                data-reading={spokenId === o.id ? "true" : undefined}
                className={`le-option ${spokenId === o.id ? "le-option-reading" : ""} ${revealing ? (picked === o.id ? "le-chosen" : "le-fade-choice") : ""}`}
                key={o.id}
              >
                <button
                  className={`le-tile ${o.wordImage ? "le-word-choice-tile" : ""} ${picked === o.id ? (support?.deferFeedback ? "is-selected le-selection-registered" : data.mode === "reflection" ? "is-selected" : solved ? "is-correct" : "is-retry") : ""}`}
                  aria-label={o.label}
                  aria-pressed={support?.deferFeedback || data.mode === "reflection" ? picked === o.id : undefined}
                  disabled={solved}
                  onClick={() => pick(o.id)}
                >
                  {o.wordImage && !o.image && <img className="le-word-choice-picture" src={o.wordImage} alt="" />}
                  {o.image && <LessonImage src={o.image} containerClassName="le-choice-art" />}
                  <span className={o.displayLines ? "le-choice-lines" : undefined}>{o.displayLines ? o.displayLines.map((line,index)=><span className="le-choice-line" key={index}>{o.displayImages?.[index] && <img src={o.displayImages[index]} alt=""/>}<Karaoke text={line} caption={spokenId === o.id ? (support?.narration?.caption ?? "") : ""} activeWord={support?.narration?.activeWord ?? -1}/></span>) : data.autoReadChoices ? (o.spoken && !/[\p{L}\p{N}]/u.test(o.label)
                    ? <span className={spokenId === o.id ? "le-word-active" : undefined}>{o.label}</span>
                    : <Karaoke text={o.label} caption={spokenId === o.id ? (support?.narration?.caption ?? "") : ""} activeWord={support?.narration?.activeWord ?? -1} />) : o.label}</span>
                </button>
                <button
                  className="le-listen"
                  aria-label={`Hear ${o.label}`}
                  onClick={() => {
                    if (data.replayIsHelp && !done.current) support?.help();
                    read(o.spoken ?? o.label, o.audio, o.id);
                  }}
                >
                  <Volume2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      <p className="le-feedback" role="status">
        {feedback}
      </p>
    </div>
  );
}
