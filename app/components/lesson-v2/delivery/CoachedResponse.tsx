"use client";
import { AutomaticMicControl, useAutomaticLessonMic } from "./LessonMicPreference";
import { useEffect, useRef, useState } from "react";
import type { SpeakDef } from "@/lib/lesson-engine/types";
import type { InteractionProps } from "@/lib/lesson-engine/registry";
import { usePlacementMic, type Listener } from "@/app/(protected)/placement/_components/mic";
import LunaOrb from "@/app/(protected)/luna/_components/LunaOrb";
import {
  usableResponseTranscript,
  type Feeling,
} from "@/lib/lesson-engine/response/rubrics";
import "./response.css";
import Karaoke from "./Karaoke";
import { offeredRhymeWord } from "@/lib/lesson-engine/response/rhyme-production";
const unavailableToken = async () => {
  throw Error("Response pilot is unavailable");
};
export default function CoachedResponse({ data, support }: InteractionProps<SpeakDef>) {
  const mic = usePlacementMic(support?.speechToken ?? unavailableToken);
  const [state, setState] = useState<
    | "ready"
    | "opening"
    | "listening"
    | "checking"
    | "retry"
    | "unclear"
    | "unavailable"
    | "shared"
    | "accepted"
    | "another"
  >("ready");
  const collectedWords=useRef<string[]>([]);
  function responseVisual(props: Record<string, string | number | boolean>) {
    support?.visual({
      ...(data.rhymeSeries ? {responseWords: collectedWords.current.join("|"), responseGoal: data.rhymeSeries.count} : {}),
      ...props,
    });
  }

  const why = useRef(false),
    hasShared = useRef(false);
  const [shared, setShared] = useState(false), [followingUp, setFollowingUp] = useState(false);
  const [feeling, setFeeling] = useState<Feeling>("other");
  const [sharedTranscript, setSharedTranscript] = useState("");
  const [transcript, setTranscript] = useState("");
  const [speechFailure, setSpeechFailure] = useState<string>();
  const [message, setMessage] = useState("");
  const [evidenceKey,setEvidenceKey] = useState<string>();
  const reveal = !support?.deferFeedback && ((evidenceKey && data.responseReveals?.[evidenceKey]) || data.success);
  const alive = useRef(true),
    generation = useRef(0),
    busy = useRef(false),
    listener = useRef<Listener | null>(null);
  const acceptingSpeech = useRef(false);
  const phrases = useRef<{ text: string; confidence: number }[]>([]);
  const limit = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    quiet = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const request = useRef<AbortController | null>(null),
    finishRef = useRef<() => void>(() => {});
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      generation.current++;
      clearTimeout(limit.current);
      clearTimeout(quiet.current);
      request.current?.abort();
    };
  }, []);

  function unclear(technical = false, error?: unknown) {
    if (!alive.current) return;
    generation.current++;
    acceptingSpeech.current = false;
    clearTimeout(limit.current);
    clearTimeout(quiet.current);
    request.current?.abort();
    listener.current = null;
    mic.close();
    support?.capture(false);
    busy.current = false;
    setState(technical ? "unavailable" : "unclear");
    setSpeechFailure(technical ? (/quota|too many|429/i.test(String(error)) ? "quota" : "connection") : undefined);
    if (data.visualFeedback) responseVisual({responseState:"unclear", responseText:""});
    if (technical && !hasShared.current) support?.unavailable();
    const text = (technical && data.unavailableScript) || data.unclearScript!;
    setMessage(text);
    support?.say(text);
  }
  async function start() {
    if (busy.current || state === "accepted") return;
    busy.current = true;
    const session = ++generation.current;
    support?.stopVoice();
    support?.capture(true);
    setState("opening");
    if (data.visualFeedback) responseVisual({responseState:"listening", responseText:""});
    setTranscript("");
    setMessage("");
    setSpeechFailure(undefined);
    phrases.current = [];
    acceptingSpeech.current = true;
    try {
      const openedState = await mic.open();
      if (!alive.current || session !== generation.current) {
        mic.close();
        return;
      }
      if (openedState !== "open") {
        unclear(true);
        return;
      }
      const opened = await mic.listen(
        "",
        (p) => {
          if (!alive.current || session !== generation.current || !acceptingSpeech.current) return;
          if (!/[\p{L}\p{N}]/u.test(p.text)) return;
          phrases.current.push({ text: p.text, confidence: p.confidence ?? 0 });
          setTranscript(phrases.current.map((x) => x.text).join(" "));
          if (data.visualFeedback) responseVisual({responseState:"listening",responseText:phrases.current.map(x=>x.text).join(" ")});
          clearTimeout(quiet.current);
          quiet.current = setTimeout(() => finishRef.current(), 200);
        },
        (error) => {
          if (acceptingSpeech.current && session === generation.current) unclear(true, error);
        },
        (partial) => {
          if (!alive.current || session !== generation.current || !acceptingSpeech.current) return;
          clearTimeout(quiet.current);
          setTranscript([...phrases.current.map((x) => x.text), partial].join(" "));
          if (data.visualFeedback) responseVisual({responseState:"listening",responseText:[...phrases.current.map(x=>x.text),partial].join(" ")});
        },
        true,
        undefined,
        data.captureMode,
        data.recognitionVocabulary,
      );
      if (!alive.current || session !== generation.current) {
        await opened.stop();
        return;
      }
      listener.current = opened;
      busy.current = false;
      setState("listening");
      limit.current = setTimeout(() => finishRef.current(), 20000);
    } catch (error) {
      if (alive.current && session === generation.current) unclear(true, error);
    }
  }
  async function finish() {
    if (busy.current || !listener.current) return;
    busy.current = true;
    const session = generation.current;
    clearTimeout(limit.current);
    clearTimeout(quiet.current);
    setState("checking");
    const current = listener.current;
    listener.current = null;
    let deadline: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
          current!.stop(),
          new Promise<never>((_, reject) => {
            deadline = setTimeout(() => reject(Error("Recognition timeout")), 8000);
          }),
        ]);
      clearTimeout(deadline);
      clearTimeout(quiet.current);
      if (!alive.current || session !== generation.current) return;
      acceptingSpeech.current = false;
      mic.close();
      const text = phrases.current
          .map((p) => p.text)
          .join(" ")
          .trim(),
        confidence = Math.min(...phrases.current.map((p) => p.confidence), 1);
      setTranscript(text);
      if (
        !data.rubricId ||
        !usableResponseTranscript(
          why.current ? data.reflection!.followUp.rubricId : data.rubricId,
          text,
          confidence,
        )
      ) {
        unclear();
        return;
      }
      if (!data.rubricId || !support?.evaluateResponse) {
        unclear(true);
        return;
      }
      request.current = new AbortController();
      const result = await support.evaluateResponse(
        why.current ? data.reflection!.followUp.rubricId : data.rubricId,
        text,
        confidence,
        request.current.signal,
      );
      if (!alive.current || session !== generation.current) return;
      busy.current = false;
      support.capture(false);
      if (result.verdict === "unclear") {
        unclear();
        return;
      }
      if (support.deferFeedback) {
        // A confident objective answer is recorded once, with identical neutral UI.
        // No practice-only success, reveal, confirmation or correctness feedback.
        setState("accepted");
        setMessage("");
        support.answer("read", result.verdict === "accepted", {receipt:result.receipt});
        return;
      }
      if (result.verdict === "accepted") {
        if(data.rhymeSeries){
          const series=data.rhymeSeries,word=offeredRhymeWord(series.target,text);
          if(collectedWords.current.includes(word)){
            setState("another");setMessage(series.duplicateScript);
            responseVisual({responseState:"duplicate",responseText:word,responseWords:collectedWords.current.join("|"),responseGoal:series.count});
            support.say(series.duplicateScript);return;
          }
          collectedWords.current=[...collectedWords.current,word];
          responseVisual({responseState:"accepted",responseText:word,responseWords:collectedWords.current.join("|"),responseGoal:series.count});
          if(collectedWords.current.length<series.count){
            const prompt=series.nextPrompts[collectedWords.current.length-1];
            setState("another");setMessage(prompt);support.say(prompt);return;
          }
        }
        if (!hasShared.current) support.responsePractice?.(data.rubricId);
        hasShared.current = true;
        setShared(true);
        if (data.reflection) {
          if (!why.current) { setFeeling(result.feeling ?? "other"); setSharedTranscript(text); }
          const followUp = !why.current && !result.elaborated;
          const thanks = why.current
            ? data.reflection.followUp.thanks
            : (data.reflection.acknowledgments?.[result.feeling ?? "other"] ??
              support.scene.feedback!.correct);
          setState(followUp ? "shared" : "accepted");
          setMessage(thanks);
          support.say(
            thanks,
            followUp ? () => support.say(data.reflection!.followUp.invitation) : undefined,
          );
        } else {
          const selected = result.evidenceKey && data.responseReveals?.[result.evidenceKey];
          setEvidenceKey(result.evidenceKey);
          setState("accepted");
          if (data.visualFeedback) responseVisual({responseState:"accepted",responseText:data.rhymeSeries ? offeredRhymeWord(data.rhymeSeries.target,text) : text});
          const feedback = data.rhymeSeries?.completeScript ?? (selected ? selected.sentence : support.scene.feedback!.correct);
          setMessage(feedback);
          support.say(feedback);
        }
      } else {
        // A feeling is never incorrect. Clarify meaning without an accuracy error.
        if (!data.reflection && support.answer("read", false) === false) return;
        const clarification = result.reason === "incomplete" && data.rhymeSeries?.targetRepeatScript
          ? data.rhymeSeries.targetRepeatScript
          : why.current
          ? data.reflection!.followUp.hint
          : support.scene.feedback!.incorrect;
        setState("retry");
        if (data.visualFeedback) responseVisual({responseState:"retry",responseText:text});
        setMessage(clarification);
        support.say(clarification);
      }
    } catch {
      clearTimeout(deadline);
      if (alive.current && session === generation.current) unclear(true);
    }
  }
  useEffect(() => { finishRef.current = () => void finish(); });
  useAutomaticLessonMic(support, state === "ready", () => void start(), () => {
    if (!listener.current && !busy.current) return;
    generation.current++; acceptingSpeech.current=false; clearTimeout(limit.current); clearTimeout(quiet.current);
    request.current?.abort(); listener.current=null; mic.close(); support?.capture(false); busy.current=false; setState("ready");
    if (data.visualFeedback) responseVisual({responseState:"ready",responseText:""});
  });
  const active = ["opening", "listening", "checking"].includes(state);
  const micControls = (followUp = false) => (
    <div className="le-mic">
      <AutomaticMicControl />
      <LunaOrb size={followUp ? 76 : 104}
        mode={state === "listening" ? "listening" : state === "opening" || state === "checking" ? "thinking" : support?.narration?.speaking ? "speaking" : "idle"}
        analyser={state === "listening" ? mic.analyser : support?.narration?.analyser}
        onTap={() => { if (state === "listening") void finish(); else if (!active && state !== "accepted") { if (followUp) { why.current = true; setFollowingUp(true); } void start(); } }} />
      {state !== "accepted" && <button className="le-primary"
        disabled={state === "opening" || state === "checking"}
        onClick={() => { if (state === "listening") void finish(); else { if (followUp) { why.current = true; setFollowingUp(true); } void start(); } }}>
        {state === "listening" ? "Done speaking" : state === "opening" ? "Opening microphone…" : state === "checking" ? "Luna is thinking…" : <><img src="/icons/fluent/microphone.svg" width={26} height={26} alt="" />{followUp ? "Tell Luna why" : "Tell Luna"}</>}
      </button>}
    </div>
  );
  if (data.reflection && shared) {
    const portrait = feeling === "other" ? undefined : data.reflection.portraits[feeling];
    return (
      <div className="le-response-reveal le-feeling-shared le-feeling-conversation">
        {portrait && <img className="le-response-photo" src={portrait} alt={`A child showing a ${feeling} expression`} />}
        <div className="le-feeling-copy">
          <p className="le-eyebrow">You shared your feeling</p>
          <p className="le-feeling-original">{sharedTranscript}</p>
          {state !== "accepted" && <p className="le-sentence">{data.reflection.followUp.prompt}</p>}
          {micControls(true)}
          {followingUp && <div className="le-response-heard" aria-live="polite"><p>{transcript || (active ? "Luna is listening…" : " ")}</p></div>}
          <p className="le-feedback" role="status">{message || (active ? "Take your time. Tell Luna what you think." : " ")}</p>
          {state !== "accepted" && <p className="le-small">You can tell Luna more, or press Next.</p>}
        </div>
      </div>
    );
  }
  if (state === "accepted" && reveal && !data.visualFeedback)
    return (
      <div className="le-response-reveal le-reading-reveal" role="status">
        <div className="le-reading-content">
        <img className="le-response-photo" src={reveal.image} alt={reveal.alt} />
        <div className="le-reading-copy">
        <p className="le-eyebrow">Luna heard you!</p>
        <p className="le-sentence"><Karaoke text={reveal.sentence} caption={support?.narration?.caption ?? ""} activeWord={support?.narration?.activeWord ?? -1} /></p>
        <button onClick={() => support?.say(reveal.sentence)} aria-label="Hear Luna again">
          Hear Luna again
        </button>
        </div>
        </div>
      </div>
    );
  return (
    <div className="le-activity le-response" data-response-state={state} data-speech-failure={speechFailure}>
      {(followingUp || data.text.trim() !== support?.scene.prompt.trim()) && <p className="le-sentence">
        {followingUp ? data.reflection!.followUp.prompt : data.text}{" "}
        {!data.reflection && !/[.!?…]$/.test(data.text.trim()) && (
          <span className="le-response-blank" aria-label="your words">
            …
          </span>
        )}
      </p>}
      {!data.visualFeedback && <div className="le-response-heard" aria-live="polite">
        <span>{transcript ? "I heard:" : "Your words go here"}</span>
        <p>{transcript || " "}</p>
      </div>}
      {micControls()}
      {state === "accepted" && data.visualFeedback && <button className="le-primary" onClick={()=>support?.say(message)} aria-label="Hear Luna again">Hear Luna again</button>}
      <p className="le-feedback" role="status">
        {(support?.deferFeedback && state === "accepted") ? "" : message ||
          (state === "listening"
            ? data.reflection
              ? "Luna is listening to your thoughts."
              : "Tell Luna your answer."
            : data.reflection
              ? "Tap the microphone and tell Luna."
              : "Tap the microphone and answer the question.")}
      </p>
    </div>
  );
}
