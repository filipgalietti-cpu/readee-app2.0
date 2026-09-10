"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Volume2, Mic } from "lucide-react";
import { Bunny, BunnyReaction } from "@/app/_components/Bunny/Bunny";
import LunaOrb, { type LunaMode } from "@/app/(protected)/luna/_components/LunaOrb";
import type { MicState } from "./mic";
import { readingPages } from "@/lib/placement/reading-pages";
import { PASS_CHOICE } from "@/lib/placement/spectrum";
import "./placement.css";

export type PlacementScreen =
  | { kind: "ready" }
  | { kind: "luna"; caption: string }
  | { kind: "mic"; status: MicState; retry: boolean }
  | {
      kind: "word";
      word: string;
      listening: boolean;
      nonsense?: boolean;
      band?: number;
      oral?: boolean;
      issue?: "quiet" | "technical";
    }
  | { kind: "tiles"; caption: string; tiles: string[]; picked: string | null }
  | {
      kind: "passage";
      title: string;
      text: string;
      reading: boolean;
      reached?: number;
      issue?: "quiet" | "technical";
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
            </button>
            {onRead && (
              <button
                className="pa-listen"
                aria-label={`Hear ${option.label}`}
                data-option-speaker={option.id}
                disabled={locked || readDisabled}
                onClick={() => onRead(option.id)}
              >
                <Volume2 size={21} />
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
                  ? "You can change your answer."
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
              Next <ArrowRight size={20} />
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
  return (
    <div className={`pa-reading-orb ${large ? "pa-orb-large" : ""}`}>
      <LunaOrb
        mode={mode}
        analyser={analyser}
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
}: {
  text: string;
  reached?: number;
  controls: HTMLElement | null;
}) {
  const [capacity, setCapacity] = useState(12);
  useEffect(() => {
    const resize = () =>
      setCapacity(
        window.innerWidth >= 900 && window.innerHeight >= 850
          ? 40
          : window.innerHeight >= 760
            ? 24
            : 12,
      );
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
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
      <div className="pa-book-page" data-story-page>
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
              <ArrowLeft size={24} />
            </button>
            <span>
              Page {page + 1} of {pages.length}
            </span>
            <button
              className="pa-primary"
              disabled={page >= pages.length - 1}
              onClick={() => setPage(page + 1)}
              aria-label="Next page"
            >
              <ArrowRight size={24} />
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
  exitHref = "/dashboard",
}: Props) {
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
              ? "Think about the story"
              : stage === "listening"
                ? "Listen to a story"
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
          <ArrowLeft size={18} /> <span>Back</span>
        </a>
        <span>{label}</span>
        <span className="pa-reader">{childName}</span>
      </header>
      <section className={`pa-stage pa-${screen.kind}`} aria-label="Current activity">
        {screen.kind === "ready" && (
          <div className="pa-intro">
            <h1>Hi, {childName}.</h1>
            <ReadingOrb mode="idle" large onTap={onBegin} label="Begin reading with Luna" />
            <p className="pa-intro-line">Let’s read a little together.</p>
            <button className="pa-primary" onClick={onBegin} data-begin>
              Start with Luna <ArrowRight size={20} />
            </button>
            <p className="pa-small">Your grown-up can stay nearby.</p>
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
        {screen.kind === "word" && (
          <div className="pa-word-task" data-word={screen.word} data-band={screen.band ?? ""}>
            <h1>
              {screen.oral
                ? "Put the sounds together."
                : screen.nonsense
                  ? "Try this make-believe word."
                  : "Read this word to Luna."}
            </h1>
            <p className={screen.oral ? "pa-oral-prompt" : "pa-reading-word"}>
              {screen.oral ? "Your turn" : screen.word}
            </p>
            <p className="pa-turn-status" role="status">
              {screen.issue === "technical"
                ? "Let’s try the microphone again. Your word is still here."
                : screen.issue === "quiet"
                  ? "Take your time. Try again, or pass this word."
                  : screen.listening
                    ? "Take your time. I’m listening."
                    : "Opening the microphone…"}
            </p>
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
            <div className="pa-prompt">
              <p className="pa-eyebrow">Think about the story</p>
              <h1>{screen.prompt}</h1>
            </div>
            {screen.passage && (
              <details className="pa-look-back" data-look-back key={screen.qid}>
                <summary className="pa-story-label">
                  <h2>{screen.passage.title}</h2>
                  <span>Look back ▾</span>
                </summary>
                <div
                  className="pa-look-back-scroll"
                  tabIndex={0}
                  aria-label="Look back at the story"
                >
                  <p>{screen.passage.text}</p>
                </div>
              </details>
            )}
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
            {screen.picked === null && (
              <button className="pa-text-pass" onClick={() => onTap(PASS_CHOICE)}>
                I don’t know yet
              </button>
            )}
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
              Try again <ArrowRight size={20} />
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
              <ArrowRight size={20} />
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
            <h1>You’re all done, {childName}.</h1>
            <p>{screen.error ?? "Your grown-up can join you now."}</p>
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
            {screen.kind === "passage" && <div className="pa-page-dock" ref={setPageHost} />}
            <div className="pa-mic-row">
              <ReadingOrb
                mode={listening ? "listening" : orb}
                analyser={analyser}
                onTap={screen.issue ? () => onTap("retry") : onFinish}
                label={screen.issue ? "Try the microphone again" : "Done speaking to Luna"}
              />
              <button
                className="pa-primary"
                onClick={screen.issue ? () => onTap("retry") : onFinish}
                disabled={!listening && !screen.issue}
                data-finish-speaking
              >
                <Mic size={24} />{" "}
                {screen.issue
                  ? "Try again"
                  : screen.kind === "passage"
                    ? "Done reading"
                    : "Done speaking"}
              </button>
            </div>
            <div className="pa-voice-actions">
              {onReplay && (
                <button className="pa-replay" onClick={onReplay} aria-label="Hear the sounds again">
                  <Volume2 size={24} /> Hear again
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
                  analyser={analyser}
                  size={64}
                  onTap={onReplay && orb !== "speaking" ? onReplay : undefined}
                  label="Hear the question again"
                />
              </div>
            )}
            <div className="pa-dock-action">
              {onReplay && !listening && (
                <button
                  className="pa-replay"
                  onClick={onReplay}
                  disabled={orb === "speaking"}
                  aria-label="Hear the prompt again"
                >
                  <Volume2 size={21} /> Hear again
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
