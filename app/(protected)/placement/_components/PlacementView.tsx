"use client";

import { Bunny, BunnyReaction } from "@/app/_components/Bunny/Bunny";
import { FluentIcon } from "@/app/_components/FluentIcon";
import LunaOrb, { type LunaMode } from "@/app/(protected)/luna/_components/LunaOrb";
import type { MicState } from "./mic";
import "./placement.css";

export type PlacementScreen =
  | { kind: "ready" }
  | { kind: "luna"; caption: string }
  | { kind: "mic"; status: MicState; retry: boolean }
  | { kind: "word"; word: string; listening: boolean; nonsense?: boolean; band?: number }
  | { kind: "tiles"; caption: string; tiles: string[]; picked: string | null }
  | { kind: "passage"; title: string; text: string; reading: boolean }
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
  | { kind: "closing"; error: string | null };

const CHAPTERS = ["Get ready", "Sounds & words", "A story", "Story questions"];
function chapterFor(stage: string) {
  if (["warmup", "foundations", "words"].includes(stage)) return 1;
  if (["passage", "listening"].includes(stage)) return 2;
  if (["comprehension", "closing"].includes(stage)) return 3;
  return 0;
}

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
  onRetry: () => void;
  onSave: () => void;
  onReplay?: () => void;
  onReadOption: (qid: string, id: string) => void;
  exitHref?: string;
};

/** Assessment presentation follows the golden lesson frame, with neutral examiner feedback. */
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
  onRetry,
  onSave,
  onReplay,
  onReadOption,
  exitHref = "/dashboard",
}: Props) {
  const chapter = chapterFor(stage);
  const listening =
    screen.kind === "mic" ||
    (screen.kind === "word" && screen.listening) ||
    (screen.kind === "passage" && screen.reading);
  const status = listening
    ? "I’m listening"
    : orb === "speaking"
      ? "Listen to Luna"
      : screen.kind === "ready"
        ? "Ready when you are"
        : screen.kind === "closing"
          ? "Putting your journey together"
          : "Take your time";
  return (
    <main className="pa-frame" data-placement-stage={stage}>
      <header className="pa-top" data-runner-header>
        <a className="pa-exit" href={exitHref} aria-label="Leave assessment">
          Back
        </a>
        <span className="pa-title">Reading with Luna</span>
        <span className="pa-reader">{childName}</span>
      </header>
      <ol className="pa-chapters" aria-label="Assessment sections">
        {CHAPTERS.map((label, i) => (
          <li
            key={label}
            aria-current={i === chapter ? "step" : undefined}
            className={i === chapter ? "is-current" : ""}
          >
            <span aria-hidden="true">{i + 1}</span>
            <span>{label}</span>
          </li>
        ))}
      </ol>
      <section className={`pa-stage pa-${screen.kind}`} aria-label="Current activity">
        {screen.kind === "ready" && (
          <div className="pa-welcome">
            <div className="pa-welcome-art" aria-hidden="true">
              <BunnyReaction outfitId={outfitId ?? "bunny_classic"} state="wave" />
            </div>
            <div className="pa-welcome-copy">
              <h1>
                Let’s find your
                <br />
                reading adventure.
              </h1>
              <p>
                Hi, {childName}. We’ll try some words and a story together. Some might be easy. Some
                might be tricky. That’s okay.
              </p>
              <div className="pa-preview-steps">
                <span>
                  <FluentIcon name="microphone" size={25} /> Say hello
                </span>
                <span>
                  <FluentIcon name="memo" size={25} /> Try some words
                </span>
                <span>
                  <FluentIcon name="open-book" size={25} /> Explore a story
                </span>
              </div>
              <button className="pa-primary" onClick={onBegin} data-begin>
                Let’s begin
              </button>
              <p className="pa-parent-note">
                Grown-up: stay nearby for the microphone check. Let your reader answer
                independently.
              </p>
            </div>
          </div>
        )}
        {screen.kind === "luna" && (
          <div className="pa-instruction" data-caption>
            <div className="pa-section-art">
              <FluentIcon
                name={chapter === 2 ? "open-book" : chapter === 3 ? "lightbulb" : "microphone"}
                size={68}
              />
            </div>
            <h1>{screen.caption}</h1>
          </div>
        )}
        {screen.kind === "mic" && (
          <div className="pa-instruction" data-mic-check>
            <div className="pa-section-art">
              <FluentIcon name="microphone" size={68} />
            </div>
            <h1>{screen.retry ? "Let’s hear your hello." : "Say hello to Luna."}</h1>
            <p>Use your normal reading voice. Watch the sound bar move.</p>
            <div
              className="pa-meter"
              role="meter"
              aria-label="Microphone sound level"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(level * 100)}
            >
              <span style={{ width: `${Math.max(2, Math.round(level * 100))}%` }} />
            </div>
            <p className="pa-small">This is just a microphone check.</p>
          </div>
        )}
        {screen.kind === "word" && (
          <div className="pa-word-task" data-word={screen.word} data-band={screen.band ?? ""}>
            <p className="pa-task-label">
              {screen.nonsense
                ? "A make-believe word. Try sounding it out."
                : "Read this word out loud."}
            </p>
            <div className="pa-word-card">
              <span>{screen.word}</span>
            </div>
            <p className="pa-small">
              {screen.listening
                ? "Take your time. It’s okay if you don’t know it."
                : "Getting the microphone ready…"}
            </p>
            <button
              className="pa-secondary"
              onClick={onSkip}
              disabled={!screen.listening && !robot}
              data-skip-word
            >
              I don’t know this word
            </button>
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
            <h1>{screen.caption}</h1>
            <div className="pa-tiles">
              {screen.tiles.map((t) => (
                <button
                  key={t}
                  data-tile={t}
                  disabled={screen.picked !== null}
                  aria-pressed={screen.picked === t}
                  onClick={() => onTap(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
        {screen.kind === "passage" && (
          <article className="pa-reading-page" data-passage-reading={screen.reading ? "1" : "0"}>
            <div className="pa-reading-heading">
              <FluentIcon name="open-book" size={30} />
              <h1>{screen.title}</h1>
            </div>
            <p className="pa-task-label">Read out loud. If a word is tricky, keep going.</p>
            <div className="pa-passage-scroll" tabIndex={0} aria-label={screen.title}>
              <p>{screen.text}</p>
            </div>
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
          <div className={`pa-question-task ${screen.passage ? "has-passage" : ""}`} data-question>
            {screen.passage && (
              <aside className="pa-look-back" data-look-back>
                <div className="pa-reading-heading">
                  <FluentIcon name="open-book" size={25} />
                  <h2>{screen.passage.title}</h2>
                </div>
                <p className="pa-small">You can look back at the story.</p>
                <div
                  className="pa-look-back-scroll"
                  tabIndex={0}
                  aria-label="Look back at the story"
                >
                  <p>{screen.passage.text}</p>
                </div>
              </aside>
            )}
            <div className="pa-question-answers">
              <h1>{screen.prompt}</h1>
              <div className="pa-options">
                {screen.options.map((o, i) => (
                  <div className="pa-option" key={o.id}>
                    <button
                      className={screen.readingIdx === i ? "is-reading" : ""}
                      data-option-id={o.id}
                      data-correct={screen.correctId === o.id ? "1" : undefined}
                      disabled={screen.picked !== null}
                      aria-pressed={screen.picked === o.id}
                      onClick={() => onTap(o.id)}
                    >
                      <span className="pa-choice-mark" aria-hidden="true">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span>{o.label}</span>
                    </button>
                    {screen.speakers && screen.qid && (
                      <button
                        className="pa-option-speaker"
                        aria-label={`Read choice ${String.fromCharCode(65 + i)} aloud`}
                        data-option-speaker={o.id}
                        disabled={screen.picked !== null || orb === "speaking"}
                        onClick={() => onReadOption(screen.qid!, o.id)}
                      >
                        <FluentIcon name="speaker" size={22} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {(screen.kind === "blocked" || screen.kind === "recovery") && (
          <div
            className="pa-instruction pa-help"
            role="alert"
            data-blocked={screen.kind === "blocked" ? screen.reason : undefined}
          >
            <div className="pa-section-art">
              <FluentIcon name="microphone" size={60} />
            </div>
            <h1>
              {screen.kind === "recovery"
                ? "Let’s try that together again."
                : screen.reason === "audio"
                  ? "Let’s get Luna’s sound working."
                  : "Let’s help Luna hear you."}
            </h1>
            <p>
              {screen.kind === "recovery"
                ? "We didn’t capture a clear response. This hasn’t counted as a wrong answer."
                : screen.reason === "audio"
                  ? "Luna’s instructions didn’t play. Check the volume and connection, then try again. We won’t score a task you couldn’t hear."
                  : screen.reason === "denied"
                    ? "Allow the microphone in your browser’s site settings, then try again."
                    : "Check your microphone and connection. A grown-up can help."}
            </p>
            {screen.kind === "recovery" && (
              <p className="pa-small">
                Check the microphone and connection, then try this same part again.
              </p>
            )}
            <button
              className="pa-primary"
              onClick={screen.kind === "recovery" ? () => onTap("retry") : onRetry}
            >
              {screen.kind === "recovery"
                ? "Try this part again"
                : screen.reason === "audio"
                  ? "Try sound again"
                  : "Check microphone again"}
            </button>
            <a className="pa-text-link" href={exitHref}>
              Come back later
            </a>
          </div>
        )}
        {screen.kind === "closing" && (
          <div className="pa-instruction" data-closing>
            <div className="pa-section-art">
              <FluentIcon name="open-book" size={52} />
            </div>
            <h1>You did it, {childName}.</h1>
            <p>{screen.error ?? "Let’s put your reading journey together."}</p>
            {screen.error ? (
              <button className="pa-primary" onClick={onSave}>
                Save my results again
              </button>
            ) : (
              <div className="pa-saving" role="status">
                Saving your answers…
              </div>
            )}
          </div>
        )}
      </section>
      <footer className="pa-dock">
        <div className="pa-bunny" data-bunny aria-hidden="true">
          {screen.kind === "closing" ? (
            <BunnyReaction outfitId={outfitId ?? "bunny_classic"} state="wave" />
          ) : (
            <Bunny outfitId={outfitId ?? "bunny_classic"} />
          )}
        </div>
        <div className="pa-luna">
          <div aria-hidden="true" inert className="pa-orb">
            <LunaOrb mode={orb} analyser={analyser} size={52} />
          </div>
          <div>
            <span className="pa-luna-name">Luna</span>
            <p role="status">{status}</p>
          </div>
        </div>
        {onReplay && !listening && orb !== "speaking" && (
          <button className="pa-replay" onClick={onReplay} aria-label="Hear the prompt again">
            <FluentIcon name="speaker" size={23} />
            <span>Hear again</span>
          </button>
        )}
        {listening && (
          <div className="pa-live">
            <FluentIcon name="microphone" size={20} />
            <span>Microphone on</span>
          </div>
        )}
      </footer>
    </main>
  );
}
