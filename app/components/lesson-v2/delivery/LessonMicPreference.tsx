"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ActivitySupport } from "@/lib/lesson-engine/delivery/types";

const key = "readee:lesson-auto-mic", event = "readee-lesson-mic-change";
function snapshot() { try { return sessionStorage.getItem(key) === "on"; } catch { return false; } }
function setEnabled(value: boolean) { try { sessionStorage.setItem(key, value ? "on" : "off"); } catch { /* Manual controls remain available. */ } window.dispatchEvent(new Event(event)); }
function subscribe(notify: () => void) { window.addEventListener(event, notify); return () => window.removeEventListener(event, notify); }
export function useLessonMicEnabled() { return useSyncExternalStore(subscribe, snapshot, () => false); }

export function LessonMicPreference() {
  const enabled = useLessonMicEnabled(), [opening, setOpening] = useState(false), [message, setMessage] = useState("");
  const alive = useRef(true);
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
  async function enable() {
    setOpening(true); setMessage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:true});
      stream.getTracks().forEach(track=>track.stop());
      if (alive.current) setEnabled(true);
    } catch { if (alive.current) setMessage("Microphone permission was not granted. You can still use tap-to-talk or skip a speaking turn."); }
    finally { if (alive.current) setOpening(false); }
  }
  return <details className="le-parent-mic"><summary>For grown-ups: microphone setup</summary>
    <p>Start Luna automatically on speaking turns in this tab. Listening begins after instructions and stops after the answer. Other lesson activities do not keep the microphone open.</p>
    <button type="button" disabled={opening} aria-pressed={enabled} onClick={()=>enabled ? setEnabled(false) : void enable()}>{opening ? "Requesting microphone…" : enabled ? "Turn automatic microphone off" : "Enable microphone for speaking turns"}</button>
    {message && <p role="status">{message}</p>}
  </details>;
}

/** One automatic start per activity, only after its own narration actually played. */
export function useAutomaticLessonMic(support: ActivitySupport | undefined, ready: boolean, start: () => void, cancel: () => void) {
  const enabled = useLessonMicEnabled(), seenNarration = useRef(false), fired = useRef(false), wasEnabled = useRef(enabled);
  const actions = useRef({start,cancel});
  useEffect(() => { actions.current={start,cancel}; }, [start,cancel]);
  const script = support?.scene.narration?.script;
  const speaking = support?.narration?.speaking;
  const caption = support?.narration?.caption;
  useEffect(()=>{
    if (enabled && script && caption === script && speaking) seenNarration.current=true;
    if (!enabled || !ready || speaking || !seenNarration.current || fired.current || document.visibilityState !== "visible") return;
    const timer=setTimeout(()=>{fired.current=true;actions.current.start();},700);
    return()=>clearTimeout(timer);
  },[enabled,ready,speaking,caption,script]);
  useEffect(()=>{if(wasEnabled.current && !enabled) actions.current.cancel();wasEnabled.current=enabled;},[enabled]);
  useEffect(()=>{const hide=()=>{if(document.visibilityState!=="visible" && snapshot()) setEnabled(false);};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide);},[]);
  return enabled;
}

export function AutomaticMicControl() {
  const enabled=useLessonMicEnabled();
  return enabled ? <button type="button" className="le-auto-mic-off" onClick={()=>setEnabled(false)}>Automatic mic on · use tap-to-talk</button> : null;
}
