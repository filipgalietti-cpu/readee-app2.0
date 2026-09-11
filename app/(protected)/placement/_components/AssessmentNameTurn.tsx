"use client";
import { useState } from "react";
import LunaOrb from "@/app/(protected)/luna/_components/LunaOrb";
import SayNameControl from "@/app/_components/SayNameControl";

export default function AssessmentNameTurn({ childId, name, ready, onDone }: { childId: string; name: string; ready: boolean; onDone: () => void }) {
  const [saidAs, setSaidAs] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  async function finish() {
    if (!saidAs) { onDone(); return; }
    setSaving(true);
    setError(false);
    try {
      const response = await fetch("/api/child-name/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ childId, saidAs }) });
      if (!response.ok) throw new Error("Could not save pronunciation");
      onDone();
    } catch { setError(true); } finally { setSaving(false); }
  }
  return <div className="pa-intro pa-name-turn">
    <h1>What is your name?</h1>
    {!ready && <LunaOrb mode="speaking" size={144} responsive label="Luna is asking your name" />}
    {ready && <SayNameControl mode="child" autoStart showLuna writtenName={name} value={saidAs} onChange={setSaidAs} />}
    <button className="pa-primary" disabled={saving || !ready} onClick={() => void finish()}>{saving ? "Saving…" : saidAs ? "That’s my name. Let’s read" : "Skip for now"}</button>
    {error && <><p role="alert">We couldn’t save that. Try again, or keep going.</p><button className="pa-text-link" onClick={onDone}>Keep going</button></>}
  </div>;
}
