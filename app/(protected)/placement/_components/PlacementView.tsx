"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, useRef } from "react";
import { createPortal } from "react-dom";
import { Glyph } from "@/app/_components/Glyph";
import { subscribePlayback, getPlaybackAnalyser } from "./audio";
import { Bunny, BunnyReaction } from "@/app/_components/Bunny/Bunny";
import LunaOrb, { type LunaMode } from "@/app/(protected)/luna/_components/LunaOrb";
import type { MicState } from "./mic";
import { readingPages } from "@/lib/placement/reading-pages";
import { PASS_CHOICE } from "@/lib/placement/spectrum";
import AssessmentNameTurn from "./AssessmentNameTurn";
import "./placement.css";

export type PlacementScreen =
  | { kind: "ready" }
  | { kind: "name"; ready: boolean; childId: string }
  | { kind: "luna"; caption: string }
  | { kind: "mic"; status: MicState; retry: boolean }
  | {
      kind: "word";
      word: string;
      listening: boolean;
      nonsense?: boolean;
      practiceCorrect?: boolean;
      band?: number;
      oral?: boolean;
      issue?: "quiet" | "technical";
      thinking?: boolean;
    }
  | { kind: "tiles"; caption: string; tiles: string[]; picked: string | null }
  | {
      kind: "passage";
      title: string;
      text: string;
      reading: boolean;
      reached?: number;
      issue?: "quiet" | "technical";
      thinking?: boolean;
    }
  | {
      kind: "question";
      prompt: string;
      options: { id: string; label: string }[];
      picked: string | null;
      readingIdx: number;
      correctId?: string;
      speakers?: boolean;
      qid?: string;
      passage?: { title: string; text: string };
    }
  | { kind: "blocked"; reason: MicState | "audio" }
  | { kind: "recovery" }
  | { kind: "hesitation" }
  | { kind: "closing"; error: string | null };

type Props = {
  screen: PlacementScreen;
  stage: string;
  childName: string;
  outfitId: string | null;
  orb: LunaMode;
  analyser?: AnalyserNode | null;
  level: number;
  robot?: boolean;
  onBegin: () => void;
  onTap: (id: string) => void;
  onSkip: () => void;
  onFinish?: () => void;
  onRetry: () => void;
  onSave: () => void;
  onReplay?: () => void;
  onReadOption: (qid: string, id: string) => void;
  exitHref?: string;
};

/** The CoachedChoose card structure from Pip/Houses, without teaching feedback.
 * Selection is provisional until Next. Replay never submits an answer. */
function AnswerCards({
  options,
  picked,
  readingIdx = -1,
  onAnswer,
  onRead,
  readDisabled = false,
  robotKeys,
  actionHost,
}: {
  options: { id: string; label: string }[];
  picked: string | null;
  readingIdx?: number;
  onAnswer: (id: string) => void;
  onRead?: (id: string) => void;
  readDisabled?: boolean;
  robotKeys?: string;
  actionHost: HTMLElement | null;
}) {
  const [selected, setSelected] = useState<string | null>(picked);
  const [submitted, setSubmitted] = useState(false);
  const locked = picked !== null || submitted;
  return (
    <>
      <div className="pa-options">
        {options.map((option, i) => (
          <div
            key={option.id}
            className={`pa-option ${readingIdx === i ? "is-reading" : ""} ${selected === option.id ? "is-selected" : ""}`}
          >
            <button
              className="pa-tile"
              data-option-id={option.id}
              data-tile={option.id}
              data-correct={robotKeys === option.id ? "1" : undefined}
              aria-pressed={selected === option.id}
              disabled={locked}
              onClick={() => setSelected(option.id)}
            >
              <span>{option.label}</span>
              <span className="pa-selection-slot" aria-hidden="true">
                {selected === option.id && <Glyph name="check" size={24} className="pa-selected-mark" />}
              </span>
            </button>
            {onRead && (
              <button
                className="pa-listen"
                aria-label={`Hear ${option.label}`}
                data-option-speaker={option.id}
                disabled={locked || readDisabled}
                onClick={() => onRead(option.id)}
              >
                <Glyph name="volume2" size={21} />
              </button>
            )}
          </div>
        ))}
      </div>
      {actionHost &&
        createPortal(
          <div className="pa-answer-action">
            <span aria-live="polite">
              {locked
                ? "Answer saved for this activity"
                : selected
                  ? "Selected. Tap Next."
                  : "Choose an answer."}
            </span>
            <button
              className="pa-primary"
              disabled={!selected || locked}
              data-confirm-answer
              onClick={() => {
                if (selected && !locked) {
                  setSubmitted(true);
                  onAnswer(selected);
                }
              }}
            >
              Next <Glyph name="arrow-right" size={20} />
            </button>
          </div>,
          actionHost,
        )}
    </>
  );
}

function ReadingOrb({
  mode,
  analyser,
  large = false,
  onTap,
  label,
}: {
  mode: LunaMode;
  analyser?: AnalyserNode | null;
  large?: boolean;
  onTap?: () => void;
  label: string;
}) {
  const playbackAnalyser = useSyncExternalStore(subscribePlayback, getPlaybackAnalyser, () => null);
  return (
    <div className={`pa-reading-orb ${large ? "pa-orb-large" : ""}`}>
      <LunaOrb
        mode={mode}
        analyser={mode === "speaking" ? playbackAnalyser : analyser}
        voiceDriven
        responsive
        size={large ? 156 : 104}
        onTap={onTap}
        label={label}
      />
    </div>
  );
}

function StoryPages({
  text,
  reached = 0,
  controls,
  onFinish,
  disabled,
}: {
  text: string;
  reached?: number;
  controls: HTMLElement | null;
  onFinish?: () => void;
  disabled: boolean;
}) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [capacity, setCapacity] = useState(12);
  useEffect(() => {
    const card = pageRef.current;
    const stage = card?.closest<HTMLElement>(".pa-stage");
    const article = card?.parentElement;
    if (!card || !stage || !article) return;
    let frame = 0;
    const fit = () => {
      const stageStyle = getComputedStyle(stage);
      const articleStyle = getComputedStyle(article);
      const siblings = [...article.children].filter(
        (el) => el !== card && !el.classList.contains("pa-robot"),
      );
      const available =
        stage.clientHeight -
        parseFloat(stageStyle.paddingTop) -
        parseFloat(stageStyle.paddingBottom) -
        siblings.reduce((sum, el) => sum + el.getBoundingClientRect().height, 0) -
        siblings.length * parseFloat(articleStyle.rowGap || "0") -
        4;
      const measure = card.cloneNode(true) as HTMLDivElement;
      measure.removeAttribute("data-story-page");
      Object.assign(measure.style, {
        position: "absolute",
        visibility: "hidden",
        width: `${card.getBoundingClientRect().width}px`,
        pointerEvents: "none",
      });
      article.appendChild(measure);
      try {
        let limit = window.innerWidth >= 900 ? 48 : 32;
        for (; limit > 6; limit--) {
          if (
            readingPages(text, limit).every((p) => {
              measure.querySelector("p")!.textContent = p.text;
              return measure.getBoundingClientRect().height <= available;
            })
          )
            break;
        }
        setCapacity(limit);
      } finally {
        measure.remove();
      }
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    schedule();
    const observer = new ResizeObserver(schedule);
    observer.observe(stage);
    window.addEventListener("resize", schedule);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [text, disabled]);
  const pages = useMemo(() => readingPages(text, capacity), [text, capacity]);
  const [navigation, setNavigation] = useState({ pages, reached, page: 0 });
  let page = navigation.page;
  if (navigation.pages !== pages || navigation.reached !== reached) {
    const following = pages.findIndex((p) => p.endWord > reached);
    const next = following < 0 ? pages.length - 1 : following;
    page = Math.min(pages.length - 1, Math.max(page, next));
    // Adjust before rendering so recognition advances immediately; manual page
    // turns remain available until the next recognized phrase or viewport change.
    setNavigation({ pages, reached, page });
  }
  const setPage = (next: number) => setNavigation({ pages, reached, page: next });
  return (
    <>
      <div className="pa-book-page" data-story-page ref={pageRef}>
        <p>{pages[Math.min(page, pages.length - 1)]?.text}</p>
      </div>
      {controls &&
        createPortal(
          <nav className="pa-page-controls" aria-label="Story pages">
            <button
              className="pa-secondary"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              aria-label="Previous page"
            >
              <Glyph name="arrow-left" size={24} />
            </button>
            <span>
              Page {page + 1} of {pages.length}
            </span>
            <button
              className="pa-primary"
              disabled={disabled}
              onClick={() => (page >= pages.length - 1 ? onFinish?.() : setPage(page + 1))}
              data-finish-speaking={page >= pages.length - 1 ? "" : undefined}
              aria-label={page >= pages.length - 1 ? "Finish story" : "Next page"}
            >
              {page >= pages.length - 1 ? "Finish story" : "Next page"}
              <Glyph name="arrow-right" size={24} />
            </button>
          </nav>,
          controls,
        )}
    </>
  );
}

export default function PlacementView({
  screen,
  stage,
  childName,
  outfitId,
  orb,
  analyser,
  level,
  robot,
  onBegin,
  onTap,
  onSkip,
  onFinish,
  onRetry,
  onSave,
  onReplay,
  onReadOption,
  exitHref = "/explore",
}: Props) {
  const playbackAnalyser = useSyncExternalStore(subscribePlayback, getPlaybackAnalyser, () => null);
  const [actionHost, setActionHost] = useState<HTMLDivElement | null>(null);
  const [pageHost, setPageHost] = useState<HTMLDivElement | null>(null);
  const listening =
    (screen.kind === "mic" && screen.status === "open" && orb !== "speaking") ||
    (screen.kind === "word" && screen.listening) ||
    (screen.kind === "passage" && screen.reading);
  const voiceTask = screen.kind === "word" || screen.kind === "passage";
  const inTaskOrb = [
    "ready",
    "luna",
    "mic",
    "word",
    "passage",
    "blocked",
    "recovery",
    "closing",
  ].includes(screen.kind);
  const label =
    stage === "warmup"
      ? "Try one together"
      : stage === "foundations"
        ? "Sounds & words"
        : stage === "words"
          ? "Read with Luna"
          : stage === "passage"
            ? "Read a story"
            : stage === "comprehension"
              ? "Read and think"
              : stage === "listening"
                ? "Listen and answer"
                : "Reading with Luna";
  const mode = listening ? "listening" : orb;
  return (
    <main
      className={`pa-frame ${voiceTask ? "pa-voice-frame" : ""} ${screen.kind === "passage" ? "pa-book-frame" : ""}`}
      data-placement-stage={stage}
      data-screen={screen.kind}
    >
      <header className="pa-top" data-runner-header>
        <a href={exitHref} className="pa-exit" aria-label="Leave assessment">
          <Glyph name="arrow-left" size={18} /> <span>Back</span>
        </a>
        <span>{label}</span>
        <span className="pa-reader">{childName}</span>
      </header>
      <section className={`pa-stage pa-${screen.kind}`} aria-label="Current activity">
        {screen.kind === "ready" && (
          <div className="pa-intro">
            <h1>Hi, {childName}.</h1>
            <ReadingOrb mode="idle" large onTap={onBegin} label="Begin reading with Luna" />
            <p className="pa-intro-line">Ready to read with Luna?</p>
            <button className="pa-primary" onClick={onBegin} data-begin>
              Start with Luna <Glyph name="arrow-right" size={20} />
            </button>
          </div>
        )}
        {screen.kind === "luna" && (
          <div className="pa-intro" data-caption>
            <ReadingOrb mode={orb} analyser={analyser} large label="Luna is speaking" />
            <h1 className="pa-spoken">{screen.caption}</h1>
          </div>
        )}
        {screen.kind === "mic" && (
          <div className="pa-intro" data-mic-check>
            <p className="pa-eyebrow">Before we read</p>
            <h1>Say “hello, Luna.”</h1>
            <ReadingOrb mode={mode} analyser={analyser} large label="Microphone check with Luna" />
            <p className="pa-intro-line">
              {screen.retry
                ? "I didn’t hear you yet. Try once more."
                : "Use your normal reading voice."}
            </p>
            <div className="pa-sound-state" role="status">
              <span className={level > 0.12 ? "is-hearing" : ""} />
              {orb === "speaking"
                ? "Listen to Luna first"
                : level > 0.12
                  ? "Luna can hear sound"
                  : "Listening for your hello…"}
            </div>
          </div>
        )}
        {screen.kind === "name" && <AssessmentNameTurn childId={screen.childId} name={childName} ready={screen.ready} onDone={() => onTap("continue")} />}
        {screen.kind === "word" && (
          <div className="pa-word-task" data-word={screen.word} data-band={screen.band ?? ""}>
            <h1>
              {screen.oral
                ? "Put the sounds together."
                : screen.nonsense
                  ? "Try this make-believe word."
                  : "Read this word to Luna."}
            </h1>
            <p
              className={
                screen.oral
                  ? "pa-oral-prompt"
                  : `pa-reading-word ${screen.word.length > 9 ? "pa-long-word" : ""} ${screen.practiceCorrect ? "is-practice-correct" : ""}`
              }
            >
              {screen.oral ? "Your turn" : screen.word.toLowerCase()}
            </p>
            {(
              <p className={`pa-turn-status ${!screen.issue && !screen.thinking && screen.listening || screen.practiceCorrect ? "is-empty" : ""}`} role="status">
                {screen.issue === "technical"
                  ? "Let’s try the microphone again. Your word is still here."
                  : screen.thinking
                    ? "Say the word, or tap I don’t know."
                    : screen.issue === "quiet"
                    ? "I didn’t catch that. Try again, or pass."
                    : screen.listening
                      ? ""
                      : "Opening the microphone…"}
              </p>
            )}
            {robot && screen.listening && (
              <div className="pa-robot" data-robot-controls>
                <button data-robot="correct" onClick={() => onTap("correct")}>
                  Read it · QA
                </button>
                <button data-robot="wrong" onClick={() => onTap("wrong")}>
                  Missed it · QA
                </button>
              </div>
            )}
          </div>
        )}
        {screen.kind === "tiles" && (
          <div className="pa-task">
            <div className="pa-prompt">
              <p className="pa-eyebrow">Listen, then choose</p>
              <h1>{screen.caption}</h1>
            </div>
            <div className="pa-letter-choices">
              <AnswerCards
                actionHost={actionHost}
                key={
                  screen.tiles.join("|") +
                  screen.caption +
                  (screen.picked === null ? "open" : "answered")
                }
                options={screen.tiles.map((t) => ({ id: t, label: t }))}
                picked={screen.picked}
                onAnswer={onTap}
              />
            </div>
            {screen.picked === null && (
              <button className="pa-text-pass" onClick={() => onTap(PASS_CHOICE)}>
                I don’t know yet
              </button>
            )}
          </div>
        )}
        {screen.kind === "passage" && (
          <article className="pa-reading-page" data-passage-reading={screen.reading ? "1" : "0"}>
            <div className="pa-prompt">
              <p className="pa-eyebrow">Read out loud</p>
              <h1>{screen.title}</h1>
            </div>
            <StoryPages
              key={screen.text}
              text={screen.text}
              reached={screen.reached}
              controls={pageHost}
              onFinish={onFinish}
              disabled={!screen.reading || !!screen.issue}
            />
            {screen.issue && (
              <p className="pa-turn-status" role="status">
                Your story is still here. Try the microphone again, or skip this story.
              </p>
            )}
            {robot && screen.reading && (
              <form
                className="pa-robot"
                data-robot-passage
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = e.currentTarget;
                  onTap(
                    `${(f.elements.namedItem("c") as HTMLInputElement).value}/${(f.elements.namedItem("t") as HTMLInputElement).value}`,
                  );
                }}
              >
                <input name="c" defaultValue="60" aria-label="words correct" />
                <span>of</span>
                <input name="t" defaultValue="70" aria-label="words attempted" />
                <button data-robot="passage">Done · QA</button>
              </form>
            )}
          </article>
        )}
        {screen.kind === "question" && (
          <div className="pa-question-task" data-question>
            {screen.passage && (
              <section
                className="pa-look-back"
                data-look-back
                key={screen.qid}
                aria-label="Story text"
              >
                <h2 className="pa-story-label">{screen.passage.title}</h2>
                <div
                  className="pa-look-back-scroll"
                  tabIndex={0}
                  aria-label="Look back at the story"
                >
                  <p>{screen.passage.text}</p>
                </div>
              </section>
            )}
            <div className="pa-question-answers">
              <div className="pa-prompt">
                <h1>{screen.prompt}</h1>
              </div>
              <AnswerCards
                actionHost={actionHost}
                key={(screen.qid ?? screen.prompt) + (screen.picked === null ? "open" : "answered")}
                options={screen.options}
                picked={screen.picked}
                readingIdx={screen.readingIdx}
                onAnswer={onTap}
                robotKeys={screen.correctId}
                readDisabled={orb === "speaking"}
                onRead={screen.qid ? (id) => onReadOption(screen.qid!, id) : undefined}
              />

            </div>
          </div>
        )}
        {screen.kind === "hesitation" && (
          <div className="pa-intro pa-help" role="status">
            <ReadingOrb mode={orb} large label="Luna is waiting" />
            <h1>Take your time.</h1>
            <p>
              You can try this word again. If you don’t know it, choose “I don’t know this word.”
            </p>
            <button className="pa-primary" onClick={() => onTap("retry")}>
              Try again <Glyph name="arrow-right" size={20} />
            </button>
            <button className="pa-secondary" onClick={() => onTap("pass")}>
              I don’t know this word
            </button>
            <a className="pa-text-link" href={exitHref}>
              Come back later
            </a>
          </div>
        )}
        {(screen.kind === "blocked" || screen.kind === "recovery") && (
          <div
            className="pa-intro pa-help"
            role="alert"
            data-blocked={screen.kind === "blocked" ? screen.reason : undefined}
          >
            <ReadingOrb mode="idle" large label="Luna is waiting" />
            <h1>
              {screen.kind === "blocked" && screen.reason === "audio"
                ? "Luna’s sound didn’t play."
                : "Luna couldn’t hear you."}
            </h1>
            <p>
              {screen.kind === "blocked" && screen.reason === "audio"
                ? "Grown-up: check the volume and connection, then try again."
                : screen.kind === "blocked" && screen.reason === "denied"
                  ? "Grown-up: allow the microphone in your browser’s site settings, then try again."
                  : "Grown-up: check the microphone and connection, then try again."}
            </p>
            <p className="pa-small">This hasn’t counted as a wrong answer.</p>
            <button
              className="pa-primary"
              onClick={screen.kind === "recovery" ? () => onTap("retry") : onRetry}
            >
              {screen.kind === "recovery"
                ? "Try this part again"
                : screen.reason === "audio"
                  ? "Try sound again"
                  : "Check microphone again"}
              <Glyph name="arrow-right" size={20} />
            </button>
            <a className="pa-text-link" href={exitHref}>
              Come back later
            </a>
          </div>
        )}
        {screen.kind === "closing" && (
          <div className="pa-intro" data-closing>
            <ReadingOrb
              mode={screen.error ? "idle" : "thinking"}
              large
              label="Luna is preparing your results"
            />
            <h1>Saving your reading</h1>
            <p>{screen.error ?? "Keep this page open for a moment."}</p>
            {screen.error ? (
              <button className="pa-primary" onClick={onSave}>
                Save my results again
              </button>
            ) : (
              <p className="pa-small" role="status">
                Saving your answers…
              </p>
            )}
          </div>
        )}
      </section>
      <footer className={`pa-dock ${voiceTask ? "pa-voice-dock" : ""}`}>
        {voiceTask ? (
          <>
            {screen.kind === "word" && <div className="pa-word-bunny" data-bunny aria-hidden="true"><Bunny outfitId={outfitId ?? "bunny_classic"} /></div>}
            {screen.kind === "passage" && <div className="pa-page-dock" ref={setPageHost} />}
            <div className="pa-mic-row">
              <ReadingOrb
                mode={listening ? "listening" : orb}
                analyser={analyser}
                onTap={
                  screen.issue
                    ? () => onTap("retry")
                    : screen.kind === "word"
                      ? onFinish
                      : undefined
                }
                label={
                  screen.issue
                    ? "Try the microphone again"
                    : screen.kind === "passage"
                      ? "Luna is listening to the story"
                      : "Done speaking to Luna"
                }
              />
              {(screen.kind === "word" || screen.issue) && (
                <button
                  className="pa-primary"
                  onClick={screen.issue ? () => onTap("retry") : onFinish}
                  disabled={!listening && !screen.issue}
                  data-finish-speaking
                >
                  <Glyph name="mic" size={24} />{" "}
                  {screen.issue
                    ? "Try again"
                    : screen.kind === "passage"
                      ? "Try again"
                      : "Done speaking"}
                </button>
              )}
            </div>
            <div className="pa-voice-actions">
              {onReplay && (
                <button className="pa-replay" onClick={onReplay} aria-label="Hear the sounds again">
                  <Glyph name="volume2" size={24} /> Hear again
                </button>
              )}
              <button
                className="pa-secondary"
                onClick={onSkip}
                disabled={!listening && !screen.issue && !robot}
                data-skip-word={screen.kind === "word" ? "" : undefined}
                data-skip-story={screen.kind === "passage" ? "" : undefined}
              >
                {screen.kind === "passage"
                  ? "Skip this story"
                  : screen.oral
                    ? "I don’t know yet"
                    : "I don’t know this word"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="pa-bunny" data-bunny aria-hidden="true">
              {screen.kind === "ready" || screen.kind === "closing" ? (
                <BunnyReaction outfitId={outfitId ?? "bunny_classic"} state="wave" />
              ) : (
                <Bunny outfitId={outfitId ?? "bunny_classic"} />
              )}
            </div>
            {!inTaskOrb && (
              <div className="pa-narrator">
                <LunaOrb
                  mode={orb}
                  analyser={orb === "speaking" ? playbackAnalyser : analyser}
                  voiceDriven
                  responsive
                  size={64}
                  onTap={onReplay && orb !== "speaking" ? onReplay : undefined}
                  label="Hear the question again"
                />
              </div>
            )}
            <div className="pa-dock-action">
              {screen.kind === "question" && <button className="pa-replay" disabled={screen.picked !== null} onClick={() => onTap(PASS_CHOICE)}>Pass</button>}
              {onReplay && !listening && (
                <button
                  className="pa-replay"
                  onClick={onReplay}
                  disabled={orb === "speaking"}
                  aria-label="Hear the prompt again"
                >
                  <Glyph name="volume2" size={21} /> Hear again
                </button>
              )}
            </div>
            <div className="pa-answer-dock" ref={setActionHost} />
          </>
        )}
      </footer>
    </main>
  );
}
