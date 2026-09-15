"use client";
import { AutomaticMicControl, useAutomaticLessonMic } from "./LessonMicPreference";
import { useEffect, useRef, useState } from "react";
import type { SpeakDef } from "@/lib/lesson-engine/types";
import type { InteractionProps } from "@/lib/lesson-engine/registry";
import { usePlacementMic, type Listener } from "@/app/(protected)/placement/_components/mic";
import { type ReadGrade } from "@/lib/placement/read-grade";
import {
  hasReadCoverage,
  hasReadEndpoint,
  gradePracticeRead,
  provisionalReadWords,
} from "@/lib/lesson-engine/delivery/reading";
import Karaoke from "./Karaoke";
import "./response.css";
import LunaOrb from "@/app/(protected)/luna/_components/LunaOrb";
async function standardToken() {
  const r = await fetch("/api/luna/speech-token", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ purpose: "lesson" }),
    signal: AbortSignal.timeout(12000),
  });
  if (!r.ok) throw Error("Speech unavailable");
  return r.json();
}
export default function CoachedSpeak({ data, support, onSolved }: InteractionProps<SpeakDef>) {
  const mic = usePlacementMic(support?.speechToken ?? standardToken);
  const [status, setStatus] = useState<
    "ready" | "opening" | "reading" | "checking" | "retry" | "unavailable" | "solved"
  >("ready");
  const [heard, setHeard] = useState<number[]>([]);
  const [grade, setGrade] = useState<ReadGrade | null>(null);
  const listener = useRef<Listener | null>(null),
    active = useRef(true),
    generation = useRef(0),
    busy = useRef(false),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    autoTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const autoFinish = useRef<() => void>(() => {});
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      clearTimeout(timer.current);
      clearTimeout(autoTimer.current);
    };
  }, []);

  function unavailable() {
    if (!active.current) return;
    generation.current++;
    support?.capture(false);
    clearTimeout(timer.current);
    clearTimeout(autoTimer.current);
    busy.current = false;
    setStatus("unavailable");
    support?.unavailable();
    mic.close();
  }
  async function start() {
    if (busy.current || status === "solved") return;
    busy.current = true;
    generation.current++;
    support?.capture(true);
    support?.stopVoice();
    setGrade(null);
    setHeard([]);
    const session = generation.current;
    setStatus("opening");
    try {
      const openedState = await mic.open();
      if (!active.current || generation.current !== session) {
        mic.close();
        return;
      }
      if (openedState !== "open") {
        unavailable();
        return;
      }
      // Open-ended production needs its own validated rubric, never an accept-list masquerading as reading.
      if (data.mode !== "read") {
        unavailable();
        return;
      }
      const phrases: Parameters<typeof gradePracticeRead>[1] = [];
      let pendingCoverage = false;
      const queueStop = (delay: number) => {
        if (!data.autoStop) return;
        pendingCoverage = true;
        clearTimeout(autoTimer.current);
        autoTimer.current = setTimeout(() => {
          if (!busy.current && listener.current) autoFinish.current();
        }, delay);
      };
      const opened = await mic.listen(
        data.text,
        (phrase) => {
          if (!active.current || generation.current !== session) return;
          phrases.push(phrase.words);
          const result = gradePracticeRead(data.text, phrases);
          setGrade(result);
          setHeard([]);
          if (hasReadEndpoint(result)) queueStop(250);
        },
        () => { if (active.current && generation.current === session) unavailable(); },
        (partial) => {
          if (!active.current || generation.current !== session || !listener.current) return;
          const result = gradePracticeRead(data.text, phrases);
          const indices = provisionalReadWords(data.text, partial, result);
          setHeard(indices);
          // Closing the stream flushes final scored words. Interim text can end
          // capture, but only those final scores decide the reading result.
          if (
            indices.length > 0 &&
            result.wordsAttempted + indices.length === result.annotations.length
          )
            queueStop(1100);
          else {
            pendingCoverage = false;
            clearTimeout(autoTimer.current);
          }
        },
        false,
        650, // Short scored phrases update while the continuous microphone stays open.
      );
      if (!active.current || generation.current !== session) {
        await opened.stop();
        return;
      }
      listener.current = opened;
      setStatus("reading");
      busy.current = false;
      timer.current = setTimeout(() => void finish(), 45000);
      if (pendingCoverage) queueStop(250);
    } catch {
      if (active.current && generation.current === session) unavailable();
    }
  }
  async function finish() {
    if (busy.current || !listener.current) return;
    busy.current = true;
    clearTimeout(timer.current);
    clearTimeout(autoTimer.current);
    setStatus("checking");
    const current = listener.current;
    listener.current = null;
    const session = generation.current;
    let deadline: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        current.stop(),
        new Promise<never>((_, reject) => {
          deadline = setTimeout(() => reject(Error("Speech did not finish")), 8000);
        }),
      ]);
      clearTimeout(deadline);
      if (!active.current || generation.current !== session) return;
      support?.capture(false);
      const result = gradePracticeRead(data.text, current.phrases);
      setGrade(result);
      setHeard([]);
      mic.close();
      if (result.wordsAttempted === 0) {
        unavailable();
        return;
      }
      const correct =
        result.annotations.length > 0 &&
        result.wordsCorrect === result.annotations.length &&
        result.wordsAttempted === result.annotations.length;
      const practiced = data.completionPolicy === "practice-coverage" && hasReadCoverage(result);
      if (practiced)
        support?.readPractice({
          totalWords: result.annotations.length,
          wordsAttempted: result.wordsAttempted,
          wordsCorrect: result.wordsCorrect,
          uncertainWords: result.annotations.length - result.wordsCorrect,
        });
      else if (support?.answer("read", correct) === false) return;
      setStatus(correct || practiced ? "solved" : "retry");
      busy.current = false;
      if (correct || practiced) {
        const feedback = support?.scene.feedback?.correct;
        if (feedback && feedback !== data.text)
          support?.say(feedback, () => support?.say(data.text));
        else support?.say(data.text);
        onSolved(practiced ? { attempts: 1 } : { correct: true });
      } else support?.say(support.scene.feedback?.incorrect ?? (data.allowHear ? "You can listen and try again." : (support?.scene.feedback?.incorrect ?? "Try reading again, or move on.")));
    } catch {
      clearTimeout(deadline);
      if (active.current && generation.current === session) unavailable();
    }
  }
  useEffect(() => { autoFinish.current = () => void finish(); });
  useAutomaticLessonMic(support, status === "ready", () => void start(), () => {
    if (!listener.current && !busy.current) return;
    generation.current++; clearTimeout(timer.current); clearTimeout(autoTimer.current); listener.current=null;
    mic.close(); support?.capture(false); busy.current=false; setStatus("ready");
  });
  return (
    <div
      className={`le-activity le-reading ${status === "solved" && data.success ? "le-reading-reveal" : ""}`}
    >
      <div className="le-reading-content">
        {status === "solved" && data.success && (
          <img className="le-response-photo" src={data.success.image} alt={data.success.alt} />
        )}
        <div className="le-reading-copy">
          <p className="le-sentence" aria-label="Text to read">
            {grade || status === "reading" ? (
              (grade ?? gradePracticeRead(data.text, [])).annotations.map((w, i) => (
                <span
                  key={i}
                  aria-label={`${w.word}: ${w.status === "correct" ? "Luna heard it correctly" : w.status === "substituted" || w.status === "omitted" ? "Try this word again" : heard.includes(i) ? "Luna recognized this word and is checking pronunciation" : "Not heard yet"}`}
                  className={
                    "le-read-word " +
                    (w.status === "correct"
                      ? "le-read-correct"
                      : w.status === "substituted" ||
                          w.status === "omitted" ||
                          (w.status === "unread" && (status === "retry" || status === "solved"))
                        ? "le-read-retry"
                        : heard.includes(i)
                          ? "le-read-heard"
                          : "")
                  }
                >
                  {w.word}{" "}
                </span>
              ))
            ) : (
              <Karaoke
                text={data.text}
                caption={support?.narration?.caption ?? ""}
                activeWord={support?.narration?.activeWord ?? -1}
              />
            )}
          </p>
          {!(status === "solved" && data.success) && (
            <div className="le-mic">
              <AutomaticMicControl />
              <LunaOrb
                size={104}
                mode={
                  status === "reading"
                    ? "listening"
                    : status === "opening" || status === "checking"
                      ? "thinking"
                      : support?.narration?.speaking
                        ? "speaking"
                        : "idle"
                }
                analyser={status === "reading" ? mic.analyser : support?.narration?.analyser}
                onTap={() => (status === "reading" ? void finish() : void start())}
              />
              <button
                className="le-primary"
                disabled={status === "opening" || status === "checking" || status === "solved"}
                onClick={() => (status === "reading" ? void finish() : void start())}
              >
                {status === "reading" ? (
                  "Done reading"
                ) : status === "opening" ? (
                  "Opening microphone…"
                ) : status === "checking" ? (
                  "Listening back…"
                ) : status === "solved" ? (
                  "Read together!"
                ) : (
                  <>
                    <img src="/icons/fluent/microphone.svg" width={26} height={26} alt="" />
                    Read with Luna
                  </>
                )}
              </button>
            </div>
          )}
          {data.allowHear && !["reading", "opening", "checking"].includes(status) && (
            <button
              onClick={() => {
                support?.help();
                support?.say(data.text);
              }}
            >
              {status === "solved" ? "Hear it again" : "Hear it first"}
            </button>
          )}
          <p role="status" className="le-feedback">
            {status === "solved"
              ? support?.scene.feedback?.correct
              : status === "unavailable"
                ? "Luna could not hear you. Try again, or skip this reading turn."
                : status === "retry"
                  ? (data.allowHear ? "You can listen and try again." : (support?.scene.feedback?.incorrect ?? "Try reading again, or move on."))
                  : status === "reading"
                    ? "I’m listening. Read the words above. I’ll stop when you finish."
                    : "Tap the microphone to read to Luna."}
          </p>
        </div>
      </div>
    </div>
  );
}
